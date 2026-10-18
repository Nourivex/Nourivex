// LUMI v2 — pixel character. Hand-placed on a 48×64 grid, outlined automatically.
// Signature traits (only three): asymmetric blunt bob with ONE long lock + ring,
// headphones with a single status LED, sleeves that swallow her hands.

const W = 48, H = 64;
export const LEDGE = 43; // row where she sits (the UI edge goes here)
const HY = 2; // head vertical offset inside the grid

export const PAL = {
  o: '#0D1022', // outline
  H: '#262D58', h: '#181D3E', L: '#46559E', // hair
  S: '#F8DDCC', s: '#E6B8A2', b: '#F09AAB', // skin
  i: '#3FB7CC', I: '#9BEAF0', w: '#FFFFFF', m: '#9C4B63', // eyes, mouth
  J: '#EEE8DC', j: '#CFC6B4', k: '#A79E8C', // jacket
  T: '#2C3150', t: '#1D2138', // inner top
  P: '#3C4262', p: '#262B44', C: '#5CE1E6', A: '#FFC857', // headphones + LED
  D: '#262B44', d: '#1A1E33', // shorts
  G: '#161A2C', g: '#2B3150', // tights
  N: '#F3F3F0', n: '#B8BCC8', // sneakers
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
  // jacket — oversized but tapered, arms read separately from the torso
  rows(g, [[23, 14, 31], [24, 11, 34], [25, 10, 35]], 'J');
  for (let y = 26; y <= 31; y++) span(g, y, 11, 34, 'J');
  for (let y = 32; y <= 39; y++) span(g, y, 12, 33, 'J');
  // open front + inner top
  for (let y = 23; y <= 39; y++) span(g, y, 20, 25, 'T');
  for (let y = 25; y <= 39; y++) pt(g, 20, y, 't');
  for (let y = 23; y <= 39; y++) { pt(g, 19, y, 'k'); pt(g, 26, y, 'j'); }
  for (let y = 30; y <= 38; y++) { pt(g, 15, y, 'j'); pt(g, 30, y, 'j'); }
  span(g, 39, 12, 18, 'j'); span(g, 39, 27, 33, 'j');
  // sleeves: shoulder → hands planted on the ledge, swallowing the hands
  const left = [[26, 8, 12], [27, 8, 12], [28, 7, 12], [29, 7, 11], [30, 6, 11], [31, 6, 10], [32, 5, 10], [33, 5, 10], [34, 5, 9], [35, 4, 9], [36, 4, 9], [37, 4, 9], [38, 3, 8], [39, 3, 8], [40, 3, 8], [41, 3, 8]];
  const right = left.map(([y, a, b]) => [y, 45 - b, 45 - a]);
  rows(g, left, 'J');
  for (const [y, a] of left) pt(g, a, y, 'j');
  span(g, 41, 3, 8, 'j'); span(g, 42, 4, 6, 'S');
  if (pose !== 'wave') {
    rows(g, right, 'J');
    for (const [y, , b] of right) pt(g, b, y, 'k');
    span(g, 41, 37, 42, 'j'); span(g, 42, 39, 41, 'S');
  }
  // shorts / lap
  for (let y = 40; y <= 42; y++) span(g, y, 12, 33, 'D');
  span(g, 42, 22, 23, 'd'); pt(g, 22, 41, 'd');
  // neck
  rows(g, [[21, 20, 25], [22, 20, 25]], 'S');
  span(g, 21, 20, 25, 's');
}

