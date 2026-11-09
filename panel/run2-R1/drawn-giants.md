# Drawn: giants (`scripts/art-subjects/giants.cjs`)

Nine former twins, each with its own silhouette and its ability in the picture.

| Card | Silhouette | What the picture shows |
|---|---|---|
| Stone Guardian | Squat, hunched, kneeling boulder | A low, wide stone back with new angular stone spires growing out of it as dawn rays strike it (Dawn: +50 DEF). One fist planted, small head sunk forward at right. |
| Iron Golem | Tall, upright iron biped | It thrusts a tall curved, hex-ribbed wall of force forward on the left, with ripples spreading off it (Summon: 400 Barrier). It has a core light and smokestack shoulders. |
| Crystal Sentinel | Diagonal, collapsing to one knee | Its shoulder breaks into shards that stream right and grow into a wall of crystal spires (Death: next creature +300 DEF). |
| Mountain Behemoth | Wide four-legged beast | A horned quadruped carrying a snow-capped mountain range on its back, with glow lines running into the ground at both sides (others +150 DEF). |
| Worldbreaker Titan | Low angle, hunched and filling the frame | A horned titan with both fists driven into the ground. Cracks radiate out, a shockwave arcs behind it and rocks fly off (Summon: destroy creatures with 300 DEF or less). |
| Battle Colossus | Horizontal wreck plus a diagonal blade | A fallen war-machine sprawled on the ground, raising its blazing greatsword up and to the right, held out for the next creature (Death: next creature +400 ATK). |
| Ancient Titan | Close-up head and shoulders | A heavy-browed old giant with a long bearded face and runes on its brow and shoulders. Two glowing rune tablets rise beside it (Summon: draw up to 2). |
| Arcane Automaton | Small round clockwork on bent legs | A round body with a glowing core and a big gear behind it, wind-up key, dome head. It reaches up for a fresh glowing card (Dawn: draw when the hand is low). |
| Tempest Giant | No legs, a torso rising from a cloud | A storm giant rising out of billowing cloud. Its hair streams back, one hand holds lightning and the other sends a gale that tears armour plates away (enemies −200 DEF). |

## card_art.py (all 75, `/tmp/claude-0/draw-giants-all`)

All nine pass every window: kept 1.00, clip 0.00 to 0.01, off within limits, and the smallest area is 0.215 (Arcane Automaton). The only flags left are `noise` at board-390 and board-360, which the brief allows: Ancient Titan, Battle Colossus, Crystal Sentinel and Iron Golem.

- **Worst sep:** Battle Colossus 1.63 at board-390. Next lowest are Ancient Titan 1.69 at board-390 and Worldbreaker Titan 1.75.
- **Nearest twin:** Stone Guardian to Tidewall, 0.473. All nine are below 0.48, and no twin pairs remain across the set.

| Card | min sep | nearest twin |
|---|---|---|
| Stone Guardian | 1.80 | Tidewall 0.473 |
| Iron Golem | 2.10 | Stone Guardian 0.434 |
| Crystal Sentinel | 2.70 | Tide Serpent 0.399 |
| Mountain Behemoth | 1.83 | Abyssal Kraken 0.423 |
| Worldbreaker Titan | 1.75 | Barrier 0.437 |
| Battle Colossus | 1.63 | Dawn Acolyte 0.409 |
| Ancient Titan | 1.69 | Tempest Giant 0.407 |
| Arcane Automaton | 1.89 | Ember Core 0.455 |
| Tempest Giant | 1.79 | Mossback Tortoise 0.465 |

Notes: the neutral scenes have a dark blue sky, so the two neutral cards first had sep below 1.6. Glow bands along their outer contours (the shoulders, the wreck's top edge, the sword arm) and a bright flare blade fixed this. The first Crystal Sentinel drawing tripped `noise` at the 105×79 board, so I took out its facet lines and the trail of small shards.
