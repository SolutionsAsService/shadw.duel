# R2 Learner (Koster, A Theory of Fun)

Verdict: OBJECT (mild; no card changes asked)

**Patterns: about 6 before, about 10 now.** The new ones are real:
1. Removal you read: Undertow and Wither take the highest ATK, so you can bait them with a decoy or protect a card with Ward. Ward is now a decision.
2. DEF thresholds: Scorch hits 400 or less and Landslide 500 or less, so you learn not to flood the board with small creatures.
3. Sequencing before combat: tempDef counts in getMonsterDefense, so Riptide then Scorch or Landslide is a true combo. Riptide is the best spell at 56%.
4. Holding through the opponent's turn (Tidewall).
5. A soft catch-up read (Second Wind, Turning Gale).

**Only numbers: the 4 relics.** Each deck is the whole collection, one copy of each card, so nobody can commit to an element. A relic is a lottery on what you draw: the reskin R1 warned about.

**Mastery:** the pick rules take two or three encounters to learn. Playing around hidden removal lasts longer against a human. The bot never baits, so against it the patterns are learned fast.

**R1 requests:** all three adapted acceptably. But request 1's measure failed: Titan went 67.8% -> 72.5/69% and Sky Sovereign 57 -> 64%. The measures for requests 2 and 3 were never reported. Undertow's held/match is 0.01: the bot fires it at whatever is on the board and almost never keeps it for the Titan.

**Changes (2):**
1. card-stats prints, per cast, the attacks Riptide or Wither turned into wins, the enemy attacks that bounced off Tidewall, and the median ATK of Undertow's victim.
2. The bot holds Undertow while the best non-Ward target has under 1000 ATK, unless it faces lethal. Then measure the Titan again.
