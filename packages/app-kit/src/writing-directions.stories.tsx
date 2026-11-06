import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { Icon, Segmented, type IconName } from '@augur/kit-common';
import './writing-directions.stories.css';

/**
 * Directions for the writing and reading round (6 Nov 2026, round O): Editor, Prose, mentions, Reader
 * and Contents. Harry's answers shape them: people write both short notes and long documents, and
 * reading is both a printed page and a working tool, switched by the reader (Page or Desk).
 *
 * Two choices were left as options rather than asked: where formatting lives (a Sheet on selection, a
 * fixed Key tray, or keys only with `/`) and how a mention reads in the text (a chip, a marked word, or
 * mono). Each writing direction takes one of each. Each reading direction is a different answer to a
 * long document that shouldn't make you scroll: A scrolls with the kit's bar and keeps its place in the
 * margin, B turns pages and never scrolls, C dims what you're not reading.
 *
 * Everything builds on what Harry has picked: Keycap buttons, Well fields, Sheet for anything that pops
 * up, Key for a tray and its rest, Horizon for states, square corners. Depth is dimming only, never a
 * blur; green means only "needs you". Each direction names its nearest prior art; none is drawn from
 * Carbon or any other design system. Once one is picked for writing and one for reading, they're built
 * into the real parts with their own Carbon-style stories, and this page goes.
 */
