import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { LabelContext, Provider, TextContext } from 'react-aria-components';
import MarkdownIt from 'markdown-it';
import { getSchema } from '@tiptap/core';
import { EditorContent, useEditor, useEditorState, type Editor as TiptapEditor } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import { BulletList, ListItem, OrderedList } from '@tiptap/extension-list';
import Blockquote from '@tiptap/extension-blockquote';
import HardBreak from '@tiptap/extension-hard-break';
import { Placeholder, UndoRedo } from '@tiptap/extensions';
import Mention from '@tiptap/extension-mention';
import type { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion';
import type { Node as PmNode, Schema } from '@tiptap/pm/model';
import { MarkdownParser, MarkdownSerializer, type MarkdownSerializerState } from 'prosemirror-markdown';
import { FieldHead, FieldHint, Icon, NEEDS_YOU, cx, shownState, useFieldCheck, useMessage, useReason, type FieldState } from '@augur/kit-common';
import type { EditorProps, MentionResult } from './editor.js';
import { subsetReader } from './markdown.js';
import { refIcon, refName, type RefKind, type RefShown } from './things.js';

/*
 * Quill's Editor on Tiptap (ADR 0058). This file is loaded by `Editor` with a
 * dynamic import, so ProseMirror reaches a page only when it shows an editor.
 * What it reads and writes is the subset in markdown.ts, unchanged from the
 * textarea editor it replaces.
 */

const KINDS: RefKind[] = ['entity', 'document', 'intent', 'person', 'team'];
const GROUP: Record<RefKind, string> = { person: 'People', team: 'Teams', entity: 'Things', intent: 'Intents', document: 'Documents' };

/** A mention that also knows what kind of thing it points at. */
const AugurMention = Mention.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      kind: {
        default: 'person',
        parseHTML: (el: HTMLElement) => el.getAttribute('data-kind') ?? 'person',
        renderHTML: (attrs: { kind?: string }) => ({ 'data-kind': attrs.kind }),
      },
    };
  },
});

const extensions = (placeholder: string | undefined, suggestion: (char: '@' | '#') => object, mentions: boolean) => [
  Document,
  Paragraph,
  Text,
  Bold,
  Italic,
  BulletList,
  OrderedList,
  ListItem,
  Blockquote,
  HardBreak,
  UndoRedo,
  Placeholder.configure({ placeholder: placeholder ?? '' }),
  AugurMention.configure({
    HTMLAttributes: { class: 'quill-mention' },
    deleteTriggerWithBackspace: true,
    suggestions: mentions ? [suggestion('@'), suggestion('#')] : [],
  }),
];

/** Reads the subset into the editor's document. */
const parserFor = (schema: Schema) =>
  new MarkdownParser(schema, subsetReader(MarkdownIt), {
    paragraph: { block: 'paragraph' },
    blockquote: { block: 'blockquote' },
    bullet_list: { block: 'bulletList' },
    ordered_list: { block: 'orderedList', getAttrs: (t) => ({ start: Number(t.attrGet('start') ?? 1) }) },
    list_item: { block: 'listItem' },
    softbreak: { node: 'hardBreak' },
    hardbreak: { node: 'hardBreak' },
    em: { mark: 'italic' },
    strong: { mark: 'bold' },
    mention: {
      node: 'mention',
      noCloseToken: true,
      getAttrs: (t) => {
        const m = t.meta as { kind: RefKind; id: string; trigger: '@' | '#'; label: string };
        return { kind: m.kind, id: m.id, label: m.label, mentionSuggestionChar: m.trigger };
      },
    },
  });

const label$ = (s: string) => s.replace(/[\]\n]/g, ' ').trim();

