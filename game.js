// ============================================================
// SHADOW DUEL — GAME ENGINE
// ============================================================
//
// Core rules engine for Shadow Duel.
//
// The game state is intentionally kept in one object.
// This makes it easy to:
//   - render the game
//   - save/load a match
//   - synchronize a match over P2P
//   - replay a match
//   - validate player actions
//
// NETWORKING NOTE:
// Do NOT put networking logic inside these functions.
// Later the mesh layer can transmit actions such as:
//
//   PLAY_CARD
//   ATTACK
//   END_TURN
//
// The game engine remains responsible for deciding whether
// those actions are legal.
//
// ============================================================


// ============================================================
// GAME CONSTANTS
// ============================================================

const GAME_RULES = {

  startingLP: 8000,

  startingHandSize: 5,

  fieldSlots: 5,

  maxHandSize: 9,

  maxEnergy: 10,

  startingEnergy: 1,

  maxLogEntries: 80,

  burnDamage: 200,

  defaultAttackBonus: 0,

  defaultDefenseBonus: 0,

};


// ============================================================
// PLAYER FACTORY
// ============================================================

function createPlayer() {

  return {

    // -------------------------
    // Life
    // -------------------------

    lp: GAME_RULES.startingLP,


    // -------------------------
    // Resources
    // -------------------------

    energy: GAME_RULES.startingEnergy,

    maxEnergy: GAME_RULES.startingEnergy,


    // -------------------------
    // Cards
    // -------------------------

    deck: [],

    hand: [],


    // -------------------------
    // Battlefield
    // -------------------------

    field: [
      null,
      null,
      null,
      null,
      null,
    ],

    relics: [],


    // -------------------------
    // Turn state
    // -------------------------

    monsterPlayedThisTurn: false,

    spellsPlayedThisTurn: 0,

    hasDrawnThisTurn: false,


    // -------------------------
    // Temporary bonuses
    // -------------------------

    attackBonus: 0,

    defenseBonus: 0,

    swiftBonus: false,


    // -------------------------
    // Statistics
    // -------------------------

    cardsPlayed: 0,

    monstersDestroyed: 0,

    damageDealt: 0,

    damageTaken: 0,

  };

}


// ============================================================
// MAIN GAME STATE
// ============================================================

const game = {

  players: [
    createPlayer(),
    createPlayer(),
  ],

  currentPlayer: 0,

  turnNumber: 1,

  phase: "main",

  gameOver: false,

  winner: null,

  log: [],

  selectedAttacker: null,

  selectedCard: null,

  pendingAction: null,

};


// ============================================================
// LOGGING
// ============================================================

function addLog(message) {

  game.log.unshift(message);

  if (game.log.length > GAME_RULES.maxLogEntries) {
    game.log.pop();
  }

}


// ============================================================
// CURRENT / OPPONENT HELPERS
// ============================================================

function currentPlayer() {

  return game.players[game.currentPlayer];

}


function opponentPlayer() {

  return game.players[1 - game.currentPlayer];

}


function getPlayer(playerIndex) {

  return game.players[playerIndex];

}


// ============================================================
// SAFE DAMAGE
// ============================================================

function dealDamage(playerIndex, amount, source = "effect") {

  if (amount <= 0) return;

  const player = game.players[playerIndex];

  player.lp -= amount;

  player.damageTaken += amount;

  game.players[1 - playerIndex].damageDealt += amount;

  addLog(
    `Player ${playerIndex + 1} takes ${amount} damage (${source}).`
  );

  checkLifePoints();

}


// ============================================================
// HEAL
// ============================================================

function healPlayer(playerIndex, amount) {

  if (amount <= 0) return;

  const player = game.players[playerIndex];

  const before = player.lp;

  player.lp += amount;

  const healed = player.lp - before;

  if (healed > 0) {

    addLog(
      `Player ${playerIndex + 1} restores ${healed} Life Points.`
    );

  }

}


// ============================================================
// CHECK LIFE
// ============================================================

function checkLifePoints() {

  if (game.gameOver) return;

  if (game.players[0].lp <= 0) {

    game.players[0].lp = 0;

    endGame(
      1,
      "Player 1 ran out of Life Points!"
    );

    return;
  }


  if (game.players[1].lp <= 0) {

    game.players[1].lp = 0;

    endGame(
      0,
      "Player 2 ran out of Life Points!"
    );

  }

}


