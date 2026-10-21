// Section assets: dock, about, loadout, now-running, quest log, save point, footer.
import { Typo } from './text.mjs';
import { C, svgDoc, gridPattern, frame, chip } from './theme.mjs';
import { bearPixel, bearPixelCss, LEDGE } from './pixel-bear.mjs';
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
    const vx = x + (live ? 30 : 14), vMax = 196 - (live ? 30 : 14) - 10;
    let vs = 16;
    while (vs > 11 && t.measure(v, { style: 'disp500', size: vs }) > vMax) vs -= 1;
    return `<rect x="${x}" y="${y}" width="196" height="50" rx="10" fill="${C.panel}" stroke="${C.line}"/>
${t.text(k, { x: x + 14, y: y + 19, size: 11, style: 'mono700', fill: C.dim, ls: 2 })}
${live ? `<circle cx="${x + 19}" cy="${y + 34}" r="4" fill="${C.green}"/><circle cx="${x + 19}" cy="${y + 34}" r="4" fill="${C.green}" opacity="0.4" style="animation:pulse 2s ease-in-out infinite"/>` : ''}
${t.text(v, { x: vx, y: y + 39, size: vs, style: 'disp500', fill: live ? C.green : C.text })}`;
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
  const titleW = t.measure(q.title, { style: 'disp700', size: 24 });
  const phaseX = 28 + titleW + 14;
  const phaseMax = (W - 300) - 16 - phaseX;
  let phase = `— ${q.phase}`;
  if (t.measure(phase, { style: 'disp500', size: 16 }) > phaseMax) {
    while (phase.length > 4 && t.measure(phase + '…', { style: 'disp500', size: 16 }) > phaseMax) phase = phase.slice(0, -1);
    phase += '…';
  }
  const body = `
<rect x="1" y="1" width="${W - 2}" height="${h - 2}" rx="18" fill="${C.void}" stroke="${C.line2}" stroke-width="1.5"/>
<rect x="1" y="1" width="6" height="${h - 2}" rx="3" fill="${C.amber}"/>
${label.svg}
${t.text(q.title, { x: 28, y: 74, size: 24, style: 'disp700', fill: C.text })}
${t.text(phase, { x: phaseX, y: 73, size: 16, style: 'disp500', fill: C.muted })}
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
${t.text('each quest lists its boss — the real engineering problem behind the feature', { x: 8, y: 94, size: 12, fill: C.dim })}`;
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
  const bLen = 20, bCol = C.cyan, bOp = 0.4;
  const brackets = `<g stroke="${bCol}" stroke-width="2" stroke-linecap="round" fill="none" opacity="${bOp}">
<path d="M${1+bLen} 1H1V${1+bLen}"/><path d="M${w-1-bLen} 1H${w-1}V${1+bLen}"/>
<path d="M${w-1} ${h-1-bLen}V${h-1}H${w-1-bLen}"/><path d="M${1+bLen} ${h-1}H1V${h-1-bLen}"/>
</g>`;
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
${brackets}
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
  medicare(t) {
    // a prescription is screened → a drug-drug interaction lights up → verdict
    const med = (y, label, cls, col) => `<g class="${cls}">
<rect x="18" y="${y}" width="152" height="30" rx="15" fill="${C.panel2}" stroke="${C.line2}"/>
<circle cx="35" cy="${y + 15}" r="7" fill="${col}" fill-opacity=".22" stroke="${col}" stroke-width="1.5"/>
${t.text(label, { x: 50, y: y + 20, size: 12, style: 'mono500', fill: C.text })}</g>`;
    const css = `
@keyframes mdA{0%,8%{opacity:0;transform:translateX(-16px)}16%,86%{opacity:1;transform:none}94%,100%{opacity:0}}
@keyframes mdB{0%,24%{opacity:0;transform:translateX(-16px)}32%,86%{opacity:1;transform:none}94%,100%{opacity:0}}
@keyframes mdScan{0%{transform:translateX(0)}50%{transform:translateX(146px)}100%{transform:translateX(0)}}
@keyframes mdHit{0%,44%{opacity:0;transform:scale(.5)}50%,60%{opacity:1;transform:scale(1)}68%,100%{opacity:0}}
@keyframes mdBar{0%,54%{transform:scaleX(0)}70%,86%{transform:scaleX(.68)}92%,100%{transform:scaleX(0)}}
@keyframes mdV{0%,58%{opacity:0}64%,86%{opacity:1}92%,100%{opacity:0}}
@keyframes mdSafe{0%,70%{opacity:0}76%,86%{opacity:1}92%,100%{opacity:0}}
.mdA{animation:mdA 7s infinite both}.mdB{animation:mdB 7s infinite both}
.mdS{animation:mdScan 3.2s ease-in-out infinite}
.mdH{transform-box:fill-box;transform-origin:center;animation:mdHit 7s infinite both}
.mdBar{transform-box:fill-box;transform-origin:left;animation:mdBar 7s cubic-bezier(.2,.7,.2,1) infinite}
.mdV{animation:mdV 7s infinite both}
.mdSafe{animation:mdSafe 7s infinite both}`;
    const svg = `
${med(24, 'amoxicillin', 'mdA', C.cyan)}
${med(66, 'warfarin', 'mdB', C.sakura)}
<g class="mdH">${chip(t, { x: 84, y: 45, label: 'DDI', color: C.red, size: 10, h: 22, padX: 9 }).svg}</g>
<g class="mdS"><rect x="18" y="14" width="152" height="2" fill="${C.cyan}" opacity=".7"/></g>
<path d="M196 18V122" stroke="${C.line2}"/>
${t.text('INTERACTION ENGINE', { x: 214, y: 34, size: 10, style: 'mono700', fill: C.dim, ls: 1.5 })}
<rect x="214" y="44" width="220" height="10" rx="5" fill="${C.void}"/>
<rect x="214" y="44" width="220" height="10" rx="5" fill="${C.amber}" class="mdBar"/>
<g class="mdV">${t.text('severity · moderate', { x: 434, y: 74, size: 12, style: 'mono700', fill: C.amber, anchor: 'end' })}</g>
${t.text('MATCHED RULES', { x: 214, y: 90, size: 10, style: 'mono700', fill: C.dim, ls: 1.5 })}
${['CYP2C9', 'BLEED', 'QT'].map((r, i) => `<g class="mdV" style="animation-delay:${(i * 0.12).toFixed(2)}s">${chip(t, { x: 214 + i * 74, y: 98, label: r, color: C.green, size: 11, h: 24, padX: 12 }).svg}</g>`).join('')}
<g class="mdSafe">${t.text('verdict: flag prescription', { x: 434, y: 122, size: 10, style: 'mono700', fill: C.red, anchor: 'end' })}</g>`;
    return { css, svg };
  },

  laptopfinder(t) {
    // weighted criteria grow → the SAW score ranks the shortlist
    const crit = [['RAM', 0.92, C.cyan], ['CPU', 0.8, C.cyan], ['SSD', 0.7, C.cyan], ['PRICE', 0.55, C.amber]];
    const ranks = [['01', 'ThinkPad X1', 0.94], ['02', 'MacBook Air', 0.89], ['03', 'Zenbook 14', 0.83]];
    const css = `
@keyframes lfG{0%,10%{transform:scaleX(0)}30%,86%{transform:scaleX(1)}94%,100%{transform:scaleX(0)}}
@keyframes lfR{0%,34%{opacity:0;transform:translateX(14px)}42%,86%{opacity:1;transform:none}94%,100%{opacity:0}}
@keyframes lfWin{0%,60%{opacity:.25}68%,86%{opacity:1}92%,100%{opacity:.25}}
.lfG{transform-box:fill-box;transform-origin:left;animation:lfG 7s cubic-bezier(.2,.7,.2,1) infinite}
.lfR{animation:lfR 7s infinite both}
.lfW{animation:lfWin 7s infinite}`;
    const bars = crit.map(([k, v, c], i) => {
      const y = 32 + i * 24;
      return `<rect x="18" y="${y}" width="140" height="8" rx="4" fill="${C.void}"/>
<rect x="18" y="${y}" width="${(140 * v).toFixed(0)}" height="8" rx="4" fill="${c}" class="lfG" style="animation-delay:${(i * 0.1).toFixed(2)}s"/>
${t.text(k, { x: 166, y: y + 8, size: 11, style: 'mono500', fill: C.muted })}`;
    }).join('');
    const rows = ranks.map(([n, name, s], i) => {
      const y = 34 + i * 30;
      const col = i === 0 ? C.green : C.muted;
      return `<g class="lfR" style="animation-delay:${(i * 0.2).toFixed(2)}s">
<rect x="244" y="${y}" width="192" height="24" rx="7" fill="${C.panel2}" stroke="${i === 0 ? C.green : C.line2}"/>
<circle cx="260" cy="${y + 12}" r="8" fill="${i === 0 ? C.green : C.line}" fill-opacity="${i === 0 ? '.2' : '1'}"/>
${i === 0 ? `<path d="M260 ${y+7}l1.5 3h3.2l-2.6 1.9.9 3-2.9-1.8-2.9 1.8.9-3-2.6-1.9h3.2z" fill="${C.amber}"/>` : ''}
${t.text(n, { x: 254, y: y + 16, size: 9, style: 'mono700', fill: col })}
${t.text(name, { x: 278, y: y + 16, size: 12, style: 'mono500', fill: C.text })}
${t.text(s.toFixed(2), { x: 428, y: y + 16, size: 11, style: 'mono700', fill: col, anchor: 'end' })}</g>`;
    }).join('');
    const svg = `
${t.text('WEIGHTED CRITERIA', { x: 18, y: 20, size: 10, style: 'mono700', fill: C.dim, ls: 1.5 })}
${bars}
<path d="M226 18V122" stroke="${C.line2}"/>
${t.text('RANKED SHORTLIST', { x: 244, y: 20, size: 10, style: 'mono700', fill: C.dim, ls: 1.5 })}
${rows}
<g class="lfW">${chip(t, { x: 244, y: 116, label: 'SAW SCORE', color: C.cyan, size: 10, h: 20, padX: 8 }).svg}</g>`;
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
  // a short platform for him to sit on — same tiles as the Unity scene
  const tiles = Array.from({ length: 5 }, (_, i) => `<rect x="${52 + i * 48}" y="${ledge}" width="48" height="22" fill="#2B3B6B"/><rect x="${52 + i * 48}" y="${ledge}" width="48" height="4" fill="${C.green}" opacity=".75"/><rect x="${60 + i * 48}" y="${ledge + 11}" width="8" height="5" fill="#22305A"/>`).join('');
  const body = `
${frame(t, { w: W, h, title: 'save.dat', tag: 'AUTOSAVE ✓', tagColor: C.green, gridId: 'sgrid' })}
<g shape-rendering="crispEdges">${tiles}</g>
<g transform="translate(78 ${ledge - LEDGE * PX})">${bearPixel({ px: PX, pose: 'wave' })}</g>
${heading(t, { x: 360, y: 108, title: 'SAVE POINT', sub: "let's build something" })}
${wrap(t, 'Progress saved. Got a project, a role, or a crazy idea? Drop it — Nouri logs everything and I read it all.', { size: 18, maxW: 590 }).map((l, i) => t.text(l, { x: 360, y: 148 + i * 27, size: 18, style: 'disp500', fill: C.text })).join('')}
<rect x="360" y="${h - 100}" width="600" height="60" rx="12" fill="${C.panel}" stroke="${C.line2}"/>
${slot.map(([k, v], i) => `${t.text(k, { x: 378 + i * 148, y: h - 76, size: 10.5, style: 'mono700', fill: C.dim, ls: 2 })}${t.text(v, { x: 378 + i * 148, y: h - 54, size: 15, style: 'disp700', fill: i === 1 ? C.amber : C.text })}`).join('')}`;
  return svgDoc({ w: W, h, title: 'Save point — contact', desc: 'Contact section. Nouri waves from a save platform — get in touch via the buttons below.', css: bearPixelCss, defs: gridPattern('sgrid', 28), body, typo: t });
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
/* FOOTER — Nouri peeking (links to the secret)                        */
/* ------------------------------------------------------------------ */
export function footer() {
  const t = new Typo('f');
  const w = 1000, h = 92, PX = 3, line = 78;
  const body = `
<path d="M8 40H420M580 40H992" stroke="${C.line2}" stroke-dasharray="2 6"/>
${t.text('END OF TRANSMISSION', { x: 500, y: 45, size: 12, style: 'mono700', fill: C.dim, anchor: 'middle', ls: 3 })}
<clipPath id="fclip"><rect x="0" y="0" width="${w}" height="${line}"/></clipPath>
<g clip-path="url(#fclip)"><g transform="translate(856 ${line - 17 * PX})">${bearPixel({ px: PX, crop: 'head' })}</g></g>
<path d="M640 ${line}H992" stroke="${C.line2}" stroke-width="1.5"/>
${t.text('psst', { x: 920, y: line + 16, size: 10, style: 'mono500', fill: C.dim })}`;
  return svgDoc({ w, h, title: 'End of transmission', desc: 'Something is peeking from the corner…', css: bearPixelCss, body, typo: t });
}

/* ------------------------------------------------------------------ */
/* SECRET — 404 page for whoever clicks the peeking Nouri              */
/* ------------------------------------------------------------------ */
export function secretCard() {
  const t = new Typo('z');
  const h = 360, PX = 3;
  const css = `@keyframes g1{0%,86%,100%{transform:translate(0);opacity:0}88%{transform:translate(-8px,2px);opacity:.8}92%{transform:translate(6px,-2px);opacity:.6}}`;
  const by = 300, size = 170;
  const big = (fill) => t.text('404', { x: 48, y: by, size, style: 'disp700', fill, ls: 4 });
  const top = Math.round(by - size * 0.7); // cap height: he sits on top of the zero
  const body = `
${frame(t, { w: W, h, title: 'secret.md', tag: 'ACCESS GRANTED', tagColor: C.sakura, accent: C.sakura, gridId: 'zgrid' })}
<g style="animation:g1 4s infinite" class="a">${big(C.cyan)}</g>
<g style="animation:g1 4s .08s infinite" class="a">${big(C.sakura)}</g>
${big(C.text)}
<g transform="translate(150 ${top - LEDGE * PX})">${bearPixel({ px: PX })}</g>
${t.text('QUEST NOT FOUND', { x: 470, y: 176, size: 34, style: 'disp700', fill: C.text, ls: 1 })}
${t.text('…but you found me.', { x: 470, y: 214, size: 22, style: 'disp500', fill: C.muted })}
${chip(t, { x: 470, y: 240, label: '★ ACHIEVEMENT UNLOCKED · CURIOUS CAT', color: C.amber, size: 12, h: 30, padX: 14 }).svg}`;
  return svgDoc({ w: W, h, title: '404 — quest not found', desc: 'A hidden page. Nouri sits on the 404. Achievement unlocked: Curious Cat.', css: css + bearPixelCss, defs: gridPattern('zgrid', 28), body, typo: t });
}
