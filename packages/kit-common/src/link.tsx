import { Link as AriaLink, type LinkProps as AriaLinkProps } from 'react-aria-components';
import type { ReactNode } from 'react';
import { cx } from './cx.js';

export interface LinkProps extends Omit<AriaLinkProps, 'className' | 'style' | 'children' | 'isDisabled'> {
  /** The words to follow: say where it goes ("the harbour survey"), never "click here". */
  children: ReactNode;
  className?: string;
}

/**
 * A link in running text or on its own (Key, picked 6 Nov 2026). Never underlined: the words are ink in a
 * heavier weight, and pointing at them lifts them as a soft key, the way a picked row comes up in a table.
 * A link that leaves AUGUR looks the same as one that stays. For an action rather than a place, use a
 * Button.
 */
export function Link({ children, className, ...rest }: LinkProps) {
  return (
    <AriaLink {...rest} className={cx('augur-link', className)}>
      {children}
    </AriaLink>
  );
}
