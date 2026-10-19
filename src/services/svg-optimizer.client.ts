import type { ConvertResult } from '../workers/svg-converter.worker';

type CacheRecord = ConvertResult & { key: string; createdAt: number };
type WorkerReply = { id: number; result?: ConvertResult; error?: string };

const DATABASE_NAME = 'mr-robot-svg-cache';
const STORE_NAME = 'images';
const CACHE_VERSION = 'v1';
const VIEWPORT_MARGIN = '250px 0px';
const PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 45"><rect width="80" height="45" fill="#1a1c1d"/></svg>')}`;

let databasePromise: Promise<IDBDatabase | null> | undefined;

function openDatabase(): Promise<IDBDatabase | null> {
  if (!('indexedDB' in window)) return Promise.resolve(null);
  databasePromise ??= new Promise(resolve => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
  return databasePromise;
}

async function readCache(key: string): Promise<CacheRecord | null> {
  const database = await openDatabase();
  if (!database) return null;
  return new Promise(resolve => {
    const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve((request.result as CacheRecord | undefined) ?? null);
    request.onerror = () => resolve(null);
  });
}

async function writeCache(record: CacheRecord): Promise<void> {
  const database = await openDatabase();
  if (!database) return;
  return new Promise(resolve => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(record);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => resolve();
    transaction.onabort = () => resolve();
  });
}

function idle(): Promise<void> {
  return new Promise(resolve => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => resolve(), { timeout: 1500 });
    } else {
      globalThis.setTimeout(resolve, 100);
    }
  });
}

/**
 * Observes every <img>, including images added later by React or other code.
 * Rendering keeps the original image until a smaller SVG replacement is ready.
 * Unsupported browsers, cross-origin fetches and oversized assets keep the original.
 */
