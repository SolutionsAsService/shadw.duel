'use strict';
// Trick spells (GDADA run 2, R2): drawn as events, not badges.
// Draw Two, Quick Draw, Arcane Insight, Dark Bargain, Windstep,
// Undertow, Wither, Riptide, Landslide, Turning Gale.
module.exports = ({ p, line, circle, group, armor, gem, eye, star, dark, thick }) => {
  // A playing card: metal face, dark inset, a glyph; placed, turned and scaled.
  const card = (x, y, r, s = 1, glyph = '') => group(armor('M-22 -31H22V31H-22Z') + p('M-16 -25H16V25H-16Z', 'var(--mid)') + glyph, `translate(${x} ${y}) rotate(${r}) scale(${s})`);
  const limb = (d, w) => thick(d, w + 5, 'var(--mid)') + thick(d, w, 'url(#body)');
  return {
    // Two cards arc up off a deck on the ground into an open hand reaching in from the top right.
    'Draw Two': () =>
      line('M120 200Q150 110 262 86M132 214Q200 170 290 124', 3, 'stroke-dasharray="6 10" opacity=".6"') +
      group(armor('M-46 -26H46V26H-46Z') + armor('M-44 -34H44V18H-44Z') + armor('M-42 -42H42V10H-42Z') + p('M-34 -36H34V4H-34Z', 'var(--mid)') + star(0, -16, 9), 'translate(104 236) rotate(-6)') +
      card(186, 160, -28, 1.05, gem(0, 0, 11)) +
      card(250, 112, -48, 1.15, star(0, 0, 11)) +
      p('M396 6Q362 20 338 46L318 70 352 96 372 74Q392 52 400 40Z', 'var(--mid)') +
      armor('M344 34 364 52 352 66 332 48Z') +
      p('M330 56Q350 66 352 86Q348 106 326 112Q304 112 296 96Q292 76 306 62Z') +
      limb('M300 70Q282 66 268 74', 9) + limb('M296 84Q276 86 262 98', 9) + limb('M300 98Q284 108 276 124', 9) + limb('M314 110Q308 128 312 142', 9) + limb('M338 92Q342 116 330 132', 10) +
      line('M310 72Q324 80 330 96M302 90Q314 96 318 106', 2, 'opacity=".6"'),

    // A hooded rogue in a low lunge flicks one card out and a second right behind it.
    'Quick Draw': () =>
      p('M146 98Q102 118 86 166Q72 208 36 230Q86 220 108 238Q118 212 136 196Z', 'var(--mid)') +
      line('M120 128Q100 170 70 214M136 140Q122 184 104 226', 2, 'opacity=".5"') +
      limb('M142 186Q120 220 76 248', 15) + limb('M158 188Q198 204 210 246', 15) +
      armor('M62 238 86 244 82 260 50 260Z') + armor('M198 236 222 240 230 260 194 260Z') +
      p('M146 104Q172 108 178 134L170 188Q150 198 126 190L122 142Q124 112 146 104Z') +
      p('M128 150 168 158 166 188Q148 196 126 190Z', 'var(--mid)') +
      armor('M124 176 172 170 172 180 124 186Z') + armor('M132 180 140 182 130 216 124 214Z') +
      line('M100 108H140M86 124H128M96 140H122', 3, 'opacity=".5"') +
      limb('M168 122Q204 120 236 110', 12) +
      circle(244, 108, 10) +
      p('M134 98Q136 66 162 60Q186 62 190 86L180 104Q166 112 146 108Z', 'var(--mid)') +
      p('M168 78Q184 80 186 94L174 104Q160 98 168 78Z', dark) + eye(178, 88, 2) +
      card(262, 94, 24, .8, star(0, 0, 8)) +
      card(326, 70, 52, .8, star(0, 0, 8)) +
      line('M258 126 300 112M276 132 318 114M296 70 334 44', 3, 'opacity=".6"'),

    // An eye opens in the dark; three cards pour out of its gaze toward the lower right.
    'Arcane Insight': () =>
      p('M38 70Q60 40 100 36Q70 54 72 76Q40 96 30 122Q34 92 38 70ZM250 40Q284 34 300 56Q276 50 262 62Z', 'var(--mid)') +
      p('M140 128 236 104 360 230 290 270Z', 'var(--glow)', 'opacity=".22"') +
      p('M48 112Q136 30 262 92Q170 170 48 112Z', dark, 'stroke="var(--mid)" stroke-width="6"') +
      circle(158, 104, 34, 'url(#flare)') + p('M154 76Q166 104 154 132Q146 104 154 76Z', dark) +
      circle(146, 94, 6, 'var(--white)') +
      p('M40 112Q126 18 270 88L262 96Q148 46 52 108Z', 'url(#metal)') +
      p('M52 118Q140 170 256 100Q160 154 52 118Z', 'var(--mid)') +
      line('M80 76 70 52M112 60 108 34M150 52 154 26M190 56 204 32M228 70 246 50', 3) +
      card(232, 170, -18, 1, star(0, 0, 9)) +
      card(282, 206, 6, 1.1, gem(0, 0, 11)) +
      card(330, 244, 30, 1.2, star(0, 0, 10)) +
      line('M184 128 210 146M246 150 262 176M300 186 314 214', 2, 'opacity=".6"'),

    // Blood for cards: a bleeding hand rises from the lower left and a clawed shadow hand pays it two cards.
    'Dark Bargain': () =>
      p('M44 278Q48 240 86 202L130 164 156 192 112 234Q84 262 76 278Z') +
      p('M60 270Q80 246 100 222L112 234Q86 260 76 278Z', 'var(--mid)') +
      p('M126 148Q150 132 172 148Q184 168 168 188Q150 200 132 190Q116 172 126 148Z') +
      limb('M150 140Q154 118 166 108', 8) + limb('M164 146Q176 126 190 120', 8) + limb('M172 162Q192 152 204 152', 8) + limb('M128 156Q118 136 122 118', 8) +
      line('M134 160 160 176', 3) +
      p('M146 194Q156 212 150 222Q140 214 146 194ZM132 214Q144 232 138 244Q126 234 132 214ZM158 234Q168 250 160 260Q150 250 158 234Z', 'url(#flare)') +
      p('M322 34Q350 22 372 40L368 84Q346 94 326 78Z', 'var(--mid)') + p('M332 48Q350 42 362 52L358 70Q344 74 334 66Z', dark) +
      eye(342, 58, 3) + eye(356, 58, 2.5) +
      p('M366 78Q356 104 328 116L290 140 266 118 304 92Q332 78 340 70Z', 'var(--mid)', 'stroke="var(--glow)" stroke-width="3"') +
      p('M262 108Q240 120 238 144Q248 158 266 150L300 120Z', 'var(--mid)', 'stroke="var(--glow)" stroke-width="3"') +
      thick('M246 138 222 160 214 178M256 146 238 172 236 192M268 148 262 176 268 194', 7, 'var(--mid)') +
      p('M212 176 206 194 222 182ZM234 190 230 208 244 194ZM266 192 270 210 276 192Z', 'var(--white)') +
      card(214, 132, -22, .95, star(0, 0, 9)) +
      card(246, 102, 4, .95, star(0, 0, 9)) +
      line('M150 196Q180 160 206 150', 2, 'stroke-dasharray="4 8" opacity=".7"'),

    // A creature is summoned and charges in the same breath: a spearman bursts out of the rune at full run.
    'Windstep': () =>
      `<ellipse cx="96" cy="250" rx="80" ry="18" fill="none" stroke="var(--glow)" stroke-width="5"/>` +
      `<ellipse cx="96" cy="250" rx="58" ry="11" fill="var(--mid)" stroke="var(--white)" stroke-width="2"/>` +
      p('M60 246Q86 200 140 180L136 196Q100 210 84 248Z', 'var(--glow)', 'opacity=".5"') +
      p('M34 190Q90 160 160 160L156 172Q96 172 34 190ZM60 132Q110 110 176 112L170 124Q116 122 60 132Z', 'var(--glow)', 'opacity=".6"') +
      limb('M190 176Q164 196 134 196Q118 210 104 226', 14) +
      limb('M208 180Q240 196 248 222L266 252', 14) +
      armor('M256 244 280 248 284 262 252 262Z') + armor('M92 216 108 228 98 240 84 230Z') +
      p('M176 128Q206 112 236 132L222 186Q198 196 182 186Z') +
      armor('M184 128Q206 118 230 134L222 160Q202 166 186 158Z') +
      p('M164 120Q140 140 120 146Q138 124 152 112Z', 'var(--mid)') +
      armor('M222 96Q240 86 254 98L252 120Q242 128 228 124Z') + p('M240 104 254 106 252 114 238 112Z', dark) +
      p('M224 98Q206 82 196 92Q210 98 222 108Z', 'var(--glow)') +
      limb('M228 140Q250 150 270 140', 11) +
      thick('M150 166 370 100', 6, 'url(#metal)') + armor('M360 94 392 92 368 112Z') +
      p('M290 158 340 140 336 150Z', 'var(--glow)', 'opacity=".6"'),

    // An enemy beast is dragged down into a whirlpool, one claw still reaching for the sky.
    'Undertow': () =>
      `<ellipse cx="206" cy="232" rx="170" ry="40" fill="var(--mid)" stroke="var(--glow)" stroke-width="5"/>` +
      `<ellipse cx="220" cy="238" rx="56" ry="11" fill="${dark}"/>` +
      limb('M226 200Q196 160 172 112L156 72', 17) +
      p('M144 78 132 42 150 64 154 30 162 62 176 40 168 78Z', 'url(#metal)') +
      group(p('M200 236Q196 186 230 164Q262 152 280 176Q286 206 262 236Z') +
      p('M236 166Q252 136 278 140L304 152 292 168Q306 176 300 190L272 186Z') +
      p('M256 146 262 112 272 140ZM278 142 296 116 290 150Z', 'url(#metal)') +
      p('M290 172 304 176 296 190 284 184Z', dark) + eye(276, 156, 3), 'translate(0 22)') +
      thick('M120 236Q170 230 196 200Q212 172 180 140M260 240Q300 220 280 196Q262 174 230 186', 9, 'var(--glow)') +
      circle(112, 150, 7, 'var(--white)') + circle(330, 128, 6, 'var(--white)'),

    // Shadow drains a kneeling enemy: blade snapped, shield cracked, flakes of it blowing away.
    'Wither': () =>
      p('M34 50Q80 26 128 46Q112 62 138 78Q98 92 72 80Q54 98 32 92Q50 72 34 50Z', 'var(--mid)', 'stroke="var(--glow)" stroke-width="3"') +
      eye(78, 58, 3) + eye(98, 60, 2.5) +
      thick('M112 74Q170 100 200 140M126 54Q204 66 238 112M72 84Q130 136 186 158', 6, 'var(--glow)') +
      limb('M232 214Q232 240 206 250L176 254', 14) + limb('M256 212Q292 214 296 254', 14) +
      armor('M164 246 182 246 182 262 156 262Z') + armor('M288 248 312 252 310 264 284 264Z') +
      group(p('M210 132Q244 120 270 136Q286 172 276 206L240 214Q214 196 210 160Z') +
        p('M246 140Q272 150 276 184L262 206Q250 176 246 140Z', 'var(--mid)') +
        armor('M216 104Q232 88 252 98L254 126Q240 138 222 130Z') + p('M224 108 248 108 246 118 226 118Z', dark) + eye(236, 113, 2) +
        limb('M216 150Q192 176 184 206', 10) +
        armor('M268 150 306 150 304 196 286 214 266 196Z') + line('M286 152 280 172 292 184 284 206', 3), 'rotate(24 250 214)') +
      armor('M172 206 186 206 176 236 168 236Z') + armor('M130 250 150 244 144 262 124 262Z') +
      p('M300 120 312 112 310 126ZM322 136 336 132 330 144ZM312 92 322 84 322 98ZM340 106 354 104 346 116ZM330 170 342 164 340 178Z', 'var(--mid)') +
      line('M262 150 300 118M296 176 340 140', 2, 'stroke-dasharray="3 7" opacity=".7"'),

    // A rip current sweeps the line: one enemy topples backward, another's shield is torn away.
    'Riptide': () =>
      p('M30 262Q40 190 110 186Q170 184 196 214Q178 186 208 172Q250 162 270 196Q300 232 370 236V266H30Z', 'var(--mid)', 'stroke="var(--glow)" stroke-width="4"') +
      thick('M44 238Q110 214 176 236Q230 252 300 232Q340 222 366 234', 6, 'var(--glow)') +
      thick('M70 204Q100 180 132 194Q118 206 104 202', 5, 'var(--white)') +
      group(p('M196 150Q214 120 248 128L262 168Q238 186 214 178Z') +
        armor('M236 104Q250 92 266 102L268 120Q254 132 240 124Z') + eye(256, 112, 2) +
        limb('M220 176Q204 200 182 214', 11) + limb('M240 178Q248 202 236 222', 11) +
        limb('M246 140Q272 128 290 104', 10), 'rotate(38 230 180)') +
      armor('M300 62 332 56 342 90 314 102Z') + line('M308 72 332 68', 2) +
      p('M90 168Q86 140 104 130L120 132Q128 152 122 176Z') +
      armor('M98 108Q108 98 120 106V122Q108 128 98 120Z') + eye(112, 114, 1.8) +
      limb('M104 172Q92 186 70 190', 9) + limb('M116 172Q132 188 150 184', 9) +
      armor('M58 130 78 122 84 150 64 156Z') +
      line('M260 222Q300 200 340 214M60 250Q110 236 150 248', 2, 'opacity=".6"'),

    // Rock pours down the slope from the upper right and buries the enemies at its foot.
    'Landslide': () =>
      p('M370 36 370 262H160Q246 206 290 128Q324 66 370 36Z', 'url(#body)', 'stroke="var(--glow)" stroke-width="3"') +
      line('M350 70 324 132 344 180M300 160 326 220', 3, 'opacity=".6"') +
      armor('M238 112 278 96 294 132 264 154 232 142Z') +
      armor('M186 156 228 144 244 184 212 206 180 192Z') +
      armor('M290 58 322 46 334 76 308 92Z') +
      line('M222 104 196 122M174 146 150 162M282 52 258 68', 4, 'opacity=".7"') +
      limb('M88 226Q86 196 96 178', 16) + armor('M84 150Q96 138 110 148L110 168Q96 176 86 166Z') + eye(100, 158, 2) +
      limb('M90 186Q70 168 70 140', 9) + limb('M100 184Q124 170 132 146', 9) +
      p('M40 266Q50 228 92 220Q140 214 168 234Q200 224 236 240Q270 234 310 266Z', 'url(#metal)', 'stroke="var(--white)" stroke-width="3"') +
      armor('M64 236 98 226 112 252 76 260Z') + armor('M176 236 204 230 216 254 184 260Z') + armor('M126 228 156 222 162 248 132 252Z') +
      limb('M230 244Q236 222 250 210', 7) + p('M244 196 262 200 258 216 244 214Z') +
      circle(150, 188, 5, 'var(--white)') + circle(134, 206, 3, 'var(--white)'),

    // A gale twists up from the caster's cracked heart and hurls an enemy high and spinning.
    'Turning Gale': () =>
      p('M60 270Q60 230 90 222Q120 214 140 196Q170 164 160 130Q156 96 196 76Q240 58 290 66Q332 74 360 56Q342 94 300 98Q250 100 226 120Q210 140 214 176Q214 218 170 240Q130 262 108 274Z', 'var(--mid)', 'stroke="var(--glow)" stroke-width="3"') +
      line('M110 244Q170 226 186 170Q196 120 250 96Q290 84 330 78', 5) +
      p('M42 236Q42 218 58 220Q66 210 76 222Q80 238 58 258Q42 248 42 236Z', 'var(--glow)', 'stroke="var(--white)" stroke-width="2"') +
      thick('M60 222 56 236 64 240 58 252', 2, dark) +
      group(p('M-24 -14Q-6 -30 18 -20L22 10Q4 22 -16 14Z') + armor('M14 -34Q26 -42 36 -32L34 -18Q24 -12 16 -20Z') + eye(28, -26, 1.8) +
        limb('M-20 -6Q-40 -8 -52 4', 9) + limb('M-16 8Q-30 26 -26 44', 9) + limb('M18 -4Q36 6 44 22', 8), 'translate(320 132) rotate(-40)') +
      armor('M250 170 262 162 268 176 256 182Z') + armor('M286 194 300 188 302 204 288 206Z') +
      line('M280 140Q300 170 330 172', 3, 'opacity=".7"'),
  };
};
