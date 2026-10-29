// Clean, modern, high-contrast palette for professional presentation (Light / Clean Architecture)
import { esc } from './text.mjs';

export const C = {
  bg: '#FFFFFF',
  bgSubtle: '#F8FAFC',
  cardBg: '#FFFFFF',
  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',
  borderStrong: '#CBD5E1',
  
  textMain: '#0F172A',      // Slate 900
  textMuted: '#475569',     // Slate 600
  textDim: '#94A3B8',       // Slate 400
  
  primary: '#2563EB',       // Modern Royal Blue (Cloud / Systems)
  primaryBg: '#EFF6FF',
  primaryBorder: '#BFDBFE',

  accent: '#7C3AED',        // Royal Violet (Nouri signature)
  accentBg: '#F5F3FF',

  emerald: '#10B981',       // System healthy / online
  emeraldBg: '#ECFDF5',
  emeraldBorder: '#A7F3D0',

  amber: '#F59E0B',
  amberBg: '#FFFBEB',
  amberBorder: '#FDE68A',
};

const BASE_CSS = `
.trans { transition: all 0.2s ease; }
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
`;

/** Wrap content into an accessible, clean standalone SVG */
export function svgDoc({ w, h, title, desc = '', css = '', defs = '', body, typo, comment = '' }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="t d" fill="none">
${comment ? `<!--\n${comment}\n-->\n` : ''}<title id="t">${esc(title)}</title><desc id="d">${esc(desc)}</desc>
<style>${BASE_CSS}${css}</style>
<defs>${typo ? typo.defs() : ''}${defs}</defs>
${body}
</svg>
`;
}

/** Subtle architectural dot-grid */
export function dotGridPattern(id, size = 20, color = C.border, radius = 1) {
  return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><circle cx="${radius}" cy="${radius}" r="${radius}" fill="${color}" opacity="0.6"/></pattern>`;
}

/** Professional clean card frame */
export function cleanCard({ x = 0, y = 0, w, h, rx = 16, bg = C.cardBg, border = C.border, strokeWidth = 1 }) {
  return `<rect x="${x + strokeWidth / 2}" y="${y + strokeWidth / 2}" width="${w - strokeWidth}" height="${h - strokeWidth}" rx="${rx}" fill="${bg}" stroke="${border}" stroke-width="${strokeWidth}"/>`;
}

/** Clean professional pill badge */
export function badge(typo, { x, y, label, bg = C.primaryBg, color = C.primary, border = C.primaryBorder, size = 11, padX = 10, h = 24, dot = false }) {
  const tw = typo.measure(label, { style: 'mono700', size, ls: 0.5 });
  const w = tw + padX * 2 + (dot ? 12 : 0);
  return {
    w,
    svg: `<g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${bg}" stroke="${border}" stroke-width="1"/>
      ${dot ? `<circle cx="${x + padX + 3}" cy="${y + h / 2}" r="3" fill="${color}"/>` : ''}
      ${typo.text(label, { style: 'mono700', size, x: x + padX + (dot ? 10 : 0), y: y + h / 2 + size * 0.35, fill: color, ls: 0.5 })}
    </g>`
  };
}
