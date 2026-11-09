# Run 2, R2 evidence: WHOLE round on the current build (git log -1), 9 Nov 2026

Owner direction (VISION.md Must-haves 6-9): every creature its own ability; art more detailed; every card its own
scene; still readable. R1 verdicts: panel/run2-R1/ (Readability OBJECT, Lenses OBJECT, Decisions PASS with changes).

## What changed since R1
- **All 40 creatures redrawn** by family (scripts/art-subjects/winged, beasts, giants, knights, casters .cjs): curved and
  angular shape language, anatomy, outline-breaking secondary shapes, and a pose or prop that shows the ability (Reaper
  mid-swing, Phoenix rising from ash, Golem's raised barrier, Leviathan dragging prey, Hound dissolving, Sovereign
  rallying the flock...). Each family's report: panel/run2-R1/drawn-*.md. Redrawn subjects compose themselves (no
  automatic camera, no generic surface marks).
- Abilities changed per Decisions/Lenses: Pyre Phoenix returns to hand once; Sky Sovereign rallies a wind creature to
  attack again; Deep Sea Leviathan drags the weakest enemy down; Flame Serpent's Kill deals half the victim's ATK;
  Arcane Automaton draws at Dawn on a small hand; Tempest Giant lost Swift.
- Night scenes 27 -> 16 of 75.
- Hand cards are 232px tall with rarity moved to the detail panel, because abilities were clipped (55 of 75 cards);
  tests/text-fit.cjs now shows 0 of 75 clipped at 1280 and 390.
- Spells and relics keep run 1's drawings with run 2's scenes, shading and surface marks (not redrawn).

## LOOK (Read tool)
- panel/run2-R2/creatures-1.png, creatures-2.png: all 40 creatures at 400x300 (first 21, then 19, in cards.js order).
- panel/run2-R2/sheet.png: every card in six read windows with mask and squint.
- panel/run2-R2/board-desktop.png, board-phone.png: a board and hand; detail-desktop.png, detail-phone.png: Dread
  Reaper's detail panel (ability, flavour, trigger glossary, keyword rule, legend).
- panel/run2-R1/before.png: six cards at the end of run 1.

## Measurements
- npm test 95 pass; browser suite 7 of 7; text-fit 0 of 75 clipped; art:check 75.
- card-stats 2000 (seed 1 / 5001): 0 effects threw; first seat 66.2% / 69.6%; 0 cards outside 30-70%; Sky Sovereign
  62-63% top, then Tempest/Worldbreaker/Celestial under 62%.
- card_art.py: sep < 1.6 at 53x40 0 of 75 (median 2.06); twins 0; Landslide inspect sep 1.599; War Banner hue 131 vs
  neutral 206; noise flags at the 59x44/53x40 boards on 35 cards (more interior detail than before). Assets 774 KB of
  900 KB, 106 KB gzipped.
