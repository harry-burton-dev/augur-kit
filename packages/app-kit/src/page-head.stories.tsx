import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageHead } from './page.js';
import { SelectionBar } from './selection-bar.js';

/**
 * The top of every app page, in the Line look (picked 6 Nov 2026). A kind label in mono capitals, the
 * title and one line of summary sit on the left; the page's actions sit on the right. Both are fixed
 * slots: on every page, in every app, the title and the main action are in the same place, so the page
 * says where you are without a trail (PDR-014: no breadcrumbs).
 *
 * The head is always `frame-head` tall. In an AppFrame its foot is the frame's horizon, the one line that
 * runs across the rail, the page and the drawer.
 *
 * - **Arrival**: when a link brings you from somewhere else, one line under the title says where from and
 *   why, with a Back. Once you've read it (`arrival.read`), it shrinks to a Back key beside the actions.
 * - **Selection**: while several things are picked, their SelectionBar takes the actions' slot, so what you
 *   can do is always in one place and nothing covers the list.
 * - **Actions**: two show, at most one primary, and the rest go in ⋯.
 */
const meta = {
  title: 'Quill/Page head',
  component: PageHead,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    eyebrow: 'Vessel · IMO 9312345',
    heading: 'MV Halden',
    summary: 'Under way in the North Sea, 38 nm from Brekke.',
    actions: [
      { id: 'plan', label: 'Plan voyage', kind: 'primary' },
      { id: 'share', label: 'Share' },
      { id: 'archive', label: 'Archive' },
    ],
  },
  argTypes: {
    eyebrow: { control: 'text' },
    heading: { control: 'text' },
    summary: { control: 'text' },
    level: { control: { type: 'number', min: 1, max: 6 } },
    trail: { control: false, table: { disable: true } },
    onTrail: { control: false, table: { disable: true } },
    selection: { control: false },
    children: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof PageHead>;
export default meta;
type Story = StoryObj<typeof meta>;

/** A record's head: kind, title, summary, and its actions. */
export const Default: Story = {};

/** Just arrived by a link: one line says where from and why. */
export const Arrival: Story = {
  args: { arrival: { from: 'Night roster', why: 'where Halden’s crew is short a watch', onBack: () => {} } },
};

/** After reading the arrival line: it has shrunk to a Back key beside the actions. */
export const ArrivalRead: Story = {
  name: 'Arrival, read',
  args: { arrival: { from: 'Night roster', onBack: () => {}, read: true } },
};

/** Several things picked: the selection takes the actions’ slot. */
export const Selecting: Story = {
  name: 'Selecting several',
  args: {
    selection: (
      <SelectionBar
        count={2}
        noun={['crew member', 'crew']}
        actions={[
          { id: 'swap', label: 'Swap watch' },
          { id: 'move', label: 'Move to vessel' },
        ]}
        onAction={() => {}}
        onClear={() => {}}
      />
    ),
  },
};
