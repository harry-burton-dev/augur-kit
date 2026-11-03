import createClient from 'openapi-fetch';

/**
 * What an app's client needs from its mount: the shell's `ctx.fetch`, which
 * sends the person's token and the floor's `X-Workspace-Id` with every call.
 * Any SDK `MountContext` fits.
 */
export interface AppFetcher {
  fetch(path: string, init?: RequestInit): Promise<Response>;
}

/**
 * An RFC 9457 problem-details body, with AUGUR's two fields: `reason` says in
 * a sentence why it can't be done, and `whoCanChange` who could change that.
 * Older services answer `{ error, message }`; both are read.
 */
export interface Problem {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  reason?: string;
  whoCanChange?: string;
  /** A short code for the problem, such as `too-large`. */
  code?: string;
  [extra: string]: unknown;
}

/** How the words of an AppError are chosen, when the service gave none people can act on. */
export interface ErrorWords {
  /** The app's name, as its manifest gives it, for "Artifacts isn't answering". */
  appName?: string;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const text = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

/**
 * The one error every app call throws. Its message is always words a person
 * can act on: the service's `reason`, `detail` or `message` for a 4xx, and
 * "<app> isn't answering" when the service failed or couldn't be reached.
 */
export class AppError extends Error {
  override readonly name = 'AppError';
  /** The HTTP status, or 0 when the call never reached a service. */
  readonly status: number;
  /** A short code for the problem, from the body's `code`, `error` or `type`. */
  readonly code: string | undefined;
  /** Why it can't be done, when the service said. */
  readonly reason: string | undefined;
  /** Who could change that, when the service said. */
  readonly whoCanChange: string | undefined;
  /** The body as the service sent it. */
  readonly problem: Problem;

  constructor(message: string, status: number, problem: Problem = {}, options?: ErrorOptions) {
    super(message, options);
    this.status = status;
    this.problem = problem;
    this.code = problem.code;
    this.reason = problem.reason;
    this.whoCanChange = problem.whoCanChange;
  }

  /** Worth trying again: the service failed or couldn't be reached, rather than saying no. */
  get retryable(): boolean {
    return this.status === 0 || this.status === 408 || this.status === 429 || this.status >= 500;
  }

  /** Reads an AppError from a failed answer. */
  static async fromResponse(res: Response, words: ErrorWords = {}): Promise<AppError> {
    const body: unknown = await res
      .clone()
      .json()
      .catch(() => undefined);
    return AppError.fromProblem(res.status, body, words);
  }

  /** An AppError from a status and whatever body came with it. */
  static fromProblem(status: number, body: unknown, words: ErrorWords = {}): AppError {
    const raw = isRecord(body) ? body : {};
    const problem: Problem = {
      ...raw,
      ...(text(raw.type) ? { type: text(raw.type) } : {}),
      ...(text(raw.title) ? { title: text(raw.title) } : {}),
      ...(text(raw.detail) ? { detail: text(raw.detail) } : {}),
      ...(text(raw.reason) ? { reason: text(raw.reason) } : {}),
      ...(text(raw.whoCanChange) ? { whoCanChange: text(raw.whoCanChange) } : {}),
      status,
    };
    const code = text(raw.code) ?? text(raw.error) ?? (problem.type && problem.type !== 'about:blank' ? problem.type : undefined);
    if (code) problem.code = code;
    const said = problem.reason ?? problem.detail ?? text(raw.message) ?? problem.title;
    const message = status >= 500 || !said ? AppError.unanswered(words) : said;
    return new AppError(message, status, problem);
  }

  /** Whatever was thrown, as an AppError: a fetch that never reached a service has status 0. */
  static from(err: unknown, words: ErrorWords = {}): AppError {
    if (err instanceof AppError) return err;
    if (err instanceof DOMException && err.name === 'AbortError') return new AppError('Stopped.', 0, { code: 'aborted' }, { cause: err });
    return new AppError(AppError.unanswered(words), 0, { code: 'unreachable' }, { cause: err });
  }

