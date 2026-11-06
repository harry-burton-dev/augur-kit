import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tags, type TagItem } from './tag.js';

const TOPICS: TagItem[] = ['Safety', 'Budget', 'Hiring', 'Travel', 'Training', 'Suppliers', 'Leave', 'Sites'].map((label) => ({ id: label.toLowerCase(), label }));

/**
 * Several tags in a row, wrapping onto the next line. Past `limit`, the rest fold behind one
 * "+N more" key that opens them in place, and "Fewer" folds them away again, so a long set never
 * pushes what's below out of sight. The words on the fold are props, for a deployment's own words.
 */
const meta = {
  title: 'Common/Tag/Tags',
  component: Tags,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 'var(--measure-decision)' }}><Story /></div>],
  args: { items: TOPICS, limit: 4, quiet: false, label: 'Topics', fewerLabel: 'Fewer' },
  argTypes: {
    items: { control: 'object' },
    limit: { control: { type: 'number', min: 0, max: 8 } },
    quiet: { control: 'boolean' },
    label: { control: 'text' },
    fewerLabel: { control: 'text' },
    moreLabel: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof Tags>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};
/** Four show; the rest wait behind "+4 more". */
export const Folded: Story = {};
/** Every tag, wrapping. */
export const All: Story = { args: { limit: 0 } };
/** Quiet, for a row in a list. */
export const Quiet: Story = { args: { quiet: true, limit: 3 } };
/** Each tag with its own ×. */
export const Removable: Story = { args: { items: TOPICS.slice(0, 3).map((t) => ({ ...t, onRemove: () => undefined })), limit: 0 } };
