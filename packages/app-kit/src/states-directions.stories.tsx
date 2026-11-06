import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Button, Icon, Progress } from '@augur/kit-common';
import { Facts, Rows, State } from './states.js';
import './states-directions.stories.css';

/**
 * Directions for the states round (6 Nov 2026): what a region says when it is empty, still loading, or
 * failed. Each page puts today's parts beside three ways to draw them, to pick one:
 *
 * - **A · Well** takes the Well field: an empty region is an empty slot, sunk into the page. Loading
 *   fills the slot with a light key; a skeleton is shallow wells where the words will be.
 *   Nearest prior art: the dashed "drop here" zone of uploaders, but sunk, not dashed.
 * - **B · Horizon** takes the still horizon and the line as structure: no boxes. The sentence sits on a
 *   groove; loading is the line drawing across; a skeleton is the rules of the rows with short stubs
 *   where the words go; an error breaks the line. Nearest prior art: the thin loading bar along the top
 *   of a page (NProgress), used here in place, not at the page edge.
 * - **C · Readout** takes the Sheet and the mono labels: a region reads like an instrument. A mono
 *   heading says what and how many ("RECORDS · 0"); a value not yet known reads as dashes; progress is
 *   a row of cells; an error is a hard red edge, like the menu's line where you are.
 *   Nearest prior art: control-room displays (ISA-101), where a missing reading shows as dashes.
 *
 * All three are flat greys with hairlines, with no blur and no colour of their own: green still means
 * only "needs you" (today's progress bar and the State action's underline are green, and that goes in
 * every direction), and red means only that something failed. Loading waits 300ms before it shows, so a
 * quick load doesn't flash. With reduced motion, nothing moves: a skeleton is still and a running bar
 * holds. Once one is picked it moves into the parts (State, Progress, Facts, Rows, the skeletons) and
 * this page goes.
 */
