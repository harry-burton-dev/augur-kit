import {
  createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState,
  type CSSProperties, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode,
} from 'react';
import { cx, Icon } from '@augur/kit-common';
import { reducedMotion, tokenValue } from './motion.js';

/*
 * The app bar (Navigation brief; it replaces Title and Orbit), in parts, the way a shell header is
 * built from its pieces:
 *
 *   <AppBar mode="desk">                      the bar: rests in one of four places, or docks as the rail
 *     <BarTile icon="work" name="Work" menu={  a tile; with `menu`, it opens a start menu
 *       <StartMenuItem … /> <StartMenuFolder …>…</StartMenuFolder> }/>
 *     <BarDivider />                          the hairline before what's open
 *   </AppBar>
 *
 *   <AppBar mode="app">                       docked as the side rail
 *     <RailBlock> <RailPair>…</RailPair> <BarTile kind="app" …/> </RailBlock>   never changes
 *     <RailPages> <BarTile kind="page" …/> </RailPages>                          the open app's pages
 *   </AppBar>
 *
 * Attention is light, not words: `lit` on each step that leads to the thing, `lead` on the first.
 * Icons are AUGUR icon names, drawn by Common's Icon, so the set can change in one place.
 */

/** Where the bar rests on the desktop: under the band, upper, lower or at the bottom. */
export type BarStop = 0 | 1 | 2 | 3;
const STOPS = ['under the band', 'upper', 'lower', 'bottom'] as const;

/** Where the bar rests: its stop, or with only the edges allowed, the nearer edge. */
export const restingStop = (stop: BarStop, edges: boolean): BarStop => (edges ? (stop < 2 ? 0 : 3) : stop);
const NARROW = 720;

interface Menu {
  owner: string;
  title?: string;
  content: ReactNode;
  focus: boolean;
}

interface BarState {
  mode: 'desk' | 'app';
  narrow: boolean;
  stop: BarStop;
  /** How many desktop tiles fit across the bar, for a More tile. */
  room: number;
  stack: Menu[];
  open(level: number, menu: Menu): void;
  close(from?: number, focusOwner?: boolean): void;
  say(text: string): void;
  hover(level: number, then: () => void): void;
}

const Bar = createContext<BarState | null>(null);
const Level = createContext(0);

/** The bar a part is in: its mode, how many tiles fit (for a More tile) and whether it's narrow. */
export function useAppBar() {
  const bar = useContext(Bar);
  return { mode: bar?.mode ?? 'desk', narrow: bar?.narrow ?? false, room: bar?.room ?? Infinity, stop: bar?.stop ?? 1 };
}

export interface AppBarProps {
  /** On the desktop it's a bar of tiles; with an app open it docks as the side rail. */
  mode?: 'desk' | 'app';
  /** What the bar is called to a screen reader; with an app open, say which. */
  label?: string;
  /**
   * The desktop holds an app (Home): the bar rests only at its edges, under the band or at the
   * bottom, like a taskbar, so it never sits across what the desktop shows. A middle stop rests at
   * the nearer edge.
   */
  edges?: boolean;
  /** Where the bar rests on the desktop. Uncontrolled from `defaultStop` when left out. */
  stop?: BarStop;
  defaultStop?: BarStop;
  onStop?(stop: BarStop): void;
  /** One line by the bar, the first time: what the tiles are. */
  hint?: string;
  onHintDone?(): void;
  children?: ReactNode;
}

/**
 * The bar itself. It sits in a positioned host (the shell): on the desktop it rests across it at one of
 * four places, moved by its grip; with an app open it glides to the left edge as the side rail, under
 * the band, `--bar-rail` wide. Changing `mode` fades the tiles out, moves the bar, and fades the new
 * ones in. It holds the start menus its tiles open.
 */
