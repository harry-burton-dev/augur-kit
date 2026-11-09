# @augur/kit-bundle

## 0.5.13

### Patch Changes

- Updated dependencies [479b7ef]
- Updated dependencies [479b7ef]
- Updated dependencies [479b7ef]
- Updated dependencies [eeb9ed3]
  - @augur/app-kit@0.17.0
  - @augur/kit-common@0.15.0

## 0.5.12

### Patch Changes

- Updated dependencies [99d782c]
  - @augur/app-kit@0.16.0
  - @augur/kit-common@0.14.0

## 0.5.11

### Patch Changes

- Updated dependencies [5f85a4f]
  - @augur/app-kit@0.15.0

## 0.5.10

### Patch Changes

- Updated dependencies [d07a1eb]
  - @augur/kit-common@0.13.0
  - @augur/app-kit@0.14.1

## 0.5.9

### Patch Changes

- Updated dependencies [02c69ee]
  - @augur/app-kit@0.14.0
  - @augur/kit-common@0.12.0

## 0.5.8

### Patch Changes

- Updated dependencies [ab0fea1]
  - @augur/app-kit@0.13.0
  - @augur/kit-common@0.11.0

## 0.5.7

### Patch Changes

- Updated dependencies [26ee249]
- Updated dependencies [c61d798]
- Updated dependencies [c1c66b8]
- Updated dependencies [5e55ec3]
- Updated dependencies [fdce175]
- Updated dependencies [0f8bfbd]
- Updated dependencies [7cc358d]
- Updated dependencies [e0c4073]
- Updated dependencies [958f774]
- Updated dependencies [c3c5603]
- Updated dependencies [0c1a803]
- Updated dependencies [eb64aa2]
- Updated dependencies [704c086]
- Updated dependencies [6aee7af]
- Updated dependencies [703ff74]
- Updated dependencies [24fccd7]
- Updated dependencies [d68bc06]
- Updated dependencies [f1742c3]
- Updated dependencies [0689319]
- Updated dependencies [f3241f3]
- Updated dependencies [4244f65]
- Updated dependencies [1968b92]
- Updated dependencies [ea33587]
- Updated dependencies [b5abdb1]
- Updated dependencies [4cd0e2b]
- Updated dependencies [6161ade]
- Updated dependencies [6cb8608]
  - @augur/kit-common@0.10.0
  - @augur/app-kit@0.12.0

## 0.5.6

### Patch Changes

- Updated dependencies [4d13d4f]
  - @augur/kit-common@0.9.0
  - @augur/app-kit@0.11.0

## 0.5.5

### Patch Changes

- Updated dependencies [a8a7372]
  - @augur/app-kit@0.10.0

## 0.5.4

### Patch Changes

- Updated dependencies [d7d504c]
  - @augur/kit-common@0.8.0
  - @augur/app-kit@0.9.0

## 0.5.3

### Patch Changes

- Updated dependencies [fe744dd]
- Updated dependencies [f24fa98]
  - @augur/app-kit@0.8.0

## 0.5.2

### Patch Changes

- Updated dependencies [799176a]
  - @augur/app-kit@0.7.1

## 0.5.1

### Patch Changes

- Updated dependencies [d39aece]
- Updated dependencies [24828f6]
  - @augur/app-kit@0.7.0

## 0.5.0

### Minor Changes

- afc6305: Common now carries reduced motion and its typefaces, which the Lit kit's `base.css` used to give the shell. Each movement token has its reduced value in the token files (`$extensions.augur.reduced`), and `tokens.css` sets those under `prefers-reduced-motion: reduce` and under `data-motion="reduce"` on `<html>`: moves become near-instant, loops stop and nothing travels. The new `@augur/kit-common/fonts.css` holds Jost and Nunito from Fontsource, with their files next to it. The kit bundle serves it as `fonts.css` with `fonts/`, and lists it in `kit.json`'s `styles` after `tokens.css`, so a shell that links the bundle's styles needs no Fontsource of its own.

### Patch Changes

- Updated dependencies [afc6305]
  - @augur/kit-common@0.7.0
  - @augur/app-kit@0.6.1

## 0.4.0

### Minor Changes

- 92c7f8a: The app frame keeps one layout at every width, by its own width (a container query): below `frame-overlay-below` (1100 px) the drawer keeps its strip and opens over the page, and below `frame-icons-below` (800 px) the rail folds to its icons and opens over the page. Overlays close on Escape, on a press outside them, or when a section is picked; the person's own choice to fold is kept for wider widths. Two new structure tokens hold the widths.

### Patch Changes

- Updated dependencies [92c7f8a]
  - @augur/app-kit@0.6.0
  - @augur/kit-common@0.6.0

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
