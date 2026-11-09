import { useRef, useState, type CSSProperties, type DragEvent, type ReactNode } from 'react';
import {
  Button as AriaButton,
  Calendar,
  CalendarCell,
  CalendarGrid,
  Dialog,
  DialogTrigger,
  Heading,
  Input,
  Popover,
  TextField as AriaTextField,
} from 'react-aria-components';
import { CalendarDate, endOfMonth, getDayOfWeek, parseDate, type DateDuration } from '@internationalized/date';
import { writeDate, type AppFormats } from './formats.js';
import { useFormats } from './react-app.js';
import { FieldHead, FieldHint, Icon, NEEDS_YOU, StateMark, cx, shownState, useFieldCheck, useMessage, useReason, warnNoReason, type FieldProps, type FieldState } from '@augur/kit-common';

/** The way a day is written back into the field for editing, which parseDay reads: English words, day first. */
const TYPED = 'en-GB';
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const FRIDAY = 5;
const pad = (n: number) => String(n).padStart(2, '0');

/** A local day as YYYY-MM-DD. */
export const isoDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** The local day a moment falls on. */
const dayOf = (d: Date) => new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
/** 0 for Sunday to 6 for Saturday, whatever the locale's first day. */
const weekday = (d: CalendarDate) => getDayOfWeek(d, 'en-US');
/** A day that really exists, or null: 31 February is null, not 3 March. */
const real = (y: number, m: number, d: number) => {
  if (m < 1 || m > 12 || d < 1) return null;
  const at = new CalendarDate(y, m, d);
  return at.year === y && at.month === m && at.day === d ? at : null;
};
const read = (iso: string) => {
  try {
    return parseDate(iso.slice(0, 10));
  } catch {
    return null;
  }
};
const SHIFT: Record<string, keyof DateDuration> = { d: 'days', w: 'weeks', m: 'months', y: 'years' };

/**
 * A day typed in words, as people say it: "13 nov", "nov 13 2027", "13/11",
 * "2026-11-13", "today", "tomorrow", "friday" (the next one), "end of week",
 * "end of month", "+2w", "+3d", "-1m". Returns YYYY-MM-DD, or null. A month
 * on from 31 January is the last day of February, never 3 March.
 */
export const parseDay = (text: string, now = new Date()): string | null => {
  const t = text.trim().toLowerCase().replace(/[,.]/g, ' ').replace(/\s+/g, ' ');
  const today = dayOf(now);
  if (!t) return null;
  if (t === 'today' || t === 'now') return today.toString();
  if (t === 'tomorrow') return today.add({ days: 1 }).toString();
  if (t === 'yesterday') return today.subtract({ days: 1 }).toString();
  if (t === 'end of week') return today.add({ days: (FRIDAY - weekday(today) + 7) % 7 }).toString();
  if (t === 'end of month') return endOfMonth(today).toString();
  const shift = /^([+-])\s?(\d{1,3})\s?(d|day|days|w|wk|week|weeks|m|month|months|y|year|years)$/.exec(t);
  if (shift) {
    const n = Number(shift[2]) * (shift[1] === '-' ? -1 : 1);
    return today.add({ [SHIFT[shift[3]![0]!]!]: n }).toString();
  }
  const day = DAYS.findIndex((d) => t === d || (t.length > 3 && d === t.slice(0, 3) && /^[a-z]+$/.test(t)));
  if (day >= 0) return today.add({ days: (day - weekday(today) + 7) % 7 || 7 }).toString();
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(t);
  if (m) return real(Number(m[1]), Number(m[2]), Number(m[3]))?.toString() ?? null;
  m = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/.exec(t);
  if (m) {
    const y = m[3] ? (m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3])) : today.year;
    return real(y, Number(m[2]), Number(m[1]))?.toString() ?? null;
  }
  const words = t.split(' ').filter((w) => !DAYS.includes(w.slice(0, 3)) || /\d/.test(w) || MONTHS.includes(w.slice(0, 3)));
  const month = words.findIndex((w) => /^[a-z]+$/.test(w) && MONTHS.includes(w.slice(0, 3)));
  const numbers = words.filter((w) => /^\d+(st|nd|rd|th)?$/.test(w)).map((w) => parseInt(w, 10));
  if (month >= 0 && numbers.length >= 1 && numbers.length <= 2 && words.length === numbers.length + 1) {
    const mi = MONTHS.indexOf(words[month]!.slice(0, 3)) + 1;
    const [d, year] = numbers[0]! > 31 ? [numbers[1], numbers[0]] : numbers;
    if (!d) return null;
    return real(year ?? today.year, mi, d)?.toString() ?? null;
  }
  return null;
};

