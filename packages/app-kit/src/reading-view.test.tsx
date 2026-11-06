// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { ReadingView } from './reading-view.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const DOC = '# Winter works\n\nThe quay closes.\n\n## What changes\n\nDeliveries move.\n\n## Who to ask\n\nThe site lead.';

let root: Root | undefined;
const draw = async (node: React.ReactNode) => {
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(node));
  for (let i = 0; i < 20 && !document.querySelector('.quill-reader h2'); i++) await act(() => new Promise((r) => setTimeout(r, 10)));
};
afterEach(() => {
  act(() => root?.unmount());
  localStorage.clear();
});
const press = (name: string) => {
  const button = [...document.querySelectorAll('button')].find((b) => b.textContent === name)!;
  act(() => button.click());
};
const reader = () => document.querySelector<HTMLElement>('.quill-reader')!;

describe('the reading view', () => {
  it('starts in the flow the app gives, and the reader can switch it', async () => {
    await draw(<ReadingView markdown={DOC} title="Winter works" defaultFlow="leaves" />);
    expect(reader().dataset.flow).toBe('leaves');
    expect(document.querySelector('.quill-reading-foot')).not.toBeNull();
    press('Scroll');
    expect(reader().dataset.flow).toBe('horizon');
    expect(document.querySelector('.quill-reading-foot')).toBeNull();
  });

  it('dims all but the section being read, in Scroll', async () => {
    await draw(<ReadingView markdown={DOC} title="Winter works" defaultFlow="horizon" />);
    const here = [...reader().querySelectorAll('[data-here]')].map((b) => b.textContent);
    expect(here).toContain('The quay closes.');
    expect(here).not.toContain('Deliveries move.');
  });

  it('docks the contents at a desk, and keeps them behind a key on a page', async () => {
    await draw(<ReadingView markdown={DOC} title="Winter works" defaultMode="page" />);
    expect(document.querySelector('.quill-contents')).toBeNull();
    act(() => document.querySelector<HTMLButtonElement>('[aria-label="Open contents"]')!.click());
    expect(document.querySelector('.quill-contents')).not.toBeNull();
    press('Desk');
    expect(document.querySelector('.quill-reading-contents .quill-contents')).not.toBeNull();
  });

  it('remembers the reader’s own choice under its name', async () => {
    await draw(<ReadingView markdown={DOC} remember="brief" defaultFlow="horizon" />);
    press('Turn pages');
    press('Desk');
    act(() => root?.unmount());
    await draw(<ReadingView markdown={DOC} remember="brief" defaultFlow="horizon" />);
    expect(reader().dataset.flow).toBe('leaves');
    expect(document.querySelector('.quill-reading')!.getAttribute('data-mode')).toBe('desk');
  });
});
