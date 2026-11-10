import type { Meta, StoryObj } from '@storybook/react-vite';
const fn = () => () => {};
import { FileButton } from './date.js';

/**
 * A button that opens the person's own file chooser: the way to add files everyone expects. Use a
 * DropZone where there's room to drop them too. `accept` turns files away by type, and `onReject`
 * hears which. On the app contract it is `quill-file-button`, and the host takes the files.
 */
const meta = {
  title: 'Quill/Files/File button',
  component: FileButton,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { label: 'Add a document', accept: '.pdf,.docx,.md', onFiles: fn(), onReject: fn() },
  argTypes: { className: { control: false }, icon: { control: false } },
} satisfies Meta<typeof FileButton>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};

/** The screen's one action. */
export const Primary: Story = { args: { kind: 'primary' } };

/** Taking the last files: says so and takes no more. */
export const Busy: Story = { args: { busy: true, busyLabel: 'Adding…' } };

/** Can't take files here, and says why. */
export const Unavailable: Story = { args: { disabled: true, reason: 'Only the folder’s editors can add documents.' } };
