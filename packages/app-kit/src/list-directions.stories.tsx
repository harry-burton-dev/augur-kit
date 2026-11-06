import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { Button, Icon } from '@augur/kit-common';
import { List, Table, type ListItem, type TableColumn, type TableRow } from './list.js';
import { Rows } from './states.js';
import './list-directions.stories.css';

/**
 * Directions for the lists and tables round (6 Nov 2026): List, Table, the long (virtual) Table and
 * Rows. Each page puts today's part beside three ways to draw it, to pick one:
 *
 * - **A · Rule** takes Horizon's line as structure and the start menu's hard ink line: no fills and no
 *   boxes, rows split by hairlines, mono capitals for headings, and where you are is an ink line at the
 *   row's start. Nearest prior art: a printed railway timetable or a ledger.
 * - **B · Key** takes the Keycap button and the Key tabs and dividers: the rows sit in a sunken tray,
 *   split by grooves, and the row you point at or pick rises as a key (a small corner, a thicker bottom
 *   line). Nearest prior art: a card-index drawer, a patch bay.
 * - **C · Dim** takes PDR-015's depth by dimming only: no lines between rows at all, space splits them,
 *   and everything sits a step back in muted ink. What needs you, what you point at and what you picked
 *   come forward to full ink. Nearest prior art: a writing app's focus mode.
 *
 * All three are flat greys, no blur, no colour of their own: green still means only "needs you", red
 * only danger. The parts and their props are the same in every column; only the drawing changes. A
 * second row drawn as pointed at stands for hover, so it shows in a snapshot. The last page, **Long
 * table reach**, is a separate question: how someone gets to row 4,000 without a long scroll.
 */
const meta = {
  title: 'Quill/List and table directions',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const directions = [
  { id: 'today', name: 'Today', summary: 'What ships now, for reference.' },
  { id: 'rule', name: 'A · Rule', summary: 'Hairlines and mono capitals; an ink line at the start of the row you are on.' },
  { id: 'key', name: 'B · Key', summary: 'Rows in a well, like the fields, with no lines between; the row you pick comes up as a soft key.' },
  { id: 'dim', name: 'C · Dim', summary: 'No lines: space splits rows, all sit back in muted ink, and what matters comes forward.' },
] as const;
type DirectionId = (typeof directions)[number]['id'];

function Board({ part, summary, children }: { part: string; summary: string; children: (d: DirectionId) => ReactNode }) {
  return (
    <div className="ld-stage">
      <header className="ld-head">
        <h2 className="ld-part">{part}</h2>
        <p className="ld-summary">{summary}</p>
      </header>
      <div className="ld-grid">
        {directions.map((d) => (
          <section key={d.id} className="ld-column" data-direction={d.id} aria-label={`${part}: ${d.name}`}>
            <h3 className="ld-name">{d.name}</h3>
            <p className="ld-note">{d.summary}</p>
            <div className="ld-specimen">{children(d.id)}</div>
          </section>
        ))}
      </div>
    </div>
  );
}

/* ---- Lists ---- */

const items: ListItem[] = [
  { id: 'roster', title: 'Approve the night roster', detail: 'From Ops · six people, two swaps', meta: '4 min', status: 'needs', group: 'Needs you', actions: [{ id: 'ok', label: 'Approve' }, { id: 'no', label: 'Send back' }] },
  { id: 'leave', title: 'Sign off Sam’s leave', detail: 'From People · 12–16 Dec', meta: '1 h', status: 'needs', group: 'Needs you', actions: [{ id: 'ok', label: 'Sign off' }] },
  { id: 'brief', title: 'Read the Halden brief', detail: 'Shared by Priya', meta: '09:12', status: 'running', group: 'Today' },
  { id: 'sync', title: 'Sync the vessel list', detail: 'Queued behind the port import', meta: '08:40', status: 'queued', group: 'Today' },
  { id: 'audit', title: 'Q3 access audit', detail: 'Closed by Lee', meta: 'Yesterday', status: 'done', group: 'Today' },
  { id: 'archive', title: 'Archive the old floor', reason: 'Only the floor’s owner can archive it.', status: 'paused', group: 'Today', disabled: true },
];

/** Things to act on, in two groups: what needs you, then today. The second row is drawn as pointed at; the last can’t be opened and says why. */
export const Lists: Story = {
  render: () => (
    <Board part="Lists" summary="Things to act on, one per row, in groups. The second row is drawn as pointed at; the last is unavailable and says why.">
      {(d) => (
        <div className="ld-hover-second">
          <List label={`Your work (${d})`} noun={['thing', 'things']} items={items} />
        </div>
      )}
    </Board>
  ),
};

/* ---- Tables ---- */

const columns: TableColumn[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'state', label: 'State', kind: 'status', sortable: true },
  { key: 'owner', label: 'Owner', sortable: true },
  { key: 'pages', label: 'Pages', kind: 'number', sortable: true },
];
const tableRows: TableRow[] = [
  { id: 'a', name: 'Leave policy', state: 'needs', owner: 'People', pages: 4 },
  { id: 'b', name: 'Travel and expenses', state: 'running', owner: 'Finance', pages: 12 },
  { id: 'c', name: 'Port access rules', state: 'warning', owner: 'Ops', pages: 7 },
  { id: 'd', name: 'Night roster template', state: 'done', owner: 'Ops', pages: 2 },
  { id: 'e', name: 'Vendor onboarding', state: 'failed', owner: 'Finance', pages: 19 },
];

