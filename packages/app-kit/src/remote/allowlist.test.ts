// @vitest-environment happy-dom
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { RemoteRootElement, createRemoteElement } from '@remote-dom/core/elements';
import { QuillRemote, createQuillReceiver } from './receiver.js';
import { renderers } from './renderers.js';
import { QUILL_REMOTE_ELEMENTS, quillRemoteElementNames } from './vocabulary.js';
import { defineQuillElements } from './elements.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const allowlistFile = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../remote-allowlist.json'), 'utf8'));

describe('Quill’s remote vocabulary', () => {
  it('has a renderer for every element in the allowlist, and an element for every renderer', () => {
    expect(Object.keys(renderers).sort()).toEqual([...quillRemoteElementNames].sort());
    for (const name of quillRemoteElementNames) expect(typeof renderers[name]).toBe('function');
  });

  it('is the allowlist file the shell and the contract tests read', () => {
    expect(allowlistFile).toEqual({ schema: 'augur.quill-remote/v1', elements: JSON.parse(JSON.stringify(QUILL_REMOTE_ELEMENTS)) });
  });

  it('names elements as quill-*, and gives every event a described detail', () => {
    for (const [name, spec] of Object.entries(QUILL_REMOTE_ELEMENTS)) {
      expect(name).toMatch(/^quill-[a-z]+(-[a-z]+)*$/);
      for (const detail of Object.values(spec.events)) expect(detail.length).toBeGreaterThan(0);
    }
  });
});

