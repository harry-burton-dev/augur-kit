# @augur/app-kit (Quill)

The React kit apps build with (ADR 0015), on [Common](../kit-common/README.md). Each kit release bundles it with React 19 and Common ([kit-bundle](../kit-bundle/README.md)); the deployment serves that bundle through the import map, so it keeps the SDK's promise ([Versioning](https://github.com/harry-burton-dev/im-platform/blob/main/docs/versioning.md#the-react-kits-adr-0015)) and an app's bundle carries none of it.

Its parts arrive as the Lit kit's groups move to React; until then apps keep `@augur/ui-kit`. For an app's own layout, Tailwind with only AUGUR's tokens:

```css
@import 'tailwindcss/utilities' layer(utilities);
@import '@augur/app-kit/theme.css';
```

No preflight: apps draw inside the shell, which already sets the page's base.

## The app-frontend starter

One way to mount, route, load and call (AUGUR's ADR 0054). It wraps TanStack Query, TanStack Router and openapi-fetch, which ride inside this package in the kit bundle, so an app never imports them and none of their types are part of the kit's promise.

```tsx
import { defineReactApp, placeRoutes, place, createAppClient, useAppContext, useData, DataView } from '@augur/app-kit';
import manifest from '../manifest.json' with { type: 'json' };
import type { paths } from './api-types.js';

export const places = placeRoutes({
  front: place('/', Front),
  library: place('/libraries/:library', Library, { sort: ['name', 'date'] }),
});

function Library() {
  const { library } = places.library.useParams();
  const { sort } = places.library.useSearch();
  const api = createAppClient<paths>(useAppContext(), { base: '/api/folio/v1', appName: manifest.name });
  const state = useData(['library', library], () => api.get('/libraries/{id}', { params: { id: library } }), { refreshOn: ['folio.library.changed'] });
  return <DataView state={state} loading="Loading the library">{(l) => <LibraryView library={l} sort={sort} />}</DataView>;
}

export default defineReactApp({ name: manifest.name, App: Frame, routes: places, Glance, Picker, styles, intents: { 'library.open': (p) => `/libraries/${(p as { id: string }).id}` } });
```

- `defineReactApp` is the entry's default export. Each mount gets React, `useAppContext()`, data loading and the app's places. A request (`ctx.reply`) mounts the `Picker`; `Glance` and `surfaces` are the manifest's surfaces; `styles` is added to the page once. Data is kept per floor, so the shell mounting the app again keeps it, and no floor sees another's.
- `placeRoutes` puts the places on the address bar under wherever the shell mounted the app. Each place has `to`, `useParams`, `useSearch`, `useGo`, `useOpen` and `Link`. Search parameters are plain words, checked by the place's spec.
- `useData(key, load, { refreshOn })` loads and keeps data; a failure to answer is retried, a refusal never. `refreshOn` names domain event topics on `ctx.bus`. `useChange(run, { refreshes })` makes a change and refreshes what it touched. `DataView` is the one loading, empty and failed state.
- `createAppClient<paths>(ctx, { base, appName })` calls through `ctx.fetch` (token and floor included), typed from openapi-typescript's `paths`. Every failure is one `AppError`, read from an RFC 9457 problem with AUGUR's `reason` and `whoCanChange`.

## Parts

Quill re-exports all of Common, so an app imports everything from `@augur/app-kit`. Its own parts are the ones only apps need:

- `AppFrame` lays out the three columns of docs/app-patterns.md. The rail holds `RailLink`s, the main column holds the screen, and the drawer holds `About`. The app's name and icon at the top of the rail open its `FrontPage`. The rail and the drawer fold to a strip, which the frame remembers on this device, and the frame tells the shell how much of the edge its drawer takes (`ui-drawer`). It keeps that layout at every width, measured by its own width with a container query: below `frame-overlay-below` (1100 px) the drawer keeps its strip and opens over the page when asked, and below `frame-icons-below` (800 px) the rail shows its icons and opens over the page the same way. An overlay closes on Escape, on a press outside it, or when a section is picked.
- `FrontPage` has three sections: what needs you, what's new, and what's worth knowing. An empty section still says something.
- `About` is always in the same order: what it is, owner, floor, state, links and history. An empty row stays and says so.
- `More` goes under a long list ("Showing 50 of 312 records"). `SelectionBar` holds what to do with several picked things.

The parts apps used from the Lit kit, on React with the same words, looks and limits (PER-243). Events become callbacks (`ui-open` is `onOpen`, `ui-action` is `onAction`), and behaviour comes from React Aria where it has it:

| Lit kit | Quill |
| --- | --- |
| `ui-state`, `ui-status`, `ui-facts`, `ui-rows` | `State`, `Status`, `Facts`, `Rows` |
| `ui-notice`, `ui-note`, `ui-tag`, `ui-details` | `Notice`, `Note`, `Tag`, `Details` |
| `ui-page-head`, `ui-section` | `PageHead`, `Section` |
| `ui-list`, `ui-table` | `List` (a React Aria grid list), `Table` (a React Aria table) |
| `ui-card`, `ui-cards`, `ui-tally`, `ui-timeline`, `ui-path`, `ui-ref`, `ui-refs` | `Card`, `Cards`, `Tally`, `Timeline`, `Path`, `Ref`, `Refs` |
| `ui-date`, `ui-drop-zone`, `ui-surface` | `DateField`, `DropZone`, `Surface` |
| `ui-editor`, `ui-prose`, `ui-tree` | `Editor` (on Tiptap, ADR 0058: mentions sit in the text as chips; its engine loads the first time a page shows one), `Prose` (with `readMentions`, `writeMentions`, `plainText`), `Tree` (a React Aria tree) |
| `ui-tag-picker` | `TagPicker` (a React Aria combo box; `onCreate` for a word that isn't a tag yet) |
| `ui-lifecycle`, `ui-people-picker` | `Lifecycle` (`onMove`), `PeoplePicker` (`onPick`, and `onChange` with `multiple`) |
| `ui-reader`, `ui-contents` | `Reader` (a ref gives `goTo`, `headingFor`, `marked`; `onOutline`, `onPosition`), `Contents` (`onSelect`) |
| `ui-filter-bar` | `FilterBar` (React Aria menus; `onChange(value, sort)`, `actions` for the page's own buttons) |

Common already had the controls (`Button`, `TextField`, `Select`, `Toggle`, `CheckboxGroup`, `Dialog`, `Menu`, `Heading`).

The shell loads `@augur/app-kit/kit.css` once, after Common's.
