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
  W: '#FFFFFF', // fur highlight (snow white)
  F: '#F1F5F9', // fur base (snow cold tint)
  f: '#CBD5E1', // fur shade / muzzle / ear inner
  s: '#94A3B8', // fur shadow (slate)
  d: '#64748B', // fur deep shadow
  n: '#0F172A', // nose, visor glass, dark charcoal
  v: '#1E293B', // visor frame / housing
  C: '#38BDF8', // visor HUD / eye neon (cyan / sky 400)
  c: '#0284C7', // visor sub-glow
  A: '#F59E0B', // amber alert
  P: '#A855F7', // violet dev scarf
  p: '#7E22CE', // scarf dark fold
  J: '#1E293B', // hoodie slate-800
  j: '#0F172A', // hoodie shadow slate-900
  H: '#334155', // hoodie highlight slate-700
  T: '#334155', // inner tee
  t: '#1E293B', // inner tee shadow
  G: '#1E293B', // trousers
  g: '#0F172A', // trousers shadow
  N: '#F8FAFC', // sneaker white
  S: '#0284C7', // sneaker accent / cyan sole trim
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
  // hoodie torso — proportional & tailored streetwear
  rows(g, [[22, 16, 29], [23, 14, 31], [24, 13, 32], [25, 12, 33]], 'J');
  for (let y = 26; y <= 38; y++) span(g, y, 13, 32, 'J');
  
  // hoodie highlights & folds
  for (let y = 24; y <= 37; y++) { pt(g, 13, y, 'H'); pt(g, 32, y, 'j'); }
  span(g, 38, 13, 32, 'j'); // bottom hem

  // inner tee & zip lane
  for (let y = 22; y <= 37; y++) span(g, y, 21, 24, 'T');
  for (let y = 22; y <= 37; y++) { pt(g, 21, y, 't'); pt(g, 24, y, 't'); }
  
  // cyan zipper pull & cyber runner details
  pt(g, 22, 23, 'C');
  pt(g, 23, 27, 'C');
  pt(g, 22, 31, 'c');

  // hoodie pocket pouch
  for (let y = 33; y <= 36; y++) span(g, y, 16, 29, 'j');
  for (let y = 33; y <= 36; y++) span(g, y, 17, 28, 'J');
  span(g, 33, 17, 28, 'H');

  // Arms / Sleeves: hanging naturally, cute cuffs & paws
  const leftArm = [
    [23, 10, 13], [24, 9, 13], [25, 9, 13],
    [26, 8, 12], [27, 8, 12], [28, 8, 12],
    [29, 8, 12], [30, 8, 12], [31, 8, 12],
    [32, 8, 12], [33, 8, 12], [34, 8, 12],
    [35, 8, 12], [36, 8, 12], [37, 8, 12]
  ];
  const rightArm = leftArm.map(([y, a, b]) => [y, 45 - b, 45 - a]);
  
  rows(g, leftArm, 'J');
  for (const [y, a] of leftArm) pt(g, a, y, 'H');
  span(g, 37, 8, 12, 'j'); // cuff ribbing
  // white cute paw resting
  span(g, 38, 8, 11, 'F'); span(g, 39, 8, 11, 'W'); pt(g, 8, 38, 'f');

  if (pose !== 'wave') {
    rows(g, rightArm, 'J');
    for (const [y, , b] of rightArm) pt(g, b, y, 'j');
    span(g, 37, 33, 37, 'j');
    span(g, 38, 34, 37, 'F'); span(g, 39, 34, 37, 'W'); pt(g, 37, 38, 'f');
  }

  // Trousers / Lap (sitting)
  for (let y = 39; y <= 42; y++) span(g, y, 14, 31, 'G');
  span(g, 42, 22, 23, 'g'); pt(g, 22, 41, 'g'); pt(g, 23, 41, 'g');
}

