# Run 2 R3 Affordance (Norman)

Verdict: PASS

**R2 request 1, trigger chip on field cards: met, with one change.** `triggerChip` puts ➶ Attack, ⚔ Kill, ☠ Death or ☀ Dawn among the card marks. In both screenshots Pyre Phoenix (☠), Wandering Duelist (➶), Shadow Stalker (➶) and Crystal Sentinel (☠) now say on the board that they still have an ability to come. Iron Golem has no chip because its Summon has already fired, which maps correctly. The pending ability is now knowledge in the world. The chip shows a glyph, not the word I asked for. The word is in the `title` tooltip and the detail-panel legend. A phone player has no hover, so they must open one detail panel to learn the four glyphs. That is a one-time learning cost, and the glyphs stay consistent everywhere, so I do not object to it.

**R2 request 2, pending-effects status line: fully met.** `panelStatus`/`renderInfo` show "Barrier 300" in the card's own word (no more "shield"), plus "Next creature +400 ATK", "−500 LP this turn" and "+N cards this turn" (`notePanel`). Banked effects and their results are now visible, not lost in the log. The vocabulary mismatch is gone.

**Prediction and outcome.** Chip plus glossary: a player can predict when an ability fires. The panel chips, the markImpact outlines and the log show what it did. Not done: the chip does not pulse on the turn it fires (I found no code for it). The outlines and panel chips already give feedback on the result, so that gap costs little. Optional polish, not an objection.
