import type { Meta, StoryObj } from '@storybook/react-vite';
import { DateRangeField, TimeField } from './time.js';

/**
 * A time of day, written as you'd say it, like Quill's date field: “9am”, “2.30pm”, “half 2”, “quarter
 * to 5”, “17:30”, “noon”. While you write, the well echoes in mono the time it reads, so you see “14:30”
 * before you leave it. An hour from 1 to 6 said alone is in the afternoon. Something it can't read turns
 * it red with an example. Its value is HH:MM on a 24-hour clock.
 *
 * Beside it, `DateRangeField`: two date fields joined by a line, and how many days it spans under them.
 */
const meta = {
  title: 'Quill/Time field',
  component: TimeField,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 'var(--measure-decision)' }}><Story /></div>],
  args: { label: 'Starts at', hint: 'Its local time.', defaultValue: '14:30' },
  argTypes: {
    state: { control: 'inline-radio', options: ['idle', 'attention', 'error', 'warning', 'valid'] },
    message: { control: 'text' },
    placeholder: { control: 'text' },
    onChange: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof TimeField>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. Click in and write “half 2”. */
export const Playground: Story = {};
export const Empty: Story = { args: { defaultValue: undefined } };
export const Required: Story = { args: { hint: undefined, defaultValue: undefined, required: true, state: 'attention', message: 'Needs you.' } };
export const Wrong: Story = { args: { hint: undefined, defaultValue: undefined, state: 'error', message: 'Try “9am”, “half 2” or “17:30”.' } };

/** A range of days: from Friday 13 November for a week, eight days counted inclusive. */
export const DateRange: Story = {
  render: () => <DateRangeField label="Away" hint="Your team sees this on the floor's calendar." defaultValue={{ from: '2026-11-13', to: '2026-11-20' }} now={new Date('2026-11-06T12:00:00')} />,
};
/** An end before the start: the end turns red and says so. */
export const RangeBackwards: Story = {
  render: () => <DateRangeField label="Away" defaultValue={{ from: '2026-11-20', to: '2026-11-13' }} now={new Date('2026-11-06T12:00:00')} />,
};
