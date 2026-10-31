// Headless bot-vs-bot Shadow Duel matches on the real rules engine.
//
//   node scripts/bot-match.cjs [--seed <n>] [--matches <k>]
//
// Match i uses seed n + i: both decks and both bots' choices come from it, so a seed
// always replays the same match and the same logHash. When SHADW_ARTIFACT_DIR is set
// (a SHADW Forge run), each match is written there as match-<seed>.json plus summary.json.
// Exits 1 if any match fails to finish.
"use strict";
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.join(__dirname, "..");
const SOURCES = ["cards.js", "game.js", "bot.js"].map((name) => fs.readFileSync(path.join(ROOT, name), "utf8"));
const MAX_ACTIONS = 5000;

function playMatch(seed) {
  const window = { ShadowLobbyUI: {} };
  const document = { getElementById: () => null, addEventListener() {} };
  const quiet = { log() {}, warn() {}, error: console.error };
  const context = vm.createContext({ window, document, console: quiet });
  SOURCES.forEach((code) => vm.runInContext(code, context));
  const game = window.ShadowDuelGame;
  const bot = window.ShadowDuelBot;

  game.startLocal({ seed, name0: "Bot A", name1: "Bot B" });
  const rngs = [bot.rng(seed ^ 0xa5a5a5a5), bot.rng(seed ^ 0x5a5a5a5a)];
  const state = game.state();
  const log = [];
  while (!state.gameOver && log.length < MAX_ACTIONS) {
    const seat = state.currentPlayer;
    const action = bot.choose(state, game.legalActions(), rngs[seat]);
    if (!game.act(action)) throw new Error(`seed ${seed}: the engine refused ${JSON.stringify(action)} from seat ${seat}`);
    log.push([seat, action]);
  }
  return {
    format: "shadow-duel.match",
    formatVersion: 1,
    seed,
    finished: state.gameOver,
    winner: state.gameOver ? state.winner : null,
    turns: state.turnNumber,
    actions: log.length,
    life: state.players.map((p) => p.lp),
    logHash: crypto.createHash("sha256").update(JSON.stringify(log)).digest("hex"),
  };
}

function main(argv) {
  const flag = (name, fallback) => {
    const i = argv.indexOf(name);
    if (i < 0) return fallback;
    const v = Number(argv[i + 1]);
    if (!Number.isInteger(v) || v < 0) throw new Error(`${name} must be a non-negative integer`);
    return v;
  };
  const first = flag("--seed", 1);
  const count = Math.max(1, flag("--matches", 1));
  const out = process.env.SHADW_ARTIFACT_DIR;
  const results = [];
  for (let i = 0; i < count; i++) {
    const r = playMatch((first + i) >>> 0);
    results.push(r);
    console.log(`seed ${r.seed}: ${r.finished ? `Bot ${"AB"[r.winner]} wins` : "UNFINISHED"} in ${r.turns} turns, ${r.actions} actions, life ${r.life.join("/")}, log ${r.logHash.slice(0, 12)}`);
    if (out) fs.writeFileSync(path.join(out, `match-${r.seed}.json`), JSON.stringify(r, null, 2) + "\n");
  }
  const summary = {
    format: "shadow-duel.match-summary",
    formatVersion: 1,
    matches: results.length,
    unfinished: results.filter((r) => !r.finished).length,
    wins: [0, 1].map((seat) => results.filter((r) => r.winner === seat).length),
    meanTurns: Math.round((results.reduce((n, r) => n + r.turns, 0) / results.length) * 10) / 10,
  };
  console.log(`summary: ${summary.matches} matches, wins ${summary.wins.join("/")}, ${summary.unfinished} unfinished, mean ${summary.meanTurns} turns`);
  if (out) fs.writeFileSync(path.join(out, "summary.json"), JSON.stringify(summary, null, 2) + "\n");
  return summary.unfinished === 0 ? 0 : 1;
}

if (require.main === module) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  }
}

module.exports = { playMatch };
