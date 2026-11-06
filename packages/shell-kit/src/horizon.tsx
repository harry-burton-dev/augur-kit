import type { HTMLAttributes } from 'react';
import { cx } from '@augur/kit-common';

export interface HorizonProps extends HTMLAttributes<HTMLDivElement> {
  /** Whose floor you're on: the light around the line takes its colour. The line never moves. */
  floor?: 'you' | 'department' | 'team' | 'org';
  /** An app is open: the ground steps out of the way, so nothing lit sits beside the work. */
  away?: boolean;
}

/**
 * The still horizon: the desktop's ground, in place of the water. One line at exactly half
 * height, two level rules above it for intent and two below for knowledge, and a little of the
 * floor's light around the line. Nothing in it moves.
 */
export function Horizon({ floor = 'you', away, className, ...rest }: HorizonProps) {
  return (
    <div className={cx('aerie-horizon', className)} data-floor={floor} data-away={away ? '' : undefined} aria-hidden="true" {...rest}>
      <i className="aerie-horizon-glow" />
      <i className="aerie-horizon-a2" />
      <i className="aerie-horizon-a1" />
      <i className="aerie-horizon-line" />
      <i className="aerie-horizon-b1" />
      <i className="aerie-horizon-b2" />
    </div>
  );
}
