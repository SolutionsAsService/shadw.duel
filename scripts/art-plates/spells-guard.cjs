'use strict';
// Guard and healing spells in the carved-glass style (GDADA run 3). See docs/ART_STYLE.md.
// Each spell is drawn as an event: the potion pouring, the spring welling up, the shield taking arrows,
// the barrier catching a bolt, the dove descending, the arm turning to stone, the wave rising, the gust
// lifting the fallen, the horn sounding.
const { Ink, INK, R, defs, burst, hatch, offset, frame } = require('../art-lib/glass.cjs');

// ---------- local geometry helpers ----------
const xy = ([x, y]) => `${R(x)} ${R(y)}`;
// rotate+scale local coords about (cx, cy)
const T = (cx, cy, a, s = 1) => ([x, y]) => [cx + s * (x * Math.cos(a) - y * Math.sin(a)), cy + s * (x * Math.sin(a) + y * Math.cos(a))];
const poly = (pts) => 'M' + pts.map(xy).join('L') + 'Z';
// closed smooth path through points (quadratic through midpoints)
function sm(P) {
  const m = (a, b) => `${R((a[0] + b[0]) / 2)} ${R((a[1] + b[1]) / 2)}`;
  let d = `M${m(P[0], P[1])}`;
  for (let i = 1; i <= P.length; i++) d += `Q${xy(P[i % P.length])} ${m(P[i % P.length], P[(i + 1) % P.length])}`;
  return d + 'Z';
}
function bz(p, t) {
  const u = 1 - t;
  return [0, 1].map((j) => u * u * u * p[0][j] + 3 * u * u * t * p[1][j] + 3 * u * t * t * p[2][j] + t * t * t * p[3][j]);
}
function nrm(p, t) {
  const e = 0.01, a = bz(p, Math.max(0, t - e)), b = bz(p, Math.min(1, t + e));
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
  return [-dy / L, dx / L];
}
// ribbon around a bezier centreline: half-width w(t); returns [left pts, right pts]
function edges(p, w, K = 10) {
  const l = [], r = [];
  for (let i = 0; i <= K; i++) {
    const t = i / K, c = bz(p, t), n = nrm(p, t), h = typeof w === 'function' ? w(t) : w;
    l.push([c[0] + n[0] * h, c[1] + n[1] * h]); r.push([c[0] - n[0] * h, c[1] - n[1] * h]);
  }
  return [l, r];
}
const ribbon = (p, w, K) => { const [l, r] = edges(p, w, K); return sm(l.concat(r.reverse())); };
// panes across a ribbon: cuts at fractions `cuts`, alternating colours
function bands(p, w, cuts, cols, K = 24) {
  const [l, r] = edges(p, w, K);
  let s = '';
  for (let i = 0; i < cuts.length - 1; i++) {
    const a = Math.round(cuts[i] * K), b = Math.round(cuts[i + 1] * K);
    const L = l.slice(a, b + 1), Rr = r.slice(a, b + 1).reverse();
    s += `<path d="${poly(L.concat(Rr))}" fill="url(#${cols[i % cols.length]})"/>`;
  }
  return s;
}
// bezier approximating a circular arc (angles in radians, span <= ~100deg)
function arc(cx, cy, r, a0, a1) {
  const k = (4 / 3) * Math.tan((a1 - a0) / 4);
  const p0 = [cx + r * Math.cos(a0), cy + r * Math.sin(a0)], p3 = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)];
  return [p0, [p0[0] - k * r * Math.sin(a0), p0[1] + k * r * Math.cos(a0)], [p3[0] + k * r * Math.sin(a1), p3[1] - k * r * Math.cos(a1)], p3];
}
// crescent shadow pane along a circle's contour from a0 to a1, depth d
function crescent(cx, cy, r, a0, a1, d) {
  const p0 = [cx + r * Math.cos(a0), cy + r * Math.sin(a0)], p1 = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)];
  const am = (a0 + a1) / 2, q = [cx + (r - d) * Math.cos(am), cy + (r - d) * Math.sin(am)];
  return `M${xy(p0)}A${r} ${r} 0 0 1 ${xy(p1)}Q${xy([2 * q[0] - (p0[0] + p1[0]) / 2, 2 * q[1] - (p0[1] + p1[1]) / 2])} ${xy(p0)}Z`;
}
const star = (x, y, r) => poly([[x, y - r], [x + r * 0.3, y - r * 0.3], [x + r, y], [x + r * 0.3, y + r * 0.3], [x, y + r], [x - r * 0.3, y + r * 0.3], [x - r, y], [x - r * 0.3, y - r * 0.3]]);
const leaf = (cx, cy, a, L, W) => { const f = T(cx, cy, a); return `M${xy(f([-L, 0]))}Q${xy(f([0, -W * 2]))} ${xy(f([L, 0]))}Q${xy(f([0, W * 2]))} ${xy(f([-L, 0]))}Z`; };

