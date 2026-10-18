// Section assets: dock, about, loadout, now-running, quest log, save point, footer.
import { Typo } from './text.mjs';
import { C, svgDoc, gridPattern, frame, chip } from './theme.mjs';
import { lumiPixel, lumiPixelCss, LEDGE } from './pixel-lumi.mjs';
import { techIcon, ui } from './icons.mjs';

const W = 1000;

/** Greedy word wrap using real glyph metrics. */
export function wrap(t, text, { style = 'disp500', size = 16, maxW }) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? cur + ' ' + w : w;
    if (t.measure(next, { style, size }) > maxW && cur) { lines.push(cur); cur = w; } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

function heading(t, { x, y, title, sub, size = 34 }) {
  const tw = t.measure(title, { style: 'disp700', size, ls: 1 });
  return t.text(title, { x, y, size, style: 'disp700', fill: C.text, ls: 1 }) +
    `<circle cx="${x + tw + 14}" cy="${y - size * 0.3}" r="3.5" fill="${C.cyan}"/>` +
    t.text(sub, { x: x + tw + 26, y, size: size * 0.55, style: 'disp500', fill: C.muted });
}

/* ------------------------------------------------------------------ */
/* DOCK — five buttons that jump to sections                           */
/* ------------------------------------------------------------------ */
export const DOCK = [
  { key: 'about', label: 'ABOUT', file: 'about.md' },
  { key: 'loadout', label: 'LOADOUT', file: 'stack.json' },
  { key: 'quests', label: 'QUESTS', file: 'quest.log' },
  { key: 'stats', label: 'STATS', file: 'sys.monitor' },
  { key: 'contact', label: 'CONTACT', file: 'save.dat' },
];

export function dockButton(item, i) {
  const t = new Typo('k');
  const w = 200, h = 64;
  const per = 2 * (w + h - 4 * 14) + 2 * Math.PI * 14; // perimeter of the rounded rect
  const css = `@keyframes run{from{stroke-dashoffset:${per.toFixed(0)}}to{stroke-dashoffset:0}}
@keyframes runFade{0%,60%,100%{opacity:0}10%,50%{opacity:1}}
.run{stroke-dasharray:46 ${(per - 46).toFixed(0)};animation:run 6s linear ${i * 1.2}s infinite,runFade 6s linear ${i * 1.2}s infinite}`;
  const body = `
<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="14" fill="${C.panel}"/>
<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="14" stroke="${C.line2}" stroke-width="1.5"/>
<rect x="16" y="16" width="32" height="32" rx="9" fill="${C.cyan}" fill-opacity=".1"/>
${ui(item.key, 22, 22, 20, C.cyan)}
${t.text(item.label, { x: 62, y: 32, size: 17, style: 'disp700', fill: C.text, ls: 1.5 })}
${t.text(`0${i + 1} · ${item.file}`, { x: 62, y: 49, size: 11, style: 'mono500', fill: C.dim })}`;
  return svgDoc({ w, h, title: `${item.label} — jump to section`, body, css, typo: t });
}

/* ------------------------------------------------------------------ */
/* ABOUT                                                               */
/* ------------------------------------------------------------------ */
export function aboutCard(cfg) {
  const t = new Typo('a');
  const a = cfg.about;
  const bio = wrap(t, a.bio, { size: 19, maxW: 480 });
  const facts = [['CLASS', a.class], ['SUBCLASS', a.subclass], ['MAIN', a.main], ['LEARNING', a.learning], ['STATUS', a.status], ['BASE', a.base || cfg.tzLabel]];
  const h = Math.max(290, 150 + bio.length * 28 + 40);
  const factSvg = facts.map(([k, v], i) => {
    const x = 556 + (i % 2) * 206, y = 76 + Math.floor(i / 2) * 62;
    const live = k === 'STATUS';
    return `<rect x="${x}" y="${y}" width="196" height="50" rx="10" fill="${C.panel}" stroke="${C.line}"/>
${t.text(k, { x: x + 14, y: y + 19, size: 11, style: 'mono700', fill: C.dim, ls: 2 })}
${live ? `<circle cx="${x + 19}" cy="${y + 34}" r="4" fill="${C.green}"/>` : ''}
${t.text(v, { x: x + (live ? 30 : 14), y: y + 39, size: 16, style: 'disp500', fill: live ? C.green : C.text })}`;
  }).join('');
  const body = `
${frame(t, { w: W, h, title: 'about.md', tag: 'PLAYER PROFILE', gridId: 'agrid' })}
${heading(t, { x: 44, y: 108, title: 'ABOUT', sub: 'who is behind the terminal' })}
${bio.map((l, i) => t.text(l, { x: 44, y: 152 + i * 28, size: 19, style: 'disp500', fill: C.text })).join('')}
${factSvg}`;
  return svgDoc({ w: W, h, title: `About ${cfg.name}`, desc: `${a.bio} Class: ${a.class}. Subclass: ${a.subclass}. Main: ${a.main}. Learning: ${a.learning}. Status: ${a.status}.`, defs: gridPattern('agrid', 28), body, typo: t });
}

