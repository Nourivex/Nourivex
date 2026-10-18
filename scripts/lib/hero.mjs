// HERO — identity top-left, the system terminal along the bottom, and Lumi
// sitting on the terminal's edge. The terminal boots, she drops in, the system
// runs a liveness check on her, she blinks, it passes. Then everything rests.
import { Typo } from './text.mjs';
import { C, svgDoc, gridPattern, frame } from './theme.mjs';
import { lumiPixel, lumiPixelCss, LEDGE, FACE_BOX } from './pixel-lumi.mjs';

const W = 1000;
const H = 540;
const PX = 6;
// terminal panel
const TX = 40, TY = 338, TW = 920, TH = 178;
// Lumi sits on the terminal's top edge
const LX = 690, LY = TY - LEDGE * PX;

const css = `
@keyframes drop{0%{opacity:0;transform:translateY(-36px)}60%{opacity:1;transform:translateY(0)}75%{transform:translateY(-6px)}100%{opacity:1;transform:translateY(0)}}
@keyframes out{to{opacity:0}}
@keyframes boxIn{from{opacity:0;transform:scale(1.25)}to{opacity:1;transform:scale(1)}}
.fbox{transform-box:fill-box;transform-origin:center}
`;

function typed(t, id, text, { x, y, size = 14, style = 'mono400', fill = C.text, begin = 0, cps = 90 }) {
  const cw = (size * 600) / 1000;
  const n = [...text].length;
  const vals = Array.from({ length: n + 1 }, (_, i) => +(i * cw).toFixed(1));
  vals[n] = 900;
  const dur = Math.max(0.12, n / cps);
  return {
    clip: `<clipPath id="${id}"><rect x="${x - 2}" y="${y - size}" height="${size * 1.5}" width="0"><animate attributeName="width" values="${vals.join(';')}" calcMode="discrete" dur="${dur.toFixed(2)}s" begin="${begin}s" fill="freeze"/></rect></clipPath>`,
    svg: `<g clip-path="url(#${id})">${t.text(text, { x, y, size, style, fill })}</g>`,
    end: begin + dur,
  };
}

