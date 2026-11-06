import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactNode } from 'react';
import { Icon, type IconName } from '@augur/kit-common';
import './data-mark-directions.stories.css';

/*
 * Round N: three directions for the data marks (Tree, PathTree, Path, Refs, Lifecycle, Timeline,
 * Tiles, Reel, Status, UrgentEdge and Signal). Drawings only, in scoped CSS: no part changes until a
 * direction is picked. Each page shows the same content in A, B and C side by side.
 */

type Dir = 'line' | 'key' | 'stamp';
const DIRS: { id: Dir; letter: string; name: string; from: string }[] = [
  { id: 'line', letter: 'A', name: 'Line', from: 'Nearest prior art: a metro line diagram. Horizon’s line carries the structure; marks sit on it.' },
  { id: 'key', letter: 'B', name: 'Key', from: 'Nearest prior art: a card-index drawer. The Key rows from lists and tables: a well, and the thing you’re on raised as a soft key.' },
  { id: 'stamp', letter: 'C', name: 'Stamp', from: 'Nearest prior art: a ship’s logbook. Mono stamps from notices, a ruled ledger, and things keep their physical shapes.' },
];

function Columns({ children }: { children: (dir: Dir) => ReactNode }) {
  return (
    <div className="dm-cols">
      {DIRS.map((d) => (
        <section key={d.id} className="dm-col" data-dir={d.id}>
          <header className="dm-head">
            <span className="dm-letter">{d.letter}</span> {d.name}
            <p>{d.from}</p>
          </header>
          {children(d.id)}
        </section>
      ))}
    </div>
  );
}

const Label = ({ children }: { children: ReactNode }) => <h4 className="dm-label">{children}</h4>;

/* ---------- Places ---------- */

const TREE: { name: string; depth: number; open?: boolean; picked?: boolean; count?: number; needs?: boolean }[] = [
  { name: 'Operations', depth: 0, open: true, count: 4 },
  { name: 'Night roster', depth: 1, open: true, count: 2, needs: true },
  { name: 'Swaps for 12 Dec', depth: 2, picked: true },
  { name: 'Standing rules', depth: 2 },
  { name: 'Port imports', depth: 1, count: 12 },
  { name: 'People', depth: 0, count: 7 },
];

function TreeMark() {
  return (
    <ul className="dm-tree" role="tree" aria-label="Library">
      {TREE.map((n) => (
        <li key={n.name} className="dm-tree-row" role="treeitem" aria-selected={n.picked} data-picked={n.picked ? '' : undefined} style={{ '--depth': n.depth } as CSSProperties}>
          <span className="dm-tree-chev">{n.count ? <Icon name={n.open ? 'chevron-down' : 'chevron-right'} size={14} /> : null}</span>
          <Icon name={n.count ? 'folder' : 'document'} size={14} />
          <span className="dm-grow">{n.name}</span>
          {n.needs ? <span className="dm-needs-dot" aria-label="Needs you" /> : null}
          {n.count ? <span className="dm-count">{n.count}</span> : null}
        </li>
      ))}
    </ul>
  );
}

const PATH_TREE: { name: string; level: number; dist: 0 | 1 | 2 | 3; here?: boolean }[] = [
  { name: 'Fleet', level: 0, dist: 0 },
  { name: 'North Sea', level: 1, dist: 0 },
  { name: 'Baltic', level: 1, dist: 1 },
  { name: 'Halden', level: 2, dist: 0, here: true },
  { name: 'Brekke', level: 2, dist: 1 },
  { name: 'Tor', level: 2, dist: 2 },
  { name: 'Archive', level: 0, dist: 3 },
];

function PathTreeMark() {
  return (
    <ol className="dm-ptree" aria-label="Where you are">
      {PATH_TREE.map((n) => (
        <li key={n.name} className="dm-ptree-row" data-dist={n.dist} data-here={n.here ? '' : undefined} style={{ '--depth': n.level } as CSSProperties}>
          <span className="dm-ptree-lvl">{String(n.level + 1).padStart(2, '0')}</span>
          <span className="dm-grow">{n.name}</span>
          {n.here ? <span className="dm-here">Here</span> : null}
        </li>
      ))}
    </ol>
  );
}

const STEPS: { title: string; icon: IconName; floor: string; here?: boolean; mark?: string }[] = [
  { title: 'Your desk', icon: 'account', floor: 'You' },
  { title: 'Ops team', icon: 'people', floor: 'Team', here: true },
  { title: 'Fleet org', icon: 'org', floor: 'Org', mark: 'Locked' },
];

