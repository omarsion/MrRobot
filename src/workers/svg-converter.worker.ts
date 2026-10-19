/// <reference lib="webworker" />

type ConvertRequest = { id: number; url: string };
export type ConvertResult = {
  kind: 'vector' | 'raster-svg' | 'original';
  svg?: string;
  width?: number;
  height?: number;
  sourceBytes: number;
  outputBytes: number;
};
type ConvertReply = { id: number; result?: ConvertResult; error?: string };

const worker = self as unknown as DedicatedWorkerGlobalScope;
const encoder = new TextEncoder();
const MAX_SOURCE_BYTES = 12 * 1024 * 1024;
const MAX_EDGE = 1920;

function escapeAttr(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

function svgRoot(viewBox: string, content: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">${content}</svg>`;
}

function attributes(source: string): Map<string, string> {
  const output = new Map<string, string>();
  for (const match of source.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)) {
    output.set(match[1].toLowerCase(), match[3]);
  }
  return output;
}

function safePaint(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return /^(?:none|currentColor|#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\))$/i.test(value) ? value : undefined;
}

function safeNumber(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return /^[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?$/i.test(value) ? value : undefined;
}

function sanitizeSvg(input: string): string | null {
  if (input.length > 2_000_000) return null;
  // Nested transforms, CSS and filters cannot be flattened without changing the art.
  if (/<(?:defs|style|filter|linearGradient|radialGradient|g)\b|\b(?:class|style|transform)\s*=/i.test(input)) return null;
  const root = input.match(/<svg\b([^>]*)>/i);
  if (!root) return null;
  const rootAttrs = attributes(root[1]);
  const rawViewBox = rootAttrs.get('viewbox');
  const width = safeNumber(rootAttrs.get('width'));
  const height = safeNumber(rootAttrs.get('height'));
  const viewBox = rawViewBox && /^\s*[-+\d.eE]+(?:[\s,]+[-+\d.eE]+){3}\s*$/.test(rawViewBox)
    ? rawViewBox.trim().replaceAll(',', ' ')
    : width && height ? `0 0 ${width} ${height}` : null;
  if (!viewBox) return null;

  // Rebuild a strict subset instead of inserting source markup into the DOM.
  // Unsupported gradients, filters, images and references fall back to the original <img>.
  const tags = [...input.matchAll(/<(path|rect|circle|ellipse|line|polyline|polygon)\b([^>]*)\/?\s*>/gi)];
  if (!tags.length || tags.length > 1500) return null;
  const shapes: string[] = [];
  for (const [, tag, rawAttrs] of tags) {
    const values = attributes(rawAttrs);
    if ([...values.values()].some(value => /url\s*\(|javascript:|data:/i.test(value))) return null;
    const kept: string[] = [];
    const geometry = tag.toLowerCase() === 'path' ? ['d']
      : tag.toLowerCase() === 'rect' ? ['x', 'y', 'width', 'height', 'rx', 'ry']
      : tag.toLowerCase() === 'circle' ? ['cx', 'cy', 'r']
      : tag.toLowerCase() === 'ellipse' ? ['cx', 'cy', 'rx', 'ry']
      : tag.toLowerCase() === 'line' ? ['x1', 'y1', 'x2', 'y2'] : ['points'];
    for (const name of geometry) {
      const value = values.get(name);
      if (!value) continue;
      const valid = name === 'd' ? /^[\d\s,.+\-eEmMzZlLhHvVcCsSqQtTaA]+$/.test(value)
        : name === 'points' ? /^[\d\s,.+\-eE]+$/.test(value) : Boolean(safeNumber(value));
      if (!valid) return null;
      kept.push(`${name}="${escapeAttr(value)}"`);
    }
    for (const name of ['fill', 'stroke'] as const) {
      const paint = safePaint(values.get(name));
      if (paint) kept.push(`${name}="${escapeAttr(paint)}"`);
    }
    for (const name of ['stroke-width', 'opacity', 'fill-opacity', 'stroke-opacity'] as const) {
      const value = safeNumber(values.get(name));
      if (value) kept.push(`${name}="${value}"`);
    }
    if (!kept.length) return null;
    shapes.push(`<${tag.toLowerCase()} ${kept.join(' ')}/>`);
  }
  return svgRoot(viewBox, shapes.join(''));
}

function vectorizeFlatIcon(context: OffscreenCanvasRenderingContext2D, width: number, height: number): string | null {
  if (width > 256 || height > 256) return null;
  const sampleWidth = Math.min(width, 96);
  const sampleHeight = Math.min(height, 96);
  const sample = new OffscreenCanvas(sampleWidth, sampleHeight);
  const sampleContext = sample.getContext('2d', { willReadFrequently: true });
  if (!sampleContext) return null;
  sampleContext.drawImage(context.canvas, 0, 0, sampleWidth, sampleHeight);
  const pixels = sampleContext.getImageData(0, 0, sampleWidth, sampleHeight).data;
  const paths = new Map<string, string[]>();
  let runs = 0;
  for (let y = 0; y < sampleHeight; y++) {
    let x = 0;
    while (x < sampleWidth) {
      const offset = (y * sampleWidth + x) * 4;
      if (pixels[offset + 3] < 128) { x++; continue; }
      const color = [0, 1, 2].map(channel => Math.min(255, Math.round(pixels[offset + channel] / 32) * 32).toString(16).padStart(2, '0')).join('');
      const start = x++;
      while (x < sampleWidth) {
        const next = (y * sampleWidth + x) * 4;
        const nextColor = [0, 1, 2].map(channel => Math.min(255, Math.round(pixels[next + channel] / 32) * 32).toString(16).padStart(2, '0')).join('');
        if (pixels[next + 3] < 128 || nextColor !== color) break;
        x++;
      }
      if (!paths.has(color)) paths.set(color, []);
      paths.get(color)!.push(`M${start} ${y}h${x - start}v1h-${x - start}z`);
      if (++runs > 1100 || paths.size > 24) return null;
    }
  }
  if (!runs) return null;
  const shapes = [...paths].map(([color, commands]) => `<path fill="#${color}" d="${commands.join('')}"/>`).join('');
  return svgRoot(`0 0 ${sampleWidth} ${sampleHeight}`, shapes);
}

function base64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let index = 0; index < bytes.length; index += 8192) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 8192));
  }
  return btoa(binary);
}

