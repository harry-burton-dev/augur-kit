import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from './button.js';
import { Explain } from './explain.js';
import { Letterbox, type LetterboxAcknowledgement } from './letterbox.js';
import { UrgentEdge } from './urgent-edge.js';

/** The whole urgent path: open, acknowledge (A), step back (Esc) to the edge, and reopen from it. */
function UrgentPath() {
  const [open, setOpen] = useState(true);
  const [ack, setAck] = useState<LetterboxAcknowledgement>();
  const heading = 'Backups have failed three times';
  const queue = { position: 1, total: 2, next: 'Disk 92% full on the Org server' };
  return (
    <>
      {open ? null : <UrgentEdge headline={heading} acknowledged={Boolean(ack)} queue={queue} onReopen={() => setOpen(true)} />}
      <p style={{ color: 'var(--ink-muted)' }}>Everything else on the screen steps back while it’s open. Step back puts it on the edge until it is resolved.</p>
      <Letterbox
        open={open}
        onStepBack={() => setOpen(false)}
        acknowledged={ack}
        onAcknowledge={() => setAck({ by: 'Lee Park', at: '07:14' })}
        queue={queue}
        bars={{ top: <span>Health · Org floor · Updater</span>, bottom: <span>Seen by Lee Park, Sam Ito · resolves when a backup succeeds</span> }}
        eyebrow="Health"
        heading={heading}
        summary="The nightly backup of the Org server has not finished since Monday."
        actions={
          <>
            <Button kind="primary" onPress={() => setOpen(false)}>
              Run a backup now
            </Button>
            <Button onPress={() => setOpen(false)}>Open Upgrade Centre</Button>
          </>
        }
      >
        <Explain
          what="The last three nightly backups stopped at the storage step."
          why="If the server fails now, anything changed since Monday is lost."
          canDo="Run a backup now, or open Upgrade Centre to see the storage step."
          whoElse="Sam Ito, the Org admin, is on call and has seen it."
        />
      </Letterbox>
    </>
  );
}

const meta = { title: 'Common/Letterbox', component: UrgentPath } satisfies Meta<typeof UrgentPath>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Urgent is letterboxed (PDR-009): bars that carry information, an acknowledgement that isn't resolving, a queue, and no dismiss. */
export const Urgent: Story = {};

/** Without `onStepBack` it must be answered first: Esc does nothing and there is no Step back. */
export const MustAnswer: Story = {
  render: () => (
    <Letterbox
      open
      eyebrow="Upgrade"
      heading="Approve the 0.14.0 upgrade before 00:15"
      summary="It is the latest safe start for tonight’s window."
      actions={<Button kind="primary">Approve</Button>}
    />
  ),
};

/** The four-part explanation, on its own. */
export const Explanation: Story = {
  render: () => (
    <Explain
      what="The upgrade to 0.14.0 failed its health watch after 4 minutes."
      why="It went back to 0.13.0 by itself; nothing was lost."
      canDo="See what failed, or try again tonight."
      whoElse="Nobody else needs to act on this."
    />
  ),
};

/** A stepped-back urgent item on the edge rule: a labelled button that stays until it is resolved. */
export const Edge: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
      <UrgentEdge headline="Backups have failed three times" onReopen={() => {}} queue={{ position: 1, total: 2, next: 'Disk 92% full' }} />
      <UrgentEdge headline="Backups have failed three times" acknowledged onReopen={() => {}} />
    </div>
  ),
};
