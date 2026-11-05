import { createContext, useContext, type ComponentType, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { AppFetcher } from './client.js';
import type { AppFormats } from './formats.js';
import { DataProvider, newDataClient, type AppBus, type DataClient } from './query.js';
import { PlaceFrame, ROUTES, mountedAt, routerFor } from './routes.js';

/** An intent, as the SDK gives one: a type and its payload. */
export interface AppIntent {
  type: string;
  payload: unknown;
}

/**
 * What the starter needs from the shell's mount context. Any SDK
 * `MountContext` fits, and the app's own parts get the whole of it back from
 * `useAppContext`.
 */
export interface AppMount extends AppFetcher {
  /** Path below the app's route, such as `/libraries/l-1`. */
  path: string;
  bus: AppBus;
  workspace: { id: string };
  intent?: AppIntent;
  reply?: { respond(result: unknown): void; cancel(): void };
  /** How the person wants dates written (SDK 2.0); an older shell leaves it out. */
  readonly formats?: AppFormats;
}

/** What a picker gets: the request it answers, and the two ways to end it. */
export interface PickerProps<C extends AppMount = AppMount> {
  ctx: C;
  intent: AppIntent;
  /** Answers the request with what was picked. */
  respond(result: unknown): void;
  /** Closes it, answering nothing. */
  cancel(): void;
}

/** The parts of a surface the shell places outside the app, such as its card on Home. */
export interface AppSurfaceProps<C extends AppMount = AppMount> {
  ctx: C;
}

/** The app's frame: with `routes`, the place on screen is its `children`. */
export interface AppProps<C extends AppMount = AppMount> {
  ctx: C;
  children?: ReactNode;
}

export interface ReactAppSpec<C extends AppMount> {
  /** The app's name as people read it, from its manifest: it is in "<name> isn't answering". */
  name: string;
  /** The app itself: its frame and, with `routes`, the place on screen as `children`. */
  App: ComponentType<AppProps<C>>;
  /** The app's places, from `placeRoutes`. Without them, `App` gets no children and routes itself. */
  routes?: { readonly [ROUTES]: unknown };
  /** Opens the app at a place for an intent it handles: answer the place's path, or nothing to start at `ctx.path`. */
  intents?: Record<string, (payload: unknown, ctx: C) => string | undefined>;
  /** Answers requests (`ctx.request`) for the intents the app handles as a picker. */
  Picker?: ComponentType<PickerProps<C>>;
  /** The app's card on Home, the manifest surface `./Glance`. */
  Glance?: ComponentType<AppSurfaceProps<C>>;
  /** Other surfaces, by the `module` the manifest names. */
  surfaces?: Record<string, ComponentType<AppSurfaceProps<C>>>;
  /** The app's own CSS, added to the page once while any part of the app is mounted. */
  styles?: string;
}

/** What `defineReactApp` makes: the SDK's micro frontend, ready to be the entry's default export. */
export interface ReactApp<C extends AppMount> {
  mount(el: HTMLElement, ctx: C): void;
  unmount(el: HTMLElement): void;
  surfaces: Record<string, { mount(el: HTMLElement, ctx: C): void; unmount(el: HTMLElement): void }>;
}

const Mounted = createContext<AppMount | null>(null);

/** The mount context the shell gave this app or surface. */
export function useAppContext<C extends AppMount = AppMount>(): C {
  const ctx = useContext(Mounted);
  if (!ctx) throw new Error('useAppContext needs a part mounted by defineReactApp.');
  return ctx as C;
}

/**
 * How the person wants dates and times written, from the shell (`ctx.formats`), or none outside a
 * mounted app or on an older shell: then dates are written the browser's way. Read at each render.
 */
export function useFormats(): AppFormats {
  return useContext(Mounted)?.formats ?? {};
}

/** The styles each app added, and how many of its parts are mounted. */
const styleUsers = new Map<string, number>();
const addStyles = (key: string, css: string | undefined) => {
  if (!css) return;
  styleUsers.set(key, (styleUsers.get(key) ?? 0) + 1);
  const id = `augur-app-styles-${key}`;
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  document.head.append(style);
};
const dropStyles = (key: string, css: string | undefined) => {
  if (!css) return;
  const left = (styleUsers.get(key) ?? 1) - 1;
  styleUsers.set(key, left);
  if (left <= 0) document.getElementById(`augur-app-styles-${key}`)?.remove();
};

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'app';

/**
 * A React app, as the shell mounts it:
 *
 *     export default defineReactApp({ name: manifest.name, App, routes: places, Glance, Picker, styles });
 *
 * Each mount gets React, data loading (`useData`) refreshed by the bus,
 * the app's places on the address bar (`placeRoutes`), and `useAppContext`.
 * A request (`ctx.reply`) mounts the `Picker`; an intent in `intents` opens
 * the app at its place. Data is kept for each floor, so the shell mounting the
 * app again keeps what it loaded, and no floor sees another's.
 */
export function defineReactApp<C extends AppMount>(spec: ReactAppSpec<C>): ReactApp<C> {
  const roots = new WeakMap<HTMLElement, Root>();
  const kept = new Map<string, DataClient>();
  const key = slug(spec.name);
  const dataFor = (ctx: C) => {
    let client = kept.get(ctx.workspace.id);
    if (!client) kept.set(ctx.workspace.id, (client = newDataClient({ appName: spec.name })));
    return client;
  };
  const show = (el: HTMLElement, ctx: C, node: ReactNode) => {
    addStyles(key, spec.styles);
    roots.get(el)?.unmount();
    const root = createRoot(el);
    roots.set(el, root);
    root.render(
      <Mounted.Provider value={ctx}>
        <DataProvider client={dataFor(ctx)} bus={ctx.bus} appName={spec.name}>
          {node}
        </DataProvider>
      </Mounted.Provider>,
    );
  };
  const hide = (el: HTMLElement) => {
    const root = roots.get(el);
    if (!root) return;
    root.unmount();
    roots.delete(el);
    dropStyles(key, spec.styles);
  };

  const surface = (Part: ComponentType<AppSurfaceProps<C>>) => ({
    mount: (el: HTMLElement, ctx: C) => show(el, ctx, <Part ctx={ctx} />),
    unmount: hide,
  });
  const surfaces: ReactApp<C>['surfaces'] = Object.fromEntries(Object.entries(spec.surfaces ?? {}).map(([module, Part]) => [module, surface(Part)]));
  if (spec.Glance) surfaces['./Glance'] = surface(spec.Glance);

  return {
    mount(el, ctx) {
      const { App, Picker, routes } = spec;
      if (ctx.reply && ctx.intent && Picker) {
        const { reply, intent } = ctx;
        show(el, ctx, <Picker ctx={ctx} intent={intent} respond={(r) => reply.respond(r)} cancel={() => reply.cancel()} />);
        return;
      }
      if (!routes) {
        show(el, ctx, <App ctx={ctx} />);
        return;
      }
      const basepath = mountedAt(window.location.pathname, ctx.path);
      const start = ctx.intent ? spec.intents?.[ctx.intent.type]?.(ctx.intent.payload, ctx) : undefined;
      // An intent opens the app at its place: the address says so, and Back leaves the app.
      if (start) window.history.replaceState(window.history.state, '', `${basepath === '/' ? '' : basepath}${start}`);
      const Frame = ({ children }: { children: ReactNode }) => <App ctx={ctx}>{children}</App>;
      const { view } = routerFor(routes as never, { basepath });
      show(el, ctx, <PlaceFrame.Provider value={Frame}>{view}</PlaceFrame.Provider>);
    },
    unmount(el) {
      hide(el);
      el.replaceChildren();
    },
    surfaces,
  };
}
