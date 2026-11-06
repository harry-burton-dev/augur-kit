import type { Meta, StoryObj } from '@storybook/react-vite';
import { KeyCap } from './key-cap.js';

/**
 * A key to press, drawn as a small real key: in a sentence, at the end of a menu row, or in the search
 * field it brings you to. Say the key as it's printed; a combination goes in `keys`, side by side.
 */
const meta = {
  title: 'Common/Key cap',
  component: KeyCap,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { children: 'Esc' },
  argTypes: {
    children: { control: 'text' },
    keys: { control: 'object' },
    className: { control: false },
  },
} satisfies Meta<typeof KeyCap>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};
/** One key. */
export const One: Story = {};
/** Keys pressed together. */
export const Combination: Story = { args: { children: undefined, keys: ['Ctrl', 'K'] } };
/** In a sentence. */
export const InText: Story = {
  render: () => (
    <p style={{ margin: 0, fontSize: 'var(--type-body)', lineHeight: 'var(--leading-body)' }}>
      Press <KeyCap>/</KeyCap> to find, or <KeyCap keys={['Ctrl', 'K']} /> for everything. <KeyCap>Esc</KeyCap> closes.
    </p>
  ),
};