function drawHead(g, { tilt = 0 } = {}) {
  const t = tilt, Y = (y) => y + HY + (t ? 1 : 0), X = (x) => x + t;
  const sp = (y, a, b, c) => span(g, Y(y), X(a), X(b), c);
  const p = (x, y, c) => pt(g, X(x), Y(y), c);
  // hair mass (compact crown so the face gets the space)
  [[1, 17, 28], [2, 15, 30], [3, 13, 32], [4, 12, 33], [5, 11, 34]].forEach(([y, a, b]) => sp(y, a, b, 'H'));
  for (let y = 6; y <= 8; y++) sp(y, 10, 35, 'H');
  // sides: short on one side, the other continues into the lock
  for (let y = 9; y <= 16; y++) { sp(y, 10, 13, 'H'); sp(y, 32, 35, 'H'); }
  sp(17, 11, 13, 'H'); sp(18, 12, 13, 'h'); sp(17, 32, 35, 'H');
  // face
  for (let y = 9; y <= 15; y++) sp(y, 14, 31, 'S');
  sp(16, 15, 30, 'S'); sp(17, 17, 28, 'S'); sp(18, 19, 26, 'S');
  // blunt bangs + a few tips, shade beneath
  sp(8, 14, 31, 'h');
  sp(9, 14, 31, 's');
  for (const x of [14, 17, 18, 24, 29, 30, 31]) p(x, 9, 'h');
  // sheen: broken band, light from the right
  sp(2, 21, 25, 'L'); sp(3, 19, 21, 'L'); sp(3, 24, 28, 'L'); p(29, 4, 'L');
  for (let y = 10; y <= 16; y++) { p(13, y, 'h'); p(32, y, 'h'); }
  sp(13, 14, 15, 'b'); sp(13, 30, 31, 'b');
  // headphones ON the head: band over the crown, cups over the ears
  [[0, 17, 28], [1, 15, 16], [1, 29, 30], [2, 13, 14], [2, 31, 32], [3, 12, 12], [3, 33, 33], [4, 11, 11], [4, 34, 34], [5, 10, 10], [5, 35, 35]].forEach(([y, a, b]) => sp(y, a, b, 'p'));
  for (let y = 6; y <= 8; y++) { p(9, y, 'p'); p(36, y, 'p'); }
  for (let y = 9; y <= 15; y++) { sp(y, 7, 11, 'P'); sp(y, 34, 38, 'P'); }
  sp(8, 8, 10, 'P'); sp(8, 35, 37, 'P'); sp(16, 8, 10, 'P'); sp(16, 35, 37, 'P');
  for (let y = 10; y <= 14; y++) { p(8, y, 'p'); p(37, y, 'p'); }
}

/* ---------------- animated layers ---------------- */
const EYES = [[15, 20, false], [25, 30, true]]; // [lidStart, lidEnd, isRight]
function drawEyes(g, state, t = 0) {
  const Y = (y) => y + HY + (t ? 1 : 0), X = (x) => x + t;
  for (const [a, b, right] of EYES) {
    const ia = right ? a : a + 1; // iris start (5 px wide)
    if (state === 'closed') {
      pt(g, X(ia), Y(11), 'o'); pt(g, X(ia + 4), Y(11), 'o'); span(g, Y(12), X(ia + 1), X(ia + 3), 'o');
    } else if (state === 'blink') {
      span(g, Y(12), X(a), X(b), 'o');
    } else {
      span(g, Y(10), X(a), X(b), 'o'); // heavy lid
      span(g, Y(11), X(ia), X(ia + 4), 'i'); pt(g, X(ia + 1), Y(11), 'w'); span(g, Y(11), X(ia + 2), X(ia + 3), 'o');
      span(g, Y(12), X(ia), X(ia + 4), 'I'); pt(g, X(ia), Y(12), 'i'); pt(g, X(ia + 4), Y(12), 'i');
    }
  }
}

function drawMouth(g, mood, t = 0) {
  const Y = (y) => y + HY + (t ? 1 : 0), X = (x) => x + t;
  if (mood === 'smirk') { span(g, Y(15), X(22), X(23), 'm'); pt(g, X(24), Y(15), 's'); }
  else if (mood === 'sleep') { pt(g, X(23), Y(15), 'm'); }
  else if (mood === 'open') { span(g, Y(15), X(22), X(24), 'm'); pt(g, X(23), Y(16), 'm'); }
}

