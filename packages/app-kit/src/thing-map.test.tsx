// @vitest-environment happy-dom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThingMap } from './thing-map.js';
import { mapAround, THING_MAP_CAP } from './thing-map-layout.js';
import type { ThingNeighbour } from './thing-view.js';
import { THINGS } from './things.fixture.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
const draw = (node: ReactNode) => {
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(node));
};
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});
const busiest = [...THINGS].sort((a, b) => b.around.length - a.around.length)[0]!;
const many = (n: number, groups = ['People', 'Places', 'Events']): ThingNeighbour[] =>
  Array.from({ length: n }, (_, i) => ({ id: `n${i}`, relation: 'Near', name: `Neighbour ${i}`, group: groups[i % groups.length] }));

describe('mapAround', () => {
  it('keeps every neighbour inside the ring, at most the cap, and counts the rest', () => {
    for (const n of [0, 1, 2, 5, THING_MAP_CAP, 30]) {
      const { groups, more } = mapAround(many(n));
      const nodes = groups.flatMap((g) => g.nodes);
      expect(nodes).toHaveLength(Math.min(n, THING_MAP_CAP));
      expect(more).toBe(Math.max(0, n - THING_MAP_CAP));
      for (const node of nodes) {
        expect(node.x).toBeGreaterThanOrEqual(0);
        expect(node.x).toBeLessThanOrEqual(100);
        expect(node.y).toBeGreaterThanOrEqual(0);
        expect(node.y).toBeLessThanOrEqual(100);
      }
      expect(new Set(nodes.map((p) => `${p.x},${p.y}`)).size).toBe(nodes.length);
    }
  });

  it('draws the best-ranked neighbours, a group side by side, groups in the order they first come', () => {
    const { groups } = mapAround(many(7), 6);
    expect(groups.map((g) => g.name)).toEqual(['People', 'Places', 'Events']);
    expect(groups.flatMap((g) => g.nodes.map((n) => n.neighbour.id))).toEqual(['n0', 'n3', 'n1', 'n4', 'n2', 'n5']);
  });

  it('lets an app lower the cap, never raise it', () => {
    expect(mapAround(many(30), 50).groups.flatMap((g) => g.nodes)).toHaveLength(THING_MAP_CAP);
    expect(mapAround(many(30), 3).more).toBe(27);
  });

  it('puts a neighbour with no group in the other group, and lays out the same every time', () => {
    const around = [{ id: 'a', relation: 'Runs', name: 'A' }];
    expect(mapAround(around, 12, 'Other things').groups[0]!.name).toBe('Other things');
    expect(mapAround(busiest.around)).toEqual(mapAround(busiest.around));
  });
});

describe('ThingMap', () => {
  it('draws the thing in the middle and every neighbour, with how it relates, and opens one', () => {
    const onOpen = vi.fn();
    draw(<ThingMap thing={busiest} around={busiest.around} onOpen={onOpen} />);
    expect(document.querySelector('.quill-thing-map-name')!.textContent).toBe(busiest.name);
    const drawn = Math.min(busiest.around.length, THING_MAP_CAP);
    expect(document.querySelectorAll('.quill-thing-map-node')).toHaveLength(drawn);
    expect(document.querySelectorAll('.quill-thing-map-lines line')).toHaveLength(drawn);
    const first = busiest.around[0]!;
    expect(document.body.textContent).toContain(`${first.relation} ${first.name}`);
    act(() => document.querySelector<HTMLButtonElement>('.quill-thing-map-node button')!.click());
    expect(onOpen).toHaveBeenCalledWith(first.id, first);
    expect(document.querySelector('section')!.getAttribute('aria-label')).toBe(`What is around ${busiest.name}`);
  });

  it('says how many more wait past the cap, and opens them when it can', () => {
    const onEverything = vi.fn();
    draw(<ThingMap thing={busiest} around={many(15)} onEverything={onEverything} />);
    const more = [...document.querySelectorAll('button')].find((b) => b.textContent === '3 more around it')!;
    act(() => more.click());
    expect(onEverything).toHaveBeenCalled();
    draw(<ThingMap thing={busiest} around={many(15)} />);
    expect(document.querySelector('.quill-thing-foot')!.textContent).toBe('3 more around it');
  });

  it('does not say nothing is known when it only draws none of them', () => {
    draw(<ThingMap thing={busiest} around={many(3)} cap={0} />);
    expect(document.body.textContent).not.toContain('Nothing is known around it yet.');
    expect(document.querySelector('.quill-thing-foot')!.textContent).toBe('3 more around it');
  });

  it('draws the same neighbour twice when it relates in two ways', () => {
    const twice = [{ id: 'norland', relation: 'Operated by', name: 'Norland', group: 'Companies' }, { id: 'norland', relation: 'Owned by', name: 'Norland', group: 'Companies' }];
    draw(<ThingMap thing={busiest} around={twice} />);
    expect([...document.querySelectorAll('.quill-thing-map-relation')].map((r) => r.textContent)).toEqual(['Operated by', 'Owned by']);
  });

  it('says plainly when nothing is around it, and offers the way back', () => {
    const onBack = vi.fn();
    draw(<ThingMap thing={busiest} around={[]} onBack={onBack} />);
    expect(document.body.textContent).toContain('Nothing is known around it yet.');
    expect(document.querySelectorAll('.quill-thing-map-lines line')).toHaveLength(0);
    act(() => [...document.querySelectorAll('button')].find((b) => b.textContent === 'Back to its page')!.click());
    expect(onBack).toHaveBeenCalled();
  });

  it('names each group under the thing’s heading level', () => {
    draw(<ThingMap thing={busiest} around={many(4)} level={2} />);
    expect(document.querySelector('h2')!.textContent).toBe(busiest.name);
    expect([...document.querySelectorAll('h3')].map((h) => h.textContent)).toEqual(['People', 'Places', 'Events']);
  });
});
