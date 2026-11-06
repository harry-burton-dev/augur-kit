import type { Meta, StoryObj } from '@storybook/react-vite';
import { UrgentEdge } from './urgent-edge.js';

/**
 * Where an urgent item waits once it's stepped back from its letterbox: a strip along the top of the
 * screen. Drawn as Key, and allowed to be loud: a raised strip with a red lip, the kind in mono, and
 * Open as a key. It stays until the item is resolved, never hides by itself, and opens the letterbox
 * again. The shell places it; there is one at a time, with the rest counted in `queue`.
 */
const meta = {
  title: 'Common/Urgent edge',
  component: UrgentEdge,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { headline: 'Port of Halden closes at 18:00: reroute two vessels', acknowledged: false, onReopen: () => undefined },
  argTypes: { onReopen: { action: 'reopen' }, queue: { control: 'object' }, className: { control: false } },
} satisfies Meta<typeof UrgentEdge>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};

/** Someone has seen it; it still waits until it's resolved. */
export const Acknowledged: Story = { args: { acknowledged: true } };

/** More urgent items wait behind it. */
export const Queue: Story = { args: { queue: { position: 1, total: 3, next: 'Disk 92% full' } } };
