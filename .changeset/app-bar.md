---
'@augur/kit-common': minor
'@augur/shell-kit': minor
---

Aerie gets the app bar (`AppBar`) and the still horizon (`Horizon`), ported from Harry's app bar mockup: a bar of tiles on the desktop that open start menus, which docks as the side rail when an app opens, with light for what needs you. Common gets the Horizon greys, the needs light, the bar's sizes and its glide as shell tokens, and the icons the bar uses.

Common draws every scroll bar thin in its own colour (the new `scrollbar` token) instead of the browser default, since anything that must scroll should look like the kit.
