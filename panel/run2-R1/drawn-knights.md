# Drawn: knights.cjs

File: `scripts/art-subjects/knights.cjs`. It has a local `limb()` helper that builds tapered, jointed limbs (shoulder, elbow, wrist / hip, knee, ankle) as smooth closed shapes. No stick limbs. Every humanoid has a different pose and costume.

| Card | What the picture shows |
|---|---|
| Inferno Knight | Heavy spiked plate in a wide, planted stance (low-angle hero framing). His right arm is raised with a burning blade that breaks the top of the frame. His left gauntlet grips a pole flying a flame-shaped banner. Flame crest on the great helm. **Ability:** he raises the burning banner and blade to rally the flame line. |
| Radiant Knight | Kneels on one knee (low, wide silhouette), with a cape behind and a kite shield planted at the left. He holds up an open gauntlet with a radiant star-sigil in a dashed ring above it, and a trail of motes drifts right toward "the next creature". Winged helm crest and halo. **Ability:** a blessing passed forward. |
| Ironclad Mercenary | Lean sellsword in studded leather (brigandine bands, one pauldron, mail coif, nasal helm), standing at the right of the frame with the weight on one leg. One hand rests on a bearded axe. The other tips out a purse, and coins fall onto a pile on the ground. A card is tucked in his belt. **Ability:** draw a card, paid in coin. |
| Wandering Duelist | A deep diagonal fencing lunge across the frame: back leg straight, front knee bent, coat-tails and scarf flaring behind. A wide-brim hat with a plume. The rapier and its swept hilt drive out past the right edge, and the free arm is raised for balance. Speed lines behind him. **Ability:** attack lunge. |
| Sunblade Angel | The striking angel: dives from the upper left toward the lower right with its wings swept back. Both hands drive a sun-blade down, and light bursts at the point. **Ability:** the kill, then the healing flash. |
| Celestial Guardian | The shielding angel: frontal and symmetrical. Great wings rise from the shoulders and fold forward and down into a closed shield in front of the body. The hands rest on a grounded sword's pommel, there is a halo, and a dashed barrier dome covers everything. **Ability:** Dawn Barrier. |
| Lantern Bearer | A small hooded pilgrim with a pack, walking left. He holds a crook-staff with the lantern hung out ahead, and its light falls as a pool on the ground. **Ability:** lantern light that heals. |

How the knights differ: plate + banner (standing) / plate + shield (kneeling) / leather + axe + purse (contrapposto) / coat + rapier (lunge). How the angels differ: a diagonal dive with a blade, against a frontal stance with wings folded as a shield.

## card_art.py numbers

All seven cards pass in every window: kept 1.00, area >= 0.20, clip <= 0.05, off <= 0.11. The only `noise` flags are at board-390 and board-360 (allowed).

- **Worst sep:** Ironclad Mercenary, 1.72 (board-390 and board-360). Every other card is >= 1.75.
- **Nearest twin:** Radiant Knight and Arcane Insight, 0.474. There are no twin pairs at board-360.
- Other nearest twins: Celestial Guardian and Tempest Giant 0.435, Lantern Bearer and Stone Guardian 0.439, Wandering Duelist and Radiant Knight 0.438, Ironclad Mercenary and Minor Restoration 0.394, Inferno Knight and Tempest Giant 0.37, Sunblade Angel and Pyre Phoenix 0.361.
- **Markup:** each subject is about 1.7 to 3.6 KB.
