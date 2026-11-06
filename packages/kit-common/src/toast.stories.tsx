import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from './button.js';
import { Toast, Toasts, type ToastItem } from './notice.js';

/**
 * What just happened, said once, with one way to change your mind. Drawn as a Sheet: a small square sheet
 * with the kind of news in mono, and its time left as a line draining along the bottom edge. Each goes by
 * itself after `motion-toast` and holds while it's hovered or focused; the line stops while it holds.
 *
 * `Toasts` places them at the bottom of the screen above everything and announces each one politely.
 * Something that waits for the person is a Notice, never a toast.
 */
const meta = {
  title: 'Common/Toast',
  component: Toast,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { toast: { id: 'archived', text: 'Archived 3 records', action: { label: 'Undo', onPress: () => {} } }, onDone: () => {} },
  argTypes: { onDone: { control: false } },
} satisfies Meta<typeof Toast>;
export default meta;
type Story = StoryObj<typeof meta>;

/** A toast is a list item: draw it in the list `Toasts` gives it. */
const inList: Story['decorators'] = [(Story) => <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}><Story /></ol>];

/** Change the toast from the controls. */
export const Playground: Story = { decorators: inList };
/** Just news: no way back needed. */
export const Plain: Story = { decorators: inList, args: { toast: { id: 'saved', text: 'Saved' } } };
/** Its own word for the kind of news. */
export const Labelled: Story = { decorators: inList, args: { toast: { id: 'sent', label: 'Sent', text: 'Shared with 4 people' } } };

function Raise() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  return (
    <>
      <Button onPress={() => setToasts((t) => [...t, { id: String(Date.now()), text: 'Archived 3 records', action: { label: 'Undo', onPress: () => {} } }])}>Archive</Button>
      <Toasts toasts={toasts} onDone={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </>
  );
}
/** Press Archive: each toast goes by itself, and holds while you point at it. */
export const InPlace: Story = { render: () => <Raise /> };
