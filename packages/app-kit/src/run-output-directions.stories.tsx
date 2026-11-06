import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button, Icon, ms } from '@augur/kit-common';
import './run-output-directions.stories.css';

/**
 * Directions for the run output round (6 Nov 2026, round K of the missing-components stock-take): the log
 * stream, the diff and the value inspector. None exists in the kit yet. They sit beside Snippet (Press to
 * take, PR #64): any id, path or value you can take is a key you press.
 *
 * Every direction builds on what Harry has picked: Keycap, Well, Sheet, Stamp, Key and Horizon, square
 * corners from the radius tokens, depth by dimming only and never a blur. Green means only "needs you", so a
 * diff never paints added lines green or removed lines red: it uses signs, weight and depth instead, and red
 * stays for a failure. Each direction says how it keeps off scrolling, and where one must scroll, the bar is
 * the kit's.
 *
 * Each part has three directions, A to C, each named with its nearest prior art; none is drawn from Carbon
 * or any other design system. A part can be picked from a different letter to the others. Each column has
 * a live part at the top, then the same part in states, so they show in a snapshot. Once picked, each is
 * built as a real part with its own Carbon-style stories, and this page goes.
 */
const meta = {
  title: 'Common/Run output directions',
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
  scroll: string;
}

function Board({ part, summary, directions, children }: { part: string; summary: string; directions: Direction[]; children: (d: Look) => ReactNode }) {
  return (
    <div className="ro-stage">
      <header className="ro-head">
        <h2 className="ro-part">{part}</h2>
        <p className="ro-summary">{summary}</p>
      </header>
      <div className="ro-grid">
        {directions.map((d) => (
          <section key={d.id} className="ro-column" data-direction={d.id} aria-label={`${part}: ${d.name}`}>
            <h3 className="ro-name">{d.name}</h3>
            <p className="ro-note">{d.summary}</p>
            <p className="ro-prior">
              <span className="ro-label">Nearest prior art</span> {d.prior}
            </p>
            <p className="ro-prior">
              <span className="ro-label">Scrolling</span> {d.scroll}
            </p>
            <div className="ro-specimens">{children(d.id)}</div>
          </section>
        ))}
      </div>
    </div>
  );
}

const Caption = ({ children }: { children: ReactNode }) => <p className="ro-caption">{children}</p>;
const Gone = ({ children }: { children: ReactNode }) => (
  <div className="ro-gone">
    <Icon name="blocked" size={14} />
    <span>{children}</span>
  </div>
);

/* ---------------------------------------------------------------- Log stream */

type Level = 'debug' | 'info' | 'warn' | 'error' | 'needs';
interface Line {
  t: string;
  level: Level;
  step: string;
  text: string;
}

const run: Line[] = [
  { t: '21:04:01', level: 'info', step: 'Fetch', text: 'Reading 3 sources from the vessel register' },
  { t: '21:04:01', level: 'debug', step: 'Fetch', text: 'GET /register/vessels?since=2026-11-05 200 in 140 ms' },
  { t: '21:04:02', level: 'debug', step: 'Fetch', text: 'GET /register/ports 200 in 88 ms' },
  { t: '21:04:02', level: 'info', step: 'Fetch', text: '4,812 records read' },
  { t: '21:04:03', level: 'info', step: 'Match', text: 'Matching records to known vessels' },
  { t: '21:04:03', level: 'warn', step: 'Match', text: 'IMO 9301122 has two names; kept the newer' },
  { t: '21:04:03', level: 'debug', step: 'Match', text: 'Retrying port lookup' },
  { t: '21:04:04', level: 'debug', step: 'Match', text: 'Retrying port lookup' },
  { t: '21:04:04', level: 'debug', step: 'Match', text: 'Retrying port lookup' },
  { t: '21:04:05', level: 'info', step: 'Match', text: '4,790 matched, 22 new' },
  { t: '21:04:05', level: 'needs', step: 'Write', text: '22 new vessels need your OK before they are written' },
  { t: '21:04:31', level: 'info', step: 'Write', text: 'Approved by Harry; writing 22 vessels' },
  { t: '21:04:32', level: 'error', step: 'Write', text: 'Write refused: the register is read-only until 22:00' },
];
const more: Line[] = [
  { t: '21:04:33', level: 'info', step: 'Write', text: 'Waiting to try again at 22:00' },
  { t: '21:04:34', level: 'debug', step: 'Write', text: 'Holding 22 records in the queue' },
  { t: '21:04:35', level: 'info', step: 'Write', text: 'Run paused; nothing lost' },
];

