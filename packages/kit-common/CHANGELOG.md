# @augur/kit-common

## 0.14.0

### Minor Changes

- 99d782c: Quill's remote vocabulary gains what admin screens need: `quill-dialog` (its work done in the sandbox: a submit sends the fields' values and the dialog waits, busy, until the app closes it or says why not), `quill-ask-twice`, `quill-choice`, `quill-checkbox-group`, `quill-date-field`, `quill-tag-picker`, `quill-steps`, `quill-progress` and `quill-status`. Common's `Dialog` takes `busy` and `error` from outside, for a dialog whose work is done elsewhere.

## 0.13.0

### Minor Changes

- d07a1eb: Aerie draws the frame round an app on the app contract's third major: a command palette over the commands apps declare (`isCommandKey`, Ctrl or ⌘ with Shift and P unless the shell passes another binding), the radial menu on the things an app marks with `data-thing`, the rail's places with what an app puts under them (capped, 50 unless the deployment says, with "and n more"; any path that leaves the app is dropped), and the About panel on the right. Commands an app can't run yet stay, locked, with the reason. The palette and the ring are Quill's: `@augur/app-kit` is now a peer of the shell kit, so the shell must load Quill's `kit.css` as well as Aerie's. Common gains the `about-panel` and `rail-under` shell tokens.

## 0.12.0

### Minor Changes

- 02c69ee: Quill's remote vocabulary for the app contract's third major (ADR 0076): `@augur/app-kit/remote` defines the `quill-*` elements an app's sandbox describes its screen with, and `QuillRemote` draws them on the host with the kit, dropping anything outside the vocabulary with a console reason. The allowlist ships as `@augur/app-kit/remote/allowlist.json`. `List` takes `virtual` for long lists, sized by Common's new `measure-list-virtual` token, and lists and tables from a sandbox draw only the rows in view from 200 rows.

  Every property the vocabulary names states its shape down to the fields of a list's items, with the values an enum takes, and the host keeps only what fits. A part that fails to draw stops only itself. Common's `Icon` draws nothing for a name that isn't one of its own icons, such as `constructor`.

## 0.11.0

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

## 0.10.0

### Minor Changes

- 26ee249: Aerie gets the app bar (`AppBar`) and the still horizon (`Horizon`), ported from Harry's app bar mockup: a bar of tiles on the desktop that open start menus, which docks as the side rail when an app opens, with light for what needs you. Common gets the Horizon greys, the needs light, the bar's sizes and its glide as shell tokens, and the icons the bar uses.

  Common draws every scroll bar thin in its own colour (the new `scrollbar` token) instead of the browser default, since anything that must scroll should look like the kit.

- c61d798: Dialogs, notices and toasts in the Sheet look (picked 6 Nov 2026). Dialog is a solid square sheet with a mono heading strip and a ruled footer, over a dimmed page with no blur; a failure is stamped "Not done". New in Common: one notice family, `Notice` (inline or actionable, its tone stamped as a word in mono; new `label` prop), `Toast` and `Toasts` (their time left drains along the bottom edge and stops while held). Quill's `Notice` and Aerie's `Toasts` are now Common's, under the same names.
- c1c66b8: Data marks drawn as Key (picked 6 Nov 2026). Tree, PathTree, Path, Refs, Lifecycle, Timeline, Tiles and Reel sit in a well, like a field, and the thing you're on comes up as a soft key. Counts, times, days and kinds are mono. The path tree dims by distance only, with no blur, and a row that needs you shows a green dot instead of a glow. Tiles are flat Key cards that show their kind by icon and word, not by shape. A reel's front card is a key and the rest are dimmed. Floors on Path and Refs show by icon, not colour, so green only means "needs you". Signal keeps its animated lights, each set in a small well. UrgentEdge is a raised strip with a red lip and an Open key. New story pages: Quill/Path, Quill/Timeline, Quill/Tiles, Common/Urgent edge.
- 5e55ec3: The editor no longer fails to draw in a real browser. When an editor is replaced, as on a remount, its toolbar stops reading the old, destroyed editor. Chromatic found this in the Writing and Editor states stories.

  A virtual `Table` is now at most `measure-table-virtual` tall (a new app token, 640px) and scrolls inside itself. Before this it grew to every row's height, 280,000px for the 5,000-row story, so only the first screen of rows was ever drawn and Chromatic couldn't capture it.

- fdce175: Fields, checkboxes, radios (Choice), toggles and selects are drawn as wells (Well, picked 6 Nov 2026): the Keycap
  button's counterpart, a slot a step darker than the ground with its depth as a thicker top line. Ticked boxes, an
  on knob come up as small light keys, and a chosen option's outline and mark are ink, no longer green (green means
  "needs you"). One focus ring for the whole kit, also as the class `augur-focus-ring`. New tokens `well`,
  `well-edge` and `well-depth`. Each part has its own story page with its props as controls. No prop changes.
