# R3 Access (Game Accessibility Guidelines)

Verdict: PASS. Both R2 requests are met, and the new preview leaves no player without information they need.

**R2 requests.**
1. **Ward mark on phone.** Met. At ≤760px `.card-marks` is a right-hand column from 3px down, and `.card-state` is a left-aligned pill (`left: 3px; right: auto`). In board-phone.png the W is clear on Sky Sovereign and on both Crystal Sentinels, and on my Sentinel it sits next to "Ready" without being covered. G and W are both legible on the Guard+Ward creature at 360px. *"Ensure that all key information is visible"* is satisfied.
2. **Glyph key.** Met. `ELEMENT_LEGEND` appears in the Rules dialog ("Card marks:") and at the foot of every card's detail panel. Touch players reach the panel with the ⓘ button and keyboard players with I, so neither depends on hover (*"Provide a means to look up rules"*).

**New.** The "would hit" outline appears only on mouseenter or focus. On touch, a tap casts the spell straight away, so a touch player never sees it. I accept that. The information is still there in two forms that don't depend on the preview: every board spell's face names "without Ward" and the ATK or DEF condition (a test enforces this), and every enemy shows its W mark. The preview is extra help, not the only place that information lives. The outline is labelled with the text "would hit", so it is not conveyed by colour alone.

**Advisory, not blocking.** The "would hit" label is CSS `::after` content and is not announced to screen readers. If you want to fix it later, add the targets to the spell's aria-description on focus.
