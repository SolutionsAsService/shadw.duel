# Shadow Duel completion contract

Goal: a playable local and two-browser online duel with reliable advertised
card effects, readable controls and original SVG art for all 55 source templates.

Keep the existing vanilla browser/Express/WebSocket/WebRTC architecture. No
framework rewrite or paid service is needed. Existing Node and browser tooling
are available; use D: for dependencies and caches. GM tools are unavailable;
native Git, rg and Node are the verified fallback.

Independent scopes: rules and card definitions; lobby/signaling/network lifecycle;
original SVG artwork. Parent integrates the interface, collection/help views,
tooling and documentation. No overlapping file edits or recursive repair lanes.

Verification gates: every card effect and advertised keyword has a working,
tested rule; illegal/out-of-turn actions do not mutate or transmit game state;
identically seeded peers converge; real browser local play and two-peer lobby,
ready/start/play/end/surrender/rematch/disconnect flows work; all SVG paths load;
desktop/mobile layouts expose usable controls with no page exceptions.

Delivery preserves upstream changes, uses verified Git identity and distinguishes
tested local/LAN WebRTC from untested internet NAT traversal. Push tested code,
verify CI, and leave a runnable local preview with accurate setup instructions.
