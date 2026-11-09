import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { AppBar, BarTile, RailBlock, RailPages, RailPair } from './app-bar.js';
import { Screen } from './app-bar.fixture.js';
import { CommandPalette } from './command-palette.js';
import { FrameRadial } from './frame-radial.js';
import { RailPlaces } from './rail-places.js';
import { AboutPanel } from './about-panel.js';
import type { CommandSource } from './frame.js';

/*
 * The frame the shell draws round an app on the app contract (spec 6.3, 6.4, 6.8), from one example
 * app's manifest (the spec's appendix A). Names are examples; the shell hands over whatever the registry
 * served.
 */
const notes: CommandSource = {
  app: { id: 'notes', name: 'Notes' },
  commands: [
    { id: 'note.new', label: 'New note', icon: 'plus', keywords: 'create write', when: 'always' },
    { id: 'note.archive', label: 'Archive note', icon: 'archive', when: 'selection' },
    { id: 'note.share', label: 'Share note', icon: 'people', when: 'selection' },
  ],
  radial: [
    { command: 'note.share', on: 'note', order: 0 },
    { command: 'note.archive', on: 'note', order: 1 },
  ],
  handled: ['note.new', 'note.share'],
  selection: false,
  onScreen: true,
};

/**
 * The command palette: every command an app declares, found by name or keyword, run with Enter. One the
 * app hasn't loaded a handler for stays in the list, locked, saying why. Ctrl+Shift+P opens it in the shell.
 */
const meta = {
  title: 'Aerie/Frame/Command palette',
  component: CommandPalette,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: { onRun: { action: 'onRun' }, onClose: { action: 'onClose' }, sources: { control: false } },
  args: { open: true, sources: [notes], keys: { notes: { 'note.new': 'Ctrl+Alt+N' } }, onRun: () => {}, onClose: () => {} },
  render: (args) => (
    <Screen>
      <CommandPalette {...args} />
    </Screen>
  ),
} satisfies Meta<typeof CommandPalette>;
export default meta;
type Story = StoryObj<typeof meta>;

/** One app's commands. Archive note is locked: the app hasn't loaded it yet. */
export const OneApp: Story = {};
/** With several apps' commands, each app's rows are headed by its name. */
export const SeveralApps: Story = {
  args: { sources: [notes, { app: { id: 'maps', name: 'Maps' }, commands: [{ id: 'map.new', label: 'New map', icon: 'place' }], handled: ['map.new'] }] },
};

/** Right-click (or Shift+F10, or a long press) on a note: its radial actions, from `contributes.radial`. */
export const RadialOnAThing: Story = {
  render: () => (
    <Screen>
      <FrameRadial source={notes} onRun={() => undefined}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 'var(--space-6)', display: 'grid', gap: 'var(--space-2)', color: 'var(--ink)' }}>
          {['Shopping', 'Rota for May', 'Berth plan'].map((name, i) => (
            <li key={name} tabIndex={0} data-thing="note" data-thing-id={`n-${i}`} data-thing-label={name} style={{ padding: 'var(--space-3)', background: 'var(--surface-raised)' }}>
              {name}
            </li>
          ))}
        </ul>
      </FrameRadial>
    </Screen>
  ),
};

const notebooks = Array.from({ length: 64 }, (_, i) => ({ label: `Notebook ${i + 1}`, path: `/notebooks/${i + 1}`, icon: 'library' }));

function Rail({ cap }: { cap?: number }) {
  const [at, setAt] = useState('/notebooks/2');
  return (
    <Screen>
      <AppBar mode="app" label="Apps">
        <RailBlock>
          <RailPair>
            <BarTile kind="half" icon="home" name="Home" />
            <BarTile kind="half" icon="apps" name="Apps" />
          </RailPair>
          <BarTile kind="app" icon="document" name="Notes" current />
        </RailBlock>
        <RailPages>
          <RailPlaces
            places={[
              { id: 'recent', label: 'Recent', icon: 'clock', path: '/' },
              { id: 'notebooks', label: 'Notebooks', icon: 'library', fills: true },
              { id: 'archive', label: 'Archive', icon: 'archive' },
            ]}
            under={{ notebooks }}
            {...(cap !== undefined ? { cap } : {})}
            current={at}
            onOpen={setAt}
          />
        </RailPages>
      </AppBar>
    </Screen>
  );
}

/** The rail with an app's places, and what it put under Notebooks, cut at the cap with “and n more”. */
export const RailWithPlaces: Story = { render: () => <Rail cap={6} /> };

function About({ open: start }: { open: boolean }) {
  const [open, setOpen] = useState(start);
  return (
    <Screen>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'flex-end' }}>
        <AboutPanel
          app="Notes"
          sections={[
            { id: 'details', label: 'Details', icon: 'info' },
            { id: 'history', label: 'History', icon: 'history' },
          ]}
          content={{ details: <p style={{ margin: 0 }}>Kept on this floor. Sam Lee wrote it on 3 November.</p> }}
          open={open}
          onOpenChange={setOpen}
        />
      </div>
    </Screen>
  );
}

/** The About panel open, with the sections the app declares; History is empty, and says so. */
export const AboutOpen: Story = { render: () => <About open /> };
/** Folded to its button at the edge. */
export const AboutFolded: Story = { render: () => <About open={false} /> };
