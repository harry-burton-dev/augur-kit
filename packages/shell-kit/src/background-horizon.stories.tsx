import type { Meta, StoryObj } from '@storybook/react-vite';
import { Horizon } from './background-horizon.js';
import { FLOORS, Ground } from './background.fixture.js';

/**
 * The still horizon: a line that nothing moves, level rules above it for intent and below it for
 * knowledge, and a little of the floor's light around the line. Floors change the light, never the line.
 */
const meta = {
  title: 'Aerie/Backgrounds/Still horizon',
  component: Horizon,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  render: (args) => (
    <Ground>
      <Horizon {...args} />
    </Ground>
  ),
  argTypes: {
    floor: { control: 'inline-radio', options: FLOORS },
    away: { control: 'boolean' },
    line: { control: { type: 'range', min: 0.2, max: 0.8, step: 0.01 } },
    above: { control: 'object' },
    below: { control: 'object' },
    glow: { control: 'boolean' },
    className: { control: false },
    style: { control: false },
  },
  args: { floor: 'department', away: false, line: 0.5, glow: true },
} satisfies Meta<typeof Horizon>;
export default meta;
type Story = StoryObj<typeof meta>;

/** As the mockup drew it: the line at half height, two rules above and two below. */
export const Default: Story = {};
/** On each floor: the light round the line changes, the line doesn't. */
export const YourOwnFloor: Story = { args: { floor: 'you' } };
export const Organisation: Story = { args: { floor: 'org' } };
/** The line lower, with more sky and three rules above it. */
export const LowLine: Story = { args: { line: 0.62, above: [0.5, 0.4, 0.3], below: [0.8] } };
/** Just the line: no rules and no light. */
export const LineOnly: Story = { args: { above: [], below: [], glow: false } };
