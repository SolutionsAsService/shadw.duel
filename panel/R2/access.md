# R2 Access (Game Accessibility Guidelines)

Verdict: OBJECT. R1 change 1 is mostly built, but on phone the Ward mark it added is hidden.

**R1 requests.**
1. Glyphs and G/W marks. *"Ensure no essential information is conveyed by a colour alone"*: met at every width (13px on phone, legible in board-phone.png). The aria-label names the element, Guard and Ward (*"support screen readers"*).
2. *"Use an easily readable default font size"* and *"Use simple clear language"*: met. Phone text is 10px, card text is one line of 75 characters or fewer, and the rule is in the detail panel.
3. Load: partly met. 0 twin pairs, no new keywords.

**New.** Changed stats use ▲/▼ as well as colour, which passes. The impact outline is colour-only, but the arrows and the "Destroyed:" text repeat its news, so I accept it.

**Changes:**
1. **Ward mark covered on phone.** At ≤760px the `.card-marks` column runs about 45px down from 3px. `.card-state` starts at 40px with the same z-index, so "Ready" hides the W on Crystal Sentinel (board-phone.png). Spells choose targets by Ward, so the mark must stay visible: *"Ensure that all key information is visible"*. Fix: lay the phone marks out in a row, or give the marks `z-index: 3` and move `.card-state` below them. Then check a Guard+Ward creature at 360px.
2. **No glyph key.** The mapping lives only in `title` tooltips, which don't show on touch or keyboard. A newcomer can't learn that ■ means earth (*"Provide a means to look up rules"*). Fix: add the legend "▲ Flame ● Water ■ Earth ≋ Wind ✦ Light ☾ Shadow ○ Neutral · G Guard · W Ward" to the Rules panel and the card detail panel.

Fix both and it is a PASS.
