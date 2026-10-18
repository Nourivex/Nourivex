// Text → glyph outlines. GitHub serves README images under a strict CSP, so we never
// rely on fonts loading inside the SVG: every glyph is a path, defined once and reused.
import { readFileSync } from 'node:fs';

const atlas = JSON.parse(readFileSync(new URL('./glyphs.json', import.meta.url), 'utf8'));

// A few symbols JetBrains Mono doesn't ship, drawn in the same 1000-unit grid.
const CUSTOM = {
  '✓': { a: 600, d: 'M88-318L160-390L256-294L462-602L546-546L262-150Z' },
  '✗': { a: 600, d: 'M120-560L190-630L300-520L410-630L480-560L370-450L480-340L410-270L300-380L190-270L120-340L230-450Z' },
  '★': { a: 600, d: 'M300-680L370-480L580-480L410-360L475-160L300-280L125-160L190-360L20-480L230-480Z' },
  '◐': { a: 600, d: 'M300-620A230 230 0 1 0 300-160A230 230 0 1 0 300-620ZM300-560L300-220A170 170 0 0 1 300-560Z' },
  '○': { a: 600, d: 'M300-620A230 230 0 1 0 300-160A230 230 0 1 0 300-620ZM300-560A170 170 0 1 1 300-220A170 170 0 1 1 300-560Z' },
};
for (const k of ['mono400', 'mono500', 'mono700']) Object.assign(atlas[k].glyphs, CUSTOM);

const STYLE_CODE = { mono400: 'm4', mono500: 'm5', mono700: 'm7', disp500: 'd5', disp700: 'd7' };

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export class Typo {
  constructor(prefix = 't') {
    this.prefix = prefix;
    this.used = new Map();
  }

  #glyph(style, ch) {
    let st = style;
    let g = atlas[st].glyphs[ch];
    if (!g) {
      st = style.startsWith('disp') ? (style === 'disp700' ? 'mono700' : 'mono500') : 'mono400';
      g = atlas[st].glyphs[ch];
    }
    if (!g) return null;
    const id = `${this.prefix}${STYLE_CODE[st]}${ch.codePointAt(0).toString(36)}`;
    if (!this.used.has(id)) this.used.set(id, g.d);
    return { id, a: g.a, st };
  }

  /** Width in px of `str` rendered at `size`. */
  measure(str, { style = 'mono400', size = 16, ls = 0 } = {}) {
    const f = atlas[style];
    const k = size / f.upem;
    let w = 0;
    const chars = [...str];
    chars.forEach((ch, i) => {
      const g = this.#glyph(style, ch);
      w += (g ? g.a : f.upem * 0.5) * k + ls;
      if (i < chars.length - 1) w += (f.kern[ch + chars[i + 1]] || 0) * k;
    });
    return w - (chars.length ? ls : 0);
  }

  /**
   * Render a run of text. Returns an SVG <g>. (x, y) is the baseline origin.
   * Extra attributes (class, opacity, clip-path, …) go on the group.
   */
  text(str, { style = 'mono400', size = 16, x = 0, y = 0, fill = 'currentColor', anchor = 'start', ls = 0, attrs = '' } = {}) {
    const f = atlas[style];
    const k = size / f.upem;
    const w = this.measure(str, { style, size, ls });
    const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
    const chars = [...str];
    let pen = 0; // font units
    const uses = [];
    chars.forEach((ch, i) => {
      const g = this.#glyph(style, ch);
      if (g && ch !== ' ') uses.push(`<use href="#${g.id}" x="${Math.round(pen)}"/>`);
      pen += (g ? g.a : f.upem * 0.5) + ls / k;
      if (i < chars.length - 1) pen += f.kern[ch + chars[i + 1]] || 0;
    });
    return `<g transform="translate(${r(x0)} ${r(y)}) scale(${+k.toFixed(5)})" fill="${fill}"${attrs ? ' ' + attrs : ''}>${uses.join('')}</g>`;
  }

  defs() {
    return [...this.used].map(([id, d]) => `<path id="${id}" d="${d}"/>`).join('');
  }
}

const r = (n) => Math.round(n * 100) / 100;
export { esc };
