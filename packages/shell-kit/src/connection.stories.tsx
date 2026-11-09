import type { Meta, StoryObj } from '@storybook/react-vite';
import { Connection } from './connection.js';

/**
 * Connection says, on a line under the band, when AUGUR is offline, reconnecting, or your session has ended.
 * Nothing shows while all is well. The line carries the state: dashed while offline, running while it
 * reconnects, broken off when you're signed out (the Line look, picked 6 Nov 2026). The state's name and
 * its sentence are in mono; a deployment can give its own with `names` and `words`. No green: nothing here
 * asks you to decide. The controls are the component's own props.
 */
const meta = {
  title: 'Aerie/Connection',
  component: Connection,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <div style={{ position: 'relative', minHeight: 'calc(var(--band-top) + var(--space-8))', transform: 'translateZ(0)' }}><Story /></div>],
  argTypes: {
    state: { control: 'inline-radio', options: ['online', 'offline', 'reconnecting', 'expired'] },
    onSignIn: { action: 'onSignIn' },
  },
  args: { state: 'offline' },
} satisfies Meta<typeof Connection>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Offline: the line is dashed, and what you do is kept. */
export const Offline: Story = {};
/** Reconnecting: a stretch of ink runs along the line. It stands still when motion is reduced. */
export const Reconnecting: Story = { args: { state: 'reconnecting' } };
/** Signed out: the line breaks off halfway, and Sign in is beside the sentence. */
export const SignedOut: Story = { args: { state: 'expired', onSignIn: () => {} } };
/** Online: nothing shows. */
export const Online: Story = { args: { state: 'online' } };
