'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const { build, cards, slug } = require('../scripts/build-card-art.cjs');
const art = require('../card-art.js');
const root = path.resolve(__dirname, '..');
const generated = build();

// These assets intentionally use a small XML/SVG subset. Validate the complete
// token stream (not just an opening <svg>), geometry arities, and local references
// without adding an XML or rendering dependency to the game's Node test suite.
function validateSvg(source, name) {
  const tags = new Set(['svg', 'title', 'desc', 'defs', 'linearGradient', 'radialGradient', 'stop', 'g', 'rect', 'circle', 'ellipse', 'path']);
  const stack = [];
  const ids = new Set();
  const refs = [];
  const tokens = source.match(/<[^>]*>|[^<]+/g);
  assert.equal(tokens.join(''), source, `${name}: complete XML token stream`);
  let roots = 0;
  for (const token of tokens) {
    if (!token.startsWith('<')) {
      assert.ok(!/[<>]|&(?!amp;|lt;|gt;|quot;|apos;)/.test(token), `${name}: escaped text`);
      if (token.trim()) assert.ok(['title', 'desc'].includes(stack.at(-1)), `${name}: metadata-only text`);
      continue;
    }
    const closing = token.match(/^<\/([A-Za-z][A-Za-z0-9]*)>$/);
    if (closing) { assert.equal(stack.pop(), closing[1], `${name}: balanced XML`); continue; }
    const opening = token.match(/^<([A-Za-z][A-Za-z0-9]*)([\s\S]*?)(\/?)>$/);
    assert.ok(opening, `${name}: well-formed opening tag`);
    const [, tag, rawAttrs, selfClosing] = opening;
    assert.ok(tags.has(tag), `${name}: passive SVG tag ${tag}`);
    if (!stack.length) { roots++; assert.equal(tag, 'svg'); }
    const seen = new Set();
    const attrs = {};
    let cursor = 0;
    const pattern = /\s+([A-Za-z_][A-Za-z0-9_.:-]*)="([^"<>]*)"/gy;
    while (cursor < rawAttrs.length && rawAttrs.slice(cursor).trim()) {
      pattern.lastIndex = cursor;
      const match = pattern.exec(rawAttrs);
      assert.ok(match, `${name}: valid quoted attributes in ${tag}`);
      cursor = pattern.lastIndex;
      const [, key, value] = match;
      assert.ok(!seen.has(key), `${name}: unique ${key} attribute`);
      seen.add(key); attrs[key] = value;
      assert.ok(!/^on/i.test(key) && !/href$/i.test(key), `${name}: no active/external attributes`);
      assert.ok(!/&(?!(?:amp|lt|gt|quot|apos);)/.test(value), `${name}: escaped attribute`);
      if (key === 'id') { assert.ok(!ids.has(value)); ids.add(value); }
      if (key !== 'xmlns') assert.ok(!/https?:|data:|javascript:|@import/i.test(value), `${name}: no external content`);
      for (const ref of value.matchAll(/url\(([^)]+)\)/g)) {
        assert.match(ref[1], /^#[a-zA-Z][\w-]*$/, `${name}: local paint reference`);
        refs.push(ref[1].slice(1));
      }
    }
    if (tag === 'svg') {
      assert.equal(attrs.xmlns, 'http://www.w3.org/2000/svg');
      assert.match(attrs.viewBox, /^0 0 \d+ \d+$/);
      assert.equal(attrs.role, 'img');
      refs.push(...attrs['aria-labelledby'].split(' '));
    }
    if (tag === 'path') validatePath(attrs.d, name);
    if (!selfClosing) stack.push(tag);
  }
  assert.equal(roots, 1, `${name}: exactly one root`);
  assert.deepEqual(stack, [], `${name}: no unclosed tags`);
  for (const ref of refs) assert.ok(ids.has(ref), `${name}: defined local reference #${ref}`);
}

