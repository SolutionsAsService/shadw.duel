# R1 evidence: Shadow Duel baseline (build c82923c + art config), 9 Nov 2026

Run type Extend, mode Player-first. Rules are frozen; new content must be built from existing systems.
Commands are repeatable from the repo root.

## Card impact: `node scripts/card-stats.cjs --matches 400`

summary: 400 matches, 0 unfinished, **first seat wins 72.3%**, mean 20.1 turns, 5 deck-outs, 37.9 of 55 cards left in each deck at the end.
Each card is played in 17-29% of a seat's matches (one copy each, 55-card deck).
Win rate of the seat that played it ranges from 39% (Battle Rage) to 65% (Worldbreaker Titan). 0 cards flagged (outside 30-70% with >=30 plays).
Top: Worldbreaker Titan 65, Sky Sovereign 57, then the 6-8 cost finishers at 55, Nightblade 54, Deep Sea Leviathan 54, Crystal Sentinel 54.
Bottom: Battle Rage 39, Stone Guardian 41, Frost Siren 42, Shadow Stalker 42, Cinder Wolf 42, Iron Golem 42.
The bot is greedy: it always summons when it can, casts spells by cost, and never makes a losing attack.

## Card variety matrix (monsters by cost; relics; spells)

| element | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | relic | spells |
|---|---|---|---|---|---|---|---|---|---|---|
| flame | Ember(swift) | Cinder(swift) | Flame(burn) | Inferno(burn) | · | Ashen(burn) | · | · | Ember Core | Fireball, Battle Rage, Flame Burst, Meteor |
| water | River(heal) | Tide(guard) | Frost(debuff) | · | Deep(guard) | · | Abyssal(guard) | · | **none** |  |
| earth | · | Stone(guard) | Iron(guard) | Crystal(guard+ward) | Mountain(guard) | · | · | Worldbreaker(guard) | Crystal Heart | Stone Skin |
| wind | Wind(swift) | Sky(swift) | Storm(swift+burn) | · | Tempest(swift) | · | Sky(swift+ward) | · | **none** | Spark, Quick Draw, Windstep, Lightning Strike |
| light | Dawn(heal) | · | Radiant(guard+heal) | · | Sunblade(heal+ward) | · | Celestial(guard+heal+ward) | · | **none** | Healing Potion, Minor Restoration, Barrier, Aegis, Divine Renewal |
| shadow | · | Shadow(swift) | Nightblade(swift+debuff) | Void(debuff) | Dread(lifesteal) | · | · | Lord(lifesteal+ward) | Void Shard | Void Bolt, Dark Bargain, Void Collapse |
| neutral | · | Ironclad | Arcane(ward) | · | Battle(guard) | · | Ancient(guard) | · | **none** | Draw Two, Arcane Insight |

Keyword counts over 33 monsters: {"swift":9,"burn":4,"heal":5,"guard":12,"debuff":3,"ward":6,"lifesteal":2}

Spell effect families (19 spells): damage to the opponent's life 7 (Spark 250, Fireball 500, Lightning Strike 700, Flame Burst 750, Void Bolt 900, Meteor 1400, Void Collapse 1800); heal 4 (+1 in Minor Restoration); draw 5; next-summon stat buff 2; shield 1; swift 1.
**Spells that touch a creature on the board: 0 of 19.** No removal, no board-wide buff, no answer to a big creature except combat.
Relics: 3 (flame ATK, earth DEF, shadow ATK). Water, wind, light and neutral have none. Water has 0 spells.

Engine systems that exist and that new cards could reuse without new rules: dealDamage, healPlayer, drawCards, shield, next-summon attack/defense bonus, swift bonus,
per-element relic bonuses, field creatures' tempAtk/tempDef (expire at the start of their controller's turn; Debuff uses this), destroyMonster, the seven keywords.
Spells are untargeted (no target picker), so any board effect must choose deterministically (e.g. "the non-Ward enemy creature with the highest ATK").

## Card art: `python3 ../gdada/skills/gdada/scripts/card_art.py --config gdada.card-art.json`

Windows measured in the running game: inspect 226x170, hand 124x93, hand-phone 120x90, board 105x79, board-390 59x44, board-360 53x40, all `cover`. Exact figure mask.
flagged: 53 of 55 cards. Silhouette separation (sep, limit 1.6) under the limit for 37 of 55 at board-360; worst Lord of the Void 1.30, Dark Bargain 1.31, Void Hound 1.32, Dread Reaper 1.36, Ashen Dragon 1.38.
Twin pairs at board-360 (limit 0.80): Iron Golem~Stone Guardian 0.97, Ironclad Mercenary~Radiant Knight 0.92, Battle Colossus~Stone Guardian 0.91, Celestial Guardian~Sunblade Angel 0.90, Ancient Titan~Stone Guardian 0.89, Dawn Acolyte~Nightblade 0.87, Mountain Behemoth~Stone Guardian 0.83, Stone Guardian~Worldbreaker Titan 0.83.
Small subjects (area < 0.12 at board-360): Barrier, Flame Burst, Frost Siren, Minor Restoration, Spark, Stone Skin, Void Shard.
No crop loss, no clipping, no hue drift. Contact sheet: panel/R1/sheet.png (every card in every window, mask, squint).
Art source: scripts/build-card-art.cjs. Subjects are drawn by shared helpers (giant(), knight(), wolf(), dragon(), bird(), serpent()) in a dark `url(#body)` gradient with thin `var(--glow)` strokes.
