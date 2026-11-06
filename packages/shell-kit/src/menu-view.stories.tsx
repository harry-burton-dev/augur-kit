import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { MenuArc, MenuCaption, MenuEsc, MenuNote, MenuRetry, MenuSkeleton, MenuView, ShellMenu } from './shell-menu.js';
import { MenuStage, sampleFunctions, sampleViews } from './shell-menu.fixture.js';

/**
 * A view, opened under the arc at the reading measure: the stream, Apps, Find, Agents, Account, Settings, or
 * one of the host's own. It holds rows, groups, notes, a search and pairs, each a part with its own page.
 * Views are sized to fit the screen; only a long one scrolls, with the kit's thin bar. Each story here is
 * one of the Shell's views put together from those parts with sample content.
 */
const meta = {
  title: 'Aerie/Shell menu/View',
  component: MenuView,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, iframeHeight: 640 } } },
  argTypes: { children: { control: false } },
  args: { label: 'Settings' },
} satisfies Meta<typeof MenuView>;
export default meta;
type Story = StoryObj<typeof meta>;

/** A view in its place under the arc. */
const InMenu = ({ view, title, label, children }: { view: string; title: string; label: string; children: ReactNode }) => (
  <MenuStage view={view}>
    <ShellMenu open mood="needs">
      <MenuArc items={sampleFunctions} lit={view} mood="needs" />
      {view === 'stream' ? <MenuCaption title={title} line="Review the budget draft" mood="needs" /> : <MenuCaption title={title} />}
      <MenuView label={label}>{children}</MenuView>
      <MenuEsc back />
    </ShellMenu>
  </MenuStage>
);

const view = (id: string, title: string): Story => ({
  render: (args) => (
    <InMenu view={id} title={title} label={args.label || title}>
      {sampleViews[id]!()}
    </InMenu>
  ),
  args: { label: title },
});

/** The stream: what needs you first, grouped by app, each group with its ⋯ to mute it. */
export const Stream = view('stream', '1 needs you');
/** Apps: a grid of tiles, the open one first. Left and right move between them. */
export const Apps = view('apps', 'Apps');
/** Find: one field across apps, notifications and agents; a group that's still answering says so. */
export const Find = view('find', 'Find');
/** Agents: the ones that need you first, each saying how it's doing in words. */
export const Agents = view('agents', 'Agents');
/** Account: who you are, your floors, and signing out. */
export const Account = view('account', 'Account');
/** Settings: switches, a choice, the version, and the keys. */
export const Settings = view('settings', 'Settings');
/** Catching up: a note and grey bars where rows will be. */
export const Loading: Story = {
  render: (args) => (
    <InMenu view="agents" title="Agents" label={args.label}>
      <MenuNote tone="busy">Catching up…</MenuNote>
      <MenuSkeleton />
    </InMenu>
  ),
  args: { label: 'Agents' },
};
/** It couldn't load: said as an alert, with Try again. */
export const Failed: Story = {
  render: (args) => (
    <InMenu view="agents" title="Agents" label={args.label}>
      <MenuNote tone="error">Couldn’t reach the agents. They may still be running.</MenuNote>
      <MenuRetry first />
    </InMenu>
  ),
  args: { label: 'Agents' },
};
/** Nothing in it: one sentence, which Tab can reach. */
export const Empty: Story = {
  render: (args) => (
    <InMenu view="stream" title="All quiet" label={args.label}>
      <MenuNote focusable first>
        All quiet. Nothing needs you.
      </MenuNote>
    </InMenu>
  ),
  args: { label: 'All quiet' },
};
