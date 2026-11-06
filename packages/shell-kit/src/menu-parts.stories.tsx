import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { iconNames } from '@augur/kit-common';
import { AppTile, AppTiles, MenuChoice, MenuKeys, MenuLink, MenuNote, MenuPair, MenuRetry, MenuSearch, MenuSkeleton, MenuSwitch, MenuWho } from './shell-menu.js';
import { PartStage, densities, sampleApps, sampleKeys } from './shell-menu.fixture.js';

/**
 * The rest of what goes in a view: app tiles, the search field, pairs with a switch or a choice, the keys,
 * who's signed in, and the notes a view says when it's catching up, couldn't, or has nothing. The controls on
 * each story are that part's own props.
 */
const meta = {
  title: 'Aerie/Shell menu/View parts',
  component: AppTile,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <PartStage>
      <AppTiles>
        <AppTile {...args} />
        {sampleApps.slice(1).map((a) => (
          <AppTile key={a.id} name={a.name} icon={a.icon} line={a.line} ai={a.ai} />
        ))}
      </AppTiles>
    </PartStage>
  ),
  argTypes: { icon: { control: 'select', options: iconNames }, onPress: { action: 'onPress' } },
  args: { name: 'Documents', icon: 'document', line: 'What your floors keep', now: true, ai: false },
} satisfies Meta<typeof AppTile>;
export default meta;
type Story = StoryObj<typeof meta>;

/** An app tile among others: the first is the one that's open, and says so. An AI app's icon sits in a bubble. Left and right move between them. */
export const AppTileStory: Story = { name: 'App tile' };

/** The search field at the top of Find. */
export const Search: StoryObj<typeof MenuSearch> = {
  render: function Render(args) {
    const [q, setQ] = useState(args.value);
    return (
      <PartStage>
        <MenuSearch {...args} value={q} onChange={(v) => (setQ(v), args.onChange?.(v))} />
      </PartStage>
    );
  },
  argTypes: { onChange: { action: 'onChange' }, onEnter: { action: 'onEnter' } },
  args: { label: 'Find across apps, notifications and agents', placeholder: 'Find apps, notifications, agents…', value: '' },
};

/** A setting and its switch, named by the words beside it. */
export const Switch: StoryObj<typeof MenuSwitch> = {
  render: function Render(args) {
    const [on, setOn] = useState(args.on);
    return (
      <PartStage>
        <MenuPair label="Reduce motion" labelId={args.labelledBy}>
          <MenuSwitch {...args} on={on} onToggle={() => (setOn(!on), args.onToggle?.())} />
        </MenuPair>
      </PartStage>
    );
  },
  argTypes: { onToggle: { action: 'onToggle' } },
  args: { labelledBy: 'story-rm', on: false },
};

/** One of a few, side by side. */
export const Choice: StoryObj<typeof MenuChoice> = {
  render: function Render(args) {
    const [v, setV] = useState(args.value);
    return (
      <PartStage>
        <MenuPair label={args.label}>
          <MenuChoice {...args} value={v} onChange={(id) => (setV(id), args.onChange?.(id))} />
        </MenuPair>
      </PartStage>
    );
  },
  argTypes: { onChange: { action: 'onChange' } },
  args: { label: 'Density', options: densities, value: 'comfortable' },
};

/** A name and its value, or two things side by side. */
export const Pair: StoryObj<typeof MenuPair> = {
  render: (args) => (
    <PartStage>
      <MenuPair {...args} />
      <MenuPair>
        <MenuLink>Switch workspace</MenuLink>
        <MenuLink>Sign out</MenuLink>
      </MenuPair>
    </PartStage>
  ),
  argTypes: { label: { control: 'text' }, value: { control: 'text' }, children: { control: false } },
  args: { label: 'Version', value: '0.14.0', version: true },
};

/** The keys that work in the menu, each beside what it does. */
export const Keys: StoryObj<typeof MenuKeys> = {
  render: (args) => (
    <PartStage>
      <MenuKeys {...args} />
    </PartStage>
  ),
  args: { keys: sampleKeys },
};

/** Who's signed in, at the top of Account. */
export const Who: StoryObj<typeof MenuWho> = {
  render: (args) => (
    <PartStage>
      <MenuWho {...args} />
    </PartStage>
  ),
  args: { name: 'Sam Lee', detail: 'sam@example.org' },
};

/** A sentence in a view. `busy` while catching up (with grey bars where rows will be), `error` when it couldn't (with Try again), `looking` under a group still answering. */
export const Note: StoryObj<typeof MenuNote> = {
  render: (args) => (
    <PartStage>
      <MenuNote {...args} />
      {args.tone === 'busy' ? <MenuSkeleton /> : null}
      {args.tone === 'error' ? <MenuRetry /> : null}
    </PartStage>
  ),
  argTypes: { tone: { control: 'inline-radio', options: [undefined, 'busy', 'error', 'looking', 'late', 'failed'] }, children: { control: 'text' } },
  args: { children: 'All quiet. Nothing needs you.', focusable: true },
};
