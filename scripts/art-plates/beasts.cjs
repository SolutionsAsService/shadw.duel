'use strict';
// Carved-glass plates (GDADA run 3): beasts and sea monsters. Style: docs/ART_STYLE.md.
const { Ink, INK, R, defs, burst, hatch, offset, frame } = require('../art-lib/glass.cjs');

// ---- local drawing helpers (spines and tubes; the shared ones live in glass.cjs) ----
const mid = (a, b) => `${R((a[0] + b[0]) / 2)} ${R((a[1] + b[1]) / 2)}`;
// closed smooth outline through the midpoints of a control polygon
function sm(p) {
  let d = `M${mid(p[p.length - 1], p[0])}`;
  for (let i = 0; i < p.length; i++) d += `Q${R(p[i][0])} ${R(p[i][1])} ${mid(p[i], p[(i + 1) % p.length])}`;
  return d + 'Z';
}
// open smooth line
function ol(p) {
  let d = `M${R(p[0][0])} ${R(p[0][1])}`;
  for (let i = 1; i < p.length - 1; i++) d += `Q${R(p[i][0])} ${R(p[i][1])} ${mid(p[i], p[i + 1])}`;
  const e = p[p.length - 1];
  return d + `L${R(e[0])} ${R(e[1])}`;
}
// unit normals (left of travel) along a spine
function nrm(P) {
  return P.map((p, i) => {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)];
    const tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1;
    return [ty / l, -tx / l];
  });
}
// edge points of a tube at fraction f of the half-width on side s (+1 left of travel)
const edge = (P, W, s, f = 1, i0 = 0, i1 = P.length - 1) => {
  const N = nrm(P), o = [];
  for (let i = i0; i <= i1; i++) o.push([P[i][0] + s * N[i][0] * W[i] / 2 * f, P[i][1] + s * N[i][1] * W[i] / 2 * f]);
  return o;
};
// tube outline: spine P, full widths W, tip length at the end (tip) and start (tail)
function tube(P, W, tip = 0, tail = 0) {
  const N = nrm(P), n = P.length - 1;
  const l = edge(P, W, 1), r = edge(P, W, -1).reverse();
  const t = (i, k) => [P[i][0] - N[i][1] * k, P[i][1] + N[i][0] * k];
  return sm([...l, ...(tip ? [t(n, tip)] : []), ...r, ...(tail ? [t(0, -tail)] : [])]);
}
// a band pane along one side of a tube, from the edge to fraction f of the half-width
function band(P, W, s, f, i0, i1) {
  return sm([...edge(P, W, s, 1, i0, i1), ...edge(P, W, s, f, i0, i1).reverse()]);
}
// cross cuts of a tube at chosen indices (leading lines between segment panes)
function cuts(P, W, idx, k = 1) {
  const N = nrm(P);
  return idx.map((i) => `M${R(P[i][0] + N[i][0] * W[i] / 2 * k)} ${R(P[i][1] + N[i][1] * W[i] / 2 * k)}L${R(P[i][0] - N[i][0] * W[i] / 2 * k)} ${R(P[i][1] - N[i][1] * W[i] / 2 * k)}`).join('');
}
// segment panes between consecutive cut indices, alternate fills: [[d, fill], ...]
function segs(P, W, idx, cols) {
  const N = nrm(P), o = [];
  for (let j = 0; j < idx.length - 1; j++) {
    const a = idx[j], b = idx[j + 1], pts = [];
    for (let i = a; i <= b; i++) pts.push([P[i][0] + N[i][0] * W[i] / 2, P[i][1] + N[i][1] * W[i] / 2]);
    for (let i = b; i >= a; i--) pts.push([P[i][0] - N[i][0] * W[i] / 2, P[i][1] - N[i][1] * W[i] / 2]);
    o.push([`M${pts.map((p) => `${R(p[0])} ${R(p[1])}`).join('L')}Z`, cols[j % cols.length]]);
  }
  return o;
}
// densify a spine (Catmull-Rom) with widths, k samples per segment
function dense(P, W, k = 4) {
  const oP = [], oW = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let j = 0; j < k; j++) {
      const t = j / k, t2 = t * t, t3 = t2 * t;
      oP.push([0, 1].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)));
      oW.push(W[i] + (W[i + 1] - W[i]) * t);
    }
  }
  oP.push(P[P.length - 1]); oW.push(W[W.length - 1]);
  return [oP, oW];
}
// hatching from side s of a tube, pointing inward, over indices i0..i1 of the dense spine
function th(P, W, s, i0, i1, l0, l1, o = {}) {
  const { tilt = 0, inset = 3, swell = false, step = 1 } = o;
  const N = nrm(P);
  let d = '';
  for (let i = i0; i <= i1; i += step) {
    const u = (i - i0) / Math.max(1, i1 - i0), len = swell ? l0 + (l1 - l0) * Math.sin(Math.PI * u) : l0 + (l1 - l0) * u;
    const h = W[i] / 2 - inset, x = P[i][0] + s * N[i][0] * h, y = P[i][1] + s * N[i][1] * h;
    let dx = -s * N[i][0], dy = -s * N[i][1];
    const c = Math.cos(tilt), sn = Math.sin(tilt);
    [dx, dy] = [dx * c - dy * sn, dx * sn + dy * c];
    d += `M${R(x)} ${R(y)}l${R(dx * len)} ${R(dy * len)}`;
  }
  return d;
}
// gouge line inside the lit side s of a tube
const gouge = (P, W, s, inset, i0, i1) => ol(edge(P, W, s, 1, i0, i1).map((p, j) => {
  const N = nrm(P)[i0 + j];
  return [p[0] - s * N[0] * inset, p[1] - s * N[1] * inset];
}));
const ink = (ds, w = 9) => `<g fill="${INK}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round">${ds.map((d) => `<path d="${d}"/>`).join('')}</g>`;
const panes = (list, w = 3.5) => `<g stroke="${INK}" stroke-width="${w}" stroke-linejoin="round">${list.map(([d, c]) => `<path d="${d}" fill="url(#${c})"/>`).join('')}</g>`;
// background: carved burst, two ground bands, two carved rings, streak gouges
function scene(o, I) {
  let b = `<rect width="400" height="300" fill="${INK}"/><g stroke="${INK}" stroke-width="3" stroke-linejoin="round">`;
  b += burst(o.x, o.y, o.radii, o.n, (k, i) => o.cols[k] && o.cols[k][i % 2], o.rot || 0);
  for (const [d, c] of o.ground || []) b += `<path d="${d}" fill="url(#${c})"/>`;
  b += `</g><g fill="none" stroke="${INK}" stroke-linecap="round"><circle cx="${o.x}" cy="${o.y}" r="${o.rings[0]}" stroke-width="2.5" stroke-dasharray="16 6 30 8 10 6"/><circle cx="${o.x}" cy="${o.y}" r="${o.rings[1]}" stroke-width="2" stroke-dasharray="24 9 12 7 36 10"/></g>`;
  if (o.streak) I.add(o.streak, 1.5, o.sc);
  return b + I.flush();
}
const kit = () => {
  const I = Ink();
  return { I, H: (d, w = 1.8) => I.add(d, w), G: (d, w = 2, c = '#ffe9b0') => I.add(d, w, c) };
};


