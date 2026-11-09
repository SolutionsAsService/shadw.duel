# R1 Readability (Solarski, Drawing Basics and Video Game Art)

Verdict: OBJECT

**What the squint shows.** Solarski's first test is whether the silhouette reads as a flat value shape before any detail. At board-360 (53x40) most subjects disappear in the squint column. Every body is filled with the same dark `url(#body)` gradient and set on a mid-dark field of the same hue, so figure and ground differ in hue only, not in value. Thin `--glow` strokes are the only separator, and they fall below one pixel at 53x40. That explains sep < 1.6 on 37 of 55 cards. The worst cases are the shadow cards (Lord of the Void 1.30, Void Hound 1.32, Dread Reaper 1.36): purple body on purple ground, with a dark halo behind the head that lowers contrast further.

**Why the twins exist.** In shape language they are one shape. `giant()` is a stack of squares: Stone Guardian, Iron Golem, Battle Colossus, Ancient Titan, Mountain Behemoth and Worldbreaker are all the same blocky square read with a small chest mark. `knight()` gives Ironclad and Radiant the same upright rectangle plus a sword line. Celestial and Sunblade share one wing-fan triangle pair around a small figure. Dawn Acolyte and Nightblade are the same hooded robe triangle. The variants differ only in interior detail (rivets, gems, halos), and at 53x40 that detail is lost. Detail doesn't make a silhouette.

**Requested changes (generator only):**
1. **Value rim and value split.** Draw each subject twice: first a 6-8px offset copy in a light value (`--white` at about 0.5 opacity, or a pale `--glow`), then the dark body on top. Also lighten the field directly behind the subject (a radial in the upper value third). Expected result: board-360 sep rises above 1.6 on most of the 37 cards, with the shadow family gaining the most.
2. **A different base shape for each variant, set in the outline.** Stone: a squat square with a wide base. Iron: tall rectangle with a narrow waist. Mountain/Worldbreaker: a triangle with a peaked back. Colossus: an inverted triangle with a broad top. Ancient: rounded and hunched. Knights: Radiant as a circle (shield and halo) against Ironclad as a jagged triangle. Acolyte as a soft circle-topped robe, Nightblade as a sharp diagonal. Angels: Sunblade's wings raised in a V against Celestial's lowered, closed dome. Expected result: all 8 twin pairs fall below 0.80.
3. **Scale small subjects to at least 0.18 area.** Barrier, Flame Burst, Frost Siren, Minor Restoration, Spark, Stone Skin and Void Shard each get one big primary shape. Expected result: the small-area flags clear.

**Rules for new card art:**
- Each new card gets a silhouette of its own. It may reuse a helper only with a different base primitive (circle, square or triangle) chosen to match its role: square for guard, triangle for aggression and swift, circle for heal and support.
- The subject must be the lightest or darkest mass on the card, with a value rim. Hue alone never separates figure from ground.
- One focal point per card, in the upper-middle third. No competing star or halo at the same value.
- Each card must pass at board-360: sep ≥ 1.6, area ≥ 0.15, and no twin ≥ 0.80 against any existing card. Check this with card_art.py before the card ships.
- Elements without a relic (water, wind, light, neutral) need relic shapes that differ from Ember Core, Crystal Heart and Void Shard. Don't reuse the gem.
