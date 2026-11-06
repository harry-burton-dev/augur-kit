import { useId, useState, type ReactNode } from 'react';
import { Button } from './button.js';
import { cx } from './cx.js';
import { Icon } from './icon.js';
import { Mark, type PersonProps } from './person.js';
import { TextField } from './text-field.js';

/** Who wrote something: a person as Person draws them. */
export type Author = Pick<PersonProps, 'name' | 'picture' | 'tone'>;

export interface CommentEntry {
  id: string;
  by: Author;
  /** When, as the app words it ("10:20", "Yesterday"). */
  at: string;
  text: ReactNode;
}

/** A point: a comment that stays open until someone settles it, with its replies one step in. */
export interface CommentPoint extends CommentEntry {
  replies?: CommentEntry[];
  /** It asks something of you: drawn in the one colour, and first. */
  asksYou?: boolean;
  /** Settled: it folds to one dim line saying who settled it and how. */
  settled?: { by: string; summary?: string };
}

export interface CommentsProps {
  /** Read aloud and shown above the points ("Comments"). */
  label: string;
  points: CommentPoint[];
  /** Raise a new point. Without it there is no box to write one. */
  onAdd?: (text: string) => void;
  /** Reply to a point. Without it, points can't be answered here. */
  onReply?: (pointId: string, text: string) => void;
  /** Settle a point. Without it, points can't be settled here. */
  onSettle?: (pointId: string) => void;
  /** Shown when there are no points yet. */
  empty?: string;
  className?: string;
}

function Entry({ entry, small }: { entry: CommentEntry; small?: boolean }) {
  return (
    <div className="augur-comment">
      <Mark name={entry.by.name} picture={entry.by.picture} tone={entry.by.tone} size={small ? 'sm' : undefined} />
      <div className="augur-comment-body">
        <p className="augur-comment-by">
          <b>{entry.by.name}</b> <span>{entry.at}</span>
        </p>
        <div className="augur-comment-text">{entry.text}</div>
      </div>
    </div>
  );
}

function Write({ label, action, onSend, onCancel }: { label: string; action: string; onSend: (text: string) => void; onCancel?: () => void }) {
  const [text, setText] = useState('');
  const send = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };
  return (
    <div className="augur-comment-write">
      <TextField label={label} multiline rows={2} value={text} onChange={setText} />
      <span className="augur-comment-keys">
        <Button size="sm" kind="secondary" onPress={send} disabled={!text.trim()} reason={text.trim() ? undefined : 'Write something first.'}>
          {action}
        </Button>
        {onCancel ? (
          <Button size="sm" kind="ghost" onPress={onCancel}>
            Cancel
          </Button>
        ) : null}
      </span>
    </div>
  );
}

function Point({ point, onReply, onSettle }: { point: CommentPoint; onReply?: CommentsProps['onReply']; onSettle?: CommentsProps['onSettle'] }) {
  const [replying, setReplying] = useState(false);
  return (
    <li className="augur-point" data-asks={point.asksYou || undefined}>
      {point.asksYou ? <p className="augur-point-label">Asked of you</p> : null}
      <Entry entry={point} />
      {point.replies?.length ? (
        <ul className="augur-point-replies" aria-label={`Replies to ${point.by.name}`}>
          {point.replies.map((r) => (
            <li key={r.id}>
              <Entry entry={r} small />
            </li>
          ))}
        </ul>
      ) : null}
      {replying && onReply ? (
        <Write label={`Reply to ${point.by.name}`} action="Reply" onSend={(t) => (onReply(point.id, t), setReplying(false))} onCancel={() => setReplying(false)} />
      ) : onReply || onSettle ? (
        <span className="augur-comment-keys">
          {onReply ? (
            <Button size="sm" kind="ghost" onPress={() => setReplying(true)}>
              Reply
            </Button>
          ) : null}
          {onSettle ? (
            <Button size="sm" kind="ghost" onPress={() => onSettle(point.id)}>
              Settle
            </Button>
          ) : null}
        </span>
      ) : null}
    </li>
  );
}

/**
 * Comments as points (the snag list): each comment opens a point that stays open until someone settles it.
 * Open points take the room, the ones that ask you first; settled points fold to one dim line each, and
 * unfold to show what was said. Replies sit one step in, never deeper. Put it in the app's drawer beside
 * the thing it's about, so the page still fits.
 */
export function Comments({ label, points, onAdd, onReply, onSettle, empty = 'No comments yet.', className }: CommentsProps) {
  const open = [...points.filter((p) => !p.settled && p.asksYou), ...points.filter((p) => !p.settled && !p.asksYou)];
  const settled = points.filter((p) => p.settled);
  const [unfolded, setUnfolded] = useState<string[]>([]);
  const headId = useId();
  return (
    <section className={cx('augur-comments', className)} aria-labelledby={headId}>
      <p className="augur-comments-head" id={headId}>
        {label} · {open.length} open
      </p>
      {points.length === 0 ? <p className="augur-comments-empty">{empty}</p> : null}
      {open.length ? (
        <ul className="augur-points">
          {open.map((p) => (
            <Point key={p.id} point={p} onReply={onReply} onSettle={onSettle} />
          ))}
        </ul>
      ) : null}
      {settled.length ? (
        <ul className="augur-settled" aria-label="Settled">
          {settled.map((p) => {
            const isOpen = unfolded.includes(p.id);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  className="augur-settled-line"
                  aria-expanded={isOpen}
                  onClick={() => setUnfolded(isOpen ? unfolded.filter((id) => id !== p.id) : [...unfolded, p.id])}
                >
                  <Icon name="check" size={14} />
                  <span>
                    Settled{p.settled!.summary ? ` · ${p.settled!.summary}` : ''} · {p.settled!.by}
                  </span>
                </button>
                {isOpen ? (
                  <div className="augur-settled-body">
                    <Entry entry={p} />
                    {p.replies?.map((r) => (
                      <div key={r.id} className="augur-point-replies">
                        <Entry entry={r} small />
                      </div>
                    ))}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
      {onAdd ? <Write label="Raise a point" action="Add" onSend={onAdd} /> : null}
    </section>
  );
}
