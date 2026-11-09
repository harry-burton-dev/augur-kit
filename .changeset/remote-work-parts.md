---
'@augur/app-kit': minor
'@augur/kit-common': patch
---

Quill's remote vocabulary gains `quill-check-list`, `quill-step-list` and `quill-paged-list`, so an app on the app contract can describe checks (each with its tone and one action, sent back as `act`), an ordered way through one job (`act`), and a list shown a page at a time (`open`, and `more` when `total` is above the items sent). The shell draws them with Common's CheckList, StepList and PagedList. Nothing is renamed or removed. In Common, a SectionDialog's section now gives its last child the room left, so a single child fills it without a grid of its own.
