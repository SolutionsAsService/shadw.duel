# Shadow Duel

**Shadow Duel** is an original browser-based two-player trading-card duel game built as a lightweight, extensible web game.

The project is being developed from a local, pass-the-device prototype into a **peer-to-peer multiplayer card game** designed to eventually operate over decentralized networking and mesh infrastructure.

The core game is intentionally built so that the **rules engine remains separate from the interface and networking layer**. This allows the same duel engine to run locally today and communicate with another player's browser in the future.

---

## Current Direction

Shadow Duel is evolving through several stages:

```text
Local Browser Duel
       ↓
Improved Game Engine
       ↓
Peer-to-Peer Multiplayer
       ↓
WebRTC / Direct Player Connections
       ↓
Decentralized / Mesh Connectivity
```

The current version is playable locally in a browser.

The networking layer is intentionally being developed separately from the game rules so that multiplayer does not require putting the game state on a centralized game server.

The long-term goal is a lightweight **1v1 P2P card game** where two browsers exchange validated game actions rather than relying on a centralized server to control the duel.

---

## Features

The current game includes:

* Two-player 1v1 duels
* 8,000 starting Life Points
* Individual decks and hands
* Monster cards
* Spell cards
* Relic cards
* Five monster field slots
* Energy-based card costs
* Monster ATK and DEF
* Element types
* Card rarities
* Card keywords
* Summoning sickness
* Direct attacks
* Monster combat
* Overflow combat damage
* Healing
* Damage effects
* Buffs and debuffs
* Burn effects
* Lifesteal
* Guard
* Swift
* Piercing
* Ward
* Stun effects
* Death and victory conditions
* Turn-based energy progression
* Card draw
* Hand limits
* Combat selection
* In-game event log
* Card detail interface
* Responsive desktop and mobile interface
* Dark fantasy / premium tabletop visual design
* Main menu with local and online modes
* Player lobbies with 4-character join codes
* Shareable lobby invite links (`?lobby=CODE`)
* Waiting room with player slots
* Online 1v1 duels over WebRTC data channels
* Deterministic seeded decks for synchronized matches
* Surrender and rematch support
* Live connection status and latency display

---

## Project Structure

The project currently uses a simple root-level structure:

```text
Shadow Duel/
│
├── CHANGELOG.md
├── README.md
├── package.json
├── server.js
│
├── index.html
├── style.css
├── cards.js
├── game.js
├── network.js
└── lobby.js
```

### `package.json`

Defines the Node.js project, dependencies, and startup command.

The current application uses Express for local web serving.

### `server.js`

Runs the lightweight Express server, serves the Shadow Duel application, and hosts the **WebSocket lobby / signaling service** used to create and join lobbies and to introduce two browsers to each other.

At the current stage, the server is primarily a **web host + matchmaker** rather than the authority for the duel itself.

The long-term architecture may use the server for things such as:

* Peer discovery
* Matchmaking
* WebRTC signaling
* Session coordination
* Authentication
* Connection setup
* Reconnection coordination

The actual duel state is intended to remain on the participating clients rather than being stored as centralized server-side game state.

### `index.html`

Contains the structure of the game interface:

* Top navigation
* Player information
* Opponent information
* Battlefield
* Monster zones
* Hands
* Relics
* Life display
* Energy display
* Deck display
* Turn controls
* Event log
* Card details
* Network status
* Game-over screen

### `style.css`

Contains the complete visual system for Shadow Duel.

The interface is designed around a combination of:

* Modern Vercel-style web UI
* Dark fantasy
* Trading-card-game interfaces
* Magic/tabletop-inspired battlefield presentation
* Responsive mobile layouts
* Subtle lighting and glow effects
* High-contrast game information

There are no external CSS frameworks required.

### `lobby.js`

Owns screen flow outside the duel itself:

* Main menu (local duel / create lobby / join lobby)
* Lobby creation and join-by-code (or shareable `?lobby=CODE` link)
* Waiting room with player slots and invite copying
* Match start handshake (host picks the deterministic seed)
* Bridges `ShadowNet` (network.js) and `ShadowDuelGame` (game.js)
* Connection status and network panel updates

### `network.js`

Browser P2P layer (`ShadowNet`). The WebSocket server is used only for lobby creation and WebRTC signaling; once the two browsers connect, all game traffic flows directly over a WebRTC DataChannel.

### `cards.js`

Contains the card definitions and card-building system.

Cards currently support concepts such as:

* Monsters
* Spells
* Relics
* Elements
* Rarities
* Energy costs
* ATK
* DEF
* Keywords
* Card descriptions
* Effects

Card templates are separated from the actual cards used during a duel.

This makes the card system easier to expand without rewriting the game engine.

To add additional cards, new card templates can be added to `cards.js`.

