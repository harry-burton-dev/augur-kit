# @augur/shell-kit

## 0.12.0

### Minor Changes

- 1edb24c: One logo button replaces the rail's Home and Apps: it starts the desktop bar and ends the rail, and goes to the desktop. `ShellModel.logo` takes the deployment's mark (the kit's placeholder `mark` icon until it sets one). `ShellModel.desktop` names the app drawn on the desktop (Home): while it's open the bar stays across the screen, resting at an edge like a taskbar, the background stays, and the app isn't offered again as a tile. New: `BarLogo`, `AppBar`'s `edges`, `restingStop`, `ShellModel.onDesk`, and Common's `mark` icon.

### Patch Changes

- Updated dependencies [1edb24c]
  - @augur/kit-common@0.19.0

## 0.11.2

### Patch Changes

- 8a03b87: `State` and `StateBoundary` (with `StateKind`, `StateProps` and `StateBoundaryProps`) move from Quill into Common, so Aerie can say empty, loading, error and offline the same way (PDR-016). Quill still exports them, through Common, under the same names, and they look the same as #58 left them; their classes are now `augur-state*` (the mark is `augur-state-sign` and the running line `augur-state-run`). Their Storybook page moves to Common/State.
- 8a03b87: `Tag` (with `TagProps`) moves from Quill into Common, so Aerie can draw the same tags (PDR-016). Quill still exports it, through Common, under the same name, and it looks the same; its classes are now `augur-tag*`. Common also gets `Tags`, a row of tags that folds the rest behind "+N more" past a `limit`. Both have their own Storybook pages, under Common/Tag.
- Updated dependencies [8a03b87]
- Updated dependencies [8a03b87]
  - @augur/kit-common@0.18.0

## 0.11.1

### Patch Changes

- fdcdb1c: Common has a `size` group: marks and glyphs (`mark-xs` to `glyph-lg`), small controls (`control-xs` to `control-lg`), list and table rows (`row`, `row-compact`, `cell`, `cell-compact`, `bar-row`) and the narrowest a column, card, tile, aside or menu goes. Sizes, not spaces: density never changes them. The kits' CSS uses them, so raw distances go from 193 to 65 (what is left is container and media query widths, effects and the shell's own drawings). Every value is the same as before. Aerie's PaneLayout frame now takes its parent's width by itself.
- Updated dependencies [fdcdb1c]
  - @augur/kit-common@0.17.0

## 0.11.0

### Minor Changes

- 16eabf2: Aerie's `PaneLayout` draws an app's pane in the layout it chose (focus, aside, split or canvas), with the inset contract on every one: the head and the screen share one inline inset and one width cap, the top clears the stage's fade, sections sit `section-gap` apart, and a pane narrower than `pane-tight-below` uses `edge-tight`. The About panel appears only in aside. New shell tokens `split-list` and `pane-tight-below`.

### Patch Changes

- 6f2731f: Layout tokens: what each space is for. `pane-inset-inline`, `pane-inset-top` and `pane-inset-bottom` for an app's main column, `region-inset-inline` and `region-inset-block` inside a side region, and `stack-tight`, `stack`, `stack-loose` and `section-gap` between siblings. Each points at a step of the spacing scale, and each is a Tailwind spacing utility too (`gap-stack`, `px-pane-inset-inline`).

  Compact density is now in the tokens: a token's `$extensions.augur.compact` is its value under `data-density="compact"`, set on `<html>` for a person's preference or on any element, such as an app's pane, for an app's own choice. The larger steps come down one notch as before, and the layout tokens follow them.

  The floor gauge's lane is a token (`gauge-lane`, from `gauge-notch` and `gauge-pinned`) in place of a sum written in shell.css. The About panel and Quill's drawer pad with the region tokens, so their heads line up. The kits' raw distances allowance comes down to what is left, 195.

- Updated dependencies [6f2731f]
- Updated dependencies [16eabf2]
  - @augur/kit-common@0.16.0

## 0.10.3

### Patch Changes

- Updated dependencies [7191c32]
  - @augur/kit-common@0.15.1

## 0.10.2

### Patch Changes

- 4b23bc4: The docked rail stands the full height of the left edge, with Home and Apps in the corner square level with the band. The band starts beside the rail and stays see-through, so the rail's one edge is the only line where the bar meets the shell. The connection strip starts at the rail's edge.

  The band has no colour of its own any more: its scrim fade is gone, so the ground behind it sets it.

- Updated dependencies [479b7ef]
- Updated dependencies [eeb9ed3]
  - @augur/kit-common@0.15.0

## 0.10.1

### Patch Changes

