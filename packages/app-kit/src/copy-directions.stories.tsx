import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Button, Icon, ms } from '@augur/kit-common';
import './copy-directions.stories.css';

/**
 * Directions for the copy, code and folds round (6 Nov 2026, round C of the Carbon gap audit): code with a
 * copy key, the fold (a heading that opens a section), and edit in place. None exists in the kit yet; the
 * fold stands in today as the private `quill-fold` link in three parts.
 *
 * Every direction builds on what Harry has picked: Keycap buttons, Well fields, Sheet for anything that
 * pops up, Key for things in a tray, Horizon for states, and square corners from the radius tokens. Depth
 * is dimming only, never a blur; green means only "needs you". Nothing here needs a page to scroll: long
 * code folds to its first lines and says how many more there are.
 *
 * Each part has three directions, A to C, each named with its nearest prior art. None is drawn from Carbon
 * or any other design system. Each column has a live part to try at the top, then the same part drawn in a
 * state (copied, can't copy, editing, saving, refused, unavailable), so it shows in a snapshot. Once one is
 * picked per part, it is built as a real Common or Quill part with its own Carbon-style stories, and this
 * page goes.
 */
const meta = {
  title: 'Common/Copy, code and fold directions',
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

function Board({ part, summary, directions, children }: { part: string; summary: string; directions: Direction[]; children: (d: Look) => ReactNode }) {
  return (
    <div className="cd-stage">
      <header className="cd-head">
        <h2 className="cd-part">{part}</h2>
        <p className="cd-summary">{summary}</p>
      </header>
      <div className="cd-grid">
        {directions.map((d) => (
          <section key={d.id} className="cd-column" data-direction={d.id} aria-label={`${part}: ${d.name}`}>
            <h3 className="cd-name">{d.name}</h3>
            <p className="cd-note">{d.summary}</p>
            <p className="cd-prior">
              <span className="cd-prior-label">Nearest prior art</span> {d.prior}
            </p>
            <div className="cd-specimens">{children(d.id)}</div>
          </section>
        ))}
      </div>
    </div>
  );
}

const Caption = ({ children }: { children: ReactNode }) => <p className="cd-caption">{children}</p>;

/* ---------------------------------------------------------------- Code and copy */

type CopyState = 'rest' | 'copied' | 'blocked';

/** Copies text, and says whether it worked. A browser that refuses is told plainly, with what to do instead. */
function useCopy(text: string, forced?: CopyState) {
  const [state, setState] = useState<CopyState>('rest');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('blocked');
    }
    timer.current = setTimeout(() => setState('rest'), ms('motion-still'));
  };
  return { state: forced ?? state, copy };
}

const blockedWords = 'The browser won’t let this page copy. Select the text and copy it yourself.';

interface SnippetProps {
  look: Look;
  /** What the code is, in a word or two: read aloud with the copy key ("Copy the command"). */
  label: string;
  /** A short kind, shown as the head in B ("Shell", "Id"). */
  kind?: string;
  code: string;
  /** Lines shown before the rest folds away. */
  lines?: number;
  state?: CopyState;
  /** Drawn as pointed at, for the snapshot. */
  pointed?: boolean;
}

