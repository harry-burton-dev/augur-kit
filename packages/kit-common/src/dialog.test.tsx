// @vitest-environment happy-dom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Checkbox, CheckboxGroup } from './checkbox.js';
import { Dialog } from './dialog.js';
import { TextField } from './text-field.js';
import { Toggle } from './toggle.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
const draw = (node: ReactNode) => {
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(node));
};
afterEach(() => act(() => root?.unmount()));
const primary = () => [...document.querySelectorAll('button')].find((b) => b.textContent === 'Create')!;
const type = (input: HTMLInputElement, text: string) =>
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, text);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

describe('Dialog', () => {
  it('checks every field before it acts, then closes with the values', async () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn();
    draw(
      <Dialog open heading="New collection" actionLabel="Create" onClose={onClose} onSubmit={onSubmit} fields={<TextField label="Name" name="name" required />} />,
    );
    const input = document.querySelector('input')!;
    await act(async () => primary().click());
    expect(onSubmit).not.toHaveBeenCalled();
    expect(document.querySelector('.augur-field')!.getAttribute('data-state')).toBe('attention');
    type(input, 'Plans');
    await act(async () => primary().click());
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Plans' });
    expect(onClose).toHaveBeenCalledWith({ name: 'Plans' });
  });

  it('stays open and says why when the action fails', async () => {
    const onClose = vi.fn();
    draw(<Dialog open heading="Publish" actionLabel="Create" onClose={onClose} onSubmit={() => Promise.reject(new Error('The library is read-only now.'))} />);
    await act(async () => primary().click());
    expect(onClose).not.toHaveBeenCalled();
    expect(document.querySelector('[role="alert"]')?.textContent).toBe('The library is read-only now.');
  });

  describe('Enter in a field', () => {
    const enter = (el: HTMLElement) => act(async () => void el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })));

    it('presses the primary from a one-line TextField', async () => {
      const onClose = vi.fn();
      draw(<Dialog open heading="New collection" actionLabel="Create" onClose={onClose} fields={<TextField label="Name" name="name" required />} />);
      const input = document.querySelector('input')!;
      type(input, 'Plans');
      await enter(input);
      expect(onClose).toHaveBeenCalledWith({ name: 'Plans' });
    });

    it('stops at the gap when the field is empty', async () => {
      const onClose = vi.fn();
      draw(<Dialog open heading="New collection" actionLabel="Create" onClose={onClose} fields={<TextField label="Name" name="name" required />} />);
      await enter(document.querySelector('input')!);
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('what its fields report', () => {
    const fields = (
      <>
        <Checkbox name="notify" defaultChecked>
          Tell the team
        </Checkbox>
        <Checkbox name="pin">Pin it</Checkbox>
        <Toggle label="Public" name="public" />
        <CheckboxGroup label="Kinds" name="kinds" defaultValue={['a', 'c']}>
          <Checkbox value="a">A</Checkbox>
          <Checkbox value="b">B</Checkbox>
          <Checkbox value="c">C</Checkbox>
        </CheckboxGroup>
      </>
    );

    it('carries a Checkbox, a Toggle and a CheckboxGroup in the values', async () => {
      const onSubmit = vi.fn();
      draw(<Dialog open heading="Share" actionLabel="Create" onClose={() => {}} onSubmit={onSubmit} fields={fields} />);
      await act(async () => primary().click());
      expect(onSubmit).toHaveBeenCalledWith({ notify: 'true', pin: 'false', public: 'false', kinds: 'a,c' });
    });

    it('reads a Checkbox as it stands now', async () => {
      const onSubmit = vi.fn();
      draw(<Dialog open heading="Share" actionLabel="Create" onClose={() => {}} onSubmit={onSubmit} fields={<Checkbox name="pin">Pin it</Checkbox>} />);
      await act(async () => document.querySelector('input')!.click());
      await act(async () => primary().click());
      expect(onSubmit).toHaveBeenCalledWith({ pin: 'true' });
    });

    it('holds the primary until a required CheckboxGroup has a tick', async () => {
      const onSubmit = vi.fn();
      draw(
        <Dialog
          open
          heading="Share"
          actionLabel="Create"
          onClose={() => {}}
          onSubmit={onSubmit}
          fields={
            <CheckboxGroup label="Kinds" name="kinds" required>
              <Checkbox value="a">A</Checkbox>
            </CheckboxGroup>
          }
        />,
      );
      await act(async () => primary().click());
      expect(onSubmit).not.toHaveBeenCalled();
      expect(document.querySelector<HTMLElement>('.augur-field')!.dataset.state).toBe('attention');
      expect(document.body.textContent).toContain('Needs you.');
      await act(async () => document.querySelector('input')!.click());
      expect(document.body.textContent).not.toContain('Needs you.');
      await act(async () => primary().click());
      expect(onSubmit).toHaveBeenCalledWith({ kinds: 'a' });
    });
  });
});
