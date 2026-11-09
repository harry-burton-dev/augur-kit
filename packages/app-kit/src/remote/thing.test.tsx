// @vitest-environment happy-dom
// Things an app marks for the shell's radial menu (the app contract, 6.4): a list item, a table's rows,
// a kind tile. The receiver draws the mark as data-thing, data-thing-id and data-thing-label on the
// element it renders, which is what Aerie's FrameRadial opens on.
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { RemoteRootElement } from '@remote-dom/core/elements';
import { QuillRemote, createQuillReceiver } from './receiver.js';
import { defineQuillElements } from './elements.js';
import { thingProps } from '../thing.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

beforeAll(() => {
  defineQuillElements();
  if (!customElements.get('remote-root')) customElements.define('remote-root', RemoteRootElement);
});
let root: Root | undefined;
afterEach(() => act(() => root?.unmount()));

function drawRemote(make: () => HTMLElement) {
  const receiver = createQuillReceiver();
  const sandbox = document.createElement('remote-root') as RemoteRootElement;
  sandbox.append(make());
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(<QuillRemote receiver={receiver} />));
  act(() => sandbox.connect(receiver.connection as never));
}
const marks = () => [...document.querySelectorAll<HTMLElement>('[data-thing]')].map((el) => [el.dataset.thing, el.dataset.thingId, el.dataset.thingLabel]);

describe('thingProps', () => {
  it('marks a thing by kind, id and label, falling back to what it is called', () => {
    expect(thingProps({ kind: 'note' }, { id: 'n1', label: 'Shopping' })).toEqual({ 'data-thing': 'note', 'data-thing-id': 'n1', 'data-thing-label': 'Shopping' });
    expect(thingProps({ kind: 'note', id: 'x', label: 'Own' }, { id: 'n1', label: 'Shopping' })).toEqual({ 'data-thing': 'note', 'data-thing-id': 'x', 'data-thing-label': 'Own' });
    expect(thingProps(undefined, { id: 'n1', label: 'S' })).toEqual({});
  });
  it('refuses a kind that isn’t a short word, as the manifest names kinds', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(thingProps({ kind: 'Note Thing' }, { id: 'n1', label: 'S' })).toEqual({});
    expect(thingProps({ kind: 'x'.repeat(41) }, { id: 'n1', label: 'S' })).toEqual({});
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('things sent from the sandbox', () => {
  it('a list item carries its mark on its row', () => {
    drawRemote(() => {
      const list = document.createElement('quill-list');
      list.label = 'Notes';
      list.items = [
        { id: 'n1', title: 'Shopping', thing: { kind: 'note' } },
        { id: 'n2', title: 'Plain' },
      ];
      return list;
    });
    expect(marks()).toEqual([['note', 'n1', 'Shopping']]);
    expect(document.querySelector('[data-thing]')!.classList.contains('quill-list-row')).toBe(true);
  });

  it('a table marks every row as one kind, its label from a column', () => {
    drawRemote(() => {
      const table = document.createElement('quill-table');
      table.label = 'Notes';
      table.columns = [{ key: 'title', label: 'Title' }];
      table.rows = [
        { id: 'n1', title: 'Shopping' },
        { id: 'n2', title: 'Rota' },
      ];
      table.thing = { kind: 'note', label: 'title' };
      return table;
    });
    expect(marks()).toEqual([
      ['note', 'n1', 'Shopping'],
      ['note', 'n2', 'Rota'],
    ]);
  });

  it('a table takes its label only from one of its own columns', () => {
    drawRemote(() => {
      const table = document.createElement('quill-table');
      table.label = 'Notes';
      table.columns = [{ key: 'title', label: 'Title' }];
      table.rows = [{ id: 'n1', title: 'Shopping', secret: 'x' }];
      table.thing = { kind: 'note', label: 'constructor' };
      return table;
    });
    expect(marks()).toEqual([['note', 'n1', undefined]]);
  });

  it('drops a bad kind, an unknown field or a value of the wrong type the sandbox sends, and keeps hostile text as text', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    drawRemote(() => {
      const list = document.createElement('quill-list');
      list.label = 'Notes';
      list.items = [
        { id: 'a', title: 'Bad kind', thing: { kind: 'Not A Kind' } },
        { id: 'b', title: 'Extra', thing: { kind: 'note', onclick: 'alert(1)' } },
        { id: 'c', title: 'Wrong type', thing: { kind: 7 } },
        { id: 'd', title: 'Hostile', thing: { kind: 'note', id: '"><img src=x onerror=alert(1)>', label: '<b>x</b>' } },
      ];
      return list;
    });
    const all = marks();
    expect(all.find(([, id]) => id === 'a')).toBeUndefined();
    expect(all.find(([, id]) => id === 'c')).toBeUndefined();
    expect(document.querySelector('img')).toBeNull();
    const hostile = document.querySelector<HTMLElement>('[data-thing-label="<b>x</b>"]');
    expect(hostile?.dataset.thingId).toBe('"><img src=x onerror=alert(1)>');
    for (const el of document.querySelectorAll('[data-thing]')) expect(el.hasAttribute('onclick')).toBe(false);
    warn.mockRestore();
    error.mockRestore();
  });

  it('a kind tile carries its mark on its button', () => {
    drawRemote(() => {
      const tile = document.createElement('quill-kind-tile');
      tile.kind = 'folder';
      tile.name = 'Plans';
      tile.eyebrow = 'Folder';
      tile.thing = { kind: 'notebook', id: 'b1' };
      return tile;
    });
    expect(marks()).toEqual([['notebook', 'b1', 'Plans']]);
    expect(document.querySelector('[data-thing]')!.tagName).toBe('BUTTON');
  });
});
