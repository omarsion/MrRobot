import type { ImgHTMLAttributes } from 'react';

type SmartSvgImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & {
  src: string;
  alt: string;
};

const placeholder = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 45"><defs><linearGradient id="g"><stop stop-color="#1a1c1d"/><stop offset="1" stop-color="#343735"/></linearGradient></defs><rect width="80" height="45" fill="url(#g)"/></svg>')}`;

/** Defers the original request until the browser cache or Worker result is known. */
export default function SmartSvgImage({ src, alt, loading = 'lazy', decoding = 'async', ...props }: SmartSvgImageProps) {
  const supported = typeof window !== 'undefined' && 'Worker' in window && 'IntersectionObserver' in window && 'MutationObserver' in window;
  return <img src={supported ? placeholder : src} data-svg-source={supported ? src : undefined} alt={alt} loading={loading} decoding={decoding} {...props} />;
}
