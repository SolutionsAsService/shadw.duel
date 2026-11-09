# Run 2, R1 evidence: WHOLE round on build 6a3d1f7, 9 Nov 2026

Owner's new direction (VISION.md, Must-haves 6-9): "Art needs work also cards need lots more detail like different
abilities". Asked what is wrong with the art: "Too simple / not detailed" and "Looks generic / samey". This lifts run 1's
freeze on existing cards; turn rules stay frozen.

## Abilities (commit eec25f2)
- Engine (game.js `trigger`): creature hooks onSummon, onAttack (before combat), onKill, onDeath (8 deep max), onDawn (start
  of its controller's turn). Every hook is caught and logged; Kill can grant one extra attack per turn (Sky Hunter).
- All 40 creatures have one ability each, 40 different, face text "Summon: / Attack: / Kill: / Death: / Dawn: ..." at most 75
  characters; the old line moved to an italic flavour line in the detail panel. Read them in cards.js (`text:` under each
  creature) or run: node -e 'for (const t of require("./cards.js").MONSTER_TEMPLATES) console.log(t.name, "|", t.text)'
- Riders on spells that differed only in size: Spark, Fireball, Flame Burst, Void Bolt, Meteor, Void Collapse, Aegis, Divine
  Renewal, Quick Draw. Divine Renewal now buffs your creatures, so light has a board card (run 1 open item 7).
- Rules dialog and detail panel explain the five triggers.

## Art (commit 6a3d1f7)
- scripts/art-scenes.cjs: a setting, time of day, sun/moon, horizon, parallax, framing, particles and camera per card.
  Settings: plains 12, peaks 11, ruins 11, sky 11, forest 7, cavern 7, sea 6, temple 4, volcano 3, void 3. Times: night 27,
  dawn 23, dusk 14, day 11. 34 setting/time combinations; 4-5 settings per element (was 1 landscape per element, one hour,
  centred subject). Camera dx -29..29.
- Subjects: per-shape form shading toward the scene's light, lit flesh gradient, inner bevels, rivets and specular streaks on
  metal, scale/grain marks on bodies. The silhouette drawings themselves (scripts/build-card-art.cjs subjects) are unchanged.
- LOOK: panel/run2-R1/before.png (6 cards at the end of run 1) vs panel/run2-R1/cards-a.png and cards-b.png (15 cards now,
  400x300 each), and panel/run2-R1/sheet.png (every card in six read windows).

## Measurements
- npm test 93 pass (tests/abilities.test.cjs: every creature has one ability whose face names its trigger; each trigger kind;
  all 40 summon/attack/kill/die/dawn with no ability error). Browser suite 7 of 7. art:check 75.
- card-stats 2000 matches (seed 1 / 5001): 0 effects threw; first seat 66.5% / 69.2%; 0 cards outside 30-70% on either;
  spread 38-65%; Worldbreaker Titan 62-65% (was 70-73%). Mean turns 20.
- card_art.py: sep < 1.6 at 53x40: 0 of 75 (was 4); median 1.98 (was 1.88); twins 0; inspect-window sep under 1.6 on 2 cards
  (Landslide 1.599, Mountain Behemoth 1.53); hue: War Banner 73 vs neutral 206 (its warm white); remaining flags are noise
  (interior edges) at the 59x44 and 53x40 boards. Assets 887 KB of a 900 KB budget, 115 KB gzipped.