// ============================================================
// END GAME
// ============================================================

function endGame(winnerIndex, reason) {

  if (game.gameOver) return;

  game.gameOver = true;

  game.winner = winnerIndex;

  game.phase = "gameover";

  game.selectedAttacker = null;

  game.pendingAction = null;

  addLog(reason);

  addLog(
    `Player ${winnerIndex + 1} wins!`
  );

}


// ============================================================
// DRAW CARDS
// ============================================================

function drawCards(playerIndex, count) {

  const player = game.players[playerIndex];

  for (let i = 0; i < count; i++) {

    if (player.deck.length === 0) {

      endGame(
        1 - playerIndex,
        `Player ${playerIndex + 1} ran out of cards!`
      );

      return false;
    }


    const card = player.deck.shift();


    // -----------------------------------------
    // Maximum hand size
    // -----------------------------------------

    if (player.hand.length >= GAME_RULES.maxHandSize) {

      addLog(
        `Player ${playerIndex + 1}'s hand is full. ${card.name} is discarded.`
      );

      continue;
    }


    player.hand.push(card);

  }

  return true;

}


// ============================================================
// DRAW ONE
// ============================================================

function drawCard(playerIndex) {

  return drawCards(playerIndex, 1);

}


// ============================================================
// ENERGY
// ============================================================

function refreshEnergy(playerIndex) {

  const player = game.players[playerIndex];

  player.maxEnergy = Math.min(
    GAME_RULES.maxEnergy,
    Math.max(1, game.turnNumber)
  );

  player.energy = player.maxEnergy;

}


// ============================================================
// SPEND ENERGY
// ============================================================

function spendEnergy(playerIndex, amount) {

  const player = game.players[playerIndex];

  if (amount < 0) return false;

  if (player.energy < amount) {

    addLog(
      `Not enough energy. Need ${amount}, have ${player.energy}.`
    );

    return false;
  }

  player.energy -= amount;

  return true;

}


// ============================================================
// CARD COST
// ============================================================

function getCardCost(card) {

  if (!card) return 0;

  return Number.isFinite(card.cost)
    ? card.cost
    : 0;

}


// ============================================================
// FIND CARD IN HAND
// ============================================================

function findCardInHand(playerIndex, cardId) {

  return game.players[playerIndex].hand.findIndex(
    (card) => card.id === cardId
  );

}


// ============================================================
// REMOVE CARD FROM HAND
// ============================================================

function removeCardFromHand(playerIndex, cardId) {

  const player = game.players[playerIndex];

  const index = findCardInHand(
    playerIndex,
    cardId
  );

  if (index === -1) return null;

  const card = player.hand[index];

  player.hand.splice(index, 1);

  return card;

}


// ============================================================
// HAS KEYWORD
// ============================================================

function hasKeyword(card, keyword) {

  return !!(
    card &&
    Array.isArray(card.keywords) &&
    card.keywords.includes(keyword)
  );

}


// ============================================================
// GET MONSTER ATK
// ============================================================

function getMonsterAttack(card, playerIndex = null) {

  if (!card) return 0;

  let value = card.atk || 0;


  // Player-wide attack bonus.

  if (playerIndex !== null) {

    value +=
      game.players[playerIndex].attackBonus || 0;

  }


  // Element relic bonuses.

  if (
    playerIndex !== null &&
    card.element === "flame"
  ) {

    value +=
      game.players[playerIndex].flameBonus || 0;

  }


  if (
    playerIndex !== null &&
    card.element === "shadow"
  ) {

    value +=
      game.players[playerIndex].shadowBonus || 0;

  }


  // Individual temporary combat bonus.

  if (card.tempAtk) {
    value += card.tempAtk;
  }


  return Math.max(0, value);

}


// ============================================================
// GET MONSTER DEF
// ============================================================

function getMonsterDefense(card, playerIndex = null) {

  if (!card) return 0;

  let value = card.def || 0;


  if (playerIndex !== null) {

    value +=
      game.players[playerIndex].defenseBonus || 0;

  }


  if (
    playerIndex !== null &&
    card.element === "earth"
  ) {

    value +=
      game.players[playerIndex].earthDefenseBonus || 0;

  }


  if (card.tempDef) {
    value += card.tempDef;
  }


  return Math.max(0, value);

}


