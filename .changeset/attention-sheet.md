---
'@augur/kit-common': minor
'@augur/app-kit': patch
'@augur/shell-kit': minor
---

Dialogs, notices and toasts in the Sheet look (picked 6 Nov 2026). Dialog is a solid square sheet with a mono heading strip and a ruled footer, over a dimmed page with no blur; a failure is stamped "Not done". New in Common: one notice family, `Notice` (inline or actionable, its tone stamped as a word in mono; new `label` prop), `Toast` and `Toasts` (their time left drains along the bottom edge and stops while held). Quill's `Notice` and Aerie's `Toasts` are now Common's, under the same names.
