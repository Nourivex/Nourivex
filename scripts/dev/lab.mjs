// Dev-only: renders Nouri variants side by side for visual review → scripts/dev/out/
import { writeFileSync, mkdirSync } from 'node:fs';
import { bearPixel, bearPixelCss, bearTiny, tinyCss, dump, LEDGE } from '../lib/pixel-bear.mjs';
import { svgDoc, C } from '../lib/theme.mjs';
mkdirSync(new URL('out/', import.meta.url), { recursive: true });
const px = 8;
const ledge = (x) => `<rect x="${x - 20}" y="${LEDGE * px}" width="${48 * px + 40}" height="3" fill="${C.line2}"/>`;
const cells = [
  ['day', bearPixel({ px })], ['night', bearPixel({ px, mode: 'night' })], ['wave', bearPixel({ px, pose: 'wave' })],
];
const body = `<rect width="2000" height="700" fill="${C.void}"/>` + cells.map(([n, s], i) => `<g transform="translate(${30 + i * 420} 20)">${ledge(0)}${s}</g>`).join('') +
  `<g transform="translate(1290 20)">${bearPixel({ px, crop: 'head' })}</g><g transform="translate(1320 300)">${bearTiny(10)}</g><g transform="translate(1520 300)">${bearTiny(5)}</g>`;
writeFileSync(new URL('out/pixel.svg', import.meta.url), svgDoc({ w: 1800, h: 560, title: 'pixel lab', body, css: bearPixelCss + tinyCss }));
writeFileSync(new URL('out/dump.txt', import.meta.url), dump());
console.log('ok');
