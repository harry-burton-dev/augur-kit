---
"@augur/shell-kit": minor
"@augur/kit-common": minor
"@augur/kit-bundle": patch
---

Aerie's `PaneLayout` draws an app's pane in the layout it chose (focus, aside, split or canvas), with the inset contract on every one: the head and the screen share one inline inset and one width cap, the top clears the stage's fade, sections sit `section-gap` apart, and a pane narrower than `pane-tight-below` uses `edge-tight`. The About panel appears only in aside. New shell tokens `split-list` and `pane-tight-below`.