/** Writes the editor's document back as the subset. */
const serializer = new MarkdownSerializer(
  {
    doc: (state, node) => state.renderContent(node),
    paragraph: (state, node) => {
      state.renderInline(node);
      state.closeBlock(node);
    },
    blockquote: (state, node) => state.wrapBlock('> ', null, node, () => state.renderContent(node)),
    bulletList: (state, node) => state.renderList(node, '  ', () => '- '),
    orderedList: (state, node) => {
      const start = (node.attrs.start as number) || 1;
      const width = String(start + node.childCount - 1).length;
      const space = state.repeat(' ', width + 2);
      state.renderList(node, space, (i) => {
        const n = String(start + i);
        return `${state.repeat(' ', width - n.length)}${n}. `;
      });
    },
    listItem: (state, node) => state.renderContent(node),
    // A line break is a newline, as the subset reads it (breaks: true).
    hardBreak: (state, node, parent, index) => {
      for (let i = index + 1; i < parent.childCount; i++)
        if (parent.child(i).type !== node.type) {
          state.write('\n');
          return;
        }
    },
    text: (state, node) => state.text(node.text ?? ''),
    mention: (state: MarkdownSerializerState, node: PmNode) => {
      const a = node.attrs as { kind: RefKind; id: string; label?: string; mentionSuggestionChar?: string };
      state.write(`[${a.mentionSuggestionChar === '#' ? '#' : '@'}${label$(a.label ?? a.id)}](${a.kind}:${encodeURI(a.id)})`);
    },
  },
  {
    italic: { open: '_', close: '_', mixable: true, expelEnclosingWhitespace: true },
    bold: { open: '**', close: '**', mixable: true, expelEnclosingWhitespace: true },
  },
  { hardBreakNodeName: 'hardBreak' },
);

const toMarkdown = (editor: TiptapEditor) => (editor.isEmpty ? '' : serializer.serialize(editor.state.doc, { tightLists: true }).trimEnd());
const fromMarkdown = (editor: TiptapEditor, markdown: string) => parserFor(editor.schema).parse(markdown).toJSON();

const readGuide = (guide: string) => {
  const m = /^(\d+)\s*(sentence|sentences|word|words|character|characters)$/.exec(guide.trim());
  return m ? { n: Number(m[1]), unit: m[2]!.replace(/s$/, '') as 'sentence' | 'word' | 'character' } : undefined;
};

const measure = (text: string, unit: 'sentence' | 'word' | 'character') => {
  const t = text.trim();
  if (!t) return 0;
  if (unit === 'character') return t.length;
  if (unit === 'word') return t.split(/\s+/).length;
  return t.split(/(?<=[.!?])\s+(?=\S)/).filter((s) => /\w/.test(s)).length;
};

/** The editable element, once the editor is mounted in the page; until then (and in React's strict double mount) nothing. */
const domOf = (editor: TiptapEditor | null) => {
  if (!editor || editor.isDestroyed) return undefined;
  try {
    return editor.view.dom;
  } catch {
    return undefined;
  }
};

type Asking = { trigger: '@' | '#'; query: string; command: (ref: RefShown) => void };

