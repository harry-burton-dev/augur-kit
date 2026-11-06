import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button as AriaButton, type ButtonProps as AriaButtonProps, type PressEvent } from 'react-aria-components';
import { cx } from './cx.js';
import { useReason, warnNoReason } from './reason.js';
import { ms } from './timing.js';

export type ButtonKind = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';

export interface ButtonProps extends Omit<AriaButtonProps, 'isDisabled' | 'isPending' | 'children' | 'className' | 'style'> {
  /** One primary per screen. Danger asks twice. */
  kind?: ButtonKind;
  size?: 'md' | 'sm';
  /** Marks an action that asks the AI (Bubble). Only primary and secondary take it. */
  ai?: boolean;
  disabled?: boolean;
  /** Why it is disabled, in one sentence. With one, it stays focusable and the reason shows on hover and focus. */
  reason?: string;
  /** Working: the press is taken but does nothing more, and it says so. */
  busy?: boolean;
  /** What it says while busy, in place of its label. */
  busyLabel?: string;
  /** Danger only: act on the first press, for a danger button already inside a confirmation. */
  once?: boolean;
  /** Danger only: how long a first press stays armed, in ms. Defaults to the `motion-still` token. */
  armFor?: number;
  /** Danger only: what the armed button says, naming what the second press does ("Press again to delete"). Defaults to "Press again to confirm". */
  confirmLabel?: string;
  /** Danger only: told when a first press arms it (true) and when it goes back, by a second press, Esc, leaving it or the time running out (false). */
  onArmedChange?: (armed: boolean) => void;
  /** An icon before the label, such as `<Icon name="plus" size={16} />`. Pass any node, so the icon set can change; it is decoration, and the label still names the action. */
  icon?: ReactNode;
  className?: string;
  /** The label: name it for what it does ("Publish", never "OK"). */
  children?: ReactNode;
}

/**
 * A labelled action, drawn as a key: flat, with its depth in a thicker bottom line
 * that closes when pressed (Keycap). Its press, focus and keyboard
 * behaviour come from React Aria. A danger button asks twice: the first press
 * arms it (`confirmLabel`, "Press again to confirm"), a second within `armFor` acts, and Esc,
 * leaving it or the time running out puts it back.
 */
export function Button({ kind = 'secondary', size = 'md', ai, disabled, reason, busy, busyLabel, once, armFor, confirmLabel, onArmedChange, icon, className, children, onPress, ...rest }: ButtonProps) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { reasoned, describe, caption } = useReason(disabled, reason);
  const asks = kind === 'danger' && !once;
  const hold = armFor ?? ms('motion-still');
  const key = useRef({});
  warnNoReason(key.current, `Button "${typeof children === 'string' ? children : kind}"`, disabled, reason);

  const armedNow = useRef(false);
  const setArm = (on: boolean) => {
    if (armedNow.current === on) return;
    armedNow.current = on;
    setArmed(on);
    onArmedChange?.(on);
  };
  const disarm = () => {
    clearTimeout(timer.current);
    setArm(false);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  const press = (e: PressEvent) => {
    if (disabled || busy) return;
    if (asks && !armed) {
      setArm(true);
      timer.current = setTimeout(disarm, hold);
      return;
    }
    disarm();
    onPress?.(e);
  };

  return (
    <span className={cx('augur-control relative inline-block', className)}>
      <AriaButton
        {...rest}
        {...describe}
        isDisabled={disabled && !reasoned}
        isPending={busy}
        onPress={press}
        onBlur={(e) => {
          disarm();
          rest.onBlur?.(e);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && armed) {
            e.preventDefault();
            e.stopPropagation();
            disarm();
          } else e.continuePropagation();
          rest.onKeyDown?.(e);
        }}
        data-kind={kind}
        data-size={size}
        data-armed={armed || undefined}
        data-ai={(ai && (kind === 'primary' || kind === 'secondary')) || undefined}
        data-unavailable={disabled || undefined}
        className="augur-button relative inline-flex items-center justify-center gap-2 font-sans whitespace-nowrap cursor-pointer select-none outline-none"
      >
        {busy ? <span className="augur-spinner" aria-hidden="true" /> : null}
        {armed ? (
          <>
            <span>{confirmLabel ?? 'Press again to confirm'}</span>
            <span className="augur-count" style={{ animationDuration: `${hold}ms` }} aria-hidden="true" />
          </>
        ) : busy && busyLabel ? (
          <span>{busyLabel}</span>
        ) : (
          <>
            {icon && !busy ? <span className="augur-button-icon" aria-hidden="true">{icon}</span> : null}
            {children}
          </>
        )}
      </AriaButton>
      {caption}
      {asks ? (
        // Said once when it arms, by a polite status beside the button rather than the button itself.
        <span role="status" className="sr-only">
          {armed ? (confirmLabel ?? 'Press again to confirm') : ''}
        </span>
      ) : null}
    </span>
  );
}
