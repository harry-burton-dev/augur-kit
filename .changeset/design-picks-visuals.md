---
'@augur/kit-common': minor
'@augur/app-kit': minor
---

The four design picks' visuals (PER-283), each off until an app turns it on:

- `Letterbox` takes `look: 'see-through'`: solid cinema bars that close in from the edges, and a frame that is a window onto the work behind, racked to the deep plane. It also takes `more` (and `moreLabel`): what doesn't fit waits behind a More control and shows in place, so the frame never scrolls.
- `RingProvider` and `AppFrame` take `overflow` / `ringOverflow: 'more'`: past eight actions the ring keeps the first seven in their slots and puts More in the slot left free (north-west when it is). More opens the rest as a ring of their own (a list past eight more); Esc comes back to More. `pageActions` and `RING_MORE_ID` are exported. The readout moves below an unavailable action's reason at the bottom of the ring instead of covering it.
- `PathTree` takes `trail: 'draw'`: when the path changes, the lit line draws itself from the top down to where you are, a level at a time (new token `motion-trail`). Reduced motion draws it at once.
- Storybook: "Design direction/The four picks", one story per pick and one with all four.
- `List` takes `ringFor`: right-click or a long press on a row's words, or its "more" mark, opens the row's radial menu.
