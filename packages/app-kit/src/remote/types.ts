/**
 * The properties and event details of Quill's remote elements, as an app's sandbox sets them. They
 * mirror the kit parts' own props where those can cross a bridge: data, never functions or markup
 * (a part's markup props are slots, its callbacks are events).
 */
import type { QuillRemoteElementName } from './vocabulary.js';

type Field = {
  label: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  reason?: string;
  state?: 'idle' | 'attention' | 'error' | 'warning' | 'valid';
  message?: string;
};

type Id = { id: string; label: string };
type Action = Id & { disabled?: boolean; reason?: string };

export interface RemoteListItem {
  id: string;
  title: string;
  detail?: string;
  meta?: string;
  status?: string;
  icon?: string;
  group?: string;
  actions?: Action[];
  disabled?: boolean;
  reason?: string;
  /** The row is a thing with actions, for the shell's radial menu: its kind, as `contributes.radial` names it. */
  thing?: RemoteThing;
}

/** A thing with actions (the app contract, 6.4): its kind, and its id and label if not the item's own. */
export interface RemoteThing {
  kind: string;
  id?: string;
  label?: string;
}

export interface RemoteTableColumn {
  key: string;
  label: string;
  kind?: 'text' | 'number' | 'date' | 'status';
  align?: 'start' | 'end';
  wrap?: boolean;
  sortable?: boolean;
  sortFirst?: 'asc' | 'desc';
}

