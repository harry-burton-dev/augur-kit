import { animate, motionMode, tokenEasing, tokenValue } from './motion.js';
import { floorBeside, floorDirection, floorKindOf, floorMeaning, type FloorDirection, type ShellFloor } from './floors.js';
import type { Water } from './water.js';
import { arcOrder, arcSlot } from './shell-menu.js';
import { backgrounds, type BackgroundChoice } from './background.js';
import { UNDER_CAP, type FrameUnderItem } from './frame.js';

export type NotificationLevel = 'needs' | 'info' | 'running' | 'done' | 'failed';

export interface ShellNotification {
  id: string;
  /** The app id that raised it. */
  app: string;
  level: NotificationLevel;
  title: string;
  detail?: string;
  /** When it happened: a Date, epoch ms or an ISO string. */
  time: Date | number | string;
  /** The floor it's from, by id: tagged with that floor's name, and a dot on the gauge until it's dealt with. */
  floor?: string;
  /** Up to two things to do about it right from the stream ("Approve", "Open"); the host does them. Extras are dropped. */
  actions?: ShellNotificationAction[];
  /** The person made this kind of notification quiet: it lands in the stream like a muted app's, without a pulse and uncounted. */
  quiet?: boolean;
  /** The page of its app it's on, by id: the app bar lights the way down to it. */
  page?: string;
}

export interface ShellNotificationAction {
  label: string;
}

export interface ShellApp {
  id: string;
  name: string;
  /** One line about it, shown under the name in Apps. */
  line?: string;
  icon?: string;
  /** AI apps carry the bubble. */
  ai?: boolean;
  /** It shows the same on every floor, so the gauge rests while it's open and says why. */
  sameOnEveryFloor?: boolean;
  /** The group it sits in on the app bar, by id (see `ShellModel.groups`). Apps with none go in Apps. */
  group?: string;
  /** Why it can't open here: it stays in its start menu, greyed, with this as its small print. */
  off?: string;
  /** Its pages, in the rail when it's open. With none, the rail shows only the fixed block. */
  pages?: ShellPage[];
}

/** One of an app's pages, a tile in the rail while the app is open. */
export interface ShellPage {
  id: string;
  name: string;
  icon: string;
  /** Where it opens, below the app's own address (a place of an app on the app contract). */
  path?: string;
  /** The app fills what sits under it at run time; the host puts that in `ShellModel.under`. */
  fills?: boolean;
}

/** A group of apps: one tile on the desktop's app bar, whose start menu lists them. */
export interface ShellAppGroup {
  id: string;
  name: string;
  icon: string;
  /** What's in it, in a few words. */
  line?: string;
}

/** What needs you, as a way down the app bar: the app and, when it says, the page. */
export interface ShellNeed {
  app: string;
  page?: string;
}

/** How an agent is doing, most urgent first. */
export type AgentStatus = 'needs' | 'failed' | 'running' | 'waiting' | 'done' | 'idle';
export const agentUrgency: AgentStatus[] = ['needs', 'failed', 'running', 'waiting', 'done', 'idle'];

export interface ShellAgent {
  id: string;
  name: string;
  detail?: string;
  status: AgentStatus;
  /** The app that opens when the agent is chosen. */
  app?: string;
}

export interface ShellFunction {
  id: string;
  label: string;
  icon: string;
  /** Why it can't be used now, said instead of hiding it: the button stays, looks unavailable and pressing it does nothing. */
  unavailable?: string;
}

/**
 * A way to go that works from every screen. No longer drawn: the app bar's Home and Apps replace
 * the round buttons. Kept so a host that still sets `navs` builds.
 */
export interface ShellNav {
  id: string;
  label: string;
  icon: string;
  /** You're here already. */
  current?: boolean;
  /** Why it can't be used now, said instead of hiding it. */
  unavailable?: string;
}

export interface ShellFindResult {
  id: string;
  title: string;
  detail?: string;
  kind: 'app' | 'notification' | 'agent' | string;
  /** The name of the group it's listed under, such as the app it came from; ungrouped ones come first. */
  group?: string;
}

/**
 * A group of Find results the host is still gathering, such as one app's
 * content: `looking` says "Still looking…" until its results arrive, `late`
 * and `failed` say it didn't answer. A group that's `done` with no results isn't shown.
 */
export interface ShellFindGroup {
  name: string;
  state: 'looking' | 'done' | 'late' | 'failed';
}

export type ShellView = 'stream' | 'apps' | 'find' | 'agents' | 'account' | 'settings';

