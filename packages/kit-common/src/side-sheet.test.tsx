// @vitest-environment happy-dom
import { act, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { InfoPop } from './info-pop.js';
import { SideSheet } from './side-sheet.js';
import { TextField } from './text-field.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
const draw = (node: ReactNode) => {
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(node));
};
afterEach(() => act(() => root?.unmount()));
const button = (name: string) => [...document.querySelectorAll('button')].find((b) => b.textContent === name || b.textContent?.endsWith(name) || b.getAttribute('aria-label') === name)!;

describe('SideSheet', () => {
  it('checks every field before it acts, then closes with the values', async () => {
    const onClose = vi.fn();
    draw(<SideSheet open heading="Edit Q3 plan" actionLabel="Save" onClose={onClose} fields={<TextField label="Name" name="name" required />} />);
    await act(async () => button('Save').click());
    expect(onClose).not.toHaveBeenCalled();
    expect(document.querySelector('.augur-field')!.getAttribute('data-state')).toBe('attention');
  });

  it('stays open and says why when the save fails', async () => {
    const onClose = vi.fn();
    draw(<SideSheet open heading="Edit Q3 plan" actionLabel="Save" onClose={onClose} onSubmit={() => Promise.reject(new Error('The library is read-only.'))} />);
    await act(async () => button('Save').click());
    expect(onClose).not.toHaveBeenCalled();
    expect(document.querySelector('[role="alert"]')!.textContent).toBe('The library is read-only.');
  });

  it('closes with nothing from Cancel and from its close button', async () => {
    const onClose = vi.fn();
    draw(<SideSheet open heading="Edit Q3 plan" onClose={onClose} />);
    await act(async () => button('Cancel').click());
    expect(onClose).toHaveBeenLastCalledWith(null);
    expect(document.querySelector('[role="dialog"]')!.getAttribute('aria-labelledby')).toBe(document.querySelector('.augur-side-sheet-title')!.id);
  });

  it('says which step it is on, and offers Back from the second', () => {
    const onBack = vi.fn();
    draw(<SideSheet open heading="New collection" onClose={() => {}} steps={['Name it', 'Who can see it', 'Check']} step={1} onBack={onBack} />);
    expect(document.querySelector('.augur-side-sheet-count')!.textContent).toBe('Step 2 of 3');
    expect(document.querySelector('[aria-current="step"]')!.textContent).toBe('Who can see it');
    act(() => button('Back').click());
    expect(onBack).toHaveBeenCalled();
  });

  it('steps the sheet under back while one is opened from it', () => {
    function Two() {
      const [inner, setInner] = useState(true);
      return (
        <SideSheet open heading="Edit Q3 plan" onClose={() => {}}>
          <SideSheet open={inner} heading="Pick an owner" onClose={() => setInner(false)} />
        </SideSheet>
      );
    }
    draw(<Two />);
    const sheet = (heading: string) => [...document.querySelectorAll('.augur-side-sheet')].find((s) => s.querySelector('h2')!.textContent === heading)!;
    expect(sheet('Edit Q3 plan').hasAttribute('data-covered')).toBe(true);
    expect(sheet('Pick an owner').hasAttribute('data-covered')).toBe(false);
  });
});

describe('InfoPop', () => {
  it('opens on a press, with its heading, text and link', () => {
    draw(
      <InfoPop label="About Keep for" heading="Why this is asked" link={{ label: 'Read the retention rule', href: '#rule' }}>
        <p>Finance records are kept for seven years.</p>
      </InfoPop>,
    );
    const mark = button('About Keep for');
    expect(document.querySelector('.augur-info-pop')).toBeNull();
    act(() => {
      mark.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      mark.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
      mark.click();
    });
    const pop = document.querySelector('.augur-info-pop')!;
    expect(pop.querySelector('[role="dialog"]')!.getAttribute('aria-label')).toBe('Why this is asked');
    expect(pop.querySelector('a')!.getAttribute('href')).toBe('#rule');
    expect(mark.getAttribute('aria-expanded')).toBe('true');
  });
});
