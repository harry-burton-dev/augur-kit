# Switching AUGUR to the new kit

Status: draft for Harry's review, 6 November 2026. Written from the kit's side for the `augur` repository and
the app repositories, so each knows what to change when it takes the kit after `kit-common` 0.9.0,
`app-kit` 0.11.0 and `shell-kit` 0.7.2.

The kit release itself, and the `release/kit.json` bump that puts it in front of deployments, are not
covered here. They are step 0 below and happen first.

## What the work is

The kit has been redrawn in the Horizon language and the shell's navigation has been replaced. For apps,
this is mostly a version bump: every Quill and Common name they import still exists and still takes the
same props. The look changes under them, and a few app styles now fight it. For the shell, it is real work:
the new Aerie drops Title and Orbit, so the shell no longer builds until it draws the app bar instead.

| Repository | Work | Size |
| --- | --- | --- |
| `augur`, `platform/frontends/shell` | Take the app bar: remove Title and Orbit, set the bar's model, handle its events | Large |
| `augur`, `platform/packages/mfe-sdk`, `services/registry`, `contracts`, `app-tools` | Say what `menu`, `areas` and `orbit` mean now (comments and descriptions only) | Small |
| `augur`, `platform/contract` | Rewrite the Title and Orbit tests for the bar, desktop and rail | Medium |
| `augur`, docs and READMEs | Retire Title and Orbit in the words | Small |
| `augur`, `frontends/sign-in-theme` | Move from `kit-common` ^0.2.0 to the new kit: fonts, blur, green | Small |
| `augur`, `frontends/admin`, `home`, `upgrades` | Version bump and a look | Small |
| `augur-auspex` | Clear the most drift: blur, green as "here", raw radii, own discs and meters | Medium |
| `augur-atlas`, `augur-folio`, `augur-mandate` | Version bump and a few local styles | Small |
| `augur-app-template` | Version bump, so new apps start on the new kit | Small |

## Decisions

Each has a recommendation. Saying "defaults" takes them all.

| # | Decision | Recommended | Other options |
| --- | --- | --- | --- |
| D1 | Where the app bar's groups come from | The shell builds them from each app's `category` in force: Platform, Pillars, then Apps for the rest. No SDK change | A new manifest field `group` now, before the domains are settled (the Navigation brief leaves them open) |
| D2 | What the rail shows for an open app | The shell builds the app's pages from its manifest `menu`, one page per item, in Orbit's order | Wait for `AppFrame`'s rail to draw into a shell slot, which needs an ADR and a prototype first |
| D3 | Several open apps | `running` holds only the app in front, since `mount.ts` mounts one app at a time. The bar already knows how to show more | Keep every opened app mounted now |
| D4 | Where the bar's position is kept | In the person's preferences in identity, next to `areaTitles` and `toasts`: one new optional field, `barStop` | In the browser only, which forgets it on another device |
| D5 | The `menu`, `areas` and `orbit` manifest fields | Kept, because the SDK only adds. `menu` now fills the rail, `areas` and `orbit` are read but no longer drawn, and the comments say so | Mark `orbit` and `areas` as deprecated for SDK 3 |
| D6 | Esc that nothing else used | No longer leaves an app. The rail's Home is the way out, as it already is for apps with `orbit: false` | Esc goes to the desktop |
| D7 | The desktop's background | The kit's default, the still horizon, with no deployment setting yet | A deployment setting for `background` now |

## What changed in the kit

### Aerie (the shell's own kit, built into the shell)