export function buildHero(cfg, { mode = 'day', level = null } = {}) {
  const night = mode === 'night';
  const t = new Typo('h');
  const clips = [];
  const user = cfg.name.toLowerCase();

  // ---------- terminal lines ----------
  const lx = TX + 28, ly0 = TY + 62, lh = 21;
  const L = [
    { p: '$', pc: C.cyan, s: `boot lumen --user ${user}`, c: C.text },
    { p: '[ ok ]', pc: C.green, s: 'kernel ........ full-stack', c: C.muted },
    { p: '[ ok ]', pc: C.green, s: `quests ........ ${cfg.projects.length} loaded${level ? ` · player lv ${level}` : ''}`, c: C.muted },
    { p: '[ ok ]', pc: C.green, s: 'stack ......... next.js · fastapi · opencv', c: C.muted },
    night
      ? { p: '[ zz ]', pc: C.amber, s: 'companion ..... asleep, LED amber', c: C.muted }
      : { p: '[ ok ]', pc: C.green, s: 'companion ..... online', c: C.muted },
  ];
  let tt = 0.2;
  const lines = L.map((r, i) => {
    const y = ly0 + i * lh;
    const pw = t.measure(r.p, { style: 'mono700', size: 14 });
    const a = typed(t, `hl${i}`, r.s, { x: lx + pw + 10, y, begin: tt + 0.06, fill: r.c, cps: i ? 140 : 60 });
    clips.push(a.clip);
    const row = `<g class="a" style="animation:fadeIn .01s ${tt.toFixed(2)}s both">${t.text(r.p, { x: lx, y, size: 14, style: 'mono700', fill: r.pc })}</g>${a.svg}`;
    tt = a.end + 0.03;
    return row;
  }).join('');

  const spawnAt = tt + 0.15; // she drops in once the companion line prints
  const checkAt = spawnAt + 0.75; // face box locks on
  const blinkAt = checkAt + 0.7; // she blinks → liveness passes
  const blinkDur = 5.2;
  const blinkDelay = +(blinkAt - 0.94 * blinkDur).toFixed(2); // pxBlink closes at 94%

  // liveness line (last row)
  const yL = ly0 + 5 * lh;
  const pw = t.measure('[ .. ]', { style: 'mono700', size: 14 });
  const liveness = night
    ? `<g class="a" style="animation:fadeIn .01s ${checkAt}s both">${t.text('[ -- ]', { x: lx, y: yL, size: 14, style: 'mono700', fill: C.dim })}${t.text('liveness ...... paused while she sleeps', { x: lx + pw + 10, y: yL, size: 14, fill: C.dim })}</g>`
    : `<g class="a" style="animation:fadeIn .01s ${checkAt}s both,out .01s ${blinkAt + 0.1}s forwards">${t.text('[ .. ]', { x: lx, y: yL, size: 14, style: 'mono700', fill: C.amber })}${t.text('liveness ...... waiting for a blink', { x: lx + pw + 10, y: yL, size: 14, fill: C.muted })}</g>
<g class="a" style="animation:fadeIn .01s ${blinkAt + 0.1}s both">${t.text('[ ok ]', { x: lx, y: yL, size: 14, style: 'mono700', fill: C.green })}${t.text('liveness ...... blink detected — she is real', { x: lx + pw + 10, y: yL, size: 14, fill: C.text })}</g>`;

  const panel = `
<rect x="${TX}" y="${TY}" width="${TW}" height="${TH}" rx="12" fill="${C.panel}" stroke="${C.line2}" stroke-width="1.5"/>
<path d="M${TX} ${TY + 34}H${TX + TW}" stroke="${C.line}"/>
${t.text('boot.log', { x: TX + 28, y: TY + 22, size: 13, style: 'mono500', fill: C.dim })}
<g class="a" style="animation:fadeIn .2s ${spawnAt}s both">${t.text(night ? '◐ IDLE' : '● READY', { x: TX + 28 + t.measure('boot.log', { style: 'mono500', size: 13 }) + 16, y: TY + 22, size: 12, style: 'mono700', fill: night ? C.amber : C.green, ls: 1.5 })}</g>
${lines}
${liveness}`;

  // ---------- Lumi ----------
  const fb = { x: LX + FACE_BOX.x * PX, y: LY + FACE_BOX.y * PX, w: FACE_BOX.w * PX, h: FACE_BOX.h * PX };
  const corner = 16;
  const box = (col) => `<g stroke="${col}" stroke-width="3" fill="none" stroke-linecap="square">
<path d="M${fb.x} ${fb.y + corner}V${fb.y}H${fb.x + corner}"/><path d="M${fb.x + fb.w - corner} ${fb.y}H${fb.x + fb.w}V${fb.y + corner}"/>
<path d="M${fb.x + fb.w} ${fb.y + fb.h - corner}V${fb.y + fb.h}H${fb.x + fb.w - corner}"/><path d="M${fb.x + corner} ${fb.y + fb.h}H${fb.x}V${fb.y + fb.h - corner}"/></g>`;
  const faceCheck = night ? '' : `
<g class="a" style="animation:fadeIn .01s ${checkAt}s both,out .3s ${blinkAt + 1.2}s forwards">
  <g class="a fbox" style="animation:boxIn .25s steps(3) ${checkAt}s both">${box(C.amber)}</g>
  <g class="a" style="animation:fadeIn .01s ${blinkAt + 0.1}s both">${box(C.green)}</g>
</g>`;

  const lumi = `<g class="a" style="animation:drop .5s steps(5) ${spawnAt}s both"><g transform="translate(${LX} ${LY})">${lumiPixel({ px: PX, mode, blinkDelay, blinkDur })}</g></g>${faceCheck}`;

  // ---------- identity ----------
  const nameAt = 0.35; // identity first: it is what a visitor reads in the first second
  const name = cfg.name.toUpperCase();
  const nameY = 214;
  const tag = night ? `${user} is probably asleep — leave a message` : cfg.tagline;
  const tg = typed(t, 'htag', `> ${tag}`, { x: 50, y: nameY + 80, size: 17, fill: C.muted, begin: Math.max(nameAt + 0.9, blinkAt + 0.4), cps: 50 });
  clips.push(tg.clip);
  const endX = 50 + [...`> ${tag}`].length * 10.2 + 4;
  const roleW = t.measure(cfg.role, { style: 'disp500', size: 27 });
  const identity = `
<g class="a" style="animation:fadeIn .3s ${nameAt - 0.2}s both">${t.text(night ? '// PLAYER 01 · OFFLINE' : '// PLAYER 01', { x: 50, y: 112, size: 14, style: 'mono700', fill: C.amber, ls: 2.5 })}</g>
<clipPath id="hname"><rect x="40" y="110" height="120" width="0"><animate attributeName="width" values="0;640" dur=".5s" begin="${nameAt}s" fill="freeze" calcMode="spline" keySplines=".2 .7 .2 1"/></rect></clipPath>
<g clip-path="url(#hname)">${t.text(name, { x: 46, y: nameY, size: 104, style: 'disp700', fill: C.text, ls: 2 })}</g>
<g class="a" style="animation:fadeUp .5s ${nameAt + 0.3}s both">
  ${t.text(cfg.role, { x: 50, y: nameY + 44, size: 27, style: 'disp500', fill: C.text })}
  <circle cx="${50 + roleW + 14}" cy="${nameY + 35}" r="3.5" fill="${C.cyan}"/>
  ${t.text(cfg.focus, { x: 50 + roleW + 28, y: nameY + 44, size: 27, style: 'disp500', fill: C.cyan })}
</g>
${tg.svg}
<rect x="${endX}" y="${nameY + 64}" width="10" height="20" fill="${C.cyan}" class="a" style="animation:fadeIn .01s ${tg.end}s both,blinkCursor 1.1s steps(1) ${tg.end}s infinite"/>`;

  const body = `
${frame(t, { w: W, h: H, title: `lumen://${user}`, tag: night ? '◐ COMPANION ASLEEP' : '● COMPANION ONLINE', tagColor: night ? C.amber : C.green, gridId: 'hgrid' })}
${identity}
${panel}
${lumi}`;

  return svgDoc({
    w: W, h: H,
    title: `${cfg.name} — ${cfg.role}`,
    desc: `${cfg.name}, ${cfg.role} focused on ${cfg.focus}. ${cfg.tagline} A boot screen: the terminal starts, the pixel companion Lumi sits on its edge and passes a blink liveness check.`,
    css: css + lumiPixelCss,
    defs: `${gridPattern('hgrid', 28, C.line, 0.35)}${clips.join('')}`,
    body,
    typo: t,
    comment: `  hey — you opened the source. respect.
  L.U.M.I · Liveness & Utility Monitoring Interface
  status : ${night ? 'asleep. the LED on her headphones is amber.' : 'online. watch her headphone LED.'}
  achievement unlocked: SOURCE READER`,
  });
}