module.exports = () => ({
  // Flame. Attack: +150 ATK. A wolf at full stretch, mane and tail igniting as it lunges.
  'Cinder Wolf': () => {
    const { I, H, G } = kit();
    let b = defs(['white', 'gold', 'amber', 'orange', 'red', 'wine', 'violet', 'navy', 'teal', 'bronze']);
    b += scene({ x: 132, y: 92, radii: [0, 36, 76, 150, 420], n: [8, 8, 8, 6], rot: 0.2,
      cols: [['white', 'gold'], ['gold', 'amber'], ['violet', 'navy'], ['navy', 'violet']], rings: [44, 58],
      ground: [['M0 300V246C60 238 120 252 190 246C250 240 320 256 400 248V300Z', 'teal'], ['M0 300V270C80 262 150 278 230 270C300 264 350 276 400 272V300Z', 'navy']],
      streak: 'M30 170C50 166 66 172 86 168', sc: '#7f9ae8' }, I);
    const sP = [[350, 190], [318, 176], [282, 158], [248, 140], [218, 124], [194, 110]], sW = [36, 46, 42, 46, 52, 40];
    const [bP, bW] = dense(sP, sW, 3);
    const legs = [
      [[[236, 140], [218, 168], [196, 190], [172, 202]], [24, 17, 12, 11]],
      [[[300, 176], [318, 204], [332, 230], [344, 248]], [30, 18, 12, 10]],
      [[[216, 132], [196, 156], [172, 172], [146, 178], [130, 178]], [30, 20, 14, 12, 11]],
      [[[326, 186], [344, 210], [356, 232], [366, 244]], [38, 22, 14, 11]],
    ];
    const mane = [
      [[[198, 100], [212, 84], [232, 82], [246, 68], [266, 60]], [24, 20, 14, 8, 2], 'gold'],
      [[[226, 122], [244, 106], [266, 106], [282, 92], [304, 86]], [20, 18, 12, 7, 2], 'amber'],
      [[[262, 142], [280, 128], [302, 128], [318, 114], [338, 108]], [18, 15, 10, 6, 2], 'gold'],
      [[[346, 184], [360, 160], [358, 134], [366, 108]], [18, 17, 10, 2], 'amber'],
    ];
    const head = 'M206 104C204 86 188 74 168 78L128 92C118 96 118 102 126 104L152 106L128 118C120 122 124 128 132 127L164 122C188 122 208 120 206 104Z';
    const ears = ['M190 84L204 58L206 94Z', 'M178 80L186 56L196 86Z'];
    const body = tube(sP, sW, 0, 6);
    const lt = legs.map(([P, W]) => tube(P, W, 4)), mn = mane.map(([P, W]) => tube(P, W, 6));
    let f = `<g data-figure="1">` + ink([...mn, ...lt, body, head, ...ears]);
    f += panes([...mane.map((m, i) => [mn[i], m[2]]), [lt[0], 'wine'], [lt[1], 'wine'], [body, 'red'], [band(sP, sW, 1, 0.1, 0, 5), 'wine'], [lt[2], 'orange'], [lt[3], 'orange'], [head, 'red'], [ears[0], 'wine'], [ears[1], 'red']]);
    f += panes([['M150 106L128 118C120 122 124 128 132 127L164 122C176 122 186 120 194 116Z', 'amber'], ['M178 92L190 88L186 96Z', 'white']], 2.5);
    H(cuts(bP, bW, [5, 10], 0.95), 3);
    H(th(bP, bW, 1, 1, 13, 5, 14, { swell: true }), 2);
    H(th(bP, bW, 1, 3, 11, 4, 9, { swell: true, tilt: 0.7 }), 1.6);
    H(th(legs[2][0], legs[2][1], 1, 0, 3, 4, 7), 1.8);
    G(gouge(bP, bW, -1, 7, 1, 14), 2.5);
    G('M136 96L168 84L190 88', 2);
    G('M128 128l3 4l3-4l3 4l3-4M132 104l3-4l3 4l3-4', 1.5, '#fff6e0');
    G('M126 180l-6 4M128 186l-6 2', 2.5, '#fff6e0');
    f += I.flush();
    f += `<path d="M326 92l6-8l6 8l-6 7Z" fill="url(#gold)" stroke="${INK}" stroke-width="2.5"/>`;
    return b + f + `</g>` + frame('gold');
  },

  // Shadow. Death: 300 damage. A hound crouched under a void rift; as it breaks apart its shards fly at the foe.
  'Void Hound': () => {
    const { I, H, G } = kit();
    let b = defs(['white', 'ruby', 'wine', 'violet', 'navy', 'ash', 'bronze', 'teal', 'gold']);
    b += scene({ x: 262, y: 104, radii: [0, 36, 84, 172, 420], n: [9, 9, 10, 8], rot: 0.5,
      cols: [['white', 'white'], ['ruby', 'wine'], ['wine', 'ruby'], ['violet', 'navy']], rings: [46, 60],
      ground: [['M0 300V240C70 234 130 248 200 242C270 236 330 252 400 246V300Z', 'ash'], ['M0 300V266C60 258 140 274 210 268C280 262 340 276 400 270V300Z', 'navy']],
      streak: 'M40 60C56 56 70 62 86 58M30 130C48 126 64 132 82 128', sc: '#a890e8' }, I);
    const sP = [[340, 200], [316, 188], [290, 176], [262, 166], [238, 160]], sW = [44, 50, 46, 52, 56];
    const [bP, bW] = dense(sP, sW, 3);
    const head = 'M246 132C232 118 210 118 196 126L156 140C148 144 148 152 156 152L182 152L160 164C152 170 158 176 166 174L200 166C222 166 246 160 252 148Z';
    const neck = 'M226 178C214 160 218 140 236 128L262 136C252 150 254 166 262 178Z';
    const legs = [
      [[[248, 182], [236, 208], [222, 230], [204, 240]], [24, 18, 13, 12], 'violet'],
      [[[312, 206], [300, 226], [306, 244], [292, 248]], [32, 20, 13, 12], 'violet'],
      [[[232, 176], [218, 204], [200, 226], [180, 238]], [28, 20, 14, 12], 'ash'],
      [[[334, 210], [330, 230], [338, 246], [322, 252]], [38, 22, 14, 12], 'ash'],
    ];
    const hack = ['M240 140L250 112L262 140Z', 'M262 150L278 122L286 154Z', 'M286 160L304 136L308 168Z'];
    const ear = 'M234 126L242 98L250 130Z';
    const body = tube(sP, sW, 0, 4), lt = legs.map(([P, W]) => tube(P, W, 4));
    const shards = ['M346 186L366 172L362 196Z', 'M360 160L376 148L372 170Z', 'M340 160L352 142L360 160Z', 'M356 124L370 112L368 132Z'];
    let f = `<g data-figure="1">` + ink([...hack, ear, ...lt, body, neck, head, ...shards]);
    f += panes([[lt[0], 'violet'], [lt[1], 'violet'], ...hack.map((d) => [d, 'ruby']), [ear, 'wine'], [body, 'ash'], [band(sP, sW, 1, 0.15, 0, 4), 'violet'], [neck, 'ash'], [lt[2], 'ash'], [lt[3], 'ash'], [head, 'ash'], ...shards.map((d, i) => [d, i % 2 ? 'violet' : 'ruby'])]);
    f += panes([['M180 152L160 164C152 170 158 176 166 174L200 166C210 166 220 164 228 160Z', 'violet'], ['M208 132L222 128L216 138Z', 'teal']], 2.5);
    H(cuts(bP, bW, [3, 7, 10], 0.95), 3);
    H(th(bP, bW, 1, 0, 12, 5, 14, { swell: true }), 2);
    H(th(bP, bW, 1, 3, 9, 4, 9, { swell: true, tilt: 0.7 }), 1.6);
    H('M218 146l10-2M224 154l8-4M240 168l10-2M244 178l10 0', 1.8);
    G(gouge(bP, bW, -1, 7, 1, 11), 2.5, '#e0d4ff');
    G('M162 142L196 130L226 128', 2, '#e0d4ff');
    G('M158 152l3 4l3-4l3 4l3-4', 1.5, '#fff');
    f += I.flush() + `</g>`;
    G('M346 140C320 90 220 70 130 120C106 134 92 152 84 176', 3.5, '#ff5070');
    G('M346 140C320 90 220 70 130 120C106 134 92 152 84 176', 1.5, '#ffe0e8');
    let k = I.flush() + `<g fill="${INK}"><path d="M54 240L58 220L70 220L74 240L68 240L64 228L60 240Z"/><path d="M56 222L54 200C54 194 70 194 72 200L72 222Z"/><circle cx="63" cy="190" r="6"/></g>`;
    k += `<path d="M72 198C82 194 90 194 94 196C94 210 88 220 80 226C74 218 72 210 72 198Z" fill="url(#ruby)" stroke="${INK}" stroke-width="3"/>`;
    G('M70 186l4 4M74 200l4 10', 2, '#ffb0c0');
    k += I.flush();
    return b + f + k + frame('ruby');
  },

  // Flame. Kill: half the victim's ATK to the opponent. A serpent strikes down from its coils; the bitten foe burns.
  'Flame Serpent': () => {
    const { I, H, G } = kit();
    let b = defs(['white', 'gold', 'amber', 'orange', 'red', 'wine', 'violet', 'deep', 'navy', 'teal', 'bronze', 'ivory']);
    b += scene({ x: 96, y: 168, radii: [0, 44, 90, 160, 440], n: [12, 12, 12, 8], rot: 0.1,
      cols: [['white', 'gold'], ['amber', 'gold'], ['deep', 'violet'], ['violet', 'deep']], rings: [54, 68],
      ground: [['M0 300V250C60 244 110 256 170 250C240 244 300 258 400 250V300Z', 'teal'], ['M0 300V272C70 264 140 280 210 274C280 268 330 280 400 276V300Z', 'navy']],
      streak: 'M240 40C256 36 270 42 290 38M120 40C136 36 150 42 166 38', sc: '#7f9ae8' }, I);
    const sP = [[226, 264], [270, 268], [318, 262], [352, 244], [356, 218], [332, 202], [298, 200], [278, 180], [288, 146], [304, 110], [298, 72], [270, 50], [234, 50], [204, 66], [184, 90], [166, 112]];
    const sW = [18, 26, 36, 42, 44, 44, 42, 42, 40, 38, 36, 34, 32, 32, 30, 28];
    const [P, W] = dense(sP, sW, 3);
    const body = tube(sP, sW, 0, 10);
    const head = 'M190 92C176 80 152 84 138 100L114 130C110 136 114 140 120 136L146 120L136 146C134 154 140 156 144 150L166 126C184 118 198 106 190 92Z';
    const hood = 'M212 64C194 54 168 68 164 92C166 110 182 118 198 114C210 100 220 80 212 64Z';
    let f = `<g data-figure="1">` + ink([body, hood, head]);
    f += panes([[body, 'red'], ...segs(sP, sW, [0, 2, 4, 6, 8, 10, 12, 14], ['orange', 'red']), [band(sP, sW, 1, 0.3, 0, 13), 'ivory'], [band(sP, sW, -1, 0.5, 4, 9), 'wine'], [hood, 'amber'], [head, 'red']]);
    f += panes([['M146 120L136 146C134 154 140 156 144 150L166 126Z', 'gold'], ['M160 96L174 92L170 102Z', 'white']], 2.5);
    H(th(P, W, -1, 9, 28, 5, 13, { swell: true }), 2);
    H(th(P, W, -1, 13, 24, 4, 9, { swell: true, tilt: 0.7 }), 1.6);
    H('M184 68l8 8M176 78l10 6', 1.8);
    G(gouge(P, W, -1, 7, 33, 43), 2.5);
    G('M122 128L142 104L164 92', 2);
    G('M118 134l-2 6M138 148l-4 6', 2, '#fff6e0');
    f += I.flush() + `</g>`;
    let k = `<g fill="${INK}"><path d="M70 246L84 230L100 236L92 250Z"/><path d="M84 232L100 212C104 206 114 208 114 216L102 238Z"/><circle cx="118" cy="204" r="6"/><path d="M98 216L80 210L84 204Z"/></g>`;
    k += `<path d="M104 222C110 206 122 196 130 190C130 202 124 214 112 228Z" fill="url(#orange)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
    G('M110 200l4 2M94 220l4 4', 2, '#ffc85a');
    k += I.flush();
    return b + f + k + frame('gold');
  },

  // Water. Summon: your creatures +200 DEF. A sea serpent arches its coils into a wall; spears shatter on it.
  'Tide Serpent': () => {
    const { I, H, G } = kit();
    let b = defs(['white', 'sky', 'deep', 'navy', 'teal', 'pearl', 'bronze', 'steel', 'gold']);
    b += scene({ x: 318, y: 74, radii: [0, 30, 68, 130, 420], n: [10, 10, 12, 8], rot: 0.3,
      cols: [['white', 'pearl'], ['pearl', 'sky'], ['sky', 'deep'], ['deep', 'navy']], rings: [40, 54],
      ground: [['M0 300V238C30 230 50 246 80 238C110 230 130 246 160 238C190 230 210 246 240 238C270 230 290 246 320 238C350 230 370 246 400 238V300Z', 'navy'], ['M0 300V262C40 254 80 270 120 262C160 254 200 270 240 262C280 254 320 270 400 262V300Z', 'teal']],
      streak: 'M30 60C46 56 60 62 76 58M40 120C58 116 72 122 92 118M180 40C196 36 210 42 228 38', sc: '#cfe6ff' }, I);
    const sP = [[88, 70], [100, 104], [110, 150], [118, 200], [126, 246], [150, 244], [168, 196], [196, 160], [230, 156], [258, 186], [272, 236], [294, 246], [310, 210], [334, 186], [358, 200], [368, 240]];
    const sW = [32, 38, 42, 42, 40, 32, 36, 38, 38, 36, 34, 28, 28, 24, 18, 10];
    const [P, W] = dense(sP, sW, 3);
    const body = tube(sP, sW, 4, 0);
    const head = 'M92 74C106 56 104 36 88 28L58 24C48 24 46 30 54 34L74 40L50 46C42 50 46 56 54 56L72 56C70 66 76 76 92 74Z';
    const fin = 'M110 88C130 80 146 84 156 74C150 96 138 110 118 116Z';
    const fin2 = 'M200 156C210 132 230 120 252 126C240 138 238 150 238 160Z';
    let f = `<g data-figure="1">` + ink([body, head, fin, fin2]);
    f += panes([[fin, 'pearl'], [fin2, 'pearl'], [body, 'teal'], ...segs(sP, sW, [1, 3, 5, 7, 9, 11, 13, 15], ['sky', 'teal']), [band(sP, sW, 1, 0.3, 0, 15), 'pearl'], [head, 'teal']]);
    f += panes([['M74 40L50 46C42 50 46 56 54 56L72 56C76 50 80 44 84 42Z', 'pearl'], ['M80 32L90 30L88 40Z', 'white']], 2.5);
    H(th(P, W, -1, 0, 14, 4, 12, { swell: true }), 2);
    H(th(P, W, -1, 20, 32, 4, 10, { swell: true }), 2);
    G(gouge(P, W, 1, 6, 16, 30), 2.5, '#e6f8ff');
    G('M58 28L86 32L98 50', 2, '#e6f8ff');
    f += I.flush() + `</g>`;
    // spears from the right shatter on the coil
    let k = `<g fill="none" stroke="${INK}" stroke-linecap="round"><path d="M384 124L286 148M384 152L306 166M380 104L330 114" stroke-width="5"/></g>`;
    k += `<g fill="url(#steel)" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"><path d="M292 142l-14 8l14 4Z"/><path d="M312 160l-14 8l14 4Z"/><path d="M336 108l-14 8l14 4Z"/></g>`;
    k += `<g fill="url(#white)" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"><path d="M262 130l6-12l6 12l-6 6Z"/><path d="M276 168l10-4l2 10l-8 2Z"/></g>`;
    return b + f + k + frame('teal');
  },

  // Water. Death: drag down the weakest enemy. The leviathan dives; its wake hauls a small ship under.
  'Deep Sea Leviathan': () => {
    const { I, H, G } = kit();
    let b = defs(['white', 'gold', 'sky', 'deep', 'navy', 'teal', 'pearl', 'bronze']);
    b += scene({ x: 300, y: 214, radii: [0, 34, 74, 146, 440], n: [10, 10, 12, 8], rot: 0.15,
      cols: [['white', 'pearl'], ['teal', 'sky'], ['deep', 'navy'], ['navy', 'deep']], rings: [44, 58],
      ground: [['M0 300V252C50 244 100 258 160 252C220 246 260 262 330 256C360 254 380 258 400 256V300Z', 'teal'], ['M0 300V274C80 266 160 282 240 274C300 268 350 280 400 276V300Z', 'navy']],
      streak: 'M190 50C210 46 228 52 250 48M260 90C276 86 290 92 308 88M30 200C46 196 60 202 76 198M120 230C136 226 150 232 166 228', sc: '#9ad0ff' }, I);
    b += `<path d="M16 50C60 42 90 58 130 50C170 42 210 58 250 50C300 40 340 58 384 48" fill="none" stroke="#cfe6ff" stroke-width="2"/>`;
    const sP = [[70, 70], [100, 92], [140, 116], [186, 142], [230, 168], [266, 190], [290, 206]];
    const sW = [20, 44, 72, 88, 86, 72, 50];
    const [P, W] = dense(sP, sW, 3);
    const body = tube(sP, sW, 14, 0);
    const fluke = 'M78 76C64 58 46 40 20 36C38 52 44 62 46 72C34 78 28 92 30 110C50 92 64 86 78 82Z';
    const fin = 'M196 170C192 194 176 214 152 228C176 230 200 220 214 196Z';
    let f = `<g data-figure="1">` + ink([body, fluke, fin]);
    f += panes([[fin, 'navy'], [fluke, 'teal'], [body, 'teal'], [band(sP, sW, -1, 0.45, 1, 6), 'pearl'], [band(sP, sW, 1, 0.75, 1, 5), 'sky']]);
    const ge = edge(P, W, -1, 0.55, 6, P.length - 2), gg = edge(P, W, -1, 0.95, 6, P.length - 2);
    let gr = ''; for (let i = 0; i < ge.length; i += 2) gr += `M${R(ge[i][0])} ${R(ge[i][1])}L${R(gg[i][0])} ${R(gg[i][1])}`;
    H(gr, 2);
    H('M250 200C266 210 284 214 300 212', 3.5);
    f += panes([['M252 176L262 174L258 184Z', 'white']], 2.5);
    H(th(P, W, 1, 3, P.length - 2, 6, 16, { swell: true }), 2);
    H(th(P, W, 1, 6, P.length - 4, 5, 10, { swell: true, tilt: 0.7 }), 1.6);
    G(gouge(P, W, 1, 30, 3, P.length - 3), 2.5, '#e6f8ff');
    G('M70 64L44 46', 2, '#e6f8ff');
    f += I.flush() + `</g>`;
    // the dragged ship: whirled down in the wake behind the flukes
    let k = `<g fill="none" stroke="${INK}" stroke-linecap="round" stroke-width="3"><path d="M150 40C190 44 196 70 176 80C156 90 136 76 146 62M118 30C170 22 222 50 196 92C180 116 140 112 128 96"/></g>`;
    k += `<g fill="${INK}"><path d="M136 66L178 54L182 72L144 84Z"/><path d="M156 62L148 26L162 60Z"/></g>`;
    k += `<path d="M150 30C166 34 172 46 166 58L158 60Z" fill="url(#gold)" stroke="${INK}" stroke-width="3"/>`;
    G('M142 76l34-12', 2, '#ffe9b0');
    k += I.flush();
    return b + f + k + frame('teal');
  },

  // Water. Summon: destroy every weak enemy. The kraken rises at the right; its arms sweep the fleet under.
  'Abyssal Kraken': () => {
    const { I, H, G } = kit();
    let b = defs(['white', 'gold', 'sky', 'deep', 'navy', 'teal', 'pearl', 'bronze', 'violet', 'ruby']);
    b += scene({ x: 168, y: 96, radii: [0, 32, 70, 140, 420], n: [8, 10, 10, 7], rot: 0.4,
      cols: [['white', 'pearl'], ['sky', 'pearl'], ['violet', 'deep'], ['navy', 'violet']], rings: [42, 56],
      ground: [['M0 300V244C40 236 70 252 110 244C150 236 180 252 220 244C260 236 290 252 330 244C360 238 380 248 400 244V300Z', 'deep'], ['M0 300V268C40 260 70 276 110 268C150 260 180 276 220 268C260 260 290 276 330 268C360 262 380 272 400 268V300Z', 'navy']],
      streak: 'M30 60C46 56 60 62 76 58M40 170C58 166 72 172 92 168M250 40C266 36 280 42 298 38', sc: '#9ab8ff' }, I);
    const mantle = 'M276 214C252 178 248 124 262 92C272 70 284 58 296 50C320 60 352 86 358 130C362 160 352 190 324 216Z';
    const fins = ['M284 60L250 50L266 94Z', 'M304 54L326 34L334 76Z'];
    const arms = [
      [[[280, 204], [240, 190], [200, 170], [162, 144], [132, 124], [112, 124], [106, 144], [120, 152]], [36, 32, 27, 22, 17, 13, 9, 6], 'teal'],
      [[[286, 216], [240, 232], [190, 236], [140, 228], [98, 216], [70, 200], [64, 180], [78, 174]], [38, 33, 27, 21, 16, 12, 9, 6], 'sky'],
      [[[326, 210], [354, 198], [368, 172], [364, 144], [348, 136]], [32, 25, 18, 12, 6], 'teal'],
      [[[300, 222], [302, 248], [282, 264], [254, 262]], [34, 26, 17, 8], 'sky'],
      [[[288, 210], [258, 218], [232, 206], [222, 184], [230, 166]], [28, 22, 16, 11, 6], 'teal'],
    ];
    const at = arms.map(([p, w]) => tube(p, w, 5));
    let f = `<g data-figure="1">` + ink([...fins, mantle, ...at]);
    f += panes([[fins[0], 'pearl'], [fins[1], 'navy'], [at[2], 'teal'], [mantle, 'teal'], ['M276 214C252 178 248 124 262 92C272 70 284 58 296 50C282 80 276 150 290 214Z', 'pearl'], ['M358 130C362 160 352 190 324 216L312 214C340 184 352 150 344 104C350 112 356 120 358 130Z', 'navy']]);
    f += panes([[at[4], 'teal'], [at[3], 'sky'], [at[0], 'teal'], [at[1], 'sky']]);
    let su = '';
    for (const [p, w] of arms.slice(0, 2).map(([p, w]) => dense(p, w, 2))) { const e = edge(p, w, 1, 0.45); for (let i = 2; i < e.length - 4; i += 2) su += `<circle cx="${R(e[i][0])}" cy="${R(e[i][1])}" r="${Math.max(2, R(w[i] / 8))}"/>`; }
    f += `<g fill="url(#pearl)" stroke="${INK}" stroke-width="2">${su}</g>`;
    f += panes([['M292 168C302 156 320 156 326 168C320 180 302 180 292 168Z', 'gold'], ['M305 160L313 160L311 176L307 176Z', 'ruby']], 3);
    H('M262 128C290 116 330 120 356 136M270 194C290 200 316 200 338 194', 3);
    H(hatch([[296, 50], [330, 66], [356, 96], [358, 130]], 8, 5, 14, -1, { swell: true }), 2);
    H(hatch([[358, 130], [362, 160], [352, 190], [324, 216]], 5, 5, 12, -1, { swell: true }), 2);
    H(hatch([[296, 50], [330, 66], [356, 96], [358, 130]], 5, 4, 9, -1, { swell: true, tilt: 0.7, t0: 0.3, t1: 0.8 }), 1.6);
    for (const [p, w] of arms.slice(0, 2)) H(th(p, w, -1, 1, p.length - 3, 4, 8, { swell: true }), 1.8);
    G('M274 196C260 160 262 120 280 84', 2.5, '#e6f8ff');
    f += I.flush() + `</g>`;
    let k = `<g fill="${INK}"><path d="M104 120L150 108L156 122L114 134Z"/><path d="M128 114L124 74L136 112Z"/><path d="M40 182L84 186L82 200L44 198Z"/><path d="M62 186L66 150L70 186Z"/></g>`;
    k += `<path d="M126 80C140 88 142 100 136 110L130 110Z" fill="url(#gold)" stroke="${INK}" stroke-width="3"/>`;
    k += `<path d="M66 156C78 164 80 176 74 184L68 184Z" fill="url(#gold)" stroke="${INK}" stroke-width="3"/>`;
    G('M110 128l40-12M46 192l34 2', 2, '#ffe9b0');
    k += I.flush();
    return b + f + k + frame('teal');
  },

  // Earth. Death: your creatures +300 DEF. A boulder of a tortoise plods on; a small ally shelters behind it.
  'Mossback Tortoise': () => {
    const { I, H, G } = kit();
    let b = defs(['white', 'gold', 'amber', 'wine', 'bronze', 'ash', 'teal', 'orange']);
    b += scene({ x: 70, y: 236, radii: [0, 40, 84, 156, 440], n: [10, 10, 12, 8], rot: 0.05,
      cols: [['white', 'gold'], ['gold', 'amber'], ['amber', 'orange'], ['wine', 'ash']], rings: [50, 64],
      ground: [['M0 300V246C60 238 120 254 200 248C270 242 330 256 400 250V300Z', 'bronze'], ['M0 300V270C70 262 150 278 220 272C300 266 350 278 400 274V300Z', 'ash']],
      streak: 'M230 40C246 36 260 42 280 38M300 80C318 76 334 82 352 78M200 110C218 106 232 112 250 108', sc: '#ffc0a0' }, I);
    const shell = 'M156 222C150 160 190 104 260 98C330 94 376 144 374 206C374 220 368 228 358 230L170 232C162 232 156 228 156 222Z';
    const rim = 'M150 218C200 232 300 236 376 214L378 232C300 248 200 246 150 234Z';
    const head = 'M168 204C150 182 122 176 98 184C80 190 78 210 94 220C114 230 144 226 170 222Z';
    const legs = ['M176 226C168 240 166 252 170 262L206 262C206 250 208 238 206 228Z', 'M320 226C316 240 316 252 318 262L354 262C354 250 352 238 350 226Z', 'M210 230C206 240 206 248 208 256L232 256C232 248 232 240 230 230Z'];
    const moss = 'M196 128C210 104 240 92 270 94C300 94 330 108 346 130C330 122 312 126 300 120C286 126 268 118 254 124C238 118 222 128 196 128Z';
    const trunk = 'M262 98L262 64L270 64L270 98Z', crown = 'M248 72C240 56 252 42 266 46C278 36 296 46 290 60C300 70 286 84 272 76C262 86 244 82 248 72Z';
    let f = `<g data-figure="1">` + ink([shell, rim, head, ...legs, moss, trunk, crown]);
    f += panes([[legs[2], 'ash'], [shell, 'bronze']]);
    f += panes([['M200 216C196 186 206 160 226 146L250 170L240 216Z', 'amber'], ['M250 170L226 146C246 132 276 130 300 140L290 170Z', 'bronze'], ['M290 170L300 140C322 152 340 172 346 196L318 216L300 216Z', 'amber'], ['M240 216L250 170L290 170L300 216Z', 'gold'], ['M346 196C350 206 350 216 346 222L318 216Z', 'wine']], 3);
    f += panes([['M340 120C366 144 376 180 372 214L352 216C360 182 356 148 340 120Z', 'wine'], [rim, 'ash'], [legs[0], 'bronze'], [legs[1], 'bronze'], [head, 'bronze'], [moss, 'teal'], [trunk, 'bronze'], [crown, 'teal']]);
    f += panes([['M108 194L118 192L116 202Z', 'white']], 2.5);
    H(hatch([[358, 230], [374, 220], [376, 180], [360, 140]], 8, 5, 12, -1), 2);
    H(hatch([[358, 230], [374, 220], [376, 180], [360, 140]], 5, 4, 9, -1, { tilt: 0.7, t0: 0.1, t1: 0.6 }), 1.6);
    H('M332 236l0 10M342 234l0 12M182 236l0 10M194 236l0 12', 2);
    H('M100 214C118 218 140 216 160 212M150 190l-6 10', 2);
    G(offset([[168, 200], [176, 150], [210, 112], [256, 104]], 0, 1, 6), 2.5, '#fff0c0');
    G('M96 194C108 186 128 184 148 190', 2, '#fff0c0');
    G('M170 262l0 4M182 262l0 4M194 262l0 4', 2.5, '#fff6e0');
    f += I.flush() + `</g>`;
    let k = `<g fill="${INK}"><path d="M30 252L34 232L44 232L48 252L42 252L39 242L36 252Z"/><path d="M32 234L30 214C30 208 46 208 48 214L48 234Z"/><circle cx="39" cy="204" r="6"/></g>`;
    k += `<path d="M48 212C58 208 64 210 66 212C66 226 60 234 54 238C50 230 48 222 48 212Z" fill="url(#gold)" stroke="${INK}" stroke-width="3"/>`;
    G('M34 206l4-4M46 220l2 8', 2, '#ffe9b0');
    k += I.flush();
    return b + f + k + frame('gold');
  },

  // Shadow. Death: drain 150 LP. A dusk tick, bloated with stolen light, drinks a ruby thread from its victim.
  'Gloom Mite': () => {
    const { I, H, G } = kit();
    let b = defs(['white', 'gold', 'amber', 'ruby', 'wine', 'violet', 'navy', 'ash', 'bronze']);
    b += scene({ x: 300, y: 152, radii: [0, 50, 96, 172, 440], n: [10, 10, 14, 9], rot: 0.1,
      cols: [['white', 'gold'], ['gold', 'amber'], ['amber', 'ruby'], ['wine', 'violet']], rings: [104, 118],
      ground: [['M0 300V248C60 240 110 256 180 250C250 244 320 258 400 250V300Z', 'ash'], ['M0 300V272C70 264 150 280 220 274C300 268 350 280 400 276V300Z', 'navy']],
      streak: 'M220 40C236 36 250 42 270 38M300 70C318 66 334 72 352 68M30 70C46 66 60 72 76 68', sc: '#b090e8' }, I);
    const abd = 'M232 150C236 104 280 76 322 84C362 92 380 132 370 172C360 212 318 230 280 222C248 214 230 188 232 150Z';
    const thorax = 'M240 168C226 150 204 150 192 160C180 172 184 190 198 196C214 200 232 190 240 178Z';
    const headP = 'M196 164C186 156 170 158 162 168L150 176L162 182C172 188 188 186 196 178Z';
    const leg = (pts, w) => tube(pts, pts.map((_, i) => w * (1 - i / (pts.length + 0.5))), 3);
    const legsF = [leg([[214, 160], [200, 120], [176, 98], [150, 108]], 18), leg([[224, 154], [226, 110], [212, 76], [190, 62]], 17), leg([[212, 192], [190, 214], [170, 238], [150, 250]], 18), leg([[226, 196], [222, 226], [210, 250], [200, 264]], 17)];
    const legsB = [leg([[250, 210], [270, 246], [300, 258], [320, 264]], 18), leg([[300, 222], [336, 246], [358, 252], [374, 248]], 17)];
    let f = `<g data-figure="1">` + ink([...legsF, ...legsB, abd, thorax, headP]);
    f += panes([...legsB.map((d) => [d, 'violet']), ...legsF.map((d, i) => [d, i % 2 ? 'violet' : 'ash']), [abd, 'violet'], [thorax, 'ash'], [headP, 'ash']]);
    f += panes([['M262 132C274 112 300 104 322 112C306 120 296 134 292 150C280 144 270 140 262 132Z', 'ruby'], ['M292 150C296 134 306 120 322 112C340 122 350 140 348 160C330 158 310 154 292 150Z', 'wine'], ['M250 172C266 168 280 170 292 150C310 154 330 158 348 160C342 188 316 204 290 200C268 196 254 186 250 172Z', 'ruby'], ['M352 104C374 128 376 166 362 192C352 210 330 222 306 224C330 210 350 186 356 156C360 136 358 120 352 104Z', 'navy']], 3);
    H(hatch([[370, 172], [360, 212], [318, 230], [280, 222]], 9, 5, 13, 1, { swell: true }), 2);
    H(hatch([[370, 172], [360, 212], [318, 230], [280, 222]], 5, 4, 9, 1, { swell: true, tilt: -0.7, t0: 0.2, t1: 0.7 }), 1.6);
    H('M206 162l2 14M218 158l2 18', 2);
    G(offset([[232, 150], [236, 104], [280, 76], [322, 84]], -7, 1, 7), 2.5, '#e0d4ff');
    G('M164 168l10-6', 2, '#ffd0e0');
    f += panes([['M174 166L182 164L180 172Z', 'ruby']], 2);
    f += I.flush() + `</g>`;
    let k = `<g fill="${INK}"><path d="M54 254L58 234L68 234L72 254L66 254L63 244L60 254Z"/><path d="M56 236L54 214C54 208 70 208 72 214L72 236Z"/><circle cx="63" cy="204" r="6"/><path d="M72 216L88 222L72 226Z"/></g>`;
    k += `<path d="M54 216C44 222 40 232 42 240C48 236 52 230 56 226Z" fill="url(#gold)" stroke="${INK}" stroke-width="3"/>`;
    G('M76 220C100 200 120 186 152 178', 4, '#120c10');
    G('M76 220C100 200 120 186 152 178', 2.5, '#ff6080');
    k += I.flush();
    return b + f + k + frame('ruby');
  },
});
