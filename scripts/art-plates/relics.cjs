'use strict';
// Relic plates (GDADA run 3, carved glass): each relic sits on a mount in depth and
// powers a small creature of its element. Built with the shared helpers in art-lib/glass.cjs.
const { Ink, INK, R, defs, burst, hatch, offset, frame } = require('../art-lib/glass.cjs');

const pane = ([d, c, w]) => `<path d="${d}" fill="url(#${c})"${w ? ` stroke-width="${w}"` : ''}/>`;
const panes = (list, w = 3.5) => `<g stroke="${INK}" stroke-width="${w}" stroke-linejoin="round">${list.map(pane).join('')}</g>`;
const under = (ds, w = 9) => `<g fill="${INK}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round">${ds.map((d) => `<path d="${d}"/>`).join('')}</g>`;
const blot = (ds) => `<g fill="${INK}">${ds.map((d) => `<path d="${d}"/>`).join('')}</g>`;
const rings = (x, y, a, b) => `<g fill="none" stroke="${INK}" stroke-linecap="round"><circle cx="${x}" cy="${y}" r="${a}" stroke-width="2.5" stroke-dasharray="16 6 30 8 10 6"/><circle cx="${x}" cy="${y}" r="${b}" stroke-width="2" stroke-dasharray="24 9 12 7 36 10"/></g>`;
// window background: ink ground, carved burst on the key light, two wavy ground bands
function scene(names, [cx, cy, radii, n, cols, rot], grounds) {
  let s = defs(names) + `<rect width="400" height="300" fill="${INK}"/><g stroke="${INK}" stroke-width="3" stroke-linejoin="round">`;
  s += burst(cx, cy, radii, n, (k, i) => cols[k][i % 2], rot);
  return s + grounds.map(([d, c]) => `<path d="${d}" fill="url(#${c})"/>`).join('') + '</g>' + rings(cx, cy, radii[1] + 6, radii[1] + 18);
}
const bz = (p, t) => { const u = 1 - t; return [0, 1].map((j) => u * u * u * p[0][j] + 3 * u * u * t * p[1][j] + 3 * u * t * t * p[2][j] + t * t * t * p[3][j]); };
const P = ([x, y]) => `${R(x)} ${R(y)}`;

