import type { ReactNode } from 'react';
import { cx } from './cx.js';

export interface KeyCapProps {
  /** The key as it is printed on the keyboard ("/", "Esc", "Enter"). */
  children?: ReactNode;
  /** A combination, pressed together ("Ctrl", "K"): one key cap each, side by side. Use instead of `children`. */
  keys?: string[];
  className?: string;
}

/**
 * A key to press, drawn as a small real key (Key, picked 6 Nov 2026): the Keycap button at its smallest,
 * mono, with a thicker bottom edge. Use it in a sentence ("Press / to find"), at the end of a menu row, or
 * in a field that a key brings you to. Say the key as it's printed; a combination goes in `keys`.
 */
export function KeyCap({ children, keys, className }: KeyCapProps) {
  if (keys && keys.length > 1) {
    return (
      <kbd className={cx('augur-keys', className)}>
        {keys.map((k) => (
          <kbd key={k} className="augur-key-cap">
            {k}
          </kbd>
        ))}
      </kbd>
    );
  }
  return <kbd className={cx('augur-key-cap', className)}>{keys?.[0] ?? children}</kbd>;
}
