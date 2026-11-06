import type { Meta, StoryObj } from '@storybook/react-vite';
import { InfoPop } from './info-pop.js';
import { Select } from './select.js';
import { TextField } from './text-field.js';

/**
 * The why behind something, when you ask, drawn as a Slip: pressing the mark opens a small square sheet
 * under it, with a heading in mono, a few lines and one way on, on a ruled foot. It holds a link, which a
 * Tip can't, and stays until you press away or press Esc.
 *
 * - **Beside a label**: why a field asks, with the rule behind it.
 * - **Who can change this**: a setting you can't change says why in its own `reason`; the pop says who can.
 * - **No link**: a few lines only.
 */
const meta = {
  title: 'Common/Info pop',
  component: InfoPop,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    label: 'About Keep for',
    heading: 'Why this is asked',
    children: <p>Finance records are kept for seven years by default. A shorter time needs a lead’s say.</p>,
    link: { label: 'Read the retention rule', href: '#retention' },
    defaultOpen: true,
  },
  argTypes: {
    placement: { control: 'inline-radio', options: ['bottom start', 'bottom end', 'top start', 'top end'] },
    icon: { control: 'text' },
    children: { control: false },
  },
  decorators: [(Story) => <div style={{ minHeight: 'calc(var(--space-7) * 3)' }}>{Story()}</div>],
} satisfies Meta<typeof InfoPop>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};

/** Beside a field's label: the field says what, the pop says why. */
export const BesideALabel: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxWidth: 'var(--measure-glance)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <strong style={{ fontWeight: 500 }}>Retention</strong>
        <InfoPop {...args} />
      </div>
      <Select label="Keep for" name="keep" options={['7 years', '3 years', '1 year']} defaultValue="7 years" />
    </div>
  ),
};

/** On a setting you can't change: its `reason` says why, and the pop says who can and links to them. */
export const WhoCanChangeThis: Story = {
  args: {
    label: 'About Sharing',
    heading: 'Who can change this',
    children: <p>Sharing for Finance is set by its admins. Ana Ruiz looks after it this quarter.</p>,
    link: { label: 'Ask Ana Ruiz', href: '#ana' },
  },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxWidth: 'var(--measure-glance)' }}>
      <InfoPop {...args} />
      <TextField label="Sharing" name="share" readOnly reason="Set for all of Finance by its admins." defaultValue="Finance only" />
    </div>
  ),
};

/** A few lines and nothing more. */
export const NoLink: Story = { args: { link: undefined, heading: 'What this counts', children: <p>Records edited in the last 30 days, by anyone.</p> } };