/**
 * A day in words: "Fri 13 Nov", with the year when it isn't this one. With `formats` it is written
 * the person's way (a day has no time zone, so theirs isn't applied); without, as typed back into a DateField.
 */
export const dayName = (iso: string, now = new Date(), formats?: AppFormats) => {
  const d = read(iso);
  if (!d) return iso;
  const at = new Date(d.year, d.month - 1, d.day);
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short', ...(d.year === now.getFullYear() ? {} : { year: 'numeric' }) };
  if (formats) return writeDate(at, options, { ...formats, timeZone: undefined });
  return at.toLocaleDateString(TYPED, options).replace(',', '');
};

/** How far a day is from today, in words: "today", "in 15 days", "3 days ago". */
export const dayDistance = (iso: string, now = new Date()) => {
  const d = read(iso);
  if (!d) return '';
  const n = d.compare(dayOf(now));
  if (n === 0) return 'today';
  if (n === 1) return 'tomorrow';
  if (n === -1) return 'yesterday';
  return n > 0 ? `in ${n} days` : `${-n} days ago`;
};

/** One quick choice beside the field: its words, and what it means in words `parseDay` reads. */
export interface DateQuick {
  label: string;
  value: string;
}

export const DEFAULT_QUICK: DateQuick[] = [
  { label: 'End of week', value: 'end of week' },
  { label: 'End of month', value: 'end of month' },
  { label: 'In two weeks', value: '+2w' },
];

export interface DateFieldProps extends FieldProps {
  /** YYYY-MM-DD, or empty. */
  value?: string;
  /** Where it starts when the part keeps its own value (no `value`). */
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
  /** What an empty day says when you're not typing. */
  empty?: string;
  /** Up to four quick choices. */
  quick?: DateQuick[];
  /** Today, for words and quick choices. Tests set it. */
  now?: Date;
}

/**
 * A day, said in words ("Fri 13 Nov · in 15 days") and typed in words ("13
 * nov", "friday", "+2w"), with up to four quick choices under it and a
 * calendar one press away. The calendar starts its weeks and names its
 * months in the person's language. Its value is YYYY-MM-DD. Takes part in a
 * Dialog's checks like TextField.
 */
