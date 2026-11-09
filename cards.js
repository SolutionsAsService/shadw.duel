// ============================================================
// SHADOW DUEL — CARD DATABASE
// ============================================================
//
// Original card set for Shadow Duel.
// Designed for a fast 1v1 browser / mesh card duel.
//
// CARD TYPES:
//   monster
//   spell
//   relic
//
// ELEMENTS:
//   flame
//   water
//   earth
//   wind
//   shadow
//   light
//   neutral
//
// KEYWORDS (rules shared by every creature carrying the keyword):
//   guard     - enemy attacks must target a Guard while one is present
//   swift     - can attack on the turn it is summoned
//   lifesteal - restores LP equal to combat LP damage actually dealt
//   ward      - immune to hostile creature effects (not combat)
//   burn      - deals 200 additional LP damage after winning an attack
//   heal      - restores 300 LP when summoned
//   debuff    - on summon, enemies without Ward lose 100 ATK/DEF until
//               the start of their controller's next turn
//
// ============================================================



// ----------------------------------------------------------
// CREATURE ABILITY HELPERS (GDADA run 2)
// ----------------------------------------------------------
// Every ability is deterministic and never touches a Ward creature it does not own.
function count(game, seat, test) {
  return game.players[seat].field.filter((slot) => slot && test(slot.card)).length;
}
function selfBuff(game, seat, index, atk, def, name) {
  const slot = game.players[seat].field[index];
  if (!slot) return;
  slot.card.tempAtk = (slot.card.tempAtk || 0) + atk;
  slot.card.tempDef = (slot.card.tempDef || 0) + def;
  game.markImpact(seat, index, "boosted", slot.card.name);
  game.addLog(`${name}: +${atk} ATK${def ? ` / +${def} DEF` : ""} until your next turn.`);
}
function teamBuff(game, seat, except, test, atk, def, name) {
  let n = 0;
  game.players[seat].field.forEach((slot, index) => {
    if (!slot || index === except || !test(slot.card)) return;
    slot.card.tempAtk = (slot.card.tempAtk || 0) + atk;
    slot.card.tempDef = (slot.card.tempDef || 0) + def;
    game.markImpact(seat, index, "boosted", slot.card.name);
    n++;
  });
  game.addLog(`${name}: ${n} creature${n === 1 ? "" : "s"} gain${n === 1 ? "s" : ""} ${atk ? `+${atk} ATK` : ""}${atk && def ? " / " : ""}${def ? `+${def} DEF` : ""}.`);
}
function teamGrow(game, seat, except, atk, def, name) {
  let n = 0;
  game.players[seat].field.forEach((slot, index) => {
    if (!slot || index === except) return;
    slot.card.bonusAtk = (slot.card.bonusAtk || 0) + atk;
    slot.card.bonusDef = (slot.card.bonusDef || 0) + def;
    game.markImpact(seat, index, "boosted", slot.card.name);
    n++;
  });
  game.addLog(`${name}: ${n} creature${n === 1 ? "" : "s"} grow for good.`);
}
// Permanent growth for this creature, capped in total by `cap`.
function grow(game, seat, index, atk, def, cap, name) {
  const slot = game.players[seat].field[index];
  if (!slot) return;
  const card = slot.card;
  card.grown = card.grown || 0;
  const step = Math.max(0, Math.min(atk + def, cap - card.grown));
  if (!step) return;
  card.grown += step;
  if (atk) card.bonusAtk = (card.bonusAtk || 0) + step;
  else card.bonusDef = (card.bonusDef || 0) + step;
  game.markImpact(seat, index, "boosted", card.name);
  game.addLog(`${name} grows: +${step} ${atk ? "ATK" : "DEF"}.`);
}
function barrier(game, seat, amount, name) {
  game.players[seat].shield = (game.players[seat].shield || 0) + amount;
  game.addLog(`${name}: a ${amount} Barrier until your next turn.`);
}
function again(game, seat, index, name) {
  const slot = game.players[seat].field[index];
  if (!slot || slot.extraAttackUsed) return;
  slot.extraAttack = true;
  slot.extraAttackUsed = true;
  game.addLog(`${name} may attack once more this turn.`);
}
function chill(game, seat, target, def, name) {
  if (target === null || target === undefined) return;
  const slot = game.players[1 - seat].field[target];
  if (!slot || game.hasKeyword(slot.card, "ward")) return;
  slot.card.tempDef = (slot.card.tempDef || 0) - def;
  game.markImpact(1 - seat, target, "weakened", slot.card.name);
  game.addLog(`${name}: ${slot.card.name} loses ${def} DEF.`);
}
function weakenPick(game, seat, atk, def, name) {
  const foe = 1 - seat, index = pickCreature(game, foe, "highest-atk");
  if (index === -1) return;
  const card = game.players[foe].field[index].card;
  card.tempAtk = (card.tempAtk || 0) - atk;
  card.tempDef = (card.tempDef || 0) - def;
  game.markImpact(foe, index, "weakened", card.name);
  game.addLog(`${name}: ${card.name} loses ${def} DEF this turn.`);
}
function weakenAll(game, seat, def, name) {
  const foe = 1 - seat;
  let n = 0;
  game.players[foe].field.forEach((slot, index) => {
    if (!slot || game.hasKeyword(slot.card, "ward")) return;
    slot.card.tempDef = (slot.card.tempDef || 0) - def;
    game.markImpact(foe, index, "weakened", slot.card.name);
    n++;
  });
  game.addLog(`${name}: ${n} enem${n === 1 ? "y loses" : "ies lose"} ${def} DEF.`);
}
function blight(game, seat, def, name) {
  const foe = 1 - seat;
  let n = 0;
  game.players[foe].field.forEach((slot, index) => {
    if (!slot || game.hasKeyword(slot.card, "ward")) return;
    slot.card.bonusDef = (slot.card.bonusDef || 0) - def;
    game.markImpact(foe, index, "weakened", slot.card.name);
    n++;
  });
  game.addLog(`${name}: ${n} enem${n === 1 ? "y loses" : "ies lose"} ${def} DEF for good.`);
}
function destroyPick(game, seat, by, limit, name) {
  const foe = 1 - seat, index = pickCreature(game, foe, by, limit);
  if (index === -1) return game.addLog(`${name}: no enemy creature qualifies.`);
  game.addLog(`${name} destroys ${game.players[foe].field[index].card.name}.`);
  game.destroyMonster(foe, index);
}
// Destroys every creature without Ward on `side` with DEF <= limit, except slot `except`.
function destroyAll(game, side, limit, name, except = -1) {
  const doomed = game.players[side].field.map((slot, i) => (i !== except && slot && !game.hasKeyword(slot.card, "ward")
    && game.getMonsterDefense(slot.card, side) <= limit ? i : -1)).filter((i) => i >= 0);
  if (doomed.length) game.addLog(`${name} destroys ${doomed.length} creature${doomed.length === 1 ? "" : "s"}.`);
  doomed.forEach((i) => game.destroyMonster(side, i));
}


