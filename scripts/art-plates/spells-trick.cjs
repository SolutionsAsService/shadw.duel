'use strict';
// Carved-glass plates (GDADA run 3): draw spells and board tricks.
// Draw Two, Quick Draw, Arcane Insight, Dark Bargain, Windstep, Undertow, Wither, Riptide, Landslide, Turning Gale.
const { Ink, INK, R, defs, burst, hatch, frame } = require('../art-lib/glass.cjs');

const P = ([x, y]) => `${R(x)} ${R(y)}`;
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const poly = (pts) => 'M' + pts.map(P).join('L') + 'Z';
const rot = (cx, cy, a, pts) => pts.map(([x, y]) => [cx + x * Math.cos(a) - y * Math.sin(a), cy + x * Math.sin(a) + y * Math.cos(a)]);
const bz = (p, t) => { const u = 1 - t; return [0, 1].map((j) => u * u * u * p[0][j] + 3 * u * u * t * p[1][j] + 3 * u * t * t * p[2][j] + t * t * t * p[3][j]); };
const fill = (d, c, extra = '') => `<path d="${d}" fill="url(#${c})"${extra}/>`;
// move, scale, rotate and mirror a path written only with absolute pair commands (M L C Q Z)
function T(d, x, y, s = 1, a = 0, fx = 1) {
  const c = Math.cos(a), sn = Math.sin(a);
  return d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, u, v) => { u = +u * s * fx; v = +v * s; return `${R(x + u * c - v * sn)} ${R(y + u * sn + v * c)}`; });
}
// hatch along segment a->b with strokes pointing toward point c
function hz(a, b, c, n, l0, l1, o = {}) {
  const side = (b[1] - a[1]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[1] - a[1]) > 0 ? 1 : -1;
  return hatch([a, lerp(a, b, 1 / 3), lerp(a, b, 2 / 3), b], n, l0, l1, side, o);
}
const sil = (paths, w = 9) => `<g fill="${INK}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round">${paths.map((d) => `<path d="${d}"/>`).join('')}</g>`;
const lead = (s, w = 3.5) => `<g stroke="${INK}" stroke-width="${w}" stroke-linejoin="round">${s}</g>`;

// background: burst, ground, two dashed carved rings, sky streaks
function scene(I, o) {
  let b = defs(o.defs) + `<rect width="400" height="300" fill="${INK}"/><g stroke="${INK}" stroke-width="3" stroke-linejoin="round">`;
  b += burst(o.sx, o.sy, o.radii, o.n, (k, i) => o.cols[k][i % 2], o.rot || 0);
  b += (o.ground || []).map(([d, c]) => fill(d, c)).join('') + '</g>';
  const r1 = o.ring || o.radii[1] + 8;
  b += `<g fill="none" stroke="${INK}" stroke-linecap="round"><circle cx="${o.sx}" cy="${o.sy}" r="${r1}" stroke-width="2.5" stroke-dasharray="16 6 30 8 10 6"/><circle cx="${o.sx}" cy="${o.sy}" r="${r1 + 13}" stroke-width="2" stroke-dasharray="24 9 12 7 36 10"/></g>`;
  if (o.streaks) I.add(o.streaks, 1.5, o.streakCol || '#9fb6f0');
  return b + I.flush();
}
const band = (y, a, c) => [`M0 300V${y}C90 ${y - a} 180 ${y + a} 260 ${y}C320 ${y - a} 360 ${R(y + a / 2)} 400 ${R(y - a / 3)}V300Z`, c];

// ribbon of glass strips along a path function f(t)
function ribbon(f, w0, w1, n, cols, k = 4) {
  const S = n * k, L = [], Rt = [], W = typeof w0 === 'function' ? w0 : (t) => w0 + (w1 - w0) * t;
  for (let i = 0; i <= S; i++) {
    const t = i / S, a = f(Math.max(0, t - 0.01)), b = f(Math.min(1, t + 0.01)), c = f(t);
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = W(t) / 2;
    L.push([c[0] - (dy / l) * w, c[1] + (dx / l) * w]); Rt.push([c[0] + (dy / l) * w, c[1] - (dx / l) * w]);
  }
  const out = 'M' + L.map(P).join('L') + 'L' + Rt.slice().reverse().map(P).join('L') + 'Z';
  let panes = '';
  for (let i = 0; i < n; i++) {
    const l = L.slice(i * k, (i + 1) * k + 1), r = Rt.slice(i * k, (i + 1) * k + 1).reverse();
    panes += fill('M' + l.concat(r).map(P).join('L') + 'Z', cols[i % cols.length]);
  }
  return { sil: out, panes, L, R: Rt };
}
const rib = (p, w0, w1, n, cols, k) => ribbon((t) => bz(p, t), w0, w1, n, cols, k);
// hatch a ribbon from one side toward the other
function rh(r, side, n, l0, l1, t0 = 0.1, t1 = 0.9) {
  const A = side === 'L' ? r.L : r.R, B = side === 'L' ? r.R : r.L;
  let d = '';
  for (let i = 0; i < n; i++) {
    const s = n === 1 ? 0.5 : i / (n - 1), j = Math.round((t0 + (t1 - t0) * s) * (A.length - 1));
    const a = A[j], b = B[j], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const len = Math.min(l0 + (l1 - l0) * Math.sin(Math.PI * s), l * 0.7);
    d += `M${R(a[0] + (dx / l) * 3)} ${R(a[1] + (dy / l) * 3)}l${R((dx / l) * len)} ${R((dy / l) * len)}`;
  }
  return d;
}
// gouge line inside a ribbon, f of the way from side L to R
function rg(r, f, t0 = 0.1, t1 = 0.9) {
  const n = r.L.length - 1, pts = [];
  for (let j = Math.round(t0 * n); j <= Math.round(t1 * n); j++) pts.push(lerp(r.L[j], r.R[j], f));
  return 'M' + pts.map(P).join('L');
}

