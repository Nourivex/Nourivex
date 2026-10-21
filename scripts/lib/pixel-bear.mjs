// NOURIVEX — the pixel polar-bear companion ("Nouri"). Hand-placed on a 48×64
// grid and outlined automatically.
//
// Signature traits (only three, same design language as the rest of the sheet):
//   1. snow-white fur with cold ice-blue shading,
//   2. a dark cybernetic visor (neon cyan by day, amber while asleep),
//   3. a violet dev-scarf whose tail sways.
//
// The public API mirrors the original character module so hero / sections /
// telemetry keep working without touching their layout code.

const W = 48, H = 64;
export const LEDGE = 43; // row where he sits (the UI edge goes here)
const HY = 2; // head vertical offset inside the grid

export const PAL = {
  o: '#0B1220', // outline (obsidian)
  W: '#FFFFFF', // fur highlight (snow)
  F: '#F8FAFC', // fur base (snow)
  f: '#E2E8F0', // fur shade / muzzle / ear inner (soft pastel)
  s: '#CBD5E1', // fur shade 2 (ice grey)
  d: '#94A3B8', // fur deep shade (cool grey)
  n: '#0F172A', // nose, mouth, visor glass (dark charcoal)
  v: '#1E293B', // visor frame / tech housing
  C: '#5CE1E6', // neon cyan — eye glow, wake state, LED
  A: '#FFC857', // amber — sleep state LED
  P: '#8B5CF6', // violet — dev scarf
  p: '#6D3FE0', // scarf shade
  J: '#22304A', // hoodie
  j: '#17223A', // hoodie shade
  T: '#3B4A66', // inner tee
  t: '#2A3550', // inner tee shade
  G: '#2E3D5C', // trousers
  g: '#1E2A44', // trousers shade
  N: '#E2E8F0', // paws / sneakers
};

const grid = () => Array.from({ length: H }, () => Array(W).fill('.'));
const span = (g, y, x0, x1, c) => { for (let x = x0; x <= x1; x++) if (g[y] && x >= 0 && x < W) g[y][x] = c; };
const pt = (g, x, y, c) => { if (g[y] && x >= 0 && x < W) g[y][x] = c; };
const rows = (g, list, c) => list.forEach(([y, x0, x1]) => span(g, y, x0, x1, c));

/** 1px outline around everything that isn't transparent. */
function outline(g) {
  const out = g.map((r) => r.slice());
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (g[y][x] !== '.') continue;
    const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => g[y + dy]?.[x + dx] && g[y + dy][x + dx] !== '.' && g[y + dy][x + dx] !== 'o');
    if (n) out[y][x] = 'o';
  }
  return out;
}

/* ---------------- body + head (static layer) ---------------- */
function drawBody(g, { pose = 'sit' } = {}) {
  // hoodie — oversized but tapered, arms read separately from the torso
  rows(g, [[23, 14, 31], [24, 11, 34], [25, 10, 35]], 'J');
  for (let y = 26; y <= 31; y++) span(g, y, 11, 34, 'J');
  for (let y = 32; y <= 39; y++) span(g, y, 12, 33, 'J');
  // open front + inner tee
  for (let y = 23; y <= 39; y++) span(g, y, 20, 25, 'T');
  for (let y = 25; y <= 39; y++) pt(g, 20, y, 't');
  for (let y = 23; y <= 39; y++) { pt(g, 19, y, 'j'); pt(g, 26, y, 'j'); }
  for (let y = 30; y <= 38; y++) { pt(g, 15, y, 'j'); pt(g, 30, y, 'j'); }
  span(g, 39, 12, 18, 'j'); span(g, 39, 27, 33, 'j');
  // hoodie drawstrings, tipped with a tiny neon bead
  span(g, 27, 22, 23, 'j'); span(g, 33, 22, 23, 'j');
  pt(g, 22, 28, 'C'); pt(g, 23, 34, 'C');
  // sleeves: shoulder → paws planted on the ledge, swallowing the paws
  const left = [[26, 8, 12], [27, 8, 12], [28, 7, 12], [29, 7, 11], [30, 6, 11], [31, 6, 10], [32, 5, 10], [33, 5, 10], [34, 5, 9], [35, 4, 9], [36, 4, 9], [37, 4, 9], [38, 3, 8], [39, 3, 8], [40, 3, 8], [41, 3, 8]];
  const right = left.map(([y, a, b]) => [y, 45 - b, 45 - a]);
  rows(g, left, 'J');
  for (const [y, a] of left) pt(g, a, y, 'j');
  span(g, 41, 3, 8, 'j'); span(g, 42, 4, 6, 'N');
  if (pose !== 'wave') {
    rows(g, right, 'J');
    for (const [y, , b] of right) pt(g, b, y, 'j');
    span(g, 41, 37, 42, 'j'); span(g, 42, 39, 41, 'N');
  }
  // trousers / lap
  for (let y = 40; y <= 42; y++) span(g, y, 12, 33, 'G');
  span(g, 42, 22, 23, 'g'); pt(g, 22, 41, 'g');
}