- **The app bar replaces Title and Orbit** (#46, #52). `Shell` draws `ShellBar` from its model. On the
  desktop the bar runs across the background, with a tile per group of apps and the open apps after a
  divider. With an app open it docks as the side rail: Home, Apps, the open apps and the open app's pages.
  What needs you lights the way down to it, in the `needs-you` colour.
- **Removed:** `CentreMenu`, `CentreMenuModel`, `searchMenu` and the types `CentreMenuProps`,
  `CentreMenuElement`, `MenuCategory`, `MenuItem`, `MenuOption`, `MenuVariant` and `MenuBackground`. The files
  are kept in `packages/shell-kit/archive/` and are not built.
- **No longer drawn:** the band's round buttons (`navs`, `ShellNav`) and Back (`backTo`). The fields and the
  type stay so a host still builds, but nothing fires `ui-nav` any more.
- **New on `ShellModel`:** `groups` (`ShellAppGroup[]`), `barHolds` (`'groups'` or `'folder'`), `barHint`,
  `running` (app ids in the order they opened), `page` (the open app's page id), `backgroundOptions` and
  `backgroundSet`.
- **New on `ShellApp`:** `group` (a group id), `off` (why it can't open here; it stays in its start menu,
  greyed, with this as its small print) and `pages` (`ShellPage[]`: `id`, `name`, `icon`).
- **New on `ShellNotification`:** `page`, so the bar can light the way to a page and not only an app.
- **New on `ShellSettings`:** `barStop` (0 under the band, 1 upper, the default, 2 lower, 3 at the bottom).
- **New events:** `ui-home`, `ui-page { app, id }`, `ui-close-app { id }` and `ui-bar-hint`. `ui-open-app`
  now also comes from the bar's tiles and start menus.
- **Backgrounds are a set** (#49). `background` names one by id: `horizon` (the default), `flat`, `water` or
  `none`. A water preset's name ("Minimal", "Deep Ocean") still works and means the water. With an app open,
  the background steps away and the app sits on flat ground by itself. `waves` is null unless the water is
  showing.
- **Parts you can use directly:** `AppBar`, `BarTile`, `StartMenu` and its items, `Background`, `Horizon`,
  `Flat`, `WaterGround`, and the shell menu parts (`ShellMenu`, `MenuArc` and the rest, #48). The Shell
  already draws all of them, so the shell host needs none of them unless it adds a screen of its own.
- **`Toasts`** is Common's now. Aerie still exports it under the same name.

### Common and Quill (what apps get from the kit bundle)

Nothing an app imports was removed or renamed. The audit below checked every named import in every AUGUR
repository against the kit's current exports, and only the shell's Title and Orbit imports fail.

- **Moved into Common, still exported by Quill under the same names:** `Status`, `statusWords`,
  `statusUrgency` (#57, PDR-016), and `Notice` with `Toast` and `Toasts` (#56). The `Status` classes are
  `augur-status*` now.
- **New in Common:** `SideSheet`, `InfoPop`, `Badge`, `Divider`, `Presence`, `Comments`, `Activity`,
  `Notifications`, `Snippet`, `Folds`, `ComboBox`, `MultiSelect`, `NumberField`, `Slider`.
- **New in Quill:** `StateBoundary`, `TimeField`, `DateRangeField`, `Guide`, `FirstSteps`, `UploadList`,
  `Attachment`, `Picture`, `FilePreview`, `EditInPlace`, `useRingTouch`, and `Table`'s `pageSize`.
- **Tokens:** `needs-you` is the one colour that means "needs you" (PDR-015), valued at the accent green.
  `font-sans` is Instrument Sans and `font-mono` is IBM Plex Mono, in place of Jost. Every radius token is 0
  (PDR-017), including `radius-pill`, so anything that used it to draw a circle is now a square. New `well`,
  `well-edge`, `well-depth`, `key-edge`, `scrollbar` and `measure-table-virtual`. No token was removed.
- **Looks that change under apps:** buttons are keys and the primary is light, not green; fields, lists,
  tables and rows sit in wells; dialogs, menus and tips are solid sheets with no blur; `State` is a line, not
  a box. Green now means only "needs you" (PDR-015), and depth is dimming, never blur.

## What each repository does

### Step 0. The kit reaches AUGUR (another thread)

The kit is released, and an AUGUR pull request bumps `release/kit.json` and the shell's `@augur/kit-bundle`.
Everything below waits for that, because the shell links the bundle's CSS and the new Aerie needs the new
Common tokens.

### Step 1. The handbook first

The Navigation brief lists rules this changes, and the project's rule is that a principle changes before
the code that breaks it ships. Before the shell pull request merges:

- **Shell principles:** "Fixed depth" becomes "the bar shows apps, the rail shows the app's pages". "Home and
  Title go there from anywhere" becomes "Home is in the rail and the desktop is behind the bar". "Every app
  stands on the same ground" holds, on flat ground. The Esc rule follows D6.
- **Glossary and naming:** Title becomes the app bar (its name needs a PDR, as the brief says), and Orbit
  retires.

### Step 2. The SDK and registry say what the fields mean now

In `platform/packages/mfe-sdk/src/contract.ts`, `services/registry/src/manifest.ts`,
`contracts/manifest.schema.json` and `platform/packages/app-tools/manifest.schema.json`, only words change:

- `menu`: "the app's pages, shown in the app bar's rail while the app is open" (D2, D5).
- `areas`: "kept for older shells; the app bar doesn't draw them".
- `orbit`: "kept for older shells; there is no Orbit, so it changes nothing".
- `AppMenuCategory`: "a group of an app's pages" in place of "one stop on the Orbit ring".

An SDK patch with a changeset. Add `barStop` to identity's preferences schema (D4) in the same pull
request or the shell's: optional, 0 to 3, default 1.

### Step 3. The shell takes the app bar

In `platform/frontends/shell`, in one pull request:

1. **Bump** `@augur/shell-kit` to the release with the app bar (0.8.0 from the pending changesets).
2. **Remove Title and Orbit.** In `src/App.tsx`, drop `CentreMenu`, `CentreMenuModel`, `MenuCategory` and
   `MenuItem`, `menuRef`, `orbitStart`, `waterFor`, `waterAt` and the effect that wires the menu's
   `ui-select`, `ui-back` and `ui-change`. In `src/host/menus.ts`, `Screen` becomes
   `{ kind: 'desktop' } | { kind: 'app'; app; path }`: `/` is the desktop, and an app's root opens the app
   itself, intent or not. Remove `titleMenu`, `titleTarget`, `orbitMenu`, `orbitIndexOf`, `navsFor`,
   `navTarget`, `backFrom` and `upFrom`. Keep `orbitGroups` under a new name for the rail's order (D2).
3. **Set the bar's model** wherever the manifest or the location changes:
   - `shell.groups`: from `category` (D1): `platform` as Platform, `pillar` as Pillars, the rest left
     without a group so they go under Apps. Each needs an `id`, `name` and `icon`; the words come from the
     shell's own words file, not from the manifest.
   - each `ShellApp`'s `group`, `pages` (one per `menu` item: `id` is the item's `id` or its `path`, `name`
     its `label`, `icon` its `icon` or the group's), and `off` when the shell won't open it here: an SDK
     range it doesn't satisfy, or a floor kind it doesn't work on. That keeps it in view and saying why.
   - `shell.running = current ? [current] : []` (D3), and `shell.page` from the location: the id of the
     menu item whose `path` matches, or ''.
   - `notification.page` where a notification's `path` matches one of its app's pages.
   - `shell.barHint` the first time, from the shell's words, until `ui-bar-hint` says it was read.
   - Stop setting `navs`, `backTo` and `background`. Delete `menu.background = shell.waves`.
4. **Handle the bar's events** on the model:
   - `ui-open-app { id }`: go to `hrefFor(app)` (it already does; it now also comes from the bar).
   - `ui-home`: leave the app and go to `/`, the way `ui-nav` did for Home.
   - `ui-page { app, id }`: go to that page's `path` inside the app. With `followsAddress` the app stays
     mounted.
   - `ui-close-app { id }`: unmount it. If it was in front, go to `/` (with D3 nothing else is open).
   - `ui-setting` with `barStop`: keep it in preferences (D4) and send it back in `shell.settings`.
   - `ui-bar-hint`: remember that the hint was read.
   - Remove `onNav` and its listener.
5. **Esc** (D6): remove the effect that went from an app to its Orbit and from Orbit to Title.
6. **The ghost:** `liftGhost(shell.placeTitle)` still works, since `placeTitle` is the band's app name. The
   icon it lifts now comes from the bar tile, not from Title.
7. **CSS:** in `src/shell.css`, delete the two `.aerie-centre` rules. `.preview-badge` uses
   `var(--radius-pill, 999px)`, now 0 from the token: keep it square (PDR-017).
8. **Tests:** `src/host/menus.test.ts` follows the new `Screen`.

### Step 4. The contract tests

In `platform/contract/tests`, `pillar.spec.ts` and `a11y.spec.ts` look for `.aerie-centre` and Title and
Orbit. Rewrite them for:

- the desktop shows the bar with a tile per group, and each tile's start menu lists its apps;
- opening an app docks the bar as the rail, with Home, Apps and the app's pages;
- a page in the rail opens that page, and the address follows;
- Home goes back to the desktop;
- an app that can't open here stays in its start menu, greyed, and says why;
- axe finds nothing serious on the desktop, on a start menu and in the rail.

`contract.spec.ts` uses `.aerie-shell`, `.aerie-act`, `.aerie-search`, `.aerie-view` and `.aerie-row`, which
still exist and need no change.

### Step 5. Words

Update `README.md` (the shell "draws Title and Orbit menus"), `platform/frontends/README.md` ("Title and
Orbit", including the Esc rule) and `docs/build-an-app.md` ("`menu` gives the app an Orbit") to match
steps 2 and 3. `admin/src/app.tsx` says Admin's Orbit lives at `/` in two comments, and that code path goes
to the desktop now.

### Step 6. Each app uses the kit properly

Each app repository takes the new `app-kit` in one pull request after step 0. Its type range moves to the
release (they range from ^0.7.0 to ^0.9.0 today), and the app's own CSS stops fighting the kit:

| App | What to change |
| --- | --- |
| `augur-auspex` | `.ax-pane` blurs (`backdrop-filter`): drop it, solid surface. Green marks "here", "you", "picked" and "running" (15 uses): use ink, since green means only "needs you". Raw radii (1px, 2px) go square. `.ax-disc` people: Common `Person` and `Presence`. `.ax-machine .meter`: Common `Progress`. `.ax-tally` and `.ax-names` pills: `Badge` or `Tag`. Glow rings (`box-shadow` halos): an ink edge. `--tallest` is set inline by the app, so it stays |
| `augur-atlas` | `.atlas-dot` and `.atlas-map-mark` are meant round but use `radius-pill`, now 0: use `50%`, or Common `Status` for status dots. `.atlas-fold`: Common `Folds`. Three green uses to check against "needs you" |
| `augur-folio` | `.folio-selection` blurs: drop it, or use Quill's `SelectionBar`. `--warn-ink` isn't a token: use `warning` |
| `augur-mandate` | `.mandate-badge`: Common `Badge`. Otherwise the bump |
| `augur-app-template` | The bump to the current `app-kit`, so new apps start on it |
| `admin`, `home`, `upgrades` | Already on ^0.11.0. Take the release and look at each page; no drift found |
| `sign-in-theme` | On `kit-common` ^0.2.0 with Jost. Move to the current Common and its `fonts.css`, drop the blur on the card and the green primary and links (a Keycap-style primary, ink links) |

### The order

1. Step 0, in the delivery thread: the kit release and the `release/kit.json` bump.
2. Step 1: the handbook edits, and the app bar's name PDR.
3. Steps 2 to 5, together or the SDK first. The shell's pull request carries steps 3, 4 and 5, because its
   tests and the contract tests change together.
4. Step 6, one pull request per app repository, in any order. Each app is fine before and after the shell
   switch, because apps never import Aerie.

## How to check it worked

**In the shell's pull request**

- `pnpm typecheck` and `pnpm test` pass in `platform/frontends/shell`, and `pnpm check:boundaries` passes at
  the root.
- No `CentreMenu`, `MenuCategory`, `navsFor`, `orbitMenu`, `aerie-centre` or `ui-nav` is left in
  `platform/frontends/shell` or `platform/contract`.
- The contract tests in step 4 pass, against the real shell.

**On a running shell** (a live session on the connected computer)

The Navigation brief's test, on Artifacts. Without help, a person can:

1. open Artifacts from the bar;
2. say which floor, app and page they're in within about 5 seconds;
3. find a document by walking to where it lives in the rail;
4. switch to another app and come back to the same place;
5. get back to the desktop.

Also check: the bar's position is kept after reload (D4); an app that can't open on this floor stays in its
start menu and says why; a notification that needs you lights its app and page in the `needs-you` colour;
with reduced motion the bar docks without gliding.

**In each app's pull request**

- `pnpm lint`, `pnpm typecheck` and `pnpm test` pass.
- No `backdrop-filter` left in the app's CSS, no `var(--green)` except where it means "needs you", and no
  `radius-pill` used for a circle.
- The app's pages look right in the shell on the released kit, by eye, before merging.

## The audit

How this was found, on 6 November 2026: every repository was read at `main` (`augur`, `augur-auspex`,
`augur-atlas`, `augur-folio`, `augur-mandate`, `augur-app-template`, `augur-run`). Every named import from
`@augur/kit-common`, `@augur/app-kit` and `@augur/shell-kit` was checked against what the kit exports now.
Every `var(--…)` in their CSS and TypeScript was checked against the three token files, and every `quill-` and
`aerie-` class against the kit's. Then each app's CSS was read for blur, shadow, raw radii and green.

- **Imports that fail:** only the shell's `CentreMenu`, `CentreMenuModel`, `MenuCategory` and `MenuItem`.
- **Classes that are gone:** only `aerie-centre`, in the shell's CSS and `pillar.spec.ts`.
- **Tokens that aren't tokens:** `--warn-ink` in Folio (with a fallback) and `--tallest` in Auspex (set by the
  app itself).
- **`augur-run`** uses no kit part.
