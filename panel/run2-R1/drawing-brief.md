# Drawing brief: redraw Shadow Duel creature subjects (GDADA run 2)

The owner said the art is "too simple / not detailed" and "looks generic / samey". The panel agreed: the creature
drawings are straight-edged polygons with stick limbs, every creature stands centred and still, and nothing in the
picture shows what the card does. You are redrawing a few creatures. Other agents are redrawing others, in parallel.

## What you write

One file: `scripts/art-subjects/<your-file>.cjs`. Edit **only that file**. It must export:

```js
module.exports = ({ p, line, circle, group, armor, gem, eye, star, dark, thick }) => ({
  'Card Name': () => p('M...Z') + line('M...') + ...,   // returns an SVG string
});
```

Kit (from `scripts/build-card-art.cjs`, read it):
- `p(d, fill = 'url(#body)', extra = '')`: a filled path.
- `line(d, width, extra)`: a glow-coloured stroked line.
- `circle(x, y, r, fill, extra)`.
- `group(svg, transform)`.
- `armor(d, extra)`: a metal plate.
- `gem(x, y, size)`, `eye(x, y, size)`, `star(x, y, size)`.
- `thick(d, width, color)`: a fat stroked path, good for tails, tentacles and limbs.
- `dark` is `#101323`.

Fills you may use:
- `url(#body)`: lit flesh, light at top-left, dark at bottom-right.
- `url(#metal)`, `url(#flare)` (hot glow), `var(--mid)`, `var(--glow)`, `var(--white)`, `dark`.

Allowed SVG: `path`, `circle`, `ellipse`, `rect`, `g` only, with plain attributes. No other tags, no `href`, no event
attributes, no external references.

## How to draw

- **Artboard:** 400 × 300. The ground line is around y = 255-265. The scene behind you is drawn automatically: sky,
  setting, sun or moon, a backlight aura centred near (200, 150), a ground shadow, particles and a pale rim around your
  shapes. **You own the composition:** where the creature stands, its pose, scale and crop. Vary it between your cards.
  Use a close-up head, a small figure in a big space, a low angle, or a diagonal lunge. Some cards may break the frame
  (a wing tip off the edge), but most of the body stays inside x 30-370 and y 25-275.
- **Shape language (Solarski):** curves against straights, and big, medium and small shapes. Use smooth `Q`/`C` curves
  for muscle and body, and angular shapes for claws, horns, armour and teeth. Every creature needs 2-3 secondary shapes
  that break its outline: a mane, horns, fins, cloth folds, a tail, spines, a weapon. **No stick limbs:** limbs have
  thickness and joints.
- **Light and form:** build volume with 2-3 value layers. Use `url(#body)` for the mass, `var(--mid)` for the shadow
  side and the underside, and `var(--glow)` or `var(--white)` for a few highlights on the lit upper-left edges. Use
  `line()` for interior contour lines (muscle, scales, feathers, cloth), grouped where form turns, not scattered
  evenly.
- **Show the ability:** each card's picture must show what the card does (the ability is listed with your cards). For
  example, the Reaper mid-swing with its scythe; a golem with its shield raised; a phoenix bursting from ash; a
  tentacle gripping prey; a hound howling as it dissolves into smoke for a Death ability.
- **One focal point,** usually the head or eyes, plus the ability prop.
- **Size:** keep each subject's markup under about 3,500 characters. Use integers in path data. The whole card set has
  a byte budget, and the scene adds several kilobytes per card.
- **Original work:** no copying of known characters or game art.

## How to check (run these yourself; they never touch `assets/`)

```sh
cd /home/user/shadw.duel
node scripts/preview-art.cjs --out /tmp/claude-0/<your-dir> --png "Card A" "Card B"    # look at <dir>/sheet.png
node scripts/preview-art.cjs --out /tmp/claude-0/<your-dir>-all                         # all 75, for the twin check
python3 ../gdada/skills/gdada/scripts/card_art.py --config gdada.card-art.json --art '/tmp/claude-0/<your-dir>-all/*.svg'
```

Open `sheet.png` with your Read tool and look at your cards **before** you finish. Iterate at least twice.

**Your cards must pass card_art.py in every window:**
- `sep` >= 1.6, `area` >= 0.12, `kept` >= 0.97, `clip` <= 0.08, `off` <= 0.12.
- No twin >= 0.80 with any of the 75 cards.
- `noise` flags at the two smallest boards may remain.

Do **not** run `node scripts/build-card-art.cjs` without `--check`: it rewrites `assets/`, which the conductor owns.
Do not commit.

Finish by writing `panel/run2-R1/drawn-<your-file>.md`: your cards, what each picture shows, and your card_art numbers
(the worst `sep`, and the nearest twin).