function PathMark() {
  return (
    <ol className="dm-path" aria-label="Floors">
      {STEPS.map((s) => (
        <li key={s.title} data-here={s.here ? '' : undefined} aria-current={s.here ? 'step' : undefined}>
          <span className="dm-path-disc">
            <Icon name={s.icon} size={14} />
          </span>
          <span className="dm-path-title">{s.title}</span>
          <span className="dm-path-floor">{s.mark ?? s.floor}</span>
        </li>
      ))}
    </ol>
  );
}

const REFS: { name: string; icon: IconName; kind: string }[] = [
  { name: 'MV Halden', icon: 'vessel', kind: 'Vessel' },
  { name: 'Night roster', icon: 'document', kind: 'Doc' },
  { name: 'Priya Shah', icon: 'person', kind: 'Person' },
];

function RefsMark() {
  return (
    <span className="dm-refs">
      {REFS.map((r) => (
        <button key={r.name} type="button" className="dm-ref">
          <Icon name={r.icon} size={14} />
          <span className="dm-ref-kind">{r.kind}</span>
          <span>{r.name}</span>
        </button>
      ))}
      <span className="dm-ref dm-ref-closed">
        <Icon name="lock" size={12} /> 2 you can’t open
      </span>
    </span>
  );
}

/* ---------- Time and state ---------- */

const STATES = ['Draft', 'In review', 'Approved', 'Published', 'Archived'];
const AT = 2;

function LifecycleMark() {
  return (
    <div className="dm-life">
      <ol className="dm-life-track" aria-label="Lifecycle">
        {STATES.map((s, i) => (
          <li key={s} data-state={i < AT ? 'past' : i === AT ? 'now' : 'ahead'} aria-current={i === AT ? 'step' : undefined}>
            <span className="dm-life-stop" />
            <span className="dm-life-name">{s}</span>
          </li>
        ))}
      </ol>
      <div className="dm-life-moves">
        <button type="button" className="dm-move">Publish</button>
        <button type="button" className="dm-move">Back to review</button>
      </div>
    </div>
  );
}

const EVENTS: { day?: string; at: string; who: string; what: string }[] = [
  { day: 'Today', at: '09:12', who: 'Priya', what: 'approved the night roster' },
  { at: '08:40', who: 'Lee', what: 'swapped two shifts' },
  { day: 'Yesterday', at: '17:05', who: 'Sam', what: 'asked for leave, 12–16 Dec' },
  { at: '11:30', who: 'Ops', what: 'imported the port list' },
];

