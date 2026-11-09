# R3 evidence: WHOLE round on build d38b945, 9 Nov 2026

R2 verdicts are in panel/R2/ (Flow PASS, Feel PASS, Readability PASS; Decisions, Access, Affordance, Learner OBJECT).
Changes since R2 (`git show d38b945`):

- Card faces (cards.js): Scorch "Destroy the lowest-DEF enemy without Ward, if its DEF is 400 or less."; Undertow "Destroy the
  highest-ATK enemy creature without Ward."; Wither "The highest-ATK enemy without Ward loses 500 ATK/DEF until its next turn.";
  Landslide "Destroy every enemy creature without Ward that has 500 DEF or less." A test requires every board spell's face to name
  "without Ward" and ATK or DEF, at 75 characters or fewer.
- Preview: hovering or focusing a board spell in hand outlines the zones it would hit ("would hit", dashed) via the template's
  `targets`; a test checks the preview equals what the spell then hits. Screenshot: panel/R3/board-desktop.png (hovering Riptide:
  only Gloom Mite is marked; Sky Sovereign and Crystal Sentinel have Ward).
- Decisions: Turning Gale cost 3 -> 2 (400, or 800 if behind; Fireball is 2: 500). Second Wind cost 2 -> 1: draw 2 if outnumbered,
  otherwise restore 400 LP (Quick Draw 1: draw 1; Healing Potion 1: 800 LP). The conditional-only version Decisions proposed was
  built and measured first: 24% win rate with 0.67-0.79 held turns per match, a selection effect (cast only in games being lost).
- Access: a legend line (▲ flame · ● water · ■ earth · ≋ wind · ✦ light · ☾ shadow · ○ neutral · G Guard · W Ward · ▲/▼) in the
  Rules dialog and every card's detail panel. Phone marks are a right-hand column; the Ready pill is left-aligned and no longer
  covers W. "Destroyed: <name>" wraps at 10px. Screenshot: panel/R3/board-phone.png (360px).
- Impacts last for the turn they happened in, so the other player sees everything the bot or two spells in a row did.
- Learner: the bot holds Undertow until the best target has 1000+ ATK. card-stats now prints held turns per match and effects.
- Readability advisories: Riptide one filled crest, Rally Cry horn and Storm Feather filled with the light value, Wither petals mid.

## Measurements at the final state

`node scripts/card-stats.cjs --matches 2000` (seed 1 / seed 5001):
- first-seat wins: 72.7% before -> 67.8% / 68.1%. Mean turns 20.3. 0 unfinished.
- Worldbreaker Titan 70% / 67% (existing card, frozen). Sky Sovereign 63%. Every new card 42-56%; Second Wind 48% / 48%, Turning
  Gale 42% / 45%.
- effects (seed 1): median ATK of the creature destroyed: Undertow 1100, Scorch 550, Landslide 600. Attacks that won only because of
  the DEF loss: Wither 315 (in 740 matches cast), Riptide 313 (in 763). Attacks turned away by Tidewall: 2 in 658, but the bot never
  makes a losing attack, so Tidewall's effect (deterring attacks) is not visible to this measure.

`card_art.py`: 20 of 75 flagged, all flags noise at the phone boards except 4 sep; twins 0; all 20 new cards pass sep/twin/area/kept.
Tests: npm test 85 pass; art:check 75 verified; browser suite 7 of 7 pass; bot-match seeds 1-20 finish.