- 7cc358d: Search, links, key caps and skeletons in the Key look, and busy in the Groove look (picked 6 Nov 2026). New in Common: `SearchField`, the one search field (a well with a find mark that matches as you type, a shortcut key shown while empty and Esc to clear once you write); `Link`, never underlined, ink words that lift as a soft key when pointed at, the same inside and outside AUGUR; `KeyCap`, a key to press drawn as a small real key, with `keys` for a combination; and `Skeleton`, empty wells in the shape of what is loading. A busy Button no longer spins: ink runs along its bottom edge, and a busy Toggle runs the same line under its switch. Menus, dialogs, side sheets and the first-run guide draw their keys as `KeyCap`. Quill's FilterBar and table filter, and Common's Activity, now use `SearchField`; the Palette keeps its own Rail field. No props removed; the `augur-spinner` class stays for apps that drew their own.
- 958f774: Round P picks (6 Nov 2026). The letterbox is drawn as Iris: solid masks close in from the screen's top and bottom edges, so nothing of the work shows above or below and nothing is blurred, and the see-through look's frame dims without blurring (PDR-015). Explain is drawn as Rule: one column, each label in mono on its own hairline, made to stand beside the item it explains. A reason under an unavailable control is a solid Sheet tip, never blurred, and the control carries a small lock mark on its corner all the time. New Common/Explain story page and a Patterns/Explain beside an item page.
- c3c5603: Empty, loading and error states drawn on the horizon (Harry's pick, 6 Nov). Quill `State` has no box: the sentence sits on a groove, loading draws the line across, an error turns it red with a diamond, and offline amber. Its action is now a Keycap button. New `size="page"` for a whole page, and new `StateBoundary`, which shows a State when a part throws while drawing. Common `Progress` is the same line, filled with ink instead of green, and the current step in `Steps` is ink too: green means only "needs you". `Rows` no longer puts `role="alert"` on a list item.
- 0c1a803: New inputs, picked from the input directions. Common: `ComboBox` (type to find one in a long list, its matches on a sheet), `MultiSelect` (several from a set, words and a count in the well), `NumberField` (step keys at the end, a unit in small capitals), `Slider` (a fader, or `steps`), and a `minus` icon. Quill: `TimeField` (written as you'd say it, with an echo of the time it reads) and `DateRangeField` (two date fields joined by a line, with the days it spans).
- eb64aa2: The Button is a key (Keycap): flat, with a small corner (`radius-control`), and its depth in a thicker bottom line (`key-edge`, `key-edge-sm`) that closes when pressed. Labels are in sentence case, not tracked capitals. The primary is a light key rather than green, which now means only "needs you"; danger is a grey key with red words that fills red when armed. A new `icon` prop puts any icon before the label. The Button stories follow the Carbon structure, with a docs page.
- 6aee7af: The needs-you colour and the typefaces are tokens (PDR-015). New `needs-you` colour token, valued at the accent green; Aerie's `needs-light` and every needs-you mark in both kits read it, so the app bar's light is green now instead of amber. `font-sans` is now Instrument Sans, and a new `font-mono` token is IBM Plex Mono; Common serves both from Fontsource in place of Jost.
- 703ff74: People and activity in the picked looks (6 Nov 2026). Person and People are drawn as a Disc: a flat grey disc with Instrument Sans initials, ringed in the floor's colour, and you ringed in plain ink, never green. New `here` prop on Person and People: someone away is dimmed back and it's read aloud. New in Common: `Presence` (who is here now), `Comments` (points that stay open until settled, settled ones fold to a line, replies one step in), `Activity` (what needs you pulled above, a find field, a line where you last looked, pages instead of scrolling) and `Notifications` with `NotificationItem` (key rows in a well, unread raised). Quill's PeoplePicker gathers its choices under the field as a list in a well, each with what they can do and a key to take it off.
- 24fccd7: The pickers in the Rail look Harry picked (round M), drawn on one ruled line like page frame A. FilterBar is one ruled line with saved views at its start (new `views`, `view` and `onView` props) and what each filter has on in words, so the row of chips under it is gone. Palette is a ruled strip that dims what's behind it and never blurs it (new `lead` and `found` props). The DateField calendar is a ruled month with the chosen day underlined in ink instead of green. TagPicker writes its tags as ruled words, and Common's Segmented puts an ink bar under the chosen word. List gets a `plain` look and expanding rows (`more` on an item, `moreLabel`). FilterBar, DataView and Palette get their own story pages.
- f1742c3: The radial menu has two rings. Its actions are wedges in a solid disc, each in its fixed direction with its name inside, and Cancel sits in the hub. An action's targets fan out on an outer ring in its direction, up to five (`RING_TARGETS_MOST`), and open as a list beside it past that. The ring opens where it was opened and moves in from an edge whole, so no verb changes direction. Keys 1 to 8 pick a direction. One readout under the ring says where you are (thing, verb, place), why an action can't be done and who can change it, and what a choice would change. Unavailable actions are hatched and locked, the selected one is ink, and danger is the only colour. A held action fills the hub. The disc has no blur or shadow and opens with one quick fade. New Quill tokens: `ring-hub`, `ring-outer`, `ring-band` and `ring-seam`. Every prop and type an app passes today works as before.
- 0689319: Consequence focus for the radial menu (V6). An action can name what it `touches` (`RingTouch`: id, label, effect). While it has focus, each thing on the page marked with `useRingTouch(id)` steps forward out of the rack. It is framed in ink (red for what danger breaks), with its effect and a lead from the subject. The readout lists every touch in words, so things scrolled off screen are still named. A held action that touches something is letterboxed until it is let go. The letterbox shows what it does, what it touches, how to cancel and, when the app gives `undo`, how to undo it. With reduced motion it is letterboxed between the two presses. `useRack` takes `holes` to keep more than one box sharp. Common's `Letterbox` gains `passive`, which draws the frame without a dialog while focus stays where the decision is being made.
- f3241f3: Run output parts in the picked looks: RunLog (Steps), a run's log as one fold per step that opens the step needing a look and shows its last lines; Diff (Sink and rise) and DiffText, what changed key by key or word by word with no colour; and Inspector (Columns), a value opened column by column with the path and values as keys to copy.
- 4244f65: Two new overlay parts in Common, in the looks Harry picked: `SideSheet` (Leaf), for create and edit work too big for a dialog, from the right edge over the dimmed page, with steps for a bigger flow and stacking when one is opened from another; and `InfoPop` (Slip), a press-to-open why beside a label or setting that can hold one link.
- 1968b92: Small parts in the picked looks (6 Nov 2026). Menus and tips are drawn as Sheet, like the shell's start menu: a solid square sheet with one edge, a hard ink line on the row you're on, and no blur. Menu gains an optional `heading` and `defaultOpen`, and Tip gains `defaultOpen`. Tabs are drawn as Key, raised keys in a tray. New Common parts `Badge` (a count or word as a small key) and `Divider` (a groove, with a label, strong or upright). Quill's Tag and Card are drawn as keys. The list under Select loses its blur.
- ea33587: New parts from the copy, code and folds round, in the looks Harry picked on 6 Nov 2026. Common gets `Snippet`, code to copy drawn as one key you press anywhere (Press to take): it folds long code to its first lines, works inline in a sentence, and says what to do if the browser refuses. Common also gets `Folds` and `Fold`, headings that open a section, sitting in a tray where the open one rises as a key over a Well (Drawer). Quill gets `EditInPlace`, which changes one value where it sits with a Rename key beside it, Save and Cancel while editing, and a refused save that keeps your words (Key beside). Each has Carbon-style stories and tests, and the directions page is gone.
- b5abdb1: Every corner is square. The radius tokens (`radius-key`, `radius-control`, `radius-inset`, `radius-card`, `radius-pill`) are all 0, so keys, wells, tabs, tags, cards, dialogs, notices, popovers, toasts and the old pills sit with the square Sheet menus and tips. The few corners written as raw pixels are square too. Only true circles (radios, status dots, avatars) stay round. The token names stay, so nothing an app uses is removed.
- 4cd0e2b: `Status` (with `statusWords`, `statusUrgency`, `StatusName` and `StatusProps`) moves from Quill into Common, so Aerie can draw the same marks (PDR-016). Quill still exports it, through Common, under the same names; nothing about how it looks changes. Its classes are now `augur-status*`, and it has its own Storybook page, Common/Status.
- 6161ade: The water's colours come from the tokens. Its five other presets (Deep Ocean, Aurora, Sonar Line, Minimal and Split Field) had their colours typed into the code. Their colours are now shell tokens (`water-*`), or Common's `navy`, `green`, `slate` and `slate-deep` where they already matched. Nothing looks different. The tokens-only test now reads the kits' plain TypeScript files too, and it reports raw distances in the kits' CSS and stops their count growing. A new Storybook test checks that every part the kits export has a story. Parts still waiting for one are listed, and they get their stories as they are restyled.

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