// Pyre Phoenix: back to its owner's hand once (stats reset), if the hand has room.
function rebirth(game, seat, _unused, name) {
  const player = game.players[seat];
  const card = game.lastDestroyed && game.lastDestroyed.seat === seat ? game.lastDestroyed.card : null;
  if (!card || card.reborn || player.hand.length >= 9) return;
  card.reborn = true;
  card.bonusAtk = 0; card.bonusDef = 0; card.tempAtk = 0; card.tempDef = 0; card.grown = 0;
  player.hand.push(card);
  game.addLog(`${name} rises from its ashes and returns to your hand.`);
}
// Sky Sovereign: the leftmost other creature matching \`test\` that has attacked may attack again.
function rally(game, seat, except, test, name) {
  const field = game.players[seat].field;
  const index = field.findIndex((slot, i) => slot && i !== except && slot.hasAttacked && test(slot.card) && !slot.extraAttackUsed);
  if (index === -1) return;
  field[index].hasAttacked = false;
  field[index].extraAttackUsed = true;
  game.markImpact(seat, index, "boosted", field[index].card.name);
  game.addLog(`${name} rallies ${field[index].card.name}: it may attack again.`);
}

// ============================================================
// MONSTER TEMPLATES
// ============================================================

const MONSTER_TEMPLATES = [

  // ----------------------------------------------------------
  // FLAME
  // ----------------------------------------------------------

  {
    name: "Ember Whelp",
    icon: "🔥",
    element: "flame",
    rarity: "common",
    cost: 1,
    atk: 350,
    def: 200,
    keywords: ["swift"],
    text: "Death: deal 200 damage to your opponent.",
    flavor: "A small flame creature that strikes before stronger foes.",
    onDeath: (game, seat, ...args) => { game.dealDamage(1 - seat, 200, "Ember Whelp"); },

  },

  {
    name: "Cinder Wolf",
    icon: "🐺",
    element: "flame",
    rarity: "common",
    cost: 2,
    atk: 550,
    def: 300,
    keywords: ["swift"],
    text: "Attack: gains +150 ATK until your next turn.",
    flavor: "Fast and aggressive.",
    onAttack: (game, seat, ...args) => { selfBuff(game, seat, args[0], 150, 0, "Cinder Wolf"); },

  },

  {
    name: "Flame Serpent",
    icon: "🐍",
    element: "flame",
    rarity: "uncommon",
    cost: 3,
    atk: 700,
    def: 400,
    keywords: ["burn"],
    text: "Kill: deal half the destroyed creature's ATK to your opponent.",
    flavor: "Its attacks leave burning wounds.",
    onKill: (game, seat, ...args) => { const half = Math.floor(((args[1] && args[1].atk) || 0) / 2); game.dealDamage(1 - seat, half, "Flame Serpent"); },

  },

  {
    name: "Inferno Knight",
    icon: "⚔️",
    element: "flame",
    rarity: "rare",
    cost: 4,
    atk: 850,
    def: 650,
    keywords: ["burn"],
    text: "Summon: your other flame creatures gain +200 ATK until your next turn.",
    flavor: "A heavily armed warrior surrounded by fire.",
    onSummon: (game, seat, ...args) => { teamBuff(game, seat, args[0], (c) => c.element === "flame", 200, 0, "Inferno Knight"); },

  },

  {
    name: "Ashen Dragon",
    icon: "🐉",
    element: "flame",
    rarity: "epic",
    cost: 6,
    atk: 1250,
    def: 800,
    keywords: ["burn"],
    text: "Summon: destroy the lowest-DEF enemy without Ward with 400 DEF or less.",
    flavor: "A devastating dragon born from the remains of an ancient fire.",
    onSummon: (game, seat, ...args) => { destroyPick(game, seat, "lowest-def", 400, "Ashen Dragon"); },

  },


  // ----------------------------------------------------------
  // WATER
  // ----------------------------------------------------------

  {
    name: "River Sprite",
    icon: "💧",
    element: "water",
    rarity: "common",
    cost: 1,
    atk: 300,
    def: 350,
    keywords: ["heal"],
    text: "Dawn: restore 150 LP.",
    flavor: "A small spirit that restores a little vitality.",
    onDawn: (game, seat, ...args) => { game.healPlayer(seat, 150); },

  },

  {
    name: "Tide Serpent",
    icon: "🌊",
    element: "water",
    rarity: "common",
    cost: 2,
    atk: 450,
    def: 500,
    keywords: ["guard"],
    text: "Summon: your creatures gain +200 DEF until your next turn.",
    flavor: "Its flowing body absorbs incoming attacks.",
    onSummon: (game, seat, ...args) => { teamBuff(game, seat, -1, () => true, 0, 200, "Tide Serpent"); },

  },

  {
    name: "Frost Siren",
    icon: "🧜",
    element: "water",
    rarity: "uncommon",
    cost: 3,
    atk: 600,
    def: 650,
    keywords: ["debuff"],
    text: "Attack: a defender without Ward loses 300 DEF first.",
    flavor: "Chilling song weakens opposing creatures.",
    onAttack: (game, seat, ...args) => { chill(game, seat, args[1], 300, "Frost Siren"); },

  },

  {
    name: "Deep Sea Leviathan",
    icon: "🐋",
    element: "water",
    rarity: "rare",
    cost: 5,
    atk: 1050,
    def: 1000,
    keywords: ["guard"],
    text: "Death: drag down the lowest-DEF enemy without Ward with 400 DEF or less.",
    flavor: "A massive creature from the deepest waters.",
    onDeath: (game, seat, ...args) => { destroyPick(game, seat, "lowest-def", 400, "Deep Sea Leviathan"); },

  },

  {
    name: "Abyssal Kraken",
    icon: "🦑",
    element: "water",
    rarity: "epic",
    cost: 7,
    atk: 1400,
    def: 1200,
    keywords: ["guard"],
    text: "Summon: destroy every enemy without Ward that has 300 DEF or less.",
    flavor: "An ancient monster capable of overwhelming entire battlefields.",
    onSummon: (game, seat, ...args) => { destroyAll(game, 1 - seat, 300, "Abyssal Kraken"); },

  },


  // ----------------------------------------------------------
  // EARTH
  // ----------------------------------------------------------

  {
    name: "Stone Guardian",
    icon: "🗿",
    element: "earth",
    rarity: "common",
    cost: 2,
    atk: 300,
    def: 650,
    keywords: ["guard"],
    text: "Dawn: gains +50 DEF for good (up to +300).",
    flavor: "A reliable defensive guardian.",
    onDawn: (game, seat, ...args) => { grow(game, seat, args[0], 0, 50, 300, "Stone Guardian"); },

  },

  {
    name: "Iron Golem",
    icon: "🤖",
    element: "earth",
    rarity: "uncommon",
    cost: 3,
    atk: 450,
    def: 800,
    keywords: ["guard"],
    text: "Summon: gain a 400 Barrier until your next turn.",
    flavor: "Heavy armor makes this construct difficult to destroy.",
    onSummon: (game, seat, ...args) => { barrier(game, seat, 400, "Iron Golem"); },

  },

  {
    name: "Crystal Sentinel",
    icon: "💎",
    element: "earth",
    rarity: "rare",
    cost: 4,
    atk: 550,
    def: 950,
    keywords: ["guard", "ward"],
    text: "Death: your next creature gains +300 DEF.",
    flavor: "Crystal armor protects it from hostile magic.",
    onDeath: (game, seat, ...args) => { game.players[seat].defenseBonus = (game.players[seat].defenseBonus || 0) + 300; game.addLog("Crystal Sentinel shatters: your next creature gains +300 DEF."); },

  },

  {
    name: "Mountain Behemoth",
    icon: "⛰️",
    element: "earth",
    rarity: "rare",
    cost: 5,
    atk: 1000,
    def: 1150,
    keywords: ["guard"],
    text: "Summon: your other creatures gain +150 DEF for good.",
    flavor: "A walking mountain that dominates the battlefield.",
    onSummon: (game, seat, ...args) => { teamGrow(game, seat, args[0], 0, 150, "Mountain Behemoth"); },

  },

  {
    name: "Worldbreaker Titan",
    icon: "🌋",
    element: "earth",
    rarity: "epic",
    cost: 8,
    atk: 1550,
    def: 1450,
    keywords: ["guard"],
    text: "Summon: destroy every other creature without Ward with 300 DEF or less.",
    flavor: "An ancient titan capable of reshaping the battlefield.",
    onSummon: (game, seat, ...args) => { destroyAll(game, 1 - seat, 300, "Worldbreaker Titan"); destroyAll(game, seat, 300, "Worldbreaker Titan", args[0]); },

  },


  // ----------------------------------------------------------
  // WIND
  // ----------------------------------------------------------

  {
    name: "Wind Falcon",
    icon: "🦅",
    element: "wind",
    rarity: "common",
    cost: 1,
    atk: 500,
    def: 250,
    keywords: ["swift"],
    text: "Attack: if it attacks directly, draw a card.",
    flavor: "A fast aerial attacker.",
    onAttack: (game, seat, ...args) => { if (args[1] === null) { game.addLog("Wind Falcon scouts: draw a card."); game.drawCards(seat, 1); } },

  },

  {
    name: "Sky Hunter",
    icon: "🦅",
    element: "wind",
    rarity: "common",
    cost: 2,
    atk: 600,
    def: 350,
    keywords: ["swift"],
    text: "Kill: it may attack once more this turn.",
    flavor: "Aerial hunters strike vulnerable targets.",
    onKill: (game, seat, ...args) => { again(game, seat, args[0], "Sky Hunter"); },

  },

  {
    name: "Storm Drake",
    icon: "🐲",
    element: "wind",
    rarity: "uncommon",
    cost: 3,
    atk: 800,
    def: 500,
    keywords: ["swift", "burn"],
    text: "Summon: deal 150 damage for each wind creature you control.",
    flavor: "Lightning crackles across its wings.",
    onSummon: (game, seat, ...args) => { const n = count(game, seat, (c) => c.element === "wind"); game.dealDamage(1 - seat, 150 * n, "Storm Drake"); },

  },

  {
    name: "Tempest Giant",
    icon: "🌪️",
    element: "wind",
    rarity: "rare",
    cost: 5,
    atk: 1100,
    def: 750,
    keywords: [],
    text: "Summon: enemies without Ward lose 200 DEF until their next turn.",
    flavor: "A giant formed from a living storm.",
    onSummon: (game, seat, ...args) => { weakenAll(game, seat, 200, "Tempest Giant"); },

  },

  {
    name: "Sky Sovereign",
    icon: "🌩️",
    element: "wind",
    rarity: "epic",
    cost: 7,
    atk: 1350,
    def: 950,
    keywords: ["swift", "ward"],
    text: "Attack: another wind creature that already attacked may attack again.",
    flavor: "Master of the upper skies.",
    onAttack: (game, seat, ...args) => { rally(game, seat, args[0], (c) => c.element === "wind", "Sky Sovereign"); },

  },


  // ----------------------------------------------------------
  // LIGHT
  // ----------------------------------------------------------

  {
    name: "Dawn Acolyte",
    icon: "✨",
    element: "light",
    rarity: "common",
    cost: 1,
    atk: 250,
    def: 400,
    keywords: ["heal"],
    text: "Death: restore 400 LP.",
    flavor: "A young healer devoted to the light.",
    onDeath: (game, seat, ...args) => { game.healPlayer(seat, 400); },

  },

  {
    name: "Radiant Knight",
    icon: "🛡️",
    element: "light",
    rarity: "uncommon",
    cost: 3,
    atk: 650,
    def: 700,
    keywords: ["guard", "heal"],
    text: "Summon: your next creature gains +200 ATK and +200 DEF.",
    flavor: "A holy warrior who protects allies.",
    onSummon: (game, seat, ...args) => { const p = game.players[seat]; p.attackBonus = (p.attackBonus || 0) + 200; p.defenseBonus = (p.defenseBonus || 0) + 200; game.addLog("Radiant Knight blesses your next creature: +200 ATK / +200 DEF."); },

  },

  {
    name: "Sunblade Angel",
    icon: "👼",
    element: "light",
    rarity: "rare",
    cost: 5,
    atk: 1000,
    def: 900,
    keywords: ["heal", "ward"],
    text: "Kill: restore 400 LP.",
    flavor: "A celestial warrior surrounded by radiant energy.",
    onKill: (game, seat, ...args) => { game.healPlayer(seat, 400); },

  },

  {
    name: "Celestial Guardian",
    icon: "🌟",
    element: "light",
    rarity: "epic",
    cost: 7,
    atk: 1250,
    def: 1300,
    keywords: ["guard", "heal", "ward"],
    text: "Dawn: gain a 300 Barrier until your next turn.",
    flavor: "A legendary protector of the living.",
    onDawn: (game, seat, ...args) => { barrier(game, seat, 300, "Celestial Guardian"); },

  },


  // ----------------------------------------------------------
  // SHADOW
  // ----------------------------------------------------------

  {
    name: "Shadow Stalker",
    icon: "🌑",
    element: "shadow",
    rarity: "common",
    cost: 2,
    atk: 600,
    def: 300,
    keywords: ["swift"],
    text: "Attack: +300 ATK when it attacks directly.",
    flavor: "A creature that strikes from darkness.",
    onAttack: (game, seat, ...args) => { if (args[1] === null) selfBuff(game, seat, args[0], 300, 0, "Shadow Stalker"); },

  },

  {
    name: "Nightblade",
    icon: "🗡️",
    element: "shadow",
    rarity: "uncommon",
    cost: 3,
    atk: 750,
    def: 400,
    keywords: ["swift", "debuff"],
    text: "Kill: draw a card.",
    flavor: "A silent assassin that weakens its victims.",
    onKill: (game, seat, ...args) => { game.drawCards(seat, 1); },

  },

  {
    name: "Void Hound",
    icon: "🐕",
    element: "shadow",
    rarity: "uncommon",
    cost: 4,
    atk: 850,
    def: 500,
    keywords: ["debuff"],
    text: "Death: deal 300 damage to your opponent.",
    flavor: "A beast summoned from the space between worlds.",
    onDeath: (game, seat, ...args) => { game.dealDamage(1 - seat, 300, "Void Hound"); },

  },

  {
    name: "Dread Reaper",
    icon: "💀",
    element: "shadow",
    rarity: "rare",
    cost: 5,
    atk: 1100,
    def: 650,
    keywords: ["lifesteal"],
    text: "Kill: gains +200 ATK for good.",
    flavor: "Feeds on the life force of defeated enemies.",
    onKill: (game, seat, ...args) => { grow(game, seat, args[0], 200, 0, Infinity, "Dread Reaper"); },

  },

  {
    name: "Lord of the Void",
    icon: "👁️",
    element: "shadow",
    rarity: "epic",
    cost: 8,
    atk: 1500,
    def: 1100,
    keywords: ["lifesteal", "ward"],
    text: "Summon: enemies without Ward lose 200 DEF for good.",
    flavor: "An ancient entity that commands the darkness.",
    onSummon: (game, seat, ...args) => { blight(game, seat, 200, "Lord of the Void"); },

  },


  // ----------------------------------------------------------
  // NEUTRAL
  // ----------------------------------------------------------

  {
    name: "Ironclad Mercenary",
    icon: "🪖",
    element: "neutral",
    rarity: "common",
    cost: 2,
    atk: 500,
    def: 500,
    keywords: [],
    text: "Summon: draw a card, then lose 200 LP.",
    flavor: "A dependable warrior with no elemental allegiance.",
    onSummon: (game, seat, ...args) => { game.drawCards(seat, 1); game.dealDamage(seat, 200, "Ironclad Mercenary's fee", true); },

  },

  {
    name: "Arcane Automaton",
    icon: "⚙️",
    element: "neutral",
    rarity: "uncommon",
    cost: 3,
    atk: 550,
    def: 650,
    keywords: ["ward"],
    text: "Dawn: if you hold 2 or fewer cards, draw a card.",
    flavor: "A mechanical construct powered by arcane energy.",
    onDawn: (game, seat, ...args) => { if (game.players[seat].hand.length <= 2) { game.addLog("Arcane Automaton whirs: draw a card."); game.drawCards(seat, 1); } },

  },

  {
    name: "Battle Colossus",
    icon: "🗿",
    element: "neutral",
    rarity: "rare",
    cost: 5,
    atk: 1050,
    def: 1000,
    keywords: ["guard"],
    text: "Death: your next creature gains +400 ATK.",
    flavor: "A massive construct designed for direct combat.",
    onDeath: (game, seat, ...args) => { game.players[seat].attackBonus = (game.players[seat].attackBonus || 0) + 400; game.addLog("Battle Colossus falls: your next creature gains +400 ATK."); },

  },

  {
    name: "Ancient Titan",
    icon: "🏔️",
    element: "neutral",
    rarity: "epic",
    cost: 7,
    atk: 1350,
    def: 1200,
    keywords: ["guard"],
    text: "Summon: draw a card for each other creature you control (up to 2).",
    flavor: "A legendary being from before recorded history.",
    onSummon: (game, seat, ...args) => { game.drawCards(seat, Math.min(2, count(game, seat, () => true) - 1)); },

  },


  // ----------------------------------------------------------
  // EXPANSION 1 (GDADA run 1): fills the cost curve and the
  // under-used keywords (lifesteal, debuff) with existing rules.
  // ----------------------------------------------------------

  { name: "Gloom Mite", icon: "🕷️", element: "shadow", rarity: "common", cost: 1, atk: 300, def: 250,
    keywords: ["lifesteal"], text: "Death: your opponent loses 150 LP and you restore 150 LP.",
    flavor: "A tick of living dusk that feeds on every blow.",
    onDeath: (game, seat, ...args) => { game.dealDamage(1 - seat, 150, "Gloom Mite"); game.healPlayer(seat, 150); },
    },
  { name: "Lantern Bearer", icon: "🏮", element: "light", rarity: "common", cost: 2, atk: 400, def: 450,
    keywords: ["heal"], text: "Dawn: restore 100 LP for each light creature you control.",
    flavor: "Carries the dawn into the longest night.",
    onDawn: (game, seat, ...args) => { game.healPlayer(seat, 100 * count(game, seat, (c) => c.element === "light")); },
    },
  { name: "Mossback Tortoise", icon: "🐢", element: "earth", rarity: "common", cost: 1, atk: 200, def: 450,
    keywords: ["guard"], text: "Death: your creatures gain +300 DEF until your next turn.",
    flavor: "A boulder that decided to walk.",
    onDeath: (game, seat, ...args) => { teamBuff(game, seat, -1, () => true, 0, 300, "Mossback Tortoise"); },
    },
  { name: "Brine Witch", icon: "🧙", element: "water", rarity: "uncommon", cost: 4, atk: 700, def: 650,
    keywords: ["debuff", "lifesteal"], text: "Dawn: the highest-ATK enemy without Ward loses 200 DEF this turn.",
    flavor: "Her tide pulls strength out of everything it touches.",
    onDawn: (game, seat, ...args) => { weakenPick(game, seat, 0, 200, "Brine Witch"); },
    },
  { name: "Pyre Phoenix", icon: "🐦‍🔥", element: "flame", rarity: "rare", cost: 5, atk: 950, def: 600,
    keywords: ["burn", "lifesteal"], text: "Death: it returns to your hand, once.",
    flavor: "It burns its enemies and drinks the heat back.",
    onDeath: (game, seat, ...args) => { rebirth(game, seat, this, "Pyre Phoenix"); },
    },
  { name: "Gale Harpy", icon: "🪶", element: "wind", rarity: "uncommon", cost: 4, atk: 750, def: 450,
    keywords: ["swift", "debuff"], text: "Attack: your other wind creatures gain +100 ATK until your next turn.",
    flavor: "Shrieks down out of the storm before anyone can brace.",
    onAttack: (game, seat, ...args) => { teamBuff(game, seat, args[0], (c) => c.element === "wind", 100, 0, "Gale Harpy"); },
    },
  { name: "Wandering Duelist", icon: "🤺", element: "neutral", rarity: "uncommon", cost: 4, atk: 800, def: 700,
    keywords: [], text: "Attack: +200 ATK when it attacks a creature.",
    flavor: "No banner, no master, no wasted motion.",
    onAttack: (game, seat, ...args) => { if (args[1] !== null) selfBuff(game, seat, args[0], 200, 0, "Wandering Duelist"); },
    },
];


