import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState, type ReactNode } from 'react';
import {
  Button as AriaButton,
  ComboBox,
  DateField,
  DateInput,
  DateSegment,
  Group,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  NumberField,
  Popover,
  Slider,
  SliderOutput,
  SliderThumb,
  SliderTrack,
  TimeField,
  I18nProvider,
} from 'react-aria-components';
import { CalendarDate, Time } from '@internationalized/date';
import { Icon } from '@augur/kit-common';
import './input-directions.stories.css';

/**
 * Directions for the inputs round (6 Nov 2026, round A of the Carbon gap audit): combo box, multi select,
 * number field, time field with a date range, and slider. None exists in the kit yet. Every direction
 * builds on the Well fields (an inset slot with a thicker top line, the kit's one focus ring, on-states
 * drawn as small keys), and every list that drops opens as a Sheet: solid, square, one edge, mono
 * capitals for a heading, a hard ink line on the row you're on, never a blur.
 *
 * Each part has three directions, A to C, each named with its nearest prior art so you can see where the
 * idea comes from. None is drawn from Carbon or any other design system. Green still means only "needs
 * you" (a required field left empty); depth is dimming only.
 *
 * Each column has a live part to try at the top, then the same part drawn open, focused or in a state, so
 * it shows in a snapshot. Once one is picked per part, it is built as a real Common or Quill part with its
 * own Carbon-style stories, and this page goes.
 */
