// @vitest-environment happy-dom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AskTwice } from './ask-twice.js';
import { ms } from './timing.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
const draw = (node: ReactNode) => {
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(node));
  return document.body.firstElementChild as HTMLElement;
};
const press = (el: Element) => act(() => (el as HTMLElement).click());
afterEach(() => {
  act(() => root?.unmount());
  vi.useRealTimers();
});

describe('AskTwice', () => {
  it('acts only on a second press, saying what will happen in between', () => {
    const onPress = vi.fn();
    const onArmedChange = vi.fn();
    const box = draw(
      <AskTwice confirm="Press again to delete" onPress={onPress} onArmedChange={onArmedChange}>
        Delete
      </AskTwice>,
    );
    const button = box.querySelector('button')!;
    const status = box.querySelector('[role="status"]')!;
    expect(status.textContent).toBe('');
    press(button);
    expect(onPress).not.toHaveBeenCalled();
    expect(onArmedChange).toHaveBeenLastCalledWith(true);
    expect(button.textContent).toContain('Press again to delete');
    expect(status.textContent).toBe('Press again to delete');
    press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onArmedChange).toHaveBeenLastCalledWith(false);
    expect(button.textContent).toBe('Delete');
  });

  it('goes back by itself after motion-still, or for armFor', () => {
    vi.useFakeTimers();
    const button = draw(<AskTwice confirm="Press again to turn off">Turn off</AskTwice>).querySelector('button')!;
    press(button);
    act(() => vi.advanceTimersByTime(ms('motion-still') + 1));
    expect(button.textContent).toBe('Turn off');
    act(() => root?.unmount());
    const quick = draw(<AskTwice confirm="Press again to remove" armFor={500}>Remove</AskTwice>).querySelector('button')!;
    press(quick);
    act(() => vi.advanceTimersByTime(501));
    expect(quick.textContent).toBe('Remove');
  });

  it('goes back on Esc and when focus leaves', () => {
    const onPress = vi.fn();
    const button = draw(<AskTwice confirm="Press again to reset" onPress={onPress}>Reset password</AskTwice>).querySelector('button')!;
    press(button);
    act(() => {
      button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(button.textContent).toBe('Reset password');
    press(button);
    act(() => {
      button.focus();
      button.blur();
    });
    expect(button.textContent).toBe('Reset password');
    press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('stays focusable and says why when unavailable', () => {
    const onPress = vi.fn();
    const box = draw(
      <AskTwice confirm="Press again to delete" disabled reason="Only an admin of this floor can delete it." onPress={onPress}>
        Delete
      </AskTwice>,
    );
    const button = box.querySelector('button')!;
    expect(button.disabled).toBe(false);
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(document.getElementById(button.getAttribute('aria-describedby')!)?.textContent).toBe('Only an admin of this floor can delete it.');
    press(button);
    press(button);
    expect(onPress).not.toHaveBeenCalled();
    expect(button.textContent).toBe('Delete');
  });
});
