// @vitest-environment happy-dom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Checkbox, CheckboxGroup } from './checkbox.js';
import { Select } from './select.js';
import { TextField } from './text-field.js';
import { Toggle } from './toggle.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
const host = () => document.body.firstElementChild as HTMLElement;
const draw = (node: ReactNode) => {
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(host());
  act(() => root!.render(node));
  return host();
};
afterEach(() => act(() => root?.unmount()));

const type = (input: HTMLInputElement, text: string) =>
  act(() => {
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    set.call(input, text);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
const leave = (input: HTMLElement) =>
  act(() => {
    input.focus();
    input.blur();
  });
const field = (el: HTMLElement) => el.querySelector<HTMLElement>('.augur-field')!;

describe('TextField', () => {
  it('asks in green when a required field is left empty, and typing clears it', () => {
    const el = draw(<TextField label="Title" required />);
    const input = el.querySelector('input')!;
    leave(input);
    expect(field(el).dataset.state).toBe('attention');
    expect(el.textContent).toContain('Needs you.');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    type(input, 'Q3 plan');
    expect(field(el).dataset.state).toBe('idle');
  });

  it('turns red only for content that is wrong, and says why', () => {
    const el = draw(<TextField label="Email" validate={(v) => (v.includes('@') ? null : { state: 'error', message: 'That isn’t an email address.' })} />);
    const input = el.querySelector('input')!;
    type(input, 'harry');
    leave(input);
    expect(field(el).dataset.state).toBe('error');
    const said = input.getAttribute('aria-describedby')!.split(' ').map((id) => document.getElementById(id)?.textContent);
    expect(said).toContain('That isn’t an email address.');
  });

  it('stays focusable and says why when it is disabled with a reason', () => {
    const input = draw(<TextField label="Owner" disabled reason="Only the library’s owner can change this." />).querySelector('input')!;
    expect(input.disabled).toBe(false);
    expect(input.readOnly).toBe(true);
    expect(input.getAttribute('aria-disabled')).toBe('true');
  });
});

describe('Toggle', () => {
  it('turns back and says why when the change fails', async () => {
    const onChange = vi.fn(() => Promise.reject(new Error('The server said no.')));
    const el = draw(<Toggle label="Notify me" onChange={onChange} />);
    const input = el.querySelector('input')!;
    await act(async () => input.click());
    expect(onChange).toHaveBeenCalledWith(true);
    expect(input.checked).toBe(false);
    expect(el.querySelector('[role="alert"]')?.textContent).toBe('The server said no.');
  });
});

describe('CheckboxGroup', () => {
  it('stops at max and says so', () => {
    const el = draw(
      <CheckboxGroup label="Pillars" max={1} defaultValue={['a']}>
        <Checkbox value="a">Artifacts</Checkbox>
        <Checkbox value="b">Mandate</Checkbox>
      </CheckboxGroup>,
    );
    const boxes = el.querySelectorAll('input');
    act(() => boxes[1].click());
    expect(boxes[1].checked).toBe(false);
    expect(el.textContent).toContain('That’s 1, the most you can choose.');
  });
});

describe('Select', () => {
  it('stays focusable and says why when it is disabled with a reason', () => {
    const el = draw(<Select label="Floor" options={['One', 'Two']} disabled reason="Floors come from your department." />);
    const button = el.querySelector('button')!;
    expect(button.disabled).toBe(false);
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(el.textContent).toContain('Floors come from your department.');
  });

  it('says why when there is nothing to pick', () => {
    const el = draw(<Select label="Collection" options={[]} empty="This library has no collections yet." />);
    expect(el.textContent).toContain('This library has no collections yet.');
  });
});

describe('Select keys', () => {
  const press = (el: HTMLElement, key: string) => act(() => void el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })));

  it.each([
    ['unavailable', { disabled: true, reason: 'Floors come from your department.' }],
    ['read-only', { readOnly: true }],
    ['busy', { busy: true }],
  ])('changes nothing from the keyboard while %s', (_name, props) => {
    const onChange = vi.fn();
    const el = draw(<Select label="Floor" options={['One', 'Two']} defaultValue="One" onChange={onChange} {...props} />);
    const trigger = el.querySelector('button')!;
    act(() => trigger.focus());
    press(trigger, 'ArrowRight');
    press(trigger, 't');
    expect(onChange).not.toHaveBeenCalled();
    expect(trigger.textContent).toContain('One');
  });

  it('still changes from the keyboard when it can be used', () => {
    const onChange = vi.fn();
    const el = draw(<Select label="Floor" options={['One', 'Two']} defaultValue="One" onChange={onChange} />);
    const trigger = el.querySelector('button')!;
    act(() => trigger.focus());
    press(trigger, 'ArrowRight');
    expect(onChange).toHaveBeenCalledWith('Two');
  });

  it('asks for nothing once a required Select has its first pick', () => {
    const el = draw(<Select label="Floor" options={['One', 'Two']} required />);
    const trigger = el.querySelector('button')!;
    act(() => trigger.focus());
    press(trigger, 'ArrowDown');
    const option = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find((o) => o.textContent?.includes('Two'))!;
    act(() => option.click());
    expect(document.querySelector('[role="listbox"]')).toBeNull();
    expect(trigger.textContent).toContain('Two');
    expect(field(el).dataset.state).toBe('idle');
    expect(el.textContent).not.toContain('Needs you.');
  });

  it('asks when a required Select is closed with nothing picked', () => {
    const el = draw(<Select label="Floor" options={['One', 'Two']} required />);
    const trigger = el.querySelector('button')!;
    act(() => trigger.focus());
    press(trigger, 'ArrowDown');
    press(document.querySelector<HTMLElement>('[role="listbox"]')!, 'Escape');
    expect(field(el).dataset.state).toBe('attention');
  });
});
