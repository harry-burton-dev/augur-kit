import type { Meta, StoryObj } from '@storybook/react-vite';
import { Timeline, type TimelineItem } from './things.js';

const NOW = new Date('2026-11-06T12:00:00Z');
const ITEMS: TimelineItem[] = [
  { at: '2026-11-06T09:12:00Z', who: 'Priya', what: 'approved the night roster' },
  { at: '2026-11-06T08:40:00Z', who: 'Lee', what: 'swapped two shifts' },
  { at: '2026-11-05T17:05:00Z', who: 'Sam', what: 'asked for leave, 12–16 Dec' },
  { at: '2026-11-05T11:30:00Z', who: 'Ops', what: 'imported the port list' },
  { at: '2026-11-03T10:00:00Z', who: 'Priya', what: 'opened the roster' },
  { at: '2026-11-02T16:20:00Z', who: 'Lee', what: 'drafted the standing rules' },
];

/**
 * What happened, newest first, grouped by day: who, then what, at a time of day. Drawn as Key: the
 * events sit in a well with no lines between them, days and times are mono, and the event you point
 * at lightens. Five show; the rest wait behind Earlier, so the page doesn't need to scroll.
 */
const meta = {
  title: 'Quill/Timeline',
  component: Timeline,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 'var(--measure-decision)' }}>{Story()}</div>],
  args: { items: ITEMS, limit: 5, now: NOW },
  argTypes: { items: { control: 'object' }, limit: { control: { type: 'number', min: 0 } }, now: { control: false }, className: { control: false } },
} satisfies Meta<typeof Timeline>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};

/** Everything at once, nothing folded. */
export const All: Story = { args: { limit: 0 } };
