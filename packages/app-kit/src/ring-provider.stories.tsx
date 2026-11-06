import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { FocusStage } from './focus.js';
import { RingMore, RingProvider, useRingTarget, type RingSubject } from './radial-menu.js';
import { documentActions } from './radial-menu.fixture.js';
import { KindTile, Tiles } from './tiles.js';

/** A row that opens the menu: `useRingTarget` on the row, and `RingMore` beside it as the visible way in. */
function Row({ subject }: { subject: RingSubject }) {
  const ring = useRingTarget(() => subject);
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
      <button type="button" {...ring} style={rowStyle}>
        {subject.label}
      </button>
      <RingMore subject={() => subject} />
    </li>
  );
}

/** A minimal app: two rows and a tile inside one provider. What was chosen is said under them. */
function App(args: { shape: 'auto' | 'ring' | 'list'; overflow: 'list' | 'more' }) {
  const [said, setSaid] = useState('Right-click a row or the tile, use the … mark, or Shift+F10.');
  const subject = (label: string): RingSubject => ({
    label,
    actions: documentActions,
    onAction: (id, target) => setSaid(target ? `${id} ${label} to ${target}` : `${id} ${label}`),
    onAsk: (id) => setSaid(`Asked for ${id} on ${label}`),
  });
  return (
    <FocusStage>
      <RingProvider {...args}>
        <div style={{ display: 'grid', gap: 'var(--space-6)', padding: 'var(--space-8)', maxWidth: 'var(--measure-prose)' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            <Row subject={subject('Site index')} />
            <Row subject={subject('Joining guidance')} />
          </ul>
          <Tiles label="Documents">
            <KindTile kind="document" eyebrow="Document" name="Budget update" count="v3" onOpen={() => setSaid('Opened Budget update')} ring={() => subject('Budget update')} />
          </Tiles>
          <p className="text-meta text-ink-muted" aria-live="polite">
            {said}
          </p>
        </div>
      </RingProvider>
    </FocusStage>
  );
}

/** The row the menu opens on: plain text on the ground, wide enough to point at. */
const rowStyle = { flex: 1, textAlign: 'left', padding: 'var(--space-2) var(--space-3)', background: 'none', border: 0, color: 'var(--ink)', font: 'inherit' } as const;

const meta = {
  title: 'Quill/Radial menu/RingProvider',
  component: RingProvider,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, iframeHeight: 520 } } },
  render: (args) => <App shape={args.shape ?? 'auto'} overflow={args.overflow ?? 'list'} />,
  argTypes: {
    shape: { control: 'inline-radio', options: ['auto', 'ring', 'list'] },
    overflow: { control: 'inline-radio', options: ['list', 'more'] },
    children: { table: { disable: true } },
  },
  args: { shape: 'auto', overflow: 'list', children: null },
} satisfies Meta<typeof RingProvider>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * One menu for the whole app. Anything inside opens it with `useRingTarget` (right-click, the
 * context-menu key, Shift+F10 or a long press), and `RingMore` gives it a visible way in.
 * `AppFrame` puts one in already.
 */
export const InAnApp: Story = {};

/** The app asks for lists instead of rings. */
export const AsLists: Story = { args: { shape: 'list' } };
