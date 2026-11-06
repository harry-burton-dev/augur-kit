import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactNode } from 'react';
import { Button, Heading, IconButton, Select, TextField } from '@augur/kit-common';
import { Notice } from './states.js';
import './attention-directions.stories.css';

/**
 * Directions for the attention round (6 Nov 2026): dialogs, toasts and the "needs you" notice. Each page
 * puts today's part beside three ways to draw it, to pick one per part:
 *
 * - **A · Sheet** carries on from the Sheet menus: a solid grey sheet, square, one edge, a mono heading
 *   strip and the actions on their own ruled footer. The page behind is dimmed, never blurred.
 * - **B · Line** has no box: the page dims further, and one rule runs the full width of the screen under
 *   the heading, like a horizon. What it asks sits above the line, what you can do sits below it.
 * - **C · Dock** comes up from the bottom edge as a full-width band, so the page above stays in view:
 *   short and wide, the heading on the left and the fields and actions on the right.
 *
 * All three are flat greys with hairlines, no blur and no colour of their own: green means only
 * "needs you" and red means danger. Buttons are Keycap and fields are Well, as shipped. Once one is
 * picked for a part it moves into `kit.css` and this page goes; the parts' props don't change.
 *
 * Everything is drawn open inside a small screen so it shows in a snapshot. A toast's countdown is drawn
 * part-way through.
 */
