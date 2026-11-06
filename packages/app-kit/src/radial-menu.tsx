import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx, Icon, Letterbox, ms, type IconName } from '@augur/kit-common';
import { useRack, type Hole } from './focus.js';

/**
 * One of the eight fixed directions in the ring, clockwise from the top. A verb
 * that always sits in the same direction can be found without reading: Open
 * up, Delete down.
 */
export type RingSlot = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

/** The eight slots in order, clockwise from the top. Also the order the keys go round. */
export const RING_SLOTS: readonly RingSlot[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];

/** One place an action can go to (a floor to share with, a folder to move into). */
export interface RingTarget {
  id: string;
  label: string;
  /** A short fact that helps choose, shown under the name ("41 people"). */
  detail?: string;
  /** Can't be chosen now. It stays in the list, dimmed, and says why. */
  disabled?: boolean;
  /** Why it can't be chosen now: one short sentence. */
  reason?: string;
  /** Where the thing already is. It is shown, so you know where you start, but can't be chosen. */
  current?: boolean;
}

/**
 * Something else an action would change: another document that links to it, a team that loses access.
 * While the action has focus, the thing on the page marked with `useRingTouch(id)` steps forward out of
 * the rack with its effect beside it, and the readout names it in words either way.
 */
export interface RingTouch {
  /** The id the thing on the page was marked with (`useRingTouch`). Nothing on the page has to carry it. */
  id: string;
  /** What it is, as people read it ("Policy index"). */
  label: string;
  /** What happens to it, in a few words ("Link breaks"). */
  effect: string;
}

/** One thing that can be done with what the menu was opened on. */
export interface RingAction {
  id: string;
  label: string;
  icon: IconName;
  /** Destroys or removes something: drawn in the danger colour, placed at the bottom (`s`) unless it has a slot, and held to confirm. */
  danger?: boolean;
  /** Can't be done now. It stays in the ring, dimmed, and says why: never leave it out. */
  disabled?: boolean;
  /** Why it can't be done now: one short sentence. */
  reason?: string;
  /** Who can make it available ("the floor's leads"). Read out with the reason, and the one asked when `onAsk` is given. */
  owner?: string;
  /** Where in the ring it always sits. Without one it takes the next free slot clockwise from the top. */
  slot?: RingSlot;
  /** The places it can go to. Choosing the action opens them; choosing one calls `onAction(action, target)`. */
  targets?: RingTarget[];
  /** What choosing it would change ("41 more people can read this"), shown and read out while it, or one of its targets, has focus. */
  preview?: string | ((target?: string) => string);
  /** Needs holding down to confirm, so a slip can't do it. Defaults to `danger`. With reduced motion it is pressed twice instead. */
  hold?: boolean;
  /**
   * The other things it would change (consequence focus, V6). While it, or one of its targets, has focus,
   * each one on the page steps forward with its effect and a lead from the subject; the readout lists
   * them all. Held to confirm, it is shown in the letterbox until it is let go. A function is given the
   * target in focus.
   */
  touches?: RingTouch[] | ((target?: string) => RingTouch[]);
  /** What can undo it, in the app's words ("Undo for 30 s"), shown while it is held. The kit never promises an undo itself. */
  undo?: string;
}

/** How the actions are laid out. */
export type RingShape =
  /** Round the subject: a tile gets a ring round its edge, a row a ring beside where it was opened. */
  | 'ring'
  /** A plain list beside the subject, for long lists or people who prefer one. */
  | 'list'
  /** A ring up to `RING_MOST` actions, a list past that (the default). */
  | 'auto';

/** Past this many a ring gets slow to scan and aim at, so `auto` turns it into a list, or overflows into More. */
export const RING_MOST = 8;

/**
 * What a ring does with more actions than slots.
 * - `list`: the whole menu becomes a plain list (the default).
 * - `more`: the first seven keep their slots and the eighth slot becomes More, which opens the rest as a ring
 *   of their own (a list past eight more). The app's order decides what goes into More. W3.5b, pending
 *   Harry's review.
 */
export type RingOverflow = 'list' | 'more';

/**
 * Past this many targets the outer ring gets too tight to read, so an action's targets open as a list beside
 * it instead (PDR: the radial menu has two rings, D8).
 */
export const RING_TARGETS_MOST = 5;

/** The id of the More action that holds the overflow. Never one of an app's own. */
export const RING_MORE_ID = '\u0000more';

/** What the menu is opened on. */
export interface RingSubject {
  /** What it is, read aloud and shown in the middle ("Policy & Guidance"). */
  label: string;
  /** What can be done with it, in the order the keys go round. Up to eight sit in fixed directions; leave none out, mark the unavailable ones. */
  actions: RingAction[];
  /** An action was chosen; `target` is the place chosen, for an action with targets. */
  onAction: (id: string, target?: string) => void;
  /** Someone chose an action that is unavailable: ask its owner to make it available. Without it, choosing one does nothing. */
  onAsk?: (id: string) => void;
}

interface Opened extends RingSubject {
  /** The thing it was opened on: kept sharp and ringed while the rest racks back, and given focus back when it closes. */
  target: HTMLElement;
  /** Where the pointer was, when it was opened by a pointer. */
  point?: { x: number; y: number };
}

interface Ring {
  open: (subject: Opened) => void;
  shape: RingShape;
  overflow: RingOverflow;
}

const RingContext = createContext<Ring | null>(null);

export interface RingProviderProps {
  /** How every menu inside lays out its actions: `auto` (a ring, a list past eight) unless the app chose. */
  shape?: RingShape;
  /** What a ring does past eight actions. `list` unless the app chose `more`. */
  overflow?: RingOverflow;
  /** The part of the app whose things open this menu. */
  children: ReactNode;
}

