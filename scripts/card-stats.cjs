// Per-card impact over many headless bot-vs-bot matches (GDADA "card impact" check).
//
//   node scripts/card-stats.cjs [--seed <n>] [--matches <k>] [--json <file>]
//
// For every card: how many matches it was played in, and the win rate of the seat
// that played it. Also the first-seat win rate, mean turns, how matches ended and
// how often each card was still in hand or deck at the end. The bot is greedy, so
// a win rate here is a property of the card *in the bot's hands*: a question for the
// panel, never a verdict on its own.
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.join(__dirname, "..");
const SOURCES = ["cards.js", "game.js", "bot.js"].map((n) => fs.readFileSync(path.join(ROOT, n), "utf8"));

function playMatch(seed) {
  const window = { ShadowLobbyUI: {} };
  const document = { getElementById: () => null, addEventListener() {} };
  const context = vm.createContext({ window, document, console: { log() {}, warn() {}, error: console.error } });
  SOURCES.forEach((code) => vm.runInContext(code, context));
  const game = window.ShadowDuelGame, bot = window.ShadowDuelBot;
  game.startLocal({ seed });
  const rngs = [bot.rng(seed ^ 0xa5a5a5a5), bot.rng(seed ^ 0x5a5a5a5a)];
  const state = game.state();
  const played = [new Set(), new Set()];
  let actions = 0;
  while (!state.gameOver && actions++ < 5000) {
    const seat = state.currentPlayer;
    const action = bot.choose(state, game.legalActions(), rngs[seat]);
    if (action.type === "play") {
      const card = state.players[seat].hand.find((c) => c.id === action.cardId);
      if (card) played[seat].add(card.name);
    }
    if (!game.act(action)) throw new Error(`seed ${seed}: refused ${JSON.stringify(action)}`);
  }
  const deckOut = state.players.some((p) => p.deck.length === 0 && p.lp > 0) && state.players.every((p) => p.lp > 0);
  return { seed, winner: state.winner, turns: state.turnNumber, played, deckOut, finished: state.gameOver,
    left: state.players.map((p) => p.deck.length) };
}

function main(argv) {
  const flag = (k, d) => { const i = argv.indexOf(k); return i < 0 ? d : argv[i + 1]; };
  const first = Number(flag("--seed", 1)), count = Number(flag("--matches", 300));
  const cards = require(path.join(ROOT, "cards.js"));
  const all = [...cards.MONSTER_TEMPLATES, ...cards.SPELL_TEMPLATES, ...cards.RELIC_TEMPLATES];
  const stat = new Map(all.map((t) => [t.name, { name: t.name, type: t.type || "monster", element: t.element, cost: t.cost, plays: 0, wins: 0 }]));
  const res = [];
  for (let i = 0; i < count; i++) {
    const r = playMatch(first + i);
    res.push(r);
    for (const seat of [0, 1]) for (const name of r.played[seat]) {
      const s = stat.get(name); s.plays++; if (r.winner === seat) s.wins++;
    }
  }
  const rows = [...stat.values()].map((s) => ({ ...s, playRate: +(s.plays / (2 * count)).toFixed(3), winRate: s.plays ? +(s.wins / s.plays).toFixed(3) : null }));
  const summary = {
    matches: count, unfinished: res.filter((r) => !r.finished).length,
    firstSeatWins: +(res.filter((r) => r.winner === 0).length / count).toFixed(3),
    meanTurns: +(res.reduce((n, r) => n + r.turns, 0) / count).toFixed(1),
    deckOuts: res.filter((r) => r.deckOut).length,
    meanDeckLeft: +(res.reduce((n, r) => n + r.left[0] + r.left[1], 0) / (2 * count)).toFixed(1),
  };
  const flagged = rows.filter((r) => r.plays >= 30 && (r.winRate > 0.7 || r.winRate < 0.3));
  console.log(`summary: ${JSON.stringify(summary)}`);
  console.log("card                     type    elem     cost  played  win");
  for (const r of rows.sort((a, b) => b.winRate - a.winRate)) {
    console.log(`${r.name.padEnd(24)} ${r.type.padEnd(7)} ${r.element.padEnd(8)} ${String(r.cost).padStart(4)}  ${(r.playRate * 100).toFixed(0).padStart(5)}%  ${r.winRate === null ? "  -" : (r.winRate * 100).toFixed(0).padStart(3) + "%"}${flagged.includes(r) ? "  *" : ""}`);
  }
  console.log(`flagged (>=30 plays, win rate outside 30-70%): ${flagged.length}`);
  const out = flag("--json", null);
  if (out) fs.writeFileSync(out, JSON.stringify({ summary, cards: rows }, null, 1) + "\n");
  return summary.unfinished ? 1 : 0;
}

if (require.main === module) process.exitCode = main(process.argv.slice(2));
