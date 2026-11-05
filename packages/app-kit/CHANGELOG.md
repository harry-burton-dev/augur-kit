# @augur/app-kit

## 0.7.1

### Patch Changes

- 799176a: PeoplePicker's `search` says how to hand it the SDK's `searchPrincipals`, and the Writing kit stories' stand-in directory answers as identity's does: people with their email, teams with where they sit.

## 0.7.0

### Minor Changes

- d39aece: DateField counts days with @internationalized/date and opens a real calendar (React Aria's, in the person's language) instead of the browser's hidden date input. Same props. A month on from 31 January is now 28 February, not 3 March, and days that don't exist, such as 31/02, are refused.

  PeoplePicker no longer puts `aria-expanded` on its text box, which axe rates critical; the box now points at what it found with `aria-controls`. New Storybook stories (Quill / Writing kit) show the picker on a stand-in for identity's directory search, and the date field's states.

- 24828f6: Editor is built on Tiptap (AUGUR's ADR 0058), with the same props and the same Markdown. A mention sits in the text as one chip where it was written: the caret steps over it and one Backspace takes it out. Bold and italic show as themselves while writing; `- `, `1. ` and `> ` start a list, a numbered list or a quote, and the selection bar gains Numbered list. Pasted rich text keeps only bold, italic, lists and quotes. The engine loads with a dynamic import the first time a page shows an editor, so pages without one load nothing more. Prose reads with markdown-it (loaded the same way) and shows numbered lists too; web links show as their words.

## 0.6.1

### Patch Changes

- Updated dependencies [afc6305]
  - @augur/kit-common@0.7.0

## 0.6.0

### Minor Changes

- 92c7f8a: The app frame keeps one layout at every width, by its own width (a container query): below `frame-overlay-below` (1100 px) the drawer keeps its strip and opens over the page, and below `frame-icons-below` (800 px) the rail folds to its icons and opens over the page. Overlays close on Escape, on a press outside them, or when a section is picked; the person's own choice to fold is kept for wider widths. Two new structure tokens hold the widths.

### Patch Changes

- Updated dependencies [92c7f8a]
  - @augur/kit-common@0.6.0

## 0.5.1

### Patch Changes

- 31ed7bf: Accessibility pass (PER-281, PER-170).

  - Common: `AskTwice`, a danger action that needs a second, deliberate press. Its first press says what the second does (`confirm`), announced politely; it goes back after `armFor` (the `motion-still` token), on Esc or when focus leaves, and takes `disabled` with a `reason` like every button. `Button` gains `confirmLabel` and `onArmedChange` for danger buttons, and announces the armed state from a status beside it rather than from the button. `Progress` is named by its label.
  - Every kit: Reduce motion stops every loop (ping, spinners, running bars, shimmer, breathing), under the system setting and under AUGUR's own switch (`data-motion="reduce"` on `<html>`), and the centre menu drops its transitions under both. A test checks every infinite animation.
  - Aerie: the stage is the page's one `main` landmark, named for the open app. A polite live region says each new thing that needs you once, never what was there when the Shell first drew. Every icon-only control (band ways, the handle, the dome, Dismiss) shows its name on hover and focus. Where you are is read from hidden text instead of an `aria-label` on a paragraph. Floors move with Alt+Page Up and Alt+Page Down; Page Up and Page Down alone are the app's.
  - Quill: a reel card's name is its own words in the order they show.
  - Storybook: axe runs on every story in `pnpm test`, failing on a serious or critical finding, and the stories are found again (the glob pointed outside the repository, so Chromatic got none).

- Updated dependencies [31ed7bf]
  - @augur/kit-common@0.5.0

## 0.5.0

### Minor Changes

- e0f4acc: The path tree lights the path you took. Rows beside it dim by how far they are from where you are (new tokens `path-dim-1`, `path-dim-2`, `path-dim-3` and `path-soft`), and come back to full strength on hover and focus. The path's rows stay pinned to the top of the rail as its breadcrumb (`pinned`, default 3); on a deeper path the middle folds into one "…" row that says how many levels it holds and opens them. A node can say what inside needs the person (`needsYou`): the row glows, shows the sentence and reads it as its description, and a closed or folded row does the same for what's inside it. The current row is now `aria-current="location"`, a locked row's reason is read as its description, and ← on the current row or Backspace walks back up the path.
- 4ae9d6e: The radial menu gains what the "radial menu" design needs, all optional, so every caller keeps working:

  - `RingAction.slot` (`RingSlot`, `RING_SLOTS`): eight fixed directions, so a verb is always in the same place. Danger without a slot sits at the bottom; the rest fill clockwise from the top. A tile's ring now uses eight positions 45° apart.
  - `RingAction.targets` (`RingTarget`): an action can open the places it can go to. Choosing one calls `onAction(action, target)`; `RingSubject.onAction` is now `(id, target?) => void`.
  - `RingAction.preview`: what choosing it would change, shown in one readout under the menu and read out politely.
  - `RingAction.owner` and `RingSubject.onAsk`: an unavailable action reads its reason and owner, and choosing it asks the owner.
  - `RingAction.hold` (defaults to `danger`): hold to confirm, for the length of `motion-run`; with reduced motion, press twice.
  - `RingMore`: a visible "more" mark that opens the same menu, for anyone who doesn't know about right-click.

### Patch Changes

- Updated dependencies [e0f4acc]
  - @augur/kit-common@0.4.0

## 0.4.0

### Minor Changes

- 7c8111b: Add the app-frontend starter: `defineReactApp`, `placeRoutes` on TanStack Router, `useData`, `useChange` and `DataView` on TanStack Query, and `createAppClient` on openapi-fetch with one `AppError` (AUGUR's ADR 0054).
- b40a02b: Focal planes and the light language.

  - Breaking: the rack focus tokens are renamed for the plane they draw. `depth-blur`, `depth-saturate`, `depth-scale` and `depth-tint` are now `focus-far-blur`, `focus-far-saturate`, `focus-far-scale` and `focus-far-tint`, with the same values. Read the new names in any CSS of your own.
  - New tokens: `focus-far-dim`; the deep plane, two surfaces behind focus (`focus-deep-blur`, `-saturate`, `-dim`, `-scale`); the soft plane, for something risen within the app (`focus-soft-blur`, `-saturate`, `-dim`, `-scale`); `motion-rack` and `motion-pull`, named moves that point at `motion-slow` and `motion-calm`; and `pattern-unavailable`, the hatching on something that can't be used.
  - Breaking (Quill): `useRack(active, hole, returnTo)` is now `useRack(active, { hole, returnTo, plane })`. `plane` is the `Plane` the surface stands on (`ground`, `work`, `active` or `decision`) and is `active` unless it says otherwise. `FocusStage` sends the app's plane far for one surface in front of it, deep for two or more and soft for one within the work, and says which in `data-focus`. Rack focus now also dims the plane rather than only blurring it, and racks on `motion-rack`.
  - Quill: `FocusField` is `quiet` by default (PDR-010, amendment 1): ambient things lose colour and light but are not blurred, so they stay readable. Pass `ambience="soft"` for the old look.
  - Common: a new `Signal` part, the light language: `streak` (a count), `bloom` (needs you), `flicker` (changed), `ember` (going stale), `beacon` (urgent, leads to the letterbox) and `shadow` (unavailable, with the reason). Every signal carries its words in `label`, since light alone fails people who can't tell the colours apart. Its loops stop under reduced motion.

- e17264e: Quill's Table filters and sorts its rows with TanStack Table and takes a new `virtual` prop that draws only the rows in view, so lists of thousands stay quick.

### Patch Changes

- Updated dependencies [b40a02b]
- Updated dependencies [a2384cc]
  - @augur/kit-common@0.3.0

## 0.3.0

### Minor Changes

- 9e021dd: Quill gains `FilterBar` (and `filterValue`), the React part for the Lit kit's `ui-filter-bar`: a menu per filter, a sort, the count, and what's on as tags with Clear all.

## 0.2.0

### Minor Changes

- f8e9b46: Quill gets its first parts: AppFrame (three columns with a rail that folds to icons, the app's name opening its front page, and a drawer), RailLink, FrontPage, About, More and SelectionBar. Quill re-exports Common, and the shell loads Quill's `kit.css`. The tokens-only test now covers every kit's source.
- da54ae3: Quill gets depth and focus (PDR-010). `FocusStage` racks the app out of focus behind a dialog, the palette or the radial menu instead of a scrim (`veil`, `lens` or the old `scrim`), and `AppFrame` is one. `FocusField` and `FocusItem` let one thing pull focus while the rest sit ambient (`soft` or `quiet`). `RadialMenu`, opened on anything with `useRingTarget` (right-click, the context-menu key, Shift+F10 or a long press), rings a tile or fans beside a row, keeps unavailable actions with their reasons, and turns into a list past eight. `PathTree` lights the path you took and dims its neighbours. `FrontPage` takes a config any app can reuse (`FrontPageConfig`, `frontSections`), a title look and reels (`Reel`, pulled in one at a time or shown at once). `KindTile`, `AddTile` and `Tiles` give each kind of thing its own shape, and `Palette` finds and goes. New tokens in Quill's set: `depth-*`, `ambient-*`, `path-dim`, `ring-*` and `reel-card`.
- 7c8027d: Quill gains `Lifecycle`, `PeoplePicker`, `Reader` and `Contents`, the React parts for the Lit kit's `ui-lifecycle`, `ui-people-picker`, `ui-reader` and `ui-contents`, so Artifacts' details, sharing and reading can move to the new layout. `Reader` loads markdown-it the first time it shows something, as the Lit reader does.
- d500567: Quill has the parts apps used from the Lit kit, on React: State, Status, Facts, Rows, Notice, Note, Tag, Details, PageHead, Section, List, Table, Card, Cards, Tally, Timeline, Path, Ref, Refs, DateField, DropZone, Surface, Editor, Prose and Tree. Common exports its field pieces (FieldHead, FieldHint, StateMark, useMessage, useValue) so Quill's fields read like its own.
- a8854e2: Quill has `TagPicker`, the Lit kit's `ui-tag-picker` on React (PER-243): pick any number of tags by typing, the chosen shown as tags in the field, with an optional limit and `onCreate` for a word that isn't a tag yet.

### Patch Changes

- 527a413: Mandate is on React and Quill (PER-243): the floor's intents, what you hold, one intent with its statement, line of sight, parts below and what it's bound to, its dialogs, the picker other apps open with `aim.pick` and its card on Home. The words, limits and behaviour are the same as before; it no longer uses the Lit kit. Quill's `Editor` and `DateField` take a `defaultValue` for when they keep their own value.
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
