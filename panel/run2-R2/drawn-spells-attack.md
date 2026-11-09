# Drawn: spells-attack (GDADA run 2, R2)

File: `scripts/art-subjects/spells-attack.cjs` (nine damage spells). Each is a different event with a different
source, direction and camera, and each has a target or a victim in the frame. There are no centred rings or badges.

| Card | Source and angle | What the picture shows (card text) |
| --- | --- | --- |
| Fireball | A ball streaking down from the upper right, long diagonal | A figure runs from it with an arm raised. A flame salamander on a rock flares as the ball passes ("your flame creatures gain +100 ATK"). |
| Flame Burst | Fire bursting up from the ground, low angle | A horned flame imp slams its fists into the ground. A glowing crack runs to a pillar of fire, and a foe's black silhouette stands inside it with its sword flung away ("1000 if you control a flame creature"). |
| Spark | A horizontal arc between two points, mid distance | A caster's staff tip arcs to a foe's spear. A gust lifts a card into the air ("wind creature: draw a card"). |
| Lightning Strike | A bolt from a storm cloud filling the top, near vertical | One bolt strikes the crowned rival duelist (damage "directly to your opponent"). A card drops out of the cloud ("draw 1 card"). |
| Meteor | A falling stone seen from the ground, steep from the upper left | A cracked boulder with a comet sheath falls toward a blast flash. Two weak horned foes topple, and one under a ward dome holds ("destroy every enemy without Ward with 200 DEF or less"). |
| Void Bolt | A black lance thrown from a foreground hand (close-up) | The lance flies at a distant foe. Void cracks and smoke run back up the caster's own arm ("200 to yourself"). |
| Void Collapse | The ground collapsing, side section | The ground breaks into a V-shaped sinkhole. Slabs tip inward and a foe falls in. Your own shield on the lip cracks ("your creatures lose 200 DEF"). |
| Scorch | A single tongue of flame on a victim, close and low | A thin tongue curls in from the left and wraps the weakest foe, a small creature cowering behind a cracked buckler ("lowest-DEF enemy, DEF 400 or less"). |
| Battle Rage | A warrior's rage, low-angle hero shot | A newly summoned warrior bursts up from the summoning glyph. It roars with its axe swung back, and flames rise off its arms ("next summoned creature gains +300 ATK permanently"). |

Each subject is about 2,100-3,000 characters, with integer path data and only the kit and allowed tags.

## card_art.py (all 75 rendered, `/tmp/claude-0/draw-spells-attack-all`)

- All nine pass in every window. The only flags left are `noise` at board-390 and board-360 (Fireball, Meteor,
  Scorch, Void Bolt), which the brief allows.
- Worst `sep`: Void Collapse 1.60 (board-390). Next are Scorch 1.61 and Flame Burst 1.65. All others are 1.71 or
  higher.
- Worst `off`: Scorch 0.113. `kept` is 1.00 everywhere and the largest `clip` is 0.02.
- Twins: there are no twin pairs at or above 0.80 in the set. The nearest twin of each of my cards is: Spark and
  Ember Core 0.466; Fireball and Riptide 0.453; Flame Burst and War Banner 0.453; Void Collapse and Riptide 0.435;
  Scorch and Nightblade 0.431; Void Bolt and Ember Core 0.431; Battle Rage and Dread Reaper 0.422; Lightning Strike
  and Sun Sigil 0.396; Meteor and Crystal Sentinel 0.378.
