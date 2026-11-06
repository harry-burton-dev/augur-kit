import type { Meta, StoryObj } from '@storybook/react-vite';
import { FocusStage } from './focus.js';
import { Reel, type ReelItem } from './reel.js';

const item = (id: string, title: string, when: string, urgent = false, from?: string): ReelItem => ({ id, title, when, urgent, from, onOpen: () => undefined });

const ACTIONS: ReelItem[] = [
  item('a1', 'Sign off joining pack', 'Late', true, 'People'),
  item('a2', 'Review site plan', 'Today 12:00', true, 'Sites'),
  item('a3', 'Approve budget update', 'Today 15:00', true),
  item('a4', 'Approve leave guidance', 'Thu'),
  item('a5', 'Reply on code of conduct', 'Thu'),
];

/**
 * A lane of cards on a front page: what needs you, what's new, what's coming. The card in front
 * is in focus and the rest sit ambient beside it until you hover, focus or press one, which brings
 * it forward; pressing the card in front opens it. The reel scrolls sideways natively, so a wheel,
 * a trackpad, a finger and the keyboard all work.
 *
 * - **tone** sets its light and how loud it is: `action`, `new`, `upcoming` or `quiet`.
 * - **reveal** `pull` keeps the cards behind a light with a count, and each press brings the next
 *   one in; `all` puts them all on the reel at once.
 */
const meta = {
  title: 'Quill/Reel',
  component: Reel,
  tags: ['autodocs'],
  decorators: [(Story) => <FocusStage><div style={{ padding: 'var(--space-6)' }}><Story /></div></FocusStage>],
  args: { label: 'Actions', tone: 'action', items: ACTIONS, reveal: 'all', noun: 'action' },
  argTypes: {
    tone: { control: 'inline-radio', options: ['action', 'new', 'upcoming', 'quiet'] },
    reveal: { control: 'inline-radio', options: ['all', 'pull'] },
    items: { control: 'object' },
    ambience: { control: false },
  },
} satisfies Meta<typeof Reel>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};
/** The cards wait behind the light; press it to bring the next one in. */
export const Pull: Story = { args: { reveal: 'pull' } };
/** What's new, a quieter light. */
export const New: Story = { args: { label: 'New', tone: 'new', noun: 'new document', items: ACTIONS.slice(2).map((i) => ({ ...i, urgent: false })) } };
/** What's coming, quieter still. */
export const Upcoming: Story = { args: { label: 'Upcoming', tone: 'upcoming', noun: 'upcoming item', items: ACTIONS.slice(3).map((i) => ({ ...i, urgent: false })) } };