// ============================================================
// CREATE FIELD MONSTER
// ============================================================

function createFieldMonster(card) {

  return {

    card: card,

    summonSickness:
      !hasKeyword(card, "swift"),

    hasAttacked: false,

    damage: 0,

    tempAtk: 0,

    tempDef: 0,

    burn: 0,

    stunned: false,

    markedForDeath: false,

  };

}


// ============================================================
// MONSTER PLAY VALIDATION
// ============================================================

function canPlayMonster(card) {

  const player = currentPlayer();

  if (!card) return false;

  if (card.type !== "monster") {

    addLog("That card is not a monster.");

    return false;
  }


  if (game.phase !== "main") {

    addLog("You can only summon monsters during your main phase.");

    return false;
  }


  if (player.monsterPlayedThisTurn) {

    addLog(
      "You already played a monster this turn."
    );

    return false;
  }


  const emptySlot = player.field.findIndex(
    (slot) => slot === null
  );


  if (emptySlot === -1) {

    addLog(
      "Your field is full — no room for another monster."
    );

    return false;
  }


  const cost = getCardCost(card);

  if (player.energy < cost) {

    addLog(
      `${card.name} costs ${cost} energy, but you only have ${player.energy}.`
    );

    return false;
  }


  return true;

}


// ============================================================
// PLAY MONSTER
// ============================================================

function playMonster(cardId) {

  if (game.gameOver) return;

  const playerIndex = game.currentPlayer;

  const player = game.players[playerIndex];

  const cardIndex =
    player.hand.findIndex(
      (card) => card.id === cardId
    );


  if (cardIndex === -1) return;

  const card = player.hand[cardIndex];


  if (!canPlayMonster(card)) return;


  const emptySlot =
    player.field.findIndex(
      (slot) => slot === null
    );


  if (emptySlot === -1) return;


  const cost = getCardCost(card);


  if (!spendEnergy(playerIndex, cost)) {
    return;
  }


  player.hand.splice(cardIndex, 1);


  const fieldMonster =
    createFieldMonster(card);


  player.field[emptySlot] =
    fieldMonster;


  player.monsterPlayedThisTurn = true;

  player.cardsPlayed++;


  addLog(
    `Player ${playerIndex + 1} summoned ${card.name} `
    + `(${getMonsterAttack(card, playerIndex)} ATK / `
    + `${getMonsterDefense(card, playerIndex)} DEF) `
    + `for ${cost} energy.`
  );


  game.selectedCard = null;

  render();

}


// ============================================================
// SPELL VALIDATION
// ============================================================

function canPlaySpell(card) {

  if (!card) return false;

  if (card.type !== "spell") {

    addLog("That card is not a spell.");

    return false;
  }


  if (game.phase !== "main") {

    addLog(
      "You can only cast spells during your main phase."
    );

    return false;
  }


  const cost = getCardCost(card);

  if (currentPlayer().energy < cost) {

    addLog(
      `${card.name} costs ${cost} energy, but you only have `
      + `${currentPlayer().energy}.`
    );

    return false;
  }


  return true;

}


// ============================================================
// PLAY SPELL
// ============================================================

function playSpell(cardId) {

  if (game.gameOver) return;

  const playerIndex = game.currentPlayer;

  const player = game.players[playerIndex];


  const cardIndex =
    player.hand.findIndex(
      (card) => card.id === cardId
    );


  if (cardIndex === -1) return;


  const card = player.hand[cardIndex];


  if (!canPlaySpell(card)) return;


  const cost = getCardCost(card);


  if (!spendEnergy(playerIndex, cost)) {
    return;
  }


  player.hand.splice(cardIndex, 1);


  player.spellsPlayedThisTurn++;

  player.cardsPlayed++;


  addLog(
    `Player ${playerIndex + 1} cast ${card.name} `
    + `for ${cost} energy: ${card.text}`
  );


  if (typeof card.effect === "function") {

    try {

      card.effect(
        game,
        playerIndex
      );

    } catch (error) {

      console.error(
        `Error resolving ${card.name}:`,
        error
      );

      addLog(
        `${card.name} failed to resolve.`
      );

    }

  }


  checkLifePoints();

  render();

}


