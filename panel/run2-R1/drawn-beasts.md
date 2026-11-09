# Drawn: beasts (scripts/art-subjects/beasts.cjs)

| Card | What the picture shows (pose, how the ability reads) | Min sep | Nearest twin |
|---|---|---|---|
| Cinder Wolf | A diagonal lunge up and to the right. The jaws are open with teeth, the forepaw claws reach out, and the hind leg pushes off. A flame mane runs along the back and the tail streams fire, with speed streaks behind. This is the burning lunge (+150 ATK on attack). | 2.01 | Mossback Tortoise 0.43 |
| Void Hound | Seated, side-on, howling straight up with a long open muzzle and swept-back ears. The hindquarters break up into void smoke puffs that drift up to the left, and smoke curls rise from the howl. This is the Death burst. It does not share a silhouette with the Wolf (seated and vertical against a horizontal lunge). | 1.85 | Celestial Guardian 0.42 |
| Flame Serpent | Coiled three times around a tilted armoured knight (helm, plume, tower body). Each coil has a burning belly stripe and flame frills, and the crested head strikes down at the helm. This shows the constricting, burning kill. | 1.69 | Radiant Knight 0.46 |
| Tide Serpent | An upright guarding wyrm rising in an S from the water. It has flared dorsal fins and a head crest, and faces a tall curling wall of water it has raised (the +200 DEF summon). It differs from the Flame Serpent: vertical, not coiled, guarding, no victim. | 2.29 | Mossback Tortoise 0.49 |
| Deep Sea Leviathan | A huge spined body arches from the upper left and dives to the lower right. Its jaws are clamped on a small flailing enemy it drags under, with rising bubbles and down-drag streaks. This is the Death drag. | 2.50 | Arcane Insight 0.44 |
| Abyssal Kraken | A close-up mantle with heavy-lidded eyes. Three tentacles slam down and two curl around small enemies on either side, crushing them (impact stars). This is the summon wipe of weak enemies. The suckers are a dotted highlight. | 1.72 | Barrier 0.43 |
| Mossback Tortoise | Dying, with its head bowed to the ground and eye closed. It has a mossy domed shell with a sapling, and curved stumpy legs with claws. A dashed glowing shelter dome spreads from the shell over two small allies. This is the Death +300 DEF to others. | 2.00 | Celestial Guardian 0.49 |
| Gloom Mite | A bloated tick seen at an angle, with jointed legs, horned mandibles, and a cracked, bursting abdomen. Gloom drops spray up and two dotted drain streams run out to stars. This is the drain tick: −150 LP to the opponent, +150 restored. | 2.08 | Tidewall 0.43 |

## card_art.py results

All 75 cards were run through card_art.py (`/tmp/claude-0/draw-beasts-all`). Every card passes in every window:
- area ≥ 0.24
- kept 1.00
- clip ≤ 0.02
- off ≤ 0.07

Flags:
- **Twins:** none. There are no twin pairs at board-360.
- **Noise:** the only flags left are `noise` at board-390/360, on Mossback Tortoise and Tide Serpent. The brief allows these.

Worst values:
- **Worst sep:** 1.69 (Flame Serpent, inspect).
- **Nearest twin:** Tide Serpent ↔ Mossback Tortoise at 0.49.

The largest subject is under 3,500 characters (Flame Serpent, 3,458).
