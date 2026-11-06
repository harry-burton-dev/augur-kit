import { createContext, useCallback, useContext, useEffect, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppError, type ErrorWords } from './client.js';
import { State } from './states.js';

/** The shell's event bus, as `ctx.bus` gives it: domain events the shell passes on arrive here by topic. */
export interface AppBus {
  emit<T>(type: string, payload: T): void;
  on<T>(type: string, handler: (payload: T) => void): () => void;
}

/** Names a piece of data: `['libraries']`, `['library', id]`. A refresh of `['library']` refreshes every library. */
export type DataKey = readonly unknown[];

/** What `useData` gives back. */
export interface DataState<T> {
  /** The data, once it has come; kept while a refresh runs. */
  data: T | undefined;
  /** Why it couldn't be loaded, in words a person can act on. */
  error: AppError | undefined;
  /** Nothing to show yet. */
  loading: boolean;
  /** Showing what came before while it loads again. */
  refreshing: boolean;
  /** Loads it again now. */
  refresh(): void;
}

export interface DataOptions {
  /** Domain event topics that make this data stale, such as `folio.document.published`. */
  refreshOn?: readonly string[];
  /** False waits: nothing loads until it turns true. */
  enabled?: boolean;
  /** Loads it again this often, in milliseconds, while it's on screen. Prefer `refreshOn`. */
  every?: number;
}

interface Scope {
  bus?: AppBus;
  words: ErrorWords;
}
const DataScope = createContext<Scope>({ words: {} });

/**
 * Where a mount keeps what it loaded. `defineReactApp` keeps one per floor,
 * so the shell mounting the app again (Back, Forward) keeps what it loaded,
 * and nothing loaded on one floor is ever shown on another.
 */
export interface DataClient {
  /** Marks data stale and loads what's on screen again: one key, or everything. */
  refresh(key?: DataKey): Promise<void>;
  /** Forgets everything it kept. */
  clear(): void;
}

const engines = new WeakMap<DataClient, QueryClient>();

/** A new place to keep data, for a mount, a story or a test. */
export function newDataClient(words: ErrorWords = {}): DataClient {
  const engine = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // A service that said no will say no again: only a failure to answer is tried again.
        retry: (count, err) => count < 2 && AppError.from(err, words).retryable,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: false },
    },
  });
  const client: DataClient = {
    refresh: (key) => engine.invalidateQueries(key ? { queryKey: key } : {}),
    clear: () => engine.clear(),
  };
  engines.set(client, engine);
  return client;
}

/** Gives the parts below it data loading: `defineReactApp` puts one round every mount. Also for stories and tests. */
export function DataProvider({ client, bus, appName, children }: { client?: DataClient; bus?: AppBus; appName?: string; children: ReactNode }) {
  const words = appName ? { appName } : {};
  const engine = engines.get(client ?? fallback(words))!;
  return (
    <DataScope.Provider value={{ ...(bus ? { bus } : {}), words }}>
      <QueryClientProvider client={engine}>{children}</QueryClientProvider>
    </DataScope.Provider>
  );
}

let shared: DataClient | undefined;
const fallback = (words: ErrorWords) => (shared ??= newDataClient(words));

/**
 * Loads data and keeps it: `useData(['library', id], () => api.get('/libraries/{id}', …))`.
 * Two parts asking for the same key share one load. It retries a failure to
 * answer, never a refusal, and refreshes when a `refreshOn` event arrives.
 */
