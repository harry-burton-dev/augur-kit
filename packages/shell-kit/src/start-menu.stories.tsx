import type { Meta, StoryObj } from '@storybook/react-vite';
import { iconNames } from '@augur/kit-common';
import { StartMenuDivider, StartMenuFolder, StartMenuItem, StartMenu } from './app-bar.js';

/**
 * A start menu, the panel an app bar tile opens: solid, hairline-edged, words on every row. Its rows
 * are StartMenuItems (open an app, or an action such as Close) and StartMenuFolders (roll out to the side). On
 * the bar, the bar opens and places menus; here one is shown on its own.
 */
const meta = {
  title: 'Aerie/App bar/Start menu',
  component: StartMenu,
  parameters: { layout: 'padded' },
  render: (args) => (
    <div style={{ position: 'relative', minHeight: 320 }}>
      <StartMenu {...args}>
        <StartMenuItem icon="library" name="Artifacts" line="What your floors keep" lit lead />
        <StartMenuItem icon="atlas" name="Atlas" off="Off on this floor. An organisation admin can turn it on." />
        <StartMenuDivider />
        <StartMenuItem icon="close" name="Close Artifacts" />
      </StartMenu>
    </div>
  ),
  argTypes: { children: { control: false } },
  args: { title: 'Context', sub: false },
} satisfies Meta<typeof StartMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Menu: Story = {};

/** One row that opens something. The controls are the row's own props. */
export const Item: StoryObj<typeof StartMenuItem> = {
  render: (args) => (
    <div style={{ position: 'relative', minHeight: 140 }}>
      <StartMenu title="Context">
        <StartMenuItem {...args} />
      </StartMenu>
    </div>
  ),
  argTypes: { icon: { control: 'select', options: iconNames } },
  args: { icon: 'library', name: 'Artifacts', line: 'What your floors keep', off: '', current: false, lit: false, lead: false },
};

/** A folder: on the bar it rolls out to the side. The controls are the folder's own props. */
export const Folder: StoryObj<typeof StartMenuFolder> = {
  render: (args) => (
    <div style={{ position: 'relative', minHeight: 200 }}>
      <StartMenu title="Apps">
        <StartMenuFolder {...args}>
          <StartMenuItem icon="home" name="Home" />
        </StartMenuFolder>
        <StartMenuFolder name="Context" line="What’s known, and what it’s about" />
      </StartMenu>
    </div>
  ),
  args: { name: 'Work', line: 'What you’re doing, and why', lit: false, lead: false },
};
