# Run 2 R2 Readability (Solarski)

Verdict: OBJECT

**R1 requests.**
1. *Silhouettes with shape language*: **met.** Compared with before.png, the 40 creatures are new drawings. They set curves against angles and their outlines break with secondary shapes: horns, frills, capes, shells and props. Their poses act out the ability (Reaper mid-swing, Leviathan breaching, Golem's barrier, Phoenix rising, Sovereign rallying). In creatures-1/2 no two filled shapes match. This answers "too simple" for creatures.
2. *Light from the scene*: **not met.** Every subject still wears the same full rim at the same weight, and the lit side does not face the drawn sun or moon. Form is still shown by outline, not by value.
3. *Varied composition*: **partly met.** Ancient Titan and Lord of the Void are bust crops, Mountain Behemoth is a landform and Leviathan breaches on a diagonal. Most subjects are still full-figure, centred and at mid scale.

**Weakest creatures.** Shadow Stalker (a sprawled diagonal with no clear head), Sky Hunter (a thin stroke cluster beside an arrow), Stone Guardian (a domed mass with the head hidden), and Flame Serpent (a coil tangle that blurs at board size).

**Spells and relics are now the samey part.** In sheet.png, Aegis, Barrier, Divine Renewal, Sun Sigil, Second Wind, Healing Potion, Ember Core, Spark, Void Shard and Void Collapse are all symmetric emblems centred in a ring. By Solarski's test this is one silhouette repeated. Beside the redrawn creatures, they now carry "generic".

**Changes:**
1. **Redraw spells and relics as events, not badges** (all of them, starting with the ten above). Each needs an asymmetric diagonal action in the scene. Aegis: a shield taking a blow. Divine Renewal: light breaking over a fallen figure. Void Collapse: terrain falling inward. Spark: an arc jumping between two points. Drop the centred ring. Gate it with the filled-black twin check across all 75 cards.
2. **Scene-light the creatures** in scripts/art-subjects/*.cjs. Use the art-scenes sun/moon vector to put a light value on the facing side and let the far side fall into the background value. Keep the rim only on the backlit edge. Start with the four weakest creatures above.
