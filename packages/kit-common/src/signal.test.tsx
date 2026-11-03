// @vitest-environment happy-dom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { Signal, STREAK_MOST, type SignalKind } from './signal.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
const draw = (node: ReactNode) => {
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(node));
};
afterEach(() => act(() => root?.unmount()));

describe('Signal', () => {
  const kinds: SignalKind[] = ['streak', 'bloom', 'flicker', 'ember', 'beacon', 'shadow'];

  it.each(kinds)('a %s carries its words, and its light is hidden from assistive tech', (kind) => {
    draw(<Signal kind={kind} label="Needs you" />);
    const signal = document.querySelector('.augur-signal')!;
    expect(signal.getAttribute('data-kind')).toBe(kind);
    expect(signal.textContent).toBe('Needs you');
    expect(signal.querySelector('.augur-signal-light')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('writes a streak’s count and caps its length, not its number', () => {
    draw(<Signal kind="streak" label="to review" count={40} />);
    const signal = document.querySelector('.augur-signal') as HTMLElement;
    expect(signal.textContent).toBe('40to review');
    expect(signal.style.getPropertyValue('--signal-count')).toBe(String(STREAK_MOST));
  });

  it('says why a shadow is unavailable', () => {
    draw(
      <Signal kind="shadow" label="Unavailable">
        Only the org’s owners can publish here.
      </Signal>,
    );
    expect(document.querySelector('.augur-signal-more')!.textContent).toBe('Only the org’s owners can publish here.');
  });
});
