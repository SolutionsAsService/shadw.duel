'use strict';

// Scenes for Shadow Duel card art (GDADA run 2: "every card is its own scene").
//
// Each card gets a setting, a time of day, a light direction, a horizon and a
// camera (where the subject stands and how large it is), chosen deterministically
// from its name so the generator stays reproducible. Everything is plain SVG
// (paths, circles, ellipses, rects and gradients): the art tests allow no filters,
// masks, clip paths or patterns.

const SETTINGS = {
  flame: ['volcano', 'ruins', 'peaks', 'cavern', 'plains'],
  water: ['sea', 'cavern', 'sea', 'forest', 'ruins'],
  earth: ['peaks', 'forest', 'cavern', 'plains', 'ruins'],
  wind: ['sky', 'peaks', 'plains', 'sky', 'sea'],
  light: ['temple', 'plains', 'sky', 'ruins', 'peaks'],
  shadow: ['void', 'ruins', 'forest', 'cavern', 'void'],
  neutral: ['ruins', 'plains', 'temple', 'forest', 'peaks'],
};
// Night is one pick in six (Lenses, run 2: 27 of 75 cards were night and read as one palette).
const TIMES = ['dawn', 'day', 'dusk', 'day', 'dusk', 'night'];

// Cards whose subject asks for a particular place or hour.
const OVERRIDES = {
  'Ashen Dragon': { setting: 'volcano', time: 'night' },
  'Pyre Phoenix': { setting: 'volcano', time: 'dusk' },
  Meteor: { setting: 'plains', time: 'night' },
  'Abyssal Kraken': { setting: 'sea', time: 'night' },
  'Deep Sea Leviathan': { setting: 'sea', time: 'dusk' },
  Tidewall: { setting: 'sea', time: 'day' },
  Undertow: { setting: 'sea', time: 'night' },
  'Sky Sovereign': { setting: 'sky', time: 'dawn' },
  'Storm Drake': { setting: 'sky', time: 'night' },
  'Lightning Strike': { setting: 'plains', time: 'night' },
  'Celestial Guardian': { setting: 'temple', time: 'day' },
  'Sunblade Angel': { setting: 'sky', time: 'day' },
  'Divine Renewal': { setting: 'temple', time: 'dawn' },
  'Lord of the Void': { setting: 'void', time: 'night' },
  'Void Collapse': { setting: 'void', time: 'night' },
  'Worldbreaker Titan': { setting: 'peaks', time: 'dusk' },
  'Mountain Behemoth': { setting: 'sky', time: 'night' },
  'Crystal Sentinel': { setting: 'cavern', time: 'night' },
  'Crystal Heart': { setting: 'cavern', time: 'night' },
  'Mossback Tortoise': { setting: 'forest', time: 'day' },
  'Lantern Bearer': { setting: 'forest', time: 'night' },
  'Wandering Duelist': { setting: 'plains', time: 'dusk' },
  // Read-size fixes (card_art.py): subjects that drifted off-centre, touched the frame,
  // shrank, or lost contrast against a bright horizon get a fixed camera or a darker hour.
  Landslide: { setting: 'forest', time: 'night', camera: { dx: -22, dy: 0, scale: 0.98 } },
  Barrier: { camera: { dx: 0, dy: 4, scale: 0.92 } },
  'Quick Draw': { camera: { dx: 0, dy: 0, scale: 1.08 } },
  'War Banner': { setting: 'ruins', time: 'night' },
  Tidestone: { setting: 'cavern', time: 'night' },
  'Brine Witch': { setting: 'sea', time: 'night' },
  'Gloom Mite': { setting: 'cavern', time: 'night' },
  Nightblade: { setting: 'ruins', time: 'night' },
  'Rally Cry': { camera: { dx: 0, dy: 0, scale: 0.96 } },
  Wither: { camera: { dx: 0, dy: 4, scale: 0.94 } },
  'Dark Bargain': { setting: 'cavern', time: 'night', camera: { dx: 0, dy: 0, scale: 1.04 } },
  'Flame Serpent': { setting: 'temple', time: 'dusk' },
};

