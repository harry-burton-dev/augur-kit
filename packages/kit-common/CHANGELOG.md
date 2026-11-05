# @augur/kit-common

## 0.9.0

### Minor Changes

- 4d13d4f: A deployment can choose how depth is drawn (PDR-010, amendment 2). Its `FOCUS_DEPTH` setting reaches the page as an `augur-depth` meta. FocusStage, and so AppFrame, draws that depth over the app's own `depth`, because the choice is about the org's machines; `deploymentDepth()` reads it. With `scrim`, for desktops without a GPU, Common also stops every backdrop blur and makes the see-through surfaces solid.

## 0.8.0

### Minor Changes

- d7d504c: The four design picks' visuals (PER-283), each off until an app turns it on:

  - `Letterbox` takes `look: 'see-through'`: solid cinema bars that close in from the edges, and a frame that is a window onto the work behind, racked to the deep plane. It also takes `more` (and `moreLabel`): what doesn't fit waits behind a More control and shows in place, so the frame never scrolls.
  - `RingProvider` and `AppFrame` take `overflow` / `ringOverflow: 'more'`: past eight actions the ring keeps the first seven in their slots and puts More in the slot left free (north-west when it is). More opens the rest as a ring of their own (a list past eight more); Esc comes back to More. `pageActions` and `RING_MORE_ID` are exported. The readout moves below an unavailable action's reason at the bottom of the ring instead of covering it.
  - `PathTree` takes `trail: 'draw'`: when the path changes, the lit line draws itself from the top down to where you are, a level at a time (new token `motion-trail`). Reduced motion draws it at once.
  - Storybook: "Design direction/The four picks", one story per pick and one with all four.
  - `List` takes `ringFor`: right-click or a long press on a row's words, or its "more" mark, opens the row's radial menu.

## 0.7.0

### Minor Changes

- afc6305: Common now carries reduced motion and its typefaces, which the Lit kit's `base.css` used to give the shell. Each movement token has its reduced value in the token files (`$extensions.augur.reduced`), and `tokens.css` sets those under `prefers-reduced-motion: reduce` and under `data-motion="reduce"` on `<html>`: moves become near-instant, loops stop and nothing travels. The new `@augur/kit-common/fonts.css` holds Jost and Nunito from Fontsource, with their files next to it. The kit bundle serves it as `fonts.css` with `fonts/`, and lists it in `kit.json`'s `styles` after `tokens.css`, so a shell that links the bundle's styles needs no Fontsource of its own.

## 0.6.0

### Minor Changes

- 92c7f8a: The app frame keeps one layout at every width, by its own width (a container query): below `frame-overlay-below` (1100 px) the drawer keeps its strip and opens over the page, and below `frame-icons-below` (800 px) the rail folds to its icons and opens over the page. Overlays close on Escape, on a press outside them, or when a section is picked; the person's own choice to fold is kept for wider widths. Two new structure tokens hold the widths.

## 0.5.0

### Minor Changes

- 31ed7bf: Accessibility pass (PER-281, PER-170).

  - Common: `AskTwice`, a danger action that needs a second, deliberate press. Its first press says what the second does (`confirm`), announced politely; it goes back after `armFor` (the `motion-still` token), on Esc or when focus leaves, and takes `disabled` with a `reason` like every button. `Button` gains `confirmLabel` and `onArmedChange` for danger buttons, and announces the armed state from a status beside it rather than from the button. `Progress` is named by its label.
  - Every kit: Reduce motion stops every loop (ping, spinners, running bars, shimmer, breathing), under the system setting and under AUGUR's own switch (`data-motion="reduce"` on `<html>`), and the centre menu drops its transitions under both. A test checks every infinite animation.
  - Aerie: the stage is the page's one `main` landmark, named for the open app. A polite live region says each new thing that needs you once, never what was there when the Shell first drew. Every icon-only control (band ways, the handle, the dome, Dismiss) shows its name on hover and focus. Where you are is read from hidden text instead of an `aria-label` on a paragraph. Floors move with Alt+Page Up and Alt+Page Down; Page Up and Page Down alone are the app's.
  - Quill: a reel card's name is its own words in the order they show.
  - Storybook: axe runs on every story in `pnpm test`, failing on a serious or critical finding, and the stories are found again (the glob pointed outside the repository, so Chromatic got none).

## 0.4.0

### Minor Changes

- e0f4acc: The path tree lights the path you took. Rows beside it dim by how far they are from where you are (new tokens `path-dim-1`, `path-dim-2`, `path-dim-3` and `path-soft`), and come back to full strength on hover and focus. The path's rows stay pinned to the top of the rail as its breadcrumb (`pinned`, default 3); on a deeper path the middle folds into one "…" row that says how many levels it holds and opens them. A node can say what inside needs the person (`needsYou`): the row glows, shows the sentence and reads it as its description, and a closed or folded row does the same for what's inside it. The current row is now `aria-current="location"`, a locked row's reason is read as its description, and ← on the current row or Backspace walks back up the path.

## 0.3.0

### Minor Changes

