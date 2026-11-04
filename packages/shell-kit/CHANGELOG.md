# @augur/shell-kit

## 0.5.1

### Patch Changes

- Updated dependencies [afc6305]
  - @augur/kit-common@0.7.0

## 0.5.0

### Minor Changes

- ea56160: The floor gauge keeps a lane of its own at the right edge, and the open app's stage ends where it starts, so the gauge never covers an app at any width. The gauge no longer follows an app's drawer (`ui-drawer`), and the model's `drawerInset` field is gone.

### Patch Changes

- Updated dependencies [92c7f8a]
  - @augur/kit-common@0.6.0

## 0.4.0

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

## 0.3.3

### Patch Changes

- Updated dependencies [e0f4acc]
  - @augur/kit-common@0.4.0

## 0.3.2

### Patch Changes

- Updated dependencies [b40a02b]
- Updated dependencies [a2384cc]
  - @augur/kit-common@0.3.0

## 0.3.1

### Patch Changes

- 464be02: The kit builds and releases from its own repository. New: the kit bundle, React, Common and Quill as ready-to-load files with a kit.json, released and signed as kit@<version>. Aerie is now published for the shell to build with.

## 0.3.0

### Minor Changes

- a19adb5: The shell is drawn in React on Aerie: the band, the floor gauge, the sky and its views (`Shell` with a `ShellModel`), Title and Orbit (`CentreMenu`), the water, and the request and previews dialogs on Common. The shell's own UI no longer uses the Lit kit; `@augur/ui-kit` is still served to apps through the import map until SDK 2.

## 0.2.0

### Minor Changes

- f8e9b46: Common gets `Letterbox`, the 2.39:1 frame for urgent things (PDR-009), with its ratio in the new `letterbox-ratio` token. Dialogs, lists and tips now sit above the shell's band through the layer tokens. Aerie gets its first parts: Toasts (they go by themselves after the new `motion-toast` token), AppUnavailable for an app that can't show yet, and Connection for offline, reconnecting and an ended session. The shell loads Aerie's `kit.css`.

### Patch Changes

- Updated dependencies [f8e9b46]
- Updated dependencies [2a827a0]
- Updated dependencies [d994d7b]
- Updated dependencies [2a827a0]
- Updated dependencies [2a827a0]
- Updated dependencies [2a827a0]
- Updated dependencies [2a827a0]
- Updated dependencies [f8e9b46]
- Updated dependencies [da54ae3]
- Updated dependencies [d500567]
  - @augur/kit-common@0.2.0
