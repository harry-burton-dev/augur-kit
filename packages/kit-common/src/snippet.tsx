import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { cx } from './cx.js';
import { Icon } from './icon.js';
import { ms } from './timing.js';

export type SnippetCopy = 'rest' | 'copied' | 'blocked';

export interface SnippetProps {
  /** The code, as it should be copied. Lines are split on `\n`. */
  code: string;
  /** What the code is, read with the key: "the command" makes "Press to copy the command". */
  label: string;
  /** In a sentence: the code sits in the line as a small key. */
  inline?: boolean;
  /** How many lines show before the rest fold away under "Show all N lines". A page never has to scroll for a long one. */
  lines?: number;
  /** Told after a copy, with the text and whether the browser let it through. */
  onCopy?: (code: string, copied: boolean) => void;
  /** How long it says Copied, in ms. Defaults to the `motion-still` token. */
  copiedFor?: number;
  /** The tag at rest. */
  copyWord?: string;
  /** The tag once copied. */
  copiedWord?: string;
  /** What it says when the browser won't let the page copy, with what to do instead. */
  blockedText?: string;
  /** What the fold says while shut; `{n}` is the number of lines. */
  moreWord?: string;
  /** What the fold says while open. */
  fewerWord?: string;
  /** Can't be copied now; it stays readable, and `reason` says why. */
  disabled?: boolean;
  reason?: string;
  /** Drawn in a state, for stories and snapshots. */
  state?: SnippetCopy;
  className?: string;
}

const copyText = async (text: string) => {
  if (!navigator.clipboard?.writeText) throw new Error('No clipboard');
  await navigator.clipboard.writeText(text);
};

/**
 * Code to copy (Press to take, picked 6 Nov 2026). The whole snippet is one key, raised like a tab:
 * press it anywhere, or Enter or Space on it, to copy, and it sinks and says Copied. Dragging across it
 * still selects, and doesn't copy. Long code shows its first lines and folds the rest away. When the
 * browser refuses, it says so and what to do. `inline` draws it as a small key inside a sentence.
 */
export function Snippet({
  code,
  label,
  inline,
  lines = 4,
  onCopy,
  copiedFor,
  copyWord = 'Press to copy',
  copiedWord = 'Copied',
  blockedText = 'The browser won’t let this page copy. Select the text and copy it yourself.',
  moreWord = 'Show all {n} lines',
  fewerWord = 'Show the first lines',
  disabled,
  reason,
  state: forced,
  className,
}: SnippetProps) {
  const [copy, setCopy] = useState<SnippetCopy>('rest');
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const codeId = useId();
  const whyId = useId();
  useEffect(() => () => clearTimeout(timer.current), []);
  const state = forced ?? copy;

  const take = async () => {
    if (disabled) return;
    clearTimeout(timer.current);
    let copied = true;
    try {
      await copyText(code);
    } catch {
      copied = false;
    }
    setCopy(copied ? 'copied' : 'blocked');
    onCopy?.(code, copied);
    timer.current = setTimeout(() => setCopy('rest'), copiedFor ?? ms('motion-still'));
  };
  const onClick = () => {
    if (window.getSelection?.()?.toString()) return;
    void take();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      void take();
    }
  };
  const said = state === 'copied' ? `Copied ${label}.` : state === 'blocked' ? blockedText : '';
  const keyProps = {
    role: 'button' as const,
    tabIndex: 0,
    'aria-label': disabled ? `${label}: ${code}` : `${copyWord} ${label}`,
    'aria-disabled': disabled || undefined,
    'aria-describedby': disabled && reason ? whyId : inline ? undefined : codeId,
    'data-state': state,
    'data-unavailable': disabled || undefined,
    onClick,
    onKeyDown: onKey,
  };
  const status = (
    <span className="augur-snippet-said" role="status">
      {said}
    </span>
  );
  const why = disabled && reason ? (
    <span className="augur-snippet-why" id={whyId}>
      {reason}
    </span>
  ) : null;

  if (inline) {
    return (
      <span className={cx('augur-snippet-inline-wrap', className)}>
        <span className="augur-snippet-inline" {...keyProps}>
          <code>{code}</code>
          {state === 'copied' ? <Icon name="check" size={12} /> : null}
        </span>
        {status}
        {why}
      </span>
    );
  }

  const all = code.split('\n');
  const more = all.length - lines;
  const folds = more > 1;
  const shown = open || !folds ? all : all.slice(0, lines);
  return (
    <div className={cx('augur-snippet', className)} data-single={all.length === 1 || undefined}>
      <div className="augur-snippet-key" {...keyProps}>
        <pre className="augur-snippet-code" id={codeId}>
          {shown.map((line, i) => (
            <code key={i}>{line || ' '}</code>
          ))}
        </pre>
        <span className="augur-snippet-tag" aria-hidden="true">
          {disabled ? <Icon name="lock" size={14} /> : state === 'copied' ? <Icon name="check" size={14} /> : null}
          {disabled ? null : state === 'copied' ? copiedWord : copyWord}
        </span>
      </div>
      {folds ? (
        <button type="button" className="augur-snippet-more" aria-expanded={open} aria-controls={codeId} onClick={() => setOpen(!open)}>
          <Icon name={open ? 'chevron-down' : 'chevron-right'} size={14} />
          {open ? fewerWord : moreWord.replace('{n}', String(all.length))}
        </button>
      ) : null}
      {state === 'blocked' ? <p className="augur-snippet-blocked" aria-hidden="true">{blockedText}</p> : null}
      {why}
      {status}
    </div>
  );
}