- Updated dependencies [99d782c]
  - @augur/kit-common@0.14.0

## 0.10.0

### Minor Changes

- 5f85a4f: The shell's own bar draws the open app's places through RailPlaces when any of its pages `fills`. It is fed from the model: `ShellPage.path` and `fills`, `ShellModel.under` (by app, then place), `underCap` (the deployment's number, 50 unless it says) and `path`. Choosing a thing under a place, or "and n more", calls `openPath` and fires `ui-path` with `{ app, page, path }`. Pages that don't fill look as before. RailPlaces gains `onPlace`, `currentPlace`, `lit` and `lead`, and `onOpen` now also gives the place.

  Quill: a thing an app marks for the shell's radial menu. List items and kind tiles take `thing: { kind, id?, label? }`, and a table takes `thing: { kind, label? }` (label is a column key) for all of its rows. Each is drawn as `data-thing`, `data-thing-id` and `data-thing-label`, and the remote vocabulary carries the same. A kind that isn't a short lower-case word is dropped with a reason. `thingProps` is exported.

## 0.9.0

### Minor Changes

- d07a1eb: Aerie draws the frame round an app on the app contract's third major: a command palette over the commands apps declare (`isCommandKey`, Ctrl or ⌘ with Shift and P unless the shell passes another binding), the radial menu on the things an app marks with `data-thing`, the rail's places with what an app puts under them (capped, 50 unless the deployment says, with "and n more"; any path that leaves the app is dropped), and the About panel on the right. Commands an app can't run yet stay, locked, with the reason. The palette and the ring are Quill's: `@augur/app-kit` is now a peer of the shell kit, so the shell must load Quill's `kit.css` as well as Aerie's. Common gains the `about-panel` and `rail-under` shell tokens.

### Patch Changes

- Updated dependencies [d07a1eb]
  - @augur/kit-common@0.13.0
  - @augur/app-kit@0.14.1

## 0.8.2

### Patch Changes

- Updated dependencies [02c69ee]
  - @augur/kit-common@0.12.0

## 0.8.1

### Patch Changes

- Updated dependencies [ab0fea1]
  - @augur/kit-common@0.11.0

## 0.8.0

### Minor Changes

- 26ee249: Aerie gets the app bar (`AppBar`) and the still horizon (`Horizon`), ported from Harry's app bar mockup: a bar of tiles on the desktop that open start menus, which docks as the side rail when an app opens, with light for what needs you. Common gets the Horizon greys, the needs light, the bar's sizes and its glide as shell tokens, and the icons the bar uses.

  Common draws every scroll bar thin in its own colour (the new `scrollbar` token) instead of the browser default, since anything that must scroll should look like the kit.

- c61d798: Dialogs, notices and toasts in the Sheet look (picked 6 Nov 2026). Dialog is a solid square sheet with a mono heading strip and a ruled footer, over a dimmed page with no blur; a failure is stamped "Not done". New in Common: one notice family, `Notice` (inline or actionable, its tone stamped as a word in mono; new `label` prop), `Toast` and `Toasts` (their time left drains along the bottom edge and stops while held). Quill's `Notice` and Aerie's `Toasts` are now Common's, under the same names.
- 5e36f61: Aerie's backgrounds become a set to choose from: `Background` draws one by id (`horizon`, `flat`, `water`, `none`, or a deployment's own through `set`), with that background's own `options`. The still horizon can set where its line and rules sit and whether it glows; `Flat` is new (one grey, optionally tinted by the floor); `WaterGround` is the water as a part. Each has its own Storybook page under Aerie / Backgrounds, and their CSS moves out of the app bar's and the shell's into `backgrounds.css`. The horizon looks as it did by default.
- f6c2a8b: Connection and AppUnavailable drawn as Line (picked 6 Nov 2026). Connection is a full-width line under the band with the state's name and sentence in mono; the line is dashed offline, runs while reconnecting (still when motion is reduced) and breaks off when signed out. It gets an additive `names` prop for the state names. AppUnavailable drops the mark tile: the app's name stands on a horizon line, the state in mono over it with the app's icon, the reason in mono under it; the line is red when it failed and Common's Progress while it opens. New story pages Aerie/Connection and Aerie/App unavailable replace the old ones under Aerie/Notices.
- 6aee7af: The needs-you colour and the typefaces are tokens (PDR-015). New `needs-you` colour token, valued at the accent green; Aerie's `needs-light` and every needs-you mark in both kits read it, so the app bar's light is green now instead of amber. `font-sans` is now Instrument Sans, and a new `font-mono` token is IBM Plex Mono; Common serves both from Fontsource in place of Jost.
- 03ab8b8: The Shell draws the app bar and the backgrounds. On the desktop the bar runs across the chosen background, with a tile per group of apps and the open apps after a divider; with an app open it docks as the side rail, with Home, Apps, the open apps and the app's pages, and the app sits on flat ground. What needs you lights the way down to it. The model gains `groups`, `running`, `page`, `barHolds`, `barHint`, `backgroundOptions` and `backgroundSet`, apps gain `group`, `off` and `pages`, notifications gain `page`, settings gain `barStop`, and there are new events `ui-home`, `ui-page`, `ui-close-app` and `ui-bar-hint`. `background` now names a background (`horizon` by default); a water preset's name still means the water.

  Breaking for the shell: the band no longer draws `navs` or Back (the fields stay so a host still builds), and `CentreMenu` (Title and Orbit) is no longer exported. Its files are kept in `packages/shell-kit/archive/`.

