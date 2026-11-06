import type { Meta, StoryObj } from '@storybook/react-vite';
const fn = () => () => {};
import { UploadList, type UploadItem } from './files.js';

const FEW: UploadItem[] = [
  { id: 'a', name: 'Halden brief.pdf', size: 2_400_000, state: 'done' },
  { id: 'b', name: 'Night roster.xlsx', size: 86_000, state: 'going', progress: 64 },
  { id: 'c', name: 'Engine log 0611.log', size: 48_000_000, state: 'failed', error: 'Bigger than the 25 MB this floor takes.' },
];

const KINDS = ['jpg', 'pdf', 'csv', 'docx', 'png', 'txt'];
const MANY: UploadItem[] = Array.from({ length: 40 }, (_, i) => ({
  id: `p${i}`,
  name: `Port camera ${String(i + 1).padStart(2, '0')}.${KINDS[i % KINDS.length]}`,
  size: 1_000_000 + ((i * 700_000) % 3_000_000),
  state: i < 31 ? 'done' : i < 35 ? 'going' : i < 38 ? 'waiting' : 'failed',
  progress: i >= 31 && i < 35 ? 20 + ((i * 17) % 70) : undefined,
  error: i >= 38 ? 'The connection dropped.' : undefined,
}));

/**
 * Files on their way up. Drawn as Tray (picked 6 Nov 2026): rows in a well, each with the file's icon,
 * name, extension and size in mono, and its state at the end. A file going has a line along its row's
 * foot as far as it has got; with no `progress` it says "Sending" and the line runs.
 *
 * A failed file says why in red under its name, with Retry; it waits for nothing, so it is never green.
 * More than `show` rows fold: failed first, then going and waiting, then "N more", so the list never
 * scrolls. Retry, Retry all, Stop and Show them appear only when their handler is given.
 */
const meta = {
  title: 'Quill/Files/Upload list',
  component: UploadList,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--measure-read)' }}>{Story()}</div>],
  args: { label: 'Uploads to Halden', items: FEW, show: 6, onRetry: fn(), onRetryAll: fn(), onStop: fn(), onShowAll: fn() },
  argTypes: { items: { control: 'object' }, className: { control: false } },
} satisfies Meta<typeof UploadList>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};

/** Forty images at once: what needs a look first, a screenful, then the rest counted. */
export const Batch: Story = { args: { items: MANY } };

/** Sending without a known size: the line runs. */
export const Unknown: Story = { args: { items: [{ id: 'x', name: 'Bridge walkthrough.mp4', size: '310 MB', state: 'going' }, { id: 'y', name: 'Deck notes.md', state: 'waiting' }] } };
