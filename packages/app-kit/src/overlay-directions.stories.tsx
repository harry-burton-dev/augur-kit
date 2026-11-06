import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Button, Heading, Icon, IconButton, Select, TextField } from '@augur/kit-common';
import './overlay-directions.stories.css';

/**
 * Directions for the overlays round (6 Nov 2026, from the Carbon gap audit): a **side sheet**, for a create
 * or edit flow bigger than a dialog without leaving the page, and an **info pop**, a press-to-open "why"
 * that can hold a link, where a hover tip can't. Each page puts today's nearest part beside three ways to
 * draw the new one, to pick one per part.
 *
 * Side sheet:
 * - **A · Leaf** comes in from the right edge, full height, over a dimmed page. It is the Sheet dialog
 *   turned on its side: a mono heading strip, the work, and a ruled footer with the actions. Nearest prior
 *   art: the drawer (a side panel over the page).
 * - **B · Bay** has no veil: the page gives way and narrows, and the sheet sits in the bay it leaves, one
 *   edge between them. The row you're editing keeps its ink line, so both stay usable. Nearest prior art:
 *   an inspector beside a canvas, as in drawing tools.
 * - **C · Stack** is wide, for a bigger flow: it leaves a strip of the page showing at the left, lists the
 *   steps on a rail of its own so nothing scrolls, and a second sheet stacks on it with the first one's
 *   edge still in view. Nearest prior art: stacked sheets, as on a phone.
 *
 * Info pop:
 * - **A · Slip** is a small square sheet under the mark you pressed, with a mono heading, a few lines and
 *   the link on a ruled foot. Nearest prior art: the popover.
 * - **B · Leader** sits out beside the field at the mark's height, and a hairline runs from the mark to it,
 *   so it never covers what it's about. Nearest prior art: a callout with a leader line, as on a drawing.
 * - **C · Fold** opens in place, as a ruled band under the label, and the form moves down to make room. It
 *   covers nothing at all. Nearest prior art: a disclosure (show more).
 *
 * All of them are flat greys with hairlines, square (radius tokens), no blur and no colour of their own:
 * green means only "needs you". Buttons are Keycap and fields are Well, as shipped. Icons go through
 * Common's Icon. Everything is drawn open inside a small screen so it shows in a snapshot. Once one is
 * picked for a part it is built in Common with its own props, and this page goes.
 */
