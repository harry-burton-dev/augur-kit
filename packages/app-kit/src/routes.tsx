import { createContext, useCallback, useContext, type ComponentType, type ReactNode } from 'react';
import {
  Link as RouterLink,
  Outlet,
  RouterProvider,
  createBrowserHistory,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  useMatchRoute,
  useNavigate,
  useParams as useRouterParams,
  useSearch as useRouterSearch,
} from '@tanstack/react-router';

/** How a search parameter is read from the address: text, a number, yes or no, or one of a few words. */
export type SearchKind = 'string' | 'number' | 'boolean' | readonly string[];
/** The search parameters a place takes, by name: `{ sort: ['name', 'date'], q: 'string' }`. */
export type SearchSpec = Record<string, SearchKind>;

/** The search parameters as the place reads them. Every one may be missing. */
export type SearchOf<S extends SearchSpec> = {
  [K in keyof S]?: S[K] extends 'string' ? string : S[K] extends 'number' ? number : S[K] extends 'boolean' ? boolean : S[K] extends readonly (infer E)[] ? E : never;
};

/** The parameters a path names: `/libraries/:library/:document` → `{ library: string; document: string }`. */
export type ParamsOf<P extends string> = P extends `${string}:${infer Name}/${infer Rest}`
  ? { [K in Name]: string } & ParamsOf<`/${Rest}`>
  : P extends `${string}:${infer Name}`
    ? { [K in Name]: string }
    : Record<never, never>;

type NoParams<P extends string> = keyof ParamsOf<P> extends never ? true : false;
/** Arguments that name a place: its parameters (if its path has any), then its search parameters. */
export type PlaceArgs<P extends string, S extends SearchSpec> = NoParams<P> extends true ? [params?: ParamsOf<P>, search?: SearchOf<S>] : [params: ParamsOf<P>, search?: SearchOf<S>];

/** One of an app's places, as `place()` declares it. */
export interface PlaceSpec<P extends string = string, S extends SearchSpec = SearchSpec> {
  path: P;
  screen: ComponentType;
  search?: S;
}

/**
 * Declares a place: its path inside the app (`/libraries/:library`), the
 * screen that shows it, and the search parameters it reads from the address.
 */
export const place = <P extends string, S extends SearchSpec = Record<never, never>>(path: P, screen: ComponentType, search?: S): PlaceSpec<P, S> => ({ path, screen, ...(search ? { search } : {}) });

export interface PlaceLinkProps {
  children: ReactNode;
  className?: string;
  /** Replaces this place in the history instead of adding one, so Back skips it. */
  replace?: boolean;
  'aria-label'?: string;
}

/** A place the app can go to, with typed parameters. */
export interface Place<P extends string, S extends SearchSpec> {
  /** The place's path inside the app, as declared. */
  readonly path: P;
  /** The address of this place inside the app, with its parameters filled in: `/libraries/l-1?sort=name`. */
  to(...args: PlaceArgs<P, S>): string;
  /** The parameters of the place on screen. Only call it inside this place's screen. */
  useParams(): ParamsOf<P>;
  /** The search parameters of the place on screen, read and checked by the place's `search`. */
  useSearch(): SearchOf<S>;
  /** A function that goes to this place. `replace` keeps Back from coming here. */
  useGo(): (...args: [...PlaceArgs<P, S>, options?: { replace?: boolean }]) => void;
  /** Whether this place is on screen, with these parameters if given. */
  useOpen(params?: Partial<ParamsOf<P>>): boolean;
  /** A link to this place. A plain click stays in the app; a middle click opens a tab. */
  Link: ComponentType<PlaceLinkProps & { params?: ParamsOf<P>; search?: SearchOf<S> }>;
}

/** An app's places, from `placeRoutes`; give it to `defineReactApp` as `routes`. */
export type AppRoutes<T extends Record<string, PlaceSpec>> = { [K in keyof T]: T[K] extends PlaceSpec<infer P, infer S> ? Place<P, S> : never } & { readonly [ROUTES]: RouteTree };

export interface PlaceRoutesOptions {
  /** What shows at an address inside the app that's no place in it. */
  NotFound?: ComponentType;
}

/** The kit's own handle on the route tree. Apps never see it. */
export const ROUTES = Symbol('augur.routes');
interface RouteTree {
  tree: unknown;
}

/** The app's own frame around every place: defineReactApp sets it to the app's `App`. */
export const PlaceFrame = createContext<ComponentType<{ children: ReactNode }>>(({ children }) => <>{children}</>);

const toRouter = (path: string) => path.replace(/:([A-Za-z_][\w]*)/g, '$$$1');

const fill = (path: string, params: Record<string, string> = {}) =>
  path.replace(/:([A-Za-z_][\w]*)/g, (_, name: string) => {
    const value = params[name];
    if (value === undefined) throw new Error(`The place ${path} needs ${name}.`);
    return encodeURIComponent(value);
  });

/** Search parameters as the address writes them: plain words, no JSON. */
const writeSearch = (search: Record<string, unknown> = {}) => {
  const out = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) if (value !== undefined && value !== null && value !== '') out.set(key, String(value));
  const text = out.toString();
  return text ? `?${text}` : '';
};
const parseSearch = (text: string) => Object.fromEntries(new URLSearchParams(text.startsWith('?') ? text.slice(1) : text));