/** The violet dev-scarf collar (static) — voluminous & snug around the neck. */
function drawScarf(g) {
  span(g, 18, 15, 30, 'P');
  span(g, 19, 14, 31, 'P');
  span(g, 20, 13, 32, 'P');
  span(g, 21, 14, 31, 'p');
  span(g, 22, 16, 29, 'p');
  
  // scarf highlights & fold shadow
  span(g, 19, 16, 26, 'W'); // top fabric sheen
  pt(g, 14, 20, 'p'); pt(g, 31, 20, 'p');
}

function drawHead(g, { tilt = 0 } = {}) {
  const t = tilt, Y = (y) => y + HY + (t ? 1 : 0), X = (x) => x + t;
  const sp = (y, a, b, c) => span(g, Y(y), X(a), X(b), c);
  const p = (x, y, c) => pt(g, X(x), Y(y), c);

  /* cute round ears with pinkish/slate soft inner ear */
  // Left ear
  sp(0, 12, 16, 'F');
  sp(1, 11, 17, 'F');
  sp(1, 13, 16, 'f');
  sp(2, 11, 18, 'F');
  sp(2, 13, 16, 's');

  // Right ear
  sp(0, 29, 33, 'F');
  sp(1, 28, 34, 'F');
  sp(1, 29, 32, 'f');
  sp(2, 27, 34, 'F');
  sp(2, 29, 32, 's');

  /* Head mass — rounded skull, cute chubby cheeks */
  sp(2, 15, 30, 'F');
  sp(3, 11, 34, 'F');
  sp(4, 10, 35, 'F');
  sp(5, 9, 36, 'F');
  sp(6, 9, 36, 'F');
  sp(7, 9, 36, 'F');
  sp(8, 9, 36, 'F');
  sp(9, 9, 36, 'F');
  sp(10, 9, 36, 'F');
  sp(11, 9, 36, 'F');
  sp(12, 10, 35, 'F');
  sp(13, 11, 34, 'F');
  sp(14, 12, 33, 'F');
  sp(15, 14, 31, 'F');

  /* Shading & fur highlights: light top-center, soft gradient down */
  sp(3, 16, 29, 'W');
  sp(4, 15, 30, 'W');
  for (let y = 6; y <= 13; y++) { p(9, y, 's'); p(10, y, 'f'); }
  for (let y = 6; y <= 13; y++) { p(36, y, 's'); p(35, y, 'f'); }
  sp(14, 12, 16, 's'); sp(15, 14, 18, 'd');
  sp(14, 29, 33, 's'); sp(15, 27, 31, 'd');

  /* Visor — sleek cyberpunk goggles with dark glass, curved edges */
  sp(6, 12, 33, 'v');
  for (let y = 7; y <= 9; y++) sp(y, 11, 34, 'n');
  sp(10, 12, 33, 'v');
  
  // Visor glass sheen / reflection
  sp(7, 13, 15, 'W');
  sp(8, 14, 15, 'W');
  sp(7, 26, 27, 'c');

  // Visor frame temples & cyber accents
  p(11, 8, 'C'); p(34, 8, 'C');

  /* Muzzle — cute compact rounded snout */
  sp(10, 19, 26, 'f');
  sp(11, 18, 27, 'W');
  sp(12, 18, 27, 'F');
  sp(13, 19, 26, 'f');

  /* Nose — inverted triangle/rounded black nose */
  sp(10, 21, 24, 'n');
  p(22, 11, 'n'); p(23, 11, 'n');

  /* Cute cheek blush/fur warmth */
  p(12, 11, 'f'); p(13, 11, 's');
  p(32, 11, 'f'); p(33, 11, 's');
}

/* ---------------- animated layers ---------------- */
// Eye glints inside the visor: [x0, x1] inclusive.
const EYES = [{ x0: 16, x1: 19 }, { x0: 26, x1: 29 }];
function drawEyes(g, state, t = 0) {
  const Y = (y) => y + HY + (t ? 1 : 0), X = (x) => x + t;
  for (const { x0, x1 } of EYES) {
    if (state === 'closed') {
      // cute sleeping curved eye ︶
      pt(g, X(x0), Y(7), 'C'); pt(g, X(x1), Y(7), 'C');
      span(g, Y(8), X(x0 + 1), X(x1 - 1), 'C');
    } else if (state === 'blink') {
      span(g, Y(8), X(x0), X(x1), 'C');
    } else {
      // Expressive cyan visor eyes with highlight
      span(g, Y(7), X(x0), X(x1), 'C');
      span(g, Y(8), X(x0), X(x1), 'C');
      pt(g, X(x0 + 1), Y(7), 'W'); // spark
      pt(g, X(x1), Y(8), 'c'); // cyber pupil depth
    }
  }
}

