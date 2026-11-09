# Drawn: giants.cjs (scripts/art-plates/giants.cjs)

These are carved-glass plates built with the glass.cjs helpers (defs, burst, hatch, offset, frame, Ink). The file adds a few local helpers: `scene` for the burst and ground waves, `sil` for the silhouette under-pass, `panes`, and `foe`, which draws a small black woodcut figure. The nine cards used to look alike. Each now has its own body plan: a block statue, a crouched ape-shape, a tall spiky crystal, a horizontal quadruped, a hunched diagonal, a striding sword-bearer, a seated profile, a gear disc on stilts, and an inverted funnel.

| Card | What it shows | Layout | worst sep | nearest twin |
|---|---|---|---|---|
| Stone Guardian | A stone sentinel on a plinth with a spear, braced behind a tower shield built in courses of stone. The low dawn sun gilds the top course, and new stone chips fly in to join the shield (Dawn: +50 DEF for good; guard). | dawn sun low on the right horizon, statue on the left third | 2.08 (board) | Ember Core 0.47 |
| Iron Golem | A squat iron construct crouched on huge fists. As it lands, an arc of gold and ivory barrier panes forms over it (Summon: 400 Barrier; heavy armour). | sun upper left, golem on the right third | 1.86 (board-360) | Gloom Mite 0.52 |
| Crystal Sentinel | A tall faceted crystal knight with a spiked crown and a crystal halberd, inside a dashed ward ring. Shards break from its hip and fly to a kneeling ally, who raises a new crystal shield (ward; Death: next creature +300 DEF). | burst mid-left, sentinel on the right third | 1.78 (board-360) | Ironclad Mercenary 0.44 |
| Mountain Behemoth | A walking mountain: a horned, tusked beast with snow-capped peaks on its back. It leads two small allies with gold shields (Summon: other creatures +150 DEF). | sun upper right by the head, wide horizontal body | 1.76 (board-360) | Void Hound 0.45 |
| Worldbreaker Titan | A hunched rock titan with lava veins. One fist drives into the ground and splits it with lava cracks, and three small creatures and debris are flung away (Summon: destroy every creature with 300 DEF or less). | burst at the impact low right, titan upper left, diagonal | 1.84 (board-390) | Ancient Titan 0.50 |
| Battle Colossus | A steel war-construct in mid-stride, swinging a ruby-burning greatsword from corner to corner, with a small foe at the right. The glowing blade stands for the +400 ATK it passes on when it dies. | sun right of centre behind the blade, colossus on the left third | 2.40 (hand) | Battle Rage 0.45 |
| Ancient Titan | A crowned, white-bearded elder giant sits in profile and reads a stone tablet of runes. Two cards rise from it toward the sun, and two small allies stand before him (Summon: draw 1 per other creature). | sun upper right, seated figure on the left | 1.82 (inspect, board-360) | Lord of the Void 0.57 |
| Arcane Automaton | A small clockwork walker with a great bronze gear on its back and an arcane core in its chest. It holds out a freshly drawn card, and the card is the key light (Dawn: draw if you hold 2 or fewer cards; ward). | burst at the card upper left, automaton on the right third | 2.03 (inspect) | Cinder Wolf 0.49 |
| Tempest Giant | A storm giant with a cloud for hair and a twisting funnel below the waist. It blows a gale across the window at two foes who brace behind buckling shields (Summon: non-Ward enemies -200 DEF). | low burst left behind the foes, giant on the right third | 2.08 (inspect) | Arcane Automaton 0.43 |

Checks: I ran card_art.py with gdada.card-art.json on all 75 cards. All nine cards pass every window: kept 1.00, area at least 0.17, clip 0.00, no noise flags and no twin flags.
- **Worst sep:** Mountain Behemoth, 1.76 at board-360.
- **Nearest twin:** Ancient Titan and Lord of the Void, 0.57 (limit 0.80).
- **Size:** each card is 9.1 to 10.5 KB as a rendered SVG.
- **Frame rivets:** teal on earth cards (the guide's green accent), gold on neutral cards and violet on Tempest Giant.
- **Hue:** neutral hue readings (Ancient Titan, Arcane Automaton) move with the group mean while the other illustrators add cards. Hue is not one of the brief's guards.
- **Sep fix:** the black under-pass outline against dark glass is what lowers sep. Where a subject's far contour sat on the darkest ring (Worldbreaker Titan, Battle Colossus), I lightened that ring or widened the rings so the subject sits on mid-value glass.
