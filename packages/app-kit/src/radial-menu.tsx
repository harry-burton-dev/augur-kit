import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx, Icon, ms, type IconName } from '@augur/kit-common';
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
}

/** How the actions are laid out. */
export type RingShape =
  /** Round the subject: a tile gets a ring round its edge, a row a ring beside where it was opened. */
  | 'ring'
  /** A plain list beside the subject, for long lists or people who prefer one. */
  | 'list'
  /** A ring up to `RING_MOST` actions, a list past that (the default). */
  | 'auto';

/** Past this many a ring gets slow to scan and aim at, so `auto` turns it into a list. */
export const RING_MOST = 8;

/** What the menu is opened on. */
export interface RingSubject {
  /** What it is, read aloud and shown in the middle ("Policy & Guidance"). */
  label: string;
  actions: RingAction[];
  /** An action was chosen; `target` is the place chosen, for an action with targets. */
  onAction: (id: string, target?: string) => void;
  /** Someone chose an action that is unavailable: ask its owner to make it available. Without it, choosing one does nothing. */
  onAsk?: (id: string) => void;
}

interface Opened extends RingSubject {
  target: HTMLElement;
  /** Where the pointer was, when it was opened by a pointer. */
  point?: { x: number; y: number };
}

interface Ring {
  open: (subject: Opened) => void;
  shape: RingShape;
}

const RingContext = createContext<Ring | null>(null);

export interface RingProviderProps {
  shape?: RingShape;
  children: ReactNode;
}

/**
 * One radial menu for the whole app: whatever is opened with `useRingTarget`
 * or `RingMore` shows here. AppFrame puts one in; an app can put its own round
 * a part of the page to change its shape.
 */