module.exports = () => ({
  // Molten core cradled in a bronze tripod brazier; its fire streams into a cinder wolf.
  'Ember Core': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), G = (d, w = 2, c = '#ffe9b0') => I.add(d, w, c);
    let b = scene(['white', 'gold', 'amber', 'orange', 'red', 'ruby', 'wine', 'violet', 'deep', 'navy', 'teal', 'bronze'],
      [124, 138, [0, 40, 80, 150, 420], [8, 10, 10, 7], [['white', 'gold'], ['amber', 'orange'], ['wine', 'violet'], ['navy', 'deep']], 0.2],
      [['M0 300V246C60 238 120 252 190 246C250 240 320 256 400 248V300Z', 'teal'], ['M0 300V268C70 262 140 276 220 268C290 262 350 274 400 270V300Z', 'navy']]);
    G('M30 120C46 116 60 122 76 118M300 60C318 56 334 62 352 58M320 110C336 106 350 112 366 108M200 40C214 36 226 42 240 38', 1.5, '#7f9ae8');
    G('M240 262C270 258 300 264 340 260M20 282C50 278 80 284 120 280', 2, '#8fe0d4');
    b += I.flush();
    const legs = ['M94 196L66 252L58 258H84L106 204Z', 'M154 196L182 252L190 258H164L142 204Z', 'M116 206L112 260H136L132 206Z'];
    const flames = [['M86 162C76 134 94 120 84 94C110 110 112 136 106 160Z', 'red'], ['M162 162C172 140 158 122 172 100C148 114 142 138 144 162Z', 'orange'], ['M112 116C106 100 120 92 116 80C136 92 138 106 134 116Z', 'gold']];
    const stream = 'M146 124C198 96 252 126 284 182L272 194C244 148 200 130 150 146Z';
    const bowl = 'M74 162C76 198 100 214 124 214C148 214 172 198 174 162C168 172 146 178 124 178C102 178 80 172 74 162Z';
    let f = '<g data-figure="1">' + under([...legs, ...flames.map((x) => x[0]), stream, bowl, 'M74 162A50 14 0 0 1 174 162Z', 'M94 138A30 30 0 0 1 154 138Z']);
    f += panes([...legs.map((d) => [d, 'bronze']), ...flames, [stream, 'amber'], ['M74 162A50 13 0 0 1 174 162A50 13 0 0 1 74 162Z', 'wine']]);
    f += `<g stroke="${INK}" stroke-width="3"><circle cx="124" cy="138" r="30" fill="url(#orange)"/><circle cx="119" cy="133" r="20" fill="url(#gold)" stroke-width="2.5"/><circle cx="115" cy="129" r="10" fill="url(#white)" stroke-width="2"/></g>`;
    f += panes([[bowl, 'gold'], ['M84 190C96 204 110 210 124 210C138 210 152 204 164 190C152 198 138 200 124 200C110 200 96 198 84 190Z', 'wine', 3], ['M124 205A9 9 0 1 1 124 223A9 9 0 1 1 124 205Z', 'gold', 3]]);
    H('M98 124L110 134L104 150M134 112L140 126L154 130M116 166L124 154L138 158', 2.5);
    H('M72 236C100 246 148 246 176 236', 3);
    H(hatch([[174, 164], [172, 196], [148, 212], [124, 212]], 7, 4, 10, -1, { t0: .15 }) + hatch([[106, 204], [96, 226], [78, 244], [66, 254]], 5, 3, 7, 1), 1.8);
    H(hatch([[172, 104], [160, 120], [146, 140], [144, 160]], 4, 3, 8, 1) + hatch([[284, 182], [262, 146], [230, 120], [190, 112]], 6, 3, 8, -1, { t0: .2 }), 1.6);
    G('M84 178C100 188 148 188 164 178M150 134C196 116 240 138 266 176M88 152C84 136 92 126 90 112', 2.5);
    G('M144 210L170 252M128 214L126 252', 2);
    f += I.flush() + '</g>';
    // the cinder wolf, a black woodcut silhouette howling into the stream, its mane caught alight
    let k = blot(['M260 126L272 132L284 138L288 116L298 140C306 150 316 162 330 180C344 198 352 220 360 236C368 240 376 236 382 230C380 248 368 258 350 258H292L296 236C292 216 290 196 284 178L276 160L268 146L274 142L262 134Z']);
    k += panes([['M300 146C316 160 332 180 346 206L334 212C324 190 310 170 294 158Z', 'orange'], ['M336 214C344 226 350 238 354 250L344 254C340 240 334 228 326 220Z', 'red']], 3);
    G('M288 186C294 206 298 228 298 250M268 136L282 142M282 160L276 150', 2.5, '#ffc85a');
    k += I.flush() + `<g fill="url(#amber)" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"><path d="M226 104l6-6l5 7l-6 5Z"/><path d="M196 152l5-7l6 5l-5 7Z"/><path d="M256 132l4-5l4 5l-4 4Z"/></g>`;
    return b + f + k + frame('ruby');
  },

  // A faceted heart crystal held in the prongs of a rock spire; its green-blue light shields a stone golem.
  'Crystal Heart': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), G = (d, w = 2, c = '#fff0c0') => I.add(d, w, c);
    let b = scene(['white', 'gold', 'amber', 'wine', 'violet', 'ruby', 'teal', 'sky', 'pearl', 'deep', 'bronze', 'ash'],
      [272, 106, [0, 36, 76, 148, 420], [8, 10, 12, 7], [['white', 'gold'], ['gold', 'amber'], ['wine', 'violet'], ['violet', 'wine']], 0.1],
      [['M0 300V250C50 242 110 256 170 250C240 244 300 258 400 252V300Z', 'bronze'], ['M0 300V270C60 264 130 278 200 272C270 266 330 278 400 274V300Z', 'wine']]);
    G('M40 120C56 116 70 122 86 118M28 160C44 156 58 162 74 158M140 60C156 56 170 62 186 58M330 200C346 196 356 202 370 198', 1.5, '#f0a0b0');
    G('M20 262C50 258 80 264 120 260M200 284C240 280 280 286 330 282', 2, '#ffd890');
    b += I.flush();
    const rock = 'M206 262C222 232 234 200 236 162L244 130L262 142L282 140L300 126L310 160C316 200 334 232 356 262Z';
    const beam = 'M246 118L106 196L118 214L256 136Z';
    const T = [262, 146], C = [268, 106];
    const o = [[236, 120], [228, 94], [240, 74], [258, 72], [268, 86], [284, 70], [302, 72], [314, 90], [306, 114], [288, 132]];
    const heart = 'M' + [T, ...o].map(P).join('L') + 'Z';
    const fac = (pts, c) => ['M' + [C, ...pts].map(P).join('L') + 'Z', c];
    let f = '<g data-figure="1">' + under([rock, beam, heart]);
    f += panes([[beam, 'teal'], [rock, 'bronze'], ['M300 150C306 198 324 234 348 262H322C306 230 294 196 290 156Z', 'ash'],
      ['M218 236C224 222 230 210 234 196L254 206L246 240Z', 'amber', 3]]);
    f += panes([fac([T, o[0]], 'teal'), fac([o[0], o[1]], 'pearl'), fac([o[1], o[2], o[3]], 'white'), fac([o[3], o[4]], 'pearl'), fac([o[4], o[5]], 'sky'),
      fac([o[5], o[6], o[7]], 'pearl'), fac([o[7], o[8]], 'teal'), fac([o[8], o[9], T], 'deep')], 3);
    H('M240 168L258 182L254 214M270 150L276 190L266 230M296 176L284 204', 2.5);
    H(hatch([[310, 160], [316, 200], [334, 232], [356, 262]], 9, 5, 14, 1, { swell: true }) + hatch([[310, 160], [316, 200], [334, 232], [356, 262]], 5, 4, 10, 1, { tilt: .7, t0: .4, swell: true }), 1.8);
    H(hatch([[306, 114], [300, 124], [292, 130], [280, 138]], 4, 3, 7, -1) + hatch([[118, 214], [160, 190], [210, 162], [256, 136]], 9, 4, 4, 1, { tilt: .5 }), 1.6);
    G(offset([[206, 262], [222, 232], [234, 200], [236, 162]], 7, -1, 6) + 'M240 90L248 80M120 200L240 132', 2.5, '#fff6dc');
    f += I.flush() + '</g>';
    // the stone golem, braced behind a shield the crystal's light falls on
    let k = blot(['M78 150H104L108 170L130 176L138 210L124 214L122 234L130 260H104L96 238H86L78 260H52L60 234L58 214L42 210L52 176L74 170Z']);
    k += panes([['M114 188C132 186 146 190 150 198C150 224 142 240 128 250C116 240 108 222 108 198Z', 'teal'], ['M90 158h8v6h-8Z', 'teal', 2]], 3);
    G('M100 160L104 170M110 180L114 206M106 226L112 252M70 184C76 190 86 192 96 188', 2.5, '#ffc85a');
    k += I.flush();
    return b + f + k + frame('teal');
  },

  // A jagged void shard driven point-first into a cracked altar slab; void smoke feeds a leaping hound.
  'Void Shard': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), G = (d, w = 2, c = '#e0d0ff') => I.add(d, w, c);
    let b = scene(['white', 'pearl', 'ruby', 'wine', 'violet', 'navy', 'deep', 'ash', 'steel', 'teal', 'gold', 'bronze'],
      [146, 118, [0, 44, 90, 160, 420], [8, 12, 10, 7], [['ruby', 'wine'], ['ruby', 'wine'], ['violet', 'navy'], ['navy', 'violet']], 0.35],
      [['M0 300V240C60 232 130 246 200 242C270 238 330 252 400 246V300Z', 'ash'], ['M0 300V266C80 258 150 272 230 266C300 262 350 272 400 268V300Z', 'navy']]);
    G('M260 50C276 46 290 52 306 48M300 90C316 86 330 92 346 88M30 150C44 146 56 152 70 148M330 30h6M333 27v6M40 100h6M43 97v6', 1.5, '#8a70d0');
    b += I.flush();
    const shard = 'M128 52L162 84L172 122L190 152L178 196L168 232L150 206L130 170L116 128L112 90Z';
    const slab = 'M54 234L178 218L238 238L112 258Z', front = 'M112 258L238 238V252L112 274Z', side = 'M54 234L112 258V274L54 248Z';
    const smoke = 'M180 138C214 112 258 132 290 164L282 176C254 152 220 142 186 162Z';
    let f = '<g data-figure="1">' + under([slab, front, side, smoke, shard]);
    f += panes([[slab, 'steel'], [front, 'ash'], [side, 'deep'], [smoke, 'ruby']]);
    f += panes([['M128 52L144 136L130 170L116 128L112 90Z', 'pearl'], ['M128 52L162 84L172 122L144 136Z', 'violet'], ['M144 136L172 122L190 152L178 196Z', 'violet'],
      ['M144 136L178 196L168 232L150 206L130 170Z', 'pearl'], ['M150 206L144 136L162 196L168 232Z', 'ruby', 2.5]]);
    H('M168 226L120 246M170 226L196 248M166 228L150 260', 2.5);
    G('M130 246L150 236M182 240L194 248', 2.5, '#ff8aa0');
    H(hatch([[162, 84], [172, 122], [190, 152], [178, 196]], 9, 4, 13, -1, { swell: true }) + hatch([[162, 84], [172, 122], [190, 152], [178, 196]], 5, 4, 9, -1, { swell: true, tilt: .7, t0: .3 }), 1.8);
    H(hatch([[112, 258], [150, 252], [200, 244], [238, 238]], 10, 6, 6, -1, { tilt: .4 }), 1.6);
    G(offset([[128, 52], [118, 70], [112, 90], [116, 128]], 7, 1, 5) + 'M120 140C124 156 130 168 140 182', 2.5, '#ffffff');
    G('M188 148C218 128 252 142 278 164', 2, '#ffd0dc');
    f += I.flush() + '</g>';
    // the void hound, black, leaping out of the smoke
    let k = blot(['M374 152L354 146L346 130L338 146C318 148 300 156 284 168C268 178 252 186 236 184L250 198C264 200 276 196 286 192L276 214L260 232L272 238L294 214L304 200C318 200 330 206 338 216L344 240L356 238L352 210L342 190C350 182 356 174 360 168L378 166L366 160Z']);
    k += panes([['M300 158C316 150 330 146 342 146L346 160C332 162 318 168 306 176Z', 'ruby'], ['M356 152A4 4 0 1 1 356 153Z', 'teal', 2]], 3);
    G('M282 176C268 186 256 190 244 190M296 204L280 226', 2.5, '#ffc85a');
    k += I.flush();
    return b + f + k + frame('violet');
  },

  // A carved sea-stone in a half-open clam on a surf rock; its tide-ribbon wraps a rising serpent.
  'Tidestone': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), G = (d, w = 2, c = '#e6f0ff') => I.add(d, w, c);
    let b = scene(['white', 'pearl', 'sky', 'teal', 'deep', 'navy', 'violet', 'steel', 'bronze', 'gold'],
      [288, 182, [0, 34, 74, 150, 420], [8, 10, 12, 7], [['white', 'pearl'], ['deep', 'teal'], ['deep', 'navy'], ['navy', 'violet']], 0.15],
      [['M0 300V238C30 230 60 246 90 238C120 230 150 248 190 240C230 232 260 250 300 244C340 238 370 250 400 242V300Z', 'teal'], ['M0 300V262C40 254 80 270 130 262C180 254 220 272 270 264C320 256 360 270 400 264V300Z', 'navy']]);
    G('M30 80C46 76 60 82 76 78M120 40C136 36 150 42 166 38M40 140C56 136 70 142 86 138M330 70C346 66 358 72 372 68', 1.5, '#80b8f0');
    G('M20 250C34 244 48 252 62 246M140 252C156 246 170 254 186 248M300 254C316 248 330 256 346 250', 2.5, '#80e8d8');
    b += I.flush();
    const rock = 'M222 264C228 238 254 224 292 222C328 222 352 238 360 264Z';
    const lower = 'M236 212C244 236 266 248 292 248C318 248 338 238 348 214C326 222 310 226 292 226C272 226 254 222 236 212Z';
    const upper = 'M296 192C292 166 304 140 330 132C354 128 370 144 370 170C356 178 340 186 322 192C312 196 304 196 296 192Z';
    const ribbon = 'M262 190C226 156 186 146 140 152L138 166C182 162 220 172 254 204Z';
    let f = '<g data-figure="1">' + under([rock, upper, lower, ribbon, 'M254 196A34 26 0 1 1 322 196A34 26 0 1 1 254 196Z']);
    f += panes([[rock, 'steel'], ['M330 230C342 240 352 250 360 264H332C330 252 326 240 320 232Z', 'deep', 3], [upper, 'pearl'], [ribbon, 'sky']]);
    f += `<g stroke="${INK}" stroke-width="3"><ellipse cx="288" cy="196" rx="34" ry="26" fill="url(#teal)"/><ellipse cx="280" cy="188" rx="18" ry="13" fill="url(#white)" stroke-width="2"/></g>`;
    f += panes([[lower, 'sky']]);
    H('M332 134L318 190M350 136L330 184M364 150L344 180', 2.5);
    H('M256 222L262 244M276 228L278 248M308 228L306 248M328 224L322 244', 2.5);
    f += `<path d="M298 200C306 196 304 186 294 186C282 188 280 202 290 208C304 214 316 202 312 188" fill="none" stroke="${INK}" stroke-width="2.5" stroke-dasharray="10 4"/>`;
    H(hatch([[370, 170], [370, 150], [356, 130], [330, 132]], 5, 4, 10, 1, { swell: true }) + hatch([[348, 214], [338, 238], [318, 248], [292, 248]], 6, 3, 8, 1), 1.8);
    H(hatch([[322, 196], [322, 212], [306, 222], [288, 222]], 6, 3, 9, 1) + hatch([[254, 204], [226, 174], [186, 160], [138, 166]], 7, 3, 7, 1), 1.6);
    G(offset([[296, 192], [292, 166], [304, 140], [330, 132]], 6, 1, 5) + 'M150 158C188 154 222 164 252 188', 2.5, '#ffffff');
    f += I.flush() + '</g>';
    // the tide serpent rising from the surf, held in the stone's ward
    let k = blot(['M38 266C32 230 56 210 76 194C94 180 100 162 94 146C90 130 100 116 116 114L140 116L154 126L138 130L150 140L124 140C126 166 118 190 98 208C82 222 76 242 82 266Z', 'M150 264C150 240 188 240 190 264Z', 'M80 188L58 172L70 198Z', 'M92 156L72 142L86 170Z', 'M104 118L94 94L118 112Z']);
    k += panes([['M100 140C108 132 116 136 120 142C120 166 114 186 102 200C104 180 104 160 100 140Z', 'teal']], 3);
    k += `<ellipse cx="106" cy="170" rx="30" ry="8" fill="none" stroke="${INK}" stroke-width="7"/><ellipse cx="106" cy="170" rx="30" ry="8" fill="none" stroke="#80e8d8" stroke-width="3" stroke-dasharray="16 5"/>`;
    G('M104 130L118 124M116 150C116 168 108 186 96 198', 2.5, '#c8f4ff');
    k += I.flush();
    return b + f + k + frame('sky');
  },

  // A great storm feather wedged quill-down in a crag; its lightning charges a diving falcon.
  'Storm Feather': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), G = (d, w = 2, c = '#ffffff') => I.add(d, w, c);
    let b = scene(['white', 'gold', 'pearl', 'sky', 'teal', 'steel', 'deep', 'navy', 'violet', 'bronze'],
      [232, 92, [0, 30, 66, 140, 420], [8, 10, 12, 7], [['white', 'gold'], ['violet', 'deep'], ['deep', 'navy'], ['navy', 'violet']], 0.25],
      [['M0 300V252C60 244 120 258 200 250C270 244 330 258 400 254V300Z', 'teal'], ['M0 300V272C70 266 150 280 230 272C300 266 350 278 400 276V300Z', 'deep']]);
    G('M300 50C318 46 334 52 352 48M310 220C326 216 340 222 356 218M30 130C46 126 60 132 76 128M60 180C76 176 90 182 106 178', 1.5, '#b8e0ff');
    b += I.flush();
    const A = [[112, 238], [150, 172], [196, 104], [262, 50]];
    const side = (s, w) => { const [x, y] = bz(A, s), e = 0.01, [x2, y2] = bz(A, Math.min(1, s + e)), [x1, y1] = bz(A, Math.max(0, s - e)); const L = Math.hypot(x2 - x1, y2 - y1); return [x + w * (y2 - y1) / L, y - w * (x2 - x1) / L]; };
    const wid = (s, m) => m * Math.sin(Math.PI * Math.min(1, (s - 0.18) / 0.82)) ** 0.6;
    const S0 = 0.2, N = 7;
    let vane = [];
    const outerL = [], outerR = [];
    for (let i = 0; i <= N; i++) { const s = S0 + (1 - S0) * i / N; outerL.push(side(Math.min(1, s + 0.05), -wid(s, 34) - 1)); outerR.push(side(Math.min(1, s + 0.05), wid(s, 24) + 1)); }
    for (let i = 0; i < N; i++) {
      const s0 = S0 + (1 - S0) * i / N, s1 = S0 + (1 - S0) * (i + 1) / N;
      vane.push(['M' + [bz(A, s0), outerL[i], outerL[i + 1], bz(A, s1)].map(P).join('L') + 'Z', i % 2 ? 'teal' : 'pearl']);
      vane.push(['M' + [bz(A, s0), outerR[i], outerR[i + 1], bz(A, s1)].map(P).join('L') + 'Z', i % 2 ? 'pearl' : 'steel']);
    }
    const crag = 'M36 264C40 232 62 214 96 210C124 208 150 222 164 244L170 264Z';
    const bolt = 'M262 66L306 96L294 102L342 130L328 134L356 152L314 142L322 136L282 112L292 106Z';
    const quill = 'M' + [side(0.05, -4), side(0.24, -5), side(0.24, 5), side(0.05, 4)].map(P).join('L') + 'Z';
    let f = '<g data-figure="1">' + under([crag, bolt, quill, ...vane.map((v) => v[0])]);
    f += panes([[crag, 'steel'], ['M118 216C140 222 156 234 164 248L170 264H140C138 246 130 230 118 216Z', 'deep', 3], [bolt, 'white'], ...vane, [quill, 'white', 3]]);
    f += `<path d="M${P(bz(A, .2))}C${P(bz(A, .45))} ${P(bz(A, .75))} ${P(bz(A, 1))}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
    f += panes([['M' + [side(0.25, -8), side(0.31, -9), side(0.31, 9), side(0.25, 8)].map(P).join('L') + 'Z', 'gold']], 2.5);
    let hh = '';
    for (let i = 0; i < N; i++) { const s = S0 + (1 - S0) * (i + 0.5) / N; const [x, y] = bz(A, s), [ox, oy] = side(Math.min(1, s + 0.05), wid(s, 24) * 0.9); hh += `M${R(x)} ${R(y)}L${R(ox)} ${R(oy)}`; }
    H(hh, 1.8);
    H(hatch([[60, 222], [44, 236], [40, 250], [38, 262]], 5, 4, 10, -1), 1.8);
    G(offset([[36, 264], [40, 232], [62, 214], [96, 210]], 7, -1, 6), 2.5, '#fff0c0');
    G('M' + outerL.slice(1, 6).map((q, i) => P(side(S0 + (1 - S0) * (i + 1) / N + 0.03, -wid(S0 + (1 - S0) * (i + 1) / N, 34) + 7))).join('L'), 2.5);
    G('M272 74L300 92M304 108L330 124', 2, '#fffbe6');
    f += I.flush() + '</g>';
    // the wind falcon, diving through the bolt
    let k = blot(['M296 146L326 166L362 122L346 176L366 194L380 210L362 210L346 198L296 220L328 186L294 160Z']);
    k += panes([['M326 166L362 122L346 176L336 176Z', 'sky'], ['M328 186L296 220L338 196Z', 'teal', 2.5]], 3);
    G('M302 154L326 172M346 192L362 204', 2.5, '#ffe9b0');
    I.add('M268 176L290 186M262 196L288 200M274 214L296 210', 2, '#b8e0ff');
    k += I.flush();
    return b + f + k + frame('pearl');
  },

  // A gold sun sigil set in the face of a standing stone; its beam blesses a kneeling knight's sword.
  'Sun Sigil': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), G = (d, w = 2, c = '#fffbe6') => I.add(d, w, c);
    let b = scene(['white', 'ivory', 'gold', 'amber', 'sky', 'pearl', 'deep', 'navy', 'teal', 'steel', 'ruby', 'bronze'],
      [302, 138, [0, 36, 78, 150, 420], [8, 12, 12, 7], [['white', 'ivory'], ['gold', 'ivory'], ['sky', 'deep'], ['deep', 'navy']], 0.05],
      [['M0 300V244C70 236 140 252 210 246C280 240 340 254 400 248V300Z', 'teal'], ['M0 300V266C60 260 140 274 220 268C290 262 350 274 400 270V300Z', 'navy']]);
    G('M40 120C56 116 70 122 86 118M60 60C76 56 90 62 106 58M30 200C46 196 60 202 76 198M150 40C166 36 180 42 196 38', 1.5, '#cfe6ff');
    G('M20 256C50 252 80 258 120 254M190 282C230 278 270 284 320 280', 2, '#8fe0d4');
    b += I.flush();
    const front = 'M258 258L270 104L298 78L334 92L346 258Z', side = 'M334 92L354 108L366 254L346 258Z';
    const beam = 'M280 130L140 92L138 104L280 150Z';
    const cx = 302, cy = 140;
    const rays = [];
    for (let i = 0; i < 12; i++) {
      const a = (i + 0.5) * Math.PI / 6, a0 = i * Math.PI / 6, a1 = (i + 1) * Math.PI / 6;
      const q = (r, t) => [cx + r * 0.72 * Math.cos(t), cy + r * Math.sin(t)];
      rays.push(['M' + [q(24, a0), q(42, a), q(24, a1)].map(P).join('L') + 'Z', i % 2 ? 'amber' : 'gold']);
    }
    let f = '<g data-figure="1">' + under([front, side, beam, ...rays.map((r) => r[0])]);
    f += panes([[beam, 'white'], [front, 'ivory'], [side, 'sky'], ['M262 210L338 200L340 214L264 226Z', 'gold', 3], ['M260 236L344 226L346 258H258Z', 'deep', 3], ...rays], 3);
    f += `<g stroke="${INK}"><ellipse cx="${cx}" cy="${cy}" rx="19" ry="26" fill="url(#gold)" stroke-width="3"/><ellipse cx="${cx - 3}" cy="${cy - 4}" rx="10" ry="14" fill="url(#white)" stroke-width="2"/></g>`;
    H(hatch([[334, 92], [340, 140], [344, 200], [346, 256]], 9, 4, 12, 1, { swell: true }) + hatch([[354, 108], [360, 160], [364, 210], [366, 254]], 7, 3, 8, 1, { inset: -6, tilt: 0.6 }), 1.8);
    H(hatch([[280, 150], [240, 138], [190, 118], [138, 104]], 7, 3, 6, -1), 1.6);
    G(offset([[270, 104], [266, 150], [262, 200], [258, 258]], 8, -1, 6) + 'M140 98L276 136', 2.5);
    f += I.flush() + '</g>';
    // the kneeling knight, sword raised into the beam
    let k = blot(['M90 162C90 150 110 148 112 160L110 176L124 182L134 152L142 154L132 196L118 200L120 222L140 232L142 258H112L106 238L96 258H72L78 222L82 186Z', 'M84 186C70 200 60 224 58 254L80 248Z']);
    k += panes([['M132 156L148 96L156 98L140 158Z', 'steel'], ['M126 156H148V162H126Z', 'gold']], 2.5);
    G('M112 164L114 176M122 186L130 160M130 200L122 220', 2.5, '#ffd870');
    k += I.flush();
    return b + f + k + frame('gold');
  },

  // A war banner planted in a stone cairn, streaming over a column of armed creatures it rallies.
  'War Banner': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), G = (d, w = 2, c = '#ffe9b0') => I.add(d, w, c);
    let b = scene(['white', 'gold', 'amber', 'ruby', 'wine', 'deep', 'navy', 'violet', 'teal', 'bronze', 'steel'],
      [262, 100, [0, 34, 72, 146, 420], [8, 10, 12, 7], [['white', 'gold'], ['gold', 'amber'], ['deep', 'violet'], ['navy', 'deep']], 0.3],
      [['M0 300V248C60 240 130 256 200 248C260 242 330 256 400 250V300Z', 'teal'], ['M0 300V270C60 264 130 278 210 270C290 262 340 276 400 272V300Z', 'bronze']]);
    G('M30 130C46 126 60 132 76 128M40 190C56 186 70 192 86 188M330 40C346 36 358 42 372 38M140 60C156 56 170 62 186 58', 1.5, '#a0b4f0');
    b += I.flush();
    const pole = 'M108 248L204 72L212 76L118 252Z', tip = 'M200 76L214 42L216 82Z';
    const cairn = ['M70 262C70 240 92 232 112 236C130 238 144 250 146 262Z', 'M92 238C92 224 108 218 120 224C130 230 128 240 120 246Z'];
    const top = [[200, 84], [244, 64], [290, 104], [360, 78]], bot = [[168, 142], [214, 116], [270, 166], [338, 150]];
    const N = 5, cloth = [];
    for (let i = 0; i < N; i++) {
      const s0 = i / N, s1 = (i + 1) / N;
      let d = 'M' + [bz(top, s0), bz(top, s1), bz(bot, s1), bz(bot, s0)].map(P).join('L') + 'Z';
      if (i === N - 1) d = 'M' + [bz(top, s0), bz(top, s1), [334, 118], bz(bot, s1), bz(bot, s0)].map(P).join('L') + 'Z';
      cloth.push([d, i % 2 ? 'wine' : 'ruby']);
    }
    const chev = 'M232 106L262 124L292 112L292 128L262 142L232 122Z';
    let f = '<g data-figure="1">' + under([...cairn, pole, tip, ...cloth.map((c) => c[0])]);
    f += panes([[pole, 'bronze', 3], ...cloth, [chev, 'gold', 3], [tip, 'gold', 3], [cairn[0], 'steel'], [cairn[1], 'bronze', 3]]);
    H(hatch(bot, 12, 4, 12, 1, { swell: true }) + hatch(bot, 6, 4, 8, 1, { swell: true, tilt: .7, t0: .25, t1: .8 }), 1.8);
    H(hatch([[146, 262], [140, 250], [128, 240], [112, 236]], 5, 3, 8, 1), 1.6);
    G(offset(top, 7, -1, 10, .06, .9), 2.5, '#ffc0c8');
    G('M206 80L120 242M80 252C84 244 94 240 104 240', 2);
    f += I.flush() + '</g>';
    // three small fighters under the banner, blades raised
    const man = (x, y, s, z = 1.3) => { const q = (dx, dy) => `${R(x + dx * z)} ${R(y + dy * z)}`; return `M${q(-6, 0)}L${q(-4, -18)}L${q(-8, -34)}C${q(-8, -40)} ${q(8, -40)} ${q(8, -34)}L${q(4, -18)}L${q(6, 0)}H${R(x + z)}L${q(0, -12)}L${q(-1, 0)}Z` +
      `M${q(-6, -42)}a${R(6 * z)} ${R(6 * z)} 0 1 0 ${R(12 * z)} 0a${R(6 * z)} ${R(6 * z)} 0 1 0 ${-R(12 * z)} 0M${q(6, -32)}L${q(16 * s, -56)}L${q(19 * s, -54)}L${q(8, -26)}Z`; };
    let k = blot([man(250, 260, 1), man(302, 254, 1), man(352, 260, -1)]);
    k += panes([['M234 216C224 218 222 236 230 246L246 232Z', 'steel'], ['M286 210C276 212 274 230 282 240L298 226Z', 'teal'], ['M368 216C378 218 380 236 372 246L356 232Z', 'bronze']], 2.5);
    G('M244 214L246 232M296 208L298 226M346 214L348 232', 2.5, '#ffd870');
    k += I.flush();
    return b + f + k + frame('amber');
  },
});
