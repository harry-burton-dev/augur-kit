---
'@augur/kit-common': minor
'@augur/app-kit': patch
'@augur/shell-kit': patch
---

`Tag` (with `TagProps`) moves from Quill into Common, so Aerie can draw the same tags (PDR-016). Quill still exports it, through Common, under the same name, and it looks the same; its classes are now `augur-tag*`. Common also gets `Tags`, a row of tags that folds the rest behind "+N more" past a `limit`. Both have their own Storybook pages, under Common/Tag.
