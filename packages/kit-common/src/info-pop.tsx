import type { ReactNode } from 'react';
import { Button as AriaButton, Dialog, DialogTrigger, Link, Popover } from 'react-aria-components';
import { Icon, type IconName } from './icon.js';

/** Where the pop's link goes: a page (`href`) or something the app does (`onPress`). */
export interface InfoPopLink {
  label: string;
  href?: string;
  onPress?: () => void;
}

export interface InfoPopProps {
  /** The mark's name, read aloud ("About Keep for"). */
  label: string;
  /** The pop's own heading, in small capitals ("Why this is asked"). */
  heading: string;
  /** A few lines: why, or who can. */
  children: ReactNode;
  /** One way on from here, on the pop's ruled foot ("Read the retention rule"). */
  link?: InfoPopLink;
  /** The mark's icon. */
  icon?: IconName;
  placement?: 'bottom start' | 'bottom end' | 'top start' | 'top end';
  /** Open from the start: for a still of it, or a tour. */
  defaultOpen?: boolean;
}

/**
 * The why behind something, when you ask: a Slip (picked 6 Nov 2026). Pressing
 * the mark opens a small square sheet under it, with a heading in mono, a few
 * lines and, on a ruled foot, one way on (a link a Tip can't hold). Esc,
 * pressing the mark again or pressing away closes it, and focus goes back to
 * the mark (React Aria). Put it beside a label or a setting; for a name
 * that's cut off, a Tip is enough.
 */
export function InfoPop({ label, heading, children, link, icon = 'info', placement = 'bottom start', defaultOpen }: InfoPopProps) {
  return (
    <DialogTrigger defaultOpen={defaultOpen}>
      <AriaButton className="augur-info-mark" aria-label={label}>
        <Icon name={icon} size={14} />
      </AriaButton>
      <Popover className="augur-info-pop" placement={placement} offset={6}>
        <Dialog className="outline-none" aria-label={heading}>
          <p className="augur-info-pop-head" aria-hidden="true">
            {heading}
          </p>
          <div className="augur-info-pop-text">{children}</div>
          {link ? (
            <Link className="augur-info-pop-link" href={link.href} onPress={link.onPress}>
              {link.label}
              <Icon name="arrow" size={14} />
            </Link>
          ) : null}
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
