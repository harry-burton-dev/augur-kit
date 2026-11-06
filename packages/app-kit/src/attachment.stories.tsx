import type { Meta, StoryObj } from '@storybook/react-vite';
const fn = () => () => {};
import { Attachment } from './files.js';

/**
 * A file attached to a message or a record. Drawn as a small key (Tray, picked 6 Nov 2026): the file's
 * icon, its name, its extension and size in mono, and a round remove button. While it sends, a line runs
 * along its foot; if it fails, its edge turns red and it says why on hover and to a screen reader.
 *
 * With `onOpen` its name opens it (a File preview); with `onRemove` it can be taken off.
 */
const meta = {
  title: 'Quill/Files/Attachment',
  component: Attachment,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { name: 'Halden brief.pdf', size: 2_400_000, onOpen: fn(), onRemove: fn() },
  argTypes: { state: { control: 'inline-radio', options: [undefined, 'going', 'failed'] }, className: { control: false } },
} satisfies Meta<typeof Attachment>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};

/** Still sending. */
export const Sending: Story = { args: { name: 'Night roster.xlsx', size: undefined, state: 'going', progress: 40 } };

/** Couldn't send. */
export const Failed: Story = { args: { name: 'Engine log 0611.log', size: undefined, state: 'failed', error: 'Bigger than the 25 MB this floor takes.' } };

/** Several in a composer, of different kinds; one that can't be removed. */
export const InAComposer: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', maxWidth: 'var(--measure-read)' }}>
      <Attachment name="Halden brief.pdf" size={2_400_000} onOpen={fn()} onRemove={fn()} />
      <Attachment name="Night roster.xlsx" state="going" progress={64} onRemove={fn()} />
      <Attachment name="Deck plan.png" size={640_000} onOpen={fn()} onRemove={fn()} />
      <Attachment name="Engine log 0611.log" state="failed" error="Bigger than the 25 MB this floor takes." onRemove={fn()} />
      <Attachment name="Vessel list.csv" size={12_000} onOpen={fn()} />
    </div>
  ),
};
