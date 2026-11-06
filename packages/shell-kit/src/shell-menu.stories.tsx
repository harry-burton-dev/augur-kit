import type { Meta, StoryObj } from '@storybook/react-vite';
import { MenuArc, MenuCaption, MenuEsc, MenuView, ShellMenu } from './shell-menu.js';
import { MenuStage, SampleMenu, SampleStream, sampleFunctions } from './shell-menu.fixture.js';

/**
 * The shell menu: summon the Shell (` or Ctrl/⌘ K) and the app tips away while the sky fades down. The
 * functions sit on a shallow arc with the stream of what needs you at its top, one line under them names
 * what's focused, and a function opens its view below. Esc goes back a step, then closes.
 *
 * It's built from parts, each with its own page: the sky (`ShellMenu`), the `MenuArc`, the `MenuCaption`,
 * the `MenuView`, and what goes in a view. The Shell puts them together from its model. Here the controls
 * are the sky's own props, and the parts inside are sample content put together the way the Shell does.
 */
const meta = {
  title: 'Aerie/Shell menu/Shell menu',
  component: ShellMenu,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, iframeHeight: 640 } } },
  render: (args) => (
    <MenuStage open={args.open}>
      <ShellMenu {...args}>
        <MenuArc items={sampleFunctions} mood={args.mood} streamLabel="Notifications: 1 needs you" />
        <MenuCaption title={args.mood === 'offline' ? 'Offline' : args.mood === 'needs' ? '1 needs you' : args.mood === 'some' ? '2 new' : 'All quiet'} line={args.mood === 'needs' ? 'Review the budget draft' : undefined} mood={args.mood} />
        <MenuEsc />
      </ShellMenu>
    </MenuStage>
  ),
  argTypes: {
    mood: { control: 'inline-radio', options: ['quiet', 'some', 'needs', 'offline'] },
    children: { control: false },
    onDismiss: { action: 'onDismiss' },
    onKeyDown: { control: false },
  },
  args: { open: true, mood: 'needs', label: 'Shell' },
} satisfies Meta<typeof ShellMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Summoned with something that needs you: the thread falling to the stream runs green, and the caption names it. */
export const Default: Story = {};
/** Nothing heard: the orb is an empty ring and the thread is still. */
export const Quiet: Story = { args: { mood: 'quiet' } };
/** Offline: amber, and the stream shows what came before. */
export const Offline: Story = { args: { mood: 'offline' } };
/** The whole menu, working: press a function on the arc to open its view; Esc, the Esc hint or the sky goes back. */
export const Working: Story = { render: () => <SampleMenu /> };
/** A view open under the arc: the stream. The arc steps back and the one that's open stays lit. */
export const ViewOpen: Story = {
  render: (args) => (
    <MenuStage view="stream">
      <ShellMenu {...args}>
        <MenuArc items={sampleFunctions} lit="stream" mood={args.mood} />
        <MenuCaption title="1 needs you" line="Review the budget draft" mood={args.mood} />
        <MenuView label="1 needs you">
          <SampleStream />
        </MenuView>
        <MenuEsc back />
      </ShellMenu>
    </MenuStage>
  ),
};