// ============================================================
// PLAY RELIC
// ============================================================

function playRelic(cardId) {

  if (game.gameOver) return;

  const playerIndex = game.currentPlayer;

  const player = game.players[playerIndex];


  const cardIndex =
    player.hand.findIndex(
      (card) => card.id === cardId
    );


  if (cardIndex === -1) return;


  const card = player.hand[cardIndex];


  if (card.type !== "relic") return;


  const cost = getCardCost(card);


  if (player.energy < cost) {

    addLog(
      `Not enough energy to play ${card.name}.`
    );

    return;
  }


  if (!spendEnergy(playerIndex, cost)) {
    return;
  }


  player.hand.splice(cardIndex, 1);

  player.relics.push(card);

  player.cardsPlayed++;


  addLog(
    `Player ${playerIndex + 1} played relic ${card.name}.`
  );


  if (typeof card.effect === "function") {

    card.effect(
      game,
      playerIndex
    );

  }


  render();

}


// ============================================================
// SELECT ATTACKER
// ============================================================

function selectAttacker(slotIndex) {

  if (game.gameOver) return;

  const player =
    game.players[game.currentPlayer];

  const slot =
    player.field[slotIndex];


  if (!slot) return;


  if (slot.stunned) {

    addLog(
      `${slot.card.name} is stunned and cannot attack.`
    );

    return;
  }


  if (slot.summonSickness) {

    addLog(
      `${slot.card.name} was just summoned and cannot attack yet.`
    );

    return;
  }


  if (slot.hasAttacked) {

    addLog(
      `${slot.card.name} already attacked this turn.`
    );

    return;
  }


  game.selectedAttacker =
    game.selectedAttacker === slotIndex
      ? null
      : slotIndex;


  if (game.selectedAttacker !== null) {

    addLog(
      `${slot.card.name} selected for attack.`
    );

  }


  render();

}


// ============================================================
// CALCULATE COMBAT DAMAGE
// ============================================================

function calculateCombatDamage(attacker, defender) {

  const attackPower =
    getMonsterAttack(
      attacker.card,
      game.currentPlayer
    );


  const defensePower =
    getMonsterDefense(
      defender.card,
      1 - game.currentPlayer
    );


  return {
    attackPower,
    defensePower,
    difference:
      attackPower - defensePower,
  };

}


// ============================================================
// DESTROY MONSTER
// ============================================================

function destroyMonster(playerIndex, slotIndex) {

  const player =
    game.players[playerIndex];

  const slot =
    player.field[slotIndex];


  if (!slot) return;


  addLog(
    `${slot.card.name} was destroyed.`
  );


  player.field[slotIndex] = null;

  player.monstersDestroyed++;


  // Future graveyard support can go here.
  //
  // player.graveyard.push(slot.card);

}


// ============================================================
// APPLY BURN
// ============================================================

function applyBurn(playerIndex, amount) {

  if (amount <= 0) return;

  dealDamage(
    playerIndex,
    amount,
    "burn"
  );

}


// ============================================================
// LIFESTEAL
// ============================================================

function applyLifesteal(playerIndex, amount) {

  if (amount <= 0) return;

  healPlayer(
    playerIndex,
    amount
  );

}


// ============================================================
// ATTACK DIRECTLY
// ============================================================

function attackDirectly(attackerSlot) {

  const attackerIndex =
    game.currentPlayer;

  const defenderIndex =
    1 - attackerIndex;


  const attackPower =
    getMonsterAttack(
      attackerSlot.card,
      attackerIndex
    );


  dealDamage(
    defenderIndex,
    attackPower,
    `${attackerSlot.card.name} direct attack`
  );


  if (
    hasKeyword(
      attackerSlot.card,
      "lifesteal"
    )
  ) {

    applyLifesteal(
      attackerIndex,
      attackPower
    );

  }


  if (
    hasKeyword(
      attackerSlot.card,
      "burn"
    )
  ) {

    applyBurn(
      defenderIndex,
      GAME_RULES.burnDamage
    );

  }


  attackerSlot.hasAttacked = true;


  addLog(
    `${attackerSlot.card.name} attacks directly for `
    + `${attackPower} damage!`
  );

}


