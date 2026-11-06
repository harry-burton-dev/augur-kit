import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from './button.js';
import { cx } from './cx.js';
import { IconButton } from './icon-button.js';
import { ms } from './timing.js';

/** What a notice is about. Only `needs` is green: it means the person is being waited on. */
export type NoticeTone = 'needs' | 'warning' | 'refused' | 'info';

/** The word each tone says when the notice doesn't name its own. */
const TONE_WORDS: Record<NoticeTone, string> = { needs: 'Needs you', warning: 'Check', refused: 'Refused', info: 'Note' };

export interface NoticeProps {
  /** What it's about: `needs` (the only green), `warning`, `refused` (red) or `info`. */
  tone?: NoticeTone;
  /** The tone's word, stamped at the start. Defaults to the tone's own ("Needs you", "Check", "Refused", "Note"). */
  label?: string;
  /** The part that matters, in bold. */
  heading?: string;
  /** The one thing to do, as a word or two. With it, the notice is actionable. */
  action?: string;
  onAction?: () => void;
  /** How many more notices there are in this region, said at the end. */
  more?: number;
  /** The rest of the sentence, after the heading. */
  children?: ReactNode;
  className?: string;
}

/**
 * One sentence inside a page that needs attention, with at most one thing to do (Sheet). It is a solid
 * square sheet, and its tone is a word in mono stamped at the start, so the colour is never the only
 * sign. One per region: say how many more with `more` instead of stacking them.
 */
export function Notice({ tone = 'info', label, heading, action, onAction, more = 0, children, className }: NoticeProps) {
  return (
    <div className={cx('augur-notice', className)} data-tone={tone}>
      <span className="augur-notice-tone">{label ?? TONE_WORDS[tone]}</span>
      <p className="augur-notice-text">
        {heading ? <b>{heading} </b> : null}
        {children}
        {more ? <span className="augur-notice-more"> {more} more {tone === 'needs' ? `${more === 1 ? 'needs' : 'need'} you` : 'here'}.</span> : null}
      </p>
      {action ? (
        <Button kind="secondary" size="sm" onPress={onAction}>
          {action}
        </Button>
      ) : null}
    </div>
  );
}

export interface ToastItem {
  id: string;
  /** What just happened, in a few words ("Archived 3 records"). */
  text: string;
  /** The kind of news, stamped in mono before it. Default "Done". */
  label?: string;
  /** One way to change your mind ("Undo"). */
  action?: { label: string; onPress: () => void };
}

export interface ToastProps {
  toast: ToastItem;
  /** The toast went: by itself, closed, or its action was pressed. */
  onDone: (id: string) => void;
}

/**
 * One toast (Sheet): a small square sheet, the kind of news in mono, and its time left as a line that
 * drains along the bottom edge. It goes by itself after `motion-toast`, and holds while it's hovered or
 * focused. Show toasts with `Toasts`, which places them and announces them.
 */
export function Toast({ toast, onDone }: ToastProps) {
  const [held, setHeld] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const started = useRef(Date.now());
  const left = useRef(ms('motion-toast'));
  useEffect(() => {
    if (held) {
      left.current = Math.max(0, left.current - (Date.now() - started.current));
      return;
    }
    started.current = Date.now();
    timer.current = setTimeout(() => onDone(toast.id), left.current);
    return () => clearTimeout(timer.current);
  }, [held, toast.id, onDone]);
  return (
    <li
      className="augur-toast"
      data-held={held || undefined}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHeld(false)}
    >
      <span className="augur-toast-kind">{toast.label ?? 'Done'}</span>
      <span className="augur-toast-text">{toast.text}</span>
      {toast.action ? (
        <Button
          kind="tertiary"
          size="sm"
          onPress={() => {
            toast.action!.onPress();
            onDone(toast.id);
          }}
        >
          {toast.action.label}
        </Button>
      ) : null}
      <IconButton icon="close" label="Close" size="sm" onPress={() => onDone(toast.id)} />
      <span className="augur-toast-time" aria-hidden="true" />
    </li>
  );
}

export interface ToastsProps {
  toasts: ToastItem[];
  /** The toast went: by itself, closed, or its action was pressed. */
  onDone: (id: string) => void;
  className?: string;
}

/**
 * What just happened, said once at the bottom of the screen above everything (`layer-toast`), with one
 * way to change your mind. Newest last. Each goes by itself and holds while hovered or focused.
 */
export function Toasts({ toasts, onDone, className }: ToastsProps) {
  return (
    <ol className={cx('augur-toasts', className)} aria-live="polite" aria-relevant="additions">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDone={onDone} />
      ))}
    </ol>
  );
}
