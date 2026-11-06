// @vitest-environment happy-dom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Notice, Toasts } from './notice.js';
import { ms } from './timing.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
const draw = (node: ReactNode) => {
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(node));
};
afterEach(() => {
  act(() => root?.unmount());
  vi.useRealTimers();
});

describe('Notice', () => {
  it('stamps its tone in words, so colour is never the only sign', () => {
    draw(<Notice tone="needs" heading="Waiting for your back-brief." action="Write it" more={2} />);
    expect(document.querySelector('.augur-notice-tone')!.textContent).toBe('Needs you');
    expect(document.body.textContent).toContain('2 more need you.');
    expect(document.querySelector('button')!.textContent).toContain('Write it');
  });

  it('takes its own word', () => {
    draw(<Notice tone="warning" label="Stale">Two records are going stale.</Notice>);
    expect(document.querySelector('.augur-notice-tone')!.textContent).toBe('Stale');
  });
});

describe('Toasts', () => {
  it('go by themselves after motion-toast, but not while held, and keep the time they had left', () => {
    vi.useFakeTimers();
    const onDone = vi.fn();
    draw(<Toasts toasts={[{ id: 'a', text: 'Archived 3 records' }]} onDone={onDone} />);
    const toast = document.querySelector('li')!;
    expect(toast.querySelector('.augur-toast-kind')!.textContent).toBe('Done');
    act(() => vi.advanceTimersByTime(ms('motion-toast') / 2));
    act(() => {
      toast.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    });
    act(() => vi.advanceTimersByTime(ms('motion-toast') * 2));
    expect(onDone).not.toHaveBeenCalled();
    act(() => {
      toast.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
    });
    act(() => vi.advanceTimersByTime(ms('motion-toast') / 2 - 10));
    expect(onDone).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(20));
    expect(onDone).toHaveBeenCalledWith('a');
  });
});