function validatePath(data, name) {
  assert.ok(data, `${name}: nonempty path`);
  const tokens = data.match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g);
  assert.equal(tokens.join(''), data.replace(/[\s,]+/g, ''), `${name}: valid path tokens`);
  assert.match(tokens[0], /^[mM]$/, `${name}: path begins with move`);
  const arity = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };
  for (let i = 0; i < tokens.length;) {
    const command = tokens[i++].toUpperCase();
    assert.ok(Object.hasOwn(arity, command), `${name}: supported path command ${command}`);
    let count = 0;
    while (i < tokens.length && !/^[a-zA-Z]$/.test(tokens[i])) {
      assert.ok(Number.isFinite(Number(tokens[i++]))); count++;
    }
    if (arity[command] === 0) assert.equal(count, 0);
    else assert.ok(count >= arity[command] && count % arity[command] === 0, `${name}: ${command} parameter count ${count}`);
  }
}

test('all 75 catalog cards resolve to unique, checked-in artwork', () => {
  assert.equal(cards.length, 75);
  assert.equal(Object.keys(art.manifest).length, cards.length);
  assert.equal(new Set(Object.values(art.manifest)).size, cards.length);
  for (const card of cards) {
    assert.equal(art.src(card), `assets/cards/${slug(card.name)}.svg`);
    assert.ok(fs.existsSync(path.join(root, art.src(card))), card.name);
  }
});

test('unknown and malformed card lookups use the shared card back', () => {
  for (const input of [undefined, null, {}, '', 'Unknown Card', '__proto__', 'constructor', { name: '../cards.js' }]) {
    assert.equal(art.src(input), 'assets/card-back.svg');
  }
  assert.equal(art.src('Cinder Wolf'), art.src({ name: 'Cinder Wolf' }));
  assert.ok(Object.isFrozen(art));
  assert.ok(Object.isFrozen(art.manifest));
});

test('browser API mounts without CommonJS or game globals', () => {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'card-art.js'), 'utf8'), context);
  assert.equal(context.window.ShadowCardArt.src({ name: 'Ashen Dragon' }), 'assets/cards/ashen-dragon.svg');
  assert.equal(context.window.ShadowCardArt.src(null), 'assets/card-back.svg');
});

test('every SVG is standalone, well-formed, accessible, and passive', () => {
  for (const [name, content] of generated) if (name.endsWith('.svg')) validateSvg(content, name);
});

test('all catalog illustrations contain distinct subject geometry, not renamed images', () => {
  const seen = new Set();
  for (const card of cards) {
    const svg = generated.get(art.src(card));
    const subject = svg.split('<g stroke-linejoin="round">')[1].split('<rect width="400" height="300" fill="url(#shade)"/>')[0];
    assert.ok(subject.length > 350, `${card.name}: subject detail`);
    assert.ok(!seen.has(subject), `${card.name}: distinct subject`);
    seen.add(subject);
  }
});

test('generated files are deterministic and checked-in output is current', () => {
  assert.deepEqual(build(), generated);
  for (const [name, content] of generated) assert.equal(fs.readFileSync(path.join(root, name), 'utf8'), content, name);
  const output = execFileSync(process.execPath, ['scripts/build-card-art.cjs', '--check'], { cwd: root, encoding: 'utf8' });
  assert.match(output, /Verified 75 card illustrations/);
});

test('complete original vector set stays below a 1.25 MB asset budget (and 220 KB gzipped)', () => {
  const bytes = [...generated].filter(([name]) => name.endsWith('.svg')).reduce((sum, [, content]) => sum + Buffer.byteLength(content), 0);
  // Raised from 900 KB for the woodcut + stained glass plates (owner's choice, run 3); SVG
  // compresses well, so the gzipped size is what a player downloads.
  assert.ok(bytes < 1_250_000, `${bytes} bytes`);
  const zipped = require('node:zlib').gzipSync([...generated].filter(([name]) => name.endsWith('.svg')).map(([, c]) => c).join('')).length;
  assert.ok(zipped < 220_000, `${zipped} bytes gzipped`);
});