export function useData<T>(key: DataKey, load: (signal: AbortSignal) => Promise<T>, options: DataOptions = {}): DataState<T> {
  const { bus, words } = useContext(DataScope);
  const client = useQueryClient();
  const query = useQuery<T, AppError>({
    queryKey: key,
    queryFn: async ({ signal }) => {
      try {
        return await load(signal);
      } catch (err) {
        throw AppError.from(err, words);
      }
    },
    enabled: options.enabled ?? true,
    ...(options.every ? { refetchInterval: options.every } : {}),
  });
  const topics = (options.refreshOn ?? []).join('\n');
  const keyText = JSON.stringify(key);
  useEffect(() => {
    if (!bus || !topics) return;
    const offs = topics.split('\n').map((topic) => bus.on(topic, () => void client.invalidateQueries({ queryKey: JSON.parse(keyText) as unknown[] })));
    return () => offs.forEach((off) => off());
  }, [bus, client, topics, keyText]);
  const { refetch } = query;
  const refresh = useCallback(() => void refetch(), [refetch]);
  return {
    data: query.data,
    error: query.error ?? undefined,
    loading: query.isPending && query.fetchStatus !== 'idle',
    refreshing: query.isFetching && !query.isPending,
    refresh,
  };
}

/** What `useChange` gives back. */
export interface ChangeState<A, R> {
  /** Makes the change. Rejects with an AppError, which `error` also holds. */
  run(input: A): Promise<R>;
  /** The change is under way. */
  busy: boolean;
  error: AppError | undefined;
  /** Forgets the last error. */
  reset(): void;
}

export interface ChangeOptions<R> {
  /** The data this change makes stale: `[['libraries'], ['library', id]]`. Refreshed when it succeeds. */
  refreshes?: readonly DataKey[] | ((result: R) => readonly DataKey[]);
}

/** Makes a change on the server and refreshes what it touched. */
export function useChange<A = void, R = unknown>(change: (input: A) => Promise<R>, options: ChangeOptions<R> = {}): ChangeState<A, R> {
  const { words } = useContext(DataScope);
  const client = useQueryClient();
  const mutation = useMutation<R, AppError, A>({
    mutationFn: async (input) => {
      try {
        return await change(input);
      } catch (err) {
        throw AppError.from(err, words);
      }
    },
    onSuccess: async (result) => {
      const keys = typeof options.refreshes === 'function' ? options.refreshes(result) : (options.refreshes ?? []);
      await Promise.all(keys.map((queryKey) => client.invalidateQueries({ queryKey })));
    },
  });
  return { run: mutation.mutateAsync, busy: mutation.isPending, error: mutation.error ?? undefined, reset: mutation.reset };
}

/** Refreshes data by key, or everything with no key: for a change made some other way. */
export function useRefresh(): (key?: DataKey) => Promise<void> {
  const client = useQueryClient();
  return useCallback((key?: DataKey) => client.invalidateQueries(key ? { queryKey: key } : {}), [client]);
}

export interface DataViewProps<T> {
  state: DataState<T>;
  /** What is loading, for the loading line: "Loading libraries". */
  loading: string;
  /** Whether what came is nothing, to say `empty` instead. */
  isEmpty?: (data: T) => boolean;
  /** What to say when there's nothing: one sentence, a line more, at most one thing to do. */
  empty?: { heading: string; body?: string; action?: string; onAction?: () => void };
  /** What to say above the error's own words, such as "Libraries didn't load". */
  failed?: string;
  size?: 'region' | 'line' | 'page';
  children: (data: T) => ReactNode;
}

/**
 * The one way a region shows data that loads: the loading line, then the
 * data, or why it isn't there. A failure to answer offers Try again; a
 * refusal says why, and who can change it, and offers nothing.
 */
export function DataView<T>({ state, loading, isEmpty, empty, failed, size = 'region', children }: DataViewProps<T>) {
  if (state.error && state.data === undefined) {
    const err = state.error;
    const why = err.whoCanChange ? `${err.message} ${err.whoCanChange} can change that.` : err.message;
    return (
      <State
        kind={err.status === 0 ? 'offline' : 'error'}
        heading={failed ?? err.message}
        {...(failed ? { body: why } : err.whoCanChange ? { body: `${err.whoCanChange} can change that.` } : {})}
        {...(err.retryable ? { action: 'Try again', onAction: state.refresh } : {})}
        size={size}
      />
    );
  }
  if (state.data === undefined) return <State kind="loading" heading={loading} size={size} />;
  if (empty && isEmpty?.(state.data)) return <State kind="empty" {...empty} size={size} />;
  return <>{children(state.data)}</>;
}
