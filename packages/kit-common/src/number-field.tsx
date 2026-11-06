import { useRef, useState } from 'react';
import { Button, Group, Input, NumberField as AriaNumberField } from 'react-aria-components';
import { cx } from './cx.js';
import { FieldHead, FieldHint, NEEDS_YOU, StateMark, shownState, useMessage, useFieldCheck, type FieldCheck, type FieldProps, type FieldState } from './field.js';
import { Icon } from './icon.js';
import { useReason, warnNoReason } from './reason.js';

export interface NumberFieldProps extends FieldProps {
  value?: number | null;
  defaultValue?: number | null;
  /** After each step, and on leaving the field once typed. */
  onChange?: (value: number | null) => void;
  /** The floor: the less key stops here. */
  min?: number;
  /** The ceiling: the more key stops here. */
  max?: number;
  /** How far one press of a key moves it. */
  step?: number;
  /** What it counts, after the number in small capitals ("GB", "people"). */
  unit?: string;
  /** How the number is written, in the person's language (decimals, percent, currency). */
  formatOptions?: Intl.NumberFormatOptions;
  placeholder?: string;
  name?: string;
  readOnly?: boolean;
  /** Return a check for the value, or null when it's fine. Runs when it changes. */
  validate?: (value: number) => FieldCheck | null;
}

/**
 * A limit, a count or an amount. The number sits in mono in a TextField's well with its unit after it, and
 * two small keys at the well's end step it down and up; held, a key repeats, and it stops at the floor and
 * the ceiling. Arrow keys and the wheel step it too; typing checks it when you leave. The parsing, the
 * steps and the person's number format come from React Aria.
 */
export function NumberField({
  label, hint, required, optional, disabled, reason, state, message, className,
  value, defaultValue = null, onChange, min, max, step = 1, unit, formatOptions, placeholder, name, readOnly, validate,
}: NumberFieldProps) {
  const [own, setOwnValue] = useState<number | null>(defaultValue);
  const current = value === undefined ? own : value;
  const [check, setCheck] = useState<{ state: FieldState; message?: string }>({ state: 'idle' });
  const shown = shownState(state, message, check);
  const { reasoned, describe, caption } = useReason(disabled, reason);
  const { describedBy, line } = useMessage(shown.message);
  const input = useRef<HTMLInputElement>(null);
  const key = useRef({});
  warnNoReason(key.current, `NumberField "${label}"`, disabled, reason);

  const run = (v: number | null) => {
    if (v == null || Number.isNaN(v)) {
      setCheck(required ? { state: 'attention', message: NEEDS_YOU } : { state: 'idle' });
      return !required;
    }
    const result = validate?.(v) ?? null;
    setCheck(result ? { state: result.state, message: result.message } : { state: 'idle' });
    return result?.state !== 'error';
  };
  useFieldCheck({ check: () => disabled || readOnly || run(current), focus: () => input.current?.focus(), name, value: () => (current == null ? '' : String(current)) });

  return (
    <AriaNumberField
      className={cx('augur-field augur-control relative augur-number', className)}
      data-state={shown.state}
      data-readonly={readOnly || undefined}
      data-unavailable={disabled || undefined}
      value={current ?? Number.NaN}
      onChange={(v) => {
        const next = Number.isNaN(v) ? null : v;
        if (value === undefined) setOwnValue(next);
        run(next);
        onChange?.(next);
      }}
      minValue={min}
      maxValue={max}
      step={step}
      formatOptions={formatOptions}
      isRequired={required}
      isDisabled={disabled && !reasoned}
      isReadOnly={readOnly || reasoned}
      isInvalid={shown.state === 'error' || shown.state === 'attention'}
      validationBehavior="aria"
      name={name}
      aria-describedby={[describe['aria-describedby'], describedBy].filter(Boolean).join(' ') || undefined}
    >
      <FieldHead label={label} required={required} optional={optional} />
      <FieldHint hint={hint} />
      <Group className="augur-field-box augur-number-box">
        <Input ref={input} className="augur-input augur-number-input" placeholder={placeholder} aria-disabled={describe['aria-disabled']} />
        {unit ? (
          <span className="augur-unit" aria-hidden="true">
            {unit}
          </span>
        ) : null}
        <StateMark state={shown.state} />
        {readOnly || reasoned ? null : (
          <span className="augur-step-keys">
            <Button slot="decrement" className="augur-end-key">
              <Icon name="minus" size={14} />
            </Button>
            <Button slot="increment" className="augur-end-key">
              <Icon name="plus" size={14} />
            </Button>
          </span>
        )}
      </Group>
      {line()}
      {caption}
    </AriaNumberField>
  );
}
