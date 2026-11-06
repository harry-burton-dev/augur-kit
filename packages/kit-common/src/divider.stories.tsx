import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button.js';
import { Divider } from './divider.js';
import { IconButton } from './icon-button.js';

const text = { margin: 0, fontSize: 'var(--type-meta)', lineHeight: 'var(--leading-meta)' };

/**
 * A line between things, drawn as a groove cut into the surface: a dark line with a faint lit one under it.
 *
 * - **Plain**: between groups when space alone doesn't say where one ends.
 * - **Label**: a word on the line, for a list in groups ("Earlier").
 * - **Strong**: a deeper cut, between kinds of thing rather than items of one kind.
 * - **Vertical**: divides the controls in a bar.
 *
 * Use space first. A divider is for when space alone isn't enough.
 */
const meta = {
  title: 'Common/Divider',
  component: Divider,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { strong: false, orientation: 'horizontal' },
  argTypes: {
    label: { control: 'text' },
    strong: { control: 'boolean' },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    className: { control: false },
  },
  render: (args) =>
    args.orientation === 'vertical' ? (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minHeight: 'var(--target-md)' }}>
        <Button kind="ghost" size="sm">
          Filter
        </Button>
        <Divider {...args} />
        <Button kind="ghost" size="sm">
          Sort
        </Button>
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxWidth: 'var(--measure-read)' }}>
        <p style={text}>Records filed today.</p>
        <Divider {...args} />
        <p style={text}>Records filed this week.</p>
      </div>
    ),
} satisfies Meta<typeof Divider>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};

/** A plain groove. */
export const Plain: Story = {};
/** A word on the line. */
export const Label: Story = { args: { label: 'Earlier' } };
/** A deeper cut, between kinds of thing. */
export const Strong: Story = { args: { strong: true } };
/** Upright, between the controls in a bar. */
export const Vertical: Story = { args: { orientation: 'vertical' } };

/** In a bar with an icon button. */
export const InABar: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minHeight: 'var(--target-md)' }}>
      <Button kind="ghost" size="sm">
        Filter
      </Button>
      <Divider orientation="vertical" />
      <Button kind="ghost" size="sm">
        Sort
      </Button>
      <Divider orientation="vertical" />
      <IconButton icon="view" label="View" />
    </div>
  ),
};
