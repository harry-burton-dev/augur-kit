/**
 * Quill's remote vocabulary (ADR 0076; the app contract, 6.7): the elements an app's sandbox may
 * describe, by name, with the properties, events and slots each one takes. It is the host's
 * allowlist: the shell draws these with the real kit and drops anything else with a reason. It is
 * also the SDK's promise for the contract major: within a major, an element, a property, a value or
 * an event is added, never removed or renamed.
 *
 * Every property says the shape it takes, down to the fields of a list's items, so nothing the
 * sandbox sends reaches a kit part unchecked: no markup, no functions, no URL the host would fetch.
 * The one widening (ADR 0092): `quill-reader` takes Markdown, read with raw HTML shown as text, and
 * names its pictures by a path under the app's own API, which only the host fetches
 * (`readerPicturePath` says which paths pass).
 *
 * Plain data, no React: the sandbox side (`@augur/app-kit/remote`) builds its element constructors
 * from it, the host side (`QuillRemote`) its checks and renderers, and `remote-allowlist.json` is
 * this file as JSON for the shell and the contract tests.
 */

/**
 * The shape of a value. `icon` is the name of an icon in the kit's set; `scalar` is a string, a
 * number, a boolean or null (a table cell). An object takes only the fields it names, each optional
 * unless it is in `required`.
 */
export type RemoteType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'icon'
  | 'scalar'
  | { readonly enum: readonly string[] }
  | { readonly array: RemoteType }
  | { readonly tuple: readonly RemoteType[] }
  | { readonly object: Readonly<Record<string, RemoteType>>; readonly required?: readonly string[] }
  /** Any field name, each holding this. */
  | { readonly record: RemoteType; readonly required?: Readonly<Record<string, RemoteType>> }
  | { readonly oneOf: readonly RemoteType[] };

export interface RemoteElementSpec {
  /** The kit part it draws. */
  readonly part: string;
  readonly properties: Readonly<Record<string, RemoteType>>;
  /** Events the host sends back; each carries one value as its detail, described here. */
  readonly events: Readonly<Record<string, string>>;
  /**
   * A field the person changes on the host: the event that tells the sandbox, and the property it
   * sets there, so the sandbox's element always holds what the person sees.
   */
  readonly mirror?: Readonly<Record<string, string>>;
  /** Named places for child elements, by their `slot` attribute. */
  readonly slots?: readonly string[];
  /** Whether it takes children in its main place: text, or other elements. */
  readonly children?: 'text' | 'elements';
}

const S = 'string';
const N = 'number';
const B = 'boolean';
const oneOf = (...values: string[]) => ({ enum: values }) as const;
const fieldState = oneOf('idle', 'attention', 'error', 'warning', 'valid');
const field = { label: S, hint: S, required: B, optional: B, disabled: B, reason: S, state: fieldState, message: S } as const;
const action = { object: { id: S, label: S, disabled: B, reason: S }, required: ['id', 'label'] } as const;
const noun = { tuple: [S, S] } as const;
/** A thing with actions, for the shell's radial menu (6.4): its kind, as `contributes.radial` names it. */
const thing = { object: { kind: S, id: S, label: S }, required: ['kind'] } as const;
/** A person or a team, as the people picker shows them; one that can't be chosen says why in `reason`. */
const principal = { object: { kind: oneOf('person', 'team'), id: S, name: S, detail: S, size: N, meta: S, reason: S }, required: ['kind', 'id', 'name'] } as const;

