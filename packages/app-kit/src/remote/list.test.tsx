// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { RemoteRootElement } from '@remote-dom/core/elements';
import { QuillRemote, createQuillReceiver } from './receiver.js';
import { defineQuillElements } from './elements.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** The app contract's first-paint budget (6.9): past it the pane says "slow to open". */
const FIRST_PAINT_MS = 5000;
const ROWS = 50_000;

// happy-dom has no layout: give every element a size, as React Aria's own tests do, so the
// virtualizer works out which rows are in view.
const sized: [string, PropertyDescriptor | undefined][] = [];
beforeAll(() => {
  defineQuillElements();
  if (!customElements.get('remote-root')) customElements.define('remote-root', RemoteRootElement);
  for (const [prop, value] of [['clientWidth', 1000], ['clientHeight', 640]] as const) {
    sized.push([prop, Object.getOwnPropertyDescriptor(HTMLElement.prototype, prop)]);
    Object.defineProperty(HTMLElement.prototype, prop, { configurable: true, get: () => value });
  }
});
afterAll(() => {
  for (const [prop, desc] of sized) {
    if (desc) Object.defineProperty(HTMLElement.prototype, prop, desc);
    else delete (HTMLElement.prototype as unknown as Record<string, unknown>)[prop];
  }
});
let root: Root | undefined;
afterEach(() => act(() => root?.unmount()));

/** Sends one element with its rows from the sandbox and draws it; answers how long that took. */
function drawRemote(make: () => HTMLElement): number {
  const receiver = createQuillReceiver();
  const sandbox = document.createElement('remote-root') as RemoteRootElement;
  sandbox.append(make());
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  const start = performance.now();
  act(() => root!.render(<QuillRemote receiver={receiver} />));
  act(() => sandbox.connect(receiver.connection as never));
  return performance.now() - start;
}

describe('a long list sent from the sandbox (spec 6.9)', () => {
  it(`draws ${ROWS} rows within the first-paint budget, with only the rows in view in the DOM`, () => {
    const ms = drawRemote(() => {
      const list = document.createElement('quill-list');
      list.label = 'Notes';
      list.noun = ['note', 'notes'];
      list.items = Array.from({ length: ROWS }, (_, i) => ({ id: `n${i}`, title: `Note ${i}` }));
      return list;
    });
    const rows = document.querySelectorAll('.quill-list-row');
    expect(ms).toBeLessThan(FIRST_PAINT_MS);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThan(60);
    expect(rows[0]!.textContent).toContain('Note 0');
    expect(document.querySelector('.quill-list')!.hasAttribute('data-virtual')).toBe(true);
    expect(document.body.textContent).toContain(`${ROWS} notes`);
  });

  // The table builds React Aria's collection for every row, which happy-dom makes about four times
  // slower than a browser (50 000 rows: 4.4 s here, 1.2 s in Chromium 153), so only the list is timed.
  it(`draws a ${ROWS}-row table with only the rows in view in the DOM`, () => {
    drawRemote(() => {
      const table = document.createElement('quill-table');
      table.noun = 'notes';
      table.columns = [{ key: 'title', label: 'Title' }, { key: 'size', label: 'Size', kind: 'number' }];
      table.rows = Array.from({ length: ROWS }, (_, i) => ({ id: `n${i}`, title: `Note ${i}`, size: i }));
      return table;
    });
    const cells = document.querySelectorAll('.quill-table-cell[data-primary]');
    expect(cells.length).toBeGreaterThan(0);
    expect(cells.length).toBeLessThan(60);
    expect(document.querySelector('.quill-table')!.hasAttribute('data-virtual')).toBe(true);
  });

  it('draws a short list in full, as Quill’s List always has', () => {
    drawRemote(() => {
      const list = document.createElement('quill-list');
      list.label = 'Notes';
      list.items = Array.from({ length: 12 }, (_, i) => ({ id: `n${i}`, title: `Note ${i}` }));
      return list;
    });
    expect(document.querySelectorAll('.quill-list-row')).toHaveLength(12);
    expect(document.querySelector('.quill-list')!.hasAttribute('data-virtual')).toBe(false);
  });
});
