# Drawn: spells-guard (scripts/art-plates/spells-guard.cjs)

Nine guard/heal spells in the carved-glass style. Each one shows the spell happening, not a centred badge.

| Card | Element / frame | What it shows | Layout |
|---|---|---|---|
| Healing Potion | light / ruby | A round flask tips over and pours liquid light onto a kneeling, ruby-cloaked figure. The cork flies off and healing motes rise. | Flask on the upper left over dark glass. The burst is centred on the pour, low and centre. Diagonal runs upper left to lower right. |
| Minor Restoration | light / ruby | A jet of light wells up from a gold crack in the ground and bursts into spray. It lifts a single card (draw 1). | Jet on the right third, card tilted on the left. Burst at the spray, top centre. |
| Aegis | light / ruby | A raised kite shield (ivory/gold quarters, ruby boss) snaps the gold-shafted arrows striking it from the right. A star flares on the face where one hits, and motes rise. | Shield on the left third, burst behind its upper-left shoulder. |
| Barrier | light / ruby | A curved wall of ivory/gold glass catches a jagged void bolt. Cracks star out from the white impact flare, and a small figure shelters behind. | Wall on the right third, bolt from the upper left. Burst at the impact. |
| Divine Renewal | light / ruby | A dove of light dives head-first to the lower left with its wings raised in a wide V. Two small creatures below hold gilded shields (+DEF). | Dove upper right, burst at its head, creatures lower left. |
| Stone Skin | earth / teal | An arm bursts from the ground and its skin sets into bronze/ash stone plates with green seams. A gold-knuckled fist is raised, and rock shards fly. | Arm runs lower left to the fist upper right. Burst at the fist. Amber/wine sky. |
| Tidewall | water / pearl | A wave rears up as a wall with its foam crest curling. Enemy arrows break against its face, and a small teal-paned creature shelters behind. | Wave on the left third, crest at the burst (top centre-left). Arrows come from the right. |
| Second Wind | light / ruby | A great leaf (the card's icon) rides a rising gust that hooks into a curl. Beneath it, a fallen ruby-cloaked figure rises from one knee with an arm up. | Leaf upper right on the burst, figure lower left. |
| Rally Cry | neutral / gold | A banded war horn (gold/bronze/steel, ruby strap) sounds. Carved gold sound arcs fan out from the bell, and helmets and raised spears answer along the horizon. | Horn sweeps from the lower right to the bell upper left. Burst at the bell. |

## Checks (all 75 cards, `/tmp/claude-0/plates-guard-all`)

- All nine pass sep, area, kept and clip in every window.
  - kept 1.00, clip 0.00.
  - Lowest area 0.129 (Healing Potion and Rally Cry).
- **Worst `sep`: 1.82, Rally Cry (inspect).** Aegis is 1.83 at board-360 and Tidewall 1.86 at board-390. Everything else is ≥ 1.93.
- **Nearest twin: 0.528, Tidewall ~ Battle Rage.** Every other card is ≤ 0.51, and no pair is at or above 0.80.
- Hue: no outliers among these nine.
- File sizes: 9.0 to 10.9 KB per rendered SVG. Path data is integers only, and only the allowed tags are used.
- Still flagged: the relaxed `noise` reading, 0.952 to 0.986 at board-390/360 only, on Barrier, Divine Renewal, Minor Restoration, Rally Cry and Second Wind. That is the style's leading at 53 to 59 px. I cut panes and hatching to lower it, but did not chase it further.
