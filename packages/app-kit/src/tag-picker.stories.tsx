import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { TagPicker, type TagOption, type TagPickerProps } from './tag-picker.js';

const TOPICS: TagOption[] = [
  { value: 'safety', label: 'Safety' },
  { value: 'budget', label: 'Budget' },
  { value: 'hiring', label: 'Hiring' },
  { value: 'travel', label: 'Travel' },
  { value: 'training', label: 'Training' },
  { value: 'suppliers', label: 'Suppliers' },
];

/** The picker keeps the vocabulary here, so "Add …" can add a new tag as an app would. */
const Vocabulary = (props: TagPickerProps) => {
  const [options, setOptions] = useState(props.options);
  const [value, setValue] = useState(props.value ?? props.defaultValue ?? []);
  const create = (name: string) => {
    const id = name.toLocaleLowerCase();
    setOptions((o) => [...o, { value: id, label: name }]);
    setValue((v) => [...v, id]);
  };
  return <TagPicker {...props} options={options} value={value} onChange={(v) => { setValue(v); props.onChange?.(v); }} onCreate={props.onCreate ? create : undefined} />;
};

/**
 * Pick any number of tags from a vocabulary by typing: what's chosen shows as tags in the field,
 * and the list narrows as you type. Type to narrow, ↓ ↑ move, Enter picks (or adds), Esc closes the
 * list, and Backspace in an empty field takes the last tag off. With `onCreate`, a word that isn't a
 * tag yet can be added. Once `max` is reached, the field says so instead of offering more.
 */
const meta = {
  title: 'Quill/Tag picker',
  component: TagPicker,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 'var(--measure-decision)' }}><Story /></div>],
  render: (args) => <Vocabulary {...args} />,
  args: { label: 'Topics', hint: 'What people will find it under.', options: TOPICS, defaultValue: ['safety'], max: 0 },
  argTypes: {
    options: { control: 'object' },
    value: { control: false },
    defaultValue: { control: 'object' },
    max: { control: { type: 'number', min: 0, max: 6 } },
    reason: { control: 'text' },
    onChange: { action: 'change' },
    onCreate: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof TagPicker>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};
/** Nothing chosen yet. */
export const Empty: Story = { args: { defaultValue: [] } };
/** A word that isn't a tag yet can be added. */
export const CanAdd: Story = { args: { onCreate: () => undefined } };
/** Takes two at most, and says so once full. */
export const AtMost: Story = { args: { max: 2, defaultValue: ['safety', 'budget'] } };
/** Must have at least one. */
export const Required: Story = { args: { required: true, defaultValue: [] } };
/** Unavailable: it stays focusable and says why. */
export const Unavailable: Story = { args: { disabled: true, reason: 'Only the library’s leads can file it.' } };
