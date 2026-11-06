// @vitest-environment happy-dom
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
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
    const iconOnly = [...body.querySelectorAll<HTMLButtonElement>('.aerie-handle, .aerie-fn, .aerie-stream, .aerie-x')];
    expect(iconOnly.length).toBeGreaterThan(5);
    for (const b of iconOnly) {
      expect(b.getAttribute('aria-label')).toBeTruthy();
      expect(b.classList.contains('augur-control')).toBe(true);
      expect(b.querySelector('.augur-name')?.textContent).toBeTruthy();
      expect(b.hasAttribute('title')).toBe(false);
    }
  });
});

describe('Shell unavailable functions', () => {
  it('keeps an unavailable function on the arc, says why, and does not run it when pressed', () => {
    const model = exampleShell('stream');
    const reason = 'Agents are turned off here. An organisation admin can turn them on.';
    model.functions = model.functions.map((f) => (f.id === 'agents' ? { ...f, unavailable: reason } : f));
    const heard = vi.fn();
    model.addEventListener('ui-function', heard);
    const body = draw(model);
    const fn = [...body.querySelectorAll<HTMLButtonElement>('.aerie-fn')].find((b) => b.getAttribute('aria-label')?.startsWith('Agents'))!;
    expect(fn).toBeTruthy();
    expect(fn.disabled).toBe(false);
    expect(fn.getAttribute('aria-disabled')).toBe('true');
    expect(fn.getAttribute('aria-label')).toBe(`Agents. ${reason}`);
    expect(fn.querySelector('.augur-name')!.textContent).toBe(`Agents: ${reason}`);
    act(() => fn.click());
    expect(model.view).toBe('stream');
    expect(heard).not.toHaveBeenCalled();
  });

  it('leaves a function that can be used as it was', () => {
    const body = draw(exampleShell('stream'));
    const fn = [...body.querySelectorAll<HTMLButtonElement>('.aerie-fn')].find((b) => b.getAttribute('aria-label') === 'Settings')!;
    expect(fn.hasAttribute('aria-disabled')).toBe(false);
    expect(fn.querySelector('.augur-name')!.textContent).toBe('Settings');
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

describe('Shell floor gauge', () => {
  it('keeps a lane of its own, so the open app ends where the gauge starts', () => {
    const model = exampleShell();
    draw(model);
    const shell = document.querySelector('.aerie-shell')!;
    expect(shell.hasAttribute('data-gauge')).toBe(true);
    expect(document.querySelector('.aerie-gauge')).not.toBeNull();
    const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'shell.css'), 'utf8');
    expect(css).toMatch(/\.aerie-shell\[data-gauge\] \.aerie-stage \{ right: var\(--gauge-lane\); \}/);
    // An app's drawer no longer moves the gauge: the drawer is inside the stage, left of the lane.
    expect(css).not.toContain('--app-drawer-inset');
  });

  it('gives the app the whole width when there are no floors to show', () => {
    const model = exampleShell();
    model.floors = [];
    draw(model);
    expect(document.querySelector('.aerie-shell')!.hasAttribute('data-gauge')).toBe(false);
    expect(document.querySelector('.aerie-gauge')).toBeNull();
  });
});

describe('quiet notifications', () => {
  it('lands a quiet one in the stream without a pulse, and leaves it out of the count', () => {
    const model = exampleShell();
    const before = model.heard.length;
    model.notify({ id: 'q1', app: 'docs', level: 'needs', title: 'A comment', time: Date.now(), quiet: true });
    expect(model.notifications.some((n) => n.id === 'q1')).toBe(true);
    expect(model.heard.length).toBe(before);
    model.notify({ id: 'l1', app: 'docs', level: 'needs', title: 'An approval', time: Date.now() });
    expect(model.heard.length).toBe(before + 1);
  });
});

describe('Shell app bar and background', () => {
  it('docks the app bar as the rail with the open app’s pages, lit down to what needs you', () => {
    const body = draw(exampleShell());
    expect(body.querySelector('.aerie-shell')!.getAttribute('data-bar')).toBe('app');
    const bar = body.querySelector('.aerie-bar')!;
    expect(bar.getAttribute('data-mode')).toBe('app');
    expect(bar.getAttribute('aria-label')).toBe('App bar: Documents');
    expect(body.querySelector('.aerie-band .aerie-nav')).toBeNull();
    const shared = [...bar.querySelectorAll<HTMLElement>('.aerie-bar-tile')].find((t) => t.textContent?.includes('Shared'));
    expect(shared).toBeTruthy();
  });

  it('goes home, pages and closes apps through the model', () => {
    const model = exampleShell();
    const heard: string[] = [];
    for (const e of ['ui-home', 'ui-page', 'ui-close-app']) model.addEventListener(e, () => heard.push(e));
    draw(model);
    act(() => model.openPage('recent'));
    expect(model.page).toBe('recent');
    act(() => model.goHome());
    expect(model.current).toBe('');
    expect(model.running).toEqual(['docs']);
    expect(document.querySelector('.aerie-shell')!.getAttribute('data-bar')).toBe('desk');
    act(() => model.closeApp('docs'));
    expect(model.running).toEqual([]);
    expect(heard).toEqual(['ui-page', 'ui-home', 'ui-close-app']);
  });

  it('opening an app adds it to the open ones', () => {
    const model = exampleShell(undefined, '');
    model.running = [];
    model.openApp('mandate');
    expect(model.running).toEqual(['mandate']);
    expect(model.current).toBe('mandate');
  });

  it('lights what needs you, newest first, leaving muted apps dark', () => {
    const model = exampleShell();
    expect(model.needs).toEqual([{ app: 'docs', page: 'shared' }]);
    model.muted = ['docs'];
    expect(model.needs).toEqual([]);
  });

  it('draws the chosen background on the desktop and steps it away for an app', () => {
    const model = exampleShell(undefined, '');
    const body = draw(model);
    const horizon = body.querySelector('.aerie-horizon')!;
    expect(horizon.hasAttribute('data-away')).toBe(false);
    expect(horizon.getAttribute('data-floor')).toBe('department');
    act(() => model.openApp('docs'));
    expect(body.querySelector('.aerie-horizon')!.hasAttribute('data-away')).toBe(true);
    expect(body.querySelector('.aerie-ground .aerie-flat')).not.toBeNull();
  });
});
