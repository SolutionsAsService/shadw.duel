'use strict';
// Winged plates (GDADA run 3, carved glass): whelp, drake, phoenix, falcon, hunter, sovereign, harpy.
const { Ink, INK, R, defs, burst, hatch, offset, frame } = require('../art-lib/glass.cjs');

// ---- local drawing kit (geometry only; the style helpers come from glass.cjs) ----
const bz = (p, t) => { const u = 1 - t; return [0, 1].map((j) => u * u * u * p[0][j] + 3 * u * u * t * p[1][j] + 3 * u * t * t * p[2][j] + t * t * t * p[3][j]); };
const dbz = (p, t) => { const u = 1 - t; return [0, 1].map((j) => 3 * u * u * (p[1][j] - p[0][j]) + 6 * u * t * (p[2][j] - p[1][j]) + 3 * t * t * (p[3][j] - p[2][j])); };
const P = (p) => `${R(p[0])} ${R(p[1])}`;
// compact path writer: absolute M, then relative segments measured from rounded points (exact)
function pen(p0) {
  let x = R(p0[0]), y = R(p0[1]), d = `M${x} ${y}`;
  const sx = x, sy = y, num = (a) => a.reduce((t, v, i) => t + (i && v >= 0 ? ' ' : '') + v, '');
  const o = {
    s(ch, ...pts) { d += ch + num(pts.flatMap((p) => [R(p[0]) - x, R(p[1]) - y])); const q = pts[pts.length - 1]; x = R(q[0]); y = R(q[1]); return o; },
    z() { x = sx; y = sy; d += 'Z'; return o; },
    get d() { return d; },
  };
  return o;
}
// smooth path through points (Catmull-Rom); a point [x, y, 1] is a sharp corner
function sm(Q, closed = true) {
  const n = Q.length, g = (i) => (closed ? Q[(i + n) % n] : Q[Math.max(0, Math.min(n - 1, i))]);
  const w = pen(Q[0]);
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const a = g(i - 1), b = g(i), c = g(i + 1), e = g(i + 2), k1 = b[2] ? 0 : 1 / 6, k2 = c[2] ? 0 : 1 / 6;
    w.s('c', [b[0] + (c[0] - a[0]) * k1, b[1] + (c[1] - a[1]) * k1], [c[0] - (e[0] - b[0]) * k2, c[1] - (e[1] - b[1]) * k2], c);
  }
  return closed ? w.z().d : w.d;
}
// polygon with straight sides
const poly = (Q) => { const w = pen(Q[0]); Q.slice(1).forEach((p) => w.s('l', p)); return w.z().d; };
// transform: rotate by a, scale s, then move to (ox, oy)
const xf = (ox, oy, a, s = 1) => { const c = Math.cos(a), n = Math.sin(a); const f = (p) => [ox + s * (p[0] * c - p[1] * n), oy + s * (p[0] * n + p[1] * c), p[2]]; f.all = (Q) => Q.map(f); return f; };
// side (+1/-1) of contour p whose normal points toward `to`
const sideTo = (p, to) => { const [x, y] = bz(p, 0.5), [dx, dy] = dbz(p, 0.5); return (dy * (to[0] - x) - dx * (to[1] - y)) > 0 ? 1 : -1; };
const hin = (p, n, l0, l1, to, o) => hatch(p, n, l0, l1, sideTo(p, to), o);
const gin = (p, d, to, n = 7) => offset(p, d, sideTo(p, to), n);
// feather strips between curve A (root) and curve B (tips); each tip bulges out by `tip`
function feathers(A, B, n, cols, tip = 7, t0 = 0, t1 = 1) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const s0 = t0 + ((t1 - t0) * i) / n, s1 = t0 + ((t1 - t0) * (i + 1)) / n;
    const a0 = bz(A, s0), a1 = bz(A, s1), b0 = bz(B, s0), b1 = bz(B, s1);
    const m = [(b0[0] + b1[0]) / 2, (b0[1] + b1[1]) / 2], ma = [(a0[0] + a1[0]) / 2, (a0[1] + a1[1]) / 2];
    const L = Math.hypot(m[0] - ma[0], m[1] - ma[1]) || 1, c = [m[0] + ((m[0] - ma[0]) / L) * tip * 2, m[1] + ((m[1] - ma[1]) / L) * tip * 2];
    out.push([pen(a0).s('l', a1).s('l', b1).s('q', c, b0).z().d, cols[i % cols.length]]);
  }
  return out;
}
// membrane panes fanning from wrist W through finger tips T; trailing edges bow toward W
function membrane(W, T, cols, bow = 0.22) {
  const out = [];
  for (let i = 0; i < T.length - 1; i++) {
    const a = T[i], b = T[i + 1], c = [(a[0] + b[0]) / 2 + (W[0] - (a[0] + b[0]) / 2) * bow, (a[1] + b[1]) / 2 + (W[1] - (a[1] + b[1]) / 2) * bow];
    out.push([pen(W).s('l', a).s('q', c, b).z().d, cols[i % cols.length]]);
  }
  return out;
}
const under = (ds, w = 9) => `<path d="${ds.join('')}" fill="${INK}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round"/>`;
function panes(list, w = 3.5) {
  const m = [];
  for (const [d, c] of list) { if (m.length && m[m.length - 1][1] === c) m[m.length - 1][0] += d; else m.push([d, c]); }
  return `<g stroke="${INK}" stroke-width="${w}" stroke-linejoin="round">${m.map(([d, c]) => `<path d="${d}" fill="url(#${c})"/>`).join('')}</g>`;
}
// wavy ground band from y (left) to y2 (right)
function band(y, y2, amp, ph, col) {
  const yy = (x) => y + ((y2 - y) * x) / 400 + amp * Math.sin(x / 60 + ph), w = pen([0, 300]).s('l', [0, yy(0)]);
  for (let x0 = 0; x0 < 400; x0 += 100) w.s('c', [x0 + 33, yy(x0 + 33)], [x0 + 66, yy(x0 + 66)], [x0 + 100, yy(x0 + 100)]);
  return `<path d="${w.d}V300Z" fill="url(#${col})"/>`;
}
// background: carved burst around the key light, ground bands, dashed rings
function scene(o) {
  const { cx, cy, radii, n, cols, rot = 0, ground, r1 = 40, r2 = 54 } = o;
  let b = `<rect width="400" height="300" fill="${INK}"/><g stroke="${INK}" stroke-width="3" stroke-linejoin="round">`;
  b += burst(cx, cy, radii, n, (k, i) => cols[k][i % 2], rot);
  b += ground.map((g) => band(...g)).join('') + '</g>';
  b += `<g fill="none" stroke="${INK}" stroke-linecap="round"><circle cx="${cx}" cy="${cy}" r="${r1}" stroke-width="2.5" stroke-dasharray="16 6 30 8 10 6"/><circle cx="${cx}" cy="${cy}" r="${r2}" stroke-width="2" stroke-dasharray="24 9 12 7 36 10"/></g>`;
  return b;
}
// zigzag bolt: spine points, half-width w
function bolt(Q, w) {
  const l = [], r = [];
  Q.forEach((p, i) => { const a = Q[Math.max(0, i - 1)], b = Q[Math.min(Q.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, ww = w * (1 - (i / (Q.length - 1)) * 0.7); l.push([p[0] - (dy / L) * ww, p[1] + (dx / L) * ww]); r.unshift([p[0] + (dy / L) * ww, p[1] - (dx / L) * ww]); });
  return poly(l.concat(r));
}

const lerp = (p, q, f) => [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f];
const mixC = (A, B, f) => A.map((p, i) => lerp(p, B[i], f));
// pointed tongue (flame, crest, hair) from base a-b to tip t, bowed by `bend`
function leaf(a, b, t, bend = 0) {
  const c = lerp(a, b, 0.5), dx = t[0] - c[0], dy = t[1] - c[1], L = Math.hypot(dx, dy) || 1, n = [(-dy / L) * bend, (dx / L) * bend];
  const ma = lerp(a, t, 0.5), mb = lerp(b, t, 0.5);
  return sm([[a[0], a[1], 1], [ma[0] + n[0], ma[1] + n[1]], [t[0], t[1], 1], [mb[0] + n[0], mb[1] + n[1]], [b[0], b[1], 1]]);
}
// bird wing: flight feathers A->B plus a covert row along the leading edge A
const wing = (A, B, n, cols, cov, tip = 7) => [...feathers(A, B, n, cols, tip, 0, 0.92), ...feathers(A, mixC(A, B, 0.42), Math.ceil(n / 2), cov, 4, 0, 0.72)];
const ring = (c, r) => `M${R(c[0] - r)} ${R(c[1])}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
const fan = (W, Tp, i) => [W, lerp(W, Tp[i], 0.33), lerp(W, Tp[i], 0.66), Tp[i]];
const cen = (...Q) => [Q.reduce((s, p) => s + p[0], 0) / Q.length, Q.reduce((s, p) => s + p[1], 0) / Q.length];
// small woodcut ally/foe bird: ink silhouette, one coloured pane, gold gouge on the lit side
function bird(x, y, s, col, flip = 1) {
  const q = (dx, dy) => `${R(x + dx * s * flip)} ${R(y + dy * s)}`;
  return `<path d="M${q(-16, -12)}Q${q(-6, -4)} ${q(0, 0)}Q${q(6, -8)} ${q(18, -16)}Q${q(10, 2)} ${q(2, 6)}L${q(-8, 8)}Q${q(-6, 2)} ${q(-16, -12)}Z" fill="${INK}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M${q(-4, 2)}Q${q(4, -4)} ${q(12, -10)}Q${q(8, 0)} ${q(0, 4)}Z" fill="url(#${col})"/>`;
}

// rewrite path data with relative segments (shorter, same integers)
function rel(d) {
  const t = d.match(/[a-zA-Z]|-?\d+(\.\d+)?/g), N = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7, z: 0 };
  const num = (a) => a.reduce((s, v, i) => s + (i && v >= 0 ? ' ' : '') + v, '');
  let x = 0, y = 0, sx = 0, sy = 0, o = '', i = 0, cmd = '';
  while (i < t.length) {
    if (/[a-zA-Z]/.test(t[i])) cmd = t[i++];
    const lc = cmd.toLowerCase(), abs = cmd !== lc, k = N[lc];
    if (lc === 'z') { o += 'Z'; x = sx; y = sy; continue; }
    const v = t.slice(i, i + k).map(Number); i += k;
    if (lc === 'm') { const nx = abs ? v[0] : x + v[0], ny = abs ? v[1] : y + v[1]; o += `M${nx} ${ny}`; x = sx = nx; y = sy = ny; cmd = abs ? 'L' : 'l'; continue; }
    if (lc === 'h') { const nx = abs ? v[0] : x + v[0]; o += 'h' + (nx - x); x = nx; continue; }
    if (lc === 'v') { const ny = abs ? v[0] : y + v[0]; o += 'v' + (ny - y); y = ny; continue; }
    let r;
    if (lc === 'a') { const ex = abs ? v[5] - x : v[5], ey = abs ? v[6] - y : v[6]; r = [...v.slice(0, 5), ex, ey]; x += ex; y += ey; }
    else { r = v.map((n, j) => (abs ? n - (j % 2 ? y : x) : n)); x += r[k - 2]; y += r[k - 1]; }
    o += lc + num(r);
  }
  return o;
}
// prepend only the gradients the plate uses; compact every path
const fin = (s) => defs([...new Set([...s.matchAll(/url\(#(\w+)\)/g)].map((m) => m[1]))]) + s.replace(/ d="([^"]*)"/g, (m, d) => ` d="${/\./.test(d) ? d : rel(d)}"`);

module.exports = () => ({
  'Wind Falcon': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), Gq = (d, w = 2.2, c = '#ffffff') => I.add(d, w, c);
    let b = '';
    const SX = 322, SY = 214;
    b += scene({ cx: SX, cy: SY, radii: [0, 36, 78, 150, 420], n: [10, 10, 10, 7], rot: 0.15, cols: [['white', 'ivory'], ['gold', 'ivory'], ['sky', 'deep'], ['deep', 'navy']],
      ground: [[246, 240, 5, 1, 'teal'], [270, 266, 4, 3, 'navy']] });
    Gq('M30 120C50 116 70 122 92 118M24 160C44 156 60 162 78 158M60 210C76 206 90 212 108 208M330 120C346 116 360 122 376 118', 1.5, '#a8c8ff');
    b += I.flush();
    // falcon in a stoop, authored head at origin pointing +x
    const T = xf(280, 190, 0.6, 1.0);
    const S = (Q) => sm(T.all(Q)), C = (Q) => T.all(Q);
    const body = S([[18, 4, 1], [10, -12], [-10, -20], [-50, -22], [-90, -14], [-112, -5], [-112, 8], [-84, 16], [-44, 24], [-12, 20], [6, 12]]);
    const tail = T.all([[-106, -7], [-150, -20], [-162, 0], [-150, 20], [-106, 8]]);
    const nA = C([[-36, -20], [-40, -62], [-56, -96], [-110, -124]]), nB = C([[-82, -15], [-88, -52], [-96, -90], [-110, -124]]);
    const fA = C([[-36, 20], [-48, 46], [-72, 66], [-140, 78]]), fB = C([[-76, 18], [-96, 28], [-118, 48], [-140, 78]]);
    const nW = wing(nA, nB, 6, ['white', 'pearl'], ['ivory', 'sky']), fW = feathers(fA, fB, 5, ['sky', 'steel'], 6, 0, 0.9);
    const legs = S([[-40, 16], [-6, 26], [16, 28], [18, 36], [-8, 36], [-42, 26]]);
    const card = poly(C([[16, 16], [42, 10], [52, 46], [26, 52]]));
    const hood = S([[11, -10], [-8, -19], [-32, -19], [-28, -4], [-14, 6], [-2, 3]]);
    let f = `<g data-figure="1">` + under([...fW.map((x) => x[0]), sm(tail.map((p) => [...p, 1])), body, ...nW.map((x) => x[0]), legs, card]);
    f += panes([...fW, [sm(tail.map((p) => [...p, 1])), 'steel'], [poly(C([[-106, -7], [-150, -20], [-160, -4], [-106, 1]])), 'pearl'], [body, 'pearl']]);
    // shadow pane along the back (away from the low sun), pale belly toward it
    f += panes([[S([[-10, -20], [-50, -22], [-90, -14], [-108, -5], [-80, -8], [-40, -10]]), 'steel'], [S([[-80, 15], [-44, 23], [-12, 19], [-20, 9], [-50, 11]]), 'ivory'], [hood, 'navy']]);
    f += panes([...nW, [legs, 'gold']]);
    f += panes([[card, 'ivory'], [poly(C([[24, 21], [38, 18], [44, 40], [30, 44]])), 'white'], [sm(C([[31, 26, 1], [36, 31, 1], [34, 38, 1], [29, 33, 1]])), 'ruby']], 3);
    f += panes([[sm(C([[8, -6], [24, 2, 1], [12, 8], [6, 4]])), 'gold'], [`M${P(T([-2, -6]))}m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0Z`, 'amber']], 2.5);
    // talons over the card edge
    H(C([[14, 22], [22, 18], [10, 32], [20, 34]]).reduce((d, p, i) => d + (i % 2 ? 'L' : 'M') + P(p), ''), 4);
    // hatching: far contours of the wings and back point inward
    H(hin(nA, 10, 4, 15, T([-50, -60]), { swell: true }), 1.8);
    H(hin(nA, 6, 4, 11, T([-50, -60]), { swell: true, tilt: 0.7, t0: 0.3, t1: 0.8 }), 1.6);
    H(hin(fB, 8, 4, 12, T([-90, 40]), { swell: true }), 1.8);
    H(hin(C([[-10, -20], [-50, -23], [-90, -15], [-112, -5]]), 7, 4, 9, T([-50, 0]), {}), 1.8);
    H(hin(C([[-106, -7], [-128, -14], [-150, -20], [-162, 0]]), 5, 3, 8, T([-120, 0])), 1.6);
    // gouges inside the sun-facing edges
    Gq(gin(nB, 7, T([-40, -70])), 2.2, '#ffffff');
    Gq(gin(C([[-84, 16], [-44, 24], [-12, 20], [6, 12]]), 6, T([-40, 0]), 6), 2.2, '#fff4c8');
    Gq(gin(fA, 7, T([-90, 40]), 6), 2, '#e6f0ff');
    f += I.flush() + `</g>`;
    // speed lines carved behind the stoop
    let k = `<g fill="none" stroke-linecap="round"><path d="M60 40L128 86M40 70L110 116M70 24L140 64" stroke="#e6f0ff" stroke-width="2.5"/></g>`;
    return fin(b + f + k + frame('violet'));
  },
  'Storm Drake': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), Gq = (d, w = 2.2, c = '#f4f8ff') => I.add(d, w, c);
    let b = scene({ cx: 96, cy: 238, radii: [0, 40, 84, 170, 420], n: [8, 10, 10, 8], rot: 0.4, cols: [['white', 'pearl'], ['sky', 'pearl'], ['sky', 'deep'], ['violet', 'deep']],
      ground: [[244, 252, 5, 0, 'teal'], [268, 274, 4, 2, 'navy']], r1: 50, r2: 64 });
    Gq('M150 60C170 56 186 62 206 58M40 110C60 106 76 112 96 108M300 220C320 216 336 222 356 218M36 160C52 156 64 162 80 158', 1.5, '#9a8ae0');
    b += I.flush();
    // lightning from the wing tip and the claws to the ground: one strike per wind ally
    const bolts = [[[164, 100], [146, 128], [160, 132], [130, 172], [144, 176], [114, 214], [124, 216], [98, 240]], [[236, 172], [220, 196], [232, 200], [208, 228], [218, 232], [190, 260]], [[302, 180], [290, 204], [302, 208], [282, 236], [292, 240], [274, 266]]];
    let k = `<g stroke="${INK}" stroke-width="3" stroke-linejoin="round">` + bolts.map((q, i) => `<path d="${bolt(q, i ? 5 : 7)}" fill="url(#gold)"/><path d="${bolt(q, i ? 2 : 3)}" fill="url(#white)" stroke-width="1.5"/>`).join('') + '</g>';
    const S = [276, 100], W = [246, 48], Tp = [[164, 96], [190, 40], [292, 34], [318, 96]];
    const fore = `M${P(S)}L${P(W)}L${P(Tp[0])}Q${P(lerp(lerp(Tp[0], S, 0.5), W, 0.2))} ${P(S)}Z`;
    const mem = membrane(W, Tp, ['pearl', 'sky']);
    const farW = membrane([326, 78], [[334, 40], [378, 74], [352, 108]], ['steel', 'sky']);
    const tail = sm([[330, 106], [362, 110], [380, 138], [376, 176], [358, 206, 1], [364, 176], [360, 146], [346, 128], [324, 126]]);
    const spade = poly([[358, 200], [342, 196], [352, 222], [370, 204]]);
    const body = sm([[256, 102], [292, 90], [332, 96], [358, 118], [348, 142], [300, 150], [262, 138]]);
    const neck = sm([[210, 146], [224, 118], [252, 96], [284, 104], [272, 130], [250, 150], [232, 166]]);
    const legF = sm([[260, 124], [244, 150], [232, 168, 1], [246, 172], [262, 156], [276, 134]]);
    const legH = sm([[316, 132], [312, 158], [300, 178, 1], [316, 178], [330, 156], [338, 130]]);
    const head = sm([[168, 176, 1], [184, 150], [204, 134], [226, 136], [236, 154], [220, 170], [196, 178]]);
    const jaw = sm([[176, 190, 1], [198, 182], [222, 172], [222, 184], [198, 196]]);
    const horns = [poly([[210, 140], [252, 110], [226, 152]])];
    let f = '<g data-figure="1">' + under([...farW.map((x) => x[0]), tail, spade, legH, body, neck, legF, head, jaw, ...horns, fore, ...mem.map((x) => x[0])]);
    f += panes([...farW, [tail, 'pearl'], [spade, 'gold'], [legH, 'teal'], [body, 'pearl'],
      [sm([[262, 104], [292, 93], [330, 99], [350, 116], [324, 110], [290, 106]]), 'steel'],
      [neck, 'pearl'],
      [legF, 'pearl'], [head, 'pearl'], [jaw, 'sky'], ...horns.map((d) => [d, 'gold']), [ring([214, 150], 4), 'gold'], [fore, 'sky'], ...mem]);
    // carved bones of the wing
    I.add(`M${P(S)}L${P(W)}L${P(Tp[1])}`, 6);
    H(hin(fan(W, Tp, 2), 5, 4, 12, cen(W, Tp[2], Tp[3]), { t0: 0.4 }), 1.8);
    H(hin([[262, 104], [292, 92], [330, 98], [352, 116]], 6, 5, 12, [300, 120], { swell: true }), 2);
    
        
    Gq(gin([[214, 146], [222, 130], [240, 110], [254, 100]], 6, [250, 124]), 2.5);
    Gq('M196 66l14 10l-8 4l18 12', 2.5, '#fff3c0');
    Gq('M180 182l4 4l3-5l4 4l3-5l4 4', 1.5, '#ffffff');
    f += I.flush() + '</g>';
    return fin(b + k + f + frame('violet'));
  },
  'Ember Whelp': () => {
    // authored leaping right, drawn mirrored so it leaps left toward the low sun
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), Gq = (d, w = 2.2, c = '#ffe9b0') => I.add(d, w, c);
    const M = (Q) => Q.map((p) => [400 - p[0], p[1], p[2]]), S = (Q) => sm(M(Q)), L = (a, c, t, n) => leaf(...M([a, c, t]), -n);
    let b = scene({ cx: 82, cy: 140, radii: [0, 32, 70, 150, 420], n: [8, 10, 10, 7], rot: 0.2, cols: [['white', 'gold'], ['gold', 'amber'], ['violet', 'deep'], ['navy', 'deep']],
      ground: [[248, 240, 4, 1, 'teal'], [268, 264, 4, 2.5, 'navy']], r1: 42, r2: 56 });
    Gq('M240 40C256 36 270 42 286 38M330 190C346 186 360 192 376 188', 1.5, '#7f9ae8');
    b += I.flush();
    const body = S([[150, 176], [184, 152], [226, 148], [252, 160], [246, 186], [212, 200], [170, 204], [146, 196]]);
    const haunch = S([[136, 172], [164, 162], [182, 184], [170, 208], [144, 208], [130, 190]]);
    const legH = S([[150, 200], [120, 224], [92, 236, 1], [102, 246], [134, 234], [168, 206]]);
    const legF = S([[236, 178], [262, 194], [290, 196, 1], [286, 208], [256, 210], [228, 194]]);
    const legF2 = S([[222, 190], [236, 214], [254, 226, 1], [240, 230], [220, 216], [208, 196]]);
    const tail = S([[150, 178], [118, 190], [88, 214], [68, 244, 1], [84, 238], [106, 216], [130, 204], [154, 198]]);
    const fl = [L([60, 236], [76, 248], [34, 262], 6), L([64, 240], [74, 252], [52, 280], -5)];
    const neck = S([[222, 152], [240, 136], [262, 130], [268, 150], [250, 170]]);
    const head = S([[248, 134], [262, 116], [290, 114], [314, 128, 1], [302, 140], [276, 148], [254, 150]]);
    const jaw = S([[266, 156], [306, 150, 1], [296, 162], [268, 166]]);
    const horns = [poly(M([[256, 124], [238, 98], [266, 118]])), poly(M([[270, 116], [264, 92], [282, 116]]))];
    const W = [196, 96], Tw = [[238, 94], [222, 62], [186, 50], [158, 70], [168, 128]], Sh = [214, 150];
    const fore = `M${P(M([Sh])[0])}L${P(M([W])[0])}L${P(M([Tw[0]])[0])}Q${P(M([[226, 126]])[0])} ${P(M([Sh])[0])}Z`;
    const mem = membrane(...M([W]), M(Tw), ['ruby', 'wine']);
    const spit = [L([304, 142], [306, 154], [366, 146], 5), L([306, 145], [306, 152], [350, 148], 2)];
    let f = '<g data-figure="1">' + under([tail, ...fl, legF2, legH, haunch, body, legF, neck, head, jaw, ...horns, fore, ...mem.map((x) => x[0]), spit[0]]);
    f += panes([[fl[0], 'amber'], [fl[1], 'gold'], [tail, 'red'], [legF2, 'wine'], [legH, 'red'], [haunch, 'red'], [body, 'orange'],
      [S([[148, 178], [184, 152], [214, 148], [192, 162], [166, 180]]), 'wine'], [S([[228, 150], [252, 160], [246, 186], [222, 198], [234, 172]]), 'gold'],
      [legF, 'orange'], [neck, 'orange'], [head, 'orange'], [S([[252, 134], [262, 118], [280, 114], [270, 128], [258, 148]]), 'wine'], [jaw, 'red'],
      ...horns.map((d) => [d, 'gold']), [ring(M([[282, 126]])[0], 6), 'white'], [fore, 'ruby'], ...mem, [spit[0], 'amber'], [spit[1], 'white']]);
    f += `<circle cx="${400 - 284}" cy="126" r="2.5" fill="${INK}"/>`;
    I.add(`M${P(M([Sh])[0])}L${P(M([W])[0])}` + M(Tw.slice(0, 4)).map((t) => `M${P(M([W])[0])}L${P(t)}`).join(''), 5);
    for (let i = 1; i < 4; i++) H(hin(fan(M([W])[0], M(Tw), i), 4, 3, 9, cen(...M([W, Tw[i], Tw[i + 1]])), { t0: 0.3 }), 1.6);
    H(hin(M([[136, 172], [130, 190], [144, 208], [170, 208]]), 6, 4, 10, M([[158, 188]])[0], { swell: true }), 2);
    H(hin(M([[150, 178], [118, 190], [88, 214], [68, 244]]), 7, 3, 7, M([[120, 206]])[0]), 1.8);
    H(hin(M([[150, 178], [166, 162], [184, 152], [206, 150]]), 5, 4, 9, M([[186, 176]])[0], { swell: true }), 1.8);
    H(hin(M([[150, 200], [130, 216], [110, 230], [92, 236]]), 5, 3, 6, M([[130, 228]])[0]), 1.6);
    Gq(gin(M([[230, 152], [250, 162], [250, 180], [236, 194]]), 6, M([[230, 172]])[0], 5), 2.5);
    Gq(gin(M([[262, 118], [282, 112], [300, 118], [312, 128]]), 6, M([[284, 134]])[0], 5), 2.2);
    Gq(gin(M([[236, 182], [256, 194], [272, 198], [288, 198]]), 4, M([[262, 202]])[0], 4), 2);
    Gq(M([[300, 150], [296, 156], [292, 151], [288, 157], [284, 152]]).map((p, i) => (i ? 'L' : 'M') + P(p)).join(''), 1.5, '#fff6e0');
    f += I.flush() + '</g>';
    // flung embers: the heat it leaves behind
    let k = `<g fill="url(#gold)" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round">` + [[34, 150], [46, 116], [24, 184], [60, 196]].map(([x, y]) => `<path d="M${x} ${y - 6}l5 6l-5 6l-5-6Z"/>`).join('') + '</g>';
    return fin(b + f + k + frame('ruby'));
  },
  'Pyre Phoenix': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), Gq = (d, w = 2.2, c = '#ffe9b0') => I.add(d, w, c);
    let b = scene({ cx: 214, cy: 250, radii: [0, 56, 120, 200, 420], n: [8, 10, 12, 7], rot: 0.1, cols: [['white', 'gold'], ['amber', 'gold'], ['deep', 'amber'], ['deep', 'violet']],
      ground: [[250, 244, 4, 0.5, 'teal'], [272, 268, 3, 2, 'navy']], r1: 60, r2: 76 });
    Gq('M240 60C256 56 270 62 286 58M40 200C56 196 70 202 86 198M310 160C326 156 340 162 356 158M60 60C76 56 90 62 106 58', 1.5, '#7f9ae8');
    b += I.flush();
    // the pyre it rises from: crossed logs, black woodcut, lit on the fire side
    let k = `<g stroke="${INK}" stroke-width="3" stroke-linejoin="round"><path d="M150 266L262 238L266 250L154 278Z" fill="${INK}"/><path d="M168 240L274 268L270 280L164 252Z" fill="${INK}"/><path d="M196 260L248 247L250 254L198 267Z" fill="url(#bronze)"/></g>`;
    k += `<g stroke="${INK}" stroke-width="3" stroke-linejoin="round"><path d="${leaf([176, 252], [200, 254], [186, 214], 4)}" fill="url(#orange)"/><path d="${leaf([226, 248], [250, 252], [252, 206], -4)}" fill="url(#amber)"/></g>`;
    const body = sm([[146, 104], [168, 106], [180, 132], [176, 170], [160, 196], [142, 190], [132, 160], [134, 126]]);
    const head = sm([[146, 90], [156, 72], [176, 66], [192, 74], [204, 80, 1], [190, 88], [178, 100], [156, 104]]);
    const beak = poly([[190, 72], [216, 82], [190, 90]]);
    const crest = [leaf([152, 76], [164, 68], [124, 30], -6), leaf([162, 70], [176, 66], [152, 22], -4), leaf([172, 68], [184, 72], [190, 30], -4)];
    const rA = [[176, 116], [212, 82], [252, 54], [300, 54]], rB = [[180, 158], [230, 142], [276, 102], [300, 54]];
    const lA = [[140, 118], [110, 100], [70, 98], [26, 122]], lB = [[138, 158], [108, 170], [64, 166], [26, 122]];
    const rW = wing(rA, rB, 7, ['red', 'orange'], ['amber', 'gold'], 8), lW = feathers(lA, lB, 6, ['red', 'orange'], 7, 0, 0.92);
    const tl = [leaf([140, 184], [154, 194], [118, 270], 8), leaf([148, 190], [166, 190], [170, 264], -6), leaf([160, 186], [176, 174], [222, 228], -10)];
    let f = '<g data-figure="1">' + under([...tl, ...lW.map((x) => x[0]), body, ...rW.map((x) => x[0]), head, beak, ...crest]);
    f += panes([[tl[0], 'red'], [tl[1], 'orange'], [tl[2], 'gold'], ...lW, [body, 'orange'],
      [sm([[146, 104], [136, 124], [132, 158], [140, 186], [146, 150], [152, 120]]), 'wine'], [sm([[170, 112], [180, 134], [176, 168], [162, 190], [166, 150]]), 'gold'],
      ...rW, [head, 'red'], [sm([[178, 70], [192, 74], [204, 80], [190, 88], [178, 98], [180, 84]]), 'orange'], [beak, 'gold'], [crest[0], 'gold'], [crest[1], 'amber'], [crest[2], 'gold'], [ring([180, 78], 4), 'white']]);
    H(hin(rA, 10, 4, 14, [230, 110], { swell: true }), 1.8);
    H(hin(lA, 8, 4, 13, [80, 130], { swell: true }), 1.8);
    H(hin(lB, 8, 4, 12, [80, 130], { swell: true }), 1.8);
    H(hin([[146, 90], [150, 80], [156, 72], [170, 66]], 4, 3, 7, [166, 86]), 1.6);
    H(hin([[140, 184], [130, 210], [124, 240], [118, 270]], 6, 3, 7, [140, 230]), 1.6);
    Gq(gin(rB, 8, [240, 110]), 2.5);
    Gq(gin([[170, 108], [180, 132], [178, 160], [164, 190]], 6, [158, 150], 5), 2.5);
    Gq('M156 196C162 220 166 240 168 258M166 186C184 198 198 210 214 222', 2, '#fff6c8');
    f += I.flush() + '</g>';
    return fin(b + k + f + frame('ruby'));
  },
  'Sky Hunter': () => {
    // authored on the right third and drawn mirrored: the hawk climbs on the left, the sun is at upper right
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), Gq = (d, w = 2.2, c = '#ffffff') => I.add(d, w, c);
    const M = (Q) => Q.map((p) => [400 - (262 + (p[0] - 262) * 1.1), 140 + (p[1] - 150) * 1.1, p[2]]), S = (Q) => sm(M(Q)), m1 = (p) => M([p])[0];
    let b = scene({ cx: 292, cy: 104, radii: [0, 34, 74, 150, 420], n: [10, 12, 12, 8], rot: 0.05, cols: [['white', 'ivory'], ['pearl', 'sky'], ['deep', 'sky'], ['navy', 'deep']],
      ground: [[242, 254, 6, 2, 'teal'], [266, 274, 4, 0, 'navy']], r1: 44, r2: 58 });
    Gq('M40 140C56 136 70 142 86 138M330 200C346 196 360 202 376 198M60 210C76 206 90 212 106 208M190 40C206 36 220 42 236 38', 1.5, '#a8c8ff');
    b += I.flush();
    const body = S([[238, 118], [262, 110], [290, 126], [300, 162], [292, 198], [272, 214], [252, 206], [238, 178], [230, 146]]);
    const head = S([[226, 124], [230, 106], [248, 98], [266, 104], [268, 120], [252, 132], [236, 136]]);
    const beak = S([[228, 116], [210, 130, 1], [226, 128], [236, 132]]);
    const nA = M([[244, 130], [212, 108], [184, 80], [164, 56]]), nB = M([[262, 140], [256, 104], [238, 72], [212, 50]]);
    const fA = M([[278, 126], [300, 104], [318, 86], [334, 72]]), fB = M([[290, 152], [326, 142], [350, 114], [334, 72]]);
    const nW = feathers(nA, nB, 4, ['pearl', 'sky'], 9, 0, 0.92), fW = feathers(fA, fB, 4, ['sky', 'steel'], 6, 0, 0.92);
    const tail = S([[256, 202, 1], [242, 246], [256, 260], [278, 258], [290, 244], [282, 202, 1]]);
    const legs = S([[260, 204], [256, 230, 1], [276, 230, 1], [278, 204]]);
    let f = '<g data-figure="1">' + under([...fW.map((x) => x[0]), tail, body, legs, ...nW.map((x) => x[0]), head, beak]);
    f += panes([...fW, [tail, 'pearl'], [body, 'pearl'], [S([[276, 122], [290, 150], [290, 186], [276, 208], [282, 176], [282, 148]]), 'steel'], [legs, 'gold'], ...nW,
      [head, 'white'], [beak, 'gold'], [ring(m1([242, 114]), 4), 'amber']]);
    H(hin(nA, 7, 4, 14, m1([236, 90]), { swell: true }), 1.8);
    H(hin(fB, 5, 4, 12, m1([320, 110]), { swell: true }), 1.8);
    H(hin(M([[286, 128], [294, 160], [290, 196], [272, 212]]), 4, 4, 9, m1([270, 170])), 1.8);
    Gq(gin(nB, 7, m1([236, 90])), 2.2);
    Gq(gin(M([[240, 128], [236, 146], [242, 176], [256, 204]]), 6, m1([262, 160]), 5), 2.2, '#fff4c8');
    f += I.flush() + '</g>';
    // its first kill hangs from the talons; the next one runs below
    const sn = M([[268, 228], [300, 230], [312, 250], [290, 262], [258, 264], [240, 276]]);
    let k = `<path d="${sm(sn, false)}" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="${sm(sn.slice(1, 5), false)}" fill="none" stroke="url(#teal)" stroke-width="4" stroke-linecap="round"/><ellipse cx="${R(m1([240, 276])[0])}" cy="${R(m1([240, 276])[1])}" rx="9" ry="6" fill="${INK}"/>`;
    const hx = 400 - 86;
    k += `<g fill="${INK}"><ellipse cx="${hx}" cy="248" rx="22" ry="12"/><circle cx="${hx - 20}" cy="238" r="9"/><path d="M${hx - 20} 232l2-22l7 2l-2 20Z"/><path d="M${hx - 12} 234l10-18l5 4l-10 16Z"/><path d="M${hx + 8} 256l14 8l-6 2Z"/></g><ellipse cx="${hx + 2}" cy="246" rx="11" ry="6" fill="url(#bronze)" stroke="${INK}" stroke-width="2"/>`;
    k += `<path d="M${hx - 28} 236q2-8 8-10M${hx - 10} 238q10-6 22-1" fill="none" stroke="#ffe9b0" stroke-width="2" stroke-linecap="round"/>`;
    return fin(b + f + k + frame('violet'));
  },
  'Sky Sovereign': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), Gq = (d, w = 2.2, c = '#ffffff') => I.add(d, w, c);
    let b = scene({ cx: 118, cy: 84, radii: [0, 38, 80, 160, 420], n: [10, 12, 12, 8], rot: 0.3, cols: [['white', 'ivory'], ['pearl', 'sky'], ['sky', 'deep'], ['deep', 'violet']],
      ground: [[252, 246, 4, 1, 'teal'], [272, 270, 3, 3, 'navy']], r1: 48, r2: 62 });
    Gq('M30 170C46 166 60 172 76 168M220 40C236 36 250 42 266 38M180 230C196 226 210 232 226 228', 1.5, '#a8c8ff');
    // the crag it holds
    b += `<g stroke="${INK}" stroke-width="3" stroke-linejoin="round"><path d="${sm([[210, 300, 1], [226, 248], [258, 228], [300, 236], [344, 222], [390, 226, 1], [390, 300, 1]])}" fill="url(#navy)"/><path d="${sm([[250, 300, 1], [262, 260], [300, 246], [336, 252], [360, 300, 1]])}" fill="url(#teal)"/></g>`;
    b += I.flush();
    const body = sm([[284, 118], [308, 110], [330, 128], [342, 170], [336, 206], [316, 226], [292, 222], [280, 190], [276, 150]]);
    const head = sm([[262, 104], [272, 86], [294, 80], [312, 90], [310, 112], [292, 122], [272, 118]]);
    const beak = sm([[266, 94], [240, 106, 1], [250, 114], [268, 112]]);
    const crown = poly([[276, 88], [278, 60], [288, 78], [296, 54], [302, 80], [314, 64], [310, 92]]);
    const nA = [[284, 126], [248, 102], [198, 96], [140, 116]], nB = [[290, 178], [250, 196], [196, 186], [140, 116]];
    const fA = [[326, 124], [352, 116], [372, 120], [382, 142]], fB = [[334, 172], [356, 180], [374, 166], [382, 142]];
    const nW = feathers(nA, nB, 4, ['pearl', 'sky'], 10, 0, 0.92), fW = feathers(fA, fB, 3, ['steel', 'sky'], 5, 0, 0.92);
    const tail = poly([[300, 214], [292, 262], [328, 262], [326, 214]]);
    const talon = sm([[292, 218], [288, 240, 1], [304, 236], [318, 242, 1], [320, 220]]);
    let f = '<g data-figure="1">' + under([...fW.map((x) => x[0]), tail, body, talon, ...nW.map((x) => x[0]), head, beak, crown], 10);
    f += panes([...fW, [tail, 'steel'], [body, 'pearl'], [sm([[318, 118], [336, 146], [340, 186], [326, 216], [330, 180], [326, 146]]), 'steel'],
      [talon, 'gold'], ...nW,
      [head, 'white'], [crown, 'gold'], [ring([295, 78], 4), 'ruby'], [beak, 'gold'], [ring([280, 96], 4), 'amber']]);
    H(hin(nB, 7, 4, 14, [220, 150], { swell: true }), 1.8);
    
    
    Gq(gin(nA, 8, [220, 150]), 2.5);
    Gq(gin([[282, 130], [278, 150], [280, 190], [292, 220]], 6, [306, 170], 5), 2.2, '#fff4c8');
    Gq('M268 92q8-8 20-8', 2, '#fff6c8');
    f += I.flush() + '</g>';
    // its call sends the wind flock back into the attack
    const k = bird(70, 176, 2.2, 'sky', -1) + bird(160, 226, 1.7, 'pearl', -1) + bird(52, 238, 1.4, 'sky', -1) + `<path d="M58 172q10-6 22-6M144 220q8-4 16-4" fill="none" stroke="#ffe9b0" stroke-width="2" stroke-linecap="round"/>`;
    return fin(b + k + f + frame('violet'));
  },
  'Gale Harpy': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), Gq = (d, w = 2.2, c = '#ffffff') => I.add(d, w, c);
    let b = scene({ cx: 214, cy: 92, radii: [0, 34, 76, 150, 420], n: [8, 10, 10, 7], rot: 0.2, cols: [['white', 'pearl'], ['sky', 'pearl'], ['violet', 'deep'], ['navy', 'violet']],
      ground: [[240, 250, 5, 2, 'teal'], [264, 272, 4, 0, 'navy']], r1: 44, r2: 58 });
    const torso = sm([[112, 120], [132, 112], [150, 124], [154, 150], [146, 176], [128, 186], [112, 176], [106, 148]]);
    const head = sm([[132, 92], [146, 78], [164, 80], [172, 94], [170, 110], [152, 116], [136, 110]]);
    const hair = [leaf([132, 84], [140, 100], [62, 66], -8), leaf([134, 96], [136, 110], [70, 104], 6), leaf([140, 80], [152, 78], [96, 40], -6)];
    const rA = [[146, 124], [190, 92], [236, 116], [258, 196]], rB = [[150, 158], [186, 142], [220, 160], [258, 196]];
    const lA = [[114, 122], [76, 94], [40, 116], [28, 196]], lB = [[112, 156], [84, 140], [54, 156], [28, 196]];
    const rW = wing(rA, rB, 7, ['pearl', 'sky'], ['white', 'pearl'], 7), lW = feathers(lA, lB, 6, ['sky', 'steel'], 7, 0, 0.92);
    const leg1 = sm([[128, 178], [152, 204], [178, 220, 1], [180, 232], [146, 222], [118, 190]]);
    const leg2 = sm([[118, 184], [128, 218], [146, 240, 1], [134, 246], [112, 222], [106, 186]]);
    const tl = [leaf([106, 172], [120, 184], [64, 246], 8), leaf([112, 180], [126, 186], [92, 262], -4)];
    let f = '<g data-figure="1">' + under([...hair, ...lW.map((x) => x[0]), ...tl, leg2, torso, leg1, ...rW.map((x) => x[0]), head]);
    f += panes([[hair[0], 'violet'], [hair[1], 'violet'], [hair[2], 'violet'], ...lW, [tl[0], 'sky'], [tl[1], 'pearl'], [leg2, 'steel'], [torso, 'teal'],
      [sm([[132, 116], [148, 126], [152, 150], [144, 172], [134, 150]]), 'pearl'], [leg1, 'steel'], ...rW, [head, 'skin'],
      [sm([[132, 92], [146, 78], [164, 80], [156, 88], [142, 96], [138, 108]]), 'violet'], [ring([170, 104], 5), 'violet']]);
    f += `<path d="M152 92l8-2l-2 5Z" fill="${INK}"/>`;
    H(hin(lA, 9, 4, 13, [70, 150], { swell: true }), 1.8);
    H(hin(rB, 9, 4, 12, [210, 130], { swell: true }), 1.8);
    H(hin([[112, 120], [104, 140], [106, 166], [118, 184]], 6, 4, 9, [130, 150]), 1.8);
    Gq(gin(rA, 8, [210, 140]), 2.5);
    Gq(gin([[150, 124], [156, 140], [154, 160], [146, 176]], 5, [128, 150], 4), 2.2, '#e6fff8');
    f += I.flush() + '</g>';
    // the shriek: carved rings rolling out ahead of the dive, rousing the wind
    let k = '';
    for (const [r, w] of [[30, 4], [48, 3.5], [66, 3]]) {
      const c = [172, 106], a0 = -0.5, a1 = 0.9, p0 = [c[0] + r * Math.cos(a0), c[1] + r * Math.sin(a0)], p1 = [c[0] + r * Math.cos(a1), c[1] + r * Math.sin(a1)];
      const d = `M${P(p0)}A${r} ${r} 0 0 1 ${P(p1)}`;
      k += `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 6}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#ffffff" stroke-width="${w}" stroke-linecap="round"/>`;
    }
    return fin(b + f + k + frame('violet'));
  },
});
