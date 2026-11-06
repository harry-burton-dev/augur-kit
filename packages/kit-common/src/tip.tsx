import type { ComponentProps, ReactNode } from 'react';
import { Focusable, Tooltip, TooltipTrigger } from 'react-aria-components';

export interface TipProps {
  /** What the tip says: a name in full, or why something can't be used. */
  content: ReactNode;
  /** One focusable DOM element (a link, a span with tabIndex): the tip shows on hover and on keyboard focus. */
  children: ComponentProps<typeof Focusable>['children'];
  placement?: 'top' | 'bottom' | 'start' | 'end';
  /** Shown from the start, until the pointer or focus leaves: for a first-run hint, or a still of it. */
  defaultOpen?: boolean;
}

/**
 * A short tip for any part, on hover and focus, after a moment. Use it for a
 * name that's cut off, or for what a mark means. Never put the only way to do
 * something in a tip. A disabled control explains itself with its own
 * `reason`, not a Tip.
 */
export function Tip({ content, children, placement = 'top', defaultOpen }: TipProps) {
  return (
    <TooltipTrigger delay={600} closeDelay={100} defaultOpen={defaultOpen}>
      <Focusable>{children}</Focusable>
      <Tooltip placement={placement} offset={6} className="augur-tip">
        {content}
      </Tooltip>
    </TooltipTrigger>
  );
}
