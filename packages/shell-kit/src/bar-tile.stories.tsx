import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppBar, BarDivider, BarLogo, BarTile, RailBlock, RailPages } from './app-bar.js';
import { Screen } from './app-bar.fixture.js';
import { iconNames } from '@augur/kit-common';

/**
 * A tile on the app bar: one large icon with its name under it. With `menu` it opens a start menu.
 * In the docked rail it takes a `kind`: `app` for an open app, `page` for one of the app's pages.
 * The logo button (BarLogo) starts the desktop bar and ends the rail. The controls are the tile's own props.
 */
const meta = {
  title: 'Aerie/App bar/Bar tile',
  component: BarTile,
  tags: ['autodocs'],
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
    menuTitle: { control: 'text' },
    current: { control: 'boolean' },
    running: { control: 'boolean' },
    lit: { control: 'boolean' },
    lead: { control: 'boolean' },
    start: { control: 'boolean' },
    onPress: { control: false },
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

/** The tiles in the docked rail: the fixed block (the open apps), the app's pages, and the logo at the bottom. */
export const InTheRail: Story = {
  render: (args) => (
    <Screen height={640}>
      <AppBar mode="app">
        <RailBlock>
          <BarTile kind="app" icon="library" name="Artifacts" current lit />
          <BarTile kind="app" icon="compass" name="Mandate" />
        </RailBlock>
        <RailPages>
          <BarTile {...args} kind="page" />
          <BarTile kind="page" icon="clock" name="Recent" />
          <BarTile kind="page" icon="people" name="Shared" />
        </RailPages>
        <BarLogo name="Home" />
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

/** The logo button on the desktop bar, first, with the kit's placeholder mark: you're on the desktop. */
export const Logo: Story = {
  render: () => (
    <Screen height={180}>
      <AppBar stop={0}>
        <BarLogo name="Home" current />
        <BarTile icon="work" name="Work" />
      </AppBar>
    </Screen>
  ),
};

/** A deployment's own mark, from its logo URL. */
const SAMPLE_MARK = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="gray" stroke-width="1.5"/></svg>')}`;
export const LogoFromDeployment: Story = {
  render: () => (
    <Screen height={180}>
      <AppBar stop={0}>
        <BarLogo name="Home" src={SAMPLE_MARK} />
        <BarTile icon="work" name="Work" />
      </AppBar>
    </Screen>
  ),
};

/** Something on the desktop needs you: the logo lights. */
export const LogoLit: Story = {
  render: () => (
    <Screen height={180}>
      <AppBar stop={0}>
        <BarLogo name="Home" lit lead />
      </AppBar>
    </Screen>
  ),
};
