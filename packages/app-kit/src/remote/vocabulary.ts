/**
 * Quill's remote vocabulary (ADR 0076; the app contract, 6.7): the elements an app's sandbox may
 * describe, by name, with the properties, events and slots each one takes. It is the host's
 * allowlist: the shell draws these with the real kit and drops anything else with a reason. It is
 * also the SDK's promise for the contract major: within a major, an element, a property or an event
 * is added, never removed or renamed.
 *
 * Plain data, no React: the sandbox side (`@augur/app-kit/remote`) builds its element constructors
 * from it, the host side (`QuillRemote`) its renderers, and `allowlist.json` is this file as JSON for
 * the shell and the contract tests.
 */

/** What a property may hold. Anything else that arrives is dropped with a reason. */
export type RemotePropertyType = 'string' | 'number' | 'boolean' | 'array' | 'object';

export interface RemoteElementSpec {
  /** The kit part it draws. */
  readonly part: string;
  readonly properties: Readonly<Record<string, RemotePropertyType>>;
  /** Events the host sends back; each carries one value as its detail, described here. */
  readonly events: Readonly<Record<string, string>>;
  /** Named places for child elements, by their `slot` attribute. */
  readonly slots?: readonly string[];
  /** Whether it takes children in its main place: text, or other elements where it says which. */
  readonly children?: 'text' | 'elements';
}

const field = {
  label: 'string',
  hint: 'string',
  required: 'boolean',
  optional: 'boolean',
  disabled: 'boolean',
  reason: 'string',
  state: 'string',
  message: 'string',
} as const;

export const QUILL_REMOTE_ELEMENTS = {
  'quill-page-head': {
    part: 'PageHead',
    properties: { trail: 'array', eyebrow: 'string', heading: 'string', summary: 'string', actions: 'array', level: 'number' },
    events: { trail: 'the step’s id', action: 'the action’s id' },
    children: 'elements',
  },
  'quill-section': {
    part: 'Section',
    properties: { label: 'string', count: 'number', limit: 'number', action: 'string', why: 'string', level: 'number' },
    events: { action: 'nothing' },
    children: 'elements',
  },
  'quill-selection-bar': {
    part: 'SelectionBar',
    properties: { count: 'number', noun: 'array', actions: 'array' },
    events: { action: 'the action’s id', clear: 'nothing' },
  },
  'quill-about': {
    part: 'About',
    properties: { what: 'string', owner: 'object', floor: 'string' },
    events: {},
    slots: ['lifecycle', 'links', 'history'],
  },
  'quill-more': {
    part: 'More',
    properties: { shown: 'number', total: 'number', noun: 'string', step: 'number', busy: 'boolean' },
    events: { more: 'nothing' },
  },
  'quill-list': {
    part: 'List',
    properties: { label: 'string', noun: 'array', items: 'array', density: 'string', loading: 'boolean', error: 'string', empty: 'string', bar: 'boolean', look: 'string' },
    events: { open: 'the item’s id', action: '{ item, action }: the ids', retry: 'nothing' },
  },
  'quill-table': {
    part: 'Table',
    properties: { label: 'string', noun: 'string', columns: 'array', rows: 'array', sort: 'object', selectable: 'boolean', selected: 'array', density: 'string', filterable: 'boolean', loading: 'boolean', error: 'string', empty: 'string', pageSize: 'number' },
    events: { sort: '{ key, dir } or null', select: 'the picked ids', open: 'the row’s id', retry: 'nothing' },
    slots: ['actions'],
  },
  'quill-rows': {
    part: 'Rows',
    properties: { items: 'array', loading: 'boolean', count: 'number', empty: 'string', error: 'string' },
    events: {},
  },
  'quill-facts': {
    part: 'Facts',
    properties: { items: 'array', loading: 'boolean', count: 'number' },
    events: {},
  },
  'quill-details': {
    part: 'Details',
    properties: { items: 'array', limit: 'number', missing: 'string' },
    events: {},
  },
  'quill-state': {
    part: 'State',
    properties: { kind: 'string', heading: 'string', body: 'string', action: 'string', size: 'string' },
    events: { action: 'nothing' },
  },
  'quill-notice': {
    part: 'Notice',
    properties: { tone: 'string', label: 'string', heading: 'string', action: 'string', more: 'number' },
    events: { action: 'nothing' },
    children: 'text',
  },
  'quill-tag': {
    part: 'Tag',
    properties: { label: 'string', icon: 'string', removeLabel: 'string', quiet: 'boolean' },
    events: { remove: 'nothing' },
  },
  'quill-button': {
    part: 'Button',
    properties: { label: 'string', kind: 'string', size: 'string', icon: 'string', disabled: 'boolean', reason: 'string', busy: 'boolean', busyLabel: 'string' },
    events: { press: 'nothing' },
  },
  'quill-text-field': {
    part: 'TextField',
    properties: { ...field, value: 'string', name: 'string', type: 'string', placeholder: 'string', multiline: 'boolean', rows: 'number', maxLength: 'number', readOnly: 'boolean', busy: 'boolean' },
    events: { change: 'the value', commit: 'the value' },
  },
  'quill-select': {
    part: 'Select',
    properties: { ...field, options: 'array', value: 'string', placeholder: 'string', empty: 'string', name: 'string', readOnly: 'boolean', busy: 'boolean' },
    events: { change: 'the value' },
  },
  'quill-checkbox': {
    part: 'Checkbox',
    properties: { label: 'string', detail: 'string', value: 'string', checked: 'boolean', disabled: 'boolean', reason: 'string', name: 'string' },
    events: { change: 'whether it is checked' },
  },
  'quill-editor': {
    part: 'Editor',
    properties: { ...field, value: 'string', name: 'string', placeholder: 'string', rows: 'number', guide: 'string' },
    events: { change: 'the value', commit: 'the value' },
  },
  'quill-palette': {
    part: 'Palette',
    properties: { open: 'boolean', placeholder: 'string', query: 'string', items: 'array', none: 'string', lead: 'string' },
    events: { close: 'nothing', query: 'the query', pick: 'the item’s id' },
  },
  'quill-tiles': {
    part: 'Tiles',
    properties: { label: 'string' },
    events: {},
    children: 'elements',
  },
  'quill-kind-tile': {
    part: 'KindTile',
    properties: { kind: 'string', name: 'string', eyebrow: 'string', count: 'string', state: 'string', needs: 'boolean', needsLabel: 'string', owner: 'string', locked: 'string', note: 'string' },
    events: { open: 'nothing' },
  },
  'quill-add-tile': {
    part: 'AddTile',
    properties: { label: 'string', reason: 'string' },
    events: { press: 'nothing' },
  },
  'quill-reel': {
    part: 'Reel',
    properties: { label: 'string', tone: 'string', items: 'array', reveal: 'string', noun: 'string' },
    events: { open: 'the item’s id' },
  },
} as const satisfies Record<string, RemoteElementSpec>;

export type QuillRemoteElementName = keyof typeof QUILL_REMOTE_ELEMENTS;

export const quillRemoteElementNames = Object.keys(QUILL_REMOTE_ELEMENTS) as QuillRemoteElementName[];

export const isQuillRemoteElement = (name: string): name is QuillRemoteElementName => Object.hasOwn(QUILL_REMOTE_ELEMENTS, name);

/** Whether a value fits a property's type; `null` and `undefined` always do (the property is cleared). */
export const fitsRemoteType = (type: RemotePropertyType, value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (type === 'array') return Array.isArray(value);
  if (type === 'object') return typeof value === 'object' && !Array.isArray(value);
  return typeof value === type;
};