export function DateField({ label, hint, required, optional, disabled, reason, state, message, className, value: given, defaultValue, onChange, name, empty = 'Not set', quick = DEFAULT_QUICK, now = new Date() }: DateFieldProps) {
  const [own, setOwnValue] = useState(defaultValue ?? '');
  const value = given ?? own;
  const formats = useFormats();
  const [draft, setDraft] = useState<string | undefined>(undefined);
  const [check, setCheck] = useState<{ state: FieldState; message?: string }>({ state: 'idle' });
  const [calendar, setCalendar] = useState(false);
  const shown = shownState(state, message, check);
  const { describedBy, line } = useMessage(shown.message);
  const { reasoned, describe, caption } = useReason(disabled, reason);
  const key = useRef({});
  warnNoReason(key.current, `DateField "${label}"`, disabled, reason);
  const input = useRef<HTMLInputElement>(null);
  const typing = draft !== undefined;
  const picked = value ? read(value) : null;
  // Enter commits and a Dialog checks in the same tick, before `value` has moved.
  const latest = useRef(value);
  latest.current = value;

  const choose = (iso: string) => {
    setDraft(undefined);
    setCheck({ state: 'idle' });
    if (iso === latest.current) return;
    latest.current = iso;
    if (given === undefined) setOwnValue(iso);
    onChange?.(iso);
  };
  /** Takes what was typed. Gives the day, empty for none, or null when it can't be read. */
  const commit = () => {
    const text = draft ?? '';
    const day = text.trim() ? parseDay(text, now) : '';
    if (day === null) setCheck({ state: 'error', message: 'Try “13 Nov”, “friday” or “+2w”.' });
    else choose(day);
    return day;
  };
  useFieldCheck({
    check: () => {
      if (disabled) return true;
      const day = typing ? commit() : latest.current;
      if (day === null) return false;
      if (required && !day) {
        setCheck({ state: 'attention', message: NEEDS_YOU });
        return false;
      }
      return true;
    },
    focus: () => input.current?.focus(),
    name,
    value: () => latest.current,
  });
  const words = value ? `${dayName(value, now, formats)} · ${dayDistance(value, now)}` : '';
  const shownQuick = quick.slice(0, 4);
  return (
    <AriaTextField
      className={cx('augur-field augur-control relative quill-date', className)}
      data-state={shown.state}
      data-unavailable={disabled || undefined}
      value={typing ? draft : words}
      onChange={(v) => {
        setDraft(v);
        if (check.state !== 'idle') setCheck({ state: 'idle' });
      }}
      onFocus={() => !reasoned && setDraft(value ? dayName(value, new Date(0)) : '')}
      onBlur={() => typing && commit()}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          if (typing) commit();
          // A Dialog around it takes Enter too: it presses the primary.
          e.continuePropagation();
        } else if (e.key === 'Escape' && typing) {
          setDraft(undefined);
          setCheck({ state: 'idle' });
        } else e.continuePropagation();
      }}
      isRequired={required}
      isDisabled={disabled && !reasoned}
      isReadOnly={reasoned}
      isInvalid={shown.state === 'error' || shown.state === 'attention'}
      validationBehavior="aria"
      aria-describedby={[describe['aria-describedby'], describedBy].filter(Boolean).join(' ') || undefined}
    >
      <FieldHead label={label} required={required} optional={optional} />
      <FieldHint hint={hint} />
      <div className="augur-field-box">
        <Input ref={input} className="augur-input" placeholder={empty} autoComplete="off" aria-disabled={describe['aria-disabled']} />
        <StateMark state={shown.state} />
        <DialogTrigger isOpen={calendar} onOpenChange={setCalendar}>
          <AriaButton className="quill-date-cal" aria-label="Choose on a calendar" isDisabled={disabled}>
            <Icon name="calendar" size={16} />
          </AriaButton>
          <Popover className="augur-popover quill-calendar-pop" placement="bottom end" offset={6}>
            <Dialog className="quill-calendar-dialog" aria-label={`${label}: choose a day`}>
              <Calendar
                className="quill-calendar"
                aria-label={label}
                value={picked}
                defaultFocusedValue={picked ?? dayOf(now)}
                onChange={(d) => {
                  choose(d.toString());
                  setCalendar(false);
                }}
              >
                <header className="quill-calendar-head">
                  <AriaButton slot="previous" className="quill-calendar-step" aria-label="Previous month">
                    <Icon name="back" size={14} />
                  </AriaButton>
                  <Heading className="quill-calendar-month" />
                  <AriaButton slot="next" className="quill-calendar-step" aria-label="Next month">
                    <Icon name="arrow" size={14} />
                  </AriaButton>
                </header>
                <CalendarGrid className="quill-calendar-grid">
                  {(d) => {
                    const from = d.compare(dayOf(now));
                    return <CalendarCell date={d} className={`quill-calendar-day${from === 0 ? ' quill-calendar-today' : from < 0 ? ' quill-calendar-past' : ''}`} />;
                  }}
                </CalendarGrid>
              </Calendar>
            </Dialog>
          </Popover>
        </DialogTrigger>
      </div>
      {shownQuick.length || (value && !required) ? (
        <div className="quill-date-quick">
          {shownQuick.map((q) => (
            <button key={q.label} type="button" disabled={disabled} onClick={() => choose(parseDay(q.value, now) ?? '')}>
              {q.label}
            </button>
          ))}
          {value && !required ? (
            <button type="button" disabled={disabled} onClick={() => choose('')}>
              Clear
            </button>
          ) : null}
        </div>
      ) : null}
      {line()}
      {caption}
    </AriaTextField>
  );
}

/** Whether a file is one `accept` allows: endings (".pdf") and media types ("text/*"), comma separated, as on <input type="file">. */
export const accepts = (accept: string, file: Pick<File, 'name' | 'type'>) => {
  const rules = accept
    .split(',')
    .map((r) => r.trim().toLowerCase())
    .filter(Boolean);
  if (!rules.length) return true;
  const n = file.name.toLowerCase();
  const type = (file.type || '').toLowerCase();
  return rules.some((rule) => (rule.startsWith('.') ? n.endsWith(rule) : rule.endsWith('/*') ? type.startsWith(rule.slice(0, -1)) : type === rule));
};