// --- deterministic randomness -----------------------------------------------
function hash(text) {
  let h = 2166136261;
  for (const ch of text) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r1 = (v) => Math.round(v);

// --- colour ------------------------------------------------------------------
function hex(c) { const n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function mix(a, b, t) {
  const A = hex(a), B = hex(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
const TINT = {
  dawn: { top: '#2a1f3d', horizon: '#f2a46b', amount: 0.35 },
  day: { top: '#4a6fa0', horizon: '#cfe3f0', amount: 0.3 },
  dusk: { top: '#24163a', horizon: '#ff7a59', amount: 0.4 },
  night: { top: '#03050d', horizon: '#1d2547', amount: 0.55 },
};

// --- choose ------------------------------------------------------------------
function plan(card, index) {
  const random = rng(hash(card.name) ^ Math.imul(index + 1, 0x9e3779b9));
  const options = SETTINGS[card.element] || SETTINGS.neutral;
  const pick = OVERRIDES[card.name] || {};
  const setting = pick.setting || options[Math.floor(random() * options.length)];
  const time = pick.time || TIMES[Math.floor(random() * TIMES.length)];
  // The light comes from the sun or moon; it sits on the side the subject does not.
  const side = random() < 0.5 ? -1 : 1;
  const horizon = r1(setting === 'sky' ? 250 + random() * 20 : setting === 'cavern' || setting === 'temple' ? 236 : 178 + random() * 42);
  const camera = pick.camera || { dx: r1(-side * (8 + random() * 22)), dy: r1(-6 + random() * 12), scale: +(0.94 + random() * 0.12).toFixed(2) };
  const sun = { x: r1(200 + side * (95 + random() * 70)), y: r1(46 + random() * (time === 'day' ? 30 : 70)) };
  return { random, setting, time, side, horizon, camera, sun };
}

// --- primitives ----------------------------------------------------------------
const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}"${extra ? ' ' + extra : ''}/>`;
function ridge(random, y, rough, step, minY = 20) {
  let d = `M-10 300V${r1(y)}`;
  for (let x = -10; x <= 420; x += step) d += `L${r1(x)} ${r1(Math.max(minY, y - random() * rough))}`;
  return d + 'V300Z';
}
function hills(random, y, amp) {
  let d = `M-10 300V${r1(y)}`;
  for (let x = -10; x < 420; x += 80) d += `Q${r1(x + 40)} ${r1(y - amp * (0.4 + random()))} ${r1(x + 80)} ${r1(y + (random() - 0.5) * amp * 0.4)}`;
  return d + 'V300Z';
}
function pines(random, y, n, h, color, opacity) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const x = r1(-10 + random() * 420), t = r1(h * (0.6 + random() * 0.6)), w = r1(t * 0.28);
    d += `M${x} ${y - t}L${x + w} ${y}H${x - w}Z`;
  }
  return path(d, color, `opacity="${opacity}"`);
}
function cloud(x, y, w) {
  const h = w * 0.32;
  return `M${r1(x)} ${r1(y)}a${r1(h)} ${r1(h)} 0 0 1 ${r1(w * 0.3)} ${r1(-h * 0.5)}a${r1(h * 1.2)} ${r1(h * 1.2)} 0 0 1 ${r1(w * 0.42)} ${r1(-h * 0.3)}a${r1(h)} ${r1(h)} 0 0 1 ${r1(w * 0.28)} ${r1(h * 0.8)}Z`;
}
function stars(random, n, maxY) {
  let d = '';
  for (let i = 0; i < n; i++) { const x = r1(random() * 400), y = r1(random() * maxY), s = random() < 0.15 ? 1.6 : 0.8; d += `M${x} ${y}h${s}v${s}h-${s}Z`; }
  return path(d, 'var(--white)', 'opacity=".7"');
}

// --- settings ------------------------------------------------------------------
function backdrop(p, col) {
  const { random, setting, time, horizon: H, sun } = p;
  const far = mix(col.mid, col.horizon, 0.55), near = mix(col.bg, '#000000', 0.35);
  let out = '';
  if (time === 'night' || setting === 'void') out += stars(random, setting === 'void' ? 90 : 45, H - 20);
  // sun or moon with its glow
  const body = time === 'night' ? col.white : mix(col.white, '#fff3c4', 0.5);
  if (setting !== 'cavern' && setting !== 'temple') {
    out += `<circle cx="${sun.x}" cy="${sun.y}" r="70" fill="url(#sunGlow)"/>`;
    out += `<circle cx="${sun.x}" cy="${sun.y}" r="${time === 'night' ? 13 : 17}" fill="${body}" opacity=".9"/>`;
    if (time === 'night') out += `<circle cx="${sun.x + 5}" cy="${sun.y - 3}" r="11" fill="${col.top}" opacity=".85"/>`;
  }
  if (setting === 'peaks') {
    out += path(ridge(random, H - 70, 90, 38), far, 'opacity=".55"');
    out += path(ridge(random, H - 25, 70, 30), mix(col.mid, col.bg, 0.4), 'opacity=".85"');
    out += path(`M${sun.x - 60} ${H - 70}l30 -40 20 18Z`, col.white, 'opacity=".25"');
    out += path(hills(random, H + 30, 30), near);
  } else if (setting === 'volcano') {
    const cx = r1(200 - p.side * 110);
    out += path(`M${cx - 150} 300L${cx - 30} ${H - 95}H${cx + 30}L${cx + 150} 300Z`, mix(col.mid, col.bg, 0.3));
    out += path(`M${cx - 26} ${H - 95}q26 -40 52 0Z`, col.glow, 'opacity=".9"');
    out += path(`M${cx - 6} ${H - 92}q-14 60 8 120q14 40 -6 90`, 'none', `stroke="${col.glow}" stroke-width="7" opacity=".8"`);
    out += path(cloud(cx - 70, H - 120, 160), mix(col.bg, col.mid, 0.4), 'opacity=".7"');
    out += path(hills(random, H + 40, 25), near);
    out += path(`M0 ${H + 52}q120 -14 200 4t200 -6`, 'none', `stroke="${col.glow}" stroke-width="4" opacity=".55"`);
  } else if (setting === 'sea') {
    out += path(`M-10 ${H}H410V300H-10Z`, mix(col.bg, col.mid, 0.45));
    for (let i = 0; i < 7; i++) { const y = H + 8 + i * i * 2.6; out += path(`M-10 ${r1(y)}q50 -8 100 0t100 0t100 0t110 0`, 'none', `stroke="${col.glow}" stroke-width="${1 + i * 0.4}" opacity="${(0.12 + i * 0.04).toFixed(2)}"`); }
    out += path(`M${sun.x - 14} ${H + 4}h28l12 60h-52Z`, body, 'opacity=".22"');
    if (random() < 0.6) out += path(`M${r1(200 + p.side * 150)} ${H}l10 -34 8 22 6 -14 10 26Z`, near, 'opacity=".9"');
  } else if (setting === 'forest') {
    out += pines(random, H - 10, 26, 70, far, 0.55);
    out += pines(random, H + 18, 18, 110, mix(col.mid, col.bg, 0.55), 0.9);
    out += path(hills(random, H + 34, 18), near);
  } else if (setting === 'ruins') {
    out += path(hills(random, H - 6, 34), far, 'opacity=".5"');
    for (let i = 0; i < 5; i++) {
      const x = r1(-6 + i * 92 + random() * 30), h = r1(40 + random() * 90), w = 18;
      if (Math.abs(x - 200) < 70) continue;
      out += path(`M${x} ${H + 20}V${H + 20 - h}l6 -${r1(4 + random() * 12)} 6 8 6 -5V${H + 20}ZM${x - 4} ${H + 20 - h}h${w + 8}v6h-${w + 8}Z`, mix(col.mid, col.bg, 0.5), 'opacity=".85"');
    }
    out += path(`M${r1(200 + p.side * 130)} ${H + 20}v-70a34 34 0 0 1 68 0v70h-14v-62a20 20 0 0 0 -40 0v62Z`, mix(col.mid, col.bg, 0.35), 'opacity=".8"');
    out += path(hills(random, H + 36, 14), near);
  } else if (setting === 'cavern') {
    out += path(`M-10 300V${H}Q200 ${H - 30} 410 ${H}V300Z`, near);
    let d = 'M-10 -10H410V20';
    for (let x = 410; x >= -10; x -= 26) d += `L${x} ${r1(20 + random() * 60)}L${x - 13} ${r1(8 + random() * 14)}`;
    out += path(d + 'Z', mix(col.bg, '#000000', 0.4));
    for (let i = 0; i < 6; i++) { const x = r1(20 + random() * 360), y = r1(H - 6 + random() * 30); if (Math.abs(x - 200) < 60) continue; out += path(`M${x} ${y}l7 -${r1(18 + random() * 26)} 7 ${r1(14 + random() * 10)}Z`, col.glow, 'opacity=".55"'); }
    out += `<ellipse cx="200" cy="140" rx="170" ry="120" fill="url(#sunGlow)" opacity=".7"/>`;
  } else if (setting === 'sky') {
    for (let i = 0; i < 5; i++) out += path(cloud(-40 + random() * 400, 40 + random() * 160, 90 + random() * 120), i % 2 ? col.white : far, `opacity="${(0.12 + random() * 0.2).toFixed(2)}"`);
    out += path(hills(random, H + 10, 26), mix(col.mid, col.bg, 0.45), 'opacity=".8"');
  } else if (setting === 'temple') {
    out += path(`M-10 ${H}H410V300H-10Z`, near);
    out += path(`M150 0h100l60 ${H}h-220Z`, col.white, 'opacity=".07"');
    for (const x of [26, 86, 300, 360]) out += path(`M${x} ${H}V40h22V${H}ZM${x - 6} 40h34v10h-34ZM${x - 6} ${H - 10}h34v10h-34Z`, mix(col.mid, col.bg, 0.45), 'opacity=".9"');
    out += path(`M0 0H400V26Q200 6 0 26Z`, mix(col.bg, '#000000', 0.3));
    out += `<ellipse cx="200" cy="${H}" rx="150" ry="16" fill="${col.glow}" opacity=".18"/>`;
  } else if (setting === 'void') {
    for (let i = 0; i < 3; i++) out += path(`M${r1(-40 + random() * 120)} ${r1(60 + random() * 160)}q${r1(120 + random() * 80)} -${r1(60 + random() * 60)} ${r1(260 + random() * 100)} ${r1(-20 + random() * 40)}`, 'none', `stroke="${col.glow}" stroke-width="${r1(10 + random() * 20)}" opacity=".08" stroke-linecap="round"`);
    out += `<circle cx="${r1(200 + p.side * 120)}" cy="${r1(70 + random() * 40)}" r="34" fill="none" stroke="${col.glow}" stroke-width="3" opacity=".35"/>`;
    out += path(`M-10 300V${H + 20}Q200 ${H - 10} 410 ${H + 20}V300Z`, near);
  } else { // plains
    out += path(hills(random, H - 10, 30), far, 'opacity=".55"');
    out += path(hills(random, H + 14, 24), mix(col.mid, col.bg, 0.5), 'opacity=".9"');
    out += path(`M200 300Q${r1(200 + p.side * 30)} ${H + 50} ${r1(200 - p.side * 40)} ${H + 14}`, 'none', `stroke="${col.white}" stroke-width="6" opacity=".18"`);
    out += path(hills(random, H + 46, 10), near);
  }
  return out;
}

// Foreground framing and particles: drawn over the subject's surroundings for depth,
// kept away from the subject's middle so its silhouette still reads.
function foreground(p, col, element) {
  const { random, setting } = p;
  let out = '';
  const dark = mix(col.bg, '#000000', 0.55);
  const left = random() < 0.5;
  if (setting === 'forest') out += path(left ? 'M-10 300V40q30 60 20 120l24 -14q-10 70 18 154Z' : 'M410 300V40q-30 60 -20 120l-24 -14q10 70 -18 154Z', dark);
  else if (setting === 'cavern') out += path(left ? 'M-10 300V150q40 40 34 80q30 10 40 70Z' : 'M410 300V150q-40 40 -34 80q-30 10 -40 70Z', dark);
  else out += path(left ? 'M-10 300V262q40 -20 70 -6q30 -16 50 6l10 38Z' : 'M410 300V262q-40 -20 -70 -6q-30 -16 -50 6l-10 38Z', dark);
  // element particles
  let d = '';
  const n = 16;
  for (let i = 0; i < n; i++) {
    let x = r1(random() * 400), y = r1(random() * 300);
    if (Math.abs(x - 200) < 80 && y > 50 && y < 250) x = x < 200 ? x - 90 : x + 90;
    const s = 1 + random() * 2.6;
    if (element === 'flame') d += `M${x} ${y}l${r1(s)} -${r1(s * 2.4)} ${r1(s)} ${r1(s * 2.4)}Z`;
    else if (element === 'water') d += `M${x + s} ${y}a${s.toFixed(1)} ${s.toFixed(1)} 0 1 0 0.1 0Z`;
    else if (element === 'earth') d += `M${x} ${y}l${r1(s * 1.6)} -${r1(s)} ${r1(s)} ${r1(s * 1.8)}Z`;
    else if (element === 'wind') d += `M${x} ${y}q${r1(s * 4)} -${r1(s * 2)} ${r1(s * 9)} 0`;
    else if (element === 'light') d += `M${x} ${y - s * 2}l${(s * 0.5).toFixed(1)} ${(s * 1.5).toFixed(1)} ${(s * 1.5).toFixed(1)} ${(s * 0.5).toFixed(1)} -${(s * 1.5).toFixed(1)} ${(s * 0.5).toFixed(1)} -${(s * 0.5).toFixed(1)} ${(s * 1.5).toFixed(1)} -${(s * 0.5).toFixed(1)} -${(s * 1.5).toFixed(1)} -${(s * 1.5).toFixed(1)} -${(s * 0.5).toFixed(1)} ${(s * 1.5).toFixed(1)} -${(s * 0.5).toFixed(1)}Z`;
    else if (element === 'shadow') d += `M${x} ${y}q${r1(s * 3)} -${r1(s * 4)} 0 -${r1(s * 8)}`;
    else d += `M${x} ${y}h${r1(s * 2)}v${r1(s * 2)}h-${r1(s * 2)}Z`;
  }
  const stroke = element === 'wind' || element === 'shadow';
  out += path(d, stroke ? 'none' : col.glow, stroke ? `stroke="${col.white}" stroke-width="1.6" stroke-linecap="round" opacity=".45"` : 'opacity=".7"');
  return out;
}

// Light direction for the subject's form shading: from the sun's side, from above.
function lightVector(p) {
  const fromLeft = p.sun.x < 200;
  return fromLeft ? { x1: 0, y1: 0, x2: 1, y2: 1 } : { x1: 1, y1: 0, x2: 0, y2: 1 };
}

function scene(card, index, palette, ownComposition = false) {
  const [bg, mid, glow, white] = palette;
  const p = plan(card, index);
  const tint = TINT[p.time];
  const col = {
    bg, mid, glow, white,
    top: mix(bg, tint.top, tint.amount),
    horizon: mix(mid, tint.horizon, tint.amount * 0.8),
  };
  const lv = lightVector(p);
  const defs = `<linearGradient id="sky" x2="0" y2="1"><stop stop-color="${col.top}"/><stop offset="${(p.horizon / 300).toFixed(2)}" stop-color="${col.horizon}"/><stop offset="1" stop-color="${mix(bg, '#000000', 0.3)}"/></linearGradient>`
    + `<radialGradient id="sunGlow"><stop stop-color="${p.time === 'night' ? white : mix(white, tint.horizon, 0.4)}" stop-opacity=".55"/><stop offset="1" stop-color="${col.horizon}" stop-opacity="0"/></radialGradient>`
    + `<linearGradient id="form" x1="${lv.x1}" y1="${lv.y1}" x2="${lv.x2}" y2="${lv.y2}"><stop stop-color="${white}" stop-opacity=".3"/><stop offset=".42" stop-color="${white}" stop-opacity="0"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient>`
    + `<radialGradient id="vignette" cx=".5" cy=".46" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>`;
  const sky = `<rect width="400" height="300" fill="url(#sky)"/>`;
  // A redrawn subject composes itself; the automatic camera applies to the older drawings.
  const { dx, dy, scale } = ownComposition ? { dx: 0, dy: 0, scale: 1 } : p.camera;
  const shadowX = r1(200 + dx + (p.sun.x < 200 ? 26 : -26));
  const ground = `<ellipse cx="${shadowX}" cy="${Math.min(282, p.horizon + 62)}" rx="${r1(130 * scale)}" ry="15" fill="#03050b" opacity=".6"/>`;
  return {
    defs,
    back: sky + backdrop(p, col) + `<circle cx="${200 + dx}" cy="${150 + dy}" r="130" fill="url(#aura)"/>` + ground,
    front: foreground(p, col, card.element) + `<rect width="400" height="300" fill="url(#vignette)"/>`,
    transform: `translate(${200 + dx} ${160 + dy}) scale(${scale}) translate(-200 -160)`,
    // Lit flesh: a warm-lit midtone on the light side instead of near-black throughout.
    flesh: [mix(glow, white, 0.15), mix(mid, glow, 0.35), mix(bg, mid, 0.35)],
    describe: `${p.setting} at ${p.time}`,
    plan: { setting: p.setting, time: p.time, camera: p.camera, horizon: p.horizon },
  };
}

module.exports = { scene, plan, mix, SETTINGS, OVERRIDES };
