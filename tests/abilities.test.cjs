// Creature abilities (GDADA run 2): every creature has one, its face text names
// its trigger, and each trigger fires where the rules say it does.
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const cards = require('../cards.js');
const source = ['cards.js', 'game.js'].map((name) => fs.readFileSync(path.join(__dirname, '..', name), 'utf8'));

function engine() {
  const window = { ShadowLobbyUI: {} };
  const document = { getElementById: () => null, addEventListener() {} };
  const errors = [];
  const context = vm.createContext({ window, document, console: { log() {}, warn() {}, error: (...a) => errors.push(a.join(' ')) } });
  source.forEach((code) => vm.runInContext(code, context));
  const api = window.ShadowDuelGame;
  api.startLocal({ seed: 2 });
  assert.equal(api.state().currentPlayer, 0);
  api.state().players.forEach((p) => { p.hand = []; });
  api.errors = errors;
  return api;
}
const plain = (value) => JSON.parse(JSON.stringify(value));
const card = (name) => cards.createCard(cards.findCardTemplate(name));
function field(api, name, seat, index, ready = true) {
  const slot = { card: card(name), summonSickness: !ready, hasAttacked: false, stunned: false };
  api.state().players[seat].field[index] = slot;
  return slot;
}
function summon(api, name) {
  const entry = card(name);
  api.state().players[0].hand = [entry];
  api.state().players[0].energy = 10;
  assert.equal(api.act({ type: 'play', cardId: entry.id }), true, name);
  return entry;
}
const HOOK = { Summon: 'onSummon', Attack: 'onAttack', Kill: 'onKill', Death: 'onDeath', Dawn: 'onDawn' };

test('every creature has exactly one ability, and its face names the trigger that runs it', () => {
  for (const t of cards.MONSTER_TEMPLATES) {
    const prefix = (t.text.match(/^(Summon|Attack|Kill|Death|Dawn):/) || [])[1];
    assert.ok(prefix, `${t.name}: face text starts with a trigger`);
    const hooks = Object.values(HOOK).filter((h) => typeof t[h] === 'function');
    assert.deepEqual(hooks, [HOOK[prefix]], `${t.name}: one hook, matching "${prefix}:"`);
    assert.ok(t.text.length <= 75, `${t.name}: one line (${t.text.length})`);
    assert.ok(t.flavor, `${t.name}: keeps its flavour text for the detail panel`);
  }
  assert.equal(new Set(cards.MONSTER_TEMPLATES.map((t) => t.text)).size, cards.MONSTER_TEMPLATES.length, 'no two creatures share an ability');
});

test('Summon: Ashen Dragon destroys a weak enemy without Ward; Ward is respected', () => {
  const api = engine();
  field(api, 'Arcane Automaton', 1, 0);  // Ward
  field(api, 'Cinder Wolf', 1, 1);       // 300 DEF
  summon(api, 'Ashen Dragon');
  assert.deepEqual(plain(api.state().players[1].field.map((s) => s && s.card.name)), ['Arcane Automaton', null, null, null, null]);
});

test('Attack: Frost Siren chills the defender before combat, turning a loss into a win', () => {
  const api = engine();
  field(api, 'Frost Siren', 0, 0);       // 600 ATK
  field(api, 'Iron Golem', 1, 0);        // 800 DEF -> 500
  assert.equal(api.act({ type: 'attack', attacker: 0, target: 0 }), true);
  assert.equal(api.state().players[1].field[0], null);
  assert.ok(api.state().players[0].field[0], 'Frost Siren survives');
});

test('Kill: Sky Hunter attacks once more, only once per turn', () => {
  const api = engine();
  field(api, 'Sky Hunter', 0, 0);        // 600 ATK
  field(api, 'Ember Whelp', 1, 0);
  field(api, 'Gloom Mite', 1, 1);
  field(api, 'River Sprite', 1, 2);
  assert.equal(api.act({ type: 'attack', attacker: 0, target: 0 }), true);
  assert.equal(api.state().players[0].field[0].hasAttacked, false);
  assert.equal(api.act({ type: 'attack', attacker: 0, target: 1 }), true);
  assert.equal(api.state().players[0].field[0].hasAttacked, true, 'the second kill grants nothing more');
});

test('Death: Deep Sea Leviathan draws 2 when destroyed in combat', () => {
  const api = engine();
  field(api, 'Deep Sea Leviathan', 0, 0, true);
  field(api, 'Worldbreaker Titan', 1, 0);
  api.endTurn();
  const before = api.state().players[0].hand.length;
  assert.equal(api.act({ type: 'attack', attacker: 0, target: 0 }), true);
  assert.equal(api.state().players[0].field[0], null);
  assert.equal(api.state().players[0].hand.length, before + 2);
});

test('Dawn: Stone Guardian grows at the start of its turn and stops at +300', () => {
  const api = engine();
  const guard = field(api, 'Stone Guardian', 0, 0);
  for (let i = 0; i < 16; i++) api.endTurn();  // 8 of its own turns
  assert.equal(guard.card.bonusDef, 300);
});

test('Worldbreaker Titan spares itself and Ward creatures but not weak creatures on either side', () => {
  const api = engine();
  field(api, 'Gloom Mite', 0, 1);        // own, 250 DEF
  field(api, 'Crystal Sentinel', 0, 2);  // own Ward
  field(api, 'Ember Whelp', 1, 0);       // enemy 200 DEF
  summon(api, 'Worldbreaker Titan');
  const names = (seat) => plain(api.state().players[seat].field.map((s) => s && s.card.name));
  assert.deepEqual(names(0), ['Worldbreaker Titan', null, 'Crystal Sentinel', null, null]);
  assert.deepEqual(names(1), [null, null, null, null, null]);
});

test('every creature can be summoned, attack, kill, die and see a dawn without an ability error', () => {
  for (const t of cards.MONSTER_TEMPLATES) {
    const api = engine();
    field(api, 'Gloom Mite', 1, 0);
    field(api, 'River Sprite', 0, 4);
    summon(api, t.name);
    const slot = api.state().players[0].field.findIndex((s) => s && s.card.name === t.name);
    assert.ok(slot >= 0, t.name);
    api.state().players[0].field[slot].summonSickness = false;
    api.act({ type: 'attack', attacker: slot, target: 0 });
    api.endTurn();
    field(api, 'Worldbreaker Titan', 1, 3);
    if (api.state().players[0].field[slot]) api.act({ type: 'attack', attacker: 3, target: slot });
    api.endTurn();
    assert.deepEqual(api.errors, [], `${t.name}: ${api.errors.join('; ')}`);
  }
});
