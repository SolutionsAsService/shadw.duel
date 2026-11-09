# R1 Decisions (Meier)

Verdict: OBJECT

A decision is interesting when no option is always right, the trade-off is visible, and the situation changes which option is right.

**Dominated or reskinned:**
- The seven damage spells only scale with cost, and a spell's element does nothing (relics affect creatures only). Flame Burst (750 for 3) is strictly worse than Void Bolt (900 for 3). The question is only "when", and the answer is always "now".
- Aegis (1000 life for 3) is worse than Healing Potion (800 for 1).
- Ember Whelp is worse than Wind Falcon. Cinder Wolf and Shadow Stalker are worse than Sky Hunter.
- Ancient Titan is a weaker Abyssal Kraken. Battle Colossus is Deep Sea Leviathan with no element.

**Where the set is good, so expand here:**
- Dark Bargain: life spent as a resource, at a visible cost.
- Barrier: when to play it depends on the opponent's board.
- Debuff against Ward. Nightblade and Crystal Sentinel win 54%.
- Guard against Swift: a wall or an early hit.

**The gap:** 0 of 19 spells touch the board, so VISION's "develop, answer, or burn" has no "answer".

**Requested changes (max 3):**
1. **Three board spells built on the Ward exception.**
   - Water, cost 4: destroy the non-Ward enemy creature with the highest ATK (destroyMonster).
   - Flame, cost 2: destroy the non-Ward enemy creature with the lowest DEF.
   - Wind, cost 2: non-Ward enemies get -300 ATK until their next turn (tempAtk).

   Measure: each wins 40-60% over 30 or more plays, has no legal target in under 25% of the turns it sits in hand, and the cost of the creatures it destroys varies.
2. **One relic each for water, wind, light and neutral**, using the existing per-element bonus. A relic is a commitment, which makes the choice of element to summon a real decision. Measure: relic win rate 40-60%, and the matching element's monsters get played more after the relic lands.
3. **Separate the dominated pairs with existing systems.** For example: Flame Burst also gives the next summon +200 ATK, Aegis also draws 1, Ember Whelp gets burn. Measure: a strict-dominance check on cost, stats and keywords finds 0 pairs.

Caveat: the greedy bot cannot show a decision. Report how often each new card is held when it could be cast.