  private static unanswered({ appName }: ErrorWords) {
    return appName ? `${appName} isn’t answering. Try again in a moment.` : 'This isn’t answering. Try again in a moment.';
  }
}

/** Whether something thrown is an AppError. */
export const isAppError = (err: unknown): err is AppError => err instanceof AppError;

// ---------------------------------------------------------------------------
// Types over an OpenAPI description, as openapi-typescript writes its `paths`.
// They are AUGUR's own, so openapi-fetch's types never enter the kit's contract.

/** The HTTP methods a client calls. */
export type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'patch';

/** Any `paths` type from openapi-typescript. */
export type AnyPaths = Record<string, Partial<Record<HttpMethod, unknown>>>;

type Defined<T> = Exclude<T, undefined | never>;
type Operation<P, K extends keyof P, M extends HttpMethod> = P[K] extends Record<M, infer O> ? Defined<O> : never;

/** The paths of `P` that answer `M`. */
export type PathsFor<P, M extends HttpMethod> = {
  [K in keyof P]: P[K] extends Record<M, infer O> ? ([Defined<O>] extends [never] ? never : K) : never;
}[keyof P] &
  string;

type Params<O> = O extends { parameters: infer X } ? X : Record<never, never>;
type Section<X, S extends string> = X extends Record<S, infer V> ? ([Defined<V>] extends [never] ? never : V) : never;
type JsonOf<C> = C extends { content: infer B } ? (B extends Record<'application/json', infer J> ? J : B extends Record<string, infer J> ? J : unknown) : undefined;
type BodyOf<O> = O extends { requestBody?: infer R } ? ([Defined<R>] extends [never] ? never : JsonOf<Defined<R>>) : never;
type Success = 200 | 201 | 202 | 203 | 204 | '2XX' | 'default';
type AnswerOf<O> = O extends { responses: infer R } ? { [S in keyof R & Success]: S extends 204 ? undefined : JsonOf<R[S]> }[keyof R & Success] : unknown;

type PathParams<O> = Section<Params<O>, 'path'>;
type QueryParams<O> = Section<Params<O>, 'query'>;
type BodyPart<O> = [BodyOf<O>] extends [never]
  ? Record<never, never>
  : O extends { requestBody: unknown }
    ? { body: BodyOf<O> }
    : { body?: BodyOf<O> };

/** What one call takes: the path's `params`, its `query`, its `body`, and headers or a signal. */
export type CallOptions<O> = {
  headers?: Record<string, string>;
  signal?: AbortSignal;
} & ([PathParams<O>] extends [never] ? Record<never, never> : { params: PathParams<O> }) &
  ([QueryParams<O>] extends [never] ? Record<never, never> : { query?: QueryParams<O> }) &
  BodyPart<O>;

type Args<O> = Record<never, never> extends CallOptions<O> ? [options?: CallOptions<O>] : [options: CallOptions<O>];

/** The answer to a call: the response body, typed from the description. */
export type Answer<P, K extends keyof P, M extends HttpMethod> = AnswerOf<Operation<P, K, M>>;

/**
 * A typed client for one app's API, made from its OpenAPI description's
 * `paths` type. Each method answers the body, or throws an AppError.
 */
export interface AppClient<P = AnyPaths> {
  get<K extends PathsFor<P, 'get'>>(path: K, ...options: Args<Operation<P, K, 'get'>>): Promise<Answer<P, K, 'get'>>;
  post<K extends PathsFor<P, 'post'>>(path: K, ...options: Args<Operation<P, K, 'post'>>): Promise<Answer<P, K, 'post'>>;
  put<K extends PathsFor<P, 'put'>>(path: K, ...options: Args<Operation<P, K, 'put'>>): Promise<Answer<P, K, 'put'>>;
  patch<K extends PathsFor<P, 'patch'>>(path: K, ...options: Args<Operation<P, K, 'patch'>>): Promise<Answer<P, K, 'patch'>>;
  delete<K extends PathsFor<P, 'delete'>>(path: K, ...options: Args<Operation<P, K, 'delete'>>): Promise<Answer<P, K, 'delete'>>;
}

export interface AppClientOptions extends ErrorWords {
  /** Where the API is under the gateway, such as `/api/folio/v1`. Take it from the manifest or config. */
  base: string;
}

/** A stand-in origin: requests are built on it, and only their path and query reach `ctx.fetch`. */
const ORIGIN = 'http://augur.invalid';

/**
 * A client for an app's own API through the gateway, typed from its OpenAPI
 * description: `createAppClient<paths>(ctx, { base: '/api/folio/v1', appName })`.
 * Every call goes through `ctx.fetch`, so it carries the person's token and
 * the floor, and every failure is an AppError.
 */
export function createAppClient<P = AnyPaths>(ctx: AppFetcher, options: AppClientOptions): AppClient<P> {
  const base = options.base.replace(/\/+$/, '');
  const words: ErrorWords = options.appName ? { appName: options.appName } : {};
  const client = createClient<Record<string, never>>({
    baseUrl: `${ORIGIN}${base}`,
    fetch: async (request: Request) => {
      const url = new URL(request.url);
      const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
      const body = hasBody ? await request.blob() : undefined;
      return ctx.fetch(`${url.pathname}${url.search}`, {
        method: request.method,
        headers: request.headers,
        ...(body && body.size > 0 ? { body } : {}),
        signal: request.signal,
      });
    },
  });
  const call =
    (method: 'GET' | 'PUT' | 'POST' | 'DELETE' | 'PATCH') =>
    async (path: string, opts: { params?: object; query?: object; body?: unknown; headers?: Record<string, string>; signal?: AbortSignal } = {}) => {
      let result: { data?: unknown; error?: unknown; response: Response };
      try {
        // The methods are typed by AppClient above; openapi-fetch is told nothing about the paths.
        const send = client[method] as unknown as (p: string, o: object) => Promise<typeof result>;
        result = await send(path, {
          params: { path: opts.params, query: opts.query },
          ...(opts.body === undefined ? {} : { body: opts.body }),
          ...(opts.headers ? { headers: opts.headers } : {}),
          ...(opts.signal ? { signal: opts.signal } : {}),
        });
      } catch (err) {
        throw AppError.from(err, words);
      }
      if (!result.response.ok) throw AppError.fromProblem(result.response.status, result.error, words);
      return result.data;
    };
  return {
    get: call('GET'),
    post: call('POST'),
    put: call('PUT'),
    patch: call('PATCH'),
    delete: call('DELETE'),
  } as unknown as AppClient<P>;
}
