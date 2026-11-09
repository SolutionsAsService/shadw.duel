# Run 2 R2 Feel (Swink)

Verdict: OBJECT

Response is the half of game feel the player actually perceives, and it must land on the object that changed, in the moment. Abilities that touch a creature do this: selfBuff, teamBuff, teamGrow, grow, chill, weakenPick/All, blight and rally call `markImpact`, so the slot gets a green/red outline with a 0.6s pulse (static outline under reduced motion), and kills leave a "Destroyed: name" zone.

Every ability that changes the player rather than a slot gets no response except a log line below the fold (board-desktop.png: the log sits under the hand and life bar). Uncoloured cases: `again` (Sky Hunter's Kill, extra attack) never calls markImpact; `barrier` only appends "+ N shield" to the status text; LP heals/burns (River Sprite) change the 8000 in place with no delta; draws (Wind Falcon, Automaton, Ancient Titan) and Phoenix's return add a hand card silently; banked "next creature" bonuses (Radiant Knight, Crystal Sentinel, Battle Colossus) are invisible until spent. That is about a third of the 40, and the player cannot connect cause to effect.

Changes (cheap, no sound/shake):
1. `again()` calls `markImpact(seat, index, "boosted", ...)` like `rally` does, so the creature that may attack again lights up.
2. Add seat-level impacts (`markSeatImpact(seat, kind, text)`) for LP, shield, draw, return-to-hand and banked bonus: outline the seat panel and show a delta chip ("-500 LP", "+1 card", "Barrier 300", "Next creature +400 ATK") for the turn, the same `impact-pulse` rule, static under prefers-reduced-motion.
