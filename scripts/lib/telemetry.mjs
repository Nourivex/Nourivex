// SYSTEM MONITOR — renders data/stats.json into stats / activity / achievements SVGs.
import { Typo } from './text.mjs';
import { C, svgDoc, gridPattern, frame } from './theme.mjs';
import { lumiTiny, tinyCss } from './pixel-lumi.mjs';

const W = 1000;
const fmt = (n) => Number(n || 0).toLocaleString('en-US');

// Level curve: XP needed to reach level L is 100·(L−1)². Shown openly in the README source.
export const xpForLevel = (L) => 100 * (L - 1) ** 2;
export const levelFromXp = (xp) => Math.floor(Math.sqrt(xp / 100)) + 1;

function heading(t, { x, y, title, sub }) {
  const tw = t.measure(title, { style: 'disp700', size: 30, ls: 1 });
  return t.text(title, { x, y, size: 30, style: 'disp700', fill: C.text, ls: 1 }) +
    `<circle cx="${x + tw + 13}" cy="${y - 9}" r="3.5" fill="${C.cyan}"/>` +
    t.text(sub, { x: x + tw + 25, y, size: 16, style: 'disp500', fill: C.muted });
}

export function statsCard(s) {
  const t = new Typo('m');
  const h = 330;
  const into = s.xp - xpForLevel(s.level);
  const need = xpForLevel(s.level + 1) - xpForLevel(s.level);
  const pct = Math.max(0.02, Math.min(1, into / need));
  const R = 62, circ = 2 * Math.PI * R;
  const css = `@keyframes ring{from{stroke-dashoffset:${circ.toFixed(1)}}}
.ring{stroke-dasharray:${circ.toFixed(1)};stroke-dashoffset:${(circ * (1 - pct)).toFixed(1)};animation:ring 1.6s cubic-bezier(.2,.7,.2,1) .3s both}
@keyframes grow{from{transform:scaleX(0)}}.grow{transform-box:fill-box;transform-origin:left;animation:grow 1.2s cubic-bezier(.2,.7,.2,1) both}`;

  const tiles = [
    ['CONTRIBUTIONS', fmt(s.totals.contributionsYear), `this year`],
    ['COMMITS', fmt(s.totals.commitsYear), 'this year'],
    ['PULL REQUESTS', fmt(s.totals.prsYear), 'this year'],
    ['STREAK', `${s.streak.current}d`, `best ${s.streak.longest}d`],
    ['REPOSITORIES', fmt(s.totals.repos), 'public, owned'],
    ['STARS', fmt(s.totals.stars), 'earned'],
  ];
  const tileSvg = tiles.map(([k, v, sub], i) => {
    const x = 290 + (i % 3) * 142, y = 96 + Math.floor(i / 3) * 104;
    return `<g class="a" style="animation:fadeUp .5s ${(0.2 + i * 0.07).toFixed(2)}s both">
<rect x="${x}" y="${y}" width="130" height="92" rx="12" fill="${C.panel}" stroke="${C.line}"/>
${t.text(k, { x: x + 14, y: y + 24, size: 10, style: 'mono700', fill: C.dim, ls: 1.6 })}
${t.text(v, { x: x + 14, y: y + 58, size: 28, style: 'disp700', fill: i === 3 ? C.amber : C.text })}
${t.text(sub, { x: x + 14, y: y + 78, size: 11, fill: C.muted })}</g>`;
  }).join('');

  // languages
  const langs = s.languages.slice(0, 5);
  let lx = 736;
  const barW = 228;
  const bar = langs.map((l) => {
    const w = Math.max(3, barW * l.pct);
    const r = `<rect x="${lx.toFixed(1)}" y="128" width="${(w - 2).toFixed(1)}" height="12" fill="${l.color || C.cyan}" class="grow" rx="2"/>`;
    lx += w;
    return r;
  }).join('');
  const legend = langs.map((l, i) => `<circle cx="742" cy="${170 + i * 26}" r="5" fill="${l.color || C.cyan}"/>${t.text(l.name, { x: 756, y: 175 + i * 26, size: 14, style: 'disp500', fill: C.text })}${t.text(`${(l.pct * 100).toFixed(1)}%`, { x: 964, y: 175 + i * 26, size: 12, style: 'mono500', fill: C.muted, anchor: 'end' })}`).join('');

  const body = `
${frame(t, { w: W, h, title: 'sys.monitor', tag: s.demo ? 'DEMO DATA · RUN THE WORKFLOW' : `SYNCED ${s.generatedAt.slice(0, 10)}`, tagColor: s.demo ? C.amber : C.muted, gridId: 'mgrid' })}
${heading(t, { x: 40, y: 92, title: 'STATS', sub: 'live telemetry' })}
<g transform="translate(140 206)">
  <circle r="${R + 14}" fill="${C.amber}" fill-opacity=".05"/>
  <circle r="${R}" stroke="${C.panel2}" stroke-width="10"/>
  <circle r="${R}" stroke="${C.amber}" stroke-width="10" stroke-linecap="round" class="ring" transform="rotate(-90)"/>
  ${t.text('LEVEL', { x: 0, y: -18, size: 11, style: 'mono700', fill: C.dim, anchor: 'middle', ls: 2.5 })}
  ${t.text(String(s.level), { x: 0, y: 26, size: 48, style: 'disp700', fill: C.text, anchor: 'middle' })}
</g>
${t.text(`${fmt(into)} / ${fmt(need)} XP`, { x: 140, y: 312, size: 12, style: 'mono500', fill: C.muted, anchor: 'middle' })}
${tileSvg}
${t.text('LANGUAGES', { x: 736, y: 112, size: 10, style: 'mono700', fill: C.dim, ls: 1.6 })}
<rect x="736" y="128" width="${barW}" height="12" rx="3" fill="${C.panel2}"/>
${bar}
${legend}`;
  return svgDoc({
    w: W, h,
    title: `GitHub stats — level ${s.level}`,
    desc: `Level ${s.level}. ${s.totals.contributionsYear} contributions, ${s.totals.commitsYear} commits and ${s.totals.prsYear} pull requests this year. Current streak ${s.streak.current} days. Top languages: ${langs.map((l) => l.name).join(', ')}.`,
    css, defs: gridPattern('mgrid', 28), body, typo: t,
  });
}