/**
 * One radial menu for the whole app: whatever is opened with `useRingTarget`
 * or `RingMore` shows here. AppFrame puts one in; an app can put its own round
 * a part of the page to change its shape.
 */
export function RingProvider({ shape = 'auto', overflow = 'list', children }: RingProviderProps) {
  const [opened, setOpened] = useState<Opened | null>(null);
  const ring = useMemo<Ring>(() => ({ open: setOpened, shape, overflow }), [shape, overflow]);
  return (
    <RingContext.Provider value={ring}>
      {children}
      {opened ? <RadialMenu {...opened} shape={shape} overflow={overflow} onClose={() => setOpened(null)} /> : null}
    </RingContext.Provider>
  );
}

/** How long a finger stays down before the menu opens, as a right-click does with a mouse. */
const LONG_PRESS = 550;

/**
 * Makes anything open the radial menu: right-click, the context-menu key,
 * Shift+F10, or a long press with a finger or pen. Spread what it returns on
 * the element. `subject` is read when the menu opens, so its actions are
 * always current. Outside a RingProvider it does nothing.
 */
export function useRingTarget(subject: () => RingSubject | undefined) {
  const ring = useContext(RingContext);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latest = useRef(subject);
  latest.current = subject;
  const fired = useRef(false);

  const open = useCallback(
    (target: HTMLElement, point?: { x: number; y: number }) => {
      const s = latest.current();
      if (!ring || !s) return false;
      ring.open({ ...s, target, ...(point ? { point } : {}) });
      return true;
    },
    [ring],
  );

  return {
    /** Marks the element, so a `RingMore` inside or beside it opens the menu on it. */
    'data-ring-target': '',
    onContextMenu: (e: MouseEvent<HTMLElement>) => {
      if (fired.current) {
        e.preventDefault();
        return;
      }
      if (open(e.currentTarget, e.clientX || e.clientY ? { x: e.clientX, y: e.clientY } : undefined)) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === 'ContextMenu' || (e.key === 'F10' && e.shiftKey)) {
        if (open(e.currentTarget)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    },
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      fired.current = false;
      if (e.pointerType === 'mouse') return;
      const target = e.currentTarget;
      const point = { x: e.clientX, y: e.clientY };
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        fired.current = open(target, point);
      }, LONG_PRESS);
    },
    onPointerUp: () => clearTimeout(timer.current),
    onPointerCancel: () => clearTimeout(timer.current),
    onPointerLeave: () => clearTimeout(timer.current),
    /** A long press opened the menu: the click that follows it shouldn't also open the thing. */
    onClickCapture: (e: MouseEvent<HTMLElement>) => {
      if (fired.current) {
        fired.current = false;
        e.preventDefault();
        e.stopPropagation();
      }
    },
  };
}

/**
 * Marks something on the page as one a radial menu action can touch (`RingAction.touches`), so it steps
 * forward, sharp, while that action has focus. Spread what it returns on the element. `id` is the one the
 * action's touches name.
 */
export function useRingTouch(id: string) {
  return { 'data-ring-touch': id };
}

export interface RingMoreProps {
  /** What the menu opens on; read when it opens. With nothing to offer, the mark isn't drawn. */
  subject: () => RingSubject | undefined;
  className?: string;
}

/**
 * The visible way into the radial menu (PDR-010, amendment 6), for anyone who
 * doesn't know about right-click or a long press. A small "more" mark that
 * shows while its parent is hovered or holds focus (always, on a touch
 * screen), and opens the same menu on the nearest thing marked by
 * `useRingTarget` (the one it sits in, or else one beside it), or on itself.
 * Outside a RingProvider it isn't drawn.
 */
export function RingMore({ subject, className }: RingMoreProps) {
  const ring = useContext(RingContext);
  const s = subject();
  if (!ring || !s) return null;
  const open = (button: HTMLElement) => {
    const now = subject();
    if (!now) return;
    const target = (button.parentElement?.closest<HTMLElement>('[data-ring-target]') ?? button.parentElement?.querySelector<HTMLElement>('[data-ring-target]')) || button;
    const r = button.getBoundingClientRect();
    ring.open({ ...now, target, ...(r.width ? { point: { x: r.left + r.width / 2, y: r.top + r.height / 2 } } : {}) });
  };
  return (
    <button
      type="button"
      className={cx('quill-ring-more', className)}
      aria-label={`More actions for ${s.label}`}
      aria-haspopup="menu"
      // The thing it sits on may open on a press of its own: this press is only for the menu.
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        open(e.currentTarget);
      }}
    >
      <Icon name="more" size={16} />
    </button>
  );
}

/** One action in the order the keys go round, with the slot it sits in when the ring has slots. */
interface Placed {
  action: RingAction;
  slot?: RingSlot;
}

/**
 * Gives each action its slot. Actions with a slot get it (the first one asking wins); danger without a
 * slot goes to the bottom (`s`); the rest fill the free slots clockwise from the top. Past eight there
 * aren't enough slots, so the order is kept, danger last, and the ring is spread by count.
 */
export function placeActions(actions: RingAction[]): Placed[] {
  if (actions.length > RING_SLOTS.length) {
    return [...actions.filter((a) => !a.danger), ...actions.filter((a) => a.danger)].map((action) => ({ action }));
  }
  const taken = new Map<RingSlot, RingAction>();
  const left: RingAction[] = [];
  for (const a of actions) {
    if (a.slot && !taken.has(a.slot)) taken.set(a.slot, a);
    else left.push(a);
  }
  const rest: RingAction[] = [];
  for (const a of left) {
    if (a.danger && !a.slot && !taken.has('s')) taken.set('s', a);
    else rest.push(a);
  }
  for (const a of rest) {
    const free = RING_SLOTS.find((s) => !taken.has(s))!;
    taken.set(free, a);
  }
  return RING_SLOTS.filter((s) => taken.has(s)).map((slot) => ({ action: taken.get(slot)!, slot }));
}

