import { useState } from 'react';
import { cx } from './cx.js';
import { Icon } from './icon.js';

export interface DiffChange {
  /** What changed: a setting's name, a field, a path. */
  key: string;
  /** What it was. Left out, the key is new. */
  was?: string;
  /** What it is now. Left out, the key was removed. */
  now?: string;
}

export interface DiffProps {
  changes: DiffChange[];
  /** What changed, read with the list ("the pipeline's settings"). */
  label: string;
  /** How many changes show before the rest fold away. */
  limit?: number;
  /** Shown where a new key has no old value. */
  newWord?: string;
  /** Shown where a removed key has no new value. */
  removedWord?: string;
  /** Read before the old and new values. */
  wasWord?: string;
  nowWord?: string;
  /** What the fold says; `{n}` is the number of changes hidden. */
  moreWord?: string;
  /** Said when nothing changed. */
  sameText?: string;
  /** Can't be shown now; `reason` says why. */
  disabled?: boolean;
  reason?: string;
  className?: string;
}

/**
 * What changed, key by key (Sink and rise, picked 6 Nov 2026). What went sinks into a Well; what came
 * rises as a key. It lists changes only, never the whole file, and folds past `limit`, so it never
 * scrolls. It uses no colour: added is never green and removed never red, because green means only
 * "needs you" and red only a failure.
 */
export function Diff({
  changes,
  label,
  limit = 8,
  newWord = 'new',
  removedWord = 'removed',
  wasWord = 'was',
  nowWord = 'now',
  moreWord = 'Show {n} more changes',
  sameText = 'Nothing changed.',
  disabled,
  reason,
  className,
}: DiffProps) {
  const [all, setAll] = useState(false);
  if (disabled) return <p className={cx('augur-diff-why', className)}>{reason}</p>;
  if (changes.length === 0) return <p className={cx('augur-diff-same', className)}>{sameText}</p>;
  const shown = all ? changes : changes.slice(0, limit);
  const hidden = changes.length - shown.length;
  return (
    <div className={cx('augur-diff', className)}>
      <dl className="augur-diff-list" aria-label={`Changes to ${label}`}>
        {shown.map((c) => (
          <div key={c.key} className="augur-diff-change">
            <dt className="augur-diff-key">{c.key}</dt>
            <dd className="augur-diff-values">
              {c.was !== undefined ? (
                <span className="augur-diff-sink">
                  <span className="augur-diff-said">{wasWord} </span>
                  {c.was}
                </span>
              ) : (
                <span className="augur-diff-word">{newWord}</span>
              )}
              <span className="augur-diff-arrow" aria-hidden="true">
                <Icon name="arrow" size={14} />
              </span>
              {c.now !== undefined ? (
                <span className="augur-diff-rise">
                  <span className="augur-diff-said">{nowWord} </span>
                  {c.now}
                </span>
              ) : (
                <span className="augur-diff-word">{removedWord}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
      {hidden > 0 ? (
        <button type="button" className="augur-diff-more" onClick={() => setAll(true)}>
          {moreWord.replace('{n}', String(hidden))}
        </button>
      ) : null}
    </div>
  );
}

export interface DiffTextPart {
  /** `same` stays as it is, `del` sinks, `add` rises. */
  op: 'same' | 'del' | 'add';
  text: string;
}

export interface DiffTextProps {
  parts: DiffTextPart[];
  /** Read before removed and added words. */
  removedWord?: string;
  addedWord?: string;
  className?: string;
}

/** Text that changed, word by word, in the line: removed words sink into a Well, added ones rise as a key. */
export function DiffText({ parts, removedWord = 'removed', addedWord = 'added', className }: DiffTextProps) {
  return (
    <p className={cx('augur-diff-text', className)}>
      {parts.map((p, i) =>
        p.op === 'same' ? (
          <span key={i}>{p.text}</span>
        ) : p.op === 'del' ? (
          <del key={i} className="augur-diff-sink">
            <span className="augur-diff-said">{removedWord} </span>
            {p.text}
          </del>
        ) : (
          <ins key={i} className="augur-diff-rise">
            <span className="augur-diff-said">{addedWord} </span>
            {p.text}
          </ins>
        ),
      )}
    </p>
  );
}
