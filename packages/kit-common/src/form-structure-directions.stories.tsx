import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { Button } from './button.js';
import { Checkbox } from './checkbox.js';
import { Icon, type IconName } from './icon.js';
import { Select } from './select.js';
import { TextField } from './text-field.js';
import { Toggle } from './toggle.js';
import './form-structure-directions.stories.css';

/**
 * Round J directions (6 Nov 2026): fieldset, error summary, toolbar, split panes and the skip link, in three
 * original directions to pick from. Each direction is one way of drawing all five, and they differ in how
 * the parts behave as well as how they look, so the pick settles both. You can also mix: pick per part.
 *
 * What holds in all three: a missing required answer asks in green (needs you) and only a wrong answer is
 * red; the error summary lists each problem and takes you to its field; the toolbar is one tab stop with
 * arrow keys inside it, and what doesn't fit goes into More rather than scrolling; panes keep a smallest
 * size so nothing inside them needs to scroll sideways; the skip link shows on the first Tab.
 *
 * - **A · Rule** grows from the horizon line (Divider, the PDR-014 section). Groups are a mono word on a
 *   groove, problems are a ruled list, tools sit on one line, the split is a line you drag.
 * - **B · Key** grows from Keycap and Well. Groups sit in a margin beside their fields, problems are keys
 *   by the save button, tools are keys in a tray, and the split is chosen with keys rather than dragged.
 * - **C · Ledger** grows from the Stamp and the mono labels. Groups are numbered, problems are stamped
 *   and numbered to match the fields, tools are labelled in groups, and panes fold to a strip.
 *
 * This page goes away once one is picked; the pick is built as real parts with their own story pages.
 */
const meta = {
  title: 'Common/Directions/Form and page structure',
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

type Look = 'a' | 'b' | 'c';
const LOOKS: { id: Look; name: string; from: string }[] = [
  { id: 'a', name: 'A · Rule', from: 'From the horizon line and the PDR-014 section. Nearest prior art: the ruled sections of a printed form.' },
  { id: 'b', name: 'B · Key', from: 'From Keycap and Well. Nearest prior art: a keyboard’s keys in their tray, and desktop settings with labels in a margin.' },
  { id: 'c', name: 'C · Ledger', from: 'From the Stamp and the mono labels. Nearest prior art: a numbered ledger or an official paper form with boxes 01, 02.' },
];

function Columns({ children }: { children: (look: Look) => ReactNode }) {
  return (
    <div className="fps-page">
      {LOOKS.map((l) => (
        <section key={l.id} className="fps-col" aria-labelledby={`fps-${l.id}`}>
          <header className="fps-head">
            <h2 id={`fps-${l.id}`} className="fps-name">{l.name}</h2>
            <p className="fps-from">{l.from}</p>
          </header>
          {children(l.id)}
        </section>
      ))}
    </div>
  );
}

function Stacked({ children }: { children: (look: Look) => ReactNode }) {
  return (
    <div className="fps-stack-page">
      {LOOKS.map((l) => (
        <section key={l.id} className="fps-row-section" aria-labelledby={`fps-s-${l.id}`}>
          <header className="fps-head fps-head-side">
            <h2 id={`fps-s-${l.id}`} className="fps-name">{l.name}</h2>
            <p className="fps-from">{l.from}</p>
          </header>
          {children(l.id)}
        </section>
      ))}
    </div>
  );
}

const Note = ({ children }: { children: ReactNode }) => <p className="fps-note">{children}</p>;

/* ---------- Fieldset: a named group of fields ---------- */

function Fieldset({ look, n, legend, hint, children }: { look: Look; n: number; legend: string; hint?: string; children: ReactNode }) {
  const id = useId();
  return (
    <div role="group" aria-labelledby={`${id}-l`} aria-describedby={hint ? `${id}-h` : undefined} className="fps-set" data-look={look}>
      <div className="fps-set-head">
        {look === 'c' ? <span className="fps-set-no" aria-hidden="true">{String(n).padStart(2, '0')}</span> : null}
        <span id={`${id}-l`} className="fps-set-legend">{legend}</span>
        {hint ? <span id={`${id}-h`} className="fps-set-hint">{hint}</span> : null}
      </div>
      <div className="fps-set-body">{children}</div>
    </div>
  );
}

/* ---------- Error summary: what stops the form, each a way to its field ---------- */

interface Problem { id: string; field: string; kind: 'missing' | 'wrong'; say: string }

function focusField(id: string) {
  const el = document.getElementById(id)?.querySelector<HTMLElement>('input, textarea, button, [tabindex]');
  el?.focus();
}

function count(problems: Problem[]) {
  const missing = problems.filter((p) => p.kind === 'missing').length;
  const wrong = problems.length - missing;
  return [missing ? `${missing} ${missing === 1 ? 'needs' : 'need'} you` : '', wrong ? `${wrong} wrong` : ''].filter(Boolean).join(' · ');
}

const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];

