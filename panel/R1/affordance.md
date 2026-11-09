# R1 Affordance (Norman, The Design of Everyday Things)

Verdict: OBJECT (resolved by the three changes below; no ANDON, nothing is unsafe)

Norman: a user must bridge the gulf of execution (what will this do?) and the gulf of evaluation (what did it do?). An untargeted board spell has no physical mapping, since nothing is pointed at, so the whole conceptual model has to live in the card text, and the board must expose every variable the rule reads.

What works now. Spell text is literal and complete ("Deal 750 damage directly to your opponent."), and the log echoes it on cast (game.js 984: "cast X for N energy: text"). The inspect panel lists each keyword's full rule (KEYWORD_RULES). Monster text is flavour, but keywords carry the rules, so a player can learn them.

What fails for board spells:
1. **The selector reads state the board hides.** At phone width `.field .card .card-keywords` is `display:none` (duel-ui.css 133), so Ward and Guard cannot be seen on the board, and the board ATK silently includes tempAtk and relic bonuses with no mark showing it was modified. "Highest non-Ward ATK" cannot be predicted from what is visible.
2. **Ward is mis-signified.** Its rule says "hostile creature effects". A spell is not a creature, so a player's model says Ward does NOT protect against spells. The spell text has to settle this.
3. **No feedback on what was chosen.** The log repeats the rule, not the result.

Requested changes (max 3):
1. **One text template, every clause spelled out, ties included:** "Destroy the enemy creature without Ward that has the highest ATK (on a tie, the leftmost)." / "Your creatures gain +200 ATK until your next turn." If nothing qualifies, say so on the card ("If there is none, nothing happens."). Also amend the Ward rule to "immune to hostile creature and spell effects ..." if spells respect Ward.
2. **A result log line naming the target and the number**, emitted after the rule echo: "Void Rend destroys Sky Sovereign (2400 ATK)." / "Frost Tide: no enemy creature without Ward; no effect." Board-wide effects list the count: "Gale Rally: 3 creatures gain +200 ATK."
3. **Board signifiers for the selector's inputs:** at every width, show a small Ward mark (a shield glyph, title="Ward") on a field card even when the keyword row is hidden, and colour or mark a modified stat (for example `.stat-down` red, `.stat-up` green whenever tempAtk/bonus is not 0) so the "highest ATK" can be read before casting.

Without 1 and 2 a board spell is a gamble. Without 3 it is predictable on desktop only.
