import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Tree, type TreeNode, type TreeProps } from './tree.js';

const FOLDERS: TreeNode[] = [
  {
    id: 'sites',
    label: 'Sites',
    icon: 'folder',
    meta: '3',
    children: [
      { id: 'harbour', label: 'Harbour', icon: 'folder', meta: '12', children: [{ id: 'berths', label: 'Berths', icon: 'folder', meta: '4' }, { id: 'quay', label: 'Quay wall', icon: 'folder', meta: '2' }] },
      { id: 'depot', label: 'Depot', icon: 'folder', meta: '5' },
    ],
  },
  { id: 'people', label: 'People', icon: 'people', meta: '8' },
  { id: 'budgets', label: 'Budgets', icon: 'chart', meta: '7' },
];

/** The tree keeps its own selection here, as an app would. */
const Chosen = (props: TreeProps) => {
  const [selected, setSelected] = useState(props.selected);
  return <Tree {...props} selected={selected} onSelect={(n) => { setSelected(n.id); props.onSelect?.(n); }} />;
};

/**
 * Things inside things, such as a library's folders: one row each, indented under its parent, with
 * a chevron to open or close what's inside. The rows above the selected one open by themselves.
 * Arrow keys move, open and close; the ARIA tree pattern comes from React Aria. `compact` keeps
 * only the top level's icons, with their names on hover, for a folded rail.
 */
const meta = {
  title: 'Quill/Tree',
  component: Tree,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 'var(--measure-decision)' }}><Story /></div>],
  render: (args) => <Chosen {...args} />,
  args: { label: 'Folders', heading: 'Folders', items: FOLDERS, selected: 'berths', open: [], compact: false },
  argTypes: { items: { control: 'object' }, open: { control: 'object' }, onSelect: { action: 'select' }, onToggle: { action: 'toggle' }, className: { control: false } },
} satisfies Meta<typeof Tree>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};
/** Nothing chosen yet, every row closed. */
export const Closed: Story = { args: { selected: '' } };
/** With no heading on screen; the label is still read aloud. */
export const NoHeading: Story = { args: { heading: undefined } };
/** Icons only, for a folded rail. */
export const Compact: Story = { args: { compact: true }, decorators: [(Story) => <div style={{ width: 'var(--space-8)' }}><Story /></div>] };
