import type { Meta, StoryObj } from '@storybook/react-vite';
import { Activity, type ActivityEvent } from './activity.js';

const EVENTS: ActivityEvent[] = [
  { id: 'e1', at: '11:40', who: { name: 'Priya Shah', tone: 'department' }, did: 'asked you to approve', what: 'Q3 procurement plan', needsYou: true },
  { id: 'e2', at: '11:05', who: { name: 'Lee Park', tone: 'org' }, did: 'approved the budget for', what: 'Q3 procurement plan' },
  { id: 'e3', at: '10:20', who: { name: 'Sam Ortiz', tone: 'team' }, did: 'edited', what: 'Supplier list' },
  { id: 'e4', at: '09:12', who: { name: 'Sam Ortiz', tone: 'team' }, did: 'shared', what: 'Supplier list' },
  { id: 'e5', at: 'Mon', who: { name: 'Lee Park', tone: 'org' }, did: 'archived', what: 'Q2 plan' },
  { id: 'e6', at: 'Mon', who: { name: 'Jo Bell' }, did: 'commented on', what: 'Q2 plan' },
];

/**
 * What happened, for catching up and as a trail to search: **since you left**.
 *
 * - **Needs you**: what waits on you leaves the flow and sits above it, in the one colour, until it's done.
 * - **Find** looks through who, what and when.
 * - **Seen**: give `seenFrom`, and one ink line marks where you last looked; what you had seen is dimmed under it.
 * - **Pages**: past `pageSize` lines, Newer and Older page through it, so it never scrolls.
 */
const meta = {
  title: 'Common/Activity',
  component: Activity,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--measure-glance)' }}>{Story()}</div>],
  args: { label: 'Activity', events: EVENTS, seenFrom: 'e4', pageSize: 8, empty: 'Nothing has happened yet.' },
  argTypes: { events: { control: false }, onOpen: { control: false }, className: { control: false }, seenFrom: { control: 'inline-radio', options: [undefined, 'e2', 'e3', 'e4', 'e5'] } },
} satisfies Meta<typeof Activity>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Default: Story = {};

/** A long trail pages with Newer and Older. */
export const Pages: Story = { args: { pageSize: 3, seenFrom: undefined } };

/** The thing each line is about opens. */
export const Opening: Story = { args: { onOpen: () => undefined } };

/** Nothing yet. */
export const Empty: Story = { args: { events: [] } };
