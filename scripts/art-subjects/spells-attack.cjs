'use strict';
// Attack spells (GDADA run 2, R2): nine damage spells drawn as nine different
// events, each with its own source and angle, and a target in the frame.
module.exports = ({ p, line, circle, group, armor, gem, eye, star, dark, thick }) => {
  const limb = (d, w, fill = 'url(#body)') => thick(d, w + 4, 'var(--mid)') + thick(d, w, fill);
  const card = (x, y, r) => group(p('M-14 -20H14V20H-14Z', 'url(#metal)', 'stroke="var(--white)" stroke-width="2"') + p('M-8 -12H8V12H-8Z', 'var(--mid)') + star(0, 0, 6), `translate(${x} ${y}) rotate(${r})`);
  return {
    // A blazing ball streaks down from the upper right onto a fleeing figure;
    // a flame salamander on a rock flares brighter as it passes (+100 ATK).
    Fireball: () =>
      p('M140 170Q180 120 362 34Q336 78 376 66Q304 118 334 120Q262 170 186 214Z', 'var(--mid)') +
      p('M156 172Q200 134 330 66Q306 98 336 94Q262 146 284 146Q228 180 176 200Z', 'url(#flare)', 'opacity=".85"') +
      line('M210 150 300 98M196 178 262 150', 3, 'opacity=".7"') +
      circle(164, 184, 36, 'url(#flare)') + circle(154, 174, 16, 'var(--white)', 'opacity=".8"') +
      p('M130 196Q116 214 120 232Q132 218 144 220Z', 'url(#flare)') +
      p('M60 258Q100 252 130 260Q96 266 60 258Z', dark, 'opacity=".5"') +
      limb('M86 228Q74 242 60 256', 9) + limb('M96 228Q110 240 124 254', 9) +
      p('M74 198Q92 192 102 204L104 232Q92 238 80 232Q68 216 74 198Z') +
      p('M100 202Q124 204 136 222Q118 220 104 232Z', 'var(--mid)') +
      limb('M94 204Q106 192 110 178', 7) + limb('M78 206Q64 214 54 222', 7) +
      p('M72 180Q80 172 90 178Q94 190 84 196Q72 196 72 180Z') + eye(88, 184, 2) +
      p('M272 256Q276 238 300 238Q324 236 340 220L352 210 350 226Q344 246 322 254Z') +
      p('M280 254Q300 248 322 252Q340 248 348 232Q346 252 318 258Z', 'var(--mid)') +
      p('M288 238 294 222 302 236 310 216 318 234 328 214 332 228', 'url(#flare)') +
      limb('M292 252 284 262M326 250 334 262', 5) + eye(346, 216, 2) +
      armor('M262 262Q300 252 360 262Z') + star(310, 200, 5) + star(330, 190, 4),

    // Low angle: a flame beast's claw stamps the ground and a fissure runs out
    // to a pillar of fire that flings a foe into the air (more with a flame creature).
    'Flame Burst': () =>
      p('M150 262 170 250 206 258 240 250 300 260Z', 'url(#flare)') +
      line('M150 258 170 252 206 256 240 252', 2) +
      p('M220 258Q212 200 232 156Q226 112 250 70Q256 110 268 118Q276 78 300 54Q298 118 312 156Q330 206 318 258Z', 'var(--mid)') +
      p('M236 256Q230 206 248 168Q246 132 260 104Q266 140 280 146Q290 112 298 92Q298 150 308 186Q316 226 304 256Z', 'url(#flare)') +
      p('M258 256Q252 220 268 190Q280 212 288 256Z', 'var(--white)', 'opacity=".8"') +
      p('M200 250Q206 226 222 216Q214 240 222 256ZM328 256Q330 232 346 222Q338 244 340 258Z', 'url(#flare)') +
      p('M256 196Q270 188 284 196L282 240Q270 246 258 240Z', dark) + circle(270, 180, 10, dark) +
      thick('M260 202Q246 186 240 164M282 202Q298 184 300 160M262 238 254 258M278 238 286 258', 8, dark) +
      armor('M326 80 332 76 352 120 348 122Z') +
      p('M60 236Q52 200 78 182Q104 170 124 186Q134 204 126 226L112 244H70Z') +
      p('M104 176Q130 190 126 226L112 244H96Q116 210 104 176Z', 'var(--mid)') +
      p('M62 200 58 170 74 188 78 158 90 182 98 156 104 178', 'url(#flare)') +
      limb('M70 236Q50 244 46 258M108 238Q100 250 96 260', 10) +
      limb('M118 196Q140 214 140 248M76 196Q60 222 66 250', 10) +
      circle(140, 250, 10, 'url(#body)') + circle(66, 252, 10, 'url(#body)') +
      p('M112 168Q126 156 142 166Q148 182 136 192Q120 196 112 184Z') +
      armor('M118 162 110 140 126 158ZM136 162 148 142 142 166Z') + eye(136, 176, 2.2) +
      line('M80 200Q94 194 106 202M76 216Q92 210 110 218', 2, 'opacity=".6"') +
      star(126, 240, 6) + star(160, 236, 4) + star(190, 226, 5),

    // An arc jumps from a caster's staff tip to a foe's spear; a gust from the
    // wind at her back lifts a card into the air (wind creature: draw).
    Spark: () =>
      thick('M118 144 150 132 160 152 196 134 210 158 244 140 252 162 286 150', 9, 'var(--glow)') +
      thick('M118 144 150 132 160 152 196 134 210 158 244 140 252 162 286 150', 3, 'var(--white)') +
      circle(118, 144, 10, 'var(--white)') + circle(286, 150, 9, 'var(--white)') +
      line('M170 186Q206 168 234 186M150 70Q190 46 236 64Q262 76 250 96', 2, 'opacity=".55"') +
      card(206, 76, 18) +
      thick('M118 144 104 250', 5, 'url(#metal)') +
      p('M84 168Q98 160 108 170L114 210Q120 238 130 256H64Q74 232 76 210Z') +
      p('M100 166 108 170 114 210Q120 238 130 256H104Q112 216 100 166Z', 'var(--mid)') +
      p('M76 176Q62 196 50 224L64 228Q72 204 84 186Z', 'var(--mid)') +
      limb('M100 176Q108 166 110 156', 6) +
      p('M84 146Q96 136 106 146Q108 160 96 164Q84 162 84 146Z') + p('M82 152Q86 134 104 140L92 148Z', 'var(--mid)') + eye(104, 152, 1.8) +
      thick('M286 150 268 252', 5, 'url(#metal)') + armor('M282 138 290 128 292 152 284 156Z') +
      p('M296 176Q316 168 330 176L336 220Q338 244 346 256H296Q298 230 296 206Z') +
      p('M320 172 330 176 336 220Q338 244 346 256H330Q332 214 320 172Z', 'var(--mid)') +
      limb('M300 186Q290 180 284 172', 7) +
      armor('M298 150Q314 140 328 150L330 170Q312 176 296 168Z') + armor('M312 140 322 124 326 146Z') +
      line('M296 120 284 108M326 116 338 102M310 112 314 96', 2) + star(330, 138, 5),

    // A storm cloud fills the sky and drives one bolt straight into the rival
    // duelist; a card drops out of the cloud into the caster's reach (draw 1).
    'Lightning Strike': () =>
      p('M52 92Q40 62 76 58Q86 30 124 40Q144 18 180 34Q210 14 246 34Q290 22 304 54Q348 54 346 88Q342 106 316 104H76Q52 106 52 92Z', 'var(--mid)') +
      p('M64 96Q60 78 84 76Q100 62 124 72Q150 56 178 72Q212 58 240 76Q276 66 300 84Q330 84 332 98Z', dark, 'opacity=".55"') +
      line('M84 60Q104 52 120 58M184 36Q208 30 226 40M262 40Q286 36 298 52', 2, 'opacity=".6"') +
      p('M196 100 222 100 210 140 246 136 214 186 238 184 268 228 222 196 200 200 226 156 188 160Z', 'var(--white)', 'stroke="var(--glow)" stroke-width="4" stroke-linejoin="round"') +
      line('M226 156 252 148M214 186 194 196', 2) +
      p('M248 226Q262 214 286 218Q304 228 302 258H236Q236 238 248 226Z') +
      p('M286 218Q304 228 302 258H282Q290 236 280 220Z', 'var(--mid)') +
      limb('M262 228Q240 222 226 206M290 230Q312 220 320 200', 7) +
      p('M254 210Q262 196 276 202Q282 214 272 222Q258 224 254 210Z') + armor('M254 204 258 192 264 202 270 190 274 202 280 196 278 206 256 210Z') +
      star(266, 228, 14) + line('M240 262 216 270M298 262 330 270M268 262 270 274', 3) +
      card(110, 170, -20) + line('M110 132Q104 118 112 106M96 140Q86 128 92 116', 2, 'opacity=".6"'),

    // Seen from the ground: a cracked boulder in a sheath of fire falls almost
    // straight down; weak foes topple in the blast, one under a ward dome holds.
    Meteor: () =>
      p('M148 160Q136 100 104 24Q176 76 254 128Z', 'var(--mid)') +
      p('M164 140Q150 100 128 56Q182 94 236 124Z', 'url(#flare)', 'opacity=".9"') +
      thick('M176 120 124 42M222 116 176 58', 5, 'var(--glow)') + thick('M198 112 142 34', 3, 'var(--white)') +
      p('M146 140 170 114 216 106 252 124 262 160 240 196 194 204 156 186Z', 'url(#body)', 'stroke="var(--glow)" stroke-width="3"') +
      p('M194 204 240 196 262 160 252 124 236 150 222 184Z', 'var(--mid)') +
      p('M170 114 216 106 232 118 196 128 160 132Z', 'var(--white)', 'opacity=".55"') +
      line('M176 146 200 160 196 182M200 160 226 152 238 170', 3) +
      p('M120 232Q200 214 290 232Q200 246 120 232Z', 'url(#flare)', 'opacity=".6"') +
      line('M130 214 104 200M276 212 300 196M204 212 204 196', 3, 'opacity=".7"') +
      group(p('M-12 0Q-14 -22 0 -28Q14 -22 12 0Z') + p('M2 -28Q14 -22 12 0H0Z', 'var(--mid)') + armor('M-6 -24 -14 -38 -1 -28ZM6 -24 14 -38 1 -28Z') + eye(-4, -20, 1.5), 'translate(74 256) rotate(-38)') +
      group(p('M-12 0Q-14 -22 0 -28Q14 -22 12 0Z') + p('M2 -28Q14 -22 12 0H0Z', 'var(--mid)') + armor('M-6 -24 -14 -38 -1 -28ZM6 -24 14 -38 1 -28Z') + eye(4, -20, 1.5), 'translate(146 258) rotate(30)') +
      line('M60 238 50 228M160 236 172 228', 2) +
      p('M296 258Q300 230 324 230Q346 232 350 258Z') + p('M324 230Q346 232 350 258H332Q336 240 324 230Z', 'var(--mid)') + eye(318, 240, 1.6) +
      p('M286 260Q284 206 324 202Q366 206 362 260', 'none', 'stroke="var(--white)" stroke-width="3"') +
      line('M292 244Q290 214 324 210', 2),

    // Close up: the caster's own hand hurls a black lance at a distant foe, and
    // the void cracks back up her arm (200 damage to yourself).
    'Void Bolt': () =>
      p('M168 186 342 76 334 92 358 84 178 204Z', dark, 'stroke="var(--glow)" stroke-width="3" stroke-linejoin="round"') +
      p('M342 76 372 60 352 88Z', 'var(--white)') +
      line('M190 176 250 140M220 182 300 130', 2, 'opacity=".5"') +
      p('M300 112Q322 98 340 108L342 152Q340 178 352 200H306Q312 170 304 150Z') +
      p('M330 102Q342 108 342 152Q340 178 352 200H334Q338 160 330 102Z', 'var(--mid)') +
      p('M312 88Q326 78 336 90Q338 104 324 106Q312 102 312 88Z') +
      limb('M306 124Q290 116 282 102', 6) + star(340, 82, 9) +
      p('M14 300Q24 262 50 244L92 284Q84 292 82 300Z', 'var(--mid)') + armor('M44 246 96 286 88 296 36 256Z') +
      limb('M50 280Q76 246 112 222', 30) +
      p('M100 208Q120 194 140 202Q150 216 138 232Q120 242 102 236Z') +
      limb('M134 206 162 190M140 214 172 206M138 224 168 226M128 232 152 246', 7) + limb('M108 208 118 186', 8) +
      p('M120 236Q136 236 140 226L146 230Q136 244 118 242Z', 'var(--mid)') +
      line('M62 268 78 252 74 240M78 252 98 244 106 230M98 244 110 252M74 240 86 226', 3) +
      p('M70 238Q60 214 76 196Q76 218 86 228ZM100 228Q96 206 112 190Q110 210 116 220Z', dark, 'opacity=".75"'),

    // Seen from above at an angle: the ground breaks into slabs that tip and
    // slide into a pit, taking a foe with them; your own shield cracks (-200 DEF).
    'Void Collapse': () =>
      group(
      p('M126 194Q200 178 278 192L252 220 216 284H188L152 220Z', 'var(--mid)') + p('M140 198Q200 188 264 196L242 222 210 276H194L162 222Z', dark) +
      p('M180 280Q202 244 224 280Z', 'var(--glow)', 'opacity=".7"') +
      p('M40 286Q24 230 36 184Q90 182 124 196L150 222 174 286Z') + p('M112 192 124 196 150 222 174 286H130Q140 232 112 192Z', 'var(--mid)') +
      p('M360 286Q376 230 364 184Q316 182 280 194L254 222 230 286Z') + p('M290 192 280 194 254 222 230 286H270Q262 226 290 192Z', 'var(--mid)') +
      thick('M40 186Q90 184 120 196M360 186Q318 184 284 196', 4, 'var(--white)') +
      group(armor('M-24 -6H24V6H-24Z'), 'translate(152 210) rotate(58)') + group(armor('M-20 -6H20V6H-20Z'), 'translate(252 214) rotate(-54)') +
      p('M176 170 192 164 194 180 178 182ZM226 160 240 166 232 178ZM136 168 148 172 140 182Z', 'url(#body)') +
      line('M96 160Q130 170 146 196M306 156Q270 168 258 196', 2, 'stroke-dasharray="6 8" opacity=".6"') +
      group(p('M-10 -14Q0 -22 10 -14L8 10Q0 16 -8 10Z') + limb('M-10 -12Q-20 -20 -24 -32M10 -12Q20 -22 24 -34M-4 10 -8 26M4 10 10 24', 5) + circle(0, -24, 7, 'url(#body)'), 'translate(204 222) rotate(-14) scale(1.2)') +
      group(armor('M0 -26Q22 -22 26 -16Q24 14 0 28Q-24 14 -26 -16Q-22 -22 0 -26Z') + line('M0 -24 4 -6 -6 6 2 26M4 -6 18 -10', 3), 'translate(330 210) rotate(14)') +
      p('M352 236 360 230 358 244Z', 'url(#metal)') + star(200, 250, 6) +
      p('M150 104 172 96 176 116 156 122ZM236 96 254 104 244 120 230 112Z', 'url(#body)') + line('M154 128 160 140M244 126 240 140', 2), 'translate(0 -24)'),

    // A single thin tongue of flame curls in from the left and wraps the weakest
    // foe, a small creature cowering behind a cracked wooden buckler.
    Scorch: () =>
      p('M40 250Q90 260 130 230Q170 196 190 150Q206 118 236 112Q214 128 212 156Q206 204 160 238Q110 268 40 250Z', 'var(--mid)') +
      p('M60 248Q104 252 140 226Q178 194 194 154Q204 130 222 120Q206 146 202 170Q190 210 150 236Q110 256 60 248Z', 'url(#flare)') +
      p('M236 112Q252 120 248 140Q240 128 228 132Z', 'url(#flare)') +
      p('M262 258Q256 222 268 200Q284 180 310 186Q336 196 338 226L334 258Z') +
      p('M310 186Q336 196 338 226L334 258H316Q326 220 310 186Z', 'var(--mid)') +
      p('M282 186Q276 162 292 150Q312 142 324 156Q332 176 316 186Q298 192 282 186Z') +
      p('M290 154 262 136 284 164ZM320 152 336 130 326 160Z', 'var(--mid)') + eye(294, 166, 2.2) + eye(308, 166, 1.8) +
      limb('M276 206Q258 214 246 206', 7) +
      group(p('M0 -32Q24 -28 26 0Q24 30 0 34Q-14 0 0 -32Z', 'url(#body)', 'stroke="var(--mid)" stroke-width="3"') + line('M2 -30 10 -6 2 6 12 30', 2.5) + p('M-2 -32Q-8 -6 0 34', 'none', 'stroke="var(--white)" stroke-width="2" opacity=".5"'), 'translate(236 200) rotate(-10)') +
      limb('M276 254 268 262M318 254 326 262', 6) +
      line('M246 176 262 166M240 232 258 236', 2, 'opacity=".7"') + star(196, 140, 6) + star(244, 102, 4),

    // Low angle hero shot: a newly summoned warrior bursts up from the summoning
    // glyph roaring, axe swung back, and the rage burns into its arms (+300 ATK).
    'Battle Rage': () =>
      p('M80 250Q200 222 330 250Q200 276 80 250Z', 'none', 'stroke="var(--glow)" stroke-width="4"') +
      p('M112 250 98 226 122 240 130 214 146 244M268 246 290 222 288 244 308 228 300 252', 'url(#flare)') +
      limb('M178 196Q166 222 150 254', 20) + limb('M222 196Q236 222 256 250', 20) +
      p('M164 120Q200 104 238 120Q252 160 232 204H170Q150 160 164 120Z') +
      p('M210 112Q238 118 246 150Q244 184 232 204H212Q226 160 210 112Z', 'var(--mid)') +
      armor('M166 186H234L230 206H170Z') +
      line('M180 140Q196 150 212 140M184 162Q198 170 214 162', 2, 'opacity=".6"') +
      limb('M168 124Q140 112 128 84Q122 66 132 54', 16) +
      limb('M234 124Q262 116 270 92Q274 74 266 60', 16) +
      thick('M108 54 290 82', 7, 'url(#metal)') +
      armor('M92 26Q72 50 84 86L114 66Q104 50 116 36Z') + p('M84 86 92 26', 'none', 'stroke="var(--white)" stroke-width="2"') +
      p('M182 90Q178 70 196 64Q218 62 222 84Q224 102 210 110Q190 112 182 90Z') +
      p('M180 76 168 54 190 68ZM218 72 236 52 222 80Z', 'url(#metal)') +
      p('M192 96Q202 104 212 96L208 108Q200 112 194 106Z', dark) + eye(192, 84, 2) + eye(212, 84, 2) +
      p('M138 92Q124 82 132 64ZM258 92Q274 80 266 64Z', 'url(#flare)', 'opacity=".8"') +
      p('M146 70 150 46 160 66 166 40 172 72M230 70 238 44 242 68 252 46 252 76', 'url(#flare)') +
      star(300, 120, 7) + star(100, 130, 5),
  };
};
