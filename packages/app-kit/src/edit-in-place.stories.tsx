import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { EditInPlace, type EditInPlaceProps } from './edit-in-place.js';

/**
 * Change one value where it sits, without a form: rename a thing, or change one setting (Key beside,
 * picked 6 Nov 2026). A Rename key always sits beside the value, so the action never hides. Pressed, the
 * value becomes a Well with Save and Cancel keys; Enter saves and Esc puts it back.
 *
 * `onSave` keeps the new value; throw or reject with a sentence to refuse it, and the words typed stay.
 * `check` refuses a value before it is sent. An unavailable value stays, loses its key, and says why.
 * Every word is a prop.
 */
const meta = {
  title: 'Quill/Edit in place',
  component: EditInPlace,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--measure-prose)' }}><Story /></div>],
  args: { label: 'Name', value: 'Night roster', onSave: () => undefined, disabled: false, showLabel: true },
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    actionWord: { control: 'text' },
    saveWord: { control: 'text' },
    cancelWord: { control: 'text' },
    hint: { control: 'text' },
    savedText: { control: 'text' },
    disabled: { control: 'boolean' },
    reason: { control: 'text' },
    showLabel: { control: 'boolean' },
    defaultEditing: { control: 'boolean' },
    onSave: { action: 'saved' },
    check: { control: false },
    actionIcon: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof EditInPlace>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Keeps what you type, so you can try it. */
function Live(args: EditInPlaceProps) {
  const [value, setValue] = useState(args.value);
  return <EditInPlace {...args} value={value} onSave={(v) => new Promise<void>((done) => setTimeout(() => { setValue(v); done(); }, 600))} />;
}

/** Change every prop from the controls; saving takes a moment, as it would. */
export const Playground: Story = { render: (args) => <Live {...args} /> };

/** Editing: a Well with Save and Cancel keys. */
export const Editing: Story = { args: { defaultEditing: true } };

/** A name already taken is refused before it's sent, and what was typed stays. */
export const Refused: Story = {
  render: (args) => <Live {...args} check={(v) => (v.toLowerCase() === 'day roster' ? 'Another floor already has that name. Your words are kept.' : undefined)} />,
  args: { hint: 'Try “Day roster”, which is taken.' },
};

/** Can't be changed now: the value stays and says why. */
export const Unavailable: Story = { args: { label: 'Owner', value: 'Ops', disabled: true, reason: 'Only an admin can change who owns a floor.' } };