export const QUILL_REMOTE_ELEMENTS = {
  'quill-page-head': {
    part: 'PageHead',
    properties: {
      trail: { array: { object: { id: S, label: S }, required: ['id', 'label'] } },
      eyebrow: S,
      heading: S,
      summary: S,
      actions: { array: { object: { ...action.object, kind: oneOf('primary', 'secondary', 'tertiary', 'ghost', 'danger'), danger: B }, required: ['id', 'label'] } },
      level: N,
    },
    events: { trail: 'the step’s id', action: 'the action’s id' },
    children: 'elements',
  },
  'quill-stack': {
    part: 'Stack',
    properties: { gap: oneOf('tight', 'normal', 'loose', 'section'), label: S },
    events: {},
    children: 'elements',
  },
  'quill-split': {
    part: 'Split',
    properties: {},
    events: {},
    slots: ['aside'],
    children: 'elements',
  },
  'quill-grid': {
    part: 'Grid',
    properties: { label: S },
    events: {},
    children: 'elements',
  },
  'quill-section': {
    part: 'Section',
    properties: { label: S, count: N, limit: N, action: S, why: S, level: N },
    events: { action: 'nothing' },
    children: 'elements',
  },
  'quill-selection-bar': {
    part: 'SelectionBar',
    properties: { count: N, noun, actions: { array: { object: { ...action.object, danger: B }, required: ['id', 'label'] } } },
    events: { action: 'the action’s id', clear: 'nothing' },
  },
  'quill-about': {
    part: 'About',
    // No picture for the owner: the host would fetch whatever address the sandbox sent.
    properties: { what: S, owner: { object: { name: S, detail: S, tone: oneOf('you', 'team', 'department', 'org') }, required: ['name'] }, floor: S },
    events: {},
    slots: ['lifecycle', 'links', 'history'],
  },
  'quill-more': {
    part: 'More',
    properties: { shown: N, total: N, noun: S, step: N, busy: B },
    events: { more: 'nothing' },
  },
  'quill-list': {
    part: 'List',
    properties: {
      label: S,
      noun,
      items: {
        array: {
          object: {
            id: S,
            title: S,
            detail: S,
            meta: S,
            status: oneOf('needs', 'running', 'queued', 'paused', 'done', 'failed', 'warning'),
            icon: 'icon',
            group: S,
            actions: { array: action },
            disabled: B,
            reason: S,
            thing,
          },
          required: ['id', 'title'],
        },
      },
      density: oneOf('comfortable', 'compact'),
      loading: B,
      error: S,
      empty: S,
      bar: B,
      look: oneOf('well', 'plain'),
    },
    events: { open: 'the item’s id', action: '{ item, action }: the ids', retry: 'nothing' },
  },
  'quill-table': {
    part: 'Table',
    properties: {
      label: S,
      noun: S,
      columns: {
        array: {
          object: { key: S, label: S, kind: oneOf('text', 'number', 'date', 'status'), align: oneOf('start', 'end'), wrap: B, sortable: B, sortFirst: oneOf('asc', 'desc') },
          required: ['key', 'label'],
        },
      },
      rows: { array: { record: 'scalar', required: { id: S } } },
      /** Every row is a thing of this kind; its label is the value in the column `label` names. */
      thing: { object: { kind: S, label: S }, required: ['kind'] },
      sort: { object: { key: S, dir: oneOf('asc', 'desc') }, required: ['key', 'dir'] },
      selectable: B,
      selected: { array: S },
      density: oneOf('default', 'compact'),
      filterable: B,
      loading: B,
      error: S,
      empty: S,
      pageSize: N,
    },
    events: { sort: '{ key, dir } or null', select: 'the picked ids', open: 'the row’s id', retry: 'nothing' },
    slots: ['actions'],
  },
  'quill-rows': {
    part: 'Rows',
    properties: { items: { array: { object: { label: S, value: S }, required: ['label', 'value'] } }, loading: B, count: N, empty: S, error: S },
    events: {},
  },
  'quill-facts': {
    part: 'Facts',
    properties: { items: { array: { object: { value: { oneOf: [S, N] }, label: S }, required: ['value', 'label'] } }, loading: B, count: N },
    events: {},
  },
  'quill-details': {
    part: 'Details',
    properties: { items: { array: { object: { label: S, value: S, note: S, explained: B }, required: ['label'] } }, limit: N, missing: S },
    events: {},
  },
  'quill-state': {
    part: 'State',
    properties: { kind: oneOf('empty', 'loading', 'error', 'offline'), heading: S, body: S, action: S, size: oneOf('region', 'line', 'page') },
    events: { action: 'nothing' },
  },
  'quill-notice': {
    part: 'Notice',
    properties: { tone: oneOf('needs', 'warning', 'refused', 'info'), label: S, heading: S, action: S, more: N },
    events: { action: 'nothing' },
    children: 'text',
  },
  'quill-tag': {
    part: 'Tag',
    properties: { label: S, icon: 'icon', removeLabel: S, quiet: B },
    events: { remove: 'nothing' },
  },
  'quill-button': {
    part: 'Button',
    properties: { label: S, kind: oneOf('primary', 'secondary', 'tertiary', 'ghost', 'danger'), size: oneOf('md', 'sm'), icon: 'icon', disabled: B, reason: S, busy: B, busyLabel: S },
    events: { press: 'nothing' },
  },
  'quill-text-field': {
    part: 'TextField',
    properties: { ...field, value: S, name: S, type: oneOf('text', 'email', 'url', 'tel', 'password', 'search'), placeholder: S, multiline: B, rows: N, maxLength: N, readOnly: B, busy: B },
    events: { change: 'the value', commit: 'the value' },
    mirror: { change: 'value' },
  },
  'quill-select': {
    part: 'Select',
    properties: {
      ...field,
      options: { array: { oneOf: [S, { object: { value: S, label: S, detail: S, disabled: B }, required: ['value', 'label'] }] } },
      value: S,
      placeholder: S,
      empty: S,
      name: S,
      readOnly: B,
      busy: B,
    },
    events: { change: 'the value' },
    mirror: { change: 'value' },
  },
  'quill-checkbox': {
    part: 'Checkbox',
    properties: { label: S, detail: S, value: S, checked: B, disabled: B, reason: S, name: S },
    events: { change: 'whether it is checked' },
    mirror: { change: 'checked' },
  },
  'quill-editor': {
    part: 'Editor',
    properties: { ...field, value: S, name: S, placeholder: S, rows: N, guide: S },
    events: { change: 'the value', commit: 'the value' },
    mirror: { change: 'value' },
  },
  'quill-palette': {
    part: 'Palette',
    properties: {
      open: B,
      placeholder: S,
      query: S,
      items: { array: { object: { id: S, label: S, detail: S, meta: S, icon: 'icon', group: S, locked: S }, required: ['id', 'label'] } },
      none: S,
      lead: S,
    },
    events: { close: 'nothing', query: 'the query', pick: 'the item’s id' },
    mirror: { query: 'query' },
  },
  'quill-tiles': {
    part: 'Tiles',
    properties: { label: S },
    events: {},
    children: 'elements',
  },
  'quill-kind-tile': {
    part: 'KindTile',
    properties: { kind: oneOf('collection', 'folder', 'series', 'document', 'library'), name: S, eyebrow: S, count: S, state: S, needs: B, needsLabel: S, owner: S, locked: S, note: S, thing: { object: thing.object, required: ['kind', 'id'] } },
    events: { open: 'nothing' },
  },
  'quill-add-tile': {
    part: 'AddTile',
    properties: { label: S, reason: S },
    events: { press: 'nothing' },
  },
  'quill-reel': {
    part: 'Reel',
    properties: {
      label: S,
      tone: oneOf('action', 'new', 'upcoming', 'quiet'),
      items: { array: { object: { id: S, title: S, when: S, urgent: B, from: S }, required: ['id', 'title'] } },
      reveal: oneOf('pull', 'all'),
      noun: S,
    },
    events: { open: 'the item’s id' },
  },
  'quill-dialog': {
    part: 'Dialog',
    // A submit leaves it open and busy until the app answers: by closing it (open false), saying why not
    // (error), or setting busy while it works. To say the same reason twice, clear error on submit and set busy.
    properties: {
      open: B,
      eyebrow: S,
      heading: S,
      summary: S,
      size: oneOf('decision', 'glance', 'read'),
      actionLabel: S,
      busyLabel: S,
      cancelLabel: S,
      danger: B,
      light: B,
      busy: B,
      error: S,
    },
    events: { submit: 'the fields’ values, by their names', close: 'false: the person closed it' },
    mirror: { close: 'open' },
    slots: ['fields'],
    children: 'elements',
  },
  'quill-ask-twice': {
    part: 'AskTwice',
    properties: { label: S, confirm: S, size: oneOf('md', 'sm'), icon: 'icon', disabled: B, reason: S, busy: B, busyLabel: S },
    events: { press: 'nothing: the second press' },
  },
  'quill-choice': {
    part: 'Choice',
    properties: {
      label: S,
      hint: S,
      required: B,
      optional: B,
      disabled: B,
      reason: S,
      message: S,
      options: { array: { object: { value: S, label: S, detail: S, disabled: B, reason: S }, required: ['value', 'label'] } },
      value: S,
      name: S,
    },
    events: { change: 'the value' },
    mirror: { change: 'value' },
  },
  'quill-checkbox-group': {
    part: 'CheckboxGroup',
    properties: {
      label: S,
      hint: S,
      required: B,
      optional: B,
      disabled: B,
      reason: S,
      message: S,
      options: { array: { object: { value: S, label: S, detail: S, disabled: B, reason: S }, required: ['value', 'label'] } },
      value: { array: S },
      max: N,
      name: S,
    },
    events: { change: 'the ticked values' },
    mirror: { change: 'value' },
  },
  'quill-date-field': {
    part: 'DateField',
    properties: { ...field, value: S, name: S, empty: S, quick: { array: { object: { label: S, value: S }, required: ['label', 'value'] } } },
    events: { change: 'the day, YYYY-MM-DD, or empty' },
    mirror: { change: 'value' },
  },
  'quill-tag-picker': {
    part: 'TagPicker',
    properties: {
      label: S,
      hint: S,
      required: B,
      optional: B,
      disabled: B,
      reason: S,
      options: { array: { object: { value: S, label: S, detail: S, disabled: B, icon: 'icon' }, required: ['value', 'label'] } },
      value: { array: S },
      max: N,
      placeholder: S,
      name: S,
      creatable: B,
    },
    events: { change: 'the chosen values', create: 'the word to add as a tag' },
    mirror: { change: 'value' },
  },
  'quill-steps': {
    part: 'Steps',
    properties: { label: S, steps: { array: { object: { label: S, state: oneOf('done', 'now', 'next') }, required: ['label', 'state'] } } },
    events: {},
  },
  'quill-progress': {
    part: 'Progress',
    properties: { label: S, value: N, valueText: S },
    events: {},
  },
  'quill-status': {
    part: 'Status',
    properties: { status: oneOf('needs', 'running', 'queued', 'paused', 'done', 'failed', 'warning'), label: S, markOnly: B },
    events: {},
  },
  'quill-check-list': {
    part: 'CheckList',
    // Things checked, each with what was found and one way to act on it. A row that needs the person is lit
    // with the needs-you light, and the tone is always said in words too.
    properties: {
      label: S,
      rows: {
        array: {
          object: { id: S, title: S, detail: S, tone: oneOf('ok', 'needs', 'problem', 'info'), action: { object: { label: S, disabled: B, reason: S }, required: ['label'] } },
          required: ['id', 'title'],
        },
      },
    },
    events: { act: 'the row’s id' },
  },
  'quill-step-list': {
    part: 'StepList',
    // An ordered way through one job, each step with what to do, why, and one action. For where a process
    // has got to, use quill-steps.
    properties: {
      label: S,
      steps: {
        array: {
          object: { id: S, title: S, detail: S, action: S, done: B, unavailable: S },
          required: ['id', 'title'],
        },
      },
    },
    events: { act: 'the step’s id' },
  },
  'quill-paged-list': {
    part: 'PagedList',
    // A list shown a page at a time instead of scrolling, with Newer and Older drawn by the host. With
    // `total` above the items sent and a `more` listener, the last page offers to load more.
    properties: {
      label: S,
      items: { array: { object: { id: S, title: S, detail: S, meta: S, status: oneOf('needs', 'running', 'queued', 'paused', 'done', 'failed', 'warning') }, required: ['id', 'title'] } },
      pageSize: N,
      total: N,
      noun: S,
      empty: S,
      busy: B,
    },
    events: { open: 'the item’s id', more: 'nothing' },
  },
  'quill-reader': {
    part: 'ReadingView',
    // A document to read, from Markdown (ADR 0092): raw HTML is shown as text and links open
    // elsewhere. A picture is named by a path relative to the app's own API; only the host fetches
    // it, under /api/<the app's id>/, and one it can't is said in words. Words the person selects get
    // a bar beside them with the app's `marks`; a press sends the words back as `mark`.
    properties: {
      markdown: S,
      title: S,
      flow: oneOf('leaves', 'horizon'),
      mode: oneOf('page', 'desk'),
      size: oneOf('small', 'medium', 'large'),
      contentsHeading: S,
      remember: S,
      marks: { array: { object: { id: S, label: S }, required: ['id', 'label'] } },
      at: S,
    },
    events: { mark: 'the mark’s id and the words: { mark, text, anchor, context }', position: 'the anchor of the block at the top' },
  },
  'quill-file-button': {
    part: 'FileButton',
    // A button that opens the person's own file chooser. The files never cross as an event: the host
    // reads them, cuts them at the app's upload limit and hands them to `ctx.files` as a drop. `choose`
    // only says what was chosen.
    properties: {
      label: S,
      kind: oneOf('primary', 'secondary', 'tertiary', 'ghost'),
      size: oneOf('md', 'sm'),
      icon: 'icon',
      accept: { array: S },
      multiple: B,
      disabled: B,
      reason: S,
      busy: B,
      busyLabel: S,
    },
    events: { choose: 'what was chosen: [{ name, size, type }]' },
  },
  'quill-people-picker': {
    part: 'PeoplePicker',
    // Finds people and teams by name. The host asks the app: each pause in typing sends `query`, and
    // the app answers by setting `found` for that query. One that can't be chosen says why.
    properties: {
      label: S,
      hint: S,
      disabled: B,
      reason: S,
      kinds: oneOf('people', 'teams', 'both'),
      multiple: B,
      value: { array: principal },
      found: { object: { query: S, items: { array: principal }, error: S }, required: ['query'] },
      placeholder: S,
      name: S,
    },
    events: { query: 'the words typed', change: 'the ones chosen', pick: 'the one chosen' },
    mirror: { change: 'value' },
  },
  'quill-floor-path': {
    part: 'Path',
    // A thing's chain up the floors: each floor with what reaches it, the owner marked, and one it can't
    // reach saying why (drawn red).
    properties: {
      label: S,
      floors: {
        array: {
          object: { id: S, kind: oneOf('personal', 'team', 'org'), name: S, line: S, owner: B, here: B, mark: S, reason: S },
          required: ['id', 'kind', 'name'],
        },
      },
    },
    events: { open: 'the floor’s id' },
  },
  'quill-filter-bar': {
    part: 'FilterBar',
    // The ruled line over a long list: each way to narrow it, how many match, and the sort. The bar
    // holds no list; it says what changed and the app asks again.
    properties: {
      label: S,
      filters: {
        array: {
          object: {
            id: S,
            label: S,
            options: { array: { object: { value: S, label: S, detail: S, disabled: B, icon: 'icon' }, required: ['value', 'label'] } },
            single: B,
            search: B,
          },
          required: ['id', 'label', 'options'],
        },
      },
      value: { record: { array: S } },
      sorts: { array: { object: { value: S, label: S, detail: S, disabled: B }, required: ['value', 'label'] } },
      sort: S,
      count: N,
      noun,
      busy: B,
    },
    events: { change: 'what’s chosen and the sort: { value, sort }' },
  },
} as const satisfies Record<string, RemoteElementSpec>;

