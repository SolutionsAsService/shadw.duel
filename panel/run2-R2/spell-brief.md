# Spell and relic brief (GDADA run 2, R2)

Read `panel/run2-R1/drawing-brief.md` first. Every rule there applies (kit, allowed SVG, checks, budget, your own file
only, no commits, no build without `--check`). This brief adds what differs for spells and relics.

The Readability seat found the 35 spells and relics are now the samey part of the set: symmetric emblems centred in a
ring (Aegis, Barrier, Divine Renewal, Sun Sigil, Second Wind, Healing Potion, Ember Core, Spark, Void Shard, Void
Collapse...). Redraw them **as events, not badges**:

- **A spell is a moment:** something happening to something, along an asymmetric diagonal, often with a target or a
  victim in the frame.
  - Fireball: a blazing ball streaking down onto a fleeing figure.
  - Aegis: a shield taking a blow.
  - Divine Renewal: light breaking over a fallen figure.
  - Void Collapse: the ground falling inward.
  - Spark: an arc jumping between two points.
  - Draw Two: cards flying from a deck into a hand.
- **A relic is an object with presence:** set on something (an altar, a hand, a banner pole, the ground), lit, with its
  power visibly doing what its text says (Tidestone: water creatures +DEF, so a pearl whose tide wraps a guard).
  Relics may be centred, but **not as a flat symmetric ring.** Give each depth: a 3/4 view, a cast shadow, an object
  under it.
- **No centred ring or halo** behind the subject unless it is the event itself.
- The card's rules text is in `cards.js` (`text:` of each spell/relic). The picture must show it.
- Keep each subject under about 3,500 characters and pass `card_art.py` in every window, with no twins >= 0.80 across
  all 75. Twins are a real risk among spells, so check the full set.

Write `panel/run2-R2/drawn-<your-file>.md` when done.
