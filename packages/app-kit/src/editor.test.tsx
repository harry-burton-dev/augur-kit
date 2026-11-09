// @vitest-environment happy-dom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Editor as TiptapEditor } from '@tiptap/react';
import { Dialog } from '@augur/kit-common';
import { Editor, Prose, plainText, readMentions, type MentionSource } from './editor.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
const draw = async (node: ReactNode) => {
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(node));
  // The engine and markdown-it load on first use.
  for (let i = 0; i < 20 && !document.querySelector('.ProseMirror, .quill-prose :is(p, ul, ol, blockquote) *'); i++) await act(() => new Promise((r) => setTimeout(r, 10)));
};
afterEach(() => act(() => root?.unmount()));
const engine = () => (document.querySelector('.ProseMirror') as HTMLElement & { editor: TiptapEditor }).editor;

/** Draws an editor with `value`, and gives what it writes back once it has been read and changed by nothing. */
const roundTrip = async (value: string) => {
  const seen: string[] = [];
  await draw(<Editor label="Brief" defaultValue={value} onChange={(v) => seen.push(v)} />);
  const e = engine();
  // Touch it so it writes: add a word at the end and take it away again.
  act(() => {
    e.commands.insertContentAt(e.state.doc.content.size - 1, 'x');
    e.commands.undo();
  });
  return seen.at(-1) ?? '';
};

