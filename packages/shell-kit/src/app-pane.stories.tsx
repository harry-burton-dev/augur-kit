import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentProps } from 'react';
import { Icon } from '@augur/kit-common';
import { Screen } from './app-bar.fixture.js';
import { AppPane } from './app-pane.js';

/*
 * The app pane at the window's right edge, in each of its states (DR plan). Names and words are examples:
 * the shell hands over the open app's manifest, and puts its own clock and notification button at the top.
 */
const sections = [
  { id: 'details', label: 'Details', icon: 'info' },
  { id: 'history', label: 'History', icon: 'clock' },
  { id: 'people', label: 'People', icon: 'people' },
];
const content = {
  details: <p style={{ margin: 0 }}>Kept on this floor. Sam Lee wrote it on 3 November.</p>,
  people: <p style={{ margin: 0 }}>Sam Lee and two others can see this.</p>,
};
/** A stand-in for the shell's clock and notification button. */
const top = (
  <>
    <span className="aerie-clock">09:41</span>
    <button type="button" aria-label="2 need you. Open notifications.">
      <Icon name="bell" size={16} />
    </button>
  </>
);

function Edge({ start, ...rest }: { start?: string } & Partial<ComponentProps<typeof AppPane>>) {
  const [open, setOpen] = useState(start);
  return (
    <Screen>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'flex-end' }}>
        <AppPane app={{ name: 'Notes', icon: 'document' }} sections={sections} content={content} top={top} open={open} onOpenChange={setOpen} {...rest} />
      </div>
    </Screen>
  );
}

const meta = {
  title: 'Aerie/Frame/App pane',
  component: AppPane,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppPane>;
export default meta;
type Story = StoryObj<typeof meta>;
const base = { app: { name: 'Notes' }, sections, onOpenChange: () => undefined };

/** Closed to its strip: the clock and the bell, the dock image, and the titles running down it. */
export const Closed: Story = { args: base, render: () => <Edge /> };
/** Open on one section; the others stay as titles, and History, empty, says so when opened. */
export const Open: Story = { args: base, render: () => <Edge start="details" /> };
/** Open over the page, as on a narrow frame. */
export const OverThePage: Story = { args: base, render: () => <Edge start="details" over /> };
/** An app that declares no sections keeps the strip, for the clock and the notifications. */
export const NoSections: Story = { args: base, render: () => <Edge sections={[]} /> };
