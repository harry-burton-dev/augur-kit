import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table, type TableColumn, type TableRow } from './list.js';

const COLUMNS: TableColumn[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'state', label: 'State', kind: 'status', sortable: true },
  { key: 'owner', label: 'Owner', sortable: true },
  { key: 'pages', label: 'Pages', kind: 'number', sortable: true },
  { key: 'at', label: 'Changed', kind: 'date', sortable: true, sortFirst: 'desc' },
];
const ROWS: TableRow[] = [
  { id: 'a', name: 'Leave policy', state: 'needs', owner: 'People', pages: 4, at: '2026-11-06T09:10:00Z' },
  { id: 'b', name: 'Travel and expenses', state: 'running', owner: 'Finance', pages: 12, at: '2026-11-05T15:00:00Z' },
  { id: 'c', name: 'Port access rules', state: 'warning', owner: 'Ops', pages: 7, at: '2026-11-02T11:30:00Z' },
  { id: 'd', name: 'Night roster template', state: 'done', owner: 'Ops', pages: 2, at: '2026-10-20T08:00:00Z' },
  { id: 'e', name: 'Vendor onboarding', state: 'failed', owner: 'Finance', pages: 19, at: '2026-10-01T10:00:00Z' },
];
const STATES = ['needs', 'running', 'queued', 'done', 'failed', 'paused'];
const OWNERS = ['Ops', 'People', 'Finance', 'Legal'];
const MANY: TableRow[] = Array.from({ length: 5000 }, (_, i) => ({
  id: `d${i}`,
  name: `Document ${i + 1}`,
  state: STATES[i % STATES.length],
  owner: OWNERS[i % OWNERS.length],
  pages: (i * 7) % 97,
  at: new Date(Date.UTC(2026, 0, 1) + i * 3_600_000).toISOString(),
}));

/**
 * Many things compared by the same fields. Drawn as Key: the rows sit in a well, like a field, with
 * no lines between them. The row you point at lightens; a row you pick comes up as a soft key, a step
 * lighter with a thin bottom line. Headings and the count are mono capitals, numbers are mono and end
 * aligned, and the sorted column is underlined.
 *
 * The first column takes the spare width and truncates. Sortable headers cycle ascending, descending,
 * cleared; status sorts by urgency, so what needs you comes first. For a long table, `pageSize` shows a
 * screenful at a time with Back and On, so nothing scrolls; `virtual` draws only the rows in view of a
 * region that scrolls inside itself, with the kit's thin bar.
 */
const meta = {
  title: 'Quill/Table',
  component: Table,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--measure-wide)' }}>{Story()}</div>],
  args: { label: 'Documents', noun: 'documents', columns: COLUMNS, rows: ROWS, density: 'default', filterable: true, selectable: true, sort: { key: 'state', dir: 'asc' } },
  argTypes: {
    density: { control: 'inline-radio', options: ['default', 'compact'] },
    columns: { control: 'object' },
    rows: { control: 'object' },
    selected: { control: 'object' },
    pageSize: { control: { type: 'number', min: 1, step: 1 } },
    error: { control: 'text' },
    empty: { control: 'text' },
    actions: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof Table>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};

/** One row picked: it comes up as a soft key, and the count says so. */
export const Picked: Story = { args: { selected: ['b'] } };

/** Rows closer together. */
export const Compact: Story = { args: { density: 'compact' } };

/** 5,000 rows, eight at a time: the count and Back and On sit under them, and nothing scrolls. */
export const Pages: Story = { args: { rows: MANY, pageSize: 8, density: 'compact', selectable: false, sort: null } };

/** 5,000 rows with `virtual`: only those in view are drawn, in a region that scrolls inside itself. */
export const Virtual: Story = { args: { rows: MANY, virtual: true, density: 'compact', sort: null } };

/** While the rows load. */
export const Loading: Story = { args: { loading: true } };

/** Nothing yet, said in a line. */
export const Empty: Story = { args: { rows: [], empty: 'No documents yet.' } };

/** Couldn't load: said in red with Try again. */
export const CouldntLoad: Story = { args: { error: 'Couldn’t load the documents.' } };
