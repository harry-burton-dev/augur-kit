import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { cx } from '@augur/kit-common';

/** The shell's named layouts for an app's pane (the SDK's FrameLayout). */
export type PaneLayoutName = 'focus' | 'aside' | 'split' | 'canvas';

export interface PaneLayoutProps {
  layout: PaneLayoutName;
  /** The main column's width (PDR-014): reading width, wide, or the whole pane. */
  width?: 'read' | 'wide' | 'full';
  density?: 'comfortable' | 'compact';
  /** flush puts the screen against the pane's edges; the head keeps its inset. */
  inset?: 'standard' | 'flush';
  /** The page head the shell draws from what the app set. */
  head?: ReactNode;
  /** What sits between the head and the screen: the pane's own states (opening, stopped). */
  status?: ReactNode;
  /** The About panel. Drawn only in a layout that has it (aside). */
  about?: ReactNode;
  /** Props for the frame round the pane and the About panel, such as a ref and its data attributes. */
  frame?: HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> } & Record<`data-${string}`, string | undefined>;
  /** What the frame holds besides the pane and the About panel, such as the command palette. */
  overlay?: ReactNode;
  /** Props for the pane itself, such as its drop handlers and data attributes. */
  pane?: HTMLAttributes<HTMLElement> & Record<`data-${string}`, string | undefined>;
  /** Hides the screen while the pane shows a state or a canvas in its place. */
  screenHidden?: boolean;
  /** A canvas in place of the screen (spec 6.11). */
  canvas?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** Which layouts have the About panel beside the main column. */
export const layoutHasAbout = (layout: PaneLayoutName) => layout === 'aside';

/**
 * The frame round one app's pane: the layout the app chose, with the inset contract on every one. The pane
 * pads its head and its screen with the same inline inset, so the title and the content line up, caps them
 * together at the chosen width, keeps the top clear of the stage's fade, and spaces the screen's sections
 * with section-gap. Each column pads itself; columns meet at a hairline. An app chooses the layout, the
 * width, the density and the inset by name, never a distance.
 */
export function PaneLayout({ layout, width = 'read', density = 'comfortable', inset = 'standard', head, status, about, frame, overlay, pane, screenHidden, canvas, children, className }: PaneLayoutProps) {
  return (
    <div {...frame} className={cx('aerie-app-frame', frame?.className, className)} data-layout={layout} data-width={width} data-density={density} data-inset={inset}>
      <section {...pane} className={cx('aerie-app-pane', pane?.className)}>
        <div className="aerie-app-head">{head}</div>
        {status}
        {canvas}
        <div className="aerie-app-screen" hidden={screenHidden}>
          {children}
        </div>
      </section>
      {layoutHasAbout(layout) ? about : null}
      {overlay}
    </div>
  );
}
