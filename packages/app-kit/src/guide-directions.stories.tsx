import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Button, Heading, Icon, IconButton } from '@augur/kit-common';
import './guide-directions.stories.css';

/**
 * Directions for the first-run guide (6 Nov 2026, round D of the Carbon gap audit): how a new app teaches
 * itself without a manual. The guide has two parts, and each page puts today's stand-in beside three ways
 * to draw them, to pick one:
 *
 * - **The pointer** shows one part at a time: what it's for, in one line, with Next and Skip.
 * - **The checklist** is a short list of first things to do, with how many are done, and a way to hide it.
 *
 * The three directions:
 *
 * - **A · Note** carries on from the Sheet tips: a solid, square note joined to the part by one short
 *   line (no arrow), and the checklist as a Sheet panel in the corner. The page isn't dimmed. Nearest
 *   prior art: product-tour popovers (Shepherd.js, Intro.js), which point with a caret and sit in a card.
 * - **B · Lamp** dims the page and leaves the one part lit, square, so the eye goes there; the words sit on
 *   the dim itself under a rule, with no box. The checklist isn't over anything: it's a section of the
 *   app's own start page (label, hairline, space, as PDR-014 lays sections out). Nearest prior art:
 *   spotlight coach marks (Material's tap target, Intro.js's highlight), which cut a circle and pulse.
 * - **C · Callout** borrows from technical drawings: small numbered marks sit on the parts themselves,
 *   and a ruled rail down the right edge lists the steps by the same numbers, the current one open. The
 *   rail is the checklist too, so there's one thing to learn. Nearest prior art: a drawing's balloons and
 *   parts list, and numbered callouts in printed manuals.
 *
 * All three are flat greys with hairlines, square (the radius tokens), no blur and no colour of their own:
 * a guide is an offer, not something that needs you, so it's never green. Buttons are Keycap. Nothing
 * scrolls: a guide holds a few steps, and a longer one is a manual. Everything is drawn open inside a small
 * screen so it shows in a snapshot. Once one is picked it's built in Quill as `Guide` (steps, each with a
 * target, a title and one line, `step`, `onStep`, `onSkip`, `onDone`) and `FirstSteps` (items with `done`
 * and an action, `onHide`), every label a prop, and this page goes.
 */