export function RingProvider({ shape = 'auto', children }: RingProviderProps) {
  const [opened, setOpened] = useState<Opened | null>(null);
  const ring = useMemo<Ring>(() => ({ open: setOpened, shape }), [shape]);
  return (
    <RingContext.Provider value={ring}>
      {children}
      {opened ? <RadialMenu {...opened} shape={shape} onClose={() => setOpened(null)} /> : null}
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

export interface RadialMenuProps extends Opened {
  shape?: RingShape;
  onClose: () => void;
}

const px = (n: number) => `${Math.round(n)}px`;
const num = (el: Element, name: string, fallback: number) => parseFloat(getComputedStyle(el).getPropertyValue(name)) || fallback;
const still = () => typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/** "Delete" read inside a sentence: "Hold Enter to delete". A name in capitals stays as it is. */
const verb = (label: string) => (/^[A-Z][^A-Z]/.test(label) ? label[0]!.toLowerCase() + label.slice(1) : label);
const needsHold = (a: RingAction) => a.hold ?? a.danger ?? false;
const previewOf = (a: RingAction, target?: string) => (typeof a.preview === 'function' ? a.preview(target) : a.preview);

/** What is being held or armed: an action, or one of its targets. */
const keyOf = (a: RingAction, t?: RingTarget) => (t ? `${a.id}\u0000${t.id}` : a.id);

/**
 * The actions of one thing, in a ring round it (PDR-010). The rest of the app
 * racks out of focus and the thing itself stays sharp, ringed as selected, so
 * the menu never covers what it's about.
 *
 * Up to eight actions sit in eight fixed directions (`RingSlot`), so a verb is
 * always in the same place: an action's own slot, danger at the bottom, the
 * rest clockwise from the top. A row's arc and the list keep that order. Each
 * action's name sits outside the ring, away from the subject.
 *
 * An action that can't be done stays, dimmed, and can still be focused: its
 * reason and owner are read out, and choosing it asks the owner when the
 * subject takes `onAsk`. An action with targets opens them beside it. What an
 * action would change (`preview`) shows in one readout under the menu and is
 * read out politely. Danger, or anything marked `hold`, is held down to
 * confirm; with reduced motion it is pressed twice.
 *
 * Keys: arrows (or Tab) go round, Home and End jump, a letter jumps to the next
 * action starting with it, Enter or Space chooses, Esc closes. On an action
 * with targets, ArrowRight or Enter goes into them and ArrowLeft or Esc comes
 * back out. Focus goes back to the thing when it closes.
 */
export function RadialMenu({ label, actions, onAction, onAsk, target, point, shape = 'auto', onClose }: RadialMenuProps) {
  const placed = useMemo(() => placeActions(actions), [actions]);
  const list = useMemo(() => placed.map((p) => p.action), [placed]);
  const asList = shape === 'list' || (shape === 'auto' && list.length > RING_MOST);
  const [focused, setFocused] = useState(() => Math.max(0, list.findIndex((a) => !a.disabled)));
  /** The action whose targets are open, and where its list sits. */
  const [into, setInto] = useState<{ index: number; left: number; top: number; flip: boolean } | null>(null);
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
  useRack(true, { hole: box, returnTo: target });

  const opened = into ? list[into.index] : undefined;
  const targets = opened?.targets ?? [];

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
  }, [focused, aimed, into]);

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
      left: flip ? Math.max(gap, left - gap - width) : right + gap,
      top: Math.min(Math.max(top, gap), window.innerHeight - (a.targets.length + 1) * size - gap),
      flip,
    });
    const first = a.targets.findIndex((t) => !t.disabled && !t.current);
    setAimed(Math.max(0, first));
    setArmed(null);
  };
  const comeBack = () => {
    stopHold();
    setArmed(null);
    setInto(null);
  };

  /** A press or click on an action: ask, go into its targets, start its hold, or do it. */
  const chooseAction = (index: number) => {
    const a = list[index]!;
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
  const holdable = (a: RingAction, t: RingTarget | undefined, can: boolean) =>
    can
      ? {
          onPointerDown: (e: PointerEvent) => {
            if (e.button > 0 || still()) return;
            // Focus first, so moving focus here doesn't cancel the hold that starts now.
            (e.currentTarget as HTMLElement).focus();
            press(a, t);
          },
          onPointerUp: stopHold,
          onPointerLeave: stopHold,
          onPointerCancel: stopHold,
        }
      : {};

  // Where the ring sits. A tile (as tall as a button and more) gets a whole ring round its edge.
  // A row gets an arc beside its end, opening away from it, so the row and its words stay clear.
  const el = menu.current ?? document.documentElement;
  const gap = num(el, '--ring-gap', 20);
  const size = num(el, '--ring-button', 44);
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const tile = box.height >= size * 2.5 && box.width <= box.height * 2.5;
  const margin = size;
  let cx0: number;
  let cy0: number;
  let rx: number;
  let ry: number;
  /** The angles the actions sit at, the first at the top, clockwise. */
  let angles: number[];
  /** A row's arc: which side it opens to, the space between buttons and how far it bows. */
  let arc: { right: boolean; pitch: number; bow: number } | undefined;
  if (tile) {
    rx = box.width / 2 + gap + size / 2;
    ry = box.height / 2 + gap + size / 2;
    cx0 = Math.min(Math.max(box.x + box.width / 2, rx + margin), vw - rx - margin);
    cy0 = Math.min(Math.max(box.y + box.height / 2, ry + margin), vh - ry - margin);
    // Eight fixed directions, 45° apart, so each verb is always in the same place; past eight, spread by count.
    angles = placed.map((p, i) => -Math.PI / 2 + (p.slot ? RING_SLOTS.indexOf(p.slot) * (Math.PI / 4) : (i * 2 * Math.PI) / list.length));
  } else {
    // A shallow arc, like a C, of buttons a target apart, opening away from the row: it never
    // covers the row, and its names never run into each other.
    const pitch = size + gap / 2;
    const half = ((list.length - 1) * pitch) / 2;
    const bow = size / 2;
    const wide = box.width > vw / 3 && point;
    const edge = wide ? point.x : box.x + box.width;
    const right = edge + gap + size + margin * 4 < vw;
    rx = bow;
    ry = half;
    cx0 = right ? edge + gap + size / 2 : (wide ? edge : box.x) - gap - size / 2;
    cy0 = Math.min(Math.max(box.y + box.height / 2, half + margin), vh - half - margin);
    // Not angles here: a position along the arc from -1 (top) to 1 (bottom), turned into x and y below.
    angles = list.map((_, i) => (list.length > 1 ? -1 + (2 * i) / (list.length - 1) : 0));
    arc = { right, pitch, bow };
  }

  const listAt: CSSProperties = {
    left: px(Math.min(box.x + box.width + gap, vw - 320 - gap)),
    top: px(Math.min(Math.max(box.y, gap), vh - list.length * size - gap * 2)),
  };
  // One readout, under the ring or the list, for what the focused choice would change.
  const below = asList ? Math.min(Math.max(box.y, gap), vh - list.length * size - gap * 2) + list.length * size + gap : cy0 + ry + size / 2 + gap * 2;
  const readAt: CSSProperties = asList
    ? { left: listAt.left, top: px(Math.min(below, vh - size - gap)) }
    : { left: px(cx0), top: px(Math.min(below, vh - size - gap)), transform: 'translateX(-50%)' };

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

  return createPortal(
    <>
      <div
        ref={menu}
        className="quill-ring"
        data-shape={asList ? 'list' : 'ring'}
        data-leaving={leaving ? '' : undefined}
        role="menu"
        aria-label={`Actions for ${label}`}
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
        {asList || !tile ? null : (
          <div className="quill-ring-orbit" aria-hidden="true" style={{ left: px(cx0 - rx), top: px(cy0 - ry), width: px(rx * 2), height: px(ry * 2) }} />
        )}
        <div className={asList ? 'quill-ring-list' : 'quill-ring-items'} style={asList ? listAt : undefined}>
          {placed.map(({ action: a, slot }, i) => {
            const angle = angles[i]!;
            const x = arc ? cx0 + (arc.right ? 1 : -1) * arc.bow * (1 - angle * angle) : cx0 + rx * Math.cos(angle);
            const y = arc ? cy0 + angle * ry : cy0 + ry * Math.sin(angle);
            const side = arc ? (arc.right ? 'right' : 'left') : Math.abs(Math.cos(angle)) < 0.2 ? (Math.sin(angle) < 0 ? 'top' : 'bottom') : Math.cos(angle) > 0 ? 'right' : 'left';
            const style = asList ? undefined : ({ left: px(x), top: px(y), '--ring-delay': `calc(var(--motion-instant) * ${i} / 4)` } as CSSProperties);
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
                data-side={asList ? undefined : side}
                data-slot={slot}
                data-path={into?.index === i ? '' : undefined}
                data-holding={holding === k ? '' : undefined}
                data-armed={armed === k ? '' : undefined}
                aria-disabled={a.disabled || undefined}
                aria-describedby={why}
                aria-expanded={Boolean(a.targets?.length) && !a.disabled ? into?.index === i : undefined}
                style={style}
                onFocus={() => {
                  if (into && into.index !== i) comeBack();
                  if (focused !== i) {
                    stopHold();
                    setArmed(null);
                  }
                  setFocused(i);
                }}
                {...holdable(a, undefined, commits)}
                onClick={() => {
                  if (commits && !still()) return;
                  setFocused(i);
                  chooseAction(i);
                }}
              >
                <span className="quill-ring-button">
                  <Icon name={a.icon} size={18} />
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
            data-flip={into.flip ? '' : undefined}
            style={{ left: px(into.left), top: px(into.top) }}
          >
            {targets.map((t, j) => {
              const blocked = t.disabled || t.current;
              const why = t.current || (t.disabled && t.reason) ? `${id}-at-${t.id}` : undefined;
              const k = keyOf(opened, t);
              return (
                <button
                  key={t.id}
                  ref={(b) => void (places.current[j] = b)}
                  type="button"
                  role="menuitem"
                  tabIndex={j === aimed ? 0 : -1}
                  className="quill-ring-target"
                  data-holding={holding === k ? '' : undefined}
                  data-armed={armed === k ? '' : undefined}
                  aria-disabled={blocked || undefined}
                  aria-current={t.current || undefined}
                  aria-describedby={why}
                  onFocus={() => {
                    if (aimed !== j) {
                      stopHold();
                      setArmed(null);
                    }
                    setAimed(j);
                  }}
                  {...holdable(opened, t, !blocked && needsHold(opened))}
                  onClick={() => {
                    if (!blocked && needsHold(opened) && !still()) return;
                    setAimed(j);
                    chooseTarget(t);
                  }}
                >
                  <span className="quill-ring-label">{t.label}</span>
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
      <div className="quill-ring-readout" role="status" aria-live="polite" data-leaving={leaving ? '' : undefined} style={readAt}>
        {consequence ? <span className="quill-ring-consequence">{consequence}</span> : null}
        {hint ? <span className="quill-ring-hint">{hint}</span> : null}
      </div>
    </>,
    document.body,
  );
}
