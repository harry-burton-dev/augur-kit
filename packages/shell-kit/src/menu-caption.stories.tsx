import type { Meta, StoryObj } from '@storybook/react-vite';
import { MenuCaption, MenuEsc, MenuUndo, ShellMenu } from './shell-menu.js';
import { MenuStage } from './shell-menu.fixture.js';

/**
 * The one line under the arc that names what's focused, or the view that's open. On the stream it says how
 * many need you and names the latest; it turns green when something does and amber offline. The controls
 * are the caption's own props.
 */
const meta = {
  title: 'Aerie/Shell menu/Caption',
  component: MenuCaption,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, iframeHeight: 360 } } },
  render: (args) => (
    <MenuStage>
      <ShellMenu open mood={args.mood}>
        <MenuCaption {...args} />
      </ShellMenu>
    </MenuStage>
  ),
  argTypes: { mood: { control: 'inline-radio', options: [undefined, 'quiet', 'some', 'needs', 'offline'] } },
  args: { title: '1 needs you', line: 'Review the budget draft', mood: 'needs' },
} satisfies Meta<typeof MenuCaption>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
/** A function focused or open: just its name. */
export const Function: Story = { args: { title: 'Settings', line: undefined, mood: undefined } };
/** Offline: amber, and the line says the stream is from before. */
export const Offline: Story = { args: { title: 'Offline', line: 'These are from before you went offline.', mood: 'offline' } };

/** The hint at the foot of the menu: Esc, and what it does now. With a view open it goes back; on the arc it closes. */
export const Esc: StoryObj<typeof MenuEsc> = {
  render: (args) => (
    <MenuStage>
      <ShellMenu open>
        <MenuEsc {...args} />
      </ShellMenu>
    </MenuStage>
  ),
  argTypes: { onPress: { action: 'onPress' } },
  args: { back: true },
};

/** What was just done, with Undo, for a while after it. */
export const Undo: StoryObj<typeof MenuUndo> = {
  render: (args) => (
    <MenuStage>
      <ShellMenu open>
        <MenuUndo {...args} />
      </ShellMenu>
    </MenuStage>
  ),
  argTypes: { onUndo: { action: 'onUndo' } },
  args: { label: 'Cleared 3' },
};
