'use strict';
// Relics (GDADA run 2, R2): each relic is an object with weight, set on something in 3/4 view
// with a cast shadow, and its power visibly working on a creature of its element.
module.exports = ({ p, line, circle, group, armor, gem, eye, star, dark, thick }) => {
  const W = 'var(--white)', G = 'var(--glow)', M = 'var(--mid)', F = 'url(#flare)', B = 'url(#body)';
  const shade = (d) => p(d, dark, 'opacity=".55"');
  const flame = (x, y, s) => p(`M${x} ${y - s * 3}Q${x + s * 2} ${y - s} ${x + s} ${y + s}Q${x} ${y + s * 2} ${x - s} ${y + s}Q${x - s * 2} ${y - s} ${x} ${y - s * 3}Z`, F);
  // a small soldier for the War Banner, facing left, shield up and spear raised
  const soldier = (x, y, s, r = 0, fx = 1) => group(
    thick('M6 -4 -10 -62', 2, 'url(#metal)')
    + p('M-10 -62 -6 -74 -14 -64Z', W)
    + p('M-8 0Q-12 -20 -4 -34Q4 -40 12 -34Q18 -20 14 0Z')
    + p('M-2 0 -6 14 0 14 2 2M8 0 12 14 16 14 12 0Z', M)
    + circle(4, -42, 7, 'url(#metal)')
    + armor('M-18 -30 -4 -32 -2 -12 -10 -4 -18 -12Z'),
    `translate(${x} ${y}) rotate(${r}) scale(${s * fx} ${s})`);

  return {
    // A faceted ember on a stone altar (3/4 block, shadow to the right); a fire elemental
    // draws a stream of flame from it into its raised claw and blazes taller.
    'Ember Core': () => shade('M150 252 250 236 352 254 244 270Z')
      + p('M84 200 176 182 252 202 162 222Z', 'url(#metal)')
      + p('M84 200 162 222 162 262 84 242Z', M)
      + p('M162 222 252 202 252 240 162 262Z')
      + line('M84 214 162 236 252 216M110 230 112 250M206 226 208 246', 1.5, 'opacity=".6"')
      + p('M128 196 166 186 198 196 162 206Z', 'url(#metal)')
      + p('M144 194Q130 160 150 134Q146 116 164 100Q170 120 180 124Q196 146 186 194Z', F, 'opacity=".75"')
      + group(gem(0, 0, 28), 'translate(164 160) rotate(-12)')
      + flame(140, 120, 5) + flame(196, 112, 4) + flame(118, 160, 3)
      + thick('M184 150Q228 112 276 150', 9, F) + line('M188 148Q228 118 270 148', 2, 'stroke-dasharray="6 8"')
      + p('M300 258Q282 222 294 192Q286 166 302 146Q296 120 318 102Q320 126 330 130Q330 104 348 88Q346 120 358 140Q370 166 356 192Q366 226 346 258Z', dark, `stroke="${G}" stroke-width="2"`)
      + p('M312 252Q300 222 312 196Q310 172 326 156Q336 180 334 200Q346 226 336 252Z', F)
      + p('M322 112Q316 96 322 80Q332 96 334 112M346 98Q350 72 366 60Q362 86 356 104', F)
      + thick('M304 182Q288 168 276 150', 13, dark)
      + p('M276 150 262 140 272 152 258 152 272 160 264 168 280 160Z', W)
      + eye(316, 140, 3) + eye(334, 136, 3)
      + line('M300 210Q314 220 304 238M352 200Q342 218 350 236', 2, 'opacity=".6"'),

    // A crystal heart grown out of a dark rock in 3/4; a stone golem raises its arm and the
    // heart's light hardens into a crystal shield over it.
    'Crystal Heart': () => group(''
      + p('M60 258Q66 214 102 196L166 184Q222 188 240 224L248 258Z', dark, `stroke="${G}" stroke-width="1.5"`)
      + p('M102 196 166 184Q222 188 240 224L188 224Q160 204 102 196Z', M)
      + p('M150 190 176 186 232 214 236 224 196 224Z', dark, 'opacity=".6"')
      + line('M80 238 124 222 168 232 214 246M140 208 150 222', 1.5, 'opacity=".6"')
      + group(p('M0 50 -48 0 -50 -24 -32 -44 -10 -42 0 -26 12 -44 36 -46 52 -26 48 2Z', M, `stroke="${dark}" stroke-width="3"`)
        + p('M0 50 0 -26 12 -44 36 -46 52 -26 48 2Z', dark, 'opacity=".5"')
        + p('M-20 -8 0 -26 26 -12 0 50Z', G)
        + p('M-46 -6 -48 -24 -32 -42 -14 -38Z', W, 'opacity=".8"')
        + p('M-48 0 -20 -8 0 50Z', M, 'opacity=".6"')
        + thick('M-48 0 -20 -8 0 -26M-20 -8 0 50M0 -26 26 -12 52 -26M26 -12 48 2M26 -12 0 50', 2, dark), 'translate(158 132) rotate(-12)')
      + star(126, 106, 8)
      + p('M92 210 76 168 106 198ZM210 200 232 164 224 204ZM120 194 114 172 130 190Z', G, `stroke="${W}" stroke-width="1"`)
      + p('M282 258Q270 210 290 182Q308 150 340 156Q370 166 372 210L368 258Z', dark, `stroke="${M}" stroke-width="2"`)
      + p('M290 186Q306 156 336 158Q350 170 340 186Q314 178 290 186Z', dark)
      + p('M292 174Q290 132 322 128Q350 132 346 166Q326 180 292 174Z', dark, `stroke="${M}" stroke-width="2"`)
      + p('M330 130Q350 134 346 166Q338 172 328 172Q336 150 330 130Z', dark)
      + p('M302 146 318 144 314 154ZM328 144 338 146 332 154Z', dark) + eye(310, 149, 2.5) + eye(332, 149, 2)
      + thick('M300 210Q282 190 274 160', 20, dark)
      + armor('M246 124 284 118 300 170 284 228 250 234 238 180Z')
      + p('M246 124 284 118 268 176 238 180Z', G, 'opacity=".6"')
      + p('M250 132 266 130 252 172Z', W)
      + line('M296 224 288 248M318 196 336 206M344 228 356 244', 2, 'opacity=".6"'), 'translate(-8 0)'),

    // A black shard driven aslant into cracked ground; shadow pours from it along the
    // ground into a hooded wraith, whose claws lengthen into blades.
    'Void Shard': () => group(p('M118 240Q96 244 70 250 110 252 160 248Z', G, 'opacity=".5"')
      + line('M150 238 118 250M178 236 210 252M160 240 166 254', 2)

      + group(p('M-18 0 -30 -86 -6 -170 12 -180 28 -90 18 0Z', dark, `stroke="${W}" stroke-width="2"`)
        + p('M-6 -170 12 -180 28 -90 18 0 2 -90Z', M)
        + p('M-30 -86 -6 -170 2 -90 -14 -2Z', W, 'opacity=".25"')
        + line('M2 -90 -6 -170M2 -90 0 -2M-10 -120 6 -134 -2 -106 12 -96', 2), 'translate(164 236) rotate(16)')
      + circle(182, 148, 4, W)
      + thick('M200 232Q232 214 250 226Q270 240 284 216', 8, dark) + line('M204 230Q234 214 250 226Q268 238 282 214', 2)
      + thick('M206 170Q240 160 262 184', 6, dark) + line('M208 170Q238 162 260 182', 1.5)
      + p('M260 246Q252 196 270 160Q284 124 312 122Q338 128 342 164Q344 210 352 246L338 236 326 248 312 236 300 248 288 236 274 248Z', dark, `stroke="${G}" stroke-width="2"`)
      + p('M276 150Q290 126 312 124Q298 150 296 200Q290 226 280 246L268 246Q260 196 276 150Z', M, 'opacity=".7"')
      + p('M276 156Q286 128 312 128Q300 140 300 170Q288 174 276 156Z', dark)
      + eye(288, 152, 2.5) + eye(298, 150, 2)
      + thick('M286 186Q266 194 252 186', 11, B)
      + p('M252 186 214 160 248 180 212 182 248 190 220 202 254 194Z', W)
      + line('M300 196 306 232M320 180 324 230', 1.5, 'opacity=".6"'), 'translate(-12 0)'),

    // A pearl in an open clam on a sea rock; its tide coils out and wraps a sea turtle
    // in a curling wall of water, a shield around its shell.
    'Tidestone': () => shade('M60 252 196 246 260 260 100 266Z')
      + p('M56 258Q66 220 110 214Q160 210 190 230L204 258Z', M)
      + p('M78 210Q66 170 86 146Q92 128 110 126Q122 112 140 116Q158 108 172 122Q192 124 196 146Q214 170 206 204Q150 198 78 210Z', 'url(#metal)', `stroke="${M}" stroke-width="2"`)
      + line('M142 204 90 150M142 204 112 130M142 204 140 118M142 204 170 124M142 204 196 150', 1.5)
      + p('M76 214Q110 240 160 236Q196 230 204 206Q150 212 76 214Z')
      + p('M76 214Q140 222 204 206Q186 226 150 232Q108 234 76 214Z', M)
      + circle(140, 206, 20, G) + circle(134, 200, 8, W)
      + thick('M154 192Q196 112 268 108Q348 108 368 168Q378 234 300 244Q244 248 226 222', 14, G, ) + line('M156 188Q198 118 268 114Q342 116 362 168Q370 228 300 238', 3)
      + p('M366 166 384 150 376 174ZM292 108 302 92 304 112ZM226 222 210 230 222 210Z', W)
      + p('M236 210Q246 156 296 150Q346 152 356 204Z', 'url(#metal)', `stroke="${M}" stroke-width="2"`)
      + line('M272 156 266 204M310 152 316 204M254 180 340 180M290 168 300 186', 1.5)
      + p('M240 206Q218 190 204 202Q206 222 236 216Z')
      + eye(214, 202, 2)
      + p('M250 210Q236 226 226 244L256 232ZM330 210Q346 228 364 236L346 210Z', B)
      + circle(222, 160, 4, W) + circle(206, 140, 3, W) + circle(246, 132, 2, W),

    // A storm feather stabbed into a crag; lightning leaps from its vane to a diving hawk,
    // whose talons crackle.
    'Storm Feather': () => shade('M60 256 210 252 266 262 90 268Z')
      + p('M48 260Q60 214 90 196L118 170 150 182 176 210 200 260Z', M)
      + p('M90 196 118 170 150 182 132 206Z')
      + line('M74 230 112 214 156 226M128 190 132 206', 1.5, 'opacity=".6"')
      + thick('M132 196 268 54', 4, W)
      + p('M150 172Q176 120 222 82Q256 54 270 52Q262 90 236 116Q200 152 158 180Z')
      + p('M150 172Q200 140 268 54Q262 90 236 116Q200 152 158 180Z', M)
      + p('M146 168Q156 120 196 84Q232 56 270 52Q226 74 196 104Q168 134 146 168Z', W, 'opacity=".5"')
      + line('M170 140 190 152M186 120 208 134M204 102 224 116M222 84 240 96M168 128 184 112M186 104 202 92', 1.5)
      + p('M130 210 126 220 136 214Z', W)
      + p('M262 70 282 98 274 100 296 128 286 128 316 168 280 132 290 130 266 104 274 102Z', W)
      + group(p('M-50 -8Q-20 -36 -4 -10Q14 -40 48 -26Q22 -14 10 6L4 26 -6 8Q-24 -6 -50 -8Z', B, `stroke="${G}" stroke-width="2"`)
        + p('M-4 -10Q14 -40 48 -26Q22 -14 10 6Z', M)
        + p('M2 8 8 26 -4 18Z', W) + eye(2, -2, 2)
        + p('M-6 8 -14 22 -2 16 4 26Z', G), 'translate(316 186) rotate(-30) scale(1.6)')
,

    // A sun disc on a temple pillar, tilted in 3/4 with its thick edge; its beam falls on
    // a kneeling knight who lifts sword and shield, both lit.
    'Sun Sigil': () => shade('M70 254 172 250 230 262 96 266Z')
      + p('M92 120 152 120 156 258 88 258Z', B)
      + p('M128 120 152 120 156 258 132 258Z', M)
      + p('M80 258 168 258 172 268 76 268Z', M)
      + line('M104 132 102 250M118 132 118 250', 1.5, 'opacity=".5"')
      + p('M84 114 160 114 166 124 78 124Z', 'url(#metal)')
      + armor('M112 114 120 96 136 96 144 114Z')
      + group(p('M8 -36Q38 -30 40 2Q36 34 8 36Z', M)
        + p('M13 -63 10 -35 4 -36ZM53 -35 32 -17 28 -22ZM63 13 35 10 36 4ZM35 53 17 32 22 28ZM-13 63 -10 35 -4 36ZM-53 35 -32 17 -28 22ZM-63 -13 -35 -10 -36 -4ZM-35 -53 -17 -32 -22 -28Z', W, 'opacity=".8"')
        + p('M0 -36Q24 -32 30 0Q26 32 0 36Q-24 32 -30 0Q-24 -32 0 -36Z', F)
        + line('M0 -22Q14 -18 18 0Q14 18 0 22', 2)
        + circle(-8, -10, 9, W), 'translate(128 68) rotate(-14) scale(.8 1)')
      + p('M160 88 300 140 324 260 186 140Z', G, 'opacity=".22"')
      + p('M246 260Q236 228 254 214L272 204 300 210 304 236 316 260Z')
      + p('M276 206Q260 176 274 158Q296 146 310 164Q316 188 300 210Z')
      + armor('M272 160Q280 132 300 138Q312 146 310 166L280 168Z')
      + p('M290 150 306 150 304 156 290 156Z', dark) + eye(298, 153, 2)
      + armor('M250 178 280 176 284 214 266 236 248 214Z') + star(266, 200, 7)
      + thick('M300 182Q318 168 324 148', 11, B)
      + armor('M318 150 332 52 338 50 330 152Z') + p('M334 54 330 150 326 150Z', W)
      + armor('M308 150 342 158 340 164 306 156Z')
      + star(336, 60, 9) + star(214, 140, 5),

    // A tattered war banner planted on a hilltop, its pole casting a shadow downhill;
    // troops climb toward it with spears and shields raised.
    'War Banner': () => p('M30 264Q90 190 160 176Q230 178 280 220Q330 248 370 262Z', M)
      + shade('M152 180Q200 192 248 214L252 222 196 202 150 186Z')
      + armor('M146 186 162 40 168 40 154 186Z')
      + circle(165, 36, 6, 'url(#metal)')
      + p('M164 50Q210 34 250 54Q296 74 336 58L320 86 344 108Q300 122 258 104Q218 88 158 104Z')
      + p('M210 88Q250 92 270 108Q300 122 344 108L330 98Q296 110 262 96Q232 80 210 88Z', M)
      + line('M184 62Q200 76 194 96M240 54Q262 70 254 98M296 70 306 108', 2)
      + armor('M206 56 232 54 236 74 220 88 206 74Z') + star(220, 70, 8)
      + p('M146 184 134 190 168 190 160 184Z', dark)
      + soldier(118, 222, 1.1, 8) + soldier(76, 246, 1, 10) + soldier(250, 236, 1.05, -14, -1)
      + soldier(304, 254, .95, -10, -1),
  };
};
