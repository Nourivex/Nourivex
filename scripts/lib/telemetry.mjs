// METRICS & TELEMETRY — Clean, modern statistical presentation for contributions and top languages.
import { Typo } from './text.mjs';
import { C, svgDoc, cleanCard, badge } from './theme.mjs';

const W = 1000;
const H = 240;

const fmt = (n) => Number(n || 0).toLocaleString('en-US');

export function metricsCard(s) {
  const t = new Typo('m');

  const bgCard = cleanCard({ x: 0, y: 0, w: W, h: H, rx: 16, bg: '#FFFFFF', border: C.border, strokeWidth: 1.5 });

  const titleSvg = t.text('ENGINEERING METRICS & ACTIVITY', {
    x: 40,
    y: 44,
    size: 13,
    style: 'mono700',
    fill: C.primary,
    ls: 1.2
  });

  const syncDate = s.generatedAt ? s.generatedAt.slice(0, 10) : 'LIVE';
  const syncBadge = badge(t, {
    x: W - 40 - 150,
    y: 28,
    label: `SYNCED: ${syncDate}`,
    bg: C.bgSubtle,
    color: C.textDim,
    border: C.border,
    size: 9.5,
    h: 22,
    padX: 8
  });

  // 4 Metrics Stat Boxes on Left
  const statsList = [
    { label: 'ANNUAL CONTRIBUTIONS', val: fmt(s.totals.contributionsYear), sub: 'commits & PRs' },
    { label: 'PUBLIC REPOSITORIES', val: fmt(s.totals.repos), sub: 'maintained systems' },
    { label: 'COMMITS RECORDED', val: fmt(s.totals.commitsYear), sub: 'production updates' },
    { label: 'LONGEST STREAK', val: `${s.streak?.longest || 0}d`, sub: 'active delivery' },
  ];

  const statBoxW = 126;
  const statBoxH = 130;
  const statsSvg = statsList.map((stat, i) => {
    const sx = 40 + i * (statBoxW + 12);
    const sy = 68;

    return `
      <g>
        ${cleanCard({ x: sx, y: sy, w: statBoxW, h: statBoxH, rx: 10, bg: C.bgSubtle, border: C.borderSubtle, strokeWidth: 1 })}
        ${t.text(stat.label, { x: sx + 12, y: sy + 24, size: 8, style: 'mono700', fill: C.textDim, ls: 0.8 })}
        ${t.text(stat.val, { x: sx + 12, y: sy + 68, size: 26, style: 'disp700', fill: C.textMain })}
        ${t.text(stat.sub, { x: sx + 12, y: sy + 94, size: 10, style: 'disp500', fill: C.textMuted })}
      </g>
    `;
  }).join('');

  // Vertical Separator
  const sepX = 40 + 4 * (statBoxW + 12) + 8;
  const separator = `<line x1="${sepX}" y1="68" x2="${sepX}" y2="${H - 42}" stroke="${C.borderSubtle}" stroke-width="1"/>`;

  // Right Side: Top Languages Distribution
  const langX = sepX + 24;
  const langW = W - 40 - langX;
  const langTitle = t.text('PRIMARY LANGUAGE BREAKDOWN', {
    x: langX,
    y: 84,
    size: 11,
    style: 'mono700',
    fill: C.textMain,
    ls: 1
  });

  const topLangs = (s.languages || []).slice(0, 5);
  const barY = 104;
  const barH = 10;
  let curLx = langX;

  const barSegments = topLangs.map((l) => {
    const segW = Math.max(4, langW * l.pct);
    const seg = `<rect x="${curLx.toFixed(1)}" y="${barY}" width="${(segW - 2).toFixed(1)}" height="${barH}" rx="3" fill="${l.color || C.primary}"/>`;
    curLx += segW;
    return seg;
  }).join('');

  const legendY = 142;
  const legendSvg = topLangs.map((l, i) => {
    const itemX = langX + (i % 2) * 180;
    const itemY = legendY + Math.floor(i / 2) * 26;

    return `
      <g>
        <circle cx="${itemX + 6}" cy="${itemY - 4}" r="4.5" fill="${l.color || C.primary}"/>
        ${t.text(l.name, { x: itemX + 18, y: itemY, size: 12.5, style: 'disp700', fill: C.textMain })}
        ${t.text(`${(l.pct * 100).toFixed(1)}%`, { x: itemX + 110, y: itemY, size: 11, style: 'mono500', fill: C.textMuted })}
      </g>
    `;
  }).join('');

  const body = `
    ${bgCard}
    ${titleSvg}
    ${syncBadge.svg}
    ${statsSvg}
    ${separator}
    ${langTitle}
    <rect x="${langX}" y="${barY}" width="${langW}" height="${barH}" rx="3" fill="${C.bgSubtle}"/>
    ${barSegments}
    ${legendSvg}
  `;

  return svgDoc({
    w: W,
    h: H,
    title: 'Engineering Metrics',
    desc: 'Annual contributions and technology distribution',
    body,
    typo: t
  });
}

/** Demo fallback */
export function demoStats() {
  return {
    demo: false,
    generatedAt: new Date().toISOString(),
    totals: { contributionsYear: 544, repos: 30, commitsYear: 489, stars: 10 },
    streak: { current: 5, longest: 14 },
    languages: [
      { name: 'TypeScript', color: '#3178C6', pct: 0.38 },
      { name: 'Go', color: '#00ADD8', pct: 0.32 },
      { name: 'Python', color: '#3572A5', pct: 0.18 },
      { name: 'Dart', color: '#0175C2', pct: 0.08 },
      { name: 'SQL', color: '#E38C00', pct: 0.04 },
    ]
  };
}
