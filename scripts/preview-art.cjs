#!/usr/bin/env node
'use strict';
// Render chosen cards to a scratch folder without touching assets/ (for drawing work).
//   node scripts/preview-art.cjs --out /tmp/x [--png] "Cinder Wolf" "Void Hound" ...
// Writes <slug>.svg for each card and, with --png, sheet.png (400x300 per card, 3 across).
const fs = require('node:fs');
const path = require('node:path');
process.env.ART_LENIENT = '1';
const { render, cards, slug } = require('./build-card-art.cjs');
const args = process.argv.slice(2);
const out = args[args.indexOf('--out') + 1];
if (!out || args.indexOf('--out') < 0) throw new Error('--out DIR is required');
const names = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--out');
fs.mkdirSync(out, { recursive: true });
const chosen = names.length ? names : cards.map((c) => c.name);
for (const name of chosen) {
  const index = cards.findIndex((c) => c.name === name);
  if (index < 0) throw new Error(`Unknown card: ${name}`);
  fs.writeFileSync(path.join(out, `${slug(name)}.svg`), render(cards[index], index));
}
console.log(`Wrote ${chosen.length} SVGs to ${out}`);
if (args.includes('--png')) {
  const { chromium } = require('playwright');
  (async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1200, height: 300 * Math.ceil(chosen.length / 3) } });
    const imgs = chosen.map((n) => `<img width="400" height="300" src="data:image/svg+xml;base64,${fs.readFileSync(path.join(out, `${slug(n)}.svg`)).toString('base64')}">`).join('');
    await page.setContent(`<body style="margin:0;display:flex;flex-wrap:wrap;background:#000">${imgs}</body>`);
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(out, 'sheet.png') });
    await browser.close();
    console.log(`Wrote ${path.join(out, 'sheet.png')}`);
  })();
}
