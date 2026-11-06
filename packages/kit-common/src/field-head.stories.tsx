import type { Meta, StoryObj } from '@storybook/react-vite';
import { FieldHead } from './field.js';

/**
 * The head of every Common field, for a part that needs one without the whole field (Quill's
 * TagPicker uses it): the label, with a Required flag (a needs-you dot and the word) or an Optional
 * one. Never both: required wins.
 */
const meta = {
  title: 'Common/Field parts/FieldHead',
  component: FieldHead,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 'var(--measure-decision)' }}><Story /></div>],
  args: { label: 'Title', required: false, optional: false },
  argTypes: { label: { control: 'text' }, required: { control: 'boolean' }, optional: { control: 'boolean' } },
} satisfies Meta<typeof FieldHead>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};
/** A field that must be filled in. */
export const Required: Story = { args: { required: true } };
/** A field that may be left empty, said when most on the form are required. */
export const Optional: Story = { args: { optional: true } };
