import type { Meta, StoryObj } from '@storybook/react-vite';
const fn = () => () => {};
import { DropZone } from './date.js';

/**
 * Somewhere to drop files, or press Choose to pick them. Drawn as Tray (picked 6 Nov 2026): a well that
 * owns its section, its depth a thicker top line. While files are dragged over it lightens and its edge
 * turns ink; it never turns green, which means only "needs you".
 *
 * `compact` makes it one line, for a dialog, a panel or above an upload list. Choose is the way in from
 * the keyboard; dropping is a shortcut, never the only way. `accept` turns files away by type, and
 * `onReject` hears which.
 */
const meta = {
  title: 'Quill/Files/Drop zone',
  component: DropZone,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--measure-read)' }}>{Story()}</div>],
  args: { heading: 'Drop files here', hint: 'PDF, Word, sheets, images or logs, up to 25 MB each', action: 'Choose files', onFiles: fn(), onReject: fn() },
  argTypes: { className: { control: false } },
} satisfies Meta<typeof DropZone>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};

/** One line, above a list or in a dialog. */
export const Compact: Story = { args: { compact: true } };

/** Busy with the last files: says so and takes no more. */
export const Busy: Story = { args: { busy: true } };

/** Can't take files here. */
export const Disabled: Story = { args: { disabled: true } };
