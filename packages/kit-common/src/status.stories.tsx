import type { Meta, StoryObj } from '@storybook/react-vite';
import { Status, statusUrgency } from './status.js';

/**
 * Where a thing is, as one mark and a word: needs you, running, queued, paused, done, failed, or
 * check. Only **needs you** takes the needs-you colour, and only the first one on screen that needs
 * you pings (`next`). Every mark keeps its own shape, so colour is never the only clue: a dot, a
 * turning arc, a ring, two bars, a tick, a cross and a warning sign.
 *
 * Status is in Common so that Aerie and Quill draw the same marks (PDR-016). Use it in a row, a
 * table cell or a card; with `markOnly` the mark alone carries the word as its name.
 */
const meta = {
  title: 'Common/Status',
  component: Status,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { status: 'needs', next: false, markOnly: false },
  argTypes: {
    status: { control: 'inline-radio', options: statusUrgency },
    label: { control: 'text' },
    markOnly: { control: 'boolean' },
    next: { control: 'boolean' },
    className: { control: false },
  },
} satisfies Meta<typeof Status>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};

/** Something is waiting on you. The only green mark. */
export const NeedsYou: Story = {};
/** The first thing on screen that needs you pings, once per screen. */
export const Next: Story = { args: { next: true } };
/** Under way. */
export const Running: Story = { args: { status: 'running' } };
/** Couldn't finish. */
export const Failed: Story = { args: { status: 'failed' } };
/** A word of its own in place of the default. */
export const OwnWord: Story = { args: { status: 'warning', label: 'Review dates' } };
/** The mark alone, for a narrow cell; the word becomes its name for a screen reader. */
export const MarkOnly: Story = { args: { status: 'done', markOnly: true } };

/** Every status, in the order a list sorts them: what needs you first, finished last. */
export const AllInOrder: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
      {statusUrgency.map((s) => (
        <Status key={s} {...args} status={s} />
      ))}
    </div>
  ),
};