/** Many things compared by the same fields: sorted by state, one row picked, the fourth drawn as pointed at. */
export const Tables: Story = {
  render: () => (
    <Board part="Tables" summary="Sorted by state (needs you first), one row picked, the fourth drawn as pointed at. Numbers end-aligned.">
      {(d) => (
        <div className="ld-hover-fourth">
          <Table label={`Documents (${d})`} noun="documents" filterable selectable selected={['b']} sort={{ key: 'state', dir: 'asc' }} columns={columns} rows={tableRows} />
        </div>
      )}
    </Board>
  ),
};

/* ---- Long table ---- */

const states = ['needs', 'running', 'queued', 'done', 'failed', 'paused'];
const owners = ['Ops', 'People', 'Finance', 'Legal'];
const longRows: TableRow[] = Array.from({ length: 5000 }, (_, i) => ({
  id: `d${i}`,
  name: `Document ${i + 1}`,
  state: states[i % states.length],
  owner: owners[i % owners.length],
  pages: (i * 7) % 97,
}));
/** The reach page's three columns sit side by side, so its tables leave out Owner. */
const reachColumns: TableColumn[] = columns.filter((c) => c.key !== 'owner');

/** The virtual Table (5,000 rows), compact, in a region of its own height with the kit’s thin scroll bar. */
export const LongTable: Story = {
  render: () => (
    <Board part="Long table" summary="5,000 rows, compact, drawn only as they come into view. The region scrolls inside itself with the kit’s thin bar; the page doesn’t.">
      {(d) => (
        <div className="ld-long">
          <Table label={`All documents (${d})`} noun="documents" virtual density="compact" filterable columns={columns} rows={longRows} />
        </div>
      )}
    </Board>
  ),
};

/* ---- Rows ---- */

/** Label and value pairs on a record’s page. */
export const DetailRows: Story = {
  name: 'Detail rows',
  render: () => (
    <Board part="Detail rows" summary="Label and value pairs on a record’s page (Rows).">
      {() => (
        <Rows
          items={[
            { label: 'Owner', value: 'Sam Okafor' },
            { label: 'Floor', value: 'Ops' },
            { label: 'Changed', value: '4 min ago' },
            { label: 'Pages', value: '12' },
          ]}
        />
      )}
    </Board>
  ),
};

/* ---- Reach ---- */

const reachDirections = [
  { id: 'scroll', name: 'Scroll', summary: 'Today: the region scrolls inside itself, about ten rows tall, with the kit’s thin bar.' },
  { id: 'pages', name: 'Pages', summary: 'A screenful at a time: the table never scrolls. Keys step back and on, and the count says where you are.' },
  { id: 'narrow', name: 'Narrow', summary: 'Shows the first screenful, then says how many more and opens the filter to narrow them. Nothing scrolls.' },
] as const;

