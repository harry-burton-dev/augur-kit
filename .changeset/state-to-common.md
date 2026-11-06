---
'@augur/kit-common': minor
'@augur/app-kit': patch
'@augur/shell-kit': patch
---

`State` and `StateBoundary` (with `StateKind`, `StateProps` and `StateBoundaryProps`) move from Quill into Common, so Aerie can say empty, loading, error and offline the same way (PDR-016). Quill still exports them, through Common, under the same names, and they look the same as #58 left them; their classes are now `augur-state*` (the mark is `augur-state-sign` and the running line `augur-state-run`). Their Storybook page moves to Common/State.
