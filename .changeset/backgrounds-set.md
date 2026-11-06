---
'@augur/shell-kit': minor
---

Aerie's backgrounds become a set to choose from: `Background` draws one by id (`horizon`, `flat`, `water`, `none`, or a deployment's own through `set`), with that background's own `options`. The still horizon can set where its line and rules sit and whether it glows; `Flat` is new (one grey, optionally tinted by the floor); `WaterGround` is the water as a part. Each has its own Storybook page under Aerie / Backgrounds, and their CSS moves out of the app bar's and the shell's into `backgrounds.css`. The horizon looks as it did by default.