const meta = {
  title: 'Quill/First-run guide directions',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const directions = [
  { id: 'today', name: 'Today' },
  { id: 'note', name: 'A · Note' },
  { id: 'lamp', name: 'B · Lamp' },
  { id: 'callout', name: 'C · Callout' },
] as const;
type DirectionId = (typeof directions)[number]['id'];
type Notes = Record<DirectionId, string>;

function Board({ part, summary, notes, children }: { part: string; summary: string; notes: Notes; children: (d: DirectionId) => ReactNode }) {
  return (
    <div className="gd-stage">
      <header className="gd-head">
        <h2 className="gd-part">{part}</h2>
        <p className="gd-summary">{summary}</p>
      </header>
      <div className="gd-grid">
        {directions.map((d) => (
          <section key={d.id} className="gd-column" data-direction={d.id} aria-label={`${part}: ${d.name}`}>
            <h3 className="gd-name">{d.name}</h3>
            <p className="gd-note">{notes[d.id]}</p>
            {children(d.id)}
          </section>
        ))}
      </div>
    </div>
  );
}

/* ---- What the guide teaches: a small app with three parts worth pointing at ---- */

const steps = [
  { n: 1, part: 'new', title: 'Make a plan', line: 'New plan starts one from a blank page or a template.' },
  { n: 2, part: 'filter', title: 'Find yours', line: 'Filter narrows the list to an owner, a team or a state.' },
  { n: 3, part: 'share', title: 'Share it', line: 'Share gives a team the plan to read or to edit.' },
] as const;
type PartId = (typeof steps)[number]['part'];

const firstSteps = [
  { label: 'Make your first plan', done: true },
  { label: 'Filter the list by owner', done: true },
  { label: 'Share a plan with your team', done: false, action: 'Share' },
  { label: 'Turn on weekly reminders', done: false, action: 'Turn on' },
] as const;
const nextStep = firstSteps.find((s) => !s.done);

/** A part the guide can point at: drawn in place, with a numbered mark for the Callout direction. */
function Target({ id, d, lit, children }: { id: PartId; d: DirectionId; lit?: PartId; children: ReactNode }) {
  const n = steps.find((s) => s.part === id)!.n;
  return (
    <span className="gd-target" data-lit={lit === id || undefined}>
      {children}
      {d === 'callout' && lit ? <span className="gd-balloon" data-lit={lit === id || undefined} aria-hidden="true">{n}</span> : null}
    </span>
  );
}

function AppScreen({ d, lit, start, children, rail }: { d: DirectionId; lit?: PartId; start?: ReactNode; children?: (part: PartId) => ReactNode; rail?: ReactNode }) {
  const over = (part: PartId) => (lit === part ? children?.(part) : null);
  return (
    <div className="gd-screen" data-rail={rail ? true : undefined}>
      <div className="gd-app">
        <div className="gd-bar">
          <Heading eyebrow="Plans" heading="All plans" level={4} size="s" />
          <div className="gd-actions">
            <Target id="filter" d={d} lit={lit}>
              <IconButton icon="filter" label="Filter" size="sm" />
              {over('filter')}
            </Target>
            <Target id="share" d={d} lit={lit}>
              <IconButton icon="people" label="Share" size="sm" />
              {over('share')}
            </Target>
            <Target id="new" d={d} lit={lit}>
              <Button kind="primary" size="sm" icon={<Icon name="plus" size={16} />}>New plan</Button>
              {over('new')}
            </Target>
          </div>
        </div>
        {start ?? (
          <div className="gd-rows" aria-hidden="true">
            {['Q3 plan', 'Hiring plan', 'Office move', 'Budget review', 'Vendor list'].map((r) => (
              <div key={r} className="gd-row">
                <span>{r}</span>
                <span className="gd-meta">Edited today</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {rail}
    </div>
  );
}

/* ---- The pointer ---- */

function PointerToday() {
  return (
    <div className="gd-tip" role="note">
      <p>Filter narrows the list to an owner, a team or a state.</p>
      <button type="button" className="gd-got">Got it</button>
    </div>
  );
}

function PointerNote({ step }: { step: (typeof steps)[number] }) {
  return (
    <div className="gd-pointer" role="dialog" aria-label={`Guide: ${step.title}`}>
      <div className="gd-strip">
        <span>Getting started</span>
        <span>{step.n} of {steps.length}</span>
      </div>
      <div className="gd-body">
        <p className="gd-title">{step.title}</p>
        <p className="gd-line">{step.line}</p>
      </div>
      <div className="gd-foot">
        <button type="button" className="gd-skip">Skip the guide</button>
        <span className="gd-keys">
          <Button size="sm">Back</Button>
          <Button kind="primary" size="sm">Next</Button>
        </span>
      </div>
    </div>
  );
}

function PointerLamp({ step }: { step: (typeof steps)[number] }) {
  return (
    <div className="gd-pointer" role="dialog" aria-label={`Guide: ${step.title}`}>
      <p className="gd-count">{step.n} of {steps.length}</p>
      <p className="gd-title">{step.title}</p>
      <p className="gd-line">{step.line}</p>
      <div className="gd-foot">
        <Button kind="primary" size="sm">Next</Button>
        <button type="button" className="gd-skip"><kbd>Esc</kbd> Skip the guide</button>
      </div>
    </div>
  );
}

/** The Callout rail: the steps by number, the current one open. As a checklist, the numbers become checks. */
function Rail({ current, checklist }: { current?: number; checklist?: boolean }) {
  const items = checklist
    ? firstSteps.map((s, i) => ({ n: i + 1, title: s.label, line: undefined as string | undefined, done: s.done, action: 'action' in s ? s.action : undefined }))
    : steps.map((s) => ({ n: s.n, title: s.title, line: s.line as string | undefined, done: s.n < (current ?? 0), action: undefined }));
  const done = items.filter((i) => i.done).length;
  const next = checklist ? items.find((i) => !i.done)?.n : current;
  return (
    <aside className="gd-rail" aria-label="Getting started">
      <div className="gd-strip">
        <span>{checklist ? 'First steps' : 'Guide'}</span>
        <span>{checklist ? `${done} of ${items.length} done` : `${current} of ${items.length}`}</span>
      </div>
      <ol className="gd-list">
        {items.map((i) => (
          <li key={i.n} className="gd-item" data-done={i.done || undefined} data-current={i.n === next || undefined}>
            <span className="gd-num" aria-hidden="true">{i.done ? <Icon name="check" size={12} /> : i.n}</span>
            <span className="gd-item-text">
              <span className="gd-item-title">{i.title}{i.done ? <span className="gd-sr">, done</span> : null}</span>
              {i.n === next && i.line ? <span className="gd-line">{i.line}</span> : null}
              {i.n === next && i.action ? <Button size="sm">{i.action}</Button> : null}
            </span>
          </li>
        ))}
      </ol>
      <div className="gd-foot">
        {checklist ? <button type="button" className="gd-skip">Hide for now</button> : <button type="button" className="gd-skip">Skip the guide</button>}
        {checklist ? null : <Button kind="primary" size="sm">Next</Button>}
      </div>
    </aside>
  );
}

const pointerNotes: Notes = {
  today: "The app bar's first-run hint, or a Tip left open: one line and Got it. No count, no Back, no way to see the rest.",
  note: 'A solid square note joined to the part by one short line. A mono strip says where you are; Back, Next and Skip sit on a ruled footer. The page stays as it is.',
  lamp: 'The page dims and the one part stays lit, square. The words sit on the dim under a rule, with no box, and Esc skips.',
  callout: 'Numbers sit on each part the guide covers; the lit one is the current step. The rail on the right lists them, the current one open.',
};

/** Step 2 of 3: the guide points at Filter. */
export const Pointer: Story = {
  name: 'Pointer: one part at a time',
  render: () => (
    <Board part="Pointer: one part at a time" summary="Step 2 of 3 of an app's first-run guide, pointing at Filter. One part, one line, and always a way out." notes={pointerNotes}>
      {(d) => {
        const step = steps[1];
        if (d === 'callout') return <AppScreen d={d} lit="filter" rail={<Rail current={2} />} />;
        return (
          <AppScreen d={d} lit="filter">
            {() => (d === 'today' ? <PointerToday /> : d === 'note' ? <PointerNote step={step} /> : <PointerLamp step={step} />)}
          </AppScreen>
        );
      }}
    </Board>
  ),
};

/* ---- The checklist ---- */

function ChecklistToday() {
  return (
    <div className="gd-start">
      <p className="gd-plain">Nothing in the kit today: each app writes its own welcome, or none.</p>
    </div>
  );
}

function ChecklistNote() {
  const done = firstSteps.filter((s) => s.done).length;
  return (
    <aside className="gd-panel" aria-label="First steps">
      <div className="gd-strip">
        <span>First steps</span>
        <span>{done} of {firstSteps.length} done</span>
      </div>
      <ul className="gd-list">
        {firstSteps.map((s) => (
          <li key={s.label} className="gd-item" data-done={s.done || undefined}>
            <span className="gd-check" aria-hidden="true">{s.done ? <Icon name="check" size={12} /> : null}</span>
            <span className="gd-item-title">{s.label}{s.done ? <span className="gd-sr">, done</span> : null}</span>
            {s === nextStep && 'action' in s ? <Button size="sm">{s.action}</Button> : null}
          </li>
        ))}
      </ul>
      <div className="gd-foot">
        <button type="button" className="gd-skip">Hide for now</button>
      </div>
    </aside>
  );
}

function ChecklistLamp() {
  const done = firstSteps.filter((s) => s.done).length;
  return (
    <section className="gd-start" aria-label="First steps">
      <div className="gd-section-head">
        <span>First steps</span>
        <span>{done} of {firstSteps.length} done</span>
      </div>
      <ul className="gd-list">
        {firstSteps.map((s) => (
          <li key={s.label} className="gd-item" data-done={s.done || undefined}>
            <span className="gd-check" aria-hidden="true">{s.done ? <Icon name="check" size={12} /> : null}</span>
            <span className="gd-item-title">{s.label}{s.done ? <span className="gd-sr">, done</span> : null}</span>
            {s === nextStep && 'action' in s ? <Button size="sm">{s.action}</Button> : null}
          </li>
        ))}
      </ul>
      <button type="button" className="gd-skip">Hide for now</button>
    </section>
  );
}

const checklistNotes: Notes = {
  today: 'No part for it: the app bar hint covers the shell only.',
  note: 'A Sheet panel in the bottom corner, over the page: the count in its strip, checks for what is done, and the next one carries its action. Hide for now puts it away.',
  lamp: "Not over anything: a section at the top of the app's own start page, label and hairline, so it goes when the page is put to work.",
  callout: 'The same rail as the pointer: done steps turn their numbers into checks, and the next one opens with its action.',
};

/** Two of four first steps done. */
export const Checklist: Story = {
  name: 'Checklist: first steps',
  render: () => (
    <Board part="Checklist: first steps" summary="Four first things to do in a new app, two done. The count is words, not a bar, and it can be hidden." notes={checklistNotes}>
      {(d) =>
        d === 'today' ? (
          <AppScreen d={d} start={<ChecklistToday />} />
        ) : d === 'note' ? (
          <AppScreen d={d} rail={<ChecklistNote />} />
        ) : d === 'lamp' ? (
          <AppScreen d={d} start={<ChecklistLamp />} />
        ) : (
          <AppScreen d={d} rail={<Rail checklist />} />
        )
      }
    </Board>
  ),
};
