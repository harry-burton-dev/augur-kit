import type { Meta, StoryObj } from '@storybook/react-vite';
import { Explain } from './explain.js';

/**
 * Explain, never hide: the four-part explanation of something that needs a person, drawn in the **Rule** look.
 * One column read top to bottom, each label in mono on its own hairline. All four parts always show, so an
 * urgent item never leaves one out. It stands beside the item it explains (see Patterns/Explain beside an
 * item) or in a Letterbox's frame. Every word is a prop.
 */
const meta = {
  title: 'Common/Explain',
  component: Explain,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 'var(--measure-glance)' }}><Story /></div>],
  args: {
    what: 'The upgrade to 0.14.0 failed its health watch.',
    why: 'Two of your sites are serving errors to about 40 people.',
    canDo: 'Roll the two back to 0.13.2, or open the watch to see why.',
    whoElse: 'Lee Park can also roll back. Nobody else is on call.',
  },
  argTypes: {
    what: { control: 'text' },
    why: { control: 'text' },
    canDo: { control: 'text' },
    whoElse: { control: 'text' },
    className: { control: false },
  },
} satisfies Meta<typeof Explain>;

export default meta;
type Story = StoryObj<typeof meta>;

/** All four parts, with controls for each. */
export const Playground: Story = {};

/** When nobody else can act, it says so rather than leaving the part out. */
export const NobodyElse: Story = { args: { whoElse: 'Nobody else can act on this.' } };