const PAGE = 8;

function Paged() {
  const [page, setPage] = useState(0);
  const last = Math.ceil(longRows.length / PAGE) - 1;
  const from = page * PAGE;
  const shown = longRows.slice(from, from + PAGE);
  return (
    <div className="ld-paged">
      <Table label="All documents (pages)" noun="documents" density="compact" columns={reachColumns} rows={shown} />
      <div className="ld-pager">
        <span className="ld-pager-count">
          {from + 1}–{from + shown.length} of {longRows.length.toLocaleString('en-GB')}
        </span>
        <Button kind="secondary" size="sm" disabled={page === 0} reason="This is the first page." icon={<Icon name="back" size={16} />} onPress={() => setPage(page - 1)}>
          Back
        </Button>
        <Button kind="secondary" size="sm" disabled={page === last} reason="This is the last page." icon={<Icon name="arrow" size={16} />} onPress={() => setPage(page + 1)}>
          On
        </Button>
      </div>
    </div>
  );
}

function Narrowed() {
  const shown = longRows.slice(0, PAGE);
  return (
    <div className="ld-paged">
      <Table label="All documents (narrow)" noun="documents" density="compact" columns={reachColumns} rows={shown} />
      <div className="ld-pager">
        <span className="ld-pager-count" data-words>{(longRows.length - PAGE).toLocaleString('en-GB')} more. Narrow them with the filter, or by state or owner.</span>
        <Button kind="secondary" size="sm" icon={<Icon name="filter" size={16} />}>
          Narrow
        </Button>
      </div>
    </div>
  );
}

/** Three ways to reach row 4,000, all drawn today’s way: scroll inside the region, step through pages, or narrow first. */
export const LongTableReach: Story = {
  name: 'Long table reach',
  render: () => (
    <div className="ld-stage">
      <header className="ld-head">
        <h2 className="ld-part">Long table reach</h2>
        <p className="ld-summary">How someone gets to row 4,000 of 5,000. A separate pick from the drawing: each is shown in today’s look.</p>
      </header>
      <div className="ld-grid" data-three>
        {reachDirections.map((r) => (
          <section key={r.id} className="ld-column" aria-label={`Long table reach: ${r.name}`}>
            <h3 className="ld-name">{r.name}</h3>
            <p className="ld-note">{r.summary}</p>
            <div className="ld-specimen">
              {r.id === 'scroll' ? (
                <div className="ld-long" data-short>
                  <Table label="All documents (scroll)" noun="documents" virtual density="compact" columns={reachColumns} rows={longRows} />
                </div>
              ) : r.id === 'pages' ? (
                <Paged />
              ) : (
                <Narrowed />
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  ),
};

/* ---- Plain list and expanding row (mock-ups: neither is a part yet) ---- */

/** A plain contained list of words, and a table row opened to show more under it. Neither is a part yet: drawn here so the pick covers them. */
export const PlainAndExpanding: Story = {
  name: 'Plain list and expanding row',
  render: () => (
    <Board part="Plain list and expanding row" summary="Two kinds that aren’t parts yet: a plain list of things, and a table row opened to show more under it. Drawn from markup so the pick covers them.">
      {() => (
        <div className="ld-pair">
          <ul className="ld-plain" aria-label="Steps">
            <li>Check the roster against leave</li>
            <li>Ask Ops about the two swaps</li>
            <li>Send the roster to the floor</li>
          </ul>
          <table className="ld-expand">
            <thead>
              <tr>
                <th scope="col" aria-label="Open" />
                <th scope="col">Name</th>
                <th scope="col">Owner</th>
              </tr>
            </thead>
            <tbody>
              <tr data-open="">
                <td>
                  <Icon name="chevron-down" size={14} />
                </td>
                <td>Leave policy</td>
                <td>People</td>
              </tr>
              <tr className="ld-expand-more">
                <td />
                <td colSpan={2}>Four pages. Changed by Sam 4 min ago; two people still to read it.</td>
              </tr>
              <tr>
                <td>
                  <Icon name="chevron-down" size={14} />
                </td>
                <td>Travel and expenses</td>
                <td>Finance</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </Board>
  ),
};
