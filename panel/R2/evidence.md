# R2 evidence: WHOLE round on build b9a657f (Shadow Duel 1.3.0), 9 Nov 2026

What changed since R1 (read `git show --stat b9a657f` and the CHANGELOG 1.3.0 entry):

- **20 new cards** in `cards.js` (75 in all). Board spells: Scorch (flame 2, destroy the lowest-DEF enemy without Ward if DEF <= 400),
  Undertow (water 4, destroy the highest-ATK enemy without Ward), Landslide (earth 5, destroy every enemy without Ward with DEF <= 500),
  Wither (shadow 3, the highest-ATK enemy without Ward -500 ATK/DEF until its next turn), Riptide (wind 2, enemies without Ward -300 DEF
  until their next turn), Tidewall (water 2, your creatures +400 DEF until your next turn), Rally Cry (neutral 2, your creatures +200 ATK
  until your next turn). Catch-up: Second Wind (light 2, draw 1, or 2 if the opponent has more creatures), Turning Gale (wind 3, 400
  damage, or 800 if you are behind on life). Relics: Tidestone, Storm Feather, Sun Sigil, War Banner. Creatures: Gloom Mite, Lantern
  Bearer, Mossback Tortoise, Brine Witch, Pyre Phoenix, Gale Harpy, Wandering Duelist.
- Board spells pick by a fixed rule (no Ward, best value, leftmost on a tie); the full rule is in the card's `rule` field, shown in the
  detail panel; card text is one line (<= 75 chars, tested). Spells log what they hit or "no enemy creature qualifies; no effect".
- Ward's rule now reads "immune to hostile creature and spell effects".
- Field cards (game.js `cardEl`, duel-ui.css "GDADA run 1" block): element shape glyph (▲ ● ■ ≋ ✦ ☾ ○) and G / W marks for Guard / Ward
  at every width, changed ATK/DEF coloured with ▲/▼, the creature a card just destroyed/changed outlined until the next action
  ("Destroyed: <name>" in an emptied slot), reduced motion keeps the static outline. Phone board text 10px.
- Bot (`bot.js`): holds a board spell with nothing to hit; casts removal and pre-combat spells before attacking.
- Art (`scripts/build-card-art.cjs`): pale value rim under every subject, brighter aura, separate base shapes for the giant / knight /
  angel / wizard / wolf / serpent families, seven small subjects enlarged, 20 new subjects with their own base shapes.
- NOT changed (Extend freezes existing card behaviour): Battle Rage, Worldbreaker Titan, the dominated pairs Decisions named, turn order.

## Measurements at the final state

`node scripts/card-stats.cjs --matches 2000` (seed 1) and `--seed 5001`:
- first-seat wins 72.7% (before, 55 cards) -> **67.1%** (seed 1) / 68.7% (seed 5001). Mean turns 20.1 -> 20.4. 0 unfinished.
- win-rate spread over cards with >= 30 plays: before 42.8-67.8% -> after 41.8-72.5% (seed 1); 0 flagged on seed 5001.
- **Worldbreaker Titan** (existing, 8-cost) 72.5% on seed 1 (flagged), 69% on seed 5001; it was 67.8% before.
- The 20 new cards: 43-56% each; each played in 15-23% of a seat's matches. Battle Rage 45% (2000 seeds, before) is unchanged code.

`python3 ../gdada/skills/gdada/scripts/card_art.py --config gdada.card-art.json` (exact masks, 6 windows measured in the game):
- sep < 1.6 at board-360: 37 of 55 -> **4 of 75**; median 1.54 -> 1.89. Hand: 32 of 55 -> 3 of 75.
- twin pairs at board-360: 8 -> **0**. area < 0.12: 7 -> 0. kept/clip/off: clean (one clip 0.088 on Worldbreaker at board-360).
- Remaining flags are `noise` (interior edge share > 0.6) on small busy subjects at board-390/360 (e.g. Divine Renewal 0.81, Storm
  Feather 0.81, Scorch 0.75, Fireball 0.74). Judge them on the sheet.
- All 20 new cards pass sep, twin, area and kept in every window.
- Contact sheet: panel/R2/sheet.png. Before: panel/R1/sheet.png.

Tests: `npm test` 82 pass / 0 fail (tests/expansion.test.cjs covers every new spell, relic, Ward, the rule text and the bot);
`npm run art:check` verified 75; `node tests/browser.cjs` 7 of 7 scenarios pass incl. two-browser WebRTC; bot-match seeds 1-20 finish.

Phone screenshot of a board after Undertow then Wither (360px): Undertow skipped Sky Sovereign (Ward) and destroyed Tempest Giant;
Wither then hit Stone Guardian (tie at 300 ATK with Gloom Mite, leftmost), shown as "0 ATK ▼ / 150 DEF ▼" with a red outline.
