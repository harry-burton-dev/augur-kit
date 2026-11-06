import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { cx, Icon } from '@augur/kit-common';
import { reducedMotion, tokenValue } from './motion.js';

/** An app the bar can open. */
export interface BarApp {
  id: string;
  name: string;
  /** One of AUGUR's icon names. */
  icon: string;
  /** What it's for, in a few words: the small print in a start menu. */
  line?: string;
  /** Set when it can't open here, and why: it stays in its menu, greyed, with this as its small print. */
  off?: string;
}

/** A group of apps: a tile on the desktop's bar, and a folder in the Apps menu. */
export interface BarGroup {
  id: string;
  name: string;
  icon: string;
  line?: string;
  apps: BarApp[];
}

/** One of the open app's own pages: a tile in the side rail, under the fixed block. */
export interface BarPage {
  id: string;
  name: string;
  icon: string;
}

/** Something that needs you, on this floor: the app it's in and the pages down to it. The first one leads. */
export interface BarLight {
  app: string;
  path?: string[];
}

/** Where the bar rests on the desktop: under the band, upper, lower or at the bottom. */
export type BarStop = 0 | 1 | 2 | 3;

export interface AppBarProps {
  /** The groups of apps, in order. With a single app and no more, the bar holds only that app. */
  groups: BarGroup[];
  /** Groups as tiles of their own, or one Apps tile holding them all as folders. */
  holds?: 'groups' | 'folder';
  /** The apps that are open, in the order they opened. */
  running?: string[];
  /** On the desktop it's a bar of tiles; with an app open it docks as the side rail. */
  mode?: 'desk' | 'app';
  /** The open app you're in, when `mode` is app. */
  app?: string;
  /** The open app's pages, and the one you're on. */
  pages?: BarPage[];
  page?: string;
  /** What needs you on this floor. Light rises from each step that leads to it; only the first breathes. */
  light?: BarLight[];
  /** Where the bar rests on the desktop. Uncontrolled from `defaultStop` when left out. */
  stop?: BarStop;
  defaultStop?: BarStop;
  onStop?(stop: BarStop): void;
  /** One line by the bar, the first time: what the tiles are. */
  hint?: string;
  onHintDone?(): void;
  onOpen?(app: string): void;
  onHome?(): void;
  onPage?(page: string): void;
  onClose?(app: string): void;
}

const STOPS = ['under the band', 'upper', 'lower', 'bottom'] as const;
const NARROW = 720;

type Tile =
  | { kind: 'menu'; id: string; name: string; icon: string; lit: boolean; lead: boolean; start?: boolean }
  | { kind: 'open'; id: string; name: string; icon: string; lit: boolean; lead: boolean; current: boolean; running: boolean; side?: boolean }
  | { kind: 'home'; id: string; name: string; icon: string }
  | { kind: 'page'; id: string; name: string; icon: string; lit: boolean; lead: boolean; current: boolean };

type Item =
  | { kind: 'app'; app: BarApp; lit: boolean; lead: boolean; current: boolean; running: boolean }
  | { kind: 'folder'; group: BarGroup; lit: boolean; lead: boolean }
  | { kind: 'close'; app: BarApp }
  | { kind: 'hr' };

interface Menu {
  title: string;
  items: Item[];
  /** The tile or row that opened it, by its data-key. */
  owner: string;
  focus: boolean;
}

/**
 * The app bar (Navigation brief; it replaces Title and Orbit). On the desktop it's one bar of large
 * tiles across the screen, each opening a start menu, and it rests in one of four places. When an app
 * opens, the same bar glides to the left edge and docks as the side rail: Home and Apps, then what's
 * open, never changing, and under them the open app's pages. Attention is light, not words.
 *
 * It sits in a positioned host (the shell), which gives it the screen's size and moves its stage
 * aside by `--bar-rail` while an app is open.
 */
