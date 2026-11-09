# Run 2, R3 evidence: final WHOLE round on the current build (git log -1), 9 Nov 2026

R2 verdicts (panel/run2-R2/): Lenses PASS, Decisions PASS; Readability, Access, Affordance, Feel OBJECT. Flow was not
seated in run 2 until now.

## What changed since R2
- **Every card is redrawn.** Since R2: the 35 spells and relics, as events not badges (scripts/art-subjects/
  spells-attack, spells-guard, spells-trick, relics .cjs; reports panel/run2-R2/drawn-*.md). Creatures were redrawn
  before R2.
- **Scene light (Readability):** each subject's rim is lit from the scene's sun or moon (full on the facing side, 70% on
  the far side); dawn, day and dusk suns are warm and rayed, no longer pale discs that read as moons (Lenses).
- **Access:** hand ability text is 11px and keywords 10px; ability texts are 55 characters or fewer, using terms
  defined in the trigger glossary (non-Ward, ≤, for a round, strongest, weakest); hand cards are 256px. tests/
  text-fit.cjs fails on clipping, overlap, or type under 11px/10px; a 10px fixture fails all 75 cards, and the build
  passes all 75 at 1280 and 390.
- **Affordance/Feel:**
  - Field cards carry a trigger chip (➶ Attack, ⚔ Kill, ☠ Death, ☀ Dawn) beside the element and Guard/Ward marks.
  - Player panels show "Barrier N" (no longer "shield"), banked "Next creature +X ATK/DEF", and this turn's
    "±N LP this turn" and "+N cards this turn" from effects.
  - Kill abilities that grant an extra attack outline their creature.
  - Chips wrap instead of being cut off.
  - Field stats show ATK over DEF and never sit under the info button (on phones the button sits above the stats).

## LOOK (Read tool)
- panel/run2-R3/creatures-1.png, creatures-2.png: all 40 creatures. spells-1.png, spells-2.png: all 28 spells and 7
  relics.
- panel/run2-R3/sheet.png: every card in six windows. panel/run2-R1/before.png: the start of run 2.
- panel/run2-R3/board-desktop.png and board-phone.png: a board after Fireball, with the opponent's "−500 LP this turn"
  chip and your "Barrier 300" and "Next creature +400 ATK" chips. detail-desktop.png and detail-phone.png: the detail
  panel.

## Measurements
- npm test 95 pass; browser suite 7 of 7; text-fit 0 of 75 at 1280 and 390; art:check 75.
- card_art.py: every window clean apart from noise at the 59x44 and 53x40 boards (33 cards); sep < 1.6 0 of 75 at every
  window (minimum 1.61); twins 0; hue outliers 0. Assets 887 KB of 900 KB, 116 KB gzipped.
- card-stats, 2000 matches (seed 1 / 5001): 0 effects threw; first seat 66.2% / 69.6%; 0 cards outside 30-70%.