function ErrorSummary({ look, problems, focusOnShow = true }: { look: Look; problems: Problem[]; focusOnShow?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = problems.length > 0;
  useEffect(() => {
    if (shown && focusOnShow) ref.current?.focus();
  }, [shown, focusOnShow]);
  if (!shown) return null;
  const heading = `${WORDS[problems.length] ?? problems.length} ${problems.length === 1 ? 'thing stops' : 'things stop'} this saving`;
  if (look === 'a') {
    return (
      <div ref={ref} tabIndex={-1} role="region" aria-label={heading} className="fps-sum" data-look="a">
        <div className="fps-sum-head">
          <span className="fps-sum-title">{heading}</span>
          <span className="fps-sum-count">{count(problems)}</span>
        </div>
        <ul className="fps-sum-list">
          {problems.map((p) => (
            <li key={p.id}>
              <button type="button" className="fps-sum-item augur-focus-ring" data-kind={p.kind} onClick={() => focusField(p.id)}>
                <span className="fps-sum-tone">{p.kind === 'missing' ? 'Needs you' : 'Wrong'}</span>
                <span className="fps-sum-field">{p.field}</span>
                <span className="fps-sum-say">{p.say}</span>
                <Icon name="arrow" size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (look === 'b') {
    return (
      <div ref={ref} tabIndex={-1} role="region" aria-label={heading} className="fps-sum" data-look="b">
        <p className="fps-sum-title">{heading}. Press one to go to it.</p>
        <div className="fps-sum-tray">
          {problems.map((p) => (
            <button key={p.id} type="button" className="fps-sum-key augur-focus-ring" data-kind={p.kind} onClick={() => focusField(p.id)} aria-label={`${p.field}: ${p.say}`}>
              <i className="fps-sum-dot" aria-hidden="true" />
              {p.field}
            </button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div ref={ref} tabIndex={-1} role="region" aria-label={heading} className="fps-sum" data-look="c">
      <div className="fps-sum-stamp-row">
        <span className="fps-sum-stamp">{problems.length} to fix</span>
        <span className="fps-sum-count">{count(problems)}</span>
      </div>
      <ol className="fps-sum-list">
        {problems.map((p, i) => (
          <li key={p.id}>
            <button type="button" className="fps-sum-item augur-focus-ring" data-kind={p.kind} onClick={() => focusField(p.id)}>
              <span className="fps-sum-no" aria-hidden="true">{i + 1}</span>
              <span className="fps-sum-field">{p.field}</span>
              <span className="fps-sum-say">{p.say}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Where a field sits in a form: C prints the problem's number beside it, to match the stamp. */
function Slot({ look, id, no, children }: { look: Look; id: string; no?: number; children: ReactNode }) {
  return (
    <div id={id} className="fps-slot" data-look={look}>
      {look === 'c' && no ? <span className="fps-slot-no" aria-hidden="true">{no}</span> : null}
      {children}
    </div>
  );
}

/* ---------- Toolbar: one tab stop, arrows inside, More for what doesn't fit ---------- */

interface Tool { id: string; icon: IconName; label: string; toggle?: boolean }
interface ToolGroup { name: string; tools: Tool[] }

const TOOLS: ToolGroup[] = [
  { name: 'Run', tools: [{ id: 'run', icon: 'play', label: 'Run' }, { id: 'pause', icon: 'pause', label: 'Pause' }] },
  { name: 'Show', tools: [{ id: 'filter', icon: 'filter', label: 'Filter', toggle: true }, { id: 'sort', icon: 'sort', label: 'Sort' }, { id: 'history', icon: 'history', label: 'History', toggle: true }] },
  { name: 'Keep', tools: [{ id: 'download', icon: 'download', label: 'Download' }] },
];

function Toolbar({ look, groups = TOOLS, label = 'Run tools' }: { look: Look; groups?: ToolGroup[]; label?: string }) {
  const [on, setOn] = useState<Set<string>>(new Set(['filter']));
  const [at, setAt] = useState(0);
  const [fit, setFit] = useState(Infinity);
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const measure = useRef<HTMLDivElement>(null);
  const all = groups.flatMap((g) => g.tools);
  // What fits stays on the bar; the rest goes into More, never a scroll. Widths come from a hidden copy.
  useLayoutEffect(() => {
    const el = bar.current;
    const m = measure.current;
    if (!el || !m) return;
    const work = () => {
      const widths = [...m.querySelectorAll<HTMLElement>('[data-measure]')].map((t) => t.getBoundingClientRect().width);
      const moreW = m.querySelector<HTMLElement>('[data-measure-more]')?.getBoundingClientRect().width ?? 0;
      const cs = getComputedStyle(el);
      const barGap = Number.parseFloat(cs.columnGap) || 0;
      const toolGap = Number.parseFloat(getComputedStyle(el.querySelector('.fps-bar-tools') ?? el).columnGap) || 0;
      const room = el.clientWidth - (Number.parseFloat(cs.paddingLeft) || 0) - (Number.parseFloat(cs.paddingRight) || 0) - moreW;
      // Width of the first n tools as the bar would lay them out: gaps inside groups, gaps (and A's grooves) between them.
      const need = (n: number) => {
        let w = 0;
        let i = 0;
        let used = 0;
        for (const g of groups) {
          const k = Math.min(g.tools.length, Math.max(0, n - i));
          if (k > 0) {
            used += 1;
            w += widths.slice(i, i + k).reduce((x, y) => x + y, 0) + (k - 1) * toolGap;
            if (look === 'a' && k === g.tools.length) w += barGap + 1;
          }
          i += g.tools.length;
        }
        return w + used * barGap;
      };
      let n = widths.length;
      while (n > 0 && need(n) > room) n -= 1;
      setFit(n);
    };
    work();
    const ro = new ResizeObserver(work);
    ro.observe(el);
    return () => ro.disconnect();
  }, [groups, look]);
  const shown = new Set(all.slice(0, fit).map((t) => t.id));
  const hidden = all.filter((t) => !shown.has(t.id));
  const flat = [...all.filter((t) => shown.has(t.id)).map((t) => t.id), 'more'];
  const move = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { setOpen(false); return; }
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    const to = e.key === 'Home' ? 0 : e.key === 'End' ? flat.length - 1 : step ? (at + step + flat.length) % flat.length : -1;
    if (to < 0) return;
    e.preventDefault();
    setAt(to);
    bar.current?.querySelectorAll<HTMLElement>('[data-tool]')[to]?.focus();
  };
  const press = (t: Tool) => t.toggle && setOn((s) => { const n = new Set(s); if (n.has(t.id)) n.delete(t.id); else n.add(t.id); return n; });
  const face = (t: Tool) => (
    <>
      <Icon name={t.icon} size={16} aria-hidden="true" />
      <span>{t.label}</span>
    </>
  );
  const tool = (t: Tool) => (
    <button
      key={t.id}
      type="button"
      data-tool=""
      className="fps-tool augur-focus-ring"
      tabIndex={flat[at] === t.id ? 0 : -1}
      aria-pressed={t.toggle ? on.has(t.id) : undefined}
      onFocus={() => setAt(flat.indexOf(t.id))}
      onClick={() => press(t)}
    >
      {face(t)}
    </button>
  );
  return (
    <div className="fps-bar-wrap" data-look={look}>
      <div ref={measure} className="fps-bar fps-bar-measure" data-look={look} aria-hidden="true">
        {all.map((t) => <span key={t.id} data-measure="" className="fps-tool">{face(t)}</span>)}
        <span data-measure-more="" className="fps-tool"><Icon name="more" size={16} /><span>More</span></span>
      </div>
      <div ref={bar} role="toolbar" aria-label={label} className="fps-bar" data-look={look} onKeyDown={move}>
        {groups.map((g, i) => {
          const tools = g.tools.filter((t) => shown.has(t.id));
          if (!tools.length) return null;
          return (
            <div key={g.name} className="fps-bar-group" role="group" aria-label={g.name}>
              {look === 'c' ? <span className="fps-bar-caption" aria-hidden="true">{g.name}</span> : null}
              <div className="fps-bar-tools">{tools.map(tool)}</div>
              {look === 'a' && i < groups.length - 1 && g.tools.every((t) => shown.has(t.id)) ? <span className="fps-bar-sep" aria-hidden="true" /> : null}
            </div>
          );
        })}
        <div className="fps-bar-group fps-bar-end">
          {look === 'c' ? <span className="fps-bar-caption" aria-hidden="true">{hidden.length ? `${hidden.length} more` : '\u00a0'}</span> : null}
          <div className="fps-bar-tools">
            <button
              type="button"
              data-tool=""
              className="fps-tool augur-focus-ring"
              tabIndex={flat[at] === 'more' ? 0 : -1}
              aria-expanded={open}
              aria-haspopup="true"
              onFocus={() => setAt(flat.length - 1)}
              onClick={() => setOpen((o) => !o)}
            >
              <Icon name="more" size={16} aria-hidden="true" />
              <span>More</span>
            </button>
          </div>
        </div>
      </div>
      {open ? (
        <ul className="fps-bar-more" aria-label="More tools">
          {hidden.map((t) => (
            <li key={t.id}>
              <button type="button" className="fps-bar-more-item augur-focus-ring" aria-pressed={t.toggle ? on.has(t.id) : undefined} onClick={() => press(t)}>{face(t)}</button>
            </li>
          ))}
          <li><button type="button" className="fps-bar-more-item augur-focus-ring">{face({ id: 'rename', icon: 'rename', label: 'Rename run' })}</button></li>
          <li><button type="button" className="fps-bar-more-item augur-focus-ring">{face({ id: 'archive', icon: 'archive', label: 'Archive run' })}</button></li>
        </ul>
      ) : null}
    </div>
  );
}

/* ---------- Split panes ---------- */

const SNAPS = [1 / 3, 1 / 2, 2 / 3];
const MIN = 0.22;
const clamp = (v: number) => Math.min(1 - MIN, Math.max(MIN, v));

function SplitPanes({ look, start, end, startName, endName, initial = 0.5, height }: { look: Look; start: ReactNode; end: ReactNode; startName: string; endName: string; initial?: number; height?: string }) {
  const [size, setSize] = useState(initial);
  const [folded, setFolded] = useState<'start' | 'end' | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const drag = (e: PointerEvent<HTMLDivElement>) => {
    if (!(e.buttons & 1) || !box.current) return;
    const r = box.current.getBoundingClientRect();
    let v = clamp((e.clientX - r.left) / r.width);
    if (look === 'a') v = SNAPS.find((s) => Math.abs(s - v) < 0.03) ?? v;
    setSize(v);
  };
  const keys = (e: KeyboardEvent) => {
    const step = e.key === 'ArrowLeft' ? -0.05 : e.key === 'ArrowRight' ? 0.05 : 0;
    if (step) { e.preventDefault(); setSize((s) => clamp(s + step)); }
    if (e.key === 'Home') { e.preventDefault(); setSize(MIN); }
    if (e.key === 'End') { e.preventDefault(); setSize(1 - MIN); }
    if (e.key === 'Enter' && look === 'c') setFolded((f) => (f ? null : 'end'));
  };
  const pct = Math.round(size * 100);
  const separator = (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${startName} and ${endName}`}
      aria-valuemin={MIN * 100}
      aria-valuemax={(1 - MIN) * 100}
      aria-valuenow={pct}
      tabIndex={0}
      className="fps-split-line augur-focus-ring"
      onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
      onPointerMove={drag}
      onDoubleClick={() => setSize(0.5)}
      onKeyDown={keys}
    />
  );
  const cols = folded === 'start' ? 'var(--target-md) 0 minmax(0, 1fr)' : folded === 'end' ? 'minmax(0, 1fr) 0 var(--target-md)' : `minmax(0, ${size}fr) auto minmax(0, ${1 - size}fr)`;

  const head = (name: string, side: 'start' | 'end', share: number) => (
    <div className="fps-pane-head">
      <span className="fps-pane-name">{name}</span>
      {look === 'c' ? (
        <>
          <span className="fps-pane-share">{share}%</span>
          <button type="button" className="fps-pane-fold augur-focus-ring" onClick={() => setFolded(side)} aria-label={`Fold ${name}`}>
            <Icon name={side === 'start' ? 'rail-close' : 'drawer-close'} size={16} aria-hidden="true" />
          </button>
        </>
      ) : null}
    </div>
  );
  const strip = (name: string, side: 'start' | 'end') => (
    <button type="button" className="fps-pane-strip augur-focus-ring" onClick={() => setFolded(null)} aria-label={`Open ${name}`}>
      <Icon name={side === 'start' ? 'rail-open' : 'drawer-open'} size={16} aria-hidden="true" />
      <span className="fps-pane-strip-name">{name}</span>
    </button>
  );

  return (
    <div className="fps-split-wrap" data-look={look}>
      {look === 'b' ? (
        <div className="fps-split-keys" role="group" aria-label="How to split">
          {[
            { v: 1 / 3, w: '⅓' },
            { v: 1 / 2, w: '½' },
            { v: 2 / 3, w: '⅔' },
          ].map((s) => (
            <button key={s.w} type="button" className="fps-split-key augur-focus-ring" aria-pressed={!folded && Math.abs(size - s.v) < 0.01} onClick={() => { setFolded(null); setSize(s.v); }} aria-label={`${startName} takes ${s.w}`}>
              {s.w}
            </button>
          ))}
          <button type="button" className="fps-split-key augur-focus-ring" aria-pressed={folded === 'end'} onClick={() => setFolded('end')} aria-label={`Only ${startName}`}>
            <Icon name="drawer-close" size={16} aria-hidden="true" />
          </button>
        </div>
      ) : null}
      <div ref={box} className="fps-split" style={{ gridTemplateColumns: cols, height }}>
        <div className="fps-pane">{folded === 'start' ? strip(startName, 'start') : <>{head(startName, 'start', pct)}{start}</>}</div>
        {folded ? <span /> : look === 'b' ? <span className="fps-split-line" aria-hidden="true" /> : separator}
        <div className="fps-pane">{folded === 'end' ? strip(endName, 'end') : <>{head(endName, 'end', 100 - pct)}{end}</>}</div>
      </div>
    </div>
  );
}

/* ---------- Skip link ---------- */

function SkipLink({ look, targets, shown }: { look: Look; targets: { href: string; label: string }[]; shown?: boolean }) {
  const first = targets[0];
  if (look === 'c') {
    return (
      <nav className="fps-skip" data-look="c" data-shown={shown || undefined} aria-label="Jump to">
        <span className="fps-skip-caption" aria-hidden="true">Jump to</span>
        {targets.map((t) => (
          <a key={t.href} href={t.href} className="fps-skip-link augur-focus-ring">{t.label}</a>
        ))}
      </nav>
    );
  }
  return (
    <div className="fps-skip" data-look={look} data-shown={shown || undefined}>
      <a href={first.href} className="fps-skip-link augur-focus-ring">
        {look === 'a' ? <Icon name="chevron-down" size={16} aria-hidden="true" /> : null}
        <span>Skip to {first.label.toLowerCase()}</span>
        {look === 'b' ? <kbd className="fps-skip-cap">Enter</kbd> : null}
      </a>
    </div>
  );
}

/* ---------- The parts on their own ---------- */

export const Fieldsets: Story = {
  name: 'Fieldset',
  render: () => (
    <Columns>
      {(look) => (
        <>
          <Fieldset look={look} n={1} legend="Contact" hint="Who the harbour office writes to.">
            <TextField label="Name" defaultValue="Ana Ribeiro" />
            <TextField label="Email" type="email" defaultValue="ana@harbour.example" />
          </Fieldset>
          <Fieldset look={look} n={2} legend="Alerts">
            <Toggle label="Tide warnings" defaultChecked />
            <Toggle label="Berth changes" />
          </Fieldset>
          <Note>
            {look === 'a'
              ? 'A mono word on a groove that runs to the edge, then the fields. The same as a page section (PDR-014), one size down. No box.'
              : look === 'b'
                ? 'The group’s name and hint sit in a margin to the left, the fields to the right; a groove between groups. Long forms read down the margin like a contents list.'
                : 'Each group is numbered, with a thin line down its left side holding the fields together. People can say “group 2” when they ask for help.'}
          </Note>
        </>
      )}
    </Columns>
  ),
};

const SAMPLE: Problem[] = [
  { id: 'p-name', field: 'Vessel name', kind: 'missing', say: 'Needs a name.' },
  { id: 'p-mail', field: 'Email', kind: 'wrong', say: 'Needs an @ and a domain, like ana@harbour.example.' },
];

export const ErrorSummaries: Story = {
  name: 'Error summary',
  render: () => (
    <Columns>
      {(look) => (
        <>
          {look === 'b' ? null : <ErrorSummary look={look} problems={SAMPLE} focusOnShow={false} />}
          <Slot look={look} id={`${look}-p-name`} no={1}>
            <TextField label="Vessel name" required state="attention" message="Needs a name." />
          </Slot>
          <Slot look={look} id={`${look}-p-mail`} no={2}>
            <TextField label="Email" type="email" defaultValue="ana@harbour" state="error" message="Needs an @ and a domain, like ana@harbour.example." />
          </Slot>
          {look === 'b' ? <ErrorSummary look={look} problems={SAMPLE} focusOnShow={false} /> : null}
          <div className="fps-actions"><Button kind="primary">Save</Button></div>
          <Note>
            {look === 'a'
              ? 'At the top of the form, where the page moves you on Save. Each problem is a ruled line: what kind (green for missing, red for wrong), the field, what to do. Pressing a line takes you to the field.'
              : look === 'b'
                ? 'Beside Save, where you already are: one sentence, then a key per field. Shorter than A: the field says what to do, the key only takes you there. Nothing moves the page.'
                : 'Stamped at the top with the count, numbered to match a number printed beside each field, so a long form can be fixed in order.'}
          </Note>
        </>
      )}
    </Columns>
  ),
};

export const Toolbars: Story = {
  name: 'Toolbar',
  render: () => (
    <Columns>
      {(look) => (
        <>
          <Toolbar look={look} />
          <div className="fps-narrow"><Toolbar look={look} label="Run tools, narrow" /></div>
          <Note>
            {look === 'a'
              ? 'Quiet tools with words, standing on one groove; short grooves part the groups. A tool that stays on (Filter) draws a thick ink line under itself.'
              : look === 'b'
                ? 'Small keys in a sunken tray. A tool that stays on is held down in the tray. Groups are parted by space only.'
                : 'Each group carries its name in mono above its tools. A tool that stays on is printed inverted, like a stamp.'}{' '}
            One tab stop; arrows move inside; what doesn’t fit goes into More (the second bar is narrower: watch tools move into More).
          </Note>
        </>
      )}
    </Columns>
  ),
};

const Lines = ({ n, word }: { n: number; word: string }) => (
  <ul className="fps-lines">
    {Array.from({ length: n }, (_, i) => (
      <li key={i}>{word} {String(i + 1).padStart(2, '0')}</li>
    ))}
  </ul>
);

export const Splits: Story = {
  name: 'Split panes',
  render: () => (
    <Columns>
      {(look) => (
        <>
          <SplitPanes look={look} startName="Runs" endName="Output" initial={look === 'b' ? 1 / 3 : 0.4} height="220px" start={<Lines n={5} word="Run" />} end={<Lines n={5} word="Line" />} />
          <Note>
            {look === 'a'
              ? 'Drag the line anywhere; it settles on a third, a half or two thirds when you pass near. Double-click puts it back to half. Arrow keys move it.'
              : look === 'b'
                ? 'Not dragged: you choose a split with keys (a third, half, two thirds, or only the first pane). Splits stay tidy and the same across apps.'
                : 'Drag it, and each pane says its share. Either pane folds to a strip with its name, like the drawer; press the strip to open it again.'}
          </Note>
        </>
      )}
    </Columns>
  ),
};

const TARGETS = [
  { href: '#fps-main', label: 'Main' },
  { href: '#fps-tools', label: 'Tools' },
  { href: '#fps-form', label: 'Form' },
];

export const SkipLinks: Story = {
  name: 'Skip link',
  render: () => (
    <Columns>
      {(look) => (
        <>
          <div className="fps-frame">
            <SkipLink look={look} targets={TARGETS} shown />
            <div className="fps-frame-bar" aria-hidden="true" />
          </div>
          <Note>
            {look === 'a'
              ? 'On the first Tab, a line drops from the top edge carrying “Skip to main”. One target only.'
              : look === 'b'
                ? 'On the first Tab, a key comes up at the top left, with the key that takes it.'
                : 'On the first Tab, a mono strip lists every place worth jumping to: main, tools, the form. Tab moves along it.'}{' '}
            Drawn here as it shows on Tab.
          </Note>
        </>
      )}
    </Columns>
  ),
};

/* ---------- In use ---------- */

function useForm(initial: Record<string, string>, check: (v: Record<string, string>) => Problem[], tried0: boolean) {
  const [values, setValues] = useState(initial);
  const [tried, setTried] = useState(tried0);
  const problems = tried ? check(values) : [];
  const set = (k: string) => (v: string) => setValues((s) => ({ ...s, [k]: v }));
  const stateOf = (id: string) => {
    const p = problems.find((x) => x.id === id);
    return p ? { state: p.kind === 'missing' ? ('attention' as const) : ('error' as const), message: p.say } : {};
  };
  return { values, set, problems, stateOf, submit: () => setTried(true), noOf: (id: string) => problems.findIndex((p) => p.id === id) + 1 || undefined };
}

const isMail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

function SettingsForm({ look, tried }: { look: Look; tried: boolean }) {
  const f = useForm(
    { name: '', mail: 'ops@harbour', about: 'Survey and berth work for the north harbour.' },
    (v) => [
      ...(v.name.trim() ? [] : [{ id: `${look}-s-name`, field: 'Workspace name', kind: 'missing' as const, say: 'Needs a name.' }]),
      ...(isMail(v.mail) ? [] : [{ id: `${look}-s-mail`, field: 'Reply address', kind: 'wrong' as const, say: 'Needs an @ and a domain.' }]),
    ],
    tried,
  );
  return (
    <div className="fps-demo">
      <SkipLink look={look} targets={[{ href: `#${look}-settings`, label: 'Main' }, { href: `#${look}-s-save`, label: 'Save' }]} />
      <form id={`${look}-settings`} className="fps-form" onSubmit={(e) => { e.preventDefault(); f.submit(); }} noValidate>
        <h3 className="fps-demo-title">Workspace settings</h3>
        {look !== 'b' ? <ErrorSummary look={look} problems={f.problems} focusOnShow={!tried} /> : null}
        <Fieldset look={look} n={1} legend="General" hint="What people see when they join.">
          <Slot look={look} id={`${look}-s-name`} no={f.noOf(`${look}-s-name`)}>
            <TextField label="Workspace name" required value={f.values.name} onChange={f.set('name')} {...f.stateOf(`${look}-s-name`)} />
          </Slot>
          <TextField label="About" multiline rows={2} value={f.values.about} onChange={f.set('about')} />
        </Fieldset>
        <Fieldset look={look} n={2} legend="Mail" hint="Where replies go.">
          <Slot look={look} id={`${look}-s-mail`} no={f.noOf(`${look}-s-mail`)}>
            <TextField label="Reply address" type="email" value={f.values.mail} onChange={f.set('mail')} {...f.stateOf(`${look}-s-mail`)} />
          </Slot>
          <Toggle label="Daily summary" defaultChecked />
        </Fieldset>
        <Fieldset look={look} n={3} legend="Access">
          <Select label="New people join as" defaultValue="reader" options={[{ value: 'reader', label: 'Reader' }, { value: 'writer', label: 'Writer' }]} />
          <Checkbox>Ask before anyone outside the harbour joins</Checkbox>
        </Fieldset>
        {look === 'b' ? <ErrorSummary look={look} problems={f.problems} focusOnShow={!tried} /> : null}
        <div className="fps-actions" id={`${look}-s-save`}>
          <Button kind="primary" type="submit">Save settings</Button>
        </div>
      </form>
    </div>
  );
}

export const SettingsInUse: Story = {
  name: 'In use: long settings form',
  args: { tried: true },
  argTypes: { tried: { control: 'boolean', description: 'Save has been pressed once, so the problems show.' } },
  render: (args) => {
    const { tried } = args as { tried: boolean };
    return <Columns>{(look) => <SettingsForm key={String(tried)} look={look} tried={tried} />}</Columns>;
  },
};

function ConfirmForm({ look, tried }: { look: Look; tried: boolean }) {
  const f = useForm(
    { note: '' },
    (v) => (v.note.trim() ? [] : [{ id: `${look}-c-note`, field: 'What changed', kind: 'missing' as const, say: 'Say in a line what changed, for the people you tell.' }]),
    tried,
  );
  return (
    <div className="fps-demo fps-demo-sheet">
      <form className="fps-form" onSubmit={(e) => { e.preventDefault(); f.submit(); }} noValidate>
        <h3 className="fps-demo-title">Publish the tide tables?</h3>
        <p className="fps-demo-lead">Twelve people who follow Harbour tide tables are told.</p>
        {look === 'c' ? <ErrorSummary look={look} problems={f.problems} focusOnShow={!tried} /> : null}
        <Slot look={look} id={`${look}-c-note`} no={f.noOf(`${look}-c-note`)}>
          <TextField label="What changed" required value={f.values.note} onChange={f.set('note')} {...f.stateOf(`${look}-c-note`)} />
        </Slot>
        <Checkbox defaultChecked>Tell the twelve followers</Checkbox>
        {look !== 'c' ? <ErrorSummary look={look} problems={look === 'a' ? [] : f.problems} focusOnShow={!tried} /> : null}
        <div className="fps-actions">
          <Button kind="primary" type="submit">Publish</Button>
          <Button kind="ghost">Not now</Button>
        </div>
      </form>
      <Note>
        {look === 'a'
          ? 'One problem in a short form: A shows no summary, the field speaks for itself. A summary starts at two.'
          : look === 'b'
            ? 'B keeps its key beside Publish even for one, so the way to fix it is always in the same place.'
            : 'C stamps even one, at the top, so every form fails the same way.'}
      </Note>
    </div>
  );
}

export const ConfirmInUse: Story = {
  name: 'In use: short confirm form',
  args: { tried: true },
  argTypes: { tried: { control: 'boolean', description: 'Publish has been pressed once, so the problem shows.' } },
  render: (args) => {
    const { tried } = args as { tried: boolean };
    return <Columns>{(look) => <ConfirmForm key={String(tried)} look={look} tried={tried} />}</Columns>;
  },
};

function ToolScreen({ look }: { look: Look }) {
  return (
    <div className="fps-demo fps-tool-screen">
      <SkipLink look={look} targets={[{ href: `#${look}-t-main`, label: 'Output' }, { href: `#${look}-t-tools`, label: 'Tools' }, { href: `#${look}-t-runs`, label: 'Runs' }]} />
      <div id={`${look}-t-tools`}>
        <Toolbar look={look} label="Survey run tools" />
      </div>
      <SplitPanes
        look={look}
        startName="Runs"
        endName="Output"
        initial={look === 'b' ? 1 / 3 : 0.32}
        height="200px"
        start={<div id={`${look}-t-runs`}><Lines n={4} word="Survey run" /></div>}
        end={<div id={`${look}-t-main`}><Lines n={4} word="Depth reading" /></div>}
      />
    </div>
  );
}

export const ToolInUse: Story = {
  name: 'In use: tool screen',
  render: () => <Stacked>{(look) => <ToolScreen look={look} />}</Stacked>,
};