export interface DropZoneProps {
  /** What dropping does. */
  heading?: string;
  /** What it takes. */
  hint?: string;
  /** The button's word. */
  action?: string;
  /** As on <input type="file">. Empty takes anything. */
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  /** Why it can't take files, in one sentence. With one, its key stays focusable and says so. */
  reason?: string;
  /** Something is being done with the last files: says so and takes no more until it's done. */
  busy?: boolean;
  /** One line, for a dialog or a panel. */
  compact?: boolean;
  /** The files dropped or chosen that `accept` allows. */
  onFiles?: (files: File[]) => void;
  /** The ones it doesn't. */
  onReject?: (files: File[]) => void;
  className?: string;
}

/**
 * Somewhere to drop files, or press to choose them. It hands over the files
 * it accepts and says which it turned away. Its Choose button is the way in
 * from the keyboard; dropping is a shortcut, never the only way.
 */
export function DropZone({ heading = 'Drop files here', hint, action = 'Choose files', accept = '', multiple = true, disabled, reason, busy, compact, onFiles, onReject, className }: DropZoneProps) {
  const [over, setOver] = useState(false);
  const depth = useRef(0);
  const picker = useRef<HTMLInputElement>(null);
  const { reasoned, describe, caption } = useReason(disabled, reason);
  const key = useRef({});
  warnNoReason(key.current, `DropZone "${heading}"`, disabled, reason);
  const take = (list: FileList | null | undefined) => {
    if (!list?.length || disabled || busy) return;
    const files = multiple ? [...list] : [list[0]!];
    const taken = files.filter((f) => accepts(accept, f));
    const turned = files.filter((f) => !taken.includes(f));
    if (taken.length) onFiles?.(taken);
    if (turned.length) onReject?.(turned);
  };
  const drag = (e: DragEvent) => {
    if (!e.dataTransfer?.types.includes('Files')) return;
    e.preventDefault();
    if (e.type === 'dragenter') depth.current++;
    if (e.type === 'dragleave') depth.current = Math.max(0, depth.current - 1);
    setOver(depth.current > 0 && !disabled && !busy);
    if (e.type === 'dragover') e.dataTransfer.dropEffect = disabled || busy ? 'none' : 'copy';
  };
  return (
    <div
      className={cx('quill-drop augur-control relative', className)}
      data-over={over ? '' : undefined}
      data-compact={compact ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      aria-busy={busy || undefined}
      onDragEnter={drag}
      onDragOver={drag}
      onDragLeave={drag}
      onDrop={(e) => {
        e.preventDefault();
        depth.current = 0;
        setOver(false);
        take(e.dataTransfer?.files);
      }}
    >
      <Icon name="upload" size={20} />
      <span className="quill-drop-heading">{heading}</span>
      {hint && !compact ? <span className="quill-drop-hint">{hint}</span> : null}
      <button type="button" {...describe} disabled={(disabled && !reasoned) || busy} onClick={() => !reasoned && picker.current?.click()}>
        {busy ? 'Working…' : action}
      </button>
      <input
        ref={picker}
        type="file"
        hidden
        tabIndex={-1}
        aria-hidden="true"
        accept={accept || undefined}
        multiple={multiple}
        onChange={(e) => {
          take(e.target.files);
          e.target.value = '';
        }}
      />
      {caption}
    </div>
  );
}

export type SurfaceKind = 'pane' | 'raised' | 'inset' | 'overlay' | 'bar' | 'veil';

export interface SurfaceProps {
  kind?: SurfaceKind;
  pad?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** For a surface that names a region. */
  'aria-label'?: string;
}

/** The flat planes things sit on, stacked in one order only: ground, pane, raised or inset, overlay. */
export function Surface({ kind = 'pane', pad, children, className, style, ...rest }: SurfaceProps) {
  return (
    <div className={cx('quill-surface', className)} data-kind={kind} data-pad={pad ? '' : undefined} style={style} {...rest}>
      {children}
    </div>
  );
}
