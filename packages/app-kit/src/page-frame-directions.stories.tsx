import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Icon, type IconName } from '@augur/kit-common';
import './page-frame-directions.stories.css';

/*
 * Round L: three directions for the page frame (AppFrame with its rail and drawer, PageHead, Section,
 * FrontPage, About, More and SelectionBar). Drawings only, in scoped CSS: no part changes until a
 * direction is picked. Every page draws the same record, MV Halden in a Fleet app, so only the look
 * changes between them.
 *
 * What Harry set before drawing: judge it on one record you read and act on; the rail carries the app
 * bar's tiles and line down the left; the drawer holds whatever needn't be on the page and opens itself
 * on a selection; the title and the main action sit in fixed slots, and a link that brings you in leaves
 * one arrival line that shrinks to a Back key (PDR-014: no breadcrumbs).
 */

type Dir = 'line' | 'bench' | 'folio';
const DIRS: { id: Dir; letter: string; name: string; from: string }[] = [
  { id: 'line', letter: 'A', name: 'Line', from: 'Nearest prior art: a surveyor’s level line. One horizon runs across rail, page and drawer at the foot of the head; everything hangs from it, nothing is boxed.' },
  { id: 'bench', letter: 'B', name: 'Bench', from: 'Nearest prior art: a workbench and its tray. The page is the bench; the rail and the drawer are wells set into it, and what you’re on is raised as a key.' },
  { id: 'folio', letter: 'C', name: 'Folio', from: 'Nearest prior art: a case file. The record is a sheet with a stamped label; the drawer is the next sheet laid beside it, and sections are ruled like a ledger.' },
];

/* ---------- Content: one Fleet app, one vessel ---------- */

const PAGES: { name: string; icon: IconName; count?: number }[] = [
  { name: 'Overview', icon: 'home' },
  { name: 'Vessels', icon: 'vessel' },
  { name: 'Voyages', icon: 'compass', count: 1 },
  { name: 'Ports', icon: 'port' },
  { name: 'Crew', icon: 'people' },
];

const VOYAGE: [string, string][] = [
  ['Route', 'Halden to Brekke'],
  ['Due', 'Thursday 14:00'],
  ['Cargo', 'Timber, 4,200 t'],
];

const CREW: { name: string; role: string; watch: string }[] = [
  { name: 'Priya Shah', role: 'Master', watch: 'Day' },
  { name: 'Lee Okafor', role: 'Chief officer', watch: '04–08' },
  { name: 'Sam Ito', role: 'Engineer', watch: '08–12' },
  { name: 'Ana Ruiz', role: 'Deckhand', watch: '12–16' },
];

type Picked = 'none' | 'one' | 'several';
type Arrival = 'fresh' | 'read' | 'none';
type SelectAt = 'foot' | 'head';
type Drawer = 'about' | 'picked';
type View = 'record' | 'front-sentence' | 'front-waiting';

interface FrameProps {
  dir: Dir;
  view?: View;
  picked?: Picked;
  arrival?: Arrival;
  selectAt?: SelectAt;
  drawer?: Drawer;
}

/* ---------- The rail: the app bar's tiles, docked down the left ---------- */