// ============================================================
// ATTACK MONSTER
// ============================================================

function attackMonster(defenderSlotIndex) {

  const attackerIndex =
    game.currentPlayer;

  const defenderIndex =
    1 - attackerIndex;


  const attackerSlot =
    game.players[attackerIndex]
      .field[game.selectedAttacker];


  const defenderSlot =
    game.players[defenderIndex]
      .field[defenderSlotIndex];


  if (!attackerSlot || !defenderSlot) {
    return;
  }


  const attacker =
    attackerSlot.card;

  const defender =
    defenderSlot.card;


  const combat =
    calculateCombatDamage(
      attackerSlot,
      defenderSlot
    );


  const attackPower =
    combat.attackPower;

  const defensePower =
    combat.defensePower;


  addLog(
    `${attacker.name} attacks ${defender.name}! `
    + `${attackPower} ATK vs ${defensePower} DEF.`
  );


  // ----------------------------------------------------------
  // ATTACKER WINS
  // ----------------------------------------------------------

  if (attackPower > defensePower) {

    const excess =
      attackPower - defensePower;


    destroyMonster(
      defenderIndex,
      defenderSlotIndex
    );


    if (excess > 0) {

      dealDamage(
        defenderIndex,
        excess,
        "combat overflow"
      );

    }


    if (
      hasKeyword(
        attacker,
        "lifesteal"
      )
    ) {

      applyLifesteal(
        attackerIndex,
        attackPower
      );

    }


    if (
      hasKeyword(
        attacker,
        "burn"
      )
    ) {

      applyBurn(
        defenderIndex,
        GAME_RULES.burnDamage
      );

    }


    addLog(
      `${attacker.name} destroys ${defender.name}!`
      + (excess > 0
        ? ` ${excess} excess damage!`
        : "")
    );

  }


  // ----------------------------------------------------------
  // DRAW
  // ----------------------------------------------------------

  else if (attackPower === defensePower) {

    destroyMonster(
      attackerIndex,
      game.selectedAttacker
    );


    destroyMonster(
      defenderIndex,
      defenderSlotIndex
    );


    addLog(
      `${attacker.name} and ${defender.name} destroy each other!`
    );

  }


  // ----------------------------------------------------------
  // DEFENDER WINS
  // ----------------------------------------------------------

  else {

    const excess =
      defensePower - attackPower;


    destroyMonster(
      attackerIndex,
      game.selectedAttacker
    );


    if (excess > 0) {

      dealDamage(
        attackerIndex,
        excess,
        "combat backlash"
      );

    }


    addLog(
      `${defender.name} destroys ${attacker.name}!`
      + (excess > 0
        ? ` ${excess} damage to Player ${attackerIndex + 1}.`
        : "")
    );

  }


  // ----------------------------------------------------------
  // MARK ATTACK COMPLETE
  // ----------------------------------------------------------

  // The slot may have been destroyed, so this is intentionally
  // guarded.

  if (
    game.players[attackerIndex]
      .field[game.selectedAttacker]
  ) {

    game.players[attackerIndex]
      .field[game.selectedAttacker]
      .hasAttacked = true;

  }


  game.selectedAttacker = null;


  checkLifePoints();

  render();

}


// ============================================================
// ATTACK SLOT
// ============================================================

function attackSlot(defenderSlotIndex) {

  if (game.gameOver) return;


  if (game.selectedAttacker === null) {

    addLog(
      "Select one of your monsters first."
    );

    return;
  }


  const attackerIndex =
    game.currentPlayer;

  const defenderIndex =
    1 - attackerIndex;


  const attackerSlot =
    game.players[attackerIndex]
      .field[game.selectedAttacker];


  if (!attackerSlot) {

    game.selectedAttacker = null;

    render();

    return;
  }


  const defenderField =
    game.players[defenderIndex].field;


  const defenderHasMonsters =
    defenderField.some(
      (slot) => slot !== null
    );


  // ----------------------------------------------------------
  // DIRECT ATTACK
  // ----------------------------------------------------------

  if (defenderSlotIndex === null) {

    if (defenderHasMonsters) {

      addLog(
        "Your opponent still has monsters. "
        + "Destroy them before attacking directly."
      );

      return;
    }


    attackDirectly(
      attackerSlot
    );


    game.selectedAttacker = null;

    checkLifePoints();

    render();

    return;
  }


  // ----------------------------------------------------------
  // MONSTER ATTACK
  // ----------------------------------------------------------

  const defenderSlot =
    defenderField[defenderSlotIndex];


  if (!defenderSlot) return;


  attackMonster(
    defenderSlotIndex
  );

}


