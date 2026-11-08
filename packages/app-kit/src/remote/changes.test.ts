// @vitest-environment happy-dom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { RemoteMutationObserver, createRemoteElement } from '@remote-dom/core/elements';
import { QuillRemote, createQuillReceiver } from './receiver.js';
import { renderers } from './renderers.js';
import { defineQuillElements } from './elements.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
let observer: RemoteMutationObserver | undefined;
beforeAll(() => {
  defineQuillElements();
  if (!customElements.get('evil-frame')) customElements.define('evil-frame', createRemoteElement({ properties: { src: {} } }));
});
afterEach(() => {
  act(() => root?.unmount());
  observer?.disconnect();
  vi.restoreAllMocks();
});

/**
 * A sandbox whose later changes reach the host too: the tree under `sandbox` is watched as the SDK's
 * runtime watches its roots, so inserts, removals and text changes after the first drawing are sent.
 */
async function watched() {
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  const receiver = createQuillReceiver();
  const sandbox = document.createElement('div');
  const drops: string[] = [];
  const host = document.createElement('div');
  document.body.replaceChildren(host);
  root = createRoot(host);
  act(() => root!.render(createElement(QuillRemote, { receiver, onDrop: (reason) => drops.push(reason) })));
  observer = new RemoteMutationObserver(receiver.connection as never);
  observer.observe(sandbox);
  const change = async (fn: () => void) => {
    await act(async () => {
      fn();
      await Promise.resolve();
    });
  };
  return { sandbox, host, drops, change, receiver };
}

describe('what the sandbox changes after the first drawing', () => {
  // As remote-dom's records name them: happy-dom's MutationObserver gives the wrong positions for
  // several nodes added at once, and the worker's runtime sends these records itself.
  it('draws inserts, removals and text changes by position, also after a dropped sibling', async () => {
    const { host, drops, receiver } = await watched();
    const el = (id: string, element: string, properties: Record<string, unknown> = {}, children: unknown[] = []) => ({ id, type: 1, element, properties, attributes: {}, eventListeners: {}, children });
    const text = (id: string, data: string) => ({ id, type: 3, data });
    const send = (records: unknown[]) => act(() => receiver.connection.mutate(records));
    send([
      [0, '~', el('e', 'evil-frame'), 0],
      [0, '~', el('a', 'quill-notice', { heading: 'First' }), 1],
      [0, '~', el('b', 'quill-notice', { heading: 'Second' }, [text('t', 'as it was')]), 2],
    ]);
    expect(host.textContent).toBe('NoteFirst NoteSecond as it was');
    send([[2, 't', 'as it is now']]);
    expect(host.textContent).toBe('NoteFirst NoteSecond as it is now');
    send([[1, '~', 1]]);
    expect(host.textContent).toBe('NoteSecond as it is now');
    send([[0, '~', el('c', 'quill-notice', { heading: 'Third' }), 2]]);
    expect(host.textContent).toBe('NoteSecond as it is nowNoteThird ');
    send([[3, 'c', 'heading', 'Third, renamed']]);
    expect(host.textContent).toContain('Third, renamed');
    expect(drops).toEqual(['<evil-frame> isn’t in Quill’s remote vocabulary; it was dropped with what’s inside it.']);
  });

  it('keeps only text inside an element that takes text, and ignores white space between elements', async () => {
    const { sandbox, host, drops, change } = await watched();
    const notice = document.createElement('quill-notice');
    const inside = document.createElement('quill-tag');
    inside.label = 'Smuggled';
    notice.append('Plain words ', inside);
    const tiles = document.createElement('quill-tiles');
    tiles.label = 'Places';
    const more = document.createElement('quill-more');
    more.append('\n  ');
    await change(() => sandbox.append(notice, tiles, more));
    expect(host.textContent).toContain('Plain words');
    expect(host.textContent).not.toContain('Smuggled');
    expect(drops).toEqual(['<quill-notice> takes only text inside it; <quill-tag> was dropped.']);
  });

  it('gives a field back to the app: a value it sets after the person typed reaches the host', async () => {
    const { sandbox, host, change } = await watched();
    const field = document.createElement('quill-text-field');
    field.label = 'Title';
    const typed: string[] = [];
    field.addEventListener('change', (e) => typed.push((e as CustomEvent<string>).detail));
    await change(() => sandbox.append(field));
    const input = host.querySelector('input')!;
    await act(async () => {
      const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setValue.call(input, 'Rota');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await Promise.resolve();
    });
    expect(typed).toEqual(['Rota']);
    expect(field.value).toBe('Rota');
    // Saved: the app clears the field, which is a change because the element held what was typed.
    await change(() => {
      field.value = '';
    });
    expect(host.querySelector('input')!.value).toBe('');
  });
});

