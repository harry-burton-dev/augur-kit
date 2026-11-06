import type { Meta, StoryObj } from '@storybook/react-vite';
import { Flat } from './background-flat.js';
import { FLOORS, Ground } from './background.fixture.js';

/** Flat ground: one grey with nothing on it. It's what apps sit on (calm layout, PDR-014), and a desktop can have it too. */
const meta = {
  title: 'Aerie/Backgrounds/Flat',
  component: Flat,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  render: (args) => (
    <Ground>
      <Flat {...args} />
    </Ground>
  ),
  argTypes: {
    floor: { control: 'inline-radio', options: FLOORS },
    away: { control: 'boolean' },
    tinted: { control: 'boolean' },
    className: { control: false },
  },
  args: { floor: 'department', away: false, tinted: false },
} satisfies Meta<typeof Flat>;
export default meta;
type Story = StoryObj<typeof meta>;

/** One grey. */
export const Default: Story = {};
/** A trace of the floor's colour in the grey. */
export const Tinted: Story = { args: { tinted: true } };
