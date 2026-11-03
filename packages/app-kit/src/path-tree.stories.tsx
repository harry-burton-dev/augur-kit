import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { PathTree, type PathLight, type PathNode } from './path-tree.js';

const folder = (id: string, label: string, count: number, children: PathNode[] = [], extra: Partial<PathNode> = {}): PathNode => ({ id, label, icon: 'folder', count, children, ...extra });

/** A deep library, so the path pins and folds: Northern region › Sites › Harbour › Berths › Winter works. */
const TREE: PathNode[] = [
  {
    id: 'north',
    label: 'Northern region',
    icon: 'library',
    count: 4,
    children: [
      folder('sites', 'Sites', 3, [
        folder('harbour', 'Harbour', 3, [
          folder('berths', 'Berths', 2, [
            folder('winter', 'Winter works', 4, [
              { id: 'w1', label: 'Dredging plan', icon: 'document' },
              { id: 'w2', label: 'Crane schedule', icon: 'document' },
              { id: 'w3', label: 'Safety brief', icon: 'document', needsYou: 'Waiting for your sign-off' },
              { id: 'w4', label: 'Contractor list', icon: 'document' },
            ]),
            folder('summer', 'Summer works', 2),
          ]),
          folder('quay', 'Quay wall', 5, [{ id: 'q1', label: 'Survey', icon: 'document', needsYou: 'Two comments to answer' }]),
          folder('yard', 'Yard', 1),
        ]),
        folder('depot', 'Depot', 2),
        folder('office', 'Office', 6),
      ]),
      folder('people', 'People', 3, [], { locked: 'Kept by the People team. Ask its admins for access.' }),
      { id: 'weekly', label: 'Weekly updates', icon: 'series', count: 5, children: [] },
      folder('budgets', 'Budgets', 7),
    ],
  },
  { id: 'south', label: 'Southern region', icon: 'library', count: 1, children: [] },
  { id: 'ref', label: 'Reference', icon: 'library', count: 1, children: [] },
];

/** The path from the top of the tree down to `id`. */
const pathTo = (id: string, nodes: PathNode[] = TREE, above: string[] = []): string[] | undefined => {
  for (const n of nodes) {
    if (n.id === id) return [...above, n.id];
    const found = pathTo(id, n.children ?? [], [...above, n.id]);
    if (found) return found;
  }
  return undefined;
};

interface Knobs {
  light: PathLight;
  pinned: number;
  start: string;
}

function Example({ light, pinned, start }: Knobs) {
  const [path, setPath] = useState(() => pathTo(start) ?? []);
  return (
    <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'flex-start' }}>
      <div style={{ width: 'var(--measure-rail)', height: '50vh', overflow: 'hidden auto', borderRight: '1px solid var(--hairline)' }}>
        <PathTree label="Your collections" nodes={TREE} path={path} onOpen={(n) => setPath(pathTo(n.id) ?? [])} light={light} pinned={pinned} />
        {/* Room to scroll, so the pinned breadcrumb shows. */}
        <div style={{ height: '50vh' }} />
      </div>
      <p style={{ maxWidth: '40ch', color: 'var(--ink-muted)', fontSize: 'var(--type-small)' }}>
        Scroll the rail: the path stays pinned at the top. ← on the current row or Backspace walks back up; → and Enter open.
      </p>
    </div>
  );
}

const meta = {
  title: 'Quill/Path tree',
  component: Example,
  render: (args) => <Example key={args.start} {...args} />,
  argTypes: {
    light: { control: 'inline-radio', options: ['path', 'flat'] },
    pinned: { control: { type: 'number', min: 0, max: 6 } },
    start: { control: 'select', options: ['north', 'sites', 'harbour', 'berths', 'winter'] },
  },
  args: { light: 'path', pinned: 3, start: 'winter' },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Five levels deep: rows dim by distance, the middle of the path folds into "…", and what needs you glows and says why. */
export const LitPath: Story = {};

/** Three levels: the whole path pins, nothing folds. */
export const Shallow: Story = { args: { start: 'harbour' } };

/** `pinned={0}`: no breadcrumb and no folding; the tree scrolls as one. */
export const Unpinned: Story = { args: { pinned: 0 } };
