import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ShellBar } from './shell-bar.js';
import { exampleShell } from './shell.fixture.js';
import { Screen } from './app-bar.fixture.js';

/**
 * The shell's app bar: the App bar's parts put together from a `ShellModel`, the way the Shell draws
 * them. Groups come from `groups` and each app's `group`, pages from each app's `pages`, open apps
 * from `running`, and the light from what needs you in the stream. Pressing a tile tells the model,
 * which tells the host (`ui-open-app`, `ui-home`, `ui-page`, `ui-close-app`).
 */
function Demo({ app, holds }: { app?: string; holds?: 'groups' | 'folder' }) {
  const [model] = useState(() => {
    const m = exampleShell(undefined, app ?? '');
    m.barHolds = holds ?? 'groups';
    return m;
  });
  return (
    <Screen>
      <ShellBar model={model} />
    </Screen>
  );
}
const Keyed = (args: { app?: string; holds?: 'groups' | 'folder' }) => <Demo key={`${args.app}-${args.holds}`} {...args} />;

const meta = {
  title: 'Aerie/App bar/Shell bar',
  component: Demo,
  render: (args) => <Keyed {...args} />,
  parameters: { layout: 'padded' },
  argTypes: { app: { control: 'inline-radio', options: ['', 'docs', 'mandate'] }, holds: { control: 'inline-radio', options: ['groups', 'folder'] } },
  args: { app: '', holds: 'groups' },
} satisfies Meta<typeof Demo>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The desktop: a tile per group, then the open app. Something in Documents' Shared page needs you, so the way down is lit. */
export const Desktop: Story = {};
/** Documents open: the rail, with its pages. */
export const AppOpen: Story = { args: { app: 'docs' } };
/** One Apps tile holding the groups as folders. */
export const OneFolder: Story = { args: { holds: 'folder' } };
