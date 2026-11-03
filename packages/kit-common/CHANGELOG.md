# @augur/kit-common

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
