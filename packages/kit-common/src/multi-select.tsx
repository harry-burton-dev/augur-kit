import { useId, useRef, useState } from 'react';
import { Button, Dialog, DialogTrigger, ListBox, ListBoxItem, Popover, type Selection } from 'react-aria-components';
import { cx } from './cx.js';
import { FieldHint, NEEDS_YOU, shownState, useMessage, useValue, useFieldCheck, type FieldProps, type FieldState } from './field.js';
import { Icon } from './icon.js';
import { useReason, warnNoReason } from './reason.js';
import type { SelectOption } from './select.js';

export interface MultiSelectProps extends FieldProps {
  /** The set to choose from (up to about 12; for more, filter first). Strings are their own label. */
  options: (SelectOption | string)[];
  /** The chosen options' values, in the options' order. */
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  /** What it says while nothing is chosen, which usually means "all" ("Any floor"). */
  placeholder?: string;
  /** Small capitals over the list, naming what it holds ("Floors"). */
  heading?: string;
  name?: string;
  readOnly?: boolean;
}

const normalise = (options: (SelectOption | string)[]): SelectOption[] => options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));

/**
 * Pick several from a set without what you chose taking over the form. The well says what you chose in
 * words, cut short to one line, and a small key at its end holds the count. Pressed, a sheet opens under it
 * with a check well on every row and "3 of 7 chosen" at its foot; choices take effect as you tick them.
 * Required and left empty, it asks in green.
 */
export function MultiSelect({
  label, hint, required, optional, disabled, reason, state, message, className,
  options, value, defaultValue = [], onChange, placeholder = 'None chosen', heading, name, readOnly,
}: MultiSelectProps) {
  const items = normalise(options);
  const [chosen, setChosen] = useValue<string[]>(value, defaultValue, onChange);
  const [open, setOpen] = useState(false);
  const [own, setOwn] = useState<{ state: FieldState; message?: string }>({ state: 'idle' });
  const shown = shownState(state, message, own);
  const { reasoned, describe, caption } = useReason(disabled, reason);
  const { describedBy, line } = useMessage(shown.message);
  const trigger = useRef<HTMLButtonElement>(null);
  const labelId = useId();
  const key = useRef({});
  warnNoReason(key.current, `MultiSelect "${label}"`, disabled, reason);
  useFieldCheck({
    check: () => {
      if (!required || chosen.length > 0 || disabled || readOnly) return true;
      setOwn({ state: 'attention', message: NEEDS_YOU });
      return false;
    },
    focus: () => trigger.current?.focus(),
    name,
    value: () => chosen.join(','),
  });
  const words = items.filter((o) => chosen.includes(o.value)).map((o) => o.label);
  const locked = reasoned || readOnly || (disabled && !reasoned);

  return (
    <div
      className={cx('augur-field augur-control relative', className)}
      data-state={shown.state}
      data-readonly={readOnly || undefined}
      data-unavailable={disabled || undefined}
      data-open={open || undefined}
    >
      <div className="augur-field-head">
        <span className="augur-field-label" id={labelId}>
          {label}
        </span>
        {required ? (
          <span className="augur-flag">
            <i className="augur-dot" aria-hidden="true" />
            Required
          </span>
        ) : optional ? (
          <span className="augur-flag">Optional</span>
        ) : null}
      </div>
      <FieldHint hint={hint} />
      <DialogTrigger
        isOpen={open}
        onOpenChange={(next) => {
          if (next && locked) return;
          setOpen(next);
          if (!next && required && chosen.length === 0) setOwn({ state: 'attention', message: NEEDS_YOU });
        }}
      >
        <Button
          ref={trigger}
          className="augur-field-box augur-select-box"
          isDisabled={disabled && !reasoned}
          aria-labelledby={`${labelId} ${labelId}-words`}
          {...describe}
          aria-describedby={[describe['aria-describedby'], describedBy].filter(Boolean).join(' ') || undefined}
        >
          <span className="augur-select-value" id={`${labelId}-words`} data-placeholder={words.length ? undefined : ''}>
            {words.length ? words.join(', ') : placeholder}
          </span>
          {words.length ? (
            <span className="augur-count-key" aria-hidden="true">
              {words.length}
            </span>
          ) : null}
          <span className="augur-chevron" aria-hidden="true">
            <Icon name="chevron-down" size={16} />
          </span>
        </Button>
        <Popover className="augur-popover augur-sheet-list" offset={6} placement="bottom start">
          <Dialog className="outline-none" aria-labelledby={labelId}>
            {heading ? <p className="augur-sheet-heading">{heading}</p> : null}
            <ListBox
              aria-labelledby={labelId}
              className="outline-none"
              items={items}
              selectionMode="multiple"
              selectedKeys={chosen}
              disabledKeys={items.filter((o) => o.disabled).map((o) => o.value)}
              autoFocus="first"
              onSelectionChange={(keys: Selection) => {
                const next = keys === 'all' ? items.map((o) => o.value) : items.filter((o) => keys.has(o.value)).map((o) => o.value);
                setChosen(next);
                if (next.length) setOwn({ state: 'idle' });
              }}
            >
              {(o) => (
                <ListBoxItem id={o.value} textValue={o.label} className="augur-option">
                  {({ isSelected }) => (
                    <>
                      <span className="augur-option-check" data-selected={isSelected || undefined} aria-hidden="true">
                        {isSelected ? <Icon name="check" size={12} /> : null}
                      </span>
                      <span className="augur-option-label">{o.label}</span>
                      {o.detail ? <em className="augur-option-detail">{o.detail}</em> : null}
                    </>
                  )}
                </ListBoxItem>
              )}
            </ListBox>
            <p className="augur-sheet-foot">{`${chosen.length} of ${items.length} chosen`}</p>
          </Dialog>
        </Popover>
      </DialogTrigger>
      {name ? <input type="hidden" name={name} value={chosen.join(',')} /> : null}
      {line()}
      {caption}
    </div>
  );
}