export function AppBar({
  groups, holds = 'groups', running = [], mode = 'desk', app, pages = [], page, light = [],
  stop: stopProp, defaultStop = 1, onStop, hint, onHintDone, onOpen, onHome, onPage, onClose,
}: AppBarProps) {
  const bar = useRef<HTMLElement>(null);
  const menusRef = useRef<HTMLDivElement>(null);
  const [ownStop, setOwnStop] = useState<BarStop>(defaultStop);
  const stop = stopProp ?? ownStop;
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [shown, setShown] = useState(mode);
  const [swapping, setSwapping] = useState(false);
  const [stack, setStack] = useState<Menu[]>([]);
  const [drag, setDrag] = useState<{ dy: number; y: number } | null>(null);
  const [said, setSaid] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // The host's size: where the stops are, and how many tiles fit.
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

  // Desktop and app: the tiles fade, the bar moves, and the new tiles come in.
  useEffect(() => {
    if (mode === shown) return;
    setStack([]);
    if (reducedMotion()) {
      setShown(mode);
      return;
    }
    setSwapping(true);
    const t = setTimeout(() => {
      setShown(mode);
      setSwapping(false);
    }, tokenValue('motion-quick', 160));
    return () => clearTimeout(t);
  }, [mode, shown]);

  const narrow = size.w > 0 && size.w < NARROW;
  const barH = tokenValue('bar-height', 88);
  const stopY = (i: number) => [tokenValue('band-top', 64), Math.round(size.h * 0.25 - barH / 2), Math.round(size.h * 0.75 - barH / 2), size.h - barH][i]!;
  const setStop = (i: number) => {
    const s = Math.max(0, Math.min(3, i)) as BarStop;
    setStack([]);
    setOwnStop(s);
    onStop?.(s);
  };

  // Light: what leads to something that needs you.
  const lit = (a: string, path: string[] = []) => light.some((l) => l.app === a && path.every((p, i) => l.path?.[i] === p));
  const leads = (a: string, path: string[] = []) => !!light[0] && light[0].app === a && path.every((p, i) => light[0]!.path?.[i] === p);
  const litGroup = (g: BarGroup) => g.apps.some((a) => !a.off && lit(a.id));
  const leadGroup = (g: BarGroup) => g.apps.some((a) => leads(a.id));
  const apps = groups.flatMap((g) => g.apps);
  const appOf = (id?: string) => apps.find((a) => a.id === id);
  const solo = apps.length === 1;
  const inApp = shown === 'app';

  const openTile = (id: string, side?: boolean): Tile | null => {
    const a = appOf(id);
    return a ? { kind: 'open', id, name: a.name, icon: a.icon, lit: lit(id), lead: leads(id), current: inApp && app === id, running: running.includes(id), side } : null;
  };
  const opens = running.map((id) => openTile(id)).filter((t): t is Tile => !!t);

  const tiles = (): (Tile | 'hr')[] => {
    if (solo) return [openTile(apps[0]!.id)!];
    const tileW = tokenValue(narrow ? 'bar-tile-narrow' : 'bar-tile', 112);
    const room = Math.floor((size.w - tokenValue('bar-grip', 36)) / tileW) - opens.length;
    let heads: Tile[];
    if (holds === 'folder') heads = [{ kind: 'menu', id: 'start', name: 'Apps', icon: 'apps', start: true, lit: groups.some(litGroup), lead: groups.some(leadGroup) }];
    else {
      const all: Tile[] = groups.map((g) => ({ kind: 'menu', id: g.id, name: g.name, icon: g.icon, lit: litGroup(g), lead: leadGroup(g) }));
      const cut = Math.max(1, room - 1);
      heads = size.w === 0 || all.length <= room ? all : [...all.slice(0, cut), { kind: 'menu', id: 'more', name: 'More', icon: 'more', lit: all.slice(cut).some((t) => 'lit' in t && t.lit), lead: false }];
    }
    return [...heads, ...(opens.length ? (['hr'] as const) : []), ...opens];
  };
  const deskTiles = inApp ? [] : tiles();
  const shownGroups = deskTiles.flatMap((t) => (t !== 'hr' && t.kind === 'menu' ? [t.id] : []));

  const appItem = (a: BarApp): Item => ({ kind: 'app', app: a, lit: !a.off && lit(a.id), lead: !a.off && leads(a.id), current: inApp && app === a.id, running: running.includes(a.id) });
  const folder = (g: BarGroup): Item => ({ kind: 'folder', group: g, lit: litGroup(g), lead: leadGroup(g) });
  const menuFor = (id: string): Omit<Menu, 'owner' | 'focus'> => {
    if (id === 'start') {
      const current = appOf(app);
      const close: Item[] = inApp && current ? [{ kind: 'hr' }, { kind: 'close', app: current }] : [];
      return { title: 'Apps', items: [...groups.map(folder), ...close] };
    }
    if (id === 'more') return { title: 'More', items: groups.filter((g) => !shownGroups.includes(g.id)).map(folder) };
    const g = groups.find((x) => x.id === id);
    return { title: g?.name ?? '', items: (g?.apps ?? []).map(appItem) };
  };

  const close = useCallback((from = 0, focusOwner = false) => {
    setStack((s) => {
      if (focusOwner && s[from]) {
        const owner = s[from]!.owner;
        requestAnimationFrame(() => (bar.current?.parentElement?.querySelector(`[data-key="${owner}"]`) as HTMLElement | null)?.focus());
      }
      return s.slice(0, from);
    });
  }, []);
  const openMenu = (owner: string, spec: Omit<Menu, 'owner' | 'focus'>, level: number, focus: boolean) =>
    setStack((s) => [...s.slice(0, level), { ...spec, owner, focus }]);

  // Menus close on a press anywhere else.
  useEffect(() => {
    if (!stack.length) return;
    const down = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (!t?.closest?.('.aerie-bar-menu, .aerie-bar-tile')) close(0);
    };
    document.addEventListener('pointerdown', down);
    return () => document.removeEventListener('pointerdown', down);
  }, [stack.length, close]);

  // Each menu goes by what opened it: up or down from a desktop tile, out to the side from the rail or a folder.
  useLayoutEffect(() => {
    const host = bar.current?.offsetParent as HTMLElement | null;
    const box = menusRef.current;
    if (!host || !box) return;
    const s = host.getBoundingClientRect();
    const top = tokenValue('band-top', 64);
    const gap = tokenValue('space-2', 8);
    [...box.children].forEach((node, level) => {
      const el = node as HTMLElement;
      const m = stack[level];
      const owner = m && (host.querySelector(`[data-key="${m.owner}"]`) as HTMLElement | null);
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
        el.style.setProperty('--rise', below ? `-${gap * 0.75}px` : `${gap * 0.75}px`);
      }
      el.style.left = `${Math.max(gap, Math.min(x, s.width - w - gap))}px`;
      el.style.top = `${Math.max(top, Math.min(y, s.height - h - gap))}px`;
      if (m.focus && !el.contains(document.activeElement)) (el.querySelector('[role="menuitem"]') as HTMLElement | null)?.focus();
    });
  }, [stack, inApp]);

  const say = (text: string) => {
    setSaid(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaid(''), tokenValue('motion-title', 2400) * 2.5);
  };

  const act = (level: number, item: Item, key: string, viaKey: boolean) => {
    if (item.kind === 'hr') return;
    if (item.kind === 'folder') {
      openMenu(key, { title: item.group.name, items: item.group.apps.map(appItem) }, level + 1, viaKey);
      return;
    }
    if (item.kind === 'app' && item.app.off) {
      say(`${item.app.name}. ${item.app.off}`);
      return;
    }
    setStack([]);
    if (item.kind === 'app') onOpen?.(item.app.id);
    else onClose?.(item.app.id);
  };

  const press = (t: Tile) => {
    if (hint) onHintDone?.();
    if (t.kind === 'menu') {
      if (stack[0]?.owner === `tile-${t.id}`) close(0);
      else openMenu(`tile-${t.id}`, menuFor(t.id), 0, false);
    } else if (t.kind === 'home') onHome?.();
    else if (t.kind === 'open') onOpen?.(t.id);
    else onPage?.(t.id);
  };

  const tileKey = (e: KeyboardEvent<HTMLButtonElement>, t: Tile) => {
    const all = [...(bar.current?.querySelectorAll<HTMLElement>('.aerie-bar-tile') ?? [])];
    const at = all.indexOf(e.currentTarget);
    const along = inApp ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight'];
    const opens = inApp ? 'ArrowRight' : stop < 2 ? 'ArrowDown' : 'ArrowUp';
    if (along.includes(e.key)) {
      e.preventDefault();
      all[(at + (e.key === along[1] ? 1 : -1) + all.length) % all.length]?.focus();
    } else if (t.kind === 'menu' && (e.key === opens || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      if (hint) onHintDone?.();
      openMenu(`tile-${t.id}`, menuFor(t.id), 0, true);
    }
  };

  const rowKey = (e: KeyboardEvent<HTMLButtonElement>, level: number, item: Item, key: string) => {
    const rows = [...(e.currentTarget.closest('.aerie-bar-menu')?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];
    const at = rows.indexOf(e.currentTarget);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      rows[(at + (e.key === 'ArrowDown' ? 1 : -1) + rows.length) % rows.length]?.focus();
    } else if (e.key === 'ArrowRight' && item.kind === 'folder') {
      e.preventDefault();
      act(level, item, key, true);
    } else if ((e.key === 'ArrowLeft' || e.key === 'Escape') && level > 0) {
      e.preventDefault();
      close(level, true);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close(0, true);
    } else if (e.key === 'Tab') close(0, true);
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      act(level, item, key, true);
    }
  };

  // Pointing at a folder rolls it out, as the old Start menu did. It waits longer once one is out, so a slow hand can reach it.
  const hover = useRef<ReturnType<typeof setTimeout>>(undefined);
  const point = (e: ReactPointerEvent, level: number, item: Item, key: string) => {
    if (e.pointerType === 'touch') return;
    clearTimeout(hover.current);
    const wait = stack.length > level + 1 ? tokenValue('motion-calm', 600) * 0.75 : tokenValue('motion-quick', 160);
    hover.current = setTimeout(() => {
      if (item.kind === 'folder') {
        if (stack[level + 1]?.owner !== key) act(level, item, key, false);
      } else close(level + 1);
    }, wait);
  };
  useEffect(() => () => clearTimeout(hover.current), []);

  // Moving the bar: drag on its rails, or the arrow keys on its grip.
  const gripKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      setStop(stop + (e.key === 'ArrowUp' ? -1 : 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setStop(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setStop(3);
    }
  };
  const gripDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    setStack([]);
    const r = bar.current!.getBoundingClientRect();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag({ dy: e.clientY - r.top, y: stopY(stop) });
  };
  const gripMove = (e: ReactPointerEvent) => {
    if (!drag) return;
    const s = (bar.current!.offsetParent as HTMLElement).getBoundingClientRect();
    setDrag({ ...drag, y: Math.max(stopY(0), Math.min(s.height - barH, e.clientY - s.top - drag.dy)) });
  };
  const gripUp = () => {
    if (!drag) return;
    let best = 0;
    for (let i = 1; i < 4; i++) if (Math.abs(stopY(i) - drag.y) < Math.abs(stopY(best) - drag.y)) best = i;
    setDrag(null);
    setStop(best);
  };

  const tile = (t: Tile, n: number) => {
    const isLit = 'lit' in t && t.lit;
    const isLead = 'lead' in t && t.lead;
    const current = 'current' in t && t.current;
    const words = [t.name, t.kind === 'open' && t.running ? 'open' : '', current ? 'you’re here' : '', isLit ? 'needs your attention' : ''].filter(Boolean).join(', ');
    const key = `tile-${t.id}`;
    return (
      <button
        key={key}
        type="button"
        data-key={key}
        className={cx('aerie-bar-tile', t.kind === 'menu' && t.start && 'aerie-bar-start', t.kind === 'open' && t.running && !inApp && 'aerie-bar-running', t.kind === 'open' && inApp && 'aerie-bar-side', t.kind === 'home' && 'aerie-bar-half', isLit && 'aerie-bar-lit', isLead && 'aerie-bar-lead')}
        style={{ '--n': n } as CSSProperties}
        aria-haspopup={t.kind === 'menu' ? 'menu' : undefined}
        aria-expanded={t.kind === 'menu' ? stack[0]?.owner === key : undefined}
        aria-current={current ? 'page' : undefined}
        aria-label={words}
        onClick={() => press(t)}
        onKeyDown={(e) => tileKey(e, t)}
      >
        <Icon name={t.icon} />
        <span>{t.name}</span>
      </button>
    );
  };

  const current = appOf(app);
  let n = 0;
  const y = drag ? drag.y : stopY(stop);

  return (
    <>
      {drag ? (
        <div className="aerie-bar-rails" aria-hidden="true">
          {STOPS.map((name, i) => (
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
        style={{ '--bar-y': `${y}px` } as CSSProperties}
        aria-label={inApp && current ? `App bar: ${current.name}` : 'App bar'}
      >
        {inApp ? null : (
          <button
            type="button"
            className="aerie-bar-grip"
            aria-label="Move the app bar. Up and down arrows move it between its places."
            onKeyDown={gripKey}
            onPointerDown={gripDown}
            onPointerMove={gripMove}
            onPointerUp={gripUp}
            onPointerCancel={gripUp}
          >
            <Icon name="grip" size={16} />
          </button>
        )}
        <span className="aerie-bar-sr" aria-live="polite">
          {inApp ? '' : `App bar: ${STOPS[stop]}`}
        </span>
        {inApp ? (
          <div className="aerie-bar-tiles">
            <div className="aerie-bar-fixed">
              <div className="aerie-bar-pair" data-solo={solo ? '' : undefined}>
                {tile({ kind: 'home', id: 'home', name: 'Home', icon: 'home' }, n++)}
                {solo ? null : (
                  <button
                    type="button"
                    data-key="tile-start"
                    className={cx('aerie-bar-tile', 'aerie-bar-half')}
                    style={{ '--n': n++ } as CSSProperties}
                    aria-haspopup="menu"
                    aria-expanded={stack[0]?.owner === 'tile-start'}
                    onClick={() => press({ kind: 'menu', id: 'start', name: 'Apps', icon: 'apps', lit: false, lead: false })}
                    onKeyDown={(e) => tileKey(e, { kind: 'menu', id: 'start', name: 'Apps', icon: 'apps', lit: false, lead: false })}
                  >
                    <Icon name="apps" />
                    <span>Apps</span>
                  </button>
                )}
              </div>
              {running.map((id) => {
                const t = openTile(id, true);
                return t ? tile(t, n++) : null;
              })}
            </div>
            <div className="aerie-bar-pages">
              {pages.map((p) => tile({ kind: 'page', id: p.id, name: p.name, icon: p.icon, current: p.id === page, lit: !!app && lit(app, [p.id]), lead: !!app && leads(app, [p.id]) }, n++))}
            </div>
          </div>
        ) : (
          <div className="aerie-bar-tiles">{deskTiles.map((t, i) => (t === 'hr' ? <hr key={`hr-${i}`} /> : tile(t, n++)))}</div>
        )}
      </nav>
      {hint && !inApp ? (
        <div className="aerie-bar-hint" style={{ top: stop >= 2 ? undefined : y + barH + tokenValue('space-2', 8), bottom: stop >= 2 ? size.h - y + tokenValue('space-2', 8) : undefined }}>
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
      <div ref={menusRef} className="aerie-bar-menus">
        {stack.map((m, level) => (
          <div key={`${level}-${m.owner}`} className={cx('aerie-bar-menu', level > 0 && 'aerie-bar-sub')} role="menu" aria-label={m.title}>
            {level ? null : <h4 aria-hidden="true">{m.title}</h4>}
            {m.items.map((it, i) => {
              if (it.kind === 'hr') return <hr key={`hr-${i}`} />;
              const key = it.kind === 'folder' ? `folder-${level}-${it.group.id}` : it.kind === 'close' ? 'close' : `app-${level}-${it.app.id}`;
              const label = it.kind === 'folder' ? it.group.name : it.kind === 'close' ? `Close ${it.app.name}` : it.app.name;
              const icon = it.kind === 'folder' ? 'folder' : it.kind === 'close' ? 'close' : it.app.icon;
              const sub = it.kind === 'folder' ? it.group.line : it.kind === 'app' ? (it.app.off ?? (it.current ? 'You’re here' : it.running ? 'Open' : it.app.line)) : undefined;
              const isLit = (it.kind === 'folder' || it.kind === 'app') && it.lit;
              const isLead = (it.kind === 'folder' || it.kind === 'app') && it.lead;
              return (
                <button
                  key={key}
                  type="button"
                  role="menuitem"
                  data-key={key}
                  className={cx(isLit && 'aerie-bar-lit', isLead && 'aerie-bar-lead')}
                  aria-haspopup={it.kind === 'folder' ? 'menu' : undefined}
                  aria-expanded={it.kind === 'folder' ? stack[level + 1]?.owner === key : undefined}
                  aria-disabled={it.kind === 'app' && it.app.off ? true : undefined}
                  aria-current={it.kind === 'app' && it.current ? 'page' : undefined}
                  onClick={() => act(level, it, key, false)}
                  onKeyDown={(e) => rowKey(e, level, it, key)}
                  onPointerOver={(e) => point(e, level, it, key)}
                >
                  <Icon name={icon} />
                  <span className="aerie-bar-row">
                    {label}
                    {sub ? <small>{sub}</small> : null}
                    {isLit ? <span className="aerie-bar-sr">, needs your attention</span> : null}
                  </span>
                  {it.kind === 'folder' ? <Icon name="chevron-right" size={16} className="aerie-bar-chev" /> : <span />}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <span className="aerie-bar-sr" aria-live="polite">
        {said}
      </span>
    </>
  );
}
