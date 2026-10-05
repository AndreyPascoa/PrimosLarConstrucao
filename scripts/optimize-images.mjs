import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

// GitHub Pages cannot run Next's image server. Generate responsive files ahead of time.
const sources = ['carousel/1', 'carousel/2', 'evento/aniversario', 'fachada_primos', 'logo', 'logo2'];
const widths = [320, 480, 640, 768, 1024, 1280, 1920];
for (const source of sources) {
  await mkdir(`public/optimized/${source.split('/').slice(0, -1).join('/')}`, { recursive: true });
  for (const width of widths) {
    await sharp(`public/${source}.png`)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 85, effort: 6 })
      .toFile(`public/optimized/${source}-${width}.webp`);
  }
}
