/* Real Chromium smoke test. Uses UI interactions; state reads are assertions, not fixtures. */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const args = process.argv.slice(2);
const option = (name, fallback) => { const index = args.indexOf(name); return index < 0 ? fallback : args[index + 1]; };
const url = option('--url', process.env.BROWSER_URL || 'http://127.0.0.1:4198');
const output = path.resolve(option('--output', 'artifacts/browser'));
const only = option('--only', '');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const results = { url, checks: [], screenshots: [], pageErrors: [], localHttpErrors: [], layouts: [] };
let browser;
const snapshot = page => page.evaluate(() => ShadowDuelGame.snapshot());
async function check(name, work) { if (only && !new RegExp(only, 'i').test(name)) return; await work(); results.checks.push(name); console.log(`PASS ${name}`); }
async function screenshot(page, name) { await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: path.join(output, name + '.png'), fullPage: true }); results.screenshots.push(name + '.png'); }
async function newPage() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage(); page.setDefaultTimeout(12000);
  page.on('pageerror', error => results.pageErrors.push(error.message));
  page.on('response', response => { if (response.url().startsWith(url) && response.status() >= 400) results.localHttpErrors.push({ url: response.url(), status: response.status() }); });
  await page.goto(url); await page.waitForFunction(() => window.ShadowLobbyUI && window.ShadowDuelGame && document.querySelector('#menu-art img')?.complete);
  return page;
}
async function converged(a, b) {
  for (let attempt = 0; attempt < 60; attempt++) {
    const [left, right] = await Promise.all([snapshot(a), snapshot(b)]);
    if (JSON.stringify(left) === JSON.stringify(right)) return left;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  assert.deepEqual(await snapshot(a), await snapshot(b), 'Both peer snapshots converge');
}
async function layout(page, label) {
  const value = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  results.layouts.push({ label, ...value });
  assert.ok(value.scroll <= value.width + 1 && value.body <= value.width + 1, `${label}: no page-level horizontal overflow ${JSON.stringify(value)}`);
}
async function verifyHud(page) {
  const expected = await page.evaluate(() => {
    const state = ShadowDuelGame.state();
    const seat = ShadowDuelGame.isOnline() ? ShadowDuelGame.session().localSeat : state.currentPlayer;
    const player = state.players[seat];
    return { energy: `${player.energy} / ${player.maxEnergy}`, deck: player.deck.length, life: player.lp, bar: Math.max(0, Math.min(100, player.lp / ShadowDuelGame.rules().startingLP * 100)) };
  });
  assert.equal((await page.textContent('#energy-display')).trim(), expected.energy);
  assert.equal((await page.textContent('#player-energy')).trim(), expected.energy, 'Actual HUD energy');
  assert.equal(Number(await page.textContent('#player-deck')), expected.deck, 'Actual HUD deck');
  assert.equal(Number((await page.textContent('#player-life')).replace(/,/g, '')), expected.life, 'Actual HUD life');
  assert.equal(await page.locator('#player-life-bar').evaluate(el => parseFloat(el.style.width)), expected.bar, 'Actual HUD life bar');
}
async function playLegal(page, onlyMonster = false) {
  const card = await page.evaluate(monster => {
    const g = ShadowDuelGame, s = g.state(), seat = g.isOnline() ? g.session().localSeat : s.currentPlayer;
    return s.players[seat].hand.find(c => (!monster || c.type === 'monster') && g.canPlay(c.id)) || null;
  }, onlyMonster);
  if (!card) return false;
  await page.locator(`#player-hand [data-card-id="${card.id}"]`).click({ position: { x: 35, y: 65 } });
  return true;
}
(async () => {
  await fs.mkdir(output, { recursive: true });
  browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await newPage();
  await check('desktop menu and all 55 SVG artworks decode', async () => {
    await layout(page, 'desktop-menu');
    assert.equal(await page.evaluate(() => getComputedStyle(document.body).overflow), 'hidden', 'Menu locks background scrolling');
    await screenshot(page, '01-menu-desktop');
    const art = await page.evaluate(async () => {
      const cards = [...MONSTER_TEMPLATES, ...SPELL_TEMPLATES, ...RELIC_TEMPLATES];
      const urls = cards.map(card => ShadowCardArt.src(card));
      await Promise.all(urls.map(async src => { const image = new Image(); image.src = src; await image.decode(); if (!image.naturalWidth) throw new Error(src); }));
      return { count: cards.length, unique: new Set(urls).size };
    }); assert.deepEqual(art, { count: 55, unique: 55 });
  });
  await check('collection filters, empty results, reset, inspection and rules', async () => {
    await page.locator('#lobby-menu [data-open-collection]').click();
    assert.equal(await page.locator('.collection-card').count(), 55);
    assert.equal(await page.evaluate(() => getComputedStyle(document.body).overflow), 'hidden', 'Modal locks background scrolling');
    await page.selectOption('#collection-type', 'monster');
    assert.ok(await page.locator('.collection-card').count() > 0);
    await page.selectOption('#collection-element', 'flame');
    assert.ok(await page.locator('.collection-card').count() > 0);
    await page.fill('#collection-search', 'zzzz-no-card');
    assert.equal(await page.locator('.collection-card').count(), 0);
    assert.match(await page.textContent('.collection-empty'), /No matching/);
    await page.click('#collection-reset'); assert.equal(await page.locator('.collection-card').count(), 55);
    const before = await snapshot(page);
    await page.locator('.collection-card').first().click();
    assert.equal(await page.locator('#collection-preview').isVisible(), true);
    assert.deepEqual(await snapshot(page), before);
    await screenshot(page, '02-collection-desktop');
    await page.click('#collection-preview-close'); await page.keyboard.press('Escape');
    await page.locator('#lobby-menu [data-open-rules]').click();
    assert.match(await page.textContent('#rules-dialog'), /Guard|guard/);
    await page.keyboard.press('Escape'); assert.equal(await page.locator('#rules-dialog').isVisible(), false);
  });
  await check('local UI play, inspection, keyboard, counters, turn, surrender and restart', async () => {
    await page.click('#menu-local-btn');
    const initial = await snapshot(page); assert.equal(initial.gameOver, false);
    const unavailable = page.locator('#player-hand .card[aria-disabled="true"] .card-inspect');
    if (await unavailable.count()) assert.equal(await unavailable.first().isEnabled(), true, 'Unplayable cards remain inspectable');
    const handCard = page.locator('#player-hand .card').first();
    await handCard.locator('.card-inspect').click();
    assert.deepEqual(await snapshot(page), initial, 'Inspecting never spends energy/cards');
    await page.click('#close-card-detail');
    await handCard.focus(); await page.keyboard.press('i');
    assert.equal(await page.locator('#card-detail-panel').isVisible(), true);
    assert.deepEqual(await snapshot(page), initial); await page.keyboard.press('Escape');
    let played = 0;
    for (let turn = 0; turn < 10; turn++) {
      if (await playLegal(page, true)) played++;
      await verifyHud(page);
      const state = await snapshot(page);
      const player = state.players[state.currentPlayer];
      assert.equal((await page.textContent('#energy-display')).trim(), `${player.energy} / ${player.maxEnergy}`);
      assert.equal(Number((await page.textContent('#player-life')).replace(/,/g, '')), player.lp);
      if (played >= 2) break;
      const prior = state.turnNumber; await page.click('#end-turn-btn');
      assert.equal((await snapshot(page)).turnNumber, prior + 1);
    }
    assert.ok(played >= 2, 'Naturally drawn legal monsters can be played on both sides');
    await screenshot(page, '03-local-populated-desktop');
    await page.click('#surrender-btn'); assert.equal((await snapshot(page)).gameOver, true);
    await page.click('#restart-btn'); assert.equal((await snapshot(page)).gameOver, false);
  });
  await check('tablet and mobile layouts, collection and readable card details', async () => {
    if (await page.locator('#lobby-menu').isVisible()) await page.click('#menu-local-btn');
    for (const width of [768, 390, 360]) {
      for (let attempt = 0; attempt < 10; attempt++) {
        if (await playLegal(page, true)) break;
        await page.click('#end-turn-btn');
      }
      await page.setViewportSize({ width, height: 900 });
      const inspectButtons = await page.locator('.card-inspect:visible').evaluateAll(buttons => buttons.map(button => { const box = button.getBoundingClientRect(); return { width: box.width, height: box.height }; }));
      assert.ok(inspectButtons.every(box => box.width >= 24 && box.height >= 24), 'Inspect hit targets are at least 24px');
      for (const id of ['end-turn-btn', 'surrender-btn']) {
        const box = await page.locator('#' + id).boundingBox(); assert.ok(box.height >= 40 && box.width >= 40, id + ' usable touch target ' + JSON.stringify(box));
      }
      await layout(page, `board-${width}`);
      const stats = await page.locator('.field .card .card-stats').evaluateAll(elements => elements.map(element => {
        const text = element.getBoundingClientRect(), card = element.closest('.card').getBoundingClientRect();
        return { textBottom: text.bottom, cardBottom: card.bottom, textRight: text.right, cardRight: card.right };
      }));
      assert.ok(stats.length > 0 && stats.every(box => box.textBottom <= box.cardBottom + 1 && box.textRight <= box.cardRight + 1), 'Field stats fit inside each card: ' + JSON.stringify(stats));
      await page.locator('#player-hand .card').first().locator('.card-inspect').click();
      const detail = await page.locator('#card-detail-panel').boundingBox();
      assert.ok(detail.width >= 240 && detail.x >= -1 && detail.x + detail.width <= width + 1, 'Card detail stays inside viewport');
      const art = await page.locator('#card-detail-content .card-art').boundingBox(); assert.ok(art.width >= 180 && art.height >= 120);
      await screenshot(page, `04-details-${width}`); await page.click('#close-card-detail');
      await screenshot(page, `05-board-${width}`);
      await page.click('#menu-btn'); await layout(page, `menu-${width}`);
      await screenshot(page, `06-menu-${width}`);
      await page.locator('#lobby-menu [data-open-collection]').click(); await layout(page, `collection-${width}`);
      await page.locator('.collection-card').first().click(); await screenshot(page, `07-collection-${width}`);
      await page.keyboard.press('Escape'); await page.click('#menu-local-btn');
    }
    await page.setViewportSize({ width: 1440, height: 1000 }); await page.click('#menu-btn');
  });
  const guest = await newPage();
  await check('real two-browser-context WebRTC create/join/ready/start', async () => {
    await page.click('#menu-create-btn'); await page.fill('#create-name', 'Browser Host'); await page.click('#create-lobby-btn');
    await page.waitForFunction(() => /^[A-Z0-9]{4}$/.test(document.querySelector('#lobby-code-display').textContent));
    const code = (await page.textContent('#lobby-code-display')).trim();
    await guest.goto(`${url}/?lobby=${code}`); await guest.waitForSelector('#lobby-join:not(.hidden)');
    assert.equal(await guest.inputValue('#join-code'), code);
    await guest.fill('#join-name', 'Browser Guest'); await guest.click('#join-lobby-btn');
    await Promise.all([page.waitForFunction(() => ShadowNet.isConnected(), null, { timeout: 30000 }), guest.waitForFunction(() => ShadowNet.isConnected(), null, { timeout: 30000 })]);
    assert.equal(await page.locator('#start-match-btn').isDisabled(), true);
    await guest.click('#start-match-btn'); await page.waitForFunction(() => ShadowNet.peerReady);
    await page.click('#start-match-btn');
    await guest.waitForFunction(() => ShadowDuelGame.isOnline() && !ShadowDuelGame.state().gameOver);
    const state = await converged(page, guest); assert.equal(state.turnNumber, 1);
    assert.equal(await page.evaluate(() => ShadowDuelGame.session().localSeat), 0);
    assert.equal(await guest.evaluate(() => ShadowDuelGame.session().localSeat), 1);
    await screenshot(page, '08-online-host'); await screenshot(guest, '09-online-guest');
  });
  await check('online legal UI actions converge and off-turn actions are blocked', async () => {
    let attacks = 0;
    for (let turn = 0; turn < 10; turn++) {
      const state = await converged(page, guest);
      const active = state.currentPlayer === 0 ? page : guest;
      const inactive = state.currentPlayer === 0 ? guest : page;
      assert.equal(await inactive.locator('#end-turn-btn').isDisabled(), true);
      const before = await snapshot(inactive);
      const blockedCard = inactive.locator('#player-hand .card').first();
      await blockedCard.scrollIntoViewIfNeeded();
      const blockedBox = await blockedCard.boundingBox();
      await inactive.mouse.click(blockedBox.x + 35, blockedBox.y + 65);
      assert.deepEqual(await snapshot(inactive), before);
      if (await playLegal(active, true) || await playLegal(active)) await converged(page, guest);
      const attacker = await active.evaluate(() => {
        const state = ShadowDuelGame.state();
        return state.players[state.currentPlayer].field.findIndex(slot => slot && !slot.summonSickness && !slot.hasAttacked && !slot.stunned);
      });
      if (attacker >= 0) {
        await active.locator(`#player-field [data-slot="${attacker}"] .card`).click({ position: { x: 30, y: 55 } });
        const target = active.locator('#opponent-field .zone.targetable').first();
        if (await target.count()) { await target.click({ position: { x: 12, y: 12 } }); attacks++; await converged(page, guest); }
      }
      await verifyHud(page); await verifyHud(guest);
      await active.click('#end-turn-btn');
      assert.equal((await converged(page, guest)).turnNumber, state.turnNumber + 1);
    }
    assert.ok(attacks > 0, 'At least one real UI attack was delivered and converged');
    await screenshot(page, '10-online-populated');
  });
  await check('online surrender, mutual rematch, disconnect and fresh rejoin lifecycle', async () => {
    await guest.click('#surrender-btn');
    const ended = await converged(page, guest); assert.equal(ended.gameOver, true); assert.equal(ended.winner, 0);
    const oldSeed = await page.evaluate(() => ShadowDuelGame.session().seed);
    await page.click('#restart-btn');
    assert.equal((await snapshot(page)).gameOver, true, 'Host cannot unilaterally restart');
    await guest.waitForFunction(() => ShadowNet.peerRematch); await guest.click('#restart-btn');
    await page.waitForFunction(() => !ShadowDuelGame.state().gameOver);
    const restarted = await converged(page, guest); assert.equal(restarted.turnNumber, 1);
    assert.notEqual(await page.evaluate(() => ShadowDuelGame.session().seed), oldSeed);
    await guest.click('#menu-btn'); await page.waitForFunction(() => ShadowDuelGame.state().gameOver);
    assert.equal((await snapshot(page)).winner, null);
    assert.match(await page.textContent('#game-over-text'), /interrupted/i);
    await page.click('#return-menu-btn');
    assert.equal(await page.evaluate(() => ShadowNet.status), 'idle');
    assert.equal(await guest.evaluate(() => ShadowNet.status), 'idle');
    await page.click('#menu-create-btn'); await page.click('#create-lobby-btn');
    await page.waitForFunction(() => ShadowNet.lobbyCode !== null);
    const code = await page.evaluate(() => ShadowNet.lobbyCode);
    await guest.click('#menu-join-btn'); await guest.fill('#join-code', code); await guest.click('#join-lobby-btn');
    await Promise.all([page.waitForFunction(() => ShadowNet.isConnected(), null, { timeout: 30000 }), guest.waitForFunction(() => ShadowNet.isConnected(), null, { timeout: 30000 })]);
    await guest.click('#start-match-btn'); await page.waitForFunction(() => ShadowNet.peerReady); await page.click('#start-match-btn');
    await guest.waitForFunction(() => ShadowDuelGame.isOnline() && !ShadowDuelGame.state().gameOver);
    assert.equal((await converged(page, guest)).turnNumber, 1);
  });
  assert.deepEqual(results.pageErrors, [], 'No browser page errors');
  assert.deepEqual(results.localHttpErrors, [], 'No failed local asset requests');
  console.log(`PASS ${results.checks.length} browser scenarios; ${results.screenshots.length} screenshots`);
})().catch(async error => {
  results.failure = error.stack; console.error(error);
  if (browser) for (const [index, page] of browser.contexts().flatMap(context => context.pages()).entries()) await screenshot(page, `failure-${index}`).catch(() => {});
  process.exitCode = 1;
}).finally(async () => {
  if (browser) await browser.close();
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(results, null, 2) + '\n');
});
