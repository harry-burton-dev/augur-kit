// @vitest-environment happy-dom
// The parts a documents app needs, described in the sandbox and drawn by the host: a reader whose
// pictures only the host fetches, a file button whose files the host takes, a people picker that asks
// the app, a thing's chain up the floors, and the bar over a long list.
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { RemoteRootElement } from '@remote-dom/core/elements';
import { QuillRemote, createQuillReceiver, type QuillRemoteHost } from './receiver.js';
import { defineQuillElements } from './elements.js';
import { readerPicturePath } from './vocabulary.js';
import type { RemoteChosenFile, RemoteMarked, RemotePrincipal } from './types.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
beforeAll(() => {
  defineQuillElements();
  if (!customElements.get('remote-root')) customElements.define('remote-root', RemoteRootElement);
});
afterEach(() => {
  act(() => root?.unmount());
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const describeScreen = (build: (el: <K extends keyof HTMLElementTagNameMap>(name: K) => HTMLElementTagNameMap[K]) => Node[], host?: QuillRemoteHost) => {
  const receiver = createQuillReceiver();
  const sandbox = document.createElement('remote-root') as RemoteRootElement;
  sandbox.append(...build((name) => document.createElement(name)));
  const drops: string[] = [];
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(createElement(QuillRemote, { receiver, host, onDrop: (reason) => drops.push(reason) })));
  act(() => sandbox.connect(receiver.connection as never));
  return { drops };
};

const press = (button: Element) =>
  act(() => {
    button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse', button: 0 }));
    button.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'mouse', button: 0 }));
    button.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));
  });
const button = (text: string) => [...document.querySelectorAll('button')].find((b) => b.textContent?.includes(text));
const flush = async (ms = 0) => act(async () => new Promise((r) => setTimeout(r, ms)));
const until = async (seen: () => unknown) => {
  for (let i = 0; i < 40 && !seen(); i++) await flush(10);
};

describe('which pictures a reader may name', () => {
  it('passes a path under the app’s own API and nothing that leaves it', () => {
    expect(readerPicturePath('figures/plan.png')).toBe('figures/plan.png');
    expect(readerPicturePath('documents/d1/versions/2/pictures/p%203.png?w=800')).toBe('documents/d1/versions/2/pictures/p%203.png?w=800');
    for (const bad of ['https://evil.example/x.png', '//evil.example/x.png', '/api/other/x.png', '../other/x.png', 'a/../../x.png', 'a/%2e%2e/x.png', 'a//b.png', 'a\\b.png', 'data:image/png;base64,AAAA', 'javascript:alert(1)', 'a/b.png#x', 'a b.png', '']) {
      expect(readerPicturePath(bad), bad).toBeUndefined();
    }
  });
});

describe('a reader in the sandbox', () => {
  it('draws the Markdown with raw HTML as text, and fetches only the pictures the host may', async () => {
    const asked: string[] = [];
    const host: QuillRemoteHost = { picture: async (path) => (asked.push(path), path.startsWith('ok/') ? `blob:shown/${path}` : undefined) };
    describeScreen((el) => {
      const reader = el('quill-reader');
      reader.title = 'Berth procedure';
      reader.markdown = '# Berth procedure\n\n## Before arrival\n\nCheck the <b>tide</b>.\n\n![Plan](ok/plan.png)\n\n![Gone](missing/x.png)\n\n![Away](https://evil.example/x.png)';
      return [reader];
    }, host);
    await until(() => document.querySelector('.quill-reader h2'));
    expect(document.querySelector('.quill-reader h2')?.textContent).toBe('Before arrival');
    expect(document.querySelector('.quill-reader b')).toBeNull();
    expect(document.querySelector('.quill-reader')?.textContent).toContain('<b>tide</b>');
    await until(() => document.querySelectorAll('.quill-reader-missing').length === 2);
    expect(asked).toEqual(['ok/plan.png', 'missing/x.png']);
    expect(document.querySelector<HTMLImageElement>('.quill-reader img')?.getAttribute('src')).toBe('blob:shown/ok/plan.png');
    expect([...document.querySelectorAll('.quill-reader-missing')].map((m) => m.textContent)).toEqual(['[Picture: Gone]', '[Picture: Away]']);
  });

  it('says a picture in words when the host lends no fetcher', async () => {
    describeScreen((el) => {
      const reader = el('quill-reader');
      reader.markdown = 'Text.\n\n![Plan](ok/plan.png)';
      return [reader];
    });
    await until(() => document.querySelector('.quill-reader-missing'));
    expect(document.querySelector('.quill-reader-missing')?.textContent).toBe('[Picture: Plan]');
  });

  it('offers the app’s marks beside selected words, and sends the words back', async () => {
    const marked: RemoteMarked[] = [];
    describeScreen((el) => {
      const reader = el('quill-reader');
      reader.markdown = '## Mooring\n\nUse two head lines at Port of Calderhaven.';
      reader.marks = [{ id: 'about', label: 'Say it’s about this' }];
      reader.addEventListener('mark', (e) => marked.push((e as CustomEvent<RemoteMarked>).detail));
      return [reader];
    });
    await until(() => document.querySelector('.quill-reader p'));
    const words = document.querySelector('.quill-reader p')!.firstChild!;
    act(() => {
      const range = document.createRange();
      range.setStart(words, 22);
      range.setEnd(words, 41);
      document.getSelection()!.removeAllRanges();
      document.getSelection()!.addRange(range);
      document.dispatchEvent(new Event('selectionchange'));
    });
    await until(() => button('Say it’s about this'));
    press(button('Say it’s about this')!);
    await flush();
    expect(marked).toEqual([{ mark: 'about', text: 'Port of Calderhaven', anchor: 'b2', context: 'Use two head lines at Port of Calderhaven.' }]);
  });
});