/** The violet dev-scarf collar (static) — wraps the neck between head and body. */
function drawScarf(g) {
  span(g, 20, 16, 31, 'P');
  span(g, 21, 15, 32, 'P');
  span(g, 22, 15, 32, 'p');
  span(g, 23, 17, 30, 'p');
  pt(g, 15, 21, 'p'); pt(g, 32, 21, 'p');
}

function drawHead(g, { tilt = 0 } = {}) {
  const t = tilt, Y = (y) => y + HY + (t ? 1 : 0), X = (x) => x + t;
  const sp = (y, a, b, c) => span(g, Y(y), X(a), X(b), c);
  const p = (x, y, c) => pt(g, X(x), Y(y), c);

  /* ears — two round bumps on an otherwise continuous crown */
  sp(0, 12, 16, 'F'); sp(0, 31, 35, 'F');
  sp(0, 13, 15, 'f'); sp(0, 32, 34, 'f'); // inner ear
  sp(1, 11, 36, 'F');
  sp(2, 10, 37, 'F');

  /* head mass — wide and round, generous forehead */
  for (let y = 3; y <= 15; y++) sp(y, 9, 38, 'F');
  /* jaw — tapers back in toward the scarf */
  sp(16, 10, 37, 'F');
  sp(17, 12, 35, 'F');

  /* ice-cold shading: light upper-right, cold shadow lower-left */
  for (let y = 4; y <= 16; y++) { p(9, y, 's'); p(10, y, 'f'); }
  for (let y = 4; y <= 14; y++) p(38, y, 'f');
  sp(16, 10, 16, 's'); p(10, 16, 'd');
  sp(17, 12, 18, 's'); p(12, 17, 'd'); p(13, 17, 'd'); p(14, 17, 'd');
  sp(17, 30, 35, 'f');
  /* crown sheen, broken band like the old bob highlight */
  sp(1, 20, 30, 'W'); sp(2, 22, 33, 'W'); sp(3, 25, 35, 'W'); sp(4, 28, 36, 'W');

  /* muzzle — soft pastel patch under the visor */
  sp(12, 18, 29, 'f'); sp(13, 17, 30, 'f'); sp(14, 17, 30, 'f'); sp(15, 18, 29, 'f');
  for (let y = 13; y <= 14; y++) p(17, y, 's');
  p(30, 13, 'W'); p(30, 14, 'W');
  /* nose */
  sp(12, 21, 26, 'n'); sp(13, 22, 25, 'n');

  /* cybernetic visor — dark glass with a wrap-around frame */
  sp(8, 13, 34, 'v');
  sp(9, 11, 36, 'n'); sp(10, 11, 36, 'n'); sp(11, 14, 33, 'v');
  p(11, 9, 'C'); p(11, 10, 'C'); p(36, 9, 'v'); p(36, 10, 'v');
  /* visor glass reflection glints — subtle highlight for depth */
  p(15, 9, 'W'); p(16, 9, 'W');
}