// ============================================================
// SPELL TEMPLATES
// ============================================================

// ----------------------------------------------------------
// BOARD SPELL HELPERS
// ----------------------------------------------------------
//
// Spells have no target picker, so a spell that touches a creature picks it
// by a fixed rule both browsers compute the same way: never a Ward creature,
// best value first, and on a tie the leftmost slot.
function pickCreature(game, seat, by, limit = Infinity) {
  let best = -1, bestValue = null;
  game.players[seat].field.forEach((slot, index) => {
    if (!slot || game.hasKeyword(slot.card, "ward")) return;
    const value = by === "lowest-def" ? game.getMonsterDefense(slot.card, seat) : game.getMonsterAttack(slot.card, seat);
    if (value > limit) return;
    const better = bestValue === null || (by === "lowest-def" ? value < bestValue : value > bestValue);
    if (better) { best = index; bestValue = value; }
  });
  return best;
}
function enemiesWithoutWard(game, seat) {
  return game.players[seat].field.filter((slot) => slot && !game.hasKeyword(slot.card, "ward"));
}
function creatureCount(game, seat) {
  return game.players[seat].field.filter(Boolean).length;
}
// For the hand preview: the zones a board spell would touch if cast now.
function one(seat, slot) {
  return slot === -1 ? [] : [{ seat, slot }];
}
function all(game, seat, test) {
  return game.players[seat].field.map((slot, index) => (slot && test(slot) ? { seat, slot: index } : null)).filter(Boolean);
}
function noTarget(game, name) {
  game.addLog(`${name}: no enemy creature qualifies; no effect.`);
}

