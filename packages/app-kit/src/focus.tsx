import { createContext, useContext, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { cx } from '@augur/kit-common';

/**
 * Depth and focus (PDR-010). An app doesn't fight for flat screen space: it
 * keeps its layout where it is and moves the camera's focus instead.
 *
 * - **Rack focus.** When focus moves to an active surface (a dialog, the
 *   radial menu, the palette), the rest of the app stays in place and goes
 *   out of focus: fine detail and colour are stripped from it and it shrinks a
 *   touch, as a lens does when it refocuses on something closer. No black
 *   scrim, so you never lose your bearings.
 * - **Focus pull.** Ambient things sit quietly back while something that
 *   needs action pulls focus to itself (`FocusField`, `FocusItem`).
 * - **Focal planes.** Everything sits on one of four planes, back to front:
 *   the ground (the shell's water), the work (the app), the active surface (a
 *   dialog, the palette, the radial menu) and the decision (an approval, the
 *   letterbox). The more planes stand in front of the work, the further back
 *   it goes: far for one, deep for two or more.
 */

/** The focal planes, back to front. A surface that racks focus says which plane it stands on. */
export type Plane =
  /** The shell's ground: the water behind every app. Never racked by an app. */
  | 'ground'
  /** The app's own plane. A surface here (a card risen from its phrase) racks the rest of the app soft, not far. */
  | 'work'
  /** An active surface in front of the work: a dialog, the palette, the radial menu. */
  | 'active'
  /** A decision over everything else: an approval, the letterbox. */
  | 'decision';

/** How far back the work plane is drawn while something racks it: `soft` for a surface within it, `far` for one in front, `deep` for two or more. */
export type FocusLevel = 'soft' | 'far' | 'deep';

/** How the out-of-focus plane is drawn. */
export type Depth =
  /** Harry's: a veil over the plane blurs and desaturates what's behind it (`backdrop-filter`). Can leave a hole for a subject. */
  | 'veil'
  /** The plane itself is blurred and desaturated (`filter`). No overlay, but no hole either. */
  | 'lens'
  /** The old way, kept to compare: a dark scrim, no blur. */
  | 'scrim';

/** A box on screen, in viewport pixels, that stays sharp while the rest racks out: the thing a radial menu was opened on. */
export interface Hole {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Racking {
  id: string;
  plane: Plane;
  hole?: Hole;
}

interface Stage {
  depth: Depth;
  rack: (id: string, plane: Plane, hole?: Hole) => void;
  /** Ends a rack; `returnTo` takes focus back once the plane is in focus (and focusable) again. */
  release: (id: string, returnTo?: HTMLElement) => void;
}

const StageContext = createContext<Stage | null>(null);

const DEPTHS: readonly Depth[] = ['veil', 'lens', 'scrim'];

/**
 * How the deployment draws depth, when it says (PDR-010, amendment 2): its
 * FOCUS_DEPTH setting, which the web container writes into the page's
 * `augur-depth` meta. An org whose desktops have no GPU (virtual desktops)
 * picks `scrim`, which blurs nothing. Nothing, or anything else, means the
 * deployment leaves it to the app.
 */
export function deploymentDepth(doc: Pick<Document, 'querySelector'> | undefined = typeof document === 'undefined' ? undefined : document): Depth | undefined {
  const set = doc?.querySelector<HTMLMetaElement>('meta[name="augur-depth"]')?.content.trim();
  return DEPTHS.find((d) => d === set);
}

export interface FocusStageProps {
  /**
   * How the out-of-focus plane is drawn, when the deployment doesn't say:
   * the deployment's choice (`deploymentDepth`) is about its machines, so it
   * wins. `veil` when neither says.
   */
  depth?: Depth;
  children: ReactNode;
  className?: string;
}

/**
 * The app's focal planes. Put it round the whole app (AppFrame does). While
 * anything inside asks for focus with `useRack`, or a Common dialog is open
 * over it, everything else in the stage goes out of focus. The layout never
 * moves, so you keep your place.
 */
export function FocusStage({ depth: asked, children, className }: FocusStageProps) {
  const [deployed] = useState(() => deploymentDepth());
  const depth: Depth = deployed ?? asked ?? 'veil';
  const [racks, setRacks] = useState<Racking[]>([]);
  const returnTo = useRef<HTMLElement | undefined>(undefined);
  const stage = useMemo<Stage>(
    () => ({
      depth,
      rack: (id, plane, hole) => setRacks((now) => [...now.filter((r) => r.id !== id), { id, plane, ...(hole ? { hole } : {}) }]),
      release: (id, to) => {
        if (to) returnTo.current = to;
        setRacks((now) => now.filter((r) => r.id !== id));
      },
    }),
    [depth],
  );
  const top = racks.at(-1);
  const focus = focusLevel(racks);
  // The plane is inert while racked, so focus can only go back once it isn't.
  useEffect(() => {
    if (top || !returnTo.current) return;
    if (returnTo.current.isConnected) returnTo.current.focus({ preventScroll: true });
    returnTo.current = undefined;
  }, [top]);
  // A hole needs the veil: the lens blurs the plane itself, so nothing in it could stay sharp.
  const drawn: Depth = top?.hole && depth === 'lens' ? 'veil' : depth;
  const hole: CSSProperties | undefined = top?.hole
    ? ({ '--hole-x': `${top.hole.x}px`, '--hole-y': `${top.hole.y}px`, '--hole-w': `${top.hole.width}px`, '--hole-h': `${top.hole.height}px` } as CSSProperties)
    : undefined;
  return (
    <StageContext.Provider value={stage}>
      <div className={cx('quill-stage', className)} data-depth={drawn} data-racked={top ? '' : undefined} data-focus={focus}>
        <div className="quill-plane" inert={top ? true : undefined}>
          {children}
        </div>
        <div className="quill-rack" aria-hidden="true" data-hole={top?.hole ? '' : undefined} style={hole} />
      </div>
    </StageContext.Provider>
  );
}

/**
 * How far back the work plane goes for what is racking it: deep once two or
 * more surfaces stand in front of it, far for one, soft when the only ones
 * are within the work plane itself.
 */
export function focusLevel(racks: readonly { plane: Plane }[]): FocusLevel | undefined {
  const front = racks.filter((r) => r.plane === 'active' || r.plane === 'decision').length;
  if (front >= 2) return 'deep';
  if (front === 1) return 'far';
  return racks.length ? 'soft' : undefined;
}

/** How the nearest stage draws depth, for parts that render their own surface. */
export const useDepth = (): Depth => useContext(StageContext)?.depth ?? 'veil';

export interface RackOptions {
  /** A box that stays sharp while the rest racks out: the thing a radial menu was opened on. */
  hole?: Hole;
  /** Gets focus back when the rack ends, once the plane is in focus again. */
  returnTo?: HTMLElement;
  /** The plane the calling surface stands on. `active` unless it says otherwise; `work` racks the app soft. */
  plane?: Plane;
}

/**
 * Takes the stage out of focus while `active`, leaving `options.hole` sharp.
 * The part that calls it draws its own surface outside the plane (in a
 * portal), above the rack. Outside a stage it does nothing.
 */
export function useRack(active: boolean, options: RackOptions = {}) {
  const { hole, returnTo, plane = 'active' } = options;
  const stage = useContext(StageContext);
  const id = useId();
  const key = hole ? `${hole.x},${hole.y},${hole.width},${hole.height}` : '';
  const back = useRef(returnTo);
  back.current = returnTo;
  useEffect(() => {
    if (!stage || !active) return;
    stage.rack(id, plane, hole);
    return () => stage.release(id, back.current);
    // The hole is compared by value, so a new object for the same box doesn't re-rack.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, active, id, key, plane]);
}

/** How ambient things look while something else has focus. */
export type Ambience =
  /** Softly out of focus (under a pixel of blur), with less colour and light. Only for things nobody needs to read while focus is elsewhere. */
  | 'soft'
  /** The default: less colour and light only, no blur, so the ambient things stay readable (PDR-010, amendment 1). */
  | 'quiet';

export interface FocusFieldProps {
  /** Something inside needs action and has pulled focus: everything else in the field becomes ambient. */
  pulled?: boolean;
  /** How the rest look while one is pulled. `quiet` unless the screen has nothing people read in it. */
  ambience?: Ambience;
  children: ReactNode;
  className?: string;
  /** The element to draw: a `div` unless it's a list. */
  as?: 'div' | 'ul' | 'ol' | 'section';
}

/**
 * Focus pull (PDR-010): a group of things where one can pull focus. While
 * `pulled`, every `FocusItem` that isn't `pulled` sits ambient; hovering or
 * focusing one brings it back into focus at once, so nothing is out of reach.
 */
export function FocusField({ pulled, ambience = 'quiet', children, className, as: Tag = 'div' }: FocusFieldProps) {
  return (
    <Tag className={cx('quill-field', className)} data-pulling={pulled ? '' : undefined} data-ambience={ambience}>
      {children}
    </Tag>
  );
}

export interface FocusItemProps {
  /** This one needs action: it stays sharp, raised a little, and the rest of the field steps back. */
  pulled?: boolean;
  /** Always ambient, whatever else is pulled: read-only things, minor notices. */
  ambient?: boolean;
  children: ReactNode;
  className?: string;
  as?: 'div' | 'li';
}

export function FocusItem({ pulled, ambient, children, className, as: Tag = 'div' }: FocusItemProps) {
  return (
    <Tag className={cx('quill-focus-item', className)} data-focus={pulled ? 'pulled' : ambient ? 'ambient' : undefined}>
      {children}
    </Tag>
  );
}
