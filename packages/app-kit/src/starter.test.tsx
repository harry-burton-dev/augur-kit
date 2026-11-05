// @vitest-environment happy-dom
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError, createAppClient } from './client.js';
import { DataView, useChange, useData } from './query.js';
import { defineReactApp, useAppContext, type AppMount } from './react-app.js';
import { mountedAt, place, placeRoutes, readSearch } from './routes.js';
import * as kit from './index.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const bus = () => {
  const handlers = new Map<string, Set<(p: unknown) => void>>();
  return {
    emit: (type: string, payload: unknown) => handlers.get(type)?.forEach((h) => h(payload)),
    on: (type: string, h: (p: unknown) => void) => {
      const set = handlers.get(type) ?? new Set();
      set.add(h);
      handlers.set(type, set);
      return () => void set.delete(h);
    },
  };
};

const ctxWith = (fetch: AppMount['fetch'], extra: Partial<AppMount> = {}): AppMount => ({ path: '/', bus: bus(), workspace: { id: 'w-1' }, fetch, ...extra });

/** Lets the router, React and the query cache settle. */
const settle = async () => {
  for (let i = 0; i < 5; i++) await act(async () => new Promise((r) => setTimeout(r, 0)));
};
const text = () => document.body.textContent ?? '';

let el: HTMLElement;
beforeEach(() => {
  el = document.createElement('div');
  document.body.replaceChildren(el);
  window.history.replaceState(null, '', '/');
});

