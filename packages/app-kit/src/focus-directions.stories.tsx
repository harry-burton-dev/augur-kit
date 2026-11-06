import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { Button, Explain, Icon, Toggle } from '@augur/kit-common';
import './focus-directions.stories.css';

/**
 * Round P directions: depth and focus (FocusStage), the letterbox, Explain and Reason, each drawn three
 * original ways beside today's, to pick per part. All three keep Harry's depth principle (PDR-010: the
 * layout stays where it is, focus moves, the more planes in front the further back the work goes, never a
 * black scrim) with PDR-015's change: depth is dimming only, no blur. The letterbox keeps its cinema frame.
 * Scoped styles only: no part changes until a pick.
 */

type Dir = 'today' | 'a' | 'b' | 'c';

const DIRS: { id: Dir; name: string; idea: string; prior: string }[] = [
  { id: 'today', name: 'Today', idea: 'Blur, desaturate and shrink the work; four planes.', prior: 'What is on main now (blur goes under PDR-015).' },
  { id: 'a', name: 'A · Dusk', idea: 'The work loses light and colour, one even step per plane in front. Nothing is drawn on top.', prior: 'Nearest prior art: house lights going down in a theatre.' },
  { id: 'b', name: 'B · Rule', idea: 'The work dims once, the same amount always. How many planes stand in front is counted by hairlines across the top: the line as structure.', prior: 'Nearest prior art: the edges of a stack of sheets seen from above.' },
  { id: 'c', name: 'C · Iris', idea: 'Dark comes in as hard bands from the screen edges; each plane closes them further, the middle stays lit. The letterbox is the iris at its tightest.', prior: 'Nearest prior art: a camera iris, or a stage spot closing in.' },
];

function Cell({ dir, children, note, prior }: { dir: Dir; children: ReactNode; note?: string; prior?: string }) {
  const d = DIRS.find((x) => x.id === dir)!;
  return (
    <section className="fx-cell" data-dir={dir}>
      <header className="fx-cell-head">
        <h2 className="fx-cell-name">{d.name}</h2>
        <p className="fx-cell-idea">{note ?? d.idea}</p>
        <p className="fx-cell-prior">{prior ?? d.prior}</p>
      </header>
      {children}
    </section>
  );
}

const ROWS = ['Security standard, v4', 'Leave policy', 'Weekly update, 2 Nov', 'Supplier code of conduct', 'Travel and expenses'];