// ============================================================
// START TURN
// ============================================================

function startTurn() {

  const playerIndex =
    game.currentPlayer;

  const player =
    game.players[playerIndex];


  game.phase = "main";


  // ----------------------------------------------------------
  // Reset turn values
  // ----------------------------------------------------------

  player.monsterPlayedThisTurn = false;

  player.spellsPlayedThisTurn = 0;

  player.hasDrawnThisTurn = false;


  player.attackBonus = 0;

  player.defenseBonus = 0;

  player.swiftBonus = false;


  // ----------------------------------------------------------
  // Increase / refresh energy
  // ----------------------------------------------------------

  refreshEnergy(
    playerIndex
  );


  // ----------------------------------------------------------
  // Reset creatures
  // ----------------------------------------------------------

  player.field.forEach(
    (slot) => {

      if (!slot) return;


      slot.hasAttacked = false;

      slot.stunned = false;


      if (slot.summonSickness) {

        slot.summonSickness = false;

      }


      // Temporary creature bonuses expire.

      slot.tempAtk = 0;

      slot.tempDef = 0;

    }
  );


  // ----------------------------------------------------------
  // Draw
  // ----------------------------------------------------------

  drawCard(
    playerIndex
  );


  player.hasDrawnThisTurn = true;


  addLog(
    `— Player ${playerIndex + 1}'s turn —`
  );


  addLog(
    `Energy: ${player.energy}/${player.maxEnergy}`
  );

}


// ============================================================
// END TURN
// ============================================================

function endTurn() {

  if (game.gameOver) return;


  if (
    game.selectedAttacker !== null
  ) {

    game.selectedAttacker = null;

  }


  game.phase = "end";


  const oldPlayer =
    game.currentPlayer;


  // ----------------------------------------------------------
  // End-of-turn effects
  // ----------------------------------------------------------

  game.players[oldPlayer].field.forEach(
    (slot) => {

      if (!slot) return;

      if (slot.burn > 0) {

        applyBurn(
          oldPlayer,
          slot.burn
        );

      }

    }
  );


  // ----------------------------------------------------------
  // Change player
  // ----------------------------------------------------------

  game.currentPlayer =
    1 - game.currentPlayer;


  game.turnNumber++;


  startTurn();

  render();

}


// ============================================================
// RESTART GAME
// ============================================================

function restartGame() {

  game.players = [
    createPlayer(),
    createPlayer(),
  ];


  game.currentPlayer = 0;

  game.turnNumber = 1;

  game.phase = "main";

  game.gameOver = false;

  game.winner = null;

  game.log = [];

  game.selectedAttacker = null;

  game.selectedCard = null;

  game.pendingAction = null;


  startGame();

}


// ============================================================
// START GAME
// ============================================================

function startGame() {

  game.players[0].deck =
    shuffle(buildDeck());


  game.players[1].deck =
    shuffle(buildDeck());


  // ----------------------------------------------------------
  // Starting hands
  // ----------------------------------------------------------

  drawCards(
    0,
    GAME_RULES.startingHandSize
  );


  drawCards(
    1,
    GAME_RULES.startingHandSize
  );


  // ----------------------------------------------------------
  // First player
  // ----------------------------------------------------------

  game.currentPlayer = 0;

  game.turnNumber = 1;


  // First player gets first-turn draw.
  drawCard(0);


  refreshEnergy(0);


  addLog(
    "The duel begins!"
  );


  addLog(
    "Player 1 goes first."
  );


  addLog(
    `Player 1 has ${game.players[0].energy} energy.`
  );


  render();

}


// ============================================================
// CARD DISPLAY
// ============================================================

