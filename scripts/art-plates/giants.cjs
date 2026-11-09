'use strict';
// Carved-glass plates (GDADA run 3): the giants and constructs.
// Each card has its own body plan so the nine never read as one shape at board size.
const { Ink, INK, R, defs, burst, hatch, offset, frame } = require('../art-lib/glass.cjs');

// shared scene: sunburst panes, two wavy ground bands, carved rings and streak gouges
function scene(I, o) {
  const { sx, sy, radii, n, cols, rot = 0.2, g = ['teal', 'navy'], gy = [244, 268], rings = [44, 58], streak = '#7f9ae8', streaks = '' } = o;
  let b = `<rect width="400" height="300" fill="${INK}"/><g stroke="${INK}" stroke-width="3" stroke-linejoin="round">`;
  b += burst(sx, sy, radii, n, (k, i) => cols[k][i % 2], rot);
  b += `<path d="${wave(gy[0], 8, o.ph || 0)}" fill="url(#${g[0]})"/><path d="${wave(gy[1], 6, (o.ph || 0) + 2)}" fill="url(#${g[1]})"/></g>`;
  b += `<g fill="none" stroke="${INK}" stroke-linecap="round"><circle cx="${sx}" cy="${sy}" r="${rings[0]}" stroke-width="2.5" stroke-dasharray="16 6 30 8 10 6"/><circle cx="${sx}" cy="${sy}" r="${rings[1]}" stroke-width="2" stroke-dasharray="24 9 12 7 36 10"/></g>`;
  if (streaks) I.add(streaks, 1.5, streak);
  return b + I.flush();
}
function wave(y, a, ph) {
  let d = `M0 300V${y}`;
  for (let x = 0; x < 400; x += 80) d += `Q${x + 40} ${R(y + a * Math.sin(ph + x / 37))} ${x + 80} ${R(y + a * 0.4 * Math.cos(ph + x / 53))}`;
  return d + 'V300Z';
}
// silhouette under-pass for a list of path data
const sil = (ds, w = 9) => `<g fill="${INK}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round">${ds.map((d) => `<path d="${d}"/>`).join('')}</g>`;
// panes: [[d, fill]] with leading
const panes = (ps, w = 3.5) => `<g stroke="${INK}" stroke-width="${w}" stroke-linejoin="round">${ps.map(([d, c]) => `<path d="${d}" fill="url(#${c})"/>`).join('')}</g>`;
// small black woodcut foe with one coloured pane
const foe = (x, y, s, c, lean = 0) => `<g transform="translate(${x} ${y}) rotate(${lean}) scale(${s})"><g fill="${INK}"><circle cx="0" cy="-30" r="5"/><path d="M-6 -24H6L8 -6L4 0L6 14H1L0 2L-2 14H-7L-5 0L-8 -6Z"/></g><path d="M5 -22L16 -18L14 -6L6 -8Z" fill="url(#${c})" stroke="${INK}" stroke-width="2"/></g>`;

