# Card art style: carved glass

Each card is a **carved-glass print**: a stained-glass window cut like a woodblock. Leading is the carved line,
panes are backlit jewel-tone glass, and hatching and gouges inside the panes model form.

## Format

- `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">` with `title` and `desc`.
- Only the elements the brief allows: no filters, masks, clipPath, pattern, use, image, text, href or scripts. Path
  data uses integers only.
- **12 KB maximum.** Define only the gradients you use (about 190 B each). Put panes that share a fill in one `<g fill>`.
  Put all hatching of one width in one `<path>`.
- Wrap the subject (the creature, or the spell's central effect, never the background) in `<g data-figure="1">`.

## Line weights (px at 400x300, ink `#120c10`)

- Frame border and window opening: 6. Major carved edge (wing bone, blade spine): 7.
- Subject silhouette: draw every subject shape filled with ink and stroked at 9-10 (an under-pass), then draw the panes on
  top with 3-3.5 leading. Background leading: 3.
- Hatching: 1.6-2. Cross-hatching: 1.6. Gouges (pale cut lines): 2-2.5. Carved rings: 2-2.5, dashed.

## Light and form

- Each scene has one **key light**: the sun, the fire or the spell.
- Pane gradients are glass glow. Their highlight is always at the upper left (`cx .35 cy .3 r .8`).
- The scene light shows on the side away from the key, in three ways:
  1. **Shadow pane:** a separate darker pane (wine, violet or navy) cut along the far contour.
  2. **Hatching:** strokes start 3 px inside the far contour and point inward, across the form. They are longest where
     the form turns away most and fade toward the light. A cross-hatch set rotated about 40° goes only in the deepest third.
  3. **Gouges:** pale lines 6-9 px *inside* the lit edge, following its curve.

## Panes

- Cut along anatomy: wing membranes between the fingers, belly plates, feather rows, flame tongues. Make no pane
  narrower than 10 px.
- Alternate two neighbouring tones (ruby and wine, ivory and pearl). Feathers and flames are strips between two
  curves, with bowed sides.
- Secondary figures (a foe, a victim) are black woodcut silhouettes, at most 1/6 of the window's height. Each has one
  coloured pane and gold gouges on the side facing the light.

## Composition

- The window is x 16-384, y 16-286. Keep the gilt top corners clear.
- The subject is 45-65% of the window height and sits on a vertical third, not at the centre.
- The horizon is at y 236-262: two wavy bands of ground panes.
- There is one focal point: the burst centre, the brightest pane and the subject's head or core together.
- The action is diagonal and runs corner to corner.

## Background and frame

- **Carved burst:** rings of panes centred on the key light. Radii are about `0, 30-50, 66-100, 136-176, 420`, with
  8-12 rays per ring and each alternate ring offset by half a ray. The inner rings are light and warm. The outer rings
  are dark and cool, so the subject sits on dark glass. Draw two dashed carved rings around the light, and a few pale
  1.5 px streak gouges across the large outer panes.
- **Frame:** a bronze plate with an ogee-peaked opening, gilt spandrels in the top corners and jewel rivets. Every card
  uses the same frame. Copy it from a reference SVG and change only the rivet colour (the element's accent).

## Palettes

| Element | Sky panes | Ground | Subject (shadow) | Accent |
|---|---|---|---|---|
| Flame | `#1f3c8c` `#3e2a80`, sun `#f4c03c` | `#1a9a90` `#162a6a` | `#d0281e` `#e8501a` (`#681430`) | `#f4c03c` `#fff3c0` |
| Water | `#4a90dc` `#1f3c8c` | `#162a6a` `#0a3c44` | `#1a9a90` `#4a90dc` (`#162a6a`) | `#e6f0ff` `#80e8d8` |
| Earth | `#f08a1c` `#681430` | `#a87024` `#44240a` | `#a87024` `#46384e` (`#26060f`) | `#2fb86a` `#f4c03c` |
| Wind | `#b8e0ff` `#4a90dc` | `#1a9a90` | `#e6f0ff` `#80e8d8` (`#94b4e0`) | `#8a70d0` `#ffffff` |
| Light | `#4a90dc` `#e6f0ff`, sun `#fff3c0` | `#1a9a90` `#162a6a` | `#fbefc4` `#f4c03c` (`#4a90dc`) | `#c8183a` `#f4c03c` |
| Shadow | `#3e2a80` `#162a6a` | `#46384e` `#160e1a` | `#46384e` `#8a70d0` (`#140c34`) | `#c8183a` `#2fb86a` |
| Neutral | `#1f3c8c` `#3e2a80` | `#1a9a90` `#a87024` | `#8aa6d0` `#a87024` (`#2e3e66`) | `#f4c03c` `#c8183a` |

These are the mid stops. Make each gradient light, mid at 0.55, dark. The subject needs a light end so it separates
from the dark glass. Check every card at **53x40 px**, where the subject must read as one shape.

## Avoid

- Glowing rims, meaning any light stroke around the outside of a silhouette. Gouges go inside the form.
- Symmetric emblems at the centre of the window.
- Muddy dark values: a dark subject on dark glass, greys, or a brown wash.

## Snippets

```svg
<!-- gradient; silhouette under-pass; burst pane; hatch and gouge; carved ring -->
<radialGradient id="red" cx=".35" cy=".3" r=".8"><stop stop-color="#ff8a60"/>
<stop offset=".55" stop-color="#d0281e"/><stop offset="1" stop-color="#560810"/></radialGradient>

<g fill="#120c10" stroke="#120c10" stroke-width="9" stroke-linejoin="round"><path d="BODY"/></g>
<g stroke="#120c10" stroke-width="3.5"><path d="BODY" fill="url(#red)"/><path d="SHADOW" fill="url(#wine)"/></g>

<path d="M318 76A68 68 0 0 1 298 124L273 100A34 34 0 0 0 284 76Z"/>

<g fill="none" stroke-linecap="round">
<path d="M372 220l-14 2M368 236l-16-2M360 250l-14-6" stroke="#120c10" stroke-width="2"/>
<path d="M256 190C254 160 280 144 316 146" stroke="#ffe9b0" stroke-width="2.5"/></g>

<circle cx="250" cy="76" r="40" fill="none" stroke="#120c10" stroke-width="2.5"
 stroke-dasharray="16 6 30 8 10 6"/>
```
