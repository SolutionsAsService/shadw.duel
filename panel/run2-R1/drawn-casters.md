# Drawn: casters (scripts/art-subjects/casters.cjs)

Eight cards redrawn. Each has its own silhouette. There are no hooded triangles now: Acolyte, Nightblade, Reaper and Witch used to share one wizard shape, and each now has its own pose. Each subject is 2.0-2.8 KB.

| Card | Silhouette / composition | Ability shown |
|---|---|---|
| Dawn Acolyte | Small kneeling figure in profile, low-left. Robe pools on the ground and a braid falls down her back. Both sleeved arms reach up. | Death: she lets go of her lamp of light, which rises up-right while motes drift off her robe hem. |
| Nightblade | Wide lunging stride with a cape and scarf flaring right. Masked face, dagger held in reverse. | Kill: draw. A glowing card flips up into the raised off hand. |
| Dread Reaper | Bare skull with a bone crown, no hood. Visible ribcage, floating tattered robe, torn cloak streaming left. | Kill: +ATK. The scythe sweeps through the top of the frame with a glowing motion arc. |
| Brine Witch | Hunched crone with a big rounded back, seaweed hair and a fringed shawl. One hand claws over a cauldron and the other holds a driftwood staff with a glowing orb. | Dawn curse: a hex rises from the cauldron and cracks a shield (DEF loss). |
| Frost Siren | S-curve mermaid sitting on a rock. Hair streams behind her and she holds a shell to her chest. Her arm is thrust out right. | Attack: rings of freezing song hit a cracked shield, with ice shards. |
| River Sprite | Hovers with four dragonfly wings, so the silhouette is wide and X-shaped. Leaf hair, tucked legs. | Dawn heal: she tips a leaf cup and a stream of water falls into ripples on the ground. |
| Shadow Stalker | Panther-like shade leaping on a diagonal from lower-left to upper-right, claws first, tail whipping. | Direct attack: it bursts out of its shadow pool, hind legs still in the pool. |
| Lord of the Void | Low-angle close-up bust filling the frame: big curved horns, a crown, three eyes, a fanged mouth, heavy pauldrons, and a dashed Ward ring behind him. | Summon: his raised claw drags the foes' cracked shields down on void tendrils. |

## card_art.py (all 75 rendered to /tmp/claude-0/draw-casters-all)

| Card | min sep | min area | max clip | max off | nearest twin |
|---|---|---|---|---|---|
| Dawn Acolyte | 1.67 | .19 | .00 | .01 | Gale Harpy 0.490 |
| Nightblade | 1.65 | .22 | .00 | .02 | Storm Feather 0.429 |
| Dread Reaper | 2.39 | .27 | .00 | .05 | Radiant Knight 0.426 |
| Brine Witch | 1.71 | .23 | .00 | .06 | Tidewall 0.422 |
| Frost Siren | 2.05 | .29 | .00 | .04 | Gale Harpy 0.465 |
| River Sprite | 2.46 | .21 | .00 | .05 | Lightning Strike 0.397 |
| Shadow Stalker | 1.88 | .17 | .00 | .04 | Sun Sigil 0.351 |
| Lord of the Void | 1.72 | .35 | .00 | .05 | Abyssal Kraken 0.390 |

- kept is 1.00 for all eight cards in every window.
- The worst sep is 1.65 (Nightblade).
- The nearest twin is 0.49 (Dawn Acolyte and Gale Harpy).
- There are no twin pairs at board-360.
- The only flags left are `noise` at board-390 and board-360, which the brief allows:
  - Acolyte at board-360 only (0.61).
  - Siren (0.70 and 0.73).
  - Sprite (0.67 and 0.69).
- Frost Siren still gets the build's 1.2x `enlarge`. I drew it with that scaling in mind.
