# R1 Feel (Swink, Game Feel)

Verdict: OBJECT (cleared by the 3 changes below; no ANDON, rules untouched)

**Casting now.** Input is a click; response is instant, but the only polish layer is text. `playSpell` (game.js:965) logs "X cast Y for N energy: <card text>", runs the effect, and `render()` rebuilds every zone with `innerHTML = ""` (game.js:2245, 2276). No animation, no sound, no slot state survives a render. For today's spells that is enough: their result lands on a number the eye already watches (LP, hand size). A board spell is different. Swink's test is whether the player perceives the cause hitting the object. With untargeted, deterministic picks, the player did not choose the victim, so the game must *show* who was chosen. Otherwise a creature just disappears between two frames and `destroyMonster` (game.js:1340) says only "Z was destroyed." with no cause. That breaks the cause-effect link, and the new cards will feel like bugs rather than hits.

**Requested changes (max 3, cheap, no new rules):**

1. **Log line names cause, target and change.** Every board spell writes one line itself: "Void Bolt hits Sky Sovereign (highest ATK, not Ward): destroyed" or "Frost Nova: Tide Guardian ATK 1200 -> 700 until its turn". When nothing qualifies, say "Frost Nova finds no target." A silent fizzle reads as a dead input.
2. **One-render slot flash, driven by state.** Because render wipes the DOM, set `game.lastImpact = {seat, slot, kind: "destroyed"|"weakened", seq}` in the effect. `renderOpponentField`/`renderPlayerField` add `impact-destroyed` or `impact-weakened` to that zone when `seq` matches, and clear it on the next action. CSS gives a ~250 ms red (destroy) or blue (weaken) outline pulse. Under reduced motion, both style.css:3252 and duel-ui.css:163 already collapse animation, so the **resting state must itself carry the signal**: a static 2px outline, not a keyframe-only glow.
3. **Destroyed-card ghost.** For that same render, the emptied zone reads "Destroyed: <name>" at reduced opacity, in place of "Empty zone", so the eye finds the hole and the reason together. A weakened creature shows its tempAtk/tempDef in the existing stat line, styled as changed.

Not requested: sound (none exists, and adding it is new scope), screen shake, particles, or a target picker (frozen rules). A short log line, a slot outline and a ghost label are the smallest set that closes the response-to-cause loop for every new removal or debuff card, and for combat deaths too.