// a playing card of glass: gilt border, shaded far border, face and a jewel emblem
function oct(w, h, c) { const x = w / 2, y = h / 2; return [[-x + c, -y], [x - c, -y], [x, -y + c], [x, y - c], [x - c, y], [-x + c, y], [-x, y - c], [-x, -y + c]]; }
function card(cx, cy, w, h, a, face, em, I, glyph) {
  const o = rot(cx, cy, a, oct(w, h, 7)), i = rot(cx, cy, a, oct(w - 14, h - 14, 4)), c = [cx, cy];
  const shade = [o[1], o[2], o[3], o[4], o[5], i[5], i[4], i[3], i[2], i[1]];
  const e = glyph ? rot(cx, cy, a, glyph) : rot(cx, cy, a, [[0, -h * 0.24], [w * 0.2, 0], [0, h * 0.24], [-w * 0.2, 0]]);
  const ie = rot(cx, cy, a, [[0, -h * 0.11], [w * 0.09, 0], [0, h * 0.11], [-w * 0.09, 0]]);
  const panes = fill(poly(o), 'gold') + fill(poly(shade), 'bronze') + fill(poly(i), face) + fill(poly(e), em, ` stroke-width="3"`) + fill(poly(ie), 'white', ` stroke-width="2"`);
  I.add(hz(lerp(i[2], c, 0.04), lerp(i[3], c, 0.04), c, 7, 4, 9, { tilt: 0.3 }) + hz(lerp(i[4], c, 0.04), lerp(i[5], c, 0.04), c, 5, 3, 7, { tilt: 0.3 }), 1.8);
  I.add('M' + [i[5], i[6], i[7], i[0], i[1]].map((p, k) => P(lerp(p, c, k === 0 || k === 4 ? 0.3 : 0.18))).join('L'), 2, '#fff6dc');
  const pips = rot(cx, cy, a, [[-w / 2 + 14, -h / 2 + 14], [w / 2 - 14, h / 2 - 14]]);
  I.add(pips.map(([x, y]) => `M${R(x - 3)} ${R(y)}h6M${R(x)} ${R(y - 3)}v6`).join(''), 2.5);
  return { sil: poly(o), panes };
}

