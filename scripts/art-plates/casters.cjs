'use strict';
// Casters and shades plates (carved glass, GDADA run 3): Dawn Acolyte, Nightblade, Dread Reaper,
// Brine Witch, Frost Siren, River Sprite, Shadow Stalker, Lord of the Void. See docs/ART_STYLE.md.
const { Ink, INK, R, defs, burst, hatch, offset, frame } = require('../art-lib/glass.cjs');

const bz = (p, t) => { const u = 1 - t; return [0, 1].map((j) => u * u * u * p[0][j] + 3 * u * u * t * p[1][j] + 3 * u * t * t * p[2][j] + t * t * t * p[3][j]); };
const dbz = (p, t) => { const u = 1 - t; return [0, 1].map((j) => 3 * u * u * (p[1][j] - p[0][j]) + 6 * u * t * (p[2][j] - p[1][j]) + 3 * t * t * (p[3][j] - p[2][j])); };
const Q = ([x, y]) => `${R(x)} ${R(y)}`;
// ink under-pass for the silhouette, then panes on top
const S = (ds, w = 9) => `<g fill="${INK}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round">${ds.map((d) => `<path d="${d}"/>`).join('')}</g>`;
const P = (list, w = 3.5) => `<g stroke="${INK}" stroke-width="${w}" stroke-linejoin="round">${list.map(([d, c]) => `<path d="${d}" fill="url(#${c})"/>`).join('')}</g>`;
const circ = (x, y, r) => `M${x - r} ${y}A${r} ${r} 0 1 0 ${x + r} ${y}A${r} ${r} 0 1 0 ${x - r} ${y}Z`;
const rings = (x, y, a, b) => `<g fill="none" stroke="${INK}" stroke-linecap="round"><circle cx="${x}" cy="${y}" r="${a}" stroke-width="2.5" stroke-dasharray="16 6 30 8 10 6"/><circle cx="${x}" cy="${y}" r="${b}" stroke-width="2" stroke-dasharray="24 9 12 7 36 10"/></g>`;
// pane between two cubic contours A and B
const band = (A, B) => `M${Q(A[0])}C${Q(A[1])} ${Q(A[2])} ${Q(A[3])}L${Q(B[3])}C${Q(B[2])} ${Q(B[1])} ${Q(B[0])}Z`;
const cub = (p) => `M${Q(p[0])}C${Q(p[1])} ${Q(p[2])} ${Q(p[3])}`;
// tapering strip along a cubic centreline; seg(k) cuts it into k panes
function side(p, w0, w1, n) {
  const l = [], r = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, [x, y] = bz(p, t), [dx, dy] = dbz(p, t), L = Math.hypot(dx, dy) || 1, w = (w0 + (w1 - w0) * t) / 2;
    l.push([x - (dy / L) * w, y + (dx / L) * w]); r.push([x + (dy / L) * w, y - (dx / L) * w]);
  }
  return [l, r];
}
function ribbon(p, w0, w1, n = 10) {
  const [l, r] = side(p, w0, w1, n);
  return 'M' + l.concat(r.reverse()).map(Q).join('L') + 'Z';
}
function segs(p, w0, w1, k, cols, n = 3) {
  const [l, r] = side(p, w0, w1, k * n), out = [];
  for (let s = 0; s < k; s++) {
    const a = l.slice(s * n, s * n + n + 1), b = r.slice(s * n, s * n + n + 1).reverse();
    out.push(['M' + a.concat(b).map(Q).join('L') + 'Z', cols[s % cols.length]]);
  }
  return out;
}
// move a small absolute path (M L C Q Z only) to (x,y), scale s, mirror f
const tp = (d, x, y, s, f = 1) => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (m, a, b) => `${R(x + f * s * a)} ${R(y + s * b)}`);
// a small foe: black woodcut silhouette with one coloured pane and gold gouges toward the light
function foe(kind, x, y, s, f, pane, gouge, gc = '#ffd98a') {
  const shapes = {
    stand: ['M-8 0L-4 -18L4 -18L8 0L3 0L0 -10L-3 0Z', 'M-7 -18L-8 -32C-6 -37 6 -37 8 -32L7 -18Z', 'M-5 -41C-5 -48 5 -48 5 -41C5 -34 -5 -34 -5 -41Z', 'M-6 -32L-14 -20L-10 -18L-2 -28Z'],
    kneel: ['M-16 0L-12 -10L0 -12L-2 -26C-2 -32 10 -32 10 -26L12 -10L16 0Z', 'M-2 -36C-2 -43 8 -43 8 -36C8 -29 -2 -29 -2 -36Z', 'M0 -26L-14 -40L-10 -44L4 -30Z'],
    fallen: ['M-30 0C-26 -8 -10 -12 6 -10L20 -6L24 0Z', 'M-36 -2C-36 -9 -26 -9 -26 -2C-26 4 -36 4 -36 -2Z', 'M-4 -10L-12 -22L-8 -24L2 -12Z'],
  };
  const panes = { stand: 'M8 -34C15 -36 21 -34 23 -32C23 -22 19 -16 13 -12C9 -18 8 -26 8 -34Z', kneel: 'M10 -28C18 -20 20 -10 18 0L12 0C14 -10 12 -18 6 -24Z', fallen: 'M4 -10C12 -20 22 -20 30 -14C28 -8 24 -4 18 -2Z' };
  let o = `<g fill="${INK}">${shapes[kind].map((d) => `<path d="${tp(d, x, y, s, f)}"/>`).join('')}</g>`;
  o += `<path d="${tp(panes[kind], x, y, s, f)}" fill="url(#${pane})" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
  return o + `<path d="${tp(gouge, x, y, s, f)}" fill="none" stroke="${gc}" stroke-width="2" stroke-linecap="round"/>`;
}
// background: burst + two wavy ground bands + carved rings
function ground(y0, y1, c0, c1, ph = 0) {
  const w = (y, a) => { let d = `M0 300V${y}`; for (let x = 50; x <= 400; x += 50) d += `Q${x - 25} ${y + R(a * Math.sin(x / 50 + ph))} ${x} ${y + R(a * 0.5 * Math.cos(x / 37 + ph))}`; return d + 'V300Z'; };
  return `<path d="${w(y0, 8)}" fill="url(#${c0})"/><path d="${w(y1, 6)}" fill="url(#${c1})"/>`;
}
function back(names, X, Y, radii, n, cols, rot, g) {
  let b = `<rect width="400" height="300" fill="${INK}"/><g stroke="${INK}" stroke-width="3" stroke-linejoin="round">`;
  b += burst(X, Y, radii, n, (k, i) => cols[k][i % 2], rot);
  return b + (g || '') + '</g>' + rings(X, Y, radii[1] + 8, radii[1] + 20);
}
// prepend only the gradients the plate uses
const seal = (body, jewel) => { const all = body + frame(jewel); return defs([...new Set([...all.matchAll(/url\(#(\w+)\)/g)].map((m) => m[1]))]) + all; };
const kit = () => { const I = Ink(); return { I, H: (d, w = 1.8) => I.add(d, w), G: (d, w = 2, c = '#fff4c8') => I.add(d, w, c) }; };

module.exports = () => ({
  // Light. Dying acolyte lifts an orb of dawn; its beam heals a kneeling ally. The hem dissolves into light.
  'Dawn Acolyte': () => {
    const { I, H, G } = kit();
    const X = 172, Y = 84;
    let b = back(['white', 'gold', 'amber', 'pearl', 'sky', 'deep', 'navy', 'teal', 'ivory', 'skin', 'ruby', 'bronze'], X, Y, [0, 30, 70, 146, 420], [10, 10, 12, 8],
      [['white', 'gold'], ['pearl', 'sky'], ['deep', 'navy'], ['navy', 'deep']], 0.2, ground(242, 264, 'teal', 'navy', 1));
    G('M290 60C306 56 320 62 338 58M300 150C318 146 332 152 350 148M40 170C56 166 70 172 86 168M226 196C240 192 254 198 270 194', 1.5, '#9ab8f0');
    G('M30 276C60 272 90 278 130 274M240 284C270 280 300 286 340 282', 2, '#8fe0d4');
    b += I.flush();
    // healing beam from the orb down to the kneeling ally
    b += P([['M186 94L322 210L300 226L170 104Z', 'gold'], ['M182 100L306 210L298 216L176 104Z', 'white']], 3);
    b += `<g fill="url(#gold)" stroke="${INK}" stroke-width="2.5"><path d="M240 176l5-9l5 9l-5 6Z"/><path d="M268 164l4-8l4 8l-4 5Z"/><path d="M220 140l4-8l4 8l-4 5Z"/></g>`;
    b += foe('kneel', 312, 250, 1.2, -1, 'ruby', 'M-4 -24L-12 -36M2 -40C0 -38 0 -34 2 -32');

    const RL = [[112, 146], [98, 178], [88, 220], [64, 258]], RR = [[142, 146], [158, 178], [170, 220], [194, 258]];
    const F1 = [[120, 150], [114, 186], [108, 222], [100, 258]], F2 = [[132, 150], [138, 186], [146, 222], [152, 258]];
    const robe = band(RL, RR);
    const sleeve = 'M132 152L156 100L172 106L152 150C154 164 158 176 164 188C148 182 136 170 132 152Z';
    const arm2 = 'M112 152C102 168 108 186 126 186L148 178L144 164L126 168C122 162 118 156 112 152Z';
    let f = `<g data-figure="1">` + S([robe, sleeve, arm2, circ(124, 130, 14), circ(X, Y, 30), 'M116 140H140V152H116Z']);
    f += P([
      [band(RL, F1), 'sky'], [band(F1, F2), 'pearl'], [band(F2, RR), 'ivory'],
      ['M116 140H140V152H116Z', 'gold'], [sleeve, 'ivory'], ['M152 150C154 164 158 176 164 188C148 182 136 170 132 152L140 136Z', 'pearl'],
      [arm2, 'pearl'], [circ(148, 172, 6), 'skin'], [circ(124, 130, 13), 'skin'],
      ['M111 131C109 118 118 113 126 115C134 116 138 120 137 124C128 122 120 127 117 139C113 137 111 135 111 131Z', 'gold'],
      [circ(X, Y, 29), 'gold'], [circ(X, Y, 17), 'white'], [circ(166, 104, 7), 'skin'],
    ]);
    // hem dissolving into motes of light
    f += `<g fill="url(#gold)" stroke="${INK}" stroke-width="2.5"><path d="M60 236l6-10l6 10l-6 7Z"/><path d="M50 210l5-9l5 9l-5 6Z"/><path d="M78 198l5-8l5 8l-5 6Z"/><path d="M64 180l4-7l4 7l-4 5Z"/></g>`;
    H(cub(F1) + cub(F2) + 'M132 72l-8-4M136 60l-8-8M150 52l-4-9M196 62l7-5M206 82l9 0M200 104l7 5', 2.5);
    H(hatch(RL, 10, 4, 14, 1, { t0: 0.1 }) + hatch(RL, 5, 4, 10, 1, { t0: 0.5, tilt: 0.7 }), 1.8);
    H(hatch([[112, 152], [104, 168], [108, 184], [126, 186]], 4, 3, 7, 1), 1.6);
    H('M127 128l6-2M129 136q4 2 7-1', 1.8);
    G(offset(RR, 7, -1, 6, 0.15, 0.9) + offset([[156, 100], [150, 116], [142, 132], [136, 150]], 6, -1, 3), 2.5);
    G('M164 76C168 72 174 72 178 74', 2.5, '#fff');
    f += I.flush() + `</g>`;
    return seal(b + f, 'ruby');
  },

  // Shadow. The assassin stands over a fallen victim, dagger lowered, catching a drawn card; scarf streams left.
  Nightblade: () => {
    const { I, H, G } = kit();
    const X = 232, Y = 98;
    let b = back(['white', 'pearl', 'steel', 'violet', 'deep', 'navy', 'ash', 'ruby', 'wine', 'ivory', 'bronze', 'teal'], X, Y, [0, 34, 74, 150, 420], [10, 10, 12, 7],
      [['white', 'pearl'], ['steel', 'pearl'], ['navy', 'deep'], ['navy', 'violet']], 0.1, ground(248, 266, 'ash', 'navy', 2));
    G('M40 150h7M43 147v7M70 110h6M73 107v6M330 160h6M333 157v6M30 200C46 196 60 202 78 198', 1.8, '#c8b8ff');
    b += I.flush();
    b += foe('fallen', 120, 252, 1.3, 1, 'steel', 'M-30 -6C-20 -12 -6 -14 6 -12');
    const scarf1 = segs([[276, 104], [230, 90], [190, 116], [96, 96]], 22, 6, 4, ['ruby', 'wine']);
    const scarf2 = segs([[276, 112], [240, 122], [200, 140], [140, 136]], 16, 5, 3, ['wine', 'ruby']);
    const torso = 'M268 106C260 126 260 148 268 170L302 170C308 148 306 124 296 106Z';
    const legs = ['M270 164L248 208L236 254L252 256L264 212L288 172Z', 'M286 168L308 210L324 254L340 252L324 204L302 166Z'];
    const arm1 = ribbon([[272, 116], [256, 106], [244, 96], [232, 90]], 14, 10, 6);
    const arm2 = ribbon([[298, 114], [312, 126], [320, 136], [326, 146]], 14, 10, 6);
    const cape = 'M296 108C322 126 340 166 334 210L318 198L308 214L300 170Z';
    const blade = 'M322 140L370 200L354 194L314 150Z';
    const card = 'M204 58L226 50L238 80L216 88Z';
    let f = `<g data-figure="1">` + S([...scarf1.map(([d]) => d), ...scarf2.map(([d]) => d), cape, torso, ...legs, arm1, arm2, blade, card, circ(284, 92, 14)]);
    f += P([...scarf1, ...scarf2, [cape, 'violet'], [legs[0], 'violet'], [legs[1], 'ash'], [torso, 'violet'],
      ['M296 106C306 124 308 148 302 170L290 170C294 148 292 126 284 108Z', 'ash'], ['M264 150H304V160H264Z', 'ruby'],
      [arm1, 'violet'], [arm2, 'ash'], [blade, 'steel'], ['M318 136L330 148L322 154L312 144Z', 'bronze'], [card, 'ivory'], ['M220 62l5 7l-4 7l-5-7Z', 'ruby'],
      [circ(284, 92, 13), 'ash'], ['M272 88C278 84 292 84 297 88L296 96C290 94 278 94 272 96Z', 'ruby'], [circ(230, 92, 6), 'steel']]);
    f += `<path d="M366 200l4 14l-6-4Z" fill="url(#ruby)" stroke="${INK}" stroke-width="2"/>`;
    H(hatch([[296, 108], [306, 126], [308, 148], [302, 170]], 7, 4, 12, 1, { t0: 0.1 }) + hatch([[302, 166], [316, 200], [326, 230], [336, 252]], 6, 3, 9, 1), 1.8);
    H(hatch([[334, 210], [338, 180], [326, 140], [296, 108]], 6, 4, 10, -1, { swell: true }), 1.6);
    H('M262 132l12 0M262 142l10 0M246 220l8 2M242 236l8 2M276 88l4 0M288 88l4 0', 2);
    G(offset([[268, 108], [262, 126], [262, 148], [268, 168]], 6, -1, 4) + offset([[270, 164], [248, 208], [240, 232], [236, 254]], 5, -1, 4), 2.5, '#d8ccff');
    G('M330 150L362 190M278 82C282 80 286 80 290 82', 2, '#fff');
    G(offset([[276, 104], [230, 90], [190, 116], [96, 96]], 4, 1, 8, 0.1, 0.8), 2, '#ffb0c0');
    f += I.flush() + `</g>`;
    return seal(b + f, 'ruby');
  },

  // Shadow. Antlered skull reaper under a blood moon draws green souls out of a fallen foe into its ribcage.
  'Dread Reaper': () => {
    const { I, H, G } = kit();
    const X = 292, Y = 96;
    let b = back(['white', 'gold', 'amber', 'ruby', 'wine', 'violet', 'navy', 'deep', 'ash', 'ivory', 'steel', 'teal', 'bronze'], X, Y, [0, 32, 72, 150, 420], [8, 10, 12, 8],
      [['gold', 'amber'], ['ruby', 'amber'], ['violet', 'deep'], ['deep', 'violet']], 0.25, ground(240, 262, 'ash', 'violet', 0.5));
    G('M40 120C56 116 70 122 88 118M60 80C76 76 90 82 106 78M120 170C136 166 150 172 168 168', 1.5, '#a890e8');
    b += I.flush();
    b += foe('fallen', 74, 254, 1.2, 1, 'steel', 'M-24 -10C-14 -14 -2 -14 8 -12');
    // souls
    const soul = [[96, 238], [140, 196], [210, 214], [288, 160]];
    b += P([...segs(soul, 22, 10, 4, ['teal', 'white']), [ribbon([[100, 222], [140, 160], [220, 150], [282, 150]], 10, 4, 8), 'teal']], 3);
    const shaft = 'M197 250L246 52L255 54L207 252Z';
    const blade = 'M250 50C210 30 154 44 120 92C156 72 196 66 244 72Z';
    const cloak = 'M262 122C238 152 226 200 214 250L232 238L244 254L262 240L278 256L294 242L312 256L328 240L344 252L354 236L364 246C358 206 348 152 326 122Z';
    const skull = 'M276 96C274 80 284 72 294 72C306 72 312 82 310 96C310 104 306 110 300 112L298 122L286 122L284 112C278 108 276 102 276 96Z';
    const ant = ['M284 78L262 56L244 54L258 48L252 30L268 50L290 72Z', 'M304 76L318 52L316 32L328 48L346 42L328 58L310 82Z'];
    const arm = ribbon([[264, 130], [250, 136], [238, 146], [222, 150]], 12, 9, 5);
    let f = `<g data-figure="1">` + S([cloak, shaft, blade, skull, ...ant, arm], 8);
    f += P([[cloak, 'ash'], ['M262 122C250 160 244 210 244 254L262 240L278 256L294 242L300 200C296 170 290 140 286 124Z', 'pearl'], ['M326 122C348 152 358 206 364 246L354 236L344 252L340 230C338 190 330 150 316 124Z', 'ash'],
      ['M262 122C238 152 226 200 214 250L232 238C236 210 246 160 272 128Z', 'steel'],
      ['M276 128H312L308 178H280Z', 'navy'], [shaft, 'bronze'], [blade, 'steel'], ['M244 72C196 66 156 72 120 92C150 78 196 74 238 80Z', 'ruby'],
      [arm, 'ivory'], [skull, 'ivory'], ...ant.map((d) => [d, 'ivory'])]);
    f += `<g stroke="${INK}" stroke-width="3"><path d="${circ(294, 158, 9)}" fill="url(#teal)"/><path d="M282 92C282 86 290 86 291 92C290 98 283 98 282 92ZM297 92C298 86 305 86 305 92C304 98 298 98 297 92Z" fill="${INK}"/></g>`;
    f += `<g fill="url(#teal)"><path d="${circ(287, 92, 2)}"/><path d="${circ(301, 92, 2)}"/></g>`;
    G('M280 136h28M281 146h26M282 166h24M283 174h22', 3, '#fbefc4');
    H('M288 106v8M293 106v8M298 106v8', 1.8);
    H(hatch([[326, 122], [348, 152], [358, 206], [364, 246]], 12, 5, 16, 1, { t0: 0.08, swell: true }) + hatch([[326, 122], [348, 152], [358, 206], [364, 246]], 6, 4, 11, 1, { t0: 0.4, t1: 0.9, tilt: 0.7 }), 1.8);
    H('M300 190L304 240M276 196L270 242', 2.5);
    H(hatch([[250, 50], [210, 30], [154, 44], [120, 92]], 8, 3, 8, -1, { t0: 0.2 }), 1.6);
    G(offset([[262, 124], [244, 150], [232, 200], [222, 240]], 7, -1, 6), 2.5, '#d8ccff');
    G('M300 78C306 80 308 86 308 92M232 64C200 58 170 66 146 82', 2, '#fff');
    f += I.flush() + `</g>`;
    return seal(b + f, 'teal');
  },

  // Water. Kelp-haired witch in a crooked hat raises a conch staff and pulls a tide out of a foe's shield.
  'Brine Witch': () => {
    const { I, H, G } = kit();
    const X = 320, Y = 84;
    let b = back(['white', 'pearl', 'sky', 'teal', 'deep', 'navy', 'violet', 'bronze', 'skin', 'gold', 'steel'], X, Y, [0, 30, 66, 136, 420], [9, 10, 12, 8],
      [['white', 'pearl'], ['sky', 'pearl'], ['deep', 'navy'], ['navy', 'violet']], 0.35, ground(246, 266, 'teal', 'navy', 3));
    G('M40 70C56 66 70 72 88 68M30 140C46 136 60 142 78 138M130 60C146 56 160 62 178 58', 1.5, '#9ab8f0');
    b += I.flush();
    b += foe('stand', 66, 250, 1.3, 1, 'steel', 'M8 -30C14 -32 18 -30 20 -28', '#cfe6ff');
    b += `<path d="M86 210l4 4l-3 5l4 5" fill="none" stroke="${INK}" stroke-width="2"/>`;
    // tide ribbons pulled from the foe to her hand
    const tide = [[96, 220], [124, 176], [160, 186], [198, 146]], tide2 = [[96, 236], [140, 214], [176, 206], [204, 160]];
    b += P([...segs(tide, 10, 22, 4, ['sky', 'teal']), ...segs(tide2, 8, 16, 3, ['teal', 'pearl'])], 3);
    b += `<g fill="url(#gold)" stroke="${INK}" stroke-width="2.5"><path d="${circ(128, 182, 5)}"/><path d="${circ(160, 204, 4)}"/><path d="${circ(176, 166, 4)}"/></g>`;
    const staff = 'M314 96L324 96L330 262L320 262Z';
    const brim = 'M222 96C236 84 292 82 310 94C292 104 242 106 222 96Z';
    const cone = 'M244 92C248 70 256 52 270 40C280 32 294 36 296 48C284 44 276 52 274 62C272 74 276 84 284 92Z';
    const robe = 'M248 118C238 150 230 200 216 252C230 244 240 256 254 248C266 258 280 246 292 254C302 246 312 252 318 250C306 200 294 150 282 118Z';
    const hair = 'M278 104C296 116 306 144 310 178L298 166L292 182C286 154 280 128 270 110Z';
    const arm = ribbon([[254, 128], [236, 138], [218 , 146], [200, 150]], 14, 10, 6);
    let f = `<g data-figure="1">` + S([staff, hair, robe, arm, brim, cone, circ(X, Y, 15), 'M252 96C252 112 258 120 266 120C274 120 280 112 278 96Z']);
    f += P([[staff, 'bronze'], [hair, 'teal'], [robe, 'teal'], ['M248 118C238 150 230 200 216 252C230 244 236 250 240 250C246 200 252 160 262 120Z', 'navy'],
      ['M282 118C294 150 306 200 318 250C312 252 306 248 300 250C294 200 286 156 274 120Z', 'pearl'],
      ['M252 96C252 112 258 120 266 120C274 120 280 112 278 96Z', 'skin'], [arm, 'sky'], [circ(198, 150, 7), 'skin'],
      [cone, 'teal'], ['M270 40C280 32 294 36 296 48C284 44 276 52 274 62C272 74 276 84 284 92L264 92C262 74 262 54 270 40Z', 'sky'], [brim, 'sky'],
      [circ(X, Y, 15), 'white'], ['M306 78C310 66 330 66 334 78C324 74 316 74 306 78Z', 'teal']]);
    H(hatch([[248, 120], [238, 150], [230, 200], [218, 250]], 9, 4, 13, 1, { t0: 0.1 }) + hatch([[248, 120], [238, 150], [230, 200], [218, 250]], 5, 3, 9, 1, { t0: 0.45, tilt: 0.7 }), 1.8);
    H('M256 140C258 170 262 210 268 248M284 142C288 176 292 210 296 248M260 104l6 0M270 104l5 0', 2.5);
    H(hatch([[222, 96], [236, 106], [292, 104], [310, 94]], 7, 3, 6, 1), 1.6);
    G(offset([[282, 120], [294, 150], [306, 200], [316, 248]], 7, 1, 6), 2.5, '#e6f0ff');
    G('M276 50C272 60 270 74 272 86M312 90C314 94 318 96 322 96M226 136C214 142 206 146 200 148', 2, '#e6f0ff');
    f += I.flush() + `</g>`;
    return seal(b + f, 'teal');
  },

  // Water. Mermaid on a sea rock throws her head back and sings; ice shards fly to frost a sailor's shield.
  'Frost Siren': () => {
    const { I, H, G } = kit();
    const X = 153, Y = 62;
    let b = back(['white', 'pearl', 'sky', 'teal', 'deep', 'navy', 'violet', 'ash', 'steel', 'bronze'], X, Y, [0, 36, 80, 156, 420], [12, 12, 12, 8],
      [['white', 'pearl'], ['pearl', 'sky'], ['deep', 'navy'], ['navy', 'violet']], 0.05, ground(250, 268, 'teal', 'navy', 4.2));
    b += P([['M70 256C80 226 110 206 150 206C190 206 220 226 232 256Z', 'ash'], ['M150 206C190 206 220 226 232 256L200 256C196 236 180 220 150 214Z', 'navy']], 3);
    G('M300 70C316 66 330 72 348 68M290 200C306 196 320 202 338 198M40 150C56 146 70 152 88 148', 1.5, '#cfe6ff');
    b += I.flush();
    // the boat and frosted foe
    b += `<path d="M300 252L370 252L360 266L310 266Z" fill="${INK}"/>` + foe('stand', 336, 252, 1.1, -1, 'pearl', 'M8 -30C14 -32 18 -30 20 -28', '#cfe6ff');
    b += `<g fill="url(#pearl)" stroke="${INK}" stroke-width="2.5"><path d="M240 74l8-10l8 10l-8 10Z"/><path d="M266 108l7-12l7 12l-7 9Z"/><path d="M290 144l6-11l6 11l-6 8Z"/><path d="M310 180l5-9l5 9l-5 7Z"/><path d="M262 46l5-8l5 8l-5 6Z"/></g>`;
    G('M256 86L266 98M280 124L288 138M300 160L308 174', 2, '#cfe6ff');
    const tail = [[152, 168], [150, 216], [194, 242], [222, 208]];
    const torso = 'M140 114C132 130 132 152 138 172L168 172C172 150 168 128 160 114Z';
    const hair = 'M146 92C120 96 102 118 94 152C104 140 116 138 126 140C120 128 126 112 140 108Z';
    const arm = ribbon([[160, 124], [176, 116], [190, 108], [204, 98]], 13, 9, 6);
    const fin = 'M218 212L254 182L248 208L266 220L240 224L228 242Z';
    let f = `<g data-figure="1"><g transform="translate(150 258) scale(1.3) translate(-150 -258)">` + S([ribbon(tail, 44, 18, 12), fin, torso, hair, arm, circ(152, 100, 14)], 7);
    f += P([[ribbon(tail, 44, 18, 12), 'pearl'], [fin, 'sky'],
      [torso, 'sky'],
      [hair, 'teal'],
      [arm, 'sky'], [circ(206, 96, 6), 'pearl'], [circ(152, 100, 13), 'pearl'], ['M140 96C140 84 152 80 162 86C156 88 150 94 146 104Z', 'teal']], 2.7);
    f += `<path d="M156 104C160 104 164 106 164 110" fill="none" stroke="${INK}" stroke-width="3"/><path d="M158 112l6-2l-1 6Z" fill="${INK}"/>`;
    H(hatch(tail, 4, 4, 10, 1, { t0: 0.2, t1: 0.6, swell: true }), 1.8);
    H('M244 204l-14 14M252 216l-18 4', 2);
    G(offset(tail, 9, 1, 6, 0.1, 0.5), 2.5, '#b8e0ff');
    f += I.flush() + `</g></g>`;
    return seal(b + f, 'teal');
  },

  // Water. A drop-bodied sprite with dragonfly wings rises from the river at dawn, holding a healing drop.
  'River Sprite': () => {
    const { I, H, G } = kit();
    const X = 250, Y = 250;
    let b = back(['white', 'gold', 'amber', 'pearl', 'sky', 'teal', 'deep', 'navy', 'violet'], X, Y, [0, 34, 80, 150, 240, 460], [12, 12, 12, 12, 8],
      [['white', 'gold'], ['gold', 'amber'], ['deep', 'sky'], ['navy', 'deep'], ['navy', 'violet']], 0.13, '');
    b += `<g stroke="${INK}" stroke-width="3" stroke-linejoin="round"><path d="M0 300V250C60 244 110 258 170 252C200 248 214 262 260 262C300 262 340 252 400 256V300Z" fill="url(#teal)"/><path d="M0 300V272C60 266 120 280 190 272C250 266 320 282 400 276V300Z" fill="url(#navy)"/></g>`;
    G('M30 262C60 258 90 264 120 260M280 270C300 266 330 272 360 268M40 286C70 282 100 288 140 284', 2, '#8fe0d4');
    G('M300 90C316 86 330 92 348 88M320 150C336 146 350 152 368 148M60 160C76 156 90 162 108 158', 1.5, '#cfe6ff');
    b += I.flush();
    const tail = [[118, 150], [140, 196], [170, 226], [206, 256]];
    const body = 'M98 108C92 126 98 146 116 158C132 154 140 140 138 124C134 112 120 102 98 108Z';
    const w1 = 'M130 116C152 76 190 58 214 64C208 84 172 108 130 116Z', w2 = 'M134 124C168 112 212 116 222 130C210 144 168 142 134 124Z';
    const w3 = 'M104 104C88 80 78 64 82 52C96 56 108 76 112 100Z';
    const arm = ribbon([[106, 134], [94, 140], [84, 138], [74, 130]], 9, 7, 5);
    let f = `<g data-figure="1"><g transform="translate(120 130) scale(1.15) translate(-120 -130)">` + S([ribbon(tail, 26, 10, 10), w1, w2, w3, body, arm, circ(110, 92, 17), circ(66, 122, 11)]);
    f += P([[w1, 'pearl'], ['M130 116C160 96 186 80 214 64C208 84 172 108 130 116Z', 'sky'], [w2, 'pearl'], ['M134 124C170 122 200 124 222 130C210 144 168 142 134 124Z', 'sky'], [w3, 'pearl'],
      ...segs(tail, 26, 10, 4, ['teal', 'sky']), [body, 'sky'], ['M98 108C92 126 98 146 116 158C108 140 106 124 112 106Z', 'teal'],
      [arm, 'sky'], [circ(110, 92, 16), 'pearl'], ['M94 92C92 76 106 70 118 74C126 78 128 84 126 88C116 82 104 84 98 96Z', 'teal'],
      [circ(66, 122, 10), 'gold'], [circ(64, 120, 4), 'white']]);
    f += `<g fill="${INK}"><path d="${circ(108, 94, 3)}"/><path d="${circ(118, 92, 3)}"/></g>`;
    H('M148 104L200 72M152 112L184 96M150 126L216 128M160 132L200 140', 2);
    H(hatch([[98, 108], [92, 126], [98, 146], [116, 158]], 5, 3, 8, 1) + hatch(tail, 10, 3, 10, -1, { t0: 0.1 }), 1.8);
    G(offset(tail, 6, 1, 8, 0.1, 0.9) + 'M128 126C130 136 128 146 122 152', 2.5, '#e6f0ff');
    G('M104 98q4 4 10 0M60 114C62 110 66 110 70 112', 2, '#fff');
    f += I.flush() + `</g></g>`;
    // healing drops falling from the cupped drop
    b += f + `<g fill="url(#gold)" stroke="${INK}" stroke-width="2.5"><path d="M62 150C62 144 66 140 66 140C66 140 70 144 70 150C70 154 62 154 62 150Z"/><path d="M56 186C56 180 60 176 60 176C60 176 64 180 64 186C64 190 56 190 56 186Z"/><path d="M66 218C66 212 70 208 70 208C70 208 74 212 74 218C74 222 66 222 66 218Z"/></g>`;
    return seal(b, 'teal');
  },

  // Shadow. A gaunt long-limbed beast springs out of a smoke rift and lunges straight at the enemy keep.
  'Shadow Stalker': () => {
    const { I, H, G } = kit();
    const X = 112, Y = 178;
    let b = back(['white', 'teal', 'pearl', 'steel', 'violet', 'deep', 'navy', 'ash', 'ivory', 'ruby', 'wine'], X, Y, [0, 34, 76, 150, 440], [10, 10, 12, 8],
      [['white', 'pearl'], ['teal', 'pearl'], ['deep', 'violet'], ['violet', 'deep']], 0.4, ground(244, 266, 'ash', 'violet', 5));
    G('M200 50C216 46 230 52 248 48M240 210C256 206 270 212 288 208M300 236C316 232 330 238 348 234', 1.5, '#a890e8');
    b += I.flush();
    // the keep it strikes, directly
    b += `<path d="M30 252V214H36V206H44V214H50V206H58V214H64V252Z" fill="${INK}"/><path d="M46 206V180L64 186L46 192" fill="url(#ruby)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
    b += `<path d="M58 218V246" stroke="#bff0e0" stroke-width="2" fill="none"/>`;
    // smoke rift it leaves
    b += `<g fill="url(#navy)" stroke="${INK}" stroke-width="3"><path d="${ribbon([[392, 140], [370, 110], [350, 150], [330, 120]], 28, 8, 10)}"/><path d="${ribbon([[392, 200], [370, 170], [350, 200], [326, 170]], 24, 6, 10)}"/></g>`;
    const torso = [[332, 120], [290, 108], [232, 132], [184, 154]];
    const head = 'M190 146C176 134 154 136 138 148L112 164L136 164L120 178C140 182 162 180 186 168Z';
    const fore1 = ribbon([[200, 158], [182, 192], [150, 206], [112, 208]], 16, 8, 10), fore2 = ribbon([[214, 148], [196, 176], [170, 186], [140, 186]], 12, 6, 8);
    const hind = ribbon([[312, 122], [348, 150], [336, 196], [298, 212]], 22, 8, 10);
    const tail = ribbon([[334, 116], [356, 96], [356, 70], [332, 60]], 12, 4, 8);
    const claws = 'M112 202L94 196L110 208L92 212L110 214L96 222L116 214Z';
    let f = `<g data-figure="1">` + S([tail, hind, fore2, ribbon(torso, 40, 26, 12), head, fore1, claws]);
    // lit panes one value step up (steel / ash) so the stalker separates from the violet dusk; violet stays in the underside
    f += P([[tail, 'ash'], [hind, 'steel'], [fore2, 'ash'], ...segs(torso, 40, 26, 4, ['ash', 'steel']),
      [ribbon([[332, 132], [290, 120], [232, 144], [186, 162]], 16, 10, 10), 'violet'], [head, 'steel'], ['M186 168C162 180 140 182 120 178L136 164L112 164C140 164 166 162 188 156Z', 'ash'],
      [fore1, 'steel'], [claws, 'ivory']]);
    f += `<g fill="url(#gold)" stroke="${INK}" stroke-width="2.5"><path d="M270 106L276 84L286 106Z"/><path d="M240 116L244 94L256 114Z"/><path d="M300 104L312 84L316 106Z"/><path d="M210 132L210 112L222 128Z"/></g>`;
    f += `<path d="M150 150l12-4l-4 8Z" fill="url(#white)" stroke="${INK}" stroke-width="2"/>`;
    G('M118 166l6 4l6-4l6 4l6-4M124 176l5-3l5 3', 1.6, '#fff');
    H(hatch([[184, 166], [232, 146], [290, 124], [332, 132]], 12, 4, 12, 1, { swell: true }) + hatch([[300, 210], [336, 196], [348, 150], [312, 122]], 8, 3, 10, 1, { t0: 0.1 }), 1.8);
    H(hatch([[184, 166], [232, 146], [290, 124], [332, 132]], 6, 3, 8, 1, { tilt: 0.7, t0: 0.3, t1: 0.8 }), 1.6);
    G(offset([[184, 146], [230, 120], [280, 98], [328, 106]], 7, -1, 8, 0.05, 0.9) + offset([[200, 158], [182, 192], [150, 206], [112, 208]], 4, 1, 5, 0.2, 0.9), 2.5, '#d8f8f0');
    G('M140 148C156 140 172 140 184 146', 2, '#ffffff');
    f += I.flush() + `</g>`;
    return seal(b + f, 'teal');
  },

  // Shadow. A crowned colossus with one great eye rises from the dark; its tendrils crack the shields of the foes below.
  'Lord of the Void': () => {
    const { I, H, G } = kit();
    const X = 134, Y = 116;
    let b = back(['white', 'gold', 'amber', 'ruby', 'wine', 'violet', 'deep', 'navy', 'ash', 'steel', 'teal'], X, Y, [0, 30, 70, 150, 440], [10, 10, 12, 8],
      [['white', 'gold'], ['ruby', 'amber'], ['violet', 'deep'], ['deep', 'violet']], 0.15, ground(242, 264, 'steel', 'violet', 2.5));
    G('M250 60C266 56 280 62 298 58M300 120C316 116 330 122 348 118M260 170C276 166 290 172 308 168', 1.5, '#a890e8');
    b += I.flush();
    b += foe('stand', 296, 254, 1.1, -1, 'steel', 'M8 -30C14 -32 18 -30 20 -28', '#ffd0d8') + foe('stand', 352, 250, 1.2, -1, 'steel', 'M8 -30C14 -32 18 -30 20 -28', '#ffd0d8');
    b += `<path d="M274 222l4 4l-3 5l4 5M326 214l4 4l-3 5l4 5" fill="none" stroke="${INK}" stroke-width="2"/>`;
    const t1 = [[214, 178], [250, 160], [290, 180], [280, 220]], t2 = [[218, 196], [270, 196], [330, 160], [334, 206]], t3 = [[212, 214], [240, 236], [258, 230], [270, 240]];
    const body = 'M134 152C102 154 66 164 46 196L38 254H232L222 196C202 164 166 154 134 152Z';
    const head = 'M102 92C98 120 108 144 134 156C162 144 170 120 166 92Z';
    const crown = 'M98 96L94 54L110 78L118 34L130 70L142 28L150 70L164 46L170 96Z';
    const paul = ['M44 196C40 170 64 156 92 162C88 180 70 194 44 196Z', 'M226 194C230 168 206 154 178 160C182 178 200 192 226 194Z'];
    let f = `<g data-figure="1">` + S([body, head, crown, ...paul], 8);
    f += P([[ribbon(t1, 20, 7), 'steel'], [ribbon(t2, 18, 6), 'pearl'], [ribbon(t3, 16, 6), 'steel'],
      [body, 'violet'], ['M134 152C102 154 66 164 46 196L38 254H70L76 200C90 176 110 162 134 158Z', 'ash'], ['M134 158C120 190 118 230 122 254H146C150 230 148 190 134 158Z', 'steel'],
      [paul[0], 'violet'], [paul[1], 'pearl'], [head, 'steel'], ['M102 92C98 120 108 144 134 156C124 140 116 118 116 92Z', 'violet'],
      [crown, 'steel'], ['M98 96L94 54L110 78L118 34L130 70L128 96Z', 'ash'],
      ['M114 116C122 102 146 102 154 116C146 130 122 130 114 116Z', 'white'], [circ(X, Y, 9), 'gold']]);
    f += `<path d="M134 107C130 112 130 120 134 125C138 120 138 112 134 107Z" fill="${INK}"/>`;
    f += `<g fill="url(#ruby)" stroke="${INK}" stroke-width="2.5"><path d="${circ(118, 86, 5)}"/><path d="${circ(142, 82, 5)}"/><path d="${circ(134, 176, 7)}"/></g>`;
    H(hatch([[102, 92], [98, 120], [108, 144], [134, 156]], 6, 3, 9, -1) + hatch([[134, 152], [102, 154], [66, 164], [46, 196]], 8, 4, 14, -1, { swell: true }), 1.8);
    H(hatch([[46, 200], [44, 220], [42, 236], [40, 250]], 6, 4, 14, -1) + hatch([[46, 200], [44, 220], [42, 236], [40, 250]], 4, 4, 10, -1, { tilt: 0.7, t0: 0.4 }), 1.6);
    H('M90 210C100 230 104 244 104 254M176 210C170 230 168 244 168 254M112 106l-8-4M156 106l8-4', 2.5);
    G(offset([[166, 94], [168, 120], [160, 140], [136, 154]], 6, -1, 5) + offset([[134, 152], [166, 154], [202, 164], [222, 196]], 7, 1, 6), 2.5, '#e8dcff');
    G(offset(t1, 0, 1, 6, 0.2, 0.8) + offset(t2, 0, 1, 6, 0.2, 0.8), 1.6, '#c8b8ff');
    f += I.flush() + `</g>`;
    return seal(b + f, 'ruby');
  },
});
