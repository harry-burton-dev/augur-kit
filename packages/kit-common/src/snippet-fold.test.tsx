// @vitest-environment happy-dom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Snippet } from './snippet.js';
import { Fold, Folds } from './fold.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
const draw = (node: ReactNode) => {
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(node));
};
afterEach(() => {
  act(() => root?.unmount());
  vi.restoreAllMocks();
});
const clipboard = (write: (t: string) => Promise<void>) => Object.defineProperty(navigator, 'clipboard', { value: { writeText: write }, configurable: true });

describe('Snippet', () => {
  it('copies the whole code on a press, and says Copied', async () => {
    const write = vi.fn(() => Promise.resolve());
    clipboard(write);
    const onCopy = vi.fn();
    draw(<Snippet code={'one\ntwo'} label="the steps" onCopy={onCopy} />);
    const key = document.querySelector<HTMLElement>('[role="button"]')!;
    expect(key.getAttribute('aria-label')).toBe('Press to copy the steps');
    await act(async () => key.click());
    expect(write).toHaveBeenCalledWith('one\ntwo');
    expect(onCopy).toHaveBeenCalledWith('one\ntwo', true);
    expect(key.dataset.state).toBe('copied');
    expect(document.querySelector('[role="status"]')!.textContent).toBe('Copied the steps.');
  });

  it('says what to do when the browser refuses', async () => {
    clipboard(() => Promise.reject(new Error('denied')));
    draw(<Snippet code="x" label="the id" blockedText="Copy it yourself." />);
    await act(async () => document.querySelector<HTMLElement>('[role="button"]')!.click());
    expect(document.querySelector('[role="status"]')!.textContent).toBe('Copy it yourself.');
  });

  it('folds long code to its first lines, and opens to all of them', () => {
    draw(<Snippet code={Array.from({ length: 8 }, (_, i) => `line ${i}`).join('\n')} label="the log" lines={3} />);
    expect(document.querySelectorAll('pre code')).toHaveLength(3);
    const more = document.querySelector<HTMLButtonElement>('.augur-snippet-more')!;
    expect(more.textContent).toBe('Show all 8 lines');
    act(() => more.click());
    expect(document.querySelectorAll('pre code')).toHaveLength(8);
  });

  it('won’t copy while unavailable, and says why', async () => {
    const write = vi.fn(() => Promise.resolve());
    clipboard(write);
    draw(<Snippet code="ak_live" label="the key" disabled reason="Only an admin can copy a live key." />);
    await act(async () => document.querySelector<HTMLElement>('[role="button"]')!.click());
    expect(write).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain('Only an admin can copy a live key.');
  });
});

describe('Folds', () => {
  const set = (onOpenChange?: (o: string[]) => void) => (
    <Folds defaultOpen={['a']} onOpenChange={onOpenChange}>
      <Fold id="a" title="Alerts" summary="3 on">
        <p>Alerts inside</p>
      </Fold>
      <Fold id="b" title="Access">
        <p>Access inside</p>
      </Fold>
      <Fold id="c" title="Billing" disabled reason="Only the owner can open billing." />
    </Folds>
  );
  const heads = () => [...document.querySelectorAll<HTMLButtonElement>('.augur-fold-head')];

  it('opens one at a time from its heading', () => {
    const changed = vi.fn();
    draw(set(changed));
    expect(heads()[0].getAttribute('aria-expanded')).toBe('true');
    expect(heads()[1].getAttribute('aria-expanded')).toBe('false');
    act(() => heads()[1].click());
    expect(heads()[1].getAttribute('aria-expanded')).toBe('true');
    expect(heads()[0].getAttribute('aria-expanded')).toBe('false');
    expect(changed).toHaveBeenLastCalledWith(['b']);
  });

  it('keeps an unavailable fold in the set, focusable, saying why', () => {
    draw(set());
    const billing = heads()[2];
    expect(billing.getAttribute('aria-disabled')).toBe('true');
    expect(billing.disabled).toBe(false);
    act(() => billing.click());
    expect(billing.getAttribute('aria-expanded')).toBe('false');
    expect(document.getElementById(billing.getAttribute('aria-describedby')!)!.textContent).toBe('Only the owner can open billing.');
  });

  it('puts each heading at the level asked for', () => {
    draw(set());
    expect(document.querySelectorAll('h3 .augur-fold-head')).toHaveLength(3);
  });
});
