---
'@augur/app-kit': minor
---

Adds the door gallery's model: `DoorDescriptor` (a door as plain configuration, with `door.schema.json` and `validateDoor`), and `scoreDoors`, a pure scorer that turns signals into each door's step (quiet, present, strong, needs you) and its reasons. Its weights and thresholds are a rule (`DEFAULT_RULE`) an app can tune; "needs you" comes only from something the person can act on, and at most two doors are strong. `placeDoors` sends doors past the cap to the radial menu.
