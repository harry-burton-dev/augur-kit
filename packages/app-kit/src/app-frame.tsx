import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { cx, Icon, IconButton, type IconName } from '@augur/kit-common';
import { tokens } from '@augur/kit-common/tokens';
import { FocusStage, type Depth } from './focus.js';
import { RingProvider, type RingOverflow, type RingShape } from './radial-menu.js';

/** Where the person's choice to fold the rail or the drawer is kept, on this device. */
const KEPT = { rail: 'augur-app-frame:rail-closed', drawer: 'augur-app-frame:drawer-closed' };

const remembered = (key: string) => {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
};
const remember = (key: string, closed: boolean) => {
  try {
    localStorage.setItem(key, closed ? '1' : '0');
  } catch {
    // Private windows and blocked storage: the choice lasts until the page closes.
  }
};

/**
 * The widths the frame changes shape at: its own width, not the window's, so
 * a frame beside something else behaves as one on a narrow screen. kit.css's
 * container queries hold the same numbers (a query can't read a variable);
 * a test keeps the two in step.
 */
export const FRAME_WIDTHS = { overlay: parseFloat(tokens['frame-overlay-below']), icons: parseFloat(tokens['frame-icons-below']) };

/** How wide the frame is, in its shapes: `wide`; `overlay` (the drawer opens over the page); `icons` (the rail too). */
type Shape = 'wide' | 'overlay' | 'icons';
/** No width yet (not laid out) reads as wide: the frame never folds on a guess. */
const shapeAt = (width: number): Shape => (width <= 0 ? 'wide' : width < FRAME_WIDTHS.icons ? 'icons' : width < FRAME_WIDTHS.overlay ? 'overlay' : 'wide');

/** Whether the rail is folded, for the parts inside it (RailLink shows only its icon). */
export const RailFolded = createContext(false);

export interface AppFrameProps {
  /** The app's name and icon at the top of the rail. Pressing them opens the app's front page. */
  app: { name: string; icon: IconName };
  /** Open the front page. */
  onFront?: () => void;
  /** The app's sections: RailLinks, and at most one action. */
  rail?: ReactNode;
  /** What the rail is, read aloud ("Libraries"). */
  railLabel?: string;
  /** About what's on screen: its details, who owns it, what's inside it. */
  drawer?: ReactNode;
  drawerLabel?: string;
  /** Beside the main column: line of sight, references. */
  aside?: ReactNode;
  /** How wide the main column may get: `wide` (default), `read`, or `full` for a graph or map. */
  measure?: 'wide' | 'read' | 'full';
  /** Loading or saving: the main column is marked busy and dims a little. */
  busy?: boolean;
  /** Which screen is showing. A new value fades the main column in and turns the drawer with it. */
  screen?: string;
  /** How the app goes out of focus behind a dialog, the radial menu or the palette (PDR-010). `veil` by default. */
  depth?: Depth;
  /** How the radial menu lays out its actions: `auto` (a ring, a list past eight) by default. */
  ringShape?: RingShape;
  /** What the radial menu does past eight actions: `list` by default, or `more` to keep a ring and overflow into More. */
  ringOverflow?: RingOverflow;
  children: ReactNode;
}

/**
 * An app's page, in three columns with one job each (docs/app-patterns.md):
 * the rail says where you can go, the main column shows what's here, and the
 * drawer says more about it. The rail and the drawer fold to a strip of icons,
 * and the frame remembers that on this device. The shell's bar stays the only
 * bar, so the frame has no header of its own. Whenever the drawer opens, folds
 * or goes, the frame fires `ui-drawer` on the window with the width it takes,
 * so the shell keeps its floor gauge clear of it.
 *
 * One layout at every width (docs/app-patterns.md), by the frame's own width:
 * below `frame-overlay-below` the drawer keeps only its strip and opens over
 * the page when asked; below `frame-icons-below` the rail shows its icons and
 * opens over the page the same way. An overlay closes on Escape, on a press
 * outside it, and (the rail) when one of its sections is picked. The person's
 * choice to fold stays as it was for when the frame is wide again.
 *
 * The frame is a focus stage (PDR-010): a dialog, the palette or the radial
 * menu racks it out of focus rather than covering it with a scrim. It holds
 * the app's one radial menu, so anything inside can open it with
 * `useRingTarget`.
 */
