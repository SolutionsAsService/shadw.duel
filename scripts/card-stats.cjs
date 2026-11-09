// Per-card impact over many headless bot-vs-bot matches (GDADA "card impact" check).
//
//   node scripts/card-stats.cjs [--seed <n>] [--matches <k>] [--json <file>]
//
// For every card: how many matches it was played in, and the win rate of the seat
// that played it. Also the first-seat win rate, mean turns, how matches ended and
// how often each card was still in hand or deck at the end. "held/match" is how
// many turns per match the card ended in a hand where it could legally be played
// (summon limit and energy allowing) and was kept: the bot choosing to wait. The bot is greedy, so
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
  // held[name] = [turns it ended in hand while castable, turns it ended in hand while castable and was kept]
  const held = {};
  // Effect checks for the board spells (Learner, R2): what removal hit, and which
  // attacks a DEF change decided. buffs: card id -> { by, amount, kind, turn }.
  const fx = { victimAtk: {}, swung: {}, bounced: 0 };
  const buffs = new Map();
  let actions = 0;
  while (!state.gameOver && actions++ < 5000) {
    const seat = state.currentPlayer;
    const legal = game.legalActions();
    const action = bot.choose(state, legal, rngs[seat]);
    if (action.type === "end") {
      for (const entry of legal) if (entry.action.type === "play") {
        const h = held[entry.card.name] || (held[entry.card.name] = 0);
        held[entry.card.name] = h + 1;
      }
    }
    if (action.type === "play") {
      const card = state.players[seat].hand.find((c) => c.id === action.cardId);
      if (card) played[seat].add(card.name);
      if (card && typeof card.targets === "function") {
        for (const t of card.targets(state, seat)) {
          const slot = state.players[t.seat].field[t.slot];
          if (!slot) continue;
          if (["Undertow", "Scorch", "Landslide"].includes(card.name)) (fx.victimAtk[card.name] = fx.victimAtk[card.name] || []).push(slot.card.atk + (slot.card.bonusAtk || 0));
          if (card.name === "Riptide") buffs.set(slot.card.id, { name: "Riptide", amount: 300, turn: state.turnNumber, side: "enemy" });
          if (card.name === "Wither") buffs.set(slot.card.id, { name: "Wither", amount: 500, turn: state.turnNumber, side: "enemy" });
          if (card.name === "Tidewall") buffs.set(slot.card.id, { name: "Tidewall", amount: 400, turn: state.turnNumber, side: "own" });
        }
      }
    }
    if (action.type === "attack" && action.target !== null) {
      const entry = legal.find((e) => e.action.type === "attack" && e.action.attacker === action.attacker && e.action.target === action.target);
      const target = state.players[1 - seat].field[action.target];
      const b = target && buffs.get(target.card.id);
      if (entry && b && b.side === "enemy" && b.turn === state.turnNumber && entry.atk > entry.targetDef && entry.atk <= entry.targetDef + b.amount) fx.swung[b.name] = (fx.swung[b.name] || 0) + 1;
      if (entry && b && b.side === "own" && b.turn === state.turnNumber - 1 && entry.atk <= entry.targetDef && entry.atk > entry.targetDef - b.amount) fx.bounced++;
    }
    if (!game.act(action)) throw new Error(`seed ${seed}: refused ${JSON.stringify(action)}`);
  }
  const deckOut = state.players.some((p) => p.deck.length === 0 && p.lp > 0) && state.players.every((p) => p.lp > 0);
  return { seed, winner: state.winner, turns: state.turnNumber, played, held, fx, deckOut, finished: state.gameOver,
    left: state.players.map((p) => p.deck.length) };
}

function main(argv) {
  const flag = (k, d) => { const i = argv.indexOf(k); return i < 0 ? d : argv[i + 1]; };
  const first = Number(flag("--seed", 1)), count = Number(flag("--matches", 300));
  const cards = require(path.join(ROOT, "cards.js"));
  const all = [...cards.MONSTER_TEMPLATES, ...cards.SPELL_TEMPLATES, ...cards.RELIC_TEMPLATES];
  const stat = new Map(all.map((t) => [t.name, { name: t.name, type: t.type || "monster", element: t.element, cost: t.cost, plays: 0, wins: 0, heldTurns: 0 }]));
  const res = [];
  for (let i = 0; i < count; i++) {
    const r = playMatch(first + i);
    res.push(r);
    for (const [name, n] of Object.entries(r.held)) stat.get(name).heldTurns += n;
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
  const fxAll = { victimAtk: {}, swung: {}, bounced: 0 };
  for (const r of res) {
    for (const [k, v] of Object.entries(r.fx.victimAtk)) (fxAll.victimAtk[k] = fxAll.victimAtk[k] || []).push(...v);
    for (const [k, v] of Object.entries(r.fx.swung)) fxAll.swung[k] = (fxAll.swung[k] || 0) + v;
    fxAll.bounced += r.fx.bounced;
  }
  const median = (a) => { const b = [...a].sort((x, y) => x - y); return b.length ? b[b.length >> 1] : null; };
  const casts = (name) => rows.find((r) => r.name === name)?.plays || 0;
  summary.effects = {
    medianVictimAtk: Object.fromEntries(Object.entries(fxAll.victimAtk).map(([k, v]) => [k, median(v)])),
    attacksWonOnlyBecauseOf: Object.fromEntries(Object.entries(fxAll.swung).map(([k, v]) => [k, `${v} in ${casts(k)} matches cast`])),
    attacksBouncedOffTidewall: `${fxAll.bounced} in ${casts("Tidewall")} matches cast`,
  };
  const flagged = rows.filter((r) => r.plays >= 30 && (r.winRate > 0.7 || r.winRate < 0.3));
  console.log(`summary: ${JSON.stringify(summary)}`);
  console.log("card                     type    elem     cost  played  win   held/match");
  for (const r of rows.sort((a, b) => b.winRate - a.winRate)) {
    console.log(`${r.name.padEnd(24)} ${r.type.padEnd(7)} ${r.element.padEnd(8)} ${String(r.cost).padStart(4)}  ${(r.playRate * 100).toFixed(0).padStart(5)}%  ${r.winRate === null ? "  -" : (r.winRate * 100).toFixed(0).padStart(3) + "%"}  ${(r.heldTurns / count).toFixed(2).padStart(5)}${flagged.includes(r) ? "  *" : ""}`);
  }
  console.log(`flagged (>=30 plays, win rate outside 30-70%): ${flagged.length}`);
  const out = flag("--json", null);
  if (out) fs.writeFileSync(out, JSON.stringify({ summary, cards: rows }, null, 1) + "\n");
  return summary.unfinished ? 1 : 0;
}

if (require.main === module) process.exitCode = main(process.argv.slice(2));
