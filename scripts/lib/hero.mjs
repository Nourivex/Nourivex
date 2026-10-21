// HERO — identity top-left, the system terminal along the bottom, and Nouri
// (the polar-bear companion) sitting on the terminal's edge. The terminal boots,
// he drops in, the system runs a liveness check on him, he blinks, it passes.
// Then everything rests.
import { Typo } from './text.mjs';
import { C, svgDoc, gridPattern, frame } from './theme.mjs';
import { bearPixel, bearPixelCss, LEDGE, FACE_BOX } from './pixel-bear.mjs';

const W = 1000;
const H = 540;
const PX = 6;
// terminal panel
const TX = 40, TY = 338, TW = 920, TH = 178;
// Nouri sits on the terminal's top edge
const LX = 690, LY = TY - LEDGE * PX;

const css = `
@keyframes drop{0%{opacity:0;transform:translateY(-36px)}60%{opacity:1;transform:translateY(0)}75%{transform:translateY(-6px)}100%{opacity:1;transform:translateY(0)}}
@keyframes out{to{opacity:0}}
@keyframes boxIn{from{opacity:0;transform:scale(1.25)}to{opacity:1;transform:scale(1)}}
.fbox{transform-box:fill-box;transform-origin:center}
@keyframes dust{0%{transform:translateY(0) scale(0.8);opacity:0.6}50%{transform:translateY(-8px) scale(1.2);opacity:0.3}100%{transform:translateY(-16px) scale(0.6);opacity:0}}
.p-dust{animation:dust 4s ease-in-out infinite}
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

export function buildHero(cfg, { mode = 'day', level = null, mood = 'chill', battery = 1, uptimeDays = 0, uptimeHours = 0 } = {}) {
  const night = mode === 'night';
  const t = new Typo('h');
  const clips = [];
  const user = cfg.username.toLowerCase();

  // ---------- terminal lines ----------
  const lx = TX + 28, ly0 = TY + 62, lh = 21;
  const uptimeStr = `${uptimeDays}d ${uptimeHours}h`;
  const L = [
    { p: '$', pc: C.cyan, s: `boot nourivex --user ${user} --env production`, c: C.text },
    { p: '[ ok ]', pc: C.green, s: `kernel ........ backend · cloud · uptime ${uptimeStr}`, c: C.muted },
    { p: '[ ok ]', pc: C.green, s: `quests ........ ${cfg.projects.length} active${level ? ` · xp unlocked lv ${level}` : ''}`, c: C.muted },
    { p: '[ ok ]', pc: C.green, s: 'stack ......... go · node · postgres · docker · ready', c: C.muted },
    night
      ? { p: '[ zz ]', pc: C.amber, s: 'companion ..... offline · will resume at 06:00 UTC+7', c: C.muted }
      : { p: mood === 'alert' ? '[ !! ]' : '[ ok ]', pc: mood === 'alert' ? C.amber : C.green, s: mood === 'alert' ? 'companion ..... ALERT · high workload detected' : 'companion ..... nouri is online · liveness ok', c: C.muted },
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

  const spawnAt = tt + 0.15; // the bear drops in once the companion line prints
  const checkAt = spawnAt + 0.75; // face box locks on
  const blinkAt = checkAt + 0.7; // he blinks → liveness passes
  const blinkDur = 5.2;
  const blinkDelay = +(blinkAt - 0.94 * blinkDur).toFixed(2); // pxBlink closes at 94%

  // liveness line (last row)
  const yL = ly0 + 5 * lh;
  const pw = t.measure('[ .. ]', { style: 'mono700', size: 14 });
  const liveness = night
    ? `<g class="a" style="animation:fadeIn .01s ${checkAt}s both">${t.text('[ -- ]', { x: lx, y: yL, size: 14, style: 'mono700', fill: C.dim })}${t.text('liveness ...... paused while he sleeps', { x: lx + pw + 10, y: yL, size: 14, fill: C.dim })}</g>`
    : `<g class="a" style="animation:fadeIn .01s ${checkAt}s both,out .01s ${blinkAt + 0.1}s forwards">${t.text('[ .. ]', { x: lx, y: yL, size: 14, style: 'mono700', fill: C.amber })}${t.text('liveness ...... waiting for a blink', { x: lx + pw + 10, y: yL, size: 14, fill: C.muted })}</g>