describe('a file button in the sandbox', () => {
  it('hands the files to the host, and tells the app only what was chosen', async () => {
    const taken: File[] = [];
    const chosen: RemoteChosenFile[][] = [];
    describeScreen(
      (el) => {
        const add = el('quill-file-button');
        add.label = 'Add a document';
        add.accept = ['.pdf', '.docx'];
        add.multiple = true;
        add.addEventListener('choose', (e) => chosen.push((e as CustomEvent<RemoteChosenFile[]>).detail));
        return [add];
      },
      { files: (files) => taken.push(...files) },
    );
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    expect(input.accept).toBe('.pdf,.docx');
    const click = vi.spyOn(input, 'click');
    press(button('Add a document')!);
    expect(click).toHaveBeenCalled();
    const pdf = new File(['%PDF'], 'berth.pdf', { type: 'application/pdf' });
    const png = new File(['png'], 'photo.png', { type: 'image/png' });
    Object.defineProperty(input, 'files', { value: [pdf, png], configurable: true });
    act(() => input.dispatchEvent(new Event('change', { bubbles: true })));
    await flush();
    expect(taken).toEqual([pdf]);
    expect(chosen).toEqual([[{ name: 'berth.pdf', size: 4, type: 'application/pdf' }]]);
  });

  it('stays, unavailable and saying why, where the host takes no files', () => {
    describeScreen((el) => {
      const add = el('quill-file-button');
      add.label = 'Add a document';
      return [add];
    });
    expect(document.body.textContent).toContain('This screen can’t take files from here.');
  });
});

describe('a people picker in the sandbox', () => {
  it('asks the app for each search, shows its answer, and sends the choice back', async () => {
    const changes: RemotePrincipal[][] = [];
    let picker!: HTMLElementTagNameMap['quill-people-picker'];
    describeScreen((el) => {
      picker = el('quill-people-picker');
      picker.label = 'Share with';
      picker.multiple = true;
      picker.addEventListener('query', (e) => {
        const words = (e as CustomEvent<string>).detail;
        picker.found = {
          query: words,
          items: [
            { kind: 'person', id: 'u-hamid', name: 'Hamid Sadeghi', detail: 'Finance' },
            { kind: 'team', id: 't-ops', name: 'Operations', size: 12, reason: 'It can already read this.' },
          ],
        };
      });
      picker.addEventListener('change', (e) => changes.push((e as CustomEvent<RemotePrincipal[]>).detail));
      return [picker];
    });
    const input = document.querySelector<HTMLInputElement>('.quill-people-picker input')!;
    act(() => {
      input.focus();
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      set.call(input, 'Ha');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    const row = () => [...document.querySelectorAll<HTMLElement>('.quill-list-row')].find((r) => r.textContent?.includes('Hamid Sadeghi'));
    await until(row);
    expect(document.body.textContent).toContain('It can already read this.');
    await act(async () => row()!.click());
    await flush();
    expect(changes).toEqual([[{ kind: 'person', id: 'u-hamid', name: 'Hamid Sadeghi', detail: 'Finance' }]]);
    expect(document.querySelector('.quill-people-chosen')?.textContent).toContain('Hamid Sadeghi');
  });
});

describe('a chain up the floors and a filter bar in the sandbox', () => {
  it('marks the owner, says why a floor can’t be reached, and opens a floor', async () => {
    const opened: string[] = [];
    describeScreen((el) => {
      const path = el('quill-floor-path');
      path.label = 'Where it reaches';
      path.floors = [
        { id: 'port', kind: 'team', name: 'Port Services', owner: true, here: true, line: 'Issued' },
        { id: 'ops', kind: 'team', name: 'Operations', line: 'Complete and Issued' },
        { id: 'org', kind: 'org', name: 'Organisation', reason: 'Only the org’s publishers can put things here.' },
      ];
      path.addEventListener('open', (e) => opened.push((e as CustomEvent<string>).detail));
      return [path];
    });
    const group = document.querySelector('.quill-floor-path')!;
    expect(group.getAttribute('aria-label')).toBe('Where it reaches');
    expect(group.textContent).toContain('Owns it');
    expect(group.textContent).toContain('Only the org’s publishers can put things here.');
    press(button('Operations')!);
    await flush();
    expect(opened).toEqual(['ops']);
  });

  it('draws the filters and sends what the person chose', async () => {
    const changed: unknown[] = [];
    describeScreen((el) => {
      const bar = el('quill-filter-bar');
      bar.label = 'Filter documents';
      bar.filters = [{ id: 'state', label: 'State', options: [{ value: 'issued', label: 'Issued' }, { value: 'review', label: 'In review' }] }];
      bar.value = { state: ['issued'] };
      bar.sorts = [{ value: 'new', label: 'Newest' }, { value: 'name', label: 'Name' }];
      bar.count = 3;
      bar.noun = ['document', 'documents'];
      bar.addEventListener('change', (e) => changed.push((e as CustomEvent).detail));
      return [bar];
    });
    expect(document.body.textContent).toContain('3 documents');
    expect(document.body.textContent).toContain('Issued');
    press(button('Clear all')!);
    await flush();
    expect(changed).toEqual([{ value: {}, sort: '' }]);
  });
});