export function activityCard(s) {
  const t = new Typo('v');
  const h = 250;
  const weeks = s.weeks.slice(-26);
  const max = Math.max(4, ...weeks.map((w) => w.count));
  const x0 = 40, x1 = W - 40, base = 214, top = 132; // ridge stays clear of the heading
  const step = (x1 - x0) / (weeks.length - 1);
  const pts = weeks.map((w, i) => [x0 + i * step, base - (w.count / max) * (base - top) - 3]);
  // smooth ridge (Catmull-Rom → Bézier)
  let ridge = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    ridge += `C${c1.map((v) => v.toFixed(1)).join(' ')} ${c2.map((v) => v.toFixed(1)).join(' ')} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  const area = `${ridge}L${x1} ${base}L${x0} ${base}Z`;
  const peakI = weeks.reduce((b, w, i) => (w.count > weeks[b].count ? i : b), 0);
  const [px, py] = pts[peakI];
  const total = weeks.reduce((a, w) => a + w.count, 0);
  // the sprite walks on the ridge: offset the motion path up by the sprite height
  const walkPath = ridge.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (_, a, b) => `${(+a - 21).toFixed(1)} ${(+b - 53).toFixed(1)}`);
  const css = `@keyframes rise2{from{transform:scaleY(0)}}.rise{transform-box:fill-box;transform-origin:bottom;animation:rise2 1.2s cubic-bezier(.2,.7,.2,1) both}`;
  const bars = weeks.map((w, i) => {
    const bh = Math.max(2, (w.count / max) * (base - top));
    return `<rect x="${(x0 + i * step - 3).toFixed(1)}" y="${(base - bh).toFixed(1)}" width="6" height="${bh.toFixed(1)}" rx="2" fill="${C.cyan}" opacity=".18"/>`;
  }).join('');
  const months = weeks.map((w, i) => ({ i, m: new Date(w.start).toLocaleString('en-US', { month: 'short' }) })).filter((x, i, a) => i === 0 || x.m !== a[i - 1].m);
  const body = `
${frame(t, { w: W, h, title: 'activity.terrain', tag: `${fmt(total)} CONTRIBUTIONS · 26 WEEKS`, gridId: 'vgrid' })}
${heading(t, { x: 40, y: 88, title: 'ACTIVITY', sub: 'contribution terrain' })}
<g class="rise">${bars}<path d="${area}" fill="url(#vfill)"/></g>
<path d="${ridge}" stroke="${C.cyan}" stroke-width="2.5" fill="none" class="a" style="animation:fadeIn 1s .6s both"/>
<path d="M${x0} ${base}H${x1}" stroke="${C.line2}"/>
${months.map(({ i, m }) => t.text(m.toUpperCase(), { x: x0 + i * step, y: base + 22, size: 10, style: 'mono500', fill: C.dim, ls: 1 })).join('')}
<g class="a" style="animation:fadeIn .4s 1.2s both">
  <path d="M${px.toFixed(1)} ${(py - 6).toFixed(1)}V${(py - 32).toFixed(1)}" stroke="${C.amber}" stroke-width="2"/>
  <path d="M${px.toFixed(1)} ${(py - 32).toFixed(1)}h16l-5 6 5 6h-16Z" fill="${C.amber}"/>
  ${t.text(`PEAK ${weeks[peakI].count}`, { x: px + (px > W - 140 ? -8 : 24), y: py - 23, size: 11, style: 'mono700', fill: C.amber, anchor: px > W - 140 ? 'end' : 'start', ls: 1 })}
</g>
<g>${lumiTiny(3)}<animateMotion dur="18s" repeatCount="indefinite" path="${walkPath}" begin="1.4s"/></g>`;
  return svgDoc({
    w: W, h,
    title: 'Activity terrain — last 26 weeks',
    desc: `${total} contributions over the last 26 weeks; the busiest week had ${weeks[peakI].count}.`,
    css: css + tinyCss,
    defs: `${gridPattern('vgrid', 28)}<linearGradient id="vfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity=".35"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></linearGradient>`,
    body, typo: t,
  });
}