<g class="a" style="animation:fadeIn .01s ${blinkAt + 0.1}s both">${t.text('[ ok ]', { x: lx, y: yL, size: 14, style: 'mono700', fill: C.green })}${t.text('liveness ...... blink detected — he is real', { x: lx + pw + 10, y: yL, size: 14, fill: C.text })}</g>
<g class="a" style="animation:fadeIn .01s ${(blinkAt + 0.4).toFixed(2)}s both">${t.text('guest@nourivex:~$', { x: lx, y: yL + lh, size: 13, style: 'mono700', fill: C.cyan })}${t.text('▋', { x: lx + t.measure('guest@nourivex:~$ ', { style: 'mono700', size: 13 }), y: yL + lh, size: 13, style: 'mono700', fill: C.green, attrs: 'class="a" style="animation:blinkCursor 1s steps(1) infinite"' })}</g>`;

  // progress bar: fills from 0 to 100% across the duration of all lines printing
  const pbDur = (tt + 0.2).toFixed(2); // total boot duration
  const pbX2 = TX + TW - 28 - 120; // 120px wide bar
  const pbY2 = TY + 15;
  const progressBar = `<rect x="${pbX2}" y="${pbY2}" width="120" height="6" rx="3" fill="${C.panel2}"/><rect x="${pbX2}" y="${pbY2}" width="0" height="6" rx="3" fill="${C.green}"><animate attributeName="width" from="0" to="120" dur="${pbDur}s" begin="0.2s" fill="freeze" calcMode="spline" keySplines=".2 .7 .2 1"/></rect>`;

  const panel = `
<rect x="${TX}" y="${TY}" width="${TW}" height="${TH}" rx="12" fill="${C.panel}" stroke="${C.line2}" stroke-width="1.5"/>
<path d="M${TX} ${TY + 34}H${TX + TW}" stroke="${C.line}"/>
${t.text('boot.log', { x: TX + 28, y: TY + 22, size: 13, style: 'mono500', fill: C.dim })}
<g class="a" style="animation:fadeIn .2s ${spawnAt}s both">${t.text(night ? '◐ IDLE' : '● READY', { x: TX + 28 + t.measure('boot.log', { style: 'mono500', size: 13 }) + 16, y: TY + 22, size: 12, style: 'mono700', fill: night ? C.amber : C.green, ls: 1.5 })}</g>
${progressBar}
${lines}
${liveness}`;

  // ---------- Nouri (polar bear) ----------
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

  const bear = `<g class="a" style="animation:drop .5s steps(5) ${spawnAt}s both"><g transform="translate(${LX} ${LY})">${bearPixel({ px: PX, mode, blinkDelay, blinkDur, mood, battery })}</g></g>${faceCheck}`;

  // ---------- identity ----------
  const nameAt = 0.35; // identity first: it is what a visitor reads in the first second
  const name = cfg.name.toUpperCase();
  const nameY = 204;
  // Nouri occupies the right of the frame from LX, so the identity must clear him
  const nameMaxW = LX - 46 - 30;
  let nameSize = 92;
  while (nameSize > 40 && t.measure(name, { style: 'disp700', size: nameSize, ls: 2 }) > nameMaxW) nameSize -= 2;
  const nameW = t.measure(name, { style: 'disp700', size: nameSize, ls: 2 });
  const tag = night ? `${user} is probably offline, leave a message` : cfg.tagline;
  const roleY = nameY + 42;
  const roleW = t.measure(cfg.role, { style: 'disp500', size: 26 });
  const focusW = t.measure(cfg.focus, { style: 'disp500', size: 26 });
  // long role + focus share a line only when they genuinely clear the companion
  const oneLine = roleW + 30 + focusW <= LX - 90;
  const focusX = oneLine ? 50 + roleW + 28 : 50;
  const focusY = oneLine ? roleY : roleY + 33;
  const tagY = (oneLine ? roleY : focusY) + 38;
  const tg = typed(t, 'htag', `> ${tag}`, { x: 50, y: tagY, size: 17, fill: C.muted, begin: Math.max(nameAt + 0.9, blinkAt + 0.4), cps: 50 });
  clips.push(tg.clip);
  const endX = 50 + t.measure(`> ${tag}`, { style: 'mono400', size: 17 }) + 6;
  const roleDot = oneLine ? `<circle cx="${50 + roleW + 14}" cy="${roleY - 9}" r="3.5" fill="${C.cyan}"/>` : '';
  // Glitch overlay — 3 frames at the end of the name reveal
  const glitchAt = (nameAt + 0.5).toFixed(2);
  const glitchDur = 0.18;
  const glitch1 = `<g style="animation:fadeIn .01s ${glitchAt}s both,out .01s ${(+glitchAt + glitchDur * 0.33).toFixed(2)}s forwards" opacity="0.6"><g clip-path="url(#hname)"><g transform="translate(3 0)">${t.text(name, { x: 46, y: nameY, size: nameSize, style: 'disp700', fill: C.cyan, ls: 2 })}</g></g></g>`;
  const glitch2 = `<g style="animation:fadeIn .01s ${(+glitchAt + glitchDur * 0.33).toFixed(2)}s both,out .01s ${(+glitchAt + glitchDur * 0.66).toFixed(2)}s forwards" opacity="0.5"><g clip-path="url(#hname)"><g transform="translate(-2 0)">${t.text(name, { x: 46, y: nameY, size: nameSize, style: 'disp700', fill: C.sakura, ls: 2 })}</g></g></g>`;
  const identity = `
