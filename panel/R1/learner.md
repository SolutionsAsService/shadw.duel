# R1 Learner (Koster, A Theory of Fun)

Verdict: OBJECT

**What the 55 cards teach.** By my count the set holds about six patterns, not 55.
- Spells: "pay energy, change a number" (19 cards). The 7 damage spells, 4-5 heals and 5 draws are three patterns with sizes attached, and a player learns all three in one game. No spell reads the board (0 of 19), so a spell never asks "when?" or "at what?". It only asks "can I afford it?", and the greedy bot answering by cost shows how little choosing that takes.
- Monsters: comparing ATK against DEF, Guard picking the target (12 cards), and Swift beating summoning sickness (9). These are real patterns, but each is learned by turn 5 and then repeats. Ten 2-8 cost guards differ only in size.
- Relics: "+ATK/DEF to an element" is one pattern. Adding four more relics would only reskin it. VISION asks for them, but they teach nothing new.

**Where the set is good.** The board layer, where Debuff, Ward and tempAtk/tempDef create a timing window ("until their next turn") and a counter (Ward). That pattern is still unsolved after one game, but only 3 Debuff cards carry it at 100 points each. The set should expand there and add no more face numbers.

**Requested changes (max 3, each a new pattern from existing systems)**
1. **Shadow spell, 3 cost: destroy the non-Ward enemy creature with the highest ATK** (destroyMonster, deterministic pick). New pattern: answering a creature without combat. It also makes Ward a choice you can read. Measure: Worldbreaker Titan (65%) and Sky Sovereign (57%) move toward 50-55%; Ward monsters' win rate rises; the card lands in 30-70%.
2. **Wind spell, 2 cost: non-Ward enemy creatures get -400 DEF until their next turn** (tempDef). New pattern: sequencing, where you cast it and then attack through a wall the same turn. Measure: in card-stats, count the attacks after the cast that destroy a defender they would have lost to without it. The target is at least 1 per cast in the median. Caveat: this needs a bot that casts before attacking. If the bot casts by cost, the number reads as zero, and that zero is a bot limit, not a card verdict.
3. **Water spell, 2 cost: your creatures get +500 DEF until your next turn** (tempDef on your own side, which lasts through the opponent's turn). New pattern: a defensive bluff and hold-back, which fits "water holds" and fills water's zero-spell gap. Measure: the number of enemy attacks per cast that bounce off a buffed defender. The target is above 0.5.

**Not asked:** no new "deal N" or "draw N" spells, and no new guard sizes. They would be reskins.

**Why OBJECT, not ANDON.** Nothing is broken. The set has played out its patterns, and the answer is fixable within the frozen rules.
