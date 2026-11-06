import type { Meta, StoryObj } from '@storybook/react-vite';
import { Rows } from './states.js';

/**
 * Label and value pairs on a record's page, such as its owner and when it changed. Drawn as Key, like
 * List and Table: in a well, no lines between, the values in mono at the end.
 */
const meta = {
  title: 'Quill/Rows',
  component: Rows,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--measure-prose)' }}>{Story()}</div>],
  args: {
    items: [
      { label: 'Owner', value: 'Sam Okafor' },
      { label: 'Floor', value: 'Ops' },
      { label: 'Changed', value: '4 min ago' },
      { label: 'Pages', value: '12' },
    ],
  },
  argTypes: { items: { control: 'object' }, empty: { control: 'text' }, error: { control: 'text' }, className: { control: false } },
} satisfies Meta<typeof Rows>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};

/** While they load. */
export const Loading: Story = { args: { loading: true, count: 3 } };

/** None to show. */
export const Empty: Story = { args: { items: [], empty: 'Nothing recorded yet.' } };

/** Couldn't load. */
export const CouldntLoad: Story = { args: { items: [], error: 'Couldn’t load the details.' } };
