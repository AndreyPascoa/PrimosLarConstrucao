import type { ImageLoaderProps } from 'next/image';

const widths = [320, 480, 640, 768, 1024, 1280, 1920];
const optimizedSources = new Set([
  '/carousel/1.png', '/carousel/2.png', '/evento/aniversario.png',
  '/fachada_primos.png', '/logo.png', '/logo2.png',
]);

export default function imageLoader({ src, width }: ImageLoaderProps) {
  if (!optimizedSources.has(src)) return src;
  const outputWidth = widths.find((candidate) => candidate >= width) ?? widths[widths.length - 1];
  return `/optimized${src.slice(0, -4)}-${outputWidth}.webp`;
}
