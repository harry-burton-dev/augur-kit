---
'@augur/kit-common': patch
'@augur/app-kit': patch
'@augur/shell-kit': patch
---

Muted text comes from the `ink-muted` token, never from transparency (WCAG 2.2, 1.4.3). Placeholders (fields, selects, the editor, the Shell's search) use `ink-muted` as it is, not a see-through mix of it. Someone away, a seen event, a read notification, a settled thread and a locked tile step back in `ink-muted` instead of fading, so their words keep 4.5:1; their pictures still fade. Only an inactive control still fades.
