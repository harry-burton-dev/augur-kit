import type { Meta, StoryObj } from '@storybook/react-vite';
import { Choice, Segmented } from './choice.js';

/**
 * Pick one of two to four options, each with a line on what picking it means (the kit's radios). Each option
 * is a tile; the chosen one comes up as a key, in ink, with its mark filled. Never green: green means "needs
 * you". An option that can't be picked stays, dimmed, and says why in place of its line. Arrows move and pick.
 * More than four is a Select; ways of seeing the same thing are a Segmented.
 */
const meta = {
  title: 'Common/Choice',
  component: Choice,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 'var(--measure-decision)' }}><Story /></div>],
  argTypes: {
    message: { control: 'text' },
    reason: { control: 'text' },
    onChange: { control: false },
    className: { control: false },
  },
  args: {
    label: 'Who can read it',
    defaultValue: 'team',
    options: [
      { value: 'team', label: 'Your team', detail: 'Everyone on your team can read it.' },
      { value: 'department', label: 'Department', detail: 'Publish it up one floor.' },
      { value: 'org', label: 'Whole organisation', disabled: true, reason: 'Only a department lead can publish here. Ask Sam Ortiz.' },
    ],
  },
} satisfies Meta<typeof Choice>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};
export const Options: Story = {};
export const Required: Story = { args: { defaultValue: null, required: true } };
export const Views: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'center' }}>
      <Segmented
        label="View"
        options={[
          { value: 'list', label: 'List', icon: 'list', iconOnly: true },
          { value: 'grid', label: 'Grid', icon: 'apps', iconOnly: true },
        ]}
      />
      <Segmented
        label="Panel"
        options={[
          { value: 'about', label: 'About' },
          { value: 'activity', label: 'Activity' },
        ]}
      />
    </div>
  ),
};
