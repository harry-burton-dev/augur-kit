import type { Meta, StoryObj } from '@storybook/react-vite';

import { TextField } from './text-field.js';

/**
 * Somewhere to write, drawn as a well (Well): the Keycap button's counterpart. A key sits up and a field
 * sits down, so the field is a slot a step darker than the ground, square, with its depth drawn
 * as a thicker top line, never an inner shadow. While you write in it, the kit's one focus ring sits around it.
 *
 * - **Required** and left empty, it asks in green ("Needs you"), never red.
 * - **Wrong** content turns it red, with one line saying what is wrong. Typing clears either at once.
 * - **Several lines** (`multiline`) grows as you write; `maxLength` adds a count.
 * - **Read only** shows the slot's outline, dashed, with nothing to write on.
 * - **Unavailable** stays focusable and says why on hover and focus.
 */
const meta = {
  title: 'Common/Text field',
  component: TextField,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 'var(--measure-decision)' }}><Story /></div>],
  args: { label: 'Title', hint: 'What people will see in the library.', placeholder: 'Q3 plan' },
  argTypes: {
    type: { control: 'select', options: ['text', 'email', 'url', 'tel', 'password', 'search'] },
    state: { control: 'inline-radio', options: ['idle', 'attention', 'error', 'warning', 'valid'] },
    message: { control: 'text' },
    reason: { control: 'text' },
    maxLength: { control: 'number' },
    rows: { control: { type: 'number', min: 1, max: 8 } },
    validate: { control: false },
    onChange: { control: false },
    onCommit: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof TextField>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};

/** Leave it empty and move on: it asks in green, not red. */
export const Required: Story = { args: { label: 'Collection', hint: undefined, required: true, state: 'attention', message: 'Needs you.' } };
/** Content that is wrong: red, and one line on what is wrong. */
export const Wrong: Story = { args: { label: 'Email', hint: undefined, defaultValue: 'alex', state: 'error', message: 'That isn’t an email address.' } };
export const Warning: Story = { args: { label: 'Name', hint: undefined, defaultValue: 'Plan', state: 'warning', message: 'Another collection is called this.' } };
export const Valid: Story = { args: { label: 'Address', hint: undefined, defaultValue: 'alex@example.org', state: 'valid' } };
/** Several lines (the kit's textarea): it grows as you write, and a count shows with `maxLength`. */
export const SeveralLines: Story = { args: { label: 'Summary', hint: undefined, multiline: true, maxLength: 280, defaultValue: 'Plans for the third quarter, by floor.' } };
/** Saving or checking: a line runs along the foot of the well. */
export const Busy: Story = { args: { label: 'Address', hint: undefined, defaultValue: 'alex@example.org', busy: true } };
export const ReadOnly: Story = { args: { label: 'Made by', hint: undefined, defaultValue: 'Alex Morgan', readOnly: true } };
/** Can't be changed: it stays focusable and says why on hover and focus. */
export const Unavailable: Story = { args: { label: 'Owner', hint: undefined, defaultValue: 'Alex Morgan', disabled: true, reason: 'Only the library’s owner can change this.' } };
