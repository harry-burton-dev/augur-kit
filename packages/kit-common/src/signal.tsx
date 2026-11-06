import type { CSSProperties, ReactNode } from 'react';
import { cx } from './cx.js';

/**
 * The light language: what a signal says, by the kind of light it gives. Light
 * alone fails people who can't tell the colours apart, so every signal also
 * carries words.
 */
export type SignalKind =
  /** A count: a streak of light whose length grows with `count`. The number is always written too. */
  | 'streak'
  /** Needs you: a soft bloom of light that pulls focus to the thing that is waiting for you. */
  | 'bloom'
  /** Changed: one flicker when it arrives, then steady. */
  | 'flicker'
  /** Going stale: a low ember, dimming slowly, for something that hasn't been looked after in a while. */
  | 'ember'
  /** Urgent: a beacon. It leads to the letterbox, where the urgent thing is shown and decided. */
  | 'beacon'
  /** Unavailable: a shadow where the light would be. Its words say why, and who can change it. */
  | 'shadow';

/** How long a streak grows before only its number keeps counting: past this, a longer streak reads no differently. */
export const STREAK_MOST = 9;

export interface SignalProps {
  kind: SignalKind;
  /** What the signal says, in words: always shown beside the light ("3 to review", "Needs you", "Unavailable"). */
  label: string;
  /** A streak's count. Written before the label, and sets the streak's length up to `STREAK_MOST`. */
  count?: number;
  /** More words after the label: a shadow's reason, or what changed. */
  children?: ReactNode;
  className?: string;
}

/**
 * A signal in the light language (streak, bloom, flicker, ember, beacon,
 * shadow). The light is decoration; the words carry the meaning. Its loops
 * stop under reduced motion, from the system or AUGUR's own setting.
 */
export function Signal({ kind, label, count, children, className }: SignalProps) {
  const counted = kind === 'streak' && count !== undefined;
  const style = counted ? ({ '--signal-count': Math.max(1, Math.min(count, STREAK_MOST)) } as CSSProperties) : undefined;
  return (
    <span className={cx('augur-signal', className)} data-kind={kind} style={style}>
      <span className="augur-signal-socket" aria-hidden="true">
        <span className="augur-signal-light" aria-hidden="true" />
      </span>
      {counted ? <span className="augur-signal-count">{count}</span> : null}
      <span className="augur-signal-label">{label}</span>
      {children ? <span className="augur-signal-more">{children}</span> : null}
    </span>
  );
}
