# R2 Feel (Swink, Game Feel)

Verdict: PASS (all three R1 requests met)

**R1 request 1, the log line.** Met. Each board spell logs its own cause and target ("Undertow drags down Tempest Giant." then "Tempest Giant was destroyed."; "Wither: Stone Guardian loses 500 ATK / DEF until its next turn."). A spell with no target says so in the log, so it no longer looks like an input that failed. The reason for the pick is in the card's `rule`, and the rule is fixed.

**R1 request 2, the slot outline driven by state.** Met. `markImpact` pushes to `game.impacts`, both field renderers read `impactAt`, and `executeAction` clears the impacts on the next action. The resting state is a static 3px outline. The pulse is only a 0.6s box-shadow on top of it, so the reduced-motion rule at the end of duel-ui.css removes the motion and keeps the signal. In both screenshots Stone Guardian is the one card the eye goes to: a salmon frame, with "0 ATK ▼ / 150 DEF ▼" in the same hue.

**R1 request 3, the ghost label and the changed stats.** Met in code: a dashed outline and "Destroyed: <name>" in the emptied zone. The screenshot shows a plain "Empty zone" where Tempest Giant was, because casting Wither was a new action and cleared it.

**Notes (no change required):**
- The weakened outline (#ff9b8f) and the destroyed outline use the same red, and the pulse is gold for both kinds. Shape (solid or dashed) still tells them apart.
- The bot plays several actions in a row, so a removal it casts on the player's creature is cleared by its next attack before the player can see it. Only the log shows it.

Board spells now feel like they hit something.