function drawMouth(g, mood, t = 0) {
  const Y = (y) => y + HY + (t ? 1 : 0), X = (x) => x + t;
  // compact cute cat-like mouth :3
  if (mood === 'smirk' || mood === 'chill') {
    pt(g, X(21), Y(12), 'n');
    pt(g, X(22), Y(13), 'n');
    pt(g, X(23), Y(12), 'n');
    pt(g, X(24), Y(13), 'n');
    pt(g, X(25), Y(12), 'n');
  } else if (mood === 'sleep') {
    pt(g, X(22), Y(13), 'n');
    pt(g, X(23), Y(13), 'n');
  } else if (mood === 'open') {
    pt(g, X(21), Y(12), 'n');
    span(g, Y(13), X(22), X(24), 'n');
    pt(g, X(25), Y(12), 'n');
    pt(g, X(23), Y(14), 'f'); // tongue hint
  }
}

/** The dev-scarf tail. `sway` 0/1 shifts the tip one pixel. */
function drawScarfTail(g, sway = 0, t = 0) {
  const Y = (y) => y + (t ? 1 : 0), X = (x) => x + t;
  for (let y = 20; y <= 30; y++) span(g, Y(y), X(29), X(33), 'P');
  span(g, Y(31), X(29 + sway), X(33 + sway), 'P');
  span(g, Y(32), X(30 + sway), X(33 + sway), 'P');
  pt(g, X(31 + sway), Y(33), 'P');
  
  // Scarf tail shading
  for (let y = 21; y <= 31; y++) pt(g, X(29 + (y > 30 ? sway : 0)), Y(y), 'p');
  pt(g, X(33), Y(23), 'W'); // fabric fold highlight
  pt(g, X(33), Y(24), 'W');
}

/** Dangling legs & stylish cyber sneakers. frame: 0 both down, 1 left kicks, 2 right kicks. */
function drawLegs(g, frame = 0) {
  const leg = (x0, kick) => {
    const top = LEDGE, len = kick ? 7 : 9;
    span(g, top, x0 - 1, x0 + 4, 'G');
    for (let y = top + 1; y <= top + len; y++) span(g, y, x0, x0 + 3, 'G');
    for (let y = top + 1; y <= top + len; y++) pt(g, x0 + 3, y, 'g'); // trouser shadow
    
    // stylish chunky low-top sneakers
    const sy = top + len + 1, sw = kick ? 1 : 0;
    // shoe upper
    span(g, sy, x0 - 1 - sw, x0 + 4 + sw, 'N');
    span(g, sy + 1, x0 - 2 - sw, x0 + 4 + sw, 'N');
    // cyan runner sole accent
    span(g, sy + 2, x0 - 2 - sw, x0 + 4 + sw, 'S');
    // outsole
    span(g, sy + 3, x0 - 2 - sw, x0 + 4 + sw, 'N');
    pt(g, x0, sy + 1, 'H'); // shoe lace detail
    pt(g, x0 + 2, sy + 1, 'H');
  };
  leg(16, frame === 1);
  leg(25, frame === 2);
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
  const led = `<rect x="${(34 + t) * px}" y="${(8 + HY + t) * px}" width="${px}" height="${px}" fill="${visorColor}" style="animation:pxLed 2.4s steps(1) infinite"/>`;
  const ledRing = `<circle cx="${(34 + t) * px + px / 2}" cy="${(8 + HY + t) * px + px / 2}" r="${px * 1.8}" fill="none" stroke="${visorColor}" stroke-width="${px * 0.4}" opacity="0.3" style="animation:pxLed 2.4s steps(1) infinite"/>`;

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
export const FACE_BOX = { x: 10, y: 7, w: 26, h: 10 };

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
