import type { Meta, StoryObj } from '@storybook/react-vite';
import { WaterGround } from './background-water.js';
import { FLOORS, Ground } from './background.fixture.js';
import { DEFAULT_WAVE, wavePresets } from './water.js';

/** The water: soft bands drifting over a slate ground, with its presets. It moves, so it's still when motion is reduced. */
const meta = {
  title: 'Aerie/Backgrounds/Water',
  component: WaterGround,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  render: (args) => (
    <Ground>
      <WaterGround {...args} />
    </Ground>
  ),
  argTypes: {
    floor: { control: 'inline-radio', options: FLOORS },
    away: { control: 'boolean' },
    preset: { control: 'select', options: Object.keys(wavePresets) },
    className: { control: false },
  },
  args: { floor: 'you', away: false, preset: DEFAULT_WAVE },
} satisfies Meta<typeof WaterGround>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Calm Tide, on your own floor. */
export const Default: Story = {};
/** On a department's floor: the water takes the floor's colours and sits at its height. */
export const DepartmentFloor: Story = { args: { floor: 'department' } };
