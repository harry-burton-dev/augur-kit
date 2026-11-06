import type { Meta, StoryObj } from '@storybook/react-vite';
import { NotificationItem, Notifications, type NotificationEntry } from './notifications.js';

const ITEMS: NotificationEntry[] = [
  { id: 'n1', who: { name: 'Priya Shah', tone: 'department' }, text: 'asked you to approve Q3 procurement plan', at: '11:40', unread: true, needsYou: true },
  { id: 'n2', who: { name: 'Sam Ortiz', tone: 'team' }, text: 'replied to your point on Supplier list', at: '10:20', unread: true },
  { id: 'n3', text: 'Your export of Q2 plan is ready', at: 'Mon' },
  { id: 'n4', who: { name: 'Lee Park', tone: 'org' }, text: 'shared Q2 plan with your team', at: 'Mon' },
];

/**
 * Notifications as **key rows** in a well, like the Key list: newest first, with how many are new.
 *
 * - **Unread** rows are raised as soft keys; read ones sit flat and dimmed. Unread never uses colour.
 * - **Needs you** has an edge in the one colour.
 * - One row on its own is a **NotificationItem**, for the app bar's own list.
 */
const meta = {
  title: 'Common/Notifications',
  component: Notifications,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--measure-glance)' }}>{Story()}</div>],
  args: { label: 'Notifications', items: ITEMS, empty: 'Nothing new.' },
  argTypes: { items: { control: false }, onOpen: { control: false }, className: { control: false } },
} satisfies Meta<typeof Notifications>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change the label from the controls. */
export const Default: Story = {};

/** Each row opens what it's about. */
export const Opening: Story = { args: { onOpen: () => undefined } };

/** One item on its own, in a well of its own making. */
export const Item: Story = {
  render: () => (
    <ul className="augur-notes-well">
      <NotificationItem id="n1" who={{ name: 'Sam Ortiz', tone: 'team' }} text="replied to your point on Supplier list" at="10:20" unread />
    </ul>
  ),
};

/** Nothing new. */
export const Empty: Story = { args: { items: [] } };