const levelWord: Record<Level, string> = { debug: 'Debug', info: 'Info', warn: 'Warn', error: 'Fail', needs: 'Needs you' };

/** Streams the fixture's extra lines, one at a time, while `live`. Starts only when pressed, so snapshots stay still. */
function useStream(base: Line[]) {
  const [lines, setLines] = useState(base);
  const [live, setLive] = useState(false);
  useEffect(() => {
    if (!live) return;
    let i = 0;
    const timer = setInterval(() => {
      if (i >= more.length) {
        setLive(false);
        return;
      }
      const next = more[i++];
      if (next) setLines((l) => [...l, next]);
    }, ms('motion-hold') / 3);
    return () => clearInterval(timer);
  }, [live]);
  const restart = () => {
    setLines(base);
    setLive(true);
  };
  return { lines, live, restart };
}

function StreamKey({ live, onPress }: { live: boolean; onPress: () => void }) {
  return (
    <Button size="sm" kind="secondary" onPress={onPress} busy={live} busyLabel="Streaming">
      Play the run
    </Button>
  );
}

/** A · Tape: one well, a mono tape that follows the end; scrolled back, a key says how many new lines wait. */
function Tape({ lines, rows = 8, back = false, live = false }: { lines: Line[]; rows?: number; back?: boolean; live?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [away, setAway] = useState(back);
  const [seen, setSeen] = useState(lines.length);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    if (!away) {
      el.scrollTop = el.scrollHeight;
      setSeen(lines.length);
    }
  }, [lines, away]);
  useEffect(() => {
    if (back && box.current) box.current.scrollTop = 0;
  }, [back]);
  const waiting = away ? Math.max(lines.length - seen, back ? 3 : 0) : 0;
  return (
    <div className="ro-tape" data-live={live || undefined}>
      <div
        ref={box}
        className="ro-tape-lines"
        style={{ ['--ro-rows' as string]: rows }}
        tabIndex={0}
        role="log"
        aria-label="Run log"
        onScroll={(e) => {
          const el = e.currentTarget;
          setAway(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
        }}
      >
        {lines.map((l, i) => (
          <div key={i} className="ro-tape-line" data-level={l.level}>
            <span className="ro-time">{l.t}</span>
            <span className="ro-tape-text">{l.text}</span>
          </div>
        ))}
      </div>
      <div className="ro-tape-foot">
        <span className="ro-tape-where">{live ? 'Following the end' : `${lines.length} lines`}</span>
        {away ? (
          <button
            type="button"
            className="ro-keylet"
            onClick={() => {
              setAway(false);
              if (box.current) box.current.scrollTop = box.current.scrollHeight;
            }}
          >
            <Icon name="chevron-down" size={14} /> To the end{waiting ? ` · ${waiting} new` : ''}
          </button>
        ) : null}
      </div>
    </div>
  );
}

const steps = ['Fetch', 'Match', 'Write'] as const;
const stepState = (lines: Line[], step: string) => {
  const own = lines.filter((l) => l.step === step);
  if (own.some((l) => l.level === 'error')) return 'Failed';
  if (own.some((l) => l.level === 'needs') && !own.some((l) => l.text.startsWith('Approved'))) return 'Needs you';
  return own.length ? 'Done' : 'Waiting';
};

