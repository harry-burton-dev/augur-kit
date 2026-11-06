import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppBar, BarDivider, BarTile, RailBlock, RailPages, RailPair } from './app-bar.js';
import { Screen } from './app-bar.fixture.js';
import { iconNames } from '@augur/kit-common';

/**
 * A tile on the app bar: one large icon with its name under it. With `menu` it opens a start menu.
 * In the docked rail it takes a `kind`: `half` for Home and Apps, `app` for an open app, `page` for
 * one of the app's pages. The controls are the tile's own props.
 */
const meta = {
  title: 'Aerie/App bar/Bar tile',
  component: BarTile,
  parameters: { layout: 'padded' },
  render: (args) => (
    <Screen height={180}>
      <AppBar stop={0}>
        <BarTile {...args} />
      </AppBar>
    </Screen>
  ),
  argTypes: {
    icon: { control: 'select', options: iconNames },
    kind: { control: 'inline-radio', options: ['plain', 'menu', 'app', 'page', 'half'] },
    menu: { control: false },
  },
  args: { icon: 'context', name: 'Context', current: false, running: false, lit: false, lead: false, start: false },
} satisfies Meta<typeof BarTile>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Tile: Story = {};
/** Something that needs you is through here: light rises from the bar's edge. */
export const Lit: Story = { args: { lit: true } };
/** The first thing that needs you: its light breathes. */
export const Lead: Story = { args: { lit: true, lead: true } };
/** An open app on the desktop bar carries a hard line. */
export const Running: Story = { args: { icon: 'library', name: 'Artifacts', running: true } };

/** The tiles in the docked rail: the fixed block (a pair, then open apps) and the app's pages. */
export const InTheRail: Story = {
  render: (args) => (
    <Screen height={640}>
      <AppBar mode="app">
        <RailBlock>
          <RailPair>
            <BarTile kind="half" icon="home" name="Home" />
            <BarTile kind="half" icon="apps" name="Apps" />
          </RailPair>
          <BarTile kind="app" icon="library" name="Artifacts" current lit />
          <BarTile kind="app" icon="compass" name="Mandate" />
        </RailBlock>
        <RailPages>
          <BarTile {...args} kind="page" />
          <BarTile kind="page" icon="clock" name="Recent" />
          <BarTile kind="page" icon="people" name="Shared" />
        </RailPages>
      </AppBar>
    </Screen>
  ),
  args: { icon: 'library', name: 'Library', current: true, lit: true, lead: true },
};

/** The divider before the open apps on the desktop bar. */
export const Divider: Story = {
  render: () => (
    <Screen height={180}>
      <AppBar stop={0}>
        <BarTile icon="work" name="Work" />
        <BarDivider />
        <BarTile icon="library" name="Artifacts" running />
      </AppBar>
    </Screen>
  ),
};
