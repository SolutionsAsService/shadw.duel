# GDADA-LOG: Shadow Duel

Run 1: 9 Nov 2026. **Mode:** Player-first. **Run type:** Extend. **Status:** see Stop test.

## Step 0: vision, tooling, inputs

- `VISION.md` did not exist, so it was created from the person's two messages, which are quoted verbatim. It has
  5 Must-haves: 3 `owner` and 2 `inferred`. The plan was traced against it throughout.
- **Tools used:**
  - Node 22 (`npm test`, headless bot matches).
  - Playwright with Chromium: the browser suite, and the art windows measured in the running game.
  - GDADA's `skills/gdada/scripts/card_art.py`: the card-art instrument this run added to GDADA (Must-have 1). It was
    run with `--selftest` first, and every fixture tripped its reading.
  - `scripts/card-stats.cjs`: per-card impact over headless matches, written in this run.
  - Subagents for the panel: one per seat, batches of at most 3, each verdict filed under `panel/R<n>/`.
- **Inputs read:**
  - `README.md`, `cards.js`, `game.js`, `bot.js`, `scripts/build-card-art.cjs`, `docs/CARD_ART.md` and the tests.
- **The game was run before it was judged:**
  - A local duel was played to measure the art windows in the browser.
  - 400 headless bot matches were played, then 2000.
  - The full test suite was run.
- **Premortem R0: how does a player quit in the first two minutes?**
  1. The board is a wall of dark, look-alike art at phone size, and they cannot tell their creatures apart. -> F1 (art)
  2. The opponent lands an 8-cost guard, and nothing in their hand can answer it. -> F2 (board answers)
  3. Every spell is "deal N", "heal N" or "draw N", so the second duel feels like the first. -> F3 (variety)
  4. The first player wins most duels, and they lose a coin flip before they start. -> F4 (first-seat advantage)
  5. A new card does something they could not predict, such as removing the wrong creature. -> F5 (predictable targeting)

## Step 1: Traversal Plan

- **Mode: Player-first.**
  - The game serves an audience: a stranger in a browser, Vs Computer or online, on a phone or a desktop.
  - Governing criterion: **flow with a short path to it.** Every hand offers a real choice, and the board says what
    happened.
  - Required critics: Csikszentmihalyi, Swink, Norman, the Game Accessibility Guidelines, plus Meier.
  - Also seated: Solarski for the art; and Koster in the dotted pair with Csikszentmihalyi.
  - Seat for the left-out player: Access (Game Accessibility Guidelines).
- **Run type: Extend.** The loop is accepted, and the person asked for more cards.
  - Frozen: the core verbs, the turn rules, and **every existing card's behaviour**.
  - Existing card *art* may change; behaviour may not.
- **Player and session:** someone who knows the genre, or has never played it, with a 15-20 minute duel. They play on a
  phone (360-390px) as often as on a desktop.
- **Hard limits:**
  - Nothing copied from an existing card game: names, rules text, art or frames.
  - Online play stays deterministic: both browsers compute every effect identically from the seed.
  - No new target-picking verb, because spells are untargeted.
  - No third-party art or fonts.
- **Seed (exact labels from `references/game-graph.md`):**
  - `Interesting decisions (Sid Meier)`
  - `Feedback loops and economies (Adams and Dormans, Game Mechanic Design and Level Design)`
  - `Readability: silhouette, contrast, one focal point (Solarski, Drawing Basics and Video Game Art)`
  - `Bot playtesting: perfect bot proves solvable, noisy bot shows the curve`
  - `Affordances, signifiers, feedback (Norman, The Design of Everyday Things)`
  - Dotted counterpoint: `Flow: challenge matched to skill, clear goals, instant feedback (Csikszentmihalyi, Flow)`
    -.-> `Fun as learning patterns; boredom when mastered (Koster, A Theory of Fun for Game Design)`. Does more
    content add new patterns, or only more numbers?

## Frontier

