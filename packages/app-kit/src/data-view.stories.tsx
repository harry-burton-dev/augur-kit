import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppError } from './client.js';
import { List } from './list.js';
import { DataView, type DataState } from './query.js';

interface Run {
  id: string;
  title: string;
  meta: string;
}
const RUNS: Run[] = [
  { id: '4821', title: 'Nightly import', meta: '02:00' },
  { id: '4820', title: 'Crew roster check', meta: 'Thu' },
  { id: '4815', title: 'Port call summary', meta: 'Thu' },
];

/** A made-up `useData` answer for each case. */
const answer = (kind: 'data' | 'loading' | 'empty' | 'failed' | 'refused'): DataState<Run[]> => {
  const base = { loading: false, refreshing: false, refresh: () => {} };
  if (kind === 'loading') return { ...base, data: undefined, error: undefined, loading: true };
  if (kind === 'empty') return { ...base, data: [], error: undefined };
  if (kind === 'failed') return { ...base, data: undefined, error: new AppError('The runs service didn’t answer.', 0) };
  if (kind === 'refused') return { ...base, data: undefined, error: new AppError('You can’t see the Ops team’s runs.', 403, { whoCanChange: 'The Ops team’s leads' }) };
  return { ...base, data: RUNS, error: undefined };
};

/**
 * The one way a region shows data that loads (`useData`): the loading line, then the data, or why it
 * isn't there, each drawn on the horizon (the State looks). Nothing to show says so in a sentence, with at
 * most one thing to do. A failure to answer offers Try again; a refusal says why and who can change it,
 * and offers nothing. Shown here around a plain List.
 */
const meta = {
  title: 'Quill/Data view',
  component: DataView<Run[]>,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--measure-read)' }}>{Story()}</div>],
  args: {
    state: answer('data'),
    loading: 'Loading runs',
    failed: 'Runs didn’t load',
    isEmpty: (runs: Run[]) => runs.length === 0,
    empty: { heading: 'No runs this week.', body: 'Runs you start, or that agents start for you, show here.', action: 'Start a run' },
    size: 'region',
    children: (runs: Run[]) => <List label="Runs" look="plain" noun={['run', 'runs']} items={runs.map((r) => ({ ...r, status: 'running' as const }))} />,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['region', 'line', 'page'] },
    state: { control: false },
    children: { control: false },
    isEmpty: { control: false },
    empty: { control: 'object' },
  },
} satisfies Meta<typeof DataView<Run[]>>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The data came: the list shows. */
export const Playground: Story = {};

/** Still loading: the loading line. */
export const Loading: Story = { args: { state: answer('loading') } };

/** It came, and there's nothing: one sentence, a line more, one thing to do. */
export const Empty: Story = { args: { state: answer('empty') } };

/** The service didn't answer: why, and Try again. */
export const Failed: Story = { args: { state: answer('failed') } };

/** The service said no: why, and who can change that. Nothing to try. */
export const Refused: Story = { args: { state: answer('refused') } };