/** B · Steps: the run as Drawer folds, one per step. The open step shows its last lines; earlier ones page in. */
function StepLog({ lines, openFirst }: { lines: Line[]; openFirst?: string }) {
  const failed = steps.find((s) => stepState(lines, s) === 'Failed');
  const [open, setOpen] = useState<string | undefined>(openFirst ?? failed ?? steps[steps.length - 1]);
  const [earlier, setEarlier] = useState(false);
  return (
    <div className="ro-steps">
      {steps.map((s) => {
        const own = lines.filter((l) => l.step === s);
        const state = stepState(lines, s);
        const isOpen = open === s;
        const last = earlier ? own : own.slice(-4);
        const hidden = own.length - last.length;
        return (
          <div key={s} className="ro-step" data-open={isOpen || undefined} data-state={state}>
            <button type="button" className="ro-step-head" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? undefined : s)}>
              <Icon name={isOpen ? 'chevron-down' : 'chevron-right'} size={14} />
              <span className="ro-step-name">{s}</span>
              <span className="ro-step-state">
                {state === 'Needs you' ? <span className="ro-needs" aria-hidden="true" /> : null}
                {state}
                <span className="ro-time">{own.length ? own[own.length - 1]?.t : ''}</span>
              </span>
            </button>
            {isOpen ? (
              <div className="ro-step-body">
                {hidden > 0 ? (
                  <button type="button" className="ro-more" onClick={() => setEarlier(true)}>
                    Show {hidden} earlier {hidden === 1 ? 'line' : 'lines'}
                  </button>
                ) : null}
                {last.map((l, i) => (
                  <div key={i} className="ro-step-line" data-level={l.level}>
                    <span className="ro-time">{l.t}</span>
                    <span>{l.text}</span>
                  </div>
                ))}
                {own.length === 0 ? <p className="ro-quiet">Starts after Match.</p> : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/** Folds repeats into one line with a count, and quiet (debug) lines into one "N quiet lines" mark. */
function condense(lines: Line[], quiet: boolean) {
  const out: { line: Line; times: number; quiet?: number }[] = [];
  let hush = 0;
  for (const l of lines) {
    if (!quiet && l.level === 'debug') {
      const prev = out[out.length - 1];
      if (prev && prev.line.text === l.text) {
        prev.times++;
        continue;
      }
      hush++;
      continue;
    }
    if (hush) {
      out.push({ line: { ...l, text: '', level: 'debug' }, times: 1, quiet: hush });
      hush = 0;
    }
    const prev = out[out.length - 1];
    if (prev && prev.line.text === l.text && !prev.quiet) prev.times++;
    else out.push({ line: l, times: 1 });
  }
  if (hush) out.push({ line: { t: '', level: 'debug', step: '', text: '' }, times: 1, quiet: hush });
  return out;
}

/** C · Ledger: only what matters, a level stamp in its own column, repeats counted, quiet lines folded. */
function Ledger({ lines, showQuiet = false }: { lines: Line[]; showQuiet?: boolean }) {
  const [quiet, setQuiet] = useState(showQuiet);
  const rows = condense(lines, quiet);
  return (
    <div className="ro-ledger">
      <div className="ro-ledger-rows" role="log" aria-label="Run log">
        {rows.map((r, i) =>
          r.quiet ? (
            <button key={i} type="button" className="ro-ledger-quiet" onClick={() => setQuiet(true)}>
              {r.quiet} quiet {r.quiet === 1 ? 'line' : 'lines'}
            </button>
          ) : (
            <div key={i} className="ro-ledger-row" data-level={r.line.level}>
              <span className="ro-stamp" data-level={r.line.level}>
                {r.line.level === 'needs' ? <span className="ro-needs" aria-hidden="true" /> : null}
                {levelWord[r.line.level]}
              </span>
              <span className="ro-ledger-text">
                {r.line.text}
                {r.times > 1 ? <span className="ro-times"> ×{r.times}</span> : null}
              </span>
              <span className="ro-time">{r.line.t}</span>
            </div>
          ),
        )}
      </div>
      {quiet ? (
        <button type="button" className="ro-more" onClick={() => setQuiet(false)}>
          Fold the quiet lines
        </button>
      ) : null}
    </div>
  );
}

function LiveLog({ look }: { look: Look }) {
  const { lines, live, restart } = useStream(run);
  return (
    <>
      {look === 'a' ? <Tape lines={lines} live={live} /> : look === 'b' ? <StepLog lines={lines} /> : <Ledger lines={lines} />}
      <div>
        <StreamKey live={live} onPress={restart} />
      </div>
    </>
  );
}

export const LogStream: Story = {
  render: () => (
    <Board
      part="Log stream"
      summary="What a run writes as it goes: an agent's steps, a data job, a deploy. Levels are words or marks, never only a colour; red is a failure and green is only a line that needs you."
      directions={[
        {
          id: 'a',
          name: 'A · Tape',
          summary: 'Every line, in order, on a mono tape in a Well. It follows the end; scroll back and a key says how many new lines wait. A level is a mark at the line’s start.',
          prior: 'a terminal’s scrollback, as with tail -f.',
          scroll: 'the tape scrolls inside a fixed height of lines, with the kit’s bar. The page never does.',
        },
        {
          id: 'b',
          name: 'B · Steps',
          summary: 'The run as Drawer folds, one per step, each with its state and time. The step that failed or needs you opens itself and shows its last lines; earlier ones page in.',
          prior: 'a build pipeline’s step-by-step log.',
          scroll: 'none: closed steps are one line each, and an open step shows only its last lines.',
        },
        {
          id: 'c',
          name: 'C · Ledger',
          summary: 'Only what matters, in Key rows: a level stamp in its own column, repeats counted, quiet lines folded to one mark you can open.',
          prior: 'a ship’s log book, and syslog’s “last message repeated”.',
          scroll: 'none: repeats and quiet lines fold, so a run of hundreds reads in a dozen rows.',
        },
      ]}
    >
      {(look) => (
        <>
          <LiveLog look={look} />
          <Caption>Failed, read back from earlier</Caption>
          {look === 'a' ? <Tape lines={run} rows={5} back /> : look === 'b' ? <StepLog lines={run} openFirst="Match" /> : <Ledger lines={run} showQuiet />}
          <Caption>Nothing yet</Caption>
          <p className="ro-quiet">No lines yet. The run writes here once it starts.</p>
          <Caption>Unavailable</Caption>
          <Gone>This run’s log is gone: logs are kept for 7 days.</Gone>
        </>
      )}
    </Board>
  ),
};

/* ---------------------------------------------------------------- Diff */

type Op = 'same' | 'del' | 'add';
interface Row {
  op: Op;
  text: string;
}

const textDiff: Row[] = [
  { op: 'same', text: 'source: vessel-register' },
  { op: 'same', text: 'schedule: hourly' },
  { op: 'del', text: 'timeout: 30s' },
  { op: 'add', text: 'timeout: 45s' },
  { op: 'same', text: 'retries: 3' },
  { op: 'add', text: 'notify: harbour-ops' },
  { op: 'same', text: 'write: register' },
  { op: 'same', text: 'mode: append' },
  { op: 'same', text: 'keep: 7 days' },
  { op: 'same', text: 'owner: data-team' },
  { op: 'del', text: 'paused: true' },
  { op: 'same', text: 'region: north' },
];

interface Change {
  key: string;
  was?: string;
  now?: string;
}
const changes: Change[] = [
  { key: 'timeout', was: '30s', now: '45s' },
  { key: 'notify', now: 'harbour-ops' },
  { key: 'paused', was: 'true' },
];

/** Folds runs of unchanged lines longer than `keep` either side of a change into one "N same lines" mark. */
function foldSame(rows: Row[], keep = 1) {
  const out: (Row | { fold: number })[] = [];
  let run: Row[] = [];
  const flush = (end: boolean) => {
    const start = out.length === 0;
    const head = start ? 0 : keep;
    const tail = end ? 0 : keep;
    if (run.length > head + tail + 1) {
      out.push(...run.slice(0, head), { fold: run.length - head - tail }, ...run.slice(run.length - tail));
    } else out.push(...run);
    run = [];
  };
  for (const r of rows) {
    if (r.op === 'same') run.push(r);
    else {
      flush(false);
      out.push(r);
    }
  }
  flush(true);
  return out;
}

const sign: Record<Op, string> = { same: ' ', del: '−', add: '+' };

/** A · One column: removed lines dim with a minus, added lines full ink with a plus and a key edge; same runs fold. */
function OneColumn({ rows, folded = true }: { rows: Row[]; folded?: boolean }) {
  const [open, setOpen] = useState(!folded);
  const shown = open ? rows : foldSame(rows);
  return (
    <div className="ro-diff-one">
      <div className="ro-diff-head">
        <span>pipeline.yaml</span>
        <span>
          {rows.filter((r) => r.op === 'add').length} added · {rows.filter((r) => r.op === 'del').length} removed
        </span>
      </div>
      {shown.map((r, i) =>
        'fold' in r ? (
          <button key={i} type="button" className="ro-diff-fold" onClick={() => setOpen(true)}>
            {r.fold} same lines
          </button>
        ) : (
          <div key={i} className="ro-diff-row" data-op={r.op}>
            <span className="ro-sign" aria-label={r.op === 'same' ? undefined : r.op === 'add' ? 'Added' : 'Removed'}>
              {sign[r.op]}
            </span>
            <code>{r.text}</code>
          </div>
        ),
      )}
    </div>
  );
}

/** Pairs rows for two columns: a removed line sits beside the added line that replaced it. */
function pair(rows: Row[]) {
  const out: { before?: Row; after?: Row }[] = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]!;
    const next = rows[i + 1];
    if (r.op === 'same') out.push({ before: r, after: r });
    else if (r.op === 'del' && next?.op === 'add') {
      out.push({ before: r, after: next });
      i++;
    } else if (r.op === 'del') out.push({ before: r });
    else out.push({ after: r });
  }
  return out;
}

/** B · Two sheets: before and after side by side, rows lined up; a changed row is marked by a line across both. */
function TwoSheets({ rows }: { rows: Row[] }) {
  const all = pair(rows);
  const pairs = all.slice(0, 9);
  const rest = all.length - pairs.length;
  return (
    <div className="ro-diff-two">
      <div className="ro-diff-two-head">
        <span>Before · 6 Nov 09:00</span>
        <span>After · now</span>
      </div>
      {pairs.map((p, i) => {
        const changed = p.before?.op !== 'same' || p.after?.op !== 'same';
        return (
          <div key={i} className="ro-diff-pair" data-changed={changed || undefined}>
            <code data-op={p.before?.op ?? 'none'}>{p.before ? p.before.text : ''}</code>
            <code data-op={p.after?.op ?? 'none'}>{p.after ? p.after.text : ''}</code>
          </div>
        );
      })}
      {rest > 0 ? <p className="ro-quiet">{rest} more lines, all the same.</p> : null}
    </div>
  );
}

/** C · Sink and rise: a list of what changed, key by key. What went sinks into a Well; what came rises as a key. */
function SinkRise({ list }: { list: Change[] }) {
  return (
    <div className="ro-diff-changes">
      {list.map((c) => (
        <div key={c.key} className="ro-change">
          <span className="ro-change-key">{c.key}</span>
          <span className="ro-change-values">
            {c.was !== undefined ? (
              <span className="ro-sink" aria-label={`was ${c.was}`}>
                {c.was}
              </span>
            ) : (
              <span className="ro-quiet-inline">new</span>
            )}
            <Icon name="arrow" size={14} />
            {c.now !== undefined ? (
              <span className="ro-rise" aria-label={`now ${c.now}`}>
                {c.now}
              </span>
            ) : (
              <span className="ro-quiet-inline">removed</span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

/** C for text: the same sink and rise, word by word in the line. */
function SinkRiseText() {
  return (
    <p className="ro-sentence">
      Matching records to <span className="ro-sink">known</span> <span className="ro-rise">registered</span> vessels, then <span className="ro-rise">ask before</span> writing.
    </p>
  );
}

export const Diff: Story = {
  render: () => (
    <Board
      part="Diff"
      summary="What changed between two versions: a config, a record, or text an agent wants to write. Added is never green and removed never red; the difference shows in signs, weight and depth."
      directions={[
        {
          id: 'a',
          name: 'A · One column',
          summary: 'Lines in order. Removed lines dim with a minus; added lines in full ink with a plus and a key edge down the start. Long same runs fold to one mark.',
          prior: 'a unified diff, as from diff -u.',
          scroll: 'none: unchanged runs fold, so only changes and a line either side show.',
        },
        {
          id: 'b',
          name: 'B · Two sheets',
          summary: 'Before and after side by side on two Sheets, rows lined up. A changed row is marked by one line across both, the line as structure.',
          prior: 'a side-by-side compare tool.',
          scroll: 'none: a page of rows, then a count of what’s left; it needs width, so it stacks on a narrow pane.',
        },
        {
          id: 'c',
          name: 'C · Sink and rise',
          summary: 'A list of what changed, key by key: what went sinks into a Well, what came rises as a key. Text diffs the same way, word by word, in the line.',
          prior: 'track changes in a word processor, and a settings change summary.',
          scroll: 'none: it lists changes only, never the whole file.',
        },
      ]}
    >
      {(look) => (
        <>
          {look === 'a' ? <OneColumn rows={textDiff} /> : look === 'b' ? <TwoSheets rows={textDiff} /> : <SinkRise list={changes} />}
          <Caption>{look === 'c' ? 'Text, in the line' : 'Opened, every line'}</Caption>
          {look === 'a' ? <OneColumn rows={textDiff.slice(0, 7)} folded={false} /> : look === 'b' ? <TwoSheets rows={textDiff.slice(2, 6)} /> : <SinkRiseText />}
          <Caption>No change</Caption>
          <p className="ro-quiet">Same as before: nothing changed since 6 Nov 09:00.</p>
          <Caption>Too big to show</Caption>
          <p className="ro-quiet">1,204 lines changed. Showing the first 40; the rest can be taken as a file.</p>
        </>
      )}
    </Board>
  ),
};

/* ---------------------------------------------------------------- Value inspector */

type Value = string | number | boolean | null | Value[] | { [k: string]: Value };
const call: { [k: string]: Value } = {
  tool: 'register.write',
  input: { vessels: 22, mode: 'append', region: 'north', keys: ['imo', 'name', 'flag'] },
  output: { written: 0, error: { code: 'read-only', until: '22:00', retry: true } },
  took: 1.42,
  secret: '••••',
};

const kindOf = (v: Value) => (v === null ? 'null' : Array.isArray(v) ? `list · ${v.length}` : typeof v === 'object' ? `${Object.keys(v).length} keys` : typeof v);
const isBranch = (v: Value): v is Value[] | { [k: string]: Value } => v !== null && typeof v === 'object';
const entries = (v: Value[] | { [k: string]: Value }) => (Array.isArray(v) ? v.map((x, i) => [String(i), x] as const) : Object.entries(v));
const show = (v: Value) => (typeof v === 'string' ? `"${v}"` : String(v));

/** Small Press-to-take key for a value or a path (the Snippet's inline key). */
function Take({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="ro-take"
      data-state={done ? 'copied' : undefined}
      aria-label={`Copy ${label}`}
      onClick={() => {
        void navigator.clipboard?.writeText(text).catch(() => undefined);
        setDone(true);
        setTimeout(() => setDone(false), ms('motion-still'));
      }}
    >
      <code>{text}</code>
    </button>
  );
}

/** A · Outline: an indented tree; a branch opens in place with a chevron; keys mono and muted, values in ink. */
function Outline({ value, open: start = ['input', 'output'] }: { value: { [k: string]: Value }; open?: string[] }) {
  const [open, setOpen] = useState<string[]>(start);
  const node = (key: string, v: Value, path: string, depth: number): ReactNode => {
    const branch = isBranch(v);
    const isOpen = open.includes(path);
    return (
      <div key={path} className="ro-outline-node">
        <div className="ro-outline-row" style={{ ['--ro-depth' as string]: depth }}>
          {branch ? (
            <button type="button" className="ro-outline-toggle" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? open.filter((p) => p !== path) : [...open, path])}>
              <Icon name={isOpen ? 'chevron-down' : 'chevron-right'} size={14} />
              <span className="ro-key">{key}</span>
            </button>
          ) : (
            <span className="ro-key ro-key-leaf">{key}</span>
          )}
          {branch ? <span className="ro-kind">{kindOf(v)}</span> : key === 'secret' ? <span className="ro-hidden">Hidden: a secret</span> : <span className="ro-value">{show(v)}</span>}
        </div>
        {branch && isOpen ? entries(v).map(([k, c]) => node(k, c, `${path}.${k}`, depth + 1)) : null}
      </div>
    );
  };
  return <div className="ro-outline">{Object.entries(value).map(([k, v]) => node(k, v, k, 0))}</div>;
}

/** B · Columns: pick a key and what it holds opens in the next column; the path rides on top as a key to take. */
function Columns({ value, start = ['output', 'error'] }: { value: { [k: string]: Value }; start?: string[] }) {
  const [path, setPath] = useState<string[]>(start);
  const cols: { at: Value[] | { [k: string]: Value }; chosen?: string }[] = [];
  let at: Value = value;
  for (let i = 0; i <= path.length && isBranch(at); i++) {
    cols.push({ at, chosen: path[i] });
    const nextKey = path[i];
    if (nextKey === undefined) break;
    at = (Array.isArray(at) ? at[Number(nextKey)] : at[nextKey]) as Value;
  }
  const shownCols = cols.slice(-3);
  const hidden = cols.length - shownCols.length;
  return (
    <div className="ro-columns">
      <div className="ro-columns-path">
        <Take text={path.join('.') || 'call'} label="the path" />
      </div>
      <div className="ro-columns-row" data-hidden={hidden || undefined}>
        {shownCols.map((c, ci) => {
          const depth = hidden + ci;
          return (
            <div key={depth} className="ro-column-list">
              {entries(c.at).map(([k, v]) => (
                <button
                  key={k}
                  type="button"
                  className="ro-column-item"
                  data-chosen={c.chosen === k || undefined}
                  onClick={() => setPath([...path.slice(0, depth), k])}
                >
                  <span className="ro-key">{k}</span>
                  {isBranch(v) ? <Icon name="chevron-right" size={14} /> : k === 'secret' ? <span className="ro-hidden">Hidden</span> : <span className="ro-value">{show(v)}</span>}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Flattens a value to rows of full paths and leaf values. */
function flatten(v: Value, path = ''): { path: string; value: Value }[] {
  if (!isBranch(v)) return [{ path, value: v }];
  return entries(v).flatMap(([k, c]) => flatten(c, path ? `${path}.${k}` : k));
}

/** C · Paths: flat Key rows of full paths, grouped under a hairline by their first key; each value is a key to take. */
function Paths({ value, only }: { value: { [k: string]: Value }; only?: string }) {
  const rows = flatten(value).filter((r) => !only || r.path.startsWith(only));
  const groups = [...new Set(rows.map((r) => r.path.split('.')[0]))];
  return (
    <div className="ro-paths">
      {groups.map((g) => (
        <div key={g} className="ro-paths-group">
          <p className="ro-paths-head">{g}</p>
          {rows
            .filter((r) => r.path.split('.')[0] === g)
            .map((r) => (
              <div key={r.path} className="ro-paths-row">
                <span className="ro-key">{r.path.split('.').slice(1).join('.') || r.path}</span>
                {r.path === 'secret' ? <span className="ro-hidden">Hidden: a secret</span> : <Take text={show(r.value)} label={r.path} />}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

export const ValueInspector: Story = {
  render: () => (
    <Board
      part="Value inspector"
      summary="A value a run used or made: a tool call’s input and output, a record’s fields. Secrets stay hidden and say so; a value or path you might want is a key to take, as Snippet’s is."
      directions={[
        {
          id: 'a',
          name: 'A · Outline',
          summary: 'An indented tree. A branch opens in place with a chevron and says what it holds; keys are mono and muted, values in ink.',
          prior: 'a browser console’s object tree.',
          scroll: 'it grows as branches open; deep values can push it past its space, so it may need the kit’s bar.',
        },
        {
          id: 'b',
          name: 'B · Columns',
          summary: 'Pick a key and what it holds opens in the next column. At most three columns show; the path rides on top as a key to take.',
          prior: 'a column file browser.',
          scroll: 'none: depth goes sideways and older columns step off, so it never grows down.',
        },
        {
          id: 'c',
          name: 'C · Paths',
          summary: 'Flat Key rows of full paths under a hairline for each top key. Every value is a key to take; no opening and closing.',
          prior: 'a property sheet, and a list of jq paths.',
          scroll: 'none for a tool call; a large record pages, like the long table.',
        },
      ]}
    >
      {(look) => (
        <>
          {look === 'a' ? <Outline value={call} /> : look === 'b' ? <Columns value={call} /> : <Paths value={call} />}
          <Caption>{look === 'b' ? 'At the top' : 'Closed, or one part'}</Caption>
          {look === 'a' ? <Outline value={call} open={[]} /> : look === 'b' ? <Columns value={call} start={[]} /> : <Paths value={call} only="input" />}
          <Caption>Empty</Caption>
          <p className="ro-quiet">The tool returned nothing.</p>
          <Caption>Unavailable</Caption>
          <Gone>Output not kept: this tool’s results are private to its app.</Gone>
        </>
      )}
    </Board>
  ),
};

/** The three parts together, in one look each, as a tool call would show them in a run. */
export const Together: Story = {
  render: () => (
    <div className="ro-stage">
      <header className="ro-head">
        <h2 className="ro-part">Together</h2>
        <p className="ro-summary">One run with a refused write: its log, the config change that caused it, and the tool call’s value, each in the recommended look (Steps, Sink and rise, Columns).</p>
      </header>
      <div className="ro-grid">
        <StepLog lines={run} />
        <SinkRise list={changes} />
        <Columns value={call} />
      </div>
    </div>
  ),
};
