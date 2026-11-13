# @augur/app-kit

## 0.22.2

### Patch Changes

- Updated dependencies [3f1605b]
  - @augur/kit-common@0.20.0

## 0.22.1

### Patch Changes

- Updated dependencies [1edb24c]
  - @augur/kit-common@0.19.0

## 0.22.0

### Minor Changes

- 13c192a: `quill-door-gallery` takes the app's `signals`, and a `rule` to tune them, and the host scores the doors itself with `scoreDoors`. An app's sandbox can't import the kit, so until now it had no way to score its doors. `scores` an app made itself still win.

## 0.21.0

### Minor Changes

- 4ee2635: Quill remote elements for a knowledge app: `quill-thing-page` (a thing's page in the one shape, from a ThingView the app fills, with action, open, source, everything and map events) and `quill-door-gallery` (configured doors the app scores, with an ask line). A ThingSource can carry the report's id.
- ff8df5f: Quill's ThingPage: one shape for every thing, whatever its kind. What it is, the answer (Now and Next, or What and When), one line for what's wrong, up to four key facts, up to six sentences of what's around it, one primary action chosen by rule, and a way to everything we know, with the graph one step away. The app fills a ThingView; the page caps it and says what each empty slot means. Also TrustLine, and the model (primaryAction, thingActions, trustLine, atRest, validateThing, THING_WORDS).

### Patch Changes

- 8a03b87: `State` and `StateBoundary` (with `StateKind`, `StateProps` and `StateBoundaryProps`) move from Quill into Common, so Aerie can say empty, loading, error and offline the same way (PDR-016). Quill still exports them, through Common, under the same names, and they look the same as #58 left them; their classes are now `augur-state*` (the mark is `augur-state-sign` and the running line `augur-state-run`). Their Storybook page moves to Common/State.
- 8a03b87: `Tag` (with `TagProps`) moves from Quill into Common, so Aerie can draw the same tags (PDR-016). Quill still exports it, through Common, under the same name, and it looks the same; its classes are now `augur-tag*`. Common also gets `Tags`, a row of tags that folds the rest behind "+N more" past a `limit`. Both have their own Storybook pages, under Common/Tag.
- Updated dependencies [8a03b87]
- Updated dependencies [8a03b87]
  - @augur/kit-common@0.18.0

## 0.20.1

### Patch Changes

- fdcdb1c: Common has a `size` group: marks and glyphs (`mark-xs` to `glyph-lg`), small controls (`control-xs` to `control-lg`), list and table rows (`row`, `row-compact`, `cell`, `cell-compact`, `bar-row`) and the narrowest a column, card, tile, aside or menu goes. Sizes, not spaces: density never changes them. The kits' CSS uses them, so raw distances go from 193 to 65 (what is left is container and media query widths, effects and the shell's own drawings). Every value is the same as before. Aerie's PaneLayout frame now takes its parent's width by itself.
- Updated dependencies [fdcdb1c]
  - @augur/kit-common@0.17.0

## 0.20.0

### Minor Changes

- 96718ff: Three layout parts for inside an app's main column, on the app contract too: `Stack` (`quill-stack`, children one above another, `gap` tight, normal, loose or section), `Split` (`quill-split`, a main part and an `aside` that keeps at least part-min-width and goes under the main part by itself when there isn't room) and `Grid` (`quill-grid`, as many columns as fit, each at least part-min-width). They space their children only with the layout tokens and pad nothing outside themselves. Add only. The remote allowlist is regenerated.

### Patch Changes

