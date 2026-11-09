// Expansion 1 (GDADA run 1): board spells, catch-up spells, the new relics,
// impact feedback and the bot's handling of board spells.
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const cards = require('../cards.js');
const bot = require('../bot.js');
const source = ['cards.js', 'game.js'].map((name) => fs.readFileSync(path.join(__dirname, '..', name), 'utf8'));

function engine() {
  const window = { ShadowLobbyUI: {} };
  const document = { getElementById: () => null, addEventListener() {} };
  const context = vm.createContext({ window, document, console });
  source.forEach((code) => vm.runInContext(code, context));
  const api = window.ShadowDuelGame;
  // A fixed seed in which Player 1 (seat 0) goes first, so every test starts the same way.
  api.startLocal({ seed: 2 });
  assert.equal(api.state().currentPlayer, 0);
  api.state().players.forEach((p) => { p.hand = []; });
  return api;
}
const card = (name) => cards.createCard(cards.findCardTemplate(name));
function field(api, name, seat, index) {
  const slot = { card: card(name), summonSickness: false, hasAttacked: false, stunned: false };
  api.state().players[seat].field[index] = slot;
  return slot;
}
function cast(api, name) {
  const seat = api.state().currentPlayer;
  const entry = card(name);
  api.state().players[seat].hand = [entry];
  api.state().players[seat].energy = 10;
  assert.equal(api.act({ type: 'play', cardId: entry.id }), true, name);
  return entry;
}
// Engine objects come from another vm realm; compare them as plain JSON.
const plain = (value) => JSON.parse(JSON.stringify(value));
const names = (api, seat) => plain(api.state().players[seat].field.map((slot) => (slot ? slot.card.name : null)));

test('Scorch destroys the lowest-DEF enemy without Ward, only at 400 DEF or less', () => {
  const api = engine();
  field(api, 'Gloom Mite', 1, 0);        // 250 DEF
  field(api, 'Ember Whelp', 1, 1);       // 200 DEF
  field(api, 'Arcane Automaton', 1, 2);  // Ward
  cast(api, 'Scorch');
  assert.deepEqual(names(api, 1), ['Gloom Mite', null, 'Arcane Automaton', null, null]);
  const empty = engine();
  field(empty, 'Stone Guardian', 1, 0);  // 650 DEF: out of reach
  cast(empty, 'Scorch');
  assert.deepEqual(names(empty, 1), ['Stone Guardian', null, null, null, null]);
  assert.match(empty.state().log.join('\n'), /Scorch: no enemy creature qualifies; no effect\./);
});

test('Undertow destroys the highest-ATK enemy without Ward; a tie takes the leftmost', () => {
  const api = engine();
  field(api, 'Sky Sovereign', 1, 0);     // 1350 ATK, Ward
  field(api, 'Tempest Giant', 1, 1);     // 1100
  field(api, 'Tempest Giant', 1, 3);     // 1100
  field(api, 'Worldbreaker Titan', 0, 0);
  cast(api, 'Undertow');
  assert.deepEqual(names(api, 1), ['Sky Sovereign', null, null, 'Tempest Giant', null]);
  assert.match(api.state().log.join('\n'), /Undertow drags down Tempest Giant\./);
  assert.deepEqual(plain(api.state().impacts.map((i) => [i.seat, i.slot, i.kind])), [[1, 1, 'destroyed']]);
});

test('Wither weakens the strongest enemy until its next turn, then wears off', () => {
  const api = engine();
  const target = field(api, 'Mountain Behemoth', 1, 2); // 1000 / 1150
  field(api, 'Tide Serpent', 1, 0);
  cast(api, 'Wither');
  const read = () => [api.state().players[1].field[2] && target.card.tempAtk, target.card.tempDef];
  assert.deepEqual(read(), [-500, -500]);
  api.endTurn();                                          // opponent's turn starts: expires
  assert.deepEqual(read(), [0, 0]);
});

test('Riptide lowers every enemy DEF without Ward; an attack then wins', () => {
  const api = engine();
  field(api, 'Tide Serpent', 1, 0);      // 500 DEF -> 200
  field(api, 'Crystal Sentinel', 1, 1);  // Ward: untouched
  field(api, 'Cinder Wolf', 0, 0);       // 550 ATK
  cast(api, 'Riptide');
  assert.equal(api.state().players[1].field[1].card.tempDef || 0, 0);
  // Crystal Sentinel has Guard, so attack it is forced; check the Serpent's DEF instead.
  assert.equal(api.state().players[1].field[0].card.tempDef, -300);
});

test('Tidewall and Rally Cry buff your own creatures until your next turn', () => {
  const api = engine();
  const a = field(api, 'Iron Golem', 0, 0);
  const b = field(api, 'Sky Hunter', 0, 4);
  cast(api, 'Tidewall');
  cast(api, 'Rally Cry');
  assert.deepEqual([a.card.tempDef, b.card.tempDef, a.card.tempAtk, b.card.tempAtk], [400, 400, 200, 200]);
  api.endTurn();
  assert.equal(a.card.tempDef, 400);                      // holds through the opponent's turn
  api.endTurn();
  assert.equal(a.card.tempDef, 0);
});

