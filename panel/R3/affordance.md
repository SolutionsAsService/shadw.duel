# R3 Affordance (Norman)

Verdict: PASS

**R2 change 1 (card faces): met.** All four enemy-targeting faces now name the selector stat and Ward: Scorch "lowest-DEF ... without Ward", Undertow and Wither "highest-ATK ... without Ward", Landslide "without Ward ... 500 DEF or less". Riptide reads "without Ward" too. A test in tests/expansion.test.cjs enforces "without Ward", ATK|DEF, and the 75-character limit. The conceptual model the face teaches now matches what the system does, so the R2 Wither/Sky Sovereign contradiction is gone.

**R2 change 2 (feedforward): met where hover or focus exists.** `renderPlayerHand` calls `previewTargets(card.targets(...))` on mouseenter and focus. In board-desktop.png, hovering Riptide outlines only Gloom Mite, marked dashed and labelled "would hit". Sky Sovereign and Crystal Sentinel show W and are not outlined. The mapping is natural and visible. The test checks that the preview equals what the spell then hits, so the feedforward cannot lie.

**Gulf of execution and evaluation.** Prediction: the face rule plus the W marks and stats, which board-phone.png shows legibly at 360px. Confirmation: the would-hit outline before casting, then after casting the impact outline, "Destroyed:" and ▼ stats, which now last the whole turn. Both gulfs are bridged.

**Residual, not an objection.** On touch screens there is no hover, and a tap plays the card at once, so phone players get no would-hit preview. They can still predict from the now-correct face text plus the visible W, ATK and DEF, and they confirm from the impact marks. That is knowledge in the world, which is enough. A later build could add a press-and-hold preview.