<g class="a" style="animation:fadeIn .3s ${nameAt - 0.2}s both">${t.text(night ? '// PLAYER 01 · OFFLINE' : '// PLAYER 01', { x: 50, y: 112, size: 14, style: 'mono700', fill: C.amber, ls: 2.5 })}</g>
<clipPath id="hname"><rect x="40" y="106" height="132" width="0"><animate attributeName="width" values="0;${Math.ceil(nameW) + 24}" dur=".5s" begin="${nameAt}s" fill="freeze" calcMode="spline" keySplines=".2 .7 .2 1"/></rect></clipPath>
${glitch1}
${glitch2}
<g clip-path="url(#hname)">${t.text(name, { x: 46, y: nameY, size: nameSize, style: 'disp700', fill: C.text, ls: 2 })}</g>
<g class="a" style="animation:fadeUp .5s ${nameAt + 0.3}s both">
  ${t.text(cfg.role, { x: 50, y: roleY, size: 26, style: 'disp500', fill: C.text })}
  ${roleDot}
  ${t.text(cfg.focus, { x: focusX, y: focusY, size: 26, style: 'disp500', fill: C.cyan })}
</g>
${tg.svg}
<rect x="${endX}" y="${tagY - 16}" width="10" height="20" fill="${C.cyan}" class="a" style="animation:fadeIn .01s ${tg.end}s both,blinkCursor 1.1s steps(1) ${tg.end}s infinite"/>`;

  const scanlineH = `<rect width="${W}" height="2" fill="${C.cyan}" opacity="0.08" class="fb" style="animation:scanline 6s linear infinite"/>`;
  const particles = `
  <g opacity="0.4">
    <circle cx="120" cy="180" r="1.5" fill="${C.cyan}" class="p-dust" style="animation-delay: 0s"/>
    <circle cx="340" cy="240" r="1.2" fill="${C.sakura}" class="p-dust" style="animation-delay: 1.5s"/>
    <circle cx="580" cy="140" r="1.5" fill="${C.green}" class="p-dust" style="animation-delay: 0.8s"/>
    <circle cx="820" cy="220" r="1" fill="${C.amber}" class="p-dust" style="animation-delay: 2.2s"/>
  </g>`;

  const body = `
${frame(t, { w: W, h: H, title: `nouri://${user}`, tag: night ? '◐ COMPANION ASLEEP' : '● COMPANION ONLINE', tagColor: night ? C.amber : C.green, gridId: 'hgrid' })}
${scanlineH}
${particles}
${identity}
${panel}
${bear}`;

  return svgDoc({
    w: W, h: H,
    title: `${cfg.name} — ${cfg.role}`,
    desc: `${cfg.name}, ${cfg.role} focused on ${cfg.focus}. ${cfg.tagline} A boot screen: the terminal starts, the pixel polar bear Nouri sits on its edge and passes a blink liveness check.`,
    css: css + bearPixelCss,
    defs: `${gridPattern('hgrid', 28, C.line, 0.35)}${clips.join('')}`,
    body,
    typo: t,
    comment: `  hey — you opened the source. respect.
  NOURI · the Nourivex polar bear, a cyber-vanguard companion process
  status : ${night ? 'asleep. the LED on his visor is amber.' : 'online. watch his visor LED.'}
  achievement unlocked: SOURCE READER`,
  });
}