- 6f2731f: Layout tokens: what each space is for. `pane-inset-inline`, `pane-inset-top` and `pane-inset-bottom` for an app's main column, `region-inset-inline` and `region-inset-block` inside a side region, and `stack-tight`, `stack`, `stack-loose` and `section-gap` between siblings. Each points at a step of the spacing scale, and each is a Tailwind spacing utility too (`gap-stack`, `px-pane-inset-inline`).

  Compact density is now in the tokens: a token's `$extensions.augur.compact` is its value under `data-density="compact"`, set on `<html>` for a person's preference or on any element, such as an app's pane, for an app's own choice. The larger steps come down one notch as before, and the layout tokens follow them.

  The floor gauge's lane is a token (`gauge-lane`, from `gauge-notch` and `gauge-pinned`) in place of a sum written in shell.css. The About panel and Quill's drawer pad with the region tokens, so their heads line up. The kits' raw distances allowance comes down to what is left, 195.

- Updated dependencies [6f2731f]
- Updated dependencies [16eabf2]
  - @augur/kit-common@0.16.0

## 0.19.0

### Minor Changes

- d39338f: Quill's remote vocabulary gains the parts a documents app needs. `quill-reader` draws Markdown in the reading view (raw HTML shown as text); a picture is named by a path under the app's own API, which only the host fetches (ADR 0092, `readerPicturePath` says which paths pass), and words the person selects get the app's marks beside them, sent back as `mark`. `quill-file-button` opens the person's file chooser and the host takes the files, as a drop on the app's pane; `choose` says only what was chosen. `quill-people-picker` asks the app for each search (`query`) and shows the `found` it sets for those words. `quill-floor-path` draws a thing's chain up the floors, the owner marked and a floor it can't reach saying why. `quill-filter-bar` is the kit's FilterBar. `QuillRemote` takes a `host` (`picture`, `files`) for what only the host does; without one, the element still draws and says what it can't do. Quill also gains `FileButton`, and ReadingView an `at` to open at a block. Nothing is renamed or removed.

## 0.18.0

### Minor Changes

- 7191c32: Quill's remote vocabulary gains `quill-check-list`, `quill-step-list` and `quill-paged-list`, so an app on the app contract can describe checks (each with its tone and one action, sent back as `act`), an ordered way through one job (`act`), and a list shown a page at a time (`open`, and `more` when `total` is above the items sent). The shell draws them with Common's CheckList, StepList and PagedList. Nothing is renamed or removed. In Common, a SectionDialog's section now gives its last child the room left, so a single child fills it without a grid of its own.

### Patch Changes

- Updated dependencies [7191c32]
  - @augur/kit-common@0.15.1

## 0.17.0

### Minor Changes

- 479b7ef: Adds the door gallery's model: `DoorDescriptor` (a door as plain configuration, with `door.schema.json` and `validateDoor`), and `scoreDoors`, a pure scorer that turns signals into each door's step (quiet, present, strong, needs you) and its reasons. Its weights and thresholds are a rule (`DEFAULT_RULE`) an app can tune; "needs you" comes only from something the person can act on, and at most two doors are strong. `placeDoors` sends doors past the cap to the radial menu.
- 479b7ef: Adds `DoorGallery`, `Door`, `DoorLight`, `AskLine` and `StepLabel`: an ask line on top and a row of doors, each lit by how much waits behind it. Adding a door is one more descriptor, with no change to a part. The light is ink, and green only for needs you; it is still under reduced motion and on a deployment that draws no blur. Every door's name says its job, its step and its reasons. Also adds `useInRing`, so a part can tell whether a radial menu is round it.

### Patch Changes

- Updated dependencies [479b7ef]
- Updated dependencies [eeb9ed3]
  - @augur/kit-common@0.15.0

## 0.16.0

### Minor Changes

- 99d782c: Quill's remote vocabulary gains what admin screens need: `quill-dialog` (its work done in the sandbox: a submit sends the fields' values and the dialog waits, busy, until the app closes it or says why not), `quill-ask-twice`, `quill-choice`, `quill-checkbox-group`, `quill-date-field`, `quill-tag-picker`, `quill-steps`, `quill-progress` and `quill-status`. Common's `Dialog` takes `busy` and `error` from outside, for a dialog whose work is done elsewhere.

### Patch Changes

- Updated dependencies [99d782c]
  - @augur/kit-common@0.14.0

