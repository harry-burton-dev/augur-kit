---
'@augur/shell-kit': minor
---

The Shell draws the app bar and the backgrounds. On the desktop the bar runs across the chosen background, with a tile per group of apps and the open apps after a divider; with an app open it docks as the side rail, with Home, Apps, the open apps and the app's pages, and the app sits on flat ground. What needs you lights the way down to it. The model gains `groups`, `running`, `page`, `barHolds`, `barHint`, `backgroundOptions` and `backgroundSet`, apps gain `group`, `off` and `pages`, notifications gain `page`, settings gain `barStop`, and there are new events `ui-home`, `ui-page`, `ui-close-app` and `ui-bar-hint`. `background` now names a background (`horizon` by default); a water preset's name still means the water.

Breaking for the shell: the band no longer draws `navs` or Back (the fields stay so a host still builds), and `CentreMenu` (Title and Orbit) is no longer exported. Its files are kept in `packages/shell-kit/archive/`.