/* ------------------------------------------------------------------ */
/* LOADOUT — tech stack as equipped slots (no fake % bars)             */
/* ------------------------------------------------------------------ */
const RANK = { MAIN: C.cyan, SPECIAL: C.green, SIDE: C.muted, LEARNING: C.amber };

export function loadoutCard(cfg) {
  const t = new Typo('l');
  const rowH = 74;
  const top = 132;
  const h = top + cfg.stack.length * rowH + 28;
  const css = `@keyframes dash{to{stroke-dashoffset:-24}}.learn{stroke-dasharray:6 6;animation:dash 1.2s linear infinite}`;
  const rows = cfg.stack.map((row, r) => {
    const y = top + r * rowH;
    const col = RANK[row.rank] || C.cyan;
    const tiles = row.items.map((it, i) => {
      const ic = techIcon(it);
      const x = 248 + i * 180;
      const learn = row.rank === 'LEARNING';
      const label = ic.title.length > 15 ? ic.title.replace('Recognition', 'Recog.') : ic.title;
      return `<g class="a" style="animation:fadeUp .5s ${(0.15 + r * 0.12 + i * 0.06).toFixed(2)}s both">
<rect x="${x}" y="${y}" width="168" height="54" rx="12" fill="${C.panel}" stroke="${learn ? C.amber : C.line2}" ${learn ? 'class="learn" stroke-opacity=".7"' : ''}/>
<rect x="${x + 10}" y="${y + 11}" width="32" height="32" rx="8" fill="${ic.color}" fill-opacity=".1"/>
${ic.draw(x + 16, y + 17, 20)}
${t.text(label, { x: x + 54, y: y + 33, size: 15, style: 'disp500', fill: C.text })}</g>`;
    }).join('') + (row.items.length < 4 && r === cfg.stack.length - 1 ? (() => {
      const x = 248 + row.items.length * 180;
      return `<rect x="${x}" y="${y}" width="168" height="54" rx="12" stroke="${C.line2}" stroke-dasharray="3 5"/>
<g transform="translate(${x + 26} ${y + 27})" fill="none"><rect x="-8" y="-3" width="16" height="12" rx="3" stroke="${C.dim}" stroke-width="2"/><path d="M-5 -3V-7A5 5 0 0 1 5 -7V-3" stroke="${C.dim}" stroke-width="2"/></g>
${t.text('next unlock', { x: x + 54, y: y + 26, size: 13, style: 'disp500', fill: C.muted })}
${t.text('? ? ?', { x: x + 54, y: y + 42, size: 11, style: 'mono700', fill: C.dim, ls: 1 })}`;
    })() : '');
    return `${t.text(row.slot, { x: 44, y: y + 24, size: 13, style: 'mono700', fill: C.muted, ls: 2 })}
${chip(t, { x: 44, y: y + 33, label: row.rank, color: col, size: 10, h: 20, padX: 8 }).svg}
<path d="M200 ${y + 27}H232" stroke="${C.line2}" stroke-dasharray="2 4"/>
${tiles}`;
  }).join('');
  const body = `
${frame(t, { w: W, h, title: 'stack.json', tag: `${cfg.stack.length} SLOTS EQUIPPED`, gridId: 'lgrid' })}
${heading(t, { x: 44, y: 104, title: 'LOADOUT', sub: 'tech stack, equipped' })}
${rows}`;
  const all = cfg.stack.flatMap((s) => s.items.map((i) => techIcon(i).title));
  return svgDoc({ w: W, h, title: 'Loadout — tech stack', desc: `Tech stack: ${all.join(', ')}.`, css, defs: gridPattern('lgrid', 28), body, typo: t });
}

