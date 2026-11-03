# @augur/kit-bundle

## 0.3.0

### Minor Changes

- 31ed7bf: Accessibility pass (PER-281, PER-170).

  - Common: `AskTwice`, a danger action that needs a second, deliberate press. Its first press says what the second does (`confirm`), announced politely; it goes back after `armFor` (the `motion-still` token), on Esc or when focus leaves, and takes `disabled` with a `reason` like every button. `Button` gains `confirmLabel` and `onArmedChange` for danger buttons, and announces the armed state from a status beside it rather than from the button. `Progress` is named by its label.
  - Every kit: Reduce motion stops every loop (ping, spinners, running bars, shimmer, breathing), under the system setting and under AUGUR's own switch (`data-motion="reduce"` on `<html>`), and the centre menu drops its transitions under both. A test checks every infinite animation.
  - Aerie: the stage is the page's one `main` landmark, named for the open app. A polite live region says each new thing that needs you once, never what was there when the Shell first drew. Every icon-only control (band ways, the handle, the dome, Dismiss) shows its name on hover and focus. Where you are is read from hidden text instead of an `aria-label` on a paragraph. Floors move with Alt+Page Up and Alt+Page Down; Page Up and Page Down alone are the app's.
  - Quill: a reel card's name is its own words in the order they show.
  - Storybook: axe runs on every story in `pnpm test`, failing on a serious or critical finding, and the stories are found again (the glob pointed outside the repository, so Chromatic got none).

### Patch Changes

- Updated dependencies [31ed7bf]
  - @augur/kit-common@0.5.0
  - @augur/app-kit@0.5.1

## 0.2.1

### Patch Changes

- Updated dependencies [e0f4acc]
- Updated dependencies [4ae9d6e]
  - @augur/app-kit@0.5.0
  - @augur/kit-common@0.4.0

## 0.2.0

### Minor Changes

- 7c8111b: Add the app-frontend starter: `defineReactApp`, `placeRoutes` on TanStack Router, `useData`, `useChange` and `DataView` on TanStack Query, and `createAppClient` on openapi-fetch with one `AppError` (AUGUR's ADR 0054).

### Patch Changes

- Updated dependencies [7c8111b]
- Updated dependencies [b40a02b]
- Updated dependencies [a2384cc]
- Updated dependencies [e17264e]
  - @augur/app-kit@0.4.0
  - @augur/kit-common@0.3.0

## 0.1.0

### Minor Changes

- 464be02: The kit builds and releases from its own repository. New: the kit bundle, React, Common and Quill as ready-to-load files with a kit.json, released and signed as kit@<version>. Aerie is now published for the shell to build with.
