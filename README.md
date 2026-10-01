# Shadow Duel

An original two-player browser card game: **55 illustrated cards**, seven elements,
local pass-the-device play and direct WebRTC duels. No account or build step.

## Run

Requires Node.js 22 or newer.

```sh
npm ci --ignore-scripts
npm start
```

Open **http://127.0.0.1:3000**. `PORT` changes the port; `HOST` defaults to
`127.0.0.1`. To expose the server to your own LAN, explicitly set `HOST=0.0.0.0`.
For public hosting, use HTTPS with WebSocket upgrades forwarded for `/ws`.
`GET /health` reports readiness. The server serves only game assets, not Git,
dependencies, tests or private files.

## Play

- **Local Duel:** two players share a device; End Turn switches the active hand.
- **Create / Join Lobby:** share the four-character code or invite link. The guest
  marks Ready, then the host starts. Both browsers need the same running server.
- **Cards:** explore the complete searchable collection, filter by type/element,
  and inspect each illustration, cost, statistics and ability.
- **Rules:** an in-game guide explains turns and the implemented keywords.
- Click a playable hand card to use it. Select a ready creature and then a target
  to attack. Use the card's information button, right-click, or press **I** while
  focused to inspect it; Enter/Space activates it.
- Surrender ends the match for both peers. Online rematches require both players;
  returning to the menu leaves the room. A lost connection interrupts the match
  with **no result**, rather than awarding both disconnected players a win.

## Rules at a glance

Each player has 8,000 life, five starting cards and their own shuffled copy of the
same 55-card list (33 monsters, 19 spells, three relics). The first player draws at
match start; later turns draw automatically. Energy starts at one for each player
and grows on that player's own turns, up to ten. The hand limit is nine; overflow
is discarded. Attempting to draw from an empty deck loses the duel.

One monster may be summoned per turn into one of five slots. A monster normally
waits until its controller's next turn before attacking, and attacks once per
turn. Spells and relics use energy without consuming the monster summon. Relics
persist and their bonuses affect matching creatures already on the field too.

| Keyword | Implemented effect |
| --- | --- |
| Swift | Can attack on its summoning turn. |
| Guard | Opposing creature attacks must target a Guard while one is present. |
| Heal | Restore 300 life on summon. |
| Burn | Deal 200 extra life damage after a direct or winning creature attack. |
| Debuff | On summon, non-Ward enemies lose 100 ATK/DEF until their next turn. |
| Ward | Blocks hostile creature effects such as Debuff, not combat damage. |
| Lifesteal | Heal the actual combat damage dealt to opposing life, before Burn. |

Creature combat compares attack against defense: a winning attacker destroys the
defender and excess damage reaches its controller; a tie destroys both; a losing
attacker is destroyed and its controller takes the difference. Direct attacks
require an empty opposing field. Barrier absorbs up to 600 life damage until the
caster's next turn. Card text and the in-game guide specify other spell effects.

## Online scope

The Express/WebSocket server introduces peers. Game actions then travel over a
WebRTC data channel. Both browsers validate actions against the same seeded decks
and rules. Match IDs, action sequence numbers and seat checks reject stale or
out-of-turn protocol messages; this is **not an authoritative competitive server**.
Both clients can inspect their local seeded state, so hidden-hand anti-cheat is
not claimed. No ranked results, persistent collection or resume-after-disconnect
is implemented.

The current configuration uses public STUN discovery, not a managed TURN relay.
Restrictive NATs or firewalls can prevent a direct connection. Local two-browser
checks do not establish universal internet connectivity. The error state and
return-to-menu path remain usable if negotiation fails.

## Verification

```sh
npm test
npm run art:check
npx playwright install chromium
# In another terminal: PORT=4198 npm start
npm run test:browser
```

Browser tooling accepts `--url` and `--output`, plus `PLAYWRIGHT_MODULE` and
`PLAYWRIGHT_EXECUTABLE_PATH` for existing installations. Screenshots and
reports go under ignored `artifacts/`. CI installs its own browser and repeats the
checks. See [verification receipts](docs/VERIFICATION.md) for completed evidence.

## Maintain

- `cards.js`: templates, effects, deterministic decks.
- `game.js`: rules, validation and card/board rendering.
- `network.js`, `lobby.js`, `server.js`: peer protocol and room lifecycle.
- `card-art.js`, `assets/`, `scripts/build-card-art.cjs`: original vector artwork.
- `duel-ui.js`, `duel-ui.css`, `index.html`: collection, guide and responsive UI.

[Artwork guide](docs/CARD_ART.md) · [Original roadmap, retained as historical
notes](docs/ROADMAP_ORIGINAL.md). Mesh transport, deck building and persistent
collections remain future work, not shipped features. Existing project authorship
and licensing are unchanged; third-party dependency licenses accompany their npm
packages. No third-party illustrations were added.
