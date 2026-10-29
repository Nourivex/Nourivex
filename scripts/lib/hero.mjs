// HERO BANNER — Clean, high-impact executive header for a Backend & Cloud Engineer.
import { Typo } from './text.mjs';
import { C, svgDoc, dotGridPattern, cleanCard, badge } from './theme.mjs';
import { nouriMark } from './pixel-bear.mjs';

const W = 1000;
const H = 220;

export function buildHero(cfg) {
  const t = new Typo('h');

  // Background frame
  const bgCard = cleanCard({ x: 0, y: 0, w: W, h: H, rx: 16, bg: '#FFFFFF', border: C.border, strokeWidth: 1.5 });
  const innerDot = `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="15" fill="url(#hdots)"/>`;

  // Status Badge
  const stBadge = badge(t, {
    x: 48,
    y: 36,
    label: 'AVAILABLE FOR COLLABORATION',
    bg: C.emeraldBg,
    color: C.emerald,
    border: C.emeraldBorder,
    size: 10,
    padX: 10,
    h: 22,
    dot: true
  });

  // Location / UTC badge
  const locText = t.text(`Based in ${cfg.location} · UTC+7`, {
    x: 52 + stBadge.w + 14,
    y: 51,
    size: 12,
    style: 'mono500',
    fill: C.textDim
  });

  // Main Name & Role
  const nameY = 104;
  const name = cfg.name;
  const nameSvg = t.text(name, {
    x: 48,
    y: nameY,
    size: 38,
    style: 'disp700',
    fill: C.textMain,
    ls: -0.5
  });

  const roleText = `${cfg.role} · ${cfg.focus}`;
  const roleSvg = t.text(roleText, {
    x: 48,
    y: nameY + 32,
    size: 17,
    style: 'disp500',
    fill: C.primary
  });

  const taglineSvg = t.text(cfg.tagline, {
    x: 48,
    y: nameY + 62,
    size: 14,
    style: 'mono400',
    fill: C.textMuted
  });

  // Top-right Nouri Minimalist Mark
  const markSize = 64;
  const markX = W - 48 - markSize;
  const markY = 36;
  const companionSvg = `
    <g transform="translate(${markX} ${markY})">
      ${nouriMark({ size: markSize, bg: C.bgSubtle, border: C.border })}
    </g>
  `;

  // Website and domain transition info
  const siteText = `WEB: nourivex.tech → nour.web.id (Dec)`;
  const siteBadge = badge(t, {
    x: 0,
    y: 0,
    label: siteText,
    bg: C.primaryBg,
    color: C.primary,
    border: C.primaryBorder,
    size: 9.5,
    h: 24,
    padX: 8,
    dot: true
  });

  // Small specs pill list at the bottom right
  const pillList = ['GO / NODE.JS', 'DISTRIBUTED ARCHITECTURE', 'DOCKER / LINUX'];
  let px = W - 48;
  const pillsSvg = pillList.reverse().map((item) => {
    const b = badge(t, {
      x: 0,
      y: 0,
      label: item,
      bg: C.bgSubtle,
      color: C.textMuted,
      border: C.border,
      size: 10,
      h: 24,
      padX: 8
    });
    px -= b.w + 8;
    return `<g transform="translate(${px} ${H - 46})">${b.svg}</g>`;
  }).join('');

  const siteSvg = `<g transform="translate(${px - siteBadge.w - 8} ${H - 46})">${siteBadge.svg}</g>`;

  const body = `
    ${bgCard}
    ${innerDot}
    ${stBadge.svg}
    ${locText}
    ${nameSvg}
    ${roleSvg}
    ${taglineSvg}
    ${companionSvg}
    ${siteSvg}
    ${pillsSvg}
  `;

  return svgDoc({
    w: W,
    h: H,
    title: `${cfg.name} — ${cfg.role}`,
    desc: `${cfg.name}, ${cfg.role}. ${cfg.tagline}`,
    defs: dotGridPattern('hdots', 18, '#CBD5E1', 0.8),
    body,
    typo: t
  });
}
