# Verification

## Verified outcome — 2026-09-30

The final full Chromium run passed **7 of 7 browser scenarios** and captured **18 screenshots** against the local preview. It reported **zero page exceptions and zero failed local HTTP requests**.

- All 55 unique SVG card images decoded successfully.
- Real WebRTC host/guest sessions agreed on canonical snapshots after legal card plays, attacks, ten turn transitions, surrender and a consented rematch.
- Off-turn input left state unchanged; the host could not restart without guest consent.
- Disconnect produced an interrupted match with `winner: null`; fresh create/join/start succeeded afterward.
- At 1440, 768, 390 and 360 CSS pixels, the checked screens had no page-level horizontal overflow. Mobile/tablet card details remained inside the viewport, field stats fit inside their cards, inspect targets measured at least 24px and primary duel controls at least 40px.
- Inspection on unavailable cards remained enabled, inspection did not spend resources, and actual HUD energy/deck/life/bar values matched engine state.
- Menu and reference dialogs locked background scrolling. Desktop collection and 360px board/detail screenshots were also visually reviewed.

The accompanying Node suite passed 58 tests, and the SVG generation/check command passed. Browser QA initially exposed disabled inspection semantics, undersized tablet controls and stale HUD values; the final run verifies their fixes.

## Automated checks

```sh
npm ci
npm test
npm run art:check
npx playwright install --with-deps chromium
HOST=127.0.0.1 PORT=4198 npm start
# In another terminal:
npm run test:browser -- --url http://127.0.0.1:4198 --output artifacts/browser
```

The browser suite uses the installed Playwright package by default. Existing managed browser installations can set `PLAYWRIGHT_MODULE` to their Playwright module and `PLAYWRIGHT_EXECUTABLE_PATH` to their Chromium executable. Platform-specific shared libraries may also require `LD_LIBRARY_PATH`.

The test launches **one browser** with isolated host/guest contexts. Its online scenarios establish a real WebRTC data channel through the running application's real WebSocket signaling server. Assertions read canonical engine snapshots; normal gameplay and lobby flows use UI interactions rather than seeded or injected gameplay fixtures.

### Browser coverage

- Menu and all 55 unique SVG artworks decode.
- Collection type/element/search filters, empty results, reset, read-only inspection, rules and Escape dismissal.
- Local legal hand plays, turns, read-only card inspection by button and keyboard, life/energy counters, surrender and restart.
- Desktop (1440px), tablet (768px), and mobile (390px and 360px) page overflow, card details, field-stat containment, control hit targets and screenshots.
- Invite URL, create/join, guest readiness, host start, correct seats.
- Real peer card plays and attacks, ten turn transitions, canonical snapshot convergence and blocked off-turn interaction.
- Surrender agreement, mutual rematch consent and new seed, interrupted disconnect with no winner, menu cleanup and fresh rejoin.
- Browser exceptions and failed local HTTP requests.

### Evidence

The suite writes ignored artifacts to `artifacts/browser/`: screenshots and a machine-readable `report.json`, including scenario names, viewport measurements, browser exceptions, failed local requests and any failure stack. Screenshots are real rendered application pages, not mockups.

### Scope limits

Loopback/browser-context testing does not establish connectivity across every external NAT or firewall. The application uses public STUN discovery and direct WebRTC; no TURN relay is bundled. There is no central game-state authority, account system or ranked-result verification. Node tests exercise invalid/replayed protocol messages independently of the browser's ordinary UI flows.