const SPELL_TEMPLATES = [

  // ----------------------------------------------------------
  // BASIC / COMMON SPELLS
  // ----------------------------------------------------------

  {
    name: "Healing Potion",
    icon: "🧪",
    element: "light",
    rarity: "common",
    cost: 1,
    type: "spell",
    text: "Restore 800 Life Points.",

    effect: (game, playerIndex) => {
      game.healPlayer(playerIndex, 800);
    },
  },

  {
    name: "Minor Restoration",
    icon: "💚",
    element: "light",
    rarity: "common",
    cost: 1,
    type: "spell",
    text: "Restore 500 Life Points and draw 1 card.",

    effect: (game, playerIndex) => {
      game.healPlayer(playerIndex, 500);

      game.drawCards(playerIndex, 1);
    },
  },

  {
    name: "Fireball",
    icon: "☄️",
    element: "flame",
    rarity: "common",
    cost: 2,
    type: "spell",
    text: "Deal 500 damage. Your flame creatures gain +100 ATK this turn.",

    effect: (game, playerIndex) => {
      game.dealDamage(1 - playerIndex, 500, "spell");
      teamBuff(game, playerIndex, -1, (c) => c.element === "flame", 100, 0, "Fireball");
    },
  },

  {
    name: "Spark",
    icon: "⚡",
    element: "wind",
    rarity: "common",
    cost: 1,
    type: "spell",
    text: "Deal 250 damage. If you control a wind creature, draw a card.",

    effect: (game, playerIndex) => {
      game.dealDamage(1 - playerIndex, 250, "spell");
      if (count(game, playerIndex, (c) => c.element === "wind")) game.drawCards(playerIndex, 1);
    },
  },

  {
    name: "Draw Two",
    icon: "📖",
    element: "neutral",
    rarity: "uncommon",
    cost: 2,
    type: "spell",
    text: "Draw 2 cards.",

    effect: (game, playerIndex) => {
      game.drawCards(playerIndex, 2);
    },
  },

  {
    name: "Quick Draw",
    icon: "🃏",
    element: "wind",
    rarity: "common",
    cost: 1,
    type: "spell",
    text: "Draw a card. If you control no creatures, draw another.",

    effect: (game, playerIndex) => {
      game.drawCards(playerIndex, count(game, playerIndex, () => true) ? 1 : 2);
    },
  },


  // ----------------------------------------------------------
  // COMBAT SPELLS
  // ----------------------------------------------------------

  {
    name: "Battle Rage",
    icon: "💢",
    element: "flame",
    rarity: "uncommon",
    cost: 2,
    type: "spell",
    text: "Your next summoned creature gains +300 ATK permanently.",

    effect: (game, playerIndex) => {
      const player = game.players[playerIndex];

      player.attackBonus = (player.attackBonus || 0) + 300;
    },
  },

  {
    name: "Stone Skin",
    icon: "🪨",
    element: "earth",
    rarity: "uncommon",
    cost: 2,
    type: "spell",
    text: "Your next summoned creature gains +400 DEF permanently.",

    effect: (game, playerIndex) => {
      const player = game.players[playerIndex];

      player.defenseBonus = (player.defenseBonus || 0) + 400;
    },
  },

  {
    name: "Windstep",
    icon: "💨",
    element: "wind",
    rarity: "uncommon",
    cost: 2,
    type: "spell",
    text: "Your creatures can attack the turn they are summoned this turn. Does not grant a second attack.",

    effect: (game, playerIndex) => {
      const player = game.players[playerIndex];

      player.swiftBonus = true;
      player.field.forEach((slot) => { if (slot) slot.summonSickness = false; });
    },
  },


  // ----------------------------------------------------------
  // DAMAGE SPELLS
  // ----------------------------------------------------------

  {
    name: "Flame Burst",
    icon: "🔥",
    element: "flame",
    rarity: "uncommon",
    cost: 3,
    type: "spell",
    text: "Deal 750 damage, or 1000 if you control a flame creature.",

    effect: (game, playerIndex) => {
      game.dealDamage(1 - playerIndex, count(game, playerIndex, (c) => c.element === "flame") ? 1000 : 750, "spell");
    },
  },

  {
    name: "Void Bolt",
    icon: "🕳️",
    element: "shadow",
    rarity: "rare",
    cost: 3,
    type: "spell",
    text: "Deal 900 damage to your opponent and 200 to yourself.",

    effect: (game, playerIndex) => {
      game.dealDamage(1 - playerIndex, 900, "spell");
      game.dealDamage(playerIndex, 200, "Void Bolt recoil", true);
    },
  },

  {
    name: "Lightning Strike",
    icon: "⚡",
    element: "wind",
    rarity: "rare",
    cost: 3,
    type: "spell",
    text: "Deal 700 damage directly to your opponent and draw 1 card.",

    effect: (game, playerIndex) => {
      game.dealDamage(1 - playerIndex, 700, "spell");

      game.drawCards(playerIndex, 1);
    },
  },


  // ----------------------------------------------------------
  // DEFENSIVE SPELLS
  // ----------------------------------------------------------

  {
    name: "Barrier",
    icon: "🔰",
    element: "light",
    rarity: "uncommon",
    cost: 2,
    type: "spell",
    text: "Absorb the next 600 damage until the start of your next turn.",

    effect: (game, playerIndex) => {
      const player = game.players[playerIndex];

      player.shield = (player.shield || 0) + 600;
    },
  },

  {
    name: "Aegis",
    icon: "🛡️",
    element: "light",
    rarity: "rare",
    cost: 3,
    type: "spell",
    text: "Restore 1000 LP and gain a 300 Barrier until your next turn.",

    effect: (game, playerIndex) => {
      game.healPlayer(playerIndex, 1000);
      barrier(game, playerIndex, 300, "Aegis");
    },
  },


  // ----------------------------------------------------------
  // RESOURCE SPELLS
  // ----------------------------------------------------------

  {
    name: "Arcane Insight",
    icon: "🔮",
    element: "neutral",
    rarity: "rare",
    cost: 3,
    type: "spell",
    text: "Draw 3 cards.",

    effect: (game, playerIndex) => {
      game.drawCards(playerIndex, 3);
    },
  },

  {
    name: "Dark Bargain",
    icon: "🩸",
    element: "shadow",
    rarity: "rare",
    cost: 2,
    type: "spell",
    text: "Lose 300 Life Points and draw 2 cards.",

    effect: (game, playerIndex) => {
      game.dealDamage(playerIndex, 300, "Dark Bargain", true);

      game.drawCards(playerIndex, 2);
    },
  },


  // ----------------------------------------------------------
  // HIGH-POWER SPELLS
  // ----------------------------------------------------------

  {
    name: "Meteor",
    icon: "☄️",
    element: "flame",
    rarity: "epic",
    cost: 5,
    type: "spell",
    text: "Deal 1400 damage and destroy every enemy without Ward with 200 DEF or less.",

    effect: (game, playerIndex) => {
      game.dealDamage(1 - playerIndex, 1400, "spell");
      destroyAll(game, 1 - playerIndex, 200, "Meteor");
    },
  },

  {
    name: "Void Collapse",
    icon: "🌌",
    element: "shadow",
    rarity: "epic",
    cost: 6,
    type: "spell",
    text: "Deal 1800 damage. Your creatures lose 200 DEF until your next turn.",

    effect: (game, playerIndex) => {
      game.dealDamage(1 - playerIndex, 1800, "spell");
      teamBuff(game, playerIndex, -1, () => true, 0, -200, "Void Collapse");
    },
  },

  {
    name: "Divine Renewal",
    icon: "🌞",
    element: "light",
    rarity: "epic",
    cost: 5,
    type: "spell",
    text: "Restore 1800 LP. Your creatures gain +200 DEF until your next turn.",

    effect: (game, playerIndex) => {
      game.healPlayer(playerIndex, 1800);
      teamBuff(game, playerIndex, -1, () => true, 0, 200, "Divine Renewal");
    },
  },

  // ----------------------------------------------------------
  // EXPANSION 1: BOARD SPELLS AND CATCH-UP (GDADA run 1)
  // ----------------------------------------------------------
  {
    name: "Scorch", icon: "🔥", element: "flame", rarity: "common", cost: 2, type: "spell",
    text: "Destroy the lowest-DEF enemy without Ward, if its DEF is 400 or less.",
    rule: "Picks the enemy creature without Ward that has the lowest DEF, if that DEF is 400 or less. On a tie, the leftmost. If none qualifies, nothing happens.",
    wants: "enemy",
    canHit: (game, seat) => pickCreature(game, 1 - seat, "lowest-def", 400) !== -1,
    targets: (game, seat) => one(1 - seat, pickCreature(game, 1 - seat, "lowest-def", 400)),
    effect: (game, playerIndex) => {
      const foe = 1 - playerIndex, slot = pickCreature(game, foe, "lowest-def", 400);
      if (slot === -1) return noTarget(game, "Scorch");
      game.addLog(`Scorch hits ${game.players[foe].field[slot].card.name}.`);
      game.destroyMonster(foe, slot);
    },
  },
  {
    name: "Undertow", icon: "🌊", element: "water", rarity: "rare", cost: 4, type: "spell",
    text: "Destroy the highest-ATK enemy creature without Ward.",
    rule: "Picks the enemy creature without Ward that has the highest ATK. On a tie, the leftmost. If none qualifies, nothing happens.",
    wants: "enemy", worthAtk: 1000,
    canHit: (game, seat) => pickCreature(game, 1 - seat, "highest-atk") !== -1,
    targets: (game, seat) => one(1 - seat, pickCreature(game, 1 - seat, "highest-atk")),
    effect: (game, playerIndex) => {
      const foe = 1 - playerIndex, slot = pickCreature(game, foe, "highest-atk");
      if (slot === -1) return noTarget(game, "Undertow");
      game.addLog(`Undertow drags down ${game.players[foe].field[slot].card.name}.`);
      game.destroyMonster(foe, slot);
    },
  },
  {
    name: "Wither", icon: "🥀", element: "shadow", rarity: "uncommon", cost: 3, type: "spell",
    text: "The highest-ATK enemy without Ward loses 500 ATK/DEF until its next turn.",
    rule: "Picks the enemy creature without Ward that has the highest ATK. On a tie, the leftmost. It loses 500 ATK and 500 DEF until the start of its controller's next turn. If none qualifies, nothing happens.",
    wants: "enemy", timing: "before-attacks",
    canHit: (game, seat) => pickCreature(game, 1 - seat, "highest-atk") !== -1,
    targets: (game, seat) => one(1 - seat, pickCreature(game, 1 - seat, "highest-atk")),
    effect: (game, playerIndex) => {
      const foe = 1 - playerIndex, slot = pickCreature(game, foe, "highest-atk");
      if (slot === -1) return noTarget(game, "Wither");
      const card = game.players[foe].field[slot].card;
      card.tempAtk = (card.tempAtk || 0) - 500;
      card.tempDef = (card.tempDef || 0) - 500;
      game.markImpact(foe, slot, "weakened", card.name);
      game.addLog(`Wither: ${card.name} loses 500 ATK / DEF until its next turn.`);
    },
  },
  {
    name: "Riptide", icon: "🌀", element: "wind", rarity: "common", cost: 2, type: "spell",
    text: "Enemy creatures without Ward lose 300 DEF until their next turn.",
    rule: "Every enemy creature without Ward loses 300 DEF until the start of its controller's next turn. Cast it before you attack.",
    wants: "enemy", timing: "before-attacks",
    canHit: (game, seat) => enemiesWithoutWard(game, 1 - seat).length > 0,
    targets: (game, seat) => all(game, 1 - seat, (slot) => !game.hasKeyword(slot.card, "ward")),
    effect: (game, playerIndex) => {
      const foe = 1 - playerIndex, hit = enemiesWithoutWard(game, foe);
      hit.forEach((slot) => {
        slot.card.tempDef = (slot.card.tempDef || 0) - 300;
        game.markImpact(foe, game.players[foe].field.indexOf(slot), "weakened", slot.card.name);
      });
      game.addLog(`Riptide: ${hit.length} enemy creature${hit.length === 1 ? "" : "s"} lose 300 DEF.`);
    },
  },
  {
    name: "Tidewall", icon: "🧱", element: "water", rarity: "common", cost: 2, type: "spell",
    text: "Your creatures gain +400 DEF until your next turn.",
    rule: "Every creature you control gains 400 DEF until the start of your next turn, so it holds through your opponent's attacks.",
    wants: "own",
    canHit: (game, seat) => game.players[seat].field.some(Boolean),
    targets: (game, seat) => all(game, seat, () => true),
    effect: (game, playerIndex) => {
      const mine = game.players[playerIndex].field.filter(Boolean);
      mine.forEach((slot) => {
        slot.card.tempDef = (slot.card.tempDef || 0) + 400;
        game.markImpact(playerIndex, game.players[playerIndex].field.indexOf(slot), "boosted", slot.card.name);
      });
      game.addLog(`Tidewall: ${mine.length} creature${mine.length === 1 ? "" : "s"} gain +400 DEF.`);
    },
  },
  {
    name: "Rally Cry", icon: "📯", element: "neutral", rarity: "common", cost: 2, type: "spell",
    text: "Your creatures gain +200 ATK until your next turn.",
    rule: "Every creature you control gains 200 ATK until the start of your next turn. Cast it before you attack.",
    wants: "own", timing: "before-attacks",
    canHit: (game, seat) => game.players[seat].field.some(Boolean),
    targets: (game, seat) => all(game, seat, () => true),
    effect: (game, playerIndex) => {
      const mine = game.players[playerIndex].field.filter(Boolean);
      mine.forEach((slot) => {
        slot.card.tempAtk = (slot.card.tempAtk || 0) + 200;
        game.markImpact(playerIndex, game.players[playerIndex].field.indexOf(slot), "boosted", slot.card.name);
      });
      game.addLog(`Rally Cry: ${mine.length} creature${mine.length === 1 ? "" : "s"} gain +200 ATK.`);
    },
  },
  {
    name: "Landslide", icon: "⛰️", element: "earth", rarity: "epic", cost: 5, type: "spell",
    text: "Destroy every enemy creature without Ward that has 500 DEF or less.",
    rule: "Destroys every enemy creature without Ward whose DEF is 500 or less. If none qualifies, nothing happens.",
    wants: "enemy",
    canHit: (game, seat) => pickCreature(game, 1 - seat, "lowest-def", 500) !== -1,
    targets: (game, seat) => all(game, 1 - seat, (slot) => !game.hasKeyword(slot.card, "ward") && game.getMonsterDefense(slot.card, 1 - seat) <= 500),
    effect: (game, playerIndex) => {
      const foe = 1 - playerIndex, field = game.players[foe].field;
      const doomed = field.map((slot, i) => (slot && !game.hasKeyword(slot.card, "ward") && game.getMonsterDefense(slot.card, foe) <= 500 ? i : -1)).filter((i) => i >= 0);
      if (!doomed.length) return noTarget(game, "Landslide");
      game.addLog(`Landslide buries ${doomed.length} creature${doomed.length === 1 ? "" : "s"}.`);
      doomed.forEach((i) => game.destroyMonster(foe, i));
    },
  },
  {
    name: "Second Wind", icon: "🍃", element: "light", rarity: "common", cost: 1, type: "spell",
    text: "Draw 2 if your opponent has more creatures; otherwise restore 400 LP.",
    rule: "Counts creatures on both sides when it resolves. If your opponent controls more, draw 2 cards; otherwise restore 400 Life Points.",
    effect: (game, playerIndex) => {
      if (creatureCount(game, 1 - playerIndex) <= creatureCount(game, playerIndex)) {
        game.addLog("Second Wind: not outnumbered; restore 400 LP.");
        game.healPlayer(playerIndex, 400);
        return;
      }
      game.addLog("Second Wind draws 2.");
      game.drawCards(playerIndex, 2);
    },
  },
  {
    name: "Turning Gale", icon: "🌪️", element: "wind", rarity: "uncommon", cost: 2, type: "spell",
    text: "Deal 400 damage, or 800 if you have less life than your opponent.",
    rule: "Compares life totals when it resolves. If yours is lower, deal 800 damage to your opponent; otherwise deal 400.",
    effect: (game, playerIndex) => {
      const behind = game.players[playerIndex].lp < game.players[1 - playerIndex].lp;
      game.dealDamage(1 - playerIndex, behind ? 800 : 400, "spell");
    },
  },

];


