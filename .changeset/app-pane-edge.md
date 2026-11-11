---
"@augur/shell-kit": minor
---

The Shell draws the open app's pane at the window's right edge (`pane` prop, a render function given the
clock and notification indicator for its top and whether to open over the page). While it is drawn, the
indicator and the clock leave the band, and the stage, the band and the floor picker end where the pane
starts: the shell sets `--pane-inset` and `--gauge-right` from its width. The indicator's words are now in
`aerie-status-words`, so the pane's strip can show only its dot.
