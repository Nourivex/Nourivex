// SECTION CARDS — Professional clean cards for Overview, Loadout, and Projects.
import { Typo } from './text.mjs';
import { C, svgDoc, cleanCard, badge, dotGridPattern } from './theme.mjs';
import { techIcon } from './icons.mjs';

const W = 1000;

/** Greedy word wrap using real glyph metrics */
export function wrap(t, text, { style = 'disp500', size = 15, maxW = 440 }) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? cur + ' ' + w : w;
    if (t.measure(next, { style, size }) > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

/** 1. ARCHITECTURE & CAPABILITIES OVERVIEW */
export function overviewCard(cfg) {
  const t = new Typo('o');
  const H = 220;

  const bgCard = cleanCard({ x: 0, y: 0, w: W, h: H, rx: 16, bg: '#FFFFFF', border: C.border, strokeWidth: 1.5 });

  const titleSvg = t.text('SYSTEM CAPABILITIES & FOCUS', {
    x: 40,
    y: 44,
    size: 13,
    style: 'mono700',
    fill: C.primary,
    ls: 1.2
  });

  const columns = [
    {
      title: 'Backend & Microservices',
      tag: 'CORE DISCIPLINE',
      desc: 'Architecting robust, low-latency REST and gRPC services in Go and Node.js with strict type safety and relational data integrity.'
    },
    {
      title: 'Cloud & Infrastructure',
      tag: 'PRODUCTION READINESS',
      desc: 'Containerizing services via Docker, managing cloud infrastructure on Linux, and automating CI/CD deployment pipelines.'
    },
    {
      title: 'Agentic Workflows & Data',
      tag: 'AUTOMATION & PIPELINES',
      desc: 'Integrating LLM orchestration, structured tool execution, and caching layers with Redis and PostgreSQL for scalable workflows.'
    }
  ];

  const colW = (W - 80 - 40) / 3;
  const colsSvg = columns.map((c, i) => {
    const cx = 40 + i * (colW + 20);
    const cy = 64;
    const ch = H - 84;

    const b = badge(t, { x: cx + 16, y: cy + 16, label: c.tag, bg: C.bgSubtle, color: C.textDim, border: C.border, size: 9, h: 20, padX: 6 });
    const cTitle = t.text(c.title, { x: cx + 16, y: cy + 56, size: 15, style: 'disp700', fill: C.textMain });
    const lines = wrap(t, c.desc, { size: 12.5, style: 'disp500', maxW: colW - 32 });
    const descSvg = lines.map((l, li) => t.text(l, { x: cx + 16, y: cy + 80 + li * 18, size: 12.5, style: 'disp500', fill: C.textMuted })).join('');

    return `
      <g>
        ${cleanCard({ x: cx, y: cy, w: colW, h: ch, rx: 12, bg: C.bgSubtle, border: C.borderSubtle, strokeWidth: 1 })}
        ${b.svg}
        ${cTitle}
        ${descSvg}
      </g>
    `;
  }).join('');

  const body = `
    ${bgCard}
    ${titleSvg}
    ${colsSvg}
  `;

  return svgDoc({
    w: W,
    h: H,
    title: 'System Capabilities Overview',
    desc: cfg.about.summary,
    body,
    typo: t
  });
}

/** 2. TECH STACK / LOADOUT (Clean Categorized Grid) */
export function techStackCard(cfg) {
  const t = new Typo('s');
  const rowH = 58;
  const headerH = 64;
  const H = headerH + cfg.stack.length * rowH + 20;

  const bgCard = cleanCard({ x: 0, y: 0, w: W, h: H, rx: 16, bg: '#FFFFFF', border: C.border, strokeWidth: 1.5 });

  const titleSvg = t.text('TECHNICAL ARSENAL', {
    x: 40,
    y: 40,
    size: 13,
    style: 'mono700',
    fill: C.primary,
    ls: 1.2
  });

  const subSvg = t.text('Production technologies and environments actively deployed across systems', {
    x: 230,
    y: 40,
    size: 12.5,
    style: 'disp500',
    fill: C.textDim
  });

  const rowsSvg = cfg.stack.map((group, rIdx) => {
    const ry = headerH + rIdx * rowH;
    const catSvg = t.text(group.category.toUpperCase(), {
      x: 40,
      y: ry + 34,
      size: 11,
      style: 'mono700',
      fill: C.textMain,
      ls: 0.8
    });

    const divider = `<line x1="220" y1="${ry + 8}" x2="220" y2="${ry + 48}" stroke="${C.borderSubtle}" stroke-width="1"/>`;

    let itemX = 240;
    const itemsSvg = group.items.map((item) => {
      const ic = techIcon(item);
      const iw = 150;
      const ih = 40;
      const itSvg = `
        <g transform="translate(${itemX} ${ry + 8})">
          ${cleanCard({ x: 0, y: 0, w: iw, h: ih, rx: 8, bg: C.bgSubtle, border: C.border, strokeWidth: 1 })}
          ${ic.draw(10, 10, 20)}
          ${t.text(ic.title, { x: 38, y: 25, size: 12.5, style: 'disp700', fill: C.textMain })}
        </g>
      `;
      itemX += iw + 12;
      return itSvg;
    }).join('');

    return `
      <g>
        <line x1="40" y1="${ry}" x2="${W - 40}" y2="${ry}" stroke="${C.borderSubtle}" stroke-width="1"/>
        ${catSvg}
        ${divider}
        ${itemsSvg}
      </g>
    `;
  }).join('');

  const body = `
    ${bgCard}
    ${titleSvg}
    ${subSvg}
    ${rowsSvg}
  `;

  return svgDoc({
    w: W,
    h: H,
    title: 'Technical Stack',
    desc: 'Production technologies and frameworks',
    body,
    typo: t
  });
}

/** 3. INDIVIDUAL PROJECT CARD (Clean Architectural Blueprint) */
export function projectCard(p, width = 490) {
  const t = new Typo('p');
  const H = 220;

  const bgCard = cleanCard({ x: 0, y: 0, w: width, h: H, rx: 16, bg: '#FFFFFF', border: C.border, strokeWidth: 1.5 });

  const b = badge(t, { x: 28, y: 24, label: p.badge, bg: C.primaryBg, color: C.primary, border: C.primaryBorder, size: 9.5, h: 20, padX: 8 });

  const titleSvg = t.text(p.title, {
    x: 28,
    y: 74,
    size: 20,
    style: 'disp700',
    fill: C.textMain
  });

  const lines = wrap(t, p.summary, { size: 13, style: 'disp500', maxW: width - 56 });
  const descSvg = lines.map((l, i) => t.text(l, { x: 28, y: 100 + i * 19, size: 13, style: 'disp500', fill: C.textMuted })).join('');

  // Metrics line
  const metricSvg = t.text(`• ${p.metrics}`, {
    x: 28,
    y: 154,
    size: 11.5,
    style: 'mono700',
    fill: C.emerald
  });

  // Tech stack pills at bottom
  let tx = 28;
  const tagsSvg = p.tech.map((tech) => {
    const tb = badge(t, { x: tx, y: H - 38, label: tech.toUpperCase(), bg: C.bgSubtle, color: C.textDim, border: C.border, size: 9, h: 20, padX: 6 });
    tx += tb.w + 6;
    return tb.svg;
  }).join('');

  const body = `
    ${bgCard}
    ${b.svg}
    ${titleSvg}
    ${descSvg}
    ${metricSvg}
    ${tagsSvg}
  `;

  return svgDoc({
    w: width,
    h: H,
    title: p.title,
    desc: p.summary,
    body,
    typo: t
  });
}

/** 4. FOOTER / CONTACT BAR */
export function contactBar(cfg) {
  const t = new Typo('c');
  const H = 84;

  const bgCard = cleanCard({ x: 0, y: 0, w: W, h: H, rx: 14, bg: '#FFFFFF', border: C.border, strokeWidth: 1.5 });

  const titleSvg = t.text('LET’S CONNECT & BUILD', {
    x: 36,
    y: 38,
    size: 13,
    style: 'mono700',
    fill: C.textMain,
    ls: 1
  });

  const subSvg = t.text('Open for backend engineering discussions, system design, and collaborative builds.', {
    x: 36,
    y: 58,
    size: 12.5,
    style: 'disp500',
    fill: C.textMuted
  });

  const emailBadge = badge(t, {
    x: W - 36 - 220,
    y: 28,
    label: cfg.links.email,
    bg: C.primaryBg,
    color: C.primary,
    border: C.primaryBorder,
    size: 11,
    h: 28,
    padX: 12,
    dot: true
  });

  const body = `
    ${bgCard}
    ${titleSvg}
    ${subSvg}
    ${emailBadge.svg}
  `;

  return svgDoc({
    w: W,
    h: H,
    title: 'Contact',
    desc: 'Reach out to Muhammad Affif',
    body,
    typo: t
  });
}
