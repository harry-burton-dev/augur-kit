---
'@augur/shell-kit': minor
---

A Shell function can now be unavailable: `ShellFunction` takes an optional `unavailable` reason, as navs do. The button stays on the arc and focusable, looks unavailable, carries `aria-disabled` and the reason in its name and hover name, and pressing it does nothing.
