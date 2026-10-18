// Design system for every generated asset. One palette, one frame, one motion language.
import { esc } from './text.mjs';

// Colour carries meaning: cyan = the system, sakura = Lumi only, amber = progression.
export const C = {
  void: '#07090F',
  panel: '#0D1220',
  panel2: '#111829',
  line: '#1C2436',
  line2: '#283350',
  text: '#E6EDF7',
  muted: '#8A97AD',
  dim: '#55627A',
  cyan: '#5CE1E6',
  cyanDeep: '#1E8FA0',
  sakura: '#FF7AB6',
  amber: '#FFC857',
  green: '#5BF29B',
  red: '#FF5F6D',
};

const BASE_CSS = `
.a{animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,.7,.2,1)}
.fb{transform-box:fill-box;transform-origin:center}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes blinkCursor{0%,49%{opacity:1}50%,100%{opacity:0}}
@keyframes pulse{0%,100%{opacity:.35}50%{opacity:1}}
@keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@media (prefers-reduced-motion:reduce){*{animation-duration:0s!important;animation-delay:0s!important;animation-iteration-count:1!important}}
`;

/** Wrap content into a standalone, accessible SVG document. */
export function svgDoc({ w, h, title, desc = '', css = '', defs = '', body, typo, comment = '' }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="t d" fill="none">
${comment ? `<!--\n${comment}\n-->\n` : ''}<title id="t">${esc(title)}</title><desc id="d">${esc(desc)}</desc>
<style>${BASE_CSS}${css}</style>
<defs>${typo ? typo.defs() : ''}${defs}</defs>
${body}
</svg>
`;
}

/** Faint engineering grid used as panel texture. */
export function gridPattern(id, size = 24, color = C.line, opacity = 0.5) {
  return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><path d="M${size} 0H0V${size}" stroke="${color}" stroke-width="1" opacity="${opacity}"/></pattern>`;
}

/**
 * The window chrome every section lives in.
 * title: left label in the bar ("quest.log"), tag: right label ("04 ACTIVE").
 */
export function frame(typo, { w, h, title, tag = '', tagColor = C.muted, gridId = '', accent = C.cyan, bar = 44 }) {
  const r = 18;
  return `
<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${r}" fill="${C.void}"/>
${gridId ? `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${r}" fill="url(#${gridId})"/>` : ''}
<rect x="1" y="1" width="${w - 2}" height="${bar}" rx="${r}" fill="${C.panel}"/>
<rect x="1" y="${bar - 12}" width="${w - 2}" height="13" fill="${C.panel}"/>
<path d="M1 ${bar + 1}H${w - 1}" stroke="${C.line}"/>
<circle cx="26" cy="${bar / 2 + 1}" r="5.5" fill="#FF5F6D" opacity=".9"/>
<circle cx="45" cy="${bar / 2 + 1}" r="5.5" fill="#FFC857" opacity=".9"/>
<circle cx="64" cy="${bar / 2 + 1}" r="5.5" fill="#5BF29B" opacity=".9"/>
${typo.text(title, { style: 'mono500', size: 15, x: 86, y: bar / 2 + 6, fill: C.muted })}
${tag ? typo.text(tag, { style: 'mono500', size: 13, x: w - 24, y: bar / 2 + 5.5, fill: tagColor, anchor: 'end', ls: 1.2 }) : ''}
<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${r}" stroke="${C.line2}" stroke-width="1.5"/>
<path d="M${r + 8} 1.5H${r + 90}" stroke="${accent}" stroke-width="2" stroke-linecap="round" opacity=".9"/>`;
}

/** Small pill label: "MAIN", "SHIPPED", … */
export function chip(typo, { x, y, label, color = C.cyan, size = 12, padX = 10, h = 24, fillOpacity = 0.12, anchor = 'start', dot = false }) {
  const tw = typo.measure(label, { style: 'mono700', size, ls: 1.2 });
  const w = tw + padX * 2 + (dot ? 14 : 0);
  const x0 = anchor === 'end' ? x - w : anchor === 'middle' ? x - w / 2 : x;
  return {
    w,
    svg: `<g><rect x="${x0}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${color}" fill-opacity="${fillOpacity}" stroke="${color}" stroke-opacity=".45"/>
${dot ? `<circle cx="${x0 + padX + 4}" cy="${y + h / 2}" r="4" fill="${color}"/>` : ''}
${typo.text(label, { style: 'mono700', size, x: x0 + padX + (dot ? 14 : 0), y: y + h / 2 + size * 0.36, fill: color, ls: 1.2 })}</g>`,
  };
}

/** Corner brackets ⌐ ¬ around a box — the HUD signature. */
export function brackets(x, y, w, h, { len = 14, color = C.cyan, sw = 2, attrs = '' } = {}) {
  return `<g stroke="${color}" stroke-width="${sw}" stroke-linecap="round" fill="none" ${attrs}>
<path d="M${x} ${y + len}V${y}H${x + len}"/><path d="M${x + w - len} ${y}H${x + w}V${y + len}"/>
<path d="M${x + w} ${y + h - len}V${y + h}H${x + w - len}"/><path d="M${x + len} ${y + h}H${x}V${y + h - len}"/></g>`;
}
