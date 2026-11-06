import { Suspense, lazy, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Token } from 'markdown-it';
import { FieldHead, FieldHint, cx, useFieldCheck, type FieldProps } from '@augur/kit-common';
import { loadMarkdown, loadedMarkdown } from './markdown.js';
import { State, StateBoundary } from './states.js';
import { Ref, type RefKind, type RefShown } from './things.js';

/** One thing named in the text: how it reads there ("@Nora Briggs") and what it points at. */
export interface Mention {
  text: string;
  ref: RefShown;
}

/** What a mention search found, and how many more there are that the person can't open. */
export interface MentionResult {
  found: RefShown[];
  closedCount?: number;
  /** Where those are kept and who to ask: "Kept on Finance." */
  closedReason?: string;
}

/** Finds what `@` (people and teams) or `#` (things and intents) could mean. The app asks through the SDK. */
export type MentionSource = (trigger: '@' | '#', query: string) => Promise<MentionResult>;

const LINK = /\[([@#][^\]\n]+)\]\((entity|document|intent|person|team):([^)\s]+)\)/g;

/** Markdown with mentions as links (`[@Nora Briggs](person:u1)`), read into the text people see and what each mention points at. */
export const readMentions = (markdown: string): { text: string; mentions: Mention[] } => {
  const mentions: Mention[] = [];
  const text = markdown.replace(LINK, (_all, shown: string, kind: RefKind, id: string) => {
    if (!mentions.some((m) => m.text === shown)) mentions.push({ text: shown, ref: { kind, id, label: shown.slice(1) } });
    return shown;
  });
  return { text, mentions };
};

/** The text people see, with each mention still in it written back as a link. */
export const writeMentions = (text: string, mentions: Mention[]) => {
  let out = text;
  for (const m of [...mentions].sort((a, b) => b.text.length - a.text.length)) {
    const escaped = m.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(`(^|[^\\[\\w])${escaped}(?![\\w\\]])`, 'g'), (_all, before: string) => `${before}[${m.text}](${m.ref.kind}:${m.ref.id})`);
  }
  return out;
};

/** What the editor writes, as plain words: marks dropped, mentions kept as their names. */
export const plainText = (markdown: string) =>
  readMentions(markdown)
    .text.replace(/\*\*([^*\n]+)\*\*/g, '$1')
    .replace(/_([^_\n]+)_/g, '$1')
    .replace(/^(- |> |\d+\. )/gm, '');

export interface EditorProps extends FieldProps {
  /** Markdown, with mentions as `[@Name](kind:id)` links. */
  value?: string;
  /** Where it starts when the part keeps its own value (no `value`). */
  defaultValue?: string;
  /** Every change, as Markdown. */
  onChange?: (value: string) => void;
  /** On leaving the field. */
  onCommit?: (value: string) => void;
  name?: string;
  placeholder?: string;
  rows?: number;
  /** A soft guide: "2 sentences", "120 words" or "600 characters". */
  guide?: string;
  mentionSource?: MentionSource;
  autoFocus?: boolean;
}

const Engine = lazy(() => import('./editor-engine.js'));

/** While the engine loads: the field's head and an empty box of the same height, so nothing moves when it arrives. */
function Loading({ label, hint, required, optional, rows = 3, className }: EditorProps) {
  return (
    <div className={cx('augur-field augur-control relative quill-editor', className)} aria-busy="true">
      <FieldHead label={label} required={required} optional={optional} />
      <FieldHint hint={hint} />
      <div className="augur-field-box quill-editor-box">
        <div className="augur-input quill-editor-input" style={{ minHeight: `calc(var(--leading-body) * ${rows} + var(--space-3) * 2)` }} />
      </div>
    </div>
  );
}

/**
 * In the engine's place when it couldn't load. Only a reload can help: Chromium keeps a failed import
 * until the page reloads. It stands in for the engine's check, so a Dialog still holds for a required one.
 */
function Unloaded({ label, hint, required, optional, disabled, name, value, defaultValue, className }: EditorProps) {
  const box = useRef<HTMLDivElement>(null);
  const text = value ?? defaultValue ?? '';
  useFieldCheck({
    check: () => !required || Boolean(disabled) || Boolean(text.trim()),
    focus: () => box.current?.querySelector('button')?.focus(),
    name,
    value: () => text,
  });
  return (
    <div ref={box} className={cx('augur-field quill-editor', className)}>
      <FieldHead label={label} required={required} optional={optional} />
      <FieldHint hint={hint} />
      <State kind="error" size="line" heading={`${label} didn’t load`} body="Anything not saved on this page is lost when it reloads." action="Reload the page" onAction={() => location.reload()} />
    </div>
  );
}

/**
 * A field for writing more than a line (ADR 0058). It writes Markdown and
 * stays quiet while you write: selecting text brings a small bar (bold,
 * italic, list, numbered, quote); Ctrl B, Ctrl I and Markdown's own `- `,
 * `1. ` and `> ` work without it. Type `@` for people and teams or `#` for
 * things and intents: what you choose sits in the text as one chip, saved as
 * a reference, and one Backspace takes it out. A `guide` counts and says when
 * you've gone past it, but never stops you. The editor's engine loads the
 * first time a page shows one.
 */
export function Editor(props: EditorProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return <Unloaded {...props} />;
  return (
    <StateBoundary heading={`${props.label} didn’t load`} size="line" onError={() => setFailed(true)}>
      <Suspense fallback={<Loading {...props} />}>
        <Engine {...props} />
      </Suspense>
    </StateBoundary>
  );
}

type Shown = { tag: string; attrs?: Record<string, unknown>; kids: ReactNode[] };

/** Draws the reader's tokens as elements, one by one: nothing is read as HTML. */
const draw = (tokens: Token[], onOpen: ((ref: RefShown) => void) | undefined): ReactNode[] => {
  const root: Shown = { tag: 'root', kids: [] };
  const stack: Shown[] = [root];
  let n = 0;
  const top = () => stack[stack.length - 1]!;
  const push = (tag: string, attrs?: Record<string, unknown>) => {
    const node: Shown = { tag, kids: [], ...(attrs ? { attrs } : {}) };
    stack.push(node);
  };
  const pop = () => {
    const node = stack.pop()!;
    const key = `p${n++}`;
    const Tag = node.tag as 'p';
    top().kids.push(
      node.tag === 'fragment' ? (
        <span key={key} className="quill-prose-line">
          {node.kids}
        </span>
      ) : (
        <Tag key={key} {...(node.attrs ?? {})}>
          {node.kids}
        </Tag>
      ),
    );
  };
  const walk = (list: Token[]) => {
    for (const t of list) {
      if (t.type === 'inline') walk(t.children ?? []);
      else if (t.type === 'text') top().kids.push(t.content);
      else if (t.type === 'softbreak' || t.type === 'hardbreak') top().kids.push(<br key={`b${n++}`} />);
      else if (t.type === 'mention') {
        const m = t.meta as { kind: RefKind; id: string; label: string };
        top().kids.push(<Ref key={`m${n++}`} value={{ kind: m.kind, id: m.id, label: m.label }} onOpen={onOpen} />);
      } else if (t.nesting === 1) {
        if (t.type === 'paragraph_open' && t.hidden) push('fragment');
        else if (t.type === 'ordered_list_open') {
          const start = Number(t.attrGet('start') ?? 1);
          push('ol', start !== 1 ? { start } : undefined);
        } else push(t.tag);
      } else if (t.nesting === -1) pop();
      else if (t.content) top().kids.push(t.content);
    }
  };
  walk(tokens);
  return root.kids;
};

export interface ProseProps {
  /** What the Editor wrote. */
  value: string;
  /** A mention was pressed. */
  onOpen?: (ref: RefShown) => void;
  className?: string;
}

/** Shows what Editor writes: paragraphs, bold, italic, lists, quotes, and mentions as chips. None of it is read as HTML. */
export function Prose({ value, onOpen, className }: ProseProps) {
  const [md, setMd] = useState(loadedMarkdown);
  useEffect(() => {
    if (md) return;
    let gone = false;
    void loadMarkdown().then((r) => !gone && setMd(r));
    return () => {
      gone = true;
    };
  }, [md]);
  // Until the reader has loaded (once per page), the words alone, so there is something to read at once.
  const shown = md
    ? draw(md.parse(value, {}), onOpen)
    : plainText(value)
        .split(/\n{2,}/)
        .filter((p) => p.trim())
        .map((p, i) => <p key={i}>{p}</p>);
  return <div className={cx('quill-prose', className)}>{shown}</div>;
}