/* ------------------------------------------------------------------ */
/* NOW RUNNING                                                         */
/* ------------------------------------------------------------------ */
export function nowRunning(cfg) {
  const t = new Typo('n');
  const h = 96;
  const q = cfg.currentQuest;
  const css = `@keyframes slide{0%{transform:translateX(-90px)}100%{transform:translateX(250px)}}.seg{animation:slide 1.8s cubic-bezier(.6,0,.4,1) infinite}`;
  const label = chip(t, { x: 28, y: 22, label: 'NOW RUNNING', color: C.amber, size: 11, h: 22, dot: true });
  const body = `
<rect x="1" y="1" width="${W - 2}" height="${h - 2}" rx="18" fill="${C.void}" stroke="${C.line2}" stroke-width="1.5"/>
<rect x="1" y="1" width="6" height="${h - 2}" rx="3" fill="${C.amber}"/>
${label.svg}
${t.text(q.title, { x: 28, y: 74, size: 24, style: 'disp700', fill: C.text })}
${t.text(`— ${q.phase}`, { x: 28 + t.measure(q.title, { style: 'disp700', size: 24 }) + 14, y: 73, size: 16, style: 'disp500', fill: C.muted })}
<clipPath id="nbar"><rect x="${W - 300}" y="54" width="250" height="8" rx="4"/></clipPath>
<rect x="${W - 300}" y="54" width="250" height="8" rx="4" fill="${C.panel2}"/>
<g clip-path="url(#nbar)"><rect x="${W - 300}" y="54" width="90" height="8" rx="4" fill="${C.amber}" class="seg"/></g>
`;
  return svgDoc({ w: W, h, title: `Now running: ${q.title}`, desc: `Currently building ${q.title}: ${q.phase}.`, css, body, typo: t });
}

/* ------------------------------------------------------------------ */
/* QUEST LOG header + cards                                            */
/* ------------------------------------------------------------------ */
export function questHeader(cfg) {
  const t = new Typo('q');
  const h = 96;
  const done = cfg.projects.filter((p) => DONE.has(p.status)).length;
  const body = `
${heading(t, { x: 8, y: 52, title: 'QUEST LOG', sub: 'featured projects' })}
${t.text(`${cfg.projects.length} QUESTS · ${done} CLEARED`, { x: W - 8, y: 48, size: 13, style: 'mono700', fill: C.amber, anchor: 'end', ls: 2 })}
<path d="M8 76H${W - 8}" stroke="${C.line2}"/>
<path d="M8 76H140" stroke="${C.cyan}" stroke-width="2.5" stroke-linecap="round"/>
${t.text('every quest lists its boss — the hardest problem it had to solve', { x: 8, y: 94, size: 12, fill: C.dim })}`;
  return svgDoc({ w: W, h: h + 6, title: 'Quest log — featured projects', body, typo: t });
}

const DONE = new Set(['SHIPPED', 'COMPLETE']);
const STATUS = {
  SHIPPED: { c: C.green, glyph: '●' },
  COMPLETE: { c: C.green, glyph: '●' },
  'IN PROGRESS': { c: C.amber, glyph: '◐' },
  LEARNING: { c: C.amber, glyph: '○' },
};