// small woodcut foes (black, one coloured pane, a gold gouge on the lit side)
const FOE = {
  body: 'M-18 0L-14 -22L-20 -40C-20 -54 20 -54 20 -40L14 -22L18 0L6 0L0 -14L-6 0ZM-9 -50C-11 -66 11 -66 9 -50ZM-6 -60L-16 -74L-1 -63ZM6 -60L16 -74L1 -63Z',
  up: 'M14 -46L28 -60L34 -54L18 -38ZM27 -58L46 -90L52 -87L33 -53Z',
  down: 'M12 -44L22 -30L18 -26L10 -36ZM18 -30L42 -4L38 0L14 -26Z',
  shield: 'M-16 -46C-34 -48 -38 -30 -34 -18C-30 -10 -20 -12 -16 -20Z',
  beast: 'M-30 0L-27 -16C-36 -20 -38 -34 -30 -38L-12 -36C0 -46 18 -44 26 -36L38 -44L36 -30C40 -24 36 -16 30 -16L28 0L20 0L18 -12L-14 -14L-20 0ZM30 -38L42 -56L36 -34Z',
  plate: 'M-10 -37C0 -44 16 -42 22 -36C12 -31 0 -31 -10 -37Z',
  chest: 'M-12 -40C-12 -48 12 -48 12 -40L8 -26L-8 -26Z',
};
function foe(x, y, s, a, o = {}) {
  const t = (d) => T(d, x, y, s, a, o.fx || 1);
  const beast = o.kind === 'beast';
  let d = beast ? FOE.beast : FOE.body + (o.sword === false ? '' : FOE[o.sword || 'up']);
  let r = `<path d="${t(d)}" fill="${INK}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
  if (o.chest) r += `<path d="${t(FOE.chest)}" fill="url(#${o.chest})" stroke="${INK}" stroke-width="2.5"/>`;
  if (o.shield !== false) r += `<path d="${t(beast ? FOE.plate : FOE.shield)}" fill="url(#${o.shield || 'ruby'})" stroke="${INK}" stroke-width="2.5"/>`;
  r += `<path d="${t(beast ? 'M-26 -6L-24 -18C-32 -22 -32 -32 -26 -34' : 'M-10 -4L-7 -24L-12 -40')}" fill="none" stroke="${o.g || '#ffd27a'}" stroke-width="2" stroke-linecap="round"/>`;
  return r;
}

const STREAK = 'M30 130C48 126 64 132 84 128M40 196C58 192 72 198 90 194M300 40C318 36 334 42 352 38M330 120C346 116 360 122 374 118';

module.exports = () => ({
  'Draw Two': () => {
    const I = Ink();
    let b = scene(I, {
      defs: ['white', 'ivory', 'gold', 'amber', 'violet', 'deep', 'navy', 'teal', 'bronze', 'ruby', 'pearl', 'steel'],
      sx: 84, sy: 74, radii: [0, 40, 86, 152, 440], n: [8, 8, 9, 6], rot: 0.2,
      cols: [['white', 'ivory'], ['gold', 'amber'], ['violet', 'deep'], ['navy', 'deep']],
      ground: [band(240, 10, 'teal'), band(264, 8, 'bronze')], streaks: 'M320 150C336 146 352 152 370 148',
    });
    // the deck, low right, and two cards flying from it toward the light
    const top = 'M262 214L334 202L364 226L292 240Z', front = 'M292 240L364 226L364 246L292 260Z', side = 'M262 214L292 240L292 260L262 234Z';
    const B = card(152, 106, 66, 94, -0.62, 'pearl', 'teal', I), A = card(232, 156, 70, 100, -0.28, 'ivory', 'ruby', I);
    const cardInk = I.flush();
    let f = `<g data-figure="1">` + sil([top, front, side, B.sil, A.sil]);
    f += lead(fill(side, 'gold') + fill(front, 'bronze') + fill(top, 'ivory'));
    I.add('M294 246L362 232M294 252L362 238M264 224L290 248', 2);
    I.add('M300 236L356 225', 2, '#fff6dc');
    I.add('M318 206L298 186M340 214L322 194', 3); // lift lines
    f += I.flush() + lead(B.panes) + lead(A.panes) + cardInk;
    // flight trail
    I.add('M290 204C276 190 262 182 252 178M322 198C312 172 300 160 286 150M210 92C198 86 186 84 176 86', 2.5, '#fff1c0');
    f += I.flush() + `</g>`;
    return b + f + frame('gold');
  },

  'Quick Draw': () => {
    const I = Ink();
    let b = scene(I, {
      defs: ['white', 'pearl', 'sky', 'deep', 'navy', 'teal', 'violet', 'gold', 'bronze', 'ivory'],
      sx: 318, sy: 70, radii: [0, 32, 74, 150, 440], n: [8, 8, 9, 6], rot: 0.1,
      cols: [['white', 'pearl'], ['sky', 'deep'], ['deep', 'navy'], ['navy', 'deep']],
      ground: [band(248, 8, 'teal'), band(268, 6, 'deep')], streaks: 'M40 210C58 206 72 212 90 208M250 60C268 56 284 62 300 58M300 100C318 96 334 102 352 98', streakCol: '#d8ecff',
    });
    // empty creature slots: you control no creatures
    b += `<g fill="none" stroke="${INK}" stroke-width="2.5" stroke-dasharray="8 6"><ellipse cx="60" cy="258" rx="24" ry="7"/><ellipse cx="130" cy="266" rx="24" ry="7"/></g>`;
    const g1 = rib([[392, 246], [300, 266], [180, 248], [126, 176]], 46, 12, 6, ['pearl', 'sky'], 3);
    const g2 = rib([[118, 166], [70, 120], [110, 44], [200, 58]], 14, 4, 4, ['pearl', 'teal'], 3);
    const g3 = rib([[384, 196], [300, 214], [234, 202], [208, 166]], 18, 4, 4, ['sky', 'pearl'], 3);
    const C = card(150, 112, 62, 88, -0.55, 'ivory', 'violet', I);
    const cardInk = I.flush();
    let f = `<g data-figure="1">` + sil([g1.sil, g2.sil, g3.sil, C.sil]);
    f += lead(g1.panes + g2.panes + g3.panes);
    I.add(rh(g1, 'L', 12, 5, 12) + rh(g3, 'L', 5, 3, 6), 1.8);
    I.add(rg(g1, 0.72, 0.05, 0.85) + rg(g2, 0.7, 0.1, 0.8), 2.5, '#ffffff');
    I.add('M206 76C220 92 222 112 214 128M106 70C116 60 128 56 140 56', 3); // spin arcs
    f += I.flush() + lead(C.panes) + cardInk + `</g>`;
    return b + f + frame('violet');
  },

  'Arcane Insight': () => {
    const I = Ink();
    const OX = 120, OY = 150;
    let b = scene(I, {
      defs: ['white', 'ivory', 'gold', 'amber', 'violet', 'deep', 'navy', 'steel', 'pearl', 'ruby', 'teal', 'bronze'],
      sx: OX, sy: OY, radii: [0, 62, 104, 170, 440], n: [8, 10, 10, 7], rot: 0.15, ring: 54,
      cols: [['white', 'ivory'], ['gold', 'amber'], ['violet', 'deep'], ['navy', 'violet']],
      ground: [band(246, 8, 'teal'), band(268, 6, 'bronze')], streaks: 'M250 230C268 226 284 232 300 228M330 70C346 66 360 72 374 68M330 210C346 206 360 212 374 208',
    });
    // three cards rising from the scrying orb in a fan
    const cs = [card(214, 70, 46, 64, -0.18, 'pearl', 'ruby', I), card(270, 108, 46, 64, 0.22, 'ivory', 'teal', I), card(306, 166, 46, 64, 0.62, 'pearl', 'gold', I)];
    const cardInk = I.flush();
    const stand = 'M84 178C92 198 106 204 112 202L106 228L134 228L128 202C134 204 148 198 156 178C146 188 136 192 120 194C104 192 94 188 84 178Z', base = 'M92 228H148L156 248H84Z', foot = 'M72 248H168L174 262H66Z';
    let f = `<g data-figure="1">`;
    I.add('M160 132L196 86M164 146L250 112M162 162L286 166', 2.5, '#fff1c0');
    f += I.flush();
    f += sil([stand, base, foot, `M${OX - 48} ${OY}C${OX - 48} ${OY - 64} ${OX + 48} ${OY - 64} ${OX + 48} ${OY}C${OX + 48} ${OY + 64} ${OX - 48} ${OY + 64} ${OX - 48} ${OY}Z`, ...cs.map((c) => c.sil)], 10);
    f += lead(fill(foot, 'bronze') + fill(base, 'bronze') + fill(stand, 'gold'));
    f += `<g stroke="${INK}" stroke-width="3" stroke-linejoin="round">` + burst(OX, OY, [0, 46], [8], (k, i) => ['steel', 'pearl'][i % 2], 0.4) + `</g>`;
    // the open eye of insight
    const eye = `M${OX - 32} ${OY}Q${OX} ${OY - 28} ${OX + 32} ${OY}Q${OX} ${OY + 28} ${OX - 32} ${OY}Z`;
    f += lead(fill(eye, 'white') + `<circle cx="${OX}" cy="${OY}" r="12" fill="url(#violet)"/><circle cx="${OX}" cy="${OY}" r="5" fill="${INK}"/>`, 3);
    I.add(hatch([[OX + 40, OY - 26], [OX + 50, OY], [OX + 40, OY + 30], [OX + 14, OY + 44]], 9, 4, 10, -1, { swell: true }), 1.8);
    I.add(hatch([[96, 210], [100, 220], [104, 226], [106, 228]], 1, 1, 1, 1) + 'M140 236l10 0M140 242l12 0M150 254l16 0', 1.8);
    I.add(`M${OX - 36} ${OY - 18}C${OX - 30} ${OY - 34} ${OX - 14} ${OY - 42} ${OX + 2} ${OY - 42}M${OX - 4} ${OY - 6}l4 -3`, 2.5, '#ffffff');
    f += I.flush() + cs.map((c) => lead(c.panes)).join('') + cardInk + `</g>`;
    return b + f + frame('gold');
  },

  'Dark Bargain': () => {
    const I = Ink();
    const HX = 214, HY = 150;
    let b = scene(I, {
      defs: ['white', 'gold', 'red', 'ruby', 'wine', 'violet', 'navy', 'ash', 'ivory', 'bronze', 'steel'],
      sx: HX, sy: HY, radii: [0, 40, 84, 150, 440], n: [8, 8, 8, 6], rot: 0.25, ring: 52,
      cols: [['white', 'gold'], ['ruby', 'wine'], ['ash', 'violet'], ['violet', 'ash']],
      ground: [band(246, 8, 'ash'), band(268, 6, 'navy')], 
    });
    const heart = `M${HX} ${HY + 36}C${HX - 26} ${HY + 18} ${HX - 44} ${HY} ${HX - 44} ${HY - 20}C${HX - 44} ${HY - 36} ${HX - 30} ${HY - 44} ${HX - 18} ${HY - 42}C${HX - 10} ${HY - 40} ${HX - 4} ${HY - 34} ${HX} ${HY - 26}C${HX + 4} ${HY - 34} ${HX + 10} ${HY - 40} ${HX + 18} ${HY - 42}C${HX + 30} ${HY - 44} ${HX + 44} ${HY - 36} ${HX + 44} ${HY - 20}C${HX + 44} ${HY} ${HX + 26} ${HY + 18} ${HX} ${HY + 36}Z`;
    const hshade = `M${HX + 40} ${HY - 4}C${HX + 30} ${HY + 14} ${HX + 16} ${HY + 26} ${HX} ${HY + 36}C${HX + 4} ${HY + 22} ${HX + 20} ${HY + 8} ${HX + 30} ${HY - 10}Z`;
    // the shadow's claw reaches down from the corner and squeezes the heart
    const arm = rib([[404, 30], [372, 44], [344, 70], [310, 98]], 44, 34, 3, ['ash', 'steel'], 2);
    const palm = 'M322 84C296 78 266 88 256 106C252 120 264 130 282 126C300 124 318 116 328 102Z';
    const fings = [
      rib([[268, 98], [244, 82], [208, 88], [194, 112]], 13, 5, 3, ['steel', 'violet', 'gold'], 2),
      rib([[262, 112], [236, 106], [212, 120], [204, 146]], 13, 5, 3, ['violet', 'ash', 'gold'], 2),
      rib([[272, 124], [260, 140], [248, 158], [234, 176]], 13, 5, 3, ['steel', 'violet', 'gold'], 2),
      rib([[300, 122], [296, 150], [276, 172], [256, 182]], 14, 5, 3, ['violet', 'ash', 'gold'], 2),
    ];
    const C1 = card(108, 248, 46, 62, -0.42, 'ivory', 'ruby', I), C2 = card(156, 256, 46, 62, 0.16, 'ivory', 'ruby', I);
    const cardInk = I.flush();
    const drop = 'M0 -12C5 -4 8 0 8 4C8 9 4 12 0 12C-4 12 -8 9 -8 4C-8 0 -5 -4 0 -12Z';
    const drops = [T(drop, 196, 200, 1), T(drop, 176, 222, 0.8), T(drop, 160, 206, 0.6)];
    let f = `<g data-figure="1">` + sil([C1.sil, C2.sil]) + lead(C1.panes + C2.panes) + cardInk;
    f += sil([heart, arm.sil, palm, ...fings.map((r) => r.sil), ...drops]);
    f += lead(fill(heart, 'red') + fill(hshade, 'wine') + drops.map((d) => fill(d, 'ruby')).join('') + arm.panes + fill(palm, 'violet') + fings.map((r) => r.panes).join(''));
    I.add(rh(arm, 'R', 6, 6, 14) + hatch([[HX + 44, HY - 20], [HX + 44, HY], [HX + 26, HY + 18], [HX, HY + 36]], 6, 4, 9, -1, { swell: true }), 1.8);
    I.add(rg(arm, 0.2, 0.05, 0.9) + `M${HX - 34} ${HY - 22}C${HX - 32} ${HY - 34} ${HX - 22} ${HY - 36} ${HX - 14} ${HY - 34}` + rg(fings[0], 0.25, 0.1, 0.7), 2.5, '#ffe0e8');
    f += I.flush() + `</g>`;
    return b + f + frame('ruby');
  },

  'Windstep': () => {
    const I = Ink();
    let b = scene(I, {
      defs: ['white', 'pearl', 'sky', 'deep', 'navy', 'teal', 'steel', 'gold', 'bronze', 'violet'],
      sx: 136, sy: 62, radii: [0, 34, 76, 146, 440], n: [10, 12, 12, 7], rot: 0.05,
      cols: [['white', 'pearl'], ['pearl', 'sky'], ['sky', 'deep'], ['deep', 'navy']],
      ground: [band(250, -10, 'teal'), band(270, 6, 'deep')], streaks: 'M30 170C48 166 62 172 80 168M300 230C318 226 334 232 352 228M320 90C336 86 350 92 366 88', streakCol: '#d8ecff',
    });
    // a winged boot mid-stride, launching up and to the right
    const X = 288, Y = 150, A = -0.42, t = (d) => T(d, X, Y, 1, A), tp = (x, y) => T(`${x} ${y}`, X, Y, 1, A).split(' ').map(Number);
    const boot = t('M-26 -70L22 -76L24 -8C48 -2 76 10 84 28C88 40 78 46 60 46L-20 46C-30 46 -32 38 -30 26Z');
    const cuff = t('M-30 -84L26 -90L24 -66L-26 -60Z'), sole = t('M-30 34L86 32C88 42 80 50 62 50L-22 50C-30 50 -32 42 -30 34Z');
    const toe = t('M32 0C54 6 74 16 82 30L46 30C46 18 40 8 32 0Z'), back = t('M-26 -60L-6 -62L-8 26L-30 28Z');
    const an = tp(-28, -48);
    const fe = [[-100, -96], [-134, -60], [-146, -20], [-132, 18], [-100, 46]].map(([dx, dy], k) => rib([an, [an[0] + dx * 0.25, an[1] + dy * 0.25 - 30], [an[0] + dx * 0.7, an[1] + dy * 0.7 - 26], [an[0] + dx, an[1] + dy]], 30 - k * 2, 2, 2, k % 2 ? ['sky', 'pearl'] : ['pearl', 'sky'], 3));
    const trail = rib([[36, 236], [90, 280], [170, 262], [232, 218]], 4, 22, 4, ['teal', 'pearl'], 3);
    let f = `<g data-figure="1">` + sil([trail.sil, ...fe.map((r) => r.sil), boot, cuff, sole], 10);
    f += lead(trail.panes + fe.map((r) => r.panes).join(''));
    I.add(fe.map((r) => rh(r, 'R', 5, 3, 8)).join(''), 1.6);
    I.add(fe.map((r) => rg(r, 0.25, 0.1, 0.7)).join(''), 2, '#ffffff');
    f += I.flush();
    f += lead(fill(boot, 'teal') + fill(back, 'sky') + fill(toe, 'steel') + fill(sole, 'bronze') + fill(cuff, 'gold'));
    I.add(t('M-4 -56L18 -58M-4 -44L18 -46M-4 -32L18 -34M-4 -20L20 -22'), 3);
    I.add(hz(tp(24, -60), tp(26, -6), tp(-10, -30), 7, 4, 10) + hz(tp(40, 36), tp(80, 36), tp(60, 10), 5, 3, 8, { tilt: 0.4 }), 1.8);
    I.add(t('M-18 -58L-20 20M-22 -78L18 -82'), 2.5, '#e8fff8');
    f += I.flush() + `</g>`;
    return b + f + frame('violet');
  },

  'Undertow': () => {
    const I = Ink();
    let b = scene(I, {
      defs: ['white', 'pearl', 'sky', 'deep', 'navy', 'teal', 'violet', 'ruby', 'gold'],
      sx: 322, sy: 62, radii: [0, 28, 64, 130, 440], n: [8, 10, 12, 7], rot: 0.3,
      cols: [['white', 'pearl'], ['pearl', 'sky'], ['deep', 'navy'], ['navy', 'deep']],
      ground: [band(214, 10, 'navy'), band(250, 8, 'deep')], streaks: 'M30 160C48 156 62 162 80 158M200 60C218 56 234 62 250 58M260 120C278 116 294 122 310 118', streakCol: '#8fb4f0',
    });
    const WX = 214, WY = 250;
    const ring = (rx, ry) => `M${WX - rx} ${WY}A${rx} ${ry} 0 0 1 ${WX + rx} ${WY}A${rx} ${ry} 0 0 1 ${WX - rx} ${WY}Z`;
    const lip = `M${WX - 96} ${WY}A96 26 0 0 0 ${WX + 96} ${WY}L${WX + 62} ${WY}A62 15 0 0 1 ${WX - 62} ${WY}Z`;
    // the vortex drags the strongest foe down; a wave arm wraps him
    const arm = rib([[96, 256], [22, 170], [112, 86], [240, 206]], 42, 12, 6, ['teal', 'sky', 'pearl'], 3);
    const arm2 = rib([[318, 254], [362, 192], [300, 164], [236, 228]], 24, 7, 4, ['sky', 'teal'], 3);
    let w = lead(fill(ring(132, 36), 'teal') + fill(ring(96, 26), 'sky') + fill(ring(62, 15), 'deep') + fill(ring(30, 7), 'navy'), 3);
    w += `<path d="M${WX - 112} ${WY - 2}C${WX - 60} ${WY - 26} ${WX + 60} ${WY - 26} ${WX + 112} ${WY + 4}" fill="none" stroke="${INK}" stroke-width="2.5" stroke-dasharray="14 8"/>`;
    const k = foe(WX + 4, WY + 8, 1.45, 0.3, { shield: 'ruby', fx: -1 });
    let f = `<g data-figure="1">` + sil([lip, arm.sil, arm2.sil]) + lead(fill(lip, 'sky') + arm.panes + arm2.panes);
    I.add(rh(arm, 'R', 14, 6, 16) + rh(arm2, 'L', 6, 4, 9), 1.8);
    I.add(rg(arm, 0.22, 0.05, 0.92) + rg(arm2, 0.75, 0.1, 0.85), 2.5, '#ffffff');
    I.add(`M${WX - 120} ${WY + 14}C${WX - 80} ${WY + 30} ${WX + 60} ${WY + 30} ${WX + 110} ${WY + 16}`, 2, '#c8f4ff');
    f += I.flush() + `<g fill="url(#pearl)" stroke="${INK}" stroke-width="2"><circle cx="150" cy="108" r="6"/><circle cx="182" cy="128" r="4"/><circle cx="58" cy="140" r="5"/></g></g>`;
    return b + w + k + f + frame('sky');
  },

  'Wither': () => {
    const I = Ink();
    let b = scene(I, {
      defs: ['white', 'pearl', 'ash', 'violet', 'navy', 'ruby', 'red', 'wine', 'teal', 'gold', 'steel'],
      sx: 316, sy: 70, radii: [0, 30, 70, 140, 440], n: [8, 10, 12, 7], rot: 0.1,
      cols: [['white', 'pearl'], ['pearl', 'ash'], ['ash', 'steel'], ['ash', 'violet']],
      ground: [band(244, 10, 'violet'), band(266, 6, 'navy')], streaks: 'M40 200C58 196 72 202 90 198M200 40C218 36 234 42 250 38M190 110C208 106 222 112 240 108', streakCol: '#a890e0',
    });
    // a withered rose drains the strongest foe through its thorned vine
    const K = 1.4, S = (d) => T(d, 118 * (1 - K), 96 * (1 - K), K), sp = ([x, y]) => [118 + (x - 118) * K, 96 + (y - 96) * K];
    const stem = rib([[118, 170], [104, 226], [208, 276], [272, 234]], 18, 13, 8, ['pearl', 'steel'], 3);
    const bloom = 'M78 98C72 74 96 60 116 70C134 60 160 72 156 96C154 116 138 132 118 134C98 132 82 118 78 98Z';
    const mid = 'M92 92C92 76 108 72 117 80C126 72 142 76 142 92C140 106 130 116 118 116C106 116 94 106 92 92Z';
    const core = 'M106 88C108 80 116 80 118 86C120 80 130 82 130 90C128 98 122 102 118 102C110 102 106 96 106 88Z';
    const drooL = 'M86 112C72 130 74 150 84 162C92 146 98 132 104 124Z', drooR = 'M144 116C158 132 158 150 150 160C142 146 136 134 130 124Z';
    const sepal = 'M100 130L118 152L136 130C126 138 110 138 100 130Z';
    const [bl, md, co, dL, dR, se] = [bloom, mid, core, drooL, drooR, sepal].map(S);
    const leaf = 'M0 -10C10 -8 12 4 0 10C-8 2 -8 -6 0 -10Z';
    const petals = [T(leaf, 54, 200, 1.3, 0.6), T(leaf, 166, 206, 1.1, -0.9), T(leaf, 40, 244, 1.2, 1.4)];
    const thorns = stem.L.filter((_, j) => j % 4 === 2).map(([x, y]) => `M${R(x - 3)} ${R(y)}L${R(x - 8)} ${R(y + 3)}L${R(x - 2)} ${R(y + 5)}Z`).join('');
    let k = foe(312, 268, 1.35, 0.18, { sword: 'down', shield: 'gold', fx: -1, g: '#e6f0ff' });
    let f = `<g data-figure="1">` + sil([stem.sil, bl, dL, dR, se, ...petals]) + `<path d="${thorns}" fill="${INK}"/>`;
    f += lead(stem.panes + fill(bl, 'red') + fill(dL, 'ruby') + fill(dR, 'red') + fill(md, 'ruby') + fill(co, 'white') + fill(se, 'ash') + petals.map((d, i) => fill(d, i % 2 ? 'red' : 'ruby')).join(''));
    I.add(hatch([[156, 96], [154, 116], [138, 132], [118, 134]].map(sp), 8, 5, 13, -1, { swell: true }) + rh(stem, 'R', 10, 3, 6), 1.8);
    I.add(S('M88 96C88 80 100 70 112 72M98 120L92 142'), 2.5, '#ffd0dc');
    // the vine coils the foe
    f += `<g fill="none" stroke-linecap="round"><path d="M270 236C286 220 330 220 344 232M276 206C292 194 330 196 342 206" stroke="${INK}" stroke-width="13"/><path d="M270 236C286 220 330 220 344 232M276 206C292 194 330 196 342 206" stroke="url(#ash)" stroke-width="6"/></g>`;
    I.add('M296 200C262 170 200 222 150 196C130 186 122 176 118 166', 2.5, '#80e8d8');
    f += I.flush() + `<g fill="url(#teal)" stroke="${INK}" stroke-width="2"><circle cx="230" cy="190" r="5"/><circle cx="176" cy="196" r="4"/><circle cx="136" cy="190" r="4"/></g></g>`;
    return b + k + f + frame('ruby');
  },

  'Riptide': () => {
    const I = Ink();
    let b = scene(I, {
      defs: ['white', 'pearl', 'sky', 'deep', 'navy', 'teal', 'violet', 'gold', 'ruby'],
      sx: 52, sy: 214, radii: [0, 40, 92, 170, 460], n: [7, 8, 8, 6], rot: 0.2,
      cols: [['white', 'pearl'], ['pearl', 'sky'], ['sky', 'deep'], ['deep', 'violet']],
      ground: [band(252, 8, 'teal'), band(272, 6, 'deep')], streaks: 'M200 50C218 46 234 52 250 48M280 120C298 116 314 122 330 118M220 150C236 146 250 152 266 148', streakCol: '#d8ecff',
    });
    const CX = 140, CY = 136;
    const f0 = (u) => { const r = 10 + 70 * u, th = Math.PI / 2 + 2.3 * Math.PI * (1 - u); return [CX + r * Math.cos(th), CY + r * Math.sin(th)]; };
    const tail = [[CX, CY + 80], [214, 222], [290, 274], [390, 262]];
    const fn = (t) => (t < 0.62 ? f0(t / 0.62) : bz(tail, (t - 0.62) / 0.38));
    const sp = ribbon(fn, (t) => (t < 0.62 ? 6 + 30 * (t / 0.62) : 36 - 24 * ((t - 0.62) / 0.38)), 0, 11, ['pearl', 'sky', 'teal'], 4);
    // three foes swept, their shields torn away
    let k = foe(242, 250, 0.9, 0.3, { sword: 'up', shield: false, chest: 'ruby' }) + foe(300, 258, 0.9, 0.42, { sword: 'down', shield: false, chest: 'ruby' }) + foe(352, 252, 0.85, 0.22, { sword: 'up', shield: false, chest: 'ruby' });
    const sh = 'M-14 -14C-14 -24 14 -24 14 -14C14 2 6 10 0 14C-6 10 -14 2 -14 -14Z';
    const shields = [T(sh, 254, 160, 1.1, 0.7), T(sh, 318, 172, 1.1, -0.5), T(sh, 360, 128, 1, 1.1)];
    let f = `<g data-figure="1">` + sil([sp.sil]) + lead(sp.panes);
    I.add(rh(sp, 'R', 11, 4, 12, 0.08, 0.95), 1.8);
    I.add(rg(sp, 0.7, 0.1, 0.9), 2.5, '#ffffff');
    f += I.flush() + `</g>`;
    let s = lead(shields.map((d) => fill(d, 'gold')).join(''), 3);
    I.add('M248 180C240 192 238 204 240 210M302 188C298 198 298 206 300 212M354 150C348 170 348 188 350 198', 2, '#ffe9b0');
    s += I.flush();
    return b + k + f + s + frame('violet');
  },

  'Landslide': () => {
    const I = Ink();
    let b = scene(I, {
      defs: ['white', 'gold', 'amber', 'orange', 'wine', 'violet', 'bronze', 'ash', 'teal', 'ruby'],
      sx: 232, sy: 54, radii: [0, 30, 70, 140, 440], n: [8, 10, 12, 7], rot: 0.2,
      cols: [['white', 'gold'], ['gold', 'amber'], ['amber', 'wine'], ['wine', 'violet']],
      ground: [['M400 56L362 74L340 112L314 150L300 196L272 240L400 240Z', 'wine'], ['M400 120L372 140L356 190L340 240L400 240Z', 'ash'], band(244, 8, 'bronze'), band(266, 6, 'ash')],
      streaks: 'M30 120C48 116 62 122 80 118M40 180C58 176 72 182 90 178', streakCol: '#ffc890',
    });
    const rock = (cx, cy, r, s) => {
      const p = [];
      for (let i = 0; i < 8; i++) { const a = s + (i * Math.PI) / 4, rr = r * (0.82 + 0.18 * Math.abs(Math.sin(i * 2.3 + s * 5))); p.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); }
      return p;
    };
    const rocks = [[198, 150, 40, 0.2], [282, 108, 26, 0.6], [128, 208, 32, 0.1], [244, 214, 22, 0.5], [86, 150, 14, 0.3], [330, 162, 18, 0.9], [160, 106, 12, 0.4]];
    let f = `<g data-figure="1">`;
    const ps = rocks.map(([x, y, r, s]) => rock(x, y, r, s));
    f += sil(ps.map(poly));
    let panes = '';
    ps.forEach((p, i) => {
      const [x, y, r] = rocks[i], c = [x - r * 0.18, y - r * 0.18];
      // vertex angles start at s; pick the upper-left and lower-right arcs by direction
      const ang = p.map(([px, py]) => Math.atan2(py - y, px - x));
      const lit = p.filter((_, j) => ang[j] <= -Math.PI / 4 || ang[j] >= (3 * Math.PI) / 4);
      const dark = p.filter((_, j) => ang[j] >= -Math.PI / 6 && ang[j] <= (2 * Math.PI) / 3);
      lit.sort((a, b2) => Math.atan2(a[1] - y, a[0] - x + 1e-9) - Math.atan2(b2[1] - y, b2[0] - x));
      panes += fill(poly(p), 'bronze') + fill(poly([c, ...dark]), 'ash') + (lit.length > 1 ? fill(poly([c, ...lit.sort((a, b2) => ((Math.atan2(a[1] - y, a[0] - x) + 2 * Math.PI) % (2 * Math.PI)) - ((Math.atan2(b2[1] - y, b2[0] - x) + 2 * Math.PI) % (2 * Math.PI)))]), 'gold') : '');
      if (r > 20) I.add(hz([x + r * 0.7, y - r * 0.3], [x + r * 0.2, y + r * 0.75], [x - r * 0.3, y], 5, 3, r * 0.25, { tilt: 0.4 }), 1.8);
      if (r > 20) I.add(`M${R(x - r * 0.6)} ${R(y + r * 0.1)}C${R(x - r * 0.6)} ${R(y - r * 0.4)} ${R(x - r * 0.3)} ${R(y - r * 0.6)} ${R(x + r * 0.1)} ${R(y - r * 0.62)}`, 2.5, '#fff0c0');
    });
    f += lead(panes, 3);
    // tumble arcs
    I.add('M318 118C306 92 290 82 270 78M236 120C226 104 214 98 200 96M176 168C160 160 146 166 138 176', 3);
    f += I.flush() + `</g>`;
    let k = foe(70, 266, 1.15, -0.8, { kind: 'beast', fx: -1, shield: 'teal' }) + foe(192, 280, 1.0, -0.3, { sword: 'up', shield: 'teal' });
    I.add('M40 248C60 240 80 244 100 236M150 250C170 246 196 250 220 244', 2.5, '#ffd890');
    return b + k + f + I.flush() + frame('teal');
  },

  'Turning Gale': () => {
    const I = Ink();
    let b = scene(I, {
      defs: ['white', 'pearl', 'sky', 'deep', 'navy', 'teal', 'violet', 'gold', 'ruby', 'steel'],
      sx: 324, sy: 90, radii: [0, 36, 84, 150, 440], n: [8, 10, 10, 7], rot: 0.35,
      cols: [['white', 'pearl'], ['pearl', 'sky'], ['sky', 'deep'], ['deep', 'violet']],
      ground: [band(248, -8, 'teal'), band(270, 6, 'deep')], streaks: 'M200 40C218 36 234 42 250 38M240 230C258 226 274 232 290 228M30 220C44 216 56 222 70 218', streakCol: '#d8ecff',
    });
    // the funnel, bands of glass, twisting toward the foe
    const Y0 = 52, Y1 = 254, N = 7;
    const xc = (y) => 168 - 66 * ((y - Y0) / (Y1 - Y0)) + 14 * Math.sin((y - Y0) / 34);
    const hw = (y) => 8 + 78 * Math.pow((Y1 - y) / (Y1 - Y0), 1.15);
    let bands = '', shade = '', outl = '';
    const L = [], Rr = [];
    for (let j = 0; j < N; j++) {
      const y0 = Y0 + ((Y1 - Y0) * j) / N, y1 = Y0 + ((Y1 - Y0) * (j + 1)) / N, a = xc(y0), c = xc(y1), w0 = hw(y0), w1 = hw(y1);
      const d = `M${R(a - w0)} ${R(y0)}Q${R(a)} ${R(y0 + w0 * 0.3)} ${R(a + w0)} ${R(y0)}L${R(c + w1)} ${R(y1)}Q${R(c)} ${R(y1 + w1 * 0.3)} ${R(c - w1)} ${R(y1)}Z`;
      bands += fill(d, j % 2 ? 'sky' : 'pearl');
      shade += fill(`M${R(a - w0)} ${R(y0)}Q${R(a - w0 * 0.7)} ${R(y0 + w0 * 0.22)} ${R(a - w0 * 0.4)} ${R(y0 + w0 * 0.26)}L${R(c - w1 * 0.4)} ${R(y1 + w1 * 0.26)}Q${R(c - w1 * 0.7)} ${R(y1 + w1 * 0.22)} ${R(c - w1)} ${R(y1)}Z`, 'steel');
      L.push([a - w0, y0]); Rr.push([a + w0, y0]);
      I.add(hz([a - w0 * 0.9, y0 + 6], [c - w1 * 0.9, y1 - 2], [a, y0 + 10], 3, 4, 8, { tilt: 0.5 }), 1.8);
      I.add(`M${R(a + w0 * 0.15)} ${R(y0 + w0 * 0.3 + 6)}Q${R(a + w0 * 0.6)} ${R(y0 + w0 * 0.22 + 4)} ${R(a + w0 * 0.85)} ${R(y0 + 6)}`, 2.5, '#ffffff');
    }
    L.push([xc(Y1) - hw(Y1), Y1]); Rr.push([xc(Y1) + hw(Y1), Y1]);
    outl = 'M' + L.map(P).join('L') + `L${R(xc(Y1))} ${Y1 + 10}L` + Rr.reverse().map(P).join('L') + 'Z';
    const cap = `M${R(xc(Y0) - hw(Y0))} ${Y0}Q${R(xc(Y0))} ${R(Y0 - hw(Y0) * 0.3)} ${R(xc(Y0) + hw(Y0))} ${Y0}Q${R(xc(Y0))} ${R(Y0 + hw(Y0) * 0.3)} ${R(xc(Y0) - hw(Y0))} ${Y0}Z`;
    const gust = rib([[214, 160], [244, 224], [330, 236], [320, 194]], 18, 4, 4, ['pearl', 'sky'], 3);
    let f = `<g data-figure="1">` + sil([outl, cap, gust.sil], 10) + lead(bands + shade + fill(cap, 'deep') + gust.panes, 3);
    I.add(rg(gust, 0.3, 0.1, 0.8), 2, '#ffffff');
    f += I.flush() + `</g>`;
    // the foe, flung tumbling, and debris
    let k = foe(282, 196, 0.9, 2.0, { sword: 'up', shield: 'ruby', fx: -1 });
    k += lead(`<path d="M232 82l9-7l7 8l-8 7Z" fill="url(#gold)"/><path d="M350 214l7-8l7 7l-7 7Z" fill="url(#gold)"/><path d="M226 222l6-6l6 6l-6 5Z" fill="url(#gold)"/>`, 2.5);
    return b + f + k + frame('violet');
  },
});
