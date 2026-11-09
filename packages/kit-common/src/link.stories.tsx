import type { Meta, StoryObj } from '@storybook/react-vite';
import { Link } from './link.js';

/**
 * A link to a place, in running text or on its own. Never underlined: ink words in a heavier weight, and
 * pointing at them lifts them as a soft key. A link that leaves AUGUR looks the same as one that stays.
 * Name where it goes in its words. For an action, use a Button.
 */
const meta = {
  title: 'Common/Link',
  component: Link,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { children: 'All documents', href: '#documents' },
  argTypes: {
    children: { control: 'text' },
    href: { control: 'text' },
    target: { control: 'inline-radio', options: [undefined, '_blank'] },
  },
} satisfies Meta<typeof Link>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};
/** On its own. */
export const Alone: Story = {};
/** In running text. */
export const InText: Story = {
  render: () => (
    <p style={{ maxWidth: 'var(--measure-prose)', margin: 0, fontSize: 'var(--type-body)', lineHeight: 'var(--leading-body)' }}>
      The <Link href="#survey">harbour survey</Link> is due Friday. Tide times come from the{' '}
      <Link href="https://example.org/tides" target="_blank">port authority’s tables</Link>, and anything odd goes in the <Link href="#hull">hull notes</Link>.
    </p>
  ),
};
