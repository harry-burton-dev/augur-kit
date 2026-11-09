import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './skeleton.js';

/**
 * What stands where content will be while it loads: empty wells in the shape of what comes, breathing
 * slowly (still under reduced motion). Use it where the shape is known, such as a document, a card or a
 * row; where it isn't, use State's loading line. Say what is loading in `label`.
 */
const meta = {
  title: 'Common/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 'var(--measure-card)', maxWidth: '100%' }}>{Story()}</div>],
  args: { label: 'Loading the document', title: true, lines: 3, facts: 3 },
  argTypes: {
    label: { control: 'text' },
    title: { control: 'boolean' },
    lines: { control: { type: 'range', min: 0, max: 5, step: 1 } },
    facts: { control: { type: 'range', min: 0, max: 4, step: 1 } },
    className: { control: false },
  },
} satisfies Meta<typeof Skeleton>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};
/** A document: a title, its text and a row of facts. */
export const Document: Story = {};
/** A few lines of text, no title. */
export const Text: Story = { args: { title: false, lines: 2, facts: 0 } };
