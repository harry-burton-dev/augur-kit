---
'@augur/kit-common': minor
'@augur/app-kit': patch
'@augur/shell-kit': patch
---

`Status` (with `statusWords`, `statusUrgency`, `StatusName` and `StatusProps`) moves from Quill into Common, so Aerie can draw the same marks (PDR-016). Quill still exports it, through Common, under the same names; nothing about how it looks changes. Its classes are now `augur-status*`, and it has its own Storybook page, Common/Status.