/** The long lock + ring. `sway` 0/1 shifts the tip one pixel. */
function drawLock(g, sway = 0, t = 0) {
  const Y = (y) => y + (t ? 1 : 0), X = (x) => x + t;
  for (let y = 19; y <= 30; y++) span(g, Y(y), X(33), X(35), 'H');
  span(g, Y(31), X(33 + sway), X(35 + sway), 'H'); span(g, Y(32), X(34 + sway), X(35 + sway), 'H'); pt(g, X(34 + sway), Y(33), 'H');
  for (let y = 20; y <= 31; y++) pt(g, X(33 + (y > 30 ? sway : 0)), Y(y), 'h');
  pt(g, X(35), Y(21), 'L'); pt(g, X(35), Y(22), 'L');
  span(g, Y(26), X(32), X(36), 'C'); span(g, Y(27), X(32), X(36), 'C'); // the ring
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
    span(g, sy + 2, x0 - 2 - sw, x0 + 5 + sw, 'N'); span(g, sy + 3, x0 - 2 - sw, x0 + 5 + sw, 'n');
    pt(g, x0 + 1, sy, 'n'); pt(g, x0 + 3, sy, 'n');
  };
  leg(15, frame === 1);
  leg(26, frame === 2);
}

/** Raised waving arm (save point). frame 0/1 tilts the hand. */
function drawWave(g, frame = 0) {
  const arm = [[14, 40, 44], [15, 40, 44], [16, 39, 43], [17, 39, 43], [18, 38, 43], [19, 38, 42], [20, 37, 42], [21, 37, 41], [22, 36, 41], [23, 35, 40], [24, 34, 39], [25, 34, 38], [26, 34, 37]];
  rows(g, arm, 'J');
  for (const [y, a] of arm) pt(g, a, y, 'j');
  span(g, 14, 40, 44, 'j');
  const hx = frame ? 43 : 42;
  rows(g, [[11, hx - 1, hx + 1], [12, hx - 2, hx + 1], [13, hx - 2, hx + 1]], 'S');
  pt(g, hx + 1, 10, 'S');
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

export const lumiPixelCss = `
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
`;

/**
 * Full character as an SVG group at pixel size `px`.
 * mode: 'day' | 'night'; pose: 'sit' | 'wave'; crop: 'head' keeps only the head (peeking).
 * blinkDelay lets the hero sync the first blink with the liveness check.
 */
export function lumiPixel({ px = 6, mode = 'day', pose = 'sit', blinkDelay = 0, blinkDur = 5.2, swing = true, crop = null } = {}) {
  const night = mode === 'night';
  const t = night ? 1 : 0;
  const base = grid();
  drawBody(base, { pose });
  drawHead(base, { tilt: t });
  const baseOut = outline(base);

  const layer = (fn, withOutline = true) => { const g = grid(); fn(g); return withOutline ? outline(g) : g; };
  const keepRows = crop === 'head' ? (y) => y <= 22 : () => true;
  const R = (g) => toRects(g.map((r, y) => (keepRows(y) ? r : r.map(() => '.'))), px);

  const face = (state, mood) => layer((g) => { drawEyes(g, state, t); drawMouth(g, mood, t); }, false);

  let legs = '';
  if (crop !== 'head') {
    if (night || !swing) legs = R(layer((g) => drawLegs(g, 0)));
    else {
      const f = [0, 1, 0, 2].map((fr) => R(layer((g) => drawLegs(g, fr))));
      legs = ['pxA', 'pxB', 'pxC', 'pxD'].map((k, i) => `<g style="animation:${k} 2.8s steps(1) infinite">${f[i]}</g>`).join('');
    }
  }

  const eyes = night
    ? R(face('closed', 'sleep'))
    : `<g style="animation:pxBlinkOpen ${blinkDur}s steps(1) ${blinkDelay}s infinite">${R(face('open', 'smirk'))}</g>` +
      `<g style="animation:pxBlinkShut ${blinkDur}s steps(1) ${blinkDelay}s infinite;opacity:0">${R(face('blink', 'smirk'))}</g>`;

  // the lock's own outline must not cut into the hair it grows from
  const lockLayer = (sw) => layer((g) => drawLock(g, sw, t)).map((r, y) => (y <= 20 + t ? r.map((c) => (c === 'o' ? '.' : c)) : r));
  const lock0 = R(lockLayer(0));
  const lock = night || crop === 'head'
    ? lock0
    : `<g style="animation:pxHalf1 3.6s steps(1) infinite">${lock0}</g><g style="animation:pxHalf2 3.6s steps(1) infinite">${R(lockLayer(1))}</g>`;

  let wave = '';
  if (pose === 'wave') {
    wave = `<g style="animation:pxHalf1 .9s steps(1) infinite">${R(layer((g) => drawWave(g, 0)))}</g>` +
      `<g style="animation:pxHalf2 .9s steps(1) infinite">${R(layer((g) => drawWave(g, 1)))}</g>`;
  }

  // status LED on the right cup: cyan when online, amber when asleep
  const led = `<rect x="${(36 + t) * px}" y="${(12 + HY + t) * px}" width="${px}" height="${px}" fill="${night ? PAL.A : PAL.C}" style="animation:pxLed 2.4s steps(1) infinite"/>`;

  const z = night
    ? [0, 1.2, 2.4].map((d, i) => `<g style="animation:pxZ 3.6s linear ${d}s infinite;opacity:0"><path d="M${41 * px} ${(8 - i * 2) * px}h${2 * px}l-${2 * px} ${2 * px}h${2 * px}" stroke="${i === 1 ? '#FF7AB6' : PAL.C}" stroke-width="${px * 0.6}" fill="none" stroke-linejoin="round"/></g>`).join('')
    : '';

  return `<g shape-rendering="crispEdges">${R(baseOut)}${legs}${lock}${eyes}${wave}${led}</g>${z}`;
}

/** Face box in sprite space (for the liveness brackets). */
export const FACE_BOX = { x: 12, y: 9, w: 22, h: 13 };

/* ---------------- tiny game sprite (14×18) ---------------- */
// Same identity at game scale: headphones, bob + lock + ring, cream jacket.
const TINY = [
  '...oooooooo...',
  '..opHHHHHHpo..',
  '.opHHHLLHHHpo.',
  'oPpHHHHHHHHpPo',
  'oPHhhhhhhhhHPC',
  'oPHSSSSSSSSHPo',
  '.oHoooSSoooHo.',
  '.oHSiSSSSiSHHo',
  '..oSbSSSSbSHHo',
  '..ooSSmmSSoHHo',
  '.oJJJJTTJJJHCo',
  'oJJJJJTTJJJJo.',
  'oJjJJJTTJJjJo.',
  'oSoJJJTTJJoSo.',
  '.o.oDDDDDDo.o.',
];
const TINY_LEGS = [
  ['...oGGooGGo...', '...oGGooGGo...', '..oNNNooNNNo..'],
  ['..oGGo..oGGo..', '..oGGo..oGGo..', '.oNNNo..oNNNo.'],
];
const tinyRects = (rows, px, oy = 0) => rows.flatMap((r, y) => [...r].map((c, x) => (c !== '.' ? `<rect x="${x * px}" y="${(y + oy) * px}" width="${px}" height="${px}" fill="${PAL[c]}"/>` : ''))).join('');
export const tinyCss = `@keyframes tLegA{0%,49.9%{opacity:1}50%,100%{opacity:0}}@keyframes tLegB{0%,49.9%{opacity:0}50%,100%{opacity:1}}`;
export function lumiTiny(px = 3, { run = true } = {}) {
  const legs = run
    ? `<g style="animation:tLegA .32s steps(1) infinite">${tinyRects(TINY_LEGS[0], px, TINY.length)}</g><g style="animation:tLegB .32s steps(1) infinite">${tinyRects(TINY_LEGS[1], px, TINY.length)}</g>`
    : tinyRects(TINY_LEGS[0], px, TINY.length);
  return `<g shape-rendering="crispEdges">${tinyRects(TINY, px)}${legs}</g>`;
}
export const TINY_SIZE = { w: 14, h: TINY.length + 3 };

/** Debug: ASCII dump of the default frame. */
export function dump(mode = 'day') {
  const t = mode === 'night' ? 1 : 0;
  const g = grid(); drawBody(g); drawHead(g, { tilt: t });
  const o = outline(g); drawEyes(o, t ? 'closed' : 'open', t); drawMouth(o, t ? 'sleep' : 'smirk', t);
  const l = outline((() => { const x = grid(); drawLegs(x, 0); drawLock(x, 0, t); return x; })());
  return o.map((r, y) => r.map((c, x) => (l[y][x] !== '.' ? l[y][x] : c)).join('')).join('\n');
}
