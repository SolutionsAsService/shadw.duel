# Drawn: spells-guard (GDADA run 2, R2)

File: `scripts/art-subjects/spells-guard.cjs` (only file edited, besides this report). Nine guard and healing spells,
redrawn as events instead of symmetric emblems in rings. None has a centred ring or halo. Figures use tapered,
jointed limbs (`limb()`, the same helper as knights.cjs).

| Card | Rules text | What the picture shows | chars |
| --- | --- | --- | --- |
| Healing Potion | Restore 800 LP | An ally's arm from the upper right tips a large flask. The draught pours down onto the gashed side of a fighter slumped on one elbow, and light motes rise from the wound. | 2.8k |
| Minor Restoration | Restore 500 LP, draw 1 | A forearm rises on a diagonal from a cuff. The cut along it closes in stitches of light, and a card flies into the open hand. | 2.7k |
| Aegis | Restore 1000 LP, 300 Barrier | A sword from the upper right crashes onto a 3/4-view kite shield, with a spark burst at the point of impact. A crouched ally shelters behind the shield, with healing motes around them. | 2.8k |
| Barrier | Absorb the next 600 damage | Three arrows slam into a curved pane of light and stop dead, each with a flare where it hits. A guard braces, unhurt, behind the pane. | 1.8k |
| Divine Renewal | Restore 1800 LP, +200 DEF | A beam falls diagonally from a break in the clouds onto a fallen warrior. The warrior stirs and lifts a hand into the light. | 1.9k |
| Stone Skin | Next summoned creature +400 DEF permanently | A horned beast claws up out of a fissure. Its hide turns to stone plates from the ground up, and the edge of the stone creeps across its flank. | 2.5k |
| Tidewall | Your creatures +400 DEF | A curling wall of sea rises in front of a small crab-knight, and a hurled spear breaks against the crest. | 2.6k |
| Second Wind | Draw 2 if outnumbered, else restore 400 LP | A gust sweeps under a fallen hero and lifts them to their feet, with an arm flung up and a cloak streaming. Leaves and two cards ride the wind. | 2.3k |
| Rally Cry | Your creatures +200 ATK | A big war-horn blower in the foreground sends sound arcs from the bell. Two figures charge behind him on the diagonal, with blazing blade tips (+ATK). | 3.3k |

## card_art.py (all 75, `/tmp/claude-0/draw-spells-guard-all`)

All nine pass in every window: no kept, area, sep, clip, off or noise flags (noise is also clear at the two smallest
boards).

| Card | worst sep | max clip | max off | nearest twin |
| --- | --- | --- | --- | --- |
| Healing Potion | 1.82 | .00 | .06 | Brine Witch .48 |
| Minor Restoration | 2.26 | .04 | .02 | Tidewall .55 |
| Aegis | 1.82 | .03 | .04 | Minor Restoration .52 |
| Barrier | 1.85 | .00 | .05 | Void Shard .50 |
| Divine Renewal | 1.80 | .07 | .07 | Draw Two .51 |
| Stone Skin | 1.80 | .04 | .07 | Pyre Phoenix .40 |
| Tidewall | 1.92 | .00 | .04 | Minor Restoration .55 |
| Second Wind | 2.39 | .00 | .02 | Draw Two .40 |
| Rally Cry | 1.90 | .01 | .02 | Quick Draw .40 |

- **Worst sep:** 1.80 (Divine Renewal and Stone Skin).
- **Nearest twin:** 0.551 (Minor Restoration and Tidewall).
- **Highest twin across all 75:** 0.559 (Deep Sea Leviathan and Arcane Insight, neither of them mine).

`build-card-art.cjs --check` loads the module without errors. It reports these cards as stale, which is expected
because `assets/` has not been rebuilt. Not committed.