/* ---------------- animated layers ---------------- */
// Eye glints inside the visor: [x0, x1] inclusive.
const EYES = [{ x0: 17, x1: 19 }, { x0: 29, x1: 31 }];
function drawEyes(g, state, t = 0) {
  const Y = (y) => y + HY + (t ? 1 : 0), X = (x) => x + t;
  for (const { x0, x1 } of EYES) {
    if (state === 'closed') {
      // sleeping arc ︶ — ends up, middle down
      pt(g, X(x0), Y(9), 'C'); pt(g, X(x1), Y(9), 'C');
      span(g, Y(10), X(x0 + 1), X(x1 - 1), 'C');
    } else if (state === 'blink') {
      span(g, Y(9), X(x0), X(x1), 'C');
    } else {
      span(g, Y(9), X(x0), X(x1), 'C');
      span(g, Y(10), X(x0), X(x1), 'C');
      pt(g, X(x0 + 1), Y(9), 'W'); // glint
    }
  }
}

function drawMouth(g, mood, t = 0) {
  const Y = (y) => y + HY + (t ? 1 : 0), X = (x) => x + t;
  if (mood === 'smirk') { pt(g, X(21), Y(14), 'n'); span(g, Y(15), X(22), X(24), 'n'); pt(g, X(25), Y(14), 'n'); }
  else if (mood === 'sleep') { pt(g, X(23), Y(15), 'n'); pt(g, X(24), Y(15), 'n'); }
  else if (mood === 'open') { span(g, Y(15), X(22), X(25), 'n'); pt(g, X(23), Y(16), 'n'); pt(g, X(24), Y(16), 'n'); }
}

/** The dev-scarf tail. `sway` 0/1 shifts the tip one pixel. */
function drawScarfTail(g, sway = 0, t = 0) {
  const Y = (y) => y + (t ? 1 : 0), X = (x) => x + t;
  for (let y = 22; y <= 31; y++) span(g, Y(y), X(32), X(35), 'P');
  span(g, Y(32), X(32 + sway), X(35 + sway), 'P');
  span(g, Y(33), X(33 + sway), X(35 + sway), 'P'); pt(g, X(34 + sway), Y(34), 'P');
  for (let y = 23; y <= 32; y++) pt(g, X(32 + (y > 31 ? sway : 0)), Y(y), 'p');
  pt(g, X(35), Y(24), 'p'); pt(g, X(35), Y(25), 'p');
  pt(g, X(33), Y(34), 'p'); pt(g, X(35), Y(34), 'p');
}

/** Dangling legs. frame: 0 both down, 1 left kicks, 2 right kicks. */
function drawLegs(g, frame = 0) {
  const leg = (x0, kick) => {
    const top = LEDGE, len = kick ? 8 : 10;
    span(g, top, x0 - 1, x0 + 5, 'G');
    for (let y = top + 1; y <= top + len; y++) span(g, y, x0, x0 + 4, 'G');
    for (let y = top + 1; y <= top + len; y++) pt(g, x0 + 1, y, 'g');
    const sy = top + len + 1, sw = kick ? 1 : 0;
    span(g, sy, x0 - 1 - sw, x0 + 5 + sw, 'N'); span(g, sy + 1, x0 - 2 - sw, x0 + 5 + sw, 'N');
    span(g, sy + 2, x0 - 2 - sw, x0 + 5 + sw, 'N'); span(g, sy + 3, x0 - 2 - sw, x0 + 5 + sw, 'f');
    pt(g, x0 + 1, sy, 'f'); pt(g, x0 + 3, sy, 'f');
  };
  leg(15, frame === 1);
  leg(26, frame === 2);
}