- 0978079: The shell menu (what you see when you summon the Shell and look up) is built from parts, each with its own Storybook page in the Carbon structure: `ShellMenu` (the sky), `MenuArc`, `MenuCaption`, `MenuView`, `MenuEsc`, `MenuUndo`, and what goes in a view (`NotificationRow`, `MenuRow`, `MenuGroup`, `AgentMark`, `AppTiles`, `AppTile`, `MenuSearch`, `MenuPair`, `MenuSwitch`, `MenuChoice`, `MenuKeys`, `MenuWho`, `MenuNote`, `MenuSkeleton`, `MenuRetry`, `MenuTools`, `MenuLink`). Each draws only what its own props say; icons are Common icon names. The Shell now puts its menu together from these parts, and draws exactly the same markup as before, so nothing looks or behaves differently. `arcOrder` and `arcSlot` place functions on the arc. The sample content lives in `shell-menu.fixture.tsx`, which isn't built.
- b5abdb1: Every corner is square. The radius tokens (`radius-key`, `radius-control`, `radius-inset`, `radius-card`, `radius-pill`) are all 0, so keys, wells, tabs, tags, cards, dialogs, notices, popovers, toasts and the old pills sit with the square Sheet menus and tips. The few corners written as raw pixels are square too. Only true circles (radios, status dots, avatars) stay round. The token names stay, so nothing an app uses is removed.

### Patch Changes

- 703ff74: People and activity in the picked looks (6 Nov 2026). Person and People are drawn as a Disc: a flat grey disc with Instrument Sans initials, ringed in the floor's colour, and you ringed in plain ink, never green. New `here` prop on Person and People: someone away is dimmed back and it's read aloud. New in Common: `Presence` (who is here now), `Comments` (points that stay open until settled, settled ones fold to a line, replies one step in), `Activity` (what needs you pulled above, a find field, a line where you last looked, pages instead of scrolling) and `Notifications` with `NotificationItem` (key rows in a well, unread raised). Quill's PeoplePicker gathers its choices under the field as a list in a well, each with what they can do and a key to take it off.
- 4cd0e2b: `Status` (with `statusWords`, `statusUrgency`, `StatusName` and `StatusProps`) moves from Quill into Common, so Aerie can draw the same marks (PDR-016). Quill still exports it, through Common, under the same names; nothing about how it looks changes. Its classes are now `augur-status*`, and it has its own Storybook page, Common/Status.
- 6161ade: The water's colours come from the tokens. Its five other presets (Deep Ocean, Aurora, Sonar Line, Minimal and Split Field) had their colours typed into the code. Their colours are now shell tokens (`water-*`), or Common's `navy`, `green`, `slate` and `slate-deep` where they already matched. Nothing looks different. The tokens-only test now reads the kits' plain TypeScript files too, and it reports raw distances in the kits' CSS and stops their count growing. A new Storybook test checks that every part the kits export has a story. Parts still waiting for one are listed, and they get their stories as they are restyled.
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

## 0.7.2

### Patch Changes

- Updated dependencies [4d13d4f]
  - @augur/kit-common@0.9.0

## 0.7.1

### Patch Changes

- Updated dependencies [d7d504c]
  - @augur/kit-common@0.8.0

## 0.7.0

### Minor Changes

- 5eae93a: A notification can arrive `quiet`: Aerie lands it in the stream like a muted app's, with no pulse, and leaves it out of the band's count. The shell sets it for the kinds of notification a person made quiet in Account.

## 0.6.0

### Minor Changes

- c4ce624: A Shell function can now be unavailable: `ShellFunction` takes an optional `unavailable` reason, as navs do. The button stays on the arc and focusable, looks unavailable, carries `aria-disabled` and the reason in its name and hover name, and pressing it does nothing.

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
