import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
const fn = () => () => {};
import { FilePreview } from './files.js';

const Page = ({ n }: { n: number }) => (
  <div style={{ width: '100%', aspectRatio: '4 / 3', padding: 'var(--space-5)', boxSizing: 'border-box', background: 'var(--ink)', color: 'var(--slate-deep)', fontSize: 'var(--type-small)' }}>
    <strong>Halden brief · page {n}</strong>
    <p>The night roster moves two people from the quay to the bridge from 12 November. Swaps need a lead’s sign-off before Friday.</p>
  </div>
);

/**
 * A file opened to read in place, in a well (Tray, picked 6 Nov 2026): its name and size at the head with
 * Download and Close, the page, and Back and On to page rather than scroll. Pass the page as children:
 * an image, a rendered page, the text.
 *
 * A file that can't be shown here says why in `unavailable`, with Download, in place of the page.
 */
const meta = {
  title: 'Quill/Files/File preview',
  component: FilePreview,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--measure-read)' }}>{Story()}</div>],
  args: { name: 'Halden brief.pdf', size: 2_400_000, pages: 12, page: 1, onDownload: fn(), onClose: fn() },
  argTypes: { children: { control: false }, className: { control: false } },
} satisfies Meta<typeof FilePreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Page through it with Back and On. */
export const Playground: Story = {
  render: function Render(args) {
    const [page, setPage] = useState(args.page ?? 1);
    return (
      <FilePreview {...args} page={page} onPage={setPage}>
        <Page n={page} />
      </FilePreview>
    );
  },
};

/** Too big to show here. */
export const Unavailable: Story = { args: { name: 'Engine log 0611.log', size: 48_000_000, pages: undefined, unavailable: 'This log is 48 MB, more than a preview reads. Download it to read it.' } };
