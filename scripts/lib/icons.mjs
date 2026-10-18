// Brand marks (Simple Icons, CC0) + a handful of UI glyphs drawn for this system.
import { readFileSync } from 'node:fs';
import { C } from './theme.mjs';

const brands = JSON.parse(readFileSync(new URL('./icons.json', import.meta.url), 'utf8'));

const lum = (hex) => {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Items that aren't brands get a drawn mark instead.
const CUSTOM = {
  'Face Recognition': (c) => `<path d="M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="9" cy="10" r="1.4" fill="${c}"/><circle cx="15" cy="10" r="1.4" fill="${c}"/><path d="M8.5 15c2 1.8 5 1.8 7 0" stroke="${c}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
  Liveness: (c) => `<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" stroke="${c}" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="3.4" fill="${c}"/><path d="M12 1.5v2M12 20.5v2" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/>`,
  'C#': (c) => `<path d="M12 1.8 21 7v10l-9 5.2L3 17V7Z" stroke="${c}" stroke-width="1.8" fill="none"/><path d="M14 9.2a3.6 3.6 0 1 0 0 5.6" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M16 10.5h3.5M16 13.5h3.5M17 9v6M18.5 9v6" stroke="${c}" stroke-width="1" />`,
};

/** Resolve a stack item → { title, color, svg(size) } drawn in a 24×24 box. */
export function techIcon(item) {
  const b = brands[item];
  if (b) {
    const color = lum(b.hex) < 0.22 ? C.text : '#' + b.hex;
    return { title: b.title, color, draw: (x, y, s = 24) => `<g transform="translate(${x} ${y}) scale(${s / 24})"><path d="${b.d}" fill="${color}"/></g>` };
  }
  const f = CUSTOM[item];
  const color = item === 'C#' ? '#9B4F96' : C.cyan;
  return {
    title: item,
    color,
    draw: (x, y, s = 24) => `<g transform="translate(${x} ${y}) scale(${s / 24})">${f ? f(color === '#9B4F96' ? '#B26DB0' : color) : `<rect x="2" y="2" width="20" height="20" rx="5" stroke="${color}" stroke-width="2"/>`}</g>`,
  };
}

/** Line icons for the dock, 24×24. */
export const UI = {
  about: (c) => `<rect x="3" y="4" width="18" height="16" rx="3" stroke="${c}" stroke-width="2"/><circle cx="9" cy="11" r="2.5" stroke="${c}" stroke-width="2"/><path d="M5.5 17c.8-1.8 2-2.6 3.5-2.6s2.7.8 3.5 2.6M14.5 10h4M14.5 13.5h3" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`,
  loadout: (c) => `<path d="m12 3 9 4.5-9 4.5-9-4.5Z" stroke="${c}" stroke-width="2" stroke-linejoin="round"/><path d="m3 12 9 4.5 9-4.5M3 16.5 12 21l9-4.5" stroke="${c}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`,
  quests: (c) => `<path d="M5 21V4M5 4h11l-2 4 2 4H5" stroke="${c}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`,
  stats: (c) => `<path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`,
  contact: (c) => `<rect x="3" y="5" width="18" height="14" rx="3" stroke="${c}" stroke-width="2"/><path d="m4 7 8 6 8-6" stroke="${c}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`,
  github: (c) => `<path d="${brands.github.d}" fill="${c}"/>`,
  linkedin: (c) => `<rect x="2" y="2" width="20" height="20" rx="4" stroke="${c}" stroke-width="2"/><path d="M7 10v7M7 7v.01M11 17v-7M11 13c0-2 1.4-3 3-3s3 1 3 3v4" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`,
  globe: (c) => `<circle cx="12" cy="12" r="9.5" stroke="${c}" stroke-width="2"/><path d="M2.5 12h19M12 2.5c3 3.2 3 15.8 0 19M12 2.5c-3 3.2-3 15.8 0 19" stroke="${c}" stroke-width="1.8"/>`,
  arrow: (c) => `<path d="M7 17 17 7M9 7h8v8" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`,
};
export const ui = (name, x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s / 24})" fill="none">${UI[name](c)}</g>`;
