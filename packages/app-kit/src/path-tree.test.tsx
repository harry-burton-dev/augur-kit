// @vitest-environment happy-dom
import { act, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PathTree, type PathNode } from './path-tree.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
const draw = (node: ReactNode) => {
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(node));
};
afterEach(() => act(() => root?.unmount()));
const key = (el: Element, k: string) => act(() => void el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true })));
const rows = () => [...document.querySelectorAll('[role="treeitem"]')] as HTMLElement[];
const named = (name: string) => rows().find((r) => r.querySelector('.quill-tree-label')!.textContent === name)!;
const describedBy = (el: Element) =>
  (el.getAttribute('aria-describedby') ?? '')
    .split(' ')
    .filter(Boolean)
    .map((id) => document.getElementById(id)!.textContent)
    .join(' | ');

/** Five levels deep: L0 › L1 › L2 › L3 › L4, each with a neighbour. */
const deep: PathNode[] = [
  {
    id: 'l0',
    label: 'L0',
    children: [
      {
        id: 'l1',
        label: 'L1',
        children: [
          {
            id: 'l2',
            label: 'L2',
            children: [
              { id: 'l3', label: 'L3', children: [{ id: 'l4', label: 'L4', children: [{ id: 'in', label: 'Inside' }] }, { id: 's4', label: 'S4' }] },
              { id: 's3', label: 'S3', needsYou: 'A form waits for you' },
            ],
          },
          { id: 's2', label: 'S2' },
        ],
      },
      { id: 's1', label: 'S1' },
    ],
  },
  { id: 's0', label: 'S0', children: [{ id: 'far', label: 'Far', needsYou: 'Two plans wait for your sign-off' }] },
];
const full = ['l0', 'l1', 'l2', 'l3', 'l4'];