## 0.15.0

### Minor Changes

- 5f85a4f: The shell's own bar draws the open app's places through RailPlaces when any of its pages `fills`. It is fed from the model: `ShellPage.path` and `fills`, `ShellModel.under` (by app, then place), `underCap` (the deployment's number, 50 unless it says) and `path`. Choosing a thing under a place, or "and n more", calls `openPath` and fires `ui-path` with `{ app, page, path }`. Pages that don't fill look as before. RailPlaces gains `onPlace`, `currentPlace`, `lit` and `lead`, and `onOpen` now also gives the place.

  Quill: a thing an app marks for the shell's radial menu. List items and kind tiles take `thing: { kind, id?, label? }`, and a table takes `thing: { kind, label? }` (label is a column key) for all of its rows. Each is drawn as `data-thing`, `data-thing-id` and `data-thing-label`, and the remote vocabulary carries the same. A kind that isn't a short lower-case word is dropped with a reason. `thingProps` is exported.

## 0.14.1

### Patch Changes

- Updated dependencies [d07a1eb]
  - @augur/kit-common@0.13.0

## 0.14.0

### Minor Changes

- 02c69ee: Quill's remote vocabulary for the app contract's third major (ADR 0076): `@augur/app-kit/remote` defines the `quill-*` elements an app's sandbox describes its screen with, and `QuillRemote` draws them on the host with the kit, dropping anything outside the vocabulary with a console reason. The allowlist ships as `@augur/app-kit/remote/allowlist.json`. `List` takes `virtual` for long lists, sized by Common's new `measure-list-virtual` token, and lists and tables from a sandbox draw only the rows in view from 200 rows.

  Every property the vocabulary names states its shape down to the fields of a list's items, with the values an enum takes, and the host keeps only what fits. A part that fails to draw stops only itself. Common's `Icon` draws nothing for a name that isn't one of its own icons, such as `constructor`.

### Patch Changes

- Updated dependencies [02c69ee]
  - @augur/kit-common@0.12.0

## 0.13.0

### Minor Changes

- ab0fea1: Fixes from the 6 November review.

  A `Select` that is unavailable, read-only or busy no longer changes from the keyboard: arrow keys and typing on the closed field used to change its value and call `onChange`. A required `Select` no longer says "Needs you." straight after its first pick.

  In a `Dialog` or `SideSheet`, Enter in a one-line `TextField`, `DateField` or `TimeField` now presses the primary, with what was just typed. Enter in a `PeoplePicker` only looks, and Esc on the Editor's mention list closes the list and not the Dialog. A second Enter in a `DateField` or `TimeField` no longer clears it.

  A Dialog now collects `Checkbox` and `Toggle` as `'true'` or `'false'`, and `CheckboxGroup` as its ticked values joined with commas, so `onSubmit` and `onClose` can carry keys they didn't before. A required `TagPicker` or `CheckboxGroup` now holds the primary and asks with "Needs you."

  `DateField` now honours `reason`, and `DropZone` takes one: each stays focusable and says why. Common exports `warnNoReason`.

  With the browser offline, `useData` and `useChange` now try and fail in words, with `AppError` status 0, instead of pausing. `DataView` shows the offline state rather than loading for ever, and a Dialog waiting on a change is let go. A change made offline is not held for later. Loads run again when the connection returns. `DataView` no longer says it is loading while `enabled` is false: it shows `empty` if it has one, otherwise nothing.

  A failed load of Markdown no longer blanks `Reader`: it shows the plain text, says so and offers a reload, the only thing that helps in Chromium. A failed load of the Editor stays in the Editor's place, with the same offer, instead of taking the app with it, and a required Editor still holds a Dialog's primary.

  A disabled field no longer holds a Dialog's primary, with or without a reason, even when it is required and empty.

  `Palette` keeps the chosen row in sight as the keys move it, and marks the row Enter will open when the list shrinks. A `Table` date in the future reads "in 3 d", not "just now" (`relativeTime`).

### Patch Changes

- Updated dependencies [ab0fea1]
  - @augur/kit-common@0.11.0

## 0.12.0

### Minor Changes

- c1c66b8: Data marks drawn as Key (picked 6 Nov 2026). Tree, PathTree, Path, Refs, Lifecycle, Timeline, Tiles and Reel sit in a well, like a field, and the thing you're on comes up as a soft key. Counts, times, days and kinds are mono. The path tree dims by distance only, with no blur, and a row that needs you shows a green dot instead of a glow. Tiles are flat Key cards that show their kind by icon and word, not by shape. A reel's front card is a key and the rest are dimmed. Floors on Path and Refs show by icon, not colour, so green only means "needs you". Signal keeps its animated lights, each set in a small well. UrgentEdge is a raised strip with a red lip and an Open key. New story pages: Quill/Path, Quill/Timeline, Quill/Tiles, Common/Urgent edge.
- 0f8bfbd: Files and media drawn as Tray (picked 6 Nov 2026). DropZone is now a well that owns its section, its Choose button a small key; dragging over lightens it and turns its edge ink, no longer green (green means "needs you"). New parts: `UploadList` (rows in a well, each file's progress a line along its row's foot, a failed file red with its reason and Retry, past `show` rows the rest fold into "N more" so it never scrolls), `Attachment` (a file on a message or record as a small key, with a sending line, a red edge when it fails and a round remove button), `Picture` (an image that keeps its shape while it loads and says so if it can't), and `FilePreview` (a file to read in place, paged with Back and On, or why it can't be shown, with Download). Helpers `fileIcon`, `fileSize` and `splitName`. Story pages under Quill/Files. No changes to existing props.
- 7cc358d: Search, links, key caps and skeletons in the Key look, and busy in the Groove look (picked 6 Nov 2026). New in Common: `SearchField`, the one search field (a well with a find mark that matches as you type, a shortcut key shown while empty and Esc to clear once you write); `Link`, never underlined, ink words that lift as a soft key when pointed at, the same inside and outside AUGUR; `KeyCap`, a key to press drawn as a small real key, with `keys` for a combination; and `Skeleton`, empty wells in the shape of what is loading. A busy Button no longer spins: ink runs along its bottom edge, and a busy Toggle runs the same line under its switch. Menus, dialogs, side sheets and the first-run guide draw their keys as `KeyCap`. Quill's FilterBar and table filter, and Common's Activity, now use `SearchField`; the Palette keeps its own Rail field. No props removed; the `augur-spinner` class stays for apps that drew their own.
- e0c4073: First-run guide, in the Lamp look: `Guide` shows an app's parts one at a time (the page dims, the part stays lit, the words sit on the dim) with Next, Back and Esc to skip, and `FirstSteps` is a short checklist section for an app's start page. Every word is a prop. Their stories sit in a new Patterns area of the Storybook.
- c3c5603: Empty, loading and error states drawn on the horizon (Harry's pick, 6 Nov). Quill `State` has no box: the sentence sits on a groove, loading draws the line across, an error turns it red with a diamond, and offline amber. Its action is now a Keycap button. New `size="page"` for a whole page, and new `StateBoundary`, which shows a State when a part throws while drawing. Common `Progress` is the same line, filled with ink instead of green, and the current step in `Steps` is ink too: green means only "needs you". `Rows` no longer puts `role="alert"` on a list item.
- 0c1a803: New inputs, picked from the input directions. Common: `ComboBox` (type to find one in a long list, its matches on a sheet), `MultiSelect` (several from a set, words and a count in the well), `NumberField` (step keys at the end, a unit in small capitals), `Slider` (a fader, or `steps`), and a `minus` icon. Quill: `TimeField` (written as you'd say it, with an echo of the time it reads) and `DateRangeField` (two date fields joined by a line, with the days it spans).
- 704c086: Lists, tables and detail rows drawn as Key (picked 6 Nov 2026): List, Table and Rows sit in a well, like a field, with no lines between rows. The row you point at lightens and a picked table row comes up as a soft key. Headings, counts, times and numbers are mono. Table gets an additive `pageSize` prop: it shows that many rows at a time, with the count and Back and On keys under them, so a long table doesn't need to scroll. Carbon-style story pages for List, Table and Rows; the long table story moves to Quill/Table.
- 703ff74: People and activity in the picked looks (6 Nov 2026). Person and People are drawn as a Disc: a flat grey disc with Instrument Sans initials, ringed in the floor's colour, and you ringed in plain ink, never green. New `here` prop on Person and People: someone away is dimmed back and it's read aloud. New in Common: `Presence` (who is here now), `Comments` (points that stay open until settled, settled ones fold to a line, replies one step in), `Activity` (what needs you pulled above, a find field, a line where you last looked, pages instead of scrolling) and `Notifications` with `NotificationItem` (key rows in a well, unread raised). Quill's PeoplePicker gathers its choices under the field as a list in a well, each with what they can do and a key to take it off.
- 24fccd7: The pickers in the Rail look Harry picked (round M), drawn on one ruled line like page frame A. FilterBar is one ruled line with saved views at its start (new `views`, `view` and `onView` props) and what each filter has on in words, so the row of chips under it is gone. Palette is a ruled strip that dims what's behind it and never blurs it (new `lead` and `found` props). The DateField calendar is a ruled month with the chosen day underlined in ink instead of green. TagPicker writes its tags as ruled words, and Common's Segmented puts an ink bar under the chosen word. List gets a `plain` look and expanding rows (`more` on an item, `moreLabel`). FilterBar, DataView and Palette get their own story pages.
- f1742c3: The radial menu has two rings. Its actions are wedges in a solid disc, each in its fixed direction with its name inside, and Cancel sits in the hub. An action's targets fan out on an outer ring in its direction, up to five (`RING_TARGETS_MOST`), and open as a list beside it past that. The ring opens where it was opened and moves in from an edge whole, so no verb changes direction. Keys 1 to 8 pick a direction. One readout under the ring says where you are (thing, verb, place), why an action can't be done and who can change it, and what a choice would change. Unavailable actions are hatched and locked, the selected one is ink, and danger is the only colour. A held action fills the hub. The disc has no blur or shadow and opens with one quick fade. New Quill tokens: `ring-hub`, `ring-outer`, `ring-band` and `ring-seam`. Every prop and type an app passes today works as before.
- 0689319: Consequence focus for the radial menu (V6). An action can name what it `touches` (`RingTouch`: id, label, effect). While it has focus, each thing on the page marked with `useRingTouch(id)` steps forward out of the rack. It is framed in ink (red for what danger breaks), with its effect and a lead from the subject. The readout lists every touch in words, so things scrolled off screen are still named. A held action that touches something is letterboxed until it is let go. The letterbox shows what it does, what it touches, how to cancel and, when the app gives `undo`, how to undo it. With reduced motion it is letterboxed between the two presses. `useRack` takes `holes` to keep more than one box sharp. Common's `Letterbox` gains `passive`, which draws the frame without a dialog while focus stays where the decision is being made.
- 4244f65: Two new overlay parts in Common, in the looks Harry picked: `SideSheet` (Leaf), for create and edit work too big for a dialog, from the right edge over the dimmed page, with steps for a bigger flow and stacking when one is opened from another; and `InfoPop` (Slip), a press-to-open why beside a label or setting that can hold one link.
- ea33587: New parts from the copy, code and folds round, in the looks Harry picked on 6 Nov 2026. Common gets `Snippet`, code to copy drawn as one key you press anywhere (Press to take): it folds long code to its first lines, works inline in a sentence, and says what to do if the browser refuses. Common also gets `Folds` and `Fold`, headings that open a section, sitting in a tray where the open one rises as a key over a Well (Drawer). Quill gets `EditInPlace`, which changes one value where it sits with a Rename key beside it, Save and Cancel while editing, and a refused save that keeps your words (Key beside). Each has Carbon-style stories and tests, and the directions page is gone.
- b5abdb1: Every corner is square. The radius tokens (`radius-key`, `radius-control`, `radius-inset`, `radius-card`, `radius-pill`) are all 0, so keys, wells, tabs, tags, cards, dialogs, notices, popovers, toasts and the old pills sit with the square Sheet menus and tips. The few corners written as raw pixels are square too. Only true circles (radios, status dots, avatars) stay round. The token names stay, so nothing an app uses is removed.
- 6cb8608: Writing and reading in the picked looks (6 Nov 2026). The Editor's format bar is a small Sheet of keys over where the selection starts, and a mention is a square chip in the Key look with its kind's icon, in the Editor and in Prose; the mention list is a Sheet. Reader takes `flow` (`scroll`, `leaves` set out as pages that turn and never scroll, or `horizon` with all but your section dimmed), `spread` and `onLeaf`, and its handle `turn`, `leaf` and `leafOf`. Contents takes `leaves` to show each heading's page as a ledger. New `ReadingView` puts them together: Turn pages or Scroll, Page or Desk, switched by the reader and remembered with `remember`. The directions page goes.

### Patch Changes

- c61d798: Dialogs, notices and toasts in the Sheet look (picked 6 Nov 2026). Dialog is a solid square sheet with a mono heading strip and a ruled footer, over a dimmed page with no blur; a failure is stamped "Not done". New in Common: one notice family, `Notice` (inline or actionable, its tone stamped as a word in mono; new `label` prop), `Toast` and `Toasts` (their time left drains along the bottom edge and stops while held). Quill's `Notice` and Aerie's `Toasts` are now Common's, under the same names.
- 5e55ec3: The editor no longer fails to draw in a real browser. When an editor is replaced, as on a remount, its toolbar stops reading the old, destroyed editor. Chromatic found this in the Writing and Editor states stories.

  A virtual `Table` is now at most `measure-table-virtual` tall (a new app token, 640px) and scrolls inside itself. Before this it grew to every row's height, 280,000px for the 5,000-row story, so only the first screen of rows was ever drawn and Chromatic couldn't capture it.

- 6aee7af: The needs-you colour and the typefaces are tokens (PDR-015). New `needs-you` colour token, valued at the accent green; Aerie's `needs-light` and every needs-you mark in both kits read it, so the app bar's light is green now instead of amber. `font-sans` is now Instrument Sans, and a new `font-mono` token is IBM Plex Mono; Common serves both from Fontsource in place of Jost.
- d68bc06: The radial menu's stories follow Carbon's Storybook layout. `RadialMenu` and `RingProvider` each have an Overview page built from their own comment and props. The controls are the part's own props, and each story stages the part in a minimal page. The sample actions live in `radial-menu.fixture.ts`, which isn't built. Storybook now has the Docs addon, and it reads prop comments through imported types, so any part tagged `autodocs` gets the same kind of page. Every prop of `RadialMenu` and `RingProvider` now has a comment.
- 1968b92: Small parts in the picked looks (6 Nov 2026). Menus and tips are drawn as Sheet, like the shell's start menu: a solid square sheet with one edge, a hard ink line on the row you're on, and no blur. Menu gains an optional `heading` and `defaultOpen`, and Tip gains `defaultOpen`. Tabs are drawn as Key, raised keys in a tray. New Common parts `Badge` (a count or word as a small key) and `Divider` (a groove, with a label, strong or upright). Quill's Tag and Card are drawn as keys. The list under Select loses its blur.
- 4cd0e2b: `Status` (with `statusWords`, `statusUrgency`, `StatusName` and `StatusProps`) moves from Quill into Common, so Aerie can draw the same marks (PDR-016). Quill still exports it, through Common, under the same names; nothing about how it looks changes. Its classes are now `augur-status*`, and it has its own Storybook page, Common/Status.
- Updated dependencies [26ee249]
- Updated dependencies [c61d798]
- Updated dependencies [c1c66b8]
- Updated dependencies [5e55ec3]
- Updated dependencies [fdce175]
- Updated dependencies [7cc358d]
- Updated dependencies [958f774]
- Updated dependencies [c3c5603]
- Updated dependencies [0c1a803]
- Updated dependencies [eb64aa2]
- Updated dependencies [6aee7af]
- Updated dependencies [703ff74]
- Updated dependencies [24fccd7]
- Updated dependencies [f1742c3]
- Updated dependencies [0689319]
- Updated dependencies [f3241f3]
- Updated dependencies [4244f65]
- Updated dependencies [1968b92]
- Updated dependencies [ea33587]
- Updated dependencies [b5abdb1]
- Updated dependencies [4cd0e2b]
- Updated dependencies [6161ade]
  - @augur/kit-common@0.10.0

## 0.11.0

### Minor Changes

- 4d13d4f: A deployment can choose how depth is drawn (PDR-010, amendment 2). Its `FOCUS_DEPTH` setting reaches the page as an `augur-depth` meta. FocusStage, and so AppFrame, draws that depth over the app's own `depth`, because the choice is about the org's machines; `deploymentDepth()` reads it. With `scrim`, for desktops without a GPU, Common also stops every backdrop blur and makes the see-through surfaces solid.

### Patch Changes

- Updated dependencies [4d13d4f]
  - @augur/kit-common@0.9.0

## 0.10.0

### Minor Changes

- a8a7372: Tiles take PDR-010's last two amendments. A document tile is a dimmer page, so documents no longer always win the eye over the places around them (amendment 4). A tile with a radial menu has a "more" mark, bottom right, that shows while the tile is hovered or holds focus (always on a touch screen) and opens the same menu (amendment 6). The mark sits beside the tile's button in a new `.quill-tile-place` wrapper, which is now the grid item.

## 0.9.0

### Minor Changes

- d7d504c: The four design picks' visuals (PER-283), each off until an app turns it on:

  - `Letterbox` takes `look: 'see-through'`: solid cinema bars that close in from the edges, and a frame that is a window onto the work behind, racked to the deep plane. It also takes `more` (and `moreLabel`): what doesn't fit waits behind a More control and shows in place, so the frame never scrolls.
  - `RingProvider` and `AppFrame` take `overflow` / `ringOverflow: 'more'`: past eight actions the ring keeps the first seven in their slots and puts More in the slot left free (north-west when it is). More opens the rest as a ring of their own (a list past eight more); Esc comes back to More. `pageActions` and `RING_MORE_ID` are exported. The readout moves below an unavailable action's reason at the bottom of the ring instead of covering it.
  - `PathTree` takes `trail: 'draw'`: when the path changes, the lit line draws itself from the top down to where you are, a level at a time (new token `motion-trail`). Reduced motion draws it at once.
  - Storybook: "Design direction/The four picks", one story per pick and one with all four.
  - `List` takes `ringFor`: right-click or a long press on a row's words, or its "more" mark, opens the row's radial menu.

### Patch Changes

- Updated dependencies [d7d504c]
  - @augur/kit-common@0.8.0

## 0.8.0

### Minor Changes

- fe744dd: Quill writes dates the person's way (PER-323): `writeDate(when, options, formats)` and `useFormats()` read the shell's `ctx.formats` (AUGUR SDK 2.0), falling back to the browser's. The date field's words, the timeline's days and times, and a table's date column use them in place of `en-GB`; the timeline groups by day in their time zone. What a date field puts back to edit stays English, as it reads it.

### Patch Changes

- f24fa98: `AppError` reads a problem the way AUGUR's services send it: `reason` is the stable code (`forbidden`), now also `code`, and the message is `detail`. Before, a service's code became the message, so a refusal read "forbidden" rather than its sentence. A `reason` written as a sentence is still shown as the message.

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
