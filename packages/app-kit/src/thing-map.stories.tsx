import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThingMap } from './thing-map.js';
import { THINGS } from './things.fixture.js';

const thing = (id: string) => THINGS.find((t) => t.id === id)!;
const heron = thing('mv-saltmarsh-heron');
const handlers = { onOpen: () => undefined, onBack: () => undefined, onEverything: () => undefined };

/**
 * The map of what is around a thing, one deliberate step from its page ("See how it connects"). The thing
 * sits in the middle; its neighbours sit round it, each group side by side, each line read from the thing's
 * side ("Operated by"). The layout is a fixed rule, so the same thing always looks the same. Past the cap,
 * the map says how many more wait in everything we know. In a narrow place it folds into its groups.
 */
const meta = {
  title: 'Quill/Thing map',
  component: ThingMap,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ padding: 'var(--space-6)' }}>
        <Story />
      </div>
    ),
  ],
  args: { thing: heron, around: heron.around, ...handlers },
  argTypes: { thing: { control: 'object' }, around: { control: 'object' }, words: { control: false } },
} satisfies Meta<typeof ThingMap>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The busiest thing: a ship and all it touches. */
export const Busiest: Story = {};

/** More than the map draws: it says how many more, and opens them in everything we know. */
export const PastTheCap: Story = { args: { cap: 4 } };

/** Nothing known around it: the map says so plainly. */
export const NothingAround: Story = { args: { around: [] } };

/** In a narrow pane the ring folds into its groups, as lists. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 'var(--measure-card)' }}>
        <Story />
      </div>
    ),
  ],
};
