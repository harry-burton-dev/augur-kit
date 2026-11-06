import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Comments, type CommentPoint } from './comments.js';

const POINTS: CommentPoint[] = [
  { id: 'p1', by: { name: 'Lee Park', tone: 'org' }, at: 'Mon', text: 'Is the budget approved?', settled: { by: 'Lee Park', summary: 'Budget approved' } },
  {
    id: 'p2',
    by: { name: 'Priya Shah', tone: 'department' },
    at: '10:02',
    text: 'Is October firm? I need it before I sign.',
    asksYou: true,
    replies: [{ id: 'r1', by: { name: 'Sam Ortiz', tone: 'team' }, at: '10:20', text: 'Yes, unless legal object.' }],
  },
  { id: 'p3', by: { name: 'Sam Ortiz', tone: 'team' }, at: 'Yesterday', text: 'Legal have the drafts.' },
];

/**
 * Comments as **points**, like a snag list: each comment opens a point that stays open until someone settles it.
 *
 * - **Open** points take the room. The ones that **ask you** come first, with an edge in the one colour.
 * - **Replies** sit one step in on a hairline, never deeper.
 * - **Settled** points fold to one dim line, saying who settled them and how. Press one to read it again.
 * - Give `onAdd`, `onReply` and `onSettle` to let people write here; leave them out to only read.
 *
 * Put it in the app's drawer beside the thing it's about, with the thing dimmed back, so the page still fits.
 */
const meta = {
  title: 'Common/Comments',
  component: Comments,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--measure-drawer)' }}>{Story()}</div>],
  args: { label: 'Comments', points: POINTS, empty: 'No comments yet.' },
  argTypes: { points: { control: false }, className: { control: false }, onAdd: { control: false }, onReply: { control: false }, onSettle: { control: false } },
} satisfies Meta<typeof Comments>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Read only: change the label from the controls. */
export const Default: Story = {};

/** Raise, reply to and settle points. */
export const Writing: Story = {
  render: (args) => {
    function Live() {
      const [points, setPoints] = useState(POINTS);
      let n = 0;
      const id = () => `new-${Date.now()}-${n++}`;
      const me = { name: 'Alex Morgan', tone: 'you' as const };
      return (
        <Comments
          {...args}
          points={points}
          onAdd={(text) => setPoints([...points, { id: id(), by: me, at: 'Now', text }])}
          onReply={(pid, text) => setPoints(points.map((p) => (p.id === pid ? { ...p, replies: [...(p.replies ?? []), { id: id(), by: me, at: 'Now', text }] } : p)))}
          onSettle={(pid) => setPoints(points.map((p) => (p.id === pid ? { ...p, asksYou: false, settled: { by: me.name } } : p)))}
        />
      );
    }
    return <Live />;
  },
};

/** Nothing yet. */
export const Empty: Story = { args: { points: [] } };