const meta = {
  title: 'Common/Overlay directions',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

type DirectionId = 'today' | 'a' | 'b' | 'c';
type Direction = { id: DirectionId; name: string; note: string };

function Board({ part, summary, directions, wide, children }: { part: string; summary: string; directions: Direction[]; wide?: boolean; children: (d: DirectionId) => ReactNode }) {
  return (
    <div className="od-stage">
      <header className="od-head">
        <h2 className="od-part">{part}</h2>
        <p className="od-summary">{summary}</p>
      </header>
      <div className="od-grid" data-wide={wide || undefined}>
        {directions.map((d) => (
          <section key={d.id} className="od-column" data-direction={d.id} aria-label={`${part}: ${d.name}`}>
            <h3 className="od-name">{d.name}</h3>
            <p className="od-note">{d.note}</p>
            <div className="od-specimens">{children(d.id)}</div>
          </section>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Side sheet */

const sheetDirections: Direction[] = [
  { id: 'today', name: 'Today · Dialog, read size', note: 'The widest dialog, centred and glass, the page blurred behind. It covers the row it is about.' },
  { id: 'a', name: 'A · Leaf', note: 'From the right edge, full height, over a dimmed page. A mono heading strip, the work, a ruled footer.' },
  { id: 'b', name: 'B · Bay', note: 'No veil: the page narrows and the sheet sits beside it. The row you are editing keeps its ink line.' },
  { id: 'c', name: 'C · Stack', note: 'Wide, a strip of the page left showing. Steps on a rail of their own; a second sheet stacks on the first.' },
];

const rows = ['Q3 plan', 'Hiring plan', 'Office move', 'Budget review', 'Vendor list'];

/** A page behind, with the row the sheet is about marked. */
function PageBehind({ current }: { current?: string }) {
  return (
    <div className="od-page" aria-hidden="true">
      <Heading eyebrow="Library" heading="Plans" summary="12 records. Three need you." level={4} />
      <div className="od-page-rows">
        {rows.map((r) => (
          <div key={r} className="od-page-row" data-current={r === current || undefined}>
            <span>{r}</span>
            <span className="od-page-meta">Edited today</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SheetHead({ eyebrow, heading, step }: { eyebrow: string; heading: string; step?: string }) {
  return (
    <header className="od-sheet-head">
      <div className="od-sheet-titles">
        <span className="od-eyebrow">{eyebrow}</span>
        <h4 className="od-sheet-title">{heading}</h4>
      </div>
      {step ? <span className="od-step-count">{step}</span> : null}
      <IconButton icon="close" label="Close" size="sm" />
    </header>
  );
}

function SheetFoot({ action, back }: { action: string; back?: boolean }) {
  return (
    <footer className="od-sheet-foot">
      <Button kind="primary" size="sm">
        {action}
      </Button>
      {back ? (
        <Button kind="secondary" size="sm">
          Back
        </Button>
      ) : null}
      <button type="button" className="od-cancel">
        <kbd>Esc</kbd>
        Cancel
      </button>
    </footer>
  );
}

const editFields = (
  <>
    <TextField label="Name" name="name" required defaultValue="Q3 plan" />
    <Select label="Owner" name="owner" options={['Ana Ruiz', 'Sam Okafor', 'Lee Chen']} defaultValue="Sam Okafor" />
    <TextField label="Summary" name="summary" multiline rows={2} defaultValue="Targets, hires and the office move for July to September." />
  </>
);

/** The side sheet, drawn its direction's way. */
function SideSheet({ d, eyebrow, heading, children, action, steps, current, step }: { d: DirectionId; eyebrow: string; heading: string; children: ReactNode; action: string; steps?: string[]; current?: number; step?: string }) {
  if (d === 'today') {
    return (
      <div className="od-screen">
        <PageBehind current="Q3 plan" />
        <div className="augur-veil od-veil">
          <div className="augur-dialog" data-size="read" role="dialog" aria-label={`${heading} (today)`}>
            <div className="augur-dialog-body">
              <Heading eyebrow={eyebrow} heading={heading} size="s" level={4} />
              {step ? <p className="od-plain">{step}</p> : null}
              <div className="augur-dialog-fields">{children}</div>
              <div className="augur-dialog-actions">
                <Button kind="primary" size="sm">
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
  const rail =
    d === 'c' && steps ? (
      <ol className="od-rail" aria-label="Steps">
        {steps.map((s, i) => (
          <li key={s} data-state={i < current! ? 'done' : i === current ? 'here' : undefined}>
            <span className="od-rail-n">{i < current! ? <Icon name="check" size={14} /> : i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
    ) : null;
  const sheet = (
    <aside className="od-sheet" role="dialog" aria-label={`${heading} (${d})`}>
      <SheetHead eyebrow={eyebrow} heading={heading} step={d !== 'c' ? step : undefined} />
      {d !== 'c' && steps ? (
        <div className="od-progress" aria-hidden="true">
          {steps.map((s, i) => (
            <span key={s} data-state={i < current! ? 'done' : i === current ? 'here' : undefined} />
          ))}
        </div>
      ) : null}
      <div className="od-sheet-middle">
        {rail}
        <div className="od-sheet-body">{children}</div>
      </div>
      <SheetFoot action={action} back={Boolean(steps && current)} />
    </aside>
  );
  return (
    <div className="od-screen" data-layout={d}>
      <PageBehind current="Q3 plan" />
      {d === 'b' ? null : <div className="od-dim" />}
      {sheet}
    </div>
  );
}

/** Edit one record: more fields than a dialog wants, with the list it came from still in view. */
export const SideSheetEdit: Story = {
  name: 'Side sheet: edit a record',
  render: () => (
    <Board wide directions={sheetDirections} part="Side sheet: edit a record" summary="Three fields about one row of the list. The list stays where it was; nothing behind it is blurred and nothing scrolls.">
      {(d) => (
        <SideSheet d={d} eyebrow="Plans" heading="Edit Q3 plan" action="Save">
          {editFields}
        </SideSheet>
      )}
    </Board>
  ),
};

const flowSteps = ['Name it', 'Who can see it', 'Check and create'];

/** A bigger flow in steps, on the second step: steps instead of one long scrolling form. */
export const SideSheetSteps: Story = {
  name: 'Side sheet: a bigger flow, in steps',
  render: () => (
    <Board wide directions={sheetDirections} part="Side sheet: a bigger flow, in steps" summary="Creating a shared collection takes three steps, shown as steps rather than one long form, so nothing scrolls. This is the second.">
      {(d) => (
        <SideSheet d={d} eyebrow="Library" heading="New shared collection" action="Next" steps={flowSteps} current={1} step="Step 2 of 3">
          <Select label="Who can see it" name="see" options={['Everyone in Finance', 'Only people I add', 'Everyone']} defaultValue="Everyone in Finance" />
          <Select label="Who can edit it" name="edit" options={['Only me', 'Finance leads', 'Everyone who can see it']} defaultValue="Finance leads" />
        </SideSheet>
      )}
    </Board>
  ),
};

/** A sheet opened from a sheet: picking a person while editing. */
export const SideSheetStacked: Story = {
  name: 'Side sheet: one opened from another',
  render: () => (
    <Board
      wide
      directions={sheetDirections}
      part="Side sheet: one opened from another"
      summary="While editing, Owner opens a picker of its own. Today a second dialog would cover the first; each direction shows where the first one goes."
    >
      {(d) =>
        d === 'today' ? (
          <SideSheet d={d} eyebrow="Edit Q3 plan" heading="Pick an owner" action="Pick">
            <People />
          </SideSheet>
        ) : (
          <div className="od-screen" data-layout={d} data-stacked>
            <PageBehind current="Q3 plan" />
            {d === 'b' ? null : <div className="od-dim" />}
            <aside className="od-sheet od-sheet-under" aria-hidden="true">
              <SheetHead eyebrow="Plans" heading="Edit Q3 plan" />
              <div className="od-sheet-middle">
                <div className="od-sheet-body">{editFields}</div>
              </div>
            </aside>
            <aside className="od-sheet od-sheet-over" role="dialog" aria-label={`Pick an owner (${d})`}>
              <SheetHead eyebrow="Edit Q3 plan" heading="Pick an owner" />
              <div className="od-sheet-middle">
                <div className="od-sheet-body">
                  <People />
                </div>
              </div>
              <SheetFoot action="Pick" />
            </aside>
          </div>
        )
      }
    </Board>
  ),
};

function People() {
  return (
    <div className="od-people" role="listbox" aria-label="People">
      {['Ana Ruiz', 'Sam Okafor', 'Lee Chen', 'Priya Nair'].map((p) => (
        <div key={p} role="option" aria-selected={p === 'Sam Okafor'} className="od-person">
          <Icon name="account" size={16} />
          {p}
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- Info pop */

const popDirections: Direction[] = [
  { id: 'today', name: 'Today · Tip', note: 'On hover and focus only. It can’t hold a link, and goes when you move away.' },
  { id: 'a', name: 'A · Slip', note: 'A small square sheet under the mark. A mono heading, a few lines, the link on a ruled foot.' },
  { id: 'b', name: 'B · Leader', note: 'Out beside the field at the mark’s height, a hairline from the mark to it. Covers nothing it is about.' },
  { id: 'c', name: 'C · Fold', note: 'Opens in place, a ruled band under the label; the form moves down. Covers nothing at all.' },
];

/** The mark you press: Common's Icon in a small square key, inked while its pop is open. */
function Mark({ open, label }: { open: boolean; label: string }) {
  return (
    <button type="button" className="od-mark" aria-expanded={open} aria-label={label}>
      <Icon name="info" size={14} />
    </button>
  );
}

function PopBody({ d, heading, children, link }: { d: DirectionId; heading: string; children: ReactNode; link?: string }) {
  if (d === 'today') return <div className="augur-tip od-tip" role="tooltip">{children}</div>;
  return (
    <div className="od-pop" role="dialog" aria-label={heading}>
      <span className="od-pop-head">{heading}</span>
      <div className="od-pop-text">{children}</div>
      {link ? (
        <a className="od-pop-link" href="#retention" onClick={(e) => e.preventDefault()}>
          {link}
          <Icon name="arrow" size={14} />
        </a>
      ) : null}
    </div>
  );
}

/** A field whose label has a mark, with its pop open its direction's way. */
function FieldWithPop({ d, label, popHeading, pop, link, field, after }: { d: DirectionId; label: string; popHeading: string; pop: ReactNode; link?: string; field: ReactNode; after: ReactNode }) {
  return (
    <div className="od-screen" data-short data-pop={d}>
      <div className="od-form">
        <div className="od-label-row">
          <span className="od-label">{label}</span>
          <Mark open label={`About ${label.toLowerCase()}`} />
          {d !== 'c' ? <PopBody d={d} heading={popHeading} link={d === 'today' ? undefined : link}>{pop}</PopBody> : null}
        </div>
        {d === 'c' ? <PopBody d={d} heading={popHeading} link={link}>{pop}</PopBody> : null}
        <div className="od-labelled">{field}</div>
        {after}
      </div>
    </div>
  );
}

/** Why a field asks for something, with a link to the rule behind it. */
export const InfoPopField: Story = {
  name: 'Info pop: why a field asks',
  render: () => (
    <Board wide directions={popDirections} part="Info pop: why a field asks" summary="Keep for is set by a rule the person may want to read. Pressing the mark opens the why; Esc or pressing again closes it, and focus goes back to the mark.">
      {(d) => (
        <FieldWithPop
          d={d}
          label="Keep for"
          popHeading="Why this is asked"
          link="Read the retention rule"
          pop={<p>Finance records are kept for seven years by default. A shorter time needs a lead’s say.</p>}
          field={<Select label="Keep for" name="keep" options={['7 years', '3 years', '1 year']} defaultValue="7 years" />}
          after={<TextField label="Reference" name="ref" optional defaultValue="FIN-2026-031" />}
        />
      )}
    </Board>
  ),
};

/** A setting you can't change: who can, and where to ask. */
export const InfoPopLocked: Story = {
  name: 'Info pop: who can change this',
  render: () => (
    <Board wide directions={popDirections} part="Info pop: who can change this" summary="A setting this person can’t change says why in its own reason; the mark says who can and links to them. A tip can only say the first half.">
      {(d) => (
        <FieldWithPop
          d={d}
          label="Sharing"
          popHeading="Who can change this"
          link="Ask Ana Ruiz"
          pop={<p>Sharing for Finance is set by its admins. Ana Ruiz looks after it this quarter.</p>}
          field={<TextField label="Sharing" name="share" readOnly reason="Set for all of Finance by its admins." defaultValue="Finance only" />}
          after={<TextField label="Name" name="name" defaultValue="Budget review" />}
        />
      )}
    </Board>
  ),
};
