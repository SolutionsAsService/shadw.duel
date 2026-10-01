const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const cards = require('../cards.js');
const source = ['cards.js', 'game.js'].map((name) => fs.readFileSync(path.join(__dirname, '..', name), 'utf8'));

function engine(options) {
  const window = { ShadowLobbyUI: {} };
  const document = { getElementById: () => null, addEventListener() {} };
  const context = vm.createContext({ window, document, console });
  source.forEach((code) => vm.runInContext(code, context));
  const api = window.ShadowDuelGame;
  if (options) api.startOnline(options);
  else api.startLocal();
  return api;
}
function card(name) { return cards.createCard(cards.findCardTemplate(name)); }
function give(api, name, seat = api.state().currentPlayer) {
  const entry = card(name);
  api.state().players[seat].hand.push(entry);
  api.state().players[seat].energy = 10;
  return entry;
}
function play(api, name, seat) {
  const entry = give(api, name, seat);
  assert.equal(api.act({ type: 'play', cardId: entry.id }), true, name);
  return entry;
}
function field(api, name, seat = 0, index = 0, ready = true) {
  const slot = { card: card(name), summonSickness: !ready, hasAttacked: false, stunned: false };
  api.state().players[seat].field[index] = slot;
  return slot;
}
function snapshot(api) { return JSON.parse(JSON.stringify(api.snapshot())); }

const spellExpectations = {
  'Healing Potion': { heal: 800 },
  'Minor Restoration': { heal: 500, draw: 1 },
  Fireball: { damage: 500 },
  Spark: { damage: 250 },
  'Draw Two': { draw: 2 },
  'Quick Draw': { draw: 1 },
  'Battle Rage': { bonus: ['attackBonus', 300] },
  'Stone Skin': { bonus: ['defenseBonus', 400] },
  Windstep: { swift: true },
  'Flame Burst': { damage: 750 },
  'Void Bolt': { damage: 900 },
  'Lightning Strike': { damage: 700, draw: 1 },
  Barrier: { shield: 600 },
  Aegis: { heal: 1000 },
  'Arcane Insight': { draw: 3 },
  'Dark Bargain': { heal: -300, draw: 2 },
  Meteor: { damage: 1400 },
  'Void Collapse': { damage: 1800 },
  'Divine Renewal': { heal: 1800 },
};

test('55 unique templates are all reachable; seeded decks and seat IDs are stable', () => {
  const all = cards.getAllCards();
  assert.equal(all.length, 55);
  assert.equal(new Set(all.map((entry) => entry.name)).size, 55);
  const first = cards.buildSeededDeck(123, 0);
  cards.getAllCards();
  assert.deepEqual(cards.buildSeededDeck(123, 0), first);
  assert.equal(first.length, 55);
  assert.deepEqual(new Set(first.map((entry) => entry.name)), new Set(all.map((entry) => entry.name)));
  assert.equal(new Set([...first, ...cards.buildSeededDeck(123, 1)].map((entry) => entry.id)).size, 110);
});

for (const [name, expected] of Object.entries(spellExpectations)) {
  test(`spell: ${name} resolves its advertised effect and pays its cost`, () => {
    const api = engine();
    const [player, opponent] = api.state().players;
    player.hand = [];
    const sleeping = field(api, 'Iron Golem', 0, 0, false);
    const deckLength = player.deck.length;
    const entry = play(api, name);
    assert.equal(player.energy, 10 - entry.cost);
    assert.equal(player.lp, 8000 + (expected.heal || 0));
    assert.equal(opponent.lp, 8000 - (expected.damage || 0));
    assert.equal(player.hand.length, expected.draw || 0);
    assert.equal(player.deck.length, deckLength - (expected.draw || 0));
    assert.equal(player.shield, expected.shield || 0);
    assert.equal(player.cardsPlayed, 1);
    if (expected.bonus) assert.equal(player[expected.bonus[0]], expected.bonus[1]);
    if (expected.swift) {
      assert.equal(player.swiftBonus, true);
      assert.equal(sleeping.summonSickness, false);
    }
  });
}

test('all nineteen spells have a specific effect test', () => {
  assert.deepEqual(new Set(Object.keys(spellExpectations)), new Set(cards.SPELL_TEMPLATES.map((entry) => entry.name)));
});

