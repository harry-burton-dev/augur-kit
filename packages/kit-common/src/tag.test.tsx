// @vitest-environment happy-dom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { Tag, Tags } from './tag.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
const draw = (node: ReactNode) => {
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(node));
};
afterEach(() => act(() => root?.unmount()));

const words = () => [...document.querySelectorAll('.augur-tag-word')].map((w) => w.textContent);
const items = ['Safety', 'Budget', 'Hiring', 'Travel', 'Leave'].map((label) => ({ id: label, label }));

describe('Tag', () => {
  it('says what its × removes', () => {
    let gone = false;
    draw(<Tag label="Travel" removeLabel="Topic: Travel" onRemove={() => (gone = true)} />);
    const x = document.querySelector('button')!;
    expect(x.getAttribute('aria-label')).toBe('Remove Topic: Travel');
    act(() => x.click());
    expect(gone).toBe(true);
  });
});

describe('Tags', () => {
  it('folds the rest behind "+N more", opens them in place and folds them again', () => {
    draw(<Tags items={items} limit={2} label="Topics" />);
    expect(words()).toEqual(['Safety', 'Budget']);
    const fold = document.querySelector<HTMLButtonElement>('.augur-tags-more')!;
    expect(fold.textContent).toBe('+3 more');
    expect(fold.getAttribute('aria-expanded')).toBe('false');
    act(() => fold.click());
    expect(words()).toEqual(['Safety', 'Budget', 'Hiring', 'Travel', 'Leave']);
    expect(fold.textContent).toBe('Fewer');
    act(() => fold.click());
    expect(words()).toHaveLength(2);
  });

  it('shows them all with no limit, or when they fit, and takes its own words', () => {
    draw(<Tags items={items} />);
    expect(words()).toHaveLength(5);
    expect(document.querySelector('.augur-tags-more')).toBeNull();
    draw(<Tags items={items} limit={5} />);
    expect(document.querySelector('.augur-tags-more')).toBeNull();
    draw(<Tags items={items} limit={1} moreLabel={(n) => `${n} others`} />);
    expect(document.querySelector('.augur-tags-more')!.textContent).toBe('4 others');
  });
});
