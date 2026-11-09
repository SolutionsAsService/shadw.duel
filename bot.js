// ============================================================
// SHADOW DUEL — COMPUTER OPPONENT
// ============================================================
//
// A greedy, seeded bot. It only ever picks from the engine's
// legalActions() list, so it plays by exactly the rules a human
// does. The same bot drives "Vs Computer" in the browser and the
// headless bot-vs-bot matches in scripts/bot-match.cjs.
//
// Priorities, highest first: a direct attack; a board spell that
// has a target (removal, or a pre-combat buff/debuff while a
// creature can still attack); an attack that destroys a creature
// without losing the attacker; summoning a creature; casting any
// other spell or relic; an even trade against a creature at least
// as strong. Losing attacks are never made, and a board spell with
// nothing to hit is held.
// Ties are broken by the seeded random stream.
//
// ============================================================

(function (root) {
"use strict";

function score(entry, state) {
  const action = entry.action;
  if (action.type === "end") return 0;
  if (action.type === "play") {
    const card = entry.card;
    if (card.type === "monster") return 40 + card.cost * 3 + (card.atk + card.def) / 200;
    // A board spell with nothing to hit is held, not wasted.
    if (state && typeof card.canHit === "function" && !card.canHit(state, state.currentPlayer)) return -1;
    // Removal clears the way before attacks; "before-attacks" spells only help if something can still attack.
    if (state && card.wants === "enemy" && card.timing !== "before-attacks") return 300 + card.cost;
    if (state && card.timing === "before-attacks") {
      const ready = state.players[state.currentPlayer].field.some((slot) => slot && !slot.summonSickness && !slot.hasAttacked);
      return ready ? 300 + card.cost : -1;
    }
    return 20 + card.cost * 2;
  }
  if (action.target === null) return 1000 + entry.atk / 10;
  if (entry.atk > entry.targetDef) return 200 + entry.targetAtk / 10;
  if (entry.atk === entry.targetDef && entry.targetAtk >= entry.atk) return 60;
  return -1;
}

// Returns the action to take now. `legal` comes from ShadowDuelGame.legalActions().
function choose(state, legal, rng) {
  let best = [];
  let top = 0;
  for (const entry of legal) {
    const s = score(entry, state);
    if (s > top) { top = s; best = [entry]; }
    else if (s === top && s > 0) best.push(entry);
  }
  if (best.length === 0) return { type: "end" };
  return best[Math.floor(rng() * best.length)].action;
}

// A seeded stream (cards.js's createSeededRandom); unseeded play draws a seed.
function rng(seed) {
  const make = typeof createSeededRandom === "function" ? createSeededRandom : require("./cards.js").createSeededRandom;
  return make(Number.isFinite(seed) ? seed >>> 0 : Math.floor(Math.random() * 0x100000000));
}

const api = { choose, rng, score };
if (typeof module !== "undefined" && module.exports) module.exports = api;
if (root) root.ShadowDuelBot = api;

})(typeof window !== "undefined" ? window : null);
