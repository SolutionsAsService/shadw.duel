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
// Networking never reaches inside the rules. Online matches run
// the same engine on both browsers. Local input is turned into
// small action objects which are (a) applied locally and (b)
// sent to the peer, which applies the same validated action:
//
//   { type: "play", cardId }
//   { type: "attack", attacker, target }   // target null = direct
//   { type: "end" }
//   { type: "surrender" }
//
// Both sides use the host-provided match seed, so decks are
// identical on both machines and game state stays in sync.
//
// lobby.js owns screen flow (menu / lobby / duel). This file
// owns the duel itself.
//
// ============================================================

(function () {
"use strict";


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

    turnsStarted: 0,

    shield: 0,


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

    // Relic bonuses by element ("all" applies to every creature).
    relicAtk: {},

    relicDef: {},


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

  phase: "idle",

  gameOver: true,

  winner: null,

  log: [],

  selectedAttacker: null,

  selectedCard: null,

  pendingAction: null,

};


game.drawCards = drawCards;
game.healPlayer = healPlayer;
game.dealDamage = dealDamage;
// Board helpers for card effects. Spells have no target picker, so a board
// effect picks its creature deterministically (see pickCreature in cards.js).
game.destroyMonster = destroyMonster;
game.getMonsterAttack = getMonsterAttack;
game.getMonsterDefense = getMonsterDefense;
game.hasKeyword = hasKeyword;
game.addLog = addLog;
game.markImpact = markImpact;

// ============================================================
// MATCH SESSION
// ============================================================
//
// Describes how the current duel is being played:
//
//   local  — both players share this browser (pass-and-play).
//   online — you control one seat; the peer controls the other.
//
// lobby.js configures this through ShadowDuelGame.startOnline()
// before starting a match.
//

const session = {

  mode: "local",

  // Which player index (0 or 1) belongs to the local user.
  // Null in local mode (the user controls whoever is active).
  localSeat: null,

  // Display names shown in the UI.
  playerNames: ["Player 1", "Player 2"],

  // Deterministic match seed (online mode, or a seeded local duel).
  seed: null,

  // Seat played by ShadowDuelBot in a local duel against the computer, else null.
  botSeat: null,

  // Callbacks wired by lobby.js (online mode only).
  onAction: null,       // (action) => {}        send game action
  onSurrender: null,    // () => {}              notify surrender
  onOpponentLeft: null, // () => {}              peer went away

};


// ============================================================
// SEAT / TURN HELPERS
// ============================================================

function isOnline() {

  return session.mode === "online";
}


// The player index whose cards we see face-up and control.
function viewSeat() {

  if (isOnline()) return session.localSeat;
  if (session.botSeat !== null) return 1 - session.botSeat;
  return game.currentPlayer;
}


// True when the local user is allowed to act right now.
// While applying a peer's action the engine is executing on
// the peer's behalf, so the seat check is bypassed.
function isLocalPlayersTurn() {
  if (game.gameOver) return false;
  if (isOnline()) return applyingRemoteAction || game.currentPlayer === session.localSeat;
  return session.botSeat === null || botActing || game.currentPlayer !== session.botSeat;
}


function playerName(index) {

  return session.playerNames[index] || `Player ${index + 1}`;
}


// ============================================================
// ONLINE ACTION DISPATCH
// ============================================================
//
// In online mode a local action is only applied after the
// network layer confirms it was handed to the peer. Both
// browsers then run the exact same action through the engine.
//

// True while applying an action received from the peer, so
// engine functions don't try to send it straight back.
let applyingRemoteAction = false;


function dispatchAction(action) {

  if (!isOnline()) return true;

  if (applyingRemoteAction) return true;

  if (typeof session.onAction !== "function") {
    return false;
  }

  return session.onAction(action) === true;
}


function forfeitLocalPlayer() {
  return act({ type: "surrender" });
}


// Applies a validated action received from the peer.
function applyRemoteAction(action) {
  if (!isOnline()) return false;
  const actor = 1 - session.localSeat;
  if (validateAction(action, actor)) return false;
  applyingRemoteAction = true;
  try { return executeAction(action, actor); }
  finally { applyingRemoteAction = false; }
}


// Shared action contract: both local and remote inputs pass these rules.
function validSlot(index) {
  return Number.isInteger(index) && index >= 0 && index < GAME_RULES.fieldSlots;
}

function playError(card, playerIndex) {
  const player = game.players[playerIndex];
  if (!card || !["monster", "spell", "relic"].includes(card.type)) return "Card is not in your hand.";
  if (player.energy < getCardCost(card)) return `Not enough energy for ${card.name}.`;
  if (card.type === "monster") {
    if (player.monsterPlayedThisTurn) return "You may summon only one creature per turn.";
    if (player.field.every(Boolean)) return "Your field is full.";
  }
  return null;
}

function validateAction(action, actor) {
  if (game.gameOver) return "The duel has ended.";
  if (!action || typeof action !== "object" || Array.isArray(action)) return "Invalid action.";
  if (action.type === "surrender") return null;
  if (actor !== game.currentPlayer) return "It is not your turn.";
  if (game.phase !== "main") return "Actions require the main phase.";
  if (action.type === "end") return null;
  if (action.type === "play") {
    if (typeof action.cardId !== "string") return "Invalid card ID.";
    return playError(game.players[actor].hand.find((card) => card.id === action.cardId), actor);
  }
  if (action.type === "attack") {
    if (!validSlot(action.attacker)) return "Invalid attacker.";
    const slot = game.players[actor].field[action.attacker];
    if (!slot || slot.hasAttacked || slot.summonSickness || slot.stunned) return "That creature cannot attack.";
    const field = game.players[1 - actor].field;
    if (action.target === null) return field.some(Boolean) ? "Destroy the opposing creatures before attacking directly." : null;
    if (!validSlot(action.target) || !field[action.target]) return "Choose an opposing creature.";
    if (field.some((target) => target && hasKeyword(target.card, "guard")) && !hasKeyword(field[action.target].card, "guard")) return "Attack a Guard creature first.";
    return null;
  }
  return "Unknown action.";
}

function executeAction(action, actor) {
  // Impacts last for the turn they happened in, so the other player sees everything
  // a turn did (two spells in a row, or the bot's whole turn) until they act.
  game.impacts = (game.impacts || []).filter((i) => i.turn === game.turnNumber);
  if (action.type === "play") playCardById(action.cardId);
  else if (action.type === "attack") performAttack(action.attacker, action.target);
  else if (action.type === "end") advanceTurn();
  else if (action.type === "surrender") {
    endGame(1 - actor, `${playerName(actor)} surrendered.`);
    render();
  }
  return true;
}

function act(action) {
  const actor = isOnline() ? session.localSeat : game.currentPlayer;
  const error = validateAction(action, actor);
  if (error) { showNotice(error); return false; }
  if (!dispatchAction(action)) { showNotice("Action was not sent. Check your connection."); return false; }
  const result = executeAction(action, actor);
  if (action.type === "surrender" && typeof session.onSurrender === "function") session.onSurrender();
  return result;
}

function showNotice(message) {
  const element = document.getElementById("combat-message");
  if (element) element.textContent = message;
}

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

function dealDamage(playerIndex, amount, source = "effect", bypassShield = false) {
  if (game.gameOver || !Number.isFinite(amount) || amount <= 0) return 0;
  const player = game.players[playerIndex];
  const absorbed = bypassShield ? 0 : Math.min(player.shield, amount);
  player.shield -= absorbed;
  const damage = Math.min(player.lp, amount - absorbed);
  player.lp -= damage;
  player.damageTaken += damage;
  if (!bypassShield) game.players[1 - playerIndex].damageDealt += damage;
  addLog(`${playerName(playerIndex)} takes ${damage} damage (${source}).${absorbed ? ` Barrier absorbs ${absorbed}.` : ""}`);
  checkLifePoints();
  return damage;
}


// ============================================================
// HEAL
// ============================================================

function healPlayer(playerIndex, amount) {

  if (!Number.isFinite(amount) || amount <= 0 || game.players[playerIndex].lp <= 0) return;

  const player = game.players[playerIndex];

  const before = player.lp;

  player.lp += amount;

  const healed = player.lp - before;

  if (healed > 0) {

    addLog(
      `${playerName(playerIndex)} restores ${healed} Life Points.`
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
      `${playerName(0)} ran out of Life Points!`
    );

    return;
  }


  if (game.players[1].lp <= 0) {

    game.players[1].lp = 0;

    endGame(
      0,
      `${playerName(1)} ran out of Life Points!`
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

  addLog(winnerIndex === null ? "Duel interrupted — no result." : `${playerName(winnerIndex)} wins!`);

}


// ============================================================
// DRAW CARDS
// ============================================================

function drawCards(playerIndex, count) {

  if (game.gameOver || !Number.isInteger(playerIndex) || !game.players[playerIndex] || !Number.isInteger(count) || count < 0) return false;

  const player = game.players[playerIndex];

  for (let i = 0; i < count; i++) {

    if (player.deck.length === 0) {

      endGame(
        1 - playerIndex,
        `${playerName(playerIndex)} ran out of cards!`
      );

      return false;
    }


    const card = player.deck.shift();


    // -----------------------------------------
    // Maximum hand size
    // -----------------------------------------

    if (player.hand.length >= GAME_RULES.maxHandSize) {

      addLog(
        `${playerName(playerIndex)}'s hand is full. ${card.name} is discarded.`
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
  player.turnsStarted++;
  player.maxEnergy = Math.min(GAME_RULES.maxEnergy, player.turnsStarted);
  player.energy = player.maxEnergy;
}


// ============================================================
// SPEND ENERGY
// ============================================================

function spendEnergy(playerIndex, amount) {

  const player = game.players[playerIndex];

  if (!Number.isFinite(amount) || amount < 0) return false;

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
  const player = playerIndex === null ? null : game.players[playerIndex];
  let value = (card.atk || 0) + (card.bonusAtk || 0) + (card.tempAtk || 0);
  if (player && card.element === "flame") value += player.flameBonus || 0;
  if (player && card.element === "shadow") value += player.shadowBonus || 0;
  if (player && player.relicAtk) value += (player.relicAtk[card.element] || 0) + (player.relicAtk.all || 0);
  return Math.max(0, value);
}


// ============================================================
// GET MONSTER DEF
// ============================================================

function getMonsterDefense(card, playerIndex = null) {
  if (!card) return 0;
  let value = (card.def || 0) + (card.bonusDef || 0) + (card.tempDef || 0);
  const owner = playerIndex === null ? null : game.players[playerIndex];
  if (owner && card.element === "earth") value += owner.earthDefenseBonus || 0;
  if (owner && owner.relicDef) value += (owner.relicDef[card.element] || 0) + (owner.relicDef.all || 0);
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


  card.bonusAtk = player.attackBonus;
  card.bonusDef = player.defenseBonus;
  player.attackBonus = 0;
  player.defenseBonus = 0;
  const fieldMonster = createFieldMonster(card);
  if (player.swiftBonus) fieldMonster.summonSickness = false;


  player.field[emptySlot] =
    fieldMonster;


  if (hasKeyword(card, "heal")) healPlayer(playerIndex, 300);
  if (hasKeyword(card, "debuff")) {
    game.players[1 - playerIndex].field.forEach((slot, index) => {
      if (slot && !hasKeyword(slot.card, "ward")) {
        slot.card.tempAtk = (slot.card.tempAtk || 0) - 100;
        slot.card.tempDef = (slot.card.tempDef || 0) - 100;
        markImpact(1 - playerIndex, index, "weakened", slot.card.name);
      }
    });
    addLog(`${card.name} weakens enemies without Ward by 100 ATK / DEF until their next turn.`);
  }
  player.monsterPlayedThisTurn = true;

  player.cardsPlayed++;


  addLog(
    `${playerName(playerIndex)} summoned ${card.name} `
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
    `${playerName(playerIndex)} cast ${card.name} `
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


  if (card.type !== "relic" || game.phase !== "main") return;


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
    `${playerName(playerIndex)} played relic ${card.name}.`
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
// PLAY CARD BY ID (ANY TYPE)
// ============================================================

function playCardById(cardId) {

  const player = currentPlayer();

  const card = player.hand.find(
    (entry) => entry.id === cardId
  );

  if (!card) return;

  if (card.type === "monster") {
    playMonster(cardId);
  } else if (card.type === "spell") {
    playSpell(cardId);
  } else if (card.type === "relic") {
    playRelic(cardId);
  }

}


// ============================================================
// PERFORM ATTACK
// ============================================================
//
// Shared combat entry point for local input and remote
// actions. `target` of null means a direct attack.
//

function performAttack(attackerSlotIndex, targetSlotIndex) {

  if (game.gameOver) return;

  if (game.phase !== "main") return;


  const attackerIndex = game.currentPlayer;

  const defenderIndex = 1 - attackerIndex;


  const attackerSlot =
    game.players[attackerIndex].field[attackerSlotIndex];


  if (!attackerSlot) return;

  if (attackerSlot.stunned) return;

  if (attackerSlot.summonSickness) return;

  if (attackerSlot.hasAttacked) return;


  game.selectedAttacker = attackerSlotIndex;


  const defenderField =
    game.players[defenderIndex].field;


  const defenderHasMonsters =
    defenderField.some((slot) => slot !== null);


  // ----------------------------------------------------------
  // DIRECT ATTACK
  // ----------------------------------------------------------

  if (targetSlotIndex === null || targetSlotIndex === undefined) {

    if (defenderHasMonsters) {

      addLog(
        "Your opponent still has monsters. "
        + "Destroy them before attacking directly."
      );

      game.selectedAttacker = null;

      render();

      return;
    }


    attackDirectly(attackerSlot);


    game.selectedAttacker = null;

    checkLifePoints();

    render();

    return;
  }


  // ----------------------------------------------------------
  // MONSTER ATTACK
  // ----------------------------------------------------------

  if (!defenderField[targetSlotIndex]) {

    game.selectedAttacker = null;

    render();

    return;
  }


  attackMonster(targetSlotIndex);

}


// ============================================================
// SELECT ATTACKER
// ============================================================

function selectAttacker(slotIndex) {

  if (!isLocalPlayersTurn() || !validSlot(slotIndex)) return;

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

  markImpact(playerIndex, slotIndex, "destroyed", slot.card.name);

  player.field[slotIndex] = null;

  player.monstersDestroyed++;


  // Future graveyard support can go here.
  //
  // player.graveyard.push(slot.card);

}


// Board changes a card caused this turn, shown on the slot so the player sees
// what a spell, a Debuff or an attack hit. Cleared once the next turn's player acts.
function markImpact(playerIndex, slotIndex, kind, name) {
  game.impacts = game.impacts || [];
  game.impacts.push({ seat: playerIndex, slot: slotIndex, kind, name, turn: game.turnNumber });
}

// The latest impact on a slot that still describes what is there: "destroyed" only
// for an empty slot, a change only while the same creature holds the slot.
function impactAt(seat, slot) {
  const here = game.players[seat].field[slot];
  return (game.impacts || []).filter((i) => i.seat === seat && i.slot === slot
    && (here ? i.kind !== "destroyed" && i.name === here.card.name : i.kind === "destroyed")).pop() || null;
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


  const actualDamage = dealDamage(
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
      actualDamage
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


    let actualDamage = 0;
    if (excess > 0) {

      actualDamage = dealDamage(
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
        actualDamage
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
        ? ` ${excess} damage to ${playerName(attackerIndex)}.`
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
  if (game.selectedAttacker === null) { showNotice("Select one of your creatures first."); return false; }
  return act({ type: "attack", attacker: game.selectedAttacker, target: defenderSlotIndex });
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


  player.swiftBonus = false;
  player.shield = 0;


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

      slot.card.tempAtk = 0;

      slot.card.tempDef = 0;

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
    `— ${playerName(playerIndex)}'s turn —`
  );


  addLog(
    `Energy: ${player.energy}/${player.maxEnergy}`
  );

}


// ============================================================
// END TURN
// ============================================================

function endTurn() {
  return act({ type: "end" });
}

function advanceTurn() {
  game.selectedAttacker = null;
  game.selectedCard = null;
  game.currentPlayer = 1 - game.currentPlayer;
  game.turnNumber++;
  closeDetails();
  startTurn();
  render();
  scheduleBot();
}


// ============================================================
// RESET GAME STATE
// ============================================================

function resetGameState() {

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

}


// ============================================================
// RESTART GAME (LOCAL / REMATCH)
// ============================================================

function restartGame() {

  closeDetails();
  resetGameState();

  startGame();

  scheduleBot();

}


// ============================================================
// COMPUTER OPPONENT
// ============================================================
//
// Every action a seat could take now, each already passed through
// validateAction, with the combat numbers a player would read off
// the board. ShadowDuelBot (bot.js) picks from this list, so the bot
// can never take an action a human could not.

function legalActions() {
  const seat = game.currentPlayer;
  const me = game.players[seat];
  const them = game.players[1 - seat];
  const out = [];
  const ok = (action) => !validateAction(action, seat);
  for (const card of me.hand) {
    const action = { type: "play", cardId: card.id };
    if (ok(action)) out.push({ action, card });
  }
  me.field.forEach((slot, attacker) => {
    if (!slot) return;
    const atk = getMonsterAttack(slot.card, seat);
    const direct = { type: "attack", attacker, target: null };
    if (ok(direct)) out.push({ action: direct, atk });
    them.field.forEach((target, index) => {
      const action = { type: "attack", attacker, target: index };
      if (target && ok(action)) {
        out.push({
          action, atk,
          targetAtk: getMonsterAttack(target.card, 1 - seat),
          targetDef: getMonsterDefense(target.card, 1 - seat),
        });
      }
    });
  });
  if (ok({ type: "end" })) out.push({ action: { type: "end" } });
  return out;
}

let botTimer = null;
let botActing = false;

// Paces the bot in the browser; headless matches call the bot directly instead.
function scheduleBot() {
  if (botTimer !== null || typeof setTimeout !== "function") return;
  if (isOnline() || session.botSeat === null || game.gameOver || game.currentPlayer !== session.botSeat) return;
  botTimer = setTimeout(botStep, 650);
}

function botStep() {
  botTimer = null;
  const bot = window.ShadowDuelBot;
  if (isOnline() || session.botSeat === null || game.gameOver || game.currentPlayer !== session.botSeat) return;
  // Without bot.js the bot passes, so the duel never stalls on its turn.
  const choice = bot ? bot.choose(game, legalActions(), session.botRng || (session.botRng = bot.rng())) : { type: "end" };
  botActing = true;
  try {
    if (!act(choice) && !act({ type: "end" })) return;
  } finally {
    botActing = false;
  }
  render();
  scheduleBot();
}


// ============================================================
// START GAME
// ============================================================

function startGame() {

  // ----------------------------------------------------------
  // Decks
  //
  // Online matches build both decks from the shared match
  // seed so every card id is identical on both browsers.
  // ----------------------------------------------------------

  if (Number.isFinite(session.seed)) {

    game.players[0].deck =
      buildSeededDeck(session.seed, 0);

    game.players[1].deck =
      buildSeededDeck(session.seed, 1);

  } else {

    game.players[0].deck = buildDeck();

    game.players[1].deck = buildDeck();

  }


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
  game.players[0].hasDrawnThisTurn = true;


  addLog(
    "The duel begins!"
  );


  addLog(
    `${playerName(0)} goes first.`
  );


  addLog(
    `${playerName(0)} has ${game.players[0].energy} energy.`
  );


  render();

}


// ============================================================
// CARD DISPLAY
// ============================================================

// Shape glyphs so an element never depends on colour alone (Game Accessibility Guidelines).
const ELEMENT_GLYPHS = { flame: "▲", water: "●", earth: "■", wind: "≋", light: "✦", shadow: "☾", neutral: "○" };

const ELEMENT_LEGEND = "Marks: ▲ flame · ● water · ■ earth · ≋ wind · ✦ light · ☾ shadow · ○ neutral · G Guard · W Ward · ▲/▼ stat raised/lowered this turn.";

function statClass(value, base) {
  return value > base ? " stat-up" : value < base ? " stat-down" : "";
}

function cardEl(card, extraClass, playerIndex = null) {
  const div = document.createElement("div");
  const type = card.type || "monster";
  div.className = `card ${type} ${extraClass || ""}`;
  div.dataset.cardId = card.id || "";
  div.dataset.cardName = card.name;
  div.dataset.cardType = type;
  div.dataset.element = card.element || "neutral";
  div.setAttribute("role", "button");
  div.tabIndex = 0;
  const marks = [card.element || "neutral", ...["guard", "ward"].filter((k) => hasKeyword(card, k))].join(", ");
  const stats = type === "monster" ? `, ${getMonsterAttack(card, playerIndex)} ATK, ${getMonsterDefense(card, playerIndex)} DEF` : "";
  div.setAttribute("aria-label", `${card.name}, ${type}, ${marks}, ${getCardCost(card)} energy${stats}. Press I for details.`);
  const src = window.ShadowCardArt && window.ShadowCardArt.src(card);
  const art = src
    ? `<div class="card-icon"><img class="card-art" src="${escapeHTML(src)}" alt="${escapeHTML(card.name)} artwork" loading="lazy" draggable="false"></div>`
    : `<div class="card-icon" aria-hidden="true">${escapeHTML(card.icon || "◆")}</div>`;
  div.innerHTML = `
    <div class="card-cost" title="Energy cost">${getCardCost(card)}</div>
    <div class="card-element">${escapeHTML(card.element || "neutral")}</div>
    <div class="card-marks" aria-hidden="true"><span class="mark-element" title="${escapeHTML(card.element || "neutral")}">${ELEMENT_GLYPHS[card.element] || ELEMENT_GLYPHS.neutral}</span>${hasKeyword(card, "guard") ? '<span class="mark-keyword" title="Guard">G</span>' : ""}${hasKeyword(card, "ward") ? '<span class="mark-keyword" title="Ward">W</span>' : ""}</div>
    ${art}
    <div class="card-name">${escapeHTML(card.name)}</div>
    <div class="card-rarity">${escapeHTML(card.rarity || "common")}</div>
    <div class="card-text">${escapeHTML(card.text || "")}</div>
    <div class="card-keywords">${escapeHTML((card.keywords || []).join(" • "))}</div>
    ${type === "monster" ? `<div class="card-stats"><span class="stat-atk${statClass(getMonsterAttack(card, playerIndex), card.atk || 0)}" title="Attack">${getMonsterAttack(card, playerIndex)} ATK</span> / <span class="stat-def${statClass(getMonsterDefense(card, playerIndex), card.def || 0)}" title="Defense">${getMonsterDefense(card, playerIndex)} DEF</span></div>` : ""}
  `;
  const info = document.createElement("button");
  info.type = "button";
  info.className = "card-info-button card-inspect";
  info.textContent = "i";
  info.setAttribute("aria-label", `Inspect ${card.name}`);
  info.setAttribute("aria-disabled", "false");
  info.onclick = (event) => { event.stopPropagation(); showCardDetails(card); };
  div.appendChild(info);
  div.onclick = () => showCardDetails(card);
  div.oncontextmenu = (event) => { event.preventDefault(); event.stopPropagation(); showCardDetails(card); };
  div.onkeydown = (event) => {
    if (event.target !== div) return;
    if (event.key === "i" || event.key === "I") { event.preventDefault(); showCardDetails(card); }
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); div.click(); }
  };
  return div;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

const KEYWORD_RULES = {
  guard: "Guard: opposing attacks must target a Guard creature while one is present.",
  swift: "Swift: can attack on the turn it is summoned.",
  heal: "Heal: restore 300 Life Points when summoned.",
  burn: "Burn: deal 200 additional Life Point damage after a direct attack or a winning creature attack.",
  debuff: "Debuff: when summoned, enemy creatures without Ward lose 100 ATK and DEF until their controller's next turn.",
  ward: "Ward: immune to hostile creature and spell effects such as Debuff, Wither and Undertow; does not prevent combat damage.",
  lifesteal: "Lifesteal: restore Life Points equal to the combat damage actually dealt to the opponent's Life Points (before Burn).",
};

function showCardDetails(card) {
  if (!card || typeof card.name !== "string") return;
  const panel = document.getElementById("card-detail-panel");
  const content = document.getElementById("card-detail-content");
  if (!panel || !content) return;
  content.innerHTML = "";
  const owner = game.players.findIndex((player) => player.field.some((slot) => slot && slot.card.id === card.id));
  const display = cardEl(card, "detail-card", owner < 0 ? null : owner);
  display.removeAttribute("role");
  display.tabIndex = -1;
  display.onclick = null;
  display.onkeydown = null;
  const info = display.querySelector(".card-info-button");
  if (info) info.remove();
  content.appendChild(display);
  const legend = document.createElement("p");
  legend.className = "mark-legend";
  legend.textContent = ELEMENT_LEGEND;
  if (card.rule) {
    const line = document.createElement("p");
    line.className = "card-rule";
    line.textContent = card.rule;
    content.appendChild(line);
  }
  (card.keywords || []).forEach((keyword) => {
    const line = document.createElement("p");
    line.className = "keyword-rule";
    line.textContent = KEYWORD_RULES[keyword] || keyword;
    content.appendChild(line);
  });
  if ((card.type || "monster") === "monster") {
    const line = document.createElement("p");
    line.textContent = "One creature summon per turn. Compare attacking ATK to defending DEF; the loser is destroyed and the difference damages its controller. A tie destroys both. Direct attacks require an empty opposing field.";
    content.appendChild(line);
  }
  content.appendChild(legend);
  panel.classList.remove("hidden");
  panel.setAttribute("aria-hidden", "false");
  const close = document.getElementById("close-card-detail");
  if (close) close.focus();
}

function closeDetails() {
  const panel = document.getElementById("card-detail-panel");
  if (panel) { panel.classList.add("hidden"); panel.setAttribute("aria-hidden", "true"); }
}


// ============================================================
// RENDER OPPONENT INFO
// ============================================================

function renderOpponentInfo() {

  const seat = viewSeat();

  const opp = 1 - seat;


  const opponent =
    game.players[opp];


  const element =
    document.getElementById(
      "opponent-info"
    );


  if (!element) return;


  element.textContent =
    `${playerName(opp)} — `
    + `${opponent.lp} LP${opponent.shield ? ` + ${opponent.shield} shield` : ""} `
    + `(${opponent.deck.length} cards left)`;

}


// ============================================================
// RENDER PLAYER INFO
// ============================================================

function renderPlayerInfo() {

  const seat = viewSeat();


  const player =
    game.players[seat];


  const element =
    document.getElementById(
      "player-info"
    );


  if (!element) return;


  element.textContent =
    `${playerName(seat)} — `
    + `${player.lp} LP${player.shield ? ` + ${player.shield} shield` : ""} `
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
    + `— ${playerName(game.currentPlayer)}'s turn `
    + `— ${game.phase}`;

}


// ============================================================
// RENDER OPPONENT HAND
// ============================================================

function renderOpponentHand() {

  const opp =
    1 - viewSeat();


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
  const opp = 1 - viewSeat();
  const field = document.getElementById("opponent-field");
  if (!field) return;
  field.innerHTML = "";
  game.players[opp].field.forEach((slot, index) => {
    const zone = document.createElement("div");
    zone.className = "zone";
    zone.dataset.slot = index;
    const target = slot ? index : null;
    const targeting = game.selectedAttacker !== null && isLocalPlayersTurn();
    const legal = targeting && !validateAction({ type: "attack", attacker: game.selectedAttacker, target }, game.currentPlayer);
    if (slot) {
      const card = cardEl(slot.card, slot.stunned ? "stunned" : "", opp);
      const hit = impactAt(opp, index);
      if (hit) card.classList.add("impact", `impact-${hit.kind}`);
      card.onclick = (event) => { event.stopPropagation(); if (targeting) attackSlot(target); else showCardDetails(slot.card); };
      zone.appendChild(card);
    } else {
      zone.classList.add("empty");
      const gone = impactAt(opp, index);
      if (gone && gone.kind === "destroyed" && !legal) { zone.classList.add("impact", "impact-destroyed"); zone.textContent = `Destroyed: ${gone.name}`; }
      else zone.textContent = legal ? "Attack directly" : "Empty zone";
    }
    if (legal) {
      zone.classList.add("targetable");
      zone.onclick = () => attackSlot(target);
      if (!slot) {
        zone.tabIndex = 0;
        zone.setAttribute("role", "button");
        zone.setAttribute("aria-label", "Attack opponent directly");
        zone.onkeydown = (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); zone.click(); } };
      }
    }
    field.appendChild(zone);
  });
}


// ============================================================
// RENDER PLAYER FIELD
// ============================================================

function renderPlayerField() {
  const seat = viewSeat();
  const myTurn = isLocalPlayersTurn();
  const field = document.getElementById("player-field");
  if (!field) return;
  field.innerHTML = "";
  game.players[seat].field.forEach((slot, index) => {
    const zone = document.createElement("div");
    zone.className = "zone";
    zone.dataset.slot = index;
    if (slot) {
      const el = cardEl(slot.card, "", seat);
      const hit = impactAt(seat, index);
      if (hit) el.classList.add("impact", `impact-${hit.kind}`);
      const tired = slot.summonSickness || slot.hasAttacked || slot.stunned || !myTurn;
      if (tired) el.classList.add("dimmed");
      if (game.selectedAttacker === index) el.classList.add("selected");
      const badge = document.createElement("div");
      badge.className = "card-state";
      badge.textContent = slot.hasAttacked ? "Attacked" : slot.stunned ? "Stunned" : slot.summonSickness ? "Summoning" : myTurn ? "Ready" : "Waiting";
      el.appendChild(badge);
      el.onclick = () => {
        if (!myTurn || tired) showCardDetails(slot.card);
        else selectAttacker(index);
      };
      zone.appendChild(el);
    } else {
      zone.classList.add("empty");
      const gone = impactAt(seat, index);
      if (gone && gone.kind === "destroyed") { zone.classList.add("impact", "impact-destroyed"); zone.textContent = `Destroyed: ${gone.name}`; }
      else zone.textContent = "Empty zone";
    }
    field.appendChild(zone);
  });
}


// ============================================================
// RENDER PLAYER HAND
// ============================================================

function renderPlayerHand() {
  const seat = viewSeat();
  const player = game.players[seat];
  const hand = document.getElementById("player-hand");
  if (!hand) return;
  hand.innerHTML = "";
  player.hand.forEach((card) => {
    const playable = isLocalPlayersTurn() && !playError(card, seat);
    const el = cardEl(card, playable ? "playable" : "unplayable");
    el.setAttribute("aria-disabled", String(!playable));
    el.onclick = () => act({ type: "play", cardId: card.id });
    // Board spells show, before casting, which creatures they would hit right now.
    if (typeof card.targets === "function") {
      const show = (on) => previewTargets(on ? card.targets(game, seat) : []);
      el.addEventListener("mouseenter", () => show(true));
      el.addEventListener("focus", () => show(true));
      el.addEventListener("mouseleave", () => show(false));
      el.addEventListener("blur", () => show(false));
    }
    hand.appendChild(el);
  });
}

// targets: [{ seat, slot }]. Marks those zones with a dashed outline and a label.
function previewTargets(targets) {
  if (typeof document.querySelectorAll !== "function") return;
  document.querySelectorAll(".zone.would-hit").forEach((zone) => zone.classList.remove("would-hit"));
  const me = viewSeat();
  targets.forEach(({ seat, slot }) => {
    const zone = document.querySelector(`#${seat === me ? "player" : "opponent"}-field .zone[data-slot="${slot}"]`);
    if (zone) zone.classList.add("would-hit");
  });
}

function renderRelics() {
  const seat = viewSeat();
  [["player-relics", seat], ["opponent-relics", 1 - seat]].forEach(([id, owner]) => {
    const row = document.getElementById(id);
    if (!row) return;
    row.innerHTML = "";
    game.players[owner].relics.forEach((card) => row.appendChild(cardEl(card, "relic-active")));
    if (!game.players[owner].relics.length) {
      const empty = document.createElement("span");
      empty.className = "relic-empty";
      empty.textContent = "No active relics";
      row.appendChild(empty);
    }
  });
}

function renderResources() {
  const player = game.players[viewSeat()];
  const opponent = game.players[1 - viewSeat()];
  const values = {
    "energy-display": `${player.energy} / ${player.maxEnergy}`,
    "player-energy": `${player.energy} / ${player.maxEnergy}`,
    "player-deck": player.deck.length,
    "player-life": player.lp,
    "player-deck-count": player.deck.length,
    "opponent-deck-count": opponent.deck.length,
    "player-hand-count": player.hand.length,
    "opponent-hand-count": opponent.hand.length,
    "player-hand-count-label": `${player.hand.length} CARDS`,
    "opponent-hand-count-label": `${opponent.hand.length} CARDS`,
    "phase-info": game.gameOver ? "DUEL COMPLETE" : "MAIN PHASE",
    "combat-message": game.phase === "idle" ? "Start a duel to play" : game.gameOver ? (game.winner === null ? "Duel interrupted — no result." : `${playerName(game.winner)} wins!`) : !isLocalPlayersTurn() ? "Waiting for your opponent" : game.selectedAttacker !== null ? "Choose a highlighted target" : "Play a card or select a ready creature",
  };
  Object.entries(values).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });
  const lifeBar = document.getElementById("player-life-bar");
  if (lifeBar) lifeBar.style.width = `${Math.max(0, Math.min(100, player.lp / GAME_RULES.startingLP * 100))}%`;
  const end = document.getElementById("end-turn-btn");
  if (end) end.disabled = !isLocalPlayersTurn();
}


// ============================================================
// RENDER LOG
// ============================================================

function renderLog() {
  const log = document.getElementById("log");
  if (!log) return;
  log.innerHTML = "";
  game.log.forEach((line) => {
    const row = document.createElement("div");
    row.textContent = line;
    log.appendChild(row);
  });
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


  if (game.gameOver && game.phase !== "idle") {

    const text =
      document.getElementById(
        "game-over-text"
      );


    if (text) {

      text.textContent =
        game.winner === null ? "Duel interrupted — no result." : `${playerName(game.winner)} wins!`;

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

  renderRelics();

  renderResources();

  renderLog();

  renderGameOver();


  // Let the lobby chrome (end-turn / surrender / rematch
  // buttons) reflect whose turn it is after every change.
  if (
    typeof window.ShadowLobbyUI === "object" &&
    typeof window.ShadowLobbyUI.updateTurnChrome === "function"
  ) {
    window.ShadowLobbyUI.updateTurnChrome();
  }

}


// ============================================================
// BUTTON EVENTS
// ============================================================

const closeDetailButton = document.getElementById("close-card-detail");
if (closeDetailButton) closeDetailButton.addEventListener("click", closeDetails);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") { closeDetails(); game.selectedAttacker = null; render(); }
});

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
    () => {

      // Online rematches are coordinated by lobby.js; only local
      // matches restart directly from this button.
      if (!isOnline()) restartGame();

    }
  );

}


// ============================================================
// CONTROLLER API
// ============================================================
//
// Used by lobby.js to drive matches, and available from the
// browser console for debugging:
//
//   ShadowDuelGame.state()
//   ShadowDuelGame.startLocal()
//   ShadowDuelGame.startOnline({ seed, localSeat, ... })
//

window.ShadowDuelGame = {

  startLocal(options = {}) {

    session.mode = "local";

    session.localSeat = null;

    session.playerNames = [
      options.name0 || "Player 1",
      options.name1 || "Player 2",
    ];

    // A finite seed gives both decks from it, as online, so a local duel can be replayed.
    session.seed = Number.isFinite(options.seed) ? options.seed >>> 0 : null;

    session.botSeat = options.botSeat === 0 || options.botSeat === 1 ? options.botSeat : null;

    session.onAction = null;

    session.onSurrender = null;

    session.onOpponentLeft = null;


    restartGame();

  },


  startOnline(options = {}) {

    if (!Number.isFinite(options.seed)) return false;

    session.mode = "online";

    session.localSeat =
      options.localSeat === 1 ? 1 : 0;

    session.botSeat = null;

    session.playerNames = [
      options.name0 || "Player 1",
      options.name1 || "Player 2",
    ];

    session.seed =
      Number.isFinite(options.seed)
        ? options.seed >>> 0
        : null;

    session.onAction =
      typeof options.onAction === "function"
        ? options.onAction
        : null;

    session.onSurrender =
      typeof options.onSurrender === "function"
        ? options.onSurrender
        : null;

    session.onOpponentLeft =
      typeof options.onOpponentLeft === "function"
        ? options.onOpponentLeft
        : null;


    restartGame();

  },


  // Remote peer action entry point (wired by lobby.js).
  receiveAction(action) {

    return applyRemoteAction(action);

  },


  // Peer disconnected mid-match.
  handleOpponentLeft() {

    if (!isOnline() || game.gameOver) return;

    endGame(
      null,
      `Connection to ${playerName(1 - session.localSeat)} was lost. No winner is awarded.`
    );

    render();

    if (typeof session.onOpponentLeft === "function") {
      session.onOpponentLeft();
    }

  },


  surrender() {

    return forfeitLocalPlayer();

  },


  act,
  stop() {
    closeDetails();
    session.mode = "local";
    session.localSeat = null;
    session.seed = null;
    session.botSeat = null;
    session.botRng = null;
    if (botTimer !== null) { clearTimeout(botTimer); botTimer = null; }
    session.onAction = null;
    session.onSurrender = null;
    session.onOpponentLeft = null;
    resetGameState();
    game.gameOver = true;
    game.phase = "idle";
    renderGameOver();
  },
  inspect: showCardDetails,
  closeDetails,
  canPlay(cardId) {
    return !validateAction({ type: "play", cardId }, isOnline() ? session.localSeat : game.currentPlayer);
  },
  rules() { return { ...GAME_RULES, keywordDescriptions: { ...KEYWORD_RULES }, markLegend: ELEMENT_LEGEND }; },
  snapshot() {
    return JSON.parse(JSON.stringify({
      players: game.players,
      currentPlayer: game.currentPlayer,
      turnNumber: game.turnNumber,
      phase: game.phase,
      gameOver: game.gameOver,
      winner: game.winner,
    }));
  },

  // ----------------------------------------------------------
  // State access
  // ----------------------------------------------------------

  state() {

    return game;

  },


  session() {

    return session;

  },


  isOnline() {

    return isOnline();

  },


  legalActions,


  isMyTurn() {

    return isLocalPlayersTurn();

  },


  // ----------------------------------------------------------
  // Debug helpers
  // ----------------------------------------------------------

  debug() {

    console.log(
      "Shadow Duel state:",
      game
    );

    return game;

  },


  draw(player, amount = 1) {

    if (isOnline()) return false;
    return drawCards(
      player,
      amount
    );

  },


  endTurn() {

    return endTurn();

  },


  restart() {

    if (isOnline()) return false;
    return restartGame();

  },

};


// Legacy alias kept for console tooling.
window.ShadowDuel = window.ShadowDuelGame;


// ============================================================
// BOOT
// ============================================================
//
// When lobby.js is present it owns screen flow and starts the
// match — either from the menu (local duel) or after a lobby
// connects (online duel). Without lobby.js we boot straight
// into a local duel so the page always works standalone.
//

if (typeof window.ShadowLobbyUI === "undefined" && !document.getElementById("lobby-overlay")) {

  window.ShadowDuelGame.startLocal();

}

})();
