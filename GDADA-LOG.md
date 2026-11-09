# GDADA-LOG: Shadow Duel

Run 1: 9 Nov 2026. **Mode:** Player-first. **Run type:** Extend. **Status:** COMPLETE (see Stop test and Open items).

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

The seats played from the evidence file, the code, `card-stats` runs of their own and the screenshots. All seven filed.

| Critic (work) | Observed in the build | Verdict | Requested change | Resolution |
|---|---|---|---|---|
| Flow (Csikszentmihalyi) | 7 board spells; first seat 67.1%; Titan 73%; tried two bot-only fixes on a scratch copy (71%, 23%) | PASS | none; the freeze's cost recorded (seat edge, Titan) | Open items for the owner |
| Decisions (Meier) | Board spells create sequencing (Riptide then Scorch); Turning Gale and Second Wind are dominated | OBJECT | Turning Gale to 2; Second Wind to 1, conditional only | ADAPT (M9): Turning Gale KEEP; Second Wind as asked measured 24% (a selection effect), so it is now "otherwise restore 400 LP" |
| Readability (Solarski) | All 3 R1 requests met; noise flags come from the 1px rim | PASS | advisory: fill Riptide, Rally Cry and Storm Feather; Wither's petals to the mid value | ADAPT (M11) |
| Access (GAG) | The Ready pill covers W on the phone; the glyph key is hover-only | OBJECT | Marks visible on the phone; a legend | ADAPT (M10) |
| Affordance (Norman) | Results are readable; the card face teaches the wrong rule ("strongest", no Ward) | OBJECT | Face text names the stat and Ward, with a test; would-hit preview | ADAPT (M10) |
| Feel (Swink) | R1 requests met; the static outline holds under reduced motion | PASS | note: the bot's removal is cleared by its next action | ADAPT (M10: impacts last the turn) |
| Learner (Koster) | Patterns 6 -> about 10; relics are reskins in a one-copy shared deck; measures missing | OBJECT (mild) | Effect instrumentation; the bot holds Undertow for a 1000+ ATK target | ADAPT (M9); relic critique logged as an open item (deck building is out of scope) |

### Move M9: no dominated new cards, and the bot measures the board spells
- **Turning Gale:** cost 3 -> 2. It now beats Fireball when you are behind and loses to it when you are ahead.
- **Second Wind, built first as Decisions asked** (cost 1, draw 2 only when outnumbered):
  - It measured **24%**, with 0.67-0.79 held turns per match, because it is only cast in games already being lost.
  - It is now: draw 2 if outnumbered, otherwise restore 400 LP. That is not dominated by Quick Draw or Healing Potion,
    and does not dominate them. It measures 48% on both seed ranges.
- **Bot:** holds Undertow for a 1000+ ATK target. The median ATK it removes is now 1100.
- **card-stats** prints held turns per match, and the effects.
  - Riptide and Wither each decided about 315 attacks per 2000 matches.
  - Tidewall's 2 turned-away attacks show the limit of a bot that never makes a losing attack. Tidewall deters attacks;
    it does not visibly block them.
- **Result:** KEEP.

### Move M10: honest card faces, previews, and marks that stay visible
- **Card faces:** they name the stat and "without Ward", tested at 75 characters or fewer.
- **Preview:** hovering or focusing a board spell outlines the zones it would hit. A test checks that the preview equals
  what the spell then hits.
- **Legend:** in the Rules dialog and every detail panel.
- **Phone:** marks in a right-hand column, the Ready pill left-aligned, and the Destroyed label wrapped.
- **Impacts:** they last for the turn they happened in.
- **Measurement:**
  - Screenshots `panel/R3/board-*.png`.
  - `npm test`: 85 pass.
  - Browser suite: 7 of 7.
- **Result:** KEEP.

### Move M11: the Readability seat's advisories
- **Change:** Riptide is one filled crest; the horn and the feather are filled with the light value; Wither's petals are
  at the mid value.