function TimelineMark() {
  return (
    <ol className="dm-time">
      {EVENTS.map((e) => (
        <li key={e.at + e.who} className="dm-time-item">
          {e.day ? <span className="dm-time-day">{e.day}</span> : null}
          <span className="dm-time-ev">
            <time>{e.at}</time>
            <span className="dm-time-tick" />
            <span>
              <b>{e.who}</b> {e.what}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}

const STATUSES: { s: string; word: string }[] = [
  { s: 'needs', word: 'Needs you' },
  { s: 'running', word: 'Running' },
  { s: 'queued', word: 'Queued' },
  { s: 'paused', word: 'Paused' },
  { s: 'failed', word: 'Failed' },
  { s: 'done', word: 'Done' },
];

function StatusMarks() {
  return (
    <div className="dm-stats">
      {STATUSES.map((x) => (
        <span key={x.s} className="dm-status" data-status={x.s}>
          <span className="dm-status-mark" aria-hidden="true" />
          {x.word}
        </span>
      ))}
    </div>
  );
}

const SIGNALS: { kind: string; label: string; count?: number; more?: string }[] = [
  { kind: 'streak', label: 'to review', count: 5 },
  { kind: 'bloom', label: 'Needs you' },
  { kind: 'flicker', label: 'Changed', more: 'by Lee' },
  { kind: 'ember', label: 'Going stale', more: '9 days' },
  { kind: 'beacon', label: 'Urgent' },
  { kind: 'shadow', label: 'Unavailable', more: 'Ask the floor’s owner' },
];

function SignalMarks() {
  return (
    <div className="dm-sigs">
      {SIGNALS.map((x) => (
        <span key={x.kind} className="dm-sig" data-kind={x.kind} style={x.count ? ({ '--count': x.count } as CSSProperties) : undefined}>
          <span className="dm-sig-socket" aria-hidden="true">
            <span className="dm-sig-light" />
          </span>
          {x.count ? <span className="dm-sig-count">{x.count}</span> : null}
          <span>{x.label}</span>
          {x.more ? <span className="dm-muted">{x.more}</span> : null}
        </span>
      ))}
    </div>
  );
}

/* ---------- Tiles and reel ---------- */

const TILES: { kind: string; name: string; meta: string; icon: IconName; needs?: boolean }[] = [
  { kind: 'collection', name: 'Fleet', meta: '42 things', icon: 'library' },
  { kind: 'folder', name: 'Night roster', meta: '6 things', icon: 'folder', needs: true },
  { kind: 'series', name: 'Weekly brief', meta: '18 issues', icon: 'series' },
  { kind: 'document', name: 'Halden brief', meta: 'Priya · 09:12', icon: 'document' },
];

function TilesMark() {
  return (
    <div className="dm-tiles">
      {TILES.map((t) => (
        <button key={t.name} type="button" className="dm-tile" data-kind={t.kind}>
          <span className="dm-tile-shape" aria-hidden="true" />
          <span className="dm-tile-kind">
            <Icon name={t.icon} size={14} /> {t.kind}
          </span>
          <span className="dm-tile-name">{t.name}</span>
          <span className="dm-tile-meta">
            {t.needs ? <span className="dm-needs-dot" /> : null}
            {t.needs ? 'Needs you · ' : ''}
            {t.meta}
          </span>
        </button>
      ))}
    </div>
  );
}

const CARDS = [
  { title: 'Approve the night roster', meta: 'Ops · 4 min' },
  { title: 'Sign off Sam’s leave', meta: 'People · 1 h' },
  { title: 'Check the port import', meta: 'Ops · 2 h' },
];

function ReelMark() {
  return (
    <div className="dm-reel">
      <div className="dm-reel-head">
        <span className="dm-reel-light" aria-hidden="true" />
        Needs you <span className="dm-count">3</span>
      </div>
      <div className="dm-reel-lane">
        {CARDS.map((c, i) => (
          <button key={c.title} type="button" className="dm-card" data-front={i === 0 ? '' : undefined}>
            <span className="dm-card-no">{String(i + 1).padStart(2, '0')}</span>
            <b>{c.title}</b>
            <span className="dm-muted">{c.meta}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function UrgentEdgeMark() {
  return (
    <button type="button" className="dm-urgent">
      <span className="dm-urgent-kind">
        <Icon name="warning" size={16} /> Urgent
      </span>
      <span className="dm-grow dm-urgent-line">Port of Halden closes at 18:00: reroute two vessels</span>
      <span className="dm-urgent-queue">+2 waiting</span>
      <span className="dm-urgent-open">Open</span>
    </button>
  );
}

/* ---------- Stories ---------- */

/**
 * Three directions for the data marks. Each page draws the same content three ways, side by side.
 * The marks sit quietly in the well like the Key rows; only alerts (Signal, Reel, UrgentEdge) may be
 * louder, and green still means only “needs you”. Signal keeps its animated light language in all
 * three: what changes is what the light sits on.
 *
 * - **A · Line**: the line is the structure. Trees hang off a spine, paths and lifecycles are lines
 *   with stops, a tile’s kind is drawn in its top line. Prior art: a metro line diagram.
 * - **B · Key**: everything sits in a well; the thing you’re on is raised as a soft key, as in lists
 *   and tables. Tiles flatten into Key cards. Prior art: a card-index drawer.
 * - **C · Stamp**: mono stamps and a ruled ledger; the current state is stamped solid. Tiles keep
 *   their physical shapes (a folder’s tab, a series’ stack, a page’s folded corner) as hairlines.
 *   Prior art: a ship’s logbook.
 *
 * Floors are drawn by their icon and name, not their colour, because the personal floor’s colour is
 * green and green is kept for “needs you”.
 */
const meta = {
  title: 'Quill/Data mark directions',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

/** Tree, PathTree (where you are, the rest dimmed by distance), Path (floors) and Refs. */
export const Places: Story = {
  render: () => (
    <Columns>
      {() => (
        <>
          <Label>Tree</Label>
          <TreeMark />
          <Label>Path tree</Label>
          <PathTreeMark />
          <Label>Path</Label>
          <PathMark />
          <Label>Refs</Label>
          <RefsMark />
        </>
      )}
    </Columns>
  ),
};

/** Lifecycle, Timeline, Status and Signal (animated, as today). */
export const TimeAndState: Story = {
  name: 'Time and state',
  render: () => (
    <Columns>
      {() => (
        <>
          <Label>Lifecycle</Label>
          <LifecycleMark />
          <Label>Timeline</Label>
          <TimelineMark />
          <Label>Status</Label>
          <StatusMarks />
          <Label>Signal</Label>
          <SignalMarks />
        </>
      )}
    </Columns>
  ),
};

/** Tiles (a thing’s kind as its shape), the Reel lane, and the UrgentEdge, which may be loud. */
export const Surfaces: Story = {
  render: () => (
    <Columns>
      {() => (
        <>
          <Label>Tiles</Label>
          <TilesMark />
          <Label>Reel</Label>
          <ReelMark />
          <Label>Urgent edge</Label>
          <UrgentEdgeMark />
        </>
      )}
    </Columns>
  ),
};