for (const [name, targetName, property] of [
  ['Ember Core', 'Ember Whelp', 'flameBonus'],
  ['Crystal Heart', 'Stone Guardian', 'earthDefenseBonus'],
  ['Void Shard', 'Shadow Stalker', 'shadowBonus'],
]) {
  test(`relic: ${name} persists, stacks, and changes combat for existing creatures`, () => {
    const api = engine();
    const [player, enemy] = api.state().players;
    const creature = field(api, targetName);
    play(api, name);
    play(api, name);
    assert.equal(player.relics.length, 2);
    assert.equal(player[property], 200);
    api.endTurn();
    if (property === 'earthDefenseBonus') {
      field(api, 'Inferno Knight', 1);
      assert.equal(api.act({ type: 'attack', attacker: 0, target: 0 }), true);
      assert.equal(player.field[0], null); // 650 + 200 DEF ties 850 ATK.
      assert.equal(enemy.field[0], null);
      assert.equal(player.lp, 8000);
    } else {
      api.endTurn();
      api.act({ type: 'attack', attacker: 0, target: null });
      assert.equal(enemy.lp, 8000 - creature.card.atk - 200);
      assert.equal(player[property], 200);
    }
  });
}

test('energy starts at one for each seat and caps at ten on each own turn', () => {
  const api = engine();
  assert.equal(api.state().players[0].energy, 1);
  api.endTurn();
  assert.equal(api.state().players[1].energy, 1);
  api.endTurn();
  assert.equal(api.state().players[0].energy, 2);
  for (let i = 0; i < 24; i++) api.endTurn();
  assert.equal(api.state().players[0].energy, 10);
  assert.equal(api.state().players[1].energy, 10);
});

test('summon once per turn, full field, insufficient energy, and invalid IDs reject without mutation', () => {
  const api = engine();
  const entry = give(api, 'Iron Golem');
  api.state().players[0].energy = 0;
  let before = snapshot(api);
  assert.equal(api.act({ type: 'play', cardId: entry.id }), false);
  assert.deepEqual(snapshot(api), before);
  api.state().players[0].energy = 10;
  assert.equal(api.act({ type: 'play', cardId: entry.id }), true);
  const next = give(api, 'Ember Whelp');
  before = snapshot(api);
  assert.equal(api.act({ type: 'play', cardId: next.id }), false);
  assert.deepEqual(snapshot(api), before);
  assert.equal(api.act({ type: 'play', cardId: 'missing' }), false);
  api.state().players[0].monsterPlayedThisTurn = false;
  for (let i = 1; i < 5; i++) field(api, 'Iron Golem', 0, i);
  before = snapshot(api);
  assert.equal(api.act({ type: 'play', cardId: next.id }), false);
  assert.deepEqual(snapshot(api), before);
});

test('summoning sickness, Swift and one attack per turn', () => {
  const api = engine();
  play(api, 'Iron Golem');
  assert.equal(api.act({ type: 'attack', attacker: 0, target: null }), false);
  api.endTurn(); api.endTurn();
  assert.equal(api.act({ type: 'attack', attacker: 0, target: null }), true);
  assert.equal(api.act({ type: 'attack', attacker: 0, target: null }), false);
  play(api, 'Ember Whelp');
  assert.equal(api.act({ type: 'attack', attacker: 1, target: null }), true);
});

test('Windstep enables present/future summons but never permits a second attack', () => {
  const api = engine();
  field(api, 'Iron Golem', 0, 0, false);
  play(api, 'Windstep');
  play(api, 'Ironclad Mercenary');
  assert.equal(api.state().players[0].field[1].summonSickness, false);
  assert.equal(api.act({ type: 'attack', attacker: 0, target: null }), true);
  play(api, 'Windstep');
  assert.equal(api.act({ type: 'attack', attacker: 0, target: null }), false);
});

test('Battle Rage and Stone Skin affect only the next summon and persist on that creature', () => {
  const api = engine();
  field(api, 'Ironclad Mercenary', 0, 0);
  play(api, 'Battle Rage'); play(api, 'Stone Skin');
  api.endTurn(); api.endTurn(); // Pending next-summon effects survive a turn.
  const summoned = play(api, 'Ember Whelp');
  assert.equal(summoned.bonusAtk, 300);
  assert.equal(summoned.bonusDef, 400);
  assert.equal(api.state().players[0].attackBonus, 0);
  assert.equal(api.state().players[0].defenseBonus, 0);
  api.act({ type: 'attack', attacker: 0, target: null });
  api.act({ type: 'attack', attacker: 1, target: null });
  assert.equal(api.state().players[1].lp, 8000 - 500 - 650);
  api.endTurn(); api.endTurn();
  const second = play(api, 'Cinder Wolf');
  assert.equal(second.bonusAtk, 0);
  assert.equal(summoned.bonusAtk, 300);
});

