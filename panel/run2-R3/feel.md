# Run 2 R3 Feel (Swink)

Verdict: PASS

Swink's test is whether the player can tie an effect to its cause on the object that changed. Both R2 requests are met.

1. **Extra attack marked.** `again()` in cards.js now calls `game.markImpact(seat, index, "boosted", ...)`, so a creature with Sky Hunter's Kill gets the same outline and 0.6s `impact-pulse` as a rally or buff.
2. **Player-panel response.** `notePanel` counts this turn's LP changes (dealDamage, heal) and effect draws. `panelStatus` builds the chips and `renderInfo` adds them to each seat's line. board-desktop.png shows "−500 LP this turn" in red on the opponent and "Barrier 300" and "Next creature +400 ATK" in gold on you, all readable at a glance, above the fold, beside the numbers they explain. Barrier and banked bonuses no longer go unseen until spent, and burns and heals show their size.

Residuals, none worth blocking:
- Pyre Phoenix's `rebirth` pushes to the hand without calling `notePanel(seat, "cards", 1)`, so its return gets no "+1 card" chip. The player still sees the "Destroyed" zone, the hand count go up and the card in hand, so the cost is a beat of "where did that come from?" on one rare card. It is a one-line fix if anyone touches the file.
- Panel chips appear without the pulse that slot impacts get. They are steady and turn-scoped, which is enough. A pulse would be polish, not a missing response.

Cause and effect now read without opening the log.
