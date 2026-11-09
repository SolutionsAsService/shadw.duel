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
    text: "A small flame creature that strikes before stronger foes.",
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
    text: "Fast and aggressive.",
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
    text: "Its attacks leave burning wounds.",
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
    text: "A heavily armed warrior surrounded by fire.",
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
    text: "A devastating dragon born from the remains of an ancient fire.",
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
    text: "A small spirit that restores a little vitality.",
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
    text: "Its flowing body absorbs incoming attacks.",
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
    text: "Chilling song weakens opposing creatures.",
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
    text: "A massive creature from the deepest waters.",
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
    text: "An ancient monster capable of overwhelming entire battlefields.",
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
    text: "A reliable defensive guardian.",
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
    text: "Heavy armor makes this construct difficult to destroy.",
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
    text: "Crystal armor protects it from hostile magic.",
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
    text: "A walking mountain that dominates the battlefield.",
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
    text: "An ancient titan capable of reshaping the battlefield.",
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
    text: "A fast aerial attacker.",
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
    text: "Aerial hunters strike vulnerable targets.",
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
    text: "Lightning crackles across its wings.",
  },

  {
    name: "Tempest Giant",
    icon: "🌪️",
    element: "wind",
    rarity: "rare",
    cost: 5,
    atk: 1100,
    def: 750,
    keywords: ["swift"],
    text: "A giant formed from a living storm.",
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
    text: "Master of the upper skies.",
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
    text: "A young healer devoted to the light.",
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
    text: "A holy warrior who protects allies.",
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
    text: "A celestial warrior surrounded by radiant energy.",
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
    text: "A legendary protector of the living.",
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
    text: "A creature that strikes from darkness.",
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
    text: "A silent assassin that weakens its victims.",
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
    text: "A beast summoned from the space between worlds.",
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
    text: "Feeds on the life force of defeated enemies.",
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
    text: "An ancient entity that commands the darkness.",
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
    text: "A dependable warrior with no elemental allegiance.",
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
    text: "A mechanical construct powered by arcane energy.",
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
    text: "A massive construct designed for direct combat.",
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
    text: "A legendary being from before recorded history.",
  },


  // ----------------------------------------------------------
  // EXPANSION 1 (GDADA run 1): fills the cost curve and the
  // under-used keywords (lifesteal, debuff) with existing rules.
  // ----------------------------------------------------------

  { name: "Gloom Mite", icon: "🕷️", element: "shadow", rarity: "common", cost: 1, atk: 300, def: 250,
    keywords: ["lifesteal"], text: "A tick of living dusk that feeds on every blow." },
  { name: "Lantern Bearer", icon: "🏮", element: "light", rarity: "common", cost: 2, atk: 400, def: 450,
    keywords: ["heal"], text: "Carries the dawn into the longest night." },
  { name: "Mossback Tortoise", icon: "🐢", element: "earth", rarity: "common", cost: 1, atk: 200, def: 450,
    keywords: ["guard"], text: "A boulder that decided to walk." },
  { name: "Brine Witch", icon: "🧙", element: "water", rarity: "uncommon", cost: 4, atk: 700, def: 650,
    keywords: ["debuff", "lifesteal"], text: "Her tide pulls strength out of everything it touches." },
  { name: "Pyre Phoenix", icon: "🐦‍🔥", element: "flame", rarity: "rare", cost: 5, atk: 950, def: 600,
    keywords: ["burn", "lifesteal"], text: "It burns its enemies and drinks the heat back." },
  { name: "Gale Harpy", icon: "🪶", element: "wind", rarity: "uncommon", cost: 4, atk: 750, def: 450,
    keywords: ["swift", "debuff"], text: "Shrieks down out of the storm before anyone can brace." },
  { name: "Wandering Duelist", icon: "🤺", element: "neutral", rarity: "uncommon", cost: 4, atk: 800, def: 700,
    keywords: [], text: "No banner, no master, no wasted motion." },
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
    text: "Deal 500 damage directly to your opponent.",

    effect: (game, playerIndex) => {
      game.dealDamage(1 - playerIndex, 500, "spell");
    },
  },

  {
    name: "Spark",
    icon: "⚡",
    element: "wind",
    rarity: "common",
    cost: 1,
    type: "spell",
    text: "Deal 250 damage directly to your opponent.",

    effect: (game, playerIndex) => {
      game.dealDamage(1 - playerIndex, 250, "spell");
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
    text: "Draw 1 card.",

    effect: (game, playerIndex) => {
      game.drawCards(playerIndex, 1);
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
    text: "Deal 750 damage directly to your opponent.",

    effect: (game, playerIndex) => {
      game.dealDamage(1 - playerIndex, 750, "spell");
    },
  },

  {
    name: "Void Bolt",
    icon: "🕳️",
    element: "shadow",
    rarity: "rare",
    cost: 3,
    type: "spell",
    text: "Deal 900 damage directly to your opponent.",

    effect: (game, playerIndex) => {
      game.dealDamage(1 - playerIndex, 900, "spell");
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
    text: "Gain 1000 Life Points.",

    effect: (game, playerIndex) => {
      game.healPlayer(playerIndex, 1000);
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
    text: "Deal 1400 damage directly to your opponent.",

    effect: (game, playerIndex) => {
      game.dealDamage(1 - playerIndex, 1400, "spell");
    },
  },

  {
    name: "Void Collapse",
    icon: "🌌",
    element: "shadow",
    rarity: "epic",
    cost: 6,
    type: "spell",
    text: "Deal 1800 damage directly to your opponent.",

    effect: (game, playerIndex) => {
      game.dealDamage(1 - playerIndex, 1800, "spell");
    },
  },

  {
    name: "Divine Renewal",
    icon: "🌞",
    element: "light",
    rarity: "epic",
    cost: 5,
    type: "spell",
    text: "Restore 1800 Life Points.",

    effect: (game, playerIndex) => {
      game.healPlayer(playerIndex, 1800);
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
    rule: template.rule || "",
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

