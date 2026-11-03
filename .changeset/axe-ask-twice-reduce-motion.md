---
'@augur/kit-common': minor
'@augur/shell-kit': minor
'@augur/kit-bundle': minor
'@augur/app-kit': patch
---

Accessibility pass (PER-281, PER-170).

- Common: `AskTwice`, a danger action that needs a second, deliberate press. Its first press says what the second does (`confirm`), announced politely; it goes back after `armFor` (the `motion-still` token), on Esc or when focus leaves, and takes `disabled` with a `reason` like every button. `Button` gains `confirmLabel` and `onArmedChange` for danger buttons, and announces the armed state from a status beside it rather than from the button. `Progress` is named by its label.
- Every kit: Reduce motion stops every loop (ping, spinners, running bars, shimmer, breathing), under the system setting and under AUGUR's own switch (`data-motion="reduce"` on `<html>`), and the centre menu drops its transitions under both. A test checks every infinite animation.
- Aerie: the stage is the page's one `main` landmark, named for the open app. A polite live region says each new thing that needs you once, never what was there when the Shell first drew. Every icon-only control (band ways, the handle, the dome, Dismiss) shows its name on hover and focus. Where you are is read from hidden text instead of an `aria-label` on a paragraph. Floors move with Alt+Page Up and Alt+Page Down; Page Up and Page Down alone are the app's.
- Quill: a reel card's name is its own words in the order they show.
- Storybook: axe runs on every story in `pnpm test`, failing on a serious or critical finding, and the stories are found again (the glob pointed outside the repository, so Chromatic got none).
