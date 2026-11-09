// Shared helpers for the woodcut + stained glass ("carved glass") card style. See docs/ART_STYLE.md.
const R = Math.round;
const INK = '#120c10';
const PAL = {
  white: ['#ffffff', '#fff3c0', '#ffc840'],
  gold: ['#fff6c8', '#f4c03c', '#a8640e'],
  amber: ['#ffd890', '#f08a1c', '#94360a'],
  orange: ['#ffb070', '#e8501a', '#7e1c08'],
  red: ['#ff8a60', '#d0281e', '#560810'],
  ruby: ['#ff8aa0', '#c8183a', '#520418'],
  wine: ['#b84060', '#681430', '#26060f'],
  violet: ['#8a70d0', '#3e2a80', '#140c34'],
  deep: ['#5a80e0', '#1f3c8c', '#0a1438'],
  navy: ['#3a56b0', '#162a6a', '#080e2a'],
  sky: ['#b8e0ff', '#4a90dc', '#16428e'],
  teal: ['#80e8d8', '#1a9a90', '#0a3c44'],
  ash: ['#9a8aa0', '#46384e', '#160e1a'],
  bronze: ['#f0c870', '#a87024', '#44240a'],
  steel: ['#e4eeff', '#8aa6d0', '#2e3e66'],
  pearl: ['#ffffff', '#e6f0ff', '#94b4e0'],
  ivory: ['#ffffff', '#fbefc4', '#c8a456'],
  skin: ['#fff2e0', '#f0c8a0', '#a8704c'],
};
function defs(names) {
  return '<defs>' + names.map((n) => {
    const c = PAL[n];
    return `<radialGradient id="${n}" cx=".35" cy=".3" r=".8"><stop stop-color="${c[0]}"/><stop offset=".55" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[2]}"/></radialGradient>`;
  }).join('') + '</defs>';
}
const pt = (cx, cy, r, a) => [R(cx + r * Math.cos(a)), R(cy + r * Math.sin(a))];
// Concentric pane rings (the carved sunburst). colors(ring, i) -> palette name
function burst(cx, cy, radii, n, colors, rot = 0) {
  const by = {};
  for (let k = 0; k < radii.length - 1; k++) {
    const r0 = radii[k], r1 = radii[k + 1];
    const N = Array.isArray(n) ? n[k] : n;
    const off = rot + (k % 2 ? Math.PI / N : 0);
    for (let i = 0; i < N; i++) {
      const a0 = off + (i * 2 * Math.PI) / N, a1 = off + ((i + 1) * 2 * Math.PI) / N;
      const c = colors(k, i);
      if (!c) continue;
      const [x1, y1] = pt(cx, cy, r1, a0), [x2, y2] = pt(cx, cy, r1, a1);
      let d;
      if (r0 === 0) d = `M${cx} ${cy}L${x1} ${y1}A${r1} ${r1} 0 0 1 ${x2} ${y2}Z`;
      else {
        const [x3, y3] = pt(cx, cy, r0, a1), [x4, y4] = pt(cx, cy, r0, a0);
        d = `M${x1} ${y1}A${r1} ${r1} 0 0 1 ${x2} ${y2}L${x3} ${y3}A${r0} ${r0} 0 0 0 ${x4} ${y4}Z`;
      }
      const sm = [0, 0.25, 0.5, 0.75, 1].flatMap((f) => [r0, (r0 + r1) / 2, r1].map((r) => pt(cx, cy, r, a0 + (a1 - a0) * f)));
      if (!sm.some(([x, y]) => x > 14 && x < 386 && y > 10 && y < 288)) continue;
      by[c] = (by[c] || '') + `<path d="${d}"/>`;
    }
  }
  return Object.entries(by).map(([c, p]) => `<g fill="url(#${c})">${p}</g>`).join('');
}
// cubic bezier helpers
function bz(p, t) {
  const u = 1 - t;
  return [0, 1].map((j) => u * u * u * p[0][j] + 3 * u * u * t * p[1][j] + 3 * u * t * t * p[2][j] + t * t * t * p[3][j]);
}
function dbz(p, t) {
  const u = 1 - t;
  return [0, 1].map((j) => 3 * u * u * (p[1][j] - p[0][j]) + 6 * u * t * (p[2][j] - p[1][j]) + 3 * t * t * (p[3][j] - p[2][j]));
}
// Hatching: n strokes along contour p, pointing to `side` (+1 left of travel, -1 right).
// Lengths swell from l0 to l1 (or peak in the middle with swell:true). tilt rotates strokes.
function hatch(p, n, l0, l1, side, o = {}) {
  const { t0 = 0.06, t1 = 0.94, inset = 3, tilt = 0, swell = false } = o;
  let d = '';
  for (let i = 0; i < n; i++) {
    const s = n === 1 ? 0.5 : i / (n - 1), t = t0 + (t1 - t0) * s;
    const [x, y] = bz(p, t), [dx, dy] = dbz(p, t), L = Math.hypot(dx, dy) || 1;
    let nx = (side * dy) / L, ny = (-side * dx) / L;
    const c = Math.cos(tilt), sn = Math.sin(tilt);
    [nx, ny] = [nx * c - ny * sn, nx * sn + ny * c];
    const len = swell ? l0 + (l1 - l0) * Math.sin(Math.PI * s) : l0 + (l1 - l0) * s;
    const sx = R(x + nx * inset), sy = R(y + ny * inset);
    d += `M${sx} ${sy}l${R(nx * len)} ${R(ny * len)}`;
  }
  return d;
}
// parallel offset of a contour (for gouged highlight lines inside the lit edge)
function offset(p, dist, side, n = 8, t0 = 0.08, t1 = 0.92) {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const t = t0 + ((t1 - t0) * i) / n;
    const [x, y] = bz(p, t), [dx, dy] = dbz(p, t), L = Math.hypot(dx, dy) || 1;
    d += (i ? 'L' : 'M') + R(x + (side * dy * dist) / L) + ' ' + R(y + (-side * dx * dist) / L);
  }
  return d;
}
// Gothic window frame: bronze plate with arched opening, gilt spandrels and jewel rivets.
function frame(jewel = 'ruby') {
  const open = 'M16 286V74Q16 16 74 16H164Q186 16 200 6Q214 16 236 16H326Q384 16 384 74V286Z';
  let s = `<path d="M0 0H400V300H0Z${open}" fill="url(#bronze)" fill-rule="evenodd"/>`;
  s += `<g fill="none" stroke="${INK}"><path d="${open}" stroke-width="6"/><path d="M3 3H397V297H3Z" stroke-width="6"/>`;
  s += `<path stroke-width="1.5" d="M9 290V70Q9 9 70 9H160Q182 9 200 1M391 290V70Q391 9 330 9H240Q218 9 200 1"/></g>`;
  s += `<g stroke="${INK}" stroke-width="3"><path d="M16 74Q16 16 74 16H104Q48 28 30 96Q22 84 16 74Z" fill="url(#gold)"/><path d="M384 74Q384 16 326 16H296Q352 28 370 96Q378 84 384 74Z" fill="url(#gold)"/>`;
  for (const [x, y, r] of [[9, 9, 6], [391, 9, 6], [9, 291, 6], [391, 291, 6], [200, 293, 5], [9, 180, 4], [391, 180, 4]]) s += `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${jewel})"/>`;
  return s + '</g>';
}
function svg(title, desc, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><title>${title}</title><desc>${desc}</desc>${body}</svg>\n`;
}
// ink batches: collect strokes per width, flush as one path each
function Ink() {
  const m = {};
  const add = (d, w = 1.6, c = INK) => { const k = w + '|' + c; m[k] = (m[k] || '') + d; return ''; };
  const flush = () => { const o = Object.entries(m).map(([k, d]) => { const [w, c] = k.split('|'); return `<path d="${d}" stroke="${c}" stroke-width="${w}"/>`; }).join(''); for (const k in m) delete m[k]; return o ? `<g fill="none" stroke-linecap="round">${o}</g>` : ''; };
  return { add, flush };
}
module.exports = { Ink, R, INK, PAL, defs, burst, hatch, offset, frame, svg, pt };
