# R1 Flow (Csikszentmihalyi, Flow)

Verdict: OBJECT

**Good, expand it.** *Flow* ch. 3 ("clear goals and feedback"): the set is legible. ATK against DEF settles at once, the seven keywords each do one visible thing, and element identity tells you what a card is for. Cost-graded stats (1-cost 250-500 ATK up to 8-cost 1550) give an even ramp of challenge across turns. New cards: one effect, deterministic target, result visible the same turn.

**Where flow breaks.**
1. *The paradox of control* (ch. 3: enjoyment needs a felt *possibility* of control). 0 of 19 spells touch the board. Against Worldbreaker Titan (65%, top card) the only answer is combat you may lose: the anxiety zone of the flow-channel figure (ch. 4).
2. *Challenge matched to skill* (ch. 4). First seat wins 72.3%. Seat outweighs skill: the leader drifts to boredom, the trailer to anxiety.
3. Early turns give no real choice. The 2-cost slots sit at the bottom (Battle Rage 39, Stone Guardian 41, Cinder Wolf 42, Shadow Stalker 42), and 7 spells are just "damage to face". One goal, rarely in doubt (ch. 3, goals).

**Requested changes (max 3, existing systems only):**
1. **Answers on the board.** Water spell, 4: "Destroy the non-Ward enemy creature with the highest ATK, if its ATK is 1100 or less" (destroyMonster). Shadow spell, 3: "The non-Ward enemy creature with the highest ATK loses 500 ATK/DEF until its next turn" (tempAtk/tempDef). Gives water its first spell. *Measure:* the top card's win rate falls from 65% to 60% or lower, and the spread between the top and bottom card win rates (now 39-65) narrows to 15 points or less.
2. **Catch-up for the trailing seat.** Light spell, 2: "Draw 1; if your opponent controls more creatures than you, draw 2 instead". Wind spell, 3: "Deal 400; if your life is lower than your opponent's, deal 800". *Measure:* first-seat wins fall from 72.3% to 62% or lower over 400 matches, with mean turns staying between 17 and 23.
3. **Make the 2-cost choice real.** Change Battle Rage to "Your creatures gain +300 ATK until your next turn" (positive tempAtk on the field); it competes with summoning on turns 2-3. *Measure:* Battle Rage's win rate rises to 45% or higher, and no 2-cost card stays below 43%.

Caveat: the greedy bot undervalues conditional cards; confirm item 2 in 3 human duels.
