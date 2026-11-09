# Plate brief: redraw Shadow Duel cards in woodcut + stained glass (GDADA run 3)

The owner graded the art a C. They compared four styles and chose a mix: **woodcut + stained glass** ("carved glass").
The style lead drew three reference cards and wrote the guide. You are drawing more cards in exactly that style.
Other illustrators work in parallel on other cards. The set must look like one series.

## Read first

1. `docs/ART_STYLE.md`: the style guide. Follow it.
2. `scripts/art-lib/glass.cjs`: the shared helpers (palette gradients `defs`, `burst` pane sunburst, contour `hatch`,
   `offset` gouges, `frame` gothic plate, `Ink` batching). Use them; do not copy them into your file.
3. `scripts/art-plates/reference.cjs`: the three reference cards (Ashen Dragon, Celestial Guardian, Fireball) as code.
   This is the target quality and structure.
4. LOOK at `panel/run3/reference.png` with your Read tool.

## What you write

One file, `scripts/art-plates/<your-file>.cjs`. Edit **only that file**. It must export:

```js
module.exports = () => ({
  'Card Name': () => { /* build the body with glass.cjs helpers */ return body; },
});
```

`body` is the whole illustration, background included, **without** the outer `<svg>`: the build wraps it.
- Wrap the main subject in `<g data-figure="1">...</g>`, exactly one per card: the creature, or the spell's central
  effect, or the relic. Not the background.
- Gradient ids come from `defs([...])` in glass.cjs (`white`, `gold`, `ruby`...). Do not use the id `shade` or
  `title`/`desc`.
- Allowed tags: `defs`, `linearGradient`, `radialGradient`, `stop`, `g`, `rect`, `circle`, `ellipse`, `path`. No text,
  no filters, no href. Integers in path data.
- At most 11 KB per card.

## Content

Each card's picture must show what the card does: its `text:` in `cards.js`, plus its `flavor:` for creatures.
- Creatures act out their ability (pose or prop).
- Spells are events, not centred badges.
- Relics are objects with presence, powering a creature of their element.

Use the element's jewel palette from the guide. Vary composition (sun position, horizon, subject side and scale) across
your cards; the reference shows three different layouts. Use `frame()` with a jewel colour matching the element.

## Check (run these yourself; they never touch `assets/`)

```sh
cd /home/user/shadw.duel
node scripts/preview-art.cjs --out /tmp/claude-0/<your-dir> --png "Card A" "Card B"      # look at sheet.png
node scripts/preview-art.cjs --out /tmp/claude-0/<your-dir>-all                           # all 75
python3 ../gdada/skills/gdada/scripts/card_art.py --config gdada.card-art.json --art '/tmp/claude-0/<your-dir>-all/*.svg'
```

**Every card of yours must pass in every window:**
- `sep` >= 1.6 (the subject's silhouette against the glass behind it).
- `area` >= 0.12, `kept` >= 0.97, `clip` <= 0.08.
- No twin >= 0.80 with any of the 75 cards (twins are a real risk in a shared style; vary the silhouette and
  composition).
- `noise` and `off` limits are relaxed for this style in the config.

Look at your sheet at least 3 times and iterate. Do not run `node scripts/build-card-art.cjs` without `--check`. Do not
commit. Finish by writing `panel/run3/drawn-<your-file>.md`: your cards, what each shows, and the worst `sep` and
nearest twin. Then reply in two lines.
