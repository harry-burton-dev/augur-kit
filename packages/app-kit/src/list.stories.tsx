import type { Meta, StoryObj } from '@storybook/react-vite';
import { List, type ListItem } from './list.js';

const ITEMS: ListItem[] = [
  { id: 'roster', title: 'Approve the night roster', detail: 'From Ops · six people, two swaps', meta: '4 min', status: 'needs', group: 'Needs you', actions: [{ id: 'ok', label: 'Approve' }, { id: 'no', label: 'Send back' }] },
  { id: 'leave', title: 'Sign off Sam’s leave', detail: 'From People · 12–16 Dec', meta: '1 h', status: 'needs', group: 'Needs you', actions: [{ id: 'ok', label: 'Sign off' }] },
  { id: 'brief', title: 'Read the Halden brief', detail: 'Shared by Priya', meta: '09:12', status: 'running', group: 'Today' },
  { id: 'sync', title: 'Sync the vessel list', detail: 'Queued behind the port import', meta: '08:40', status: 'queued', group: 'Today' },
  { id: 'audit', title: 'Q3 access audit', detail: 'Closed by Lee', meta: 'Yesterday', status: 'done', group: 'Today' },
  { id: 'archive', title: 'Archive the old floor', reason: 'Only the floor’s owner can archive it.', status: 'paused', group: 'Today', disabled: true },
];

/**
 * Things you can act on, one per row: a lead mark, a title, a line of detail, a time or count at the
 * end, then up to two of the row's own actions as words. Drawn as Key: the rows sit in a well, like a
 * field, with no lines between them; the row you point at lightens. Groups and the count are mono
 * capitals, and a group that only holds what needs you is green. The first row that needs you pings.
 *
 * An unavailable row stays, dimmed, and says why in place of its detail. Arrows, Home, End and Enter
 * come from React Aria's grid list.
 */
const meta = {
  title: 'Quill/List',
  component: List,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--measure-wide)' }}>{Story()}</div>],
  args: { label: 'Your work', noun: ['thing', 'things'], items: ITEMS, density: 'comfortable', bar: true },
  argTypes: {
    density: { control: 'inline-radio', options: ['comfortable', 'compact'] },
    items: { control: 'object' },
    noun: { control: 'object' },
    error: { control: 'text' },
    empty: { control: 'text' },
    ringFor: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof List>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};

/** No groups, compact: rows closer together for a long day. */
export const Compact: Story = { args: { density: 'compact', items: ITEMS.map(({ group: _g, ...item }) => item) } };

/** While the rows load. */
export const Loading: Story = { args: { loading: true } };

/** Nothing to show, said in a line. */
export const Empty: Story = { args: { items: [], empty: 'Nothing needs you today.' } };

/** Couldn't load: said in red with Try again, in place of the rows. */
export const CouldntLoad: Story = { args: { error: 'Couldn’t load your work.' } };
