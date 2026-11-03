# @augur/shell-kit

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