const meta = {
  title: 'Quill/Attention directions',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const directions = [
  { id: 'today', name: 'Today' },
  { id: 'sheet', name: 'A · Sheet' },
  { id: 'line', name: 'B · Line' },
  { id: 'dock', name: 'C · Dock' },
] as const;
type DirectionId = (typeof directions)[number]['id'];
type Notes = Record<DirectionId, string>;

function Board({ part, summary, notes, wide, children }: { part: string; summary: string; notes: Notes; wide?: boolean; children: (d: DirectionId) => ReactNode }) {
  return (
    <div className="ad-stage">
      <header className="ad-head">
        <h2 className="ad-part">{part}</h2>
        <p className="ad-summary">{summary}</p>
      </header>
      <div className="ad-grid" data-wide={wide || undefined}>
        {directions.map((d) => (
          <section key={d.id} className="ad-column" data-direction={d.id} aria-label={`${part}: ${d.name}`}>
            <h3 className="ad-name">{d.name}</h3>
            <p className="ad-note">{notes[d.id]}</p>
            <div className="ad-specimens">{children(d.id)}</div>
          </section>
        ))}
      </div>
    </div>
  );
}

/** A page behind, so the veil has something to dim. */
function PageBehind() {
  return (
    <div className="ad-page" aria-hidden="true">
      <Heading eyebrow="Library" heading="Plans" summary="12 records. Three need you." level={3} />
      <div className="ad-page-rows">
        {['Q3 plan', 'Hiring plan', 'Office move', 'Budget review', 'Vendor list'].map((r) => (
          <div key={r} className="ad-page-row">
            <span>{r}</span>
            <span className="ad-page-meta">Edited today</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Common's Dialog, drawn in place with its own classes so each direction styles the real markup. */
function OpenDialog({ d, eyebrow, heading, summary, error, children, fields, action, danger }: { d: DirectionId; eyebrow?: string; heading: string; summary?: string; error?: string; children?: ReactNode; fields?: ReactNode; action: string; danger?: boolean }) {
  return (
    <div className="ad-screen">
      <PageBehind />
      <div className="augur-veil ad-veil">
        <div className="augur-dialog" data-size="decision" role="dialog" aria-label={`${heading} (${d})`}>
          <div className="augur-dialog-body">
            <Heading eyebrow={eyebrow} heading={heading} summary={summary} size="s" level={3} />
            {error ? <p className="augur-dialog-error">{error}</p> : null}
            {children ? <div className="augur-dialog-text">{children}</div> : null}
            {fields ? <div className="augur-dialog-fields">{fields}</div> : null}
            <div className="augur-dialog-actions">
              <Button kind={danger ? 'danger' : 'primary'} once={danger}>
                {action}
              </Button>
              <button type="button" className="augur-dialog-cancel">
                <kbd>Esc</kbd>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const dialogNotes: Notes = {
  today: 'Glass, rounded, the page blurred behind.',
  sheet: 'Solid, square, a mono heading strip and a ruled footer with the actions. The page is dimmed.',
  line: 'No box: one rule across the whole screen under the heading, the ask above it and the answer below.',
  dock: 'A full-width band up from the bottom edge, so the page above stays in view. Short and wide.',
};

/** A small task: a name it needs and a kind it can go without. Enter presses Create. */
export const DialogForm: Story = {
  name: 'Dialog: a small task',
  render: () => (
    <Board wide notes={dialogNotes} part="Dialog: a small task" summary="One small task over the page. The page is dimmed, never blurred, and nothing behind it scrolls.">
      {(d) => (
        <OpenDialog
          d={d}
          eyebrow="Library"
          heading="New collection"
          action="Create"
          fields={
            <>
              <TextField label="Name" name="name" required defaultValue="Quarterly plans" />
              <Select label="Kind" name="kind" options={['Plans', 'Reports', 'Notes']} optional />
            </>
          }
        />
      )}
    </Board>
  ),
};

/** A decision that can't be undone, after one try failed: it stays open and says why. */
export const DialogDanger: Story = {
  name: 'Dialog: danger, after a failure',
  render: () => (
    <Board wide notes={dialogNotes} part="Dialog: danger, after a failure" summary="Delete can't be undone, so it shows as danger and focus starts on Cancel. The first try failed; the dialog stays and says why.">
      {(d) => (
        <OpenDialog d={d} heading="Delete this collection?" action="Delete" danger error="The library is read-only during the upgrade. Try again in ten minutes.">
          <p>Its 12 records move to the library’s top level. Nobody loses access.</p>
        </OpenDialog>
      )}
    </Board>
  ),
};

/* ---- Toasts ---- */

const toastNotes: Notes = {
  today: 'A glass pill, centred, blurred behind. Each goes by itself after a while.',
  sheet: 'A small square sheet with a mono word for its kind; its time left drains along the bottom edge.',
  line: 'Words at the bottom left on a rule; the rule is its time left, shrinking toward the start.',
  dock: 'One strip flush on the bottom edge. A newer one replaces it and says how many came before.',
};

function OpenToasts({ d, stacked }: { d: DirectionId; stacked?: boolean }) {
  const toasts = stacked ? [{ id: 'saved', text: 'Saved', left: 0.25 }, { id: 'archived', text: 'Archived 3 records', action: 'Undo', left: 0.7 }] : [{ id: 'archived', text: 'Archived 3 records', action: 'Undo', left: 0.7 }];
  const shown = d === 'dock' && stacked ? toasts.slice(-1) : toasts;
  return (
    <div className="ad-screen" data-short>
      <PageBehind />
      <ol className="aerie-toasts ad-toasts" aria-label={`Toasts (${d}${stacked ? ', two' : ''})`}>
        {shown.map((t) => (
          <li key={t.id} className="aerie-toast" style={{ '--left': t.left } as CSSProperties}>
            <span className="ad-toast-kind">Done</span>
            <span className="aerie-toast-text">{t.text}</span>
            {d === 'dock' && stacked ? <span className="ad-toast-more">1 more</span> : null}
            {t.action ? (
              <Button kind="tertiary" size="sm">
                {t.action}
              </Button>
            ) : null}
            <IconButton icon="close" label={`Close (${d}, ${t.id})`} size="sm" />
            <span className="ad-toast-time" aria-hidden="true" />
          </li>
        ))}
      </ol>
    </div>
  );
}

/** What just happened, said once at the bottom, with one way to change your mind. It goes by itself; hovered or focused, it holds. */
export const Toasts: Story = {
  render: () => (
    <Board notes={toastNotes} part="Toasts" summary="What just happened, once, with one way to change your mind. The line under each is its time left: it holds while hovered or focused.">
      {(d) => (
        <>
          <OpenToasts d={d} />
          <OpenToasts d={d} stacked />
        </>
      )}
    </Board>
  ),
};

/* ---- The needs-you notice ---- */

const noticeNotes: Notes = {
  today: 'A rounded box with a glowing green dot.',
  sheet: 'A solid strip, its tone said in mono and drawn as a hard edge on the left.',
  line: 'No box: a mono kicker above a rule. For needs you the kicker and rule are green, and the rule thicker.',
  dock: 'Flush to the top of its region and across it; a small square mark, and a green line under needs you.',
};

/** One sentence inside a page that needs attention. Only "needs you" is green; the other tones are here to show it's the only one. */
export const NeedsYou: Story = {
  name: 'Needs-you notice',
  render: () => (
    <Board notes={noticeNotes} part="Needs-you notice" summary="One sentence in a page that's waiting for you, with one thing to do. Green means only this; the other tones are shown so the difference reads.">
      {() => (
        <div className="ad-region">
          <Notice tone="needs" heading="Waiting for your back-brief." action="Write it" more={2}>
            Lee asked for it by Friday.
          </Notice>
          <Notice tone="warning" heading="Two records are going stale.">
            Nobody has opened them since August.
          </Notice>
          <Notice tone="refused" heading="Publishing was refused." action="See why">
            The library is read-only during the upgrade.
          </Notice>
          <Notice tone="info">Records you archive stay searchable for a year.</Notice>
          <p className="ad-plain">The page carries on under them.</p>
        </div>
      )}
    </Board>
  ),
};
