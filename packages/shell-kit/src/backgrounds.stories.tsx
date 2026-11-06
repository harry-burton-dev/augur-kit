import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef } from 'react';
import { Horizon } from './horizon.js';
import { Water, wavePresets, DEFAULT_WAVE } from './water.js';

/**
 * The shell's backgrounds: what the desktop sits on. There will be several to choose from, so
 * each one is its own part, separate from what sits on it (the app bar, the band).
 */
const frame = { position: 'relative', width: '100%', aspectRatio: '16 / 10', minHeight: 420, overflow: 'hidden' } as const;

const meta = {
  title: 'Aerie/Backgrounds',
  component: Horizon,
  parameters: { layout: 'padded' },
  render: (args) => (
    <div style={frame}>
      <Horizon {...args} />
    </div>
  ),
  argTypes: {
    floor: { control: 'inline-radio', options: ['you', 'department', 'team', 'org'] },
    away: { control: 'boolean' },
  },
  args: { floor: 'department', away: false },
} satisfies Meta<typeof Horizon>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The still horizon: a line at half height that nothing moves, and the floor's light around it. */
export const StillHorizon: Story = {};

function WaterGround({ preset }: { preset: string }) {
  const host = useRef<HTMLDivElement>(null);
  const water = useRef<Water | null>(null);
  useEffect(() => {
    if (!host.current) return;
    water.current = new Water(host.current);
    return () => water.current?.destroy();
  }, []);
  useEffect(() => water.current?.set({ preset }), [preset]);
  return <div ref={host} style={frame} />;
}

/** The water, today's ground, with its presets. */
export const TheWater: StoryObj<{ preset: string }> = {
  render: (args) => <WaterGround preset={args.preset} />,
  argTypes: { preset: { control: 'select', options: Object.keys(wavePresets) } },
  args: { preset: DEFAULT_WAVE },
};
