---
'@augur/app-kit': patch
'@augur/kit-common': minor
---

The editor no longer fails to draw in a real browser. When an editor is replaced, as on a remount, its toolbar stops reading the old, destroyed editor. Chromatic found this in the Writing and Editor states stories.

A virtual `Table` is now at most `measure-table-virtual` tall (a new app token, 640px) and scrolls inside itself. Before this it grew to every row's height, 280,000px for the 5,000-row story, so only the first screen of rows was ever drawn and Chromatic couldn't capture it.
