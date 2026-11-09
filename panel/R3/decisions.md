# R3 Decisions (Meier)

Verdict: PASS

**R2 requests, checked against cards.js, bot.js and a fresh 2000-match run (seed 1):**
- **Turning Gale** now costs 2 (400, or 800 when behind) against Fireball (2: 500). It is better than Fireball when you are behind and worse when you are ahead, so it is not dominated, and "cast now or wait until I am behind" is a real decision. Win rate 42%: inside 40-60, at the bottom edge. Met.
- **Second Wind**: adapted, and acceptably. My conditional-only version measured 24% because players only got value from it in games they were already losing, so the change is justified. The new version (1: draw 2 if outnumbered, otherwise 400 LP) against each 1-cost card:
  - Quick Draw (draw 1): neither is better in both cases (draw 2 beats draw 1, but 400 LP is not a card).
  - Healing Potion (800 LP): neither is better in both cases.
  - Minor Restoration (500 LP + draw 1): it beats Second Wind when you are not outnumbered, but draw 2 is a different value when you are, so neither is better in both cases.
  - Second Wind dominates no 1-cost card and none dominates it. A player now chooses between taking 400 LP now and holding it for a 2-card draw when outnumbered. Win rate 48%. Met.
- **Hold-rate report**: card-stats now prints held turns per match. Met.
- **Undertow** has `worthAtk` 1000, and the bot reads it (median victim ATK 1100). Holding it for a big target is now visible in play.

**Advisory, no cost to a human player:** the bot never holds Turning Gale or Second Wind (0.00 held turns per match), so it does not model their timing.
