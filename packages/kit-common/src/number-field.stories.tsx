import type { Meta, StoryObj } from '@storybook/react-vite';
import { NumberField } from './number-field.js';

/**
 * A limit, a count or an amount. The number sits in mono in a text field's well with its unit after it
 * in small capitals, and two small keys at the well's end step it down and up. Held, a key repeats; it
 * stops at `min` and `max`, and that key dims. Arrow keys step it too, and the person's own way of writing
 * numbers (decimals, currency, percent) comes from `formatOptions`.
 *
 * - **Required** and left empty, it asks in green.
 * - **Wrong**: `validate` returns a check, and it turns red with one line saying what is wrong.
 */
const meta = {
  title: 'Common/Number field',
  component: NumberField,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 'var(--measure-decision)' }}><Story /></div>],
  args: { label: 'Storage limit', hint: 'For the whole library.', unit: 'GB', defaultValue: 40, min: 5, max: 200, step: 5 },
  argTypes: {
    state: { control: 'inline-radio', options: ['idle', 'attention', 'error', 'warning', 'valid'] },
    message: { control: 'text' },
    reason: { control: 'text' },
    unit: { control: 'text' },
    validate: { control: false },
    formatOptions: { control: 'object' },
    onChange: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof NumberField>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};
/** At its ceiling: the more key dims. */
export const AtTheLimit: Story = { args: { label: 'Seats', hint: undefined, unit: 'people', defaultValue: 50, min: 1, max: 50, step: 1 } };
/** Written the person's way: a share, as a percent. */
export const Percent: Story = { args: { label: 'Discount', hint: undefined, unit: undefined, defaultValue: 0.15, min: 0, max: 1, step: 0.05, formatOptions: { style: 'percent' } } };
export const Required: Story = { args: { hint: undefined, defaultValue: null, required: true, state: 'attention', message: 'Needs you.' } };
export const Wrong: Story = { args: { hint: undefined, defaultValue: 250, max: 500, state: 'error', message: 'This floor has 200 GB left.' } };
export const Unavailable: Story = { args: { hint: undefined, disabled: true, reason: 'Limits are set by your administrator.' } };
