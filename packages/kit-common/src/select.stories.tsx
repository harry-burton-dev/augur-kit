import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './select.js';

/**
 * Choose one from a short list, up to about twelve. It is a text field's well with a chevron; opened, its
 * list appears under it and the chosen option carries an ink tick. An option that can't be picked stays in
 * the list, dimmed, and says why. More than twelve wants a search; two to four with a line each is a Choice.
 */
const meta = {
  title: 'Common/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 'var(--measure-decision)' }}><Story /></div>],
  args: { label: 'Kind', hint: 'What sort of record this is.', options: ['Report', 'Note', 'Plan'] },
  argTypes: {
    state: { control: 'inline-radio', options: ['idle', 'attention', 'error', 'warning', 'valid'] },
    message: { control: 'text' },
    reason: { control: 'text' },
    placeholder: { control: 'text' },
    empty: { control: 'text' },
    onChange: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};
export const Picked: Story = { args: { defaultValue: 'Plan' } };
/** Options with a quiet fact each, and one that can't be picked and says why. */
export const Details: Story = {
  args: {
    label: 'Collection',
    hint: undefined,
    required: true,
    options: [
      { value: 'a', label: 'Plans', detail: '12 items' },
      { value: 'b', label: 'Reports', detail: '4 items' },
      { value: 'c', label: 'Archive', detail: 'Only admins can add here', disabled: true },
    ],
  },
};
/** Nothing to pick: it says so, and why. */
export const Empty: Story = { args: { label: 'Collection', hint: undefined, options: [], empty: 'This library has no collections yet.' } };
export const Unavailable: Story = { args: { label: 'Floor', hint: undefined, options: ['Research'], defaultValue: 'Research', disabled: true, reason: 'Floors come from your department.' } };
