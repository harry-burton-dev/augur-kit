import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';
import { FocusStage } from './focus.js';
import { RingMore, RingProvider, useRingTarget, type RingAction, type RingOverflow, type RingShape, type RingSubject } from './radial-menu.js';
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

/** More verbs than the ring has directions: a list, or seven and More when the app asks for it. */
const manyActions: RingAction[] = [
  ...documentActions,
  { id: 'duplicate', label: 'Duplicate', icon: 'document' },
  { id: 'pin', label: 'Pin', icon: 'star' },
  { id: 'link', label: 'Copy link', icon: 'link' },
  { id: 'download', label: 'Download', icon: 'download' },
];

interface Picks {
  shape: RingShape;
  overflow?: RingOverflow;
  /** Open the menu on the second row when the story loads, then press these keys: a state to look at. */
  keys?: string[];
  /** Put the rows at the right edge, to see the ring kept whole on screen. */
  edge?: boolean;
  many?: boolean;
}

function Example({ shape, overflow = 'list', keys, edge = false, many = false }: Picks) {
  const [said, setSaid] = useState('Right-click a row or a tile, use the … mark, or Shift+F10.');
  const here = useRef<HTMLDivElement>(null);
  const subject = (label: string): RingSubject => ({
    label,
    actions: many ? manyActions : documentActions,
    onAction: (id, target) => setSaid(target ? `${id} ${label} to ${target}` : `${id} ${label}`),
    onAsk: (id) => setSaid(`Asked for ${id} on ${label}`),
  });
  useEffect(() => {
    if (!keys) return;
    const row = here.current?.querySelectorAll<HTMLElement>('[data-ring-target]')[1];
    if (!row) return;
    const r = row.getBoundingClientRect();
    row.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: r.left + r.width * (edge ? 0.9 : 0.4), clientY: r.top + r.height / 2 }));
    const menu = () => document.querySelector('[role="menu"]');
    const press = (k: string) => (document.activeElement ?? menu())?.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    // One key at a time, so each lands after the last one has drawn.
    const timers = keys.map((k, n) => setTimeout(() => press(k), 60 * (n + 1)));
    return () => timers.forEach(clearTimeout);
  }, [keys, edge]);
  return (
    <FocusStage>
      <RingProvider shape={shape} overflow={overflow}>
        <div ref={here} style={{ display: 'grid', gap: 'var(--space-6)', padding: 'var(--space-8)', maxWidth: 'var(--measure-prose)', marginLeft: edge ? 'auto' : undefined }}>
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
  argTypes: { shape: { control: 'inline-radio', options: ['auto', 'ring', 'list'] }, overflow: { control: 'inline-radio', options: ['list', 'more'] } },
  args: { shape: 'auto' },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Two rings (Endstate principle 2). Seven verbs in wedges in fixed directions, Open up and Delete
 * down, each named inside its wedge; Cancel in the hub. Right-click a row, use the … mark, or
 * Shift+F10. Keys: arrows go round, 1 to 8 pick a direction, Enter chooses, Esc closes.
 */
export const Document: Story = {};

/** Open on a row: the ring centred where it was opened, the row kept sharp, the readout saying where you are. */
export const Opened: Story = { args: { keys: [] } };

/**
 * Share's targets on the outer ring, fanned out in its own direction (2, then ArrowRight). Where it
 * already is shows but can't be chosen; Everyone is locked and says why.
 */
export const Targets: Story = { args: { keys: ['2', 'ArrowRight', 'ArrowDown'] } };

/** Publish can't be done: hatched and locked, it stays in its place, and the readout says why and who can change it. */
export const Unavailable: Story = { args: { keys: ['3'] } };

/** Delete is held to confirm: the hub fills while Enter or the pointer is held, and letting go early cancels. */
export const Held: Story = { args: { keys: ['5'] } };

/** Opened near the right edge: the ring moves in, whole, so no verb changes direction. */
export const NearAnEdge: Story = { args: { keys: [], edge: true } };

/** Eleven verbs, more than the ring has directions: a list in the same order. */
export const PastEight: Story = { args: { keys: [], many: true } };

/** Eleven verbs, with the app asking for More: seven keep their directions and More holds the rest. */
export const PastEightWithMore: Story = { args: { keys: [], many: true, overflow: 'more' } };

/** The same actions as a list. */
export const AsList: Story = { args: { shape: 'list' } };