describe('PathTree: the lit path', () => {
  it('dims each row by how far back up the path it is', () => {
    draw(<PathTree label="Collections" nodes={deep} path={full} onOpen={() => {}} pinned={0} />);
    const distance = (name: string) => named(name).dataset.distance;
    expect(['L0', 'L1', 'L2', 'L3', 'L4', 'Inside'].map(distance)).toEqual(['0', '0', '0', '0', '0', '0']);
    expect(distance('S4')).toBe('1');
    expect(distance('S3')).toBe('2');
    expect(distance('S2')).toBe('3');
    expect(distance('S1')).toBe('3');
    expect(distance('S0')).toBe('3');
  });

  it('marks the current row as the location and keeps aria-expanded on the path', () => {
    draw(<PathTree label="Collections" nodes={deep} path={['l0', 'l1']} onOpen={() => {}} />);
    expect(named('L1').getAttribute('aria-current')).toBe('location');
    expect(named('L0').getAttribute('aria-current')).toBeNull();
    expect(named('L0').getAttribute('aria-expanded')).toBe('true');
    expect(named('S0').getAttribute('aria-expanded')).toBe('false');
  });

  it('pins the path rows as the breadcrumb, and 0 pins nothing', () => {
    draw(<PathTree label="Collections" nodes={deep} path={['l0', 'l1', 'l2']} onOpen={() => {}} />);
    expect(rows().filter((r) => r.dataset.pinned != null).map((r) => r.dataset.pinned + ':' + r.textContent)).toEqual(['0:L0', '1:L1', '2:L2']);
    draw(<PathTree label="Collections" nodes={deep} path={['l0', 'l1', 'l2']} onOpen={() => {}} pinned={0} />);
    expect(rows().some((r) => r.dataset.pinned != null)).toBe(false);
  });

  it('folds the middle of a deep path into one row that says how many levels it holds, and opens them', () => {
    draw(<PathTree label="Collections" nodes={deep} path={full} onOpen={() => {}} />);
    const fold = document.querySelector('.quill-tree-fold') as HTMLElement;
    expect(fold.getAttribute('aria-label')).toBe('2 more levels: L1, L2');
    expect(fold.getAttribute('aria-expanded')).toBe('false');
    // The top row, the fold, then the last two levels of the path: the breadcrumb.
    expect(rows().filter((r) => r.dataset.pinned != null).map((r) => r.querySelector('.quill-tree-label')!.textContent)).toEqual(['L0', '… 2 more levels', 'L3', 'L4']);
    // The folded levels' own neighbours go with them; nearer ones stay.
    expect(rows().map((r) => r.querySelector('.quill-tree-label')!.textContent)).not.toContain('S2');
    expect(named('S3')).toBeDefined();
    act(() => fold.click());
    expect(document.querySelector('.quill-tree-fold')).toBeNull();
    expect(named('L1')).toBeDefined();
    expect(named('S2')).toBeDefined();
    expect(document.activeElement).toBe(named('L1'));
  });

  it('can name the fold in the app’s own words', () => {
    draw(<PathTree label="Collections" nodes={deep} path={full} onOpen={() => {}} pinned={2} foldedLabel={(f) => `${f.length} hidden`} />);
    expect(document.querySelector('.quill-tree-fold')!.getAttribute('aria-label')).toBe('3 hidden: L1, L2, L3');
  });

  it('blooms a row that needs you, says why in words, and reads it as its description', () => {
    draw(<PathTree label="Collections" nodes={deep} path={['l0', 'l1', 'l2', 'l3']} onOpen={() => {}} />);
    const s3 = named('S3');
    expect(s3.hasAttribute('data-needs')).toBe(true);
    expect(s3.querySelector('.quill-tree-needs')!.textContent).toBe('A form waits for you');
    expect(describedBy(s3)).toBe('A form waits for you');
    expect(named('S4').hasAttribute('data-needs')).toBe(false);
  });

  it('blooms a closed or folded ancestor when something inside needs you', () => {
    draw(<PathTree label="Collections" nodes={deep} path={full} onOpen={() => {}} />);
    // S0 is closed: its child Far needs you.
    expect(describedBy(named('S0'))).toBe('Two plans wait for your sign-off');
    // An opened row on the path doesn't take on what is drawn below it.
    expect(named('L0').hasAttribute('data-needs')).toBe(false);
    draw(<PathTree label="Collections" nodes={deep} path={full} onOpen={() => {}} pinned={1} />);
    // L0 to L3 fold, with their neighbours: S3 and Far need you, so the fold blooms with both.
    const fold = document.querySelector('.quill-tree-fold') as HTMLElement;
    expect(fold.hasAttribute('data-needs')).toBe(true);
    expect(describedBy(fold)).toBe('A form waits for you Two plans wait for your sign-off');
  });

  it('reads a locked row’s reason as its description', () => {
    const nodes: PathNode[] = [{ id: 'a', label: 'A', icon: 'folder' }, { id: 'p', label: 'People', icon: 'folder', locked: 'Ask the People team admins' }];
    draw(<PathTree label="Collections" nodes={nodes} path={['a']} onOpen={() => {}} />);
    const people = named('People');
    expect(people.getAttribute('aria-disabled')).toBe('true');
    expect(describedBy(people)).toBe('Ask the People team admins');
  });

  it('walks back up the path with ← on the current row and with Backspace', () => {
    function Walk({ onOpen }: { onOpen: (n: PathNode) => void }) {
      const [path, setPath] = useState(['l0', 'l1', 'l2']);
      return (
        <PathTree
          label="Collections"
          nodes={deep}
          path={path}
          onOpen={(n) => {
            onOpen(n);
            setPath((p) => p.slice(0, p.indexOf(n.id) + 1));
          }}
        />
      );
    }
    const onOpen = vi.fn();
    draw(<Walk onOpen={onOpen} />);
    key(named('L2'), 'ArrowLeft');
    expect(onOpen).toHaveBeenLastCalledWith(deep[0]!.children![0]);
    expect(named('L1').getAttribute('aria-current')).toBe('location');
    expect(document.activeElement).toBe(named('L1'));
    key(named('S1'), 'Backspace');
    expect(onOpen).toHaveBeenLastCalledWith(deep[0]);
    expect(document.activeElement).toBe(named('L0'));
    // At the top there is nowhere to walk back to.
    key(named('L0'), 'Backspace');
    expect(onOpen).toHaveBeenCalledTimes(2);
  });
});
