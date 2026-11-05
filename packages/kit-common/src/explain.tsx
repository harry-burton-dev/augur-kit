import type { ReactNode } from 'react';
import { cx } from './cx.js';

export interface ExplainProps {
  /** What happened, as a fact ("The upgrade to 0.14.0 failed its health watch"). */
  what: ReactNode;
  /** Why it matters to this person now. */
  why: ReactNode;
  /** What they can do about it, in words; the controls themselves go in the actions. */
  canDo: ReactNode;
  /** Who else can act on it. When nobody can, say so ("Nobody else can act on this."). */
  whoElse: ReactNode;
  className?: string;
}

const parts = [
  ['what', 'What happened'],
  ['why', 'Why it matters'],
  ['canDo', 'What you can do'],
  ['whoElse', 'Who else can act'],
] as const;

/**
 * Explain, never hide (Shell principles, in the AUGUR handbook): the four-part explanation of
 * something that needs a person. What happened, why it matters, what you can do
 * and who else can act, each labelled in words. All four are asked for, so an
 * urgent item never leaves one of them out. Used inside a `Letterbox` and
 * anywhere else an item needs explaining.
 */
export function Explain({ what, why, canDo, whoElse, className }: ExplainProps) {
  const text = { what, why, canDo, whoElse };
  return (
    <dl className={cx('augur-explain', className)}>
      {parts.map(([key, label]) => (
        <div key={key} className="augur-explain-part" data-part={key}>
          <dt className="augur-explain-label">{label}</dt>
          <dd className="augur-explain-text">{text[key]}</dd>
        </div>
      ))}
    </dl>
  );
}
