---
'@augur/app-kit': minor
---

The radial menu gains what the "radial menu" design needs, all optional, so every caller keeps working:

- `RingAction.slot` (`RingSlot`, `RING_SLOTS`): eight fixed directions, so a verb is always in the same place. Danger without a slot sits at the bottom; the rest fill clockwise from the top. A tile's ring now uses eight positions 45° apart.
- `RingAction.targets` (`RingTarget`): an action can open the places it can go to. Choosing one calls `onAction(action, target)`; `RingSubject.onAction` is now `(id, target?) => void`.
- `RingAction.preview`: what choosing it would change, shown in one readout under the menu and read out politely.
- `RingAction.owner` and `RingSubject.onAsk`: an unavailable action reads its reason and owner, and choosing it asks the owner.
- `RingAction.hold` (defaults to `danger`): hold to confirm, for the length of `motion-run`; with reduced motion, press twice.
- `RingMore`: a visible "more" mark that opens the same menu, for anyone who doesn't know about right-click.
