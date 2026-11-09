'use strict';
// Beasts (GDADA run 2): Cinder Wolf, Void Hound, Flame Serpent, Tide Serpent,
// Deep Sea Leviathan, Abyssal Kraken, Mossback Tortoise, Gloom Mite.
module.exports = ({ p, line, circle, group, armor, gem, eye, star, dark, thick }) => {
  // A tube drawn in three values: rim shadow, lit body, glow spine.
  const tube = (d, w, spine = 3) => thick(d, w + 6, 'var(--mid)') + thick(d, w, 'url(#body)') + line(d, spine, 'opacity=".7"');
  // A fire serpent's body: dark scale edge, lit flesh, a burning belly stripe and scale ticks.
  const ftube = (d, w) => thick(d, w + 8, 'var(--mid)') + thick(d, w, 'url(#body)') + thick(d, w / 3, 'url(#flare)') + line(d, 2, 'stroke-dasharray="3 9" opacity=".9"');
  return {
    // Diagonal lunge up and to the right, jaws open, fire streaming off the back.
    'Cinder Wolf': () =>
      p('M126 168Q80 160 44 122Q76 134 84 124Q62 104 62 76Q92 118 116 132Q108 110 118 92Q130 128 150 150Z', 'url(#flare)') +
      line('M30 214 104 196M44 242 120 222M70 266 140 246', 3, 'opacity=".5"') +
      p('M140 176Q120 196 104 222L76 250 66 244 86 214Q96 184 112 166Z', 'var(--mid)') +
      p('M244 168Q258 196 280 212L292 226 280 230 264 218Q236 196 226 176Z', 'var(--mid)') +
      p('M116 156Q146 124 206 122Q248 112 270 104L294 136Q284 168 252 178Q204 196 150 200Q112 198 108 178Z') +
      p('M126 160Q156 158 168 190Q160 214 140 228L108 258 94 252 120 218Q110 196 126 160Z') +
      p('M100 252 88 264 112 262 118 254Z', 'var(--white)') +
      p('M244 158Q276 166 304 174L336 176 332 190 300 190Q266 188 236 178Z') +
      p('M334 174 354 176 340 182 356 188 336 192Z', 'var(--white)') +
      p('M140 196Q200 192 250 176Q236 190 200 196Q166 202 140 196Z', 'var(--mid)') +
      p('M192 128Q196 94 216 76Q214 100 230 90Q228 108 246 98Q242 114 258 108L250 122Z', 'url(#flare)') +
      p('M256 96Q272 72 300 78L346 72 338 88 306 100 344 106 334 120 300 126Q276 136 260 122Z') +
      p('M262 88 270 54 288 80ZM278 82 296 56 300 82Z', 'var(--mid)') +
      p('M306 100 344 106 334 120 300 124Z', dark) +
      p('M310 100 314 108 318 99 324 106 328 98 334 104 340 98ZM306 122 312 114 318 122 324 114 330 120Z', 'var(--white)') +
      line('M150 170Q170 148 204 146M222 142Q246 150 262 164M126 170Q144 184 148 204', 2, 'opacity=".6"') +
      line('M262 96Q282 86 304 86', 2, 'opacity=".7"') +
      eye(288, 92, 3.2) +
      circle(360, 96, 14, 'url(#flare)', 'opacity=".7"'),

    // Seated and howling upward while the hindquarters dissolve into void smoke.
    'Void Hound': () =>
      [[116, 214, 22], [86, 178, 17], [64, 138, 13], [124, 160, 12], [58, 96, 9], [92, 118, 8], [44, 64, 6]].map(([x, y, r]) =>
        circle(x, y, r, 'var(--mid)', 'opacity=".85"') + circle(x - r / 3, y - r / 3, r / 2, 'var(--glow)', 'opacity=".35"')).join('') +
      line('M140 230Q100 210 108 180Q116 156 92 140M120 250Q70 240 60 200', 3, 'opacity=".55"') +
      p('M196 196Q150 186 132 222Q128 252 176 262H210Z', 'var(--mid)') +
      p('M172 262Q160 200 186 158Q204 128 224 118L264 122Q274 160 262 200Q256 232 268 262Z') +
      p('M246 186Q258 220 254 248L250 262H232L236 246Q240 220 232 194Z', 'var(--mid)') +
      p('M258 184Q274 220 270 248L272 262H290L288 248Q290 214 274 184Z') +
      p('M270 260 296 262 292 252ZM248 260 226 262 232 252Z', 'var(--white)') +
      p('M212 134 186 126 206 146 180 152 208 160 188 174 214 172Z', 'var(--mid)') +
      p('M222 124Q212 94 230 74L268 30 280 36 268 64 294 50 300 58 274 84Q270 112 266 124Z') +
      p('M268 64 294 50 300 58 274 80Z', dark) +
      p('M228 84 192 64 218 100ZM238 76 214 50 234 92Z', 'var(--mid)') +
      line('M232 76Q250 56 270 36M228 130Q240 160 238 196M198 168Q208 200 196 236', 2, 'opacity=".6"') +
      line('M290 30Q306 14 322 24M304 44Q326 36 336 50M296 16Q300 4 314 2', 3, 'opacity=".7"') +
      eye(248, 72, 3.2),

    // Coiled tight around an armoured victim, flaming crest, head striking down.
    'Flame Serpent': () =>
      ftube('M300 252Q232 224 140 218', 22) +
      ftube('M120 176Q180 154 270 150', 22) +
      group(armor('M-32 -14H32L40 120H-40Z') +
        armor('M-22 -40Q0 -66 22 -40L26 -12H-26Z') + p('M-16 -32H16V-25H-16Z', dark) +
        p('M-20 -54 0 -84 20 -54 0 -60Z', 'var(--white)') +
        p('M0 8 14 44 0 82 -14 44Z', 'var(--mid)') + line('M-30 0 30 0', 2), 'translate(200 132) rotate(-10)') +
      ftube('M70 250Q120 266 200 250Q290 232 300 206Q306 186 260 182Q190 176 120 194Q86 202 96 180Q110 152 200 140Q280 128 290 106Q296 86 270 84', 26) +
      p('M120 180Q112 160 126 140Q130 160 142 156Q138 140 152 126Q156 148 168 144Q166 132 178 124L176 150Z', 'url(#flare)') +
      p('M210 240Q206 220 220 204Q222 222 236 220Q234 206 248 196Q250 214 262 212L256 236Z', 'url(#flare)') +
      p('M246 92Q246 58 280 50L326 54 316 66 296 70 322 80 300 92Q282 100 264 104Z') +
      p('M296 70 322 80 300 92 284 86Z', dark) +
      p('M300 72 304 80 308 72 314 80ZM294 88 300 82 306 88Z', 'var(--white)') +
      p('M252 70Q248 40 266 24Q264 46 282 36Q274 52 292 52L268 62Z', 'url(#flare)') +
      eye(276, 62, 3.4),

    // An upright wyrm guarding, fins flared, raising a curling wall of water.
    'Tide Serpent': () =>
      p('M222 262Q226 160 284 96Q318 62 352 66Q330 82 336 100Q352 84 370 92Q336 126 330 172Q326 220 344 262Z', 'var(--glow)', 'opacity=".45"') +
      line('M240 240Q246 160 290 110Q316 84 340 80M296 250Q296 180 326 130', 3, 'opacity=".7"') +
      thick('M60 262Q130 250 150 210Q160 176 140 148Q124 112 160 84', 38, 'var(--mid)') +
      thick('M60 262Q130 250 150 210Q160 176 140 148Q124 112 160 84', 30, 'url(#body)') +
      p('M164 204 196 186 180 214 204 210 176 236ZM152 148 182 126 166 158 188 158 160 176ZM148 106 170 80 166 112Z', 'var(--glow)', 'opacity=".85"') +
      line('M138 236Q154 222 160 206M142 174Q132 158 136 142M130 222Q140 208 138 196', 2, 'opacity=".6"') +
      p('M140 92Q148 58 186 56L224 66 210 78 228 88 202 98Q176 108 156 104Z') +
      p('M202 98 228 88 212 80 186 92Z', dark) +
      p('M146 70 120 36 156 60 150 26 170 58ZM150 98 112 100 148 108Z', 'var(--mid)') +
      eye(182, 72, 3.2) +
      line('M60 262Q90 250 120 256T180 252M200 262Q230 252 260 258', 3, 'opacity=".6"'),

    // A huge body diving to the lower right, jaws clamped on a small enemy it drags down.
    'Deep Sea Leviathan': () =>
      p('M64 92 30 54 38 98 22 130 70 112Z', 'var(--mid)') +
      p('M60 110Q130 60 220 86Q300 112 330 196L320 236Q290 250 270 236Q250 176 196 150Q126 128 70 136Z') +
      p('M84 132Q150 130 200 156Q250 186 268 230Q290 246 316 236Q300 250 270 244Q246 200 200 172Q140 140 84 132Z', 'var(--mid)') +
      p('M126 74 140 46 152 74ZM180 76 200 44 208 80ZM236 92 262 66 260 104ZM282 124 312 108 298 142Z', 'var(--mid)') +
      p('M200 160Q220 196 186 218 196 182 176 160Z', 'var(--mid)') +
      line('M110 120Q170 112 220 140M226 120Q270 150 290 196M140 136Q200 144 236 176', 2, 'opacity=".55"') +
      p('M330 196Q352 224 338 262L304 262Q300 248 320 236Z', dark) +
      p('M318 240 324 228 330 242 336 228 340 244Z', 'var(--white)') +
      group(p('M0 -14Q10 -18 14 -8L12 12H-12L-14 -8Q-10 -18 0 -14Z', 'var(--glow)') + thick('M-12 -2 -26 -18M12 -2 26 -20M-8 12 -16 28M8 12 18 28', 5, 'var(--glow)') + eye(-4, -6, 1.6) + eye(5, -6, 1.6), 'translate(352 236) rotate(24)') +
      eye(302, 170, 3.6) +
      [[250, 60, 6], [270, 34, 4], [300, 50, 5], [340, 120, 4], [360, 160, 3], [100, 210, 5], [130, 240, 3]].map(([x, y, r]) => circle(x, y, r, 'none', 'stroke="var(--white)" stroke-width="2" opacity=".6"')).join('') +
      line('M60 180 120 210M80 230 150 250', 3, 'opacity=".4"'),

    // Close on the mantle; tentacles crush two small enemies on either side.
    'Abyssal Kraken': () =>
      tube('M170 140Q140 200 92 196Q56 190 64 160Q76 136 100 154Q112 168 92 176M230 140Q270 196 312 186Q348 176 340 148Q330 124 306 140Q294 154 314 162', 18) +
      tube('M180 150Q170 220 120 262M220 150Q236 220 290 262M198 154Q192 210 208 266', 18) +
      p('M172 180Q160 230 126 256M228 180Q244 230 280 254M196 186Q194 220 204 256', 'none', 'stroke="var(--white)" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 14" opacity=".7"') +
      group(p('M0 -16Q12 -16 12 -2L8 14H-8L-12 -2Q-12 -16 0 -16Z', 'var(--glow)') + eye(-4, -6, 1.6) + eye(4, -6, 1.6), 'translate(82 166) rotate(-20)') +
      group(p('M0 -16Q12 -16 12 -2L8 14H-8L-12 -2Q-12 -16 0 -16Z', 'var(--glow)') + eye(-4, -6, 1.6) + eye(4, -6, 1.6), 'translate(322 152) rotate(18)') +
      star(66, 142, 12) + star(342, 128, 12) +
      p('M130 120Q118 28 200 22Q282 28 270 120Q262 156 200 160Q138 156 130 120Z') +
      p('M200 22Q282 28 270 120Q262 156 200 160Q244 120 236 70Q228 36 200 22Z', 'var(--mid)') +
      p('M150 60Q160 34 192 30Q166 44 162 72Z', 'var(--white)', 'opacity=".6"') +
      line('M156 98Q200 82 244 98M170 70Q200 58 226 70', 2, 'opacity=".55"') +
      p('M156 126Q172 112 190 124Q172 138 156 126ZM210 124Q228 112 244 126Q228 138 210 124Z', dark) +
      eye(174, 124, 4) + eye(226, 124, 4),

    // Dying, head bowed; its mossy shell spreads a shelter dome over two small allies.
    'Mossback Tortoise': () =>
      p('M196 262Q206 112 300 96Q362 100 368 180V262Z', 'var(--glow)', 'opacity=".22"') +
      p('M196 262Q206 112 300 96Q362 100 368 180V262', 'none', 'stroke="var(--white)" stroke-width="3" stroke-dasharray="8 8" opacity=".7"') +
      group(p('M-14 0Q-14 -20 0 -22Q14 -20 14 0L10 22H-10Z', 'var(--glow)') + eye(-4, -12, 1.6) + eye(5, -12, 1.6), 'translate(310 236)') +
      group(p('M-10 0Q-10 -14 0 -16Q10 -14 10 0L8 16H-8Z', 'var(--glow)') + eye(-3, -8, 1.4) + eye(4, -8, 1.4), 'translate(346 246)') +
      p('M104 192Q74 196 60 216Q40 230 40 248Q58 262 86 254Q100 238 118 222Z') +
      p('M40 248Q58 262 86 254Q96 242 104 232Q80 248 40 248Z', 'var(--mid)') +
      line('M50 236Q56 240 62 236M72 220Q84 212 96 214', 2) +
      p('M108 204Q94 232 98 258H136Q132 232 144 208ZM240 204Q256 232 252 258H290Q290 230 280 204Z') +
      p('M98 258 104 264 110 258 116 264 122 258 128 264 136 258ZM252 258 258 264 264 258 270 264 276 258 282 264 290 258Z', 'var(--white)') +
      p('M84 218Q96 108 196 96Q290 104 300 218Z', 'url(#metal)', 'stroke="var(--white)" stroke-width="3"') +
      p('M112 214 132 156 192 138 252 156 276 214Z', 'var(--mid)') +
      line('M132 156 158 214M192 138V214M252 156 232 214M104 186H284', 3) +
      p('M100 140Q120 110 150 116Q140 98 166 98Q180 82 204 92Q224 84 238 100Q262 98 268 120Q290 120 292 140Q260 126 240 132Q210 116 186 128Q150 122 126 136Q110 134 100 140Z', 'var(--glow)', 'opacity=".8"') +
      p('M110 150Q112 168 104 176M150 124Q146 146 152 152M262 128Q270 146 266 160', 'none', 'stroke="var(--glow)" stroke-width="4" stroke-linecap="round" opacity=".7"') +
      thick('M196 94Q192 64 204 40', 5, 'var(--mid)') + p('M204 40Q176 36 170 54Q192 56 204 40ZM204 52Q232 40 240 58Q218 66 204 52Z', 'var(--glow)'),

    // A bloated tick, cracked open: gloom drops spray out and a drain stream leaves it.
    'Gloom Mite': () =>
      group(
        thick('M-40 -10Q-90 -40 -110 -10M-44 10Q-100 10 -116 40M-34 30Q-70 60 -70 90M40 -10Q90 -40 110 -10M44 10Q100 10 116 40M34 30Q70 60 70 90', 12, 'var(--mid)') +
        line('M-90 -32 -110 -10M-100 10 -116 40M-70 60 -70 90M90 -32 110 -10M100 10 116 40M70 60 70 90', 3) +
        p('M0 -40Q66 -40 70 30Q66 96 0 100Q-66 96 -70 30Q-66 -40 0 -40Z') +
        p('M0 -40Q66 -40 70 30Q66 96 0 100Q40 70 40 30Q36 -10 0 -40Z', 'var(--mid)') +
        p('M-40 -20Q-20 -36 0 -34Q-30 -20 -36 6Z', 'var(--white)', 'opacity=".6"') +
        line('M-50 40Q0 56 50 40M-44 70Q0 84 44 70', 2, 'opacity=".6"') +
        p('M-8 8 4 24 -6 40 8 56 -2 70', 'none', 'stroke="var(--white)" stroke-width="3"') +
        armor('M-30 -40Q-28 -66 0 -70Q28 -66 30 -40Q0 -30 -30 -40Z') +
        p('M-12 -68 -20 -92 -4 -72ZM12 -68 20 -92 4 -72Z', 'var(--white)') +
        eye(-12, -50, 3) + eye(12, -50, 3),
        'translate(214 156) rotate(-14) scale(1.05)') +
      [[150, 70, 7], [126, 44, 5], [190, 46, 6], [104, 80, 4], [270, 60, 5]].map(([x, y, r]) => p(`M${x} ${y - r * 2}Q${x + r} ${y - r / 2} ${x + r} ${y}A${r} ${r} 0 0 1 ${x - r} ${y}Q${x - r} ${y - r / 2} ${x} ${y - r * 2}Z`, 'var(--glow)')).join('') +
      line('M150 110Q110 100 90 70Q80 50 64 44', 4, 'stroke-dasharray="2 9" opacity=".9"') + star(56, 40, 12) +
      line('M290 210Q330 200 350 170', 3, 'stroke-dasharray="2 8" opacity=".7"') + star(356, 162, 8),
  };
};
