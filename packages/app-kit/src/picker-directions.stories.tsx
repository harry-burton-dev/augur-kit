import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type KeyboardEvent, type ReactNode } from 'react';
import { Icon, type IconName } from '@augur/kit-common';
import './picker-directions.stories.css';

/**
 * Round M, the pickers: three directions for the filter bar, the palette, the calendar, tags and
 * Segmented. Every direction is drawn from the kit's own looks (Keycap, Well, Sheet, Stamp, Key, the
 * line), never from another design system; each names its nearest prior art. Mock-ups only: no part
 * changes until a direction is picked. Data is made up.
 *
 * A · Rail: the line as structure. Everything sits on one ruled line and folds to a summary.
 * B · Keys: Keycap and Well. Every choice is a key; what's on stays pressed in.
 * C · Written: it reads as a sentence. Words you can press, wells only where you type.
 */
const meta: Meta = {
  title: 'Quill/Picker directions',
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj;

/* ---------- Shared data ---------- */

interface Opt {
  value: string;
  label: string;
}
interface Filter {
  id: string;
  label: string;
  options: Opt[];
  single?: boolean;
}
const FILTERS: Filter[] = [
  {
    id: 'state',
    label: 'State',
    options: [
      { value: 'running', label: 'Running' },
      { value: 'waiting', label: 'Waiting on you' },
      { value: 'failed', label: 'Failed' },
      { value: 'done', label: 'Done' },
    ],
  },
  {
    id: 'owner',
    label: 'Owner',
    options: [
      { value: 'me', label: 'Me' },
      { value: 'ops', label: 'Ops team' },
      { value: 'agent', label: 'Any agent' },
    ],
  },
  {
    id: 'time',
    label: 'Time',
    single: true,
    options: [
      { value: '1h', label: 'Last hour' },
      { value: 'today', label: 'Today' },
      { value: '7d', label: 'Last 7 days' },
      { value: '30d', label: 'Last 30 days' },
    ],
  },
];
const VIEWS = ['My open runs', 'Failed this week', 'Everything'];
const SORTS = ['Newest', 'Oldest', 'Longest'];
const START: Record<string, string[]> = { state: ['running', 'waiting'], owner: ['me'], time: ['7d'] };
/** A made-up count that moves as filters change. */
const countOf = (v: Record<string, string[]>) => 310 - Object.values(v).reduce((n, list) => n + list.length * 47, 0);

const labelOf = (f: Filter, v: string) => f.options.find((o) => o.value === v)?.label ?? v;
const toggle = (f: Filter, chosen: string[], v: string) => (f.single ? (chosen[0] === v ? [] : [v]) : chosen.includes(v) ? chosen.filter((c) => c !== v) : [...chosen, v]);

interface PaletteRow {
  id: string;
  label: string;
  where: string;
  kind: string;
  icon: IconName;
  locked?: string;
}
const ROWS: PaletteRow[] = [
  { id: 'r4821', label: 'Run 4821, nightly import', where: 'Runs › Ops', kind: 'Run', icon: 'play' },
  { id: 'r4817', label: 'Run 4817, invoice match', where: 'Runs › Finance', kind: 'Run', icon: 'play' },
  { id: 'agent', label: 'Import agent', where: 'Agents', kind: 'Agent', icon: 'agents' },
  { id: 'doc', label: 'Import checklist', where: 'Library › Ops › Guides', kind: 'Document', icon: 'document' },
  { id: 'audit', label: 'Import audit log', where: 'Admin', kind: 'Log', icon: 'history', locked: 'Needs admin rights' },
];
/** What matches, those that start with the letters first. */
const match = (q: string) => {
  const w = q.trim().toLocaleLowerCase();
  if (!w) return ROWS;
  const found = ROWS.filter((r) => r.label.toLocaleLowerCase().includes(w));
  return [...found.filter((r) => r.label.toLocaleLowerCase().startsWith(w)), ...found.filter((r) => !r.label.toLocaleLowerCase().startsWith(w))];
};

const TAGS = ['safety', 'budget', 'hiring', 'travel', 'training', 'suppliers', 'audit', 'q4'];

/* November 2026, weeks starting Monday: the 1st is a Sunday. */
const LEAD = 6;
const TODAY = 6;
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const dayName = (d: number) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][(d - 1 + LEAD) % 7];

