// @vitest-environment happy-dom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ComboBox } from './combo-box.js';
import { MultiSelect } from './multi-select.js';
import { NumberField } from './number-field.js';
import { Slider } from './slider.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
const draw = (node: ReactNode) => {
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(node));
  return document.body.firstElementChild as HTMLElement;
};
afterEach(() => act(() => root?.unmount()));
const type = (input: HTMLInputElement, text: string) =>
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, text);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
const field = (el: HTMLElement) => el.querySelector<HTMLElement>('.augur-field')!;

describe('ComboBox', () => {
  it('shows the chosen option’s label in the well', () => {
    const input = draw(<ComboBox label="Department" options={['Finance', 'Fleet']} defaultValue="Fleet" />).querySelector('input')!;
    expect(input.value).toBe('Fleet');
  });

  it('opens a sheet of only what matches, with the letters typed in ink and a count', () => {
    const el = draw(<ComboBox label="Department" heading="Departments" options={['Finance', 'Floor 2', 'Floor 4', 'Legal']} />);
    const input = el.querySelector('input')!;
    act(() => input.focus());
    type(input, 'flo');
    const sheet = document.querySelector('.augur-sheet-list')!;
    expect([...sheet.querySelectorAll('.augur-option-label')].map((o) => o.textContent)).toEqual(['Floor 2', 'Floor 4']);
    expect(sheet.querySelector('.augur-match')!.textContent).toBe('Flo');
    expect(sheet.querySelector('.augur-sheet-foot')!.textContent).toBe('2 of 4');
    expect(sheet.querySelector('.augur-sheet-heading')!.textContent).toBe('Departments');
  });

  it('stays focusable and says why when it is disabled with a reason', () => {
    const input = draw(<ComboBox label="Department" options={['Legal']} disabled reason="Departments come from your directory." />).querySelector('input')!;
    expect(input.disabled).toBe(false);
    expect(input.getAttribute('aria-disabled')).toBe('true');
  });
});

describe('MultiSelect', () => {
  it('says what was chosen in words, with the count in a key', () => {
    const el = draw(<MultiSelect label="Floors" options={['Ground', 'Floor 1', 'Floor 2']} defaultValue={['Floor 2', 'Ground']} />);
    expect(el.querySelector('.augur-select-value')!.textContent).toBe('Ground, Floor 2');
    expect(el.querySelector('.augur-count-key')!.textContent).toBe('2');
  });

  it('shows the placeholder and no count while nothing is chosen', () => {
    const el = draw(<MultiSelect label="Floors" options={['Ground']} placeholder="Any floor" />);
    expect(el.querySelector('.augur-select-value')!.textContent).toBe('Any floor');
    expect(el.querySelector('.augur-count-key')).toBeNull();
  });

  it('asks in green when set to', () => {
    const el = draw(<MultiSelect label="Floors" options={['Ground']} required state="attention" message="Needs you." />);
    expect(field(el).dataset.state).toBe('attention');
  });
});

describe('NumberField', () => {
  it('steps up and down with its keys, and stops at the ceiling', () => {
    const changed = vi.fn();
    const el = draw(<NumberField label="Seats" defaultValue={49} min={1} max={50} onChange={changed} unit="people" />);
    const [less, more] = [...el.querySelectorAll<HTMLButtonElement>('.augur-end-key')];
    act(() => {
      more!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      more!.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
      more!.click();
    });
    expect(changed).toHaveBeenLastCalledWith(50);
    expect(more!.disabled).toBe(true);
    expect(less!.disabled).toBe(false);
    expect(el.querySelector('.augur-unit')!.textContent).toBe('people');
  });

  it('turns red with its check’s line', () => {
    const el = draw(<NumberField label="Limit" defaultValue={250} state="error" message="This floor has 200 GB left." />);
    expect(field(el).dataset.state).toBe('error');
    expect(el.textContent).toContain('This floor has 200 GB left.');
  });
});

describe('Slider', () => {
  it('writes its value beside the label in the words it is given', () => {
    const el = draw(<Slider label="Show" defaultValue={60} format={(v) => `${v}%`} />);
    expect(el.querySelector('.augur-slider-value')!.textContent).toBe('60%');
  });

  it('as steps, raises one key for each step up to the value', () => {
    const el = draw(<Slider label="Detail" steps defaultValue={3} min={0} max={5} />);
    expect(el.querySelectorAll('.augur-slider-step')).toHaveLength(5);
    expect(el.querySelectorAll('.augur-slider-step[data-on]')).toHaveLength(3);
  });

  it('stays focusable and doesn’t move when it is disabled with a reason', () => {
    const changed = vi.fn();
    const el = draw(<Slider label="Show" defaultValue={60} disabled reason="Set for the whole floor." onChange={changed} />);
    const thumb = el.querySelector<HTMLInputElement>('input[type=range]')!;
    expect(thumb.disabled).toBe(false);
    act(() => {
      thumb.focus();
      thumb.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    });
    expect(changed).not.toHaveBeenCalled();
    expect(el.querySelector('.augur-slider-value')!.textContent).toBe('60');
  });
});
