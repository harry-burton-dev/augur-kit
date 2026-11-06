import type { CSSProperties, HTMLAttributes } from 'react';
import { cx } from '@augur/kit-common';
import type { FloorTone } from './floors.js';

export interface HorizonProps extends HTMLAttributes<HTMLDivElement> {
  /** Whose floor you're on: the light around the line takes its colour. The line never moves. */
  floor?: FloorTone;
  /** An app is open: the ground steps out of the way, so nothing lit sits beside the work. */
  away?: boolean;
  /** Where the line sits, as a fraction of the height. Half by default. */
  line?: number;
  /** The level rules above the line, for intent, as fractions of the height, nearest the line first. Each one is fainter than the last. */
  above?: number[];
  /** The level rules below the line, for knowledge, nearest the line first. */
  below?: number[];
  /** A little of the floor's light around the line. On unless false. */
  glow?: boolean;
}

/** How strong the nearest rule above and below is, in percent of its grey; each one further out is a little fainter. */
const NEAREST = { above: 16, below: 55 } as const;
const FADE = 0.63;
const pc = (n: number) => `${Math.round(n * 1000) / 10}%`;

/**
 * The still horizon: one of the desktop's backgrounds. A line, two level rules above it for intent
 * and two below for knowledge, and a little of the floor's light around the line. Nothing in it
 * moves. Where the line and the rules sit can be set; the defaults are the app bar mockup's.
 */
export function Horizon({ floor = 'you', away, line = 0.5, above = [0.24, 0.18], below = [0.74, 0.82], glow = true, className, style, ...rest }: HorizonProps) {
  const rule = (side: 'above' | 'below') => (at: number, i: number) => (
    <i key={`${side}-${i}`} className={`aerie-horizon-rule aerie-horizon-${side}`} style={{ '--at': pc(at), '--rule': `${Math.round(NEAREST[side] * FADE ** i)}%` } as CSSProperties} />
  );
  return (
    <div
      className={cx('aerie-horizon', className)}
      data-floor={floor}
      data-away={away ? '' : undefined}
      aria-hidden="true"
      style={{ '--line-at': pc(line), ...style } as CSSProperties}
      {...rest}
    >
      {glow ? <i className="aerie-horizon-glow" /> : null}
      {above.map(rule('above'))}
      <i className="aerie-horizon-line" />
      {below.map(rule('below'))}
    </div>
  );
}
