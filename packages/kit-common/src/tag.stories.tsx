import type { Meta, StoryObj } from '@storybook/react-vite';
import { iconNames } from './icon.js';
import { Tag } from './tag.js';

/**
 * A word something is filed under, drawn as a small key (Key, picked 6 Nov 2026): flat, with a
 * small corner and its depth in a thicker bottom line, like the Keycap button. Quiet is a flat
 * outline with no depth, for a row's list of tags. With `onRemove` it carries its own ×, which
 * says what it removes.
 *
 * Tag is in Common so that Aerie and Quill draw the same tags (PDR-016). For several in a row,
 * with the rest folded behind "+N more", use Tags.
 */
const meta = {
  title: 'Common/Tag/Tag',
  component: Tag,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { label: 'Safety', quiet: false },
  argTypes: {
    label: { control: 'text' },
    icon: { control: 'select', options: [undefined, ...iconNames] },
    quiet: { control: 'boolean' },
    removeLabel: { control: 'text' },
    onRemove: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof Tag>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};
/** A small key with a word on it. */
export const Plain: Story = {};
/** A kit icon before the word. */
export const WithIcon: Story = { args: { label: 'Procurement', icon: 'people' } };
/** With its own × to take it off. */
export const Removable: Story = { args: { onRemove: () => undefined } };
/** No depth, for a row's list of tags. */
export const Quiet: Story = { args: { quiet: true } };
/** A long word stops at the space it has, with an ellipsis. */
export const LongWord: Story = {
  args: { label: 'Northern region winter works programme' },
  decorators: [(Story) => <div style={{ width: 'var(--space-8)' }}><Story /></div>],
};
