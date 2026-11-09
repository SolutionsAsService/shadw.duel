# Drawn: spells-trick (`scripts/art-plates/spells-trick.cjs`)

Ten spells in carved glass. Previews: `/tmp/claude-0/plates-trick/sheet.png`; full set: `/tmp/claude-0/plates-trick-all/`.

| Card | What it shows | Key light / layout | Min sep (window) | Nearest twin |
|---|---|---|---|---|
| Draw Two | Two big gilt cards fly up out of a deck (low right) toward the sun | sun upper left, diagonal from lower right to upper left | 1.82 (board-360) | Meteor 0.45 |
| Quick Draw | One card snatched up by a wide gust that sweeps in from the lower right; dashed empty creature slots on the ground (no creatures: draw again) | sun upper right, gust from lower right to the card at upper left | 1.74 (board) | Riptide 0.38 |
| Arcane Insight | A scrying orb with an open eye on a bronze claw stand, beaming three small cards out in a fan | orb is the key light, left third | 1.75 (board-360) | Ember Core 0.41 |
| Dark Bargain | A shadow claw from the corner squeezes a glowing heart; blood drips onto two cards (life paid for cards) | heart is the burst centre | 1.63 (inspect) | Void Collapse 0.53 |
| Windstep | A winged boot mid-stride launching up and right on a gust trail (attack at once) | sun upper centre-left, boot right third | 2.10 (board-360) | Second Wind 0.39 |
| Undertow | A whirlpool and two wave arms wrap and drag a big horned foe (the strongest enemy) under | moon upper right, sea horizon | 1.84 (inspect) | Lord of the Void 0.39 |
| Wither | A big withered rose; its pale thorned vine coils a foe whose sword droops; teal life drains up the vine | moon upper right, rose upper left | 1.68 (board-390) | Lord of the Void 0.42 |
| Riptide | A spiral current sweeps across the ground, knocking three foes off their feet and tearing their gold shields away (DEF down) | light low left on the horizon | 2.30 (board-360) | Quick Draw 0.38 |
| Landslide | Faceted boulders tumble from a cliff on the right, crushing a beast and a soldier at lower left | sun upper centre, amber/wine sky | 1.97 (board-360) | Gale Harpy 0.39 |
| Turning Gale | A banded tornado on the left third hurls a foe, tumbling, in a gust curl | sun right, funnel left | 2.00 (board) | Battle Rage 0.48 |

Worst sep: **Dark Bargain 1.63** (inspect). Nearest twin across all 75 cards: **Dark Bargain / Void Collapse 0.53**.
All 10 pass: sep >= 1.6, area >= 0.13, kept 1.00, clip 0.00 in every window. Each card's body is under 11 KB, at most 11.2 KB (Dark Bargain).
Remaining non-gating flags: the `noise` limit at board-390/360 on Draw Two (0.975) and Riptide (0.979). The style relaxes it, but these two still trip the 0.95 setting. The `hue` limit flags Dark Bargain (red heart against shadow violet).