export default function EditorEngine({
  label,
  hint,
  required,
  optional,
  disabled,
  reason,
  state,
  message,
  className,
  value: given,
  defaultValue,
  onChange,
  onCommit,
  name,
  placeholder,
  rows = 3,
  guide: guideWords = '',
  mentionSource,
  autoFocus,
}: EditorProps) {
  const written = useRef(given ?? defaultValue ?? '');
  const [check, setCheck] = useState<{ state: FieldState; message?: string }>({ state: 'idle' });
  const [asking, setAsking] = useState<Asking>();
  const [result, setResult] = useState<MentionResult>();
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(0);
  const asked = useRef(0);
  const labelId = useId();
  const hintId = useId();
  const listId = useId();
  const shown = shownState(state, message, check);
  const { describedBy, line } = useMessage(shown.message);
  const { reasoned, describe, caption } = useReason(disabled, reason);
  const latest = useRef({ onChange, onCommit, mentionSource, required });
  latest.current = { onChange, onCommit, mentionSource, required };

  // The open mention list, read by the editor's key handler without re-creating the editor.
  const list = useRef<{ open: boolean; count: number; active: number; pick: (i: number) => void; close: () => void }>({ open: false, count: 0, active: 0, pick: () => undefined, close: () => undefined });

  const suggestion = useMemo(
    () => (char: '@' | '#') => ({
      char,
      items: () => [],
      render: () => {
        const show = (p: SuggestionProps) => {
          const query = p.query;
          setAsking({ trigger: char, query, command: (ref) => p.command({ id: ref.id, label: refName(ref), kind: ref.kind }) });
          const n = ++asked.current;
          const source = latest.current.mentionSource;
          if (!source) return;
          void source(char, query).then(
            (r) => {
              if (n !== asked.current) return;
              setFailed(false);
              setResult(r);
              setActive(0);
            },
            () => {
              if (n !== asked.current) return;
              setFailed(true);
              setResult({ found: [] });
            },
          );
        };
        return {
          onStart: show,
          onUpdate: show,
          onExit: () => {
            asked.current++;
            setAsking(undefined);
            setResult(undefined);
            setFailed(false);
          },
          onKeyDown: ({ event }: SuggestionKeyDownProps) => {
            const l = list.current;
            if (event.key === 'Escape') {
              l.close();
              return true;
            }
            if (!l.open || !l.count) return false;
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              setActive((l.active + (event.key === 'ArrowDown' ? 1 : l.count - 1)) % l.count);
              return true;
            }
            if (event.key === 'Enter' || event.key === 'Tab') {
              l.pick(l.active);
              return true;
            }
            return false;
          },
        };
      },
    }),
    [],
  );

  const parts = extensions(placeholder, suggestion, Boolean(mentionSource));
  const editor = useEditor({
    extensions: parts,
    content: written.current ? parserFor(getSchema(parts)).parse(written.current).toJSON() : '',
    editable: !disabled,
    autofocus: autoFocus ? 'end' : false,
    immediatelyRender: true,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: { class: 'augur-input quill-editor-input' },
    },
    onUpdate: ({ editor: e }) => {
      const md = toMarkdown(e);
      if (md === written.current) return;
      written.current = md;
      setCheck((c) => (c.state === 'idle' ? c : { state: 'idle' }));
      latest.current.onChange?.(md);
    },
    onBlur: ({ editor: e }) => {
      if (latest.current.required && e.isEmpty) setCheck({ state: 'attention', message: NEEDS_YOU });
      latest.current.onCommit?.(written.current);
    },
  });

  // A value set from outside replaces the text; one the editor wrote itself is already there.
  useEffect(() => {
    if (given === undefined || given === written.current || !domOf(editor)) return;
    written.current = given;
    editor!.commands.setContent(given ? fromMarkdown(editor!, given) : '', { emitUpdate: false });
  });
  useEffect(() => {
    if (domOf(editor) && editor!.isEditable === Boolean(disabled)) editor!.setEditable(!disabled, false);
  });

  const view = useEditorState({
    editor,
    // A destroyed editor (one being replaced, as on a remount in a real browser) has no schema left to read.
    selector: ({ editor: live }) => {
      const e = live && !live.isDestroyed ? live : null;
      return {
        text: e ? e.getText({ blockSeparator: '\n' }) : '',
        selecting: Boolean(e && !e.state.selection.empty && e.isFocused),
        bold: Boolean(e?.isActive('bold')),
        italic: Boolean(e?.isActive('italic')),
        list: Boolean(e?.isActive('bulletList')),
        numbered: Boolean(e?.isActive('orderedList')),
        quote: Boolean(e?.isActive('blockquote')),
      };
    },
  });

  useFieldCheck({
    check: () => {
      if (required && editor?.isEmpty) {
        setCheck({ state: 'attention', message: NEEDS_YOU });
        return false;
      }
      setCheck({ state: 'idle' });
      return true;
    },
    focus: () => editor?.commands.focus(),
    name,
    value: () => written.current,
  });

  const found = result?.found ?? [];
  const ordered = KINDS.flatMap((kind) => found.filter((r) => r.kind === kind));
  const open = Boolean(asking && result);
  list.current = {
    open,
    count: ordered.length,
    active,
    pick: (i) => {
      const ref = ordered[i];
      if (ref && asking) asking.command(ref);
    },
    close: () => {
      asked.current++;
      setAsking(undefined);
      setResult(undefined);
    },
  };

  // The editable area's own ARIA: React Aria has no rich-text field, so this is the one place the kit writes it by hand.
  const describedByAll = [hint ? hintId : '', describedBy ?? '', describe['aria-describedby'] ?? ''].filter(Boolean).join(' ') || undefined;
  useEffect(() => {
    const dom = domOf(editor);
    if (!dom) return;
    const set = (k: string, v: string | undefined) => (v === undefined ? dom.removeAttribute(k) : dom.setAttribute(k, v));
    set('role', 'textbox');
    set('aria-multiline', 'true');
    set('aria-labelledby', labelId);
    set('aria-describedby', describedByAll);
    set('aria-required', required ? 'true' : undefined);
    set('aria-invalid', shown.state === 'error' || shown.state === 'attention' ? 'true' : undefined);
    set('aria-disabled', disabled ? 'true' : undefined);
    set('aria-controls', open ? listId : undefined);
    set('aria-activedescendant', open && ordered.length ? `${listId}-${active}` : undefined);
    if (disabled && reasoned) dom.setAttribute('tabindex', '0');
    dom.style.minHeight = `calc(var(--leading-body) * ${rows} + var(--space-3) * 2)`;
  });

  const guide = readGuide(guideWords);
  const used = guide ? measure(view?.text ?? '', guide.unit) : 0;
  const over = Boolean(guide && used > guide.n);
  const keep = (e: { preventDefault(): void }) => e.preventDefault();
  const format = (kind: 'bold' | 'italic' | 'list' | 'numbered' | 'quote') => {
    const c = editor?.chain().focus();
    if (!c) return;
    if (kind === 'bold') c.toggleBold().run();
    else if (kind === 'italic') c.toggleItalic().run();
    else if (kind === 'list') c.toggleBulletList().run();
    else if (kind === 'numbered') c.toggleOrderedList().run();
    else c.toggleBlockquote().run();
  };
  const bar: [kind: 'bold' | 'italic' | 'list' | 'numbered' | 'quote', words: string, on: boolean, face: ReactNode][] = [
    ['bold', 'Bold (Ctrl B)', Boolean(view?.bold), <b key="b">B</b>],
    ['italic', 'Italic (Ctrl I)', Boolean(view?.italic), <i key="i">I</i>],
    ['list', 'List', Boolean(view?.list), 'List'],
    ['numbered', 'Numbered list', Boolean(view?.numbered), '1.'],
    ['quote', 'Quote', Boolean(view?.quote), 'Quote'],
  ];
  let last = '';
  return (
    <div className={cx('augur-field augur-control relative quill-editor', className)} data-state={shown.state} data-unavailable={disabled || undefined}>
      <Provider
        values={[
          [LabelContext, { id: labelId, elementType: 'span', onClick: () => editor?.commands.focus() }],
          [TextContext, { slots: { description: { id: hintId } } }],
        ]}
      >
        <FieldHead label={label} required={required} optional={optional} />
        <FieldHint hint={hint} />
      </Provider>
      <div className="augur-field-box quill-editor-box">
        {view?.selecting && !disabled ? (
          <div className="quill-editor-bar" role="toolbar" aria-label="Format the selection">
            {bar.map(([kind, words, on, face]) => (
              <button key={kind} type="button" aria-label={words.replace(/ \(.*\)$/, '')} title={words} aria-pressed={on} onMouseDown={keep} onClick={() => format(kind)}>
                {face}
              </button>
            ))}
          </div>
        ) : null}
        <EditorContent editor={editor} className="quill-editor-area" data-name={name} />
      </div>
      {caption}
      {open && asking && result ? (
        <ul className="quill-editor-found" id={listId} role="listbox" aria-label={asking.trigger === '@' ? 'People and teams' : 'Things and intents'}>
          {ordered.map((ref, i) => {
            const head = GROUP[ref.kind] !== last ? GROUP[ref.kind] : undefined;
            last = GROUP[ref.kind];
            return (
              <li key={`${ref.kind}:${ref.id}`} role="presentation">
                {head ? <div className="quill-editor-group">{head}</div> : null}
                <div className="quill-editor-option" role="option" id={`${listId}-${i}`} aria-selected={i === active} onMouseDown={keep} onClick={() => asking.command(ref)}>
                  <Icon name={refIcon(ref)} size={14} />
                  {refName(ref)}
                  {ref.floorName ? <small>{ref.floorName}</small> : null}
                </div>
              </li>
            );
          })}
          {!found.length ? (
            <li className="quill-editor-none" role="presentation">
              {failed ? 'Can’t look that up right now. What you typed stays as words.' : 'Nothing by that name.'}
            </li>
          ) : null}
          {result.closedCount ? (
            <li className="quill-editor-none" role="presentation">
              {result.closedCount} more you can’t open{result.closedReason ? `, ${result.closedReason.replace(/^./, (c) => c.toLowerCase())}` : ''}
            </li>
          ) : null}
        </ul>
      ) : null}
      {line(
        guide ? (
          <span className="augur-count-text" data-over={over ? '' : undefined}>
            {used} {used === 1 ? guide.unit : `${guide.unit}s`}
            {over ? ` · aim for ${guide.n}` : ''}
          </span>
        ) : null,
      )}
    </div>
  );
}
