#!/usr/bin/env node
/**
 * Generates a solid-colour 4:5 JPEG placeholder for the catalogue QA pages
 * under app/[locale]/dev/**. Not real product photography — just enough
 * pixels for next/image to render during component QA. Run once locally;
 * the output is gitignored dev fixture data, not shipped content.
 */
import { mkdirSync } from 'node:fs';
import sharp from 'sharp';

const outDir = 'public/dev';
mkdirSync(outDir, { recursive: true });

await sharp({
  create: {
    width: 800,
    height: 1000,
    channels: 3,
    background: { r: 224, g: 216, b: 202 },
  },
})
  .jpeg({ quality: 80 })
  .toFile(`${outDir}/sample-saree.jpg`);

console.log('Wrote public/dev/sample-saree.jpg');