describe('the editor on Tiptap', () => {
  it.each([
    'Plain words.',
    '**Bold** and _italic_ words.',
    '- one\n- two',
    '1. first\n2. second',
    '> said\n> again',
    'One paragraph.\n\nAnother.',
    'A line\nand the next.',
    'Ask [@Nora Briggs](person:u1) about [#HMS Example](entity:ent_1).',
  ])('writes back %j as it read it', async (value) => {
    expect(await roundTrip(value)).toBe(value);
  });

  it('keeps what people type as words, even Markdown’s own marks', async () => {
    const seen: string[] = [];
    await draw(<Editor label="Brief" onChange={(v) => seen.push(v)} />);
    act(() => void engine().commands.insertContent('2 * 3 = [six] _maybe_'));
    const value = seen.at(-1)!;
    await draw(<Editor label="Brief" defaultValue={value} />);
    expect(engine().getText()).toBe('2 * 3 = [six] _maybe_');
  });

  it('reads anything outside the subset as its words, and never as HTML', async () => {
    await draw(<Editor label="Brief" defaultValue={'# Title\n\n<b>bold</b> and [a site](https://example.org)'} />);
    expect(document.querySelector('.ProseMirror h1, .ProseMirror b, .ProseMirror a')).toBeNull();
    expect(engine().getText({ blockSeparator: '\n' })).toBe('# Title\n<b>bold</b> and a site');
  });

  it('shows a mention in the text as one chip that knows what it points at', async () => {
    await draw(<Editor label="Brief" defaultValue="Ask [@Nora Briggs](person:u1)." />);
    // The chip is a React node view: it draws a moment after the text.
    await vi.waitFor(() => expect(document.querySelector('.ProseMirror .quill-mention')).not.toBeNull());
    const chip = document.querySelector('.ProseMirror .quill-mention')!;
    expect(chip.textContent).toBe('Nora Briggs');
    expect(chip.getAttribute('data-kind')).toBe('person');
  });

  it('asks the mention source after @, places the chosen one as a link, and says what it can’t open', async () => {
    const seen: string[] = [];
    const source = vi.fn<MentionSource>(async () => ({ found: [{ kind: 'person', id: 'u1', label: 'Nora Briggs' }], closedCount: 2, closedReason: 'Kept on Finance.' }));
    await draw(<Editor label="Brief" mentionSource={source} onChange={(v) => seen.push(v)} />);
    await act(async () => void engine().chain().focus().insertContent('Ask @No').run());
    await act(() => new Promise((r) => setTimeout(r, 0)));
    expect(source).toHaveBeenLastCalledWith('@', 'No');
    expect(document.body.textContent).toContain('2 more you can’t open, kept on Finance.');
    await act(async () => (document.querySelector('[role="option"]') as HTMLElement).click());
    expect(seen.at(-1)).toBe('Ask [@Nora Briggs](person:u1)');
    expect(document.querySelector('[role="listbox"]')).toBeNull();
  });

  it('Esc closes the mention list and leaves a Dialog around it open', async () => {
    const onClose = vi.fn();
    const source = vi.fn<MentionSource>(async () => ({ found: [{ kind: 'person', id: 'u1', label: 'Nora Briggs' }] }));
    await draw(<Dialog open heading="Note" actionLabel="Save" onClose={onClose} fields={<Editor label="Brief" mentionSource={source} />} />);
    await act(async () => void engine().chain().focus().insertContent('Ask @No').run());
    await act(() => new Promise((r) => setTimeout(r, 0)));
    expect(document.querySelector('[role="listbox"]')).not.toBeNull();
    await act(async () => void document.querySelector('.ProseMirror')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })));
    expect(document.querySelector('[role="listbox"]')).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('doesn’t hold a Dialog’s primary when it is required, disabled and empty', async () => {
    const onSubmit = vi.fn();
    await draw(<Dialog open heading="Note" actionLabel="Save" onClose={() => {}} onSubmit={onSubmit} fields={<Editor label="Brief" required disabled />} />);
    await act(async () => [...document.querySelectorAll('button')].find((b) => b.textContent === 'Save')!.click());
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('counts against its guide without stopping anyone', async () => {
    await draw(<Editor label="Brief" guide="1 sentence" defaultValue="One. Two. Three." />);
    expect(document.querySelector('[data-over]')!.textContent).toBe('3 sentences · aim for 1');
  });

  it('names its box for assistive technology', async () => {
    await draw(<Editor label="Brief" hint="Two lines at most." required />);
    const box = document.querySelector('.ProseMirror')!;
    expect(box.getAttribute('role')).toBe('textbox');
    expect(box.getAttribute('aria-multiline')).toBe('true');
    expect(document.getElementById(box.getAttribute('aria-labelledby')!)!.textContent).toBe('Brief');
    expect(document.getElementById(box.getAttribute('aria-describedby')!)!.textContent).toBe('Two lines at most.');
    expect(box.getAttribute('aria-required')).toBe('true');
  });
});

describe('Prose', () => {
  it('shows what the editor wrote without reading any of it as HTML', async () => {
    await draw(<Prose value={'**Bold** and <b>not</b>\n- one\n- two\n\n1. first\n2. second\n\n> said'} />);
    expect(document.querySelector('strong')!.textContent).toBe('Bold');
    expect(document.querySelectorAll('ul li')).toHaveLength(2);
    expect(document.querySelectorAll('ol li')).toHaveLength(2);
    expect(document.querySelector('b')).toBeNull();
    expect(document.querySelector('blockquote')!.textContent).toBe('said');
  });

  it('draws mentions as chips and web links as words', async () => {
    const open = vi.fn();
    await draw(<Prose value="Ask [@Nora Briggs](person:u1), see [this](https://example.org)." onOpen={open} />);
    expect(document.querySelector('a')).toBeNull();
    act(() => (document.querySelector('.quill-ref-open') as HTMLElement).click());
    expect(open).toHaveBeenCalledWith({ kind: 'person', id: 'u1', label: 'Nora Briggs' });
  });

  it('reads mentions and plain words the same way services will', () => {
    expect(readMentions('[@Nora](person:u1) and [#HMS X](entity:e1)').mentions.map((m) => m.ref.id)).toEqual(['u1', 'e1']);
    expect(plainText('**Nora** said:\n1. go\n- now')).toBe('Nora said:\ngo\nnow');
  });
});
