import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { Button } from './button.js';
import { Select } from './select.js';
import { SideSheet, type SideSheetProps } from './side-sheet.js';
import { TextField } from './text-field.js';

function Opener(props: Omit<SideSheetProps, 'open' | 'onClose'>) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button onPress={() => setOpen(true)}>Open</Button>
      <SideSheet {...props} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

const editFields = (
  <>
    <TextField label="Name" name="name" required defaultValue="Q3 plan" />
    <Select label="Owner" name="owner" options={['Ana Ruiz', 'Sam Okafor', 'Lee Chen']} defaultValue="Sam Okafor" />
    <TextField label="Summary" name="summary" multiline rows={2} defaultValue="Targets, hires and the office move for July to September." />
  </>
);

/**
 * Create and edit work too big for a dialog, without leaving the page, drawn as a Leaf: a Sheet from the
 * right edge, full height, over the dimmed page (never blurred). The heading on its own strip with the
 * eyebrow in mono, the work, and the actions on a ruled footer, primary last.
 *
 * - **Edit**: a record's fields; the primary checks each one first, like a Dialog.
 * - **Steps**: a bigger flow, one screen per step, so nothing scrolls. The count and a line per step sit
 *   under the heading, and Back shows from the second step.
 * - **Stacked**: a sheet opened from a sheet stacks on it; the one under steps back and dims.
 * - **Fails**: it stays open and says why, stamped "Not done" in red.
 */
const meta = {
  title: 'Common/Side sheet',
  component: Opener,
  tags: ['autodocs'],
  args: { heading: 'Edit Q3 plan' },
  argTypes: {
    size: { control: 'inline-radio', options: ['decision', 'read'] },
    eyebrow: { control: 'text' },
    actionLabel: { control: 'text' },
    busyLabel: { control: 'text' },
    cancelLabel: { control: 'text' },
    closeLabel: { control: 'text' },
    backLabel: { control: 'text' },
    step: { control: { type: 'number', min: 0 } },
    onSubmit: { control: false },
    onBack: { control: false },
    stepLabel: { control: false },
    children: { control: false },
    fields: { control: false },
  },
} satisfies Meta<typeof Opener>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = { args: { eyebrow: 'Plans', actionLabel: 'Save', fields: editFields } };

/** Press Save with the name cleared: it asks for it in green and goes there. */
export const Edit: Story = {
  args: { eyebrow: 'Plans', actionLabel: 'Save', busyLabel: 'Saving', onSubmit: () => new Promise((done) => setTimeout(done, 1200)), fields: editFields },
};

const steps = ['Name it', 'Who can see it', 'Check and create'];

function Flow() {
  const [step, setStep] = useState(1);
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button onPress={() => setOpen(true)}>Open</Button>
      <SideSheet
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="Library"
        heading="New shared collection"
        steps={steps}
        step={step}
        onBack={() => setStep((s) => Math.max(0, s - 1))}
        actionLabel={step === steps.length - 1 ? 'Create' : 'Next'}
        onSubmit={() => {
          if (step < steps.length - 1) {
            setStep(step + 1);
            return false;
          }
        }}
        fields={
          step === 0 ? (
            <TextField key="name" label="Name" name="name" required defaultValue="Finance plans" />
          ) : step === 1 ? (
            <>
              <Select key="see" label="Who can see it" name="see" options={['Everyone in Finance', 'Only people I add', 'Everyone']} defaultValue="Everyone in Finance" />
              <Select key="edit" label="Who can edit it" name="edit" options={['Only me', 'Finance leads', 'Everyone who can see it']} defaultValue="Finance leads" />
            </>
          ) : (
            <TextField key="check" label="Name" name="name" readOnly reason="Change it on the first step." defaultValue="Finance plans" />
          )
        }
      />
    </>
  );
}

/** A bigger flow in three steps, on the second. Next goes on; Back goes back; nothing scrolls. */
export const Steps: Story = { render: () => <Flow /> };

function Stack() {
  const [owner, setOwner] = useState(false);
  // Opened once the first is up, as a press would: a sheet opens from a sheet that is already there.
  useEffect(() => setOwner(true), []);
  return (
    <SideSheet open onClose={() => {}} eyebrow="Plans" heading="Edit Q3 plan" actionLabel="Save" fields={editFields}>
      <Button kind="secondary" onPress={() => setOwner(true)}>
        Pick an owner
      </Button>
      <SideSheet open={owner} onClose={() => setOwner(false)} eyebrow="Edit Q3 plan" heading="Pick an owner" actionLabel="Pick">
        <p>Ana Ruiz, Sam Okafor, Lee Chen or Priya Nair.</p>
      </SideSheet>
    </SideSheet>
  );
}

/** Opened from inside a sheet: it stacks on it, and the first steps back with its edge in view. */
export const Stacked: Story = { render: () => <Stack /> };

export const Fails: Story = {
  args: {
    eyebrow: 'Plans',
    actionLabel: 'Save',
    busyLabel: 'Saving',
    fields: editFields,
    onSubmit: () => new Promise((_, fail) => setTimeout(() => fail(new Error('The library is read-only during the upgrade. Try again in ten minutes.')), 900)),
  },
};
