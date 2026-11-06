---
'@augur/kit-common': minor
'@augur/app-kit': minor
---

The radial menu has two rings. Its actions are wedges in a solid disc, each in its fixed direction with its name inside, and Cancel sits in the hub. An action's targets fan out on an outer ring in its direction, up to five (`RING_TARGETS_MOST`), and open as a list beside it past that. The ring opens where it was opened and moves in from an edge whole, so no verb changes direction. Keys 1 to 8 pick a direction. One readout under the ring says where you are (thing, verb, place), why an action can't be done and who can change it, and what a choice would change. Unavailable actions are hatched and locked, the selected one is ink, and danger is the only colour. A held action fills the hub. The disc has no blur or shadow and opens with one quick fade. New Quill tokens: `ring-hub`, `ring-outer`, `ring-band` and `ring-seam`. Every prop and type an app passes today works as before.