// ============================================================
// RELICS
// ============================================================
//
// Relics stay in play and stack their bonuses for existing and future creatures.
//

const RELIC_TEMPLATES = [

  {
    name: "Ember Core",
    icon: "🔴",
    element: "flame",
    rarity: "rare",
    cost: 3,
    type: "relic",
    text: "Your flame creatures gain +100 ATK.",

    effect: (game, playerIndex) => {
      const player = game.players[playerIndex];

      player.flameBonus = (player.flameBonus || 0) + 100;
    },
  },

  {
    name: "Crystal Heart",
    icon: "💠",
    element: "earth",
    rarity: "rare",
    cost: 3,
    type: "relic",
    text: "Your earth creatures gain +100 DEF.",

    effect: (game, playerIndex) => {
      const player = game.players[playerIndex];

      player.earthDefenseBonus =
        (player.earthDefenseBonus || 0) + 100;
    },
  },

  {
    name: "Void Shard",
    icon: "🟣",
    element: "shadow",
    rarity: "rare",
    cost: 3,
    type: "relic",
    text: "Your shadow creatures gain +100 ATK.",

    effect: (game, playerIndex) => {
      const player = game.players[playerIndex];

      player.shadowBonus = (player.shadowBonus || 0) + 100;
    },
  },

  // EXPANSION 1: one relic for every element (GDADA run 1).
  {
    name: "Tidestone", icon: "🔵", element: "water", rarity: "rare", cost: 3, type: "relic",
    text: "Your water creatures gain +100 DEF.",
    effect: (game, playerIndex) => { const p = game.players[playerIndex]; p.relicDef.water = (p.relicDef.water || 0) + 100; },
  },
  {
    name: "Storm Feather", icon: "🪶", element: "wind", rarity: "rare", cost: 3, type: "relic",
    text: "Your wind creatures gain +100 ATK.",
    effect: (game, playerIndex) => { const p = game.players[playerIndex]; p.relicAtk.wind = (p.relicAtk.wind || 0) + 100; },
  },
  {
    name: "Sun Sigil", icon: "🟡", element: "light", rarity: "rare", cost: 3, type: "relic",
    text: "Your light creatures gain +100 ATK and +100 DEF.",
    effect: (game, playerIndex) => { const p = game.players[playerIndex]; p.relicAtk.light = (p.relicAtk.light || 0) + 100; p.relicDef.light = (p.relicDef.light || 0) + 100; },
  },
  {
    name: "War Banner", icon: "🚩", element: "neutral", rarity: "epic", cost: 4, type: "relic",
    text: "All your creatures gain +50 ATK and +50 DEF.",
    effect: (game, playerIndex) => { const p = game.players[playerIndex]; p.relicAtk.all = (p.relicAtk.all || 0) + 50; p.relicDef.all = (p.relicDef.all || 0) + 50; },
  },

];