export function questCard(cfg, p) {
  const t = new Typo('c');
  const w = 490, h = 410;
  const st = STATUS[p.status] || STATUS.SHIPPED;
  const vis = VISUALS[p.key] ? VISUALS[p.key](t) : { svg: '', css: '' };
  const summary = wrap(t, p.summary, { size: 15, maxW: 446 });
  const sy = 236;
  const by = sy + 2 * 21 + 12; // fixed: cards in a row stay aligned for 1- or 2-line summaries
  let tx = 22;
  const tags = p.tech.map((x) => {
    const c = chip(t, { x: tx, y: h - 46, label: x.toUpperCase(), color: C.muted, size: 10, h: 22, padX: 8, fillOpacity: 0.06 });
    tx += c.w + 6;
    return c.svg;
  }).join('');
  const stLabel = `${st.glyph} ${p.status}`;
  const body = `
<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="18" fill="${C.void}"/>
<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="18" stroke="${C.line2}" stroke-width="1.5"/>
<path d="M28 1.5H128" stroke="${st.c}" stroke-width="2.5" stroke-linecap="round"/>
${t.text(p.quest, { x: 22, y: 34, size: 13, style: 'mono700', fill: C.amber, ls: 2.5 })}
${chip(t, { x: w - 22, y: 17, label: p.type, color: p.type === 'MAIN' ? C.cyan : C.amber, size: 10, h: 22, padX: 9, anchor: 'end' }).svg}
<g transform="translate(18 50)">
  <clipPath id="cvis"><rect width="454" height="140" rx="12"/></clipPath>
  <rect width="454" height="140" rx="12" fill="${C.panel}"/>
  <g clip-path="url(#cvis)"><rect width="454" height="140" fill="url(#cgrid)"/>${vis.svg}</g>
  <rect width="454" height="140" rx="12" stroke="${C.line}"/>
  <rect x="418" y="10" width="26" height="26" rx="7" fill="${C.void}" fill-opacity=".7"/>${ui('arrow', 422, 14, 18, C.muted)}
</g>
${t.text(p.title, { x: 22, y: 222, size: 26, style: 'disp700', fill: C.text })}
${summary.map((l, i) => t.text(l, { x: 22, y: sy + 14 + i * 21, size: 15, style: 'disp500', fill: C.muted })).join('')}
<rect x="22" y="${by}" width="446" height="62" rx="10" fill="${C.red}" fill-opacity=".05" stroke="${C.red}" stroke-opacity=".22"/>
${t.text('BOSS', { x: 36, y: by + 24, size: 11, style: 'mono700', fill: C.red, ls: 2 })}
${t.text(p.boss, { x: 84, y: by + 24, size: 14, style: 'mono500', fill: C.text })}
${t.text(`${DONE.has(p.status) ? '✓' : '◐'} ${p.win}`, { x: 84, y: by + 47, size: 13, fill: DONE.has(p.status) ? C.green : C.amber })}
${tags}
${t.text(stLabel, { x: w - 22, y: h - 30, size: 12, style: 'mono700', fill: st.c, anchor: 'end', ls: 1.5 })}`;
  return svgDoc({
    w, h,
    title: `${p.quest}: ${p.title}`,
    desc: `${p.summary} Hardest problem: ${p.boss} — ${p.win}. Tech: ${p.tech.join(', ')}. Status: ${p.status}.`,
    css: vis.css,
    defs: gridPattern('cgrid', 20, C.line, 0.6),
    body,
    typo: t,
  });
}

/* ---------- per-project mini animations (454 × 140) ---------- */
const VISUALS = {
  absensi(t) {
    const css = `
@keyframes phA{0%,46%{opacity:1}50%,96%{opacity:0}100%{opacity:1}}
@keyframes phB{0%,46%{opacity:0}50%,96%{opacity:1}100%{opacity:0}}
@keyframes scanY{0%{transform:translateY(0)}50%{transform:translateY(112px)}100%{transform:translateY(0)}}
@keyframes eyeBlink{0%,70%,76%,100%{transform:scaleY(1)}73%{transform:scaleY(.1)}}
.pa{animation:phA 7s infinite}.pb{animation:phB 7s infinite}
.sy{animation:scanY 3.5s ease-in-out infinite}
.eb{transform-box:fill-box;transform-origin:center;animation:eyeBlink 7s infinite}`;
    const face = (col) => `<circle cx="0" cy="-6" r="27" fill="#FDE9DF" opacity=".9"/><path d="M-30 -10C-32 -38 -10 -46 0 -46C14 -46 32 -38 30 -10L22 -20L14 -8L6 -24L-4 -10L-12 -24L-20 -8Z" fill="#1C2647"/>
<path d="M-40 44C-38 26 -22 20 0 20C22 20 38 26 40 44Z" fill="#212838"/>
<g class="${col === 'live' ? 'eb' : ''}"><ellipse cx="-10" cy="-2" rx="3.5" ry="4.5" fill="#123E6B"/><ellipse cx="10" cy="-2" rx="3.5" ry="4.5" fill="#123E6B"/></g>
<path d="M-5 10Q0 14 5 10" stroke="#B04E6B" stroke-width="2" stroke-linecap="round"/>`;
    const row = (k, v, y, c) => t.text(k, { x: 214, y, size: 12, style: 'mono500', fill: C.dim }) + t.text(v, { x: 306, y, size: 12, style: 'mono700', fill: c });
    const svg = `
<g class="pa"><g transform="translate(100 72) rotate(-6)"><rect x="-46" y="-56" width="92" height="104" rx="4" fill="#E9EEF7"/><rect x="-40" y="-50" width="80" height="92" fill="#2B3346"/><g transform="scale(.85)">${face('photo')}</g></g>
  <rect x="44" y="14" width="112" height="112" rx="4" stroke="${C.red}" stroke-width="2" stroke-dasharray="6 4"/>
  ${chip(t, { x: 52, y: 4, label: 'SPOOF ✗', color: C.red, size: 10, h: 20, padX: 8 }).svg}
  ${row('EAR', '0.29 → 0.29', 36, C.text)}${row('motion', 'none', 58, C.text)}${row('texture', 'printed', 80, C.red)}${row('verdict', 'REJECTED', 112, C.red)}</g>
<g class="pb"><g transform="translate(100 74)">${face('live')}</g>
  <rect x="44" y="14" width="112" height="112" rx="4" stroke="${C.green}" stroke-width="2"/>
  ${[[86, 70], [114, 70], [100, 84], [92, 92], [108, 92], [76, 60], [124, 60], [100, 54]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="${C.green}"/>`).join('')}
  ${chip(t, { x: 52, y: 4, label: 'LIVE ✓', color: C.green, size: 10, h: 20, padX: 8 }).svg}
  ${row('EAR', '0.29 → 0.07', 36, C.text)}${row('motion', 'head yaw 4°', 58, C.text)}${row('texture', 'real skin', 80, C.green)}${row('verdict', 'PRESENT ✓', 112, C.green)}</g>