const meta = {
  title: 'Quill/State directions',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const directions = [
  { id: 'today', name: 'Today', summary: 'What ships now, for reference.' },
  { id: 'well', name: 'A · Well', summary: 'The Well field: an empty region is an empty slot; loading fills it with a light key.' },
  { id: 'horizon', name: 'B · Horizon', summary: 'No boxes: the sentence sits on a groove, loading draws the line, an error breaks it.' },
  { id: 'readout', name: 'C · Readout', summary: 'The Sheet and mono labels: reads like an instrument, dashes until a value is known.' },
] as const;
type DirectionId = (typeof directions)[number]['id'];

function Board({ part, summary, children }: { part: string; summary: string; children: (d: DirectionId) => ReactNode }) {
  return (
    <div className="st-stage">
      <header className="st-head">
        <h2 className="st-part">{part}</h2>
        <p className="st-summary">{summary}</p>
      </header>
      <div className="st-grid">
        {directions.map((d) => (
          <section key={d.id} className="st-column" data-direction={d.id} aria-label={`${part}: ${d.name}`}>
            <h3 className="st-name">{d.name}</h3>
            <p className="st-note">{d.summary}</p>
            <div className="st-specimens">{children(d.id)}</div>
          </section>
        ))}
      </div>
    </div>
  );
}

function Specimen({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="st-specimen">
      <p className="st-label">{label}</p>
      {children}
    </div>
  );
}

/* ---- One drawing of a state, styled per direction. ---- */

interface Said {
  kind: 'empty' | 'error';
  /** The mono readout over it (Readout only): what, and how many or why. */
  readout: string;
  heading: string;
  body?: string;
  action?: string;
  line?: boolean;
}

function Drawn({ kind, readout, heading, body, action, line }: Said) {
  return (
    <div className="st-state" data-kind={kind} data-size={line ? 'line' : 'region'} role={kind === 'error' ? 'alert' : 'status'}>
      <p className="st-readout">{readout}</p>
      <p className="st-title">
        {kind === 'error' ? (
          <span className="st-mark" aria-hidden="true">
            <Icon name="error" size={14} />
          </span>
        ) : null}
        <span>{heading}</span>
      </p>
      {body ? <p className="st-body">{body}</p> : null}
      {action ? (
        <span className="st-action">
          <Button size="sm" kind={kind === 'error' ? 'secondary' : 'tertiary'}>
            {action}
          </Button>
        </span>
      ) : null}
    </div>
  );
}

/** Today's part, or the direction's drawing of the same words. */
function Region({ d, said }: { d: DirectionId; said: Said }) {
  if (d === 'today') return <State kind={said.kind} heading={said.heading} body={said.body} action={said.action} size={said.line ? 'line' : 'region'} />;
  return <Drawn {...said} />;
}

/* ---- Empty ---- */

export const Empty: Story = {
  render: () => (
    <Board part="Empty" summary="Nothing here yet, nothing matches, and a quiet line inside a tile. One sentence, a line more if it helps, at most one thing to do.">
      {(d) => (
        <>
          <Specimen label="First use, a whole region">
            <Region
              d={d}
              said={{ kind: 'empty', readout: 'Records · 0', heading: 'No records yet', body: 'Records you add to this collection show here, newest first.', action: 'Add a record' }}
            />
          </Specimen>
          <Specimen label="Nothing matches a filter">
            <Region d={d} said={{ kind: 'empty', readout: 'Records · 0 of 48', heading: 'Nothing matches Open, this week', action: 'Clear the filter' }} />
          </Specimen>
          <Specimen label="Inside a tile, one line">
            <Region d={d} said={{ kind: 'empty', readout: 'Runs today · 0', heading: 'No runs today.', line: true }} />
          </Specimen>
        </>
      )}
    </Board>
  ),
};

/* ---- Loading ---- */

function Spin({ d, label }: { d: DirectionId; label: string }) {
  return (
    <span className="st-inline" role="status">
      {d === 'today' ? (
        <span className="augur-spinner" aria-hidden="true" />
      ) : (
        <span className="st-spin" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      )}
      <span>{label}</span>
    </span>
  );
}

function Bar({ d, label, value, valueText }: { d: DirectionId; label: string; value?: number; valueText?: string }) {
  if (d === 'today') return <Progress label={label} value={value} valueText={valueText} />;
  const known = value != null;
  const cells = 10;
  return (
    <div
      className="st-progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={known ? 0 : undefined}
      aria-valuemax={known ? 100 : undefined}
      aria-valuenow={known ? value : undefined}
      aria-valuetext={valueText}
      data-indeterminate={known ? undefined : ''}
    >
      <span className="st-progress-head">
        <span>{label}</span>
        {known ? <span className="st-progress-value">{valueText ?? `${value}%`}</span> : null}
      </span>
      {d === 'readout' ? (
        <span className="st-cells">
          {Array.from({ length: cells }, (_, i) => (
            <i key={i} data-on={known && i < Math.round((value / 100) * cells) ? '' : undefined} />
          ))}
        </span>
      ) : (
        <span className="st-track">
          <i style={known ? { width: `${value}%` } : undefined} />
        </span>
      )}
    </div>
  );
}

function SkeletonRows({ d }: { d: DirectionId }) {
  if (d === 'today') return <Rows loading count={3} />;
  return (
    <ul className="st-skel-rows" aria-busy="true" aria-label="Loading details">
      {['Owner', 'Updated', 'Size'].map((label) => (
        <li key={label}>
          {d === 'readout' ? <span className="st-skel-label">{label}</span> : <span className="st-skel" data-w="long" />}
          {d === 'readout' ? <span className="st-dashes">– –</span> : <span className="st-skel" data-w="short" />}
        </li>
      ))}
    </ul>
  );
}

function SkeletonFacts({ d }: { d: DirectionId }) {
  if (d === 'today') return <Facts loading count={3} />;
  return (
    <dl className="st-skel-facts" aria-busy="true" aria-label="Loading figures">
      {['Records', 'Since last', 'Read'].map((label) => (
        <div key={label}>
          <dt>{d === 'readout' ? label : <span className="st-skel" data-w="label" />}</dt>
          <dd>{d === 'readout' ? <span className="st-dashes">– –</span> : <span className="st-skel" data-w="value" />}</dd>
        </div>
      ))}
    </dl>
  );
}

export const Loading: Story = {
  render: () => (
    <Board
      part="Loading"
      summary="A wait inside a line, progress known and not, and skeletons while a region's shape is known but its words aren't. Nothing shows for the first 300ms."
    >
      {(d) => (
        <>
          <Specimen label="Inline, beside a button">
            <div className="st-row">
              <Button size="sm" busy busyLabel="Saving">
                Save
              </Button>
              <Spin d={d} label="Loading records" />
            </div>
          </Specimen>
          <Specimen label="Progress, known and not">
            <Bar d={d} label="Uploading 3 files" value={40} valueText="2 of 3" />
            <Bar d={d} label="Checking the library" />
          </Specimen>
          <Specimen label="Skeletons: figures and details">
            <SkeletonFacts d={d} />
            <SkeletonRows d={d} />
          </Specimen>
        </>
      )}
    </Board>
  ),
};

/* ---- Errors ---- */

function Partial({ d }: { d: DirectionId }) {
  const rows = [
    { label: 'Coast watch', value: 'Done' },
    { label: 'Port arrivals', value: 'Running' },
  ];
  if (d === 'today')
    return (
      <>
        <Rows items={rows} />
        {/* Rows' own error line puts role="alert" on an <li>, which axe refuses; the build fixes that. */}
        <State kind="error" heading="3 more couldn’t load." action="Try again" size="line" />
      </>
    );
  return (
    <div className="st-partial">
      <ul className="st-rows">
        {rows.map((r) => (
          <li key={r.label}>
            <span>{r.label}</span>
            <span>{r.value}</span>
          </li>
        ))}
      </ul>
      <Drawn kind="error" readout="3 not loaded · timeout" heading="3 more couldn’t load." action="Try again" line />
    </div>
  );
}

export const Errors: Story = {
  render: () => (
    <Board
      part="Errors"
      summary="A region that failed, a line in a tile, and a list where some came and some didn't. Say what failed and why if known, keep what did load, and offer one way on."
    >
      {(d) => (
        <>
          <Specimen label="A whole region failed">
            <Region
              d={d}
              said={{ kind: 'error', readout: 'Records · failed · 504', heading: 'Couldn’t load the records', body: 'The library didn’t answer in time. Nothing was changed.', action: 'Try again' }}
            />
          </Specimen>
          <Specimen label="Inside a tile, one line">
            <Region d={d} said={{ kind: 'error', readout: 'Runs today · failed', heading: 'Couldn’t load today’s runs.', action: 'Try again', line: true }} />
          </Specimen>
          <Specimen label="Some loaded, some didn't">
            <Partial d={d} />
          </Specimen>
        </>
      )}
    </Board>
  ),
};
