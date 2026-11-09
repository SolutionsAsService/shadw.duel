'use strict';
// Knights and warriors in the carved-glass style (GDADA run 3): Inferno Knight, Radiant Knight,
// Ironclad Mercenary, Wandering Duelist, Sunblade Angel, Lantern Bearer.
const { Ink, INK, R, defs, burst, hatch, offset, frame } = require('../art-lib/glass.cjs');

// ---- small local helpers (drawing only; the shared ones live in glass.cjs) ----
const under = (ds, w = 9) => `<g fill="${INK}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round">${ds.map((d) => `<path d="${d}"/>`).join('')}</g>`;
const panes = (list, w = 3.5) => `<g stroke="${INK}" stroke-width="${w}" stroke-linejoin="round">${list.map(([d, c]) => `<path d="${d}" fill="url(#${c})"/>`).join('')}</g>`;
const rings = (x, y, r1, r2) => `<g fill="none" stroke="${INK}" stroke-linecap="round"><circle cx="${x}" cy="${y}" r="${r1}" stroke-width="2.5" stroke-dasharray="16 6 30 8 10 6"/><circle cx="${x}" cy="${y}" r="${r2}" stroke-width="2" stroke-dasharray="24 9 12 7 36 10"/></g>`;
const ground = (a, b) => `<g stroke="${INK}" stroke-width="3" stroke-linejoin="round"><path d="${a[0]}" fill="url(#${a[1]})"/><path d="${b[0]}" fill="url(#${b[1]})"/></g>`;
// a flame tongue (or any tapering strip) from (x,y) along angle ang, length L, base half-width w
function tongue(x, y, ang, L, w, amp = 6, ph = 0, K = 6) {
  const D = [Math.cos(ang), Math.sin(ang)], N = [-D[1], D[0]];
  const l = [], r = [];
  for (let i = 0; i <= K; i++) {
    const t = i / K, wt = w * Math.pow(1 - t, 0.9) + 0.5, o = amp * Math.sin(t * 6 + ph) * t;
    const cx = x + D[0] * t * L + N[0] * o, cy = y + D[1] * t * L + N[1] * o;
    l.push([cx - N[0] * wt, cy - N[1] * wt]); r.unshift([cx + N[0] * wt, cy + N[1] * wt]);
  }
  const P = l.concat(r), m = (a, b) => `${R((a[0] + b[0]) / 2)} ${R((a[1] + b[1]) / 2)}`;
  let d = `M${m(P[0], P[1])}`;
  for (let i = 1; i < P.length; i++) d += `Q${R(P[i][0])} ${R(P[i][1])} ${m(P[i], P[(i + 1) % P.length])}`;
  return d + 'Z';
}
// a straight blade from hilt (x0,y0) to tip (x1,y1), half-width w
function blade(x0, y0, x1, y1, w) {
  const L = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / L * w, ny = (x1 - x0) / L * w;
  const bx = x1 - (x1 - x0) / L * w * 3, by = y1 - (y1 - y0) / L * w * 3;
  return `M${R(x0 + nx)} ${R(y0 + ny)}L${R(bx + nx)} ${R(by + ny)}L${x1} ${y1}L${R(bx - nx)} ${R(by - ny)}L${R(x0 - nx)} ${R(y0 - ny)}Z`;
}
// a bar across a line direction (crossguard) centred at (x,y)
function bar(x, y, ang, len, w) {
  const D = [Math.cos(ang), Math.sin(ang)], N = [-D[1], D[0]];
  const p = (a, b) => `${R(x + N[0] * a + D[0] * b)} ${R(y + N[1] * a + D[1] * b)}`;
  return `M${p(-len, -w)}L${p(len, -w)}L${p(len, w)}L${p(-len, w)}Z`;
}
function kit() {
  const I = Ink();
  return { I, H: (d, w = 1.8) => I.add(d, w), G: (d, w = 2, c = '#ffe9b0') => I.add(d, w, c) };
}

