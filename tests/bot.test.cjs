const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const { playMatch } = require('../scripts/bot-match.cjs');
const source = ['cards.js', 'game.js', 'bot.js'].map((name) => fs.readFileSync(path.join(__dirname, '..', name), 'utf8'));

function engine() {
  const window = { ShadowLobbyUI: {} };
  const document = { getElementById: () => null, addEventListener() {} };
  const context = vm.createContext({ window, document, console });
  source.forEach((code) => vm.runInContext(code, context));
  return window;
}

test('legal actions are exactly the ones the engine accepts', () => {
  const { ShadowDuelGame: api } = engine();
  api.startLocal({ seed: 42 });
  for (let step = 0; step < 40 && !api.state().gameOver; step++) {
    const legal = api.legalActions();
    assert.ok(legal.some((e) => e.action.type === 'end'), 'end turn is always legal in the main phase');
    const pick = legal[step % legal.length].action;
    assert.equal(api.act(pick), true, JSON.stringify(pick));
  }
});

test('a seeded local duel deals the same decks every time', () => {
  const deck = () => {
    const { ShadowDuelGame: api } = engine();
    api.startLocal({ seed: 7 });
    return api.state().players.map((p) => p.hand.map((c) => c.name).join(','));
  };
  assert.equal(JSON.stringify(deck()), JSON.stringify(deck()));
});

test('bot matches finish, are reproducible, and both seats can win', () => {
  const results = [];
  for (let seed = 1; seed <= 30; seed++) results.push(playMatch(seed));
  assert.equal(results.filter((r) => !r.finished).length, 0);
  assert.ok(results.some((r) => r.winner === 0) && results.some((r) => r.winner === 1));
  assert.equal(playMatch(5).logHash, results[4].logHash);
});

test('the bot never makes a losing attack and ends the turn when nothing scores', () => {
  const { ShadowDuelBot: bot } = engine();
  const rng = () => 0;
  assert.equal(JSON.stringify(bot.choose(null, [{ action: { type: 'end' } }], rng)), JSON.stringify({ type: 'end' }));
  const losing = { action: { type: 'attack', attacker: 0, target: 1 }, atk: 500, targetAtk: 900, targetDef: 900 };
  assert.equal(JSON.stringify(bot.choose(null, [losing, { action: { type: 'end' } }], rng)), JSON.stringify({ type: 'end' }));
  const direct = { action: { type: 'attack', attacker: 0, target: null }, atk: 100 };
  assert.equal(JSON.stringify(bot.choose(null, [losing, direct, { action: { type: 'end' } }], rng)), JSON.stringify(direct.action));
});

test('vs computer: the human sees seat 0 and cannot act on the bot\'s turn', () => {
  const { ShadowDuelGame: api } = engine();
  api.startLocal({ seed: 3, botSeat: 1 });
  assert.equal(api.isMyTurn(), api.state().currentPlayer === 0);
  if (api.state().currentPlayer === 0) api.act({ type: 'end' });
  assert.equal(api.state().currentPlayer, 1);
  assert.equal(api.isMyTurn(), false);
  api.stop();
});
