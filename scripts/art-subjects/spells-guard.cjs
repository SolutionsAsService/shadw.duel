'use strict';
// Guard and healing spells (GDADA run 2, R2): each is an event, not a badge.
// Figures use tapered, jointed limbs (limb()) so bodies have weight and pose.
module.exports = ({ p, line, circle, group, armor, gem, eye, star, dark, thick }) => {
  const r = Math.round;
  const pt = (q) => `${r(q[0])} ${r(q[1])}`;
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  // A limb through joints [[x, y, halfWidth], ...]: a smooth tapered shape with round ends.
  const limb = (pts, fill = 'url(#body)', extra = '') => {
    const L = [], R = [], n = pts.length;
    const dir = (i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], k = Math.hypot(dx, dy) || 1;
      return [dx / k, dy / k];
    };
    pts.forEach(([x, y, w], i) => { const [dx, dy] = dir(i); L.push([x - dy * w, y + dx * w]); R.push([x + dy * w, y - dx * w]); });
    const run = (S) => S.slice(1, -1).map((q, i) => `Q${pt(q)} ${pt(mid(q, S[i + 2]))}`).join('') + `L${pt(S[S.length - 1])}`;
    const [ex, ey] = dir(n - 1), [sx, sy] = dir(0), e = pts[n - 1], s = pts[0];
    const capE = [e[0] + ex * e[2] * 1.3, e[1] + ey * e[2] * 1.3], capS = [s[0] - sx * s[2] * 1.3, s[1] - sy * s[2] * 1.3];
    const Rr = R.slice().reverse();
    return p(`M${pt(L[0])}${run(L)}Q${pt(capE)} ${pt(Rr[0])}${run(Rr)}Q${pt(capS)} ${pt(L[0])}Z`, fill, extra);
  };
  const shade = (pts) => limb(pts, 'var(--mid)');
  const plate = (pts) => limb(pts, 'url(#metal)', 'stroke="var(--mid)" stroke-width="1.6"');
  const head = (x, y, rr = 14) => circle(x, y, rr) + p(`M${x - rr} ${y}Q${x - rr} ${y - rr - 4} ${x + 2} ${y - rr}Q${x - rr + 6} ${y - 4} ${x - rr} ${y}Z`, 'var(--mid)');
  const glow = (d, w) => thick(d, w, 'var(--glow)');
  const motes = (list, s = 6) => list.map(([x, y], i) => (i % 2 ? circle(x, y, 3, 'var(--white)') : star(x, y, s))).join('');
  const card = (x, y, a, s = 1) => group(armor('M-20 -28H20V28H-20Z') + p('M-14 -22H14V22H-14Z', 'var(--mid)') + star(0, 0, 9), `translate(${x} ${y}) rotate(${a}) scale(${s})`);

  return {
    // An ally's hand tips a flask; the draught pours onto the wound of a fallen fighter and light rises.
    'Healing Potion': () =>
      limb([[184, 236, 14], [232, 214, 11], [282, 250, 9]]) +
      limb([[178, 244, 14], [240, 254, 11], [300, 258, 9]], 'var(--mid)') +
      limb([[150, 180, 9], [126, 214, 8], [116, 254, 7]]) +
      limb([[182, 240, 24], [164, 206, 21], [148, 172, 16]]) +
      shade([[176, 238, 12], [168, 214, 11], [158, 190, 8]]) +
      head(138, 150, 16) + eye(146, 150, 2) +
      p('M120 140Q114 112 142 124Q132 132 136 140Z', dark) +
      line('M150 186Q170 200 168 224M190 236 230 220', 2, 'opacity=".6"') +
      p('M160 196 186 186 180 204 156 214Z', dark) + p('M164 200 180 194 176 202Z', 'var(--glow)') +
      limb([[168, 178, 7], [192, 168, 6], [204, 182, 5]]) +
      limb([[376, 40, 13], [336, 60, 11], [300, 74, 9]]) +
      group(p('M-8 -46H8V-20Q32 -8 32 16Q30 42 0 44Q-30 42 -32 16Q-32 -8 -8 -20Z', 'url(#metal)', 'stroke="var(--glow)" stroke-width="2"') +
        p('M-28 6Q0 18 28 4Q30 36 0 40Q-28 36 -28 6Z', 'var(--glow)', 'opacity=".85"') +
        p('M-10 -54H10V-44H-10Z', 'var(--mid)') + line('M-20 -4Q-24 10 -20 22', 3), 'translate(262 100) rotate(226) scale(1.3)') +
      limb([[306, 70, 8], [290, 92, 7], [272, 100, 6]]) +
      glow('M210 150Q196 166 188 176Q180 186 178 198', 9) + thick('M208 152Q196 166 190 174', 3, 'var(--white)') +
      circle(186, 188, 14, 'url(#flare)', 'opacity=".75"') +
      motes([[160, 170], [150, 120], [230, 168], [176, 128]]) +
      line('M176 172 170 150M192 166 196 146M160 178 150 160', 2, 'opacity=".7"'),

    // A forearm raised from the dark: its cut knits shut in stitches of light as a card flies into the hand.
    'Minor Restoration': () =>
      limb([[98, 244, 26], [150, 214, 25], [224, 150, 20]]) +
      shade([[104, 248, 15], [158, 222, 14], [222, 164, 10]]) +
      armor('M70 236Q94 212 120 230L114 254Q92 262 76 256Z') +
      p('M110 236Q144 204 176 186', 'none', 'stroke="#101323" stroke-width="7" stroke-linecap="round"') +
      glow('M110 236Q144 204 176 186', 3) +
      line('M118 222 126 240M132 210 142 228M146 198 156 216M160 190 170 206', 3) +
      p('M210 128Q236 112 256 132Q262 158 238 170Q214 172 206 152Z') +
      limb([[244, 128, 6], [258, 106, 5], [268, 88, 4]]) + limb([[232, 124, 6], [240, 98, 5], [246, 78, 4]]) +
      limb([[218, 128, 6], [220, 104, 5], [222, 86, 4]]) + limb([[254, 146, 6], [274, 136, 5], [290, 124, 4]]) +
      limb([[208, 144, 6], [196, 122, 5], [198, 102, 4]]) +
      line('M226 140Q240 150 250 142', 2, 'opacity=".6"') +
      card(266, 86, 24, 1) +
      line('M298 104 322 114M304 80 330 82M296 58 318 50', 4, 'opacity=".55"') +
      circle(150, 210, 30, 'url(#flare)', 'opacity=".45"') +
      motes([[98, 196], [126, 176], [176, 162], [92, 158], [150, 150]]) +
      line('M98 214 92 186M134 196 130 170', 2, 'opacity=".6"'),

    // A blade crashes down onto a raised kite shield; sparks burst at the strike and light spills over the ward.
    'Aegis': () =>
      limb([[300, 4, 14], [302, 40, 12]], 'var(--mid)') +
      group(armor('M-6 -10 6 -10 8 120 0 140 -8 120Z') + p('M0 -6 0 136 6 120 5 -6Z', 'var(--white)', 'opacity=".7"') +
        armor('M-24 -16H24V-6H-24Z') + armor('M-6 -44H6V-16H-6Z') + circle(0, -48, 7, 'url(#metal)'), 'translate(304 50) rotate(52)') +
      limb([[60, 250, 15], [96, 226, 13], [118, 252, 10]], 'var(--mid)') +
      limb([[74, 250, 20], [92, 214, 18], [104, 182, 14]]) + head(98, 160, 14) + eye(105, 160, 2) +
      armor('M132 98Q176 76 226 92L228 160Q218 214 168 252Q130 220 122 168Z') +
      p('M226 92 238 100 240 166Q230 218 168 252Q218 214 228 160Z', 'var(--mid)') +
      p('M146 110Q178 96 212 106L212 160Q204 200 170 230Q142 204 138 166Z', 'var(--mid)') +
      line('M175 104V236M140 150Q176 140 212 148', 3) + gem(176, 146, 13) +
      limb([[104, 186, 8], [130, 176, 7], [150, 168, 6]]) +
      circle(222, 104, 24, 'url(#flare)') + star(222, 104, 20) +
      line('M246 92 270 80M240 120 268 128M232 74 240 52M206 80 196 60M252 108 280 104', 3) +
      motes([[62, 136], [86, 118], [120, 196], [48, 176], [140, 252]], 7) +
      line('M58 196 50 170M80 150 76 128', 2, 'opacity=".6"'),

    // A volley of arrows slams into a curved pane of light and stops dead; behind it a guard braces, unhurt.
    'Barrier': () =>
      p('M176 54Q222 150 176 252L204 252Q252 150 204 54Z', 'var(--glow)', 'opacity=".8"') +
      line('M190 54Q236 150 190 252', 4) +
      
      [[88, 98, 186, 104], [76, 158, 204, 152], [94, 218, 196, 212]].map(([x1, y1, x2, y2]) =>
        thick(`M${x1} ${y1}L${x2} ${y2}`, 7, 'url(#metal)') +
        p(`M${x1 + 10} ${y1}l-24 -14 6 14 -6 14Z`, 'var(--mid)') +
        circle(x2 + 4, y2, 20, 'url(#flare)')
      ).join('') +
      
      group(limb([[296, 254, 11], [286, 228, 13], [298, 196, 16]], 'var(--mid)') + limb([[326, 254, 11], [324, 226, 13], [310, 196, 16]]) +
        limb([[304, 198, 20], [298, 166, 18], [292, 140, 14]]) + limb([[300, 150, 8], [318, 176, 7], [334, 166, 6]]) +
        armor('M262 146Q282 134 292 150L290 216Q278 236 262 228Z') + head(296, 120, 14) + eye(289, 119, 2), 'translate(-62 -46) scale(1.15)'),

    // Dawn breaks through the clouds: a beam falls on a fallen warrior, who stirs and lifts a hand into the light.
    'Divine Renewal': () =>
      p('M290 0H372L300 262H112Z', 'var(--glow)', 'opacity=".22"') + p('M314 0H352L262 262H176Z', 'var(--white)', 'opacity=".22"') +
      p('M262 36Q292 14 324 30Q356 18 372 40Q352 52 324 48Q296 56 262 36Z', 'var(--mid)') +
      group(limb([[132, 252, 13], [180, 246, 12], [228, 250, 9]], 'var(--mid)') + limb([[138, 244, 14], [186, 234, 12], [234, 240, 9]]) +
        limb([[130, 246, 20], [96, 236, 19], [70, 226, 15]]) + shade([[128, 254, 10], [96, 246, 10], [72, 236, 8]]) +
        head(56, 222, 14) + eye(60, 216, 2) + p('M44 214Q50 200 66 206L60 212Z', dark) +
        limb([[92, 230, 8], [118, 196, 7], [146, 166, 6]]) + limb([[148, 168, 6], [158, 152, 5]]), 'translate(-20 -74) scale(1.3)') +
      circle(186, 122, 22, 'url(#flare)', 'opacity=".8"') + star(186, 120, 14) +
      motes([[222, 150], [244, 96], [212, 196], [270, 136], [286, 64]], 7) +
      line('M184 84 176 62M206 92 218 70M160 104 142 92', 3),

    // A summoned beast claws out of the earth, and its hide hardens into stone from the ground up.
    'Stone Skin': () =>
      p('M90 262 120 250 150 260 178 242 214 254 266 244 300 260 320 262Q200 274 90 262Z', 'var(--mid)') +
      line('M110 252 128 240M240 248 262 238M168 250 176 236', 3) +
      limb([[150, 256, 22], [176, 206, 30], [210, 160, 30]]) +
      armor('M120 262 136 224 168 214 196 226 220 206 246 214 250 262Z') +
      armor('M150 220 180 196 206 206 196 228 168 234Z') + armor('M204 200 232 186 244 206 222 216Z') +
      line('M136 240 160 232 176 246M196 226 210 246M228 214 238 232', 2) +
      limb([[242, 150, 15], [272, 176, 12], [300, 198, 10]]) +
      armor('M266 168 290 182 304 204 294 214 270 196Z') +
      p('M296 206 316 214 304 220M300 198 322 202 308 210', 'var(--white)') +
      limb([[178, 156, 13], [148, 128, 11], [126, 100, 9]]) + p('M118 90 108 76 124 86 122 70 132 88Z', 'var(--white)') +
      limb([[196, 160, 24], [232, 128, 22], [260, 110, 16]]) +
      p('M236 112Q256 84 286 92Q300 104 292 122Q272 134 248 128Z') +
      p('M262 92 254 68 272 88M276 92 286 70 288 94', 'url(#metal)') + eye(276, 106, 3) +
      p('M286 116 300 120 288 124', 'var(--white)') +
      line('M184 196Q200 176 222 182M200 168Q212 154 232 160', 3, 'opacity=".8"') +
      line('M206 152 220 136M228 140 244 124', 2, 'opacity=".5"') +
      motes([[96, 220], [320, 236], [148, 190], [348, 180]], 6),

    // A wall of sea rears up before a small crab-knight; a hurled spear breaks against the curl of the wave.
    'Tidewall': () =>
      p('M150 262Q140 170 196 108Q246 52 316 46Q356 48 368 76Q340 62 312 74Q340 84 330 108Q300 100 282 126Q262 178 274 262Z', 'url(#body)', 'stroke="var(--white)" stroke-width="3"') +
      p('M168 262Q166 186 208 130Q236 98 276 92Q248 120 240 170Q234 220 246 262Z', 'var(--mid)') +
      line('M176 230Q206 196 250 200M182 196Q210 160 252 164M196 160Q224 130 262 130M214 128Q240 104 282 98', 3) +
      p('M316 46Q346 34 372 58Q350 54 340 66Q336 52 316 46ZM300 80Q314 68 328 84Q312 82 300 80Z', 'var(--white)') +
      motes([[352, 96], [134, 120], [298, 30], [362, 128]], 5) +
      line('M342 122 352 136M352 106 366 108M138 150 126 140', 2) +
      thick('M372 160 300 128', 4, 'url(#metal)') + p('M300 128 312 122 306 136Z', 'url(#metal)') +
      line('M304 112 296 100M296 136 286 146M290 122 278 120', 2) +
      p('M60 250Q58 216 92 208Q128 206 132 242Q130 258 96 260Q66 260 60 250Z', 'url(#metal)', 'stroke="var(--mid)" stroke-width="1.6"') +
      p('M72 246Q84 224 120 230Q120 252 96 254Z', 'var(--mid)') +
      limb([[118, 216, 7], [132, 190, 6], [142, 178, 5]]) + p('M136 178 148 160 152 176 144 170Z', 'url(#metal)') +
      limb([[74, 214, 7], [58, 196, 6], [48, 186, 5]]) + p('M42 186 34 170 50 176Z', 'url(#metal)') +
      thick('M86 212 82 198M102 210 104 196', 3, 'var(--mid)') + eye(82, 196, 2.4) + eye(104, 194, 2.4) +
      thick('M66 252 50 262M80 256 72 266M114 256 124 266M124 250 140 260', 5, 'var(--mid)') +
      line('M96 214Q112 220 122 232', 2, 'opacity=".6"'),

    // A gust sweeps under a fallen hero and lifts them to their feet; leaves and two cards ride the wind.
    'Second Wind': () =>
      glow('M30 262Q120 266 168 220Q206 180 262 196Q320 214 352 160', 10) +
      
      glow('M50 226Q118 220 150 176Q182 134 236 140Q290 148 318 100', 8) +
      
      p('M196 120Q246 96 296 112Q330 132 360 116Q340 150 300 146Q256 140 216 156Z', 'var(--mid)') +
      limb([[172, 196, 13], [140, 214, 11], [124, 254, 9]]) +
      limb([[186, 196, 13], [222, 214, 11], [214, 252, 9]], 'var(--mid)') +
      limb([[180, 200, 20], [182, 162, 18], [190, 128, 14]]) + shade([[186, 200, 10], [190, 168, 9], [196, 138, 7]]) +
      head(196, 104, 14) + eye(204, 102, 2) +
      limb([[188, 134, 8], [222, 104, 7], [244, 70, 6]]) +
      limb([[184, 140, 8], [156, 156, 7], [134, 146, 6]]) +
      card(286, 56, -18, 0.9) + card(106, 110, 22, 0.8) +
      p('M314 198Q330 176 348 184Q338 204 314 198ZM58 158Q72 136 92 144Q82 166 58 158Z', 'var(--glow)') +
      motes([[250, 46], [330, 92]], 7),

    // A war-horn sounds from the front rank and the line charges behind it, blades blazing brighter.
    'Rally Cry': () =>
      [[246, 194, .95], [318, 220, .72]].map(([x, y, s]) => group(
        limb([[0, 30, 8], [-22, 50, 7], [-36, 60, 6]], 'var(--mid)') + limb([[4, 30, 8], [20, 46, 7], [30, 64, 6]]) +
        limb([[2, 32, 12], [10, 4, 11], [20, -20, 9]]) + head(26, -36, 10) +
        limb([[16, -14, 5], [34, -30, 5], [44, -48, 4]]) +
        thick('M44 -48 74 -96', 6, 'url(#metal)') + circle(74, -96, 9, 'url(#flare)'), `translate(${x} ${y}) scale(${s})`)).join('') +
      line('M210 250H170M290 264H250', 3, 'opacity=".5"') +
      limb([[78, 262, 16], [70, 222, 18]], 'var(--mid)') + limb([[110, 262, 16], [104, 222, 18]]) +
      limb([[88, 228, 32], [90, 176, 30], [102, 136, 22]]) + shade([[70, 228, 14], [72, 180, 12], [82, 140, 9]]) +
      armor('M66 150Q100 130 132 150L126 176Q100 166 72 176Z') +
      head(110, 108, 20) + eye(120, 104, 2.5) + armor('M88 100Q106 78 132 96L128 104Q108 92 92 108Z') +
      p('M128 116Q160 112 190 92Q214 72 226 50L248 62Q236 90 210 110Q174 134 134 128Z', 'url(#metal)', 'stroke="var(--glow)" stroke-width="2"') +
      p('M226 50Q236 28 262 34Q270 56 248 62Z', 'var(--mid)', 'stroke="var(--glow)" stroke-width="2"') +
      line('M150 118 156 128M178 106 186 116M204 88 214 96', 2) +
      limb([[100, 150, 9], [140, 140, 8], [170, 116, 7]]) +
      line('M276 30Q290 46 278 68M292 18Q314 46 294 84M310 8Q340 48 312 100', 3) +
      star(340, 120, 8),
  };
};
