#!/usr/bin/env node
/**
 * Generates solid-colour placeholder JPEGs for real pages (e.g. the
 * homepage) that don't have real photography yet. NOT real product
 * photography — gitignored, regenerate locally with `node
 * scripts/gen-placeholder-images.mjs` if missing.
 */
import { mkdirSync } from 'node:fs';
import sharp from 'sharp';

const outDir = 'public/placeholder';
mkdirSync(outDir, { recursive: true });

await sharp({
  create: { width: 800, height: 1000, channels: 3, background: { r: 224, g: 216, b: 202 } },
})
  .jpeg({ quality: 80 })
  .toFile(`${outDir}/product.jpg`);

await sharp({
  create: { width: 1600, height: 1200, channels: 3, background: { r: 90, g: 30, b: 45 } },
})
  .jpeg({ quality: 80 })
  .toFile(`${outDir}/hero.jpg`);

console.log('Wrote public/placeholder/{product,hero}.jpg');