export function startSvgOptimizer(): () => void {
  if (!('Worker' in window) || !('IntersectionObserver' in window) || !('MutationObserver' in window)) {
    return () => {};
  }

  let worker: Worker;
  try {
    worker = new Worker(new URL('../workers/svg-converter.worker.ts', import.meta.url), { type: 'module' });
  } catch {
    const restore = () => document.querySelectorAll<HTMLImageElement>('img[data-svg-source]').forEach(image => {
      if (image.dataset.svgSource) image.src = image.dataset.svgSource;
    });
    const fallback = new MutationObserver(restore);
    fallback.observe(document.documentElement, { childList: true, subtree: true });
    restore();
    return () => fallback.disconnect();
  }
  const pending = new Map<number, { resolve: (value: ConvertResult) => void; reject: (reason: Error) => void }>();
  const inFlight = new Map<string, Promise<CacheRecord>>();
  const renderedSource = new WeakMap<HTMLImageElement, string>();
  const activeUrls = new Map<HTMLImageElement, string>();
  const queuedImages = new WeakSet<HTMLImageElement>();
  let nextId = 0;
  let stopped = false;
  let workerFailed = false;
  let animationActive = false;
  const waitingForAnimation = new Set<() => void>();
  let conversionTail: Promise<unknown> = Promise.resolve();

  const animationObserver = new IntersectionObserver(entries => {
    animationActive = entries.some(entry => entry.isIntersecting);
    if (!animationActive) {
      for (const resume of waitingForAnimation) resume();
      waitingForAnimation.clear();
    }
  });

  function waitForAnimation(): Promise<void> {
    if (!animationActive) return Promise.resolve();
    return new Promise(resolve => waitingForAnimation.add(resolve));
  }

  worker.onmessage = ({ data }: MessageEvent<WorkerReply>) => {
    const task = pending.get(data.id);
    if (!task) return;
    pending.delete(data.id);
    if (data.error || !data.result) task.reject(new Error(data.error ?? 'Respuesta vacía del Worker'));
    else task.resolve(data.result);
  };
  worker.onerror = () => {
    workerFailed = true;
    for (const task of pending.values()) task.reject(new Error('Worker de imágenes no disponible'));
    pending.clear();
  };

  function convert(url: string): Promise<ConvertResult> {
    const run = () => new Promise<ConvertResult>((resolve, reject) => {
      if (stopped || workerFailed) return reject(new Error('Servicio no disponible'));
      const id = ++nextId;
      pending.set(id, { resolve, reject });
      worker.postMessage({ id, url });
    });
    // Only one decode/encode job runs at a time, even when many images enter view.
    const result = conversionTail.then(run, run);
    conversionTail = result.catch(() => undefined);
    return result;
  }

  async function getOrConvert(source: string, key: string): Promise<CacheRecord> {
    const existing = inFlight.get(key);
    if (existing) return existing;
    const job = (async () => {
      const cached = await readCache(key);
      if (cached) return cached;
      await idle();
      await waitForAnimation();
      if (stopped) throw new Error('Servicio detenido');
      const result = await convert(source);
      const record = { ...result, key, createdAt: Date.now() };
      await writeCache(record);
      return record;
    })();
    inFlight.set(key, job);
    try { return await job; }
    finally { inFlight.delete(key); }
  }

  function releaseUrl(image: HTMLImageElement): void {
    const url = activeUrls.get(image);
    if (url) URL.revokeObjectURL(url);
    activeUrls.delete(image);
  }

  function requestedSource(image: HTMLImageElement): string | null {
    const raw = image.dataset.svgSource || image.currentSrc || image.src;
    if (!raw || (!image.dataset.svgSource && /^(?:blob:|data:)/i.test(raw))) return null;
    try { return new URL(raw, document.baseURI).href; }
    catch { return null; }
  }

  async function processImage(image: HTMLImageElement): Promise<void> {
    if (queuedImages.has(image) || stopped || !image.isConnected) return;
    const source = requestedSource(image);
    if (!source) return;
    const key = `${CACHE_VERSION}:${source}`;
    if (renderedSource.get(image) === key) return;
    queuedImages.add(image);
    image.dataset.svgOptimizerState = 'processing';
    try {
      const result = await getOrConvert(source, key);
      if (stopped || !image.isConnected || requestedSource(image) !== source) return;
      image.dataset.svgSourceBytes = String(result.sourceBytes);
      image.dataset.svgOutputBytes = String(result.outputBytes);
      if (!result.svg || result.kind === 'original') {
        if (image.dataset.svgSource) image.src = source;
        image.dataset.svgOptimizerState = 'original';
        renderedSource.set(image, key);
        return;
      }

      const url = URL.createObjectURL(new Blob([result.svg], { type: 'image/svg+xml' }));
      const probe = new Image();
      probe.onload = () => {
        if (stopped || !image.isConnected || requestedSource(image) !== source) {
          URL.revokeObjectURL(url);
          return;
        }
        releaseUrl(image);
        activeUrls.set(image, url);
        const onError = () => {
          image.src = source;
          image.dataset.svgOptimizerState = 'original';
          releaseUrl(image);
        };
        image.addEventListener('error', onError, { once: true });
        image.addEventListener('load', () => image.removeEventListener('error', onError), { once: true });
        image.srcset = '';
        image.src = url;
        renderedSource.set(image, key);
        image.dataset.svgOptimizerState = result.kind;
      };
      probe.onerror = () => URL.revokeObjectURL(url);
      probe.src = url;
    } catch {
      if (image.isConnected && image.dataset.svgSource && requestedSource(image) === source) image.src = source;
      image.dataset.svgOptimizerState = 'original';
      renderedSource.set(image, key);
    } finally {
      queuedImages.delete(image);
    }
  }

  const intersection = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const image = entry.target as HTMLImageElement;
      intersection.unobserve(image);
      void processImage(image);
    }
  }, { rootMargin: VIEWPORT_MARGIN, threshold: 0.01 });

  function observeImage(image: HTMLImageElement): void {
    if (!image.isConnected) return;
    const source = requestedSource(image);
    if (!source) return;
    if (renderedSource.get(image) === `${CACHE_VERSION}:${source}`) return;
    image.classList.add('smart-svg-image');
    const oldUrl = activeUrls.get(image);
    if (oldUrl) releaseUrl(image);
    renderedSource.delete(image);
    if (image.dataset.svgSource && /^blob:/i.test(image.getAttribute('src') ?? '')) image.src = PLACEHOLDER;
    intersection.observe(image);
  }

  function scan(node: Node): void {
    if (node instanceof HTMLImageElement) observeImage(node);
    else if (node instanceof Element) {
      if (node.id === 'experiencia') animationObserver.observe(node);
      node.querySelector('#experiencia') && animationObserver.observe(node.querySelector('#experiencia')!);
      node.querySelectorAll('img').forEach(observeImage);
    }
  }

  const mutations = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes') {
        const image = record.target as HTMLImageElement;
        if (record.attributeName === 'data-svg-source' || !/^blob:/i.test(image.getAttribute('src') ?? '')) observeImage(image);
      } else {
        record.addedNodes.forEach(scan);
        record.removedNodes.forEach(node => {
          if (node instanceof HTMLImageElement && !node.isConnected) releaseUrl(node);
          else if (node instanceof Element) node.querySelectorAll('img').forEach(image => {
            if (!image.isConnected) releaseUrl(image);
          });
        });
      }
    }
  });
  mutations.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'srcset', 'data-svg-source'] });
  const experience = document.getElementById('experiencia');
  if (experience) animationObserver.observe(experience);
  document.querySelectorAll('img').forEach(observeImage);

  return () => {
    stopped = true;
    mutations.disconnect();
    intersection.disconnect();
    animationObserver.disconnect();
    for (const resume of waitingForAnimation) resume();
    waitingForAnimation.clear();
    worker.terminate();
    for (const task of pending.values()) task.reject(new Error('Servicio detenido'));
    pending.clear();
    for (const image of activeUrls.keys()) releaseUrl(image);
  };
}
