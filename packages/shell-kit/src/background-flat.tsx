import type { HTMLAttributes } from 'react';
import { cx } from '@augur/kit-common';
import type { FloorTone } from './floors.js';

export interface FlatProps extends HTMLAttributes<HTMLDivElement> {
  /** Whose floor you're on. Only used when `tinted`. */
  floor?: FloorTone;
  /** An app is open: the ground steps out of the way. */
  away?: boolean;
  /** A trace of the floor's colour in the grey. Off by default: flat ground carries no colour. */
  tinted?: boolean;
}

/**
 * Flat ground: one of the desktop's backgrounds, and what apps sit on (calm layout, PDR-014). One
 * grey with nothing drawn on it and nothing moving.
 */
export function Flat({ floor = 'you', away, tinted, className, ...rest }: FlatProps) {
  return <div className={cx('aerie-flat', className)} data-floor={floor} data-tinted={tinted ? '' : undefined} data-away={away ? '' : undefined} aria-hidden="true" {...rest} />;
}
