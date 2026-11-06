import type { Meta, StoryObj } from '@storybook/react-vite';
import { Person } from '@augur/kit-common';
import { AppUnavailable } from './app-unavailable.js';

/**
 * AppUnavailable is one screen for an app that can't show yet, instead of hiding it: opening, couldn't open,
 * needing a newer AUGUR, or kept to some floors. It says which, why, and who can change it. Drawn as Line
 * (picked 6 Nov 2026): the app's name stands on a horizon line, the state in mono over it and the reason in
 * mono under it. While it opens the line is Common's Progress; when it failed the line is red and Try again
 * sits under it. The controls are the component's own props.
 */
const meta = {
  title: 'Aerie/App unavailable',
  component: AppUnavailable,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    state: { control: 'inline-radio', options: ['loading', 'failed', 'needs-newer', 'limited'] },
    who: { control: false },
    onRetry: { action: 'onRetry' },
  },
  args: { app: { name: 'Data Atlas', icon: 'atlas' }, state: 'failed', reason: 'Its files didn’t load from the server. Your work in other apps is fine.', onRetry: () => {} },
} satisfies Meta<typeof AppUnavailable>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Couldn't open: the line is red, with Try again under the reason. */
export const CouldntOpen: Story = { name: 'Couldn’t open' };
/** Opening: the line is Common's Progress, running until the app shows. */
export const Opening: Story = { args: { state: 'loading', reason: 'Data Atlas is starting.' } };
/** Needs a newer AUGUR: which version, and who can update it. */
export const NeedsNewer: Story = {
  args: { state: 'needs-newer', reason: 'Data Atlas 3 needs AUGUR 4.2. This deployment runs 4.1.', who: <Person name="Ana Ruiz" detail="Deployment admin, can update AUGUR" tone="org" /> },
};
/** Not on this floor: where it is, and who can change that. */
export const NotOnThisFloor: Story = {
  args: { state: 'limited', reason: 'It’s only on department floors. Move to a department’s floor to open it.', who: <Person name="Lee Park" detail="Organisation admin, can change this" tone="org" /> },
};