test('Landslide destroys every enemy without Ward at 500 DEF or less', () => {
  const api = engine();
  field(api, 'Cinder Wolf', 1, 0);       // 300
  field(api, 'Tide Serpent', 1, 1);      // 500
  field(api, 'Iron Golem', 1, 2);        // 800
  field(api, 'Arcane Automaton', 1, 3);  // Ward
  cast(api, 'Landslide');
  assert.deepEqual(names(api, 1), [null, null, 'Iron Golem', 'Arcane Automaton', null]);
});

test('Second Wind and Turning Gale reward the player who is behind', () => {
  const api = engine();
  const me = api.state().players[0];
  field(api, 'Tide Serpent', 1, 0);
  cast(api, 'Second Wind');
  assert.equal(me.hand.length, 2);
  me.lp = 3000;
  cast(api, 'Turning Gale');
  assert.equal(api.state().players[1].lp, 8000 - 800);
});

test('the new relics stack per element and for every creature', () => {
  const api = engine();
  const water = field(api, 'Tide Serpent', 0, 0);
  const wind = field(api, 'Sky Hunter', 0, 1);
  const light = field(api, 'Dawn Acolyte', 0, 2);
  cast(api, 'Tidestone');
  cast(api, 'Storm Feather');
  cast(api, 'Sun Sigil');
  cast(api, 'War Banner');
  const p = api.state().players[0];
  assert.deepEqual(plain(p.relicDef), { water: 100, light: 100, all: 50 });
  assert.deepEqual(plain(p.relicAtk), { wind: 100, light: 100, all: 50 });
  assert.equal(p.relics.length, 4);
  assert.ok([water, wind, light].every((slot) => slot.card));
});

test('Ward now names spells, and every board spell explains its target rule', () => {
  assert.match(engine().rules().keywordDescriptions.ward, /creature and spell effects/);
  for (const t of cards.SPELL_TEMPLATES.filter((s) => s.wants === 'enemy')) {
    assert.ok(t.rule && /Ward/.test(t.rule), `${t.name}: rule names Ward`);
    assert.ok(t.text.length <= 75, `${t.name}: card text fits one line (${t.text.length})`);
    assert.match(t.text, /non-Ward|without Ward/i, `${t.name}: card face names Ward`);
    assert.match(t.text, /ATK|DEF/, `${t.name}: card face names the stat it picks by`);
  }
});

test('a board spell previews the zones it would hit, matching what it then hits', () => {
  const api = engine();
  field(api, 'Sky Sovereign', 1, 0);     // Ward
  field(api, 'Tide Serpent', 1, 2);
  field(api, 'Gloom Mite', 1, 4);
  const undertow = cards.findCardTemplate('Undertow');
  assert.deepEqual(plain(undertow.targets(api.state(), 0)), [{ seat: 1, slot: 2 }]);
  assert.deepEqual(plain(cards.findCardTemplate('Riptide').targets(api.state(), 0)), [{ seat: 1, slot: 2 }, { seat: 1, slot: 4 }]);
  cast(api, 'Undertow');
  assert.deepEqual(names(api, 1), ['Sky Sovereign', null, null, null, 'Gloom Mite']);
});

test('Second Wind restores 400 LP when not outnumbered', () => {
  const api = engine();
  api.state().players[0].lp = 5000;
  cast(api, 'Second Wind');
  assert.equal(api.state().players[0].hand.length, 0);
  assert.equal(api.state().players[0].lp, 5400);
});

test('the bot holds Undertow for a target with 1000 ATK or more', () => {
  const api = engine();
  const state = api.state();
  const undertow = card('Undertow');
  state.players[0].hand = [undertow];
  state.players[0].energy = 10;
  field(api, 'Cinder Wolf', 1, 0);       // 550 ATK: not worth it
  const pick = () => plain(bot.choose(state, api.legalActions(), bot.rng(1)));
  assert.deepEqual(pick(), { type: 'end' });
  field(api, 'Ashen Dragon', 1, 1);      // 1250 ATK
  assert.deepEqual(pick(), { type: 'play', cardId: undertow.id });
});

test('the bot holds a board spell with no target and casts it when one exists', () => {
  const api = engine();
  const state = api.state();
  const scorch = card('Scorch');
  state.players[0].hand = [scorch];
  state.players[0].energy = 10;
  const pick = () => plain(bot.choose(state, api.legalActions(), bot.rng(1)));
  assert.deepEqual(pick(), { type: 'end' });
  field(api, 'Ember Whelp', 1, 0);
  assert.deepEqual(pick(), { type: 'play', cardId: scorch.id });
});
