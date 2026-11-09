import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Palette, type PaletteItem, type PaletteProps } from './palette.js';

const ITEMS: PaletteItem[] = [
  { id: 'agent', label: 'Import agent', detail: 'Agents', meta: 'Agent', icon: 'agents', group: 'Found' },
  { id: 'doc', label: 'Import checklist', detail: 'Library › Ops › Guides', meta: 'Document', icon: 'document' },
  { id: 'r4821', label: 'Run 4821, nightly import', detail: 'Runs › Ops', meta: 'Run', icon: 'play' },
  { id: 'audit', label: 'Import audit log', meta: 'Log', icon: 'history', locked: 'Needs admin rights' },
];

/** The palette keeps its query here, as an app would, and narrows the made-up results. */
function Live(props: PaletteProps) {
  const [query, setQuery] = useState(props.query);
  const items = props.items.filter((i) => i.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  return <Palette {...props} query={query} onQuery={setQuery} items={items} />;
}

/**
 * Find and go, from anywhere in an app, then out of the way. Drawn as a ruled strip (Rail, picked 6 Nov
 * 2026): an ink line at its top, the field on one line with its lead word in mono, results ruled with each
 * one's kind in mono capitals at the end, and the row you're on marked by the ink line at its start. What's
 * behind is dimmed, never blurred. Something you can't open stays, with a lock and why.
 *
 * ↑ ↓ move, Enter goes, Esc closes and gives focus back. The app wires the key that opens it (`/`).
 */
const meta = {
  title: 'Quill/Palette',
  component: Palette,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <div style={{ minHeight: 'calc(var(--space-8) * 8)' }}>{Story()}</div>],
  render: (args) => <Live {...args} />,
  args: {
    open: true,
    placeholder: 'Find a run, agent or document',
    query: 'imp',
    items: ITEMS,
    lead: 'Go to',
    found: (n: number) => `${n} found`,
    none: 'Nothing matches. Try fewer words.',
    onClose: () => {},
    onQuery: () => {},
    onPick: () => {},
  },
  argTypes: {
    items: { control: 'object' },
    found: { control: false },
    onClose: { action: 'closed' },
    onPick: { action: 'picked' },
    onQuery: { control: false },
  },
} satisfies Meta<typeof Palette>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};

/** No lead word: a find icon starts the field. */
export const NoLead: Story = { args: { lead: undefined, found: undefined } };

/** Nothing matches: it says so, and how to find more. */
export const NothingFound: Story = { args: { query: 'zzz' } };
