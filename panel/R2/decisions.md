# R2 Decisions (Meier)

Verdict: OBJECT

**The board spells create decisions:**
- Riptide and Wither pay off only before attacks, with an attacker ready.
- Scorch and Landslide read the lowered DEF (`tempDef`), so Riptide then Scorch kills a 700-DEF creature. That makes the order you cast them in a decision.
- Undertow skips Ward, so on a Ward board you hold it.
- Scorch's 400 line and Landslide's 500 line make the opponent's summons part of your timing.
- Tidewall vs Rally Cry is a choice between defending and pushing.
- The relics make the element you commit to a choice.
- None of the new creatures dominates an old one or is dominated by one.
- Riptide on DEF: accepted.

**Two catch-up cards are dominated, so their conditions are not decisions:**
- **Turning Gale** (3: 400, or 800 when behind) is always worse than Void Bolt (3: 900) and Lightning Strike (3: 700 + draw). It wins 42%, the lowest.
- **Second Wind** (2: draw 1, or 2 when outnumbered) is always worse than Draw Two (2: draw 2).

**R1 requests:** board spells and relics met. The hold-rate report I asked for is missing.

**Cost of the refused rework:** decks are random, so the old dominated pairs are weak draws, not lost decisions. Small cost; accepted.

**Changes (new cards only, which Extend allows):**
1. Turning Gale cost 3 -> 2. It then beats Fireball (2: 500) when you are behind and loses to it when you are ahead.
2. Second Wind cost 2 -> 1: "Draw 2 if your opponent has more creatures; otherwise no effect", with `canHit` so the bot holds it. It then beats Quick Draw only when you are behind.

Check: 0 strict-dominance pairs among the new cards, and both cards win 40-60%.