// ============================================================
// CARD ID GENERATION
// ============================================================

let nextCardUID = 0;


// ============================================================
// CREATE CARD
// ============================================================

function createCard(template) {

  return {
    id: `card-${nextCardUID++}`,

    type: template.type || "monster",

    name: template.name,
    icon: template.icon,

    element: template.element || "neutral",
    rarity: template.rarity || "common",

    cost: template.cost || 0,

    atk: template.atk || 0,
    def: template.def || 0,

    keywords: template.keywords
      ? [...template.keywords]
      : [],

    text: template.text || "",

    // Board spells: the full target rule (shown in the detail panel), what
    // the spell touches, when it is worth casting, and whether it can hit now.
    flavor: template.flavor || "",
    rule: template.rule || "",
    // Creature abilities (run 2): copied, or the engine never sees them.
    onSummon: template.onSummon || null,
    onAttack: template.onAttack || null,
    onKill: template.onKill || null,
    onDeath: template.onDeath || null,
    onDawn: template.onDawn || null,
    wants: template.wants || null,
    timing: template.timing || null,
    canHit: template.canHit || null,
    targets: template.targets || null,
    worthAtk: template.worthAtk || 0,

    effect: template.effect || null,
  };
}


// ============================================================
// BUILD ONE FULL DECK
// ============================================================
//
// Each duel uses one copy of every card in the collection.
// This makes every creature, spell and persistent relic available.

