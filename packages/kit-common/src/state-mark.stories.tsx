import type { Meta, StoryObj } from '@storybook/react-vite';
import { StateMark } from './field.js';

/**
 * The shape at the end of a field that says its state, so colour is never the only clue: a cross
 * for an error, a triangle for a warning, a tick when it's right, and nothing while idle or asking.
 * It's decoration: the field's message says the same in words.
 */
const meta = {
  title: 'Common/Field parts/StateMark',
  component: StateMark,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { state: 'error' },
  argTypes: { state: { control: 'inline-radio', options: ['idle', 'attention', 'error', 'warning', 'valid'] } },
} satisfies Meta<typeof StateMark>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};
/** What's in the field is wrong. */
export const Wrong: Story = {};
/** Worth a second look. */
export const Warning: Story = { args: { state: 'warning' } };
/** Checked and right. */
export const Valid: Story = { args: { state: 'valid' } };

/** Every state, side by side; idle and attention draw nothing. */
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
      {(['error', 'warning', 'valid', 'idle', 'attention'] as const).map((s) => (
        <StateMark key={s} state={s} />
      ))}
    </div>
  ),
};
