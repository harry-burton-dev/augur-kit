// @vitest-environment happy-dom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EditInPlace } from './edit-in-place.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
const draw = (node: ReactNode) => {
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(node));
};
afterEach(() => act(() => root?.unmount()));

const press = (name: string) => {
  const b = [...document.querySelectorAll('button')].find((x) => x.textContent?.includes(name));
  if (!b) throw new Error(`No ${name} key`);
  act(() => {
    b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse', button: 0 }));
    b.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'mouse', button: 0 }));
    b.click();
  });
};
const type = (text: string) => {
  const input = document.querySelector<HTMLInputElement>('input')!;
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  act(() => {
    set.call(input, text);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  return input;
};
const key = (input: HTMLInputElement, k: string) => act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true })));

describe('EditInPlace', () => {
  it('saves a new value on Enter', async () => {
    const onSave = vi.fn(() => Promise.resolve());
    draw(<EditInPlace label="Name" value="Night roster" onSave={onSave} />);
    press('Rename');
    const input = type('Day roster');
    await act(async () => key(input, 'Enter'));
    expect(onSave).toHaveBeenCalledWith('Day roster');
    expect(document.querySelector('input')).toBeNull();
  });

  it('puts it back on Esc, without saving', () => {
    const onSave = vi.fn();
    draw(<EditInPlace label="Name" value="Night roster" onSave={onSave} />);
    press('Rename');
    key(type('Something else'), 'Escape');
    expect(onSave).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain('Night roster');
  });

  it('says why a save was refused, and keeps the words', async () => {
    draw(<EditInPlace label="Name" value="Night roster" onSave={() => Promise.reject(new Error('That name is taken.'))} />);
    press('Rename');
    const input = type('Day roster');
    await act(async () => key(input, 'Enter'));
    expect(document.querySelector('[role="alert"]')!.textContent).toBe('That name is taken.');
    expect(document.querySelector<HTMLInputElement>('input')!.value).toBe('Day roster');
  });

  it('refuses before sending when the check says no', async () => {
    const onSave = vi.fn();
    draw(<EditInPlace label="Name" value="A" onSave={onSave} check={() => 'Too short.'} />);
    press('Rename');
    await act(async () => key(type('B'), 'Enter'));
    expect(onSave).not.toHaveBeenCalled();
    expect(document.querySelector('[role="alert"]')!.textContent).toBe('Too short.');
  });

  it('shows the value and why when unavailable, with no key', () => {
    draw(<EditInPlace label="Owner" value="Ops" onSave={() => undefined} disabled reason="Only an admin can change it." />);
    expect(document.body.textContent).toContain('Ops');
    expect(document.body.textContent).toContain('Only an admin can change it.');
    expect([...document.querySelectorAll('button')].some((b) => b.textContent?.includes('Rename'))).toBe(false);
  });
});