/** Reads search parameters by a place's spec; anything that doesn't fit is dropped, never thrown. */
export const readSearch = (spec: SearchSpec | undefined, raw: Record<string, unknown>): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const [key, kind] of Object.entries(spec ?? {})) {
    const value = raw[key];
    if (value === undefined || value === null || value === '') continue;
    const text = String(value);
    if (kind === 'string') out[key] = text;
    else if (kind === 'number') {
      const n = Number(text);
      if (Number.isFinite(n)) out[key] = n;
    } else if (kind === 'boolean') {
      if (text === 'true' || text === '1') out[key] = true;
      else if (text === 'false' || text === '0') out[key] = false;
    } else if (kind.includes(text)) out[key] = text;
  }
  return out;
};

/**
 * An app's places, by name, on TanStack Router:
 *
 *     export const places = placeRoutes({
 *       front: place('/', Front),
 *       library: place('/libraries/:library', Library, { sort: ['name', 'date'] }),
 *     });
 *
 * The router's base is wherever the shell mounted the app, so the manifest's
 * `route` stays the only place the app's prefix is written. Search parameters
 * are plain words in the address, so filters and sort can be shared and Back
 * brings them back.
 */
export function placeRoutes<T extends Record<string, PlaceSpec>>(places: T, options: PlaceRoutesOptions = {}): AppRoutes<T> {
  const root = createRootRoute({
    component: function Root() {
      const Frame = useContext(PlaceFrame);
      return (
        <Frame>
          <Outlet />
        </Frame>
      );
    },
    ...(options.NotFound ? { notFoundComponent: options.NotFound as never } : {}),
  });
  const out: Record<string | symbol, unknown> = {};
  const children = Object.entries(places).map(([name, spec]) => {
    const route = createRoute({
      getParentRoute: () => root,
      path: toRouter(spec.path),
      component: spec.screen as never,
      validateSearch: (raw: Record<string, unknown>) => readSearch(spec.search, raw),
    });
    const fullPath = toRouter(spec.path);
    const to = (params?: Record<string, string>, search?: Record<string, unknown>) => `${fill(spec.path, params)}${writeSearch(search)}`;
    const shown: Place<string, SearchSpec> = {
      path: spec.path,
      to: to as Place<string, SearchSpec>['to'],
      useParams: () => useRouterParams({ strict: false }) as Record<string, string>,
      useSearch: () => readSearch(spec.search, useRouterSearch({ strict: false }) as Record<string, unknown>) as never,
      useGo() {
        const navigate = useNavigate();
        return useCallback(
          (...args: unknown[]) => {
            const [params, search, opts] = args as [Record<string, string> | undefined, Record<string, unknown> | undefined, { replace?: boolean } | undefined];
            void navigate({ to: fullPath, params: params ?? {}, search: search ?? {}, replace: opts?.replace ?? false } as never);
          },
          [navigate],
        ) as never;
      },
      useOpen(params) {
        const match = useMatchRoute();
        const found = match({ to: fullPath } as never) as Record<string, string> | false;
        if (!found) return false;
        return Object.entries(params ?? {}).every(([k, v]) => v === undefined || found[k] === v);
      },
      Link: ({ params, search, children: inside, className, replace, ...rest }) => (
        <RouterLink to={fullPath as never} params={(params ?? {}) as never} search={(search ?? {}) as never} {...(replace ? { replace } : {})} {...(className ? { className } : {})} activeProps={{ 'aria-current': 'page' } as never} {...rest}>
          {inside}
        </RouterLink>
      ),
    };
    out[name] = shown;
    return route;
  });
  out[ROUTES] = { tree: root.addChildren(children) } satisfies RouteTree;
  return out as AppRoutes<T>;
}

/**
 * Where the app is mounted, from the address and the path the shell gave it:
 * `/me/folio/libraries/l-1` with `/libraries/l-1` is mounted at `/me/folio`.
 */
export const mountedAt = (pathname: string, path: string) => {
  const inner = path === '/' ? '' : path.replace(/\/+$/, '');
  const base = pathname.endsWith(inner) ? pathname.slice(0, pathname.length - inner.length) : pathname;
  return base.replace(/\/+$/, '') || '/';
};

export interface Placed {
  router: unknown;
  view: ReactNode;
}

/** Makes the router for one mount, at `basepath`. `memory` keeps it off the address bar (surfaces, tests). */
export function routerFor(routes: { readonly [ROUTES]: RouteTree }, { basepath, start, memory }: { basepath: string; start?: string; memory?: boolean }): Placed {
  const history = memory ? createMemoryHistory({ initialEntries: [`${basepath === '/' ? '' : basepath}${start ?? '/'}`] }) : createBrowserHistory();
  const router = createRouter({
    routeTree: routes[ROUTES].tree,
    history,
    basepath,
    parseSearch,
    stringifySearch: writeSearch,
  } as never);
  return { router, view: <RouterProvider router={router as never} /> };
}