test('Heal triggers on summon; Debuff respects Ward and expires at enemy next turn', () => {
  const api = engine();
  play(api, 'River Sprite');
  assert.equal(api.state().players[0].lp, 8300);
  api.endTurn(); api.endTurn();
  const regular = field(api, 'Ironclad Mercenary', 1);
  const ward = field(api, 'Crystal Sentinel', 1, 1);
  play(api, 'Frost Siren');
  assert.equal(regular.card.tempAtk, -100);
  assert.equal(regular.card.tempDef, -100);
  assert.equal(ward.card.tempAtk || 0, 0);
  assert.equal(ward.card.tempDef || 0, 0);
  api.endTurn();
  assert.equal(regular.card.tempAtk, 0);
  assert.equal(regular.card.tempDef, 0);
});

test('Guard blocks other targets and direct attacks until all opposing creatures are gone', () => {
  const api = engine();
  field(api, 'Ashen Dragon');
  field(api, 'Ember Whelp', 1, 0);
  field(api, 'Stone Guardian', 1, 1);
  const before = snapshot(api);
  assert.equal(api.act({ type: 'attack', attacker: 0, target: 0 }), false);
  assert.equal(api.act({ type: 'attack', attacker: 0, target: null }), false);
  assert.deepEqual(snapshot(api), before);
  assert.equal(api.act({ type: 'attack', attacker: 0, target: 1 }), true);
});

test('combat: winning overflow, tie destruction, losing backlash, Burn and Lifesteal', () => {
  const api = engine();
  field(api, 'Flame Serpent');
  field(api, 'Ironclad Mercenary', 1);
  api.act({ type: 'attack', attacker: 0, target: 0 });
  assert.equal(api.state().players[1].lp, 7600); // 200 overflow + 200 Burn.
  assert.equal(api.state().players[1].field[0], null);
  field(api, 'Dread Reaper', 0, 1);
  field(api, 'Ironclad Mercenary', 1);
  api.act({ type: 'attack', attacker: 1, target: 0 });
  assert.equal(api.state().players[0].lp, 8600); // Actual LP damage, not 1100 ATK.
  field(api, 'Wind Falcon', 0, 2);
  field(api, 'Ironclad Mercenary', 1);
  api.act({ type: 'attack', attacker: 2, target: 0 });
  assert.equal(api.state().players[0].field[2], null);
  assert.equal(api.state().players[1].field[0], null);
  field(api, 'Ember Whelp', 0, 3);
  field(api, 'Iron Golem', 1);
  api.act({ type: 'attack', attacker: 3, target: 0 });
  assert.equal(api.state().players[0].lp, 8150); // 800 DEF - 350 ATK.
});

test('Barrier absorbs damage, Lifesteal uses unabsorbed damage, and shield expires next own turn', () => {
  const api = engine();
  play(api, 'Barrier');
  api.endTurn();
  field(api, 'Dread Reaper', 1);
  api.act({ type: 'attack', attacker: 0, target: null });
  assert.equal(api.state().players[0].lp, 7500);
  assert.equal(api.state().players[1].lp, 8500);
  assert.equal(api.state().players[0].shield, 0);
  api.endTurn(); play(api, 'Barrier');
  api.endTurn(); api.endTurn();
  assert.equal(api.state().players[0].shield, 0);
});

test('hand cap discards overflow and draw-spell deckout immediately ends the duel', () => {
  const api = engine();
  const player = api.state().players[0];
  player.hand = Array.from({ length: 9 }, () => card('Spark'));
  const size = player.deck.length;
  api.draw(0, 2);
  assert.equal(player.hand.length, 9);
  assert.equal(player.deck.length, size - 2);
  player.hand = [];
  player.deck = [card('Spark')];
  play(api, 'Draw Two');
  assert.equal(api.state().gameOver, true);
  assert.equal(api.state().winner, 1);
  assert.equal(api.endTurn(), false);
});

test('lethal damage, losing LP to Dark Bargain, surrender, and clean restart', () => {
  const api = engine();
  api.state().players[1].lp = 100;
  play(api, 'Spark');
  assert.equal(api.state().winner, 0);
  assert.equal(api.state().players[1].lp, 0);
  api.restart();
  assert.equal(api.state().gameOver, false);
  assert.equal(api.state().players[0].lp, 8000);
  assert.equal(api.state().players[0].hand.length, 6);
  assert.equal(api.state().players[0].deck.length, 49);
  api.state().players[0].lp = 200;
  api.state().players[0].shield = 1000;
  play(api, 'Dark Bargain');
  assert.equal(api.state().winner, 1);
  api.restart();
  assert.equal(api.surrender(), true);
  assert.equal(api.state().winner, 1);
});

