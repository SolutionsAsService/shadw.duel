# Drawn: spells-trick (GDADA run 2, R2)

File: `scripts/art-subjects/spells-trick.cjs` (10 spells). Each one is drawn as an event on a diagonal, not as a badge in a ring.

| Card | Text | What the picture shows |
|---|---|---|
| Draw Two | Draw 2 cards. | A deck on the ground at lower left. Two cards arc up along dashed trails into an open hand that reaches in from the top right. |
| Quick Draw | Draw a card; if you control no creatures, draw another. | A hooded rogue in a low lunge, cloak flaring, flicks one card out with a second right behind it. Motion streaks run off the arm. |
| Arcane Insight | Draw 3 cards. | A lashed eye opens in the dark at upper left, with a slit pupil and a heavy metal lid. Three cards, each larger than the last, pour down its gaze toward the lower right. |
| Dark Bargain | Lose 300 LP, draw 2. | A bleeding hand rises from the lower left with blood drops falling from it. A cowled shadow with glowing eyes reaches down from the upper right and pays it two cards with a clawed hand. |
| Windstep | Creatures can attack the turn they are summoned. | A spearman bursts out of a glowing summoning rune at a full run, leaning into a charge with wind ribbons behind him. |
| Undertow | Destroy the highest-ATK enemy. | A horned beast is half sunk in a whirlpool, with water tendrils coiled round it. One claw still reaches for the sky. |
| Wither | Highest-ATK enemy loses 500 ATK/DEF. | A shadow wraith at upper left drains a kneeling, hunched warrior. Its blade is snapped (the shard and hilt lie on the ground), its shield is cracked, and flakes blow off it. |
| Riptide | Enemies lose 300 DEF. | A rip current sweeps the line. One enemy is knocked flat backward, another clutches a shield, and a third shield is torn away into the air. |
| Landslide | Destroy every enemy with 500 DEF or less. | Boulders roll down a slope from the upper right. One enemy, buried to the waist, throws its arms up, and another's hand sticks out of the rubble. |
| Turning Gale | 400 damage, or 800 if you have less life. | A twisting gale rises from the caster's cracked heart at lower left (low life feeds it). It hurls a tumbling enemy high to the upper right, with debris flying. |

## card_art.py (all 75 previewed, `/tmp/claude-0/draw-spells-trick-all`)

- My cards pass every check in every window: `kept` 1.00, `area` 0.20 to 0.38, `clip` 0.00 to 0.04, and `off` 0.09 or less.
- The worst `sep` is 1.69 (Riptide, board-390). Draw Two is next at 1.71 (board-360).
- The nearest twin is Arcane Insight to Deep Sea Leviathan at 0.559. There are 0 twin pairs at or above 0.80 across the set.
- Some cards still have `noise` flags, but only at the two smallest boards (board-390 and board-360): Arcane Insight, Draw Two, Riptide, Turning Gale, Undertow and Windstep.
- Fixed along the way:
  - Dark Bargain's arms ran off the frame (`clip` 0.18). I pulled them inside it.
  - Landslide's `sep` was 1.46. I gave the slope lit flesh and a glow edge.
  - Windstep, Turning Gale and Undertow had `noise` at hand and board sizes. I replaced the thin lines with fewer, bolder shapes.
- Size: each subject is 1.3 to 3.5 KB of markup.
- In the last run, card_art reported 74 cards, not 75. All 10 of my cards render, so another module probably failed to render a card in preview.