export interface QuillRemoteProperties {
  'quill-page-head': { trail?: Id[]; eyebrow?: string; heading: string; summary?: string; actions?: (Action & { kind?: string; danger?: boolean })[]; level?: number };
  'quill-section': { label: string; count?: number; limit?: number; action?: string; why?: string; level?: number };
  'quill-selection-bar': { count: number; noun: [string, string]; actions: (Action & { danger?: boolean })[] };
  'quill-about': { what: string; owner?: { name: string; detail?: string; tone?: 'you' | 'team' | 'department' | 'org' }; floor?: string };
  'quill-more': { shown: number; total: number; noun: string; step?: number; busy?: boolean };
  'quill-list': { label: string; noun?: [string, string]; items: RemoteListItem[]; density?: 'comfortable' | 'compact'; loading?: boolean; error?: string; empty?: string; bar?: boolean; look?: 'well' | 'plain' };
  'quill-table': { label?: string; noun?: string; columns: RemoteTableColumn[]; rows: ({ id: string } & Record<string, string | number | boolean | null>)[]; sort?: { key: string; dir: 'asc' | 'desc' } | null; selectable?: boolean; selected?: string[]; density?: 'default' | 'compact'; filterable?: boolean; loading?: boolean; error?: string; empty?: string; pageSize?: number; thing?: { kind: string; label?: string } };
  'quill-rows': { items?: { label: string; value: string }[]; loading?: boolean; count?: number; empty?: string; error?: string };
  'quill-facts': { items?: { value: string | number; label: string }[]; loading?: boolean; count?: number };
  'quill-details': { items: { label: string; value?: string; note?: string; explained?: boolean }[]; limit?: number; missing?: string };
  'quill-state': { kind?: 'empty' | 'loading' | 'error' | 'offline'; heading: string; body?: string; action?: string; size?: 'region' | 'line' | 'page' };
  'quill-notice': { tone?: 'needs' | 'warning' | 'refused' | 'info'; label?: string; heading?: string; action?: string; more?: number };
  'quill-tag': { label: string; icon?: string; removeLabel?: string; quiet?: boolean };
  'quill-button': { label: string; kind?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger'; size?: 'md' | 'sm'; icon?: string; disabled?: boolean; reason?: string; busy?: boolean; busyLabel?: string };
  'quill-text-field': Field & { value?: string; name?: string; type?: 'text' | 'email' | 'url' | 'tel' | 'password' | 'search'; placeholder?: string; multiline?: boolean; rows?: number; maxLength?: number; readOnly?: boolean; busy?: boolean };
  'quill-select': Field & { options: ({ value: string; label: string; detail?: string; disabled?: boolean } | string)[]; value?: string; placeholder?: string; empty?: string; name?: string; readOnly?: boolean; busy?: boolean };
  'quill-checkbox': { label: string; detail?: string; value?: string; checked?: boolean; disabled?: boolean; reason?: string; name?: string };
  'quill-editor': Field & { value?: string; name?: string; placeholder?: string; rows?: number; guide?: string };
  'quill-palette': { open: boolean; placeholder: string; query: string; items: { id: string; label: string; detail?: string; meta?: string; icon?: string; group?: string; locked?: string }[]; none?: string; lead?: string };
  'quill-tiles': { label: string };
  'quill-kind-tile': { kind: 'collection' | 'folder' | 'series' | 'document' | 'library'; name: string; eyebrow: string; count?: string; state?: string; needs?: boolean; needsLabel?: string; owner?: string; locked?: string; note?: string; thing?: RemoteThing & { id: string } };
  'quill-add-tile': { label: string; reason?: string };
  'quill-reel': { label: string; tone?: 'action' | 'new' | 'upcoming' | 'quiet'; items: { id: string; title: string; when?: string; urgent?: boolean; from?: string }[]; reveal?: 'pull' | 'all'; noun?: string };
  'quill-dialog': { open?: boolean; eyebrow?: string; heading: string; summary?: string; size?: 'decision' | 'glance' | 'read'; actionLabel?: string; busyLabel?: string; cancelLabel?: string; danger?: boolean; light?: boolean; busy?: boolean; error?: string };
  'quill-ask-twice': { label: string; confirm: string; size?: 'md' | 'sm'; icon?: string; disabled?: boolean; reason?: string; busy?: boolean; busyLabel?: string };
  'quill-choice': Omit<Field, 'state'> & { options: RemoteOption[]; value?: string; name?: string };
  'quill-checkbox-group': Omit<Field, 'state'> & { options: RemoteOption[]; value?: string[]; max?: number; name?: string };
  'quill-date-field': Field & { value?: string; name?: string; empty?: string; quick?: { label: string; value: string }[] };
  'quill-tag-picker': Omit<Field, 'state' | 'message'> & { options: { value: string; label: string; detail?: string; disabled?: boolean; icon?: string }[]; value?: string[]; max?: number; placeholder?: string; name?: string; creatable?: boolean };
  'quill-steps': { label: string; steps: { label: string; state: 'done' | 'now' | 'next' }[] };
  'quill-progress': { label: string; value?: number; valueText?: string };
  'quill-status': { status: 'needs' | 'running' | 'queued' | 'paused' | 'done' | 'failed' | 'warning'; label?: string; markOnly?: boolean };
  'quill-check-list': { label: string; rows: { id: string; title: string; detail?: string; tone?: 'ok' | 'needs' | 'problem' | 'info'; action?: { label: string; disabled?: boolean; reason?: string } }[] };
  'quill-step-list': { label: string; steps: { id: string; title: string; detail?: string; action?: string; done?: boolean; unavailable?: string }[] };
  'quill-paged-list': { label: string; items: { id: string; title: string; detail?: string; meta?: string; status?: 'needs' | 'running' | 'queued' | 'paused' | 'done' | 'failed' | 'warning' }[]; pageSize?: number; total?: number; noun?: string; empty?: string; busy?: boolean };
  'quill-reader': { markdown: string; title?: string; flow?: 'leaves' | 'horizon'; mode?: 'page' | 'desk'; size?: 'small' | 'medium' | 'large'; contentsHeading?: string; remember?: string; marks?: { id: string; label: string }[]; at?: string };
  'quill-file-button': { label: string; kind?: 'primary' | 'secondary' | 'tertiary' | 'ghost'; size?: 'md' | 'sm'; icon?: string; accept?: string[]; multiple?: boolean; disabled?: boolean; reason?: string; busy?: boolean; busyLabel?: string };
  'quill-people-picker': { label: string; hint?: string; disabled?: boolean; reason?: string; kinds?: 'people' | 'teams' | 'both'; multiple?: boolean; value?: RemotePrincipal[]; found?: { query: string; items?: RemotePrincipal[]; error?: string }; placeholder?: string; name?: string };
  'quill-floor-path': { label?: string; floors: RemoteFloorStep[] };
  'quill-filter-bar': { label: string; filters: RemoteFilter[]; value?: Record<string, string[]>; sorts?: { value: string; label: string; detail?: string; disabled?: boolean }[]; sort?: string; count?: number; noun?: [string, string]; busy?: boolean };
}

/** A person or a team in the people picker; one with a `reason` stays in the list, dimmed, and says it. */
export interface RemotePrincipal {
  kind: 'person' | 'team';
  id: string;
  name: string;
  detail?: string;
  size?: number;
  meta?: string;
  reason?: string;
}

/** One floor of a thing's chain up the floors. */
export interface RemoteFloorStep {
  id: string;
  kind: 'personal' | 'team' | 'org';
  name: string;
  /** What reaches it, in one line: "Complete and Issued". */
  line?: string;
  /** It owns the thing: marked as owner. */
  owner?: boolean;
  /** The floor the person is on: ringed. */
  here?: boolean;
  /** A word or two after the name, in place of the owner's mark. */
  mark?: string;
  /** Why it can't reach this floor: said under it, and the floor marked red. */
  reason?: string;
}

/** One way to narrow a list in the filter bar. */
export interface RemoteFilter {
  id: string;
  label: string;
  options: { value: string; label: string; detail?: string; disabled?: boolean; icon?: string }[];
  single?: boolean;
  search?: boolean;
}

/** What a reader's `mark` event carries: the mark pressed and the words selected. */
export interface RemoteMarked {
  mark: string;
  text: string;
  /** The block the words start in, by its anchor. */
  anchor: string;
  /** All the words of that block. */
  context: string;
}

/** What a file button's `choose` event carries: what was chosen, never the bytes. */
export interface RemoteChosenFile {
  name: string;
  size: number;
  type: string;
}

/** One option of a Choice or a CheckboxGroup: one that can't be picked now says why. */
export interface RemoteOption {
  value: string;
  label: string;
  detail?: string;
  disabled?: boolean;
  reason?: string;
}

/** Each event's detail, the value the listener's `event.detail` holds. */
export interface QuillRemoteEvents {
  'quill-page-head': { trail: string; action: string };
  'quill-section': { action: undefined };
  'quill-selection-bar': { action: string; clear: undefined };
  'quill-about': Record<never, never>;
  'quill-more': { more: undefined };
  'quill-list': { open: string; action: { item: string; action: string }; retry: undefined };
  'quill-table': { sort: { key: string; dir: 'asc' | 'desc' } | null; select: string[]; open: string; retry: undefined };
  'quill-rows': Record<never, never>;
  'quill-facts': Record<never, never>;
  'quill-details': Record<never, never>;
  'quill-state': { action: undefined };
  'quill-notice': { action: undefined };
  'quill-tag': { remove: undefined };
  'quill-button': { press: undefined };
  'quill-text-field': { change: string; commit: string };
  'quill-select': { change: string };
  'quill-checkbox': { change: boolean };
  'quill-editor': { change: string; commit: string };
  'quill-palette': { close: undefined; query: string; pick: string };
  'quill-tiles': Record<never, never>;
  'quill-kind-tile': { open: undefined };
  'quill-add-tile': { press: undefined };
  'quill-reel': { open: string };
  'quill-dialog': { submit: Record<string, string>; close: false };
  'quill-ask-twice': { press: undefined };
  'quill-choice': { change: string };
  'quill-checkbox-group': { change: string[] };
  'quill-date-field': { change: string };
  'quill-tag-picker': { change: string[]; create: string };
  'quill-steps': Record<never, never>;
  'quill-progress': Record<never, never>;
  'quill-status': Record<never, never>;
  'quill-check-list': { act: string };
  'quill-step-list': { act: string };
  'quill-paged-list': { open: string; more: undefined };
  'quill-reader': { mark: RemoteMarked; position: string };
  'quill-file-button': { choose: RemoteChosenFile[] };
  'quill-people-picker': { query: string; change: RemotePrincipal[]; pick: RemotePrincipal };
  'quill-floor-path': { open: string };
  'quill-filter-bar': { change: { value: Record<string, string[]>; sort: string } };
}

// Every element has both, and nothing else does.
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
export const typesCoverVocabulary: Same<keyof QuillRemoteProperties, QuillRemoteElementName> & Same<keyof QuillRemoteEvents, QuillRemoteElementName> = true;