export interface ShellSettings {
  reduceMotion?: boolean;
  density?: 'comfortable' | 'compact';
  /** On unless false: an area title card on arriving at a floor or opening an app. */
  areaTitles?: boolean;
  /** Where the app bar rests on the desktop: under the band (0), upper (1, the default), lower (2) or at the bottom (3). */
  barStop?: 0 | 1 | 2 | 3;
  /** Off unless true: the host says each new notification once as a toast; the Shell itself still only pulses. */
  toasts?: boolean;
}

/** An area title card: the kind of place or the floor above, its name large, and who sees it. */
export interface AreaCard {
  kind: 'floor' | 'app';
  kick: string;
  name: string;
  line?: string;
}

export const defaultFunctions: ShellFunction[] = [
  { id: 'apps', label: 'Apps', icon: 'apps' },
  { id: 'find', label: 'Find', icon: 'find' },
  { id: 'agents', label: 'Agents', icon: 'agents' },
  { id: 'account', label: 'Account', icon: 'account' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

const builtInViews = new Set<string>(['stream', 'apps', 'find', 'agents', 'account', 'settings']);

export const toTime = (t: ShellNotification['time']) => (t instanceof Date ? t.getTime() : typeof t === 'number' ? t : Date.parse(t));

/** "now", "4 min", "2 h", "3 d": how long ago, in the fewest words. */
export function ago(time: ShellNotification['time'], now = Date.now()): string {
  const s = Math.max(0, (now - toTime(time)) / 1000);
  if (s < 60) return 'now';
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  if (s < 86400) return `${Math.floor(s / 3600)} h`;
  return `${Math.floor(s / 86400)} d`;
}

/** Status in words, never a point alone: "1 needs you", "3 notifications", "All quiet". */
export function streamWords(list: ShellNotification[]): string {
  const needs = list.filter((n) => n.level === 'needs').length;
  if (needs) return `${needs} need${needs === 1 ? 's' : ''} you`;
  if (list.length) return `${list.length} notification${list.length === 1 ? '' : 's'}`;
  return 'All quiet';
}

/** Where the stage sits as it leaves (1) or before it comes in (-1) on a move between floors. */
function travel(direction: FloorDirection, way: 1 | -1): string {
  if (motionMode() === 'reduce') return 'none';
  const far = tokenValue('travel-floor', 96) * way;
  return direction === 'up' ? `translateY(${far}px)` : direction === 'down' ? `translateY(${-far}px)` : `translateX(${-far}px)`;
}

/** The plain fields a host sets that change what's drawn. */
const DRAWN = [
  'product', 'workspace', 'user', 'online', 'statusLabel', 'apps', 'recent', 'agents', 'agentsLoading', 'agentsError', 'functions',
  'streamLoading', 'streamError', 'findResults', 'findGroups', 'settings', 'away', 'canSwitchWorkspace', 'navs', 'backTo', 'area',
  'floors', 'version', 'background', 'backgroundOptions', 'backgroundSet', 'groups', 'barHolds', 'barHint', 'running', 'page',
] as const;

/** The elements the drawn Shell hands its model, so moves and focus can reach them. */
export interface ShellParts {
  root: HTMLElement | null;
  stage: HTMLElement | null;
  place: HTMLElement | null;
  water: Water | null;
}

/**
 * What the Shell knows and does, apart from drawing it: who you are, the
 * floor you're on, the apps, the notification stream and the sky's state.
 * The host keeps one, sets what it knows on it and listens for what the
 * person asks (`ui-*` events on it, the same names the Lit `ui-shell` fired);
 * `<Shell>` draws it and redraws on every change.
 *
 * Events: ui-toggle `{ open }`, ui-open-app `{ id }`, ui-home, ui-page `{ app, id }`,
 * ui-path `{ app, page, path }` (a thing under a place, or "and n more"),
 * ui-close-app `{ id }`, ui-bar-hint,
 * ui-open-notification `{ notification }`, ui-notification-action
 * `{ notification, index }`, ui-notifications `{ notifications, muted }`,
 * ui-mute `{ app, muted }`, ui-dismiss `{ ids }`, ui-restore `{ ids }`,
 * ui-function `{ id }`, ui-floor `{ id, direction }`, ui-find `{ q }`,
 * ui-pick `{ result }`, ui-setting `{ key, value }`, ui-retry `{ what }`, ui-stream.
 */
export class ShellModel extends EventTarget {
  /** The platform's name in the band, without floors. */
  product = 'AUGUR';
  workspace = '';
  user: { name: string; email?: string } | undefined = undefined;
  online = true;
  /** Overrides the status words in the band. */
  statusLabel = '';
  apps: ShellApp[] = [];
  /** App ids, most recent first. */
  recent: string[] = [];
  agents: ShellAgent[] = [];
  agentsLoading = false;
  agentsError = '';
  functions: ShellFunction[] = defaultFunctions;
  streamLoading = false;
  streamError = '';
  findResults: ShellFindResult[] = [];
  /** The groups of `findResults` in the order they're shown, each with whether it's still coming. */
  findGroups: ShellFindGroup[] = [];
  settings: ShellSettings = { reduceMotion: false, density: 'comfortable', areaTitles: true };
  away = false;
  /** Whether Account offers Switch workspace; a host with one workspace turns it off. Floors replace it. */
  canSwitchWorkspace = true;
  /** No longer drawn: the app bar replaces them (see `ShellNav`). */
  navs: ShellNav[] = [];
  /** No longer drawn: the app bar's Home replaces Back. */
  backTo = '';
  /** The app bar's groups, one tile each on the desktop, in order. Apps name theirs with `group`. */
  groups: ShellAppGroup[] = [];
  /** Groups as tiles on the desktop bar, or one Apps tile holding them as folders. */
  barHolds: 'groups' | 'folder' = 'groups';
  /** One line by the bar, the first time, saying what the tiles are; empty for none. Cleared once read (ui-bar-hint). */
  barHint = '';
  /** The apps that are open, in the order they opened: tiles after the divider on the desktop, and in the rail. */
  running: string[] = [];
  /** The open app's page, by id; empty is its first. */
  page = '';
  /**
   * Where in the open app the person is, below its own address, when the host knows it: marks the
   * thing under a place that is open. Cleared on a page, an app or Home.
   */
  path = '';
  /**
   * What each app put under its places (`ctx.frame.under`), by app id, then place id. The host owns it and
   * sets it from the app's session; closing an app drops its entry, so a reopened app starts empty.
   */
  under: Record<string, Record<string, FrameUnderItem[]>> = {};
  /** How many things show under one place: the deployment's number, 50 unless it says. */
  underCap = UNDER_CAP;
  /** The part of the open app you're in, said under its name; empty says only the app. */
  area = '';
  /**
   * Every floor the person can stand on. With floors, the top left shows the
   * current one's icon and name instead of the product, a gauge at the edge
   * shows the floors above and below, Account lists them all, and each kind
   * of floor gives the water its own colours and height.
   */
  floors: ShellFloor[] = [];
  /** What's running, shown in Settings; the host sets it. */
  version = '';
  /**
   * The desktop's background, by id from `backgroundSet`: `horizon` (the default), `flat`, `water`,
   * or `none`. A water preset's name ("Calm Tide") still works and means the water in that preset.
   * With an app open the background steps away and the app sits on flat ground.
   */
  background = 'horizon';
  /** The background's own options, such as the horizon's `line` or the water's `preset`. */
  backgroundOptions: Record<string, unknown> = {};
  /** The backgrounds to choose from: the kit's, and any the deployment adds. */
  backgroundSet: BackgroundChoice[] = backgrounds;

  /* the sky's own state */
  isOpen = false;
  /** The function open under the dome, or '' for the dome itself. */
  view = '';
  focusIndex = 0;
  query = '';
  undo: { label: string; items: ShellNotification[] } | null = null;
  now = Date.now();
  /** The area title card showing now, if any: arriving on a floor or opening an app. */
  card: AreaCard | null = null;
  /** Where you just arrived, in words, for screen readers. */
  said = '';
  /** A notification just arrived and pulses the point once. */
  arriving = false;

  private _current = '';
  private _floor = '';
  private _notifications: ShellNotification[] = [];
  private _muted: string[] = [];

  private parts: ShellParts = { root: null, stage: null, place: null, water: null };
  private listeners = new Set<() => void>();
  private revision = 0;
  private committed: (() => void)[] = [];
  private tellNotifications = false;
  private focusAfter: 'dome' | 'view' | null = null;
  private returnFocus: HTMLElement | null = null;
  private arriveTimer: ReturnType<typeof setTimeout> | undefined;
  private cardTimer: ReturnType<typeof setTimeout> | undefined;
  /** The way the last floor move went, until the next screen has come in from the other side. */
  private inbound: FloorDirection | undefined;
  /** The app last arrived in, so its card plays once on opening it, not on every page of it. */
  private arrivedIn = '';
  /** Settles when the card showing now has ended. */
  private cardEnd: Promise<void> = Promise.resolve();
  private cardEnded: (() => void) | undefined;
  /** The team last stood on, so going up from your own floor goes back there. */
  lastTeam: string | undefined;
  /** Whether the stage waits unseen behind a title card. Nothing unseen can be pressed, so it is inert until it comes in. */
  hiddenByCard = false;

  constructor() {
    super();
    // What the host sets as plain fields redraws the Shell, as a Lit property did.
    for (const key of DRAWN) {
      let value = this[key];
      Object.defineProperty(this, key, {
        enumerable: true,
        get: () => value,
        set: (next: unknown) => {
          if (Object.is(next, value)) return;
          value = next as never;
          this.requestUpdate();
        },
      });
    }
  }

  /* ---- drawing: what <Shell> reads and tells ---- */

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getRevision = () => this.revision;

  /** Something changed: draw again. Set fields, then call it; the setters below call it themselves. */
  requestUpdate() {
    this.revision++;
    for (const l of this.listeners) l();
  }

  /**
   * Resolves once what has changed is drawn, as the Lit element's
   * `updateComplete` did; at once when nothing is drawing it.
   */
  get updateComplete(): Promise<boolean> {
    if (!this.listeners.size) return Promise.resolve(true);
    return new Promise((resolve) => this.committed.push(() => resolve(true)));
  }

  /** <Shell> calls this after each draw. */
  drawn(parts: ShellParts) {
    this.parts = parts;
    if (this.parts.stage) this.parts.stage.inert = this.isOpen || this.hiddenByCard;
    if (this.tellNotifications) {
      this.tellNotifications = false;
      this.emit('ui-notifications', { notifications: this.notifications, muted: this.muted });
    }
    const focus = this.focusAfter;
    this.focusAfter = null;
    if (focus === 'dome') this.focusDome(this.focusIndex);
    else if (focus === 'view') {
      const view = this.parts.root?.querySelector('.aerie-view');
      (view?.querySelector<HTMLElement>('[data-first]') ?? view?.querySelector<HTMLElement>('button, input, [tabindex="0"]'))?.focus();
    }
    const done = this.committed;
    this.committed = [];
    for (const d of done) d();
  }

  /* ---- what changes with side effects ---- */

  get current() {
    return this._current;
  }
  set current(id: string) {
    this._current = id;
    if (id !== this.arrivedIn) this.arrivedIn = '';
    this.requestUpdate();
  }

  get notifications() {
    return this._notifications;
  }
  set notifications(list: ShellNotification[]) {
    this._notifications = list;
    this.tellNotifications = true;
    this.requestUpdate();
  }

  /**
   * App ids the person muted. Their notifications still land in the stream,
   * silently: no pulse, and they don't count in the band's words.
   */
  get muted() {
    return this._muted;
  }
  set muted(list: string[]) {
    this._muted = list;
    this.tellNotifications = true;
    this.requestUpdate();
  }

  /** The id of the floor the person is on. Setting a new one plays the move. */
  get floor() {
    return this._floor;
  }
  set floor(id: string) {
    const before = this._floor;
    this._floor = id;
    const here = this.currentFloor;
    // Remember the deepest team on your way, so going up and back down retraces it.
    const last = this.floors.find((f) => f.id === this.lastTeam);
    if (here?.kind === 'team' && !last?.path.some((p) => p.id === here.id)) this.lastTeam = here.id;
    const from = this.floors.find((f) => f.id === before);
    if (here && before && from && before !== id) {
      // A move between floors: the water travels, the next screen comes in from the other side, and the floor's card plays.
      const direction = floorDirection(from, here);
      this.said = direction === 'up' ? `Up to ${here.name}` : direction === 'down' ? (here.kind === 'personal' ? 'Down to you' : `Down to ${here.name}`) : here.name;
      this.inbound = direction;
      this.showCard({ kind: 'floor', kick: floorKindOf(here), name: here.name, line: floorMeaning(here) });
      void this.updateComplete.then(() => this.parts.water?.move(direction));
    }
    this.requestUpdate();
  }

  /* ---- controller ---- */

  open() {
    if (this.isOpen) return;
    const active = document.activeElement;
    this.returnFocus = active instanceof HTMLElement && active !== document.body ? active : null;
    this.isOpen = true;
    this.view = '';
    this.focusIndex = this.streamSlot;
    this.focusAfter = 'dome';
    this.emit('ui-toggle', { open: true });
    this.requestUpdate();
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.view = '';
    this.query = '';
    this.emit('ui-toggle', { open: false });
    const back = this.returnFocus;
    this.returnFocus = null;
    this.requestUpdate();
    if (back?.isConnected) requestAnimationFrame(() => back.focus());
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  openView(id: string) {
    if (!this.isOpen) this.open();
    if (!builtInViews.has(id)) {
      this.emit('ui-function', { id });
      return;
    }
    this.view = id;
    this.focusAfter = 'view';
    if (id === 'stream') this.emit('ui-stream', {});
    this.requestUpdate();
  }

  closeView() {
    const was = this.view;
    this.view = '';
    this.query = '';
    this.requestUpdate();
    void this.updateComplete.then(() => this.focusDome(Math.max(0, this.order.indexOf(was))));
  }

  /** Add a notification. It changes the status words and pulses the point once; the Shell never opens itself. */
  notify(n: ShellNotification) {
    this.notifications = [n, ...this.notifications.filter((x) => x.id !== n.id)];
    if (n.quiet || this.muted.includes(n.app)) return;
    this.arriving = true;
    clearTimeout(this.arriveTimer);
    this.arriveTimer = setTimeout(() => {
      this.arriving = false;
      this.requestUpdate();
    }, 700);
  }

  dismiss(id: string) {
    const gone = this.notifications.filter((n) => n.id === id);
    if (!gone.length) return;
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.undo = { label: 'Dismissed.', items: gone };
    this.emit('ui-dismiss', { ids: [id] });
  }

  /** Clear the quiet ones: leaves only what needs you. */
  clear() {
    const quiet = this.notifications.filter((n) => n.level !== 'needs');
    if (!quiet.length) return;
    this.notifications = this.notifications.filter((n) => n.level === 'needs');
    this.undo = { label: `Cleared ${quiet.length}.`, items: quiet };
    this.emit('ui-dismiss', { ids: quiet.map((n) => n.id) });
  }

  restore() {
    if (!this.undo) return;
    const ids = new Set(this.undo.items.map((n) => n.id));
    this.notifications = [...this.undo.items, ...this.notifications.filter((n) => !ids.has(n.id))].sort((a, b) => toTime(b.time) - toTime(a.time));
    this.undo = null;
    this.emit('ui-restore', { ids: [...ids] });
  }

  /** Mutes an app's notifications, or unmutes them. */
  setMuted(app: string, muted: boolean) {
    const has = this.muted.includes(app);
    if (has === muted) return;
    this.muted = muted ? [...this.muted, app] : this.muted.filter((a) => a !== app);
    this.emit('ui-mute', { app, muted });
  }

  setCurrent(id: string) {
    this.recent = [id, ...this.recent.filter((r) => r !== id)].slice(0, 6);
    this.current = id;
  }

  setStream({ loading = false, error = '' }: { loading?: boolean; error?: string }) {
    this.streamLoading = loading;
    this.streamError = error;
    this.requestUpdate();
  }

  setAgents(list: ShellAgent[], { loading = false, error = '' }: { loading?: boolean; error?: string } = {}) {
    this.agents = list;
    this.agentsLoading = loading;
    this.agentsError = error;
    this.requestUpdate();
  }

  setQuery(q: string) {
    this.query = q;
    this.requestUpdate();
    this.emit('ui-find', { q });
  }

  setAway(away: boolean) {
    this.away = away;
    this.requestUpdate();
    this.emit('ui-setting', { key: 'away', value: away });
  }

  setSetting(key: keyof ShellSettings, value: unknown) {
    this.settings = { ...this.settings, [key]: value };
    this.requestUpdate();
    this.emit('ui-setting', { key, value });
  }

  /** The floor the person is on, when floors are set. */
  get currentFloor(): ShellFloor | undefined {
    return this.floors.find((f) => f.id === this.floor);
  }

  /** The app that's open, when one is: `current` among `apps`. */
  get openNow(): ShellApp | undefined {
    return this.current ? this.apps.find((a) => a.id === this.current) : undefined;
  }

  /**
   * Why the gauge rests, when it does: the open app shows the same on every
   * floor, so moving would change nothing. It stays in view and says so.
   */
  get floorsRest(): string {
    const app = this.openNow;
    return app?.sameOnEveryFloor ? `${app.name} is the same on every floor` : '';
  }

  /** Asks the host to go one floor up or down the gauge. False when there is no floor that way, or the gauge rests. */
  moveFloor(direction: 'up' | 'down'): boolean {
    if (this.floorsRest) return false;
    const to = floorBeside(this.floors, this.floor, direction, this.lastTeam);
    if (!to) return false;
    this.goToFloor(to.id);
    return true;
  }

  goToFloor(id: string) {
    const to = this.floors.find((f) => f.id === id);
    if (!to || id === this.floor) return;
    this.emit('ui-floor', { id, direction: floorDirection(this.currentFloor, to) });
  }

  /** The water under the stage, for menus to swell as you move; null when it is turned off. */
  get waves(): Water | null {
    return this.parts.water;
  }

  /** The element apps mount into. */
  get stage(): HTMLElement | null {
    return this.parts.stage;
  }

  /** The open app's name under the handle: where a chosen icon lands when the app opens. */
  get placeTitle(): HTMLElement | null {
    return this.parts.place;
  }

  /**
   * The app arrives: it rises a short way into place as it fades in. Under
   * reduced motion it only fades. Jumped to its end by any key or press
   * (`finishMotion`). Opening an app, rather than another page of the one
   * open, plays its title card: the app's name, under the floor it opened on.
   * While a card shows, the app waits behind it unseen, and comes in once the
   * card has faded.
   */
  arrive(): Promise<void> {
    const box = this.parts.stage;
    if (!box) return Promise.resolve();
    const app = this.openNow;
    if (app && this.arrivedIn !== app.id) {
      this.arrivedIn = app.id;
      if (!this.inbound) this.showCard({ kind: 'app', kick: this.currentFloor?.name ?? this.product, name: app.name });
    }
    box.getAnimations?.().forEach((a) => a.cancel());
    return this.afterCard(box, () => {
      if (this.inbound) return this.enterFloor(box);
      const rise = motionMode() === 'reduce' ? 'none' : `translateY(${tokenValue('travel-near', 24)}px)`;
      return animate(box, [{ transform: rise, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: tokenValue('motion-slow', 320), easing: tokenEasing('ease-out') });
    });
  }

  /** A title card plays alone: what's behind it stays unseen until the card has faded, then comes in. Without a card it comes in at once. */
  private afterCard(box: HTMLElement, comeIn: () => Promise<void>): Promise<void> {
    if (!this.card) {
      this.behindCard(box, false);
      return comeIn();
    }
    this.behindCard(box, true);
    return this.cardGone().then(() => {
      this.behindCard(box, false);
      return comeIn();
    });
  }

  private behindCard(box: HTMLElement, hidden: boolean) {
    this.hiddenByCard = hidden;
    if (hidden) box.style.opacity = '0';
    else box.style.removeProperty('opacity');
    box.inert = this.isOpen || hidden;
  }

  /** Resolves once no card is showing: a card that replaces another waits for that one too. */
  private async cardGone() {
    while (this.card) await this.cardEnd;
  }

  /**
   * The leaving half of a move between floors: what you're looking at goes
   * the way you're going. Going up, it sinks away; going down, it rises away;
   * across, it slides aside. The host waits for this before it takes the app
   * down, so nothing goes blank partway through. Under reduced motion it fades.
   */
  leaveFloor(direction: FloorDirection): Promise<void> {
    const box = this.parts.stage;
    if (!box) return Promise.resolve();
    box.getAnimations?.().forEach((a) => a.cancel());
    return animate(box, [{ transform: 'none', opacity: 1 }, { transform: travel(direction, 1), opacity: 0 }], {
      duration: tokenValue('motion-slow', 320),
      easing: tokenEasing('ease-in'),
      fill: 'forwards',
    });
  }

  /** The arriving half: the new floor comes in from the other side. */
  private enterFloor(box: HTMLElement): Promise<void> {
    const direction = this.inbound!;
    this.inbound = undefined;
    return animate(box, [{ transform: travel(direction, -1), opacity: 0 }, { transform: 'none', opacity: 1 }], {
      duration: tokenValue('motion-calm', 600),
      easing: tokenEasing('ease-out'),
    });
  }

  /** The app leaves on Back: it sinks a short way as it fades, in about four fifths of the time it took to arrive. */
  sink(): Promise<void> {
    const box = this.parts.stage;
    if (!box) return Promise.resolve();
    const fall = motionMode() === 'reduce' ? 'none' : `translateY(${tokenValue('travel-near', 24)}px)`;
    return animate(box, [{ transform: 'none', opacity: 1 }, { transform: fall, opacity: 0 }], {
      duration: tokenValue('motion-slow', 320) * 0.8,
      easing: tokenEasing('ease-in'),
      fill: 'forwards',
    });
  }

  /** Put the stage back as it rests, after a move that left it hidden. */
  settleStage() {
    const box = this.parts.stage;
    box?.getAnimations?.().forEach((a) => a.cancel());
    if (box && this.inbound) void this.afterCard(box, () => this.enterFloor(box));
  }

  /**
   * Show an area title card for a moment. Cards are generated from the floor
   * or app arrived at (Shell principles, in the AUGUR handbook, "Arrivals are generated"),
   * never written by hand; the Area titles setting turns them off.
   */
  private showCard(card: AreaCard) {
    clearTimeout(this.cardTimer);
    if (this.settings.areaTitles === false) return this.endCard();
    // the card it replaces has ended, and what waited on that one now waits on this
    this.cardEnded?.();
    this.cardEnd = new Promise((resolve) => (this.cardEnded = resolve));
    // Nothing repeats its parent: a kicker that only says the name again goes.
    this.card = card.kick.toLowerCase() === card.name.toLowerCase() ? { ...card, kick: '' } : card;
    this.cardTimer = setTimeout(this.endCard, tokenValue('motion-title', 2400));
    this.requestUpdate();
  }

  /** Any key, press or scroll ends the card at once: it never keeps anyone waiting. */
  endCard = () => {
    if (!this.card) return;
    clearTimeout(this.cardTimer);
    this.card = null;
    this.cardEnded?.();
    this.cardEnded = undefined;
    this.requestUpdate();
  };

  /** Stops the timers, when the Shell goes. */
  stop() {
    clearTimeout(this.arriveTimer);
    clearTimeout(this.cardTimer);
  }

  /* ---- the dome ---- */

  /** Dome order, left to right: the stream sits at the top of the arc. */
  get order(): string[] {
    return arcOrder(this.functions.map((f) => f.id));
  }

  get streamSlot() {
    return this.order.indexOf('stream');
  }

  /** Where item i sits on the arc: both sides reach the same width, so an odd number of functions stays balanced. */
  arcSlot(i: number) {
    return arcSlot(i, this.streamSlot, this.order.length);
  }

  focusDome(i: number) {
    const buttons = [...(this.parts.root?.querySelectorAll<HTMLElement>('.aerie-dome > button') ?? [])];
    if (!buttons.length) return;
    this.focusIndex = (i + buttons.length) % buttons.length;
    buttons[this.focusIndex]!.focus();
    this.requestUpdate();
  }

  emit(name: string, detail: unknown = {}) {
    this.dispatchEvent(new CustomEvent(name, { detail }));
  }

  openApp(id: string) {
    if (!this.running.includes(id)) this.running = [...this.running, id];
    if (id !== this.current) {
      this.page = '';
      this.path = '';
    }
    this.setCurrent(id);
    this.emit('ui-open-app', { id });
    this.close();
  }

  /** Back to the desktop: no app open, the bar back across the screen. Open apps stay open. */
  goHome() {
    this.current = '';
    this.page = '';
    this.path = '';
    this.emit('ui-home', {});
    this.close();
  }

  /** One of the open app's pages, from the rail. */
  openPage(id: string) {
    this.page = id;
    this.path = '';
    this.emit('ui-page', { app: this.current, id });
    this.requestUpdate();
  }

  /**
   * A thing under one of the open app's places, or "and n more", from the rail: its path below the app's
   * own address, and the place it sits under.
   */
  openPath(path: string, page?: string) {
    if (page) this.page = page;
    this.path = path;
    this.emit('ui-path', { app: this.current, page: this.page || this.openNow?.pages?.[0]?.id || '', path });
    this.requestUpdate();
  }

  /** Closes an open app; if it was the one in front, the last one opened before it comes forward, or the desktop. */
  closeApp(id: string) {
    this.running = this.running.filter((a) => a !== id);
    if (id in this.under) {
      const rest = { ...this.under };
      delete rest[id];
      this.under = rest;
    }
    if (this.current === id) {
      this.current = this.running[this.running.length - 1] ?? '';
      this.page = '';
      this.path = '';
    }
    this.emit('ui-close-app', { id });
  }

  /** The bar was moved: kept in settings, so the host can remember it. */
  setBarStop(stop: 0 | 1 | 2 | 3) {
    this.setSetting('barStop', stop);
  }

  /** The first-run line was read. */
  doneBarHint() {
    this.barHint = '';
    this.emit('ui-bar-hint', {});
  }

  /** What needs you, as ways down the app bar, most recent first; the first one leads. Muted apps and quiet notifications don't light anything. */
  get needs(): ShellNeed[] {
    return this.heard
      .filter((n) => n.level === 'needs')
      .sort((a, b) => toTime(b.time) - toTime(a.time))
      .map((n) => ({ app: n.app, page: n.page }));
  }

  openNotification(n: ShellNotification) {
    this.emit('ui-open-notification', { notification: n });
    this.close();
  }

  actOn(n: ShellNotification, index: number) {
    this.emit('ui-notification-action', { notification: n, index });
    this.close();
  }

  /** What the band and the dome count: everything but what the person muted. */
  get heard() {
    return this.notifications.filter((n) => !n.quiet && !this.muted.includes(n.app));
  }

  get mood(): 'quiet' | 'some' | 'needs' | 'offline' {
    if (!this.online) return 'offline';
    const heard = this.heard;
    if (heard.some((n) => n.level === 'needs')) return 'needs';
    return heard.length ? 'some' : 'quiet';
  }

  caption(): { title: string; line: string } {
    const id = this.view || this.order[this.focusIndex] || 'stream';
    if (id === 'stream') {
      const heard = this.heard;
      const latest = heard.find((n) => n.level === 'needs') ?? heard[0];
      const title = this.online ? streamWords(heard) : 'Offline';
      const line = !this.online ? 'These are from before you went offline.' : latest ? latest.title : 'Nothing needs you.';
      return { title, line };
    }
    return { title: this.functions.find((f) => f.id === id)?.label ?? id, line: '' };
  }

  appName(id: string) {
    return this.apps.find((a) => a.id === id)?.name ?? id;
  }

  /** How many notifications wait on each floor. */
  waitingByFloor() {
    const counts = new Map<string, number>();
    for (const n of this.notifications) if (n.floor) counts.set(n.floor, (counts.get(n.floor) ?? 0) + 1);
    return counts;
  }

  /** "On Finance" for a notification from another floor; nothing for one from here or from no floor. */
  floorTag(n: ShellNotification) {
    if (!n.floor || n.floor === this.floor) return '';
    const f = this.floors.find((x) => x.id === n.floor);
    return f ? (f.kind === 'personal' ? 'On your own floor' : `On ${f.name}`) : '';
  }

  /**
   * The stream's groups, one per app, newest first inside each: apps with
   * something that needs you first, then by their newest, muted apps last.
   */
  streamGroups() {
    const byApp = new Map<string, ShellNotification[]>();
    for (const n of [...this.notifications].sort((a, b) => toTime(b.time) - toTime(a.time))) byApp.set(n.app, [...(byApp.get(n.app) ?? []), n]);
    return [...byApp]
      .map(([app, list]) => ({ app, list, muted: this.muted.includes(app), needs: list.some((n) => n.level === 'needs') }))
      .sort((a, b) => Number(a.muted) - Number(b.muted) || Number(b.needs) - Number(a.needs) || toTime(b.list[0]!.time) - toTime(a.list[0]!.time));
  }

  findLocal(q: string): ShellFindResult[] {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    const has = (...s: (string | undefined)[]) => s.some((x) => x?.toLowerCase().includes(needle));
    return [
      ...this.apps.filter((a) => has(a.name, a.line)).map((a) => ({ id: a.id, title: a.name, detail: 'App', kind: 'app' })),
      ...this.notifications.filter((n) => has(n.title, n.detail)).map((n) => ({ id: n.id, title: n.title, detail: this.appName(n.app), kind: 'notification' })),
      ...this.agents.filter((a) => has(a.name, a.detail)).map((a) => ({ id: a.id, title: a.name, detail: 'Agent', kind: 'agent' })),
    ];
  }

  pick(r: ShellFindResult) {
    this.emit('ui-pick', { result: r });
    if (r.kind === 'app') return this.openApp(r.id);
    const n = this.notifications.find((x) => x.id === r.id);
    if (r.kind === 'notification' && n) return this.openNotification(n);
    const agent = this.agents.find((x) => x.id === r.id);
    if (r.kind === 'agent' && agent?.app) return this.openApp(agent.app);
    this.close();
  }
}
