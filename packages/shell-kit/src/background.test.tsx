// @vitest-environment happy-dom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { Background, backgrounds } from './background.js';
import { Horizon } from './background-horizon.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
const draw = (node: ReactNode) => {
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(node));
};
afterEach(() => act(() => root?.unmount()));

describe('backgrounds', () => {
  it('draws the still horizon by default', () => {
    draw(<Background floor="org" />);
    const el = document.querySelector('.aerie-horizon');
    expect(el?.getAttribute('data-floor')).toBe('org');
  });

  it('picks a background by id and passes its own options', () => {
    draw(<Background name="flat" options={{ tinted: true }} away />);
    const el = document.querySelector('.aerie-flat')!;
    expect(el.hasAttribute('data-tinted')).toBe(true);
    expect(el.hasAttribute('data-away')).toBe(true);
  });

  it('draws nothing for none', () => {
    draw(<Background name="none" />);
    expect(document.body.firstElementChild!.childElementCount).toBe(0);
  });

  it('shows flat ground, naming the id, for one not in the set', () => {
    draw(<Background name="meadow" />);
    expect(document.querySelector('.aerie-flat')?.getAttribute('data-missing')).toBe('meadow');
  });

  it('takes a set of its own', () => {
    const Mine = () => <div className="mine" />;
    draw(<Background name="mine" set={[...backgrounds, { id: 'mine', name: 'Mine', line: 'Ours', draw: Mine }]} />);
    expect(document.querySelector('.mine')).not.toBeNull();
  });

  it('every background in the kit has a name and a line', () => {
    for (const b of backgrounds) expect(b.name && b.line).toBeTruthy();
  });
});

describe('the still horizon', () => {
  it('puts the line and the rules where it is told, fainter further out', () => {
    draw(<Horizon line={0.6} above={[0.4, 0.3]} below={[0.8]} glow={false} />);
    const el = document.querySelector<HTMLElement>('.aerie-horizon')!;
    expect(el.style.getPropertyValue('--line-at')).toBe('60%');
    const above = [...el.querySelectorAll<HTMLElement>('.aerie-horizon-above')];
    expect(above.map((r) => r.style.getPropertyValue('--at'))).toEqual(['40%', '30%']);
    expect(above.map((r) => r.style.getPropertyValue('--rule'))).toEqual(['16%', '10%']);
    expect(el.querySelectorAll('.aerie-horizon-below')).toHaveLength(1);
    expect(el.querySelector('.aerie-horizon-glow')).toBeNull();
  });
});
