import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { FocusStage } from './focus.js';
import { RingMore, RingProvider, useRingTarget, type RingAction, type RingShape, type RingSubject } from './radial-menu.js';
import { KindTile, Tiles } from './tiles.js';

/** A document's verbs, each in its fixed direction, with targets, a preview, an unavailable one and a held one. */
const documentActions: RingAction[] = [
  { id: 'open', label: 'Open', icon: 'arrow', slot: 'n' },
  {
    id: 'share',
    label: 'Share',
    icon: 'people',
    slot: 'ne',
    preview: (t) => ({ team: 'Already shared with your team', dept: '41 more people can read this', region: '230 more people can read this' })[t ?? ''] ?? 'Choose who can read it',
    targets: [
      { id: 'team', label: 'Your team', detail: '6 people', current: true },
      { id: 'dept', label: 'Department', detail: '41 people' },
      { id: 'region', label: 'Northern region', detail: '230 people' },
      { id: 'org', label: 'Everyone', disabled: true, reason: 'Only the region’s leads can share with everyone' },
    ],
  },
  { id: 'publish', label: 'Publish', icon: 'publish', slot: 'e', disabled: true, reason: 'It needs a review first', owner: 'Sam, its reviewer' },
  {
    id: 'move',
    label: 'Move',
    icon: 'folder',
    slot: 'se',
    preview: (t) => (t ? 'Two links to it will be updated' : 'Choose where it goes'),
    targets: [
      { id: 'sites', label: 'Sites', current: true },
      { id: 'people', label: 'People' },
      { id: 'weekly', label: 'Weekly updates' },
    ],
  },
  { id: 'delete', label: 'Delete', icon: 'delete', danger: true, preview: 'Three documents cite this one' },
  { id: 'history', label: 'History', icon: 'history', slot: 'sw' },
  { id: 'rename', label: 'Rename', icon: 'rename', slot: 'w' },
];

function Row({ subject }: { subject: RingSubject }) {
  const ring = useRingTarget(() => subject);
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
      <button type="button" {...ring} style={{ flex: 1, textAlign: 'left', padding: 'var(--space-2) var(--space-3)', background: 'none', border: 0, color: 'var(--ink)', font: 'inherit' }}>
        {subject.label}
      </button>
      <RingMore subject={() => subject} />
    </li>
  );
}

function Example({ shape }: { shape: RingShape }) {
  const [said, setSaid] = useState('Right-click a row or a tile, use the … mark, or Shift+F10.');
  const subject = (label: string): RingSubject => ({
    label,
    actions: documentActions,
    onAction: (id, target) => setSaid(target ? `${id} ${label} to ${target}` : `${id} ${label}`),
    onAsk: (id) => setSaid(`Asked for ${id} on ${label}`),
  });
  return (
    <FocusStage>
      <RingProvider shape={shape}>
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

const meta = {
  title: 'Quill/Radial menu',
  component: Example,
  parameters: { layout: 'fullscreen' },
  argTypes: { shape: { control: 'inline-radio', options: ['auto', 'ring', 'list'] } },
  args: { shape: 'auto' },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Seven verbs in fixed directions (Open up, Delete down). Share and Move open their targets
 * (ArrowRight or Enter; Esc comes back), and the readout under the menu says what each would
 * change. Publish is unavailable: its reason and owner are read out, and Enter asks. Delete is
 * held to confirm; with reduced motion it is pressed twice.
 */
export const Document: Story = {};

/** The same actions as a list. */
export const AsList: Story = { args: { shape: 'list' } };
