// Dev-only: renders Lumi variants side by side for visual review → scripts/dev/out/
import { writeFileSync, mkdirSync } from 'node:fs';
import { lumiPixel, lumiPixelCss, lumiTiny, tinyCss, dump, LEDGE } from '../lib/pixel-lumi.mjs';
import { svgDoc, C } from '../lib/theme.mjs';
mkdirSync(new URL('out/', import.meta.url), { recursive: true });
const px = 8;
const ledge = (x) => `<rect x="${x - 20}" y="${LEDGE * px}" width="${48 * px + 40}" height="3" fill="${C.line2}"/>`;
const cells = [
  ['day', lumiPixel({ px })], ['night', lumiPixel({ px, mode: 'night' })], ['wave', lumiPixel({ px, pose: 'wave' })],
];
const body = `<rect width="2000" height="700" fill="${C.void}"/>` + cells.map(([n, s], i) => `<g transform="translate(${30 + i * 420} 20)">${ledge(0)}${s}</g>`).join('') +
  `<g transform="translate(1290 20)">${lumiPixel({ px, crop: 'head' })}</g><g transform="translate(1320 300)">${lumiTiny(10)}</g><g transform="translate(1520 300)">${lumiTiny(5)}</g>`;
writeFileSync(new URL('out/pixel.svg', import.meta.url), svgDoc({ w: 1800, h: 560, title: 'pixel lab', body, css: lumiPixelCss + tinyCss }));
writeFileSync(new URL('out/dump.txt', import.meta.url), dump());
console.log('ok');