module.exports = () => ({
  // Guard that thickens every dawn: a stone sentinel braced behind a tower shield as the low sun adds new courses of stone.
  'Stone Guardian': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), G = (d, w = 2, c = '#ffe9b0') => I.add(d, w, c);
    let b = defs(['white', 'gold', 'amber', 'wine', 'violet', 'navy', 'deep', 'bronze', 'ash', 'teal', 'ivory']);
    b += scene(I, { sx: 300, sy: 226, radii: [0, 36, 80, 150, 420], n: [10, 10, 12, 8], cols: [['white', 'gold'], ['gold', 'amber'], ['wine', 'amber'], ['ash', 'violet']], g: ['bronze', 'wine'], gy: [246, 270], streaks: 'M40 70C60 66 78 72 98 68M30 120C50 116 66 122 84 118M220 60C240 56 256 62 276 58M40 190C56 186 66 190 78 188' });
    const spear = 'M74 254L74 76L66 76L80 34L94 76L86 76L86 254Z';
    const head = 'M106 62L154 58L160 114L104 116Z';
    const torso = 'M92 118C110 108 160 106 176 120L184 236L86 238Z';
    const lp = 'M82 142C70 118 92 100 116 112L112 146Z', rp = 'M182 140C192 116 170 100 148 110L152 144Z';
    const shield = 'M122 126L210 118L216 228L170 258L122 236Z';
    const plinth = 'M60 266L60 244L214 240L222 266Z';
    let f = `<g data-figure="1">` + sil([spear, head, torso, lp, rp, shield, plinth]);
    f += panes([[spear, 'ivory'], [plinth, 'ash'], [torso, 'bronze'], ['M92 118C100 114 108 112 116 111L112 238L86 238Z', 'wine'], [lp, 'bronze'], [rp, 'bronze'], [head, 'bronze'], ['M106 62L122 61L120 115L104 116Z', 'wine']]);
    // shield: courses of stone, the newest (top) course gilded by the dawn
    f += panes([[shield, 'bronze'], ['M122 126L210 118L211 146L122 152Z', 'gold'], ['M122 176L212 170L213 198L122 202Z', 'ash'], ['M122 202L213 198L216 228L170 258L122 236Z', 'bronze']], 3);
    f += `<g fill="none" stroke="${INK}" stroke-width="3"><path d="M166 150L166 174M150 176L150 200M184 198L184 226M160 226L160 250"/><path d="M114 90H156" stroke-width="6"/><path d="M132 96V110" stroke-width="3"/></g>`;
    f += `<g fill="url(#gold)" stroke="${INK}" stroke-width="2.5"><path d="M200 106l10-6l6 8l-8 6Z"/><path d="M222 128l8-4l4 8l-8 4Z"/><path d="M186 92l7-4l5 6l-7 5Z"/></g>`;
    H(hatch([[116, 112], [112, 150], [108, 200], [100, 236]], 9, 4, 10, -1, { tilt: 0.2 }), 1.8);
    H(hatch([[176, 120], [80, 140], [96, 180], [86, 238]], 6, 4, 9, 1, { t0: .4 }));
    H(hatch([[126, 152], [126, 180], [126, 210], [126, 232]], 7, 5, 14, -1, { swell: true }) + hatch([[126, 160], [126, 184], [126, 204], [126, 226]], 4, 4, 9, -1, { tilt: 0.7 }), 1.8);
    H(hatch([[60, 246], [100, 245], [160, 243], [214, 242]], 12, 4, 4, -1, { inset: 6, tilt: 0.4 }), 1.6);
    G(offset([[206, 120], [208, 160], [210, 200], [212, 226]], 8, -1, 6), 2.5);
    G('M134 136L198 130M140 160L200 156', 2, '#fff6c8');
    G(offset([[150, 66], [153, 80], [155, 96], [156, 112]], 6, -1, 4), 2);
    G('M92 62L84 40', 2, '#fff');
    f += I.flush() + `<path d="M124 90H150" fill="none" stroke="url(#gold)" stroke-width="3"/></g>`;
    return b + f + frame('teal');
  },

  // Iron construct, crouched on its fists, raising a carved barrier dome as it lands.
  'Iron Golem': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), G = (d, w = 2, c = '#ffe9b0') => I.add(d, w, c);
    let b = defs(['white', 'gold', 'amber', 'wine', 'violet', 'navy', 'bronze', 'ash', 'steel', 'ivory', 'teal']);
    b += scene(I, { sx: 96, sy: 104, radii: [0, 32, 72, 140, 420], n: [8, 10, 10, 7], cols: [['white', 'gold'], ['gold', 'amber'], ['wine', 'amber'], ['ash', 'violet']], g: ['bronze', 'wine'], gy: [250, 272], ph: 1, streaks: 'M30 190C50 186 66 192 86 188M120 210C140 206 156 212 176 208M190 40C210 36 226 42 246 38' });
    // barrier: an arc of gold panes cast over the golem
    let arc = '';
    for (let i = 0; i < 14; i++) {
      const a0 = Math.PI * (1.02 + i * 0.07), a1 = a0 + Math.PI * 0.07, r0 = 164, r1 = 178, cx = 272, cy = 262;
      const p = (r, a) => `${R(cx + r * Math.cos(a))} ${R(cy + r * Math.sin(a))}`;
      arc += `<path d="M${p(r1, a0)}A${r1} ${r1} 0 0 1 ${p(r1, a1)}L${p(r0, a1)}A${r0} ${r0} 0 0 0 ${p(r0, a0)}Z" fill="url(#${i % 2 ? 'gold' : 'ivory'})"/>`;
    }
    b += `<g stroke="${INK}" stroke-width="3">${arc}</g>`;
    const torso = 'M212 118C214 92 248 80 284 82C324 86 346 110 342 150C338 184 314 202 278 204C242 204 214 180 212 150Z';
    const head = 'M258 64L294 64L298 98L254 98Z';
    const la = 'M222 108C196 116 184 146 186 180L214 182C212 158 220 140 236 128Z', lf = 'M182 176L220 176L228 232L176 236Z', lfist = 'M168 228L232 226L236 262L164 262Z';
    const ra = 'M330 108C356 114 368 144 366 174L340 178C340 154 334 138 320 130Z', rf = 'M338 170L370 170L372 228L334 232Z', rfist = 'M326 224L378 224L378 262L322 262Z';
    const legs = ['M240 194L272 196L270 252L234 252Z', 'M284 196L316 194L322 252L288 252Z'];
    let f = `<g data-figure="1">` + sil([torso, head, la, lf, lfist, ra, rf, rfist, ...legs]);
    f += panes([[legs[0], 'ash'], [legs[1], 'ash'], [torso, 'bronze'], ['M342 150C338 184 314 202 278 204L282 186C310 184 326 168 328 140C330 122 326 110 318 100C336 112 344 128 342 150Z', 'wine'], ['M236 120L320 116L318 146L238 150Z', 'steel'], [la, 'bronze'], [lf, 'steel'], [lfist, 'bronze'], [ra, 'ash'], [rf, 'ash'], [rfist, 'ash'], [head, 'steel']]);
    f += `<g fill="none" stroke="${INK}" stroke-width="3"><path d="M278 150V202M244 176L312 174M176 244H234M324 242H378"/></g>`;
    f += `<g fill="url(#gold)" stroke="${INK}" stroke-width="2"><path d="M262 78H290V86H262Z"/><circle cx="250" cy="134" r="4"/><circle cx="306" cy="132" r="4"/><circle cx="260" cy="190" r="4"/><circle cx="198" cy="244" r="4"/><circle cx="350" cy="242" r="4"/></g>`;
    H(hatch([[318, 100], [340, 116], [346, 140], [340, 170]], 7, 5, 12, -1, { swell: true }), 2);
    H(hatch([[366, 174], [368, 150], [360, 128], [330, 108]], 6, 4, 10, -1, { swell: true }) + hatch([[372, 230], [372, 210], [371, 190], [370, 172]], 5, 4, 12, -1), 1.8);
    H(hatch([[378, 262], [378, 250], [378, 236], [378, 226]], 4, 4, 14, -1), 1.8);
    H(hatch([[322, 252], [320, 230], [318, 210], [316, 196]], 5, 4, 10, -1), 1.8);
    G(offset([[212, 150], [212, 110], [244, 84], [284, 82]], 7, -1, 6), 2.5);
    G(offset([[186, 180], [186, 150], [198, 120], [222, 108]], 6, -1, 4), 2);
    G('M172 236L174 256M186 182L190 228M262 70L262 92', 2);
    f += I.flush() + `</g>`;
    return b + f + frame('teal');
  },

  // Tall faceted crystal knight; its lower facets shatter and the shards fly to arm a waiting ally.
  'Crystal Sentinel': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), G = (d, w = 2, c = '#fff6c8') => I.add(d, w, c);
    let b = defs(['white', 'gold', 'amber', 'wine', 'violet', 'navy', 'bronze', 'ivory', 'teal', 'ash']);
    b += scene(I, { sx: 118, sy: 150, radii: [0, 40, 90, 160, 420], n: [12, 12, 12, 8], cols: [['white', 'gold'], ['amber', 'gold'], ['wine', 'violet'], ['navy', 'violet']], g: ['bronze', 'wine'], gy: [248, 270], ph: 3, rot: 0.1, streaks: 'M250 40C270 36 286 42 306 38M40 50C60 46 76 52 96 48M330 140C346 136 356 140 370 138' });
    b += `<g fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="10 6 20 8"><circle cx="262" cy="130" r="92"/></g>`;
    const crown = 'M248 70L256 40L266 60L276 34L284 62L292 46L292 78L284 98L254 98Z';
    const torso = 'M232 102L292 102L306 150L284 198L244 198L222 150Z';
    const ls = 'M234 106L192 80L212 132Z', rs = 'M290 106L330 86L312 134Z';
    const legs = ['M244 198L262 198L258 262L232 262Z', 'M268 198L284 198L298 262L272 262Z'];
    const pole = 'M326 262L334 78L342 78L336 262Z', blade = 'M338 82L320 64L340 22L356 60Z';
    const arm = 'M300 120L338 136L334 150L296 140Z';
    let f = `<g data-figure="1">` + sil([crown, torso, ls, rs, ...legs, pole, blade, arm]);
    f += panes([[pole, 'bronze'], [legs[0], 'gold'], [legs[1], 'wine'], [torso, 'gold'], ['M262 102L292 102L306 150L262 150Z', 'amber'], ['M262 150L306 150L284 198L262 198Z', 'wine'], ['M222 150L262 150L262 198L244 198Z', 'ivory'], ['M232 102L262 102L262 150L222 150Z', 'white'], [ls, 'ivory'], [rs, 'amber'], [crown, 'gold'], ['M262 60L276 34L284 62L292 78L284 98L266 98Z', 'amber'], [arm, 'amber'], [blade, 'ivory'], ['M338 82L340 22L356 60Z', 'gold']]);
    f += `<path d="M258 80L280 80L278 88L260 88Z" fill="${INK}"/><path d="M262 82h14" stroke="url(#white)" stroke-width="3"/>`;
    // shards breaking from the hip toward the ally
    f += `<g stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"><path d="M214 196l-14-4l6-12Z" fill="url(#ivory)"/><path d="M192 214l-16 2l4-14Z" fill="url(#gold)"/><path d="M168 226l-14-2l8-10Z" fill="url(#amber)"/><path d="M146 216l-10 6l0-12Z" fill="url(#ivory)"/></g>`;
    H(hatch([[292, 102], [300, 120], [306, 140], [306, 150]], 4, 5, 10, -1) + hatch([[306, 150], [298, 166], [290, 184], [284, 198]], 5, 5, 12, -1), 1.8);
    H(hatch([[298, 262], [290, 240], [286, 220], [284, 198]], 5, 3, 8, 1), 1.8);
    H(hatch([[330, 86], [324, 102], [318, 118], [312, 134]], 4, 3, 8, 1), 1.6);
    G('M236 112L256 112M228 146L240 120M230 158L246 190', 2.5);
    G('M198 88L210 120M252 76L256 50', 2);
    f += I.flush() + `</g>`;
    // the ally receiving the crystal ward
    let k = foe(104, 258, 1.5, 'gold') + `<path d="M116 210L136 202L142 232L128 248L114 234Z" fill="url(#ivory)" stroke="${INK}" stroke-width="3"/>`;
    G('M122 214L132 210M120 224L124 236', 2, '#fff');
    k += I.flush();
    return b + f + k + frame('teal');
  },

  // A walking mountain: a horned beast with snowy peaks on its back, leading a line of shielded allies.
  'Mountain Behemoth': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), G = (d, w = 2, c = '#ffe9b0') => I.add(d, w, c);
    let b = defs(['white', 'gold', 'amber', 'wine', 'violet', 'navy', 'bronze', 'ash', 'ivory', 'teal']);
    b += scene(I, { sx: 322, sy: 88, radii: [0, 30, 70, 140, 420], n: [8, 10, 10, 7], cols: [['white', 'gold'], ['gold', 'amber'], ['wine', 'amber'], ['violet', 'deep']], g: ['bronze', 'wine'], gy: [252, 272], ph: 5, streaks: 'M30 70C50 66 66 72 86 68M120 40C140 36 156 42 176 38M40 140C56 136 66 140 80 138' });
    const body = 'M96 206C84 160 120 132 180 128C238 124 286 136 304 166C314 196 302 222 274 228L118 228C104 224 98 216 96 206Z';
    const peaks = 'M112 148L140 96L160 128L190 80L218 126L240 104L268 144Z';
    const headP = 'M292 156C312 142 340 146 354 166C364 184 358 206 340 212L306 210C294 198 288 178 292 156Z';
    const horn = 'M330 150C344 124 366 116 378 124C362 128 352 140 346 160Z';
    const tusk = 'M340 204C352 214 366 214 374 204C364 222 346 226 334 212Z';
    const legs = ['M112 218L144 218L146 264L108 264Z', 'M154 222L180 222L180 258L152 258Z', 'M236 220L268 220L272 264L232 264Z', 'M270 214L296 210L300 258L272 260Z'];
    let f = `<g data-figure="1">` + sil([body, peaks, headP, horn, tusk, ...legs]);
    f += panes([[legs[1], 'wine'], [legs[3], 'wine'], [legs[0], 'bronze'], [legs[2], 'bronze'], [body, 'bronze'], ['M98 210C108 220 150 222 200 222C240 222 272 222 290 210L274 228L118 228Z', 'wine'], [peaks, 'ash'], ['M140 96L152 116L130 120Z', 'ivory'], ['M190 80L206 106L178 104Z', 'ivory'], ['M240 104L250 118L232 116Z', 'ivory'], ['M160 128L190 80L218 126L190 138Z', 'ash'], [headP, 'amber'], ['M292 156C296 186 310 204 340 212L306 210C294 198 288 178 292 156Z', 'wine'], [horn, 'ivory'], [tusk, 'ivory']]);
    f += `<g fill="none" stroke="${INK}" stroke-width="3"><path d="M150 150C170 176 210 184 252 170M126 186C160 198 220 202 280 194"/></g><path d="M320 166L334 162L330 172Z" fill="url(#white)" stroke="${INK}" stroke-width="2"/>`;
    H(hatch([[118, 228], [160, 230], [230, 230], [274, 228]], 14, 4, 12, 1, { swell: true }) + hatch([[96, 206], [92, 180], [104, 160], [120, 148]], 5, 4, 10, -1), 2);
    H(hatch([[140, 96], [132, 112], [122, 130], [112, 148]], 4, 3, 9, 1) + hatch([[190, 80], [182, 96], [170, 112], [160, 128]], 4, 3, 9, 1), 1.6);
    H(hatch([[146, 264], [146, 250], [145, 234], [144, 218]], 4, 4, 10, -1) + hatch([[272, 264], [271, 248], [269, 232], [268, 220]], 4, 4, 10, -1), 1.6);
    G(offset([[180, 128], [238, 124], [286, 136], [304, 166]], 8, 1, 6), 2.5);
    G(offset([[292, 156], [312, 142], [340, 146], [354, 166]], 6, 1, 5), 2);
    G('M200 92L210 110M250 110L258 124', 2, '#fff');
    f += I.flush() + `</g>`;
    // allies hardened by its presence: small shielded silhouettes
    let k = '';
    for (const [x, s] of [[34, 1.2], [62, 1.3]]) k += `<g transform="translate(${x} 262) scale(${s})"><g fill="${INK}"><circle cx="0" cy="-34" r="5"/><path d="M-6 -28H6L7 -8L5 0H-5L-7 -8Z"/><path d="M-6 0V14H-1V2H1V14H6V0Z"/></g><path d="M4 -26L18 -24L18 -6L10 2L4 -6Z" fill="url(#gold)" stroke="${INK}" stroke-width="2"/></g>`;
    return b + f + k + frame('teal');
  },

  // The titan's fist splits the earth; lava runs in the cracks and small creatures are flung away.
  'Worldbreaker Titan': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), G = (d, w = 2, c = '#ffe9b0') => I.add(d, w, c);
    let b = defs(['white', 'gold', 'amber', 'orange', 'red', 'wine', 'violet', 'navy', 'bronze', 'ash']);
    b += scene(I, { sx: 268, sy: 244, radii: [0, 40, 96, 170, 440], n: [10, 12, 12, 8], cols: [['white', 'gold'], ['amber', 'orange'], ['violet', 'red'], ['amber', 'violet']], g: ['bronze', 'wine'], gy: [250, 272], rings: [56, 70], ph: 2, streaks: 'M220 40C240 36 256 42 276 38M40 40C56 36 70 40 84 38M300 110C316 106 330 112 346 108' });
    // cracks: lava panes radiating from the impact across the ground
    b += `<g stroke="${INK}" stroke-width="3" stroke-linejoin="round"><path d="M268 254L330 262L392 256L392 266L328 272Z" fill="url(#orange)"/><path d="M262 258L200 274L120 268L118 278L204 284Z" fill="url(#gold)"/><path d="M276 262L310 300L290 300Z" fill="url(#amber)"/></g>`;
    const torso = 'M48 164C38 112 70 70 122 62C174 56 210 86 216 126C220 166 194 198 150 204C100 210 56 198 48 164Z';
    const head = 'M150 70C148 48 168 36 190 42C208 48 212 70 202 86C190 98 164 96 152 86Z';
    const horns = 'M176 44L170 18L188 40Z';
    const ua = 'M182 100C214 104 240 134 248 172L214 184C206 152 192 132 168 124Z';
    const fa = 'M214 174L248 162L274 226L238 236Z';
    const fist = 'M228 222L280 212L290 254L232 262Z';
    const back = 'M64 140C40 164 30 206 34 248L62 248C60 212 72 184 92 168Z', bfist = 'M24 238L72 238L74 266L22 266Z';
    const leg = 'M96 196L156 200L160 262L94 262Z';
    let f = `<g data-figure="1">` + sil([torso, head, horns, ua, fa, fist, back, bfist, leg]);
    f += panes([[back, 'bronze'], [bfist, 'amber'], [leg, 'ash'], [torso, 'bronze'], ['M48 164C38 112 70 70 122 62C96 76 76 104 76 140C76 170 92 190 120 204C82 204 54 192 48 164Z', 'wine'], [ua, 'bronze'], [fa, 'amber'], [fist, 'gold'], [head, 'bronze'], ['M150 70C148 48 168 36 190 42C176 48 168 62 170 92C162 92 156 90 152 86Z', 'wine'], [horns, 'gold']]);
    f += `<g fill="none" stroke="${INK}" stroke-width="3"><path d="M110 92C130 110 140 140 136 176M166 112C176 130 180 150 176 176M236 236L256 214M254 230L276 222"/></g><path d="M184 66L198 64L194 72Z" fill="url(#white)" stroke="${INK}" stroke-width="2"/>`;
    H(hatch([[120, 204], [90, 196], [72, 170], [76, 140]], 8, 6, 14, -1, { swell: true }) + hatch([[76, 140], [76, 104], [96, 76], [122, 62]], 6, 4, 12, 1, { t1: .6 }), 2);
    H(hatch([[62, 248], [60, 216], [70, 188], [92, 168]], 6, 4, 10, 1), 1.8);
    H(hatch([[168, 124], [190, 132], [206, 152], [214, 184]], 6, 4, 10, 1, { tilt: -0.3 }), 1.8);
    G(offset([[216, 126], [220, 166], [194, 198], [150, 204]], 8, 1, 6), 2.5);
    G(offset([[248, 172], [240, 134], [214, 104], [182, 100]], 6, -1, 5), 2.5);
    G('M262 222L280 236M244 256L282 250', 2.5, '#fff6c8');
    G('M96 84L110 104L100 126L116 150M150 150L170 168L162 190M186 108L196 124', 2.5, '#ff9a40');
    f += I.flush() + `</g>`;
    // flung creatures and debris
    let k = foe(330, 176, 1.1, 'orange', 50) + foe(364, 214, 0.95, 'amber', -40) + foe(310, 130, 0.8, 'gold', 120);
    k += `<g fill="url(#bronze)" stroke="${INK}" stroke-width="2.5"><path d="M296 200l8-8l8 8l-8 6Z"/><path d="M232 196l6-8l8 6l-6 8Z"/><path d="M350 150l7-5l5 7l-7 4Z"/></g>`;
    return b + f + k + frame('teal');
  },

  // Neutral war-construct mid-stride, greatsword raised corner to corner; the blade burns ruby with the strength it hands on.
  'Battle Colossus': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), G = (d, w = 2, c = '#fff4c8') => I.add(d, w, c);
    let b = defs(['white', 'gold', 'amber', 'ruby', 'violet', 'deep', 'navy', 'steel', 'bronze', 'teal']);
    b += scene(I, { sx: 268, sy: 128, radii: [0, 38, 86, 196, 420], n: [10, 10, 12, 8], cols: [['white', 'gold'], ['gold', 'amber'], ['sky', 'deep'], ['deep', 'violet']], g: ['teal', 'bronze'], gy: [248, 270], ph: 4, rot: 0.4, streaks: 'M30 80C50 76 66 82 86 78M40 150C56 146 66 150 80 148M300 210C320 206 336 212 356 208' });
    const blade = 'M204 90L296 34L306 48L214 104Z', guard = 'M188 82L214 70L232 104L208 114Z';
    const head = 'M118 58L150 56L154 92L116 94Z', crest = 'M114 60L132 30L150 58Z';
    const torso = 'M88 102L174 96L166 178L104 182Z';
    const lp = 'M74 120C66 94 90 84 112 98L104 128Z', rp = 'M186 116C192 92 168 82 150 96L160 124Z';
    const arms = 'M172 100L204 80L214 98L180 124Z', arm2 = 'M96 110C120 90 160 78 202 86L198 102C164 98 132 108 110 126Z';
    const legs = ['M104 176L134 180L112 262L76 262Z', 'M140 176L168 172L204 256L172 262Z'];
    let f = `<g data-figure="1">` + sil([blade, guard, head, crest, torso, lp, rp, arms, arm2, ...legs]);
    f += panes([[legs[1], 'navy'], [legs[0], 'steel'], [torso, 'steel'], ['M136 99L174 96L166 178L134 180Z', 'navy'], [arm2, 'bronze'], [lp, 'gold'], [rp, 'bronze'], [arms, 'steel'], [head, 'steel'], [crest, 'ruby'], [blade, 'ruby'], ['M204 90L296 34L300 40L208 97Z', 'gold'], [guard, 'gold']]);
    f += `<g fill="none" stroke="${INK}" stroke-width="3"><path d="M96 140L170 136M120 200L104 236M150 194L180 232"/><path d="M122 74H148" stroke-width="5"/></g><circle cx="134" cy="118" r="8" fill="url(#ruby)" stroke="${INK}" stroke-width="2.5"/>`;
    H(hatch([[136, 99], [138, 130], [136, 160], [134, 180]], 7, 5, 12, 1, { swell: true }) + hatch([[136, 110], [138, 136], [136, 156], [134, 172]], 4, 4, 9, 1, { tilt: 0.7 }), 1.8);
    H(hatch([[168, 172], [180, 200], [192, 230], [204, 256]], 6, 4, 10, -1), 1.8);
    H(hatch([[134, 180], [126, 210], [118, 236], [112, 262]], 5, 3, 8, -1), 1.6);
    G(offset([[88, 102], [92, 130], [100, 160], [104, 182]], 8, -1, 5), 2.5);
    G('M226 86L288 48', 2.5, '#fff');
    G('M80 254L104 186', 2);
    f += I.flush() + `</g>`;
    let k = foe(340, 258, 1.2, 'ruby', -10);
    return b + f + k + frame('gold');
  },

  // Seated elder giant reading a stone tablet; the cards it draws rise from the runes.
  'Ancient Titan': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), G = (d, w = 2, c = '#fff4c8') => I.add(d, w, c);
    let b = defs(['white', 'gold', 'amber', 'ruby', 'violet', 'deep', 'navy', 'steel', 'bronze', 'teal', 'ivory', 'skin']);
    b += scene(I, { sx: 300, sy: 70, radii: [0, 30, 66, 130, 420], n: [8, 10, 10, 7], cols: [['white', 'gold'], ['gold', 'amber'], ['sky', 'violet'], ['deep', 'violet']], g: ['bronze', 'navy'], gy: [252, 272], ph: 6, rot: 0.5, streaks: 'M250 160C270 156 286 162 306 158M300 200C320 196 336 202 356 198M30 60C46 56 56 60 70 58' });
    const robe = 'M48 264C42 200 54 132 92 106C114 94 150 96 166 116C180 140 186 168 232 178C256 184 262 212 254 238L246 264Z';
    const head = 'M106 62C108 40 132 30 152 38C166 46 168 64 162 80L148 90C130 94 108 84 106 62Z';
    const beard = 'M136 84C148 96 166 98 174 90C176 120 166 150 148 162C140 142 134 116 132 92Z';
    const tablet = 'M188 116L240 104L248 158L196 168Z';
    const arm = 'M120 140C150 150 170 160 196 154L200 170C170 178 140 172 114 162Z';
    const crown = 'M108 44L112 26L122 38L132 22L140 36L150 24L154 42Z';
    let f = `<g data-figure="1">` + sil([robe, head, beard, tablet, arm, crown]);
    f += panes([[robe, 'steel'], ['M48 264C42 200 54 132 92 106C76 140 70 190 82 264Z', 'navy'], ['M166 116C180 140 186 168 232 178C256 184 262 212 254 238L246 264L196 264C214 236 214 210 196 196C174 180 166 150 166 116Z', 'bronze'], [tablet, 'ivory'], [arm, 'steel'], [head, 'skin'], ['M106 62C108 40 132 30 152 38C134 42 124 58 128 88C114 84 106 74 106 62Z', 'bronze'], [beard, 'ivory'], [crown, 'gold']]);
    f += `<g fill="none" stroke="${INK}" stroke-width="2.5"><path d="M200 126L232 120M202 138L222 134M204 150L238 144M100 180C120 200 150 214 196 216M150 52q6 4 10 0"/></g>`;
    // drawn cards rising toward the light
    f += panes([['M248 70L270 62L278 90L256 98Z', 'gold'], ['M222 44L242 42L244 70L224 72Z', 'ruby']], 3);
    H(hatch([[92, 106], [70, 140], [62, 200], [64, 262]], 10, 5, 14, 1, { swell: true }) + hatch([[92, 120], [74, 150], [70, 200], [72, 250]], 5, 4, 10, 1, { tilt: 0.7, t0: .3 }), 1.8);
    H(hatch([[148, 162], [142, 140], [136, 116], [134, 92]], 5, 3, 8, 1), 1.6);
    H(hatch([[246, 264], [254, 238], [260, 210], [232, 178]], 6, 4, 10, -1), 1.8);
    G(offset([[166, 116], [180, 140], [186, 168], [232, 178]], 7, 1, 6), 2.5);
    G('M110 112C130 104 148 108 158 122M240 110L246 152M264 74l8 14', 2);
    f += I.flush() + `</g>`;
    let k = foe(318, 260, 1.1, 'teal', 0) + foe(350, 262, 1.25, 'gold', 0);
    return b + f + k + frame('gold');
  },

  // Small clockwork walker with a great gear on its back, holding out a freshly drawn card glowing with arcane light.
  'Arcane Automaton': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), G = (d, w = 2, c = '#fff4c8') => I.add(d, w, c);
    let b = defs(['white', 'gold', 'amber', 'ruby', 'violet', 'deep', 'navy', 'steel', 'bronze', 'teal', 'sky']);
    b += scene(I, { sx: 150, sy: 96, radii: [0, 36, 80, 150, 420], n: [12, 12, 12, 8], cols: [['white', 'sky'], ['sky', 'gold'], ['violet', 'deep'], ['navy', 'deep']], g: ['teal', 'bronze'], gy: [246, 270], ph: 0.5, streaks: 'M40 200C60 196 76 202 96 198M300 40C316 36 330 42 346 38M30 150C46 146 56 150 70 148' });
    // gear: toothed ring
    const gx = 262, gy = 112;
    let gear = '';
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6, p = (r, d) => `${R(gx + r * Math.cos(a + d))} ${R(gy + r * Math.sin(a + d))}`;
      gear += `${i ? 'L' : 'M'}${p(62, -0.16)}L${p(76, -0.1)}L${p(76, 0.1)}L${p(62, 0.16)}`;
    }
    gear += 'Z';
    const headP = 'M236 92C236 70 288 70 288 92L284 120H240Z';
    const torso = 'M226 128L298 128L290 196L234 196Z';
    const legs = ['M240 194L254 196L238 262L222 262Z', 'M272 196L286 194L304 262L288 262Z'];
    const arm = 'M228 136L186 118L176 126L222 152Z', card = 'M146 82L184 92L174 136L136 126Z';
    const arm2 = 'M296 136L330 168L320 178L290 154Z';
    let f = `<g data-figure="1">` + sil([gear, headP, torso, ...legs, arm, card, arm2]);
    f += `<g stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"><path d="${gear}M${gx + 44} ${gy}A44 44 0 1 0 ${gx - 44} ${gy}A44 44 0 1 0 ${gx + 44} ${gy}Z" fill="url(#bronze)" fill-rule="evenodd"/></g>`;
    f += panes([[legs[0], 'steel'], [legs[1], 'navy'], [torso, 'steel'], ['M262 128L298 128L290 196L262 196Z', 'navy'], [arm2, 'bronze'], [headP, 'steel'], [arm, 'bronze'], [card, 'gold'], ['M154 92L176 98L170 124L148 118Z', 'white']]);
    f += `<circle cx="262" cy="160" r="16" fill="url(#sky)" stroke="${INK}" stroke-width="3"/><circle cx="262" cy="160" r="7" fill="url(#white)" stroke="${INK}" stroke-width="2"/><circle cx="262" cy="98" r="9" fill="url(#ruby)" stroke="${INK}" stroke-width="2.5"/>`;
    f += `<g fill="none" stroke="${INK}" stroke-width="3"><path d="M244 116H280M236 220H250M282 220H296"/></g>`;
    H(hatch([[298, 128], [296, 150], [292, 176], [290, 196]], 6, 4, 10, -1) + hatch([[288, 92], [288, 100], [286, 110], [284, 120]], 3, 3, 7, -1), 1.8);
    H(hatch([[gx + 76, gy], [gx + 74, gy + 30], [gx + 56, gy + 56], [gx + 30, gy + 70]], 8, 3, 10, -1, { swell: true }), 1.8);
    G(offset([[gx - 62, gy], [gx - 60, gy - 30], [gx - 36, gy - 58], [gx, gy - 64]], -6, -1, 6), 2.5);
    G('M232 136L238 188M242 88C246 78 260 76 270 78', 2);
    G('M160 100l10 2M158 108l10 2M156 116l8 2', 2, '#c8183a');
    f += I.flush() + `</g>`;
    return b + f + frame('gold');
  },

  // A giant born from a living storm: torso of cloud, lower body a twisting funnel, blowing a gale that buckles the foes' shields.
  'Tempest Giant': () => {
    const I = Ink(), H = (d, w = 1.8) => I.add(d, w), G = (d, w = 2, c = '#ffffff') => I.add(d, w, c);
    let b = defs(['white', 'pearl', 'sky', 'teal', 'deep', 'navy', 'violet', 'steel', 'gold']);
    b += scene(I, { sx: 128, sy: 214, radii: [0, 34, 78, 150, 420], n: [10, 10, 12, 8], cols: [['white', 'pearl'], ['pearl', 'sky'], ['sky', 'deep'], ['deep', 'violet']], g: ['teal', 'navy'], gy: [250, 272], ph: 1.5, rot: 0.3, streak: '#cfe6ff', streaks: 'M30 70C50 66 66 72 86 68M120 40C140 36 156 42 176 38M30 120C46 116 56 120 70 118' });
    // funnel: swirling bands narrowing to the ground
    const band = [];
    const rows = [[150, 80], [190, 54], [228, 28], [262, 4]];
    for (let i = 0; i < rows.length - 1; i++) {
      const [y0, w0] = rows[i], [y1, w1] = rows[i + 1], c0 = 236 + i * 4, c1 = 236 + (i + 1) * 4;
      band.push([`M${c0 - w0} ${y0}Q${c0} ${y0 + 10} ${c0 + w0} ${y0}L${c1 + w1} ${y1}Q${c1} ${y1 + 10} ${c1 - w1} ${y1}Z`, ['pearl', 'sky', 'pearl'][i]]);
    }
    const torso = 'M178 106C190 76 278 72 296 98L312 154L160 154Z';
    const head = 'M214 50C214 28 260 28 262 50L260 84H216Z';
    const hair = 'M200 60C186 40 204 18 228 22C240 16 272 16 276 32C298 32 298 64 276 68L262 58L214 62Z';
    const arm = 'M190 100C160 90 128 94 100 108L108 136C136 124 164 124 190 132Z', hand = 'M78 94L108 100L110 142L76 138Z';
    const arm2 = 'M286 96C322 100 346 124 354 156L332 164C324 138 308 126 288 126Z';
    let f = `<g data-figure="1">` + sil([...band.map((x) => x[0]), torso, head, hair, arm, hand, arm2]);
    f += panes([...band, [torso, 'pearl'], ['M250 80C270 80 286 88 296 98L312 154L258 154Z', 'steel'], [arm2, 'steel'], [arm, 'pearl'], [hand, 'pearl'], [hair, 'sky'], [head, 'pearl'], ['M242 32C256 34 262 42 262 50L260 84H242Z', 'steel']]);
    f += `<g fill="none" stroke="${INK}" stroke-width="3"><path d="M234 70h10"/></g><path d="M222 54L234 56L230 62Z" fill="url(#white)" stroke="${INK}" stroke-width="2"/>`;
    H(hatch([[296, 98], [302, 120], [308, 140], [312, 154]], 5, 5, 12, -1), 1.8);
    H(hatch([[354, 156], [346, 130], [322, 104], [286, 96]], 5, 4, 9, 1), 1.6);
    G(offset([[178, 106], [184, 94], [196, 84], [214, 80]], 6, -1, 3), 2.5);
    G('M184 160C200 166 222 168 240 164M196 184C210 190 226 190 238 186M108 108C136 102 160 102 186 108', 2);
    f += I.flush() + `</g>`;
    // the gale: streaks running left, foes bracing behind buckled shields
    G('M70 110C54 116 40 126 28 140M72 132C58 144 50 160 44 178M70 122C52 130 38 144 24 160', 2.5, '#e6f0ff');
    let k = I.flush() + foe(54, 256, 1.2, 'violet', -18) + foe(100, 258, 1.05, 'violet', -14);
    return b + f + k + frame('violet');
  },
});
