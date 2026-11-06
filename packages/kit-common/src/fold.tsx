import { useRef, type ReactNode } from 'react';
import { Button as AriaButton, Disclosure, DisclosureGroup, DisclosurePanel, Heading as AriaHeading, type Key } from 'react-aria-components';
import { cx } from './cx.js';
import { Icon } from './icon.js';
import { useReason, warnNoReason } from './reason.js';

export interface FoldsProps {
  /** Let more than one fold be open at once. By default opening one shuts the other. */
  multiple?: boolean;
  /** Which folds start open (uncontrolled). */
  defaultOpen?: string[];
  /** Which folds are open (controlled), with `onOpenChange`. */
  open?: string[];
  onOpenChange?: (open: string[]) => void;
  className?: string;
  /** The `Fold`s. */
  children: ReactNode;
}

/**
 * A run of folds (Drawer, picked 6 Nov 2026): they sit in a sunken tray like the Key tabs, and the open
 * one rises as a key with what it holds opening under it in a Well. Folds keep a long settings or details
 * page to one screen. Keyboard and screen reader behaviour come from React Aria's disclosure group.
 */
export function Folds({ multiple, defaultOpen, open, onOpenChange, className, children }: FoldsProps) {
  return (
    <DisclosureGroup
      className={cx('augur-folds', className)}
      allowsMultipleExpanded={multiple}
      defaultExpandedKeys={defaultOpen}
      expandedKeys={open}
      onExpandedChange={onOpenChange ? (keys: Set<Key>) => onOpenChange([...keys].map(String)) : undefined}
    >
      {children}
    </DisclosureGroup>
  );
}

export interface FoldProps {
  /** Its key in the set, for `defaultOpen` and `open`. */
  id: string;
  /** The heading: what the fold holds. */
  title: string;
  /** What's inside in a few words, shown on the heading so you can tell without opening ("3 on", "2.4 GB of 10 GB"). */
  summary?: ReactNode;
  /** Something inside is waiting on you: a green mark before the summary. */
  needs?: boolean;
  /** The heading level, for the page's outline. */
  level?: 2 | 3 | 4 | 5 | 6;
  /** Can't be opened now; it stays in the set, and `reason` says why under it. */
  disabled?: boolean;
  reason?: string;
  /** An icon before the title, such as `<Icon name="bell" size={16} />`. Any node, so the icon set can change. */
  icon?: ReactNode;
  className?: string;
  /** What the fold holds. */
  children?: ReactNode;
}

/** One fold in `Folds`: a heading that opens what it holds. An unavailable fold stays in the set, focusable, and says why. */
export function Fold({ id, title, summary, needs, level = 3, disabled, reason, icon, className, children }: FoldProps) {
  const key = useRef({});
  warnNoReason(key.current, `Fold "${title}"`, disabled, reason);
  const { describe } = useReason(disabled, reason);
  const whyId = (describe as { 'aria-describedby'?: string })['aria-describedby'];
  const head = (
    <>
      <span className="augur-fold-mark" aria-hidden="true">
        <Icon name={disabled ? 'lock' : 'chevron-right'} size={16} />
      </span>
      {icon ? (
        <span className="augur-fold-icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="augur-fold-title">{title}</span>
      {summary || needs ? (
        <span className="augur-fold-sum">
          {needs ? <i className="augur-fold-needs" aria-hidden="true" /> : null}
          {summary}
        </span>
      ) : null}
    </>
  );
  if (disabled) {
    return (
      <div className={cx('augur-fold', className)} data-unavailable="">
        <AriaHeading level={level} className="augur-fold-h">
          <button type="button" className="augur-fold-head" aria-expanded={false} aria-disabled="true" aria-describedby={whyId}>
            {head}
          </button>
        </AriaHeading>
        {reason ? (
          <p className="augur-fold-why" id={whyId}>
            {reason}
          </p>
        ) : null}
      </div>
    );
  }
  return (
    <Disclosure id={id} className={cx('augur-fold', className)}>
      <AriaHeading level={level} className="augur-fold-h">
        <AriaButton slot="trigger" className="augur-fold-head">
          {head}
        </AriaButton>
      </AriaHeading>
      <DisclosurePanel className="augur-fold-body">{children}</DisclosurePanel>
    </Disclosure>
  );
}
