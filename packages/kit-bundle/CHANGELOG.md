# @augur/kit-bundle

## 0.5.19

### Patch Changes

- Updated dependencies [13c192a]
  - @augur/app-kit@0.22.0

## 0.5.18

### Patch Changes

- 4ee2635: Quill remote elements for a knowledge app: `quill-thing-page` (a thing's page in the one shape, from a ThingView the app fills, with action, open, source, everything and map events) and `quill-door-gallery` (configured doors the app scores, with an ask line). A ThingSource can carry the report's id.
- ff8df5f: Quill's ThingPage: one shape for every thing, whatever its kind. What it is, the answer (Now and Next, or What and When), one line for what's wrong, up to four key facts, up to six sentences of what's around it, one primary action chosen by rule, and a way to everything we know, with the graph one step away. The app fills a ThingView; the page caps it and says what each empty slot means. Also TrustLine, and the model (primaryAction, thingActions, trustLine, atRest, validateThing, THING_WORDS).
- Updated dependencies [4ee2635]
- Updated dependencies [8a03b87]
- Updated dependencies [8a03b87]
- Updated dependencies [ff8df5f]
  - @augur/app-kit@0.21.0
  - @augur/kit-common@0.18.0

## 0.5.17

### Patch Changes

- fdcdb1c: Common has a `size` group: marks and glyphs (`mark-xs` to `glyph-lg`), small controls (`control-xs` to `control-lg`), list and table rows (`row`, `row-compact`, `cell`, `cell-compact`, `bar-row`) and the narrowest a column, card, tile, aside or menu goes. Sizes, not spaces: density never changes them. The kits' CSS uses them, so raw distances go from 193 to 65 (what is left is container and media query widths, effects and the shell's own drawings). Every value is the same as before. Aerie's PaneLayout frame now takes its parent's width by itself.
- Updated dependencies [fdcdb1c]
  - @augur/kit-common@0.17.0
  - @augur/app-kit@0.20.1

## 0.5.16

### Patch Changes

- 96718ff: Three layout parts for inside an app's main column, on the app contract too: `Stack` (`quill-stack`, children one above another, `gap` tight, normal, loose or section), `Split` (`quill-split`, a main part and an `aside` that keeps at least part-min-width and goes under the main part by itself when there isn't room) and `Grid` (`quill-grid`, as many columns as fit, each at least part-min-width). They space their children only with the layout tokens and pad nothing outside themselves. Add only. The remote allowlist is regenerated.
- 6f2731f: Layout tokens: what each space is for. `pane-inset-inline`, `pane-inset-top` and `pane-inset-bottom` for an app's main column, `region-inset-inline` and `region-inset-block` inside a side region, and `stack-tight`, `stack`, `stack-loose` and `section-gap` between siblings. Each points at a step of the spacing scale, and each is a Tailwind spacing utility too (`gap-stack`, `px-pane-inset-inline`).

  Compact density is now in the tokens: a token's `$extensions.augur.compact` is its value under `data-density="compact"`, set on `<html>` for a person's preference or on any element, such as an app's pane, for an app's own choice. The larger steps come down one notch as before, and the layout tokens follow them.

  The floor gauge's lane is a token (`gauge-lane`, from `gauge-notch` and `gauge-pinned`) in place of a sum written in shell.css. The About panel and Quill's drawer pad with the region tokens, so their heads line up. The kits' raw distances allowance comes down to what is left, 195.

- 16eabf2: Aerie's `PaneLayout` draws an app's pane in the layout it chose (focus, aside, split or canvas), with the inset contract on every one: the head and the screen share one inline inset and one width cap, the top clears the stage's fade, sections sit `section-gap` apart, and a pane narrower than `pane-tight-below` uses `edge-tight`. The About panel appears only in aside. New shell tokens `split-list` and `pane-tight-below`.
- Updated dependencies [96718ff]
- Updated dependencies [6f2731f]
- Updated dependencies [16eabf2]
  - @augur/app-kit@0.20.0
  - @augur/kit-common@0.16.0

## 0.5.15

### Patch Changes

- Updated dependencies [d39338f]
  - @augur/app-kit@0.19.0

## 0.5.14

### Patch Changes

- Updated dependencies [7191c32]
  - @augur/app-kit@0.18.0
  - @augur/kit-common@0.15.1

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
