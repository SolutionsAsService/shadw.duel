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
// KEYWORDS:
//   guard       - defensive creature
//   swift       - intended to attack quickly
//   piercing    - intended for future DEF penetration
//   lifesteal   - intended to recover LP from combat
//   ward        - intended to resist effects
//   summon      - creates another creature
//   draw        - card advantage
//   burn        - direct damage
//   heal        - restores LP
//   buff        - improves another card
//   debuff      - weakens an opponent
//   sacrifice   - future resource mechanic
//
// The current game engine may not implement every keyword yet.
// The card data is intentionally prepared for those mechanics.
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

];


// ============================================================
// SPELL TEMPLATES
// ============================================================

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
      game.players[playerIndex].lp += 800;
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
      game.players[playerIndex].lp += 500;

      if (typeof game.drawCards === "function") {
        game.drawCards(playerIndex, 1);
      }
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
      const opponent = game.players[1 - playerIndex];
      opponent.lp -= 500;
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
      const opponent = game.players[1 - playerIndex];
      opponent.lp -= 250;
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
      if (typeof game.drawCards === "function") {
        game.drawCards(playerIndex, 2);
      }
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
      if (typeof game.drawCards === "function") {
        game.drawCards(playerIndex, 1);
      }
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
    text: "Your next combat creature gains +300 ATK.",

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
    text: "Your next defensive creature gains +400 DEF.",

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
    text: "Prepare your creatures for a swift attack.",

    effect: (game, playerIndex) => {
      const player = game.players[playerIndex];

      player.swiftBonus = true;
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
      const opponent = game.players[1 - playerIndex];

      opponent.lp -= 750;
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
      const opponent = game.players[1 - playerIndex];

      opponent.lp -= 900;
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
      const opponent = game.players[1 - playerIndex];

      opponent.lp -= 700;

      if (typeof game.drawCards === "function") {
        game.drawCards(playerIndex, 1);
      }
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
    text: "Gain 600 temporary Life Points.",

    effect: (game, playerIndex) => {
      const player = game.players[playerIndex];

      player.lp += 600;
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
      const player = game.players[playerIndex];

      player.lp += 1000;
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
      if (typeof game.drawCards === "function") {
        game.drawCards(playerIndex, 3);
      }
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
      const player = game.players[playerIndex];

      player.lp -= 300;

      if (typeof game.drawCards === "function") {
        game.drawCards(playerIndex, 2);
      }
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
      const opponent = game.players[1 - playerIndex];

      opponent.lp -= 1400;
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
      const opponent = game.players[1 - playerIndex];

      opponent.lp -= 1800;
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
      const player = game.players[playerIndex];

      player.lp += 1800;
    },
  },

];


// ============================================================
// RELICS
// ============================================================
//
// Relics are currently treated as cards.
// The game engine can later give them persistent battlefield
// effects rather than immediate spell effects.
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

    effect: template.effect || null,
  };
}


// ============================================================
// BUILD ONE FULL DECK
// ============================================================
//
// 32-card starter deck:
//
//   20 unique monster templates
//   12 spell/relic cards
//
// We deliberately use selected cards rather than putting every
// card in the database into every deck.
//
// This can later become a proper deck-builder.
//

function buildDeck() {

  const deck = [];

  // ----------------------------------------------------------
  // STARTER MONSTERS
  // ----------------------------------------------------------

  const selectedMonsters = [

    "Ember Whelp",
    "Cinder Wolf",
    "Flame Serpent",

    "River Sprite",
    "Tide Serpent",
    "Frost Siren",

    "Stone Guardian",
    "Iron Golem",
    "Crystal Sentinel",

    "Wind Falcon",
    "Sky Hunter",
    "Storm Drake",

    "Dawn Acolyte",
    "Radiant Knight",

    "Shadow Stalker",
    "Nightblade",

    "Ironclad Mercenary",
    "Arcane Automaton",

  ];

  // Two copies of selected monsters.
  selectedMonsters.forEach((name) => {

    const template = MONSTER_TEMPLATES.find(
      (card) => card.name === name
    );

    if (!template) return;

    deck.push(createCard(template));
    deck.push(createCard(template));
  });


  // ----------------------------------------------------------
  // STARTER SPELLS
  // ----------------------------------------------------------

  const selectedSpells = [

    "Healing Potion",
    "Minor Restoration",
    "Fireball",
    "Spark",
    "Quick Draw",
    "Draw Two",

    "Battle Rage",
    "Stone Skin",

    "Flame Burst",
    "Barrier",

    "Lightning Strike",
    "Dark Bargain",

  ];

  selectedSpells.forEach((name) => {

    const template = SPELL_TEMPLATES.find(
      (card) => card.name === name
    );

    if (!template) return;

    deck.push(createCard(template));
  });


  return shuffle(deck);
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
// SHUFFLE
// ============================================================

function shuffle(array) {

  const copy = array.slice();

  for (let i = copy.length - 1; i > 0; i--) {

    const j = Math.floor(Math.random() * (i + 1));

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

    buildDeck,
    getAllCards,
    findCardTemplate,

    shuffle,

  };

}