function cardEl(card, extraClass) {

  const div =
    document.createElement("div");


  div.className =
    `card ${card.type} ${extraClass || ""}`;


  // ----------------------------------------------------------
  // Monster
  // ----------------------------------------------------------

  if (card.type === "monster") {

    const keywords =
      Array.isArray(card.keywords)
        ? card.keywords.join(" • ")
        : "";


    div.innerHTML = `

      <div class="card-cost">
        ${card.cost ?? 0}
      </div>

      <div class="card-element">
        ${card.element || "neutral"}
      </div>

      <div class="card-icon">
        ${card.icon}
      </div>

      <div class="card-name">
        ${card.name}
      </div>

      <div class="card-rarity">
        ${card.rarity || "common"}
      </div>

      <div class="card-text">
        ${card.text || ""}
      </div>

      <div class="card-keywords">
        ${keywords}
      </div>

      <div class="card-stats">
        ${getMonsterAttack(card)} / ${getMonsterDefense(card)}
      </div>

    `;

  }


  // ----------------------------------------------------------
  // Spell / Relic
  // ----------------------------------------------------------

  else {

    const keywords =
      Array.isArray(card.keywords)
        ? card.keywords.join(" • ")
        : "";


    div.innerHTML = `

      <div class="card-cost">
        ${card.cost ?? 0}
      </div>

      <div class="card-element">
        ${card.element || "neutral"}
      </div>

      <div class="card-icon">
        ${card.icon}
      </div>

      <div class="card-name">
        ${card.name}
      </div>

      <div class="card-rarity">
        ${card.rarity || "common"}
      </div>

      <div class="card-text">
        ${card.text || ""}
      </div>

      <div class="card-keywords">
        ${keywords}
      </div>

    `;

  }


  return div;

}


// ============================================================
// RENDER OPPONENT INFO
// ============================================================

function renderOpponentInfo() {

  const me =
    game.currentPlayer;

  const opp =
    1 - me;


  const opponent =
    game.players[opp];


  const element =
    document.getElementById(
      "opponent-info"
    );


  if (!element) return;


  element.textContent =
    `Player ${opp + 1}: `
    + `${opponent.lp} LP `
    + `(${opponent.deck.length} cards left)`;

}


// ============================================================
// RENDER PLAYER INFO
// ============================================================

function renderPlayerInfo() {

  const me =
    game.currentPlayer;


  const player =
    game.players[me];


  const element =
    document.getElementById(
      "player-info"
    );


  if (!element) return;


  element.textContent =
    `Player ${me + 1}: `
    + `${player.lp} LP `
    + `(${player.deck.length} cards left) `
    + `— Energy ${player.energy}/${player.maxEnergy}`;

}


// ============================================================
// RENDER TURN INFO
// ============================================================

function renderTurnInfo() {

  const element =
    document.getElementById(
      "turn-info"
    );


  if (!element) return;


  element.textContent =
    `Turn ${game.turnNumber} `
    + `— Player ${game.currentPlayer + 1}'s turn `
    + `— ${game.phase}`;

}


// ============================================================
// RENDER OPPONENT HAND
// ============================================================

function renderOpponentHand() {

  const opp =
    1 - game.currentPlayer;


  const oppHand =
    document.getElementById(
      "opponent-hand"
    );


  if (!oppHand) return;


  oppHand.innerHTML = "";


  game.players[opp].hand.forEach(
    () => {

      const back =
        document.createElement("div");


      back.className =
        "card card-back";


      oppHand.appendChild(
        back
      );

    }
  );

}


// ============================================================
// RENDER OPPONENT FIELD
// ============================================================

function renderOpponentField() {

  const opp =
    1 - game.currentPlayer;


  const oppField =
    document.getElementById(
      "opponent-field"
    );


  if (!oppField) return;


  oppField.innerHTML = "";


  game.players[opp].field.forEach(
    (slot, index) => {

      const zone =
        document.createElement("div");


      zone.className =
        "zone";


      if (slot) {

        const card =
          cardEl(
            slot.card
          );


        if (slot.stunned) {
          card.classList.add("stunned");
        }


        zone.appendChild(
          card
        );

      } else {

        zone.classList.add(
          "empty"
        );

      }


      // ------------------------------------------------------
      // Attack targeting
      // ------------------------------------------------------

      if (
        game.selectedAttacker !== null
      ) {

        zone.classList.add(
          "targetable"
        );


        zone.onclick =
          () => attackSlot(
            slot ? index : null
          );

      }


      oppField.appendChild(
        zone
      );

    }
  );

}


