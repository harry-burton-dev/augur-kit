import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Lifecycle, type LifecycleProps, type LifecycleState } from './lifecycle.js';

const STATES: LifecycleState[] = [
  { id: 'draft', name: 'Draft' },
  { id: 'review', name: 'In review' },
  { id: 'approved', name: 'Approved' },
  { id: 'issued', name: 'Issued' },
  { id: 'retired', name: 'Retired' },
];

const NEXT: Record<string, string[]> = { draft: ['review'], review: ['draft', 'approved'], approved: ['issued'], issued: ['retired'], retired: [] };

/** The record moves when a button is pressed, as an app would move it. */
const Mover = (props: LifecycleProps) => {
  const [state, setState] = useState(props.state);
  return <Lifecycle {...props} state={state} moves={props.moves ?? NEXT[state]} onMove={(s) => { setState(s); props.onMove?.(s); }} />;
};

/**
 * Where one record is in its lifecycle: every state in order, the ones it has passed filled, the
 * one it's in raised as a key, the rest dim. The states sit in a well, as Key. Under the track, a button for each state the
 * person may move it to; with none, `why` says what would let them. States off the main line, such
 * as Retired, show only while the record is in one. The states' names are the app's own words.
 */
const meta = {
  title: 'Quill/Lifecycle',
  component: Lifecycle,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 'var(--measure-decision)' }}><Story /></div>],
  render: (args) => <Mover {...args} />,
  args: { states: STATES, state: 'review', offLine: ['retired'], label: 'Version 3', busy: false },
  argTypes: {
    states: { control: 'object' },
    state: { control: 'inline-radio', options: STATES.map((s) => s.id) },
    moves: { control: 'object' },
    offLine: { control: 'object' },
    why: { control: 'text' },
    onMove: { action: 'move' },
    className: { control: false },
  },
} satisfies Meta<typeof Lifecycle>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};
/** Just started. */
export const Draft: Story = { args: { state: 'draft' } };
/** Can't be moved by this person, and says who can. */
export const CantMove: Story = { args: { state: 'approved', moves: [], why: 'Only its library’s leads can issue it.' } };
/** A move under way: the buttons wait. */
export const Busy: Story = { args: { busy: true } };
/** Off the main line, so Retired shows. */
export const Retired: Story = { args: { state: 'retired' } };
