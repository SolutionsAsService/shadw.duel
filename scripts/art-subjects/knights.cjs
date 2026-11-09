'use strict';
// Knights, angels and the lantern bearer (GDADA run 2 redraw).
// Each humanoid is built from tapered, jointed limbs (limb()) so arms and legs
// have thickness, bend at the knee and elbow, and carry weight.
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
  const plate = (pts) => limb(pts, 'url(#metal)', 'stroke="var(--mid)" stroke-width="1.6"');
  const coin = (x, y) => circle(x, y, 6, 'url(#metal)', 'stroke="var(--glow)" stroke-width="1.5"');

  return {
    // Heavy plate, wide stance, burning blade raised high and a flame banner: rallying the flame line.
    'Inferno Knight': () =>
      p('M118 34Q92 28 66 40Q84 52 60 62Q86 72 64 86Q92 88 76 106Q100 100 118 110Z', 'var(--glow)') +
      p('M118 46Q102 42 88 50Q98 60 86 70Q102 74 94 88Q106 88 118 96Z', 'url(#flare)') +
      thick('M120 30V262', 6, 'url(#metal)') + circle(120, 28, 6, 'var(--white)') +
      plate([[172, 166, 15], [146, 212, 12], [132, 252, 10]]) + plate([[208, 166, 15], [234, 210, 12], [248, 252, 10]]) +
      armor('M136 202 156 204 156 222 136 222Z') + armor('M226 200 246 202 246 220 226 220Z') +
      armor('M118 246 146 246 152 262 108 262Z') + armor('M236 246 262 246 276 262 232 262Z') +
      armor('M156 154H224L232 190 208 182 190 194 172 182 148 190Z') +
      armor('M148 96Q190 82 234 96L226 136Q220 158 214 164H166Q160 158 154 136Z') +
      line('M190 94V158M160 120Q190 130 220 120', 2) + p('M190 108Q178 124 190 142Q202 124 190 108Z', 'var(--glow)') +
      plate([[150, 106, 12], [132, 134, 10], [122, 150, 9]]) +
      p('M276 52Q258 20 288 4Q284 -4 300 -10Q304 12 324 4Q318 30 296 54Z', 'url(#flare)', 'opacity=".85"') +
      plate([[230, 106, 12], [262, 84, 10], [280, 54, 9]]) +
      armor('M283 38 312 -2 318 2 291 44Z') +
      thick('M271 37 297 55', 6, 'url(#metal)') + circle(280, 54, 9, 'url(#metal)') + circle(121, 150, 9, 'url(#metal)') +
      armor('M126 114Q128 84 160 86L168 112Q146 102 126 114Z') + p('M134 94 116 72 146 88Z', 'url(#metal)') +
      armor('M254 114Q252 84 220 86L212 112Q234 102 254 114Z') + p('M246 94 264 72 234 88Z', 'url(#metal)') +
      armor('M174 86H206L210 98H170Z') +
      p('M186 42Q174 20 190 2Q190 22 206 16Q196 30 202 44Z', 'var(--glow)') +
      armor('M170 52Q190 36 210 52L212 80Q190 96 168 80Z') + p('M174 62H206L204 72H176Z', dark) +
      eye(183, 67, 2.4) + eye(197, 67, 2.4),

    // Kneeling knight, shield planted, one hand lifting a blessing of light toward the next ally.
    'Radiant Knight': () =>
      p('M170 110Q120 150 112 250H180L188 122Z', 'var(--mid)') +
      plate([[172, 182, 15], [158, 238, 12], [114, 250, 9]]) +
      plate([[196, 184, 15], [234, 186, 13], [240, 246, 10]]) +
      armor('M226 174 246 176 246 196 226 196Z') + armor('M230 242H256L268 258H226Z') +
      armor('M162 112Q190 100 218 112L212 152Q206 176 200 182H176Q168 176 166 152Z') +
      p('M170 158H208L214 214 190 206 168 214Z') + p('M189 168 197 180 189 192 181 180Z', 'var(--glow)') +
      line('M190 114V150M168 132Q190 140 212 132', 2) +
      plate([[166, 120, 11], [150, 150, 9], [144, 170, 8]]) +
      armor('M90 118Q118 108 146 118L144 188Q132 228 118 244Q104 228 92 188Z') +
      circle(118, 160, 14, 'var(--mid)') + circle(118, 160, 8, 'var(--glow)') + line('M118 128V142M118 178V192M98 160H104M132 160H138', 2) +
      plate([[212, 120, 11], [244, 132, 9], [270, 114, 8]]) +
      p('M262 118Q262 98 270 92Q280 94 282 104L278 120Z', 'url(#metal)') +
      circle(288, 78, 30, 'url(#flare)', 'opacity=".8"') + star(288, 78, 14) +
      circle(288, 78, 22, 'none', 'stroke="var(--white)" stroke-width="1.5" stroke-dasharray="3 5"') +
      line('M288 38V50M288 106V116M248 78H258M318 78H330', 3) +
      line('M308 92Q336 104 346 140', 2, 'stroke-dasharray="2 6"') + star(346, 146, 6) + star(330, 122, 4) +
      circle(192, 82, 32, 'none', 'stroke="var(--white)" stroke-width="3" opacity=".7"') +
      p('M180 70 146 40 160 64 138 60 170 82Z', 'var(--white)') +
      armor('M176 70Q192 56 208 70L210 96Q192 108 176 96Z') + p('M182 80H204V86H196V98H190V86H182Z', dark) +
      eye(187, 83, 2) + eye(199, 83, 2),

    // Lean sellsword in studded leather, axe grounded, tipping out a purse of coin.
    'Ironclad Mercenary': () =>
group(
      p('M120 262Q150 242 182 262Z', 'url(#metal)') + coin(140, 254) + coin(156, 250) + coin(170, 256) +
      thick('M318 96 336 256', 7, 'var(--mid)') + line('M321 112 334 240', 2) +
      armor('M322 84Q350 70 366 90Q356 114 346 134Q338 116 326 112Z') + armor('M316 82 324 76 330 108 322 112Z') +
      limb([[240, 174, 14], [226, 214, 11], [212, 248, 9]]) + limb([[262, 174, 14], [276, 214, 11], [284, 248, 9]]) +
      p('M198 236H226L230 262H190Q188 248 198 236Z', 'var(--mid)') + p('M272 236H296L306 262H270Z', 'var(--mid)') +
      p('M224 104Q254 94 284 104L288 150Q286 176 282 186H228Q222 170 224 150Z') +
      line('M232 130H282M230 152H286', 1.5, 'opacity=".7"') +
      p('M224 168H288V178H224Z', dark) + p('M250 166H262V180H250Z', 'url(#metal)') +
      p('M266 176 284 176 286 202 268 202Z', 'var(--white)') +
      limb([[282, 112, 11], [306, 142, 9], [320, 124, 8]]) + circle(320, 124, 8) +
      armor('M268 98Q298 90 304 118L284 126Q282 110 268 106Z') +
      limb([[230, 114, 11], [204, 142, 9], [176, 132, 8]]) + circle(174, 132, 8) +
      p('M162 134Q180 128 186 138Q190 158 174 164Q158 160 162 140Z', 'var(--mid)') + line('M166 140Q176 136 184 140', 2) +
      coin(162, 180) + coin(150, 200) + coin(158, 222) + coin(146, 240) +
      p('M232 94Q234 54 256 50Q278 54 280 94Q256 104 232 94Z', 'var(--mid)') +
      p('M244 68Q256 60 268 68L268 88Q256 98 244 88Z') +
      armor('M234 66Q256 34 278 66Z') + armor('M253 62H259V82H253Z') +
      eye(248, 74, 2) + eye(264, 74, 2) +
      line('M228 112Q224 140 228 166M240 60Q248 48 258 44', 3, 'opacity=".8"'), 'translate(236 160) scale(1.1) translate(-236 -160)'),

    // Coat-tailed fencer in a deep diagonal lunge, rapier driven out to the right.
    'Wandering Duelist': () =>
      line('M40 150H96M50 176H112M60 124H104', 2, 'opacity=".5"') +
      p('M174 150Q130 182 82 198Q120 208 150 202Q132 224 110 244Q162 232 188 190Z', 'var(--mid)') +
      limb([[172, 178, 14], [122, 214, 11], [74, 248, 9]]) + p('M56 240 82 236 90 260H50Z', 'var(--mid)') +
      limb([[190, 180, 15], [238, 196, 12], [244, 246, 10]]) + p('M230 236H258L270 262H226Z', 'var(--mid)') +
      p('M186 108Q212 98 234 112L224 156Q212 182 198 188H168Q162 164 176 134Z') +
      p('M210 112 222 160 200 186Z', 'var(--mid)') + line('M196 112 210 150M216 110 222 132', 2) +
      p('M166 170Q190 162 208 172L206 182Q186 176 168 182Z', 'var(--glow)') +
      p('M214 104Q182 98 150 114Q176 118 212 114Z', 'var(--glow)', 'opacity=".85"') +
      limb([[198, 118, 9], [170, 96, 8], [160, 70, 7]]) + circle(160, 66, 6) +
      limb([[224, 116, 10], [262, 114, 8], [296, 110, 7]]) + circle(298, 110, 7) +
      armor('M304 106 382 92 386 94 304 114Z') + p('M294 96Q314 102 306 122Q296 120 290 110Z', 'url(#metal)') +
      p('M216 80Q230 70 242 82Q246 92 240 100L230 108Q218 102 216 90Z') + eye(236, 88, 2.2) +
      line('M232 100H240', 1.5) +
      p('M210 60Q170 40 136 50Q172 54 208 70Z', 'var(--glow)') +
      p('M206 74Q208 50 228 50Q244 54 242 72Z', 'var(--mid)') +
      p('M186 78Q226 58 270 74Q232 84 186 78Z', 'var(--mid)', 'stroke="var(--glow)" stroke-width="1.5"'),

    // Diving angel: wings swept back, both hands driving a sun-blade down; light bursts at the kill.
    'Sunblade Angel': () => group(
      p('M208 124Q196 70 238 16Q236 48 256 50Q246 70 270 76Q256 98 278 108Q256 122 232 132Z', 'var(--glow)', 'opacity=".75"') +
      p('M204 128Q160 70 56 24Q66 58 90 70Q72 86 104 96Q92 112 130 116Q126 132 196 146Z', 'var(--glow)') +
      p('M200 132Q166 92 104 62Q140 92 132 104Q160 116 196 140Z', 'var(--white)', 'opacity=".5"') +
      limb([[166, 116, 13], [128, 96, 10], [92, 80, 8]]) +
      p('M198 96Q160 86 120 70Q132 92 124 110Q150 116 148 140Q180 134 200 126Z', 'url(#metal)') +
      armor('M176 106Q200 100 214 112L238 132Q234 154 222 162Q196 150 178 132Z') +
      p('M262 188Q310 210 358 266Q300 238 260 196Z', 'url(#flare)', 'opacity=".6"') +
      armor('M263 185 281 201 348 256 352 262 340 256Z') +
      limb([[228, 134, 10], [252, 166, 9], [266, 186, 8]], 'url(#metal)') + limb([[216, 152, 10], [244, 176, 9], [262, 190, 8]], 'url(#metal)') +
      thick('M250 204 286 174', 6, 'url(#metal)') + circle(266, 189, 9, 'url(#metal)') +
      p('M238 126Q218 110 194 82Q216 96 232 96Q220 78 226 66Q240 96 260 124Z', 'var(--glow)') +
      circle(250, 140, 22, 'none', 'stroke="var(--white)" stroke-width="3" opacity=".8"') +
      p('M236 128Q252 120 262 134Q264 150 250 156Q236 152 234 140Z') + eye(252, 140, 2.6) +
      circle(348, 256, 26, 'url(#flare)', 'opacity=".55"') + star(348, 256, 14), 'translate(200 150) scale(1.12) translate(-210 -160)'),

    // Frontal sentinel whose great wings fold forward into a shield; a barrier dome over all.
    'Celestial Guardian': () =>
      p('M44 258Q40 20 200 14Q360 20 356 258', 'none', 'stroke="var(--glow)" stroke-width="3" stroke-dasharray="10 8" opacity=".6"') +
      circle(200, 80, 32, 'none', 'stroke="var(--white)" stroke-width="3" opacity=".8"') +
      armor('M168 112Q200 98 232 112L226 176H174Z') + line('M200 108V170', 2) +
      p('M168 118Q120 70 90 30Q58 84 60 150Q62 210 104 250Q150 262 198 254L198 172Q170 160 168 118Z') +
      p('M232 118Q280 70 310 30Q342 84 340 150Q338 210 296 250Q250 262 202 254L202 172Q230 160 232 118Z') +
      p('M76 178Q124 198 198 194L198 254Q140 264 104 250Q84 228 76 178ZM324 178Q276 198 202 194L202 254Q260 264 296 250Q316 228 324 178Z', 'var(--mid)') +
      line('M92 60Q100 120 140 166M74 120Q90 170 150 194M308 60Q300 120 260 166M326 120Q310 170 250 194', 2) +
      line('M96 214Q150 230 196 224M304 214Q250 230 204 224M112 240Q160 250 196 246M288 240Q240 250 204 246', 2, 'opacity=".7"') +
      plate([[172, 120, 10], [166, 146, 9], [192, 154, 8]]) + plate([[228, 120, 10], [234, 146, 9], [208, 154, 8]]) +
      armor('M196 162H204L202 196H198Z') + thick('M182 162H218', 5, 'url(#metal)') + circle(200, 152, 10, 'url(#metal)') +
      gem(200, 150, 8) +
      armor('M156 120Q160 100 180 104L184 120Z') + armor('M244 120Q240 100 220 104L216 120Z') +
      p('M188 70Q200 60 212 70L210 96Q200 104 190 96Z') +
      armor('M184 80Q182 54 200 48Q218 54 216 80L210 72Q200 62 190 72Z') + p('M200 40 194 52H206Z', 'var(--white)') +
      eye(195, 84, 2.2) + eye(205, 84, 2.2),

    // Small hooded pilgrim walking into a wide dark, lantern held out on a crook; light falls as healing motes.
    'Lantern Bearer': () => group(
      circle(130, 124, 50, 'url(#flare)', 'opacity=".6"') +
      p('M66 260Q130 238 196 260Z', 'var(--glow)', 'opacity=".45"') +
      limb([[230, 216, 10], [214, 238, 8], [200, 254, 7]]) + limb([[262, 216, 10], [278, 238, 8], [292, 254, 7]]) +
      p('M186 252H208L212 262H182Z', 'var(--mid)') + p('M284 250H302L310 262H282Z', 'var(--mid)') +
      p('M262 112Q292 106 294 134L290 172Q274 178 262 170Z', 'var(--mid)') +
      p('M214 100Q236 84 258 98Q272 120 272 150Q284 200 298 246L250 252 220 246Q214 200 212 160Q200 130 214 100Z') +
      p('M258 100Q272 120 272 150Q284 200 298 246L262 250Q264 180 252 120Z', 'var(--mid)') +
      thick('M178 262 164 96Q162 72 142 74Q126 78 130 92', 6, 'url(#metal)') + line('M130 92V104', 2) +
      armor('M118 104H142L146 112V136L140 144H120L114 136V112Z') + circle(130, 124, 9, 'var(--white)') +
      limb([[228, 124, 9], [198, 142, 8], [170, 132, 7]]) + circle(167, 130, 7) +
      p('M208 106Q212 76 238 74Q262 78 262 104Q256 120 238 122Q218 122 208 106Z') +
      p('M210 100Q220 88 236 92L236 114Q220 118 210 108Z', dark) + eye(222, 103, 2.4), 'translate(190 160) scale(1.1) translate(-190 -164)'),
  };
};
