// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Shell } from './shell.js';
import { exampleShell } from './shell.fixture.js';
import type { ShellModel } from './shell-model.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
const draw = (model: ShellModel) => {
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(<Shell model={model}>app</Shell>));
  return document.body;
};
afterEach(() => {
  act(() => root?.unmount());
  vi.useRealTimers();
});
const news = () => document.querySelector('[data-news]')!.textContent;

describe('Shell landmarks and names', () => {
  it('mounts the open app in its one main landmark', () => {
    const body = draw(exampleShell());
    const mains = body.querySelectorAll('main');
    expect(mains.length).toBe(1);
    expect(mains[0]!.textContent).toBe('app');
    expect(mains[0]!.getAttribute('aria-label')).toBe('Documents');
    expect(body.querySelectorAll('header').length).toBe(1);
  });

  it('says where you are without an aria-label on a paragraph', () => {
    const where = draw(exampleShell()).querySelector('.aerie-where')!;
    expect(where.hasAttribute('aria-label')).toBe(false);
    expect(where.querySelector('.sr-only')!.textContent).toBe('You’re on Example Department, a department');
  });

  it('names every icon-only control and shows the name on hover and focus', () => {
    const body = draw(exampleShell('stream'));
    const iconOnly = [...body.querySelectorAll<HTMLButtonElement>('.aerie-nav, .aerie-handle, .aerie-fn, .aerie-stream, .aerie-x')];
    expect(iconOnly.length).toBeGreaterThan(5);
    for (const b of iconOnly) {
      expect(b.getAttribute('aria-label')).toBeTruthy();
      expect(b.classList.contains('augur-control')).toBe(true);
      expect(b.querySelector('.augur-name')?.textContent).toBeTruthy();
      expect(b.hasAttribute('title')).toBe(false);
    }
  });
});

describe('Shell news', () => {
  it('says a new thing that needs you once, never what was there at first', () => {
    const model = exampleShell();
    draw(model);
    expect(news()).toBe('');
    act(() => {
      model.notifications = [{ id: 'n3', app: 'docs', level: 'needs', title: 'Sign off the plan', time: model.now }, ...model.notifications];
    });
    expect(news()).toBe('Needs you: Sign off the plan, from Documents');
    act(() => {
      model.notifications = [{ id: 'n4', app: 'home', level: 'info', title: 'Quiet one', time: model.now }, ...model.notifications];
    });
    expect(news()).toBe('Needs you: Sign off the plan, from Documents');
  });

  it('waits for the stream to load before it starts listening', () => {
    const model = exampleShell();
    model.notifications = [];
    model.streamLoading = true;
    draw(model);
    act(() => {
      model.notifications = [{ id: 'a', app: 'docs', level: 'needs', title: 'Old', time: model.now }];
      model.streamLoading = false;
    });
    expect(news()).toBe('');
  });
});

describe('Shell floor keys', () => {
  const key = (init: KeyboardEventInit) => act(() => void window.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init })));

  it('moves floors with Alt and Page Up or Page Down, and leaves bare Page Up to the app', () => {
    const model = exampleShell();
    const floor = vi.fn();
    model.addEventListener('ui-floor', (e) => floor((e as CustomEvent).detail));
    draw(model);
    key({ key: 'PageUp' });
    key({ key: 'PageDown' });
    expect(floor).not.toHaveBeenCalled();
    key({ key: 'PageUp', altKey: true });
    expect(floor).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'org' }));
    key({ key: 'PageDown', altKey: true });
    expect(floor).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'me' }));
  });
});
