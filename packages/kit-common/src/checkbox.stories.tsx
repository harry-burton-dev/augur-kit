import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox, CheckboxGroup } from './checkbox.js';

/**
 * A choice that waits for the form's primary. The box is a small well; ticked, a light key comes up in it.
 * A choice that acts at once is a Toggle. Several under one label are a CheckboxGroup, which can cap how
 * many are ticked and then says why the rest can't be.
 */
const meta = {
  title: 'Common/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 'var(--measure-decision)' }}><Story /></div>],
  args: { children: 'Email me a copy' },
  argTypes: {
    children: { control: 'text' },
    detail: { control: 'text' },
    reason: { control: 'text' },
    onChange: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};
export const Ticked: Story = { args: { defaultChecked: true } };
/** A quiet fact on the right. */
export const Detail: Story = { args: { children: 'Artifacts', detail: '12 records' } };
/** Can't be ticked: it stays focusable and says why on hover and focus. */
export const Unavailable: Story = { args: { children: 'Publish to every floor', disabled: true, reason: 'Only an admin can publish to every floor.' } };

/** Several under one label, at most two. */
export const Group: Story = {
  render: () => (
    <CheckboxGroup label="Pillars" hint="Choose up to two." max={2} defaultValue={['artifacts']}>
      <Checkbox value="artifacts" detail="Records">Artifacts</Checkbox>
      <Checkbox value="mandate" detail="Intent">Mandate</Checkbox>
      <Checkbox value="atlas" detail="Data">Data Atlas</Checkbox>
    </CheckboxGroup>
  ),
};