const meta = {
  title: 'Quill/Writing and reading directions',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

type Look = 'a' | 'b' | 'c';
interface Direction {
  id: Look;
  name: string;
  summary: string;
  prior: string;
}

function Head({ part, summary }: { part: string; summary: string }) {
  return (
    <header className="wd-head">
      <h2 className="wd-part">{part}</h2>
      <p className="wd-summary">{summary}</p>
    </header>
  );
}

function Named({ d }: { d: Direction }) {
  return (
    <>
      <h3 className="wd-name">{d.name}</h3>
      <p className="wd-note">{d.summary}</p>
      <p className="wd-prior">
        <span className="wd-prior-label">Nearest prior art</span> {d.prior}
      </p>
    </>
  );
}

const Caption = ({ children }: { children: ReactNode }) => <p className="wd-caption">{children}</p>;

/* ================================================================ Writing */

const WRITING: Direction[] = [
  {
    id: 'a',
    name: 'A · Sheet on select, chip mentions',
    summary:
      'The well stays bare while you write. Select text and a small Sheet of keys rises above it. A mention sits in the text as a square chip with its kind’s icon, and Prose shows it the same way.',
    prior: 'A selection bubble, as in many web editors; the chip is the kit’s own Key.',
  },
  {
    id: 'b',
    name: 'B · Key tray, marked mentions',
    summary:
      'A tray of keys is always along the well’s top edge, so what you can do is never hidden; the one in force rests down. The guide counts at the tray’s end. A mention reads as a plain word with a hairline under it and a mono @ or #; it only becomes a chip when focused.',
    prior: 'A typewriter’s key row; the marked word is how a printed text marks a cross-reference.',
  },
  {
    id: 'c',
    name: 'C · Keys only, mono mentions',
    summary:
      'No bar at all. Markdown and Ctrl keys format, and / at the start of a line opens a Sheet of blocks with their keys beside them. One mono line under the well says so. A mention is set in the mono face, so a reference always reads as one.',
    prior: 'Slash menus in block editors, and plain-text Markdown writing.',
  },
];

type Kind = 'person' | 'thing';
function Mention({ look, kind, name, focused }: { look: Look; kind: Kind; name: string; focused?: boolean }) {
  const icon: IconName = kind === 'person' ? 'person' : 'tag';
  const mark = kind === 'person' ? '@' : '#';
  if (look === 'a' || focused)
    return (
      <span className="wd-mention" data-look="a" data-focused={focused || undefined}>
        <Icon name={icon} size={12} />
        {name}
      </span>
    );
  if (look === 'b')
    return (
      <span className="wd-mention" data-look="b">
        <span className="wd-mention-mark" aria-hidden="true">{mark}</span>
        {name}
      </span>
    );
  return (
    <span className="wd-mention" data-look="c">
      {mark}
      {name}
    </span>
  );
}

const keys = [
  { key: 'b', label: <b>B</b>, name: 'Bold' },
  { key: 'i', label: <i>I</i>, name: 'Italic' },
  { key: 'list', label: <Icon name="list" size={14} />, name: 'List' },
  { key: 'num', label: <span className="wd-mono">1.</span>, name: 'Numbered' },
  { key: 'quote', label: <span className="wd-mono">“</span>, name: 'Quote' },
];

function Keys({ on = [] as string[], tray }: { on?: string[]; tray?: boolean }) {
  return (
    <span className={tray ? 'wd-tray-keys' : 'wd-sheet-keys'} role="toolbar" aria-label="Format">
      {keys.map((k) => (
        <button key={k.key} type="button" className="wd-key" aria-label={k.name} aria-pressed={on.includes(k.key)}>
          {k.label}
        </button>
      ))}
    </span>
  );
}

type WriteState = 'rest' | 'selecting' | 'mentioning' | 'over' | 'slash' | 'empty' | 'unavailable';

function Field({ look, state, label = 'Notes', guide }: { look: Look; state: WriteState; label?: string; guide?: string }) {
  const count = state === 'over' ? '134 of 120 words' : guide ? '42 of 120 words' : '';
  const body =
    state === 'empty' ? (
      <p className="wd-placeholder">What should the team know?</p>
    ) : state === 'slash' ? (
      <>
        <p>
          Deliveries move to the east gate from 1 December. <Mention look={look} kind="person" name="Nora Briggs" /> has the new times.
        </p>
        <p>
          /<span className="wd-caret" />
        </p>
      </>
    ) : state === 'mentioning' ? (
      <p>
        Deliveries move to the east gate. Ask @no<span className="wd-caret" />
      </p>
    ) : (
      <>
        <p>
          Deliveries move to the{' '}
          <span className={state === 'selecting' ? 'wd-selected' : undefined}>
            {state === 'selecting' ? <b>east gate</b> : 'east gate'}
          </span>{' '}
          from 1 December. <Mention look={look} kind="person" name="Nora Briggs" /> has the new times, and they’re in{' '}
          <Mention look={look} kind="thing" name="Winter works" focused={look === 'b' && state === 'rest'} />.
        </p>
        {state === 'over' ? (
          <p>
            The crane keeps its slot on Mondays, but anything heavy that comes in on a Friday waits in the yard over the weekend, which the site lead
            would rather we avoided where we can, so plan for Thursday.
          </p>
        ) : null}
      </>
    );

  return (
    <div className="wd-field" data-look={look} data-state={state}>
      <div className="wd-field-head">
        <span className="wd-label">{label}</span>
        {state === 'unavailable' ? <span className="wd-optional">Read only</span> : null}
      </div>
      <div className="wd-box">
        {look === 'b' ? (
          <div className="wd-tray">
            <Keys tray on={state === 'selecting' ? ['b'] : []} />
            {count ? (
              <span className="wd-count" data-over={state === 'over' || undefined}>
                {count}
              </span>
            ) : null}
          </div>
        ) : null}
        {look === 'a' && state === 'selecting' ? (
          <span className="wd-sheet wd-format-sheet">
            <Keys on={['b']} />
          </span>
        ) : null}
        <div className="wd-input">{body}</div>
        {state === 'mentioning' ? (
          <ul className="wd-sheet wd-found" role="listbox" aria-label="People and teams">
            <li className="wd-group">People</li>
            <li className="wd-option" aria-selected="true">
              <Icon name="person" size={14} /> Nora Briggs <small>nora@example.org</small>
            </li>
            <li className="wd-option">
              <Icon name="person" size={14} /> Ben Norris <small>ben@example.org</small>
            </li>
            <li className="wd-group">Teams</li>
            <li className="wd-option">
              <Icon name="people" size={14} /> Ops
            </li>
          </ul>
        ) : null}
        {state === 'slash' ? (
          <ul className="wd-sheet wd-found" role="listbox" aria-label="Blocks">
            {[
              ['list', 'List', '- '],
              ['structure', 'Numbered', '1. '],
              ['document', 'Quote', '> '],
              ['person', 'Mention someone', '@'],
              ['tag', 'Refer to a thing', '#'],
            ].map(([icon, name, key], i) => (
              <li key={name} className="wd-option" aria-selected={i === 0}>
                <Icon name={icon as IconName} size={14} /> {name}
                <kbd className="wd-kbd">{key}</kbd>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {look === 'c' && state !== 'unavailable' ? <p className="wd-hint-line">/ for blocks · @ people · # things · Ctrl B bold · Ctrl I italic</p> : null}
      {look !== 'b' && count ? (
        <p className="wd-count wd-count-under" data-over={state === 'over' || undefined}>
          {count}
          {state === 'over' ? ' · past the guide, which is fine' : ''}
        </p>
      ) : null}
      {look === 'b' && state === 'over' ? <p className="wd-count wd-count-under" data-over>Past the guide, which is fine</p> : null}
      {state === 'unavailable' ? <p className="wd-reason">You can read these notes but not change them: Planning owns them.</p> : null}
    </div>
  );
}

function ProseShown({ look }: { look: Look }) {
  return (
    <div className="wd-prose" data-look={look}>
      <p>
        Deliveries move to the <b>east gate</b> from 1 December. <Mention look={look} kind="person" name="Nora Briggs" /> has the new times, and they’re in{' '}
        <Mention look={look} kind="thing" name="Winter works" />.
      </p>
      <ul>
        <li>The crane keeps its Monday slot.</li>
        <li>Heavy loads come in by Thursday.</li>
      </ul>
    </div>
  );
}

/** Three ways to write: where formatting lives, and how a mention reads. Each column shows the field in its states, then Prose. */
export const Writing: Story = {
  render: () => (
    <div className="wd-stage">
      <Head
        part="Editor, Prose and mentions"
        summary="Each column is one direction: the field at rest, while formatting, while mentioning, past its guide, empty, and read only, then the same text as Prose."
      />
      <div className="wd-grid">
        {WRITING.map((d) => (
          <section key={d.id} className="wd-column" aria-label={d.name}>
            <Named d={d} />
            <div className="wd-specimens">
              <Caption>At rest</Caption>
              <Field look={d.id} state="rest" guide="120 words" />
              <Caption>{d.id === 'c' ? 'Typing / for a block' : 'Text selected'}</Caption>
              <Field look={d.id} state={d.id === 'c' ? 'slash' : 'selecting'} guide="120 words" />
              <Caption>Typing @ for someone</Caption>
              <Field look={d.id} state="mentioning" />
              <Caption>Past its guide</Caption>
              <Field look={d.id} state="over" guide="120 words" />
              <Caption>Empty, and read only</Caption>
              <Field look={d.id} state="empty" label="Comment" />
              <Field look={d.id} state="unavailable" />
              <Caption>As Prose</Caption>
              <ProseShown look={d.id} />
            </div>
          </section>
        ))}
      </div>
    </div>
  ),
};

/* ================================================================ Reading */

const READING: Direction[] = [
  {
    id: 'a',
    name: 'A · Margin',
    summary:
      'One column that scrolls, with the kit’s thin bar. On Page the contents fold to a line of ticks down the left margin, one per heading, the one you’re in drawn longest; point at it to read their names. On Desk the contents open into the margin with the line beside where you are, and notes sit in the right margin level with their passage.',
    prior: 'A book’s margin and its side notes.',
  },
  {
    id: 'b',
    name: 'B · Leaves',
    summary:
      'Never scrolls. The document is set in leaves that fit the screen and turn with the arrow keys or the keys at the foot, which say which leaf of how many. Page shows one leaf; Desk shows two side by side and the contents as a ledger with each section’s leaf number, the one open resting down.',
    prior: 'An e-reader’s page turns, and a printed contents page with page numbers.',
  },
  {
    id: 'c',
    name: 'C · Horizon',
    summary:
      'The passage you’re reading is in full ink and the rest is dimmed back, so your place is always plain. A horizon line across the top shows the sections as lengths, with your place on it. Page keeps the contents in a closed drawer; Desk docks the drawer open.',
    prior: 'Focus modes in writing apps, and a progress rule.',
  },
];

interface Section {
  id: string;
  title: string;
  blocks: ReactNode[];
  note?: string;
}

const DOC: Section[] = [
  {
    id: 'why',
    title: 'Why the quay closes',
    blocks: [
      <p key="1">
        The quay wall closes to traffic from <b>1 December</b> while the berths are dredged. The work runs for six weeks, and the wall reopens in the
        second week of January if the weather holds.
      </p>
      ,
      <p key="2">Dredging can’t share the quay with lorries: the barges need the whole length, and the crane sits over the water for most of each day.</p>,
    ],
  },
  {
    id: 'what',
    title: 'What changes',
    note: 'Nora Briggs: the east gate opens at six, not seven, from the first.',
    blocks: [
      <ul key="1">
        <li>Deliveries move to the east gate.</li>
        <li>The crane keeps its Monday slot; anything heavy comes in by Thursday.</li>
        <li>Parking by the wall goes for the six weeks.</li>
      </ul>,
      <p key="2">The new times are in the crane plan. The site office keeps a printed copy by the gate.</p>,
    ],
  },
  {
    id: 'who',
    title: 'Who to ask',
    blocks: [
      <p key="1">The site lead answers questions about access. Anything about pay or hours goes to People, and anything about the berths to Planning.</p>,
    ],
  },
  {
    id: 'after',
    title: 'After the works',
    blocks: [<p key="1">Once the wall reopens, deliveries go back to the north gate and the parking returns. The east gate stays open for the crane.</p>],
  },
];

type Mode = 'page' | 'desk';

function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <Segmented
      label="Read as"
      value={mode}
      onChange={(v) => onChange(v as Mode)}
      options={[
        { value: 'page', label: 'Page' },
        { value: 'desk', label: 'Desk' },
      ]}
    />
  );
}

function SectionBody({ s, dim }: { s: Section; dim?: boolean }) {
  return (
    <section className="wd-section" data-dim={dim || undefined} aria-labelledby={`wd-${s.id}`}>
      <h2 id={`wd-${s.id}`}>{s.title}</h2>
      {s.blocks}
    </section>
  );
}

const CURRENT = 'what';

/* A · Margin */
function MarginReader({ mode }: { mode: Mode }) {
  const [current, setCurrent] = useState(CURRENT);
  return (
    <div className="wd-reader" data-look="a" data-mode={mode}>
      {mode === 'page' ? (
        <nav className="wd-ticks" aria-label="Contents">
          {DOC.map((s) => (
            <button key={s.id} type="button" className="wd-tick" aria-current={s.id === current ? 'true' : undefined} aria-label={s.title} onClick={() => setCurrent(s.id)} />
          ))}
        </nav>
      ) : (
        <nav className="wd-margin-contents" aria-label="Contents">
          <p className="wd-contents-head">Contents</p>
          {DOC.map((s) => (
            <button key={s.id} type="button" className="wd-contents-item" aria-current={s.id === current ? 'true' : undefined} onClick={() => setCurrent(s.id)}>
              {s.title}
            </button>
          ))}
        </nav>
      )}
      <div className="wd-scroll">
        <article className="wd-text">
          <h1>Winter works</h1>
          {DOC.map((s) => (
            <div key={s.id} className="wd-with-note">
              <SectionBody s={s} />
              {mode === 'desk' && s.note ? (
                <aside className="wd-side-note">
                  <span className="wd-note-mark">Note</span>
                  {s.note}
                </aside>
              ) : null}
            </div>
          ))}
        </article>
      </div>
    </div>
  );
}

/* B · Leaves: the sections set out as leaves of a fixed height. */
const LEAVES: Section[][] = [[DOC[0]!], [DOC[1]!], [DOC[2]!, DOC[3]!]];
const leafOf = (id: string) => LEAVES.findIndex((l) => l.some((s) => s.id === id));

function LeavesReader({ mode }: { mode: Mode }) {
  const [leaf, setLeaf] = useState(1);
  const shown = mode === 'desk' ? [leaf, leaf + 1].filter((n) => n < LEAVES.length) : [leaf];
  const step = mode === 'desk' ? 2 : 1;
  const last = LEAVES.length - 1;
  const turn = (to: number) => setLeaf(Math.max(0, Math.min(last, to)));
  return (
    <div
      className="wd-reader"
      data-look="b"
      data-mode={mode}
      tabIndex={0}
      aria-label="Winter works"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'PageDown') turn(leaf + step);
        if (e.key === 'ArrowLeft' || e.key === 'PageUp') turn(leaf - step);
      }}
    >
      {mode === 'desk' ? (
        <nav className="wd-ledger" aria-label="Contents">
          <p className="wd-contents-head">Contents</p>
          {DOC.map((s) => {
            const n = leafOf(s.id);
            return (
              <button key={s.id} type="button" className="wd-ledger-row" aria-current={shown.includes(n) ? 'true' : undefined} onClick={() => turn(n)}>
                <span>{s.title}</span>
                <span className="wd-ledger-rule" aria-hidden="true" />
                <span className="wd-mono">{n + 1}</span>
              </button>
            );
          })}
        </nav>
      ) : null}
      <div className="wd-leaves-wrap">
        <div className="wd-leaves">
          {shown.map((n) => (
            <article key={n} className="wd-leaf wd-text">
              {n === 0 ? <h1>Winter works</h1> : null}
              {LEAVES[n]!.map((s) => (
                <SectionBody key={s.id} s={s} />
              ))}
              <span className="wd-folio">{n + 1}</span>
            </article>
          ))}
        </div>
        <div className="wd-turn">
          <button type="button" className="wd-key" aria-label="Previous leaf" disabled={leaf === 0} onClick={() => turn(leaf - step)}>
            <Icon name="back" size={14} />
          </button>
          <span className="wd-mono wd-turn-count">
            {shown.map((n) => n + 1).join('–')} of {LEAVES.length}
          </span>
          <button type="button" className="wd-key" aria-label="Next leaf" disabled={shown.includes(last)} onClick={() => turn(leaf + step)}>
            <Icon name="arrow" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* C · Horizon */
function HorizonReader({ mode }: { mode: Mode }) {
  const [current, setCurrent] = useState(CURRENT);
  const [open, setOpen] = useState(false);
  const drawer = mode === 'desk' || open;
  const lengths = [3, 4, 2, 2];
  return (
    <div className="wd-reader" data-look="c" data-mode={mode} data-drawer={drawer || undefined}>
      <div className="wd-horizon" aria-hidden="true">
        {DOC.map((s, i) => (
          <span key={s.id} className="wd-horizon-part" style={{ flexGrow: lengths[i] }} data-at={s.id === current || undefined} data-done={DOC.findIndex((d) => d.id === current) > i || undefined} />
        ))}
      </div>
      {drawer ? (
        <nav className="wd-drawer" aria-label="Contents">
          <p className="wd-contents-head">
            Contents
            {mode === 'page' ? (
              <button type="button" className="wd-drawer-key" aria-label="Close contents" onClick={() => setOpen(false)}>
                <Icon name="drawer-close" size={14} />
              </button>
            ) : null}
          </p>
          {DOC.map((s) => (
            <button key={s.id} type="button" className="wd-contents-item" aria-current={s.id === current ? 'true' : undefined} onClick={() => setCurrent(s.id)}>
              {s.title}
            </button>
          ))}
        </nav>
      ) : (
        <button type="button" className="wd-drawer-key wd-drawer-closed" aria-label="Open contents" onClick={() => setOpen(true)}>
          <Icon name="drawer-open" size={14} />
        </button>
      )}
      <div className="wd-scroll">
        <article className="wd-text">
          <h1 data-dim={current !== DOC[0]!.id || undefined}>Winter works</h1>
          {DOC.map((s) => (
            <SectionBody key={s.id} s={s} dim={s.id !== current} />
          ))}
        </article>
      </div>
    </div>
  );
}

function ReaderFor({ look, mode }: { look: Look; mode: Mode }) {
  if (look === 'a') return <MarginReader mode={mode} />;
  if (look === 'b') return <LeavesReader mode={mode} />;
  return <HorizonReader mode={mode} />;
}

/** One reading direction, with Page then Desk, and a live one to switch. */
function ReadingBoard({ d }: { d: Direction }) {
  const [mode, setMode] = useState<Mode>('page');
  return (
    <div className="wd-stage">
      <Head part="Reader and Contents" summary="Page, then Desk, then a live reader that switches between them. Point, click and use the arrow keys." />
      <div className="wd-reading">
        <div className="wd-reading-intro">
          <Named d={d} />
        </div>
        <div className="wd-pair">
          <div>
            <Caption>Page</Caption>
            <ReaderFor look={d.id} mode="page" />
          </div>
          <div>
            <Caption>Desk</Caption>
            <ReaderFor look={d.id} mode="desk" />
          </div>
        </div>
        <div className="wd-live">
          <div className="wd-live-head">
            <Caption>Live</Caption>
            <ModeSwitch mode={mode} onChange={setMode} />
          </div>
          <ReaderFor look={d.id} mode={mode} />
        </div>
      </div>
    </div>
  );
}

/** A · Margin: one scrolling column, its place kept in the margin. */
export const ReadingA: Story = { name: 'Reading A · Margin', render: () => <ReadingBoard d={READING[0]!} /> };
/** B · Leaves: leaves that turn, never a scroll. */
export const ReadingB: Story = { name: 'Reading B · Leaves', render: () => <ReadingBoard d={READING[1]!} /> };
/** C · Horizon: the passage you're on in full ink, the rest dimmed. */
export const ReadingC: Story = { name: 'Reading C · Horizon', render: () => <ReadingBoard d={READING[2]!} /> };
