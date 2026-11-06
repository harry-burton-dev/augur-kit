import type { Meta, StoryObj } from '@storybook/react-vite';
import { Picture } from './files.js';

// A stand-in photograph for the stories: a sky over a quay, drawn in greys.
const PHOTO = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="170" fill="#8a919c"/><rect y="170" width="400" height="130" fill="#3b414b"/><rect x="40" y="120" width="120" height="50" fill="#565d68"/><rect x="230" y="140" width="130" height="30" fill="#4a505a"/></svg>')}`;

/**
 * An image that keeps its shape, in a well (Tray, picked 6 Nov 2026). While it loads, a hairline sits
 * across the middle; if it can't load, the box stays the same size and says so, with an image icon,
 * rather than a broken image. `ratio` sets the box so nothing jumps; `caption` sits under it.
 */
const meta = {
  title: 'Quill/Files/Picture',
  component: Picture,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ width: 'var(--measure-glance)', maxWidth: '100%' }}>{Story()}</div>],
  args: { src: PHOTO, alt: 'The quay at Halden from camera 04', caption: 'Port camera 04.jpg', ratio: '4 / 3' },
  argTypes: { className: { control: false } },
} satisfies Meta<typeof Picture>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};

/** It couldn't load: the box keeps its place and says why. */
export const Fallback: Story = { args: { src: 'missing.jpg', caption: 'Port camera 06.jpg' } };

/** Wider, for a hero image on a record. */
export const Wide: Story = { args: { ratio: '16 / 9' } };