function Rail({ current }: { current: string }) {
  return (
    <div className="pf-rail">
      <div className="pf-rail-fixed">
        <span className="pf-tile pf-tile-app">
          <Icon name="vessel" size={20} />
          <span>Fleet</span>
        </span>
      </div>
      <ul className="pf-rail-pages">
        {PAGES.map((p) => (
          <li key={p.name}>
            <a href="#" className="pf-tile" aria-current={p.name === current ? 'page' : undefined} onClick={(e) => e.preventDefault()}>
              <Icon name={p.icon} size={20} />
              <span>{p.name}</span>
              {p.count ? (
                <span className="pf-tile-count" aria-label={`${p.count} needs you`}>
                  {p.count}
                </span>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- The head: two fixed slots, and the arrival line ---------- */

function Head({ kind, title, summary, action, arrival = 'none', selection }: { kind: string; title: string; summary?: string; action: string; arrival?: Arrival; selection?: ReactNode }) {
  return (
    <header className="pf-head">
      <div className="pf-head-title">
        <span className="pf-kind">{kind}</span>
        <h2>{title}</h2>
        {summary ? <p className="pf-summary">{summary}</p> : null}
        {arrival === 'fresh' ? (
          <p className="pf-arrival">
            <Icon name="link" size={14} />
            <span>
              You came here from <b>Night roster</b>, where Halden’s crew is short a watch.
            </span>
            <a href="#" onClick={(e) => e.preventDefault()}>
              Back
            </a>
          </p>
        ) : null}
      </div>
      <div className="pf-head-slot">
        {selection ?? (
          <>
            {arrival === 'read' ? (
              <button type="button" className="pf-back">
                <Icon name="back" size={14} /> Night roster
              </button>
            ) : null}
            <button type="button" className="pf-key">
              {action}
            </button>
            <button type="button" className="pf-icon-key" aria-label="More actions">
              <Icon name="more" size={16} />
            </button>
          </>
        )}
      </div>
    </header>
  );
}

function Section({ no, label, count, children }: { no: string; label: string; count?: string; children: ReactNode }) {
  return (
    <section className="pf-section">
      <h3 className="pf-section-head">
        <span className="pf-section-no">{no}</span>
        <span className="pf-section-label">{label}</span>
        {count ? <span className="pf-section-count">{count}</span> : null}
      </h3>
      <div className="pf-section-body">{children}</div>
    </section>
  );
}

function SelectionBar({ at }: { at: SelectAt }) {
  return (
    <div className="pf-selection" data-at={at} role="status">
      <span className="pf-selection-count">
        <b>2</b> crew picked
      </span>
      <button type="button" className="pf-key">
        Swap watch
      </button>
      <button type="button" className="pf-key pf-key-quiet">
        Move to vessel
      </button>
      <button type="button" className="pf-icon-key" aria-label="Clear the selection">
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}

/* ---------- The drawer: About the record, or the thing you picked ---------- */

function DrawerAbout() {
  const rows: [string, string][] = [
    ['What it is', 'General cargo vessel, built 2011'],
    ['Who owns it', 'North Sea operations'],
    ['Floor', 'Ops team'],
    ['Where it is in its life', 'In service'],
    ['Links', 'Halden port call, Night roster'],
    ['History', 'Changed course 2 h ago, by Priya'],
  ];
  return (
    <>
      <span className="pf-kind">About</span>
      <h3 className="pf-drawer-title">MV Halden</h3>
      <dl className="pf-about">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

function DrawerPicked() {
  return (
    <>
      <span className="pf-kind">Crew · picked</span>
      <h3 className="pf-drawer-title">Lee Okafor</h3>
      <p className="pf-muted">Chief officer, on board since 2 October</p>
      <dl className="pf-about">
        <div>
          <dt>Watch</dt>
          <dd>04–08</dd>
        </div>
        <div>
          <dt>Certificate</dt>
          <dd>STCW II/2, valid to March 2028</dd>
        </div>
      </dl>
      <div className="pf-why">
        <span className="pf-kind">Why you’re seeing this</span>
        <p>Lee is on watch when Halden enters Brekke, and the port asks for a named officer on the bridge.</p>
      </div>
      <div className="pf-drawer-actions">
        <button type="button" className="pf-key">
          Swap watch
        </button>
        <button type="button" className="pf-key pf-key-quiet">
          Message
        </button>
      </div>
    </>
  );
}

/* ---------- The record page ---------- */

function Record({ picked = 'one', arrival = 'fresh', selectAt = 'foot' }: Pick<FrameProps, 'picked' | 'arrival' | 'selectAt'>) {
  const several = picked === 'several';
  return (
    <>
      <Head
        kind="Vessel · IMO 9312345"
        title="MV Halden"
        summary="Under way in the North Sea, 38 nm from Brekke."
        action="Plan voyage"
        arrival={arrival}
        selection={several && selectAt === 'head' ? <SelectionBar at="head" /> : undefined}
      />
      <div className="pf-body">
        <Section no="01" label="Voyage">
          <dl className="pf-rows">
            {VOYAGE.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </Section>
        <Section no="02" label="Crew" count="4 of 12">
          <ul className="pf-list">
            {CREW.map((c, i) => {
              const on = picked === 'one' ? i === 1 : several ? i >= 2 : false;
              return (
                <li key={c.name} className="pf-row" data-picked={on ? '' : undefined}>
                  {several ? <span className="pf-check" data-on={on ? '' : undefined} aria-hidden="true" /> : null}
                  <span className="pf-grow">{c.name}</span>
                  <span className="pf-muted">{c.role}</span>
                  <span className="pf-mono">{c.watch}</span>
                </li>
              );
            })}
          </ul>
          <div className="pf-more" role="status">
            <span>Showing 4 of 12 crew</span>
            <button type="button" className="pf-key pf-key-quiet pf-key-sm">
              Show 8 more
            </button>
          </div>
        </Section>
      </div>
      {several && selectAt === 'foot' ? <SelectionBar at="foot" /> : null}
    </>
  );
}

/* ---------- The front page: what changed, or what waits ---------- */

function Front({ view }: { view: View }) {
  if (view === 'front-sentence') {
    return (
      <>
        <Head kind="Fleet · since Tuesday" title="Two vessels changed course, and one voyage waits for you." action="New voyage" />
        <div className="pf-body">
          <Section no="01" label="What changed">
            <ul className="pf-list">
              <li className="pf-row">
                <span className="pf-grow">MV Halden turned for Brekke</span>
                <span className="pf-muted">Priya · 2 h</span>
              </li>
              <li className="pf-row">
                <span className="pf-grow">MV Tor holds at Baltic anchorage</span>
                <span className="pf-muted">Lee · 5 h</span>
              </li>
              <li className="pf-row">
                <span className="pf-grow">
                  <span className="pf-needs" aria-hidden="true" />
                  Voyage 2214 needs your approval
                </span>
                <span className="pf-muted">Ops · 1 d</span>
              </li>
            </ul>
          </Section>
        </div>
      </>
    );
  }
  return (
    <>
      <Head kind="Fleet" title="Waiting for you" action="New voyage" />
      <div className="pf-body">
        <Section no="01" label="Needs you" count="3">
          <ul className="pf-list">
            {[
              ['Approve voyage 2214', 'Halden to Brekke · 1 d', 'Approve'],
              ['Name an officer for Brekke', 'Port asks by Thursday', 'Name'],
              ['Sign off Sam’s leave', 'People · 4 h', 'Sign off'],
            ].map(([t, m, a]) => (
              <li key={t} className="pf-row pf-row-wait">
                <span className="pf-needs" aria-hidden="true" />
                <span className="pf-grow">
                  {t}
                  <span className="pf-muted pf-sub">{m}</span>
                </span>
                <button type="button" className="pf-key pf-key-sm">
                  {a}
                </button>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </>
  );
}

/* ---------- The frame ---------- */

function Frame({ dir, view = 'record', picked = 'one', arrival = 'fresh', selectAt = 'foot', drawer }: FrameProps) {
  const front = view !== 'record';
  const showing: Drawer = drawer ?? (picked === 'one' ? 'picked' : 'about');
  return (
    <div className="pf-frame" data-dir={dir}>
      <Rail current={front ? 'Overview' : 'Vessels'} />
      <div className="pf-main">{front ? <Front view={view} /> : <Record picked={picked} arrival={arrival} selectAt={selectAt} />}</div>
      <div className="pf-drawer">
        <div className="pf-drawer-bar">
          <button type="button" className="pf-icon-key" aria-label="Fold the drawer">
            <Icon name="drawer-close" size={16} />
          </button>
        </div>
        <div className="pf-drawer-inner">{front ? <FrontDrawer /> : showing === 'picked' ? <DrawerPicked /> : <DrawerAbout />}</div>
      </div>
    </div>
  );
}

function FrontDrawer() {
  return (
    <>
      <span className="pf-kind">About</span>
      <h3 className="pf-drawer-title">Fleet</h3>
      <p className="pf-muted">Where North Sea operations plan voyages and crew. Kept by the Ops team.</p>
    </>
  );
}

/* ---------- Comparing: each direction in two states, drawn small ---------- */

function Compare({ left, right, state }: { left: string; right: string; state: (dir: Dir, side: 0 | 1) => FrameProps }) {
  return (
    <div className="pf-compare">
      <div className="pf-compare-row pf-compare-cols">
        <span />
        <span className="pf-compare-col">{left}</span>
        <span className="pf-compare-col">{right}</span>
      </div>
      {DIRS.map((d) => (
        <div key={d.id} className="pf-compare-row">
          <span className="pf-compare-dir">
            <span className="pf-letter">{d.letter}</span> {d.name}
          </span>
          {([0, 1] as const).map((side) => (
            <div key={side} className="pf-mini">
              <div className="pf-mini-inner">
                <Frame {...state(d.id, side)} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function One({ dir }: { dir: Dir }) {
  const d = DIRS.find((x) => x.id === dir)!;
  return (
    <div className="pf-one">
      <p className="pf-from">
        <span className="pf-letter">{d.letter}</span> <b>{d.name}</b>. {d.from}
      </p>
      <Frame dir={dir} />
    </div>
  );
}

/* ---------- Stories ---------- */

/**
 * Three directions for the page frame, all drawn on the same record: MV Halden, a vessel in a Fleet
 * app, with one crew member picked so the drawer has opened on its own.
 *
 * - **A · Line**: one horizon runs across the rail, the page and the drawer at the foot of the head.
 *   The current page is a hard line on the rail’s inner edge, as on the app bar. Sections are a mono
 *   label on a hairline. Nothing is boxed. Prior art: a surveyor’s level line.
 * - **B · Bench**: the rail and the drawer are wells set into the page (the Well look), and the page
 *   you’re on and the row you picked are raised as soft keys (the Key look). Prior art: a workbench
 *   and its tray.
 * - **C · Folio**: the record is a sheet with a stamped kind label and numbered, ruled sections; the
 *   drawer is the next sheet laid beside it (the Sheet look, flat, hairline-edged). Prior art: a case file.
 *
 * In all three the title and the main action stay in the same two slots on every page, the arrival
 * line shows once and then shrinks to a Back key, green marks only what needs you, corners are square,
 * and nothing scrolls. The Compare pages put each direction side by side in two states.
 *
 * About and More are drawn where they already live: About is what the drawer shows when nothing is
 * picked, and More is the “Showing 4 of 12” line under the crew list.
 */
const meta = {
  title: 'Quill/Page frame directions',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

/** A · Line: the record, just arrived from a link, one crew member picked. */
export const LineRecord: Story = { name: 'A · Line', render: () => <One dir="line" /> };

/** B · Bench: the same record. */
export const BenchRecord: Story = { name: 'B · Bench', render: () => <One dir="bench" /> };

/** C · Folio: the same record. */
export const FolioRecord: Story = { name: 'C · Folio', render: () => <One dir="folio" /> };

/** The arrival line when a link brings you in, and the Back key it shrinks to once you’ve read it. */
export const CompareArrival: Story = {
  name: 'Compare · arrival line',
  render: () => <Compare left="Just arrived" right="After reading: a Back key" state={(dir, side) => ({ dir, arrival: side ? 'read' : 'fresh' })} />,
};

/** Picking several crew: the selection bar at the foot of the page, or in the head’s action slot. */
export const CompareSelection: Story = {
  name: 'Compare · selecting several',
  render: () => <Compare left="Bar at the foot" right="Bar in the head’s action slot" state={(dir, side) => ({ dir, picked: 'several', arrival: 'none', selectAt: side ? 'head' : 'foot' })} />,
};

/** The drawer with nothing picked (About the record), and after a pick (the thing you picked, and why). */
export const CompareDrawer: Story = {
  name: 'Compare · drawer',
  render: () => <Compare left="Nothing picked: About" right="One picked: the crew member" state={(dir, side) => ({ dir, arrival: 'none', picked: side ? 'one' : 'none' })} />,
};

/** The front page as one sentence of what changed, or as the list of what waits for you. */
export const CompareFront: Story = {
  name: 'Compare · front page',
  render: () => <Compare left="What changed, as a sentence" right="What waits for you, as a list" state={(dir, side) => ({ dir, view: side ? 'front-waiting' : 'front-sentence' })} />,
};