/**
 * The first page of a ring that overflows into More: the first seven actions in their slots, and More in the
 * slot left free (north-west when it is). `rest` is what More holds.
 */
export function pageActions(actions: RingAction[]): { first: Placed[]; rest: RingAction[] } {
  const keep = RING_MOST - 1;
  const rest = actions.slice(keep);
  const first = placeActions(actions.slice(0, keep));
  const free = (['nw', ...RING_SLOTS] as RingSlot[]).find((s) => !first.some((p) => p.slot === s))!;
  const names = rest.map((a) => a.label).join(', ');
  const more: Placed = { action: { id: RING_MORE_ID, label: 'More', icon: 'more', preview: `${rest.length} more: ${names}` }, slot: free };
  return { first: [...first, more].sort((a, b) => RING_SLOTS.indexOf(a.slot!) - RING_SLOTS.indexOf(b.slot!)), rest };
}

export interface RadialMenuProps extends Opened {
  /** How the actions are laid out: a ring, a list, or a ring up to eight and a list past that (`auto`). */
  shape?: RingShape;
  /** What the ring does past eight actions. */
  overflow?: RingOverflow;
  /** The menu has closed, chosen or not. Focus has gone back to the thing it was opened on. */
  onClose: () => void;
}

const px = (n: number) => `${Math.round(n)}px`;
const num = (el: Element, name: string, fallback: number) => parseFloat(getComputedStyle(el).getPropertyValue(name)) || fallback;
const still = () => typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/** "Delete" read inside a sentence: "Hold Enter to delete". A name in capitals stays as it is. */
const verb = (label: string) => (/^[A-Z][^A-Z]/.test(label) ? label[0]!.toLowerCase() + label.slice(1) : label);
const needsHold = (a: RingAction) => a.hold ?? a.danger ?? false;
const previewOf = (a: RingAction, target?: string) => (typeof a.preview === 'function' ? a.preview(target) : a.preview);
const touchesOf = (a: RingAction, target?: string) => (typeof a.touches === 'function' ? a.touches(target) : a.touches) ?? [];

/** A touched thing on screen now, and where. */
interface Seen {
  touch: RingTouch;
  box: Hole;
}
/** The point of a box nearest to (x, y). */
const nearest = (b: Hole, x: number, y: number) => ({ x: Math.min(Math.max(x, b.x), b.x + b.width), y: Math.min(Math.max(y, b.y), b.y + b.height) });

/** What is being held or armed: an action, or one of its targets. */
const keyOf = (a: RingAction, t?: RingTarget) => (t ? `${a.id}\u0000${t.id}` : a.id);

/**
 * The actions of one thing, in two rings round where it was opened (PDR-010;
 * two rings, V5). The rest of the app racks out of focus and the thing itself
 * stays sharp, ringed as selected.
 *
 * The inner ring is eight wedges in eight fixed directions (`RingSlot`), so a
 * verb is always in the same place: an action's own slot, danger at the bottom,
 * the rest clockwise from the top. Each wedge carries its name, always showing.
 * The ring stays whole on screen, moved in from an edge rather than bent, so no
 * direction ever changes. Cancel sits in the hub.
 *
 * An action with targets opens them on an outer ring, fanned out in its own
 * direction, so Move then Procurement is one stroke; past `RING_TARGETS_MOST`
 * they open as a list beside it. An action that can't be done stays, hatched
 * and locked, and can still be focused: its reason and owner are shown and read
 * out, and choosing it asks the owner when the subject takes `onAsk`. One
 * readout under the ring says where you are (thing, verb, place) and what the
 * focused choice would change (`preview`), read out politely. Danger, or
 * anything marked `hold`, is held down to confirm, filling the hub; with
 * reduced motion it is pressed twice.
 *
 * Consequence focus (V6): an action that names what it `touches` brings those
 * things forward while it has focus. Each one marked on the page with
 * `useRingTouch` comes out of the rack, sharp and framed in ink (red for what
 * danger breaks), its effect beside it and a lead from the subject; the readout
 * lists them all in words, so the ones scrolled away are named too. Held to
 * confirm, it is letterboxed until it is let go: what it does above, what it
 * touches in the frame, and how to cancel (and undo, when the app says) below.
 *
 * Keys: arrows (or Tab) go round, Home and End jump, 1 to 8 pick a direction
 * clockwise from the top, a letter jumps to the next action starting with it,
 * Enter or Space chooses, Esc closes. On an action with targets, ArrowRight or
 * Enter goes into them and ArrowLeft or Esc comes back out. Focus goes back to
 * the thing when it closes.
 */
