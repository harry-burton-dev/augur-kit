import type { ReactNode } from 'react';
import { cx } from '@augur/kit-common';

/**
 * Layout inside an app's main column (spacing and layouts plan, K2). The shell lays out the pane and pads
 * it; these lay out what is inside it. Each spaces its children with the layout tokens and nothing else,
 * so an app chooses how things sit together, never a distance. None of them pads its own outside: the
 * parent's gap spaces them.
 */

/** How far apart a stack's children are: the layout tokens stack-tight, stack, stack-loose and section-gap. */
export type StackGap = 'tight' | 'normal' | 'loose' | 'section';

export interface StackProps {
  gap?: StackGap;
  /** Names the group for assistive technology when it is one thing, such as a form's fields. */
  label?: string;
  children?: ReactNode;
  className?: string;
}

/** Children one above the other, `gap` apart. */
export function Stack({ gap = 'normal', label, children, className }: StackProps) {
  return (
    <div className={cx('quill-stack', className)} data-gap={gap} role={label ? 'group' : undefined} aria-label={label}>
      {children}
    </div>
  );
}

export interface SplitProps {
  /** The main part: the wider one, first in reading order. */
  children?: ReactNode;
  /** The part beside it, at least part-min-width wide. */
  aside?: ReactNode;
  className?: string;
}

/**
 * A main part and an aside side by side, the aside at least part-min-width wide. When the column is too
 * narrow for both, the aside goes under the main part by itself: it needs no width of its own to switch at.
 */
export function Split({ children, aside, className }: SplitProps) {
  return (
    <div className={cx('quill-split', className)}>
      <div className="quill-split-main">{children}</div>
      {aside ? <div className="quill-split-aside">{aside}</div> : null}
    </div>
  );
}

export interface GridProps {
  label?: string;
  children?: ReactNode;
  className?: string;
}

/** Cards or parts in as many columns as fit, each at least part-min-width wide, for dashboards and front pages. */
export function Grid({ label, children, className }: GridProps) {
  return (
    <div className={cx('quill-grid', className)} role={label ? 'group' : undefined} aria-label={label}>
      {children}
    </div>
  );
}
