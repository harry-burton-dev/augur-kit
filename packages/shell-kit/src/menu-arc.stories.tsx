import type { Meta, StoryObj } from '@storybook/react-vite';
import { MenuArc, ShellMenu } from './shell-menu.js';
import { MenuStage, sampleFunctions } from './shell-menu.fixture.js';

/**
 * The arc: the functions on a shallow curve, the stream's orb at its top. Each function is a round icon
 * button whose name shows under it on hover and focus. One that can't be used stays, looks unavailable and
 * says why. The controls are the arc's own props; `items` takes Common's icon names, so the icons can change
 * in one place.
 */
const meta = {
  title: 'Aerie/Shell menu/Arc',
  component: MenuArc,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, iframeHeight: 360 } } },
  render: (args) => (
    <MenuStage view={args.lit && args.lit !== 'stream' ? args.lit : undefined}>
      <ShellMenu open mood={args.mood}>
        <MenuArc {...args} />
      </ShellMenu>
    </MenuStage>
  ),
  argTypes: {
    mood: { control: 'inline-radio', options: ['quiet', 'some', 'needs', 'offline'] },
    lit: { control: 'select', options: [undefined, 'stream', ...sampleFunctions.map((f) => f.id)] },
    focusIndex: { control: { type: 'number', min: 0, max: 5 } },
    items: { control: 'object' },
    onOpen: { action: 'onOpen' },
    onFocusItem: { action: 'onFocusItem' },
  },
  args: { items: sampleFunctions, mood: 'some', focusIndex: 2, streamLabel: 'Notifications: 2 new' },
} satisfies Meta<typeof MenuArc>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Five functions, two left of the stream and three right, both sides reaching the same width. */
export const Default: Story = {};
/** Something needs you: the orb glows green and pings. */
export const NeedsYou: Story = { args: { mood: 'needs', streamLabel: 'Notifications: 1 needs you' } };
/** A function open: it stays lit while the rest step back. */
export const Lit: Story = { args: { lit: 'settings' } };
/** A function that can't be used now stays on the arc, looks unavailable and says why on hover and focus. Pressing it does nothing. */
export const Unavailable: Story = {
  args: { items: sampleFunctions.map((f) => (f.id === 'agents' ? { ...f, unavailable: 'Agents are turned off in this workspace. An organisation admin can turn them on.' } : f)) },
};
/** Two functions: one either side. */
export const Few: Story = { args: { items: sampleFunctions.slice(0, 2) } };