- b40a02b: Focal planes and the light language.

  - Breaking: the rack focus tokens are renamed for the plane they draw. `depth-blur`, `depth-saturate`, `depth-scale` and `depth-tint` are now `focus-far-blur`, `focus-far-saturate`, `focus-far-scale` and `focus-far-tint`, with the same values. Read the new names in any CSS of your own.
  - New tokens: `focus-far-dim`; the deep plane, two surfaces behind focus (`focus-deep-blur`, `-saturate`, `-dim`, `-scale`); the soft plane, for something risen within the app (`focus-soft-blur`, `-saturate`, `-dim`, `-scale`); `motion-rack` and `motion-pull`, named moves that point at `motion-slow` and `motion-calm`; and `pattern-unavailable`, the hatching on something that can't be used.
  - Breaking (Quill): `useRack(active, hole, returnTo)` is now `useRack(active, { hole, returnTo, plane })`. `plane` is the `Plane` the surface stands on (`ground`, `work`, `active` or `decision`) and is `active` unless it says otherwise. `FocusStage` sends the app's plane far for one surface in front of it, deep for two or more and soft for one within the work, and says which in `data-focus`. Rack focus now also dims the plane rather than only blurring it, and racks on `motion-rack`.
  - Quill: `FocusField` is `quiet` by default (PDR-010, amendment 1): ambient things lose colour and light but are not blurred, so they stay readable. Pass `ambience="soft"` for the old look.
  - Common: a new `Signal` part, the light language: `streak` (a count), `bloom` (needs you), `flicker` (changed), `ember` (going stale), `beacon` (urgent, leads to the letterbox) and `shadow` (unavailable, with the reason). Every signal carries its words in `label`, since light alone fails people who can't tell the colours apart. Its loops stop under reduced motion.

- a2384cc: Letterbox: urgent is never dismissed (PDR-009). This changes its API: `onClose` is now `onStepBack`. Esc, and a new Step back control, put the item back on the edge; without `onStepBack`, Esc does nothing and the item must be answered first. Rename `onClose` to `onStepBack` where you use it.

  Letterbox also gains `acknowledged` and `onAcknowledge` (an acknowledgement chip in the bottom bar, and the key A; acknowledging is not resolving), `bars` (what the bars above and below the frame say) and `queue` ("1 of 2 · next: …" in the top bar). Two new parts: `Explain`, the four-part explanation (what happened, why it matters, what you can do, who else can act), and `UrgentEdge`, the stepped-back urgent item on the edge rule, a button that reopens it. New tokens `letterbox-min-frame` (the frame never gets shorter than this) and `edge-rule`. `Heading` takes an optional `summaryId`.

## 0.2.0

### Minor Changes

- f8e9b46: Common gets `Letterbox`, the 2.39:1 frame for urgent things (PDR-009), with its ratio in the new `letterbox-ratio` token. Dialogs, lists and tips now sit above the shell's band through the layer tokens. Aerie gets its first parts: Toasts (they go by themselves after the new `motion-toast` token), AppUnavailable for an app that can't show yet, and Connection for offline, reconnecting and an ended session. The shell loads Aerie's `kit.css`.
- 2a827a0: Common gets Choice and Segmented in React. Choice picks one of two to four options, each with a line explaining it, and an option that can't be picked stays in the list and says why. Segmented switches between ways of seeing the same thing, such as list or grid, and always has one on.
- d994d7b: Common gets its first React controls: Button, IconButton and Icon, with React Aria behaviour, Lucide icons, a reason for every disabled control and `kit.css` for their styles. The shell loads `kit.css`. One Storybook in `platform/storybook` now shows the React kits, with the frozen Lit kit inside it.
- 2a827a0: Common gets Dialog and Heading in React. A Dialog's primary checks every field inside it and goes to the first gap. While it works, nothing can be pressed and Esc waits, and if it fails the dialog stays open and says why. Focus starts on the first empty field, or on Cancel for a danger action. Fields tell a surrounding form about themselves through `useFieldCheck`.
- 2a827a0: Common gets its fields in React: TextField (one line or several, with a count), Select, Toggle, Checkbox and CheckboxGroup. A required field left empty asks in green and only wrong content turns red. A disabled field can say why and stays focusable. A Toggle that fails to save turns back and says why.
- 2a827a0: Common gets Menu and Tabs in React. A Menu opens from a Button or IconButton. An unavailable item stays in the menu with its reason under its name, and an item's own key picks it. Tabs switch between views of one thing. An unavailable tab stays in the line, and its panel says why instead of showing its content.
- 2a827a0: Common gets Person, People, Tip, Progress and Steps in React. People show as round marks in their floor's colour with their initials, and every name is read aloud. A Tip shows a short line on hover and focus. Progress is a bar that runs while the amount can't be known, and Steps names where a run is now.
- da54ae3: Quill gets depth and focus (PDR-010). `FocusStage` racks the app out of focus behind a dialog, the palette or the radial menu instead of a scrim (`veil`, `lens` or the old `scrim`), and `AppFrame` is one. `FocusField` and `FocusItem` let one thing pull focus while the rest sit ambient (`soft` or `quiet`). `RadialMenu`, opened on anything with `useRingTarget` (right-click, the context-menu key, Shift+F10 or a long press), rings a tile or fans beside a row, keeps unavailable actions with their reasons, and turns into a list past eight. `PathTree` lights the path you took and dims its neighbours. `FrontPage` takes a config any app can reuse (`FrontPageConfig`, `frontSections`), a title look and reels (`Reel`, pulled in one at a time or shown at once). `KindTile`, `AddTile` and `Tiles` give each kind of thing its own shape, and `Palette` finds and goes. New tokens in Quill's set: `depth-*`, `ambient-*`, `path-dim`, `ring-*` and `reel-card`.

### Patch Changes

- f8e9b46: Quill gets its first parts: AppFrame (three columns with a rail that folds to icons, the app's name opening its front page, and a drawer), RailLink, FrontPage, About, More and SelectionBar. Quill re-exports Common, and the shell loads Quill's `kit.css`. The tokens-only test now covers every kit's source.
- d500567: Quill has the parts apps used from the Lit kit, on React: State, Status, Facts, Rows, Notice, Note, Tag, Details, PageHead, Section, List, Table, Card, Cards, Tally, Timeline, Path, Ref, Refs, DateField, DropZone, Surface, Editor, Prose and Tree. Common exports its field pieces (FieldHead, FieldHint, StateMark, useMessage, useValue) so Quill's fields read like its own.
