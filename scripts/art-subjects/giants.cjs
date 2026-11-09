'use strict';
// Giants family (GDADA run 2): nine guard/giant cards, each with its own silhouette
// and a picture of its ability.
module.exports = ({ p, line, circle, group, armor, gem, eye, star, dark, thick }) => {
  const gear = (cx, cy, r, n) => {
    let d = '';
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const pt = (rr, da) => `${Math.round(cx + rr * Math.cos(a + da))} ${Math.round(cy + rr * Math.sin(a + da))}`;
      d += `${i ? 'L' : 'M'}${pt(r, -0.16)} ${pt(r + 12, -0.1)} ${pt(r + 12, 0.1)} ${pt(r, 0.16)} `;
    }
    return d + 'Z';
  };
  return {
    // Squat and hunched: a kneeling boulder whose back sprouts new stone in the dawn light.
    'Stone Guardian': () =>
      line('M30 40 132 104M58 26 168 92M20 84 112 128', 3, 'opacity=".45"')
      + p('M70 258Q58 196 98 148Q138 94 200 88Q266 86 300 128L314 170Q300 214 262 226L240 258Z')
      + p('M84 242Q140 196 236 212L244 258H78Z', 'var(--mid)')
      + p('M98 150Q140 100 200 94Q170 112 150 140Q120 150 98 150Z', 'var(--glow)', 'opacity=".5"')
      + armor('M118 122 130 74 148 114ZM150 104 170 46 190 98ZM196 92 216 58 230 98ZM238 102 262 76 264 118Z')
      + p('M170 46 176 96 190 98ZM216 58 220 94 230 98ZM130 74 136 116 148 114Z', 'var(--white)', 'opacity=".55"')
      + line('M106 160Q190 120 290 146M96 196Q180 160 284 186', 2.5)
      + line('M170 220Q186 200 210 206', 2, 'opacity=".6"')
      + p('M282 140Q332 148 338 200L344 260H292L298 210Q290 186 272 170Z', 'url(#body)')
      + p('M300 200Q322 206 336 230L340 260H300Z', 'var(--mid)')
      + armor('M286 236H348L352 262H282Z')
      + line('M300 248H340M316 236V262', 1.5)
      + p('M258 130Q262 102 290 102Q316 106 318 134Q314 156 290 160Q264 156 258 130Z', 'url(#body)')
      + armor('M256 122Q284 106 322 120L318 132Q288 124 258 134Z')
      + eye(298, 140, 3)
      + p('M286 150 296 156 306 150 300 160H290Z', 'var(--white)'),

    // Tall and upright: an iron biped thrusting a curved wall of force forward.
    'Iron Golem': () =>
      p('M126 30Q50 150 126 270L150 262Q94 150 150 38Z', 'var(--glow)', 'opacity=".55"')
      + p('M126 30Q50 150 126 270', 'none', 'stroke="var(--white)" stroke-width="4"')
      + line('M104 70 120 90 104 112 120 132 104 154 120 176 104 198 120 220 104 240M120 90 140 86M120 132 140 130M120 176 138 176M120 220 140 222', 2, 'opacity=".75"')
      + p('M68 80Q40 150 68 222M48 110Q34 150 48 192', 'none', 'stroke="var(--glow)" stroke-width="2.5" opacity=".5"')
      + armor('M212 186 202 222 198 262H230L234 224 242 192Z')
      + armor('M252 192 260 224 262 262H294L286 222 276 186Z')
      + armor('M194 262H234V272H190ZM258 262H298L302 272H256Z')
      + circle(220, 222, 7, 'var(--mid)') + circle(272, 222, 7, 'var(--mid)')
      + armor('M284 96Q310 98 314 128L318 180 300 188 292 134Z')
      + armor('M294 178H324L326 206H292Z')
      + armor('M204 92Q240 78 280 92L294 150Q290 178 272 190H214Q196 178 194 150Z')
      + p('M244 92 280 92 294 150Q290 178 272 190H244Z', 'var(--mid)', 'opacity=".6"')
      + circle(244, 140, 13, 'url(#flare)')
      + line('M210 110Q244 100 276 110M206 164Q244 174 284 164', 2)
      + armor('M210 98Q178 94 160 116L146 140 164 152 182 130 214 124Z')
      + armor('M140 128H164V162H140Z')
      + armor('M268 52H282V92H268ZM208 60H220V92H208Z')
      + armor('M226 50H262L266 84 252 94H236L222 84Z')
      + p('M230 64H258L256 74H232Z', dark)
      + eye(238, 69, 2.4) + eye(250, 69, 2.4)
      + circle(212, 108, 2.5, 'var(--white)') + circle(276, 108, 2.5, 'var(--white)'),

    // Diagonal break: a crystal knight on one knee, its shoulder bursting into shards that
    // stream right and grow into a protective crystal wall.
    'Crystal Sentinel': () =>
      p('M252 262 268 160 290 262ZM282 262 308 128 334 262ZM322 262 344 182 360 262Z', 'var(--glow)', 'opacity=".75" stroke="var(--white)" stroke-width="2"')
      + p('M268 160 276 262H290ZM308 128 316 262H334ZM344 182 350 262H360Z', 'var(--white)', 'opacity=".45"')
      + p('M196 108 222 96 216 124ZM232 90 260 80 246 112ZM272 96 296 88 284 116ZM262 56 284 48 276 76Z', 'var(--glow)', 'stroke="var(--white)" stroke-width="1.5"')
      + p('M120 196 98 236 82 262H136L150 230 162 204Z', 'var(--mid)')
      + p('M166 196 222 216 230 262H196L190 236 156 222Z')
      + p('M196 252H236L240 264H192Z', 'var(--mid)')
      + p('M118 116 172 96 206 124 196 190 150 206 110 176Z')
      + p('M172 96 206 124 196 190 160 160Z', 'var(--mid)')
      + p('M118 116 172 96 160 160 110 176Z', 'var(--glow)', 'opacity=".35"')
      + p('M120 128 90 168 84 224 102 226 110 180 136 152Z', 'url(#body)')
      + p('M76 222H112L106 240H82Z', 'var(--mid)')
      + p('M140 66 168 58 186 84 170 102 142 98Z', 'url(#body)')
      + p('M150 54 162 26 170 58Z', 'var(--glow)')
      + p('M146 78 176 72 178 82 148 88Z', dark)
      + eye(166, 79, 2.8)
      + line('M160 160 182 112', 2.5),

    // Four-legged: a horned beast carrying a snow-capped mountain on its back, its
    // strength spreading down into the ground around it.
    'Mountain Behemoth': () =>
      line('M30 254Q60 222 98 214M370 254Q352 232 330 226', 3, 'opacity=".6"')
      + armor('M134 216H162L166 258H130Z', 'opacity=".85"') + armor('M252 214H278L282 258H248Z', 'opacity=".85"')
      + p('M72 214Q66 162 112 148Q200 132 290 146Q334 156 342 192L346 214Q300 232 200 230Q120 230 72 214Z')
      + p('M80 206Q200 236 340 204L346 214Q300 232 200 230Q120 230 72 214Z', 'var(--mid)')
      + armor('M92 156 142 64 166 98 200 30 238 92 262 70 306 152Q200 134 92 156Z')
      + p('M200 30 206 92 238 92ZM142 64 150 110 166 98ZM262 70 270 118 306 152Z', 'var(--mid)', 'opacity=".8"')
      + p('M186 54 200 30 216 56 206 50 200 60 194 50Z', 'var(--white)')
      + p('M134 80 142 64 152 82 144 78Z', 'var(--white)')
      + line('M110 150 150 120 176 132 210 110 240 126 290 140', 2)
      + armor('M86 206H122L126 264H82Z') + armor('M292 206H324L328 264H288Z')
      + line('M92 236H118M298 236H322', 2)
      + p('M314 160Q348 148 368 176Q376 206 356 222L330 224Q310 200 314 160Z')
      + p('M330 206Q350 210 368 196Q366 216 356 222L330 224Z', 'var(--mid)')
      + armor('M332 162 352 120 362 128 348 170Z')
      + armor('M358 212 378 228 360 222Z')
      + eye(346, 182, 2.8),

    // Low angle, hunched forward: both fists driven into the ground, which cracks and
    // throws up rock in a shockwave.
    'Worldbreaker Titan': () =>
      p('M30 262Q200 214 370 262', 'none', 'stroke="var(--glow)" stroke-width="3" opacity=".55"')
      + line('M136 262 86 282M132 262 48 268M262 262 316 284M268 262 354 270M198 262 202 290M170 262 150 290', 3)
      + armor('M48 212 64 200 78 214 62 224ZM330 196 348 186 356 204 338 210ZM88 176 100 170 104 184 92 186ZM302 164 314 160 316 172 304 174Z')
      + p('M110 124Q118 60 200 52Q282 60 290 124Q280 172 242 192H158Q120 172 110 124Z')
      + p('M200 52Q282 60 290 124Q280 172 242 192H206Q236 130 200 52Z', 'var(--mid)')
      + p('M130 100Q150 66 196 60Q160 80 150 112Z', 'var(--glow)', 'opacity=".45"')
      + line('M150 140Q200 160 250 140M200 120V180M164 110Q180 124 200 120Q220 124 236 110', 2)
      + p('M104 114Q78 160 104 202L124 232 162 222 140 182Q130 150 148 126Z')
      + p('M296 114Q322 160 296 202L276 232 238 222 260 182Q270 150 252 126Z', 'var(--mid)')
      + armor('M102 220H168L172 262H98Z') + armor('M232 220H298L302 262H228Z')
      + line('M112 236H160M240 236H290M124 220V262M146 220V262M254 220V262M276 220V262', 1.5)
      + armor('M78 116Q84 62 144 64L152 120Q118 136 78 116Z')
      + armor('M322 116Q316 62 256 64L248 120Q282 136 322 116Z')
      + armor('M98 74 84 40 118 66ZM302 74 316 40 282 66Z')
      + p('M166 82Q200 58 234 82L232 124 200 142 168 124Z', 'url(#body)')
      + p('M200 64Q234 70 234 82L232 124 200 142Z', 'var(--mid)', 'opacity=".6"')
      + armor('M170 90 140 46 186 78ZM230 90 260 46 214 78Z')
      + armor('M166 92Q200 80 234 92L232 102Q200 92 168 102Z')
      + p('M176 104H224L218 116H182Z', dark)
      + eye(189, 110, 3.4) + eye(211, 110, 3.4)
      + p('M186 126 192 134 200 128 208 134 214 126Z', 'var(--white)'),

    // Fallen: a wrecked war-machine sprawled on the ground, raising its blazing sword to
    // whoever comes next.
    'Battle Colossus': () =>
      p('M206 246 290 236 344 250 346 262H206Z')
      + p('M206 256 346 256V262H206Z', 'var(--mid)')
      + armor('M290 236 316 230 344 246 340 258 300 254Z')
      + p('M52 262Q50 184 112 160L196 164Q236 186 228 236L218 262Z')
      + p('M150 174 196 174Q230 192 224 236L214 262H170Q190 220 150 174Z', 'var(--mid)', 'opacity=".7"')
      + thick('M52 250Q54 184 112 162L190 166', 9, 'var(--glow)')
      + line('M80 214Q140 200 210 214M100 192 120 240M150 182 160 250', 2)
      + p('M120 214 128 202 136 216 130 230Z', dark) + p('M176 196 188 190 186 206Z', dark)
      + armor('M206 200Q232 190 250 210L248 238 222 246Q204 228 206 200Z')
      + p('M220 214H244L242 222H220Z', dark) + circle(232, 218, 2.5, 'var(--glow)')
      + armor('M86 186Q90 150 126 150L140 184Q110 196 86 186Z')
      + thick('M120 176 150 124 186 88', 26, 'url(#metal)')
      + thick('M110 168 140 118 176 82', 6, 'var(--glow)')
      + circle(150, 124, 11, 'var(--mid)')
      + p('M180 92 332 14 348 44 198 116Z', 'url(#flare)', 'stroke="var(--white)" stroke-width="3"')
      + p('M192 102 336 26 342 36Z', 'var(--white)', 'opacity=".8"')
      + armor('M168 84 188 72 212 112 194 122Z')
      + armor('M174 88 160 98 172 104Z')
      + star(296, 74, 6) + star(256, 52, 5),

    // Close-up portrait: an old bearded giant with glowing runes, two rune tablets
    // rising beside him.
    'Ancient Titan': () =>
      p('M36 274Q44 188 140 160L168 210 200 274ZM364 274Q356 188 260 160L232 210 200 274Z')
      + p('M260 160Q356 188 364 274H290Q290 210 250 180Z', 'var(--mid)')
      + thick('M40 262Q46 192 138 164M360 262Q354 192 262 164', 9, 'var(--glow)')
      + thick('M42 272H358', 6, 'var(--glow)')
      + line('M70 230 92 214 86 236 108 222M300 214 318 230 330 212 342 232', 2.5)
      + p('M150 72Q150 30 200 26Q250 30 250 72L256 120Q250 150 200 158Q150 150 144 120Z')
      + thick('M150 100Q148 34 200 28Q238 30 248 60', 8, 'var(--glow)')
      + thick('M252 72 258 118', 6, 'var(--glow)')
      + p('M224 30Q250 40 250 72L256 120Q250 150 216 156Q236 100 224 30Z', 'var(--mid)')
      + p('M146 120Q156 196 200 266Q244 196 254 120Q228 150 200 152Q172 150 146 120Z', 'url(#body)', 'stroke="var(--white)" stroke-width="3"')
      + line('M172 150Q182 200 200 252M200 156V258M228 150Q218 200 200 252M160 140Q168 176 182 200M240 140Q232 176 218 200', 2)
      + armor('M144 76Q200 52 256 76L254 94Q200 74 146 94Z')
      + p('M160 100Q178 90 194 102L186 110Z M206 102Q222 90 240 100L214 110Z', 'var(--white)', 'opacity=".75"')
      + eye(181, 106, 2.6) + eye(219, 106, 2.6)
      + p('M194 108 200 130 206 108Z', 'var(--mid)')
      + line('M184 54 200 40 216 54M200 40V66', 2.5)
      + group(p('M-20 -30H20V30H-20Z', 'var(--glow)', 'stroke="var(--white)" stroke-width="3"') + p('M-10 -16H10M0 -16V16M-10 6 10 16', 'none', 'stroke="var(--mid)" stroke-width="3"'), 'translate(80 92) rotate(-12)')
      + group(p('M-20 -30H20V30H-20Z', 'var(--glow)', 'stroke="var(--white)" stroke-width="3"') + p('M-10 -16 10 -6 -10 6 10 16M0 -20V20', 'none', 'stroke="var(--mid)" stroke-width="3"'), 'translate(320 92) rotate(12)')
      + p('M58 62 80 40 102 62 96 52 80 46 64 52ZM298 62 320 40 342 62 336 52 320 46 304 52Z', 'var(--glow)'),

    // Clockwork: a round little automaton on bent jointed legs, a big gear turning
    // behind it, its glowing core lit as it reaches up for a fresh card.
    'Arcane Automaton': () =>
      p(gear(160, 140, 66, 12), 'url(#metal)', 'stroke="var(--mid)" stroke-width="2"')
      + circle(160, 140, 50, 'var(--mid)')
      + line('M110 140H210M160 90V190M125 105 195 175M195 105 125 175', 2, 'opacity=".5"')
      + thick('M140 196 122 230 136 260', 16, 'url(#metal)') + thick('M184 196 206 228 194 260', 16, 'url(#metal)')
      + circle(122, 230, 8, 'var(--mid)') + circle(206, 228, 8, 'var(--mid)')
      + armor('M118 256H152L156 266H112ZM178 256H212L216 266H174Z')
      + circle(160, 160, 46, 'url(#metal)', 'stroke="var(--mid)" stroke-width="2"')
      + p('M160 114Q206 114 206 160Q206 206 160 206Q190 180 190 150Q186 124 160 114Z', 'var(--mid)', 'opacity=".7"')
      + circle(160, 160, 24, dark, 'stroke="var(--glow)" stroke-width="3"')
      + circle(160, 160, 16, 'url(#flare)')
      + circle(154, 154, 5, 'var(--white)')
      + line('M128 132 142 142M128 190 142 180', 2)
      + thick('M194 140 236 120 262 84', 14, 'url(#metal)')
      + circle(236, 120, 7, 'var(--mid)')
      + group(armor('M-18 -26H18V26H-18Z') + p('M-12 -20H12V20H-12Z', 'var(--glow)', 'opacity=".55"') + star(0, 0, 8), 'translate(278 64) rotate(14)')
      + line('M302 40 318 28M306 72 326 74M268 30 266 12', 3, 'opacity=".7"')
      + armor('M128 120Q128 78 160 76Q192 78 192 120Z')
      + p('M140 96H180L176 108H144Z', dark) + eye(152, 102, 3) + eye(168, 102, 3)
      + thick('M160 76V56', 5, 'url(#metal)') + circle(160, 52, 7, 'var(--glow)')
      + thick('M114 168H88', 6, 'url(#metal)') + p('M88 156Q74 168 88 180Q102 168 88 156Z', 'url(#metal)'),

    // No legs: a giant torso rising out of a storm cloud, hair streaming, blasting a
    // gale that strips armour plates off whatever stands in front of it.
    'Tempest Giant': () =>
      p('M50 264Q32 232 66 214Q70 184 104 190Q118 162 152 176Q172 156 198 174Q224 158 248 178Q280 168 292 196Q328 192 332 228Q352 248 336 264Z', 'url(#body)')
      + p('M50 264Q60 236 100 240Q140 222 190 238Q240 220 290 240Q330 236 336 264Z', 'var(--mid)')
      + line('M76 216Q96 206 112 216M150 186Q170 176 190 188M248 184Q270 180 284 200', 2)
      + p('M178 76Q130 34 70 50Q104 58 114 72Q78 74 52 100Q100 98 120 104Q90 120 80 146Q140 120 180 100Z', 'var(--mid)', 'stroke="var(--glow)" stroke-width="1.5"')
      + p('M150 196Q136 140 166 114Q200 98 234 114Q266 140 252 196Z')
      + p('M210 106Q250 116 260 160L252 196H220Q238 150 210 106Z', 'var(--mid)', 'opacity=".7"')
      + line('M176 134Q200 150 226 134M196 150V188', 2)
      + p('M170 124Q130 104 112 62L96 70Q108 120 160 150Z')
      + p('M112 62 96 70 92 54 104 46Z', 'var(--mid)')
      + p('M98 36 82 76 98 76 86 112 118 64 102 64 112 36Z', 'var(--white)')
      + p('M232 120Q282 108 318 124L314 142Q278 134 242 150Z')
      + p('M316 120 334 116 336 136 314 142Z', 'var(--mid)')
      + p('M180 72Q200 58 220 72L224 100 200 114 178 100Z')
      + p('M186 84H214L212 92H188Z', dark)
      + eye(194, 88, 2.6) + eye(208, 88, 2.6)
      + line('M228 92Q296 80 362 96M244 106Q310 104 372 124M336 140Q356 150 372 150', 3, 'opacity=".8"')
      + armor('M346 70 364 62 358 82ZM350 108 370 104 362 120ZM330 160 348 164 336 176Z'),
  };
};