/** Raised waving paw (save point). frame 0/1 tilts the paw. */
function drawWave(g, frame = 0) {
  const arm = [[14, 40, 44], [15, 40, 44], [16, 39, 43], [17, 39, 43], [18, 38, 43], [19, 38, 42], [20, 37, 42], [21, 37, 41], [22, 36, 41], [23, 35, 40], [24, 34, 39], [25, 34, 38], [26, 34, 37]];
  rows(g, arm, 'J');
  for (const [y, a] of arm) pt(g, a, y, 'j');
  span(g, 14, 40, 44, 'j');
  const hx = frame ? 43 : 42;
  rows(g, [[11, hx - 1, hx + 1], [12, hx - 2, hx + 1], [13, hx - 2, hx + 1]], 'N');
  pt(g, hx + 1, 10, 'N');
}

/* ---------------- frames → SVG ---------------- */
function toRects(g, px, ox = 0, oy = 0) {
  let s = '';
  for (let y = 0; y < H; y++) {
    let x = 0;
    while (x < W) {
      const c = g[y][x];
      if (c === '.') { x++; continue; }
      let x2 = x;
      while (x2 + 1 < W && g[y][x2 + 1] === c) x2++;
      s += `<rect x="${ox + x * px}" y="${oy + y * px}" width="${(x2 - x + 1) * px}" height="${px}" fill="${PAL[c]}"/>`;
      x = x2 + 1;
    }
  }
  return s;
}

export const bearPixelCss = `
@keyframes pxA{0%,24.9%{opacity:1}25%,100%{opacity:0}}
@keyframes pxB{0%,24.9%{opacity:0}25%,49.9%{opacity:1}50%,100%{opacity:0}}
@keyframes pxC{0%,49.9%{opacity:0}50%,74.9%{opacity:1}75%,100%{opacity:0}}
@keyframes pxD{0%,74.9%{opacity:0}75%,100%{opacity:1}}
@keyframes pxBlinkOpen{0%,93.9%{opacity:1}94%,97.9%{opacity:0}98%,100%{opacity:1}}
@keyframes pxBlinkShut{0%,93.9%{opacity:0}94%,97.9%{opacity:1}98%,100%{opacity:0}}
@keyframes pxHalf1{0%,49.9%{opacity:1}50%,100%{opacity:0}}
@keyframes pxHalf2{0%,49.9%{opacity:0}50%,100%{opacity:1}}
@keyframes pxLed{0%,70%{opacity:1}71%,100%{opacity:.25}}
@keyframes pxZ{0%{opacity:0;transform:translate(0,0)}20%{opacity:1}100%{opacity:0;transform:translate(12px,-40px)}}
@keyframes pxFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
.nouri-interactive{cursor:pointer;transition:transform .15s ease}
.nouri-interactive:hover{animation:nouriStartle .3s steps(2) 1!important}
@keyframes nouriStartle{0%{transform:translateY(0) scale(1)}50%{transform:translateY(-6px) scale(1.05)}100%{transform:translateY(0) scale(1)}}
`;

/**
 * Full character as an SVG group at pixel size `px`.
 * mode: 'day' | 'night'; pose: 'sit' | 'wave'; crop: 'head' keeps only the head (peeking).
 * blinkDelay lets the hero sync the first blink with the liveness check.
 * mood: 'chill' | 'alert' | 'sleep'
 * battery: 0..1 (energy level)
 */