export function RadialMenu({ label, actions, onAction, onAsk, target, point, shape = 'auto', overflow = 'list', onClose }: RadialMenuProps) {
  /** Whether the ring overflows into More, and whether More is open. */
  const paged = overflow === 'more' && shape !== 'list' && actions.length > RING_MOST;
  const [inMore, setInMore] = useState(false);
  const placed = useMemo(() => {
    if (!paged) return placeActions(actions);
    const { first, rest } = pageActions(actions);
    return inMore ? placeActions(rest) : first;
  }, [actions, paged, inMore]);
  const list = useMemo(() => placed.map((p) => p.action), [placed]);
  const asList = shape === 'list' || (shape === 'auto' && list.length > RING_MOST);
  const [focused, setFocused] = useState(() => Math.max(0, list.findIndex((a) => !a.disabled)));
  /** The action whose targets are open, and where its list sits. */
  const [into, setInto] = useState<{ index: number; left: number; top: number; flip: boolean; outer: boolean } | null>(null);
  const [aimed, setAimed] = useState(0);
  const [holding, setHolding] = useState<string | null>(null);
  const [armed, setArmed] = useState<string | null>(null);
  const [box, setBox] = useState<Hole>(() => {
    const r = target.getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height };
  });
  const [leaving, setLeaving] = useState(false);
  const id = useId();
  const menu = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const places = useRef<(HTMLButtonElement | null)[]>([]);
  const hold = useRef<ReturnType<typeof setTimeout>>(undefined);
  const opened = into ? list[into.index] : undefined;
  const targets = opened?.targets ?? [];

  // What the focused choice would touch: nothing for an unavailable one, or before a target is chosen
  // for an action that has them unless it says otherwise.
  const pick = opened ? targets[aimed] : undefined;
  const choosing = opened ?? list[focused];
  const touches = choosing && !choosing.disabled && (!opened || (pick && !pick.disabled && !pick.current)) ? touchesOf(choosing, pick?.id) : [];
  const touchKey = touches.map((t) => `${t.id}\u0000${t.label}\u0000${t.effect}`).join('\u0001');
  const [seen, setSeen] = useState<Seen[]>([]);
  // Find each touched thing on the page; the ones on screen step forward, the rest are only named.
  useLayoutEffect(() => {
    const marked = [...document.querySelectorAll<HTMLElement>('[data-ring-touch]')];
    const next = touches.flatMap((touch): Seen[] => {
      const r = marked.find((m) => m.dataset.ringTouch === touch.id)?.getBoundingClientRect();
      if (!r || !r.width || !r.height || r.bottom < 0 || r.right < 0 || r.top > window.innerHeight || r.left > window.innerWidth) return [];
      return [{ touch, box: { x: r.left, y: r.top, width: r.width, height: r.height } }];
    });
    const same = (a: Seen[], b: Seen[]) => a.length === b.length && a.every((s, i) => s.touch === b[i]!.touch || (s.touch.id === b[i]!.touch.id && s.touch.effect === b[i]!.touch.effect && s.box.x === b[i]!.box.x && s.box.y === b[i]!.box.y && s.box.width === b[i]!.box.width && s.box.height === b[i]!.box.height));
    setSeen((now) => (same(now, next) ? now : next));
    // Compared by what they say, so a new array of the same touches doesn't measure again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [touchKey, box]);
  useRack(true, { hole: box, holes: seen.map((s) => s.box), returnTo: target });

  // Keep up with the subject if the page scrolls or resizes under the menu.
  useLayoutEffect(() => {
    const measure = () => {
      const r = target.getBoundingClientRect();
      setBox((b) => (b.x === r.left && b.y === r.top && b.width === r.width && b.height === r.height ? b : { x: r.left, y: r.top, width: r.width, height: r.height }));
    };
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [target]);

  useEffect(() => {
    if (into) places.current[aimed]?.focus();
    else items.current[focused]?.focus();
  }, [focused, aimed, into, inMore]);

  useEffect(() => () => clearTimeout(hold.current), []);

  const close = useCallback(
    (then?: () => void) => {
      if (leaving) return;
      clearTimeout(hold.current);
      setLeaving(true);
      const done = () => {
        onClose();
        // Outside a stage nothing is inert, so focus can go back now; inside one, the stage gives it back.
        if (target.isConnected && !target.closest('[inert]')) target.focus({ preventScroll: true });
        then?.();
      };
      // Reduced motion leaves nothing to wait for.
      if (still()) done();
      else setTimeout(done, ms('motion-quick'));
    },
    [leaving, onClose, target],
  );

  useEffect(() => {
    const away = (e: Event) => {
      if (menu.current && !menu.current.contains(e.target as Node)) close();
    };
    document.addEventListener('pointerdown', away, true);
    return () => document.removeEventListener('pointerdown', away, true);
  }, [close]);

  const commit = (a: RingAction, t?: RingTarget) => close(() => (t ? onAction(a.id, t.id) : onAction(a.id)));

  const stopHold = () => {
    clearTimeout(hold.current);
    hold.current = undefined;
    setHolding(null);
  };
  /** Starts the hold, or with reduced motion arms it on the first press and confirms on the second. */
  const press = (a: RingAction, t?: RingTarget) => {
    const k = keyOf(a, t);
    if (still()) {
      if (armed === k) commit(a, t);
      else setArmed(k);
      return;
    }
    if (hold.current) return;
    setHolding(k);
    hold.current = setTimeout(() => {
      hold.current = undefined;
      setHolding(null);
      commit(a, t);
    }, ms('motion-run'));
  };

  const goInto = (index: number) => {
    const a = list[index];
    if (!a?.targets?.length) return;
    const el = menu.current ?? document.documentElement;
    const gap = num(el, '--ring-gap', 20);
    const width = num(el, '--measure-rail', 240);
    const size = num(el, '--ring-button', 44);
    // Beside the action and its name, on whichever side has room.
    const item = items.current[index];
    const name = item?.querySelector('.quill-ring-name');
    const rects = [item?.getBoundingClientRect(), asList ? undefined : name?.getBoundingClientRect()].filter((r): r is DOMRect => Boolean(r));
    const left = Math.min(...rects.map((r) => r.left), box.x);
    const right = Math.max(...rects.map((r) => r.right));
    const top = rects[0]?.top ?? box.y;
    const flip = right + gap + width > window.innerWidth;
    setInto({
      index,
      outer: !asList && a.targets.length <= RING_TARGETS_MOST,
      left: flip ? Math.max(gap, left - gap - width) : right + gap,
      top: Math.min(Math.max(top, gap), window.innerHeight - (a.targets.length + 1) * size - gap),
      flip,
    });
    const first = a.targets.findIndex((t) => !t.disabled && !t.current);
    setAimed(Math.max(0, first));
    setArmed(null);
  };
  /** Opens More's own ring, or goes back to the first one with focus on More. */
  const openMore = (open: boolean) => {
    stopHold();
    setArmed(null);
    setInto(null);
    setInMore(open);
    setFocused(open ? 0 : Math.max(0, pageActions(actions).first.findIndex((p) => p.action.id === RING_MORE_ID)));
  };
  const comeBack = () => {
    stopHold();
    setArmed(null);
    setInto(null);
  };

  /** A press or click on an action: ask, go into its targets, start its hold, or do it. */
  const chooseAction = (index: number) => {
    const a = list[index]!;
    if (a.id === RING_MORE_ID) {
      openMore(true);
      return;
    }
    if (a.disabled) {
      if (onAsk) close(() => onAsk(a.id));
      return;
    }
    if (a.targets?.length) goInto(index);
    else if (needsHold(a)) press(a);
    else commit(a);
  };
  const chooseTarget = (t: RingTarget) => {
    if (!opened || t.disabled || t.current) return;
    if (needsHold(opened)) press(opened, t);
    else commit(opened, t);
  };

  const onKey = (e: KeyboardEvent) => {
    const inside = Boolean(into);
    const count = inside ? targets.length : list.length;
    const at = inside ? aimed : focused;
    const go = (to: number) => {
      const n = ((to % count) + count) % count;
      stopHold();
      setArmed(null);
      if (inside) setAimed(n);
      else setFocused(n);
    };
    const back = inside || asList ? ['ArrowUp'] : ['ArrowLeft', 'ArrowUp'];
    const next = inside || asList ? ['ArrowDown'] : ['ArrowRight', 'ArrowDown'];
    const here = list[focused];
    if (e.key === 'Escape') {
      if (inside) comeBack();
      else if (inMore) openMore(false);
      else close();
    } else if (e.key === 'Enter' || e.key === ' ') {
      // Handled here, not by the button's own click, so a held key is a hold and not a click.
      if (!e.repeat) {
        if (inside) chooseTarget(targets[aimed]!);
        else chooseAction(focused);
      }
    } else if (inside && e.key === 'ArrowLeft') comeBack();
    else if (!inside && e.key === 'ArrowRight' && here?.targets?.length && !here.disabled) goInto(focused);
    else if (next.includes(e.key) || (e.key === 'Tab' && !e.shiftKey)) go(at + 1);
    else if (back.includes(e.key) || (e.key === 'Tab' && e.shiftKey)) go(at - 1);
    else if (e.key === 'Home') go(0);
    else if (/^[1-8]$/.test(e.key)) {
      // A number picks a direction, clockwise from the top (1 is up); in a list or the targets, the nth.
      const n = Number(e.key) - 1;
      const hit = inside || !placed.every((p) => p.slot) ? n : placed.findIndex((p) => p.slot === RING_SLOTS[n]);
      if (hit < 0 || hit >= count) return;
      go(hit);
    }
    else if (e.key === 'End') go(count - 1);
    else if (e.key.length === 1 && /\S/.test(e.key)) {
      const names = inside ? targets.map((t) => t.label) : list.map((a) => a.label);
      const starts = (s: string) => s.toLowerCase().startsWith(e.key.toLowerCase());
      const from = names.findIndex((s, i) => i > at && starts(s));
      const hit = from >= 0 ? from : names.findIndex(starts);
      if (hit < 0) return;
      go(hit);
    } else return;
    e.preventDefault();
    e.stopPropagation();
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') stopHold();
  };

  /** Pointer handlers for something held to confirm; a click on it only counts when presses replace the hold. */
  const holdable = (a: RingAction, t: RingTarget | undefined, can: boolean, focusOn: () => HTMLElement | null | undefined) =>
    can
      ? {
          onPointerDown: (e: PointerEvent) => {
            if (e.button > 0 || still()) return;
            // Focus first, so moving focus here doesn't cancel the hold that starts now.
            focusOn()?.focus();
            press(a, t);
          },
          onPointerUp: stopHold,
          onPointerLeave: stopHold,
          onPointerCancel: stopHold,
        }
      : {};

  // Where the ring sits: centred where it was opened (or on the thing, from the keyboard), kept on screen
  // with room for the outer ring of targets, so every verb keeps its direction.
  const el = menu.current ?? document.documentElement;
  const gap = num(el, '--ring-gap', 20);
  const size = num(el, '--ring-button', 44);
  const hub = num(el, '--ring-hub', 44);
  const outer = num(el, '--ring-outer', 120);
  const band = num(el, '--ring-band', 44);
  const seam = num(el, '--ring-seam', 2);
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // Room for the outer ring and the names beside it, so a target is never cut off by the edge.
  const reach = outer + seam * 2 + band + gap + size;
  const clampTo = (v: number, most: number) => (most < reach * 2 ? most / 2 : Math.min(Math.max(v, reach), most - reach));
  const cx0 = clampTo(point?.x ?? box.x + box.width / 2, vw);
  const cy0 = clampTo(point?.y ?? box.y + box.height / 2, vh);
  const slotted = placed.every((p) => p.slot);
  /** How wide each wedge is, and the angle each action sits at: the first at the top, clockwise. */
  const span = slotted ? Math.PI / 4 : (2 * Math.PI) / Math.max(1, list.length);
  const angles = placed.map((p, i) => -Math.PI / 2 + (p.slot ? RING_SLOTS.indexOf(p.slot) : i) * span);
  /** The slots no action takes: drawn empty, so the ring stays whole and every direction keeps its place. */
  const empty = slotted ? RING_SLOTS.filter((s) => !placed.some((p) => p.slot === s)).map((s) => -Math.PI / 2 + RING_SLOTS.indexOf(s) * span) : [];
  const mid = (hub + outer) / 2;
  const ringOut = Boolean(opened && into?.outer);
  /** The angle each target sits at on the outer ring: a fan centred on its action's direction. */
  const fan = ringOut ? Math.min(Math.PI / 6, (Math.PI * 5) / 6 / Math.max(1, targets.length)) : 0;
  const targetAngles = ringOut ? targets.map((_, j) => angles[into!.index]! + (j - (targets.length - 1) / 2) * fan) : [];
  const pid = `quill-ring-${id.replace(/[^\w-]/g, '')}`;
  const half = outer + seam * 2 + band;

  const listAt: CSSProperties = {
    left: px(Math.min(box.x + box.width + gap, vw - 320 - gap)),
    top: px(Math.min(Math.max(box.y, gap), vh - list.length * size - gap * 2)),
  };
  // One readout, under the ring or the list: where you are, then what the focused choice would change.
  const below = asList ? Math.min(Math.max(box.y, gap), vh - list.length * size - gap * 2) + list.length * size + gap : cy0 + (ringOut ? half : outer) + gap;
  const readAt: CSSProperties = asList
    ? { left: listAt.left, top: px(Math.min(below, vh - size * 2 - gap)) }
    : { left: px(cx0), top: px(Math.min(below, vh - size * 2 - gap)), transform: 'translateX(-50%)' };

  // What the readout says, and so what is read out.
  const aimedAt = opened ? targets[aimed] : undefined;
  const now = opened ?? list[focused];
  let consequence: string | undefined;
  let hint: string | undefined;
  if (now) {
    if (now.disabled) {
      if (onAsk) hint = now.owner ? `Press Enter to ask ${now.owner}` : 'Press Enter to ask for it';
    } else if (!opened || (aimedAt && !aimedAt.disabled && !aimedAt.current)) {
      consequence = previewOf(now, aimedAt?.id);
      if (needsHold(now) && (opened || !now.targets?.length)) {
        const k = keyOf(now, aimedAt);
        hint = still() ? (armed === k ? `Press Enter again to ${verb(now.label)}` : `Press Enter twice to ${verb(now.label)}`) : `Hold Enter to ${verb(now.label)}`;
      }
    }
  }
  if (inMore && !hint) hint = 'Esc goes back';
  /** Where you are, in words: the thing, the verb, the place. Read out already, so only drawn. */
  const trail = now && now.id !== RING_MORE_ID ? [label, now.label, ...(aimedAt ? [aimedAt.label] : [])] : [label];
  const why = now?.disabled ? [now.reason && (/[.!?]$/.test(now.reason) ? now.reason : `${now.reason}.`), now.owner ? `${now.owner} can change this.` : undefined].filter(Boolean).join(' ') : aimedAt?.current ? 'Where it is now' : aimedAt?.disabled ? aimedAt.reason : undefined;

  /** A wedge from radius r1 to r2, centred on angle a, w wide, a seam short at each side. */
  const wedge = (a: number, w: number, r1: number, r2: number) => {
    const o = half;
    const cut1 = Math.min(w / 4, seam / r1);
    const cut2 = Math.min(w / 4, seam / r2);
    const at = (r: number, t: number) => `${(o + r * Math.cos(t)).toFixed(2)} ${(o + r * Math.sin(t)).toFixed(2)}`;
    const big = w > Math.PI ? 1 : 0;
    if (w >= 2 * Math.PI - 1e-6) return `M${at(r2, a)}A${r2} ${r2} 0 1 1 ${at(r2, a + Math.PI)}A${r2} ${r2} 0 1 1 ${at(r2, a)}ZM${at(r1, a)}A${r1} ${r1} 0 1 0 ${at(r1, a + Math.PI)}A${r1} ${r1} 0 1 0 ${at(r1, a)}Z`;
    return `M${at(r1, a - w / 2 + cut1)}L${at(r2, a - w / 2 + cut2)}A${r2} ${r2} 0 ${big} 1 ${at(r2, a + w / 2 - cut2)}L${at(r1, a + w / 2 - cut1)}A${r1} ${r1} 0 ${big} 0 ${at(r1, a - w / 2 + cut1)}Z`;
  };
  const holdingAction = holding ? list.find((a) => holding === a.id || holding.startsWith(`${a.id}\u0000`)) : undefined;
  /** Held (or armed, with reduced motion) and touching other things: the decision is letterboxed until it is let go (D9). */
  const lettered = Boolean(now && touches.length && (holding === keyOf(now, aimedAt) || armed === keyOf(now, aimedAt)));
  // Where the leads start: the subject's edge nearest each thing it touches.
  const subjectMid = { x: box.x + box.width / 2, y: box.y + box.height / 2 };

  return createPortal(
    <>
      <div
        ref={menu}
        className="quill-ring"
        data-shape={asList ? 'list' : 'ring'}
        data-page={paged ? (inMore ? 'more' : 'first') : undefined}
        data-leaving={leaving ? '' : undefined}
        role="menu"
        aria-label={inMore ? `More actions for ${label}` : `Actions for ${label}`}
        aria-orientation={asList ? 'vertical' : undefined}
        onKeyDown={onKey}
        onKeyUp={onKeyUp}
        onContextMenu={(e) => {
          e.preventDefault();
          close();
        }}
      >
        <div
          className="quill-ring-subject"
          aria-hidden="true"
          style={{ left: px(box.x), top: px(box.y), width: px(box.width), height: px(box.height) }}
        />
        {seen.length ? (
          <svg className="quill-ring-leads" aria-hidden="true" width={vw} height={vh} viewBox={`0 0 ${vw} ${vh}`}>
            {seen.map(({ touch, box: b }) => {
              const from = nearest(box, b.x + b.width / 2, b.y + b.height / 2);
              const to = nearest(b, subjectMid.x, subjectMid.y);
              return <line key={touch.id} className="quill-ring-lead" data-danger={now?.danger ? '' : undefined} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
            })}
          </svg>
        ) : null}
        {seen.map(({ touch, box: b }) => (
          <div
            key={touch.id}
            className="quill-ring-touch"
            data-danger={now?.danger ? '' : undefined}
            aria-hidden="true"
            style={{ left: px(b.x), top: px(b.y), width: px(b.width), height: px(b.height) }}
          >
            <span className="quill-ring-touch-effect">{touch.effect}</span>
          </div>
        ))}
        {asList ? null : (
          <svg
            className="quill-ring-disc"
            aria-hidden="true"
            width={half * 2}
            height={half * 2}
            viewBox={`0 0 ${half * 2} ${half * 2}`}
            style={{ left: px(cx0 - half), top: px(cy0 - half) }}
          >
            <defs>
              <pattern id={`${pid}-off`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect className="quill-ring-off-ground" width="6" height="6" />
                <line className="quill-ring-off-line" x1="0" y1="0" x2="0" y2="6" />
              </pattern>
            </defs>
            {empty.map((a) => (
              <path key={`empty-${a}`} className="quill-ring-wedge" data-empty="" d={wedge(a, span, hub, outer)} />
            ))}
            {placed.map(({ action: a }, i) => {
              const commits = !a.disabled && !a.targets?.length && needsHold(a);
              const k = keyOf(a);
              return (
                <path
                  key={a.id}
                  className="quill-ring-wedge"
                  d={wedge(angles[i]!, span, hub, outer)}
                  style={a.disabled ? { fill: `url(#${pid}-off)` } : undefined}
                  data-focus={(!into && i === focused) || into?.index === i ? '' : undefined}
                  data-path={into?.index === i ? '' : undefined}
                  data-danger={a.danger ? '' : undefined}
                  data-off={a.disabled ? '' : undefined}
                  data-armed={armed === k ? '' : undefined}
                  onPointerEnter={() => {
                    if (!into || into.index !== i) items.current[i]?.focus();
                  }}
                  {...holdable(a, undefined, commits, () => items.current[i])}
                  onClick={() => {
                    if (commits && !still()) return;
                    items.current[i]?.focus();
                    setFocused(i);
                    chooseAction(i);
                  }}
                />
              );
            })}
            {targetAngles.map((a, j) => {
              const t = targets[j]!;
              const blocked = t.disabled || t.current;
              const k = keyOf(opened!, t);
              return (
                <path
                  key={t.id}
                  className="quill-ring-wedge"
                  data-target=""
                  d={wedge(a, fan, outer + seam * 2, half)}
                  style={t.disabled ? { fill: `url(#${pid}-off)` } : undefined}
                  data-focus={j === aimed ? '' : undefined}
                  data-current={t.current ? '' : undefined}
                  data-off={t.disabled ? '' : undefined}
                  data-danger={opened!.danger ? '' : undefined}
                  data-armed={armed === k ? '' : undefined}
                  onPointerEnter={() => places.current[j]?.focus()}
                  {...holdable(opened!, t, !blocked && needsHold(opened!), () => places.current[j])}
                  onClick={() => {
                    if (!blocked && needsHold(opened!) && !still()) return;
                    setAimed(j);
                    chooseTarget(t);
                  }}
                />
              );
            })}
            <circle className="quill-ring-hub" cx={half} cy={half} r={hub - seam * 2} onClick={() => close()} />
            {holdingAction ? <circle key={holding} className="quill-ring-hold" cx={half} cy={half} r={hub - seam * 4} pathLength={1} /> : null}
          </svg>
        )}
        {asList ? null : (
          <span className="quill-ring-cancel" aria-hidden="true" style={{ left: px(cx0), top: px(cy0) }}>
            {holdingAction ? 'Hold' : 'Cancel'}
          </span>
        )}
        <div className={asList ? 'quill-ring-list' : 'quill-ring-items'} style={asList ? listAt : undefined}>
          {placed.map(({ action: a, slot }, i) => {
            const angle = angles[i]!;
            const style = asList ? undefined : ({ left: px(cx0 + mid * Math.cos(angle)), top: px(cy0 + mid * Math.sin(angle)) } as CSSProperties);
            const why = a.disabled && (a.reason || a.owner) ? `${id}-why-${a.id}` : undefined;
            const commits = !a.disabled && !a.targets?.length && needsHold(a);
            const k = keyOf(a);
            return (
              <button
                key={a.id}
                ref={(b) => void (items.current[i] = b)}
                type="button"
                role="menuitem"
                tabIndex={!into && i === focused ? 0 : -1}
                className={cx('quill-ring-item', a.danger ? 'quill-ring-danger' : undefined)}
                data-slot={slot}
                data-path={into?.index === i ? '' : undefined}
                data-holding={holding === k ? '' : undefined}
                data-armed={armed === k ? '' : undefined}
                aria-disabled={a.disabled || undefined}
                aria-describedby={why}
                aria-expanded={Boolean(a.targets?.length) && !a.disabled ? into?.index === i : undefined}
                aria-haspopup={a.id === RING_MORE_ID ? 'menu' : undefined}
                data-more={a.id === RING_MORE_ID ? '' : undefined}
                style={style}
                onFocus={() => {
                  if (into && into.index !== i) comeBack();
                  if (focused !== i) {
                    stopHold();
                    setArmed(null);
                  }
                  setFocused(i);
                }}
                {...holdable(a, undefined, commits, () => items.current[i])}
                onClick={() => {
                  if (commits && !still()) return;
                  setFocused(i);
                  chooseAction(i);
                }}
              >
                <span className="quill-ring-button">
                  <Icon name={a.disabled && !asList ? 'lock' : a.icon} size={18} />
                </span>
                <span className="quill-ring-name">
                  <span className="quill-ring-label">{a.label}</span>
                  {why ? (
                    <span id={why} className="quill-ring-why">
                      {a.reason ? <span>{a.reason}</span> : null}
                      {a.owner ? <span className="quill-ring-owner">{`${a.owner} can change this.`}</span> : null}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
        {opened && into ? (
          <div
            className="quill-ring-targets"
            role="group"
            aria-label={opened.label}
            data-shape={into.outer ? 'ring' : 'list'}
            data-flip={into.flip ? '' : undefined}
            style={into.outer ? undefined : { left: px(into.left), top: px(into.top) }}
          >
            {targets.map((t, j) => {
              const blocked = t.disabled || t.current;
              const why = t.current || (t.disabled && t.reason) ? `${id}-at-${t.id}` : undefined;
              const k = keyOf(opened, t);
              const a = targetAngles[j];
              const r = half + gap / 2;
              const style: CSSProperties | undefined =
                a === undefined ? undefined : { left: px(cx0 + r * Math.cos(a)), top: px(cy0 + r * Math.sin(a)) };
              const side = a === undefined ? undefined : Math.abs(Math.cos(a)) < 0.3 ? (Math.sin(a) < 0 ? 'top' : 'bottom') : Math.cos(a) > 0 ? 'right' : 'left';
              return (
                <button
                  key={t.id}
                  ref={(b) => void (places.current[j] = b)}
                  type="button"
                  role="menuitem"
                  tabIndex={j === aimed ? 0 : -1}
                  className="quill-ring-target"
                  data-side={side}
                  data-holding={holding === k ? '' : undefined}
                  data-armed={armed === k ? '' : undefined}
                  aria-disabled={blocked || undefined}
                  aria-current={t.current || undefined}
                  aria-describedby={why}
                  style={style}
                  onFocus={() => {
                    if (aimed !== j) {
                      stopHold();
                      setArmed(null);
                    }
                    setAimed(j);
                  }}
                  {...holdable(opened, t, !blocked && needsHold(opened), () => places.current[j])}
                  onClick={() => {
                    if (!blocked && needsHold(opened) && !still()) return;
                    setAimed(j);
                    chooseTarget(t);
                  }}
                >
                  <span className="quill-ring-label">
                    {t.disabled && into.outer ? <Icon name="lock" size={14} /> : null}
                    {t.label}
                  </span>
                  {t.detail ? <span className="quill-ring-detail">{t.detail}</span> : null}
                  {why ? (
                    <span id={why} className="quill-ring-why">
                      {t.current ? 'Where it is now' : t.reason}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      <div className="quill-ring-readout" data-leaving={leaving ? '' : undefined} style={readAt}>
        <span className="quill-ring-trail" aria-hidden="true">
          {trail.map((part, n) => (
            <span key={n}>{part}</span>
          ))}
        </span>
        {why ? (
          <span className="quill-ring-said" aria-hidden="true">
            {why}
          </span>
        ) : null}
        <span className="quill-ring-status" role="status" aria-live="polite">
          {consequence ? <span className="quill-ring-consequence">{consequence}</span> : null}
          {touches.length ? (
            <span className="quill-ring-touches" data-danger={now?.danger ? '' : undefined}>
              {touches.map((t) => (
                <span key={t.id} className="quill-ring-touched">
                  <span>{t.label}</span>
                  <span className="quill-ring-effect">{`: ${t.effect}`}</span>
                </span>
              ))}
            </span>
          ) : null}
          {hint ? <span className="quill-ring-hint">{hint}</span> : null}
        </span>
      </div>
      {now ? (
        <Letterbox
          passive
          open={lettered}
          heading={`${now.label} ${label}${aimedAt ? ` · ${aimedAt.label}` : ''}`}
          {...(consequence ? { summary: consequence } : {})}
          bars={{
            top: <span>{trail.join(' \u203a ')}</span>,
            bottom: (
              <span>
                {[`${touches.length} ${touches.length === 1 ? 'thing' : 'things'} ${now.danger ? 'break' : 'change'}`, still() ? `Press Enter again to ${verb(now.label)}, Esc to cancel` : 'Let go to cancel', now.undo].filter(Boolean).join(' · ')}
              </span>
            ),
          }}
        >
          <ul className="quill-ring-letterbox-list" data-danger={now.danger ? '' : undefined}>
            {touches.map((t) => (
              <li key={t.id}>
                <span>{t.label}</span>
                <span className="quill-ring-effect">{t.effect}</span>
              </li>
            ))}
          </ul>
          {holding ? <span key={holding} className="quill-ring-letterbox-fill" /> : null}
        </Letterbox>
      ) : null}
    </>,
    document.body,
  );
}
