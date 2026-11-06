import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from './button.js';
import { Dialog, type DialogProps } from './dialog.js';
import { Heading } from './heading.js';
import { Select } from './select.js';
import { TextField } from './text-field.js';

function Opener(props: Omit<DialogProps, 'open' | 'onClose'>) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button onPress={() => setOpen(true)}>Open</Button>
      <Dialog {...props} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/**
 * One decision or one small task, over everything, drawn as a Sheet: a solid square sheet with one edge,
 * the heading on its own strip with the eyebrow in mono, and the actions on a ruled footer, primary last.
 * The page behind is dimmed, never blurred. Focus stays inside and goes back where it was on close.
 *
 * - **Small task**: fields, and a primary named for what it does. It checks each field first.
 * - **Danger**: the primary destroys something; focus starts on Cancel.
 * - **Fails**: it stays open and says why, stamped "Not done" in red.
 */
const meta = {
  title: 'Common/Dialog',
  component: Opener,
  tags: ['autodocs'],
  args: { heading: 'New collection' },
  argTypes: {
    size: { control: 'inline-radio', options: ['decision', 'glance', 'read'] },
    eyebrow: { control: 'text' },
    summary: { control: 'text' },
    actionLabel: { control: 'text' },
    busyLabel: { control: 'text' },
    cancelLabel: { control: 'text' },
    onSubmit: { control: false },
    children: { control: false },
    fields: { control: false },
  },
} satisfies Meta<typeof Opener>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = { args: { eyebrow: 'Library', actionLabel: 'Create', children: <p>A collection groups records you want to keep together.</p> } };
/** Press Create with the name empty: it asks for it in green and goes there. */
export const Form: Story = {
  args: {
    eyebrow: 'Library',
    actionLabel: 'Create',
    busyLabel: 'Creating',
    onSubmit: () => new Promise((done) => setTimeout(done, 1200)),
    fields: (
      <>
        <TextField label="Name" name="name" required />
        <Select label="Kind" name="kind" options={['Plans', 'Reports', 'Notes']} optional />
      </>
    ),
  },
};
/** Focus starts on Cancel, and the primary acts on one press. */
export const Danger: Story = {
  args: { heading: 'Delete this collection?', actionLabel: 'Delete', danger: true, children: <p>Its 12 records move to the library’s top level. Nobody loses access.</p> },
};
export const Fails: Story = {
  args: { heading: 'Publish to every floor', actionLabel: 'Publish', busyLabel: 'Publishing', onSubmit: () => new Promise((_, fail) => setTimeout(() => fail(new Error('The library is read-only during the upgrade. Try again in ten minutes.')), 900)) },
};

export const Headings = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
      <Heading eyebrow="Library" heading="Plans" summary="Three need you." size="l" level={1} />
      <Heading eyebrow="Collection" heading="Quarterly plans" summary="12 records." />
      <Heading heading="Recent" size="s" />
    </div>
  ),
};
