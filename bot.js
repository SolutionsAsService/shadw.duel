// ============================================================
// SHADOW DUEL — COMPUTER OPPONENT
// ============================================================
//
// A greedy, seeded bot. It only ever picks from the engine's
// legalActions() list, so it plays by exactly the rules a human
// does. The same bot drives "Vs Computer" in the browser and the
// headless bot-vs-bot matches in scripts/bot-match.cjs.
//
// Priorities, highest first: a direct attack; an attack that
// destroys a creature without losing the attacker; summoning a
// creature; casting a spell or relic; an even trade against a
// creature at least as strong. Losing attacks are never made.
// Ties are broken by the seeded random stream.
//
// ============================================================

(function (root) {
"use strict";

function score(entry) {
  const action = entry.action;
  if (action.type === "end") return 0;
  if (action.type === "play") {
    const card = entry.card;
    if (card.type === "monster") return 40 + card.cost * 3 + (card.atk + card.def) / 200;
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
    const s = score(entry);
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