function buildDeckCards() {
  return [...MONSTER_TEMPLATES, ...SPELL_TEMPLATES, ...RELIC_TEMPLATES]
    .map(createCard);
}


// ============================================================
// BUILD A DECK (RANDOM OR DETERMINISTIC)
// ============================================================
//
// Multiplayer note:
//
// Card instances carry process-local ids (`card-1`, `card-2`…),
// so without a seed every browser would build decks whose ids
// diverge after shuffling. For online matches the host sends a
// single match seed and BOTH browsers call
//
//   buildSeededDeck(seed, seat)
//
// which produces identical decks (and identical card ids) on
// both machines. Actions can then reference card ids safely.
//

function buildDeck() {

  return shuffle(buildDeckCards());
}


function buildSeededDeck(seed, seat) {

  const rng = createSeededRandom(
    ((seed >>> 0) ^ Math.imul((seat + 1), 0x9e3779b9)) >>> 0
  );

  const deck = shuffle(buildDeckCards(), rng);

  // Re-assign ids AFTER shuffling so a card's id depends only
  // on the seed, the seat, and its final deck position. This
  // keeps card ids identical on both browsers even across
  // rematches, where the global createCard id counter would
  // otherwise drift.
  deck.forEach((card, index) => {

    card.id = `s${seat}-${seed >>> 0}-${index}`;

  });

  return deck;
}


