---
'@augur/shell-kit': minor
'@augur/kit-common': minor
'@augur/kit-bundle': minor
---

One logo button replaces the rail's Home and Apps: it starts the desktop bar and ends the rail, and goes to the desktop. `ShellModel.logo` takes the deployment's mark (the kit's placeholder `mark` icon until it sets one). `ShellModel.desktop` names the app drawn on the desktop (Home): while it's open the bar stays across the screen, resting at an edge like a taskbar, the background stays, and the app isn't offered again as a tile. New: `BarLogo`, `AppBar`'s `edges`, `restingStop`, `ShellModel.onDesk`, and Common's `mark` icon.
