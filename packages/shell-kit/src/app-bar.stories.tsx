import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppBar, BarTile } from './app-bar.js';
import { GROUPS, MANY, ONE, SampleBar, Screen, TWO } from './app-bar.fixture.js';

/**
 * The app bar: on the desktop a bar of tiles that open start menus; with an app open, the same bar
 * docked as the side rail. Built from parts (Bar tile, Start menu and its rows, the rail sections),
 * each with its own page. Controls here are the bar's own props; the tiles inside are sample content
 * put together the way the shell would.
 */
const meta = {
  title: 'Aerie/App bar/App bar',
  component: AppBar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  render: (args) => (
    <Screen>
      <SampleBar {...args} />
    </Screen>
  ),
  argTypes: {
    mode: { control: 'inline-radio', options: ['desk', 'app'] },
    stop: { control: 'inline-radio', options: [0, 1, 2, 3] },
    defaultStop: { control: false },
    hint: { control: 'text' },
    label: { control: 'text' },
    children: { control: false },
  },
  args: { stop: 1 },
} satisfies Meta<typeof AppBar>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The desktop: a bar of tiles. Press a tile for its start menu; drag the grip, or use its arrow keys, to move the bar. */
export const Desktop: Story = {};
/** With an app open the bar docks as the side rail: Home and Apps, what's open, then the app's pages. */
export const AppOpen: Story = { render: (args) => <Screen><SampleBar {...args} app="artifacts" /></Screen> };
/** First run: one line by the bar, once. */
export const FirstRun: Story = { args: { hint: 'Everything lives in these tiles. Press one to see what’s inside.' } };
/** Apps that are open sit on the desktop bar after a divider, each with its hard line. */
export const SeveralOpen: Story = { render: (args) => <Screen><SampleBar {...args} running={['artifacts', 'mandate', 'explorer']} /></Screen> };
/** Two things need you: both paths are lit, and only the first breathes. */
export const TwoNeedYou: Story = { render: (args) => <Screen><SampleBar {...args} needs={TWO} /></Screen> };
/** More groups than fit: the rest go in More. */
export const ManyGroups: Story = { render: (args) => <Screen><SampleBar {...args} groups={[...GROUPS, ...MANY]} needs={TWO} /></Screen> };
/** A single app and nothing else: no groups, just the app. */
export const OneApp: Story = {
  render: (args) => (
    <Screen>
      <SampleBar {...args} groups={[{ id: 'only', name: 'Artifacts', icon: 'library', apps: [{ id: 'artifacts', name: 'Artifacts', icon: 'library', line: 'What your floors keep' }] }]} needs={[]} />
    </Screen>
  ),
};
/** One Apps tile holding every group as a folder. */
export const OneFolder: Story = { render: (args) => <Screen><SampleBar {...args} holds="folder" needs={ONE} /></Screen> };
/** A narrow window: smaller tiles, and a narrower rail. */
export const Narrow: Story = { render: (args) => <Screen width="min(100%, 640px)"><SampleBar {...args} app="artifacts" /></Screen> };
/** The bar with a single tile in it, under the band. */
export const SingleTile: Story = {
  render: (args) => (
    <Screen height={200}>
      <AppBar {...args} stop={0}>
        <BarTile icon="library" name="Artifacts" />
      </AppBar>
    </Screen>
  ),
};