export function AppFrame({ app, onFront, rail, railLabel = 'Sections', drawer, drawerLabel = 'Details', aside, measure = 'wide', busy, screen, depth, ringShape, ringOverflow, children }: AppFrameProps) {
  const [railClosed, setRailClosed] = useState(() => remembered(KEPT.rail));
  const [drawerClosed, setDrawerClosed] = useState(() => remembered(KEPT.drawer));
  const [shape, setShape] = useState<Shape>('wide');
  const [over, setOver] = useState<'rail' | 'drawer' | undefined>();
  const [turning, setTurning] = useState(false);
  const first = useRef(true);
  const room = useRef<HTMLDivElement>(null);
  const drawerEl = useRef<HTMLDivElement>(null);

  // The first screen just appears; each one after it turns: out at once, then back in on the next frame.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setTurning(true);
    const t = setTimeout(() => setTurning(false), 40);
    return () => clearTimeout(t);
  }, [screen]);

  // The frame's own width picks its shape. Without ResizeObserver (old browsers, tests) it stays wide.
  useLayoutEffect(() => {
    const el = room.current;
    if (!el || typeof ResizeObserver !== 'function') return;
    const watch = new ResizeObserver(([entry]) => entry && setShape(shapeAt(entry.contentRect.width)));
    watch.observe(el);
    setShape(shapeAt(el.getBoundingClientRect().width));
    return () => watch.disconnect();
  }, []);

  // An overlay belongs to the shape it was opened in.
  const railOver = over === 'rail' && shape === 'icons';
  const drawerOver = over === 'drawer' && shape !== 'wide';
  const railState = shape === 'icons' ? (railOver ? 'over' : 'closed') : railClosed ? 'closed' : 'open';
  const drawerState = shape !== 'wide' ? (drawerOver ? 'over' : 'closed') : drawerClosed ? 'closed' : 'open';

  // An overlay closes on a press anywhere outside it.
  useEffect(() => {
    if (!railOver && !drawerOver) return;
    const away = (e: PointerEvent) => {
      const inside = (e.target as Element | null)?.closest?.(railOver ? '.quill-rail' : '.quill-drawer');
      if (!inside || !room.current?.contains(inside)) setOver(undefined);
    };
    document.addEventListener('pointerdown', away, true);
    return () => document.removeEventListener('pointerdown', away, true);
  }, [railOver, drawerOver]);

  const hasDrawer = Boolean(drawer);
  // Tells the shell how much of the right edge the drawer takes now, open, folded or over the page.
  useEffect(() => {
    // The width it settles at, not where a transition has got to: the column, or the drawer over the page.
    const el = drawerEl.current;
    const inset = el ? parseFloat(getComputedStyle(el).getPropertyValue(drawerState === 'over' ? '--measure-drawer' : '--frame-drawer')) || 0 : 0;
    window.dispatchEvent(new CustomEvent('ui-drawer', { detail: { inset } }));
  }, [hasDrawer, drawerState, shape]);
  // Gone with the app: the shell has the whole edge back.
  useEffect(() => () => void window.dispatchEvent(new CustomEvent('ui-drawer', { detail: { inset: 0 } })), []);

  const fold = (which: 'rail' | 'drawer') => {
    const overlaid = which === 'rail' ? shape === 'icons' : shape !== 'wide';
    if (overlaid) setOver((now) => (now === which ? undefined : which));
    else if (which === 'rail') {
      remember(KEPT.rail, !railClosed);
      setRailClosed(!railClosed);
    } else {
      remember(KEPT.drawer, !drawerClosed);
      setDrawerClosed(!drawerClosed);
    }
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && over) {
      e.stopPropagation();
      setOver(undefined);
    }
  };
  // Picking a section from the rail over the page closes it.
  const onRailClick = (e: MouseEvent) => {
    if (railOver && (e.target as Element).closest('.quill-rail-link')) setOver(undefined);
  };
  const railFolded = railState === 'closed';
  const drawerFolded = drawerState === 'closed';

  return (
    <FocusStage depth={depth}>
      <RingProvider shape={ringShape} overflow={ringOverflow}>
        <div ref={room} className="quill-room" onKeyDown={onKeyDown}>
        <div
          className="quill-frame"
          data-shape={shape}
          data-rail={rail ? railState : undefined}
          data-drawer={drawer ? drawerState : undefined}
          data-measure={measure}
          data-turning={turning || undefined}
        >
          {rail ? (
            <nav className="quill-rail" aria-label={railLabel} onClick={onRailClick}>
              <div className="quill-rail-head">
                <button type="button" className="quill-app" onClick={onFront} aria-label={railFolded ? `${app.name}, front page` : undefined}>
                  <Icon name={app.icon} size={20} />
                  {railFolded ? null : <span>{app.name}</span>}
                </button>
                <IconButton size="sm" icon={railFolded ? 'rail-open' : 'rail-close'} label={railFolded ? `Show ${railLabel}` : `Hide ${railLabel}`} onPress={() => fold('rail')} aria-expanded={!railFolded} />
              </div>
              <RailFolded.Provider value={railFolded}>
                <div className="quill-rail-body">{rail}</div>
              </RailFolded.Provider>
            </nav>
          ) : null}
          <main className="quill-main" aria-busy={busy || undefined}>
            <div className={cx('quill-page', aside ? 'quill-page-aside' : undefined)} data-busy={busy || undefined}>
              <div className="quill-column">{children}</div>
              {aside ? <aside className="quill-column quill-aside">{aside}</aside> : null}
            </div>
          </main>
          {drawer ? (
            <div ref={drawerEl} className="quill-drawer" role="complementary" aria-label={drawerLabel}>
              <div className="quill-drawer-head">
                <IconButton size="sm" icon={drawerFolded ? 'drawer-open' : 'drawer-close'} label={drawerFolded ? `Show ${drawerLabel}` : `Hide ${drawerLabel}`} onPress={() => fold('drawer')} aria-expanded={!drawerFolded} />
              </div>
              <div className="quill-drawer-inner" inert={drawerFolded || undefined}>
                {drawer}
              </div>
            </div>
          ) : null}
        </div>
        </div>
      </RingProvider>
    </FocusStage>
  );
}

export interface RailLinkProps {
  icon: IconName;
  label: string;
  /** The screen showing now. */
  current?: boolean;
  /** How many need you there. */
  count?: number;
  onPress: () => void;
}

/** One of the app's sections in its rail. Folded, it shows only its icon, with its name on hover and focus. */
export function RailLink({ icon, label, current, count, onPress }: RailLinkProps) {
  const folded = useContext(RailFolded);
  return (
    <button type="button" className="quill-rail-link" aria-current={current ? 'page' : undefined} aria-label={folded ? label : undefined} title={folded ? label : undefined} onClick={onPress}>
      <Icon name={icon} size={18} />
      {folded ? null : <span className="quill-rail-label">{label}</span>}
      {count ? <span className="quill-rail-count">{count}</span> : null}
    </button>
  );
}
