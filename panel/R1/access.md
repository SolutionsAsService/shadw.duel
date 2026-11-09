# R1 Access (Game Accessibility Guidelines)

Verdict: OBJECT. Adding cards is fine, but not on the current phone board.

**What I measured.** Under 760px, `duel-ui.css` hides `.card-element` and `.card-keywords` on field cards (`display: none`). Names drop to 8px, stats to 8px and `.card-state` to 7px. At board-360 (53x40) the only element cue left is the art tint. A colour-blind player cannot tell which creatures Ember Core or Void Shard boost. At 53x40, 37 of 55 cards fall under the silhouette limit, and the earth giants (Stone, Iron, Mountain, Worldbreaker, Ancient, Battle Colossus) form one cluster of twins: green blobs with no way to tell them apart. New board spells would target by Guard/Ward, which phones hide.

**Requested changes (max 3):**

1. **Element glyph on the board.** Basic guideline: *"Ensure no essential information is conveyed by a colour alone."* Put a small shape icon per element in the field card corner (flame, drop, mountain, swirl, sun, crescent, ring), at 12px or larger, and keep it visible at <=760px. Do the same for Guard and Ward as a 12px badge, because new board spells will choose targets by them.

2. **Readable minimum text and short board spells.** Basic guidelines: *"Use an easily readable default font size"* and *"Use simple clear language"*. Raise field name, stats and state text to at least 10px on phone. Keep each new board spell's `text` to one line that names the rule it uses, at most about 70 characters, phrased as "Destroy the non-Ward enemy with the highest ATK." Explain the target rule in the detail panel.

3. **Count the cognitive load and show it.** Basic guideline *"Avoid unnecessary information / keep the number of things to remember low"* and the intermediate one, *"Provide a means to look up rules"*. If about 18 cards join a one-copy, 55-card shared deck (73 in all), each card appears in fewer games, so a newcomer meets mostly cards they have never seen. Every new card must reuse an existing keyword and an existing effect family, with no new nouns. Give each new card a unique silhouette helper, not another `giant()` or `knight()`, and check that the new cards add no twin pair at or above 0.80 at board-360 before shipping.

To the panel: the colour-only element signal at 360px is a basic-tier failure, and adding cards makes it worse. Change 1 makes this a PASS.