describe('createAppClient', () => {
  interface paths {
    '/libraries/{id}': {
      get: { parameters: { path: { id: string }; query?: { sort?: string } }; responses: { 200: { content: { 'application/json': { id: string; name: string } } } } };
      delete: { parameters: { path: { id: string } }; responses: { 204: { content?: never } } };
    };
    '/libraries': {
      post: { parameters: Record<string, never>; requestBody: { content: { 'application/json': { name: string } } }; responses: { 201: { content: { 'application/json': { id: string } } } } };
    };
  }

  it('calls through ctx.fetch under its base, with path and query parameters and a JSON body', async () => {
    const fetch = vi.fn(async (path: string, init?: RequestInit) => (init?.method === 'POST' ? json({ id: 'l-2' }, 201) : json({ id: 'l 1', name: 'Budget' })));
    const api = createAppClient<paths>({ fetch }, { base: '/api/folio/v1/', appName: 'Artifacts' });
    const library = await api.get('/libraries/{id}', { params: { id: 'l 1' }, query: { sort: 'name' } });
    expect(library.name).toBe('Budget');
    expect(fetch.mock.calls[0]![0]).toBe('/api/folio/v1/libraries/l%201?sort=name');
    await api.post('/libraries', { body: { name: 'New' } });
    const [, init] = fetch.mock.calls[1]!;
    expect(fetch.mock.calls[1]![0]).toBe('/api/folio/v1/libraries');
    expect(init!.method).toBe('POST');
    expect(await new Response(init!.body).text()).toBe('{"name":"New"}');
  });

  it('reads an RFC 9457 problem into one AppError, with the reason and who can change it', async () => {
    const api = createAppClient<paths>({ fetch: async () => json({ type: 'https://augur/problems/archived', title: 'Archived', status: 409, detail: 'The library is archived.', reason: 'Archived libraries take no changes.', whoCanChange: 'The library’s leads' }, 409) }, { base: '/api/folio/v1', appName: 'Artifacts' });
    const err = await api.delete('/libraries/{id}', { params: { id: 'x' } }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(AppError);
    expect(err).toMatchObject({ status: 409, message: 'Archived libraries take no changes.', whoCanChange: 'The library’s leads', code: 'https://augur/problems/archived', retryable: false });
  });

  it('reads a problem as AUGUR’s services send it: the code in reason, the sentence in detail', () => {
    const body = { type: 'about:blank', title: 'Forbidden', status: 403, detail: 'Only the floor’s leads can pass it down.', reason: 'forbidden', whoCanChange: 'A lead of this floor', error: 'forbidden', message: 'Only the floor’s leads can pass it down.' };
    expect(AppError.fromProblem(403, body)).toMatchObject({ message: 'Only the floor’s leads can pass it down.', code: 'forbidden', reason: 'forbidden', whoCanChange: 'A lead of this floor' });
  });

  it('reads the older { error, message } body, and says the app isn’t answering for a 5xx or no answer', async () => {
    expect(AppError.fromProblem(413, { error: 'too-large', message: 'A file can be 50 MB at most.' })).toMatchObject({ message: 'A file can be 50 MB at most.', code: 'too-large' });
    expect(AppError.fromProblem(502, { message: 'upstream exploded' }, { appName: 'Artifacts' }).message).toBe('Artifacts isn’t answering. Try again in a moment.');
    const api = createAppClient<paths>({ fetch: () => Promise.reject(new TypeError('Failed to fetch')) }, { base: '/api', appName: 'Mandate' });
    const err = (await api.get('/libraries/{id}', { params: { id: 'a' } }).catch((e: unknown) => e)) as AppError;
    expect(err).toMatchObject({ status: 0, message: 'Mandate isn’t answering. Try again in a moment.', retryable: true });
  });
});

describe('placeRoutes', () => {
  it('reads search parameters by their spec and drops what does not fit', () => {
    expect(readSearch({ sort: ['name', 'date'], page: 'number', mine: 'boolean', q: 'string' }, { sort: 'size', page: '2', mine: '1', q: 'tax', other: 'x' })).toEqual({ page: 2, mine: true, q: 'tax' });
  });

  it('finds where the shell mounted the app from the address and ctx.path', () => {
    expect(mountedAt('/me/folio/libraries/l-1', '/libraries/l-1')).toBe('/me/folio');
    expect(mountedAt('/me/folio/', '/')).toBe('/me/folio');
    expect(mountedAt('/folio', '/')).toBe('/folio');
  });

  it('fills a place’s address with its parameters and search', () => {
    const routes = placeRoutes({ front: place('/', () => null), library: place('/libraries/:library', () => null, { sort: ['name', 'date'] }) });
    expect(routes.library.to({ library: 'a/b' }, { sort: 'name' })).toBe('/libraries/a%2Fb?sort=name');
    expect(routes.front.to()).toBe('/');
  });
});

describe('defineReactApp', () => {
  afterEach(() => vi.restoreAllMocks());

  const libraries = placeRoutes(
    {
      front: place('/', function Front() {
        const go = libraries.library.useGo();
        return <button onClick={() => go({ library: 'l-2' }, { sort: 'date' })}>Open</button>;
      }),
      library: place(
        '/libraries/:library',
        function Library() {
          const { library } = libraries.library.useParams();
          const { sort } = libraries.library.useSearch();
          const ctx = useAppContext();
          const state = useData(['library', library], async () => (await ctx.fetch(`/api/x/libraries/${library}`)).json() as Promise<{ name: string }>, { refreshOn: ['x.library.changed'] });
          return (
            <DataView state={state} loading="Loading the library">
              {(l) => (
                <p>
                  {l.name} by {sort ?? 'name'}
                </p>
              )}
            </DataView>
          );
        },
        { sort: ['name', 'date'] },
      ),
    },
    { NotFound: () => <p>No such place</p> },
  );

  const app = defineReactApp({
    name: 'Example',
    App: ({ children }) => <main data-frame>{children}</main>,
    routes: libraries,
    intents: { 'x.open': (payload) => `/libraries/${(payload as { id: string }).id}` },
    Picker: ({ intent, respond }) => <button onClick={() => respond({ picked: intent.type })}>Pick</button>,
    Glance: ({ ctx }) => <p>Glance on {ctx.workspace.id}</p>,
    styles: '.x { color: inherit; }',
  });

  it('mounts the place the address names, under the app’s frame, and loads its data', async () => {
    window.history.replaceState(null, '', '/me/x/libraries/l-1?sort=date');
    const fetch = vi.fn(async () => json({ name: 'Budget' }));
    act(() => app.mount(el, ctxWith(fetch, { path: '/libraries/l-1' })));
    await settle();
    expect(el.querySelector('[data-frame]')).not.toBeNull();
    expect(text()).toContain('Budget by date');
    expect(fetch).toHaveBeenCalledWith('/api/x/libraries/l-1');
    expect(document.getElementById('augur-app-styles-example')).not.toBeNull();
    act(() => app.unmount(el));
    expect(document.getElementById('augur-app-styles-example')).toBeNull();
  });

  it('goes to a place on the address bar inside its base, and refreshes data when its event arrives', async () => {
    window.history.replaceState(null, '', '/me/x');
    let n = 0;
    const fetch = vi.fn(async () => json({ name: `Budget ${++n}` }));
    const ctx = ctxWith(fetch, { workspace: { id: 'w-go' } });
    act(() => app.mount(el, ctx));
    await settle();
    act(() => el.querySelector('button')!.click());
    await settle();
    expect(window.location.pathname).toBe('/me/x/libraries/l-2');
    expect(window.location.search).toBe('?sort=date');
    expect(text()).toContain('Budget 1 by date');
    act(() => ctx.bus.emit('x.library.changed', { library: 'l-2' }));
    await settle();
    expect(text()).toContain('Budget 2 by date');
    act(() => app.unmount(el));
  });

  it('opens at the place an intent names, and says so when nothing is there', async () => {
    window.history.replaceState(null, '', '/me/x');
    act(() => app.mount(el, ctxWith(async () => json({ name: 'Plans' }), { intent: { type: 'x.open', payload: { id: 'l-9' } }, workspace: { id: 'w-intent' } })));
    await settle();
    expect(window.location.pathname).toBe('/me/x/libraries/l-9');
    expect(text()).toContain('Plans');
    act(() => app.unmount(el));
    window.history.replaceState(null, '', '/me/x/nowhere');
    act(() => app.mount(el, ctxWith(async () => json({}), { path: '/nowhere', workspace: { id: 'w-none' } })));
    await settle();
    expect(text()).toContain('No such place');
    act(() => app.unmount(el));
  });

  it('answers a request with its Picker, and mounts its Glance as a surface', async () => {
    const respond = vi.fn();
    act(() => app.mount(el, ctxWith(async () => json({}), { intent: { type: 'x.pick', payload: {} }, reply: { respond, cancel: vi.fn() } })));
    await settle();
    act(() => el.querySelector('button')!.click());
    expect(respond).toHaveBeenCalledWith({ picked: 'x.pick' });
    act(() => app.unmount(el));
    act(() => app.surfaces['./Glance']!.mount(el, ctxWith(async () => json({}))));
    await settle();
    expect(text()).toContain('Glance on w-1');
    act(() => app.surfaces['./Glance']!.unmount(el));
  });

  it('says why data didn’t come, and offers Try again only when trying again could help', async () => {
    const Load = ({ status }: { status: number }) => {
      const ctx = useAppContext();
      const state = useData(['thing', status], async () => {
        throw await AppError.fromResponse(await ctx.fetch('/x'), { appName: 'Example' });
      });
      return (
        <DataView state={state} loading="Loading">
          {() => null}
        </DataView>
      );
    };
    const refusal = defineReactApp({ name: 'Example', App: () => <Load status={403} /> });
    act(() => refusal.mount(el, ctxWith(async () => json({ title: 'Forbidden', reason: 'Only the floor’s leads see this.', whoCanChange: 'A lead of this floor' }, 403), { workspace: { id: 'w-403' } })));
    await settle();
    expect(text()).toContain('Only the floor’s leads see this.');
    expect(text()).toContain('A lead of this floor can change that.');
    expect(text()).not.toContain('Try again');
    act(() => refusal.unmount(el));
  });

  it('refreshes what a change touched', async () => {
    let name = 'Old';
    const Thing = () => {
      const state = useData(['thing'], async () => name);
      const rename = useChange(async (to: string) => (name = to), { refreshes: [['thing']] });
      return <button onClick={() => void rename.run('New')}>{state.data ?? '…'}</button>;
    };
    const one = defineReactApp({ name: 'Example', App: Thing });
    act(() => one.mount(el, ctxWith(async () => json({}), { workspace: { id: 'w-change' } })));
    await settle();
    expect(text()).toBe('Old');
    act(() => el.querySelector('button')!.click());
    await settle();
    expect(text()).toBe('New');
    act(() => one.unmount(el));
  });
});

describe('the contract', () => {
  it('exports the starter, and no third-party name', () => {
    for (const name of ['defineReactApp', 'useAppContext', 'placeRoutes', 'place', 'createAppClient', 'AppError', 'useData', 'useChange', 'DataView']) expect(kit).toHaveProperty(name);
    for (const name of Object.keys(kit)) expect(name).not.toMatch(/^(Query|Router|Tanstack|createRouter|createClient|QueryClient)/);
  });
});