describe('values inside lists and objects (spec 6.7)', () => {
  it('keeps only the fields the vocabulary names, of the shape it names, and drops the rest with a reason', async () => {
    const { sandbox, host, drops, change } = await watched();
    const list = document.createElement('quill-list');
    list.label = 'Notes';
    list.items = [
      { id: 'n1', title: 'Kept', meta: 'today' },
      { id: 'n2', title: { toString: 'markup' } as never },
      { id: 'n3', title: 'Also kept', more: { $$typeof: 'react.element' } as never, icon: 'constructor' },
    ];
    const about = document.createElement('quill-about');
    about.what = 'A note';
    about.owner = { name: 'Ada', picture: 'https://example.org/?leak=1' } as never;
    const field = document.createElement('quill-text-field');
    field.label = 'Upload';
    field.type = 'file' as never;
    const button = document.createElement('quill-button');
    button.label = 'Go';
    button.icon = 'constructor';
    (button as unknown as { updateRemoteProperty(n: string, v: unknown): void }).updateRemoteProperty('constructor', null);
    await change(() => sandbox.append(list, about, field, button));
    expect(host.textContent).toContain('Kept');
    expect(host.textContent).toContain('Also kept');
    expect(host.querySelectorAll('[role="row"]')).toHaveLength(2);
    expect(host.querySelector('img')).toBeNull();
    expect(host.querySelector('input[type="file"]')).toBeNull();
    expect(host.textContent).toContain('Go');
    expect(drops).toEqual(
      expect.arrayContaining([
        '<quill-list>’s “items”[1].title takes a string; the object sent was dropped.',
        '<quill-list>’s “items”[1] needs title; it was dropped.',
        '<quill-list>’s “items”[2] has no field “more”; it was dropped.',
        '<quill-list>’s “items”[2].icon takes the name of an icon in the kit; “constructor” isn’t one, so it was dropped.',
        '<quill-about>’s “owner” has no field “picture”; it was dropped.',
        '<quill-text-field>’s “type” takes one of text, email, url, tel, password, search; “file” was dropped.',
        '<quill-button>’s “icon” takes the name of an icon in the kit; “constructor” isn’t one, so it was dropped.',
        '<quill-button> has no property “constructor”; it was dropped.',
      ]),
    );
  });

  it('keeps a table’s cells to plain values', async () => {
    const { sandbox, host, drops, change } = await watched();
    const table = document.createElement('quill-table');
    table.columns = [{ key: 'name', label: 'Name' }];
    table.rows = [{ id: 'r1', name: 'Plain' }, { id: 'r2', name: { $$typeof: 'x' } as never }, { name: 'No id' } as never];
    await change(() => sandbox.append(table));
    expect(host.textContent).toContain('Plain');
    expect(drops).toContain('<quill-table>’s “rows”[1].name takes a string, number, boolean or null; the object sent was dropped.');
    expect(drops).toContain('<quill-table>’s “rows”[2] needs id; it was dropped.');
  });

  it('stops only a part that fails to draw, and says so', async () => {
    const { sandbox, host, drops, change } = await watched();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(renderers, 'quill-state').mockImplementation(() => {
      throw new Error('broken part');
    });
    const broken = document.createElement('quill-state');
    broken.heading = 'Never drawn';
    const fine = document.createElement('quill-notice');
    fine.heading = 'Still drawn';
    await change(() => sandbox.append(broken, fine));
    expect(host.textContent).toContain('Still drawn');
    expect(drops).toEqual(['<quill-state> failed to draw (broken part); it was dropped.']);
  });
});
