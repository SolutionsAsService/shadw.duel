# Drawn: knights.cjs (scripts/art-plates/knights.cjs)

Carved-glass plates, built with the glass.cjs helpers (defs, burst, hatch, offset, frame, Ink).

| Card | What it shows | Layout | worst sep | nearest twin |
|---|---|---|---|---|
| Inferno Knight | Red-armoured knight inside a wall of flame tongues, raising a burning sword toward the sun at the upper left. A small flame-beast silhouette rises in the light (the knight rousing other flame creatures, +200 ATK). | sun upper left, knight right third | 1.83 | Iron Golem 0.49 |
| Radiant Knight | Ivory knight with a kite shield, holding his open hand to the sun. Three rays of light fall from it onto a kneeling ally silhouette ringed in gold (your next creature +200/+200; guard). | sun upper right, knight left third | 1.87 | Lantern Bearer 0.46 |
| Ironclad Mercenary | Broad steel-plated sellsword with an axe on his shoulder, holding out a coin pouch that spills gold coins (draw a card, pay 200 LP as his fee). | low sun on the left horizon, figure right third | 1.66 | Ashen Dragon 0.47 |
| Wandering Duelist | Hatted fencer in a full lunge, red cloak flying, rapier at full reach into a light-burst where it hits a reeling foe silhouette (+200 ATK when attacking a creature). | burst on the right at the point of the hit, figure left, diagonal | 1.75 | Lord of the Void 0.48 |
| Sunblade Angel | Angel swooping down-left with wings swept up and back. A gold arc trails the sun-blade through a foe silhouette, and gold motes rise from the kill (Kill: restore 400 LP). An attack on a falling diagonal, so it reads clearly differently from Celestial Guardian's upright folded-wing shield. | burst behind the head, centre left, diagonal | 2.29 | Crystal Heart 0.46 |
| Lantern Bearer | Hooded walker in ivory robes holding a lantern out on a crook into a starry night. The lantern is the key light, a thin dawn band sits on the horizon, and two tiny followers walk behind (carries the dawn; heals per light creature). | lantern burst right of centre, figure left third | 1.87 | Ember Core 0.53 |

Checks (all 75 cards, card_art.py with gdada.card-art.json): all six pass every window. kept 1.00, area >= 0.17, clip 0.00, and none hits the noise limit.
- **Worst sep:** Ironclad Mercenary, 1.66 at board-390.
- **Nearest twin:** Lantern Bearer and Ember Core, 0.53 (limit 0.80).
- **Size:** each body is 10.0-11.0 KB.
- **Note:** Ironclad Mercenary is a hue outlier (305 against the neutral group mean of about 354). The group mean moves as other illustrators add cards, and hue is not one of the brief's guards.