export function bearPixel({ px = 6, mode = 'day', pose = 'sit', blinkDelay = 0, blinkDur = 5.2, swing = true, crop = null, mood = 'chill', battery = 1 } = {}) {
  const night = mode === 'night';
  const isAlert = mood === 'alert';
  const t = night ? 1 : 0;
  const base = grid();
  drawBody(base, { pose });
  drawHead(base, { tilt: t });
  drawScarf(base);
  const baseOut = outline(base);

  const layer = (fn, withOutline = true) => { const g = grid(); fn(g); return withOutline ? outline(g) : g; };
  const keepRows = crop === 'head' ? (y) => y <= 22 : () => true;
  const R = (g) => toRects(g.map((r, y) => (keepRows(y) ? r : r.map(() => '.'))), px);

  const face = (state, moodVal) => layer((g) => { drawEyes(g, state, t); drawMouth(g, moodVal, t); }, false);

  let legs = '';
  if (crop !== 'head') {
    if (night || !swing) legs = R(layer((g) => drawLegs(g, 0)));
    else {
      const f = [0, 1, 0, 2].map((fr) => R(layer((g) => drawLegs(g, fr))));
      legs = ['pxA', 'pxB', 'pxC', 'pxD'].map((k, i) => `<g style="animation:${k} 2.8s steps(1) infinite">${f[i]}</g>`).join('');
    }
  }

  const visorColor = night ? PAL.A : (isAlert ? PAL.A : PAL.C);

  const eyes = night
    ? R(face('closed', 'sleep'))
    : `<g style="animation:pxBlinkOpen ${blinkDur}s steps(1) ${blinkDelay}s infinite">${R(face('open', isAlert ? 'open' : 'smirk'))}</g>` +
      `<g style="animation:pxBlinkShut ${blinkDur}s steps(1) ${blinkDelay}s infinite;opacity:0">${R(face('blink', isAlert ? 'open' : 'smirk'))}</g>`;

  // the scarf tail's own outline must not cut into the collar it grows from
  const tailLayer = (sw) => layer((g) => drawScarfTail(g, sw, t)).map((r, y) => (y <= 22 + t ? r.map((c) => (c === 'o' ? '.' : c)) : r));
  const tail0 = R(tailLayer(0));
  const tail = night || crop === 'head'
    ? tail0
    : `<g style="animation:pxHalf1 3.6s steps(1) infinite">${tail0}</g><g style="animation:pxHalf2 3.6s steps(1) infinite">${R(tailLayer(1))}</g>`;

  let wave = '';
  if (pose === 'wave') {
    wave = `<g style="animation:pxHalf1 .9s steps(1) infinite">${R(layer((g) => drawWave(g, 0)))}</g>` +
      `<g style="animation:pxHalf2 .9s steps(1) infinite">${R(layer((g) => drawWave(g, 1)))}</g>`;
  }

  // status LED on the visor temple: amber when asleep or alert, cyan when chill
  const led = `<rect x="${(36 + t) * px}" y="${(9 + HY + t) * px}" width="${px}" height="${px}" fill="${visorColor}" style="animation:pxLed 2.4s steps(1) infinite"/>`;
  const ledRing = `<circle cx="${(36 + t) * px + px / 2}" cy="${(9 + HY + t) * px + px / 2}" r="${px * 2}" fill="none" stroke="${visorColor}" stroke-width="${px * 0.4}" opacity="0.3" style="animation:pxLed 2.4s steps(1) infinite"/>`;

  // Battery / Energy bar indicator beside Nouri (when not cropped or waving)
  let battSvg = '';
  if (crop !== 'head' && pose !== 'wave') {
    const bx = -14, by = 18;
    const bh = 24, bw = 6;
    const filledH = Math.max(2, Math.round((bh - 4) * Math.min(1, Math.max(0.1, battery))));
    const bColor = battery > 0.5 ? PAL.C : battery > 0.25 ? PAL.A : '#FF5F6D';
    battSvg = `
    <g transform="translate(${bx} ${by})" opacity="0.75">
      <rect x="1" y="-2" width="4" height="2" fill="${PAL.v}"/>
      <rect x="0" y="0" width="${bw}" height="${bh}" rx="2" fill="${PAL.o}" stroke="${PAL.v}" stroke-width="1"/>
      <rect x="1" y="${bh - 2 - filledH}" width="${bw - 2}" height="${filledH}" fill="${bColor}"/>
    </g>`;
  }

  const z = night
    ? [0, 1.4, 2.8, 4.2].map((d, i) => `<g style="animation:pxZ 3.6s linear ${d}s infinite;opacity:0"><path d="M${41 * px} ${(5 - i * 2) * px}h${i === 1 ? 3 * px : 2 * px}l-${i === 1 ? 3 * px : 2 * px} ${2 * px}h${i === 1 ? 3 * px : 2 * px}" stroke="${i === 1 ? PAL.P : PAL.C}" stroke-width="${i === 3 ? px * 0.3 : px * 0.6}" fill="none" stroke-linejoin="round"/></g>`).join('')
    : '';

  const inner = `<g shape-rendering="crispEdges">${battSvg}${R(baseOut)}${legs}${tail}${eyes}${wave}${led}${ledRing}</g>`;
  const floating = pose === 'wave' || crop === 'head' ? `${inner}${z}` : `<g style="animation:pxFloat 4s ease-in-out infinite">${inner}</g>${z}`;
  return `<g class="nouri-interactive">${floating}</g>`;
}

