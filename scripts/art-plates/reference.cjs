'use strict';
// Reference plates for the woodcut + stained glass style (GDADA run 3, style lead).
// Each entry returns the card's whole illustration; scripts/build-card-art.cjs wraps it.
module.exports = () => ({
  "Ashen Dragon": () => {
    const { Ink, INK, defs, burst, hatch, offset, frame, svg } = require('../art-lib/glass.cjs');
    const I = Ink();
    const H = (d, w = 1.6) => I.add(d, w);
    const G = (d, w = 2, c = '#ffe9b0') => I.add(d, w, c);

    const SX = 250, SY = 76;
    let b = defs(['white', 'gold', 'amber', 'orange', 'red', 'ruby', 'wine', 'violet', 'deep', 'navy', 'teal', 'bronze']);
    b += `<rect width="400" height="300" fill="${INK}"/>`;
    // background: carved sunburst panes
    b += `<g stroke="${INK}" stroke-width="3" stroke-linejoin="round">`;
    b += burst(SX, SY, [0, 30, 66, 136, 420], [8, 10, 10, 6], (k, i) => [['white', 'gold'], ['gold', 'amber'], ['violet', 'deep'], ['navy', 'deep']][k][i % 2], 0.3);
    // ground panes
    b += `<path d="M0 300V244C50 236 110 250 170 246C200 244 214 252 230 262L240 300Z" fill="url(#teal)"/>`;
    b += `<path d="M0 300V266C40 260 80 270 120 266C150 264 170 272 186 284V300Z" fill="url(#navy)"/>`;
    b += `</g>`;
    // carved rings around the sun
    b += `<g fill="none" stroke="${INK}" stroke-linecap="round"><circle cx="${SX}" cy="${SY}" r="40" stroke-width="2.5" stroke-dasharray="16 6 30 8 10 6"/><circle cx="${SX}" cy="${SY}" r="52" stroke-width="2" stroke-dasharray="24 9 12 7 36 10"/></g>`;
    // sky gouges (woodcut streaks)
    b += G('M30 120C50 116 70 122 92 118M24 140C44 136 60 142 78 138M40 186C56 182 70 188 88 184M30 60C46 56 60 62 76 58M120 40C136 36 150 42 166 38M110 150C126 146 140 152 156 148', 1.5, '#7f9ae8');
    b += I.flush();

    // ---------- the dragon ----------
    const wing = [
      ['M352 40L380 22Q366 46 382 66Z', 'ruby'],
      ['M352 40L382 66Q362 84 378 110Z', 'wine'],
      ['M352 40L378 110Q352 122 360 148Z', 'ruby'],
      ['M352 40L360 148Q340 150 334 166L322 84Z', 'wine'],
      ['M322 84L334 166L298 150Z', 'ruby'],
    ];
    const body = 'M248 196C246 160 276 138 318 140C356 142 380 176 376 214C372 248 348 266 312 266C274 266 250 236 248 196Z';
    const neck = 'M266 176C240 158 226 132 230 104L262 96C262 118 276 140 302 152Z';
    const head = 'M264 98C262 82 248 72 232 74L198 88C192 90 192 96 198 97L220 98L202 108C196 112 200 116 206 116L230 112C248 112 262 108 264 98Z';
    const haunch = 'M326 212C344 196 372 206 372 234C370 258 348 268 328 262C314 250 314 224 326 212Z';
    const leg = 'M278 228C270 242 262 254 250 262L246 272L282 272C284 258 292 246 302 236Z';
    const tail = 'M366 240C394 254 388 284 352 286L282 286C326 278 360 272 366 258Z';
    const horns = ['M250 78L290 50L262 92Z', 'M240 76L264 42L252 82Z'];
    const silhouette = ['M352 40L380 22Q366 46 382 66Q362 84 378 110Q352 122 360 148Q340 150 334 166L298 150Z', tail, body, haunch, leg, neck, head, ...horns];

    let f = `<g data-figure="1">`;
    // silhouette pass: thick carved outline
    f += `<g fill="${INK}" stroke="${INK}" stroke-width="9" stroke-linejoin="round">${silhouette.map((d) => `<path d="${d}"/>`).join('')}</g>`;
    f += `<g stroke="${INK}" stroke-width="3.5" stroke-linejoin="round">`;
    f += wing.map(([d, c]) => `<path d="${d}" fill="url(#${c})"/>`).join('');
    f += `</g>`;
    // wing hatching: shadow toward body, along fingers
    f += H(hatch([[352, 40], [356, 76], [358, 112], [360, 148]], 8, 4, 14, -1, { tilt: 0.3 }) + hatch([[322, 84], [326, 110], [330, 140], [334, 166]], 6, 6, 16, -1, { tilt: 0.2 }));
    f += I.flush();
    f += `<path d="M298 150L322 84L352 40L380 22" fill="none" stroke="${INK}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>`;
    f += G('M304 140L324 92L352 52', 2, '#ffb0a0');
    f += `<g stroke="${INK}" stroke-width="3.5" stroke-linejoin="round">`;
    f += `<path d="${tail}" fill="url(#red)"/><path d="${body}" fill="url(#red)"/>`;
    // belly plate band (lit by the fire)
    f += `<path d="M252 186C254 220 270 246 298 260C278 262 258 244 252 220Z" fill="url(#amber)"/>`;
    f += `<path d="${haunch}" fill="url(#orange)"/><path d="${leg}" fill="url(#orange)"/>`;
    f += `<path d="M318 140C356 142 380 176 376 214L362 216C362 186 346 160 318 140Z" fill="url(#wine)"/><path d="M372 234C370 258 348 268 328 262C346 256 360 244 360 226C360 214 356 206 350 202C364 206 372 218 372 234Z" fill="url(#wine)"/>`;
    f += `<path d="${neck}" fill="url(#red)"/><path d="M262 96C262 118 276 140 302 152L288 154C270 140 256 122 254 98Z" fill="url(#wine)"/><path d="M266 176C240 158 226 132 230 104L240 102C238 130 250 152 272 166Z" fill="url(#amber)"/>`;
    f += `<path d="${head}" fill="url(#red)"/>`;
    f += horns.map((d) => `<path d="${d}" fill="url(#gold)"/>`).join('');
    f += `</g>`;
    // interior leading: flank pane split + plates
    f += H('M276 150C300 170 312 200 306 238M252 196l10-2M256 214l10-4M262 230l10-6M272 244l8-8M284 254l6-9M232 120l9-3M236 136l9-4M244 150l9-5M254 162l8-6', 2.5);
    // form hatching: body shadow side (lower right), haunch, neck back, head back
    f += H(hatch([[318, 140], [356, 142], [380, 176], [376, 214]], 9, 6, 16, -1, { t0: 0.2, swell: true }), 2);
    f += H(hatch([[318, 140], [356, 142], [380, 176], [376, 214]], 5, 5, 12, -1, { t0: 0.4, t1: 0.85, tilt: 0.7 }), 1.6);
    f += H(hatch([[372, 234], [370, 258], [348, 268], [328, 262]], 6, 5, 11, -1, { swell: true }), 2);
    f += H(hatch([[372, 234], [370, 258], [348, 268], [328, 262]], 4, 4, 9, -1, { swell: true, tilt: 0.7, t0: .25, t1: .75 }), 1.6);
    f += H(hatch([[312, 266], [292, 264], [276, 256], [262, 240]], 5, 4, 8, -1), 2);
    f += H(hatch([[262, 96], [262, 118], [276, 140], [302, 152]], 8, 5, 12, -1), 2);
    f += H(hatch([[264, 98], [262, 106], [248, 112], [232, 112]], 4, 3, 7, -1));
    // gouged highlights on lit upper edges
    f += G(offset([[248, 196], [246, 160], [276, 138], [318, 140]], 6, -1, 6), 2.5);
    f += G(offset([[230, 104], [232, 100], [246, 98], [262, 96]], 0, 1, 2) + 'M206 90L232 80L250 82', 2);
    f += G('M326 222C340 210 360 214 364 232', 2);
    // eye, teeth, claws
    f += `<path d="M234 86L246 84L242 90Z" fill="url(#white)" stroke="${INK}" stroke-width="2"/>`;
    f += G('M204 97l3 4l3-4l3 4l3-4M206 110l3-3l3 3l3-3', 1.5, '#fff6e0');
    f += G('M250 270l-4 6M260 270l-2 6M270 270l0 6M336 266l-2 6M348 264l0 6', 2.5, '#fff6e0');
    f += I.flush();
    // back spikes
    f += `<g fill="url(#gold)" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"><path d="M270 120L286 112L280 128Z"/><path d="M282 140L300 134L292 148Z"/><path d="M330 142L340 126L344 146Z"/><path d="M352 152L366 140L364 160Z"/></g>`;
    f += `</g>`;

    // ---------- the fire (secondary, lights the scene) ----------
    const flame = 'M200 100C174 114 140 136 104 160L112 148C92 160 72 172 58 188L64 176C38 190 20 212 24 238L34 228C32 248 46 264 70 268L66 256C84 268 104 266 116 256L110 246C142 220 174 168 210 112Z';
    let fire = `<g stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"><path d="${flame}" fill="url(#orange)"/>`;
    fire += `<path d="M204 104C170 130 122 168 86 198C60 214 50 236 62 250C76 258 96 250 108 238C140 206 178 150 208 108Z" fill="url(#amber)" stroke-width="2.5"/>`;
    fire += `<path d="M206 106C174 138 130 184 96 216C84 228 84 240 94 242C108 236 150 186 208 108Z" fill="url(#white)" stroke-width="2"/></g>`;
    fire += H('M188 112C164 130 134 150 112 166M176 130C150 152 124 178 102 194M46 210C40 222 40 234 46 244M150 178C132 200 116 222 104 236', 2);
    fire += G('M196 112C170 136 140 168 116 192', 2, '#fff');

    fire += I.flush();
    // ---------- the knight (small foe, black woodcut silhouette) ----------
    let k = `<g fill="${INK}"><path d="M60 254L64 234L76 234L80 254L74 254L70 242L66 254Z"/><path d="M62 236L60 216C60 210 76 210 78 216L78 236Z"/><circle cx="69" cy="206" r="6"/><path d="M66 200L56 190L70 198Z"/><path d="M60 216C48 222 40 236 36 248L56 240Z"/></g>`;
    k += `<path d="M78 212C88 208 96 208 100 210C100 224 94 234 86 240C80 232 78 224 78 212Z" fill="url(#gold)" stroke="${INK}" stroke-width="3"/>`;

    b += f + fire + k + frame('ruby');
      return b;
  },
  "Celestial Guardian": () => {
    const { Ink, INK, R, defs, burst, hatch, offset, frame, svg } = require('../art-lib/glass.cjs');
    const I = Ink();
    const H = (d, w = 1.8) => I.add(d, w);
    const G = (d, w = 2, c = '#fff4c8') => I.add(d, w, c);
    const bz = (p, t) => { const u = 1 - t; return [0, 1].map((j) => u * u * u * p[0][j] + 3 * u * u * t * p[1][j] + 3 * u * t * t * p[2][j] + t * t * t * p[3][j]); };
    const P = ([x, y]) => `${R(x)} ${R(y)}`;
    // feather strips between an upper curve A and a lower curve B
    function strips(A, B, n, cols) {
      let s = '';
      for (let i = 0; i < n; i++) {
        const s0 = i / n, s1 = (i + 1) / n;
        s += `<path d="M${P(bz(A, s0))}L${P(bz(A, s1))}L${P(bz(B, s1))}L${P(bz(B, s0))}Z" fill="url(#${cols[i % cols.length]})"/>`;
      }
      return s;
    }
    const SX = 314, SY = 258;
    let b = defs(['white', 'gold', 'amber', 'sky', 'deep', 'navy', 'violet', 'teal', 'ivory', 'pearl', 'skin', 'bronze', 'ruby', 'steel']);
    b += `<rect width="400" height="300" fill="${INK}"/><g stroke="${INK}" stroke-width="3" stroke-linejoin="round">`;
    b += burst(SX, SY, [0, 34, 78, 140, 220, 420], [12, 12, 12, 12, 8], (k, i) => [['white', 'gold'], ['gold', 'amber'], ['sky', 'pearl'], ['sky', 'deep'], ['deep', 'navy']][k][i % 2], 0.13);
    b += `<path d="M0 300V256C60 246 120 262 190 254C250 248 300 268 400 262V300Z" fill="url(#teal)"/><path d="M0 300V274C70 266 140 282 220 274C290 268 340 282 400 278V300Z" fill="url(#navy)"/></g>`;
    b += `<g fill="none" stroke="${INK}" stroke-linecap="round"><circle cx="${SX}" cy="${SY}" r="44" stroke-width="2.5" stroke-dasharray="18 7 30 8 10 6"/><circle cx="${SX}" cy="${SY}" r="58" stroke-width="2" stroke-dasharray="26 9 12 7 38 10"/></g>`;
    G('M40 120C60 116 76 122 96 118M300 60C320 56 336 62 356 58M290 120C312 116 330 122 350 118M330 170C346 166 360 172 374 168', 1.5, '#cfe6ff');
    G('M40 270C70 266 100 272 130 268M230 284C260 280 290 286 330 282', 2, '#8fe0d4');
    b += I.flush();

    // ---------- the guardian: wings folded into a shield ----------
    // curved strip panes between curve A (top) and curve B (bottom), sides bowed by `bend`
    function cstrips(A, B, n, cols, bend) {
      let s = '';
      const side = (u) => { const a = bz(A, u), c = bz(B, u); return `Q${R((a[0] + c[0]) / 2 + bend[0] * (1 - u))} ${R((a[1] + c[1]) / 2 + bend[1])} `; };
      for (let i = 0; i < n; i++) {
        const s0 = i / n, s1 = (i + 1) / n;
        s += `<path d="M${P(bz(A, s0))}L${P(bz(A, s1))}${side(s1)}${P(bz(B, s1))}L${P(bz(B, s0))}${side(s0)}${P(bz(A, s0))}Z" fill="url(#${cols[i % cols.length]})"/>`;
      }
      return s;
    }
    const FA = [[154, 136], [126, 130], [88, 120], [58, 128]], FB = [[160, 282], [120, 256], [70, 210], [58, 128]];
    const far = `M140 108C122 82 104 56 84 36C62 62 52 96 58 128C${P(FB[2])} ${P(FB[1])} ${P(FB[0])}L154 136Z`;
    const NA = [[166, 136], [196, 132], [232, 122], [260, 112]], B = [[164, 282], [200, 260], [244, 214], [260, 112]];
    const near = `M164 136L192 108C206 80 220 56 238 34C262 58 270 88 260 112C${P(B[2])} ${P(B[1])} ${P(B[0])}Z`;
    const halo = 'M126 64A32 32 0 1 1 190 64A32 32 0 1 1 126 64Z';
    const headP = 'M150 84C146 70 150 56 164 52C180 50 190 62 188 76C188 90 176 98 164 96Z';
    const pauld = ['M136 118C130 102 142 94 156 98C162 104 160 114 154 120Z', 'M196 118C202 102 190 94 176 98C170 104 172 114 178 120Z'];
    let f = `<g data-figure="1">`;
    f += `<g fill="${INK}" stroke="${INK}" stroke-width="10" stroke-linejoin="round"><path d="${far}"/><path d="${near}"/><path d="${headP}"/><path d="M148 92H182V120H148Z"/></g>`;
    f += `<path d="${halo}" fill="none" stroke="${INK}" stroke-width="11"/><path d="${halo}" fill="none" stroke="url(#gold)" stroke-width="5"/>`;
    f += `<g stroke="${INK}" stroke-width="3" stroke-linejoin="round">`;
    f += `<path d="M150 92H180V124H150Z" fill="url(#steel)"/>`;
    f += `<path d="${far}" fill="url(#pearl)"/>` + cstrips(FA, FB, 6, ['sky', 'pearl'], [10, 0]);
    f += `<path d="M140 108L154 136L58 128C56 98 64 68 84 36C104 56 122 82 140 108Z" fill="url(#pearl)"/>`;
    f += `<path d="${near}" fill="url(#ivory)"/>` + cstrips(NA, B, 7, ['ivory', 'gold', 'ivory', 'pearl'], [-10, 0]);
    f += `<path d="M140 112L82 74M124 92L76 92M150 132L120 70" fill="none"/>`;
    f += `<path d="M178 122L214 66M204 128L232 50M232 120L250 66M166 136q8 8 15 0q8 8 15-2q9 8 18-3q9 8 18-4q8 6 16-4M154 136q-8 8-16 0q-9 8-18-2q-9 7-18-3q-9 6-18-2q-8 5-14-2" fill="none"/>`;
    f += `<path d="${headP}" fill="url(#skin)"/><path d="M150 84C144 70 150 52 166 50C180 48 192 58 190 70C180 62 170 64 166 74C162 80 160 88 158 94Z" fill="url(#gold)"/>`;
    f += pauld.map((d) => `<path d="${d}" fill="url(#gold)"/>`).join('');
    // sword: pommel, crossguard and blade down the seam
    f += `<path d="M162 140H168V270L165 278L162 270Z" fill="url(#steel)"/><path d="M146 132H184V140H146Z" fill="url(#gold)"/><path d="M154 132C152 120 178 120 176 132Z" fill="url(#skin)"/><circle cx="165" cy="118" r="5" fill="url(#ruby)"/>`;
    f += `</g>`;
    // form hatching: the far wing is turned away from the dawn sun
    H(hatch(FB, 13, 5, 18, -1, { swell: true }) + hatch(FB, 8, 4, 13, -1, { tilt: 0.7, t0: 0.2, t1: 0.85, swell: true }), 1.8);
    H(hatch([[84, 36], [64, 62], [56, 96], [58, 128]], 6, 4, 13, 1), 1.8);
    for (let i = 1; i < 7; i++) { const a = bz(NA, i / 7), c = bz(B, i / 7); H(hatch([c, [c[0] + (a[0] - c[0]) * .2, c[1] + (a[1] - c[1]) * .2], [c[0] + (a[0] - c[0]) * .5, c[1] + (a[1] - c[1]) * .5], [c[0] + (a[0] - c[0]) * .7, c[1] + (a[1] - c[1]) * .7]], 5, 3, 8, 1, { t0: .1, t1: .7, tilt: -0.5 }), 1.4); }
    H('M152 70l6 0M151 78l6 1M152 86l6 2', 1.5);
    H('M176 74q3 2 6 0', 2);
    // gouged light on the sun-facing edges
    G(offset(B, 9, 1, 8, 0.12, 0.9), 2.5);
    G(offset([[238, 34], [262, 58], [270, 88], [260, 112]], 8, -1, 5, 0.15, 0.9), 2.5);
    G('M178 60l6 6', 2, '#fff');
    f += I.flush() + `</g>`;
    b += f + frame('ruby');
      return b;
  },
  "Fireball": () => {
    const { Ink, INK, defs, burst, hatch, offset, frame, svg, pt } = require('../art-lib/glass.cjs');
    const I = Ink();
    const H = (d, w = 1.8) => I.add(d, w);
    const G = (d, w = 2, c = '#ffe9b0') => I.add(d, w, c);
    const CX = 170, CY = 184;
    let b = defs(['white', 'gold', 'amber', 'orange', 'red', 'ruby', 'wine', 'violet', 'deep', 'navy', 'teal', 'bronze']);
    b += `<rect width="400" height="300" fill="${INK}"/><g stroke="${INK}" stroke-width="3" stroke-linejoin="round">`;
    b += burst(CX, CY, [0, 50, 92, 170, 460], [12, 12, 12, 7], (k, i) => [['orange', 'amber'], ['wine', 'violet'], ['deep', 'navy'], ['navy', 'violet']][k][i % 2], 0.2);
    // ground panes, lit near the impact
    b += `<path d="M0 300V238C40 232 80 240 120 236C170 232 220 246 270 240C320 234 360 244 400 238V300Z" fill="url(#teal)"/>`;
    b += `<path d="M0 300V264C60 256 110 272 170 266C230 260 280 276 340 268C370 264 390 268 400 266V300Z" fill="url(#navy)"/></g>`;
    b += `<g fill="none" stroke="${INK}" stroke-linecap="round"><circle cx="${CX}" cy="${CY}" r="58" stroke-width="2.5" stroke-dasharray="20 7 30 9 12 6"/><circle cx="${CX}" cy="${CY}" r="72" stroke-width="2" stroke-dasharray="14 10 28 8 40 12"/></g>`;
    // carved stars and ground gouges
    G('M40 60h8M44 56v8M100 40h6M103 37v6M60 120h6M63 117v6M250 270C280 266 310 272 344 268M30 282C60 278 90 284 130 280', 2, '#cfe0ff');
    H(hatch([[20, 242], [80, 236], [200, 248], [380, 240]], 30, 6, 6, 1, { t0: 0.02, t1: 0.98, tilt: 0.5, inset: -14 }), 1.6);
    b += I.flush();

    // ---------- the fireball and its streaming flame tongues ----------
    const D = [0.83, -0.56], N = [0.56, 0.83];
    function tongue(off, L, w, amp, ph) {
      const l = [], r = [], K = 7;
      for (let i = 0; i <= K; i++) {
        const t = i / K, wt = w * Math.pow(1 - t, 0.9) + 0.5, o = off + amp * Math.sin(t * 7 + ph) * t;
        const cx = CX + D[0] * (8 + t * L) + N[0] * o, cy = CY + D[1] * (8 + t * L) + N[1] * o;
        l.push([cx - N[0] * wt, cy - N[1] * wt]); r.unshift([cx + N[0] * wt, cy + N[1] * wt]);
      }
      const P = l.concat(r), m = (a, b) => `${Math.round((a[0] + b[0]) / 2)} ${Math.round((a[1] + b[1]) / 2)}`;
      let d = `M${m(P[0], P[1])}`;
      for (let i = 1; i < P.length; i++) d += `Q${Math.round(P[i][0])} ${Math.round(P[i][1])} ${m(P[i], P[(i + 1) % P.length])}`;
      return d + 'Z';
    }
    const T = [
      [tongue(-26, 230, 16, 10, 0), 'red'], [tongue(26, 170, 16, 12, 2), 'red'],
      [tongue(-8, 270, 22, 8, 1), 'orange'], [tongue(10, 210, 18, 10, 3), 'orange'],
      [tongue(0, 190, 11, 6, 0.5), 'gold'],
    ];
    let f = `<g data-figure="1">`;
    f += `<g fill="${INK}" stroke="${INK}" stroke-width="9" stroke-linejoin="round">${T.map(([d]) => `<path d="${d}"/>`).join('')}<circle cx="${CX}" cy="${CY}" r="38"/></g>`;
    f += `<g stroke="${INK}" stroke-width="3.5" stroke-linejoin="round">${T.map(([d, c]) => `<path d="${d}" fill="url(#${c})"/>`).join('')}`;
    // ball: amber shell, gold heart and white core pushed toward the direction of travel
    f += `<circle cx="${CX}" cy="${CY}" r="36" fill="url(#amber)"/><circle cx="${CX - 4}" cy="${CY + 3}" r="25" fill="url(#gold)" stroke-width="2.5"/><circle cx="${CX - 7}" cy="${CY + 5}" r="13" fill="url(#white)"/>`;
    f += `<path d="M136 196L148 194M146 214L154 206M166 224L168 212M192 166L200 152M178 156L180 146" fill="none" stroke-width="3"/>`;
    f += `</g>`;
    // carved form hatching on the shadow (upper) edge of the tongues and shell; gouged light through the cores
    for (const [o, L] of [[-26, 230], [-8, 270], [26, 170]]) {
      const a = [CX + D[0] * 40 + N[0] * (o - 14), CY + D[1] * 40 + N[1] * (o - 14)], e = [CX + D[0] * (L * 0.8) + N[0] * (o - 6), CY + D[1] * (L * 0.8) + N[1] * (o - 6)];
      H(hatch([a, [a[0] + (e[0] - a[0]) / 3, a[1] + (e[1] - a[1]) / 3], [a[0] + (e[0] - a[0]) * 2 / 3, a[1] + (e[1] - a[1]) * 2 / 3], e], 8, 11, 4, -1, { tilt: 0.6, inset: 0 }), 2);
    }
    H(hatch([[140, 172], [146, 154], [166, 146], [186, 148]], 6, 6, 4, -1, { tilt: 0.3 }), 1.8);
    G(`M${CX + 6} ${CY - 4}L${CX + 150} ${CY - 100}`, 2.5, '#fffbe6');
    f += I.flush() + `</g>`;

    // ---------- the fleeing figure (black woodcut silhouette, rim-lit by the blast) ----------
    let k = `<path d="M56 206C76 196 100 194 124 198L110 208L128 218C106 222 84 222 66 226Z" fill="url(#gold)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
    k += `<g fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><path d="M66 228L48 240L30 248M66 228L84 242L96 258M56 208L40 212L28 204M58 208L74 214L86 206"/><path d="M66 230L54 206" stroke-width="15"/></g><circle cx="48" cy="196" r="9" fill="${INK}"/>`;
    G('M56 190C60 194 60 200 58 202M66 212L72 228M86 244L94 254', 2.5, '#ffc85a');
    k += I.flush();
    // flying debris
    k += `<g fill="url(#amber)" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"><path d="M118 210l6-6l5 7l-6 5Z"/><path d="M212 222l5-7l6 5l-5 7Z"/><path d="M134 186l4-5l4 5l-4 4Z"/></g>`;
    b += f + k + frame('ruby');
      return b;
  },
});
