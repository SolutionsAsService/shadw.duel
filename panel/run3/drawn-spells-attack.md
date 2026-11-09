# Drawn: scripts/art-plates/spells-attack.cjs

Eight attack spells in carved glass. Each one has a different source, angle and silhouette, so none is a round fireball with a ring. Checked with `card_art.py` over all 75 cards (`/tmp/claude-0/plates-attack-all`). No card has a flag, and the sheet is at `/tmp/claude-0/plates-attack/sheet.png`.

| Card | What it shows | Layout | min sep | min area | nearest twin |
|---|---|---|---|---|---|
| Flame Burst | A fan of flame tongues erupts from the ground and hurls back a foe holding up a gold shield (it deals damage). | Burst on the horizon, right third. Vertical fan. | 1.92 | .16 | Void Hound .51 |
| Spark | A pearl hand flicks a zigzag spark up to a four-point white and gold star, with small sparklets (a small damage spell). | Burst high on the left. Diagonal from the lower right to the upper left. Wind palette. | 2.76 | .14 | Draw Two .42 |
| Lightning Strike | A forked Z-bolt drops down the left third and throws a foe with a violet shield off his feet. | Burst at the strike point on the lower left. Near-vertical. | 2.34 | .16 | Battle Rage .46 |
| Meteor | A faceted burning rock with a wide tail dives from the upper left onto a small crowd on the right horizon (it destroys weak enemies). | Burst at the impact on the lower right. Rock and tail go from the upper left to the lower right. | 1.76 | .15 | Deep Sea Leviathan .50 |
| Void Bolt | A long violet and pearl void spear flies left. A ruby backlash curls back into the hooded caster (900 to the foe, 200 to yourself). | Burst at the spearhead, left. Horizontal. | 1.66 | .14 | Deep Sea Leviathan .43 |
| Void Collapse | A tilted accretion disc with a black core swallows the sky. Shards from your own guard's cracking teal shield are pulled in (your creatures lose DEF). | Lens-shaped disc on the upper right. Small guard on the lower left. | 1.73 | .15 | Fireball .55 |
| Scorch | A burning-glass sunbeam slants from the sun at upper right and sets one small beast alight (it destroys the weakest enemy). | Sun at the upper right. Long wedge from the upper right to the lower left. | 1.68 | .13 | Fireball .45 |
| Battle Rage | A red gauntlet thrusts a flaming sword up. A beast silhouette waits at the horizon (the next creature you summon gains ATK). | Burst at the top centre behind the blade. Arm comes up from the lower left. | 1.78 | .17 | Tidewall .53 |

- **Worst sep:** Void Bolt at 1.66.
- **Nearest twin:** Void Collapse and Fireball at 0.55.
- **Size:** bodies are 8.2 to 11.0 KB, all at or under 11 KB.
- **Rules:** integer path data, allowed tags only, and one `data-figure` per card.