/** A code snippet with its copy key, drawn in one of the three looks. */
function Snippet({ look, label, kind, code, lines = 4, state: forced, pointed }: SnippetProps) {
  const { state, copy } = useCopy(code, forced);
  const [open, setOpen] = useState(false);
  const all = code.split('\n');
  const more = all.length - lines;
  const shown = open || more <= 1 ? all : all.slice(0, lines);
  const single = all.length === 1;
  const word = state === 'copied' ? 'Copied' : 'Copy';
  const live = state === 'copied' ? `${label} copied.` : state === 'blocked' ? blockedWords : '';
  const codeId = useId();

  const body = (
    <pre className="cd-code" id={codeId}>
      {shown.map((line, i) => (
        <span key={i} className="cd-line">
          {look === 'b' && !single ? <span className="cd-num" aria-hidden="true">{i + 1}</span> : null}
          <code>{line || ' '}</code>
        </span>
      ))}
    </pre>
  );
  const fold =
    more > 1 ? (
      <button type="button" className="cd-more" aria-expanded={open} aria-controls={codeId} onClick={() => setOpen(!open)}>
        <Icon name={open ? 'chevron-down' : 'chevron-right'} size={14} />
        {open ? 'Show the first lines' : `Show all ${all.length} lines`}
      </button>
    ) : null;
  const status = (
    <span className="cd-status" role="status">
      {live}
    </span>
  );

  if (look === 'a') {
    // A · Slot and key: the code in a Well, a key joined flush to its end.
    return (
      <div className="cd-snippet" data-look="a" data-single={single || undefined} data-state={state}>
        <div className="cd-slot">
          <div className="cd-slot-well">{body}</div>
          <Button size="sm" kind="secondary" className="cd-slot-key" aria-label={`${word}: ${label}`} icon={state === 'copied' ? <Icon name="check" size={16} /> : undefined} onPress={copy}>
            {word}
          </Button>
        </div>
        {fold}
        {state === 'blocked' ? <p className="cd-blocked">{blockedWords}</p> : null}
        {status}
      </div>
    );
  }

  if (look === 'b') {
    // B · Listing: no box. A mono head on a hairline, the line down the start, copy as a word in the head.
    return (
      <div className="cd-snippet" data-look="b" data-single={single || undefined} data-state={state}>
        <div className="cd-listing-head">
          <span className="cd-listing-kind">
            {kind ?? label}
            {!single ? ` · ${all.length} lines` : null}
          </span>
          <button type="button" className="cd-listing-copy" data-pointed={pointed || undefined} aria-label={`${word}: ${label}`} onClick={copy}>
            {state === 'copied' ? <Icon name="check" size={14} /> : null}
            {state === 'copied' ? (single ? 'Copied' : `Copied ${all.length} lines`) : 'Copy'}
          </button>
        </div>
        <div className="cd-listing-body">{body}</div>
        {fold}
        {state === 'blocked' ? <p className="cd-blocked">{blockedWords}</p> : null}
        {status}
      </div>
    );
  }

  // C · Press to take: the whole snippet is one key. A press copies it; a drag still selects.
  const take = () => {
    if (window.getSelection()?.toString()) return;
    void copy();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      void copy();
    }
  };
  return (
    <div className="cd-snippet" data-look="c" data-single={single || undefined} data-state={state}>
      <div className="cd-take" role="button" tabIndex={0} aria-label={`${word}: ${label}`} aria-describedby={codeId} data-pointed={pointed || undefined} onClick={take} onKeyDown={onKey}>
        {body}
        <span className="cd-take-tag" aria-hidden="true">
          {state === 'copied' ? <Icon name="check" size={14} /> : null}
          {state === 'copied' ? 'Copied' : 'Press to copy'}
        </span>
      </div>
      {fold}
      {state === 'blocked' ? <p className="cd-blocked">{blockedWords}</p> : null}
      {status}
    </div>
  );
}

/** An id inside a sentence, copied by pressing it. */
function InlineCode({ look, code, label, state: forced }: { look: Look; code: string; label: string; state?: CopyState }) {
  const { state, copy } = useCopy(code, forced);
  return (
    <>
      <button type="button" className="cd-inline" data-look={look} data-state={state} aria-label={`${state === 'copied' ? 'Copied' : 'Copy'}: ${label}, ${code}`} onClick={copy}>
        <code>{code}</code>
        {state === 'copied' ? <Icon name="check" size={12} /> : null}
      </button>
      <span className="cd-status" role="status">
        {state === 'copied' ? `${label} copied.` : ''}
      </span>
    </>
  );
}

const command = 'augur app publish data-atlas --to staging';
const deploy = [
  '# Publish Data Atlas to staging, then check it took',
  'augur login --as harry',
  'augur app build data-atlas',
  'augur app publish data-atlas --to staging',
  'augur app status data-atlas --watch',
  'augur logs data-atlas --since 10m',
  'augur app promote data-atlas --to live',
  'augur logout',
].join('\n');

const codeDirections: Direction[] = [
  { id: 'a', name: 'A · Slot and key', summary: 'The code sits in a Well; a Keycap key joins flush to its end, the same height. Copied, the key stays down a moment and says so.', prior: 'a ticket machine’s slot with its button beside it.' },
  { id: 'b', name: 'B · Listing', summary: 'No box. A mono head on a hairline names it and counts its lines; a line runs down its start; copy is a word in the head.', prior: 'a printed program listing in a manual.' },
  { id: 'c', name: 'C · Press to take', summary: 'The whole snippet is one key, raised like a tab: press it anywhere to copy and it sinks. Dragging across it still selects.', prior: 'a tear-off number from a queue ticket roll.' },
];