| Candidate | Reached via (edge, direction) | From anchor | Status |
|---|---|---|---|
| F1 Silhouettes and twins at the board window | envstory -> readable (in), readable -> affordance (out) | Solarski | TAKEN (M6, M7, M8) |
| F2 Board answers: spells that touch creatures | ssd -> decisions (in) | Meier | TAKEN (M1, M2, BREAK) |
| F3 New patterns, not new numbers | flow -.-> fun (dotted) | Koster | TAKEN (M2) |
| Relic for every element | rules -> machinations (out) | Adams and Dormans | TAKEN (M1, M2) |
| F5 Predictable targeting, and feedback on what was hit | gag -> affordance -> krug (out) | Norman, GAG | TAKEN (M5) |
| Bot must use the new cards as a player would | playtest -> bots (in) | Bot playtesting | TAKEN (M3) |
| Worldbreaker Titan at the 70% line | bots -> determinism | Bot playtesting | TAKEN (M4), then DEFERRED: existing card frozen |
| F4 First-seat advantage (72.7%) | flow -> ramp (out) | Csikszentmihalyi | DEFERRED: a turn-rule change, frozen in Extend; open item for the owner |
| Rework Battle Rage and the dominated existing pairs | decisions | Meier | DEFERRED: existing card behaviour frozen; open item |
| Sound for impacts | anim -> sound (out) | Collins | DEFERRED: out of scope (Feel seat agreed) |
| Human playtest of the catch-up cards | playtest -> bots (out) | Fullerton | DEFERRED: playtest item, below |

## Decision Records

The records were written up as each move closed, not before it. Their measurements were taken at the time. Two
instrument incidents are recorded where they happened.

### Move M1: engine hooks for board effects and per-element relics (KEEP-THE-RULE)
- **Anchors:** Adams and Dormans (economies). Debuff already uses the `tempAtk`/`tempDef` mechanism and `destroyMonster`
  exists, so this move reuses existing systems.
- **Depends on:** nothing.
- **Hypothesis:** cards can touch the board with no new rule, and every element can own a relic.
- **Options:**
  - (a) A target picker. Refused: it adds a new verb and a new protocol message.
  - (b) Deterministic picking from the effect, through helpers exposed on `game`. **Chosen.**
  - For relics: (a) more bespoke fields like `flameBonus`; (b) `relicAtk` / `relicDef` keyed by element, plus `all`.
    **(b) chosen.** The three old fields are kept, so old relics and their tests are untouched.
- **Measurement:** `npm test` passed before and after. Snapshots stay JSON-serialisable.
- **Result:** KEEP.

### Move M2: 20 new cards (BREAK: the first spells that touch the board)
- **Anchors:** Meier; Koster -.-> Csikszentmihalyi; Adams and Dormans.
- **Depends on:** M1.
- **Hypothesis:** answers on the board make the "develop, answer or burn" choice real (VISION), and catch-up cards
  lower the first-seat advantage.
- **Options:**
  - Learner and Flow asked for a shadow 3-cost destroy-the-strongest card. The cost went to Undertow (water) instead,
    which gives water its first spell; the shadow slot became Wither.
  - Decisions asked for a wind -300 ATK spell. **Its premise was refuted by the code:** combat compares the attacker's
    ATK with the defender's DEF, so an enemy's ATK changed during your turn changes nothing. Adapted to Riptide, -300
    DEF.
- **Measurement (before -> after):**
  - Spells that touch the board: 0 of 19 -> 7 of 28.
  - Elements with a relic: 3 -> 7. Water spells: 0 -> 2.
  - Cost-curve holes filled: flame 5, water 4, earth 1, wind 4, light 2, shadow 1, neutral 4.
  - Keyword use: lifesteal 2 -> 5, debuff 3 -> 5.
- **Result:** KEEP. Card text is at most 75 characters (Access). The full rule, with tie and no-target cases, is in
  `rule` (Affordance).

