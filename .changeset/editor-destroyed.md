---
'@augur/app-kit': patch
---

The editor no longer fails to draw in a real browser. When an editor is replaced, as on a remount, its toolbar stops reading the old, destroyed editor. Chromatic found this in the Writing and Editor states stories.