<g class="sy"><rect x="40" y="12" width="120" height="2" fill="${C.cyan}" opacity=".8"/></g>
<path d="M196 18V122" stroke="${C.line2}"/>`;
    return { css, svg };
  },

  cms(t) {
    const css = `
@keyframes blk{0%,6%{opacity:0;transform:translateY(10px)}14%,88%{opacity:1;transform:none}96%,100%{opacity:0}}
@keyframes cur{0%,30%{transform:translate(250px,120px)}52%,62%{transform:translate(384px,22px)}80%,100%{transform:translate(300px,96px)}}
@keyframes clk{0%,54%{opacity:0;transform:scale(.4)}57%{opacity:.9}66%,100%{opacity:0;transform:scale(1.8)}}
@keyframes toast{0%,58%{opacity:0;transform:translateY(-10px)}63%,90%{opacity:1;transform:none}96%,100%{opacity:0}}
.b{animation:blk 7s infinite both}.cur{animation:cur 7s cubic-bezier(.5,0,.3,1) infinite}
.clk{transform-box:fill-box;transform-origin:center;animation:clk 7s infinite}.toast{animation:toast 7s infinite}`;
    const b = (d, inner) => `<g class="b" style="animation-delay:${d}s">${inner}</g>`;
    const svg = `
<rect x="14" y="12" width="426" height="118" rx="8" fill="${C.void}" stroke="${C.line2}"/>
<rect x="14" y="12" width="70" height="118" rx="8" fill="${C.panel2}"/>
${[30, 46, 62, 78].map((y, i) => `<rect x="24" y="${y}" width="${i === 1 ? 46 : 36}" height="6" rx="3" fill="${i === 1 ? C.cyan : C.line2}"/>`).join('')}
<rect x="352" y="18" width="78" height="20" rx="6" fill="${C.cyan}" fill-opacity=".15" stroke="${C.cyan}" stroke-opacity=".6"/>
${t.text('PUBLISH', { x: 391, y: 32, size: 10, style: 'mono700', fill: C.cyan, anchor: 'middle', ls: 1 })}
${b(0, `<rect x="96" y="46" width="334" height="34" rx="6" fill="${C.cyan}" fill-opacity=".1" stroke="${C.cyan}" stroke-opacity=".3"/><rect x="108" y="56" width="120" height="7" rx="3.5" fill="${C.text}" opacity=".8"/><rect x="108" y="68" width="80" height="5" rx="2.5" fill="${C.muted}"/>`)}
${b(0.25, `<rect x="96" y="86" width="104" height="36" rx="6" fill="${C.panel2}" stroke="${C.line2}"/><rect x="104" y="96" width="50" height="5" rx="2.5" fill="${C.muted}"/>`)}
${b(0.45, `<rect x="210" y="86" width="104" height="36" rx="6" fill="${C.panel2}" stroke="${C.line2}"/><rect x="218" y="96" width="60" height="5" rx="2.5" fill="${C.muted}"/>`)}
${b(0.65, `<rect x="324" y="86" width="106" height="36" rx="6" fill="${C.panel2}" stroke="${C.line2}"/><rect x="332" y="96" width="40" height="5" rx="2.5" fill="${C.muted}"/>`)}
<g class="toast"><rect x="96" y="18" width="150" height="22" rx="6" fill="${C.green}" fill-opacity=".15" stroke="${C.green}" stroke-opacity=".6"/>${t.text('✓ page published', { x: 106, y: 33, size: 11, style: 'mono700', fill: C.green })}</g>
<g class="cur"><circle cx="6" cy="6" r="12" stroke="${C.cyan}" stroke-width="2" class="clk"/><path d="M0 0L0 17L4.5 12.5L8 20L11 18.6L7.6 11.4L13.5 11.4Z" fill="${C.text}" stroke="${C.void}" stroke-width="1.2"/></g>`;
    return { css, svg };
  },

  ai(t) {
    const css = `