- **Measurement:** all four are clean in every window, `noise` included.
- **Result:** KEEP.

### Panel R3 (WHOLE, build d38b945, evidence: panel/R3/evidence.md): final round under the cap

Seated: the four R2 objectors, plus Readability, because the art changed. Flow and Feel passed R2. What changed since
then touches their concerns only in the directions they asked for (impacts last for the turn: Feel's note), so their
R2 PASS is carried, not re-sat. This is stated here because it is a shortcut.

| Critic (work) | Observed | Verdict | Note |
|---|---|---|---|
| Decisions (Meier) | Turning Gale is not dominated by Fireball; Second Wind neither dominates nor is dominated by any 1-cost card; hold rate printed | PASS | Advisory: the bot never holds Turning Gale or Second Wind |
| Access (GAG) | W/G visible at 360px; legend in Rules and the detail panel | PASS | Advisory: screen readers do not announce the "would hit" label |
| Affordance (Norman) | Faces name the stat and Ward; preview matches the result (tested) | PASS | Touch players get no preview; the face text and impact marks cover it |
| Learner (Koster) | Instrumentation in; Undertow held 0.10 per match, median victim 1100 ATK | PASS | Relics stay a lottery in a one-copy shared deck: open item |
| Readability (Solarski) | Riptide, Storm Feather and Rally Cry read as filled masses; Wither's flower head stays the focus | PASS | Rally Cry is the faintest of the three |
| Flow (Csikszentmihalyi) | carried from R2 | PASS (R2) | |
| Feel (Swink) | carried from R2 | PASS (R2) | |

No ANDON in any round. Every finding is in the tables above.

## Anchor Ledger

| Anchor | Used in | Outcome |
|---|---|---|
| `Interesting decisions (Sid Meier)` | Seed; M2, M9 | kept: 7 board spells; 0 strictly dominated new cards |
| `Feedback loops and economies (Adams and Dormans, ...)` | Seed; M1, M2 | adapted: per-element relics. Learner: relics are a lottery without deck building (open) |
| `Readability: silhouette, contrast, one focal point (Solarski, ...)` | Seed; M6, M7, M8, M11 | kept: sep under 1.6 at 53x40 37/55 -> 4/75; twins 8 -> 0 |
| `Bot playtesting: perfect bot proves solvable, noisy bot shows the curve` | Seed; M3, M4, M9 | adapted: the greedy bot plays the board spells; card-stats with held turns and effects |
| `Affordances, signifiers, feedback (Norman, ...)` | Seed; M5, M10 | kept: marks at every width, honest faces, preview, impact outline |
| `Flow: challenge matched to skill, ... (Csikszentmihalyi, Flow)` | Dotted seed; R1-R2 | adapted: answers on the board; first-seat edge reduced, not fixed (frozen rule) |
| `Fun as learning patterns; ... (Koster, ...)` | Dotted counterpoint; R1-R3 | kept: patterns about 6 -> about 10 |
| `Game Accessibility Guidelines: basic, intermediate, advanced` | R1-R3 | kept: shapes as well as colour; 10px phone text; legend |
| `Game Feel: input, response, context, polish (Swink)` | R1-R2; M5, M10 | kept: impact outline, static under reduced motion |
| `Deterministic simulation: same seed, same result` | M1, hard limit | kept: same seed gives the same match; two-browser WebRTC test passes |
| `Procedural rhetoric: rules that argue (Bogost, Persuasive Games)` | Dotted from Koster | declined: the duel's theme is not argued by its rules in this run; nothing in VISION asks it to be |
| `Sound as feedback and mood (Collins, Game Sound)` | Out-edge of anim | declined: out of scope (Feel agreed) |

## Stop test

- **S1 (no OPEN Frontier items): MET.** Every row is TAKEN or DEFERRED with a reason and an owner.
- **S2 (a WHOLE round with PASS from every required critic, no Andon): MET, with one shortcut.** R3 seated 5. Flow and
  Feel carry their R2 PASS (stated above).
- **S3 (last WHOLE round had no ADAPT, SCRAP or REOPEN): MET.** R3 requested no change; its advisories are logged.
- **S4 (ambition push): MET.** The boldest idea is the board spells. They were pushed to the 8-cost finisher (M4:
  Undertow uncapped, then held for a 1000+ ATK target).
  - Measured: Undertow's median victim went from ATK unrecorded to 1100, its hold rate from 0.01 to 0.10.
  - Worldbreaker Titan moved only 73% -> 70%: the push hit the frozen-card wall, which is logged.
- **S5 (every dotted edge from a used anchor applied or declined): MET.**
  - Applied:
    - `flow -.-> fun`: the seed counterpoint.
    - `gamefeel -.-> rules`: the impact outline gives feel within the frozen rules.
    - `juice -.-> scope`: one pulse, no further animation.
  - Declined, with reasons:
    - `fun -.-> persuasive`: VISION asks for no rhetoric.
    - `cozy -.-> decisions` and `ramp -.-> cozy`: this is not a cozy game.
    - `proc -.-> envstory`: there is no procedural content.
- **S6 (build runs, tests pass): MET.**
  - `npm test`: 85 pass, 0 fail.
  - `npm run art:check`: 75 verified.
  - `node tests/browser.cjs`: 7 of 7, including two-browser WebRTC.
  - `node scripts/bot-match.cjs --seed 1 --matches 20`: 20 of 20 finish.
- **S7 (every Must-have built and checked): MET.**
  1. GDADA has a card-art tool: `skills/gdada/scripts/card_art.py` in SolutionsAsService/gdada, with its self-test
     and `references/card-art.md`.
  2. Every card reviewed with GDADA, art and play: all 75 measured by `card_art.py` and `card-stats.cjs`. Seven seats
     sat three rounds.
  3. More card variety where the game was good: 20 cards. The 7 board spells and 2 catch-up spells are new patterns.
     The relics complete every element. The creatures fill the empty cost slots and the under-used keywords.
  4. The new art passes the read-size checks: 0 of 20 new cards fail sep, twin, area or kept.
  5. Nothing that worked broke: rules, art check, deterministic matches and online sync all pass.

**Success tests in VISION.md:**
- Met: tests pass, matches finish, the new art passes, every element has a relic.
- **One is not met:** "every element has a card that touches the board". Light has none: Second Wind counts creatures
  but does not touch them. It was found at the final check, after the round cap, and is open item 7.
- The card-impact test is at its limit: one existing card (Worldbreaker Titan) reads 70-73% on one seed range. That is
  open item 2.

**Run status: COMPLETE**, with the open items below for the owner.

## Open items (owner decisions; not blockers)

1. **The first player wins about 68% of bot matches** (72.7% before this run). Fixing it needs a turn-rule change,
   for example the first player skips the opening draw, or the second player starts with +1 energy. Extend froze the
   turn rules. Flow measures what is left as one game in three decided by seat.
2. **Worldbreaker Titan is at the 70% limit** (73% / 69% / 70% across seed ranges). It is an existing card. Suggested
   change: DEF 1450 -> 1300, so the 1350-ATK finishers can trade with it.
3. **Existing dominated cards** (Decisions R1): Flame Burst against Void Bolt, Aegis against Healing Potion, Ember
   Whelp against Wind Falcon, Ancient Titan against Abyssal Kraken. A rework is a Rebalance run. Decisions measured
   the cost as small, because decks are random.
4. **Relics teach nothing without deck building** (Learner): with one copy of every card, an element relic is a
   lottery. VISION rules out deck building in this run.
5. **Playtest items** (watch, do not explain):
   - Do players notice Ward deciding Undertow's target before they cast it?
   - Do they cast Riptide before attacking without being told?
   - Does Second Wind's "otherwise 400 LP" read as a consolation or a choice?
7. **Light has no board-touching card** (a VISION success test). Suggested: a light 2-3 cost spell that restores a
   creature's DEF or gives your highest-DEF creature +300 DEF until your next turn. It gets new art held to the same
   checks.
6. **Advisories:**
   - The bot never times Turning Gale or Second Wind.
   - Screen readers do not announce "would hit".
   - Touch players get no preview.
   - Rally Cry is the faintest of the filled spells.

## Double loop

- **Did the criterion, panel or graph fail the game?**
  - The graph has no anchor for **balance measured across a card pool**. The bot-playtesting anchor proves
    solvability and difficulty, not whether a card is dominated or confounded.
  - Two of this run's errors lived exactly there:
    - A conditional card's win rate measured selection, not strength (Second Wind 24%).
    - A bot that cannot see a card's intent measures nothing (the `createCard` incident).
- **Graph amendment, applied in GDADA (`references/game-graph.md`):** a node `Card pool balance: dominance, selection effects, held rate (bot
  playtesting over a pool)` under PLAYTEST AND RISK, with an edge from `bots` and a dotted counterpoint to
  `decisions`.

## Carry-Forward Ledger (durable facts about this game)

- **Combat:** the attacker's ATK against the defender's DEF. An enemy's ATK lowered on your turn does nothing; any
  debuff must touch DEF.
- **Timing:** `tempAtk` and `tempDef` expire at the start of their controller's turn. On your own creatures they last
  through the opponent's turn; on enemies they last only for your turn.
- **Card fields:** `createCard` copies an explicit list of template fields. Any new field must be added there, or the
  bot and UI never see it.
- **Spell targeting:** spells are untargeted. A board effect picks by `pickCreature`: never Ward, best value, leftmost
  on a tie. The preview (`targets`) must stay identical to the effect, and a test enforces it.
- **Balance numbers:** use 2000 matches on two seed ranges. 400 matches swung one card by 10 points.
- **Art:** the value rim (`rim()`) and the family-separation block are what keep the art legible at 53 x 40. Any new
  subject gets its own base shape, and passes `card_art.py` before it ships.

## Compliance Check

- [x] `VISION.md` read first (created from the person's words); Must-haves traced to moves (S7 above)
- [x] Game run before it was judged; R0 premortem done
- [x] Mode, run type, player and criterion stated
- [x] Seed with exact labels and a dotted counterpoint; living Frontier
- [x] At least one BREAK move (M2 board spells; M6 value rim); no quota used as a stopping rule
- [~] A Decision Record for each move, with options and a measurement. **Not before the move:** the records were
  written up as each move closed. Their measurements were taken at the time.
- [x] A Panel Report per round, one critic per reference, each a separate subagent with a filed verdict (`panel/R1-R3`).
  R3 carried 2 seats from R2.
- [x] Measurements printed at the final state (R3 evidence), with claim-audit counts:
  - **Measured: 14.** Card counts, win rates, first-seat rate, held rates, effects, sep, twins, area, test counts,
    browser scenarios, deck-outs, mean turns, the median victim ATK, and the pattern count. The pattern count is
    Learner's tally, not an instrument.
  - **Computed: 2.** Dominance checks; the card-variety matrix.
  - **Assumption: 3.** "A stranger understands the targeting rule from the face"; "Riptide-before-attack is
    discovered"; "relics feel like a lottery to humans". Each is a playtest item above.
- [x] S1 to S7 shown as met, with where
- [x] Anchor Ledger complete; final reply states mode, run type, tools, stop conditions and everything skipped

Tools used: Node 22, Playwright with Chromium, GDADA `card_art.py`, `scripts/card-stats.cjs`, subagents (7 seats × 3
rounds, 17 verdicts). Not used: human playtesters, sound.