module.exports = () => ({
  // ===================================================================== flame
  'Inferno Knight': () => {
    const { I, H, G } = kit();
    const SX = 116, SY = 64;
    let b = defs(['white', 'gold', 'amber', 'orange', 'red', 'wine', 'deep', 'navy', 'teal', 'bronze']);
    b += `<rect width="400" height="300" fill="${INK}"/><g stroke="${INK}" stroke-width="3" stroke-linejoin="round">`;
    b += burst(SX, SY, [0, 34, 80, 150, 440], [8, 8, 9, 6], (k, i) => [['white', 'gold'], ['gold', 'amber'], ['wine', 'deep'], ['navy', 'deep']][k][i % 2], 0.4) + '</g>';
    b += ground(['M0 300V250C60 242 120 256 190 248C250 242 320 258 400 250V300Z', 'teal'], ['M0 300V272C80 264 150 280 230 272C300 266 350 278 400 274V300Z', 'navy']);
    b += rings(SX, SY, 42, 56);
    G('M30 170C50 166 66 172 84 168M330 80C346 76 360 82 374 78', 1.5, '#7f9ae8');
    b += I.flush();

    // ---------- the knight ----------
    const flamesBack = [
      [tongue(232, 250, -1.75, 130, 16, 8, 0, 4), 'red'], [tongue(342, 252, -1.45, 150, 18, 10, 2, 4), 'red'],
      [tongue(322, 250, -1.62, 190, 15, 9, 1, 4), 'orange'], [tongue(214, 256, -1.9, 96, 12, 6, 3, 4), 'orange'],
    ];
    const legs = ['M252 222L244 260H268L274 226Z', 'M282 224L294 260H316L302 222Z'];
    const boots = ['M238 256H270L272 270H232Z', 'M290 256H318L326 270H288Z'];
    const skirt = 'M246 194L234 234L268 238L284 232L312 232L298 194Z';
    const torso = 'M244 140C238 162 240 184 246 200H298C306 182 308 160 300 140C286 130 258 130 244 140Z';
    const helm = 'M250 134C246 114 250 96 268 94C286 94 292 110 290 134Z';
    const shield = 'M298 150C314 140 340 144 346 162C350 190 338 214 318 226C302 216 292 190 298 150Z';
    const arm = 'M238 148C226 140 218 128 212 114L202 100L216 90L228 104C234 116 242 126 256 134Z';
    const pauld = 'M230 152C222 134 236 120 254 128L260 144L242 158Z';
    const HX = 208, HY = 96, TX = 126, TY = 44;
    const ang = Math.atan2(TY - HY, TX - HX);
    const sword = blade(HX + Math.cos(ang) * 10, HY + Math.sin(ang) * 10, TX, TY, 6);
    const guard = bar(HX + Math.cos(ang) * 10, HY + Math.sin(ang) * 10, ang, 15, 4);
    const grip = blade(HX - Math.cos(ang) * 14, HY - Math.sin(ang) * 14, HX + Math.cos(ang) * 6, HY + Math.sin(ang) * 6, 3.5);
    const swordFire = [
      [tongue(170, 70, -1.85, 62, 11, 6, 1, 4), 'orange'],
    ];
    let f = `<g data-figure="1">`;
    f += under([...flamesBack.map((x) => x[0]), ...swordFire.map((x) => x[0]), ...legs, ...boots, skirt, torso, helm, shield, arm, pauld, sword, guard, grip]);
    f += panes(flamesBack);
    f += panes(swordFire.concat([[sword, 'white'], [guard, 'gold'], [grip, 'bronze']]));
    f += panes([[legs[0], 'red'], [legs[1], 'wine'], [boots[0], 'orange'], [boots[1], 'wine'], [skirt, 'red'],
      ['M284 232L312 232L298 194H282Z', 'wine'], [torso, 'red'], ['M300 140C308 160 306 182 298 200H282C290 180 292 160 286 134Z', 'wine'],
      ['M244 190H300V204H244Z', 'gold'], [helm, 'orange'], ['M290 134C292 110 286 94 268 94C280 104 282 120 278 134Z', 'wine'],
      [shield, 'red'], ['M318 226C338 214 350 190 346 162C340 182 332 204 318 226Z', 'wine'], [arm, 'orange'], [pauld, 'gold']]);
    // helm visor, plume, shield emblem
    f += panes([[tongue(270, 96, -1.2, 40, 9, 6, 1, 4), 'amber'], ['M318 168C312 180 314 196 322 204C332 192 330 178 318 168Z', 'gold'], ['M252 110H284V118H252Z', 'navy']], 2.5);
    f += `<circle cx="${HX}" cy="${HY}" r="8" fill="url(#gold)" stroke="${INK}" stroke-width="3"/>`;
    // hatching away from the sword fire (lower right)
    H(hatch([[300, 140], [308, 160], [306, 182], [298, 200]], 7, 4, 12, -1, { swell: true }), 2);
    H(hatch([[346, 162], [350, 190], [338, 214], [318, 226]], 6, 4, 12, -1, { swell: true }), 1.8);
    H('M266 140V198M248 160l10 2M248 176l10 2M266 236l2-40M278 120l8 0', 2.5);
    // gouged light toward the sword fire (upper left)
    G(offset([[244, 140], [238, 162], [240, 184], [246, 200]], 7, 1, 5), 2.5);
    G(offset([[250, 134], [246, 114], [250, 96], [268, 94]], 6, 1, 4), 2.2);
    G(`M${HX - 14} ${HY - 4}L${TX + 14} ${TY + 12}`, 2.5, '#fff');
    G('M300 160C304 150 316 146 326 148M240 228L248 200', 2.2);
    f += I.flush() + `</g>`;
    // small flame-creature allies (black woodcut silhouettes) roused by the knight
    let k = `<g fill="${INK}"><path d="M40 250C44 236 56 230 70 232L78 224L82 234C88 238 90 246 86 252L80 252L76 244L62 246L56 254L48 254Z"/><path d="M38 240L28 228L42 236Z"/></g>`;
    k += `<path d="M58 236C62 230 68 230 72 234L68 242Z" fill="url(#orange)" stroke="${INK}" stroke-width="2.5"/>`;
    G('M70 236L80 230M44 244L52 236', 2, '#ffc85a');
    k += I.flush();
    return b + f + k + frame('gold');
  },

  // ===================================================================== light
  'Radiant Knight': () => {
    const { I, H, G } = kit();
    const SX = 288, SY = 92;
    let b = defs(['white', 'gold', 'sky', 'pearl', 'deep', 'navy', 'teal', 'ivory', 'skin', 'bronze', 'ruby', 'steel']);
    b += `<rect width="400" height="300" fill="${INK}"/><g stroke="${INK}" stroke-width="3" stroke-linejoin="round">`;
    b += burst(SX, SY, [0, 36, 84, 150, 440], [10, 10, 12, 8], (k, i) => [['white', 'gold'], ['gold', 'ivory'], ['sky', 'deep'], ['deep', 'navy']][k][i % 2], 0.1) + '</g>';
    b += ground(['M0 300V246C70 236 140 252 210 244C280 238 330 250 400 244V300Z', 'teal'], ['M0 300V268C80 260 160 276 240 268C310 262 360 274 400 270V300Z', 'navy']);
    b += rings(SX, SY, 46, 60);
    G('M30 120C50 116 66 122 86 118M24 170C44 166 60 172 78 168M330 180C346 176 360 182 376 178', 1.5, '#cfe6ff');
    b += I.flush();
    // the blessing: a band of light from the knight's hand to the ally
    b += panes([['M242 112L276 240L294 244Z', 'gold'], ['M242 112L310 232L330 232Z', 'white'], ['M242 112L346 218L360 206Z', 'gold']], 2.5);
    b += `<ellipse cx="318" cy="234" rx="38" ry="12" fill="url(#gold)" stroke="${INK}" stroke-width="3"/>`;

    // ---------- the knight ----------
    const cloak = 'M126 132C104 168 92 216 86 262H140L136 200L130 134Z';
    const legs = ['M132 200L126 258H150L156 202Z', 'M160 200L172 258H194L180 200Z'];
    const boots = ['M120 254H152L154 268H114Z', 'M168 254H196L204 268H166Z'];
    const torso = 'M128 134C140 124 172 124 186 134C190 160 186 186 180 204H132C128 182 126 158 128 134Z';
    const helm = 'M136 128C132 106 138 88 156 86C174 86 182 102 178 128Z';
    const crest = 'M150 88C148 70 158 56 176 50C170 62 176 74 172 88Z';
    const shield = 'M88 140C104 128 136 128 152 140C156 186 140 222 120 244C100 222 84 186 88 140Z';
    const arm = 'M178 136C196 126 212 116 226 104L236 116C222 130 204 142 186 152Z';
    const pauld = 'M174 148C170 128 186 120 200 128C204 138 200 148 194 154Z';
    let f = `<g data-figure="1">`;
    f += under([cloak, ...legs, ...boots, torso, helm, crest, shield, arm, pauld, 'M222 100L244 96L246 118L228 122Z']);
    f += panes([[cloak, 'ruby'], [legs[0], 'ivory'], [legs[1], 'steel'], [boots[0], 'gold'], [boots[1], 'gold'],
      [torso, 'ivory'], ['M186 134C190 160 186 186 180 204H166C172 180 174 156 170 128Z', 'sky'], ['M130 190H184V204H130Z', 'gold'],
      [helm, 'pearl'], ['M178 128C182 102 174 86 156 86C166 96 168 112 166 128Z', 'sky'], [crest, 'ruby'],
      [shield, 'ivory'], ['M152 140C156 186 140 222 120 244C130 214 138 182 136 136Z', 'sky'],
      [arm, 'ivory'], [pauld, 'gold'], ['M222 100L244 96L246 118L228 122Z', 'skin']]);
    // visor slit, shield sun emblem (off centre, low), arm plate
    f += panes([['M150 106H176V114H150Z', 'navy'], ['M98 150L140 150L138 160L100 160Z', 'gold']], 2.5);
    f += `<circle cx="116" cy="186" r="16" fill="url(#gold)" stroke="${INK}" stroke-width="3"/><circle cx="116" cy="186" r="7" fill="url(#white)" stroke="${INK}" stroke-width="2.5"/>`;
    // hatching on the side away from the sun (left)
    H(hatch([[88, 140], [84, 186], [100, 222], [120, 244]], 9, 5, 14, -1, { swell: true }) + hatch([[88, 140], [84, 186], [100, 222], [120, 244]], 5, 4, 9, -1, { swell: true, tilt: -0.7, t0: .3, t1: .8 }), 1.8);
    H(hatch([[126, 132], [104, 168], [92, 216], [86, 262]], 8, 4, 12, -1), 1.8);
    H(hatch([[136, 128], [132, 108], [138, 92], [150, 86]], 4, 3, 7, 1), 1.6);
    H('M156 136V190M140 220l2-18M116 166l0-4M100 186h-4M116 206v4M132 186h4', 2.5);
    // gouges toward the sun (right / upper)
    G(offset([[152, 140], [156, 186], [140, 222], [120, 244]], -8, -1, 6), 2.5, '#fff4c8');
    G(offset([[156, 86], [174, 86], [182, 102], [178, 128]], -6, -1, 4), 2.2, '#fff4c8');
    G('M186 140C200 132 212 124 222 114M160 50C166 58 168 70 166 82', 2.2, '#fff4c8');
    f += I.flush() + `</g>`;
    // the ally, kneeling in the light (black woodcut silhouette)
    let k = `<g fill="${INK}"><circle cx="314" cy="208" r="7"/><path d="M304 218C316 214 324 220 324 232L336 236L338 250L322 252L318 244L304 248L298 240Z"/><path d="M302 222L290 236L298 238Z"/></g>`;
    k += `<path d="M330 222C340 218 348 222 350 230C348 244 340 250 332 252C326 244 326 232 330 222Z" fill="url(#gold)" stroke="${INK}" stroke-width="2.5"/>`;
    G('M318 202C322 206 322 212 320 216M326 226L332 236', 2, '#fff4c8');
    k += I.flush();
    return b + f + k + frame('ruby');
  },

  // ===================================================================== neutral
  'Ironclad Mercenary': () => {
    const { I, H, G } = kit();
    const SX = 92, SY = 220;
    let b = defs(['white', 'gold', 'amber', 'violet', 'deep', 'navy', 'teal', 'bronze', 'steel', 'skin']);
    b += `<rect width="400" height="300" fill="${INK}"/><g stroke="${INK}" stroke-width="3" stroke-linejoin="round">`;
    b += burst(SX, SY, [0, 40, 96, 176, 460], [10, 12, 12, 9], (k, i) => [['white', 'gold'], ['amber', 'gold'], ['deep', 'violet'], ['navy', 'violet']][k][i % 2], 0.25) + '</g>';
    b += ground(['M0 300V248C60 240 130 254 200 248C260 242 330 256 400 248V300Z', 'teal'], ['M0 300V270C70 262 150 278 230 270C300 264 350 276 400 272V300Z', 'bronze']);
    b += rings(SX, SY, 50, 66);
    G('M200 60C220 56 236 62 256 58M150 110C170 106 186 112 206 108M180 170C196 166 210 172 226 168M330 220C346 216 360 222 376 218', 1.5, '#8fa6e8');
    b += I.flush();

    // ---------- the mercenary: broad, plated, axe on shoulder, paying out his fee ----------
    const legs = ['M258 214L250 256H278L282 218Z', 'M294 216L304 256H330L318 214Z'];
    const boots = ['M244 252H280L282 268H238Z', 'M300 252H332L340 268H298Z'];
    const coat = 'M248 148C236 176 236 206 244 226H338C346 204 344 176 332 148Z';
    const chest = 'M252 136C264 122 316 122 330 136C334 156 330 176 322 186H260C252 172 248 154 252 136Z';
    const helm = 'M266 128C262 102 272 84 292 84C312 84 320 102 316 128Z';
    const brim = 'M254 112C270 104 312 104 328 112L326 120C310 114 272 114 256 120Z';
    const haft = blade(330, 214, 346, 64, 4.5);
    const axe = 'M346 70C330 52 338 34 356 30C352 46 362 62 380 64C374 82 360 92 344 90Z';
    const farArm = 'M326 142C342 140 350 120 346 104L332 102C334 116 328 128 318 134Z';
    const arm = 'M256 146C238 150 222 156 206 158L204 172C224 172 244 168 262 162Z';
    const pauld = ['M240 156C232 136 248 124 266 130L268 150L250 162Z', 'M318 130C334 124 348 134 344 154L330 160L316 150Z'];
    const pouch = 'M186 156C182 146 192 140 200 146C210 140 218 148 212 158C218 170 212 182 198 182C184 182 180 168 186 156Z';
    let f = `<g data-figure="1">`;
    f += under([...legs, ...boots, coat, chest, helm, brim, haft, axe, farArm, arm, ...pauld, pouch]);
    f += panes([[haft, 'bronze'], [axe, 'steel'], ['M356 30C352 46 362 62 380 64C374 82 360 92 344 90C356 76 360 52 356 30Z', 'navy'], [farArm, 'steel']]);
    f += panes([[legs[0], 'bronze'], [legs[1], 'bronze'], [boots[0], 'steel'], [boots[1], 'navy'],
      [coat, 'steel'], ['M332 148C344 176 346 204 338 226H318C326 200 326 172 316 148Z', 'navy'],
      [chest, 'steel'], ['M330 136C334 156 330 176 322 186H306C314 166 316 148 310 128Z', 'navy'], ['M254 182H326V196H254Z', 'bronze'],
      [helm, 'steel'], ['M316 128C320 102 312 84 292 84C304 96 306 112 302 128Z', 'navy'], [brim, 'steel'],
      [arm, 'steel'], [pauld[0], 'steel'], [pauld[1], 'bronze'], [pouch, 'bronze'], ['M184 160H214V166H184Z', 'gold']]);
    f += panes([['M276 120H306V128H276Z', 'violet'], ['M282 134C282 150 300 150 300 134Z', 'skin']], 2.5);
    // gold coins tipping out of the pouch toward the sun
    f += `<g fill="url(#gold)" stroke="${INK}" stroke-width="2.5"><circle cx="176" cy="196" r="7"/><circle cx="166" cy="216" r="6"/><circle cx="182" cy="230" r="6"/><circle cx="160" cy="240" r="5"/></g>`;
    // rivets on the breastplate
    f += `<g fill="url(#gold)" stroke="${INK}" stroke-width="2"><circle cx="266" cy="146" r="4"/><circle cx="266" cy="166" r="4"/><circle cx="292" cy="146" r="4"/></g>`;
    // hatching away from the low sun (right)
    H(hatch([[332, 148], [344, 176], [346, 204], [338, 226]], 8, 5, 13, -1, { swell: true }) + hatch([[332, 148], [344, 176], [346, 204], [338, 226]], 4, 4, 9, -1, { swell: true, tilt: 0.7, t0: .3, t1: .8 }), 1.8);
    H(hatch([[316, 128], [320, 102], [312, 84], [292, 84]], 5, 3, 8, 1), 1.8);
    H(hatch([[318, 214], [322, 230], [326, 244], [330, 256]], 4, 4, 9, -1), 1.8);
    H('M290 136V182M276 206l2 16M262 226l-2 14', 2.5);
    // gouges facing the sun (left)
    G(offset([[252, 136], [248, 154], [252, 172], [260, 186]], 6, 1, 5), 2.5);
    G(offset([[266, 128], [262, 108], [272, 88], [292, 84]], 6, 1, 4), 2.2);
    G('M246 158C238 176 238 200 244 216M214 152C222 150 236 148 248 146M194 150C190 156 190 166 194 172', 2.2);
    f += I.flush() + `</g>`;
    return b + f + frame('gold');
  },

  'Wandering Duelist': () => {
    const { I, H, G } = kit();
    const SX = 318, SY = 150;
    let b = defs(['white', 'gold', 'amber', 'violet', 'deep', 'navy', 'teal', 'bronze', 'steel', 'skin', 'ruby', 'wine']);
    b += `<rect width="400" height="300" fill="${INK}"/><g stroke="${INK}" stroke-width="3" stroke-linejoin="round">`;
    b += burst(SX, SY, [0, 30, 70, 140, 460], [8, 10, 12, 8], (k, i) => [['white', 'gold'], ['gold', 'amber'], ['deep', 'violet'], ['navy', 'deep']][k][i % 2], 0.5) + '</g>';
    b += ground(['M0 300V242C50 236 110 250 180 244C240 238 310 254 400 246V300Z', 'bronze'], ['M0 300V264C70 256 150 274 230 266C300 260 350 272 400 268V300Z', 'teal']);
    b += rings(SX, SY, 40, 54);
    G('M40 70C60 66 76 72 96 68M30 140C50 136 66 142 86 138M140 50C156 46 170 52 186 48M180 200C196 196 210 202 226 198', 1.5, '#8fa6e8');
    b += I.flush();

    // ---------- the duelist, lunging: rapier at full reach into the light ----------
    const cloak = 'M120 126C92 134 62 152 36 176L58 178L40 198L70 192L60 214C88 196 110 176 126 156Z';
    const backLeg = 'M120 196L84 230L56 254L64 264L92 244L132 214Z';
    const frontLeg = 'M146 196L188 218L198 252L216 252L208 210L156 182Z';
    const boots = ['M48 252L66 244L74 262L40 266Z', 'M192 248H220L230 264H188Z'];
    const torso = 'M118 132C128 120 156 118 168 128C174 152 168 180 156 202H120C112 180 112 154 118 132Z';
    const head = 'M136 118C132 104 140 94 152 94C164 96 168 108 164 120C158 126 144 126 136 118Z';
    const hat = 'M112 100C130 92 150 88 172 90C186 90 196 96 200 104C182 100 168 100 156 100C140 102 124 104 112 100Z';
    const crown = 'M134 98C134 80 146 72 160 74C168 78 170 88 168 98Z';
    const arm = 'M162 134C184 132 204 134 222 136L222 148C202 150 182 150 160 150Z';
    const backArm = 'M122 140C108 134 96 124 90 110L100 104C108 116 116 124 128 128Z';
    const HX = 228, HY = 142, TX = 316, TY = 132;
    const sword = blade(HX + 6, HY, TX, TY, 2.5);
    const guard = 'M220 132C230 128 236 134 236 142C236 152 228 156 220 152Z';
    let f = `<g data-figure="1">`;
    f += under([cloak, backLeg, frontLeg, ...boots, torso, head, hat, crown, arm, backArm, guard, sword]);
    f += panes([[cloak, 'ruby'], ['M120 126C92 134 62 152 36 176L58 178C80 160 100 146 122 140Z', 'wine'], [backLeg, 'bronze'], [frontLeg, 'bronze'],
      [boots[0], 'wine'], [boots[1], 'wine'], [torso, 'steel'], ['M168 128C174 152 168 180 156 202H142C152 178 156 152 150 124Z', 'deep'],
      [head, 'skin'], [hat, 'bronze'], [crown, 'bronze'], ['M134 98C134 92 136 88 138 84L166 90C168 94 168 96 168 98Z', 'ruby'],
      [arm, 'steel'], [backArm, 'steel'], [sword, 'white'], [guard, 'gold']]);
    f += `<circle cx="96" cy="104" r="6" fill="url(#skin)" stroke="${INK}" stroke-width="2.5"/>`;
    // the hit: a small white flash where the point lands
    f += panes([['M308 132L320 116L322 130L338 126L326 138L340 148L322 142L318 158L312 142L298 146Z', 'white']], 2.5);
    // hatching on the far (left) side, away from the light
    H(hatch([[118, 132], [112, 154], [112, 180], [120, 202]], 6, 4, 10, 1, { swell: true }), 1.8);
    H(hatch([[36, 176], [62, 152], [92, 134], [120, 126]], 8, 12, 4, -1, { tilt: 0.3 }), 1.8);
    H(hatch([[56, 254], [70, 242], [84, 230], [120, 196]], 6, 4, 8, -1), 1.8);
    H(hatch([[136, 118], [132, 104], [140, 94], [152, 94]], 3, 3, 6, 1), 1.6);
    H('M140 132L136 196M126 216l20-14', 2.5);
    // gouges facing the light (right)
    G(offset([[168, 128], [174, 152], [168, 180], [156, 202]], 6, -1, 5), 2.5);
    G('M170 92C182 92 192 96 196 102M150 186L196 214L204 246M232 140L304 132', 2.2);
    f += I.flush() + `</g>`;
    // the foe, struck and reeling (black woodcut silhouette)
    let k = `<g fill="${INK}"><circle cx="352" cy="190" r="8"/><path d="M342 200C352 196 362 200 364 210L370 238L362 240L356 222L352 240L342 240L344 222L336 214Z"/><path d="M364 204L380 196L382 204Z"/></g>`;
    k += `<path d="M330 206C334 196 342 196 344 204L342 228C336 226 330 220 330 206Z" fill="url(#steel)" stroke="${INK}" stroke-width="2.5"/>`;
    G('M346 184C344 188 344 192 346 196M338 210L340 222', 2, '#ffe9b0');
    k += I.flush();
    return b + f + k + frame('gold');
  },

  // ===================================================================== light
  'Sunblade Angel': () => {
    const { I, H, G } = kit();
    const SX = 216, SY = 120;
    let b = defs(['white', 'gold', 'amber', 'sky', 'pearl', 'deep', 'navy', 'teal', 'ivory', 'skin', 'ruby', 'bronze']);
    b += `<rect width="400" height="300" fill="${INK}"/><g stroke="${INK}" stroke-width="3" stroke-linejoin="round">`;
    b += burst(SX, SY, [0, 30, 72, 140, 460], [8, 10, 10, 7], (k, i) => [['white', 'gold'], ['gold', 'amber'], ['sky', 'deep'], ['deep', 'navy']][k][i % 2], 0.0) + '</g>';
    b += ground(['M0 300V256C60 248 120 262 190 254C260 248 320 262 400 254V300Z', 'teal'], ['M0 300V276C80 268 160 284 240 276C310 270 360 282 400 278V300Z', 'navy']);
    b += rings(SX, SY, 38, 50);
    G('M300 200C320 196 336 202 356 198M310 236C326 232 340 238 356 234M40 120C60 116 76 122 96 118', 1.5, '#cfe6ff');
    b += I.flush();

    // ---------- the angel, swooping down-left, blade swung through the foe ----------
    // wings raised and swept back to the upper right; body on a falling diagonal
    const wingFar = 'M226 120C220 88 232 58 256 38C260 54 270 62 286 62C282 78 290 88 306 92C284 108 254 118 236 126Z';
    const wingNear = 'M234 126C256 94 288 70 322 56C318 72 326 82 342 86C332 98 338 110 356 116C342 126 346 138 362 148C328 152 286 148 254 140Z';
    const body = 'M206 120C220 110 242 114 252 128L280 168C272 182 254 186 242 178L212 142Z';
    const robe = 'M244 176C266 186 300 194 340 196L352 212C318 222 280 220 252 206C240 198 236 186 244 176Z';
    const head = 'M186 108C184 94 194 84 206 84C218 86 224 96 222 108C218 118 206 122 196 120Z';
    const hair = 'M222 108C226 92 218 80 204 80C196 80 190 84 188 90C202 88 214 94 216 112Z';
    const arm = 'M210 132C196 146 180 158 166 166L174 180C190 172 206 160 220 146Z';
    const HX = 166, HY = 172, TX = 82, TY = 230;
    const ang = Math.atan2(TY - HY, TX - HX);
    const sword = blade(HX + Math.cos(ang) * 8, HY + Math.sin(ang) * 8, TX, TY, 7);
    const guard = bar(HX + Math.cos(ang) * 8, HY + Math.sin(ang) * 8, ang, 14, 4);
    // the swing's sun-arc trailing the blade
    const arc = 'M90 220C100 180 130 150 170 140L176 150C142 162 116 188 104 224Z';
    let f = `<g data-figure="1">`;
    f += under([wingFar, wingNear, robe, body, head, hair, arm, sword, guard]);
    f += panes([[wingFar, 'pearl'], ['M236 126C254 118 284 108 306 92C290 88 282 78 286 62C270 86 252 106 236 126Z', 'sky'],
      [wingNear, 'ivory'], ['M254 140C286 148 328 152 362 148C346 138 342 126 356 116C322 128 286 134 254 140Z', 'pearl'],
      ['M234 126C256 94 288 70 322 56C296 80 274 104 258 132Z', 'gold']]);
    f += panes([[robe, 'ivory'], ['M252 206C280 220 318 222 352 212L346 204C316 210 284 208 258 196Z', 'sky'], [body, 'gold'], ['M252 128L280 168C272 182 254 186 242 178C258 170 262 150 246 124Z', 'amber'],
      [head, 'skin'], [hair, 'gold'], [arm, 'ivory'], [sword, 'white'], [guard, 'gold']]);
    f += `<circle cx="${HX}" cy="${HY}" r="7" fill="url(#skin)" stroke="${INK}" stroke-width="3"/>`;
    // hatching away from the burst (lower right of the body and wings)
    H(hatch([[252, 128], [266, 148], [280, 168], [272, 180]], 5, 4, 10, -1, { swell: true }), 1.8);
    H(hatch([[254, 140], [286, 148], [328, 152], [362, 148]], 5, 4, 12, -1, { swell: true, t0: .3 }), 1.8);
    // gouges facing the burst
    G(offset([[206, 120], [220, 110], [242, 114], [252, 128]], 6, 1, 4), 2.2, '#fff4c8');
    G(`M${HX - 8} ${HY + 10}L${TX + 14} ${TY - 6}`, 2.5, '#fff');
    G('M226 140C214 152 200 162 184 170M250 186C276 196 306 202 336 202', 2, '#fff4c8');
    f += I.flush() + `</g>`;
    // the sun-arc of the swing, and the struck foe (black silhouette) with healing motes rising
    let k = panes([[arc, 'gold']], 3);
    k += `<g fill="${INK}"><circle cx="54" cy="226" r="8"/><path d="M46 236C38 244 36 256 40 264L50 264L54 252L60 264H70L64 244C60 236 54 234 46 236Z"/><path d="M60 238L76 228L78 236Z"/></g>`;
    k += `<path d="M30 236C34 228 42 230 44 238L40 256C34 254 28 246 30 236Z" fill="url(#ruby)" stroke="${INK}" stroke-width="2.5"/>`;
    k += `<g fill="url(#gold)" stroke="${INK}" stroke-width="2.5"><path d="M110 168l6-8l6 8l-6 8Z"/><path d="M126 130l5-7l5 7l-5 7Z"/><path d="M94 196l4-6l4 6l-4 6Z"/></g>`;
    G('M60 222C62 226 62 230 60 234M62 244L66 256', 2, '#ffe9b0');
    k += I.flush();
    return b + f + k + frame('ruby');
  },

  'Lantern Bearer': () => {
    const { I, H, G } = kit();
    const SX = 262, SY = 132;
    let b = defs(['white', 'gold', 'amber', 'sky', 'deep', 'navy', 'teal', 'ivory', 'skin', 'ruby', 'violet', 'bronze']);
    b += `<rect width="400" height="300" fill="${INK}"/><g stroke="${INK}" stroke-width="3" stroke-linejoin="round">`;
    b += burst(SX, SY, [0, 26, 60, 120, 200, 460], [8, 10, 12, 12, 8], (k, i) => [['white', 'gold'], ['gold', 'amber'], ['deep', 'violet'], ['navy', 'violet'], ['navy', 'deep']][k][i % 2], 0.3) + '</g>';
    b += ground(['M0 300V240C60 232 120 248 190 242C250 236 330 250 400 242V300Z', 'teal'], ['M0 300V264C80 256 160 272 240 264C310 258 360 270 400 266V300Z', 'navy']);
    b += rings(SX, SY, 36, 48);
    // stars of the long night
    G('M40 60h8M44 56v8M340 60h6M343 57v6M60 150h6M63 147v6M370 200h6M373 197v6M150 50h6M153 47v6', 2, '#cfe0ff');
    // a thin dawn band low on the horizon behind
    b += panes([['M226 244C270 236 330 240 384 236V250C330 252 270 252 226 252Z', 'gold']], 3);
    b += I.flush();

    // ---------- the bearer: a cloaked walker holding the lantern out on a crook ----------
    const robe = 'M120 112C100 136 86 186 80 236L72 262H168L158 220C164 190 168 160 160 128Z';
    const hood = 'M112 124C104 96 116 74 138 72C156 74 166 90 164 114C158 126 140 132 124 130Z';
    const face = 'M146 98C154 96 160 104 158 114C152 120 144 118 140 112Z';
    const arm = 'M150 144C170 140 188 132 204 118L212 128C198 144 178 156 156 162Z';
    const staff = 'M196 132L240 72L248 78L204 138Z';
    const hook = 'M240 72C248 62 262 64 266 74L264 96L258 96L258 78C256 72 250 72 246 78Z';
    const lantern = 'M246 102H276L282 112L278 150L282 158H240L244 150L240 112Z';
    const cap = 'M248 96H274L278 104H244Z';
    const glow = 'M250 114H272L270 146H252Z';
    let f = `<g data-figure="1">`;
    f += under([robe, hood, face, arm, staff, hook, lantern, cap]);
    f += panes([[staff, 'bronze'], [hook, 'bronze'], [lantern, 'bronze'], [cap, 'bronze'], [glow, 'white'],
      ['M250 114H260V146H252Z', 'gold'], ['M244 150H278V158H244Z', 'gold']]);
    f += panes([[robe, 'ivory'], ['M120 112C100 136 86 186 80 236L72 262H104C104 220 110 170 128 128Z', 'sky'],
      ['M128 160C138 190 140 226 136 262H168L158 220C160 196 154 176 144 160Z', 'gold'],
      [hood, 'ivory'], ['M112 124C104 96 116 74 138 72C126 84 120 106 126 130Z', 'sky'], [face, 'skin'], [arm, 'ivory']]);
    f += `<circle cx="208" cy="126" r="7" fill="url(#skin)" stroke="${INK}" stroke-width="3"/>`;
    // hatching away from the lantern (left/back)
    H(hatch([[120, 112], [100, 136], [86, 186], [80, 236]], 10, 4, 14, -1, { swell: true }) + hatch([[120, 112], [100, 136], [86, 186], [80, 236]], 5, 4, 10, -1, { swell: true, tilt: -0.7, t0: .3, t1: .8 }), 1.8);
    H(hatch([[112, 124], [104, 96], [116, 74], [138, 72]], 6, 4, 10, 1), 1.8);
    H('M118 150L112 240M140 152L150 256', 2.5);
    // gouges facing the lantern (right)
    G(offset([[160, 128], [168, 160], [164, 190], [158, 220]], 7, -1, 5), 2.5);
    G(offset([[138, 72], [156, 74], [166, 90], [164, 114]], 6, -1, 4), 2.2);
    G('M162 146C176 142 188 136 200 126M206 128L238 84', 2.2);
    f += I.flush() + `</g>`;
    // the faithful following the light (tiny silhouettes far behind)
    let k = `<g fill="${INK}"><circle cx="40" cy="226" r="5"/><path d="M34 232C40 230 46 232 46 238L48 256H32Z"/><circle cx="58" cy="232" r="4"/><path d="M53 238C58 236 63 238 63 242L64 256H52Z"/></g>`;
    G('M44 224C46 226 46 230 44 232M61 234L62 242', 1.8, '#ffe9b0');
    k += I.flush();
    return b + f + k + frame('ruby');
  },
});
