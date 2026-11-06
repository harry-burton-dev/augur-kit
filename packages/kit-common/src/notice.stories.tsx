import type { Meta, StoryObj } from '@storybook/react-vite';
import { Notice } from './notice.js';

/**
 * One sentence inside a page that needs attention, drawn as a Sheet: a solid square strip. Its tone is a
 * word in mono stamped at the start, printed solid in the tone, so colour is never the only sign. Only
 * **needs you** is green; **warning** is amber, **refused** is red, and a **note** is outlined.
 *
 * - **Inline**: a sentence and nothing to do.
 * - **Actionable**: give it `action` and `onAction`, for the one thing to do about it.
 *
 * One notice per region: say how many more with `more` instead of stacking them. Name your own word with
 * `label` when the tone's own ("Needs you", "Check", "Refused", "Note") doesn't fit. What just happened
 * goes in a Toast; something urgent goes in the Letterbox.
 */
const meta = {
  title: 'Common/Notice',
  component: Notice,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 'var(--measure-read)' }}><Story /></div>],
  args: { tone: 'needs', heading: 'Waiting for your back-brief.', children: 'Lee asked for it by Friday.', action: 'Write it', more: 2 },
  argTypes: {
    tone: { control: 'inline-radio', options: ['needs', 'warning', 'refused', 'info'] },
    label: { control: 'text' },
    heading: { control: 'text' },
    action: { control: 'text' },
    more: { control: { type: 'number', min: 0 } },
    children: { control: 'text' },
    onAction: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof Notice>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};
/** Needs you, with the one thing to do: the only green. */
export const NeedsYou: Story = {};
/** Something to keep an eye on, with its own word. */
export const Warning: Story = { args: { tone: 'warning', label: 'Stale', heading: 'Two records are going stale.', children: 'Nobody has opened them since August.', action: undefined, more: 0 } };
/** Something was refused, and why. */
export const Refused: Story = { args: { tone: 'refused', heading: 'Publishing was refused.', children: 'The library is read-only during the upgrade.', action: 'See why', more: 0 } };
/** A quiet note: outlined, nothing to do. */
export const Note: Story = { args: { tone: 'info', heading: undefined, children: 'Records you archive stay searchable for a year.', action: undefined, more: 0 } };

/** Every tone, one above the other, as they'd sit in different regions of a page. */
export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <Notice tone="needs" heading="Waiting for your back-brief." action="Write it" more={2}>
        Lee asked for it by Friday.
      </Notice>
      <Notice tone="warning" label="Stale" heading="Two records are going stale.">
        Nobody has opened them since August.
      </Notice>
      <Notice tone="refused" heading="Publishing was refused." action="See why">
        The library is read-only during the upgrade.
      </Notice>
      <Notice tone="info">Records you archive stay searchable for a year.</Notice>
    </div>
  ),
};
