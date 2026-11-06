import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComboBox } from './combo-box.js';

const departments = [
  'Finance', 'Facilities', 'Field operations', 'Fleet', 'Floor 2 reception', 'Floor 4 operations', 'Flight planning', 'Forecasting',
  'Human resources', 'Legal', 'Marketing', 'Operations', 'Procurement', 'Research', 'Security', 'Transport',
];

/**
 * Type to find one choice in a long list (departments, floors, apps), where a Select would have to scroll.
 * It is a text field's well with a chevron key at its end. As you type, a sheet opens under it with only
 * what matches: the letters you typed stay in full ink, the rest goes quiet, and a count closes the sheet
 * ("4 of 16"). The chevron key shows everything. Up to about twelve, use a Select instead.
 *
 * - **Required** and left empty, it asks in green ("Needs you"), never red.
 * - **Nothing matches**: the sheet says so, in the words given by `empty`.
 * - **Unavailable** stays focusable and says why on hover and focus.
 */
const meta = {
  title: 'Common/Combo box',
  component: ComboBox,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 'var(--measure-decision)' }}><Story /></div>],
  args: { label: 'Department', hint: 'Who looks after this record.', options: departments, heading: 'Departments' },
  argTypes: {
    state: { control: 'inline-radio', options: ['idle', 'attention', 'error', 'warning', 'valid'] },
    message: { control: 'text' },
    reason: { control: 'text' },
    placeholder: { control: 'text' },
    heading: { control: 'text' },
    empty: { control: 'text' },
    onChange: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof ComboBox>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. Type “flo” to see the sheet. */
export const Playground: Story = {};
export const Picked: Story = { args: { defaultValue: 'Floor 4 operations' } };
/** Options with a quiet fact each, and one that can't be picked and says why. */
export const Details: Story = {
  args: {
    label: 'App',
    hint: undefined,
    heading: 'Apps',
    options: [
      { value: 'atlas', label: 'Atlas', detail: 'Maps' },
      { value: 'ledger', label: 'Ledger', detail: 'Finance' },
      { value: 'loom', label: 'Loom', detail: 'Only admins can add apps here', disabled: true },
      { value: 'reel', label: 'Reel', detail: 'Video' },
    ],
  },
};
/** Left empty: it asks in green, not red. */
export const Required: Story = { args: { hint: undefined, required: true, state: 'attention', message: 'Needs you.' } };
export const Unavailable: Story = { args: { hint: undefined, defaultValue: 'Research', disabled: true, reason: 'Departments come from your directory.' } };