/** Face box in sprite space (for the liveness brackets). */
export const FACE_BOX = { x: 9, y: 8, w: 30, h: 12 };

/* ---------------- tiny game sprite (14×18) ---------------- */
// Same identity at game scale: polar bear, cyber visor, violet scarf.
const TINY = [
  '..oFFooFFoo...',
  '.oFFFooFFFo...',
  '.oFFFFFFFFFFo.',
  '.oFFFFFFFFFFo.',
  '.ofFFFFFFFFfo.',
  '.oFnnnnnnnnFo.',
  '.oFnnnnnnnnFo.',
  '.oFffnnffFFFo.',
  '..oFFFFFFffo..',
  '.oPPPPPPPPPPo.',
  '.oJJTTTTJJJJo.',
  '.oJJTTTTJJJJo.',
  '.oJJJJJJJJJJo.',
  '..oJJJJJJJJo..',
  '..oooooooooo..',
];
const TINY_LEGS = [
  ['...oGGooGGo...', '...oGGooGGo...', '..oNNNooNNNo..'],
  ['..oGGo..oGGo..', '..oGGo..oGGo..', '.oNNNo..oNNNo.'],
];
const tinyRects = (rowList, px, oy = 0) => rowList.flatMap((r, y) => [...r].map((c, x) => (c !== '.' ? `<rect x="${x * px}" y="${(y + oy) * px}" width="${px}" height="${px}" fill="${PAL[c]}"/>` : ''))).join('');
export const tinyCss = `@keyframes tLegA{0%,49.9%{opacity:1}50%,100%{opacity:0}}@keyframes tLegB{0%,49.9%{opacity:0}50%,100%{opacity:1}}`;
export function bearTiny(px = 3, { run = true } = {}) {
  const legs = run
    ? `<g style="animation:tLegA .32s steps(1) infinite">${tinyRects(TINY_LEGS[0], px, TINY.length)}</g><g style="animation:tLegB .32s steps(1) infinite">${tinyRects(TINY_LEGS[1], px, TINY.length)}</g>`
    : tinyRects(TINY_LEGS[0], px, TINY.length);
  return `<g shape-rendering="crispEdges">${tinyRects(TINY, px)}${legs}</g>`;
}
export const TINY_SIZE = { w: 14, h: TINY.length + 3 };

/** Debug: ASCII dump of the default frame. */
export function dump(mode = 'day') {
  const t = mode === 'night' ? 1 : 0;
  const g = grid(); drawBody(g); drawHead(g, { tilt: t }); drawScarf(g);
  const o = outline(g); drawEyes(o, t ? 'closed' : 'open', t); drawMouth(o, t ? 'sleep' : 'smirk', t);
  const l = outline((() => { const x = grid(); drawLegs(x, 0); drawScarfTail(x, 0, t); return x; })());
  return o.map((r, y) => r.map((c, x) => (l[y][x] !== '.' ? l[y][x] : c)).join('')).join('\n');
}
