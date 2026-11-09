---
'@augur/shell-kit': minor
'@augur/app-kit': minor
---

The shell's own bar draws the open app's places through RailPlaces when any of its pages `fills`. It is fed from the model: `ShellPage.path` and `fills`, `ShellModel.under` (by app, then place), `underCap` (the deployment's number, 50 unless it says) and `path`. Choosing a thing under a place, or "and n more", calls `openPath` and fires `ui-path` with `{ app, page, path }`. Pages that don't fill look as before. RailPlaces gains `onPlace`, `currentPlace`, `lit` and `lead`, and `onOpen` now also gives the place.

Quill: a thing an app marks for the shell's radial menu. List items and kind tiles take `thing: { kind, id?, label? }`, and a table takes `thing: { kind, label? }` (label is a column key) for all of its rows. Each is drawn as `data-thing`, `data-thing-id` and `data-thing-label`, and the remote vocabulary carries the same. A kind that isn't a short lower-case word is dropped with a reason. `thingProps` is exported.