@keyframes nodeP{0%,100%{opacity:.45}50%{opacity:1}}
@keyframes draw{0%,20%{stroke-dashoffset:60}45%,85%{stroke-dashoffset:0}100%{stroke-dashoffset:0;opacity:0}}
@keyframes cur2{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.35);opacity:.3}}
.np{animation:nodeP 2.4s ease-in-out infinite}.dr{stroke-dasharray:60;animation:draw 5s ease-in-out infinite}
.cr{transform-box:fill-box;transform-origin:center;animation:cur2 1.6s ease-in-out infinite}`;
    const cols = [[40, [34, 70, 106]], [104, [22, 54, 86, 118]], [168, [34, 70, 106]]];
    let edges = '', pulses = '', k = 0;
    for (let c = 0; c < 2; c++) for (const y1 of cols[c][1]) for (const y2 of cols[c + 1][1]) {
      const d = `M${cols[c][0]} ${y1}L${cols[c + 1][0]} ${y2}`;
      edges += `<path d="${d}" stroke="${C.line2}" stroke-width="1"/>`;
      if ((k++ * 7) % 5 === 0) pulses += `<circle r="2.6" fill="${k % 3 ? C.cyan : C.sakura}"><animateMotion dur="1.6s" begin="${((k * 0.37) % 1.6).toFixed(2)}s" repeatCount="indefinite" path="${d}"/></circle>`;
    }
    const nodes = cols.flatMap(([x, ys], ci) => ys.map((y, i) => `<circle cx="${x}" cy="${y}" r="7" fill="${C.panel2}" stroke="${C.cyan}" stroke-width="1.6" class="np" style="animation-delay:${(ci * 0.4 + i * 0.2).toFixed(1)}s"/>`)).join('');
    const L = [[240, 98, 'done'], [290, 52, 'done'], [340, 92, 'cur'], [392, 46, 'lock'], [430, 100, 'lock']];
    const path = L.map(([x, y], i) => (i ? 'L' : 'M') + x + ' ' + y).join('');
    const lnodes = L.map(([x, y, s], i) => s === 'done'
      ? `<circle cx="${x}" cy="${y}" r="9" fill="${C.green}" fill-opacity=".2" stroke="${C.green}" stroke-width="1.8"/>${t.text('✓', { x: x - 4.2, y: y + 4.5, size: 12, style: 'mono700', fill: C.green })}`
      : s === 'cur'
        ? `<circle cx="${x}" cy="${y}" r="15" stroke="${C.amber}" stroke-width="1.5" class="cr"/><circle cx="${x}" cy="${y}" r="9" fill="${C.amber}" fill-opacity=".25" stroke="${C.amber}" stroke-width="2"/>`
        : `<circle cx="${x}" cy="${y}" r="8" fill="${C.panel2}" stroke="${C.dim}" stroke-width="1.5" stroke-dasharray="3 3"/>`).join('');
    const svg = `
${edges}${pulses}${nodes}
<path d="M196 18V122" stroke="${C.line2}"/>
<path d="${path}" stroke="${C.line2}" stroke-width="2" stroke-dasharray="4 4"/>
<path d="M340 92Q372 128 430 100" stroke="${C.amber}" stroke-width="2" class="dr" fill="none"/>
${lnodes}
<rect x="214" y="12" width="128" height="20" rx="5" fill="${C.void}" stroke="${C.line2}"/>
${t.text('tutor → see p. 14', { x: 222, y: 26, size: 10.5, style: 'mono500', fill: C.amber })}`;
    return { css, svg };
  },

  diagnova(t) {
    // symptoms tick in → certainty factor fills → the rules that fired light up
    const sym = ['ear pain', 'blocked nose', 'sore throat', 'mild fever'];
    const kf = (name, on) => `@keyframes ${name}{0%,${on}%{opacity:0}${on + 3}%,90%{opacity:1}95%,100%{opacity:0}}`;
    const css = sym.map((_, i) => kf(`dk${i}`, 6 + i * 11)).join('') + ['r0', 'r1', 'r2'].map((n, i) => kf(`d${n}`, 66 + i * 5)).join('') + `
