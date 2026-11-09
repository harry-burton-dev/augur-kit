import type { CSSProperties } from 'react';
import { cx } from './cx.js';

export interface SkeletonProps {
  /** What is loading, for screen readers ("Loading the document"). */
  label?: string;
  /** A wider, taller slot first, where a title will be. */
  title?: boolean;
  /** How many lines of text will come. */
  lines?: number;
  /** How many short facts (an owner, a date, a size) will sit in a row under the text. */
  facts?: number;
  className?: string;
}

// Line lengths that read as text: never all the same, the last one short.
const LENGTHS = [94, 88, 97, 82, 90];
const FACTS = [30, 20, 25, 22];

/**
 * What stands where content will be while it loads (Key, picked 6 Nov 2026): empty wells in the shape of
 * what comes, the same slot a field is drawn as, breathing slowly. Use it where the shape is known (a
 * document, a card, a row); where it isn't, use State's loading line on the horizon instead. It stays
 * still under reduced motion.
 */
export function Skeleton({ label = 'Loading', title = true, lines = 3, facts = 0, className }: SkeletonProps) {
  const w = (n: number): CSSProperties => ({ width: `${n}%` });
  return (
    <div className={cx('augur-skeleton', className)} role="status" aria-label={label}>
      {title ? <i data-size="title" style={w(62)} /> : null}
      {Array.from({ length: lines }, (_, i) => (
        <i key={i} style={w(i === lines - 1 && lines > 1 ? 40 : LENGTHS[i % LENGTHS.length])} />
      ))}
      {facts > 0 ? (
        <span className="augur-skeleton-facts">
          {Array.from({ length: facts }, (_, i) => (
            <i key={i} style={w(FACTS[i % FACTS.length])} />
          ))}
        </span>
      ) : null}
    </div>
  );
}
