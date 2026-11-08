// @vitest-environment happy-dom
// The rail in the shell's own bar draws the open app's places from the model, with what the app put
// under them (the app contract, 6.3), while pages that don't fill look as they always have.
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { ShellBar } from './shell-bar.js';
import { exampleShell } from './shell.fixture.js';
import type { ShellModel } from './shell-model.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
const draw = (model: ShellModel) => {
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(<ShellBar model={model} />));
  return document.body;
};
afterEach(() => act(() => root?.unmount()));
const pageTiles = (body: HTMLElement) => [...body.querySelectorAll<HTMLElement>('.aerie-bar-pages .aerie-bar-tile')].map((t) => t.textContent);

/** The example shell with Documents' Library filling, and sixty things under it. */
const filling = () => {
  const model = exampleShell();
  const docs = model.apps.find((a) => a.id === 'docs')!;
  docs.pages = [{ id: 'library', name: 'Library', icon: 'library', path: '/', fills: true }, ...docs.pages!.slice(1)];
  model.under = { docs: { library: Array.from({ length: 60 }, (_, i) => ({ label: `Shelf ${i + 1}`, path: `/shelves/${i + 1}` })) } };
  return model;
};

describe('the rail’s places from the model', () => {
  it('draws pages that don’t fill as they always have', () => {
    const body = draw(exampleShell());
    expect(pageTiles(body)).toEqual(['Library', 'Recent', 'Shared']);
    expect(body.querySelector('.aerie-rail-under')).toBeNull();
    // What needs you still lights its page.
    expect(body.querySelector('.aerie-bar-pages .aerie-bar-lit')!.textContent).toBe('Shared');
  });

  it('draws what the app put under a place, capped at the model’s number', () => {
    const model = filling();
    model.underCap = 5;
    const body = draw(model);
    expect(pageTiles(body)).toEqual(['Library', 'Shelf 1', 'Shelf 2', 'Shelf 3', 'Shelf 4', 'Shelf 5', 'and 55 more', 'Recent', 'Shared']);
    expect(body.querySelector('.aerie-bar-pages .aerie-bar-lit')!.textContent).toBe('Shared');
    expect(body.querySelector('.aerie-bar-pages [aria-current="page"]')!.textContent).toBe('Library');
  });

  it('caps at 50 unless the deployment says', () => {
    expect(draw(filling()).querySelectorAll('.aerie-rail-under').length).toBe(50);
  });

  it('opens a thing by its path, through the model, and marks it', () => {
    const model = filling();
    const heard: unknown[] = [];
    model.addEventListener('ui-path', (e) => heard.push((e as CustomEvent).detail));
    const body = draw(model);
    const shelf = [...body.querySelectorAll<HTMLButtonElement>('.aerie-rail-under')][1]!;
    act(() => shelf.click());
    expect(heard).toEqual([{ app: 'docs', page: 'library', path: '/shelves/2' }]);
    expect(model.page).toBe('library');
    expect(model.path).toBe('/shelves/2');
    expect(body.querySelector('.aerie-rail-under[aria-current="page"]')!.textContent).toBe('Shelf 2');
    act(() => body.querySelector<HTMLButtonElement>('.aerie-rail-more')!.click());
    expect(heard.at(-1)).toEqual({ app: 'docs', page: 'library', path: '/' });
  });

  it('a page chosen in the rail is still a page, and clears the path', () => {
    const model = filling();
    const heard: string[] = [];
    model.addEventListener('ui-page', (e) => heard.push((e as CustomEvent).detail.id));
    model.path = '/shelves/2';
    const body = draw(model);
    act(() => [...body.querySelectorAll<HTMLButtonElement>('.aerie-bar-pages .aerie-bar-tile')].find((t) => t.textContent === 'Recent')!.click());
    expect(heard).toEqual(['recent']);
    expect(model.path).toBe('');
  });

  it('keeps one app’s things off another app’s places, and drops the path on switching app', () => {
    const model = filling();
    model.path = '/shelves/2';
    model.openApp('mandate');
    expect(model.path).toBe('');
    model.openApp('docs');
    expect(draw(model).querySelectorAll('.aerie-rail-under').length).toBe(50);
  });
});