### Move M3: the bot plays board spells as a player would
- **Anchors:** Bot playtesting.
- **Depends on:** M2.
- **Hypothesis:** a greedy bot that casts by cost wastes removal on an empty board and casts Riptide after its attacks,
  so it would undervalue the new cards.
- **Change:** a board spell with nothing to hit is held. Removal, and pre-combat spells while a creature can still
  attack, score above attacks.
- **Instrument incident:** `createCard` copied a fixed list of fields, and `canHit`, `wants` and `timing` were not in
  it.
  - The first card-stats run after M2/M3 was taken with a bot that could not see those fields. **It is void.**
  - Found by `tests/expansion.test.cjs` (the bot cast Scorch with no target), fixed, and re-measured.
- **Measurement:** `tests/expansion.test.cjs`: the bot holds Scorch with no target and casts it when one exists.
- **Result:** KEEP.

### Move M4: Undertow's reach (REOPEN of M2)
- **Hypothesis:** with a cap of 1100 ATK, no removal reaches the 8-cost guard, and Worldbreaker Titan rose to 71%.
- **Options (2000-match stats on each):**

  | Undertow | Worldbreaker win rate (seed 1 / 5001) |
  |---|---|
  | 4, cap 1100 | 71% (400 seeds) |
  | 5, uncapped | 70% |
  | **4, uncapped, rare** | 72.5% / 69% |

- **Result:** ADAPT. Undertow is 4-cost, uncapped and rare: it is played more (22%) and wins 50-51%.
  - Worldbreaker stays at the 70% line, and it is an existing card. **Deferred to the owner**, with the trade: a DEF
    cut (1450 -> 1300) would put it in reach of the 1350-ATK finishers.

### Move M5: the board says what happened, at every width
- **Anchors:** Norman; Game Accessibility Guidelines; Swink.
- **Depends on:** M2.
- **Hypothesis:** a spell that picks its own victim is only fair if the player can see Ward and Guard and stat changes
  before casting, and can see the result after.
- **Change:**
  - Element shape glyphs, and G/W marks, on every card at every width. Previously the element and keywords were hidden
    below 760px.
  - `stat-up` / `stat-down` with ▲/▼.
  - A one-action outline on the creature a card changed, and "Destroyed: <name>" in an emptied slot. The outline is
    static, so it survives reduced motion.
  - The full rule in the detail panel. The Ward rule names spells.
  - Phone board text 7-8px -> 10px.
  - Second pass, from the 360px screenshot: the 10px "Ready" badge hid most of the art, so it became a slim pill on the
    art's bottom edge. Three marks collided with the cost badge, so phone marks are stacked.
- **Measurement:**
  - Screenshots at 360px and 1280px (`panel/R2/board-*.png`).
  - `tests/browser.cjs`: 7 of 7 scenarios pass, including mobile layouts and two-browser WebRTC.
- **Result:** KEEP.

### Move M6: value rim behind every subject (BREAK of the art direction's dark-on-dark)
- **Anchors:** Solarski.
- **Hypothesis:** figure and ground differ in hue but not in value. A pale rim gives the silhouette a value edge.
- **Options:** measured with `card_art.py` over all 75 cards. The figures are cards with silhouette separation (`sep`)
  under 1.6:1 at the 53 × 40 board window.

  | Variant | sep under 1.6 | Median sep | Twins |
  |---|---|---|---|
  | aura only | 27/55 | | |
  | rim only (glow .55) | 36/55 | | |
  | aura + glow rim .55 | 24/75 | | |
  | aura + white rim .5 | 17/75 | | |
  | aura + glow rim .8 | 14/75 | | |
  | aura + white rim .7 | 10/75 | | |
  | **aura + white rim .85, width 7** | **6/75** | 1.89 | |
  | aura + white rim .7, width 10 | 6/75 | 2.01 | more flags |
  | aura + dark keyline + white rim | 13/75 | | 42 separation flags; refused |

