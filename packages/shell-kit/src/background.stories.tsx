import type { Meta, StoryObj } from '@storybook/react-vite';
import { Background, backgrounds } from './background.js';
import { FLOORS, Ground } from './background.fixture.js';

/**
 * The desktop's background, chosen from a set by id: the still horizon, flat ground or the water,
 * or any a deployment adds with `set`. Each background is its own part with its own page and
 * options, separate from what sits on it (the app bar, the band). The shell passes the floor you're
 * on and whether an app is open; everything else is the background's own.
 */
const meta = {
  title: 'Aerie/Backgrounds/Background',
  component: Background,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  render: (args) => (
    <Ground>
      <Background {...args} />
    </Ground>
  ),
  argTypes: {
    name: { control: 'inline-radio', options: [...backgrounds.map((b) => b.id), 'none'] },
    floor: { control: 'inline-radio', options: FLOORS },
    away: { control: 'boolean' },
    options: { control: 'object' },
    set: { control: false },
  },
  args: { name: 'horizon', floor: 'department', away: false },
} satisfies Meta<typeof Background>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The default: the still horizon. */
export const Default: Story = {};
/** Any background in the set, with its own options: here the horizon's line a little lower. */
export const WithOptions: Story = { args: { options: { line: 0.58, above: [0.32, 0.24, 0.16], below: [0.8] } } };
/** An id that isn't in the set draws flat ground, so a wrong setting shows. */
export const NotInTheSet: Story = { args: { name: 'meadow' } };
/** A deployment's own background beside the kit's. */
export const OwnSet: Story = {
  args: { name: 'plain-tinted', set: [...backgrounds, { id: 'plain-tinted', name: 'Tinted', line: 'Flat, with a trace of the floor', draw: backgrounds.find((b) => b.id === 'flat')!.draw }], options: { tinted: true } },
};
