# Run 2 R2 Affordance (Norman)

Verdict: OBJECT

**What works.** Hand cards lead with the trigger word (Summon/Attack/Kill/Death/Dawn), and the detail panel adds the glossary TRIGGER_RULES, so the conceptual model is stated plainly. Feedback is good for stat changes: the cards.js helpers (selfBuff, teamBuff, grow, chill, weaken*, blight, rally) call `markImpact` and write a log line, and the slot shows boosted, weakened or destroyed outlines for the whole turn. `trigger` logs a failure instead of dying silently.

**Gulfs that remain.**
1. *Signifier lost on the field.* In board-desktop and board-phone, field creatures show only their name, keywords and stats, with no ability text. Once a Death or Dawn creature is in play, nothing on the board says it will fire. The player has to remember it or open the detail panel for each card. Knowledge in the head, not in the world.
2. *Invisible effects.* Three cards set `attackBonus` or `defenseBonus` for "your next creature": Crystal Sentinel, Radiant Knight and Battle Colossus. That bonus appears nowhere except one log line that scrolls away. The Barrier (Golem, Celestial Guardian) is shown only as "+ N shield" in the header string, using a different word from the card's "Barrier": a vocabulary mismatch. Draws and LP effects are visible only through counters and the log.

**Changes (buildable):**
1. On field cards, show a small trigger chip with the ability's first word (e.g. "Death", "Dawn") above the stats. Pulse it on the turn that `trigger` fires.
2. Add a status line in each player panel for pending effects, using the card's own words: "Barrier 400", "Next creature +300 DEF". Rename "shield" to "Barrier".
