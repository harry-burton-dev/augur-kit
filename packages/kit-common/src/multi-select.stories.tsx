import type { Meta, StoryObj } from '@storybook/react-vite';
import { MultiSelect } from './multi-select.js';

const floors = ['Ground', 'Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5', 'Roof plant'];

/**
 * Pick several from a set (floors, teams, kinds of thing) without what you chose taking over the form. The
 * well says what you chose in words, cut short to one line, and a small key at its end holds the count.
 * Pressed, a sheet opens under it with a check well on every row and how many are chosen at its foot;
 * each tick takes effect at once. Up to about twelve options; for more, let people filter first.
 *
 * - **Nothing chosen** shows the placeholder, which usually means "all" ("Any floor").
 * - **Required** and left empty, it asks in green when the sheet closes.
 */
const meta = {
  title: 'Common/Multi select',
  component: MultiSelect,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 'var(--measure-decision)' }}><Story /></div>],
  args: { label: 'Floors', hint: 'Where the notice shows.', options: floors, heading: 'Floors', placeholder: 'Any floor' },
  argTypes: {
    state: { control: 'inline-radio', options: ['idle', 'attention', 'error', 'warning', 'valid'] },
    message: { control: 'text' },
    reason: { control: 'text' },
    placeholder: { control: 'text' },
    heading: { control: 'text' },
    onChange: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof MultiSelect>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};
/** Four chosen: the words cut short, the count in a key. */
export const Chosen: Story = { args: { defaultValue: ['Floor 1', 'Floor 2', 'Floor 4', 'Roof plant'] } };
/** Left empty: it asks in green, not red. */
export const Required: Story = { args: { hint: undefined, required: true, placeholder: 'None chosen', state: 'attention', message: 'Needs you.' } };
export const Unavailable: Story = { args: { hint: undefined, defaultValue: ['Floor 2'], disabled: true, reason: 'Only the floor’s manager can change where it shows.' } };
