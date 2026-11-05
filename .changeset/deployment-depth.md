---
'@augur/kit-common': minor
'@augur/app-kit': minor
---

A deployment can choose how depth is drawn (PDR-010, amendment 2). Its `FOCUS_DEPTH` setting reaches the page as an `augur-depth` meta. FocusStage, and so AppFrame, draws that depth over the app's own `depth`, because the choice is about the org's machines; `deploymentDepth()` reads it. With `scrim`, for desktops without a GPU, Common also stops every backdrop blur and makes the see-through surfaces solid.
