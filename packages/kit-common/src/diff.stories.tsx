import type { Meta, StoryObj } from '@storybook/react-vite';
import { Diff, DiffText } from './diff.js';

/**
 * What changed, key by key (Sink and rise, picked 6 Nov 2026): a pipeline's settings, a record's fields,
 * what an agent wants to write. What went sinks into a Well; what came rises as a key. A key that is new
 * says "new", one removed says "removed".
 *
 * It lists changes only, never the whole file, and folds past `limit`, so it never scrolls. It uses no
 * colour: added is never green and removed never red, since green means only "needs you". `DiffText` does
 * the same for words inside a sentence.
 */
const meta = {
  title: 'Common/Diff',
  component: Diff,
  subcomponents: { DiffText },
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--measure-read)' }}><Story /></div>],
  args: {
    label: 'the pipeline’s settings',
    limit: 8,
    disabled: false,
    changes: [
      { key: 'timeout', was: '30s', now: '45s' },
      { key: 'notify', now: 'harbour-ops' },
      { key: 'paused', was: 'true' },
      { key: 'schedule', was: 'hourly', now: 'every 15 minutes' },
    ],
  },
  argTypes: { changes: { control: 'object' }, className: { control: false } },
} satisfies Meta<typeof Diff>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};

/** Past `limit`, the rest fold under one line. */
export const Folded: Story = {
  args: {
    limit: 3,
    changes: ['region', 'owner', 'keep', 'mode', 'retries', 'write'].map((key, i) => ({ key, was: `old ${i + 1}`, now: `new ${i + 1}` })),
  },
};

/** Nothing changed. */
export const Same: Story = { name: 'No change', args: { changes: [], sameText: 'Same as before: nothing changed since 6 Nov 09:00.' } };

/** Can't be shown, and says why. */
export const Unavailable: Story = { args: { disabled: true, reason: 'The earlier version is gone: versions are kept for 90 days.' } };

/** Words that changed inside a sentence. */
export const Text: Story = {
  name: 'In a sentence',
  render: () => (
    <DiffText
      parts={[
        { op: 'same', text: 'Matching records to ' },
        { op: 'del', text: 'known' },
        { op: 'same', text: ' ' },
        { op: 'add', text: 'registered' },
        { op: 'same', text: ' vessels, then ' },
        { op: 'add', text: 'ask before' },
        { op: 'same', text: ' writing.' },
      ]}
    />
  ),
};
