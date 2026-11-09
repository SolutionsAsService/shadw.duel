# Run 2 R2 Access (Game Accessibility Guidelines)

Verdict: OBJECT. One change, and it is small.

**What passes.** The five trigger words come first on every ability and are always followed by a colon. `TRIGGER_RULES` explains them in the detail panel, which touch players open with ⓘ and keyboard players with I (*"Provide a means to look up rules"*, *"Use simple clear language"*). Abilities are short (median 52 characters), so a first-time player has a manageable load. Ability text is #a9afbd on #171c26, about 8:1 contrast. The redrawn art keeps one subject with a clear silhouette against its scene. The element shape marks and G/W are still there, so colour is not the only cue (*"Ensure no essential information is conveyed by a colour alone"*). On the 360px board the marks and the Ready pill stay readable.

**The objection.** On the hand card, where a player decides what to play, the ability is set at 9px: `#player-hand .card .card-text { font-size: 9px }` in duel-ui.css. In board-phone.png it is the faintest text on the screen. A low-vision player cannot read it without opening every card. tests/text-fit.cjs only checks that the text is not clipped at 9px, so the same test would also pass at 6px. This fails *"Use an easily readable default font size"* (basic).

**Change (buildable).**
1. Set hand-card ability text to at least 11px (keywords at least 10px) at 390px and at 1280px. Add a check to tests/text-fit.cjs that the computed `font-size` of `.card-text` is at least 11px, alongside the clip check. If the longest texts (95 characters) then clip, give the card more height or shorten the text; do not shrink the font back.
