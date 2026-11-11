// @vitest-environment happy-dom
// One logo button goes to the desktop: first on the desktop bar, last on the rail. With an app drawn on
// the desktop (Home), opening it keeps the bar across the screen and the background, and it isn't a tile.
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { ShellBar } from './shell-bar.js';
import { Shell } from './shell.js';
import { exampleShell, withHome } from './shell.fixture.js';
import type { ShellModel } from './shell-model.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
const draw = (node: React.ReactNode) => {
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(node));
  return document.body;
};
afterEach(() => act(() => root?.unmount()));
const tiles = (body: HTMLElement) => [...body.querySelectorAll<HTMLElement>('.aerie-bar-tile:not(.aerie-bar-logo)')].map((t) => t.textContent);
const bar = (model: ShellModel) => draw(<ShellBar model={model} />);

describe('the logo button', () => {
  it('starts the desktop bar and goes Home', () => {
    const model = exampleShell(undefined, '');
    const body = bar(model);
    const logo = body.querySelector<HTMLButtonElement>('.aerie-bar-logo')!;
    expect(body.querySelector('.aerie-bar-tiles')!.firstElementChild).toBe(logo);
    expect(logo.getAttribute('aria-current')).toBe('page');
    let home = 0;
    model.addEventListener('ui-home', () => home++);
    act(() => logo.click());
    expect(home).toBe(1);
  });

  it('ends the rail, with no Home and Apps pair left', () => {
    const body = bar(exampleShell());
    const all = [...body.querySelectorAll('.aerie-bar-tiles > *')];
    expect(all.at(-1)!.classList.contains('aerie-bar-logo')).toBe(true);
    expect(body.querySelector('.aerie-bar-pair')).toBeNull();
    expect(body.querySelector('.aerie-bar-logo')!.getAttribute('aria-current')).toBeNull();
  });

  it('draws the deployment’s mark when it has one, the placeholder when not', () => {
    const model = exampleShell(undefined, '');
    expect(bar(model).querySelector('.aerie-bar-logo svg')).not.toBeNull();
    act(() => root?.unmount());
    model.logo = '/brand/mark.svg';
    const img = bar(model).querySelector<HTMLImageElement>('.aerie-bar-logo img')!;
    expect(img.getAttribute('src')).toBe('/brand/mark.svg');
    expect(img.alt).toBe('');
  });
});

describe('Home as the desktop', () => {
  it('keeps the bar across the screen while Home is open, and Home isn’t a tile', () => {
    const model = withHome(exampleShell(undefined, 'home'));
    const body = bar(model);
    expect(body.querySelector('.aerie-bar')!.getAttribute('data-mode')).toBe('desk');
    expect(tiles(body)).not.toContain('Home');
    expect(body.querySelector('.aerie-bar-logo')!.getAttribute('aria-current')).toBe('page');
  });

  it('rests the bar at an edge, like a taskbar, while the desktop holds Home', () => {
    const model = withHome(exampleShell(undefined, 'home'));
    model.settings = { ...model.settings, barStop: 1 };
    expect(bar(model).querySelector('.aerie-bar')!.getAttribute('data-stop')).toBe('0');
    act(() => root?.unmount());
    model.settings = { ...model.settings, barStop: 2 };
    expect(bar(model).querySelector('.aerie-bar')!.getAttribute('data-stop')).toBe('3');
  });

  it('keeps the background and clears the bar in the shell', () => {
    const model = withHome(exampleShell(undefined, 'home'));
    model.settings = { ...model.settings, barStop: 3 };
    const body = draw(<Shell model={model} />);
    const shell = body.querySelector('.aerie-shell')!;
    expect(shell.getAttribute('data-bar')).toBe('desk');
    expect(shell.getAttribute('data-desktop')).toBe('3');
    expect(body.querySelector('[data-away]')).toBeNull();
  });

  it('docks as the rail for any other app', () => {
    const body = bar(withHome(exampleShell()));
    expect(body.querySelector('.aerie-bar')!.getAttribute('data-mode')).toBe('app');
  });
});