describe('a screen described in the sandbox and drawn by the host', () => {
  let root: Root | undefined;
  let sandbox: RemoteRootElement;
  beforeAll(() => {
    defineQuillElements();
    customElements.define('remote-root', RemoteRootElement);
    customElements.define('evil-frame', createRemoteElement({ properties: { src: { type: String } } }));
  });
  afterEach(() => {
    act(() => root?.unmount());
    vi.restoreAllMocks();
  });

  /** Builds the sandbox's tree, then connects it, as the SDK runtime does at start. */
  const describeScreen = (build: (el: <K extends keyof HTMLElementTagNameMap>(name: K) => HTMLElementTagNameMap[K]) => Node[]) => {
    const receiver = createQuillReceiver();
    sandbox = document.createElement('remote-root') as RemoteRootElement;
    sandbox.append(...build((name) => document.createElement(name)));
    const drops: string[] = [];
    document.body.replaceChildren(document.createElement('div'));
    root = createRoot(document.body.firstElementChild!);
    act(() => root!.render(createElement(QuillRemote, { receiver, onDrop: (reason) => drops.push(reason) })));
    act(() => sandbox.connect(receiver.connection as never));
    return { drops, host: document.body.firstElementChild as HTMLElement };
  };

  it('draws the kit’s parts and sends their events back to the sandbox', () => {
    const opened: string[] = [];
    let pressed = 0;
    const { host, drops } = describeScreen((el) => {
      const head = el('quill-page-head');
      head.heading = 'Notes';
      const list = el('quill-list');
      list.label = 'Notes';
      list.noun = ['note', 'notes'];
      list.items = [
        { id: 'n1', title: 'First' },
        { id: 'n2', title: 'Second', detail: 'Yesterday' },
      ];
      list.addEventListener('open', (e) => opened.push((e as CustomEvent<string>).detail));
      const button = el('quill-button');
      button.label = 'New note';
      button.addEventListener('press', () => pressed++);
      return [head, list, button];
    });
    expect(drops).toEqual([]);
    // Nothing the sandbox left unset reaches the part: its own defaults hold (the count bar shows).
    expect(host.querySelector('[role="heading"]')?.textContent).toBe('Notes');
    expect(host.textContent).toContain('2 notes');
    expect(host.textContent).toContain('Second');
    const second = [...host.querySelectorAll('[role="row"]')].find((r) => r.textContent?.includes('Second'))!;
    act(() => {
      second.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse', button: 0 }));
      second.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'mouse', button: 0 }));
      second.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));
    });
    expect(opened).toEqual(['n2']);
    const button = [...host.querySelectorAll('button')].find((b) => b.textContent === 'New note')!;
    act(() => {
      button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse', button: 0 }));
      button.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'mouse', button: 0 }));
      button.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));
    });
    expect(pressed).toBe(1);
  });

  it('lays out the main column with Quill’s layout parts, spaced only by the layout tokens', () => {
    const { host, drops } = describeScreen((el) => {
      const stack = el('quill-stack');
      stack.gap = 'section';
      const split = el('quill-split');
      const main = el('quill-notice');
      main.heading = 'Main';
      const side = el('quill-notice');
      side.heading = 'Beside';
      side.slot = 'aside';
      split.append(main, side);
      const grid = el('quill-grid');
      grid.label = 'Floors';
      const tile = el('quill-notice');
      tile.heading = 'One';
      grid.append(tile);
      stack.append(split, grid);
      return [stack];
    });
    expect(drops).toEqual([]);
    expect(host.querySelector('.quill-stack')?.getAttribute('data-gap')).toBe('section');
    expect(host.querySelector('.quill-split-main')?.textContent).toContain('Main');
    expect(host.querySelector('.quill-split-aside')?.textContent).toContain('Beside');
    expect(host.querySelector('.quill-grid[role="group"]')?.getAttribute('aria-label')).toBe('Floors');
  });

  it('redraws when the sandbox changes a property', () => {
    let state!: HTMLElementTagNameMap['quill-state'];
    const { host } = describeScreen((el) => {
      state = el('quill-state');
      state.heading = 'No notes yet';
      return [state];
    });
    expect(host.textContent).toContain('No notes yet');
    act(() => {
      state.heading = 'Still none';
    });
    expect(host.textContent).toContain('Still none');
  });

  it('drops an element outside the allowlist, with what is inside it, and says why on the console', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { host, drops } = describeScreen((el) => {
      const evil = document.createElement('evil-frame') as HTMLElement & { src?: string };
      evil.src = 'https://example.org/';
      const inside = el('quill-button');
      inside.label = 'Inside the frame';
      evil.append(inside);
      const kept = el('quill-state');
      kept.heading = 'Still here';
      return [evil, kept];
    });
    expect(host.querySelector('evil-frame, iframe')).toBeNull();
    expect(host.textContent).not.toContain('Inside the frame');
    expect(host.textContent).toContain('Still here');
    expect(drops).toEqual(['<evil-frame> isn’t in Quill’s remote vocabulary; it was dropped with what’s inside it.']);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('<evil-frame> isn’t in Quill’s remote vocabulary'));
  });

  it('drops a property the vocabulary doesn’t name, or of the wrong type, and draws the rest', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { host, drops } = describeScreen((el) => {
      const state = el('quill-state');
      state.heading = 'Nothing here';
      (state as unknown as Record<string, unknown>).body = 42;
      // A property remote-dom carries but Quill doesn't take: set straight on the remote element.
      (state as unknown as { updateRemoteProperty(n: string, v: unknown): void }).updateRemoteProperty('innerHTML', '<img src=x onerror=alert(1)>');
      return [state];
    });
    expect(host.textContent).toContain('Nothing here');
    expect(host.querySelector('img')).toBeNull();
    expect(drops).toContain('<quill-state>’s “body” takes a string; the number sent was dropped.');
    expect(drops.some((d) => d.includes('“innerHTML”'))).toBe(true);
  });

  it('keeps children only where the element takes them, by slot', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { host, drops } = describeScreen((el) => {
      const about = el('quill-about');
      about.what = 'A note';
      const history = el('quill-rows');
      history.slot = 'history';
      history.items = [{ label: 'Made', value: 'Today' }];
      const stray = el('quill-tag');
      stray.slot = 'nowhere';
      stray.label = 'Stray';
      about.append(history, stray);
      return [about];
    });
    expect(host.textContent).toContain('Made');
    expect(host.textContent).not.toContain('Stray');
    expect(drops).toEqual(['<quill-about> has no slot “nowhere”; what was put there was dropped.']);
  });
});