/** A small app's work plane: a rail, a page head and a few rows. */
function Work() {
  return (
    <div className="fx-work">
      <div className="fx-rail">
        {['home', 'library', 'people', 'settings'].map((n) => (
          <Icon key={n} name={n as 'home'} size={16} />
        ))}
      </div>
      <div className="fx-page">
        <p className="fx-eyebrow">Library</p>
        <p className="fx-heading">Policy and guidance</p>
        <ul className="fx-rows">
          {ROWS.map((r) => (
            <li key={r}>
              <span>{r}</span>
              <span className="fx-meta">Edited 3 days ago</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** One mini screen: the work, and the surfaces standing in front of it. */
function Screen({ dir, planes }: { dir: Dir; planes: 0 | 1 | 2 }) {
  return (
    <div className="fx-screen" data-dir={dir} data-planes={planes}>
      <div className="fx-plane fx-plane-work">
        <Work />
      </div>
      {dir === 'b' && planes > 0 && (
        <div className="fx-count" role="img" aria-label={`${planes} in front of the work`}>
          {Array.from({ length: planes }, (_, i) => (
            <span key={i} />
          ))}
        </div>
      )}
      {dir === 'c' && <div className="fx-iris" aria-hidden />}
      {planes >= 1 && (
        <div className="fx-sheet fx-plane-active" data-behind={planes === 2 || undefined}>
          <p className="fx-sheet-eyebrow">Move</p>
          <p className="fx-sheet-heading">Move 3 documents</p>
          <p className="fx-sheet-text">To Team library. 8 people can read them there.</p>
        </div>
      )}
      {planes === 2 && (
        <div className="fx-sheet fx-plane-decision">
          <p className="fx-sheet-eyebrow">Decision</p>
          <p className="fx-sheet-heading">Replace the copies there?</p>
        </div>
      )}
    </div>
  );
}

function DepthPage({ planes }: { planes: 0 | 1 | 2 }) {
  return (
    <div className="fx-page-grid">
      {DIRS.map((d) => (
        <Cell key={d.id} dir={d.id}>
          <Screen dir={d.id} planes={planes} />
        </Cell>
      ))}
    </div>
  );
}

const meta = {
  title: 'Quill/Focus and explain directions',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;

/** FocusStage: how the work steps back. Set `planes` to 0, 1 (a surface in front) or 2 (a decision stacked on it). */
export const Depth: StoryObj<{ planes: 0 | 1 | 2 }> = {
  render: (args) => <DepthPage {...args} />,
  args: { planes: 2 },
  argTypes: { planes: { control: 'inline-radio', options: [0, 1, 2] } },
};

/** The letterbox for something urgent, in each direction. The cinema frame stays; only the depth around it and its bars change. */
function LetterboxScreen({ dir }: { dir: Dir }) {
  return (
    <div className="fx-screen fx-lb" data-dir={dir}>
      <div className="fx-plane fx-plane-work">
        <Work />
      </div>
      <div className="fx-lb-bar" data-edge="top">
        <span>Upgrade · Floor 2 · Release watch</span>
        <span className="fx-lb-queue">1 of 2 · next: Backups are failing</span>
      </div>
      <div className="fx-lb-frame">
        <div className="fx-lb-body">
          <p className="fx-sheet-heading">The upgrade to 0.14.0 failed its health watch</p>
          <p className="fx-sheet-text">Three of five sites are back on 0.13.2. Two are still on 0.14.0 and failing their checks.</p>
          <div className="fx-lb-actions">
            <Button kind="primary" size="sm">Roll back the two</Button>
            <Button kind="secondary" size="sm">Open the watch</Button>
          </div>
        </div>
      </div>
      <div className="fx-lb-bar" data-edge="bottom">
        <span>Seen by nobody yet</span>
        <span>Resolves when every site passes</span>
      </div>
    </div>
  );
}

export const Letterbox: StoryObj = {
  render: () => (
    <div className="fx-page-grid">
      {DIRS.map((d) => (
        <Cell
          key={d.id}
          dir={d.id}
          note={
            {
              today: 'Blurred, darkened halves above and below a solid frame.',
              a: 'The work goes nearly dark; the frame is one solid sheet band. The bars print straight onto the dimmed work, in mono.',
              b: 'The work dims one step, still readable. Two full-width rules bound the frame, and the bars are labels sitting on those rules.',
              c: 'Solid bars close in from the top and bottom edges, as a cinema screen masks down. Nothing of the work shows above or below.',
            }[d.id]
          }
          prior={
            {
              today: 'What is on main now (blur goes under PDR-015).',
              a: 'Nearest prior art: house lights down, one lit band on stage.',
              b: 'Nearest prior art: the frame guides ruled on a camera viewfinder.',
              c: "Nearest prior art: a cinema's masking closing to a wide picture.",
            }[d.id]
          }
        >
          <LetterboxScreen dir={d.id} />
        </Cell>
      ))}
    </div>
  ),
};

const WHAT = {
  what: 'The upgrade to 0.14.0 failed its health watch.',
  why: 'Two of your sites are serving errors to about 40 people.',
  canDo: 'Roll the two back to 0.13.2, or open the watch to see why.',
  whoElse: 'Lee Park can also roll back. Nobody else is on call.',
};

const PARTS = [
  ['what', 'What happened'],
  ['why', 'Why it matters'],
  ['canDo', 'What you can do'],
  ['whoElse', 'Who else can act'],
] as const;

function Parts({ only }: { only?: readonly (keyof typeof WHAT)[] }) {
  return (
    <dl className="fx-ex">
      {PARTS.filter(([k]) => !only || only.includes(k)).map(([k, label]) => (
        <div key={k} className="fx-ex-part">
          <dt className="fx-ex-label">{label}</dt>
          <dd className="fx-ex-text">{WHAT[k]}</dd>
        </div>
      ))}
    </dl>
  );
}

function ExplainFold() {
  const [open, setOpen] = useState(false);
  return (
    <ul className="fx-ex-list">
      <li>Leave policy</li>
      <li className="fx-ex-item">
        <span className="fx-ex-item-name">Upgrade to 0.14.0</span>
        <Parts only={['what', 'why']} />
        <button type="button" className="fx-ex-fold" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? 'Less' : '2 more · what you can do, who else'}
        </button>
        {open && <Parts only={['canDo', 'whoElse']} />}
      </li>
      <li>Weekly update, 2 Nov</li>
    </ul>
  );
}

export const ExplainPlacement: StoryObj = {
  name: 'Explain',
  render: () => (
    <div className="fx-page-grid fx-ex-grid">
      <Cell dir="today" note="Four labelled parts in a two by two grid, used in the letterbox.">
        <div className="fx-ex-stage">
          <Explain {...WHAT} />
        </div>
      </Cell>
      <Cell dir="a" prior="Nearest prior art: a printed incident log, labels down the margin." note="In the frame. A mono label column and the sentences beside it, read top to bottom like a form. All four always show.">
        <div className="fx-ex-stage fx-ex-sheet">
          <Parts />
        </div>
      </Cell>
      <Cell dir="b" prior="Nearest prior art: a reading pane beside a list." note="Beside the item. Pick a row and its explanation stands in a column to its right, each label on its own hairline. All four always show.">
        <div className="fx-ex-stage fx-ex-split">
          <ul className="fx-ex-list">
            <li>Leave policy</li>
            <li data-picked>Upgrade to 0.14.0</li>
            <li>Weekly update, 2 Nov</li>
          </ul>
          <div className="fx-ex-side">
            <Parts />
          </div>
        </div>
      </Cell>
      <Cell dir="c" prior="Nearest prior art: a footnote you open in place." note="Under the row, in the list. What and why show; what you can do and who else fold open (press the line). Breaks today's rule that all four always show.">
        <div className="fx-ex-stage">
          <ExplainFold />
        </div>
      </Cell>
    </div>
  ),
};

function Controls() {
  return (
    <div className="fx-rs-row">
      <Button kind="secondary">Share</Button>
      <Button kind="primary" disabled reason="Only the policy owner can publish to the organisation.">
        Publish
      </Button>
      <Toggle label="Keep for 7 years" disabled reason="Your organisation's retention rule sets this." defaultChecked />
    </div>
  );
}

export const Reason: StoryObj = {
  render: () => (
    <div className="fx-page-grid">
      <Cell dir="today" note="A raised tip under the control, on hover and focus. Blurs what is behind it.">
        <div className="fx-rs-stage">
          <Controls />
        </div>
      </Cell>
      <Cell dir="a" prior="Nearest prior art: a tooltip, made solid and square." note="On hover and focus, as today, but a solid Sheet tip with a hard edge and no blur. Point at Publish or the toggle.">
        <div className="fx-rs-stage">
          <Controls />
        </div>
      </Cell>
      <Cell dir="b" prior="Nearest prior art: the small print engraved under a switch on an equipment panel." note="Always shown. The reason sits under the off control in mono small print, after a short rule, so nobody has to hunt for it.">
        <div className="fx-rs-stage">
          <Controls />
        </div>
      </Cell>
      <Cell dir="c" prior="Nearest prior art: a lock mark beside a locked setting." note="A mark always shows beside an off control; the sentence opens on hover, focus or press. Quiet until asked, but you can see something is off and why is one step away.">
        <div className="fx-rs-stage">
          <div className="fx-rs-row">
            <Button kind="secondary">Share</Button>
            <span className="fx-rs-marked">
              <Button kind="primary" disabled reason="Only the policy owner can publish to the organisation.">
                Publish
              </Button>
              <Icon name="lock" size={14} />
            </span>
            <span className="fx-rs-marked">
              <Toggle label="Keep for 7 years" disabled reason="Your organisation's retention rule sets this." defaultChecked />
              <Icon name="lock" size={14} />
            </span>
          </div>
        </div>
      </Cell>
    </div>
  ),
};
