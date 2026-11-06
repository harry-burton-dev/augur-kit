---
'@augur/app-kit': patch
---

The radial menu's stories follow Carbon's Storybook layout. `RadialMenu` and `RingProvider` each have an Overview page built from their own comment and props. The controls are the part's own props, and each story stages the part in a minimal page. The sample actions live in `radial-menu.fixture.ts`, which isn't built. Storybook now has the Docs addon, and it reads prop comments through imported types, so any part tagged `autodocs` gets the same kind of page. Every prop of `RadialMenu` and `RingProvider` now has a comment.
