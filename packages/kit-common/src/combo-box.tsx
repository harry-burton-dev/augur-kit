import { useRef, useState } from 'react';
import { Button, ComboBox as AriaComboBox, Input, ListBox, ListBoxItem, Popover, type Key } from 'react-aria-components';
import { cx } from './cx.js';
import { FieldHead, FieldHint, NEEDS_YOU, shownState, useMessage, useValue, useFieldCheck, type FieldProps, type FieldState } from './field.js';
import { Icon } from './icon.js';
import { useReason, warnNoReason } from './reason.js';
import type { SelectOption } from './select.js';

export interface ComboBoxProps extends FieldProps {
  /** Everything it can find. Strings are their own label. */
  options: (SelectOption | string)[];
  /** The chosen option's value. */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  /** What it says before anything is typed. */
  placeholder?: string;
  /** Small capitals over the list, naming what it holds ("Departments"). */
  heading?: string;
  /** What the list says when nothing matches what was typed. */
  empty?: string;
  name?: string;
  readOnly?: boolean;
  busy?: boolean;
}

const normalise = (options: (SelectOption | string)[]): SelectOption[] => options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));

/** The letters of a label that match what was typed, in full ink; the rest stays quiet. */
function MatchText({ text, typed }: { text: string; typed: string }) {
  const at = typed ? text.toLowerCase().indexOf(typed.toLowerCase()) : -1;
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <b className="augur-match">{text.slice(at, at + typed.length)}</b>
      {text.slice(at + typed.length)}
    </>
  );
}

/**
 * Type to find one choice in a long list (departments, floors, apps), where a Select would have to scroll.
 * A TextField's well with a chevron key at its end; as you type, a sheet opens under it holding only what
 * matches, with the letters you typed in full ink and a count at its foot ("4 of 31"). Keys, filtering
 * and the list's placement come from React Aria; the list opens above everything, so a dialog never clips it.
 */
export function ComboBox({
  label, hint, required, optional, disabled, reason, state, message, className,
  options, value, defaultValue = null, onChange, placeholder = 'Type to find one', heading, empty = 'Nothing matches that.', name, readOnly, busy,
}: ComboBoxProps) {
  const items = normalise(options);
  const [picked, setPicked] = useValue<string | null>(value, defaultValue);
  const labelOf = (v: string | null) => items.find((o) => o.value === v)?.label ?? '';
  const [typed, setTyped] = useState(() => labelOf(picked));
  const [own, setOwn] = useState<{ state: FieldState; message?: string }>({ state: 'idle' });
  const shown = shownState(state, message, own);
  const { reasoned, describe, caption } = useReason(disabled, reason);
  const { describedBy, line } = useMessage(shown.message);
  const input = useRef<HTMLInputElement>(null);
  const key = useRef({});
  warnNoReason(key.current, `ComboBox "${label}"`, disabled, reason);
  useFieldCheck({
    check: () => {
      if (!required || picked != null || disabled || readOnly) return true;
      setOwn({ state: 'attention', message: NEEDS_YOU });
      return false;
    },
    focus: () => input.current?.focus(),
    name,
    value: () => picked ?? '',
  });
  // What matches what was typed, unless what's typed is the chosen option's own label (then show everything).
  const filter = typed && typed !== labelOf(picked) ? typed : '';
  const shownItems = filter ? items.filter((o) => o.label.toLowerCase().includes(filter.toLowerCase())) : items;

  return (
    <AriaComboBox
      className={cx('augur-field augur-control relative', className)}
      data-state={shown.state}
      data-busy={busy || undefined}
      data-readonly={readOnly || undefined}
      data-unavailable={disabled || undefined}
      items={shownItems}
      inputValue={typed}
      onInputChange={(v) => {
        setTyped(v);
        if (own.state !== 'idle') setOwn({ state: 'idle' });
      }}
      selectedKey={picked}
      onSelectionChange={(k: Key | null) => {
        const next = k == null ? null : String(k);
        if (next == null && typed) return;
        setPicked(next);
        setTyped(labelOf(next));
        setOwn({ state: 'idle' });
        onChange?.(next);
      }}
      onBlur={() => {
        if (required && picked == null && !reasoned && !readOnly) setOwn({ state: 'attention', message: NEEDS_YOU });
      }}
      disabledKeys={items.filter((o) => o.disabled).map((o) => o.value)}
      menuTrigger="input"
      allowsEmptyCollection
      isRequired={required}
      isDisabled={disabled && !reasoned}
      isReadOnly={readOnly || reasoned || busy}
      isInvalid={shown.state === 'error' || shown.state === 'attention'}
      validationBehavior="aria"
      name={name}
    >
      <FieldHead label={label} required={required} optional={optional} />
      <FieldHint hint={hint} />
      <div className="augur-field-box augur-combo-box">
        <Input
          ref={input}
          className="augur-input"
          placeholder={placeholder}
          {...describe}
          aria-describedby={[describe['aria-describedby'], describedBy].filter(Boolean).join(' ') || undefined}
        />
        <Button className="augur-end-key" aria-label={`Show every ${label.toLowerCase()}`}>
          <Icon name="chevron-down" size={16} />
        </Button>
      </div>
      {line()}
      {caption}
      <Popover className="augur-popover augur-sheet-list" offset={6}>
        {heading ? <p className="augur-sheet-heading">{heading}</p> : null}
        <ListBox className="outline-none" renderEmptyState={() => <p className="augur-sheet-empty">{empty}</p>}>
          {(o: SelectOption) => (
            <ListBoxItem id={o.value} textValue={o.label} className="augur-option" data-matching={filter ? '' : undefined}>
              {({ isSelected }) => (
                <>
                  <span className="augur-option-mark" aria-hidden="true">
                    {isSelected ? <Icon name="check" size={14} /> : null}
                  </span>
                  <span className="augur-option-label">
                    <MatchText text={o.label} typed={filter} />
                  </span>
                  {o.detail ? <em className="augur-option-detail">{o.detail}</em> : null}
                </>
              )}
            </ListBoxItem>
          )}
        </ListBox>
        <p className="augur-sheet-foot">{`${shownItems.length} of ${items.length}`}</p>
      </Popover>
    </AriaComboBox>
  );
}
