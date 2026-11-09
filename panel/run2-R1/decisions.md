# Run 2 R1 Decisions (Meier)

Verdict: PASS (with 3 changes recommended for R2)

Doctrine test: does each ability add a choice the player did not have before?

**Abilities that make decisions (most of the 40).** The "next creature" set (Radiant Knight, Crystal Sentinel, Battle Colossus) turns hand order into a choice. Death riders (Ember Whelp, Gloom Mite, Dawn Acolyte, Void Hound, Mossback Tortoise, Pyre Phoenix) make the opponent ask "do I kill this, and when?". Wind Falcon / Shadow Stalker (direct) against Wandering Duelist / Frost Siren (creature) make "what do I attack" a real fork. Kill riders (Sky Hunter, Nightblade, Dread Reaper) reward picking a beatable target. Storm Drake, Inferno Knight, Gale Harpy and Ancient Titan reward building the board first. Worldbreaker Titan wiping your own small creatures is the best tension in the set.

**Free value, no choice (about 10).** River Sprite, Stone Guardian, Iron Golem, Arcane Automaton, Mountain Behemoth, Celestial Guardian, Lord of the Void, Cinder Wolf and Sky Sovereign fire whenever the card is played or attacks. Nothing is weighed. That is acceptable on cheap filler. It is not acceptable on the strongest cards. Also, every removal ability chooses its own target (Ashen Dragon lowest-DEF, Brine Witch highest-ATK), so the player never aims it. This is deterministic, but it is a decision the engine makes for them.

**Stats (2000 matches).** 0 cards are outside 30-70%. The top four (Worldbreaker 65, Sky Sovereign 63, Tempest Giant 61, Celestial Guardian 58) are all expensive, and three of them have free-value riders. The bottom creature is Flame Serpent at 40%.

Changes (at most 3):
1. **Sky Sovereign** (63%): replace "Attack: restore 200 LP" with "Attack: if it attacks directly, restore 300 LP". This is a free bonus stacked on swift and ward. The new text makes it a choice between going face and clearing the board.
2. **Tempest Giant** (61%): swift plus a team-wide -200 DEF on summon is always played and always swung the same turn. Keep the shred and drop swift, so the player has to choose between shredding now and attacking next turn.
3. **Flame Serpent** (40%): replace "Kill: deal 300" with "Kill: deal damage equal to the ATK it had over the defender's DEF". Target choice then decides the payoff: a weak defender gives more face damage, a threat removed gives less.