@keyframes dcf{0%,52%{transform:scaleX(0)}66%,90%{transform:scaleX(.86)}95%,100%{transform:scaleX(0)}}
@keyframes dval{0%,64%{opacity:0}67%,90%{opacity:1}95%,100%{opacity:0}}
.cf{transform-box:fill-box;transform-origin:left;animation:dcf 7s cubic-bezier(.2,.7,.2,1) infinite}`;
    const rows = sym.map((label, i) => {
      const y = 22 + i * 26;
      return `<rect x="18" y="${y}" width="14" height="14" rx="3" stroke="${C.line2}" stroke-width="1.5"/>
<g style="animation:dk${i} 7s infinite">${t.text('✓', { x: 19.5, y: y + 12, size: 13, style: 'mono700', fill: C.green })}</g>
${t.text(label, { x: 42, y: y + 12, size: 12, style: 'mono500', fill: C.muted })}`;
    }).join('');
    const svg = `
${rows}
<path d="M196 18V122" stroke="${C.line2}"/>
${t.text('CERTAINTY', { x: 214, y: 34, size: 10, style: 'mono700', fill: C.dim, ls: 1.5 })}
<rect x="214" y="44" width="220" height="10" rx="5" fill="${C.void}"/>
<rect x="214" y="44" width="220" height="10" rx="5" fill="${C.cyan}" class="cf"/>
<g style="animation:dval 7s infinite">${t.text('CF 0.86', { x: 434, y: 74, size: 12, style: 'mono700', fill: C.cyan, anchor: 'end' })}</g>
${t.text('RULES FIRED', { x: 214, y: 84, size: 10, style: 'mono700', fill: C.dim, ls: 1.5 })}
${['R04', 'R12', 'R17'].map((r, i) => `<g style="animation:dr${i} 7s infinite">${chip(t, { x: 214 + i * 64, y: 94, label: r, color: C.green, size: 11, h: 24, padX: 12 }).svg}</g>`).join('')}`;
    return { css, svg };
  },
};

/* ------------------------------------------------------------------ */
/* SAVE POINT (contact)                                                */
/* ------------------------------------------------------------------ */
export function savePoint(cfg, stats) {
  const t = new Typo('s');
  const h = 320;
  const PX = 4, ledge = 252;
  const slot = [
    ['FILE 01', cfg.name.toUpperCase()],
    ['LEVEL', stats?.level ? `LV ${stats.level}` : '—'],
    ['QUESTS', `${cfg.projects.length} logged`],
    ['PLAYTIME', stats?.playtime || 'since day one'],
  ];
  // a short platform for her to sit on — same tiles as the Unity scene
  const tiles = Array.from({ length: 5 }, (_, i) => `<rect x="${52 + i * 48}" y="${ledge}" width="48" height="22" fill="#2B3B6B"/><rect x="${52 + i * 48}" y="${ledge}" width="48" height="4" fill="${C.green}" opacity=".75"/><rect x="${60 + i * 48}" y="${ledge + 11}" width="8" height="5" fill="#22305A"/>`).join('');
  const body = `
${frame(t, { w: W, h, title: 'save.dat', tag: 'AUTOSAVE ✓', tagColor: C.green, gridId: 'sgrid' })}
<g shape-rendering="crispEdges">${tiles}</g>
<g transform="translate(78 ${ledge - LEDGE * PX})">${lumiPixel({ px: PX, pose: 'wave' })}</g>
${heading(t, { x: 360, y: 108, title: 'SAVE POINT', sub: "let's build something" })}
${wrap(t, 'Progress saved. If you have a project, a role, or just a cool idea — my inbox is the next level.', { size: 18, maxW: 590 }).map((l, i) => t.text(l, { x: 360, y: 148 + i * 27, size: 18, style: 'disp500', fill: C.text })).join('')}
<rect x="360" y="${h - 100}" width="600" height="60" rx="12" fill="${C.panel}" stroke="${C.line2}"/>
${slot.map(([k, v], i) => `${t.text(k, { x: 378 + i * 148, y: h - 76, size: 10.5, style: 'mono700', fill: C.dim, ls: 2 })}${t.text(v, { x: 378 + i * 148, y: h - 54, size: 15, style: 'disp700', fill: i === 1 ? C.amber : C.text })}`).join('')}`;
  return svgDoc({ w: W, h, title: 'Save point — contact', desc: 'Contact section. Lumi waves from a save platform — get in touch via the buttons below.', css: lumiPixelCss, defs: gridPattern('sgrid', 28), body, typo: t });
}

export function contactButton({ icon, label, sub }) {
  const t = new Typo('b');
  const w = 320, h = 64;
  const body = `