- **Result:** KEEP (white .85, width 7). Opened by eye before keeping: it reads as the "engraved edge highlights" the art
  guide already names.

### Move M7: separate silhouettes for look-alike families
- **Anchors:** Solarski (shape language).
- **Depends on:** M6. The rim made outlines more alike: twins went 8 -> 11.
- **Change:** each family member gets its own base shape.
  - Stone Guardian: a squat body behind a tower shield. Iron Golem: tall and narrow, with stacks.
  - Battle Colossus: an inverted triangle with an axe. Ancient Titan: hunched, with horns.
  - Worldbreaker Titan: lifting a boulder. Mountain Behemoth: a peak behind it.
  - Radiant Knight: a round shield and halo. Ironclad Mercenary: mirrored, tilted, with an axe.
  - Inferno Knight: flames at its feet. Sunblade Angel: a raised sword. Celestial Guardian: a dome.
  - Nightblade: leaning, with a blade diagonal. Dawn Acolyte: a halo.
  - Void Hound and Tide Serpent: mirrored.
- **Measurement:** twin pairs at 53 × 40: 11 -> **0**.
- **Result:** KEEP.

### Move M8: art for the 20 new cards, and enlarged small subjects
- **Anchors:** Solarski's rules for new art (R1): its own base primitive, a value rim, one focal point, and a relic
  shape that is not the gem.
- **Measurement:**
  - The first pass flagged 12 of 20 new cards. Per-card fixes: lighter masses, larger subjects, fewer fine lines.
    After them, **0 of 20 fail `sep`, `twin`, `area` or `kept` in any window.**
  - Small subjects under 12% of the window: 7 -> 0.
- **Result:** KEEP. `noise` flags remain on some small, busy subjects at the two phone board sizes; see the R2 panel.

## Panel Reports

### Panel R1 (WHOLE, baseline build c82923c, evidence: panel/R1/evidence.md)

Each seat ran as its own subagent, in batches of at most 3, and filed its verdict under `panel/R1/`. All seven filed.

| Critic (work) | Observed | Verdict | Requested change | Resolution |
|---|---|---|---|---|
| Flow (Csikszentmihalyi, *Flow*) | 0 of 19 spells touch the board; first seat 72.3%; the 2-cost slots are the weakest | OBJECT | Board answers; catch-up spells; rework Battle Rage | ADAPT (M2, M4); catch-up built (M2); Battle Rage DEFERRED (frozen card) |
| Decisions (Meier) | Burn spells differ only in size; dominated pairs; "answer" is missing | OBJECT | 3 board spells; a relic per element; separate the dominated pairs | ADAPT (M2: Riptide as DEF, premise refuted); relics KEEP; dominated pairs DEFERRED (frozen cards) |
| Learner (Koster, *A Theory of Fun*) | About 6 patterns; 19 spells are 3 number-change patterns | OBJECT | Shadow destroy, wind -DEF, water +DEF | ADAPT (Undertow / Riptide / Tidewall) |
| Readability (Solarski) | Hue-only separation; the twins are one shape | OBJECT | Value rim; base shape per family; enlarge small subjects | ADAPT (M6-M8) |
| Affordance (Norman) | Ward/Guard hidden on phones; the log never says what a spell did | OBJECT | Full-clause rule; a result log line; marks at every width and stat colouring | ADAPT (M2 `rule`, M5) |
| Access (Game Accessibility Guidelines) | Element by colour only on phones; 7-8px text | OBJECT | Shape icon and G/W badges at 12px or more; 10px text; one-line rule text; no new terms | ADAPT (M5: badges 13-15px; text 10px) |
| Feel (Swink, *Game Feel*) | A spell's only feedback is a log line | OBJECT | A target log line; a one-render slot mark with a static resting style; "Destroyed: name" | ADAPT (M5) |

### Panel R2 (WHOLE, build b9a657f, evidence: panel/R2/evidence.md)

_See below; filled from `panel/R2/` when the seats report._