/* ---------- achievements ---------- */
const BADGE = {
  hello: (c) => `<path d="M-9 -6L-3 0L-9 6M1 7H9" stroke="${c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`,
  century: (c) => `<path d="M0 -11L3 -3H11L5 2L7 10L0 5L-7 10L-5 2L-11 -3H-3Z" fill="${c}"/>`,
  fire: (c) => `<path d="M0 -12C5 -6 9 -2 9 4C9 9 5 12 0 12C-5 12 -9 9 -9 4C-9 -1 -5 -3 -3 -8C-1 -4 1 -3 2 -1C3 -5 2 -8 0 -12Z" fill="${c}"/>`,
  poly: (c) => `<path d="M-6 -8L-11 0L-6 8M6 -8L11 0L6 8M3 -11L-3 11" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,
  star: (c) => `<circle r="10" stroke="${c}" stroke-width="2.2"/><path d="M0 -5L1.6 -1.4H5.4L2.3 1L3.4 4.8L0 2.6L-3.4 4.8L-2.3 1L-5.4 -1.4H-1.6Z" fill="${c}"/>`,
  ship: (c) => `<path d="M-10 4H10L7 10H-7Z" fill="${c}"/><path d="M0 -12V2M0 -12L8 -3H0" stroke="${c}" stroke-width="2.2" stroke-linejoin="round"/>`,
  face: (c) => `<path d="M-11 -5V-11H-5M5 -11H11V-5M11 5V11H5M-5 11H-11V5" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/><circle cx="-3.5" cy="-2" r="1.6" fill="${c}"/><circle cx="3.5" cy="-2" r="1.6" fill="${c}"/><path d="M-4 4Q0 7 4 4" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>`,
  lock: (c) => `<rect x="-8" y="-2" width="16" height="12" rx="3" stroke="${c}" stroke-width="2"/><path d="M-5 -2V-6A5 5 0 0 1 5 -6V-2" stroke="${c}" stroke-width="2"/>`,
};

export function computeAchievements(s, cfg) {
  const shipped = cfg.projects.filter((p) => ['SHIPPED', 'COMPLETE'].includes(p.status)).length;
  const list = [
    { id: 'hello', name: 'HELLO WORLD', desc: 'joined GitHub', have: 1, need: 1 },
    { id: 'century', name: 'CENTURION', desc: '100 contributions/yr', have: s.totals.contributionsYear, need: 100 },
    { id: 'fire', name: 'ON FIRE', desc: '7-day streak', have: s.streak.longest, need: 7 },
    { id: 'poly', name: 'POLYGLOT', desc: '5 languages in repos', have: s.languages.length, need: 5 },
    { id: 'star', name: 'STARGAZER', desc: '10 stars earned', have: s.totals.stars, need: 10 },
    { id: 'ship', name: 'FINISHER', desc: 'complete 2 projects', have: shipped, need: 2 },
    { id: 'face', name: 'LIVENESS OK', desc: 'proved you are human', have: 1, need: 1 },
    { id: 'lock', name: '? ? ?', desc: 'not in the README…', have: 0, need: 1, secret: true },
  ];
  return list.map((a) => ({ ...a, unlocked: a.have >= a.need }));
}

export function achievementsCard(s, cfg) {
  const t = new Typo('x');
  const list = computeAchievements(s, cfg);
  const n = list.filter((a) => a.unlocked).length;
  const h = 300;
  const body = `
${frame(t, { w: W, h, title: 'achievements', tag: `${n}/${list.length} UNLOCKED`, tagColor: C.amber, gridId: 'xgrid' })}
${heading(t, { x: 40, y: 92, title: 'ACHIEVEMENTS', sub: 'auto-unlocked from real data' })}
${list.map((a, i) => {
    const x = 40 + (i % 4) * 233, y = 118 + Math.floor(i / 4) * 86;
    const col = a.unlocked ? C.amber : C.dim;
    const prog = Math.min(1, a.have / a.need);
    return `<g class="a" style="animation:fadeUp .5s ${(0.1 + i * 0.06).toFixed(2)}s both">
<rect x="${x}" y="${y}" width="221" height="74" rx="12" fill="${C.panel}" stroke="${a.unlocked ? C.amber : C.line}" stroke-opacity="${a.unlocked ? 0.45 : 1}" ${a.secret ? 'stroke-dasharray="4 4"' : ''}/>
<circle cx="${x + 36}" cy="${y + 37}" r="22" fill="${col}" fill-opacity="${a.unlocked ? 0.12 : 0.06}"/>
<g transform="translate(${x + 36} ${y + 37})" fill="none">${BADGE[a.id](col)}</g>
${t.text(a.name, { x: x + 70, y: y + 30, size: 13, style: 'mono700', fill: a.unlocked ? C.text : C.muted, ls: 1.2 })}
${t.text(a.desc.length > 22 ? a.desc.slice(0, 21) + '…' : a.desc, { x: x + 70, y: y + 49, size: 11, fill: C.dim })}
${a.unlocked ? t.text('UNLOCKED', { x: x + 70, y: y + 64, size: 9, style: 'mono700', fill: C.amber, ls: 1.5 }) : a.secret ? t.text('HIDDEN', { x: x + 70, y: y + 64, size: 9, style: 'mono700', fill: C.dim, ls: 1.5 }) :
        `<rect x="${x + 70}" y="${y + 58}" width="100" height="5" rx="2.5" fill="${C.panel2}"/><rect x="${x + 70}" y="${y + 58}" width="${(100 * prog).toFixed(1)}" height="5" rx="2.5" fill="${C.amber}" opacity=".7"/>${t.text(`${a.have}/${a.need}`, { x: x + 178, y: y + 64, size: 9, style: 'mono500', fill: C.dim })}`}
</g>`;
  }).join('')}`;
  return svgDoc({
    w: W, h,
    title: `Achievements — ${n} of ${list.length} unlocked`,
    desc: list.map((a) => `${a.name}: ${a.unlocked ? 'unlocked' : 'locked'}`).join('. '),
    defs: gridPattern('xgrid', 28), body, typo: t,
  });
}

/** Plausible placeholder so the profile renders before the first workflow run. */
export function demoStats() {
  const weeks = [];
  const start = new Date();
  start.setDate(start.getDate() - 26 * 7);
  const seq = [3, 6, 4, 9, 12, 7, 5, 14, 18, 11, 8, 15, 22, 17, 9, 6, 12, 19, 25, 21, 14, 10, 16, 24, 30, 20];
  seq.forEach((c, i) => weeks.push({ start: new Date(start.getTime() + i * 7 * 864e5).toISOString().slice(0, 10), count: c }));
  const xp = 1120 * 10 + 14 * 50;
  return {
    demo: true,
    generatedAt: new Date().toISOString(),
    playtime: '3y 4m',
    totals: { contributionsAllTime: 1120, contributionsYear: 412, commitsYear: 356, prsYear: 18, repos: 21, stars: 14 },
    languages: [
      { name: 'TypeScript', color: '#3178C6', pct: 0.41 },
      { name: 'Python', color: '#3572A5', pct: 0.29 },
      { name: 'JavaScript', color: '#F1E05A', pct: 0.14 },
      { name: 'C#', color: '#178600', pct: 0.1 },
      { name: 'CSS', color: '#663399', pct: 0.06 },
    ],
    streak: { current: 5, longest: 12 },
    weeks,
    xp,
    level: levelFromXp(xp),
  };
}
