import { useContext, useRef, useState, type ReactNode } from 'react';
import { Checkbox as AriaCheckbox, CheckboxGroup as AriaCheckboxGroup, CheckboxGroupStateContext } from 'react-aria-components';
import { cx } from './cx.js';
import { FieldHead, FieldHint, NEEDS_YOU, useFieldCheck, useMessage, useValue, type FieldProps } from './field.js';
import { Icon } from './icon.js';
import { useReason, warnNoReason } from './reason.js';

export interface CheckboxProps {
  /** What ticking it means. */
  children: ReactNode;
  /** A quiet fact on the right ("12 people"). */
  detail?: string;
  /** In a group: the value it adds. */
  value?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** Why it can't be ticked, in one sentence. */
  reason?: string;
  name?: string;
  className?: string;
}

/**
 * A choice that waits for the form's primary. The box is a small well; ticked,
 * a light key comes up in it.
 * A choice that acts at once is a Toggle. A Dialog collects it as `true` or `false`.
 */
export function Checkbox({ children, detail, value, checked, defaultChecked, onChange, disabled, reason, name, className }: CheckboxProps) {
  const { reasoned, describe, caption } = useReason(disabled, reason);
  const key = useRef({});
  warnNoReason(key.current, `Checkbox "${typeof children === 'string' ? children : value ?? ''}"`, disabled, reason);
  const grouped = useContext(CheckboxGroupStateContext) != null;
  const box = useRef<HTMLInputElement>(null);
  const ticked = useRef(defaultChecked ?? false);
  // In a group, the group reports for it.
  useFieldCheck({ check: () => true, focus: () => box.current?.focus(), name: grouped ? undefined : name, value: () => String(checked ?? ticked.current) });
  return (
    <div className={cx('augur-check-wrap augur-control relative', className)} data-unavailable={disabled || undefined}>
      <AriaCheckbox
        {...describe}
        value={value}
        isSelected={checked}
        defaultSelected={defaultChecked}
        onChange={(next) => {
          ticked.current = next;
          onChange?.(next);
        }}
        isDisabled={disabled && !reasoned}
        isReadOnly={reasoned}
        name={name}
        inputRef={box}
        className="augur-check"
      >
        <span className="augur-check-box" aria-hidden="true">
          <Icon name="check" size={14} className="augur-tick" />
        </span>
        <span className="augur-check-text">
          {children}
          {detail ? <em>{detail}</em> : null}
        </span>
      </AriaCheckbox>
      {caption}
    </div>
  );
}

export interface CheckboxGroupProps extends Omit<FieldProps, 'state'> {
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  /** The most that can be ticked. Once reached, the rest say why they can't be. */
  max?: number;
  /** Shown on the rest once `max` is reached. Defaults to a sentence with the number. */
  maxReason?: (max: number) => string;
  name?: string;
  /** Checkbox elements, each with a `value`. */
  children: ReactNode;
}

/** Several choices under one label. A Dialog collects the ticked values joined with commas. */
export function CheckboxGroup({ label, hint, required, optional, disabled, reason, message, className, value, defaultValue = [], onChange, max = 0, maxReason, name, children }: CheckboxGroupProps) {
  const [values, setValues] = useValue(value, defaultValue, onChange);
  const atMost = max > 0 && values.length >= max;
  const [asked, setAsked] = useState(false);
  const gap = Boolean(asked && required && !values.length);
  const said = message || (gap ? NEEDS_YOU : atMost ? (maxReason ?? ((n) => `That’s ${n}, the most you can choose.`))(max) : '');
  const { describedBy, line } = useMessage(said);
  const { reasoned, describe, caption } = useReason(disabled, reason);
  const boxes = useRef<HTMLDivElement>(null);
  useFieldCheck({
    check: () => {
      if (!required || values.length || disabled) return true;
      setAsked(true);
      return false;
    },
    focus: () => boxes.current?.querySelector('input')?.focus(),
    name,
    value: () => values.join(','),
  });
  return (
    <AriaCheckboxGroup
      className={cx('augur-field augur-control relative', className)}
      data-state={gap ? 'attention' : undefined}
      data-unavailable={disabled || undefined}
      data-at-most={atMost || undefined}
      value={values}
      onChange={(next) => setValues(max > 0 && next.length > max ? values : next)}
      isRequired={required}
      isDisabled={disabled && !reasoned}
      isReadOnly={reasoned}
      isInvalid={gap}
      validationBehavior="aria"
      name={name}
      aria-describedby={[describe['aria-describedby'], describedBy].filter(Boolean).join(' ') || undefined}
    >
      <FieldHead label={label} required={required} optional={optional} />
      <FieldHint hint={hint} />
      <div ref={boxes} className="augur-checks">
        {children}
      </div>
      {line()}
      {caption}
    </AriaCheckboxGroup>
  );
}