/** One line, many lines folded to four, an id in a sentence, then copied and refused, drawn for the snapshot. */
export const CodeAndCopy: Story = {
  name: 'Code and copy',
  render: () => (
    <Board part="Code and copy" directions={codeDirections} summary="A command, a run of commands folded to its first four lines, an id inside a sentence, then copied and refused (the browser blocked it, so it says what to do).">
      {(d) => (
        <>
          <Snippet look={d} label="the command" kind="Shell" code={command} />
          <Snippet look={d} label="the publish steps" kind="Shell" code={deploy} />
          <p className="cd-sentence">
            Send the app id <InlineCode look={d} code="app_7f3a9c" label="The app id" /> to whoever looks after staging.
          </p>
          <Caption>Copied, and pointed at</Caption>
          <Snippet look={d} label="the command" kind="Shell" code={command} state="copied" />
          <Snippet look={d} label="the key" kind="Key" code="ak_live_4f9e…c21b" pointed />
          <Caption>The browser refused</Caption>
          <Snippet look={d} label="the command" kind="Shell" code={command} state="blocked" />
        </>
      )}
    </Board>
  ),
};

/* ---------------------------------------------------------------- Folds */

interface FoldItem {
  id: string;
  title: string;
  /** A short summary of what's inside, shown while it's shut. */
  summary: string;
  needs?: boolean;
  /** Why it can't be opened; it stays in the list and says so. */
  reason?: string;
  body: ReactNode;
}

const Setting = ({ name, value }: { name: string; value: string }) => (
  <div className="cd-setting">
    <span>{name}</span>
    <span className="cd-setting-value">{value}</span>
  </div>
);

const folds: FoldItem[] = [
  {
    id: 'notify',
    title: 'Notifications',
    summary: '3 on',
    body: (
      <>
        <Setting name="When someone shares with you" value="On" />
        <Setting name="When a run fails" value="On" />
        <Setting name="A daily summary" value="On, at 08:00" />
      </>
    ),
  },
  {
    id: 'access',
    title: 'Access',
    summary: '1 needs you',
    needs: true,
    body: (
      <>
        <Setting name="Who can open it" value="Ops and People" />
        <Setting name="Priya asked to edit" value="Waiting for you" />
      </>
    ),
  },
  { id: 'storage', title: 'Storage', summary: '2.4 GB of 10 GB', body: <Setting name="Keep old versions for" value="90 days" /> },
  { id: 'billing', title: 'Billing', summary: 'Owners only', reason: 'Only the floor’s owner can open billing.', body: null },
];

