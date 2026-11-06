import { cx } from './cx.js';

export interface DividerProps {
  /** A word on the line ("Earlier"), for a list in groups. */
  label?: string;
  /** A deeper line, between kinds of thing rather than items of one kind. */
  strong?: boolean;
  /** Upright, it divides the controls in a bar. */
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

/**
 * A line between things, drawn as a groove cut into the surface (Key, picked 6 Nov 2026): a dark line with
 * a faint lit one under it. Use space before a line: a divider is for when space alone doesn't say where
 * one group ends.
 */
export function Divider({ label, strong, orientation = 'horizontal', className }: DividerProps) {
  if (orientation === 'vertical') {
    return <span className={cx('augur-divider', className)} role="separator" aria-orientation="vertical" data-strong={strong || undefined} />;
  }
  if (label) {
    return (
      <div className={cx('augur-divider', className)} role="separator" aria-label={label} data-label="" data-strong={strong || undefined}>
        <span aria-hidden="true">{label}</span>
      </div>
    );
  }
  return <hr className={cx('augur-divider', className)} data-strong={strong || undefined} />;
}
