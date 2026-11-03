import type { Meta, StoryObj } from '@storybook/react-vite';
import { Signal } from './signal.js';

const meta = {
  title: 'Common/Signal',
  component: Signal,
  args: { kind: 'bloom', label: 'Needs you' },
  argTypes: { kind: { control: 'inline-radio', options: ['streak', 'bloom', 'flicker', 'ember', 'beacon', 'shadow'] } },
} satisfies Meta<typeof Signal>;
export default meta;
type Story = StoryObj<typeof meta>;

export const One: Story = {};

/** Every kind of light, each with its words: the light is decoration, the words carry the meaning. */
export const Language: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <Signal kind="streak" label="to review" count={3} />
      <Signal kind="streak" label="to review" count={24} />
      <Signal kind="bloom" label="Needs you" />
      <Signal kind="flicker" label="Changed">since you last looked</Signal>
      <Signal kind="ember" label="Going stale">not opened for three weeks</Signal>
      <Signal kind="beacon" label="Urgent" />
      <Signal kind="shadow" label="Unavailable">Only the floor’s leads can publish here.</Signal>
    </div>
  ),
};
