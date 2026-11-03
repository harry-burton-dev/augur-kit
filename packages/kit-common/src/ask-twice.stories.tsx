import type { Meta, StoryObj } from '@storybook/react-vite';
import { AskTwice } from './ask-twice.js';

const meta = {
  title: 'Common/AskTwice',
  component: AskTwice,
  args: { children: 'Delete', confirm: 'Press again to delete' },
} satisfies Meta<typeof AskTwice>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Press once: it says what the second press does, then goes back by itself, on Esc or when you leave it. */
export const Delete: Story = {};
export const TurnOff: Story = { args: { children: 'Turn off', confirm: 'Press again to turn it off' } };
export const Small: Story = { args: { size: 'sm', children: 'Remove app', confirm: 'Press again to remove it' } };
/** Stays focusable and says why on hover and focus. */
export const Unavailable: Story = { args: { disabled: true, reason: 'Only an admin of this floor can delete it.' } };
