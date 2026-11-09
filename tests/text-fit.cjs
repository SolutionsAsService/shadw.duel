// Every card's text fits its hand card at 1280 and 390 px (GDADA run 2). Needs a running server: node tests/text-fit.cjs
// Exits 1 if any card's text is clipped or overlaps the row below it.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const [w, h] of [[1280, 900], [390, 844]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto('http://127.0.0.1:4198/');
    await p.getByRole('button', { name: /local duel/i }).first().click();
    await p.waitForTimeout(400);
    const bad = await p.evaluate(async () => {
      const G = window.ShadowDuelGame, s = G.state(), me = s.currentPlayer;
      const names = window.getAllCards().map((t) => t.name);
      const out = [];
      for (let i = 0; i < names.length; i += 8) {
        s.players[me].hand = names.slice(i, i + 8).map((n) => window.createCard(window.findCardTemplate(n)));
        G.act({ type: 'end' }); G.act({ type: 'end' });
        await new Promise((r) => setTimeout(r, 50));
        for (const el of document.querySelectorAll('#player-hand .card')) {
          const t = el.querySelector('.card-text'), next = el.querySelector('.card-keywords') || el.querySelector('.card-stats');
          if (!t) continue;
          const tb = t.getBoundingClientRect(), cb = el.getBoundingClientRect();
          const clipped = t.scrollHeight > t.clientHeight + 1;
          const overlap = next && next.textContent.trim() && tb.bottom > next.getBoundingClientRect().top + 1;
          if (clipped || overlap || tb.bottom > cb.bottom) out.push(el.dataset.cardName);
        }
      }
      return [...new Set(out)];
    });
    console.log(w, bad.length, bad.join(', ')); if (bad.length) process.exitCode = 1;
  }
  await b.close();
})();