const SPANS = ['Day', 'Week', 'Month', 'Quarter'];

/* ---------- Page frame ---------- */

const DIRECTIONS = {
  a: { letter: 'A', name: 'Rail', art: 'a railway timetable’s ruled header', line: 'The line as structure. One ruled line, folded to a summary; lists drop as Sheets.' },
  b: { letter: 'B', name: 'Keys', art: 'a mixing desk’s channel buttons', line: 'Keycap and Well. Every choice is a key; what’s on stays pressed in.' },
  c: { letter: 'C', name: 'Written', art: 'a fill-in-the-blanks paper form', line: 'It reads as a sentence. Words you can press, a well only where you type.' },
} as const;
type Dir = keyof typeof DIRECTIONS;

function Direction({ dir, children, wide }: { dir: Dir; children: ReactNode; wide?: boolean }) {
  const d = DIRECTIONS[dir];
  return (
    <section className="pd-direction" data-wide={wide || undefined} aria-label={`${d.letter}, ${d.name}`}>
      <header className="pd-head">
        <span className="pd-letter">{d.letter}</span>
        <span className="pd-name">{d.name}</span>
        <span className="pd-art">Nearest prior art: {d.art}</span>
      </header>
      <p className="pd-line">{d.line}</p>
      <div className="pd-stage">{children}</div>
    </section>
  );
}

const Three = ({ children, stacked }: { children: ReactNode; stacked?: boolean }) => (
  <div className="pd-page" data-stacked={stacked || undefined}>
    {children}
  </div>
);