test('online malformed, replayed, out-of-turn, and unsent actions cannot mutate state', () => {
  let sends = 0;
  const api = engine({ seed: 42, localSeat: 0, onAction: () => { sends++; return false; } });
  const before = snapshot(api);
  assert.equal(api.endTurn(), false);
  assert.equal(sends, 1);
  assert.deepEqual(snapshot(api), before);
  for (const action of [null, {}, [], { type: 'end' }, { type: 'attack', attacker: '0', target: null }]) {
    assert.equal(api.receiveAction(action), false);
    assert.deepEqual(snapshot(api), before);
  }
  assert.equal(api.restart(), false);
  assert.equal(api.draw(0), false);
  const guest = engine({ seed: 42, localSeat: 1, onAction: () => true });
  field(guest, 'Ember Whelp');
  for (const action of [
    { type: 'attack', attacker: '__proto__', target: null },
    { type: 'attack', attacker: 0.5, target: null },
    { type: 'attack', attacker: 0 },
    { type: 'attack', attacker: 0, target: '0' },
    { type: 'play', cardId: {} },
  ]) {
    const old = snapshot(guest);
    assert.equal(guest.receiveAction(action), false);
    assert.deepEqual(snapshot(guest), old);
  }
});

test('two seeded peers converge after legal actions, full duel, and coordinated rematch', () => {
  const peers = [engine(), engine()];
  const start = (seed) => peers.forEach((peer, seat) => peer.startOnline({
    seed, localSeat: seat,
    onAction(action) { assert.equal(peers[1 - seat].receiveAction(action), true); return true; },
  }));
  start(82612);
  const equal = () => assert.deepEqual(snapshot(peers[0]), snapshot(peers[1]));
  equal();
  let actions = 0;
  for (let turn = 0; turn < 120 && !peers[0].state().gameOver; turn++) {
    const active = peers[peers[0].state().currentPlayer];
    const player = active.state().players[active.state().currentPlayer];
    for (const entry of [...player.hand]) {
      if (active.canPlay(entry.id)) { active.act({ type: 'play', cardId: entry.id }); actions++; equal(); }
    }
    for (let index = 0; index < 5 && !active.state().gameOver; index++) {
      const slot = player.field[index];
      if (!slot || slot.summonSickness || slot.hasAttacked || slot.stunned) continue;
      const enemy = active.state().players[1 - active.state().currentPlayer].field;
      let target = enemy.findIndex((entry) => entry && entry.card.keywords.includes('guard'));
      if (target < 0) target = enemy.findIndex(Boolean);
      assert.equal(active.act({ type: 'attack', attacker: index, target: target < 0 ? null : target }), true);
      actions++; equal();
    }
    if (!active.state().gameOver) { active.endTurn(); actions++; equal(); }
  }
  assert.ok(actions > 20);
  assert.equal(peers[0].state().gameOver, true);
  start(82613);
  equal();
  assert.equal(peers[0].state().gameOver, false);
  assert.equal(peers[0].state().players[0].energy, 1);
  assert.equal(peers[1].surrender(), true); // Legal off-turn surrender.
  equal();
});

test('stop clears transport callbacks and puts the engine in an inert menu state', () => {
  const api = engine({ seed: 4, localSeat: 0, onAction: () => true });
  api.stop();
  assert.equal(api.state().phase, 'idle');
  assert.equal(api.state().gameOver, true);
  assert.equal(api.session().onAction, null);
  assert.equal(api.endTurn(), false);
  assert.equal(api.receiveAction({ type: 'end' }), false);
  api.startLocal();
  assert.equal(api.state().gameOver, false);
});

test('starting online requires a finite shared seed and cannot silently use random decks', () => {
  const api = engine();
  const before = snapshot(api);
  assert.equal(api.startOnline({ localSeat: 0 }), false);
  assert.equal(api.startOnline({ seed: NaN, localSeat: 0 }), false);
  assert.deepEqual(snapshot(api), before);
  assert.equal(api.isOnline(), false);
});

test('transport loss interrupts both peers without awarding either a win; coordinated restart recovers', () => {
  const peers = [0, 1].map((localSeat) => engine({ seed: 991, localSeat, onAction: () => true }));
  peers.forEach((api) => {
    api.handleOpponentLeft();
    assert.equal(api.state().gameOver, true);
    assert.equal(api.state().winner, null);
    assert.equal(api.endTurn(), false);
    assert.equal(api.surrender(), false);
  });
  assert.deepEqual(snapshot(peers[0]), snapshot(peers[1]));
  peers.forEach((api, localSeat) => api.startOnline({ seed: 992, localSeat, onAction: () => true }));
  assert.deepEqual(snapshot(peers[0]), snapshot(peers[1]));
  assert.equal(peers[0].state().gameOver, false);
  assert.equal(peers[1].state().gameOver, false);
});