const meta = {
  title: 'Common/Input directions',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

interface Direction {
  id: string;
  name: string;
  summary: string;
  prior: string;
}

function Board({ part, summary, directions, children }: { part: string; summary: string; directions: Direction[]; children: (d: string) => ReactNode }) {
  return (
    <div className="id-stage">
      <header className="id-head">
        <h2 className="id-part">{part}</h2>
        <p className="id-summary">{summary}</p>
      </header>
      <div className="id-grid">
        {directions.map((d) => (
          <section key={d.id} className="id-column" data-direction={d.id} aria-label={`${part}: ${d.name}`}>
            <h3 className="id-name">{d.name}</h3>
            <p className="id-note">{d.summary}</p>
            <p className="id-prior">
              <span className="id-prior-label">Nearest prior art</span> {d.prior}
            </p>
            <div className="id-specimens">{children(d.id)}</div>
          </section>
        ))}
      </div>
    </div>
  );
}

const Caption = ({ children }: { children: ReactNode }) => <p className="id-caption">{children}</p>;

/** A field's label row, drawn for the static specimens. */
const Head = ({ label, required }: { label: string; required?: boolean }) => (
  <div className="augur-field-head">
    <span className="augur-field-label">{label}</span>
    {required ? (
      <span className="augur-flag">
        <i className="augur-dot" aria-hidden="true" />
        Required
      </span>
    ) : null}
  </div>
);

/** The characters of a label that match what was typed, drawn in full ink; the rest stays muted. */
function Match({ text, typed }: { text: string; typed: string }) {
  const at = typed ? text.toLowerCase().indexOf(typed.toLowerCase()) : -1;
  if (at < 0) return <span className="id-match-rest">{text}</span>;
  return (
    <span className="id-match-rest">
      {text.slice(0, at)}
      <b className="id-match">{text.slice(at, at + typed.length)}</b>
      {text.slice(at + typed.length)}
    </span>
  );
}

/* ---------------------------------------------------------------- Combo box */

const departments = [
  'Finance', 'Facilities', 'Field operations', 'Fleet', 'Floor 2 reception', 'Floor 4 operations', 'Flight planning', 'Forecasting',
  'Human resources', 'Legal', 'Marketing', 'Operations', 'Procurement', 'Research', 'Security', 'Transport',
].map((name) => ({ id: name, name }));

const comboDirections: Direction[] = [
  { id: 'a', name: 'A · Well and sheet', summary: 'The Well as you type, a Sheet a step below it. What you typed stays in full ink in each row; a count closes the sheet.', prior: 'a browser’s own suggestions under an address bar.' },
  { id: 'b', name: 'B · Deep well', summary: 'The list is the well, deepened: the slot opens down into the sheet with no gap, as one sunken place, and closes back to one line.', prior: 'a search engine’s attached suggestions.' },
  { id: 'c', name: 'C · Key strip', summary: 'No list until you ask: the best five matches wait under the well as small keys. Enter takes the first; More opens the sheet.', prior: 'a phone keyboard’s suggestion strip.' },
];

/** A live combo box drawn by React Aria, its list a Sheet in a popover. */
function LiveCombo({ d }: { d: string }) {
  const [typed, setTyped] = useState('');
  return (
    <ComboBox className="augur-field id-combo" defaultItems={departments} inputValue={typed} onInputChange={setTyped} menuTrigger="input" allowsEmptyCollection>
      <Label className="augur-field-label">Department</Label>
      <div className="augur-field-box">
        <Input className="augur-input" placeholder="Type to find one" />
        <AriaButton className="id-chevron-key" aria-label="Show all departments">
          <Icon name="chevron-down" size={16} />
        </AriaButton>
      </div>
      <Popover className={`id-sheet id-popover-${d}`} offset={d === 'b' ? 0 : 6}>
        <ListBox className="id-list" renderEmptyState={() => <p className="id-empty">No department has those letters.</p>}>
          {(item: { id: string; name: string }) => (
            <ListBoxItem id={item.id} textValue={item.name} className="id-row">
              <Match text={item.name} typed={typed} />
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </ComboBox>
  );
}

/** Direction C, live: the top matches as keys under the well, and the full list only when asked. */
function LiveKeyStrip() {
  const [typed, setTyped] = useState('f');
  const [picked, setPicked] = useState<string | null>(null);
  const [more, setMore] = useState(false);
  const hits = departments.filter((o) => o.name.toLowerCase().includes(typed.toLowerCase()));
  return (
    <div className="augur-field">
      <label className="augur-field-label" htmlFor="id-strip-input">
        Department
      </label>
      <div className="augur-field-box">
        <input
          id="id-strip-input"
          className="augur-input"
          value={picked ?? typed}
          placeholder="Type to find one"
          onChange={(e) => {
            setPicked(null);
            setTyped(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && hits[0]) setPicked(hits[0].name);
          }}
        />
        {picked ? <Icon name="check" size={16} /> : null}
      </div>
      {picked ? null : (
        <div className="id-strip" role="group" aria-label="Best matches">
          {hits.slice(0, 5).map((o, i) => (
            <button key={o.id} type="button" className="id-strip-key" data-first={i === 0 || undefined} onClick={() => setPicked(o.name)}>
              <Match text={o.name} typed={typed} />
            </button>
          ))}
          {hits.length > 5 ? (
            <button type="button" className="id-strip-key id-strip-more" aria-expanded={more} onClick={() => setMore(!more)}>
              {`${hits.length - 5} more`}
            </button>
          ) : null}
          {hits.length === 0 ? <span className="id-empty">No department has those letters.</span> : null}
        </div>
      )}
      {more && !picked ? (
        <div className="id-sheet id-inline-sheet">
          {hits.slice(5).map((o) => (
            <button key={o.id} type="button" className="id-row" onClick={() => setPicked(o.name)}>
              <Match text={o.name} typed={typed} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** A combo box drawn open, so it shows in a snapshot: "flo" typed, the second row pointed at. */
function OpenCombo({ d }: { d: string }) {
  const typed = 'flo';
  const hits = departments.filter((o) => o.name.toLowerCase().includes(typed));
  return (
    <div className="augur-field id-open" data-open-combo={d}>
      <Head label="Department" />
      <div className="augur-field-box" data-demo-focus="">
        <span className="augur-input id-typed">{typed}</span>
        {d === 'c' ? null : (
          <span className="id-chevron-key id-chevron-open" aria-hidden="true">
            <Icon name="chevron-down" size={16} />
          </span>
        )}
      </div>
      {d === 'c' ? (
        <div className="id-strip">
          {hits.map((o, i) => (
            <span key={o.id} className="id-strip-key" data-first={i === 0 || undefined}>
              <Match text={o.name} typed={typed} />
            </span>
          ))}
          <span className="id-strip-hint">Enter takes the first</span>
        </div>
      ) : (
        <div className="id-sheet id-drawn-sheet">
          <p className="id-sheet-heading">Departments</p>
          {hits.map((o, i) => (
            <div key={o.id} className="id-row" data-on={i === 1 || undefined}>
              <Match text={o.name} typed={typed} />
            </div>
          ))}
          <p className="id-sheet-foot">{`${hits.length} of ${departments.length}`}</p>
        </div>
      )}
    </div>
  );
}

/** Type to filter one choice from a long list: departments, floors, apps. Try the top one in each column. */
export const ComboBoxDirections: Story = {
  name: 'Combo box',
  render: () => (
    <Board part="Combo box" summary="Type to find one choice in a long list (departments, floors, apps), where a plain select would have to scroll." directions={comboDirections}>
      {(d) => (
        <>
          {d === 'c' ? <LiveKeyStrip /> : <LiveCombo d={d} />}
          <Caption>Open, with “flo” typed</Caption>
          <OpenCombo d={d} />
        </>
      )}
    </Board>
  ),
};

/* ------------------------------------------------------------- Multi select */

const floors = ['Ground', 'Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5', 'Roof plant'];

const multiDirections: Direction[] = [
  { id: 'a', name: 'A · Count key', summary: 'The well says what you chose in words, cut short, and a small key at its end holds the count. In the sheet, each row has its own check well.', prior: 'a spreadsheet’s column filter.' },
  { id: 'b', name: 'B · Keys, capped', summary: 'What you chose sits in the well as small keys, but never more than one line: past two, a “+3” key stands for the rest and opens the sheet.', prior: 'a mail app’s recipients line, folded.' },
  { id: 'c', name: 'C · Ledger', summary: 'The well only adds. What you chose is a ruled list under it, one line each with a way to take it off, so the field never changes size.', prior: 'a paper form’s list of entries.' },
];

function MultiWell({ d, chosen, open, onToggle, demo }: { d: string; chosen: string[]; open: boolean; onToggle: () => void; demo?: boolean }) {
  const shown = d === 'b' ? chosen.slice(0, 2) : [];
  return (
    <button type="button" className="augur-field-box id-multi-box" aria-expanded={open} onClick={onToggle} data-demo-focus={demo ? '' : undefined}>
      {d === 'a' ? (
        chosen.length ? (
          <>
            <span className="id-multi-words">{chosen.join(', ')}</span>
            <span className="id-count-key">{chosen.length}</span>
          </>
        ) : (
          <span className="id-placeholder">Any floor</span>
        )
      ) : d === 'b' ? (
        chosen.length ? (
          <span className="id-key-row">
            {shown.map((c) => (
              <span key={c} className="id-chip-key">
                {c}
              </span>
            ))}
            {chosen.length > 2 ? <span className="id-chip-key id-chip-more">{`+${chosen.length - 2}`}</span> : null}
          </span>
        ) : (
          <span className="id-placeholder">Any floor</span>
        )
      ) : (
        <span className="id-placeholder">Add a floor</span>
      )}
      <span className="id-chevron-key" aria-hidden="true">
        <Icon name={d === 'c' ? 'plus' : 'chevron-down'} size={16} />
      </span>
    </button>
  );
}

function MultiSheet({ d, chosen, setChosen, label }: { d: string; chosen: string[]; setChosen: (next: string[]) => void; label: string }) {
  const items = d === 'c' ? floors.filter((f) => !chosen.includes(f)) : floors;
  return (
    <div className="id-sheet id-drawn-sheet">
      <p className="id-sheet-heading">{d === 'c' ? 'Add floors' : 'Floors'}</p>
      <ListBox
        aria-label={label}
        selectionMode="multiple"
        selectedKeys={d === 'c' ? [] : chosen}
        onSelectionChange={(keys) => {
          if (keys === 'all') return;
          const next = [...keys].map(String);
          if (d === 'c') setChosen([...chosen, ...next.filter((k) => !chosen.includes(k))]);
          else setChosen(floors.filter((f) => next.includes(f)));
        }}
        className="id-list"
        items={items.map((f) => ({ id: f }))}
      >
        {(item: { id: string }) => (
          <ListBoxItem id={item.id} textValue={item.id} className="id-row">
            {({ isSelected }) => (
              <>
                {d === 'c' ? <Icon name="plus" size={14} /> : <span className="id-check" data-on={isSelected || undefined}>{isSelected ? <Icon name="check" size={12} /> : null}</span>}
                <span>{item.id}</span>
              </>
            )}
          </ListBoxItem>
        )}
      </ListBox>
      {d === 'c' ? null : <p className="id-sheet-foot">{`${chosen.length} of ${floors.length} chosen`}</p>}
    </div>
  );
}

function Ledger({ chosen, setChosen }: { chosen: string[]; setChosen: (next: string[]) => void }) {
  if (!chosen.length) return <p className="id-empty">Every floor, until you add one.</p>;
  return (
    <ul className="id-ledger">
      {chosen.map((c) => (
        <li key={c} className="id-ledger-line">
          <span>{c}</span>
          <button type="button" className="id-ledger-off" aria-label={`Take off ${c}`} onClick={() => setChosen(chosen.filter((x) => x !== c))}>
            <Icon name="close" size={14} />
          </button>
        </li>
      ))}
    </ul>
  );
}

function LiveMulti({ d, start, open: startOpen, required }: { d: string; start: string[]; open?: boolean; required?: boolean }) {
  const [chosen, setChosen] = useState(start);
  const [open, setOpen] = useState(!!startOpen);
  const asking = required && chosen.length === 0;
  return (
    <div className="augur-field" data-state={asking ? 'attention' : undefined}>
      <Head label="Floors" required={required} />
      <MultiWell d={d} chosen={chosen} open={open} onToggle={() => setOpen(!open)} demo={startOpen} />
      {asking ? <p className="augur-message">Needs you.</p> : null}
      {open ? <MultiSheet d={d} chosen={chosen} setChosen={setChosen} label={`Floors (${d})`} /> : null}
      {d === 'c' ? <Ledger chosen={chosen} setChosen={setChosen} /> : null}
    </div>
  );
}

/** Pick several from a set without the choices taking over the field. Each column is live. */
export const MultiSelectDirections: Story = {
  name: 'Multi select',
  render: () => (
    <Board part="Multi select" summary="Pick several from a set (floors, teams, kinds of thing) without what you chose taking over the field or the form." directions={multiDirections}>
      {(d) => (
        <>
          <Caption>Four chosen, open</Caption>
          <LiveMulti d={d} start={['Floor 1', 'Floor 2', 'Floor 4', 'Roof plant']} open />
          <Caption>Required, none chosen</Caption>
          <LiveMulti d={d} start={[]} required />
        </>
      )}
    </Board>
  ),
};

/* ------------------------------------------------------------- Number field */

const numberDirections: Direction[] = [
  { id: 'a', name: 'A · Step keys at the end', summary: 'The number in mono in the well, its unit after it, and two small keys at the end: less and more. Held, a key repeats.', prior: 'a phone’s settings stepper.' },
  { id: 'b', name: 'B · Keys either side', summary: 'Less on the left, more on the right, the number centred in the well between them, so the keys and the value read as one row.', prior: 'a basket’s quantity control.' },
  { id: 'c', name: 'C · Scrub', summary: 'No keys: drag the unit sideways to change the number, or type it, or use the arrow keys. The limits show as a short rule under the well.', prior: 'a drawing tool’s drag-to-change value.' },
];

/** A minus drawn as a short line: Common's icon set has no minus yet (it would come from Lucide when built). */
const Minus = () => <span className="id-minus" aria-hidden="true" />;

function LiveNumber({ d, label, unit, start, min, max, step = 1, error, demo }: { d: string; label: string; unit: string; start: number; min: number; max: number; step?: number; error?: string; demo?: boolean }) {
  const [value, setValue] = useState(start);
  const drag = useRef<{ x: number; v: number } | null>(null);
  const share = (value - min) / (max - min);
  return (
    <NumberField className="augur-field id-number" data-state={error ? 'error' : undefined} value={value} onChange={setValue} minValue={min} maxValue={max} step={step} isInvalid={!!error}>
      <Label className="augur-field-label">{label}</Label>
      <Group className="augur-field-box id-number-box" data-demo-focus={demo ? '' : undefined}>
        {d === 'b' ? (
          <AriaButton slot="decrement" className="id-step-key">
            <Minus />
          </AriaButton>
        ) : null}
        <Input className="augur-input id-number-input" />
        <span
          className="id-unit"
          data-scrub={d === 'c' || undefined}
          onPointerDown={(e) => {
            if (d !== 'c') return;
            drag.current = { x: e.clientX, v: value };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            const next = Math.round((drag.current.v + ((e.clientX - drag.current.x) / 4) * step) / step) * step;
            setValue(Math.min(max, Math.max(min, next)));
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
        >
          {unit}
        </span>
        {d === 'a' ? (
          <span className="id-step-pair">
            <AriaButton slot="decrement" className="id-step-key">
              <Minus />
            </AriaButton>
            <AriaButton slot="increment" className="id-step-key">
              <Icon name="plus" size={14} />
            </AriaButton>
          </span>
        ) : null}
        {d === 'b' ? (
          <AriaButton slot="increment" className="id-step-key">
            <Icon name="plus" size={14} />
          </AriaButton>
        ) : null}
      </Group>
      {d === 'c' ? (
        <div className="id-limits" aria-hidden="true">
          <span className="id-limits-rule">
            <i className="id-limits-at" style={{ left: `${share * 100}%` }} />
          </span>
          <span className="id-limits-ends">
            <span>{min}</span>
            <span>{max}</span>
          </span>
        </div>
      ) : null}
      {error ? <p className="augur-message">{error}</p> : null}
    </NumberField>
  );
}

/** Limits, counts and amounts in settings and forms. Each column is live. */
export const NumberFieldDirections: Story = {
  name: 'Number field',
  render: () => (
    <Board part="Number field" summary="Limits, counts and amounts in settings and forms, with steps, a floor and a ceiling." directions={numberDirections}>
      {(d) => (
        <>
          <LiveNumber d={d} label="Storage limit" unit="GB" start={40} min={5} max={200} step={5} />
          <Caption>Focused</Caption>
          <LiveNumber d={d} label="Seats" unit="people" start={12} min={1} max={50} demo />
          <Caption>Wrong</Caption>
          <LiveNumber d={d} label="Storage limit" unit="GB" start={250} min={5} max={500} step={5} error="This floor has 200 GB left." />
        </>
      )}
    </Board>
  ),
};

/* ---------------------------------------------------------- Time and range */

const timeDirections: Direction[] = [
  { id: 'a', name: 'A · Segments', summary: 'Hours and minutes as segments in mono in the well; the one you’re on comes up as a small key. Arrow keys step it. A range is two sets of segments in one well.', prior: 'a browser’s own time input.' },
  { id: 'b', name: 'B · Written', summary: 'Write it as you’d say it (“9am”, “half 2”, “17:30”), like Quill’s date field; the well echoes the time it read in mono. A range is two wells joined by a line.', prior: 'a calendar app’s quick-add box.' },
  { id: 'c', name: 'C · Slots', summary: 'Pick from the day’s slots as a grid of small keys in a Sheet, with no scrolling: one hour a row. A range is drawn on a month as two keys and the line between.', prior: 'a booking page’s free slots.' },
];

/** Reads a time said in words: "9", "9am", "half 2", "quarter past 3", "17:30", "noon". Hours 1 to 6 alone read as the afternoon. */
const readTime = (text: string): string | null => {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  if (t === 'noon' || t === 'midday') return '12:00';
  if (t === 'midnight') return '00:00';
  const pad = (n: number) => String(n).padStart(2, '0');
  const said = /^(half|quarter)\s+(past\s+|to\s+)?(\d{1,2})$/.exec(t);
  if (said) {
    let h = Number(said[3]);
    if (h > 12) return null;
    if (h <= 6) h += 12;
    if (said[1] === 'half') return `${pad(h)}:30`;
    return said[2]?.startsWith('to') ? `${pad(h - 1)}:45` : `${pad(h)}:15`;
  }
  const m = /^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?$/.exec(t);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  if (min > 59 || h > 23) return null;
  if (m[3] === 'pm' && h < 12) h += 12;
  if (m[3] === 'am' && h === 12) h = 0;
  if (!m[3] && !m[2] && h >= 1 && h <= 6) h += 12;
  return `${pad(h)}:${pad(min)}`;
};

function LiveWritten({ label, start }: { label: string; start: string }) {
  const [text, setText] = useState(start);
  const read = readTime(text);
  return (
    <div className="augur-field" data-state={text && !read ? 'error' : undefined}>
      <label className="augur-field-label" htmlFor={`id-written-${label}`}>
        {label}
      </label>
      <div className="augur-field-box">
        <input id={`id-written-${label}`} className="augur-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="9am, half 2, 17:30" />
        {read ? <span className="id-echo">{read}</span> : null}
      </div>
      {text && !read ? <p className="augur-message">That isn’t a time I can read. Try “9am” or “17:30”.</p> : null}
    </div>
  );
}

const slotHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
const taken = new Set(['10:00', '10:30', '13:00', '13:15']);

function LiveSlots() {
  const [picked, setPicked] = useState('14:30');
  return (
    <div className="augur-field">
      <span className="augur-field-label" id="id-slots-label">
        Starts at
      </span>
      <div className="augur-field-box id-slot-well">
        <span className="augur-input id-mono">{picked}</span>
        <span className="id-chevron-key id-chevron-open" aria-hidden="true">
          <Icon name="clock" size={16} />
        </span>
      </div>
      <div className="id-sheet id-drawn-sheet id-slots" role="group" aria-labelledby="id-slots-label">
        <p className="id-sheet-heading">Thursday 12 November</p>
        {slotHours.map((h) => (
          <div key={h} className="id-slot-row">
            <span className="id-slot-hour">{String(h).padStart(2, '0')}</span>
            {['00', '15', '30', '45'].map((m) => {
              const at = `${String(h).padStart(2, '0')}:${m}`;
              const busy = taken.has(at);
              return (
                <button key={at} type="button" className="id-slot-key" aria-pressed={picked === at} aria-label={busy ? `${at}, taken` : at} disabled={busy} onClick={() => setPicked(at)}>
                  {`:${m}`}
                </button>
              );
            })}
          </div>
        ))}
        <p className="id-sheet-foot">Struck through: already taken</p>
      </div>
    </div>
  );
}

/** A month drawn small, for the range in direction C: the two ends are keys and the days between sit on a line. */
function RangeMonth() {
  const first = 0; // November 2026 begins on a Sunday: with weeks from Monday it sits in the last column.
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const lead = (first + 6) % 7;
  return (
    <div className="id-sheet id-drawn-sheet id-month">
      <p className="id-sheet-heading">November 2026</p>
      <div className="id-month-grid">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((w, i) => (
          <span key={`w${i}`} className="id-month-week">
            {w}
          </span>
        ))}
        {Array.from({ length: lead }, (_, i) => (
          <span key={`l${i}`} />
        ))}
        {days.map((n) => (
          <span key={n} className="id-month-day" data-end={n === 13 || n === 20 || undefined} data-between={(n > 13 && n < 20) || undefined}>
            {n}
          </span>
        ))}
      </div>
      <p className="id-sheet-foot">13 → 20 Nov · 8 days</p>
    </div>
  );
}

function Range({ d }: { d: string }) {
  if (d === 'a')
    return (
      <div className="augur-field">
        <span className="augur-field-label" id="id-range-a">
          Away
        </span>
        <div className="augur-field-box id-range-box" role="group" aria-labelledby="id-range-a">
          <DateField className="id-date" aria-label="From" defaultValue={new CalendarDate(2026, 11, 13)}>
            <DateInput className="id-segments">{(s) => <DateSegment segment={s} className="id-segment" />}</DateInput>
          </DateField>
          <span className="id-range-arrow" aria-hidden="true">
            <Icon name="arrow" size={14} />
          </span>
          <DateField className="id-date" aria-label="To" defaultValue={new CalendarDate(2026, 11, 20)}>
            <DateInput className="id-segments">{(s) => <DateSegment segment={s} className="id-segment" />}</DateInput>
          </DateField>
          <span className="id-chevron-key" aria-hidden="true">
            <Icon name="calendar" size={16} />
          </span>
        </div>
      </div>
    );
  if (d === 'b')
    return (
      <div className="id-range-pair">
        <div className="augur-field">
          <label className="augur-field-label" htmlFor="id-range-from">
            Away from
          </label>
          <div className="augur-field-box">
            <input id="id-range-from" className="augur-input" defaultValue="fri 13 nov" />
            <span className="id-echo">13 Nov</span>
          </div>
        </div>
        <span className="id-range-join" aria-hidden="true" />
        <div className="augur-field">
          <label className="augur-field-label" htmlFor="id-range-to">
            To
          </label>
          <div className="augur-field-box">
            <input id="id-range-to" className="augur-input" defaultValue="+1w" />
            <span className="id-echo">20 Nov</span>
          </div>
        </div>
        <p className="id-range-total">8 days</p>
      </div>
    );
  return (
    <div className="augur-field">
      <Head label="Away" />
      <div className="augur-field-box">
        <span className="augur-input id-mono">13 Nov → 20 Nov</span>
        <span className="id-chevron-key id-chevron-open" aria-hidden="true">
          <Icon name="calendar" size={16} />
        </span>
      </div>
      <RangeMonth />
    </div>
  );
}

/** A time of day, and a range of days, for schedules, leave and "from and to" filters. Quill's, beside its date field. */
export const TimeAndRangeDirections: Story = {
  name: 'Time field and date range',
  // React Aria's time and date fields carry a hidden form input; happy-dom doesn't treat `hidden` as hidden, so the label rule is
  // left to the Storybook's own panel here, where a real browser skips it.
  parameters: { a11y: { options: { rules: { label: { enabled: false } } } } },
  render: () => (
    <Board part="Time field and date range" summary="A time of day, and a range of days, for schedules, leave and “from and to” filters. They join Quill’s date field." directions={timeDirections}>
      {(d) => (
        <I18nProvider locale="en-GB">
          {d === 'a' ? (
            <>
              <TimeField className="augur-field" defaultValue={new Time(14, 30)} hourCycle={24}>
                <Label className="augur-field-label">Starts at</Label>
                <DateInput className="augur-field-box id-segments">{(s) => <DateSegment segment={s} className="id-segment" />}</DateInput>
              </TimeField>
              <Caption>Focused, on the minutes</Caption>
              <div className="augur-field">
                <Head label="Ends at" />
                <div className="augur-field-box id-segments" data-demo-focus="">
                  <span className="id-segment">16</span>
                  <span className="id-segment" data-type="literal">
                    :
                  </span>
                  <span className="id-segment" data-focused="">
                    45
                  </span>
                </div>
              </div>
            </>
          ) : d === 'b' ? (
            <>
              <LiveWritten label="Starts at" start="half 2" />
              <Caption>Something it can’t read</Caption>
              <LiveWritten label="Ends at" start="teatime" />
            </>
          ) : (
            <LiveSlots />
          )}
          <Caption>A range of days</Caption>
          <Range d={d} />
        </I18nProvider>
      )}
    </Board>
  ),
};

/* ------------------------------------------------------------------- Slider */

const sliderDirections: Direction[] = [
  { id: 'a', name: 'A · Fader', summary: 'The track is a narrow well; the thumb is a small key standing in it, its thicker bottom line its depth. The part you’ve chosen fills in ink.', prior: 'a mixing desk’s fader.' },
  { id: 'b', name: 'B · Rule', summary: 'No box: a hairline with a notch at each step, and the thumb a thick upright ink line. The value rides above it in mono while you move it.', prior: 'a tape measure.' },
  { id: 'c', name: 'C · Steps', summary: 'For a few steps only: a row of small wells, and each one up to the value comes up as a key. One press sets it.', prior: 'a television’s volume bar.' },
];

function LiveSlider({ d, label, start, max = 100, step = 1, unit = '%', steps, demo }: { d: string; label: string; start: number; max?: number; step?: number; unit?: string; steps?: number; demo?: boolean }) {
  const blocks = steps ?? max / step;
  return (
    <Slider className="id-slider" defaultValue={start} maxValue={max} step={step} data-kind={d}>
      <div className="id-slider-head">
        <Label className="augur-field-label">{label}</Label>
        {d === 'b' ? null : <SliderOutput className="id-slider-out">{({ state }) => `${state.getThumbValue(0)}${unit}`}</SliderOutput>}
      </div>
      <SliderTrack className="id-track">
        {({ state }) => {
          const share = state.getThumbPercent(0);
          return (
            <>
              {d === 'a' ? <span className="id-track-fill" style={{ width: `${share * 100}%` }} /> : null}
              {d === 'b'
                ? Array.from({ length: blocks + 1 }, (_, i) => <span key={i} className="id-notch" style={{ left: `${(i / blocks) * 100}%` }} data-major={i % 5 === 0 || undefined} />)
                : null}
              {d === 'c' ? (
                <span className="id-blocks">
                  {Array.from({ length: blocks }, (_, i) => (
                    <span key={i} className="id-block" data-on={i < Math.round(share * blocks) || undefined} />
                  ))}
                </span>
              ) : null}
              <SliderThumb className="id-thumb" data-demo-focus={demo ? '' : undefined}>
                {d === 'b' ? <span className="id-thumb-value">{`${state.getThumbValue(0)}${unit}`}</span> : null}
              </SliderThumb>
            </>
          );
        }}
      </SliderTrack>
    </Slider>
  );
}

/** A level or a share chosen by feel. Each column is live; drag the thumb or use the arrow keys. */
export const SliderDirections: Story = {
  name: 'Slider',
  render: () => (
    <Board part="Slider" summary="A level or a share chosen by feel, such as how much of a list to show or how loud a sound is." directions={sliderDirections}>
      {(d) => (
        <>
          {d === 'c' ? (
            <>
              <LiveSlider d={d} label="Detail" start={3} max={5} unit=" of 5" steps={5} />
              <Caption>Focused</Caption>
              <LiveSlider d={d} label="Volume" start={6} max={10} unit="" steps={10} demo />
            </>
          ) : (
            <>
              <LiveSlider d={d} label="Show on the front page" start={60} max={100} step={5} />
              <Caption>Focused</Caption>
              <LiveSlider d={d} label="Volume" start={30} max={100} step={10} demo />
            </>
          )}
        </>
      )}
    </Board>
  ),
};