export type QuillRemoteElementName = keyof typeof QUILL_REMOTE_ELEMENTS;

/**
 * The path a reader's picture names, as the host may fetch it under the app's own API, or undefined
 * when it isn't one: no scheme, no host, no leading slash, no `.` or `..` step, no backslash and no
 * escapes that hide one. `figures/plan.png?v=2` passes; `https://…`, `/api/other/x`, `../x` don't.
 */
export function readerPicturePath(src: string): string | undefined {
  if (typeof src !== 'string' || !src || src.length > 1024) return undefined;
  if (!/^[A-Za-z0-9._~!$&'()*+,;=:@%/?-]+$/.test(src) || src.includes('#')) return undefined;
  const [path = ''] = src.split('?');
  let plain: string;
  try {
    plain = decodeURIComponent(path);
  } catch {
    return undefined;
  }
  if (/[\\\0]/.test(plain) || plain.startsWith('/') || /^[A-Za-z][A-Za-z0-9+.-]*:/.test(path)) return undefined;
  if (plain.split('/').some((step) => step === '' || step === '.' || step === '..')) return undefined;
  return src;
}

export const quillRemoteElementNames = Object.keys(QUILL_REMOTE_ELEMENTS) as QuillRemoteElementName[];

export const isQuillRemoteElement = (name: string): name is QuillRemoteElementName => Object.hasOwn(QUILL_REMOTE_ELEMENTS, name);

/** What `checkRemoteValue` answers: the value to draw (or nothing), and what was dropped and why. */
export interface RemoteCheck {
  ok: boolean;
  value?: unknown;
  dropped: string[];
}

/** Writes a field as the object's own, whatever its name (`__proto__` included). */
const own = (out: Record<string, unknown>, key: string, value: unknown) => Object.defineProperty(out, key, { value, enumerable: true, writable: true, configurable: true });

const kindOf = (value: unknown) => (value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value);

/**
 * Checks a value against its shape and keeps only what fits: an unknown field or a bad array item is
 * dropped (and said), the rest kept. `null` and `undefined` at the top clear the property.
 * `isIcon` says whether a name is in the kit's icon set; the host passes it.
 */
export function checkRemoteValue(type: RemoteType, value: unknown, path: string, isIcon: (name: string) => boolean): RemoteCheck {
  const dropped: string[] = [];
  const walk = (t: RemoteType, v: unknown, at: string): { ok: boolean; value?: unknown } => {
    if (t === 'string' || t === 'number' || t === 'boolean') {
      if (typeof v === t && (t !== 'number' || Number.isFinite(v))) return { ok: true, value: v };
      dropped.push(`${at} takes a ${t}; the ${kindOf(v)} sent was dropped.`);
      return { ok: false };
    }
    if (t === 'scalar') {
      if (v === null || typeof v === 'string' || typeof v === 'boolean' || (typeof v === 'number' && Number.isFinite(v))) return { ok: true, value: v };
      dropped.push(`${at} takes a string, number, boolean or null; the ${kindOf(v)} sent was dropped.`);
      return { ok: false };
    }
    if (t === 'icon') {
      if (typeof v === 'string' && isIcon(v)) return { ok: true, value: v };
      dropped.push(`${at} takes the name of an icon in the kit; ${typeof v === 'string' ? `“${v}” isn’t one` : `the ${kindOf(v)} sent isn’t a name`}, so it was dropped.`);
      return { ok: false };
    }
    if ('enum' in t) {
      if (typeof v === 'string' && t.enum.includes(v)) return { ok: true, value: v };
      dropped.push(`${at} takes one of ${t.enum.join(', ')}; ${typeof v === 'string' ? `“${v}”` : `the ${kindOf(v)}`} was dropped.`);
      return { ok: false };
    }
    if ('oneOf' in t) {
      const before = dropped.length;
      for (const option of t.oneOf) {
        const tried = walk(option, v, at);
        if (tried.ok) {
          dropped.length = before;
          return tried;
        }
      }
      dropped.length = before;
      dropped.push(`${at} doesn’t fit any of the shapes it takes; it was dropped.`);
      return { ok: false };
    }
    if ('array' in t || 'tuple' in t) {
      if (!Array.isArray(v)) {
        dropped.push(`${at} takes a list; the ${kindOf(v)} sent was dropped.`);
        return { ok: false };
      }
      if ('tuple' in t) {
        if (v.length !== t.tuple.length) {
          dropped.push(`${at} takes ${t.tuple.length} values; ${v.length} were sent, so it was dropped.`);
          return { ok: false };
        }
        const out = v.map((x, i) => walk(t.tuple[i]!, x, `${at}[${i}]`));
        return out.every((o) => o.ok) ? { ok: true, value: out.map((o) => o.value) } : { ok: false };
      }
      const kept: unknown[] = [];
      v.forEach((x, i) => {
        const o = walk(t.array, x, `${at}[${i}]`);
        if (o.ok) kept.push(o.value);
      });
      return { ok: true, value: kept };
    }
    if (typeof v !== 'object' || v === null || Array.isArray(v) || Object.getPrototypeOf(v) !== Object.prototype) {
      dropped.push(`${at} takes an object; the ${kindOf(v)} sent was dropped.`);
      return { ok: false };
    }
    const out: Record<string, unknown> = {};
    const entries = Object.entries(v as Record<string, unknown>).filter(([, x]) => x !== undefined);
    if ('record' in t) {
      for (const [key, x] of entries) {
        const shape = t.required && Object.hasOwn(t.required, key) ? t.required[key]! : t.record;
        const o = walk(shape, x, `${at}.${key}`);
        if (o.ok) own(out, key, o.value);
      }
      const missing = Object.keys(t.required ?? {}).filter((k) => !Object.hasOwn(out, k));
      if (missing.length) {
        dropped.push(`${at} needs ${missing.join(' and ')}; it was dropped.`);
        return { ok: false };
      }
      return { ok: true, value: out };
    }
    for (const [key, x] of entries) {
      if (!Object.hasOwn(t.object, key)) {
        dropped.push(`${at} has no field “${key}”; it was dropped.`);
        continue;
      }
      const o = walk(t.object[key]!, x, `${at}.${key}`);
      if (o.ok) own(out, key, o.value);
    }
    const missing = (t.required ?? []).filter((k) => !Object.hasOwn(out, k));
    if (missing.length) {
      dropped.push(`${at} needs ${missing.join(' and ')}; it was dropped.`);
      return { ok: false };
    }
    return { ok: true, value: out };
  };
  if (value === null || value === undefined) return { ok: true, value: undefined, dropped };
  const result = walk(type, value, path);
  return { ...result, dropped };
}
