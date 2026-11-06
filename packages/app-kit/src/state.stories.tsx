import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@augur/kit-common';
import { useState, type ReactNode } from 'react';
import { Rows, State, StateBoundary } from './states.js';

const Frame = ({ children, wide }: { children: ReactNode; wide?: boolean }) => (
  <div style={{ width: wide ? 'var(--measure-wide)' : 'var(--measure-read)', maxWidth: '100%' }}>{children}</div>
);

/**
 * What a region says when it has nothing, is still coming, or failed. Drawn on the horizon: no box, the
 * sentence sits on a groove with the line running out to either side.
 *
 * - **Empty**: one sentence, a line more if it helps, and at most one thing to do.
 * - **Loading**: the line draws across, after 300ms, so a quick load doesn't flash. Nothing to do.
 * - **Error**: the line turns red and a diamond marks it. Say what failed and why if known, and offer one way on.
 * - **Offline**: the same, in amber.
 *
 * `size` is `region` (centred in its region), `line` (inside a tile or beside a control, under a line of
 * its own) or `page` (in place of a whole page). Green never shows here: it means only "needs you".
 * For a region that loads data, use `DataView`, which picks the state for you. To keep one part failing
 * from blanking the page, wrap it in `StateBoundary`.
 */
const meta = {
  title: 'Quill/State',
  component: State,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <Frame>{Story()}</Frame>],
  args: { kind: 'empty', heading: 'No records yet', body: 'Records you add to this collection show here, newest first.', action: 'Add a record', size: 'region' },
  argTypes: {
    kind: { control: 'inline-radio', options: ['empty', 'loading', 'error', 'offline'] },
    size: { control: 'inline-radio', options: ['region', 'line', 'page'] },
    heading: { control: 'text' },
    body: { control: 'text' },
    action: { control: 'text' },
    onAction: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof State>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};

/** Nothing here yet. */
export const Empty: Story = {};
/** Nothing matches what's asked for: the way on is to ask for less. */
export const NothingMatches: Story = { args: { heading: 'Nothing matches Open, this week', body: undefined, action: 'Clear the filter' } };
/** Still coming: the line draws across. */
export const Loading: Story = { args: { kind: 'loading', heading: 'Loading records', body: undefined, action: undefined } };
/** It failed: the line turns red. */
export const Error: Story = {
  args: { kind: 'error', heading: 'Couldn’t load the records', body: 'The library didn’t answer in time. Nothing was changed.', action: 'Try again' },
};
/** No connection: the line turns amber. */
export const Offline: Story = { args: { kind: 'offline', heading: 'You’re offline', body: 'What you see is from 10:42. It updates when you’re back.', action: undefined } };

/** Inside a tile, or beside a control: one line. */
export const Lines: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <State kind="empty" heading="No runs today." size="line" />
      <State kind="loading" heading="Loading runs" size="line" />
      <State kind="error" heading="Couldn’t load today’s runs." action="Try again" size="line" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <Button size="sm" busy busyLabel="Saving">
          Save
        </Button>
        <State kind="loading" heading="Checking the name" size="line" />
      </div>
    </div>
  ),
};

/** Some rows loaded and some didn't: keep what came, and say what didn't. */
export const SomeDidntLoad: Story = {
  render: () => (
    <>
      <Rows items={[{ label: 'Coast watch', value: 'Done' }, { label: 'Port arrivals', value: 'Running' }]} />
      <State kind="error" heading="3 more couldn’t load." action="Try again" size="line" />
    </>
  ),
};

/** In place of a whole page that couldn't be shown. */
export const Page: Story = {
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <div style={{ padding: '0 var(--edge)' }}>{Story()}</div>],
  args: { kind: 'error', size: 'page', heading: 'This page couldn’t be shown', body: 'Something in it went wrong. What you were working on is saved.', action: 'Try again' },
};

function Breaks(): ReactNode {
  throw new globalThis.Error('A part failed to draw.');
}

function BoundaryDemo() {
  const [fixed, setFixed] = useState(false);
  return (
    <StateBoundary heading="This panel couldn’t be shown" body="The rest of the page still works." action="Try again" onReset={() => setFixed(true)}>
      {fixed ? <State kind="empty" heading="The panel came back." size="line" /> : <Breaks />}
    </StateBoundary>
  );
}

/** A part that throws while drawing: the boundary shows a State in its place, and Try again draws it again. */
export const Boundary: Story = { render: () => <BoundaryDemo /> };