<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="14" fill="${C.panel}" stroke="${C.line2}" stroke-width="1.5"/>
<rect x="14" y="14" width="36" height="36" rx="10" fill="${C.cyan}" fill-opacity=".1"/>
${ui(icon, 21, 21, 22, C.cyan)}
${t.text(label, { x: 64, y: 31, size: 17, style: 'disp700', fill: C.text, ls: 1.2 })}
${t.text(sub, { x: 64, y: 49, size: 11.5, style: 'mono500', fill: C.dim })}
${ui('arrow', w - 40, 22, 20, C.muted)}`;
  return svgDoc({ w, h, title: `${label} — ${sub}`, body, typo: t });
}

/* ------------------------------------------------------------------ */
/* FOOTER — Lumi peeking (links to the secret)                         */
/* ------------------------------------------------------------------ */
export function footer() {
  const t = new Typo('f');
  const w = 1000, h = 92, PX = 3, line = 78;
  const body = `
<path d="M8 40H420M580 40H992" stroke="${C.line2}" stroke-dasharray="2 6"/>
${t.text('END OF TRANSMISSION', { x: 500, y: 45, size: 12, style: 'mono700', fill: C.dim, anchor: 'middle', ls: 3 })}
<clipPath id="fclip"><rect x="0" y="0" width="${w}" height="${line}"/></clipPath>
<g clip-path="url(#fclip)"><g transform="translate(856 ${line - 17 * PX})">${lumiPixel({ px: PX, crop: 'head' })}</g></g>
<path d="M640 ${line}H992" stroke="${C.line2}" stroke-width="1.5"/>`;
  return svgDoc({ w, h, title: 'End of transmission', desc: 'Something is peeking from the corner…', css: lumiPixelCss, body, typo: t });
}

/* ------------------------------------------------------------------ */
/* SECRET — 404 page for whoever clicks the peeking Lumi               */
/* ------------------------------------------------------------------ */
export function secretCard() {
  const t = new Typo('z');
  const h = 360, PX = 3;
  const css = `@keyframes g1{0%,86%,100%{transform:translate(0);opacity:0}88%{transform:translate(-8px,2px);opacity:.8}92%{transform:translate(6px,-2px);opacity:.6}}`;
  const by = 300, size = 170;
  const big = (fill) => t.text('404', { x: 48, y: by, size, style: 'disp700', fill, ls: 4 });
  const top = Math.round(by - size * 0.7); // cap height: she sits on top of the zero
  const body = `
${frame(t, { w: W, h, title: 'secret.md', tag: 'ACCESS GRANTED', tagColor: C.sakura, accent: C.sakura, gridId: 'zgrid' })}
<g style="animation:g1 4s infinite" class="a">${big(C.cyan)}</g>
<g style="animation:g1 4s .08s infinite" class="a">${big(C.sakura)}</g>
${big(C.text)}
<g transform="translate(150 ${top - LEDGE * PX})">${lumiPixel({ px: PX })}</g>
${t.text('QUEST NOT FOUND', { x: 470, y: 176, size: 34, style: 'disp700', fill: C.text, ls: 1 })}
${t.text('…but you found me.', { x: 470, y: 214, size: 22, style: 'disp500', fill: C.muted })}
${chip(t, { x: 470, y: 240, label: '★ ACHIEVEMENT UNLOCKED · CURIOUS CAT', color: C.amber, size: 12, h: 30, padX: 14 }).svg}`;
  return svgDoc({ w: W, h, title: '404 — quest not found', desc: 'A hidden page. Lumi sits on the 404. Achievement unlocked: Curious Cat.', css: css + lumiPixelCss, defs: gridPattern('zgrid', 28), body, typo: t });
}
