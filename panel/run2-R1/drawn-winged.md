# Drawn: winged.cjs (3 dragons, 5 birds)

File: `scripts/art-subjects/winged.cjs`. Every subject is under 3,000 characters and uses integer path data.

| Card | What the picture shows |
|---|---|
| Ember Whelp | A small, round, chibi whelp mid-hop. It has a big head, a large shiny eye, a grin, stubby horns, raised wings, a curled flame-tipped tail and one paw up. A glowing ember heart with a star in its chest, and embers flying off it, show the 200 damage it deals when it dies. |
| Ashen Dragon | A huge dragon crouched in profile and filling the frame. It has a raised bat wing with finger bones, metal swept-back horns, neck spines, and its jaws open with teeth showing. A jet of fire pours from its mouth onto a small dark enemy below, which burns. |
| Storm Drake | A serpentine drake whose body coils in an S, with a tail fin, small swept wings, antler-like metal horns and a clawed foreleg. Three white lightning bolts crackle out around it. |
| Pyre Phoenix | A tilted phoenix bursting upward from a glowing ash mound. Its wings are flung wide in flame-shaped feathers, it has a flame crest, and its tail flames still trail into the embers. |
| Wind Falcon | A falcon in profile gliding low and fast, with its far wing raised, its near wing swept down, a fanned tail and speed lines. It grips a card in its talons, showing that it draws a card when it attacks directly. |
| Sky Hunter | A falcon in a steep stoop, drawn diagonally, with its wings tucked and talons forward. Below it is a struck prey (a burst and scattered feathers), and a curved arrow loops from the impact back up into the sky, showing it attacks again. |
| Sky Sovereign | A huge crowned eagle seen from the front, with a metal crown and gem and wings spanning almost the full frame. Two small flock birds are lifted back into the air beside it on dotted rally paths. |
| Gale Harpy | A harpy perched on a crag with a wing-arm swept back, hair streaming and her head thrust forward with her beak open. Shriek rings roll out from her mouth with up-arrows (+ATK), and a small flock bird is boosted beneath them. |

The dragon silhouettes differ: a small round hopper, a huge crouched profile with a raised wing and a fire jet, and a thin S-coil. The bird silhouettes also differ: a horizontal glider, a diagonal teardrop stoop, and a front-facing crowned bird with a full-width spread. The harpy is a perched upright figure.

## card_art.py (all 75, `/tmp/claude-0/draw-winged-all`)

All 8 cards pass in every window: kept 1.00, clip 0.00, off <= 0.033, area >= 0.188 (Sky Hunter at board-360).

| Card | Worst sep | Nearest twin |
|---|---|---|
| Ember Whelp | 2.10 | Healing Potion 0.461 |
| Ashen Dragon | 1.79 (board-360) | Tempest Giant 0.414 |
| Storm Drake | 2.49 | Void Hound 0.415 |
| Pyre Phoenix | 2.38 | Battle Colossus 0.408 |
| Wind Falcon | 2.12 | Draw Two 0.424 |
| Sky Hunter | 2.93 | Cinder Wolf 0.368 |
| Sky Sovereign | 2.08 | Stone Guardian 0.389 |
| Gale Harpy | 2.44 | Dawn Acolyte 0.490 |

- Worst `sep` overall: Ashen Dragon, 1.79 at board-360.
- Nearest twin overall: Gale Harpy with Dawn Acolyte, 0.490. There are 0 twin pairs across the set.
- `noise` flags remain only at board-390 and board-360. The earlier noise flags on Sky Hunter and Storm Drake at hand and board were removed by cutting fine interior lines and strokes.