/* A list a filter drops. In A and C it's a Sheet; B draws keys. */
function SheetList({ filter, chosen, onPick, heading }: { filter: Filter; chosen: string[]; onPick: (v: string) => void; heading?: string }) {
  return (
    <div className="pd-sheet" role="group" aria-label={filter.label}>
      <p className="pd-sheet-heading">{heading ?? filter.label}</p>
      {filter.options.map((o) => (
        <button key={o.value} type="button" className="pd-sheet-row" aria-pressed={chosen.includes(o.value)} onClick={() => onPick(o.value)}>
          <span className="pd-sheet-mark" aria-hidden="true">
            {chosen.includes(o.value) ? <Icon name="check" size={14} /> : null}
          </span>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Filter bar ---------- */

function RailBar() {
  const [value, setValue] = useState(START);
  const [view, setView] = useState(VIEWS[0]!);
  const [open, setOpen] = useState<string | null>(null);
  const [sort, setSort] = useState(0);
  const flip = (id: string) => setOpen(open === id ? null : id);
  return (
    <div className="pd-rail">
      <div className="pd-rail-line" role="group" aria-label="Filter runs">
        <button type="button" className="pd-rail-seg pd-rail-view" aria-expanded={open === 'view'} onClick={() => flip('view')}>
          <span className="pd-rail-key">View</span>
          {view}
        </button>
        {FILTERS.map((f) => {
          const chosen = value[f.id] ?? [];
          return (
            <button key={f.id} type="button" className="pd-rail-seg" aria-expanded={open === f.id} data-on={chosen.length || undefined} onClick={() => flip(f.id)}>
              <span className="pd-rail-key">{f.label}</span>
              {chosen.length ? chosen.map((v) => labelOf(f, v).toLocaleLowerCase()).join(', ') : <span className="pd-muted">any</span>}
            </button>
          );
        })}
        <span className="pd-rail-end">
          <span className="pd-mono" aria-live="polite">
            {countOf(value)} runs
          </span>
          <button type="button" className="pd-rail-seg" onClick={() => setSort((sort + 1) % SORTS.length)}>
            <span className="pd-rail-key">Sort</span>
            {SORTS[sort]!.toLocaleLowerCase()}
          </button>
        </span>
      </div>
      {open === 'view' ? (
        <div className="pd-drop">
          <div className="pd-sheet" role="group" aria-label="Saved views">
            <p className="pd-sheet-heading">Saved views</p>
            {VIEWS.map((v) => (
              <button key={v} type="button" className="pd-sheet-row" aria-pressed={v === view} onClick={() => (setView(v), setOpen(null))}>
                <span className="pd-sheet-mark" aria-hidden="true">{v === view ? <Icon name="check" size={14} /> : null}</span>
                {v}
              </button>
            ))}
            <p className="pd-sheet-foot">Save this as a view…</p>
          </div>
        </div>
      ) : null}
      {FILTERS.map((f) =>
        open === f.id ? (
          <div key={f.id} className="pd-drop">
            <SheetList filter={f} chosen={value[f.id] ?? []} onPick={(v) => setValue({ ...value, [f.id]: toggle(f, value[f.id] ?? [], v) })} />
          </div>
        ) : null,
      )}
    </div>
  );
}

function KeysBar() {
  const [value, setValue] = useState(START);
  const [view, setView] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const [sort, setSort] = useState(0);
  const any = Object.values(value).some((v) => v.length);
  return (
    <div className="pd-keys">
      <div className="pd-tray" role="group" aria-label="Filter runs">
        <button type="button" className="pd-key" onClick={() => setView((view + 1) % VIEWS.length)}>
          <Icon name="view" size={14} />
          {VIEWS[view]}
        </button>
        <span className="pd-groove" aria-hidden="true" />
        {FILTERS.map((f) => {
          const chosen = value[f.id] ?? [];
          return (
            <button key={f.id} type="button" className="pd-key" data-in={chosen.length || undefined} aria-expanded={open === f.id} onClick={() => setOpen(open === f.id ? null : f.id)}>
              {f.label}
              {chosen.length ? (
                <span className="pd-key-value">
                  {labelOf(f, chosen[0]!)}
                  {chosen.length > 1 ? ` +${chosen.length - 1}` : ''}
                </span>
              ) : null}
              <Icon name="chevron-down" size={14} />
            </button>
          );
        })}
        {any ? (
          <button type="button" className="pd-key pd-key-quiet" onClick={() => setValue({})}>
            Clear
          </button>
        ) : null}
        <span className="pd-tray-end">
          <span className="pd-count-key" aria-live="polite">
            {countOf(value)}
          </span>
          <button type="button" className="pd-key" onClick={() => setSort((sort + 1) % SORTS.length)}>
            <Icon name="sort" size={14} />
            {SORTS[sort]}
          </button>
        </span>
      </div>
      {FILTERS.map((f) =>
        open === f.id ? (
          <div key={f.id} className="pd-key-drop" role="group" aria-label={f.label}>
            {f.options.map((o) => (
              <button key={o.value} type="button" className="pd-key" data-in={(value[f.id] ?? []).includes(o.value) || undefined} aria-pressed={(value[f.id] ?? []).includes(o.value)} onClick={() => setValue({ ...value, [f.id]: toggle(f, value[f.id] ?? [], o.value) })}>
                {o.label}
              </button>
            ))}
          </div>
        ) : null,
      )}
    </div>
  );
}

function WrittenBar() {
  const [value, setValue] = useState(START);
  const [view, setView] = useState(VIEWS[0]!);
  const [open, setOpen] = useState<string | null>(null);
  const [sort, setSort] = useState(0);
  const slot = (id: string, words: ReactNode, label: string) => (
    <button type="button" className="pd-slot" aria-expanded={open === id} aria-label={label} onClick={() => setOpen(open === id ? null : id)}>
      {words}
    </button>
  );
  const words = (f: Filter, empty: string) => {
    const chosen = value[f.id] ?? [];
    if (!chosen.length) return <span className="pd-muted">{empty}</span>;
    const list = chosen.map((v) => labelOf(f, v).toLocaleLowerCase());
    return list.length > 1 ? `${list.slice(0, -1).join(', ')} or ${list.at(-1)}` : list[0];
  };
  const [state, owner, time] = FILTERS as [Filter, Filter, Filter];
  return (
    <div className="pd-written">
      <p className="pd-sentence" role="group" aria-label="Filter runs">
        {slot('view', view, `View: ${view}`)}: runs that are {slot('state', words(state, 'in any state'), 'State')}, owned by {slot('owner', words(owner, 'anyone'), 'Owner')}, from {slot('time', words(time, 'any time'), 'Time')}, {' '}
        <button type="button" className="pd-slot" onClick={() => setSort((sort + 1) % SORTS.length)}>
          {SORTS[sort]!.toLocaleLowerCase()} first
        </button>
        . <span className="pd-mono pd-muted" aria-live="polite">{countOf(value)} of 310.</span>
      </p>
      {open === 'view' ? (
        <div className="pd-drop">
          <div className="pd-sheet" role="group" aria-label="Saved views">
            <p className="pd-sheet-heading">Saved views</p>
            {VIEWS.map((v) => (
              <button key={v} type="button" className="pd-sheet-row" aria-pressed={v === view} onClick={() => (setView(v), setOpen(null))}>
                <span className="pd-sheet-mark" aria-hidden="true">{v === view ? <Icon name="check" size={14} /> : null}</span>
                {v}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {FILTERS.map((f) =>
        open === f.id ? (
          <div key={f.id} className="pd-drop">
            <SheetList filter={f} chosen={value[f.id] ?? []} onPick={(v) => setValue({ ...value, [f.id]: toggle(f, value[f.id] ?? [], v) })} />
          </div>
        ) : null,
      )}
    </div>
  );
}

/**
 * The bar above a long list of runs. Press any part of it. A folds what's on into one ruled line and
 * drops a Sheet for each; B makes each filter a key that stays pressed in, with its value on it, and
 * opens a row of keys under it; C writes it as a sentence whose words you press. Saved views sit at
 * the start of each. None needs a row of chips under the bar.
 */
export const FilterBar: Story = {
  render: () => (
    <Three stacked>
      <Direction dir="a" wide>
        <RailBar />
      </Direction>
      <Direction dir="b" wide>
        <KeysBar />
      </Direction>
      <Direction dir="c" wide>
        <WrittenBar />
      </Direction>
    </Three>
  ),
};

/* ---------- Palette ---------- */

function usePointer(rows: PaletteRow[]) {
  const [at, setAt] = useState(0);
  const point = Math.min(at, Math.max(rows.length - 1, 0));
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') setAt((point + 1) % Math.max(rows.length, 1));
    else if (e.key === 'ArrowUp') setAt((point - 1 + rows.length) % Math.max(rows.length, 1));
    else return;
    e.preventDefault();
  };
  return { point, setAt, onKey };
}

/** The app behind, dimmed: depth is dimming only, never a blur. */
const Behind = ({ children }: { children: ReactNode }) => (
  <div className="pd-behind">
    <div className="pd-behind-app" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </div>
    <div className="pd-behind-dim" aria-hidden="true" />
    <div className="pd-behind-top">{children}</div>
  </div>
);

function RailPalette() {
  const [q, setQ] = useState('imp');
  const rows = match(q);
  const { point, setAt, onKey } = usePointer(rows);
  return (
    <Behind>
      <div className="pd-rail-palette">
        <div className="pd-rail-palette-field">
          <span className="pd-rail-key">Go to</span>
          <input aria-label="Go to a run, agent or document" value={q} onChange={(e) => (setQ(e.target.value), setAt(0))} onKeyDown={onKey} />
          <span className="pd-mono pd-muted">{rows.length} found</span>
        </div>
        <ul className="pd-ruled" aria-label="Found">
          {rows.map((r, i) => (
            <li key={r.id} className="pd-ruled-row" data-at={i === point || undefined} data-locked={r.locked ? '' : undefined} onPointerMove={() => setAt(i)}>
              <span className="pd-ruled-label">{r.label}</span>
              <span className="pd-muted">{r.locked ?? r.where}</span>
              <span className="pd-rail-key">{r.kind}</span>
            </li>
          ))}
        </ul>
      </div>
    </Behind>
  );
}

function KeysPalette() {
  const [q, setQ] = useState('imp');
  const rows = match(q);
  const { point, setAt, onKey } = usePointer(rows);
  return (
    <Behind>
      <div className="pd-keys-palette">
        <div className="pd-well">
          <Icon name="find" size={16} />
          <input aria-label="Go to a run, agent or document" value={q} onChange={(e) => (setQ(e.target.value), setAt(0))} onKeyDown={onKey} />
        </div>
        <ul className="pd-key-stack" aria-label="Found">
          {rows.map((r, i) => (
            <li key={r.id} className="pd-stack-row" data-at={i === point || undefined} data-locked={r.locked ? '' : undefined} onPointerMove={() => setAt(i)}>
              <span className="pd-cap" aria-hidden="true">{i + 1}</span>
              {r.locked ? <Icon name="lock" size={16} /> : <Icon name={r.icon} size={16} />}
              <span className="pd-stack-text">
                <span>{r.label}</span>
                <span className="pd-muted pd-small">{r.locked ?? r.where}</span>
              </span>
              {i === point && !r.locked ? <span className="pd-cap" aria-hidden="true">↵</span> : null}
            </li>
          ))}
        </ul>
        <p className="pd-foot">Press 1 to {rows.length} to go at once</p>
      </div>
    </Behind>
  );
}

function WrittenPalette() {
  const [q, setQ] = useState('imp');
  const rows = match(q);
  const { point, setAt, onKey } = usePointer(rows);
  const best = rows[point];
  const rest = best && best.label.toLocaleLowerCase().startsWith(q.toLocaleLowerCase()) ? best.label.slice(q.length) : '';
  return (
    <Behind>
      <div className="pd-written-palette">
        <div className="pd-type-line">
          <span className="pd-type-ghost" aria-hidden="true">
            <span className="pd-type-shown">{q}</span>
            {rest}
          </span>
          <input aria-label="Go to a run, agent or document" value={q} onChange={(e) => (setQ(e.target.value), setAt(0))} onKeyDown={onKey} />
        </div>
        <p className="pd-small pd-muted">{best ? (best.locked ? `${best.label} is locked: ${best.locked}.` : `Enter goes to ${best.label}, in ${best.where}. Tab writes it out.`) : 'Nothing by that name. Try fewer letters.'}</p>
        <ul className="pd-written-list" aria-label="Also found">
          {rows.slice(0, 4).map((r, i) => (
            <li key={r.id} data-at={i === point || undefined} data-locked={r.locked ? '' : undefined} onPointerMove={() => setAt(i)}>
              {r.label} <span className="pd-muted">· {r.kind.toLocaleLowerCase()}</span>
            </li>
          ))}
        </ul>
      </div>
    </Behind>
  );
}

/**
 * Jump to anything by keyboard, then get out of the way. Type, ↑ ↓ to move. The app behind dims
 * (no blur). A drops a ruled strip from the top, kinds in mono at the end; B is a well over a stack
 * of keys, numbered so 1 to 9 go at once; C is one line that writes the best match out ahead of you,
 * with a sentence saying where Enter goes.
 */
export const Palette: Story = {
  render: () => (
    <Three>
      <Direction dir="a">
        <RailPalette />
      </Direction>
      <Direction dir="b">
        <KeysPalette />
      </Direction>
      <Direction dir="c">
        <WrittenPalette />
      </Direction>
    </Three>
  ),
};

/* ---------- Calendar ---------- */

function MonthGrid({ look, chosen, onPick }: { look: 'rail' | 'keys'; chosen: number; onPick: (d: number) => void }) {
  return (
    <div className={`pd-month pd-month-${look}`} role="grid" aria-label="November 2026">
      <div role="row" className="pd-month-week">
        {WEEKDAYS.map((w) => (
          <span key={w} role="columnheader" className="pd-month-wd">
            {w}
          </span>
        ))}
      </div>
      {Array.from({ length: 6 }, (_, week) => (
        <div role="row" key={week} className="pd-month-week">
          {Array.from({ length: 7 }, (_, i) => {
            const d = week * 7 + i - LEAD + 1;
            return (
              <span role="gridcell" key={i}>
                {d >= 1 && d <= 30 ? (
                  <button type="button" className="pd-day" aria-pressed={d === chosen} data-today={d === TODAY || undefined} data-past={d < TODAY || undefined} aria-label={`${dayName(d)} ${d} November`} onClick={() => onPick(d)}>
                    {d}
                  </button>
                ) : null}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function CalendarHead({ look }: { look: 'rail' | 'keys' }) {
  return (
    <div className={`pd-cal-head pd-cal-head-${look}`}>
      <button type="button" className={look === 'keys' ? 'pd-end-key' : 'pd-step'} aria-label="Previous month">
        <Icon name="back" size={14} />
      </button>
      <span className={look === 'rail' ? 'pd-rail-key' : ''}>November 2026</span>
      <button type="button" className={look === 'keys' ? 'pd-end-key' : 'pd-step'} aria-label="Next month">
        <Icon name="arrow" size={14} />
      </button>
    </div>
  );
}

function RailCalendar() {
  const [day, setDay] = useState(13);
  return (
    <div className="pd-cal pd-cal-rail">
      <CalendarHead look="rail" />
      <MonthGrid look="rail" chosen={day} onPick={setDay} />
      <p className="pd-mono pd-muted">
        {dayName(day)} {day} Nov 2026
      </p>
    </div>
  );
}

function KeysCalendar() {
  const [day, setDay] = useState(13);
  return (
    <div className="pd-cal pd-cal-keys">
      <CalendarHead look="keys" />
      <MonthGrid look="keys" chosen={day} onPick={setDay} />
    </div>
  );
}

function WrittenCalendar() {
  const [typed, setTyped] = useState('next fri');
  const [day, setDay] = useState(13);
  const [month, setMonth] = useState(false);
  const read = (t: string) => {
    const s = t.trim().toLocaleLowerCase();
    if (s === 'today') return TODAY;
    if (s === 'tomorrow') return TODAY + 1;
    if (s === 'next fri' || s === 'fri') return 13;
    const n = Number.parseInt(s, 10);
    return n >= 1 && n <= 30 ? n : undefined;
  };
  const week = Math.floor((day + LEAD - 1) / 7);
  return (
    <div className="pd-cal pd-cal-written">
      <label className="pd-small pd-muted" htmlFor="pd-when">
        Due
      </label>
      <div className="pd-well">
        <input
          id="pd-when"
          value={typed}
          onChange={(e) => {
            setTyped(e.target.value);
            const d = read(e.target.value);
            if (d) setDay(d);
          }}
        />
      </div>
      <p className="pd-mono pd-muted">
        {dayName(day)} {day} Nov 2026 · in {day - TODAY} days
      </p>
      {month ? (
        <MonthGrid look="rail" chosen={day} onPick={(d) => (setDay(d), setTyped(`${d} Nov`))} />
      ) : (
        <div className="pd-week-strip" role="group" aria-label="That week">
          {Array.from({ length: 7 }, (_, i) => {
            const d = week * 7 + i - LEAD + 1;
            return d >= 1 && d <= 30 ? (
              <button key={i} type="button" className="pd-week-day" aria-pressed={d === day} onClick={() => (setDay(d), setTyped(`${d} Nov`))}>
                <span className="pd-small pd-muted">{dayName(d)}</span>
                {d}
              </button>
            ) : (
              <span key={i} />
            )
          })}
        </div>
      )}
      <button type="button" className="pd-text-button" onClick={() => setMonth(!month)}>
        {month ? 'Just that week' : 'Whole month'}
      </button>
    </div>
  );
}

/**
 * The calendar the date field opens. A is a ruled month: rules between weeks only, the chosen day
 * underlined in ink, today a small dot (a true circle). B is a tray of day keys: the chosen day the
 * one light key, past days lower. C writes first ("next fri", "tomorrow", "20") with a mono echo,
 * and shows only that week until you ask for the month, so it seldom needs the grid at all.
 */
export const Calendar: Story = {
  render: () => (
    <Three>
      <Direction dir="a">
        <RailCalendar />
      </Direction>
      <Direction dir="b">
        <KeysCalendar />
      </Direction>
      <Direction dir="c">
        <WrittenCalendar />
      </Direction>
    </Three>
  ),
};

/* ---------- Tags ---------- */

function useTags() {
  const [chosen, setChosen] = useState(['safety', 'budget']);
  const [typed, setTyped] = useState('');
  const left = TAGS.filter((t) => !chosen.includes(t) && t.startsWith(typed.trim().toLocaleLowerCase()));
  const add = (t: string) => (setChosen([...chosen, t]), setTyped(''));
  const drop = (t: string) => setChosen(chosen.filter((c) => c !== t));
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && left[0]) {
      add(left[0]);
      e.preventDefault();
    }
    if (e.key === 'Backspace' && !typed && chosen.length) setChosen(chosen.slice(0, -1));
  };
  return { chosen, typed, setTyped, left, add, drop, onKey };
}

function RailTags() {
  const t = useTags();
  return (
    <div className="pd-tags">
      <p className="pd-small pd-muted">Tags</p>
      <div className="pd-rail-tags">
        {t.chosen.map((c) => (
          <span key={c} className="pd-rail-tag">
            {c}
            <button type="button" aria-label={`Take off ${c}`} onClick={() => t.drop(c)}>
              <Icon name="close" size={12} />
            </button>
          </span>
        ))}
        <input aria-label="Add a tag" placeholder="add…" value={t.typed} onChange={(e) => t.setTyped(e.target.value)} onKeyDown={t.onKey} />
      </div>
      <div className="pd-sheet" role="group" aria-label="Tags to add">
        <p className="pd-sheet-heading">{t.typed ? `Starting “${t.typed}”` : 'Tags'}</p>
        {t.left.slice(0, 4).map((l) => (
          <button key={l} type="button" className="pd-sheet-row" onClick={() => t.add(l)}>
            <span className="pd-sheet-mark" aria-hidden="true" />
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

function KeysTags() {
  const t = useTags();
  return (
    <div className="pd-tags">
      <p className="pd-small pd-muted">Tags</p>
      <div className="pd-well pd-well-wrap">
        {t.chosen.map((c) => (
          <span key={c} className="pd-tag-key">
            {c}
            <button type="button" aria-label={`Take off ${c}`} onClick={() => t.drop(c)}>
              <Icon name="close" size={12} />
            </button>
          </span>
        ))}
        <input aria-label="Add a tag" placeholder="Type to find a tag" value={t.typed} onChange={(e) => t.setTyped(e.target.value)} onKeyDown={t.onKey} />
      </div>
      <div className="pd-key-drop" role="group" aria-label="Tags to add">
        {t.left.slice(0, 5).map((l) => (
          <button key={l} type="button" className="pd-key" onClick={() => t.add(l)}>
            <Icon name="plus" size={12} />
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

function WrittenTags() {
  const t = useTags();
  return (
    <div className="pd-tags">
      <p className="pd-small pd-muted">Tags</p>
      <div className="pd-stamps">
        {t.chosen.map((c) => (
          <button key={c} type="button" className="pd-stamp" aria-label={`${c}, press to take off`} onClick={() => t.drop(c)}>
            {c}
          </button>
        ))}
      </div>
      <div className="pd-well">
        <input aria-label="Add tags, separated by commas" placeholder="Write tags, with commas" value={t.typed} onChange={(e) => (e.target.value.endsWith(',') ? t.add(e.target.value.slice(0, -1).trim()) : t.setTyped(e.target.value))} onKeyDown={t.onKey} />
      </div>
      <p className="pd-small pd-muted">{t.typed && t.left[0] ? `Enter adds “${t.left[0]}”. A new word becomes a new tag.` : `Known: ${t.left.slice(0, 5).join(', ')}.`}</p>
    </div>
  );
}

/**
 * Tags on a document or run. Type to find; Enter adds; Backspace in an empty field takes the last one
 * off. A writes them as ruled words in the line, with a Sheet of matches; B stands them in the well
 * as small keys, with matches as a strip of keys to press; C writes them with commas and shows each as
 * a Stamp above the well, saying what Enter will add.
 */
export const Tags: Story = {
  render: () => (
    <Three>
      <Direction dir="a">
        <RailTags />
      </Direction>
      <Direction dir="b">
        <KeysTags />
      </Direction>
      <Direction dir="c">
        <WrittenTags />
      </Direction>
    </Three>
  ),
};

/* ---------- Segmented ---------- */

function SpanPicker({ look }: { look: Dir }) {
  const [at, setAt] = useState(1);
  return (
    <div className={`pd-seg pd-seg-${look}`} role="radiogroup" aria-label="Span">
      {SPANS.map((s, i) => (
        <span key={s} className="pd-seg-cell">
          {look === 'c' && i > 0 ? <span className="pd-seg-slash" aria-hidden="true">/</span> : null}
          <button type="button" role="radio" aria-checked={i === at} className="pd-seg-item" onClick={() => setAt(i)}>
            {s}
          </button>
        </span>
      ))}
    </div>
  );
}

/**
 * One of a few, side by side, acting at once: the span a chart shows. A rules a line under the words
 * and moves an ink bar to the chosen one; B is a well with the chosen one raised as a key, like Key
 * tabs; C writes them with slashes, the chosen word in ink and the rest dimmed.
 */
export const Segmented: Story = {
  render: () => (
    <Three>
      <Direction dir="a">
        <SpanPicker look="a" />
      </Direction>
      <Direction dir="b">
        <SpanPicker look="b" />
      </Direction>
      <Direction dir="c">
        <SpanPicker look="c" />
      </Direction>
    </Three>
  ),
};
