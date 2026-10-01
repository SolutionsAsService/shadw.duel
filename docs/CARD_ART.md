# Shadow Duel card artwork

The complete 55-card catalog has original, repository-native SVG illustrations:
33 monsters, 19 spells, and 3 relics. A separate engraved eclipse-and-blades card
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
if any output is missing or stale. Tests cover all 55 cards, unknown-name fallback,
browser/CommonJS exports, XML nesting and attribute syntax, SVG path command
arities, local gradient/accessibility references, passive resource-free content,
distinct subject geometry, deterministic output, and the total asset-size budget.

## Provenance

The drawing paths, palettes, card-back design, and generator were authored for
this Shadow Duel repository. They do not incorporate third-party artwork or font
glyphs. Existing repository authorship and licensing are unchanged; no third-party
art attribution or separate license is asserted.