// ============================================================
// RENDER PLAYER FIELD
// ============================================================

function renderPlayerField() {

  const me =
    game.currentPlayer;


  const playerField =
    document.getElementById(
      "player-field"
    );


  if (!playerField) return;


  playerField.innerHTML = "";


  game.players[me].field.forEach(
    (slot, index) => {

      const zone =
        document.createElement("div");


      zone.className =
        "zone";


      if (slot) {

        const el =
          cardEl(
            slot.card
          );


        if (
          slot.summonSickness ||
          slot.hasAttacked ||
          slot.stunned
        ) {

          el.classList.add(
            "dimmed"
          );

        }


        if (
          game.selectedAttacker === index
        ) {

          el.classList.add(
            "selected"
          );

        }


        el.onclick =
          () => selectAttacker(
            index
          );


        zone.appendChild(
          el
        );

      } else {

        zone.classList.add(
          "empty"
        );

      }


      playerField.appendChild(
        zone
      );

    }
  );

}


// ============================================================
// RENDER PLAYER HAND
// ============================================================

function renderPlayerHand() {

  const me =
    game.currentPlayer;


  const player =
    game.players[me];


  const playerHand =
    document.getElementById(
      "player-hand"
    );


  if (!playerHand) return;


  playerHand.innerHTML = "";


  player.hand.forEach(
    (card) => {

      const cost =
        getCardCost(card);


      const playable =
        player.energy >= cost;


      const el =
        cardEl(
          card,
          playable
            ? "playable"
            : "unplayable"
        );


      el.onclick =
        () => {

          if (!playable) {

            addLog(
              `Not enough energy for ${card.name}.`
            );

            render();

            return;
          }


          if (card.type === "monster") {

            playMonster(
              card.id
            );

          }

          else if (
            card.type === "spell"
          ) {

            playSpell(
              card.id
            );

          }

          else if (
            card.type === "relic"
          ) {

            playRelic(
              card.id
            );

          }

        };


      playerHand.appendChild(
        el
      );

    }
  );

}


// ============================================================
// RENDER LOG
// ============================================================

function renderLog() {

  const log =
    document.getElementById(
      "log"
    );


  if (!log) return;


  log.innerHTML =
    game.log
      .map(
        (line) =>
          `<div>${line}</div>`
      )
      .join("");

}


// ============================================================
// RENDER GAME OVER
// ============================================================

function renderGameOver() {

  const overlay =
    document.getElementById(
      "game-over-overlay"
    );


  if (!overlay) return;


  if (game.gameOver) {

    const text =
      document.getElementById(
        "game-over-text"
      );


    if (text) {

      text.textContent =
        `Player ${game.winner + 1} wins!`;

    }


    overlay.classList.remove(
      "hidden"
    );

  }

  else {

    overlay.classList.add(
      "hidden"
    );

  }

}


// ============================================================
// MASTER RENDER
// ============================================================

function render() {

  renderOpponentInfo();

  renderPlayerInfo();

  renderTurnInfo();

  renderOpponentHand();

  renderOpponentField();

  renderPlayerField();

  renderPlayerHand();

  renderLog();

  renderGameOver();

}


// ============================================================
// BUTTON EVENTS
// ============================================================

const endTurnButton =
  document.getElementById(
    "end-turn-btn"
  );


if (endTurnButton) {

  endTurnButton.addEventListener(
    "click",
    endTurn
  );

}


const restartButton =
  document.getElementById(
    "restart-btn"
  );


if (restartButton) {

  restartButton.addEventListener(
    "click",
    restartGame
  );

}


// ============================================================
// START
// ============================================================

startGame();


// ============================================================
// OPTIONAL DEBUG API
// ============================================================
//
// Available from the browser console.
//
// Example:
//
//   ShadowDuel.debug()
//   ShadowDuel.state()
//
// This is useful while developing the P2P layer.
//

window.ShadowDuel = {

  debug() {

    console.log(
      "Shadow Duel state:",
      game
    );

    return game;

  },


  state() {

    return game;

  },


  draw(player, amount = 1) {

    return drawCards(
      player,
      amount
    );

  },


  endTurn() {

    return endTurn();

  },


  restart() {

    return restartGame();

  },

};

