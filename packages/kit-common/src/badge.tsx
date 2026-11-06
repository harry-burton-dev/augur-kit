import type { ReactNode } from 'react';
import { cx } from './cx.js';

export interface BadgeProps {
  /** A count (`3`) or a short word (`Draft`). Leave it out with `dot` for a mark with no words. */
  children?: ReactNode;
  /** `needs` is the one colour, for "needs you"; `danger` is a red edge for what's gone wrong. */
  tone?: 'plain' | 'needs' | 'danger';
  /** What it means, read aloud ("3 need you", "New"). Needed for a dot or a bare number on an icon. */
  label?: string;
  /** A small mark with no words: something new. Needs a `label`. */
  dot?: boolean;
  /** What it marks (an icon, an icon button): the badge sits on its top end corner. */
  on?: ReactNode;
  className?: string;
}

/**
 * A count or a word on something else, drawn as a small key (Key, picked 6 Nov 2026). Numbers are mono.
 * Only "needs you" is green. A badge says how many or what state; a thing filed under a word is a Tag.
 */
export function Badge({ children, tone = 'plain', label, dot, on, className }: BadgeProps) {
  const word = !dot && typeof children !== 'number' && !(typeof children === 'string' && /^\d+\+?$/.test(children));
  const badge = (
    <span
      className={cx('augur-badge', on == null && className)}
      data-tone={tone === 'plain' ? undefined : tone}
      data-word={word || undefined}
      data-dot={dot || undefined}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      {dot ? null : children}
    </span>
  );
  if (on == null) return badge;
  return (
    <span className={cx('augur-badge-on', className)}>
      {on}
      {badge}
    </span>
  );
}
