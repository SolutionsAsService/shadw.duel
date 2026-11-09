# Drawn: relics (`scripts/art-subjects/relics.cjs`)

Each relic is now drawn as an object sitting on something, seen in 3/4 view with a shadow. Its power is shown working on a creature of its element. None of them is a centred emblem in a ring.

| Card | Text | What the picture shows |
|---|---|---|
| Ember Core | flame +100 ATK | A faceted ember sits on a stone altar drawn in 3/4, with a shadow cast to the right. Flames lick up from it. A stream of fire arcs from the core into the raised claw of a charred fire elemental, whose head flares higher. |
| Crystal Heart | earth +100 DEF | A faceted crystal heart grows out of a dark rock, with crystal spikes around it. The heart casts a shadow on the rock's top. A stone golem raises its arm and holds a crystal shield made of the heart's light. |
| Void Shard | shadow +100 ATK | A black shard is driven at an angle into the ground, with cracks and a lit shadow pool at its base. Tendrils of shadow run along the ground into a hooded wraith, whose claws stretch out into white blades. |
| Tidestone | water +100 DEF | A pearl sits in an open, scalloped clam on a sea rock, with a cast shadow. Its tide coils out and wraps a sea turtle in a curling wall of water, which acts as a shield. |
| Storm Feather | wind +100 ATK | A large feather is stabbed at an angle into a crag, with a shadow on the ground. Lightning jumps from its vane to a diving hawk, and the hawk's talons crackle. |
| Sun Sigil | light +100 ATK / +100 DEF | A sun disc stands on a temple pillar. The disc is tilted in 3/4, its thick edge shows, and its rays are thin. Its beam falls on a kneeling knight who lifts both a sword (ATK) and a shield (DEF). |
| War Banner | all +50 ATK / +50 DEF | A tattered banner is planted on a hilltop, and its pole casts a shadow downhill. Four soldiers climb toward it from both sides with spears raised and shields up. |

## card_art.py (all 75, `/tmp/claude-0/draw-relics-all`)

All 7 cards pass in every window. The only flags left are `noise` at board-390 and board-360, on Ember Core, Storm Feather and Sun Sigil.

| Card | worst sep | max off | min area | max clip | nearest twin |
|---|---|---|---|---|---|
| Ember Core | 1.615 | .103 | .234 | 0 | Void Shard .476 |
| Crystal Heart | 1.612 | .072 | .282 | 0 | Stone Guardian .474 |
| Void Shard | 1.640 | .092 | .253 | 0 | Barrier .496 |
| Tidestone | 2.067 | .078 | .316 | 0 | Mossback Tortoise .482 |
| Storm Feather | 1.912 | .049 | .208 | 0 | Turning Gale .507 |
| Sun Sigil | 1.701 | .022 | .288 | .011 | Tide Serpent .455 |
| War Banner | 1.615 | .050 | .28 | 0 | Tide Serpent .527 |

- **Worst sep:** 1.612, Crystal Heart, in the hand window.
- **Nearest twin:** 0.527, War Banner and Tide Serpent. There are no twin pairs across the set.
- **Size:** each subject is 1.7 to 3.4 kB of markup.

## Notes

- **Shadows on the ground:** a dark shadow drawn on the dark ground lowers sep. Crystal Heart therefore casts its shadow on its own rock instead of on the ground. Void Shard has a lit pool of shadow at its base.
- **Void Shard size:** the build enlarges Void Shard by 1.2 (`enlarge`), so its drawing is kept smaller and shifted left to allow for that.
- **Build check:** `build-card-art.cjs --check` reports these cards as stale in `assets/`. That is expected, because the conductor rebuilds `assets/`.
