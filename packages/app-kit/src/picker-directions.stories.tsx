import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type KeyboardEvent, type ReactNode } from 'react';
import { Icon, type IconName } from '@augur/kit-common';
import './picker-directions.stories.css';

/*
 * Round M, the pickers, drawn in place on one page: a Runs list in the page frame Harry picked (A, Line,
 * PR #76). Five decisions, three options each, switched on the strip above the page so each one is
 * judged in place: the filter bar, the palette, the date field's calendar, tags and Segmented. Mock-ups
 * in scoped CSS (prefix pd-); no part changes until the picks are made. Every option is drawn from the
 * kit's own looks (the line, Keycap, Well, Sheet, Stamp), never from another design system.
 */

type Opt = 'a' | 'b' | 'c';
type Open = 'none' | 'filter' | 'palette' | 'calendar' | 'tags';
type Decision = 'bar' | 'palette' | 'calendar' | 'tags' | 'span';
type Picks = Record<Decision, Opt>;

const DECISIONS: { id: Decision; label: string; options: Record<Opt, string> }[] = [
  { id: 'bar', label: 'Filter bar', options: { a: 'Ruled line', b: 'Keys pressed in', c: 'A sentence' } },
  { id: 'palette', label: 'Palette', options: { a: 'Ruled strip', b: 'Numbered keys', c: 'Writes ahead' } },
  { id: 'calendar', label: 'Calendar', options: { a: 'Ruled month', b: 'Day keys', c: 'Written, one week' } },
  { id: 'tags', label: 'Tags', options: { a: 'Ruled words', b: 'Small keys', c: 'Stamps' } },
  { id: 'span', label: 'Segmented', options: { a: 'Ink bar', b: 'Raised key', c: 'Slashes' } },
];
const RECOMMENDED: Picks = { bar: 'a', palette: 'a', calendar: 'a', tags: 'a', span: 'a' };

/* ---------- Data ---------- */

interface Choice {
  value: string;
  label: string;
}
interface Filter {
  id: string;
  label: string;
  options: Choice[];
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
const countOf = (v: Record<string, string[]>) => 310 - Object.values(v).reduce((n, list) => n + list.length * 47, 0);
const labelOf = (f: Filter, v: string) => f.options.find((o) => o.value === v)?.label ?? v;
const toggle = (f: Filter, chosen: string[], v: string) => (f.single ? (chosen[0] === v ? [] : [v]) : chosen.includes(v) ? chosen.filter((c) => c !== v) : [...chosen, v]);

const RUNS: { id: string; name: string; agent: string; state: string; at: string; needs?: boolean }[] = [
  { id: '4823', name: 'Invoice match, October', agent: 'Ledger agent', state: 'Waiting on you', at: '09:12', needs: true },
  { id: '4821', name: 'Nightly import', agent: 'Import agent', state: 'Running', at: '02:00' },
  { id: '4820', name: 'Crew roster check', agent: 'Roster agent', state: 'Running', at: 'Thu 22:40' },
  { id: '4817', name: 'Supplier price refresh', agent: 'Buyer agent', state: 'Waiting on you', at: 'Thu 18:05', needs: true },
  { id: '4815', name: 'Port call summary', agent: 'Writer agent', state: 'Running', at: 'Thu 14:30' },
  { id: '4812', name: 'Safety notices digest', agent: 'Writer agent', state: 'Running', at: 'Wed 09:00' },
  { id: '4809', name: 'Voyage cost estimate', agent: 'Ledger agent', state: 'Running', at: 'Tue 16:20' },
];

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
  { id: 'r4817', label: 'Run 4817, supplier prices', where: 'Runs › Buying', kind: 'Run', icon: 'play' },
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

const TAGS = ['nightly', 'imports', 'safety', 'budget', 'suppliers', 'audit', 'q4', 'ops'];

/* November 2026, weeks starting Monday: the 1st is a Sunday. */
const LEAD = 6;
const TODAY = 6;
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const dayName = (d: number) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][(d - 1 + LEAD) % 7];

const SPANS = ['Day', 'Week', 'Month', 'Quarter'];
const BARS: Record<number, number[]> = { 0: [3, 5, 2, 6, 4, 7, 5, 3], 1: [4, 6, 5, 7, 3, 2, 6, 5], 2: [6, 5, 7, 6, 5, 6, 4, 7], 3: [5, 6, 6, 7, 7, 6, 5, 6] };