### `game.js`

Contains the core Shadow Duel rules engine.

It handles:

* Player state
* Decks
* Hands
* Battlefield state
* Life Points
* Energy
* Turns
* Card play
* Monster summoning
* Spells
* Relics
* Combat
* Damage
* Healing
* Status effects
* Victory conditions
* Rendering game state
* Event logging

The game engine is deliberately being kept separate from the eventual networking layer.

---

# Game Rules

## Starting the Duel

Each player begins with:

* **8,000 Life Points**
* A shuffled deck
* **5 cards in hand**

The first player begins the duel.

The starting player receives the appropriate starting-turn draw according to the current game engine.

---

## Turns

During your turn you can:

1. Draw a card
2. Play a monster
3. Play spells
4. Play relics
5. Attack with eligible monsters
6. End your turn

Each player has an energy pool that controls which cards they can play.

Energy increases as the duel progresses, up to the current maximum.

---

## Monsters

Monsters occupy one of five battlefield slots.

Each monster has:

* Name
* Element
* Rarity
* Energy cost
* ATK
* DEF
* Keywords
* Card text

A player can currently summon up to one monster during their turn.

Unless a monster has an ability such as **Swift**, newly summoned monsters normally cannot attack during that same turn.

---

## Combat

A monster can attack an opposing monster or attack the opponent directly when the opposing battlefield contains no monsters.

When monsters fight:

```text
Attacker ATK vs Defender ATK
```

The monster with lower ATK is destroyed.

If the attacking monster has higher ATK, the difference is dealt to the opposing player's Life Points.

For example:

```text
Attacker: 700 ATK
Defender: 400 ATK

Difference: 300

Defender is destroyed.
Opponent takes 300 damage.
```

Combat can also interact with card keywords and effects such as:

* Piercing
* Lifesteal
* Guard
* Burn
* Stun
* Temporary ATK bonuses

---

## Spells

Spells are one-time effects that consume energy.

Current spell mechanics include effects such as:

* Healing
* Direct damage
* Drawing cards
* Temporary combat bonuses
* Defensive effects
* Area-style damage
* Higher-cost powerful effects

The spell system is designed to be expanded through `cards.js` rather than requiring the core engine to be rewritten for every new card.

---

## Relics

Relics are persistent card effects that can be played from the player's hand.

The card system already supports relic definitions and relic state.

This provides a foundation for future mechanics such as:

* Permanent bonuses
* Elemental engines
* Passive abilities
* Resource manipulation
* Equipment-style effects
* Build-around strategies

---

# Card System

Shadow Duel currently uses a template-driven card architecture.

A card template describes what a card is:

```text
Card Template
     ↓
Card Instance
     ↓
Player Deck
     ↓
Player Hand
     ↓
Battlefield / Effect
```

This distinction is important for the future multiplayer system.

A networked match should not need to transmit executable JavaScript functions between players.

Instead, future network messages can identify cards and actions using deterministic identifiers, while each client resolves the corresponding rules locally.

---

# Game Engine Architecture

The project is intentionally being separated into logical layers.

```text
┌─────────────────────────────┐
│          UI / HTML          │
│      Battlefield Display    │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│        Game Renderer        │
│      Player Interaction     │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│       Shadow Duel Rules     │
│         game.js             │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│        Card Database        │
│         cards.js            │
└─────────────────────────────┘
```

Networking will eventually sit beside the game engine rather than replacing it:

```text
             Shadow Duel
                  │
       ┌──────────┴──────────┐
       │                     │
       ▼                     ▼
 Local Game Engine       Network Layer
       │                     │
       │                     ▼
       │              P2P / WebRTC
       │                     │
       └──────────┬──────────┘
                  │
             Other Player
```

---

# Planned P2P Architecture

The ultimate direction of Shadow Duel is a **direct player-to-player architecture**.

Instead of sending the complete game state to a centralized server, players will exchange validated actions.

Conceptually:

```text
Player A Browser
      │
      │  GAME ACTION
      │
      ▼
   P2P Link
      │
      ▼
Player B Browser
```

Examples of network actions may include:

```text
PLAY_CARD
ATTACK
END_TURN
ACTIVATE_EFFECT
SURRENDER
```

The network should communicate **intent and validated actions**, rather than arbitrary JavaScript or unrestricted client state.

For example:

```text
Player A
    │
    ├── PLAY_CARD(cardId)
    │
    ▼
Player B
    │
    └── Validate action locally
```

Both peers can then independently execute the same deterministic rules.

---

# Deterministic Multiplayer

A major architectural goal is deterministic game execution.

Both players should have:

* The same card definitions
* The same rules
* The same match configuration
* The same initial match seed
* The same sequence of validated actions

This allows both browsers to independently calculate the resulting game state.