export function AppBar({ mode = 'desk', label, edges = false, stop: stopProp, defaultStop = 1, onStop, hint, onHintDone, children }: AppBarProps) {
  const bar = useRef<HTMLElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const [ownStop, setOwnStop] = useState<BarStop>(defaultStop);
  const stop = restingStop(stopProp ?? ownStop, edges);
  const allowed: BarStop[] = edges ? [0, 3] : [0, 1, 2, 3];
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [shown, setShown] = useState(mode);
  const frozen = useRef<ReactNode>(children);
  const [stack, setStack] = useState<Menu[]>([]);
  const [drag, setDrag] = useState<{ dy: number; y: number } | null>(null);
  const [said, setSaid] = useState('');
  const sayTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useLayoutEffect(() => {
    const host = bar.current?.offsetParent as HTMLElement | null;
    if (!host) return;
    const read = () => setSize({ w: host.clientWidth, h: host.clientHeight });
    read();
    if (typeof ResizeObserver !== 'function') return;
    const ro = new ResizeObserver(read);
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  // Desktop and app: the old tiles fade, the bar moves, the new ones come in.
  const swapping = mode !== shown;
  if (!swapping) frozen.current = children;
  useEffect(() => {
    if (!swapping) return;
    setStack([]);
    const t = setTimeout(() => setShown(mode), reducedMotion() ? 0 : tokenValue('motion-quick', 160));
    return () => clearTimeout(t);
  }, [swapping, mode]);

  const narrow = size.w > 0 && size.w < NARROW;
  const inApp = shown === 'app';
  const barH = tokenValue('bar-height', 88);
  const stopY = (i: number) => [tokenValue('band-top', 64), Math.round(size.h * 0.25 - barH / 2), Math.round(size.h * 0.75 - barH / 2), size.h - barH][i]!;
  const setStop = (i: number) => {
    const s = Math.max(0, Math.min(3, i)) as BarStop;
    setStack([]);
    setOwnStop(s);
    onStop?.(s);
  };
  const room = size.w ? Math.floor((size.w - tokenValue('bar-grip', 36)) / tokenValue(narrow ? 'bar-tile-narrow' : 'bar-tile', 112)) : Infinity;

  const close = useCallback((from = 0, focusOwner = false) => {
    setStack((s) => {
      const owner = s[from]?.owner;
      if (focusOwner && owner) requestAnimationFrame(() => (document.querySelector(`[data-bar-key="${owner}"]`) as HTMLElement | null)?.focus());
      return s.slice(0, from);
    });
  }, []);
  const state = useMemo<BarState>(
    () => ({
      mode: shown,
      narrow,
      stop,
      room,
      stack,
      open: (level, menu) => {
        if (hint) onHintDone?.();
        setStack((s) => [...s.slice(0, level), menu]);
      },
      close,
      say: (text) => {
        setSaid(text);
        clearTimeout(sayTimer.current);
        sayTimer.current = setTimeout(() => setSaid(''), tokenValue('motion-title', 2400) * 2.5);
      },
      // Pointing at a folder rolls it out, as the old Start menu did. It waits longer once one is out, so a slow hand can reach it.
      hover: (level, then) => {
        clearTimeout(hoverTimer.current);
        hoverTimer.current = setTimeout(then, stack.length > level + 1 ? tokenValue('motion-calm', 600) * 0.75 : tokenValue('motion-quick', 160));
      },
    }),
    [shown, narrow, stop, room, stack, close, hint, onHintDone],
  );
  useEffect(() => () => (clearTimeout(hoverTimer.current), clearTimeout(sayTimer.current)), []);

  // Menus close on a press anywhere else.
  useEffect(() => {
    if (!stack.length) return;
    const down = (e: PointerEvent) => {
      if (!(e.target as Element | null)?.closest?.('.aerie-bar-menu, .aerie-bar-tile')) close(0);
    };
    document.addEventListener('pointerdown', down);
    return () => document.removeEventListener('pointerdown', down);
  }, [stack.length, close]);

  // Each menu goes by what opened it: up or down from a desktop tile, out to the side from the rail or a folder.
  useLayoutEffect(() => {
    const host = bar.current?.offsetParent as HTMLElement | null;
    if (!host || !layer.current) return;
    const s = host.getBoundingClientRect();
    const top = tokenValue('band-top', 64);
    const gap = tokenValue('space-2', 8);
    [...layer.current.children].forEach((node, level) => {
      const el = node as HTMLElement;
      const m = stack[level];
      const owner = m && (host.querySelector(`[data-bar-key="${m.owner}"]`) as HTMLElement | null);
      if (!m || !owner) return;
      const r = owner.getBoundingClientRect();
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      let x: number;
      let y: number;
      if (level) {
        x = r.right - s.left;
        if (x + w > s.width - gap) x = Math.max(gap, r.left - s.left - w + gap * 5);
        y = r.top - s.top - gap;
        el.style.setProperty('--from', 'top left');
      } else if (inApp) {
        x = (bar.current?.getBoundingClientRect().right ?? r.right) - s.left;
        y = r.top - s.top;
        el.style.setProperty('--from', 'top left');
        el.style.setProperty('--rise', '0px');
      } else {
        x = r.left - s.left;
        const below = r.top - s.top < s.height / 2;
        y = below ? r.bottom - s.top : r.top - s.top - h;
        el.style.setProperty('--from', below ? 'top left' : 'bottom left');
        el.style.setProperty('--rise', `${below ? -gap * 0.75 : gap * 0.75}px`);
      }
      el.style.left = `${Math.max(gap, Math.min(x, s.width - w - gap))}px`;
      el.style.top = `${Math.max(top, Math.min(y, s.height - h - gap))}px`;
      if (m.focus && !el.contains(document.activeElement)) (el.querySelector('[role="menuitem"]') as HTMLElement | null)?.focus();
    });
  }, [stack, inApp]);

  // Along the bar, the arrow keys move between tiles.
  const along = (e: KeyboardEvent<HTMLElement>) => {
    const keys = inApp ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight'];
    const t = (e.target as Element).closest('.aerie-bar-tile');
    if (!t || !keys.includes(e.key)) return;
    const all = [...(bar.current?.querySelectorAll<HTMLElement>('.aerie-bar-tile') ?? [])];
    const at = all.indexOf(t as HTMLElement);
    e.preventDefault();
    all[(at + (e.key === keys[1] ? 1 : -1) + all.length) % all.length]?.focus();
  };

  // Moving the bar: drag on its rails, or the arrow keys on its grip.
  const gripKey = (e: KeyboardEvent) => {
    const at = allowed.indexOf(stop);
    const to = e.key === 'ArrowUp' ? allowed[Math.max(0, at - 1)]! : e.key === 'ArrowDown' ? allowed[Math.min(allowed.length - 1, at + 1)]! : e.key === 'Home' ? 0 : e.key === 'End' ? 3 : null;
    if (to === null) return;
    e.preventDefault();
    setStop(to);
  };
  const gripDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    setStack([]);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag({ dy: e.clientY - bar.current!.getBoundingClientRect().top, y: stopY(stop) });
  };
  const gripMove = (e: ReactPointerEvent) => {
    if (!drag) return;
    const s = (bar.current!.offsetParent as HTMLElement).getBoundingClientRect();
    setDrag({ ...drag, y: Math.max(stopY(0), Math.min(s.height - barH, e.clientY - s.top - drag.dy)) });
  };
  const gripUp = () => {
    if (!drag) return;
    let best: BarStop = 0;
    for (const i of allowed) if (Math.abs(stopY(i) - drag.y) < Math.abs(stopY(best) - drag.y)) best = i;
    setDrag(null);
    setStop(best);
  };

  const y = drag ? drag.y : stopY(stop);
  const gap = tokenValue('space-2', 8);

  return (
    <Bar.Provider value={state}>
      {drag ? (
        <div className="aerie-bar-rails" aria-hidden="true">
          {STOPS.map((name, i) => allowed.includes(i as BarStop) && (
            <i key={name} style={{ top: stopY(i) }}>
              <b>{name}</b>
            </i>
          ))}
        </div>
      ) : null}
      <nav
        ref={bar}
        className="aerie-bar"
        data-mode={shown}
        data-narrow={narrow ? '' : undefined}
        data-swapping={swapping ? '' : undefined}
        data-dragging={drag ? '' : undefined}
        data-stop={inApp ? undefined : stop}
        style={{ '--bar-y': `${y}px` } as CSSProperties}
        aria-label={label ?? 'App bar'}
      >
        {inApp ? null : (
          <button type="button" className="aerie-bar-grip" aria-label="Move the app bar. Up and down arrows move it between its places." onKeyDown={gripKey} onPointerDown={gripDown} onPointerMove={gripMove} onPointerUp={gripUp} onPointerCancel={gripUp}>
            <Icon name="grip" size={16} />
          </button>
        )}
        <span className="aerie-bar-sr" aria-live="polite">
          {inApp ? '' : `App bar: ${STOPS[stop]}`}
        </span>
        <div className="aerie-bar-tiles" onKeyDown={along}>
          {swapping ? frozen.current : children}
        </div>
      </nav>
      {hint && !inApp ? (
        <div className="aerie-bar-hint" style={stop >= 2 ? { bottom: size.h - y + gap } : { top: y + barH + gap }}>
          <p>{hint}</p>
          <button
            type="button"
            onClick={() => {
              onHintDone?.();
              (bar.current?.querySelector('.aerie-bar-tile') as HTMLElement | null)?.focus();
            }}
          >
            Got it
          </button>
        </div>
      ) : null}
      <div ref={layer} className="aerie-bar-menus">
        {stack.map((m, level) => (
          <Level.Provider key={`${level}-${m.owner}`} value={level}>
            <StartMenu title={level ? undefined : m.title} sub={level > 0}>
              {m.content}
            </StartMenu>
          </Level.Provider>
        ))}
      </div>
      <span className="aerie-bar-sr" aria-live="polite">
        {said}
      </span>
    </Bar.Provider>
  );
}

export interface BarTileProps {
  /** An AUGUR icon name. */
  icon: string;
  name: string;
  /**
   * What the tile is. `menu` opens a start menu (give `menu`); `app` is an open app in the rail's fixed
   * block; `page` is one of the open app's pages; `half` sits in a RailPair (Home, Apps).
   */
  kind?: 'menu' | 'app' | 'page' | 'half' | 'plain';
  /** The start menu it opens: StartMenuItems and StartMenuFolders. */
  menu?: ReactNode;
  /** The menu's heading. Defaults to the tile's name. */
  menuTitle?: string;
  /** You're here: a hard line on the bar's inner edge. */
  current?: boolean;
  /** An open app, on the desktop bar: it carries the hard line too. */
  running?: boolean;
  /** Something that needs you is through here. */
  lit?: boolean;
  /** …and it's the first thing that does: its light breathes. */
  lead?: boolean;
  /** The group of apps tile that holds all of them (one Apps folder): its icon is brighter. */
  start?: boolean;
  onPress?(): void;
}

/** A tile: one large icon with its name under it, filling the bar's height. With `menu`, it opens a start menu. */
export function BarTile({ icon, name, kind, menu, menuTitle, current, running, lit, lead, start, onPress }: BarTileProps) {
  const bar = useContext(Bar);
  const key = useId();
  const opens = menu !== undefined;
  const open = !!bar && bar.stack[0]?.owner === key;
  const show = (focus: boolean) => bar?.open(0, { owner: key, title: menuTitle ?? name, content: menu, focus });
  const words = [name, running ? 'open' : '', current ? 'you’re here' : '', lit ? 'needs your attention' : ''].filter(Boolean).join(', ');
  const openKey = bar?.mode === 'app' ? 'ArrowRight' : (bar?.stop ?? 1) < 2 ? 'ArrowDown' : 'ArrowUp';
  return (
    <button
      type="button"
      data-bar-key={key}
      className={cx('aerie-bar-tile', start && 'aerie-bar-start', running && 'aerie-bar-running', kind === 'app' && 'aerie-bar-side', kind === 'half' && 'aerie-bar-half', lit && 'aerie-bar-lit', lit && lead && 'aerie-bar-lead')}
      aria-haspopup={opens ? 'menu' : undefined}
      aria-expanded={opens ? open : undefined}
      aria-current={current ? 'page' : undefined}
      aria-label={words}
      onClick={() => {
        if (opens) {
          if (open) bar?.close(0);
          else show(false);
        }
        onPress?.();
      }}
      onKeyDown={(e) => {
        if (opens && (e.key === openKey || e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          show(true);
        }
      }}
    >
      <Icon name={icon} />
      <span>{name}</span>
    </button>
  );
}

/** The hairline between the desktop bar's groups and the apps that are open. */
export function BarDivider() {
  return <hr />;
}

export interface BarLogoProps {
  /** The deployment's mark, as an image URL. Empty draws the kit's placeholder mark. */
  src?: string;
  /** What it does, for the name under it and for screen readers, e.g. "Home". */
  name: string;
  /** You're on the desktop already. */
  current?: boolean;
  /** Something that needs you is on the desktop. */
  lit?: boolean;
  lead?: boolean;
  onPress?(): void;
}

/**
 * The logo button: the deployment's mark, the one way to the desktop. It starts the desktop bar, at
 * its left, and ends the side rail, at its bottom, so it's in the same corner of the eye from every app.
 */
export function BarLogo({ src, name, current, lit, lead, onPress }: BarLogoProps) {
  const words = [name, current ? 'you’re here' : '', lit ? 'needs your attention' : ''].filter(Boolean).join(', ');
  return (
    <button
      type="button"
      className={cx('aerie-bar-tile', 'aerie-bar-logo', lit && 'aerie-bar-lit', lit && lead && 'aerie-bar-lead')}
      aria-current={current ? 'page' : undefined}
      aria-label={words}
      onClick={() => onPress?.()}
    >
      {src ? <img src={src} alt="" /> : <Icon name="mark" />}
      <span>{name}</span>
    </button>
  );
}

/** The side rail's fixed block: Home and Apps, then what's open. It's the same in every app. */
export function RailBlock({ children }: { children?: ReactNode }) {
  return <div className="aerie-bar-fixed">{children}</div>;
}

/** Two half tiles side by side at the top of the rail (Home and Apps), or one alone. */
export function RailPair({ children }: { children?: ReactNode }) {
  const solo = Array.isArray(children) ? children.filter(Boolean).length < 2 : true;
  return (
    <div className="aerie-bar-pair" data-solo={solo ? '' : undefined}>
      {children}
    </div>
  );
}

/** The open app's pages, under the fixed block. They scroll if there are many. */
export function RailPages({ children }: { children?: ReactNode }) {
  return <div className="aerie-bar-pages">{children}</div>;
}

export interface StartMenuProps {
  /** The heading over the rows. A folder's menu has none. */
  title?: string;
  /** A folder rolled out from another menu. */
  sub?: boolean;
  children?: ReactNode;
}

/**
 * A start menu: solid, hairline-edged, words on every row. The bar opens and places these for its tiles;
 * use it alone only to show one.
 */
export function StartMenu({ title, sub, children }: StartMenuProps) {
  return (
    <div className={cx('aerie-bar-menu', sub && 'aerie-bar-sub')} role="menu" aria-label={title}>
      {title ? <h4 aria-hidden="true">{title}</h4> : null}
      {children}
    </div>
  );
}

/** The hairline between rows in a start menu. */
export function StartMenuDivider() {
  return <hr />;
}

interface RowProps {
  icon: string;
  name: string;
  /** What it's for, in a few words: the small print. */
  line?: string;
  lit?: boolean;
  lead?: boolean;
}

export interface StartMenuItemProps extends RowProps {
  /** Set when it can't open here, and why: it stays, greyed, with this as its small print. */
  off?: string;
  /** You're in it. */
  current?: boolean;
  onPress?(): void;
}

function useRow(kind: 'item' | 'folder') {
  const bar = useContext(Bar);
  const level = useContext(Level);
  const key = useId();
  const keys = (e: KeyboardEvent<HTMLButtonElement>, act: () => void) => {
    const rows = [...(e.currentTarget.closest('.aerie-bar-menu')?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];
    const at = rows.indexOf(e.currentTarget);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      rows[(at + (e.key === 'ArrowDown' ? 1 : -1) + rows.length) % rows.length]?.focus();
    } else if (e.key === 'ArrowRight' && kind === 'folder') {
      e.preventDefault();
      act();
    } else if ((e.key === 'ArrowLeft' || e.key === 'Escape') && level > 0) {
      e.preventDefault();
      bar?.close(level, true);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      bar?.close(0, true);
    } else if (e.key === 'Tab') bar?.close(0, true);
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      act();
    }
  };
  return { bar, level, key, keys };
}

/** A row in a start menu that opens something: an app, or an action such as Close. */
export function StartMenuItem({ icon, name, line, lit, lead, off, current, onPress }: StartMenuItemProps) {
  const { bar, level, key, keys } = useRow('item');
  const act = () => {
    if (off) return bar?.say(`${name}. ${off}`);
    bar?.close(0);
    onPress?.();
  };
  const on = lit && !off;
  return (
    <button
      type="button"
      role="menuitem"
      data-bar-key={key}
      className={cx(on && 'aerie-bar-lit', on && lead && 'aerie-bar-lead')}
      aria-disabled={off ? true : undefined}
      aria-current={current ? 'page' : undefined}
      onClick={act}
      onKeyDown={(e) => keys(e, act)}
      onPointerOver={(e) => e.pointerType !== 'touch' && bar?.hover(level, () => bar.close(level + 1))}
    >
      <Icon name={icon} />
      <span className="aerie-bar-row">
        {name}
        {(off ?? line) ? <small>{off ?? line}</small> : null}
        {on ? <span className="aerie-bar-sr">, needs your attention</span> : null}
      </span>
      <span />
    </button>
  );
}

export interface StartMenuFolderProps extends RowProps {
  /** What rolls out to the side: more StartMenuItems and StartMenuFolders. */
  children?: ReactNode;
}

/** A folder in a start menu: it rolls out to the side when you point at it, press it, or press the right arrow. */
export function StartMenuFolder({ icon = 'folder', name, line, lit, lead, children }: Partial<Pick<RowProps, 'icon'>> & Omit<StartMenuFolderProps, 'icon'>) {
  const { bar, level, key, keys } = useRow('folder');
  const open = !!bar && bar.stack[level + 1]?.owner === key;
  const roll = (focus: boolean) => bar?.open(level + 1, { owner: key, content: children, focus });
  return (
    <button
      type="button"
      role="menuitem"
      data-bar-key={key}
      className={cx(lit && 'aerie-bar-lit', lit && lead && 'aerie-bar-lead')}
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={() => roll(false)}
      onKeyDown={(e) => keys(e, () => roll(true))}
      onPointerOver={(e) => e.pointerType !== 'touch' && bar?.hover(level, () => !open && roll(false))}
    >
      <Icon name={icon} />
      <span className="aerie-bar-row">
        {name}
        {line ? <small>{line}</small> : null}
        {lit ? <span className="aerie-bar-sr">, needs your attention</span> : null}
      </span>
      <Icon name="chevron-right" size={16} className="aerie-bar-chev" />
    </button>
  );
}
