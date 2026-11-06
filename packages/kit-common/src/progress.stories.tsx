import type { Meta, StoryObj } from '@storybook/react-vite';
import { Progress, Steps } from './progress.js';

/**
 * How far an upload, an extraction run or an upgrade has got, drawn as the horizon's line: a groove that
 * fills with ink. While how far can't be known, leave out `value` and a short stretch of ink travels
 * along it. Never green: green means only "needs you". Say what is running in `label`, and how far in
 * words in `valueText` ("2 of 3") when a percentage says less. For a few named stages, use `Steps`.
 */
const meta = {
  title: 'Common/Progress',
  component: Progress,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 'var(--measure-read)', maxWidth: '100%' }}>{Story()}</div>],
  args: { label: 'Uploading 3 files', value: 40, valueText: '2 of 3' },
  argTypes: {
    label: { control: 'text' },
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    valueText: { control: 'text' },
    className: { control: false },
  },
} satisfies Meta<typeof Progress>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};
/** How far, in words. */
export const Known: Story = {};
/** How far, as a percentage. */
export const Percentage: Story = { args: { label: 'Upgrading', value: 85, valueText: undefined } };
/** Not known yet: ink travels along the line. */
export const NotKnown: Story = { args: { label: 'Checking the library', value: undefined, valueText: undefined } };
/** A few named stages, and where things are now. */
export const Stages: Story = {
  render: () => (
    <Steps
      label="Extraction"
      steps={[
        { label: 'Read', state: 'done' },
        { label: 'Extract', state: 'now' },
        { label: 'Check', state: 'next' },
        { label: 'File', state: 'next' },
      ]}
    />
  ),
};
