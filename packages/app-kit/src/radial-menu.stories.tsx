import type { Meta, StoryObj } from '@storybook/react-vite';
import { useLayoutEffect, useRef, useState } from 'react';
import { FocusStage } from './focus.js';
import { RadialMenu, type RadialMenuProps } from './radial-menu.js';
import { documentActions, fewActions, manyActions } from './radial-menu.fixture.js';

type Args = Omit<RadialMenuProps, 'target'>;

/** Presses keys in the open menu, one at a time, as a person would: a story's starting state. */
const press = async (...keys: string[]) => {
  for (const key of keys) {
    await new Promise((r) => setTimeout(r, 30));
    const at = document.activeElement ?? document.querySelector('[role="menu"]');
    at?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  }
};


/**
 * The menu, open on one row of a minimal page. The row is its `target`, the thing it was opened on; the
 * controls are the menu's own props. Closing it leaves a button to open it again.
 */
function Stage(args: Args) {
  const row = useRef<HTMLButtonElement>(null);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(true);
  useLayoutEffect(() => setTarget(row.current), []);
  return (
    <FocusStage>
      <div style={{ display: 'grid', gap: 'var(--space-2)', padding: 'var(--space-8)', maxWidth: 'var(--measure-prose)' }}>
        <button type="button" ref={row} style={rowStyle} onClick={() => setOpen(true)}>
          {args.label}
        </button>
        <p className="text-meta text-ink-muted">{open ? 'Esc or Cancel closes it.' : 'Press the row to open the menu again.'}</p>
      </div>
      {open && target ? (
        <RadialMenu
          {...args}
          target={target}
          onClose={() => {
            args.onClose?.();
            setOpen(false);
          }}
        />
      ) : null}
    </FocusStage>
  );
}

/** The row the menu opens on: plain text on the ground, wide enough to point at. */
const rowStyle = { flex: 1, textAlign: 'left', padding: 'var(--space-2) var(--space-3)', background: 'none', border: 0, color: 'var(--ink)', font: 'inherit' } as const;

const meta = {
  title: 'Quill/Radial menu/RadialMenu',
  component: RadialMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    // The menu sits over the whole window, so each story on the Overview page gets a window of its own.
    docs: { story: { inline: false, iframeHeight: 520 } },
  },
  render: (args) => <Stage {...args} />,
  argTypes: {
    shape: { control: 'inline-radio', options: ['auto', 'ring', 'list'] },
    overflow: { control: 'inline-radio', options: ['list', 'more'] },
    actions: { control: 'object' },
    point: { control: 'object' },
    onAction: { action: 'onAction' },
    onAsk: { action: 'onAsk' },
    onClose: { action: 'onClose' },
    target: { table: { disable: true } },
  },
  args: {
    label: 'Joining guidance',
    actions: documentActions,
    shape: 'auto',
    overflow: 'list',
  },
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Seven verbs in their fixed directions, Open up and Delete down, each named inside its wedge, Cancel in the hub. */
export const Default: Story = {};

/** Three verbs: the ring keeps all eight directions, and the ones with nothing in them stay empty. */
export const FewActions: Story = { args: { actions: fewActions } };

/** An action with targets opens them on an outer ring in its own direction. Here Share (2, then ArrowRight). */
export const Targets: Story = {
  play: () => press('2', 'ArrowRight'),
};

/** An unavailable action stays in its place, hatched and locked, and the readout says why and who can change it. */
export const Unavailable: Story = {
  play: () => press('3'),
};

/** Danger sits at the bottom and is held to confirm: the hub fills while Enter or the pointer is held. */
export const Danger: Story = {
  play: () => press('5'),
};

/** More verbs than directions: a list, in the same order, danger last. */
export const PastEight: Story = { args: { actions: manyActions } };

/** More verbs than directions, with `overflow: 'more'`: seven keep their directions and More holds the rest. */
export const PastEightWithMore: Story = { args: { actions: manyActions, overflow: 'more' } };

/** `shape: 'list'`: the same actions and keys as a plain list. */
export const AsList: Story = { args: { shape: 'list' } };