The intended architecture is therefore closer to:

```text
          Match Seed
              │
       ┌──────┴──────┐
       ▼             ▼
   Player A       Player B
       │             │
       │   Actions   │
       └──────┬──────┘
              │
        Same Rules Engine
              │
              ▼
        Same Game State
```

This approach reduces dependence on centralized game servers and fits the project's eventual decentralized networking direction.

---

# Security Model

The future multiplayer system should not trust arbitrary client messages.

A peer should never be able to simply send:

```text
SET_LIFE_POINTS(999999)
```

or:

```text
WIN_GAME()
```

Instead, peers should exchange legal game actions.

For example:

```text
PLAY_CARD
ATTACK
END_TURN
```

The receiving game engine verifies:

* Whose turn it is
* Whether the card exists
* Whether the card is actually in the player's hand
* Whether the player has enough energy
* Whether the target is legal
* Whether the monster can attack
* Whether the action is valid under the current game state

The networking layer should therefore transport game actions while the rules engine remains responsible for determining whether those actions are legal.

---

# Current Networking Status

The interface already contains areas reserved for multiplayer information, including:

* Connection status
* Peer information
* Network state
* Latency
* Match state

These are currently preparation for the networking phase.

The current game remains playable without a network connection.

---

# Playing Online

Start the server, then open the game in two browsers (or two devices on the same network):

1. **Player 1** clicks **CREATE LOBBY**, enters a name, and shares the 4-character code (or clicks the code to copy an invite link).
2. **Player 2** clicks **JOIN LOBBY** (or opens the invite link), enters the code and their name.
3. Once the peer-to-peer connection is established, **Player 1** presses **START DUEL**.

Both browsers build identical decks from the host's match seed and exchange validated actions directly over WebRTC — game state never touches the server.

---

# Local Development

Install the dependencies:

```bash
npm install
```

Start the server:

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

The game should load directly in your browser.

---

# Development Philosophy

Shadow Duel is intentionally being built incrementally.

The project prioritizes:

* Simple browser deployment
* No unnecessary framework dependencies
* A readable JavaScript codebase
* A modular card system
* Deterministic game rules
* Mobile-friendly UI
* P2P-ready architecture
* Decentralized networking
* Expandability

The goal is to avoid building a giant centralized backend just to run a two-player card game.

The browser should be capable of running the actual duel.

---

# Roadmap

## Phase 1 — Core Game

* [x] Basic browser game
* [x] Two-player duel
* [x] Life Points
* [x] Decks and hands
* [x] Monster combat
* [x] Spell cards
* [x] Energy system
* [x] Relic system foundation
* [x] Card keywords
* [x] Victory conditions
* [x] Event log
* [x] Responsive interface

## Phase 2 — Expanded Card System

* [x] Elements
* [x] Card rarities
* [x] Card costs
* [x] Advanced effects
* [x] Status effects
* [x] Temporary modifiers
* [ ] Larger card library
* [ ] More archetypes
* [ ] Deck-building system
* [ ] Card collection system
* [ ] More advanced relic mechanics

## Phase 3 — Multiplayer Foundation

* [x] Deterministic card identifiers
* [x] Match seed generation
* [x] Deterministic deck generation
* [x] Action serialization
* [x] Network action validation
* [x] Match synchronization
* [ ] Desync detection
* [ ] Reconnection handling

## Phase 4 — P2P

* [x] WebRTC connection
* [x] Peer discovery (lobby codes)
* [x] Matchmaking (create / join lobby)
* [x] Signaling
* [x] Connection negotiation
* [x] Latency monitoring
* [x] Peer disconnect handling
* [ ] Match recovery

## Phase 5 — Decentralized / Mesh Integration

The longer-term goal is to allow Shadow Duel to operate as an application on top of a broader decentralized networking environment.

Potential future capabilities include:

* Mesh peer discovery
* Local-network matches
* Internet P2P matches
* Offline/local multiplayer
* Distributed signaling
* Decentralized matchmaking
* Peer-hosted sessions
* Integration with the project's broader P2P infrastructure

The card game itself should remain lightweight enough to run on ordinary browsers and low-power devices.

---

# Design Goals

Shadow Duel is intended to feel like a real card game rather than a technical networking demonstration.

The interface therefore emphasizes:

* Clear battlefield hierarchy
* Strong card readability
* Fast interactions
* Mobile usability
* Meaningful visual feedback
* Dark fantasy atmosphere
* Premium tabletop presentation
* Minimal interface clutter

The technical architecture, meanwhile, is designed around:

```text
Simple
   +
Deterministic
   +
Peer-to-Peer
   +
Decentralized
   =
Shadow Duel
```

---

# License

See the repository's license and project documentation for applicable terms.