async function convertRaster(blob: Blob): Promise<ConvertResult> {
  if (!('OffscreenCanvas' in worker) || !('createImageBitmap' in worker)) {
    return { kind: 'original', sourceBytes: blob.size, outputBytes: blob.size };
  }
  const bitmap = await createImageBitmap(blob);
  const ratio = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * ratio));
  const height = Math.max(1, Math.round(bitmap.height * ratio));
  const canvas = new OffscreenCanvas(width, height);
  try {
    const context = canvas.getContext('2d', { alpha: true, willReadFrequently: width <= 256 && height <= 256 });
    if (!context) throw new Error('Canvas 2D no disponible');
    context.drawImage(bitmap, 0, 0, width, height);
    const vector = vectorizeFlatIcon(context, width, height);
    if (vector && encoder.encode(vector).byteLength < blob.size) {
      return { kind: 'vector', svg: vector, width, height, sourceBytes: blob.size, outputBytes: encoder.encode(vector).byteLength };
    }

    const webp = await canvas.convertToBlob({ type: 'image/webp', quality: 0.86 });
    const payload = webp.type === 'image/webp' && webp.size < blob.size ? webp : blob;
    const color = context.getImageData(Math.floor(width / 2), Math.floor(height / 2), 1, 1).data;
    const backdrop = `#${[color[0], color[1], color[2]].map(value => value.toString(16).padStart(2, '0')).join('')}`;
    const embedded = `data:${payload.type || 'image/png'};base64,${base64(await payload.arrayBuffer())}`;
    const svg = svgRoot(`0 0 ${width} ${height}`, `<rect width="${width}" height="${height}" fill="${backdrop}"/><image width="${width}" height="${height}" href="${embedded}" preserveAspectRatio="xMidYMid meet"/>`);
    const outputBytes = encoder.encode(svg).byteLength;
    // An SVG wrapper is not automatically smaller; leave efficient originals untouched.
    if (outputBytes >= blob.size) return { kind: 'original', width, height, sourceBytes: blob.size, outputBytes: blob.size };
    return { kind: 'raster-svg', svg, width, height, sourceBytes: blob.size, outputBytes };
  } finally {
    bitmap.close();
    canvas.width = 0;
    canvas.height = 0;
  }
}

async function convert(url: string): Promise<ConvertResult> {
  const response = await fetch(url, { credentials: 'same-origin', cache: 'force-cache' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const blob = await response.blob();
  if (blob.size > MAX_SOURCE_BYTES) return { kind: 'original', sourceBytes: blob.size, outputBytes: blob.size };
  if (blob.type === 'image/svg+xml' || /\.svg(?:[?#]|$)/i.test(url)) {
    const svg = sanitizeSvg(await blob.text());
    if (!svg) return { kind: 'original', sourceBytes: blob.size, outputBytes: blob.size };
    const outputBytes = encoder.encode(svg).byteLength;
    return { kind: 'vector', svg, sourceBytes: blob.size, outputBytes };
  }
  if (!/^image\/(?:png|jpeg|webp)$/i.test(blob.type)) return { kind: 'original', sourceBytes: blob.size, outputBytes: blob.size };
  return convertRaster(blob);
}

worker.onmessage = async ({ data }: MessageEvent<ConvertRequest>) => {
  const reply: ConvertReply = { id: data.id };
  try { reply.result = await convert(data.url); }
  catch (error) { reply.error = error instanceof Error ? error.message : String(error); }
  worker.postMessage(reply);
};

export {};
