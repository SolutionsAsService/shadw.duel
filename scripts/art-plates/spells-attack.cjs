'use strict';
// Attack spells in the carved-glass style (GDADA run 3). See docs/ART_STYLE.md.
const { Ink, INK, R, defs, burst, hatch, offset, frame } = require('../art-lib/glass.cjs');

const P2 = (p) => `${R(p[0])} ${R(p[1])}`;
const mid = (a, b) => `${R((a[0] + b[0]) / 2)} ${R((a[1] + b[1]) / 2)}`;
// closed curve through the midpoints of a point loop (rounded pane)
function smooth(P) {
  let d = `M${mid(P[0], P[1])}`;
  for (let i = 1; i <= P.length; i++) d += `Q${P2(P[i % P.length])} ${mid(P[i % P.length], P[(i + 1) % P.length])}`;
  return d + 'Z';
}
const poly = (P) => 'M' + P.map(P2).join('L') + 'Z';
const rad = (a) => (a * Math.PI) / 180;
// rotate/translate local points (x forward along angle)
const xf = (cx, cy, a) => { const c = Math.cos(rad(a)), s = Math.sin(rad(a)); return (P) => P.map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c]); };
// flame tongue from (x,y) along angle a (deg)
function tongue(x, y, a, len, w, amp = 0, ph = 0, K = 5) {
  const D = [Math.cos(rad(a)), Math.sin(rad(a))], N = [-D[1], D[0]], l = [], r = [];
  for (let i = 0; i <= K; i++) {
    const t = i / K, wt = w * Math.pow(1 - t, 0.9) + 0.5, o = amp * Math.sin(t * 7 + ph) * t;
    const cx = x + D[0] * t * len + N[0] * o, cy = y + D[1] * t * len + N[1] * o;
    l.push([cx - N[0] * wt, cy - N[1] * wt]); r.unshift([cx + N[0] * wt, cy + N[1] * wt]);
  }
  return smooth(l.concat(r));
}
// hatch contour along a tongue's side s (+1/-1), strokes pointing back across it
function tside(x, y, a, len, w, s, f0 = 0.08, f1 = 0.7) {
  const D = [Math.cos(rad(a)), Math.sin(rad(a))], N = [-D[1], D[0]];
  return [0, 1, 2, 3].map((i) => { const f = f0 + ((f1 - f0) * i) / 3, o = s * w * 0.85 * Math.pow(1 - f, 0.9); return [x + D[0] * f * len + N[0] * o, y + D[1] * f * len + N[1] * o]; });
}
// zigzag strip of half-width w through points
function zig(C, w) {
  const l = [], r = [];
  C.forEach((p, i) => {
    const a = C[Math.max(0, i - 1)], b = C[Math.min(C.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    const ww = i === C.length - 1 ? 1 : w * (1 - (0.5 * i) / C.length);
    l.push([p[0] - (dy / L) * ww, p[1] + (dx / L) * ww]); r.unshift([p[0] + (dy / L) * ww, p[1] - (dx / L) * ww]);
  });
  return poly(l.concat(r));
}
const bzp = (p, t) => { const u = 1 - t; return [0, 1].map((j) => u * u * u * p[0][j] + 3 * u * u * t * p[1][j] + 3 * u * t * t * p[2][j] + t * t * t * p[3][j]); };
// ribbon along bezier, half-width w0 -> w1
function ribbon(p, w0, w1, K = 8) {
  const l = [], r = [];
  for (let i = 0; i <= K; i++) {
    const t = i / K, a = bzp(p, Math.max(0, t - 0.02)), b = bzp(p, Math.min(1, t + 0.02)), c = bzp(p, t);
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, w = w0 + (w1 - w0) * t;
    l.push([c[0] - (dy / L) * w, c[1] + (dx / L) * w]); r.unshift([c[0] + (dy / L) * w, c[1] - (dx / L) * w]);
  }
  return smooth(l.concat(r));
}
const under = (ds, w = 9) => `<path d="${ds.join('')}" fill="${INK}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round"/>`;
const panes = (list, w = 3.5) => `<g stroke="${INK}" stroke-width="${w}" stroke-linejoin="round">${list.map(([d, c]) => `<path d="${d}" fill="url(#${c})"/>`).join('')}</g>`;
const wave = (y, a, ph) => `M0 300V${y}C${60 + ph} ${y - a} ${130 + ph} ${y + a} 200 ${y}C${270 - ph} ${y - a} ${330 - ph} ${y + a} 400 ${y - 2}V300Z`;
// background: rect, carved burst, two ground bands, two dashed rings
function bg(cx, cy, radii, n, cols, rot, gr, gc, ring = [44, 58]) {
  let b = `<rect width="400" height="300" fill="${INK}"/><g stroke="${INK}" stroke-width="3" stroke-linejoin="round">`;
  b += burst(cx, cy, radii, n, (k, i) => cols[k][i % 2], rot);
  b += `<path d="${wave(gr[0], 8, gr[2] || 0)}" fill="url(#${gc[0]})"/><path d="${wave(gr[1], 6, -(gr[2] || 0))}" fill="url(#${gc[1]})"/></g>`;
  b += `<g fill="none" stroke="${INK}" stroke-linecap="round"><circle cx="${cx}" cy="${cy}" r="${ring[0]}" stroke-width="2.5" stroke-dasharray="16 6 30 8 10 6"/><circle cx="${cx}" cy="${cy}" r="${ring[1]}" stroke-width="2" stroke-dasharray="24 9 12 7 36 10"/></g>`;
  return b;
}
const pens = () => { const I = Ink(); return [I, (d, w = 1.8) => I.add(d, w), (d, w = 2, c = '#ffe9b0') => I.add(d, w, c)]; };
// small black woodcut figure from limb strokes [[x,y]...], head, and torso
function man(torso, limbs, head, w = 7) {
  return `<g fill="none" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round"><path d="${limbs.map((L) => 'M' + L.map(P2).join('L')).join('')}" stroke-width="${w}"/><path d="M${P2(torso[0])}L${P2(torso[1])}" stroke-width="${w * 2}"/></g><circle cx="${head[0]}" cy="${head[1]}" r="${head[2]}" fill="${INK}"/>`;
}

module.exports = () => ({
  // ------------------------------------------------------------ Flame Burst
  // A fan of flame erupts from the ground on the right third and hurls a shielded foe back.
  'Flame Burst': () => {
    const [I, H, G] = pens();
    const CX = 270, CY = 236;
    let b = defs(['white', 'gold', 'amber', 'orange', 'red', 'ruby', 'wine', 'violet', 'deep', 'navy', 'teal', 'bronze']);
    b += bg(CX, CY, [0, 40, 92, 168, 460], [8, 8, 10, 6], [['white', 'gold'], ['gold', 'amber'], ['wine', 'violet'], ['deep', 'navy']], 0.1, [248, 270, 10], ['teal', 'navy'], [50, 64]);
    G('M40 70C56 66 72 72 90 68M30 130C48 126 64 132 84 128M330 110C346 106 360 112 376 108', 1.5, '#7f9ae8');
    b += I.flush();
    const X = 270, Y = 252;
    const outer = [[-90, 190, 30, 8, 0], [-116, 160, 26, 10, 1], [-62, 166, 26, 10, 2], [-144, 122, 22, 8, 0.5], [-36, 126, 22, 8, 3]];
    const T = outer.map(([a, l, w, am, ph]) => tongue(X, Y, a, l, w, am, ph));
    const base = smooth([[226, 262], [236, 236], [270, 222], [304, 236], [316, 262], [270, 270]]);
    let f = `<g data-figure="1">` + under([...T, base]);
    f += panes(T.map((d, i) => [d, i % 2 ? 'red' : 'orange']));
    f += panes([[tongue(X, Y - 4, -90, 150, 19, 6, 0.4), 'amber'], [tongue(X - 4, Y, -116, 118, 16, 8, 1.3), 'amber'], [tongue(X + 4, Y, -64, 124, 16, 8, 2.2), 'gold'], [tongue(X, Y - 6, -90, 110, 11, 5, 0.6), 'gold']], 3);
    f += panes([[base, 'amber'], [smooth([[246, 258], [254, 240], [270, 234], [286, 240], [294, 258], [270, 262]]), 'white'], [tongue(X, Y - 10, -90, 66, 6, 3, 0.6), 'white']], 3);
    for (const [a, l, w, , , s] of [[-116, 160, 26, 0, 0, -1], [-144, 122, 22, 0, 0, -1], [-62, 166, 26, 0, 0, 1], [-36, 126, 22, 0, 0, 1], [-90, 190, 30, 0, 0, 1]]) H(hatch(tside(X, Y, a, l, w, s), 7, 10, 3, -s, { inset: 2, tilt: 0.4 * s }), 2);
    H(hatch(tside(X, Y, -144, 122, 22, -1), 4, 7, 3, 1, { tilt: 0.9, inset: 2, t1: 0.5 }), 1.6);
    G('M270 216L268 150M258 222L238 172M282 222L300 170', 2.5, '#fffbe6');
    f += I.flush() + `</g>`;
    // the foe, hurled back with his shield up
    let k = man([[136, 212], [124, 232]], [[[124, 232], [106, 240], [96, 236]], [[124, 232], [114, 252], [118, 262]], [[134, 214], [116, 204], [104, 208]]], [140, 198, 8]);
    k += `<path d="M146 200C160 196 168 206 166 220C164 232 154 238 146 236C150 224 150 212 146 200Z" fill="url(#gold)" stroke="${INK}" stroke-width="3"/>`;
    G('M146 196C150 200 150 206 148 208M132 220L126 230', 2.5, '#ffc85a');
    k += I.flush();
    return b + f + k + frame('ruby');
  },

  // ------------------------------------------------------------ Spark
  // A raised hand flicks a crackling spark up to a four-point star in the upper left.
  Spark: () => {
    const [I, H, G] = pens();
    const SX = 150, SY = 104;
    let b = defs(['white', 'gold', 'pearl', 'sky', 'deep', 'navy', 'teal', 'violet', 'ivory', 'bronze']);
    b += bg(SX, SY, [0, 34, 78, 150, 460], [8, 10, 12, 8], [['white', 'pearl'], ['sky', 'pearl'], ['deep', 'sky'], ['navy', 'deep']], 0.2, [244, 266, -12], ['teal', 'navy'], [42, 56]);
    G('M220 60C240 56 256 62 276 58M250 120C270 116 286 122 306 118M40 200C56 196 70 202 88 198M200 210C214 206 226 212 240 208', 1.5, '#cfe6ff');
    b += I.flush();
    const T0 = xf(296, 210, -140), T = (P) => T0(P.map(([x, y]) => [x * 1.15, y * 1.15]));
    const sleeve = T([[-120, -30], [-54, -26], [-54, 28], [-120, 34]]);
    const cuff = T([[-58, -32], [-40, -30], [-40, 30], [-58, 32]]);
    const fist = T([[-44, -26], [-10, -30], [12, -24], [18, -4], [14, 16], [0, 26], [-30, 28], [-46, 18]]);
    const finger = T([[4, -28], [30, -27], [50, -24], [56, -18], [50, -11], [30, -9], [4, -8]]);
    const thumb = T([[-16, -14], [10, -12], [24, -4], [18, 4], [-14, 4]]);
    const knuck = T([[-6, 4], [14, 2], [10, 22], [-8, 24]]);
    const tip = T([[60, -18]])[0];
    const boltC = [tip, [232, 170], [244, 160], [214, 144], [226, 132], [190, 118]];
    const bolt = zig(boltC, 7);
    const st = [];
    for (let i = 0; i < 16; i++) { const a = rad(-75 + i * 22.5), r = i % 4 === 0 ? 60 : i % 2 ? 11 : 26; st.push([SX + r * Math.cos(a), SY + r * Math.sin(a)]); }
    const star = poly(st);
    const spk = (x, y, r) => poly([[x, y - r], [x + r / 4, y - r / 4], [x + r, y], [x + r / 4, y + r / 4], [x, y + r], [x - r / 4, y + r / 4], [x - r, y], [x - r / 4, y - r / 4]]);
    const small = [spk(212, 102, 16), spk(98, 160, 14), spk(250, 188, 12)];
    let f = `<g data-figure="1">` + under([poly(sleeve), poly(cuff), smooth(fist), smooth(finger), smooth(thumb), bolt, star, ...small]);
    f += panes([[poly(sleeve), 'teal'], [poly(T([[-120, 6], [-54, 4], [-54, 28], [-120, 34]])), 'deep'], [poly(cuff), 'violet'], [smooth(fist), 'pearl'], [poly(knuck), 'sky'], [smooth(finger), 'pearl'], [smooth(thumb), 'ivory']]);
    // star panes: eight wedges, white and gold
    const wed = [];
    for (let i = 0; i < 8; i++) wed.push([poly([[SX, SY], st[2 * i], st[(2 * i + 1) % 16], st[(2 * i + 2) % 16]]), i % 2 ? 'gold' : 'white']);
    f += panes([[bolt, 'white'], ...wed, ...small.map((d) => [d, 'gold'])], 3);
    H(hatch(T([[-110, 30], [-90, 30], [-70, 28], [-56, 26]]), 6, 10, 6, 1, { tilt: 0.4 }) + hatch(T([[-40, 26], [-20, 28], [0, 26], [14, 16]]), 6, 4, 9, 1, { tilt: 0.3 }), 2);
    H(hatch(T([[-110, 32], [-90, 31], [-70, 29], [-58, 27]]), 4, 8, 6, 1, { tilt: 1.0 }), 1.6);
    G(offset(T([[-40, -24], [-20, -28], [0, -26], [12, -22]]), 6, -1, 4) + offset(T([[6, -24], [24, -24], [40, -22], [50, -20]]), 3, -1, 3), 2.2, '#ffffff');
    G(`M${P2(T([[-110, -20]])[0])}L${P2(T([[-60, -18]])[0])}`, 2.2, '#c8fff4');
    G(`M${SX} ${SY}L${SX + 28} ${SY - 40}M${SX} ${SY}L${SX - 40} ${SY - 10}`, 2, '#fff');
    f += I.flush() + `</g>`;
    return b + f + frame('violet');
  },

  // ------------------------------------------------------------ Lightning Strike
  // A forked bolt drops down the left third and blasts a foe off his feet.
  'Lightning Strike': () => {
    const [I, H, G] = pens();
    const CX = 112, CY = 236;
    let b = defs(['white', 'gold', 'pearl', 'sky', 'deep', 'navy', 'teal', 'violet', 'bronze']);
    b += bg(CX, CY, [0, 40, 86, 160, 460], [10, 10, 12, 8], [['white', 'pearl'], ['pearl', 'sky'], ['deep', 'sky'], ['navy', 'deep']], 0.05, [250, 272, 16], ['teal', 'navy'], [52, 66]);
    G('M250 40l-10 30M290 50l-10 30M330 60l-10 30M260 120l-10 30M300 130l-10 30M350 140l-10 30M240 190l-8 24M330 200l-8 24', 1.6, '#9ac4ff');
    b += I.flush();
    const L = [[180, 20], [130, 100], [160, 104], [108, 188], [136, 192], [104, 262]];
    const Rr = [[230, 20], [188, 92], [218, 96], [150, 176], [176, 180], [104, 262]];
    const C = [[205, 20], [160, 96], [190, 100], [130, 182], [156, 186], [104, 262]];
    const bolt = poly(L.concat(Rr.slice().reverse()));
    const forks = [zig([[140, 136], [100, 128], [88, 150], [52, 150], [40, 170]], 6), zig([[186, 120], [232, 152], [228, 176], [262, 196]], 6), zig([[124, 220], [90, 214], [72, 236]], 5)];
    let f = `<g data-figure="1">` + under([bolt, ...forks]);
    const half = [];
    for (let i = 0; i < 5; i++) {
      half.push([poly([L[i], L[i + 1], C[i + 1], C[i]]), i % 2 ? 'pearl' : 'white']);
      half.push([poly([C[i], C[i + 1], Rr[i + 1], Rr[i]]), i % 2 ? 'sky' : 'teal']);
    }
    f += panes([...half, ...forks.map((d, i) => [d, i === 1 ? 'pearl' : 'white'])], 3);
    H(hatch([[230, 20], [218, 44], [204, 64], [188, 92]], 7, 12, 4, 1, { inset: 2, tilt: -0.3 }) + hatch([[218, 96], [196, 122], [172, 150], [150, 176]], 7, 12, 4, 1, { inset: 2, tilt: -0.3 }), 2);
    H(hatch([[176, 180], [156, 206], [130, 236], [110, 254]], 5, 8, 3, 1, { inset: 2 }), 1.8);
    G(offset([[180, 20], [164, 46], [148, 70], [130, 100]], 7, -1, 5) + offset([[160, 104], [142, 132], [124, 160], [108, 188]], 7, -1, 5), 2.2, '#ffffff');
    f += I.flush() + `</g>`;
    // the struck foe, flung back with his violet shield
    let k = man([[194, 230], [204, 248]], [[[204, 248], [220, 252], [230, 262]], [[204, 248], [198, 266]], [[196, 232], [216, 222], [224, 210]]], [188, 220, 8]);
    k += `<path d="M174 230C170 216 180 208 192 212C194 226 190 236 184 244C178 242 176 238 174 230Z" fill="url(#violet)" stroke="${INK}" stroke-width="3"/>`;
    G('M182 212C176 218 176 226 178 232M198 236L200 246', 2.5, '#e6f0ff');
    k += I.flush();
    k += `<g fill="url(#bronze)" stroke="${INK}" stroke-width="2.5"><path d="M70 246l8-8l6 8l-8 6Z"/><path d="M140 252l6-6l6 6l-6 5Z"/><path d="M58 220l5-6l6 5l-5 6Z"/></g>`;
    return b + f + k + frame('violet');
  },

  // ------------------------------------------------------------ Meteor
  // A faceted burning rock dives from the upper left onto a crowd on the right horizon.
  Meteor: () => {
    const [I, H, G] = pens();
    const CX = 334, CY = 238;
    let b = defs(['white', 'gold', 'amber', 'orange', 'red', 'wine', 'sky', 'deep', 'violet', 'navy', 'teal', 'bronze', 'ruby']);
    b += bg(CX, CY, [0, 32, 84, 186, 460], [10, 10, 12, 8], [['white', 'gold'], ['amber', 'orange'], ['sky', 'deep'], ['deep', 'violet']], 0.3, [250, 272, -8], ['teal', 'navy'], [40, 54]);
    G('M40 200h8M44 196v8M300 40h6M303 37v6M230 70h6M233 67v6M30 280C60 276 90 282 130 278', 2, '#cfe0ff');
    b += I.flush();
    const A = -144, X = 262, Y = 186;
    const T = [[tongue(X + 6, Y + 22, A + 4, 170, 40, 10, 0), 'orange'], [tongue(X - 2, Y - 20, A - 6, 190, 34, 12, 2), 'red'], [tongue(X, Y, A, 205, 34, 10, 1), 'amber'], [tongue(X + 2, Y + 4, A + 1, 160, 22, 8, 3), 'gold'], [tongue(X, Y, A, 120, 12, 6, 0.5), 'white']];
    const O = [[306, 162], [320, 204], [296, 240], [248, 246], [218, 216], [222, 172], [252, 146], [292, 144]];
    const Cc = [286, 206];
    const rock = poly(O);
    let f = `<g data-figure="1">` + under([...T.map(([d]) => d), rock]);
    f += panes(T);
    const fc = ['gold', 'amber', 'gold', 'orange', 'red', 'wine', 'orange', 'red'];
    f += panes(O.map((p, i) => [poly([Cc, p, O[(i + 1) % 8]]), fc[i]]), 3);
    f += `<path d="M282 202l12-6M282 202l-6 12" fill="none" stroke="${INK}" stroke-width="2.5"/>`;
    for (const [o, l] of [[-24, 210], [22, 180]]) {
      const D = [Math.cos(rad(A)), Math.sin(rad(A))], N = [-D[1], D[0]];
      const a = [X + D[0] * 40 + N[0] * o, Y + D[1] * 40 + N[1] * o], e = [X + D[0] * l * 0.8 + N[0] * o * 0.6, Y + D[1] * l * 0.8 + N[1] * o * 0.6];
      H(hatch([a, [a[0] + (e[0] - a[0]) / 3, a[1] + (e[1] - a[1]) / 3], [a[0] + (e[0] - a[0]) * 2 / 3, a[1] + (e[1] - a[1]) * 2 / 3], e], 8, 11, 4, o < 0 ? 1 : -1, { tilt: 0.5, inset: 0 }), 2);
    }
    H(hatch([[222, 172], [230, 160], [240, 152], [252, 146]], 4, 12, 6, -1, { inset: 2 }) + hatch([[218, 216], [218, 200], [220, 186], [222, 172]], 4, 10, 6, -1, { inset: 2 }), 2);
    G(offset([[320, 204], [312, 216], [304, 228], [296, 240]], 7, -1, 4) + offset([[296, 240], [280, 242], [264, 244], [248, 246]], 7, -1, 4), 2.5, '#fffbe6');
    G('M256 186L150 112', 2.5, '#fffbe6');
    f += I.flush() + `</g>`;
    // the crowd at the impact, and flying stones
    let k = '';
    for (const [x, s] of [[318, 1], [350, 0.85], [370, 0.7]]) k += man([[x, 236 - 14 * s], [x, 248 - 6 * s]], [[[x, 248 - 6 * s], [x - 6 * s, 260]], [[x, 248 - 6 * s], [x + 6 * s, 260]], [[x, 232 - 10 * s], [x - 10 * s, 222 - 6 * s]]], [R(x + 2 * s), R(222 - 8 * s), R(6 * s)], 5);
    k += `<path d="M322 236C330 232 338 236 338 244C332 248 326 246 322 236Z" fill="url(#gold)" stroke="${INK}" stroke-width="2.5"/>`;
    k += `<g fill="url(#bronze)" stroke="${INK}" stroke-width="2.5"><path d="M210 236l8-7l7 8l-8 6Z"/><path d="M200 208l5-6l6 5l-5 6Z"/><path d="M316 140l6-6l6 6l-6 6Z"/></g>`;
    return b + f + k + frame('ruby');
  },

  // ------------------------------------------------------------ Void Bolt
  // A violet void spear flies left from a hooded caster; a ruby backlash curls back into him.
  'Void Bolt': () => {
    const [I, H, G] = pens();
    const CX = 92, CY = 128;
    let b = defs(['white', 'pearl', 'ruby', 'wine', 'violet', 'navy', 'ash', 'gold', 'bronze']);
    b += bg(CX, CY, [0, 36, 80, 156, 460], [10, 10, 12, 8], [['white', 'pearl'], ['violet', 'wine'], ['navy', 'violet'], ['ash', 'navy']], 0.1, [252, 272, 6], ['ash', 'navy'], [46, 60]);
    G('M200 40C220 36 236 42 256 38M240 220C260 216 276 222 296 218M60 230C76 226 90 232 108 228M300 80C316 76 330 82 346 78', 1.5, '#a890e8');
    b += I.flush();
    const T = xf(76, 126, 9); // axis from head (0) toward tail (+x)
    const len = 266, hw = (s) => (s < 0.14 ? 34 * (s / 0.14) : 32 - 24 * ((s - 0.14) / 0.86));
    const head = T([[-16, 0], [44, -50], [34, -20], [40, 0], [34, 20], [44, 50]]);
    const segs = [];
    const S = [0.12, 0.24, 0.36, 0.5, 0.64, 0.8, 1];
    for (let i = 0; i < S.length - 1; i++) {
      const s0 = S[i], s1 = S[i + 1], x0 = s0 * len, x1 = s1 * len, w0 = hw(s0 + 0.02), w1 = hw(s1);
      segs.push([poly(T([[x0, -w0], [x1, -w1], [x1 - 14, 0], [x1, w1], [x0, w0], [x0 - 14, 0]])), i % 2 ? 'pearl' : 'violet']);
    }
    const shaft = poly(T([[30, -32], [len, -8], [len - 10, 0], [len, 8], [30, 32]]));
    const back = ribbon([[284, 160], [334, 130], [372, 162], [350, 204]], 20, 6);
    const core = poly(T([[34, 0], [120, -5], [210, 0], [120, 5]]));
    let f = `<g data-figure="1">` + under([poly(head), shaft, back]);
    f += panes([[back, 'ruby'], ...segs, [poly(head), 'pearl']]);
    f += panes([[poly(T([[-16, 0], [44, -50], [34, -20], [40, 0]])), 'white'], [core, 'white']], 2.5);
    // spiral wraps (dark carved) and gouges
    let sp = '';
    for (let i = 0; i < 6; i++) { const x = 70 + i * 32, w = hw(x / len) + 2; sp += 'M' + T([[x, -w], [x + 18, w]]).map(P2).join('L'); }
    H(sp, 2.5);
    H(hatch(T([[60, 22], [120, 18], [180, 14], [230, 9]]), 12, 10, 3, 1, { inset: 2, tilt: 0.3 }), 1.8);
    H(hatch([[296, 176], [330, 164], [348, 176], [344, 200]], 5, 6, 3, -1, { inset: 2 }), 1.8);
    G(offset(T([[44, -36], [100, -30], [160, -22], [220, -14]]), 5, -1, 6), 2.2, '#e6dcff');
    f += I.flush() + `</g>`;
    // the caster, hit by his own backlash
    let k = `<g fill="${INK}"><path d="M330 262C332 236 338 214 352 206C368 210 376 236 378 262Z"/><path d="M342 210C340 194 348 186 358 186C368 190 368 202 364 212Z"/></g>`;
    k += `<path d="M330 214L306 190" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>`;
    k += `<path d="M344 214C352 208 362 212 360 222C354 230 346 228 344 214Z" fill="url(#ruby)" stroke="${INK}" stroke-width="3"/>`;
    G('M340 198C338 206 340 212 344 216M334 234L332 250', 2.5, '#c8b8ff');
    k += I.flush();
    return b + f + k + frame('ruby');
  },

  // ------------------------------------------------------------ Void Collapse
  // A tilted void disc swallows the sky; shards of the caster's own shield are pulled in.
  'Void Collapse': () => {
    const [I, H, G] = pens();
    const CX = 262, CY = 112;
    let b = defs(['white', 'pearl', 'ruby', 'violet', 'navy', 'deep', 'ash', 'teal', 'gold', 'bronze']);
    b += bg(CX, CY, [0, 30, 120, 190, 460], [10, 10, 10, 8], [['violet', 'navy'], ['navy', 'violet'], ['ash', 'navy'], ['navy', 'deep']], 0.15, [246, 268, -14], ['ash', 'navy'], [134, 150]);
    G('M30 70C50 90 70 100 100 104M30 150C60 150 90 140 120 130M120 30C150 50 170 66 190 80M370 220C350 200 330 190 300 180', 1.6, '#8a70d0');
    b += I.flush();
    const k0 = 0.36, phi = rad(-16);
    const E = (r, th) => { const x = r * Math.cos(th), y = r * Math.sin(th) * k0; return [CX + x * Math.cos(phi) - y * Math.sin(phi), CY + x * Math.sin(phi) + y * Math.cos(phi)]; };
    const rings = [[30, 52, 10, ['white', 'pearl']], [52, 84, 12, ['violet', 'ruby']], [84, 116, 14, ['pearl', 'ruby']]];
    const back = [], front = [], outline = [];
    for (const [r0, r1, n, cols] of rings) {
      for (let i = 0; i < n; i++) {
        const a0 = (i / n) * 2 * Math.PI + r0 * 0.02, a1 = ((i + 1) / n) * 2 * Math.PI + r0 * 0.02, P = [];
        // spiral cut: outer edge leads the inner edge
        for (let j = 0; j <= 2; j++) P.push(E(r1, a0 + ((a1 - a0) * j) / 2 + 0.25));
        for (let j = 2; j >= 0; j--) P.push(E(r0, a0 + ((a1 - a0) * j) / 2));
        const am = (a0 + a1) / 2;
        (Math.sin(am) > 0 ? front : back).push([poly(P), cols[i % 2]]);
      }
    }
    for (let i = 0; i < 24; i++) outline.push(E(118, (i / 24) * 2 * Math.PI));
    const hole = `M${CX - 26} ${CY - 6}A26 26 0 1 1 ${CX + 26} ${CY - 6}A26 26 0 1 1 ${CX - 26} ${CY - 6}Z`;
    const sh = [[[150, 196], [176, 186], [168, 210]], [[186, 166], [212, 162], [196, 182]], [[118, 214], [140, 206], [134, 230]], [[214, 144], [232, 140], [222, 156]]];
    let f = `<g data-figure="1">` + under([poly(outline), hole, ...sh.map(poly)]);
    f += panes(back, 3);
    f += `<circle cx="${CX}" cy="${CY - 6}" r="27" fill="url(#pearl)" stroke="${INK}" stroke-width="3"/><circle cx="${CX}" cy="${CY - 6}" r="19" fill="${INK}"/>`;
    f += panes(front, 3);
    f += panes(sh.map((p, i) => [poly(p), ['pearl', 'violet', 'teal', 'ruby'][i]]), 3);
    let hh = '';
    for (let i = 0; i < 9; i++) { const th = Math.PI * (0.15 + i * 0.08); const a = E(116, th), c = E(100, th + 0.1); hh += `M${P2(a)}L${P2(c)}`; }
    H(hh, 2);
    let gg = '';
    for (let i = 0; i < 6; i++) { const th = Math.PI * (1.15 + i * 0.12); gg += `M${P2(E(76, th))}L${P2(E(76, th + 0.25))}`; }
    G(gg, 2.2, '#ffd0dc');
    G('M146 212L120 222M182 182L160 196M210 156L192 168', 1.8, '#c8b8ff');
    f += I.flush() + `</g>`;
    // the caster's own guard, shield cracking
    let k = man([[74, 214], [74, 236]], [[[74, 236], [64, 258]], [[74, 236], [86, 258]], [[72, 216], [58, 230]]], [74, 200, 8]);
    k += `<path d="M84 206C100 204 108 210 108 222C106 236 96 244 86 246C82 234 82 218 84 206Z" fill="url(#teal)" stroke="${INK}" stroke-width="3"/><path d="M94 206L98 220L90 228L98 242" fill="none" stroke="${INK}" stroke-width="2.5"/>`;
    G('M88 214C92 222 92 230 90 236', 2.2, '#c8fff0');
    k += I.flush();
    return b + f + k + frame('ruby');
  },

  // ------------------------------------------------------------ Scorch
  // A burning-glass sunbeam slants down from the upper right and sets the weakest foe alight.
  Scorch: () => {
    const [I, H, G] = pens();
    const SX = 292, SY = 76;
    let b = defs(['white', 'gold', 'amber', 'orange', 'red', 'sky', 'violet', 'deep', 'navy', 'teal', 'bronze', 'ruby']);
    b += bg(SX, SY, [0, 30, 70, 150, 460], [10, 10, 12, 8], [['white', 'gold'], ['gold', 'amber'], ['sky', 'deep'], ['navy', 'violet']], 0.25, [244, 266, 18], ['teal', 'navy'], [38, 50]);
    G('M40 70C56 66 72 72 90 68M40 130C56 126 70 132 88 128M250 200C266 196 280 202 300 198M300 160C320 156 336 162 356 158', 1.5, '#7f9ae8');
    b += I.flush();
    const tx = 106, ty = 232, dx = tx - SX, dy = ty - SY, Lb = Math.hypot(dx, dy), D = [dx / Lb, dy / Lb], N = [-D[1], D[0]];
    const at = (s, o) => [SX + D[0] * s + N[0] * o, SY + D[1] * s + N[1] * o];
    const s0 = 34, s1 = Lb - 14, W = (s, f) => f * (42 - 34 * ((s - s0) / (s1 - s0)));
    const cuts = [-1, -0.3, 0.35, 1], cols = [['amber', 'gold'], ['white', 'gold'], ['gold', 'amber']];
    const marks = [s0, 120, s1];
    const beam = [];
    for (let j = 0; j < 3; j++) for (let m = 0; m < 2; m++) {
      const a = marks[m], c = marks[m + 1];
      beam.push([poly([at(a, W(a, cuts[j])), at(c, W(c, cuts[j])), at(c, W(c, cuts[j + 1])), at(a, W(a, cuts[j + 1]))]), cols[j][m % 2]]);
    }
    const outline = poly([at(s0, -42), at(s1, -8), at(s1, 8), at(s0, 42)]);
    const fl = [[-90, 92, 20, 6, 0, 'red'], [-120, 74, 17, 6, 1, 'orange'], [-60, 76, 17, 6, 2, 'orange'], [-148, 50, 14, 4, 0, 'red'], [-32, 52, 14, 4, 1, 'red']];
    const F = fl.map(([a, l, w, am, ph, c]) => [tongue(tx, ty + 10, a, l, w, am, ph), c]);
    let f = `<g data-figure="1">` + under([outline, ...F.map(([d]) => d)]);
    f += panes(beam, 3);
    f += panes(F, 3);
    f += panes([[tongue(tx, ty + 10, -90, 58, 11, 3, 0), 'gold']], 2.5);
    H(hatch([at(s0, -39), at(80, -34), at(140, -26), at(200, -18)], 7, 10, 4, 1, { inset: 2, tilt: -0.3 }), 2);
    G(`M${P2(at(s0 + 6, 18))}L${P2(at(200, 8))}`, 2.5, '#fffbe6');
    f += I.flush() + `</g>`;
    // the victim: a small hunched beast in the flames
    let k = `<g fill="${INK}"><path d="M86 252C84 232 96 220 112 222C126 224 132 238 128 252L122 252L118 244L110 252L102 244L94 252Z"/><path d="M90 232L78 220L92 226Z"/><path d="M104 224L102 208L112 222Z"/></g>`;
    k += `<path d="M110 232C116 228 122 232 120 238C116 242 110 240 110 232Z" fill="url(#ruby)" stroke="${INK}" stroke-width="2.5"/>`;
    G('M118 228C124 232 126 240 124 246', 2.2, '#ffc85a');
    k += I.flush();
    return b + f + k + frame('ruby');
  },

  // ------------------------------------------------------------ Battle Rage
  // A gauntleted fist thrusts a sword up into flame: the next creature's rage, held ready.
  'Battle Rage': () => {
    const [I, H, G] = pens();
    const CX = 196, CY = 64;
    let b = defs(['white', 'gold', 'amber', 'orange', 'red', 'ruby', 'wine', 'violet', 'deep', 'navy', 'teal', 'bronze', 'steel']);
    b += bg(CX, CY, [0, 34, 80, 160, 460], [10, 10, 12, 8], [['white', 'gold'], ['amber', 'orange'], ['wine', 'violet'], ['deep', 'navy']], 0.4, [252, 272, -20], ['teal', 'navy'], [44, 58]);
    G('M260 150C276 146 290 152 310 148M300 200C316 196 330 202 350 198M260 100C276 96 290 102 306 98M30 150C46 146 60 152 78 148', 1.5, '#7f9ae8');
    b += I.flush();
    const T = xf(134, 168, -72); // local +x points up the blade
    const arm = T([[-112, -26], [-44, -24], [-44, 26], [-112, 30]]);
    const cuff = T([[-50, -30], [-30, -32], [-30, 32], [-50, 30]]);
    const fist = T([[-34, -28], [-4, -30], [8, -22], [8, 22], [-4, 28], [-34, 28]]);
    const guard = T([[10, -34], [20, -34], [20, 34], [10, 34]]);
    const blade = T([[20, -10], [120, -8], [146, 0], [120, 8], [20, 10]]);
    const fingers = [0, 1, 2, 3].map((i) => poly(T([[-6, -26 + i * 13], [8, -24 + i * 13], [8, -12 + i * 13], [-6, -14 + i * 13]])));
    const flames = [[30, -10, -100, 104, 20, 10, 0, 'red'], [60, 10, -58, 104, 18, 10, 2, 'red'], [96, -8, -108, 70, 14, 8, 1, 'orange'], [40, 12, -36, 96, 16, 8, 3, 'orange']].map(([s, o, a, l, w, am, ph, c]) => { const p = T([[s, o]])[0]; return [tongue(p[0], p[1], a, l, w, am, ph), c]; });
    let f = `<g data-figure="1">` + under([...flames.map(([d]) => d), poly(arm), poly(cuff), poly(fist), poly(guard), poly(blade)]);
    f += panes(flames, 3);
    f += panes([[poly(arm), 'red'], [poly(T([[-112, 6], [-44, 4], [-44, 26], [-112, 30]])), 'wine'], [poly(cuff), 'gold'], [poly(fist), 'orange'], ...fingers.map((d, i) => [d, i % 2 ? 'red' : 'orange']), [poly(blade), 'steel'], [poly(T([[20, 0], [120, 0], [146, 0], [120, 8], [20, 10]])), 'white'], [poly(guard), 'gold']]);
    f += `<circle cx="${R(T([[-40, 0]])[0][0])}" cy="${R(T([[-40, 0]])[0][1])}" r="6" fill="url(#ruby)" stroke="${INK}" stroke-width="2.5"/>`;
    H(hatch(T([[-108, 26], [-90, 26], [-70, 25], [-48, 24]]), 7, 12, 7, 1, { inset: 2, tilt: 0.2 }), 2);
    H(hatch(T([[-108, 28], [-90, 27], [-76, 26], [-60, 25]]), 4, 9, 7, 1, { inset: 2, tilt: 0.9 }), 1.6);
    H(hatch(T([[24, 9], [60, 8], [100, 8], [120, 7]]), 6, 5, 3, 1, { inset: 1 }), 1.6);
    G(offset(T([[-108, -24], [-90, -24], [-70, -23], [-48, -22]]), 7, -1, 5), 2.5, '#ffd8a0');
    G(`M${P2(T([[28, -4]])[0])}L${P2(T([[118, -3]])[0])}`, 2.2, '#ffffff');
    f += I.flush() + `</g>`;
    // the creature to come: a small black silhouette summoned at the horizon, lit by the rage
    let k = `<path d="M352 258L350 240C348 230 336 226 322 228L310 220L306 210L300 216L292 212L292 222C284 226 278 232 280 238L292 240C296 248 298 254 298 258L306 258L308 248L332 248L336 258Z" fill="${INK}"/>`;
    k += `<path d="M296 234C302 228 312 232 312 240C306 246 298 244 296 234Z" fill="url(#gold)" stroke="${INK}" stroke-width="2.5"/>`;
    G('M286 230L280 236M300 248L302 256', 2.2, '#ffc85a');
    k += I.flush();
    return b + f + k + frame('ruby');
  },
});
