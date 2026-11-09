# R2 Affordance (Norman)

Verdict: OBJECT (one wording defect on the primary signifier; no ANDON)

**Evaluation: closed.** Each board spell logs its target or "no enemy creature qualifies; no effect". `markImpact` outlines the affected slot, "Destroyed: <name>" fills an emptied slot, and changed stats show red with ▼ (phone and desktop agree). Only the last action stays outlined, but the log names both spells, so I accept it.

**Selector inputs: visible.** W and G marks show at every width, and modified ATK/DEF are coloured and carry arrows. "Highest ATK without Ward" can be read off a 360px board. R1 change 3 is met.

**Execution: the card face still fails.** The exact `rule` text appears only in the detail panel. The face text in hand teaches the wrong model:
- Wither's face text ("The strongest enemy creature loses 500...") leaves out Ward. Read literally, it hits Sky Sovereign (1350 ATK); in the screenshot it hit Stone Guardian. The world contradicts the outcome.
- "Strongest" (Undertow, Wither) never says ATK.
- Scorch and Landslide also leave out Ward.

Changes:
1. **Face text names the stat and Ward (75 characters or fewer):** Undertow "Destroy the highest-ATK enemy creature without Ward." Wither "Highest-ATK enemy without Ward loses 500 ATK and DEF until its next turn." Scorch "Destroy the lowest-DEF enemy without Ward if its DEF is 400 or less." Landslide "Destroy every enemy without Ward with 500 DEF or less." Add a test that every board spell's `text` contains "without Ward" and its stat.
2. **Feedforward (recommended):** while a board spell in hand is selected or focused, give the creature(s) `pickCreature` (or the Landslide/Riptide filter) would hit a dashed outline, using the impact styling. This supplies the mapping an untargeted spell lacks.
