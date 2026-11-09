# Drawn: relics (`scripts/art-plates/relics.cjs`)

Each relic is the figure (`data-figure`): the object, the mount it sits on, and the power it sends out. It powers a
black woodcut creature of its element, which has one coloured pane and gold gouges on the side facing the relic. The
burst is centred on the relic every time. The relic's position changes from card to card.

| Card | What it shows | Layout | Worst sep | Nearest twin (board-360) |
|---|---|---|---|---|
| Ember Core | A molten core with glowing cracks, sitting in a bronze tripod brazier with flame tongues. Its fire streams into a cinder wolf, who howls with its mane alight (+ATK to flame creatures). | relic left third, wolf lower right | 2.1 | Lantern Bearer 0.53 |
| Crystal Heart | A faceted heart crystal held in the prongs of a rock spire. Its teal beam falls on a stone golem's raised shield (+DEF to earth creatures). | relic upper right, golem lower left | 1.7 | Brine Witch 0.52 |
| Void Shard | A jagged pearl and violet shard driven point first into a cracked altar slab, shown in perspective. Ruby void smoke feeds a void hound leaping right (+ATK to shadow creatures). | relic left, hound right | 1.7 | Ember Core 0.50 |
| Tidestone | A carved sea stone with a spiral groove, resting in a half-open clam on a surf rock. Its tide ribbon reaches a sea serpent rising from the waves, with a ward ring around its neck (+DEF to water creatures). | relic lower right, serpent left | 1.7 | Flame Burst 0.48 |
| Storm Feather | A great pearl and teal feather wedged quill first into a crag and bound with gold. A bolt from its tip charges a falcon diving through it (+ATK to wind creatures). | feather on the diagonal, lower left to upper right, falcon right | 1.8 | War Banner 0.47 |
| Sun Sigil | A gold sun sigil in perspective, set into the face of an ivory standing stone. Its beam lights the raised sword of a kneeling knight (+ATK and +DEF to light creatures). | relic right, knight left | 1.8 | Barrier 0.45 |
| War Banner | A ruby swallowtail banner with a gold chevron on a pole wedged in a stone cairn. It streams over three armed fighters with raised blades (+ATK and +DEF to all creatures). | pole diagonal from lower left, cloth upper right | 2.1 | Void Collapse 0.52 |

- **All windows pass** for all 7 cards: sep >= 1.7, area 0.14-0.22, kept 1.00, clip 0.00. No hue outliers.
- **Worst sep:** 1.7 (Crystal Heart, Void Shard and Tidestone, each in one window).
- **Nearest twin overall:** Lantern Bearer ~ Ember Core, 0.53.
- **File sizes:** 9.3-10.5 KB per SVG, including the wrapper.