// ============================================================
// FULL COLLECTION
// ============================================================
//
// Useful later for:
//   - deck builder
//   - card collection
//   - random booster packs
//   - matchmaking restrictions
//   - card database UI
//

function getAllCards() {

  return [

    ...MONSTER_TEMPLATES,
    ...SPELL_TEMPLATES,
    ...RELIC_TEMPLATES,

  ].map((template) => createCard(template));
}


// ============================================================
// SEEDED RANDOM NUMBER GENERATOR
// ============================================================
//
// Deterministic RNG used for multiplayer matches.
//
// When two players start a networked duel, the host generates
// a single match seed. Both browsers feed that seed into this
// generator, so both players shuffle and draw from identical
// decks without ever sending card data over the network.
//
// mulberry32 — small, fast, well-distributed 32-bit PRNG.
//

function createSeededRandom(seed) {

  let state = seed >>> 0;

  return function () {

    state = (state + 0x6d2b79f5) >>> 0;

    let t = state;

    t = Math.imul(t ^ (t >>> 15), t | 1);

    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}


// ============================================================
// SHUFFLE
// ============================================================

function shuffle(array, rng = Math.random) {

  const copy = array.slice();

  for (let i = copy.length - 1; i > 0; i--) {

    const j = Math.floor(rng() * (i + 1));

    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}


// ============================================================
// CARD LOOKUP
// ============================================================

function findCardTemplate(name) {

  return (

    MONSTER_TEMPLATES.find(
      (card) => card.name === name
    ) ||

    SPELL_TEMPLATES.find(
      (card) => card.name === name
    ) ||

    RELIC_TEMPLATES.find(
      (card) => card.name === name
    )

  );
}


// ============================================================
// EXPORTS
// ============================================================
//
// Browser version:
//
// These globals remain available to game.js.
//
// Node/CommonJS version:
//
// The export block allows server-side tools/tests to access
// the same card database.
//

if (typeof module !== "undefined" && module.exports) {

  module.exports = {

    MONSTER_TEMPLATES,
    SPELL_TEMPLATES,
    RELIC_TEMPLATES,

    createCard,
    buildDeck,
    buildSeededDeck,
    getAllCards,
    findCardTemplate,

    shuffle,
    createSeededRandom,

  };

}

