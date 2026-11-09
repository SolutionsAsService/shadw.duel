# R3 Learner (Koster, A Theory of Fun)

Verdict: PASS

**R2 request 1 (effect instrumentation): met.** card-stats now records what removal hit and which attacks a DEF change decided. My run (2000, seed 1): Undertow median victim 1100 ATK, Scorch 550, Landslide 600; Wither decided 316 attacks in 728 matches cast, Riptide 309 in 752. The Tidewall count (2 in 656) shows nothing, and the evidence says so plainly: the bot never makes a losing attack, so deterrence is not counted.

**R2 request 2 (Undertow waits for 1000+ ATK): met.** bot.js reads `worthAtk: 1000` and holds the card (score -1) while the top target is below it. Held/match went from 0.01 to 0.10, and the median victim is now 1100. The bot finally shows the pattern "save the answer for the threat". The Titan still wins 70%. It is frozen, so I only record it.

**Relics: the open item and what it costs.** All eight relics win 41-49%, below every other card type. With one copy of each card in a shared deck, a relic's element bonus depends on what you happen to draw, so there is no pattern to learn: it is a dice roll. A player meets that every match, as a card that teaches nothing. Fixing it needs deck building, which VISION.md excludes for this run. So it is a known cost of the scope, not a defect in this build. Keep it logged.

About 10 readable patterns now, and the bot plays one.