// ---------- scene scaffold ----------
// background: ink, carved burst, two wavy ground bands, two dashed carved rings
function scene(o) {
  const { pal, SX, SY, radii, n, cols, rot = 0, g = [246, 268], gc = ['teal', 'navy'], ph = 1, ring = [44, 58] } = o;
  let s = `<rect width="400" height="300" fill="${INK}"/><g stroke="${INK}" stroke-width="3" stroke-linejoin="round">`;
  s += burst(SX, SY, radii, n, (k, i) => cols[k][i % 2], rot);
  const band = (y, a) => `M0 300V${y}C70 ${y - a * ph} 130 ${y + a * ph} 200 ${y}C270 ${y - a * ph} 330 ${y + a * ph} 400 ${y - 4 * ph}V300Z`;
  s += `<path d="${band(g[0], 10)}" fill="url(#${gc[0]})"/><path d="${band(g[1], -8)}" fill="url(#${gc[1]})"/></g>`;
  s += `<g fill="none" stroke="${INK}" stroke-linecap="round"><circle cx="${SX}" cy="${SY}" r="${ring[0]}" stroke-width="2.5" stroke-dasharray="16 6 30 8 10 6"/><circle cx="${SX}" cy="${SY}" r="${ring[1]}" stroke-width="2" stroke-dasharray="24 9 12 7 36 10"/></g>`;
  return s;
}
// streak gouges across large outer panes: list of [x, y, len]
const streaks = (L) => L.map(([x, y, l]) => `M${x} ${y}C${R(x + l / 3)} ${y - 4} ${R(x + (2 * l) / 3)} ${y + 4} ${x + l} ${y}`).join('');
// prepend only the palette gradients the plate uses
const done = (body) => defs([...new Set([...body.matchAll(/url\(#(\w+)\)/g)].map((m) => m[1]))]) + body;
const under = (ds, w = 9) => `<g fill="${INK}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round">${ds.map((d) => `<path d="${d}"/>`).join('')}</g>`;
const fill = (d, c, extra = '') => `<path d="${d}" fill="url(#${c})"${extra}/>`;

module.exports = () => ({
  // Restore 800 LP: a flask tips and pours liquid light over a kneeling, wounded figure.
  'Healing Potion': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), G = (d, w = 2, c = '#fff4c8') => I.add(d, w, c);
    const SX = 214, SY = 190;
    let b = scene({ pal: ['white', 'gold', 'amber', 'sky', 'pearl', 'deep', 'navy', 'violet', 'teal', 'ivory', 'bronze', 'ruby'], SX, SY,
      radii: [0, 30, 70, 150, 430], n: [10, 10, 12, 8], cols: [['white', 'gold'], ['gold', 'amber'], ['sky', 'deep'], ['navy', 'violet']], rot: 0.2, g: [242, 266], ph: 1, ring: [40, 54] });
    G(streaks([[230, 40, 60], [300, 70, 60], [320, 120, 50], [30, 120, 40], [30, 190, 40]]), 1.5, '#9fc0f0');
    b += I.flush();
    const a = (3 * Math.PI) / 4, C = [132, 112], f = T(C[0], C[1], a);
    const neck = poly([[-15, -40], [15, -40], [15, -92], [-15, -92]].map(f));
    const lip = poly([[-21, -90], [21, -90], [21, -106], [-21, -106]].map(f));
    const mouth = f([0, -106]);
    const S = [mouth, [mouth[0] + 26, mouth[1] + 14], [238, 196], [240, 236]];
    const stream = ribbon(S, (t) => 13 - 5 * t, 10);
    const cork = poly([[-10, -9], [10, -9], [8, 9], [-8, 9]].map(T(214, 54, 0.7)));
    // kneeling figure under the stream (secondary silhouette)
    let k = `<g fill="none" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"><path d="M262 250L250 236L268 228L286 252"/><path d="M262 226L246 212L238 196M266 226L276 208" /><path d="M258 236L264 214" stroke-width="15"/></g><circle cx="262" cy="200" r="8" fill="${INK}"/>`;
    k += `<path d="M270 214C284 216 296 230 298 250L276 250C276 236 272 224 270 214Z" fill="url(#ruby)" stroke="${INK}" stroke-width="3"/>`;
    G('M256 196C254 200 254 204 256 206M246 214L240 202M254 230L262 220', 2.5, '#ffe28a');
    k += I.flush();
    let fg = `<g data-figure="1">` + under([`M${C[0] + 52} ${C[1]}A52 52 0 1 1 ${C[0] - 52} ${C[1]}A52 52 0 1 1 ${C[0] + 52} ${C[1]}Z`, neck, lip, stream, cork]);
    fg += `<g stroke="${INK}" stroke-width="3.5" stroke-linejoin="round">`;
    fg += `<circle cx="${C[0]}" cy="${C[1]}" r="52" fill="url(#pearl)"/>`;
    // liquid pooled toward the neck, below a level surface
    const lv = C[1] - 4, dx = Math.sqrt(52 * 52 - 16);
    fg += fill(`M${R(C[0] - dx)} ${lv}L${R(C[0] + dx)} ${lv}A52 52 0 0 1 ${R(C[0] - dx)} ${lv}Z`, 'gold');
    fg += fill(crescent(C[0], C[1], 52, -0.1, 1.7, 14), 'amber');
    fg += fill(neck, 'gold') + fill(lip, 'pearl') + fill(stream, 'gold');
    fg += fill(ribbon([[mouth[0] + 2, mouth[1] + 2], [mouth[0] + 24, mouth[1] + 12], [232, 196], [236, 228]], (t) => 5 - 2 * t, 8), 'white', ' stroke-width="2"');
    fg += `<circle cx="${C[0] + 10}" cy="${C[1] + 22}" r="15" fill="url(#white)" stroke-width="2.5"/>`;
    fg += fill(cork, 'bronze');
    // splash crown and rising motes of healing light
    fg += `<g fill="url(#white)" stroke-width="2.5">${[[222, 238, 6], [250, 232, 7], [236, 226, 5], [292, 186, 9], [316, 150, 7], [280, 136, 6], [330, 206, 6]].map(([x, y, r]) => `<path d="${star(x, y, r)}"/>`).join('')}</g>`;
    fg += `</g>`;
    // hatching on the shaded lower right of the bulb and the stream's far side
    H(hatch(arc(C[0], C[1], 52, -0.1, 1.5), 8, 5, 12, 1, { swell: true }), 1.8);
    H(hatch(arc(C[0], C[1], 52, 0.3, 1.2), 4, 4, 9, 1, { tilt: 0.7, swell: true }), 1.6);
    H(hatch(S, 6, 4, 6, -1, { t0: 0.2, t1: 0.9, inset: 6 }), 1.6);
    H(`M${xy(f([-8, -46]))}L${xy(f([-8, -86]))}`, 2);
    // gouges inside the lit upper-left edge of the bulb
    G(offset(arc(C[0], C[1], 52, Math.PI * 1.05, Math.PI * 1.55), 8, -1, 6), 2.5, '#ffffff');
    G(`M${xy(f([8, -46]))}L${xy(f([8, -84]))}`, 2, '#fff');
    fg += I.flush() + `</g>`;
    return done(b + k + fg + frame('ruby'));
  },

  // Restore 500 LP and draw 1: a spring of light wells up from cracked ground and lifts a card.
  'Minor Restoration': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), G = (d, w = 2, c = '#fff4c8') => I.add(d, w, c);
    const SX = 248, SY = 70;
    let b = scene({ pal: ['white', 'gold', 'amber', 'sky', 'pearl', 'deep', 'navy', 'teal', 'ivory', 'ruby', 'violet'], SX, SY,
      radii: [0, 30, 70, 140, 420], n: [8, 12, 10, 8], cols: [['white', 'gold'], ['pearl', 'sky'], ['deep', 'violet'], ['navy', 'deep']], rot: 0.1, g: [250, 270], gc: ['teal', 'navy'], ph: -1 });
    G(streaks([[30, 60, 60], [40, 130, 70], [60, 200, 50], [320, 200, 50], [130, 30, 40]]), 1.5, '#9fc0f0');
    b += I.flush();
    // jet: from a crack in the ground rising and leaning left, spray crown at the top
    const J = [[296, 262], [298, 206], [274, 150], [250, 104]], wj = (t) => 30 - 14 * t;
    const jet = ribbon(J, wj, 10);
    const core = ribbon([[292, 258], [294, 208], [270, 152], [250, 108]], (t) => 10 - 5 * t, 8);
    const spray = (k) => sm([[278, 112], ...Array.from({ length: 11 }, (_, i) => { const an = Math.PI * (1.02 + (i * 0.96) / 10), r = (i % 2 ? 62 : 26) * k; return [250 + r * Math.cos(an), 98 + r * Math.sin(an) * 0.9]; }), [222, 112]]);
    const crown = spray(1);
    const cf = T(150, 132, -0.36);
    const card = poly([[-34, -48], [34, -48], [34, 48], [-34, 48]].map(cf));
    const cardIn = poly([[-24, -38], [24, -38], [24, 38], [-24, 38]].map(cf));
    const crack = 'M240 268L262 256L276 264L300 256L318 266L334 260L330 272L300 266L278 274L258 266Z';
    let fg = `<g data-figure="1">` + under([jet, crown, card]);
    fg += `<g stroke="${INK}" stroke-width="3.5" stroke-linejoin="round">`;
    fg += bands(J, wj, [0, 0.34, 0.66, 1], ['ivory', 'pearl', 'ivory']);
    fg += fill(core, 'white', ' stroke-width="2.5"') + fill(crown, 'ivory');
    fg += fill(card, 'ivory') + fill(cardIn, 'gold', ' stroke-width="3"');
    fg += `<path d="${star(150, 132, 15)}" fill="url(#ruby)" stroke-width="2.5"/>`;
    fg += `<g fill="url(#white)" stroke-width="2.5">${[[332, 150, 8], [340, 104, 6], [214, 196, 7], [200, 232, 6]].map(([x, y, r]) => `<path d="${star(x, y, r)}"/>`).join('')}</g>`;
    fg += `</g>`;
    H(hatch([[324, 258], [326, 206], [298, 150], [268, 108]], 10, 10, 4, 1, { t0: 0.05, t1: 0.9, inset: 2 }), 1.8);
    H(hatch([[324, 250], [326, 212], [314, 180], [300, 150]], 4, 7, 3, 1, { tilt: 0.7, inset: 3 }), 1.6);
    H(hatch([[180, 180], [186, 156], [192, 126], [196, 96]], 5, 4, 9, 1, { inset: 3 }), 1.6);
    G(offset([[270, 258], [272, 210], [250, 154], [236, 108]], 0, 1, 6), 2.5, '#ffffff');
    G('M128 108l10-26M136 166l28-12', 2, '#fff');
    b += `<path d="${crack}" fill="url(#gold)" stroke="${INK}" stroke-width="3"/>`;
    fg += I.flush() + `</g>`;
    return done(b + fg + frame('ruby'));
  },

  // Restore 1000 LP and gain a 300 Barrier: a raised kite shield flares and snaps the arrows striking it.
  'Aegis': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), G = (d, w = 2, c = '#fff4c8') => I.add(d, w, c);
    const SX = 92, SY = 70;
    let b = scene({ pal: ['white', 'gold', 'amber', 'sky', 'pearl', 'deep', 'navy', 'violet', 'teal', 'ivory', 'ruby', 'wine', 'steel'], SX, SY,
      radii: [0, 40, 84, 160, 440], n: [10, 12, 12, 8], cols: [['white', 'gold'], ['gold', 'amber'], ['sky', 'deep'], ['navy', 'violet']], rot: 0.05, g: [254, 274], ph: 1, ring: [48, 62] });
    G(streaks([[290, 60, 60], [300, 120, 60], [320, 180, 40], [24, 200, 40]]), 1.5, '#9fc0f0');
    b += I.flush();
    const f = T(136, 148, -0.2, 0.92);
    const sh = [[-62, -84], [0, -96], [62, -84], [64, -10], [40, 52], [0, 104], [-40, 52], [-64, -10]];
    const shield = `M${xy(f(sh[0]))}Q${xy(f(sh[1]))} ${xy(f(sh[2]))}C${xy(f([66, -20]))} ${xy(f([48, 50]))} ${xy(f(sh[5]))}C${xy(f([-48, 50]))} ${xy(f([-66, -20]))} ${xy(f(sh[0]))}Z`;
    const rim = (q) => f(q);
    const qTL = poly([[-56, -78], [-6, -88], [-6, -38], [-58, -38]].map(rim));
    const qTR = poly([[6, -88], [56, -78], [58, -38], [6, -38]].map(rim));
    const qBL = `M${xy(f([-58, -26]))}L${xy(f([-6, -26]))}L${xy(f([-6, 90]))}C${xy(f([-34, 50]))} ${xy(f([-56, 10]))} ${xy(f([-58, -26]))}Z`;
    const qBR = `M${xy(f([58, -26]))}L${xy(f([6, -26]))}L${xy(f([6, 90]))}C${xy(f([34, 50]))} ${xy(f([56, 10]))} ${xy(f([58, -26]))}Z`;
    const shade = `M${xy(f([62, -84]))}C${xy(f([66, -20]))} ${xy(f([48, 50]))} ${xy(f([0, 104]))}C${xy(f([30, 50]))} ${xy(f([48, -10]))} ${xy(f([46, -78]))}Z`;
    let fg = `<g data-figure="1">` + under([shield], 10);
    fg += `<g stroke="${INK}" stroke-width="3.5" stroke-linejoin="round">${fill(shield, 'gold')}`;
    fg += fill(qTL, 'white') + fill(qTR, 'ivory') + fill(qBL, 'ivory') + fill(qBR, 'pearl') + fill(shade, 'sky');
    const bo = f([0, -32]);
    fg += `<circle cx="${R(bo[0])}" cy="${R(bo[1])}" r="12" fill="url(#ruby)"/>`;
    fg += `</g>`;
    H(hatch([f([62, -84]), f([66, -20]), f([48, 50]), f([0, 104])], 10, 5, 13, -1, { swell: true, inset: 5 }), 1.8);
    H(hatch([f([62, -84]), f([66, -20]), f([48, 50]), f([0, 104])], 5, 4, 9, -1, { swell: true, inset: 5, tilt: 0.7, t0: 0.3, t1: 0.8 }), 1.6);
    G([f([-50, -70]), f([-52, -10]), f([-36, 40]), f([-8, 82])].map((q, i) => (i ? 'L' : 'M') + xy(q)).join(''), 2.5, '#ffffff');
    G(`M${xy(f([-46, -80]))}Q${xy(f([-20, -88]))} ${xy(f([-8, -86]))}`, 2.5, '#ffffff');
    fg += I.flush() + `</g>`;
    // arrows striking from the right: one shatters on the face, two snap away
    const arrow = (x, y, a, L) => { const g = T(x, y, a); return `M${xy(g([4, 0]))}L${xy(g([L, 0]))}M${xy(g([L - 12, 0]))}L${xy(g([L, -8]))}M${xy(g([L - 12, 0]))}L${xy(g([L, 8]))}`; };
    let k = `<g fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round">`;
    const AR = arrow(196, 132, -0.15, 120) + arrow(232, 70, -0.9, 70) + arrow(250, 214, 0.7, 64);
    k += `<path d="${AR}"/></g><path d="${AR}" fill="none" stroke="url(#gold)" stroke-width="2.5" stroke-linecap="round"/>`;
    k += `<g fill="${INK}">${[[196, 132, -0.15], [232, 70, -0.9], [250, 214, 0.7]].map(([x, y, a]) => poly([[-2, 0], [22, -11], [18, 0], [22, 11]].map(T(x, y, a)))).map((d) => `<path d="${d}"/>`).join('')}</g>`;
    k += `<path d="${star(196, 132, 16)}" fill="url(#white)" stroke="${INK}" stroke-width="3"/>`;
    k += `<g fill="url(#gold)" stroke="${INK}" stroke-width="2.5">${[[218, 106, 6], [214, 158, 7], [64, 70, 6], [52, 214, 7], [36, 140, 5]].map(([x, y, r]) => `<path d="${star(x, y, r)}"/>`).join('')}</g>`;
    G('M300 120L310 118M318 72l8-6M296 226l8 6', 2.5, '#ffe28a');
    k += I.flush();
    return done(b + fg + k + frame('ruby'));
  },

  // Gain a 600 Barrier: a curved wall of glass catches a void bolt; cracks star out from the impact.
  'Barrier': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), G = (d, w = 2, c = '#fff4c8') => I.add(d, w, c);
    const SX = 246, SY = 132, OX = 450, OY = 150;
    let b = scene({ pal: ['white', 'gold', 'amber', 'sky', 'pearl', 'deep', 'navy', 'violet', 'teal', 'ivory', 'ruby', 'ash'], SX, SY,
      radii: [0, 32, 70, 140, 430], n: [10, 10, 12, 8], cols: [['white', 'gold'], ['amber', 'gold'], ['deep', 'navy'], ['violet', 'navy']], rot: 0.4, g: [248, 270], ph: -1 });
    G(streaks([[30, 120, 60], [40, 200, 60], [140, 40, 50], [100, 160, 40]]), 1.5, '#9fc0f0');
    b += I.flush();
    // wall: band between two arcs centred off the right edge
    const R1 = 204, R2 = 176, R3 = 148, A0 = Math.PI - 0.66, A1 = Math.PI + 0.66;
    const P = (r, a) => [OX + r * Math.cos(a), OY + r * Math.sin(a)];
    const wall = `M${xy(P(R1, A0))}A${R1} ${R1} 0 0 1 ${xy(P(R1, A1))}L${xy(P(R3, A1))}A${R3} ${R3} 0 0 0 ${xy(P(R3, A0))}Z`;
    let panes = '';
    const N = 4;
    for (let row = 0; row < 1; row++) {
      const ra = R1, rb = R3, sh = 0;
      for (let i = -1; i < N; i++) {
        const a = A1 - ((i + sh) / N) * (A1 - A0), c = A1 - ((i + 1 + sh) / N) * (A1 - A0);
        const lo = Math.min(A1, Math.max(A0, a)), hi = Math.min(A1, Math.max(A0, c));
        if (Math.abs(lo - hi) < 0.02) continue;
        panes += fill(`M${xy(P(ra, lo))}A${ra} ${ra} 0 0 0 ${xy(P(ra, hi))}L${xy(P(rb, hi))}A${rb} ${rb} 0 0 1 ${xy(P(rb, lo))}Z`, (i + row) % 2 ? 'gold' : 'ivory');
      }
    }
    const shade = `M${xy(P(R3 + 14, A0 + 0.04))}A${R3 + 14} ${R3 + 14} 0 0 0 ${xy(P(R3 + 14, A1 - 0.04))}L${xy(P(R3, A1))}A${R3} ${R3} 0 0 1 ${xy(P(R3, A0))}Z`;
    let fg = `<g data-figure="1">` + under([wall], 10);
    fg += `<g stroke="${INK}" stroke-width="3.5" stroke-linejoin="round">${panes}${fill(shade, 'sky', ' stroke-width="3"')}`;
    fg += fill(sm([[246, 132], [236, 106], [254, 120], [262, 96], [268, 124], [290, 118], [272, 136], [286, 158], [262, 146], [250, 170], [248, 146], [228, 150]]), 'white');
    fg += `</g>`;
    H('M246 132L222 84M250 140L226 196M264 126L282 70M262 142L290 202', 2.5);
    H(hatch(arc(OX, OY, R3, A0 + 0.05, A1 - 0.05), 14, 4, 12, 1, { swell: true, inset: -3 }), 1.8);
    G(offset(arc(OX, OY, R1, A0 + 0.08, Math.PI - 0.2), 8, 1, 5), 2.5, '#ffffff');
    G(offset(arc(OX, OY, R1, Math.PI + 0.22, A1 - 0.06), 8, 1, 5), 2.5, '#ffffff');
    fg += I.flush() + `</g>`;
    // the void bolt (secondary): jagged dark lance from the upper left
    const bolt = 'M30 52L96 82L86 92L160 112L150 120L232 128L144 132L154 124L78 104L88 96Z';
    let k = `<path d="${bolt}" fill="${INK}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`;
    k += `<path d="M100 96L150 112L146 116L96 100Z" fill="url(#violet)" stroke="${INK}" stroke-width="2"/>`;
    k += `<g fill="url(#gold)" stroke="${INK}" stroke-width="2.5">${[[206, 84, 7], [196, 176, 8], [214, 214, 5], [190, 60, 5]].map(([x, y, r]) => `<path d="${star(x, y, r)}"/>`).join('')}</g>`;
    // sheltered figure behind the wall
    k += `<g fill="${INK}"><circle cx="338" cy="210" r="8"/><path d="M326 252L328 224C330 216 346 216 348 224L352 252Z"/></g><path d="M330 228L322 252L338 252Z" fill="url(#teal)" stroke="${INK}" stroke-width="2.5"/>`;
    G('M332 206C330 210 330 214 332 216M330 222L328 236', 2.5, '#ffe28a');
    k += I.flush();
    return done(b + fg + k + frame('ruby'));
  },

  // Restore 1800 LP, your creatures +200 DEF: a dove of light dives toward the field, gilding the creatures below.
  'Divine Renewal': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), G = (d, w = 2, c = '#fff4c8') => I.add(d, w, c);
    const SX = 222, SY = 178;
    let b = scene({ pal: ['white', 'gold', 'amber', 'sky', 'pearl', 'deep', 'navy', 'violet', 'teal', 'ivory', 'ruby'], SX, SY,
      radii: [0, 30, 66, 150, 440], n: [8, 10, 12, 8], cols: [['white', 'gold'], ['gold', 'amber'], ['deep', 'violet'], ['navy', 'deep']], rot: 0.26, g: [248, 268], ph: -1, ring: [40, 54] });
    G(streaks([[24, 60, 50], [30, 120, 50], [340, 230, 30], [120, 30, 40]]), 1.5, '#9fc0f0');
    b += I.flush();
    // dove: head down to the lower left, wings raised in a wide V above it
    const f = T(266, 150, -0.72), M = (pts) => pts.map(f);
    const P = (A) => (t) => bz(A, t);
    // wing: leading edge A, trailing edge B (shoulder to tip), feather panes between, scalloped trailing edge
    function wing(A, B, n, cols, bump) {
      const a = P(A), c = P(B);
      let out = `M${xy(a(0))}C${xy(A[1])} ${xy(A[2])} ${xy(A[3])}`, panes = '';
      for (let i = n; i > 0; i--) {
        const p0 = c(i / n), p1 = c((i - 1) / n), m = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], d = [p1[0] - p0[0], p1[1] - p0[1]], L = Math.hypot(...d);
        const q = [m[0] - (d[1] / L) * bump, m[1] + (d[0] / L) * bump];
        out += `Q${xy(q)} ${xy(p1)}`;
        const s0 = (i - 1) / n, s1 = i / n;
        panes += fill(`M${xy(a(s0))}L${xy(a(s1))}L${xy(c(s1))}Q${xy(q)} ${xy(c(s0))}Z`, cols[i % cols.length]);
      }
      return [out + 'Z', panes];
    }
    const NA = [[250, 138], [228, 96], [196, 56], [136, 36]], NB = [[264, 156], [206, 158], [148, 118], [136, 36]];
    const FA = [[270, 124], [286, 90], [316, 56], [352, 38]], FB = [[290, 142], [340, 140], [372, 96], [352, 38]];
    const [nw, np] = wing(NA, NB, 7, ['ivory', 'white'], 10), [fw, fp] = wing(FA, FB, 6, ['pearl', 'sky'], -9);
    const body = sm(M([[-48, 0], [-30, -18], [0, -22], [30, -16], [50, -4], [50, 6], [30, 16], [0, 22], [-30, 18]]));
    const tail = sm(M([[36, -12], [86, -26], [96, -8], [96, 10], [86, 26], [36, 12]]));
    const head = sm(M([[-66, 0], [-58, -14], [-40, -16], [-30, 0], [-40, 16], [-58, 14]]));
    const beak = poly(M([[-64, -6], [-80, 0], [-64, 6]]));
    let fg = `<g data-figure="1">` + under([fw, tail, body, head, beak, nw]);
    fg += `<g stroke="${INK}" stroke-width="3.5" stroke-linejoin="round">`;
    fg += fp + fill(tail, 'pearl') + fill(body, 'ivory') + fill(sm(M([[-30, 18], [0, 22], [30, 16], [50, 6], [20, 8], [-20, 10]])), 'sky', ' stroke-width="3"');
    fg += fill(head, 'white') + fill(beak, 'gold', ' stroke-width="2.5"') + np;
    fg += `</g>`;
    const eye = f([-50, -4]);
    fg += `<circle cx="${R(eye[0])}" cy="${R(eye[1])}" r="3" fill="${INK}"/>`;
    H(hatch(FB, 7, 4, 12, -1, { inset: 6, swell: true, t0: 0.1 }), 1.8);
    H(hatch(FB, 4, 3, 9, -1, { inset: 6, swell: true, tilt: 0.7, t0: 0.3, t1: 0.8 }), 1.6);
    H(hatch(M([[-30, 18], [0, 22], [30, 18], [50, 6]]), 6, 4, 8, -1, { inset: 3 }), 1.6);
    H(M([[50, 0], [92, -14], [50, 4], [94, 4], [50, 8], [92, 18]]).map((q, i) => (i % 2 ? 'L' : 'M') + xy(q)).join(''), 2);
    G(offset(NA, 8, -1, 6, 0.1, 0.85), 2.5, '#ffffff');
    G(offset(M([[-46, -12], [-20, -18], [10, -18], [36, -12]]), 4, 1, 4), 2.5, '#ffffff');
    fg += I.flush() + `</g>`;
    // light pouring onto two small creatures; their shields gilded
    let k = `<g fill="${INK}"><path d="M60 250C62 232 76 224 92 226C104 220 112 230 108 240L112 250Z"/><circle cx="104" cy="224" r="7"/><path d="M134 252L138 230C140 222 156 222 158 230L162 252Z"/><circle cx="148" cy="218" r="8"/></g>`;
    k += `<g stroke="${INK}" stroke-width="3"><path d="M72 230C84 226 94 232 94 244C84 248 74 246 72 230Z" fill="url(#gold)"/><path d="M156 228C170 226 176 236 172 250L158 250Z" fill="url(#gold)"/></g>`;
    G('M100 220l4-4M144 212l6-2', 2.5, '#ffe28a');
    k += `<g fill="url(#white)" stroke="${INK}" stroke-width="2.5">${[[60, 180, 7], [96, 150, 6], [186, 214, 6], [40, 110, 5]].map(([x, y, r]) => `<path d="${star(x, y, r)}"/>`).join('')}</g>`;
    k += I.flush();
    return done(b + k + fg + frame('ruby'));
  },

  // Next summoned creature +400 DEF permanently: an arm bursts from the ground, its skin setting into stone plates.
  'Stone Skin': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), G = (d, w = 2, c = '#ffe9b0') => I.add(d, w, c);
    const SX = 262, SY = 86;
    let b = scene({ pal: ['white', 'gold', 'amber', 'orange', 'wine', 'violet', 'ash', 'bronze', 'teal', 'ruby', 'navy'], SX, SY,
      radii: [0, 34, 76, 150, 430], n: [10, 10, 12, 7], cols: [['white', 'gold'], ['amber', 'gold'], ['wine', 'violet'], ['violet', 'wine']], rot: 0.15, g: [244, 266], gc: ['bronze', 'ash'], ph: 1 });
    G(streaks([[30, 60, 60], [40, 130, 50], [300, 200, 50], [330, 150, 40]]), 1.5, '#e090a0');
    b += I.flush();
    const A = [[150, 292], [170, 220], [206, 160], [238, 118]];
    const w = (t) => 34 - 12 * t;
    const arm = ribbon(A, w, 10);
    const f = T(258, 88, -0.62);
    const fist = sm([[-30, -26], [-10, -36], [16, -34], [36, -22], [40, 4], [30, 30], [-6, 34], [-34, 22], [-40, -4]].map(f));
    const knuck = [[-28, -28], [-8, -36], [12, -34], [30, -24]].map(([x, y]) => sm([[x - 10, y + 6], [x - 8, y - 6], [x, y - 10], [x + 8, y - 6], [x + 10, y + 6]].map(f)));
    const thumb = sm([[-38, -6], [-30, 12], [-6, 22], [14, 18], [6, 8], [-20, 0]].map(f));
    let fg = `<g data-figure="1">` + under([arm, fist, ...knuck], 10);
    fg += `<g stroke="${INK}" stroke-width="3.5" stroke-linejoin="round">`;
    fg += bands(A, w, [0, 0.16, 0.34, 0.5, 0.66, 0.82, 1], ['bronze', 'ash', 'bronze', 'gold', 'bronze', 'ash']);
    fg += fill(fist, 'bronze') + knuck.map((d, i) => fill(d, i % 2 ? 'gold' : 'amber')).join('') + fill(thumb, 'gold');
    // shadow panes on the far (right) side
    fg += fill(ribbon([[176, 290], [194, 222], [226, 166], [254, 128]], (t) => 9 - 3 * t, 8), 'ash', ' stroke-width="3"');
    fg += `</g>`;
    // green glowing seams where the stone is setting
    I.add('M160 250L176 244L184 252M178 202L194 196L198 206M208 160L220 156', 3, '#2fb86a');
    H(hatch([[184, 292], [204, 222], [236, 168], [264, 130]], 12, 4, 12, 1, { inset: 3, swell: true }), 1.8);
    H(hatch([[184, 292], [204, 222], [236, 168], [264, 130]], 6, 4, 9, 1, { inset: 3, tilt: 0.7, t0: 0.2, t1: 0.7 }), 1.6);
    H(hatch([f([40, 4]), f([38, 20]), f([30, 30]), f([10, 34])], 5, 4, 9, 1, { inset: 2 }), 1.8);
    G(offset([[120, 292], [140, 222], [178, 156], [214, 112]], -8, 1, 6), 2.5, '#ffe9b0');
    G([f([-22, -16]), f([0, -22]), f([22, -14])].map((q, i) => (i ? 'L' : 'M') + xy(q)).join(''), 2.5, '#fff6d0');
    fg += I.flush() + `</g>`;
    // flying rock shards and green sparks
    let k = `<g fill="url(#bronze)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"><path d="M96 230l14-12l12 8l-6 14Z"/><path d="M210 236l12-8l10 10l-12 6Z"/><path d="M120 196l8-8l8 6l-8 8Z"/><path d="M226 262l18-6l6 12l-16 4Z"/></g>`;
    k += `<g fill="url(#teal)" stroke="${INK}" stroke-width="2.5">${[[316, 60, 7], [330, 120, 6], [196, 70, 6], [100, 150, 5]].map(([x, y, r]) => `<path d="${star(x, y, r)}"/>`).join('')}</g>`;
    k += `<path d="M120 262L140 250L160 262L190 254L214 266L190 272L150 270Z" fill="url(#ash)" stroke="${INK}" stroke-width="3"/>`;
    return done(b + k + fg + frame('teal'));
  },

  // Your creatures +400 DEF until your next turn: a wall of water rises and curls, taking the arrows meant for them.
  'Tidewall': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), G = (d, w = 2, c = '#e6f0ff') => I.add(d, w, c);
    const SX = 186, SY = 60;
    let b = scene({ pal: ['white', 'pearl', 'sky', 'deep', 'navy', 'teal', 'violet', 'gold'], SX, SY,
      radii: [0, 30, 72, 146, 430], n: [8, 10, 12, 8], cols: [['white', 'pearl'], ['sky', 'pearl'], ['deep', 'navy'], ['navy', 'violet']], rot: 0.5, g: [248, 270], gc: ['navy', 'teal'], ph: 1 });
    G(streaks([[300, 120, 60], [310, 190, 50], [24, 120, 40], [260, 230, 40]]), 1.5, '#7f9ae8');
    b += I.flush();
    const wave = 'M58 264C70 200 70 120 112 72C140 40 186 30 224 46C246 56 258 76 250 96C238 82 218 80 206 92C226 98 228 116 214 122C190 112 168 126 160 150C150 188 170 232 232 264Z';
    const face = 'M206 92C226 98 228 116 214 122C190 112 168 126 160 150C150 188 170 232 232 264L196 264C164 236 150 196 156 156C160 128 180 104 206 92Z';
    const BK = [[58, 264], [70, 200], [70, 120], [112, 72]];
    let fg = `<g data-figure="1">` + under([wave], 10);
    fg += `<g stroke="${INK}" stroke-width="3.5" stroke-linejoin="round">${fill(wave, 'teal')}`;
    // water bands following the rise
    fg += fill('M76 264C86 206 88 136 124 92C110 140 106 206 116 264Z', 'sky') + fill('M124 92C150 64 182 56 206 64C176 78 150 112 140 160C134 200 140 236 160 264L116 264C106 206 110 140 124 92Z', 'teal');
    fg += fill('M206 64C176 78 150 112 140 160C134 200 140 236 160 264L196 264C164 236 150 196 156 156C160 128 180 104 206 92C214 80 214 70 206 64Z', 'sky');
    fg += fill(face, 'deep', ' stroke-width="3"');
    // foam crest with claws
    fg += fill('M100 84C130 46 186 30 224 46C246 56 258 76 250 96C238 82 218 80 206 92C214 76 206 66 194 64C176 62 160 72 150 66C134 70 118 78 100 84Z', 'pearl');
    fg += `<g fill="url(#white)" stroke-width="2.5"><path d="M150 66l-8 12l14-4Z"/><path d="M180 60l-4 14l10-8Z"/><path d="M122 74l-10 12l14-4Z"/></g>`;
    fg += `</g>`;
    H(hatch([[206, 92], [176, 108], [156, 150], [168, 230]], 10, 4, 12, 1, { inset: 4, swell: true }), 1.8);
    H(hatch([[206, 92], [176, 108], [156, 150], [168, 230]], 5, 4, 9, 1, { inset: 4, tilt: 0.7, t0: 0.3, t1: 0.75 }), 1.6);
    G(offset(BK, 9, -1, 6), 2.5, '#e6f0ff');
    G('M110 120C100 160 98 210 104 250M134 150C128 190 132 226 146 256', 2, '#80e8d8');
    fg += I.flush() + `</g>`;
    // sheltered creatures behind, arrows broken on the face
    let k = `<g fill="${INK}"><path d="M20 262C22 246 30 240 40 242L46 232L52 244L56 262Z"/><circle cx="28" cy="240" r="7"/></g><path d="M34 248C42 246 48 252 48 262L34 262Z" fill="url(#teal)" stroke="${INK}" stroke-width="2.5"/>`;
    k += `<g fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"><path d="M330 150L250 170M340 92L272 128M352 210L276 210M244 192l-10 -20M240 150l-12 14"/></g>`;
    k += `<g fill="${INK}"><path d="M330 150l10-8l-2 12Z"/><path d="M340 92l10-6l-4 12Z"/><path d="M352 210l10-6v12Z"/></g>`;
    k += `<g fill="url(#pearl)" stroke="${INK}" stroke-width="2.5">${[[258, 168, 8], [268, 210, 7], [276, 128, 6]].map(([x, y, r]) => `<path d="${star(x, y, r)}"/>`).join('')}</g>`;
    k += `<g fill="url(#gold)" stroke="${INK}" stroke-width="2"><path d="M300 92l8 2l-4 6Z"/><path d="M296 166l8 0l-4 7Z"/></g>`;
    return done(b + fg + k + frame('pearl'));
  },

  // Outnumbered: draw 2, otherwise restore 400: a great leaf rides a rising gust; the fallen figure gets up beneath it.
  'Second Wind': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), G = (d, w = 2, c = '#fff4c8') => I.add(d, w, c);
    const SX = 244, SY = 128;
    let b = scene({ pal: ['white', 'gold', 'amber', 'sky', 'pearl', 'deep', 'navy', 'violet', 'teal', 'ivory', 'ruby'], SX, SY,
      radii: [0, 32, 72, 146, 430], n: [8, 10, 10, 7], cols: [['white', 'gold'], ['gold', 'amber'], ['violet', 'deep'], ['deep', 'violet']], rot: 0.33, g: [252, 272], gc: ['teal', 'navy'], ph: -1, ring: [40, 54] });
    G(streaks([[300, 230, 50], [30, 60, 50], [30, 130, 40], [150, 30, 40]]), 1.5, '#9fc0f0');
    b += I.flush();
    // wind: two pale strands sweeping up from the lower left and hooking over the leaf
    const W1 = [[112, 246], [176, 250], [246, 226], [300, 172]];
    const hook = (x, y, r, w) => `M${x - r} ${y}A${r} ${r} 0 1 1 ${R(x + r * 0.2)} ${R(y + r * 0.9)}L${R(x + r * 0.1)} ${R(y + r * 0.9 - w)}A${r - w} ${r - w} 0 1 0 ${x - r + w} ${y}Z`;
    const wr1 = ribbon(W1, (t) => 3 + 10 * Math.sin(Math.PI * Math.min(1, t * 0.9 + 0.1)), 7);
    const hk = hook(320, 160, 26, 10);
    // the leaf: panes cut between its veins, lit half ivory and gold, far half pearl and sky
    const f = T(252, 120, -0.62), Lh = 100, Wd = 54;
    const ed = (x) => Wd * Math.pow(Math.max(0, Math.sin((Math.PI * (x + Lh)) / (2 * Lh))), 0.75);
    const xs = [-100, -58, -16, 26, 66, 100];
    const E = (x, sg) => f([x, sg * ed(x)]), mid = (x) => f([x, 0]);
    const outline = [...Array.from({ length: 10 }, (_, i) => E(-Lh + (i * 2 * Lh) / 9, -1)), ...Array.from({ length: 8 }, (_, i) => E(Lh - ((i + 1) * 2 * Lh) / 9, 1))];
    const leafD = sm(outline);
    let panes = '';
    for (const sg of [-1, 1]) for (let i = 0; i < xs.length - 1; i++) {
      const x0 = xs[i] + (sg > 0 ? 14 : 0), x1 = Math.min(Lh, xs[i + 1] + (sg > 0 ? 14 : 0)), sk = 26;
      const pts = [mid(Math.max(-Lh + 8, x0 - sk)), E(Math.min(Lh, x0), sg), E((Math.min(Lh, x0) + x1) / 2, sg), E(x1, sg), mid(Math.min(Lh - 4, x1 - sk))];
      if (x1 - x0 < 8) continue;
      panes += fill(poly(pts), sg < 0 ? (i % 2 ? 'ivory' : 'white') : (i % 2 ? 'gold' : 'amber'));
    }
    const stem = ribbon([f([-96, 0]), f([-112, 2]), f([-124, 8]), f([-136, 16])], 4, 4);
    let fg = `<g data-figure="1">` + under([wr1, hk, stem, leafD]);
    fg += `<g stroke="${INK}" stroke-width="3.5" stroke-linejoin="round">`;
    fg += fill(wr1, 'pearl') + fill(hk, 'pearl', ' stroke-width="3"') + fill(stem, 'gold') + fill(leafD, 'gold') + panes;
    fg += `<path d="M${xy(mid(-Lh))}L${xy(mid(Lh - 6))}" fill="none" stroke-width="5"/>`;
    fg += `</g>`;
    // hatching on the far half, cross-hatch near the tip; gouges inside the lit edge and along the midrib
    H(hatch([E(-80, 1), E(-30, 1), E(30, 1), E(84, 1)], 12, 4, 13, -1, { inset: 4, swell: true }), 1.8);
    H(hatch([E(-40, 1), E(0, 1), E(40, 1), E(76, 1)], 4, 4, 9, -1, { inset: 4, swell: true, tilt: 0.7 }), 1.6);
    G(offset([E(-84, -1), E(-30, -1), E(30, -1), E(84, -1)], 8, 1, 7), 2.5, '#ffffff');
    G(`M${xy(f([-80, -5]))}L${xy(f([80, -5]))}`, 2, '#ffffff');
    H(hatch(W1, 9, 5, 5, -1, { inset: 1, t0: 0.15, t1: 0.85 }), 1.6);
    fg += I.flush() + `</g>`;
    // the figure rising from one knee, arm flung up toward the leaf
    let k = `<g fill="none" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"><path d="M76 258L64 240L86 234L96 260"/><path d="M78 218L92 196L100 178M82 220L62 208"/><path d="M76 236L80 212" stroke-width="15"/></g><circle cx="78" cy="198" r="8" fill="${INK}"/>`;
    k += `<path d="M74 210C60 210 46 222 40 240L62 244C64 230 68 218 74 210Z" fill="url(#ruby)" stroke="${INK}" stroke-width="3"/>`;
    G('M84 194C86 198 86 202 84 204M92 196L98 184M84 224L82 212', 2.5, '#ffe28a');
    k += I.flush();
    k += `<g fill="url(#white)" stroke="${INK}" stroke-width="2.5">${[[110, 160, 7], [130, 210, 6], [44, 170, 5]].map(([x, y, r]) => `<path d="${star(x, y, r)}"/>`).join('')}</g>`;
    return done(b + fg + k + frame('ruby'));
  },

  // Your creatures +200 ATK until your next turn: a war horn sounds and spears rise along the line.
  'Rally Cry': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), G = (d, w = 2, c = '#ffe9b0') => I.add(d, w, c);
    const SX = 136, SY = 92;
    let b = scene({ pal: ['white', 'gold', 'amber', 'deep', 'violet', 'navy', 'teal', 'bronze', 'steel', 'ruby', 'wine'], SX, SY,
      radii: [0, 36, 82, 156, 430], n: [10, 12, 12, 8], cols: [['white', 'gold'], ['gold', 'amber'], ['deep', 'violet'], ['violet', 'navy']], rot: 0.1, g: [240, 264], gc: ['teal', 'bronze'], ph: 1, ring: [50, 64] });
    G(streaks([[300, 40, 50], [320, 90, 40], [24, 180, 40]]), 1.5, '#9a8ae0');
    b += I.flush();
    // horn: curving from the mouthpiece (lower right) to a flared bell (upper left)
    const A = [[340, 236], [342, 156], [262, 112], [160, 98]];
    const w = (t) => 7 + 30 * t ** 1.7;
    const horn = ribbon(A, w, 12);
    const el = (cx, cy, rx, ry, a) => { const f = T(cx, cy, a), p = f([0, -ry]), q = f([0, ry]); return `M${xy(p)}A${rx} ${ry} ${R((a * 180) / Math.PI)} 1 0 ${xy(q)}A${rx} ${ry} ${R((a * 180) / Math.PI)} 1 0 ${xy(p)}Z`; };
    const bell = el(152, 96, 22, 50, 0.22), mouth = el(148, 96, 13, 38, 0.22);
    const strap = 'M206 106C236 146 284 166 322 160';
    let fg = `<g data-figure="1">` + under([horn, bell]);
    fg += `<path d="${strap}" fill="none" stroke="${INK}" stroke-width="9"/><path d="${strap}" fill="none" stroke="url(#ruby)" stroke-width="4"/>`;
    fg += `<g stroke="${INK}" stroke-width="3.5" stroke-linejoin="round">`;
    fg += bands(A, w, [0, 0.12, 0.26, 0.4, 0.5, 0.64, 0.78, 0.88, 1], ['gold', 'bronze', 'steel', 'gold', 'bronze', 'steel', 'gold', 'bronze']);
    fg += fill(bell, 'gold') + fill(mouth, 'white', ' stroke-width="3"');
    fg += fill(ribbon([[340, 250], [340, 240], [340, 234], [340, 228]], 9, 4), 'steel');
    fg += `</g>`;
    H(hatch([[352, 236], [354, 168], [280, 142], [170, 136]], 12, 3, 14, 1, { inset: 2, t0: 0.15, t1: 0.95 }), 1.8);
    H(hatch([[352, 236], [354, 168], [280, 142], [170, 136]], 5, 3, 10, 1, { inset: 2, tilt: 0.7, t0: 0.6, t1: 0.95 }), 1.6);
    G(offset([[334, 230], [330, 150], [254, 92], [170, 72]], 2, -1, 7, 0.15, 0.92), 2.5, '#fff6d0');
    fg += I.flush() + `</g>`;
    // sound: carved arcs fanning out to the upper left from the bell
    let k = `<g fill="none" stroke-linecap="round">`;
    for (const [r, wd] of [[44, 9], [66, 8], [88, 7]]) {
      const p = arc(152, 96, r, Math.PI * 0.8, Math.PI * 1.36);
      const d = `M${xy(p[0])}C${xy(p[1])} ${xy(p[2])} ${xy(p[3])}`;
      k += `<path d="${d}" stroke="${INK}" stroke-width="${wd + 4}"/><path d="${d}" stroke="url(#gold)" stroke-width="${wd - 3}"/>`;
    }
    k += `</g>`;
    // the line answers: raised spears and helmets along the horizon
    k += `<g fill="${INK}">`;
    for (const [x, y, s] of [[40, 250, 1], [80, 256, 0.9], [196, 252, 1], [236, 256, 0.85], [276, 250, 0.95]]) k += `<path d="M${R(x - 10 * s)} ${y + 12}V${R(y - 6 * s)}Q${x} ${R(y - 20 * s)} ${R(x + 10 * s)} ${R(y - 6 * s)}V${y + 12}Z"/><path d="M${R(x + 12 * s)} ${y + 8}L${R(x + 18 * s)} ${R(y - 56 * s)}L${R(x + 22 * s)} ${R(y - 56 * s)}L${R(x + 17 * s)} ${y + 8}Z"/>`;
    k += `</g><g fill="url(#gold)" stroke="${INK}" stroke-width="2.5">`;
    for (const [x, y, s] of [[40, 250, 1], [80, 256, 0.9], [196, 252, 1], [236, 256, 0.85], [276, 250, 0.95]]) k += `<path d="M${R(x + 20 * s)} ${R(y - 72 * s)}L${R(x + 25 * s)} ${R(y - 56 * s)}L${R(x + 15 * s)} ${R(y - 56 * s)}Z"/>`;
    k += `</g>`;
    return done(b + k + fg + frame('gold'));
  },
});
