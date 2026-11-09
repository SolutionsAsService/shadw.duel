# Shadow Duel card artwork

The complete 75-card catalog has original, repository-native SVG illustrations:
40 monsters, 28 spells, and 7 relics. A separate engraved eclipse-and-blades card
back is provided for hidden or unknown cards. No raster images, emoji glyphs,
external resources, fonts, embedded scripts, or image-generation service are used.

## Art direction

The set uses angular dark-fantasy silhouettes, engraved edge highlights, layered
elemental landscapes, luminous details, and seven coordinated palettes. Subjects
are drawn as creatures or magical objects, not as renamed badges. Related families
share drawing primitives but have different geometry, equipment, transformations,
or effects: for example, a fire-breathing dragon, a smaller whelp, and a lightning
drake; armored stone, crystal, iron, mountain, and worldbreaking giants; and the
individual spell and relic objects. Subjects are centered for readable card-sized
display, with vector detail available when enlarged.

Illustrations have a `400 × 300` view box. The card back is `300 × 420`. Use
`object-fit: cover` for a card art window or `contain` to show the entire scene.
Each asset contains a title and description; in UI, give the image an appropriate
`alt`, or use `alt=""` when the adjacent card heading already conveys its name.

## Runtime API

Load `card-art.js` before code that renders card images:

```js
image.src = window.ShadowCardArt.src(card);
// Also accepts an exact catalog name:
window.ShadowCardArt.src('Cinder Wolf');
// -> assets/cards/cinder-wolf.svg
```

`manifest` is a frozen exact-name-to-path map. `fallback` is
`assets/card-back.svg`. Unknown names resolve to the fallback, never to a
user-supplied path. The same API is exported via CommonJS for Node tooling.

## Editing and verification

`scripts/build-card-art.cjs` is the editable source of truth. Its subject drawings
are explicitly keyed to names in `cards.js`; missing illustrations fail generation.
The deterministic generator writes the individual SVG assets and `card-art.js`.
No dependency installation is needed.

```sh
node scripts/build-card-art.cjs
node scripts/build-card-art.cjs --check
node --test tests/card-art.test.cjs
```

`--check` compares expected output without writing files and exits unsuccessfully
if any output is missing or stale. Tests cover all 75 cards, unknown-name fallback,
browser/CommonJS exports, XML nesting and attribute syntax, SVG path command
arities, local gradient/accessibility references, passive resource-free content,
distinct subject geometry, deterministic output, and the total asset-size budget.

## Measuring at read size (GDADA)

The art is drawn at 400 × 300 but players read it in much smaller windows. `gdada.card-art.json` lists those windows as
measured in the running game: inspect 226 × 170, hand 124 × 93 (120 × 90 on phones), board 105 × 79 at 1440 px, 59 × 44
at 390 px and 53 × 40 at 360 px. It also gives the SVG selector of each subject (`svg > g > g[stroke-linejoin]`), so
the figure mask is exact, and each card's element for the hue check. The instrument is
[GDADA](https://github.com/SolutionsAsService/gdada)'s `skills/gdada/scripts/card_art.py`. Run it from a gdada
checkout beside this repository:

```sh
python3 skills/gdada/scripts/card_art.py --selftest
python3 skills/gdada/scripts/card_art.py --config ../shadw.duel/gdada.card-art.json --sheet /tmp/cards.png
```

Baseline before the revamp (9 Nov 2026, 55 cards, exact masks, default limits):

- **Silhouette separation is the main defect.** At 53 × 40, 37 of 55 cards have a median edge contrast below 1.6:1.
  The weakest are Lord of the Void (1.30), Dark Bargain, Void Hound, Dread Reaper, Ashen Dragon and Flame Serpent. Dark
  `url(#body)` figures sit on dark skies, and only the thin glow strokes separate them.
- **8 twin pairs at 53 × 40:** Iron Golem ~ Stone Guardian (0.97), Ironclad Mercenary ~ Radiant Knight (0.92), Battle
  Colossus ~ Stone Guardian (0.91), Celestial Guardian ~ Sunblade Angel (0.90), Ancient Titan ~ Stone Guardian (0.89),
  Dawn Acolyte ~ Nightblade (0.87), Mountain Behemoth ~ Stone Guardian (0.83), Stone Guardian ~ Worldbreaker Titan
  (0.83). Each family shares one `giant()` or `knight()` silhouette.
- **Small subjects:** at 53 × 40, Barrier, Flame Burst, Frost Siren, Minor Restoration, Spark, Stone Skin and Void Shard
  cover less than 12% of the window.
- **Interior detail:** 10 cards are blobs at 53 × 40, including Deep Sea Leviathan, Nightblade, Void Hound and Wind
  Falcon. 6 are noise, including Crystal Heart, Fireball and Healing Potion.
- **Holding:** no figure loses pixels to `object-fit: cover` in any window, none touches the frame, and every card's
  hue stays within 40° of its element. Only Battle Rage and Tempest Giant are clean in every window.

After GDADA run 1 (9 Nov 2026, 75 cards). Every subject is drawn over a pale value rim (`rim()` in the
generator), the aura behind it is brighter, the giant, knight, angel, wizard, wolf and serpent families have
separate base shapes, and the seven smallest subjects are enlarged:

- Silhouette separation under 1.6:1 at 53 × 40: 37 of 55 → **4 of 75** (median 1.54 → 1.89).
- Twin pairs at 53 × 40: 8 → **0**. Subjects under 12% of the window: 7 → 0.
- All 20 new cards pass `sep`, `twin`, `area` and `kept` in every window. The remaining flags are `noise`
  (interior edges) on small, busy subjects at the two phone board sizes, which the panel judged by eye.

## Provenance

The drawing paths, palettes, card-back design, and generator were authored for
this Shadow Duel repository. They do not incorporate third-party artwork or font
glyphs. Existing repository authorship and licensing are unchanged; no third-party
art attribution or separate license is asserted.
