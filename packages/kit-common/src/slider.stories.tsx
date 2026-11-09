import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider } from './slider.js';

/**
 * A level or a share chosen by feel, such as how much of a list to show or how loud a sound is. By
 * default a fader: the track is a narrow well, the part you've chosen fills in ink, and the thumb is a
 * small key standing in it, its depth a thicker bottom line that closes while you drag. With `steps`, a
 * short row of wells instead, each one up to the value raised as a key, for a few settings only.
 *
 * The value is written in mono beside the label, in the words `format` gives. Arrow keys move it a step,
 * Page Up and Page Down further, Home and End to the ends.
 */
const meta = {
  title: 'Common/Slider',
  component: Slider,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 'var(--measure-decision)' }}><Story /></div>],
  args: { label: 'Show on the front page', hint: 'How much of the list people see first.', defaultValue: 60, min: 0, max: 100, step: 5, format: (v: number) => `${v}%` },
  argTypes: {
    reason: { control: 'text' },
    format: { control: false },
    onChange: { control: false },
    onChangeEnd: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof Slider>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};
/** A few settings: steps, each up to the value raised as a key. */
export const Steps: Story = { args: { label: 'Detail', hint: undefined, steps: true, defaultValue: 3, min: 0, max: 5, step: 1, format: (v: number) => `${v} of 5` } };
export const Unavailable: Story = { args: { hint: undefined, disabled: true, reason: 'The front page is set for the whole floor.' } };
