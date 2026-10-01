#!/usr/bin/env node
'use strict';

// Original Shadow Duel vector illustrations. The generated SVGs are checked in;
// this dependency-free source is their editable, deterministic source of truth.
const fs = require('node:fs');
const path = require('node:path');
const { MONSTER_TEMPLATES, SPELL_TEMPLATES, RELIC_TEMPLATES } = require('../cards.js');
const root = path.resolve(__dirname, '..');
const cards = [...MONSTER_TEMPLATES, ...SPELL_TEMPLATES, ...RELIC_TEMPLATES];
const palettes = {
  flame: ['#160d1c', '#552637', '#ff824e', '#ffe8a0'],
  water: ['#061720', '#174a66', '#54dbeb', '#d1fcff'],
  earth: ['#101d1b', '#354c39', '#a7cb83', '#edf7bb'],
  wind: ['#0e182a', '#364973', '#a2c7ff', '#edf5ff'],
  light: ['#231b28', '#675449', '#e8c980', '#fff7ce'],
  shadow: ['#110e25', '#3d285d', '#ae83ef', '#e9d2ff'],
  neutral: ['#141b28', '#3c4d63', '#98b9cc', '#f5dfb1'],
};
const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const xml = (text) => text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const p = (d, fill = 'url(#body)', extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const line = (d, width = 2, extra = '') => p(d, 'none', `stroke="var(--glow)" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}`);
const circle = (x, y, r, fill = 'var(--glow)', extra = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const group = (s, transform) => `<g transform="${transform}">${s}</g>`;
const dark = '#101323';
const armor = (d, extra = '') => p(d, 'url(#metal)', `stroke="var(--mid)" stroke-width="1.6" stroke-linejoin="round" ${extra}`);
const gem = (x, y, size = 20) => group(p('M0 -25 17 -8 12 15 0 29 -13 13 -18 -8Z', 'var(--mid)') + p('M0 -25 0 29 12 15 17 -8Z', 'var(--glow)') + p('M0 -25 -18 -8 0 -2 17 -8Z', 'var(--white)') + line('M-18 -8 0 -2 0 29', 1), `translate(${x} ${y}) scale(${size / 25})`);
const eye = (x, y, size = 3) => circle(x, y, size + 3, 'var(--glow)', 'opacity=".16"') + circle(x, y, size, 'var(--white)');
const star = (x, y, size = 8) => p(`M${x} ${y - size}l2 ${size - 2} ${size - 2} 2 -${size - 2} 2 -2 ${size - 2} -2 -${size - 2} -${size - 2} -2 ${size - 2} -2Z`, 'var(--white)');

function environment(card, seed) {
  let out = `<rect width="400" height="300" fill="url(#sky)"/>`;
  out += circle(226, 126, 142, 'url(#aura)');
  out += circle(266, 74, card.element === 'shadow' ? 43 : 32, 'var(--glow)', 'opacity=".13"');
  out += line('M-20 157Q104 51 238 100T425 56', 1, 'opacity=".15"');
  for (let i = 0; i < 33; i++) {
    const x = (i * 73 + seed * 19) % 390 + 5;
    const y = (i * i * 17 + seed * 11) % 250 + 7;
    out += circle(x, y, i % 7 === 0 ? 1.6 : .7, 'var(--white)', `opacity="${i % 3 === 0 ? '.5' : '.2'}"`);
  }
  out += p('M0 217 43 175 79 191 111 143 156 190 198 164 260 202 308 137 343 186 400 157V300H0Z', 'var(--mid)', 'opacity=".18"');
  if (card.element === 'water') {
    out += [194, 224, 258].map((y) => line(`M-20 ${y}Q45 ${y - 23} 108 ${y}T230 ${y}T420 ${y}`, 2, 'opacity=".22"')).join('');
    out += p('M0 250Q40 193 65 250L57 213 83 257 110 246 123 287H0M333 300L342 217 353 242 362 188 369 244 390 215 379 300', dark, 'opacity=".7"');
  } else if (card.element === 'flame') {
    for (let i = 0; i < 7; i++) out += p(`M${i * 68 - 25} 300q-20 -45 12 -78q-3 35 15 41q14 -45 8 -67q40 47 21 104Z`, 'var(--glow)', 'opacity=".11"');
  } else if (card.element === 'light') {
    out += p('M37 245V78L54 51 70 78V245H59V91H48V245M331 245V78L347 51 364 78V245H353V91H342V245', 'var(--mid)', 'opacity=".24"');
    out += line('M54 83Q201 -28 347 83M54 97Q201 -15 347 97', 2, 'opacity=".15"');
  } else if (card.element === 'earth' || card.element === 'neutral') {
    out += p('M0 263 40 231 73 249 93 228 128 268 186 250 234 275 271 239 316 258 348 224 400 247V300H0Z', dark, 'opacity=".8"');
  } else if (card.element === 'wind') {
    out += line('M-35 107Q91 63 167 91T421 55M-14 237Q103 195 213 225T433 183', 5, 'opacity=".1"');
  } else {
    out += line('M3 285Q44 205 31 125M31 175 62 153M377 282Q346 181 369 117M361 186 336 169', 6, 'opacity=".25"');
  }
  out += `<ellipse cx="205" cy="270" rx="142" ry="16" fill="#050812" opacity=".55"/>`;
  return out;
}

function wolf(voidborn = false) {
  let s = p('M61 208Q98 226 111 191L146 166 183 168 212 137 222 99 240 125 260 87 270 127 308 141 288 157 263 158 245 190 252 243 274 260 245 263 225 228 218 202 194 207 168 251 148 263 130 260 153 238 160 206 135 212 110 251 88 260 72 256 95 240 104 211Q78 252 44 220L30 193Z');
  s += p('M154 170 186 177 216 153 235 126 240 148 226 177 204 190 165 193 115 204Z', 'var(--mid)');
  s += p('M228 184 247 174 241 196 246 242 255 252 246 253 232 224Z', 'var(--glow)', 'opacity=".44"');
  s += line('M55 211Q86 228 107 199L149 173 184 176 215 145 221 108M257 100 265 136 294 144M166 215 158 242M210 172 191 187', 2);
  s += eye(267, 140, 2.7) + p('M281 151 286 157 277 154 273 160 271 153', 'var(--white)');
  if (voidborn) s += line('M155 181 168 195 161 211M211 148 224 169 215 193', 3) + circle(186, 180, 42, 'none', 'stroke="var(--glow)" opacity=".22"');
  else s += p('M121 170Q127 139 153 137L147 155Q171 115 190 116L179 144 199 136 184 166Z', 'var(--glow)', 'opacity=".7"') + line('M135 159 152 149M170 149 184 132', 3);
  return s;
}

function serpent(tidal = false) {
  let s = `<path d="M88 246C303 292 318 200 206 201C92 204 106 127 232 140" fill="none" stroke="#101323" stroke-width="48" stroke-linecap="round"/>`;
  s += `<path d="M88 243C298 288 315 202 205 197C101 198 111 127 232 136" fill="none" stroke="url(#body)" stroke-width="37" stroke-linecap="round"/>`;
  s += line('M91 231C291 273 306 213 207 209C73 214 90 109 236 126', 3);
  s += p('M215 142 226 110 220 87 247 99 274 95 307 121 288 144 257 148 245 172 222 164Z');
  s += p('M238 104 266 103 287 115 255 119 242 138 224 143Z', 'var(--mid)');
  s += eye(271, 119, 3) + line('M261 137 292 132', 2) + p('M278 134 273 148 272 136M290 132 285 144 284 134', 'var(--white)');
  s += line('M292 143 316 160 331 155M316 160 322 171', 1.5);
  for (let i = 0; i < 7; i++) s += line(`M${151 + i * 15} ${239 + Math.sin(i) * 5}l-5 8`, 1, 'opacity=".6"');
  if (tidal) s += p('M227 111 199 89 207 130M228 157 195 176 233 180M157 207 138 225 177 225', 'var(--glow)', 'opacity=".5"');
  else s += p('M229 108 219 70 241 92 252 60 261 92 277 81 272 100M144 196 121 175 133 200', 'var(--glow)', 'opacity=".8"');
  return s;
}

function dragon(variant = 'ancient') {
  const s = p('M192 155Q120 67 42 53L69 150 103 126 122 185 154 152 180 194M219 148Q282 61 364 40L344 143 314 117 294 178 263 144 237 194', 'var(--mid)', 'stroke="var(--glow)" stroke-width="1.5"')
    + p('M42 53 111 96 192 171 95 88 69 150M364 40 285 94 219 167 318 78 344 143', dark, 'opacity=".6"')
    + line('M58 66 117 111 154 152M350 55 282 106 263 144', 2)
    + p('M179 155 189 127 197 94 182 65 205 76 220 61 224 87 252 100 240 119 219 121 214 158 234 183 241 226 267 253 233 252 211 223 187 226 166 252 134 257 156 235 169 197Q157 250 104 263Q76 269 55 250Q104 271 145 215Z')
    + p('M199 127 212 122 203 157 221 196 209 220 190 220 182 191Z', 'var(--mid)')
    + line('M190 130 199 99 190 76M210 151 226 181 233 224M173 197Q162 242 118 251', 2)
    + p('M173 161 153 183 145 178 153 207 176 190M221 158 249 180 259 171 249 204 227 190', 'url(#metal)')
    + eye(225, 101, 3) + p('M232 113 235 123 223 118', 'var(--white)')
    + line('M193 167 208 167M189 181 214 181M189 195 218 196M192 209 212 211', 2, 'opacity=".6"');
  if (variant === 'whelp') return group(s, 'translate(52 50) scale(.76)') + p('M260 131Q318 107 325 83Q341 122 309 137Q338 143 347 123Q335 168 276 151Z', 'var(--glow)', 'opacity=".65"');
  if (variant === 'storm') return s + line('M41 54 76 29 63 61 119 41M299 64 282 104 321 94 292 146', 4);
  return s + p('M239 113Q296 94 333 162L308 151 330 193Q271 167 245 128Z', 'var(--glow)', 'opacity=".8"') + p('M246 116Q296 120 313 159L284 145Z', 'var(--white)');
}

function bird(hunter = false) {
  let s = p('M196 142 160 106 108 97 37 42 54 104 84 107 67 123 115 128 103 146 157 160 181 174 171 211 150 243 193 229 211 250 220 206 221 174 249 159 295 150 284 133 329 123 315 106 348 92 365 37 292 91 242 108 211 139Z');
  s += p('M46 56 115 106 175 142 191 165 153 146 109 115 58 90M354 52 287 105 238 138 214 163 246 128 292 96Z', 'var(--mid)');
  s += p('M189 151 190 118 208 105 226 116 242 122 224 132 219 157 211 184 193 183Z', 'url(#metal)');
  s += eye(217, 119, 2.3) + p('M226 121 244 123 228 131', 'var(--glow)');
  s += line('M62 81 156 136M86 115 163 146M119 139 170 154M341 74 252 130M318 109 246 142M284 135 239 149', 2, 'opacity=".65"');
  s += line('M195 183 187 209 177 214M214 181 219 208 231 212', 3);
  if (hunter) s = group(s, 'rotate(-14 200 150)') + line('M90 256 147 237M275 48 319 25M68 208 108 195', 2, 'opacity=".5"');
  return s;
}

function knight(kind = 'holy') {
  let s = p('M173 95 147 119 137 174 119 255 182 244 211 259 266 250 249 167 235 115 218 96Z', 'var(--mid)', 'opacity=".6"');
  s += armor('M174 119 202 107 234 124 225 176 204 199 175 175Z');
  s += armor('M176 178 202 187 229 175 235 202 207 213 172 202Z');
  s += armor('M177 204 199 211 189 250 166 257 161 248Z') + armor('M209 211 232 204 243 249 228 258 207 251Z');
  s += armor('M153 117 178 122 171 150 139 146Z') + armor('M231 123 251 117 264 144 233 151Z');
  s += armor('M175 80 197 65 222 81 220 109 198 123 178 106Z');
  s += p('M180 90 195 95 195 106 181 101M202 95 217 89 216 101 202 107', dark) + line('M183 95 192 98M205 98 214 94', 2);
  s += armor('M246 146 258 151 276 187 263 196 244 173Z');
  s += group(armor('M-5 68 -7 -56 0 -79 7 -56 5 68Z') + p('M0 -69 0 65 5 65 5 -54Z', 'var(--white)') + armor('M-23 59 -18 50 18 50 23 59 5 64 -5 64Z') + line('M0 66V90', 7), 'translate(282 106) rotate(14)');
  s += armor('M121 153 152 143 181 157 175 206 153 230 125 206Z') + p('M152 150 152 220 132 201 128 160Z', 'var(--mid)') + gem(153, 179, 12);
  s += line('M178 132 201 146 225 132M201 146V178', 2);
  if (kind === 'inferno') s += p('M178 79 180 54 192 64 203 29 211 63 226 50 219 80Z', 'var(--glow)') + p('M284 42Q297 82 284 128Q319 90 304 58L301 88Z', 'var(--glow)', 'opacity=".7"');
  if (kind === 'mercenary') s += p('M176 80Q175 40 218 49L205 72Z', 'var(--mid)') + line('M127 170 170 196M129 194 170 168', 4);
  if (kind === 'holy') s += circle(200, 88, 42, 'none', 'stroke="var(--glow)" stroke-width="2" opacity=".55"');
  return s;
}

function giant(kind = 'stone') {
  let s = armor('M171 78 201 65 228 81 225 116 202 130 173 112Z')
    + armor('M146 124 180 112 203 130 227 111 255 125 244 190 201 207 156 184Z')
    + armor('M126 119 149 127 153 168 137 204 108 194 103 172Z')
    + armor('M257 120 278 124 299 173 286 200 259 198 246 166Z')
    + armor('M162 190 196 201 190 251 153 267 128 257 151 226Z')
    + armor('M210 203 244 189 259 231 274 254 250 266 214 250Z')
    + eye(186, 98, 3) + eye(213, 98, 3) + gem(202, 155, kind === 'crystal' ? 27 : 13)
    + line('M160 130 170 171 190 187M239 131 230 171 214 183M175 81 199 86 224 81', 2);
  if (kind === 'crystal') s += gem(134, 130, 25) + gem(268, 132, 29) + gem(205, 63, 15) + gem(156, 234, 12);
  if (kind === 'iron') s += [ [140, 151], [266, 151], [172, 219], [231, 219] ].map(([x, y]) => circle(x, y, 8, dark) + circle(x, y, 3, 'var(--glow)')).join('') + line('M177 107H217M181 114H213', 3);
  if (kind === 'mountain') s += armor('M126 128 142 63 169 113 180 53 199 113 220 46 243 106 262 68 280 130Z') + p('M140 65 150 88 136 88M220 49 231 78 211 78M261 72 269 101 252 101', 'var(--white)', 'opacity=".6"');
  if (kind === 'world') s += armor('M122 128 140 87 164 120M240 119 265 73 285 133') + line('M200 77 192 94 203 114 193 138 210 164 201 193M154 190 172 214 155 236M244 179 268 173 282 190', 4) + line('M41 286 124 267 94 251M206 281 237 267 297 279 347 259', 3);
  if (kind === 'ancient') s += p('M175 108 181 137 202 156 221 133 225 108 211 122 201 125 188 122Z', 'var(--mid)') + line('M169 146 169 173 181 177M235 143 230 166 216 170', 3) + armor('M163 80 155 50 178 66M225 69 244 44 235 90');
  if (kind === 'battle') s += armor('M104 166 89 158 88 192 111 204M286 168 306 157 315 191 293 207') + line('M175 137 227 167M228 134 175 166', 5);
  return s;
}

function wizard(kind = 'acolyte') {
  let s = p('M175 96 163 132 145 189 125 260 189 252 211 266 266 257 243 199 229 138 218 99Z');
  s += p('M179 132 191 148 170 242 195 238 208 252 227 246 209 148 223 132 230 185 249 250 214 258 194 247 141 254Z', 'var(--mid)');
  s += p('M165 121 175 83 198 63 223 83 233 123 212 116 200 138 182 119Z', 'url(#metal)');
  s += p('M179 106Q183 81 200 79Q218 86 221 108L202 122Z', dark) + eye(190, 103, 2.4) + eye(208, 103, 2.4);
  s += armor('M167 128 181 144 160 175 126 183 122 169 151 154Z') + armor('M222 128 239 145 260 174 247 184 218 158Z');
  s += line('M121 110 125 256', 6) + circle(120, 90, 18, 'none', 'stroke="var(--mid)" stroke-width="6"') + gem(120, 88, 12);
  s += line('M186 151 182 224M211 151 224 232M158 240 178 232M206 242 233 240', 2, 'opacity=".7"');
  if (kind === 'acolyte') s += circle(201, 97, 54, 'none', 'stroke="var(--glow)" stroke-width="1.5" opacity=".4"') + star(261, 165, 16);
  if (kind === 'nightblade') s += armor('M244 173 285 123 285 155 256 194Z') + p('M165 94 199 61 219 81 203 71 182 108Z', 'var(--glow)', 'opacity=".3"');
  if (kind === 'reaper') s += p('M117 115Q192 7 302 94Q207 50 132 130Z', 'url(#metal)') + p('M181 102 186 87 215 87 221 102 210 114 210 125 190 124 190 115Z', 'var(--white)') + p('M185 98 196 97 193 107 186 107M202 97 215 98 213 107 204 107M198 106 195 116 202 116', dark);
  return s;
}

function angel(guardian = false) {
  let wings = p('M173 147Q115 85 54 45Q52 157 136 201L111 165 148 184 128 150 164 172M227 148Q284 87 346 45Q348 159 264 201L289 165 252 184 272 150 236 172', 'var(--mid)', 'stroke="var(--glow)" stroke-width="1.5"');
  wings += line('M65 64Q105 141 153 161M67 89Q97 151 134 171M336 64Q295 141 248 161M334 89Q304 151 267 171', 3, 'opacity=".75"');
  if (guardian) wings += group(wings, 'translate(0 62) scale(1 .72)') + circle(200, 122, 91, 'none', 'stroke="var(--glow)" stroke-width="1" stroke-dasharray="4 9" opacity=".5"');
  return wings + group(knight('holy'), 'translate(38 14) scale(.8)') + circle(198, 54, 27, 'none', 'stroke="var(--white)" stroke-width="3"') + star(198, 28, 8);
}

const subjects = {
  'Ember Whelp': () => dragon('whelp'),
  'Cinder Wolf': () => wolf(),
  'Flame Serpent': () => serpent(),
  'Inferno Knight': () => knight('inferno'),
  'Ashen Dragon': () => dragon(),
  'Tide Serpent': () => serpent(true),
  'Wind Falcon': () => bird(),
  'Sky Hunter': () => bird(true),
  'Storm Drake': () => dragon('storm'),
  'Stone Guardian': () => giant(),
  'Iron Golem': () => giant('iron'),
  'Crystal Sentinel': () => giant('crystal'),
  'Mountain Behemoth': () => giant('mountain'),
  'Worldbreaker Titan': () => giant('world'),
  'Dawn Acolyte': () => wizard(),
  'Radiant Knight': () => knight(),
  'Sunblade Angel': () => angel(),
  'Celestial Guardian': () => angel(true),
  'Nightblade': () => wizard('nightblade'),
  'Void Hound': () => wolf(true),
  'Dread Reaper': () => wizard('reaper'),
  'Ironclad Mercenary': () => knight('mercenary'),
  'Battle Colossus': () => giant('battle'),
  'Ancient Titan': () => giant('ancient'),
};

subjects['River Sprite'] = () => p('M194 98Q153 47 115 82Q113 126 172 145M208 97Q244 44 279 76Q292 123 227 145', 'var(--mid)', 'opacity=".65"') + line('M124 86 173 124M270 82 226 124', 2) + p('M190 127 178 157 145 183 153 193 191 172Q171 218 196 236Q218 251 247 224Q217 235 216 212L226 170 253 181 262 171 223 150 211 126Z') + circle(201, 107, 20, 'url(#metal)') + eye(194, 107, 2) + eye(208, 107, 2) + p('M178 100 193 80 204 89 219 80 225 102 212 93 199 98Z', 'var(--glow)') + line('M102 231Q180 273 272 231M133 251Q198 273 251 252', 3) + star(153, 189, 12) + star(261, 175, 10);
subjects['Frost Siren'] = () => p('M194 141Q160 185 184 213Q239 230 258 235L284 212 278 242 304 267Q255 258 242 251Q179 267 153 226Q136 194 169 146Z') + p('M182 150Q155 199 174 225Q206 250 255 242Q222 256 183 238Q150 225 153 203Z', 'var(--mid)') + p('M179 112 174 143 194 165 218 146 212 111Z', 'url(#metal)') + p('M182 126 148 150 116 142 112 152 150 165 185 146M211 124 239 151 269 126 277 133 243 167 215 148Z', 'url(#metal)') + p('M174 121Q151 94 173 69Q205 42 228 79L237 137 213 118Z', 'var(--mid)') + p('M182 80 211 78 218 102 202 121 181 105Z', 'url(#metal)') + eye(191, 98, 2) + eye(207, 97, 2) + armor('M174 82 171 60 185 70 198 45 210 69 225 60 218 83Z') + [67, 95, 303, 327].map((x, i) => gem(x, 215 - i * 30, 11)).join('') + line('M271 122Q302 113 287 90M275 117Q311 103 294 78', 2);
subjects['Deep Sea Leviathan'] = () => p('M71 167Q137 89 247 126L290 162 324 145 354 110 350 161 370 191 317 191 290 182Q234 233 143 216L121 254 107 212Q74 201 59 182Z') + p('M78 165Q143 120 236 140L276 163 248 177 124 175Z', 'var(--mid)') + p('M92 189Q176 218 271 174Q223 219 140 204Z', 'var(--glow)', 'opacity=".5"') + p('M158 132 179 89 209 126M202 195 211 243 243 191', 'url(#metal)') + eye(107, 169, 4) + line('M70 181 123 184M130 187 125 200M143 190 141 205M156 193 156 208M170 196 174 210', 2) + line('M106 136Q88 101 101 81M96 132Q72 115 79 90', 3, 'opacity=".5"');
subjects['Abyssal Kraken'] = () => {
  let s = '';
  const tentacles = ['M174 167C53 103 40 234 104 242C142 247 135 212 115 211','M181 181C139 215 190 273 125 268C96 265 77 282 63 267','M195 185C179 253 257 290 278 248C290 223 267 205 252 220','M217 172C291 131 335 183 309 215C286 242 333 266 355 229','M223 159C272 181 296 72 333 121C345 142 327 156 319 145'];
  for (const d of tentacles) s += `<path d="${d}" fill="none" stroke="var(--mid)" stroke-width="23" stroke-linecap="round"/>` + line(d, 4, 'opacity=".7"');
  return s + p('M167 172Q134 107 174 62Q198 38 224 61Q263 105 232 173L209 195 187 191Z') + p('M172 154Q153 103 187 69Q201 59 209 71Q178 96 186 153Z', 'var(--mid)') + eye(183, 151, 5) + eye(219, 151, 5) + p('M195 176 202 163 210 176 202 189Z', 'var(--white)');
};
subjects['Tempest Giant'] = () => group(giant('stone'), 'translate(20 -5) scale(.9)') + p('M125 200Q252 167 296 213L245 217 275 233 208 256 227 266 178 285 148 270 192 250 112 230 163 222Z', 'var(--mid)') + line('M109 205Q230 180 284 213M126 233Q224 213 273 232M151 257Q210 241 238 251', 4) + line('M128 97 105 139 126 139 101 178M279 94 263 130 288 124 271 168', 4);
subjects['Sky Sovereign'] = () => circle(201, 113, 80, 'none', 'stroke="var(--glow)" stroke-width="2" opacity=".4"') + group(bird(), 'translate(-9 18) scale(1.05 .91)') + armor('M184 120 173 88 191 101 202 75 214 100 233 86 222 121Z') + gem(203, 124, 10) + line('M60 173 93 162 78 187 117 177M324 164 298 176 320 184 288 201', 3);
subjects['Shadow Stalker'] = () => p('M166 92 175 65 198 86 226 69 232 112 218 142 238 160 269 195 287 230 270 229 237 201 220 185 213 208 238 251 221 260 185 230 172 251 145 258 155 242 171 201 151 180 122 202 94 198 116 184 135 153 165 138Z') + p('M170 99 183 89 202 98 222 88 217 123 192 145 174 128Z', 'var(--mid)') + eye(181, 111, 3) + eye(210, 107, 3) + line('M172 151 191 175 214 155M156 160 141 178 126 184M235 177 260 204', 2) + p('M95 198 86 211 96 207 93 219 110 204M285 229 301 236 291 223 304 225 284 210', 'var(--white)');
subjects['Lord of the Void'] = () => circle(201, 130, 87, 'none', 'stroke="var(--mid)" stroke-width="16"') + circle(201, 130, 103, 'none', 'stroke="var(--glow)" stroke-width="1" stroke-dasharray="2 10"') + p('M162 119 153 173 109 254 160 241 195 275 227 245 290 255 245 176 235 120Z') + p('M161 127 125 149 105 204 82 230 113 218 143 174 175 164M234 127 272 145 289 195 320 214 288 215 252 170 224 161Z', 'var(--mid)') + p('M156 122 157 73 178 94 198 47 215 92 242 68 240 123Z', 'url(#metal)') + p('M162 132Q200 91 239 132Q201 168 162 132Z', 'var(--glow)') + circle(201, 130, 19, dark) + p('M201 113 206 130 201 149 197 131Z', 'var(--white)') + line('M176 166 187 198 166 231M216 166 208 199 233 229', 3);
subjects['Arcane Automaton'] = () => group(giant('iron'), 'translate(35 25) scale(.82)') + circle(201, 151, 31, dark, 'stroke="var(--glow)" stroke-width="2"') + circle(201, 151, 23, 'none', 'stroke="var(--mid)" stroke-width="7" stroke-dasharray="6 5"') + gem(201, 151, 12) + circle(196, 79, 22, 'none', 'stroke="var(--glow)" stroke-width="2"') + line('M197 53V39M186 40H208', 4);

function shield(large = false) {
  return armor('M126 99 201 67 274 99 261 186 229 218 201 244 173 220 139 186Z') + p('M201 78 201 231 152 180 139 108Z', 'var(--mid)') + line('M150 116 201 93 250 115 240 178 201 218 163 180Z', 3) + (large ? p('M201 107 212 142 245 151 213 162 201 199 189 164 161 151 189 142Z', 'var(--white)') : gem(201, 151, 30));
}
const bolt = (d) => p(d, 'var(--glow)', 'stroke="var(--white)" stroke-width="1.5" stroke-linejoin="round"');
const orbit = () => `<ellipse cx="201" cy="160" rx="114" ry="43" fill="none" stroke="var(--glow)" stroke-width="1.5" transform="rotate(-25 201 160)" opacity=".7"/>`;
subjects['Healing Potion'] = () => circle(200, 155, 78, 'none', 'stroke="var(--glow)" stroke-width="1" opacity=".3"') + p('M178 68H221V104Q275 135 264 190Q256 231 201 236Q147 230 137 190Q126 142 178 104Z', 'url(#metal)', 'stroke="var(--glow)" stroke-width="2"') + p('M148 163Q183 176 210 159Q236 145 254 160L255 188Q249 222 201 226Q155 220 147 188Z', 'var(--glow)', 'opacity=".8"') + p('M174 62H225V86H174Z', 'var(--mid)', 'stroke="var(--glow)" stroke-width="2"') + line('M174 113Q149 134 151 151M153 172V184', 4) + p('M194 174H207V188H221V200H207V214H194V200H180V188H194Z', 'var(--white)') + star(267, 100, 12);
subjects['Minor Restoration'] = () => p('M82 225 105 195 125 190 150 211 182 215 173 189 182 181 210 214 209 237 170 255 129 245 114 227Z', 'url(#metal)') + p('M199 204Q183 158 201 117Q232 83 263 104Q263 149 214 159Z', 'var(--mid)') + p('M202 158Q153 157 141 119Q188 101 202 139Z', 'var(--glow)') + line('M197 199Q197 146 247 116M198 155 157 132', 3) + star(216, 77, 16) + star(279, 161, 10);
subjects['Fireball'] = () => p('M112 214Q103 155 176 117L320 56 283 99 351 75 275 137 298 139 230 203 197 240Z', 'var(--mid)') + p('M141 194Q149 141 220 125L289 88 259 137 286 123 222 192Z', 'var(--glow)') + circle(172, 196, 49, 'url(#flare)') + line('M133 184Q149 154 178 161M125 222 86 251M105 190 74 205', 4) + star(176, 190, 23);
subjects['Spark'] = () => bolt('M234 61 158 151 204 148 168 240 257 125 207 132Z') + line('M157 134 126 118 125 91M252 159 281 175 285 211M145 200 122 215M262 96 283 83', 3) + circle(204, 151, 83, 'none', 'stroke="var(--glow)" opacity=".22"') + star(213, 148, 19);
function book() { return armor('M90 119Q149 92 201 127Q254 92 310 116L294 216Q242 203 201 232Q151 205 103 216Z') + p('M201 134Q152 103 103 126L114 206Q157 199 201 224ZM206 133Q253 103 297 123L284 206Q242 202 206 224Z', 'var(--mid)') + line('M201 135V220M122 144Q157 131 184 150M125 161Q157 148 183 168M128 178Q160 164 182 184M220 149Q253 134 279 143M220 167Q251 151 275 159M220 184Q246 172 271 178', 2); }
subjects['Draw Two'] = () => book() + group(armor('M-26 -36H26V36H-26Z') + gem(0, 0, 12), 'translate(172 79) rotate(-15)') + group(armor('M-26 -36H26V36H-26Z') + star(0, 0, 13), 'translate(244 72) rotate(13)');
subjects['Quick Draw'] = () => group(armor('M-44 -65H44V65H-44Z') + armor('M-35 -54H35V54H-35Z') + bolt('M12 -39 -22 5 1 2 -12 39 24 -8 1 -5Z'), 'translate(221 150) rotate(19)') + line('M87 118H139M64 145H130M88 172H125M113 200H143', 5) + star(284, 70, 10);
subjects['Battle Rage'] = () => group(knight('inferno'), 'translate(51 41) scale(.76)') + p('M94 224 124 186 109 157 142 177 171 161 160 195 191 218 151 214 130 244 128 216Z', 'var(--glow)') + line('M271 83 299 56M289 116 328 109M265 231 284 259', 5) + circle(204, 155, 105, 'none', 'stroke="var(--glow)" stroke-width="2" stroke-dasharray="25 18" opacity=".3"');
subjects['Stone Skin'] = () => armor('M118 226 134 175 154 153 145 114 161 105 179 139 175 88 192 84 204 133 208 87 225 91 226 139 242 106 258 114 252 164 272 146 286 159 255 202 226 230 208 262 143 253Z') + p('M138 180 173 166 202 184 221 159 252 165 248 192 217 211 207 247 158 239Z', 'var(--mid)') + line('M156 113 169 145 191 161 181 182 202 197 198 234M219 101 216 144 232 159 222 177M143 208 172 202 185 217M258 175 232 192', 3) + gem(100, 150, 11) + gem(304, 219, 14);
subjects['Windstep'] = () => armor('M196 80 248 95 224 171 239 197 285 219 282 239 237 241 183 212 158 193Z') + p('M164 176 228 197 237 215 205 207 161 190Z', 'var(--mid)') + p('M196 184 133 132 147 185 122 173 155 208 191 212Z', 'var(--glow)') + line('M100 229Q151 245 195 229M64 247Q155 280 262 257M251 110 294 92M265 132 323 111', 3) + line('M191 111 233 124M185 128 227 141M179 145 221 158', 3);
subjects['Flame Burst'] = () => p('M101 225 142 198 128 161 173 177 157 109 194 147 215 59 236 148 274 114 263 170 309 153 282 203 325 229 250 241 203 259 149 242Z', 'var(--mid)') + p('M140 226 182 204 180 165 203 188 216 120 231 187 263 167 249 211 283 228 219 239Z', 'var(--glow)') + p('M183 231 200 210 214 171 223 211 243 230 215 243Z', 'var(--white)') + line('M99 166 77 145M302 183 333 175M184 85 178 62', 3);
subjects['Void Bolt'] = () => orbit() + bolt('M312 61 189 119 212 141 103 227 217 184 207 161 298 112 263 111Z') + circle(196, 156, 31, dark, 'stroke="var(--glow)" stroke-width="3"') + line('M175 155 193 138 213 155 195 172Z', 2) + line('M121 204 99 192 67 213M272 126 294 145 321 133', 3);
subjects['Lightning Strike'] = () => p('M75 104Q57 67 103 63Q122 32 159 62Q180 38 209 52Q240 27 271 58Q320 48 331 95L310 112H99Z', 'var(--mid)') + bolt('M217 76 157 153 195 153 160 238 259 126 212 132 246 80Z') + line('M141 103 116 143 137 149 99 190M276 103 263 150 291 144 282 175M107 259 163 240 214 251 268 237 303 253', 3) + star(177, 232, 15);
subjects['Barrier'] = () => circle(201, 155, 106, 'var(--glow)', 'opacity=".07" stroke="var(--glow)" stroke-width="3"') + group(shield(), 'translate(70 53) scale(.65)') + line('M105 111 130 97 154 111V140L130 154 105 140ZM248 179 273 165 298 179V209L273 223 248 209ZM261 88 283 76 304 88V113L283 126 261 113Z', 2, 'opacity=".5"') + line('M72 160 94 172M308 135 331 124', 4);
subjects['Aegis'] = () => p('M132 128 61 85 74 153 129 189M269 130 339 85 327 153 270 189', 'var(--mid)') + line('M72 99 127 159M331 99 275 159', 3) + shield(true) + circle(201, 150, 113, 'none', 'stroke="var(--glow)" stroke-width="1" opacity=".45"') + star(201, 50, 15);
subjects['Arcane Insight'] = () => group(book(), 'translate(42 83) scale(.79 .69)') + circle(201, 117, 62, 'url(#body)', 'stroke="var(--glow)" stroke-width="2"') + orbit() + p('M158 117Q201 75 244 117Q201 158 158 117Z', 'var(--mid)') + circle(201, 117, 20, 'var(--glow)') + circle(201, 117, 10, dark) + star(194, 109, 6) + star(129, 61, 9) + star(276, 67, 13);
subjects['Dark Bargain'] = () => armor('M135 71Q155 61 171 79H277L261 216H151Q134 236 114 220L139 100Q151 80 135 71Z') + p('M163 89 255 89 237 199H159Z', 'var(--mid)') + line('M175 114H238M171 127H222M168 140H232M164 154H207', 2) + p('M198 163Q178 189 179 201Q181 221 198 221Q220 220 220 202Q220 188 198 163Z', '#cc5d8f') + circle(199, 206, 7, '#f5b4c6') + group(armor('M-4 73 -5 -49 0 -72 6 -49 4 73Z') + line('M-17 48H17', 7), 'translate(292 180) rotate(31)');
subjects['Meteor'] = () => p('M104 202 123 147 320 28 298 82 366 49 283 125 315 117 224 217Z', 'var(--mid)') + p('M148 176 307 53 249 129 292 107 211 187Z', 'var(--glow)') + armor('M100 182 128 144 184 147 215 185 199 228 149 245 109 223Z') + p('M128 144 159 172 150 206 111 221 100 183Z', 'var(--mid)') + line('M137 152 165 180 194 178M165 180 153 214 190 226M95 249 66 259M203 241 235 265', 3) + p('M45 276 91 253 125 258 102 242 140 246 161 270 207 254 243 260 217 242 282 265 350 279Z', 'var(--glow)', 'opacity=".6"');
subjects['Void Collapse'] = () => {
  let s = circle(200, 149, 95, 'url(#flare)', 'opacity=".65"') + circle(200, 149, 65, '#080913', 'stroke="var(--glow)" stroke-width="3"') + `<ellipse cx="200" cy="149" rx="134" ry="31" fill="none" stroke="var(--white)" stroke-width="5" transform="rotate(-27 200 149)"/>` + `<ellipse cx="200" cy="149" rx="126" ry="37" fill="none" stroke="var(--glow)" stroke-width="10" transform="rotate(-27 200 149)" opacity=".5"/>`;
  for (let i = 0; i < 7; i++) s += group(armor('M0 -117 15 -102 8 -85 -12 -94Z') + line('M-4 -76 0 -65', 2), `translate(200 149) rotate(${i * 51})`);
  return s;
};
subjects['Divine Renewal'] = () => {
  let s = '';
  for (let i = 0; i < 12; i++) s += group(p('M-4 -62 -7 -99 0 -122 7 -99 4 -62Z', 'var(--glow)', 'opacity=".7"'), `translate(201 140) rotate(${i * 30})`);
  return s + circle(201, 140, 52, 'url(#flare)') + p('M143 221Q171 173 201 168Q227 174 255 221L220 207 201 228 180 205Z', 'url(#metal)') + p('M201 96 211 126 240 139 210 149 201 180 190 149 162 139 190 128Z', 'var(--white)') + line('M97 262Q147 226 174 246M229 245Q263 225 305 259', 3) + p('M128 248Q101 213 84 222Q84 248 128 248M271 246Q300 206 321 221Q315 249 271 246', 'var(--mid)');
};
subjects['Ember Core'] = () => circle(201, 142, 73, 'url(#flare)', 'opacity=".6"') + armor('M123 121 138 79 174 103 201 80 229 105 266 81 279 121 260 162 279 199 249 235 219 216 201 238 178 216 144 236 121 198 142 164Z') + circle(201, 155, 54, dark, 'stroke="var(--mid)" stroke-width="8"') + gem(201, 153, 37) + line('M144 92 157 116M254 94 242 118M139 201 158 187M258 201 243 185', 3) + star(204, 148, 16);
subjects['Crystal Heart'] = () => orbit() + p('M201 102 167 77 132 97 119 132 142 173 201 233 259 174 282 134 269 98 235 78Z', 'var(--mid)', 'stroke="var(--glow)" stroke-width="2"') + p('M201 103 201 232 259 174 282 134 232 149Z', 'var(--glow)') + p('M132 98 161 120 201 103 168 79ZM232 149 269 99 235 80 201 103Z', 'var(--white)') + line('M133 99 161 120 147 168 201 233 231 149 201 103M161 120 201 160 232 149M147 168 201 160', 2) + gem(96, 210, 13) + gem(304, 104, 10);
subjects['Void Shard'] = () => circle(201, 145, 101, 'none', 'stroke="var(--glow)" stroke-width="1" stroke-dasharray="3 9"') + orbit() + p('M214 51 244 123 222 240 177 197 156 123Z', 'var(--mid)', 'stroke="var(--glow)" stroke-width="2"') + p('M214 51 204 138 222 240 244 123Z', 'var(--glow)') + p('M214 51 156 123 204 138Z', 'var(--white)', 'opacity=".6"') + line('M156 123 204 138 177 197M204 138 244 123', 2) + gem(127, 92, 15) + gem(281, 215, 18) + line('M204 139 180 152 211 168 194 189', 3);

function render(card, index = 0) {
  const palette = palettes[card.element] || palettes.neutral;
  if (!subjects[card.name]) throw new Error(`Missing illustration for ${card.name}`);
  const [bg, mid, glow, white] = palette;
  const title = xml(card.name);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" role="img" aria-labelledby="title desc">
<title id="title">${title}</title>
<desc id="desc">Original Shadow Duel illustration of ${title}, in a ${card.element} fantasy landscape.</desc>
<defs>
<linearGradient id="sky" x2=".8" y2="1"><stop stop-color="${bg}"/><stop offset=".6" stop-color="${mid}"/><stop offset="1" stop-color="${bg}"/></linearGradient>
<radialGradient id="aura"><stop stop-color="${glow}" stop-opacity=".24"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient>
<linearGradient id="body" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="${mid}"/><stop offset=".45" stop-color="${bg}"/><stop offset="1" stop-color="#080c16"/></linearGradient>
<linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${glow}"/><stop offset=".27" stop-color="${mid}"/><stop offset=".7" stop-color="${bg}"/><stop offset="1" stop-color="${mid}"/></linearGradient>
<radialGradient id="flare"><stop stop-color="${white}"/><stop offset=".35" stop-color="${glow}"/><stop offset="1" stop-color="${mid}"/></radialGradient>
<linearGradient id="shade" x2="0" y2="1"><stop offset=".65" stop-color="#050812" stop-opacity="0"/><stop offset="1" stop-color="#050812" stop-opacity=".65"/></linearGradient>
</defs>
<g style="--mid:${mid};--glow:${glow};--white:${white}">
${environment(card, index)}
<g stroke-linejoin="round">${subjects[card.name]()}</g>
<rect width="400" height="300" fill="url(#shade)"/>
<path d="M14 52V14H52M348 14H386V52M14 248V286H52M348 286H386V248" fill="none" stroke="${glow}" opacity=".34"/>
<path d="M22 30V22H30M370 22H378V30M22 270V278H30M370 278H378V270" fill="none" stroke="${white}" opacity=".5"/>
</g>
</svg>
`;
}

function cardBack() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420" role="img" aria-labelledby="title desc">
<title id="title">Shadow Duel card back</title><desc id="desc">An engraved violet eclipse and silver blades on midnight blue.</desc>
<defs><radialGradient id="bg"><stop stop-color="#30274f"/><stop offset="1" stop-color="#090f1d"/></radialGradient><linearGradient id="blade" x2="1" y2="1"><stop stop-color="#e7e4f7"/><stop offset=".5" stop-color="#8e82b3"/><stop offset="1" stop-color="#30284d"/></linearGradient></defs>
<rect width="300" height="420" rx="18" fill="#080d19"/><rect x="9" y="9" width="282" height="402" rx="13" fill="url(#bg)" stroke="#70628d"/><rect x="18" y="18" width="264" height="384" rx="8" fill="none" stroke="#847294" stroke-opacity=".4"/>
<g fill="none" stroke="#807198"><path d="M150 35 263 210 150 385 37 210Z"/><path d="M150 61 248 210 150 359 52 210Z" opacity=".4"/><circle cx="150" cy="210" r="87"/><circle cx="150" cy="210" r="75" stroke-dasharray="2 9"/><path d="M28 83V28H83M217 28H272V83M28 337V392H83M217 392H272V337"/></g>
<g fill="url(#blade)" stroke="#b6aacb"><path d="M89 115 174 240 157 252 83 144Z"/><path d="M211 115 126 240 143 252 217 144Z"/><path d="M143 229 180 259 173 267 136 237ZM157 229 120 259 127 267 164 237Z"/><path d="M163 254 179 278 189 272 173 248ZM137 254 121 278 111 272 127 248Z"/></g>
<circle cx="150" cy="191" r="39" fill="#a294cc"/><circle cx="165" cy="178" r="34" fill="#17192f"/><path d="M150 160 156 184 180 190 156 196 150 220 144 196 120 190 144 184Z" fill="#ede5ff"/>
<g fill="#c6b2e6"><path d="M150 39 155 48 150 57 145 48ZM150 363 155 372 150 381 145 372ZM33 203 38 212 33 221 28 212ZM267 203 272 212 267 221 262 212Z"/></g>
</svg>
`;
}

function runtime() {
  const manifest = Object.fromEntries(cards.map((card) => [card.name, `assets/cards/${slug(card.name)}.svg`]));
  return `/* Generated by scripts/build-card-art.cjs. Original Shadow Duel artwork. */\n(function (root) {\n  'use strict';\n  const manifest = Object.freeze(${JSON.stringify(manifest, null, 2)});\n  const fallback = 'assets/card-back.svg';\n  function src(card) {\n    const name = typeof card === 'string' ? card : card && card.name;\n    return Object.prototype.hasOwnProperty.call(manifest, name) ? manifest[name] : fallback;\n  }\n  const api = Object.freeze({ src, manifest, fallback });\n  if (typeof module !== 'undefined' && module.exports) module.exports = api;\n  if (root) root.ShadowCardArt = api;\n})(typeof window !== 'undefined' ? window : null);\n`;
}

function build() {
  const out = new Map(cards.map((card, index) => [`assets/cards/${slug(card.name)}.svg`, render(card, index)]));
  out.set('assets/card-back.svg', cardBack());
  out.set('card-art.js', runtime());
  return out;
}
if (require.main === module) {
  const check = process.argv.includes('--check');
  let stale = false;
  for (const [name, content] of build()) {
    const target = path.join(root, name);
    if (check) {
      if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== content) { console.error(`Stale: ${name}`); stale = true; }
    } else {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, content);
    }
  }
  if (stale) process.exitCode = 1;
  else console.log(`${check ? 'Verified' : 'Generated'} ${cards.length} card illustrations, card back, and art manifest.`);
}
module.exports = { build, render, cardBack, slug, cards };