/* ---------- Shared bits ---------- */

function SheetList({ filter, chosen, onPick }: { filter: Filter; chosen: string[]; onPick: (v: string) => void }) {
  return (
    <div className="pd-sheet" role="group" aria-label={filter.label}>
      <p className="pd-sheet-heading">{filter.label}</p>
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

function ViewsSheet({ view, onPick }: { view: string; onPick: (v: string) => void }) {
  return (
    <div className="pd-sheet" role="group" aria-label="Saved views">
      <p className="pd-sheet-heading">Saved views</p>
      {VIEWS.map((v) => (
        <button key={v} type="button" className="pd-sheet-row" aria-pressed={v === view} onClick={() => onPick(v)}>
          <span className="pd-sheet-mark" aria-hidden="true">{v === view ? <Icon name="check" size={14} /> : null}</span>
          {v}
        </button>
      ))}
      <p className="pd-sheet-foot">Save this as a view…</p>
    </div>
  );
}

/* ---------- Filter bar options ---------- */

interface BarProps {
  value: Record<string, string[]>;
  onValue: (v: Record<string, string[]>) => void;
  open: string | null;
  onOpen: (id: string | null) => void;
}

function RailBar({ value, onValue, open, onOpen }: BarProps) {
  const [view, setView] = useState(VIEWS[0]!);
  const [sort, setSort] = useState(0);
  const flip = (id: string) => onOpen(open === id ? null : id);
  return (
    <div className="pd-bar">
      <div className="pd-rail-line" role="group" aria-label="Filter runs">
        <button type="button" className="pd-rail-seg pd-rail-view" aria-expanded={open === 'view'} onClick={() => flip('view')}>
          <span className="pd-rail-key">View</span>
          {view}
        </button>
        {FILTERS.map((f) => {
          const chosen = value[f.id] ?? [];
          return (
            <button key={f.id} type="button" className="pd-rail-seg" aria-expanded={open === f.id} onClick={() => flip(f.id)}>
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
          <ViewsSheet view={view} onPick={(v) => (setView(v), onOpen(null))} />
        </div>
      ) : null}
      {FILTERS.map((f) =>
        open === f.id ? (
          <div key={f.id} className="pd-drop">
            <SheetList filter={f} chosen={value[f.id] ?? []} onPick={(v) => onValue({ ...value, [f.id]: toggle(f, value[f.id] ?? [], v) })} />
          </div>
        ) : null,
      )}
    </div>
  );
}

function KeysBar({ value, onValue, open, onOpen }: BarProps) {
  const [view, setView] = useState(0);
  const [sort, setSort] = useState(0);
  const any = Object.values(value).some((v) => v.length);
  return (
    <div className="pd-bar">
      <div className="pd-tray" role="group" aria-label="Filter runs">
        <button type="button" className="pd-key" onClick={() => setView((view + 1) % VIEWS.length)}>
          <Icon name="view" size={14} />
          {VIEWS[view]}
        </button>
        <span className="pd-groove" aria-hidden="true" />
        {FILTERS.map((f) => {
          const chosen = value[f.id] ?? [];
          return (
            <button key={f.id} type="button" className="pd-key" data-in={chosen.length || undefined} aria-expanded={open === f.id} onClick={() => onOpen(open === f.id ? null : f.id)}>
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
          <button type="button" className="pd-key pd-key-quiet" onClick={() => onValue({})}>
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
          <div key={f.id} className="pd-drop pd-key-drop" role="group" aria-label={f.label}>
            {f.options.map((o) => {
              const on = (value[f.id] ?? []).includes(o.value);
              return (
                <button key={o.value} type="button" className="pd-key" data-in={on || undefined} aria-pressed={on} onClick={() => onValue({ ...value, [f.id]: toggle(f, value[f.id] ?? [], o.value) })}>
                  {o.label}
                </button>
              );
            })}
          </div>
        ) : null,
      )}
    </div>
  );
}

function WrittenBar({ value, onValue, open, onOpen }: BarProps) {
  const [view, setView] = useState(VIEWS[0]!);
  const [sort, setSort] = useState(0);
  const slot = (id: string, words: ReactNode, label: string) => (
    <button type="button" className="pd-slot" aria-expanded={open === id} aria-label={label} onClick={() => onOpen(open === id ? null : id)}>
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
    <div className="pd-bar">
      <p className="pd-sentence" role="group" aria-label="Filter runs">
        {slot('view', view, `View: ${view}`)}: runs {slot('state', words(state, 'in any state'), 'State')}, owned by {slot('owner', words(owner, 'anyone'), 'Owner')}, from the {slot('time', words(time, 'any time'), 'Time')},{' '}
        <button type="button" className="pd-slot" onClick={() => setSort((sort + 1) % SORTS.length)}>
          {SORTS[sort]!.toLocaleLowerCase()} first
        </button>
        . <span className="pd-mono pd-muted" aria-live="polite">{countOf(value)} of 310.</span>
      </p>
      {open === 'view' ? (
        <div className="pd-drop">
          <ViewsSheet view={view} onPick={(v) => (setView(v), onOpen(null))} />
        </div>
      ) : null}
      {FILTERS.map((f) =>
        open === f.id ? (
          <div key={f.id} className="pd-drop">
            <SheetList filter={f} chosen={value[f.id] ?? []} onPick={(v) => onValue({ ...value, [f.id]: toggle(f, value[f.id] ?? [], v) })} />
          </div>
        ) : null,
      )}
    </div>
  );
}

/* ---------- Palette options ---------- */

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

function RailPalette() {
  const [q, setQ] = useState('imp');
  const rows = match(q);
  const { point, setAt, onKey } = usePointer(rows);
  return (
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
  );
}

function KeysPalette() {
  const [q, setQ] = useState('imp');
  const rows = match(q);
  const { point, setAt, onKey } = usePointer(rows);
  return (
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
  );
}

function WrittenPalette() {
  const [q, setQ] = useState('imp');
  const rows = match(q);
  const { point, setAt, onKey } = usePointer(rows);
  const best = rows[point];
  const rest = best && best.label.toLocaleLowerCase().startsWith(q.toLocaleLowerCase()) ? best.label.slice(q.length) : '';
  return (
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
  );
}

/* ---------- Date field and calendar options ---------- */

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

function MonthHead({ look }: { look: 'rail' | 'keys' }) {
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

function DueField({ opt, open, onOpen }: { opt: Opt; open: boolean; onOpen: (o: boolean) => void }) {
  const [day, setDay] = useState(13);
  const [typed, setTyped] = useState('next fri');
  const pick = (d: number) => {
    setDay(d);
    setTyped(`${d} Nov`);
  };
  const said = `${dayName(day)} ${day} Nov 2026`;
  if (opt === 'a')
    return (
      <div className="pd-field">
        <button type="button" className="pd-rail-field" aria-expanded={open} onClick={() => onOpen(!open)}>
          <span className="pd-rail-key">Review by</span>
          {said}
          <Icon name="calendar" size={14} />
        </button>
        {open ? (
          <div className="pd-cal pd-cal-rail">
            <MonthHead look="rail" />
            <MonthGrid look="rail" chosen={day} onPick={(d) => (setDay(d), onOpen(false))} />
          </div>
        ) : null}
      </div>
    );
  if (opt === 'b')
    return (
      <div className="pd-field">
        <p className="pd-label">Review by</p>
        <div className="pd-well">
          <span className="pd-grow">{said}</span>
          <button type="button" className="pd-end-key" aria-label="Choose on a calendar" aria-expanded={open} onClick={() => onOpen(!open)}>
            <Icon name="calendar" size={14} />
          </button>
        </div>
        {open ? (
          <div className="pd-cal pd-cal-keys">
            <MonthHead look="keys" />
            <MonthGrid look="keys" chosen={day} onPick={(d) => (setDay(d), onOpen(false))} />
          </div>
        ) : null}
      </div>
    );
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
    <div className="pd-field">
      <label className="pd-label" htmlFor="pd-when">
        Review by
      </label>
      <div className="pd-well">
        <input
          id="pd-when"
          value={typed}
          onFocus={() => onOpen(true)}
          onChange={(e) => {
            setTyped(e.target.value);
            const d = read(e.target.value);
            if (d) setDay(d);
          }}
        />
      </div>
      <p className="pd-mono pd-muted">
        {said} · in {day - TODAY} days
      </p>
      {open ? (
        <div className="pd-week-strip" role="group" aria-label="That week">
          {Array.from({ length: 7 }, (_, i) => {
            const d = week * 7 + i - LEAD + 1;
            return d >= 1 && d <= 30 ? (
              <button key={i} type="button" className="pd-week-day" aria-pressed={d === day} onClick={() => pick(d)}>
                <span className="pd-small pd-muted">{dayName(d)}</span>
                {d}
              </button>
            ) : (
              <span key={i} />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

/* ---------- Tags options ---------- */

function TagsField({ opt, open, onOpen }: { opt: Opt; open: boolean; onOpen: (o: boolean) => void }) {
  const [chosen, setChosen] = useState(['nightly', 'imports']);
  const [typed, setTyped] = useState('');
  const left = TAGS.filter((t) => !chosen.includes(t) && t.startsWith(typed.trim().toLocaleLowerCase()));
  const add = (t: string) => {
    setChosen([...chosen, t]);
    setTyped('');
  };
  const drop = (t: string) => setChosen(chosen.filter((c) => c !== t));
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && left[0]) {
      add(left[0]);
      e.preventDefault();
    }
    if (e.key === 'Backspace' && !typed && chosen.length) setChosen(chosen.slice(0, -1));
  };
  const input = (placeholder: string, label: string) => <input aria-label={label} placeholder={placeholder} value={typed} onFocus={() => onOpen(true)} onChange={(e) => (opt === 'c' && e.target.value.endsWith(',') ? add(e.target.value.slice(0, -1).trim()) : setTyped(e.target.value))} onKeyDown={onKey} />;
  if (opt === 'a')
    return (
      <div className="pd-field">
        <div className="pd-rail-tags">
          <span className="pd-rail-key">Tags</span>
          {chosen.map((c) => (
            <span key={c} className="pd-rail-tag">
              {c}
              <button type="button" aria-label={`Take off ${c}`} onClick={() => drop(c)}>
                <Icon name="close" size={12} />
              </button>
            </span>
          ))}
          {input('add…', 'Add a tag')}
        </div>
        {open ? (
          <div className="pd-sheet" role="group" aria-label="Tags to add">
            <p className="pd-sheet-heading">{typed ? `Starting “${typed}”` : 'Tags'}</p>
            {left.slice(0, 4).map((l) => (
              <button key={l} type="button" className="pd-sheet-row" onClick={() => add(l)}>
                <span className="pd-sheet-mark" aria-hidden="true" />
                {l}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    );
  if (opt === 'b')
    return (
      <div className="pd-field">
        <p className="pd-label">Tags</p>
        <div className="pd-well pd-well-wrap">
          {chosen.map((c) => (
            <span key={c} className="pd-tag-key">
              {c}
              <button type="button" aria-label={`Take off ${c}`} onClick={() => drop(c)}>
                <Icon name="close" size={12} />
              </button>
            </span>
          ))}
          {input('Type to find', 'Add a tag')}
        </div>
        {open ? (
          <div className="pd-key-drop" role="group" aria-label="Tags to add">
            {left.slice(0, 4).map((l) => (
              <button key={l} type="button" className="pd-key" onClick={() => add(l)}>
                <Icon name="plus" size={12} />
                {l}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    );
  return (
    <div className="pd-field">
      <p className="pd-label">Tags</p>
      <div className="pd-stamps">
        {chosen.map((c) => (
          <button key={c} type="button" className="pd-stamp" aria-label={`${c}, press to take off`} onClick={() => drop(c)}>
            {c}
          </button>
        ))}
      </div>
      {open ? (
        <>
          <div className="pd-well">{input('Write tags, with commas', 'Add tags, separated by commas')}</div>
          <p className="pd-small pd-muted">{typed && left[0] ? `Enter adds “${left[0]}”. A new word becomes a new tag.` : `Known: ${left.slice(0, 4).join(', ')}.`}</p>
        </>
      ) : (
        <button type="button" className="pd-text-button" onClick={() => onOpen(true)}>
          Add tags
        </button>
      )}
    </div>
  );
}

/* ---------- Segmented options ---------- */

function SpanPicker({ look, at, onAt }: { look: Opt; at: number; onAt: (i: number) => void }) {
  return (
    <div className={`pd-seg pd-seg-${look}`} role="radiogroup" aria-label="Span">
      {SPANS.map((s, i) => (
        <span key={s} className="pd-seg-cell">
          {look === 'c' && i > 0 ? (
            <span className="pd-seg-slash" aria-hidden="true">
              /
            </span>
          ) : null}
          <button type="button" role="radio" aria-checked={i === at} className="pd-seg-item" onClick={() => onAt(i)}>
            {s}
          </button>
        </span>
      ))}
    </div>
  );
}

/* ---------- The page, in frame A (Line) ---------- */

const PAGES: { name: string; icon: IconName; count?: number }[] = [
  { name: 'Overview', icon: 'home' },
  { name: 'Runs', icon: 'play', count: 2 },
  { name: 'Agents', icon: 'agents' },
  { name: 'Library', icon: 'library' },
];

function RunsPage({ picks, open, onOpen }: { picks: Picks; open: Open; onOpen: (o: Open) => void }) {
  const [value, setValue] = useState(START);
  const [filterOpen, setFilterOpen] = useState<string | null>(open === 'filter' ? 'state' : null);
  const [span, setSpan] = useState(1);
  const bar = { value, onValue: setValue, open: filterOpen, onOpen: (id: string | null) => (setFilterOpen(id), onOpen(id ? 'filter' : 'none')) };
  const Bar = picks.bar === 'a' ? RailBar : picks.bar === 'b' ? KeysBar : WrittenBar;
  return (
    <div className="pd-frame" data-palette={open === 'palette' || undefined}>
      <nav className="pd-frame-rail" aria-label="Operations">
        <div className="pd-frame-app">
          <Icon name="server" size={20} />
          <span>Operations</span>
        </div>
        <ul>
          {PAGES.map((p) => (
            <li key={p.name}>
              <a href="#" className="pd-tile" aria-current={p.name === 'Runs' ? 'page' : undefined} onClick={(e) => e.preventDefault()}>
                <Icon name={p.icon} size={20} />
                <span>{p.name}</span>
                {p.count ? (
                  <span className="pd-tile-count" aria-label={`${p.count} need you`}>
                    {p.count}
                  </span>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main className="pd-frame-main">
        <header className="pd-frame-head">
          <div className="pd-frame-title">
            <span className="pd-rail-key">Runs · North Sea ops</span>
            <h2>Runs</h2>
            <p className="pd-muted">Two wait for you. Nothing has failed since Tuesday.</p>
          </div>
          <div className="pd-frame-slot">
            <button type="button" className="pd-frame-find" onClick={() => onOpen(open === 'palette' ? 'none' : 'palette')}>
              <Icon name="find" size={14} />
              Go to
              <span className="pd-cap" aria-hidden="true">
                /
              </span>
            </button>
            <button type="button" className="pd-frame-key">
              Start a run
            </button>
          </div>
        </header>
        <div className="pd-frame-body">
          <Bar key={picks.bar} {...bar} />
          <ul className="pd-runs" aria-label="Runs">
            {RUNS.map((r) => (
              <li key={r.id} className="pd-run" data-picked={r.id === '4821' || undefined}>
                <span className="pd-mono pd-muted">{r.id}</span>
                <span className="pd-grow">
                  {r.needs ? <span className="pd-needs" aria-hidden="true" /> : null}
                  {r.name}
                </span>
                <span className="pd-muted">{r.agent}</span>
                <span className="pd-run-state">{r.state}</span>
                <span className="pd-mono pd-muted">{r.at}</span>
              </li>
            ))}
          </ul>
          <p className="pd-more">Showing 7 of {countOf(value)} runs · On to the next 7</p>
        </div>
      </main>

      <aside className="pd-frame-drawer" aria-label="Picked run">
        <div className="pd-frame-drawer-head">
          <span className="pd-rail-key">Run 4821 · picked</span>
          <h3>Nightly import</h3>
          <p className="pd-muted pd-small">Import agent, running since 02:00</p>
        </div>
        <div className="pd-frame-drawer-body">
          {open === 'calendar' || open === 'tags' ? null : (
            <div className="pd-field">
              <div className="pd-field-row">
                <span className="pd-label">Rows read</span>
                <SpanPicker look={picks.span} at={span} onAt={setSpan} />
              </div>
              <div className="pd-bars" aria-hidden="true">
                {BARS[span]!.map((h, i) => (
                  <span key={i} style={{ height: `calc(var(--space-2) * ${h})` }} />
                ))}
              </div>
            </div>
          )}
          {open === 'calendar' ? null : <TagsField key={`t${picks.tags}`} opt={picks.tags} open={open === 'tags'} onOpen={(o) => onOpen(o ? 'tags' : 'none')} />}
          <DueField key={`d${picks.calendar}`} opt={picks.calendar} open={open === 'calendar'} onOpen={(o) => onOpen(o ? 'calendar' : 'none')} />
        </div>
      </aside>

      {open === 'palette' ? (
        <>
          <div className="pd-frame-dim" aria-hidden="true" onClick={() => onOpen('none')} />
          <div className="pd-frame-palette" role="dialog" aria-label="Go to">
            {picks.palette === 'a' ? <RailPalette /> : picks.palette === 'b' ? <KeysPalette /> : <WrittenPalette />}
          </div>
        </>
      ) : null}
    </div>
  );
}

/** The strip above the page: one row per decision, three options each, the recommended one marked. */
function Switches({ picks, onPick, focus }: { picks: Picks; onPick: (d: Decision, o: Opt) => void; focus?: Decision }) {
  return (
    <div className="pd-switches" role="group" aria-label="Options">
      {DECISIONS.map((d) => (
        <div key={d.id} className="pd-switch" data-focus={d.id === focus || undefined} role="radiogroup" aria-label={d.label}>
          <span className="pd-switch-label">{d.label}</span>
          {(['a', 'b', 'c'] as Opt[]).map((o) => (
            <button key={o} type="button" role="radio" aria-checked={picks[d.id] === o} className="pd-switch-opt" onClick={() => onPick(d.id, o)}>
              <span className="pd-switch-letter">{o.toUpperCase()}</span>
              {d.options[o]}
              {RECOMMENDED[d.id] === o ? <span className="pd-switch-rec">rec</span> : null}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function Page({ open: first = 'none', focus }: { open?: Open; focus?: Decision }) {
  const [picks, setPicks] = useState<Picks>(RECOMMENDED);
  const [open, setOpen] = useState<Open>(first);
  return (
    <div className="pd-page">
      <Switches picks={picks} focus={focus} onPick={(d, o) => setPicks({ ...picks, [d]: o })} />
      <RunsPage key={first} picks={picks} open={open} onOpen={setOpen} />
    </div>
  );
}

/**
 * The pickers, judged in place. One page in the frame Harry picked (A, Line): a Runs list with its
 * filter bar, a run picked so the drawer shows it, and in the drawer a Segmented span, tags and a
 * review date. The strip above switches each of five decisions between three options; “rec” marks the
 * recommended one (the ruled options, since they share frame A’s line). Press any picker to open it,
 * and “Go to” (or the stories below) to see the palette over the dimmed page.
 *
 * Options, with nearest prior art:
 * - **Filter bar.** A, a ruled line that folds what’s on into one summary (a timetable’s header);
 *   B, keys that stay pressed in with their value on them (a mixing desk); C, a sentence whose words
 *   you press (a fill-in-the-blanks form). Saved views sit at the start of each; none needs chips.
 * - **Palette.** A, a ruled strip, kinds in mono; B, a well over numbered keys, 1 to 9 go at once;
 *   C, one line that writes the best match out ahead of you (shell completion).
 * - **Calendar.** A, a ruled month, the day underlined in ink; B, a tray of day keys; C, written first
 *   (“next fri”) with only that week shown (a week-to-a-page diary).
 * - **Tags.** A, ruled words in the line; B, small keys in a well; C, Stamps, written with commas.
 * - **Segmented.** A, an ink bar under the word; B, the chosen one raised as a key in a well; C, words
 *   split by slashes, the chosen one in ink.
 */
const meta: Meta = {
  title: 'Quill/Picker directions',
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj;

/** The page with nothing open: switch the options above it, and press any picker. */
export const RunsPage_: Story = { name: 'Runs page', render: () => <Page /> };

/** The filter bar with State open. */
export const FilterBarOpen: Story = { name: 'Filter bar open', render: () => <Page open="filter" focus="bar" /> };

/** The palette over the dimmed page (dimming only, no blur). */
export const PaletteOpen: Story = { name: 'Palette open', render: () => <Page open="palette" focus="palette" /> };

/** The review date's calendar open in the drawer. */
export const CalendarOpen: Story = { name: 'Calendar open', render: () => <Page open="calendar" focus="calendar" /> };

/** Adding a tag in the drawer. */
export const TagsOpen: Story = { name: 'Tags open', render: () => <Page open="tags" focus="tags" /> };