/** A run of folds, drawn in one of the three looks. One open at a time unless `many`. */
function FoldSet({ look, items, initial = [], pointed, focused, many }: { look: Look; items: FoldItem[]; initial?: string[]; pointed?: string; focused?: string; many?: boolean }) {
  const [open, setOpen] = useState<string[]>(initial);
  const base = useId();
  const toggle = (id: string) => setOpen((now) => (now.includes(id) ? now.filter((o) => o !== id) : many ? [...now, id] : [id]));
  return (
    <div className="cd-folds" data-look={look} data-some-open={open.length > 0 || undefined}>
      {items.map((f) => {
        const isOpen = open.includes(f.id);
        const shut = Boolean(f.reason);
        return (
          <div key={f.id} className="cd-fold" data-open={isOpen || undefined} data-unavailable={shut || undefined}>
            <h4 className="cd-fold-h">
              <button
                type="button"
                className="cd-fold-head"
                id={`${base}-${f.id}-h`}
                aria-expanded={isOpen}
                aria-controls={shut ? undefined : `${base}-${f.id}`}
                aria-disabled={shut || undefined}
                aria-describedby={shut ? `${base}-${f.id}-why` : undefined}
                data-pointed={pointed === f.id || undefined}
                data-focus-drawn={focused === f.id || undefined}
                onClick={() => (shut ? undefined : toggle(f.id))}
              >
                <span className="cd-fold-mark" aria-hidden="true">
                  <Icon name={shut ? 'lock' : 'chevron-right'} size={16} />
                </span>
                <span className="cd-fold-title">{f.title}</span>
                <span className="cd-fold-sum">
                  {f.needs ? <i className="cd-needs" aria-hidden="true" /> : null}
                  {f.summary}
                </span>
              </button>
            </h4>
            {shut ? (
              <p className="cd-fold-why" id={`${base}-${f.id}-why`}>
                {f.reason}
              </p>
            ) : (
              <div className="cd-fold-body" id={`${base}-${f.id}`} role="region" aria-labelledby={`${base}-${f.id}-h`} hidden={!isOpen}>
                {f.body}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const foldDirections: Direction[] = [
  { id: 'a', name: 'A · Outline', summary: 'Headings on hairlines, shut ones in muted ink. Open, the heading comes to full ink and a line runs down the start of what it holds.', prior: 'a writing app’s outline, where a heading folds what is under it.' },
  { id: 'b', name: 'B · Drawer', summary: 'The folds sit in a sunken tray like the Key tabs. The open one rises as a key, and what it holds opens under it as a Well.', prior: 'a card-index drawer, one card pulled up.' },
  { id: 'c', name: 'C · Ledger', summary: 'No lines: each heading carries a mono tally of what’s inside, so you can tell without opening. Open one, and the rest step back.', prior: 'a bank statement, each month a total that opens.' },
];

/** Four folds on a settings page: one open, one pointed at, one that needs you, one unavailable that says why. */
export const Folds: Story = {
  name: 'Folds',
  render: () => (
    <Board part="Folds" directions={foldDirections} summary="A settings page kept to one screen: one fold open, Access needs you (the tally says so while it’s shut), Billing can’t be opened and says why. The second set shows a heading with keyboard focus.">
      {(d) => (
        <>
          <FoldSet look={d} items={folds} initial={['notify']} pointed="storage" />
          <Caption>All shut, keyboard on Access</Caption>
          <FoldSet look={d} items={folds.slice(0, 3)} focused="access" />
        </>
      )}
    </Board>
  ),
};

/* ---------------------------------------------------------------- Edit in place */

type EditState = 'rest' | 'editing' | 'saving' | 'refused' | 'unavailable';

interface InPlaceProps {
  look: Look;
  /** What the value is, for the label read aloud ("Name"). */
  label: string;
  value: string;
  /** Drawn in this state, for the snapshot. */
  state?: EditState;
  /** Why it can't be changed; it stays visible and says so. */
  reason?: string;
  /** What a refused save says. */
  refusal?: string;
  pointed?: boolean;
}

/** One value changed where it sits: press it, type, Enter keeps it, Esc puts it back. */
function InPlace({ look, label, value: initial, state: forced, reason, refusal, pointed }: InPlaceProps) {
  const [value, setValue] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [state, setState] = useState<EditState>(forced ?? (reason ? 'unavailable' : 'rest'));
  const [saved, setSaved] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hint = useId();
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (state === 'editing' && !forced) input.current?.select();
  }, [state, forced]);

  const start = () => {
    if (state === 'unavailable') return;
    setDraft(value);
    setSaved(false);
    setState('editing');
  };
  const cancel = () => {
    setDraft(value);
    setState('rest');
  };
  const save = () => {
    if (draft.trim() === value) return cancel();
    setState('saving');
    timer.current = setTimeout(() => {
      setValue(draft.trim());
      setState('rest');
      setSaved(true);
    }, ms('motion-slow'));
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') cancel();
  };

  const editing = state === 'editing' || state === 'saving' || state === 'refused';
  const line =
    state === 'saving' ? 'Saving…' : state === 'refused' ? (refusal ?? 'Couldn’t save. Your words are kept; try again.') : state === 'unavailable' ? reason : saved ? 'Saved.' : editing ? 'Enter keeps it, Esc puts it back.' : '';

  const field = (
    <span className="augur-field-box cd-edit-box" data-refused={state === 'refused' || undefined}>
      <input
        ref={input}
        className="augur-input"
        aria-label={label}
        aria-describedby={hint}
        aria-invalid={state === 'refused' || undefined}
        value={draft}
        readOnly={state === 'saving'}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={look === 'a' && !forced ? save : undefined}
      />
    </span>
  );
  const keys = (
    <span className="cd-edit-keys">
      <Button size="sm" kind="primary" busy={state === 'saving'} busyLabel="Saving" onPress={save}>
        Save
      </Button>
      <Button size="sm" kind="ghost" onPress={cancel}>
        Cancel
      </Button>
    </span>
  );
  const shown = (
    <button
      type="button"
      className="cd-value"
      aria-label={state === 'unavailable' ? `${label}: ${value}` : `Change ${label.toLowerCase()}: ${value}`}
      aria-describedby={hint}
      aria-disabled={state === 'unavailable' || undefined}
      data-pointed={pointed || undefined}
      onClick={start}
    >
      <span className="cd-value-text">{value}</span>
      {look === 'a' && state !== 'unavailable' ? (
        <span className="cd-value-pen" aria-hidden="true">
          <Icon name="rename" size={14} />
        </span>
      ) : null}
      {state === 'unavailable' ? (
        <span className="cd-value-pen" aria-hidden="true">
          <Icon name="lock" size={14} />
        </span>
      ) : null}
    </button>
  );

  return (
    <div className="cd-inplace" data-look={look} data-state={state}>
      <span className="cd-inplace-label">{label}</span>
      {look === 'a' ? (
        // A · Cell: the value turns into a Well the same size, where it is. No keys; Enter, Esc or leaving it.
        <div className="cd-inplace-row">{editing ? field : shown}</div>
      ) : look === 'b' ? (
        // B · Key beside: a rename key always beside the value; editing, a Well with Save and Cancel keys.
        <div className="cd-inplace-row">
          {editing ? (
            <>
              {field}
              {keys}
            </>
          ) : (
            <>
              {shown}
              {state !== 'unavailable' ? (
                <Button size="sm" kind="tertiary" icon={<Icon name="rename" size={16} />} aria-label={`Rename: ${value}`} onPress={start}>
                  Rename
                </Button>
              ) : null}
            </>
          )}
        </div>
      ) : (
        // C · Slip: the value stays put; a Sheet slips out under it with the field, keys and the line.
        <div className="cd-inplace-row cd-slip-anchor">
          {shown}
          {editing ? (
            <div className="cd-slip" data-float={!forced || undefined} role="group" aria-label={`Change ${label.toLowerCase()}`}>
              {field}
              {keys}
            </div>
          ) : null}
        </div>
      )}
      <p className="cd-inplace-line" id={hint} data-tone={state === 'refused' ? 'danger' : undefined} role={state === 'refused' ? 'alert' : undefined}>
        {line}
      </p>
    </div>
  );
}

const editDirections: Direction[] = [
  { id: 'a', name: 'A · Cell', summary: 'The value reads plain with a dotted line under it and a pen on pointing. Press it and it becomes a Well the same size; Enter, Esc or leaving it ends it.', prior: 'a spreadsheet cell.' },
  { id: 'b', name: 'B · Key beside', summary: 'A Rename key always sits beside the value, so it never hides. Editing, the value becomes a Well with Save and Cancel keys after it.', prior: 'a file manager’s rename.' },
  { id: 'c', name: 'C · Slip', summary: 'The value stays where it is; a Sheet slips out under it with the field, Save and Cancel, and the saving line. Live, it floats over what is under it; below, it is drawn in place so each state shows.', prior: 'a calendar’s quick edit on an event.' },
];

/** A name to change live (saving shows on the Save key), then editing, refused and unavailable, drawn for the snapshot. */
export const EditInPlace: Story = {
  name: 'Edit in place',
  render: () => (
    <Board part="Edit in place" directions={editDirections} summary="Rename a thing or change one value without a form. Try the first; the rest are drawn editing, refused (the name is taken, the words are kept) and unavailable (it says why).">
      {(d) => (
        <div className="cd-edit-stack" data-look={d}>
          <InPlace look={d} label="Name" value="Night roster" pointed />
          <InPlace look={d} label="Name" value="Night roster" state="editing" />
          <InPlace look={d} label="Name" value="Night roster" state="refused" refusal="Another floor already has that name. Your words are kept." />
          <InPlace look={d} label="Owner" value="Ops" reason="Only an admin can change who owns a floor." />
        </div>
      )}
    </Board>
  ),
};
