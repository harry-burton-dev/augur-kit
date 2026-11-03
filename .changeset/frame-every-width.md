---
'@augur/app-kit': minor
'@augur/kit-common': minor
'@augur/kit-bundle': minor
---

The app frame keeps one layout at every width, by its own width (a container query): below `frame-overlay-below` (1100 px) the drawer keeps its strip and opens over the page, and below `frame-icons-below` (800 px) the rail folds to its icons and opens over the page. Overlays close on Escape, on a press outside them, or when a section is picked; the person's own choice to fold is kept for wider widths. Two new structure tokens hold the widths.
