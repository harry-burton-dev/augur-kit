import { useId, useRef, useState } from 'react';
import { Input, TextField as AriaTextField } from 'react-aria-components';
import { FieldHead, FieldHint, NEEDS_YOU, cx, shownState, useFieldCheck, useMessage, type FieldProps, type FieldState } from '@augur/kit-common';
import { DateField } from './date.js';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * A time said in words, as people say it: "9", "9am", "2.30pm", "14:30", "1430", "half 2", "quarter past 3",
 * "quarter to 5", "noon", "midnight". Returns HH:MM on a 24-hour clock, or null. An hour from 1 to 6 said
 * alone ("half 2", "3") is in the afternoon, as people mean it at work.
 */
export const parseTime = (text: string): string | null => {
  const t = text.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!t) return null;
  if (t === 'noon' || t === 'midday') return '12:00';
  if (t === 'midnight') return '00:00';
  const said = /^(half|quarter) (past |to )?(\d{1,2})$/.exec(t);
  if (said) {
    let h = Number(said[3]);
    if (h < 1 || h > 12) return null;
    if (h <= 6) h += 12;
    if (said[1] === 'half') {
      if (said[2] === 'to ') return null;
      return `${pad(h)}:30`;
    }
    return said[2] === 'to ' ? `${pad(h - 1)}:45` : `${pad(h)}:15`;
  }
  const m = /^(\d{1,2})(?:[:.]?(\d{2}))? ?(am|pm|a|p)?$/.exec(t);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  const half = m[3]?.[0];
  if (min > 59 || h > 23 || (half && (h < 1 || h > 12))) return null;
  if (half === 'p' && h < 12) h += 12;
  if (half === 'a' && h === 12) h = 0;
  if (!half && !m[2] && h >= 1 && h <= 6) h += 12;
  return `${pad(h)}:${pad(min)}`;
};

export interface TimeFieldProps extends FieldProps {
  /** HH:MM on a 24-hour clock, or empty. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** What it says while empty. */
  placeholder?: string;
  name?: string;
}

/**
 * A time of day, written as you'd say it ("9am", "half 2", "17:30"), like Quill's DateField. While you
 * write, the well echoes in mono the time it reads, so you see "14:30" before you leave; something it
 * can't read turns it red with an example. Its value is HH:MM. Takes part in a Dialog's checks like TextField.
 */
export function TimeField({ label, hint, required, optional, disabled, state, message, className, value: given, defaultValue, onChange, placeholder = '9am, half 2, 17:30', name }: TimeFieldProps) {
  const [own, setOwn] = useState(defaultValue ?? '');
  const value = given ?? own;
  const [draft, setDraft] = useState<string | undefined>(undefined);
  const [check, setCheck] = useState<{ state: FieldState; message?: string }>({ state: 'idle' });
  const shown = shownState(state, message, check);
  const { describedBy, line } = useMessage(shown.message);
  const input = useRef<HTMLInputElement>(null);
  const typing = draft !== undefined;
  const reading = typing ? parseTime(draft) : null;
  // Enter commits and a Dialog checks in the same tick, before `value` has moved.
  const latest = useRef(value);
  latest.current = value;

  const choose = (time: string) => {
    setDraft(undefined);
    setCheck({ state: 'idle' });
    if (time === latest.current) return;
    latest.current = time;
    if (given === undefined) setOwn(time);
    onChange?.(time);
  };
  /** Takes what was typed. Gives the time, empty for none, or null when it can't be read. */
  const commit = () => {
    const text = draft ?? '';
    const time = text.trim() ? parseTime(text) : '';
    if (time === null) setCheck({ state: 'error', message: 'Try “9am”, “half 2” or “17:30”.' });
    else choose(time);
    return time;
  };
  useFieldCheck({
    check: () => {
      const time = typing ? commit() : latest.current;
      if (time === null) return false;
      if (required && !time) {
        setCheck({ state: 'attention', message: NEEDS_YOU });
        return false;
      }
      return true;
    },
    focus: () => input.current?.focus(),
    name,
    value: () => latest.current,
  });
  return (
    <AriaTextField
      className={cx('augur-field augur-control relative quill-time', className)}
      data-state={shown.state}
      data-unavailable={disabled || undefined}
      value={typing ? draft : value}
      onChange={(v) => {
        setDraft(v);
        if (check.state !== 'idle') setCheck({ state: 'idle' });
      }}
      onFocus={() => setDraft(value)}
      onBlur={() => typing && commit()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && typing) commit();
        // A Dialog around it takes Enter too: it presses the primary.
        e.continuePropagation();
      }}
      isDisabled={disabled}
      isRequired={required}
      isInvalid={shown.state === 'error' || shown.state === 'attention'}
      validationBehavior="aria"
      name={name}
      aria-describedby={describedBy}
    >
      <FieldHead label={label} required={required} optional={optional} />
      <FieldHint hint={hint} />
      <div className="augur-field-box">
        <Input ref={input} className="augur-input quill-time-input" placeholder={placeholder} autoComplete="off" />
        {typing && reading && reading !== draft ? (
          <span className="quill-echo" aria-live="polite">
            {reading}
          </span>
        ) : null}
      </div>
      {line()}
    </AriaTextField>
  );
}

export interface DateRange {
  /** YYYY-MM-DD, or empty. */
  from: string;
  /** YYYY-MM-DD, or empty. */
  to: string;
}

export interface DateRangeFieldProps extends Pick<FieldProps, 'label' | 'hint' | 'required' | 'optional' | 'disabled' | 'className'> {
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (value: DateRange) => void;
  /** The names of its two ends. */
  fromLabel?: string;
  toLabel?: string;
  /** Today, for words like "friday" and "+1w". */
  now?: Date;
}

const DAY = 86_400_000;
const span = (from: string, to: string) => Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY) + 1;

/**
 * A range of days, for leave, schedules and "from and to" filters: two DateFields written in words, joined
 * by a line, and under them how many days it spans, counted inclusive. An end before the start turns the
 * end red and says so.
 */
export function DateRangeField({ label, hint, required, optional, disabled, className, value: given, defaultValue, onChange, fromLabel = 'From', toLabel = 'To', now = new Date() }: DateRangeFieldProps) {
  const [own, setOwn] = useState<DateRange>(defaultValue ?? { from: '', to: '' });
  const range = given ?? own;
  const id = useId();
  const set = (next: DateRange) => {
    if (given === undefined) setOwn(next);
    onChange?.(next);
  };
  const backwards = !!range.from && !!range.to && range.to < range.from;
  return (
    <div className={cx('quill-range', className)} role="group" aria-labelledby={id}>
      <div className="augur-field-head">
        <span className="augur-field-label" id={id}>
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
      {hint ? <p className="augur-hint">{hint}</p> : null}
      <div className="quill-range-pair">
        <DateField label={fromLabel} quick={[]} required={required} disabled={disabled} value={range.from} onChange={(v) => set({ ...range, from: v })} now={now} />
        <span className="quill-range-join" aria-hidden="true" />
        <DateField
          label={toLabel}
          quick={[]}
          required={required}
          disabled={disabled}
          value={range.to}
          onChange={(v) => set({ ...range, to: v })}
          now={now}
          state={backwards ? 'error' : undefined}
          message={backwards ? `Ends before it starts.` : undefined}
        />
      </div>
      {range.from && range.to && !backwards ? <p className="quill-range-total">{span(range.from, range.to) === 1 ? '1 day' : `${span(range.from, range.to)} days`}</p> : null}
    </div>
  );
}
