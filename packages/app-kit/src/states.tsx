import { useEffect, useState, type ReactNode } from 'react';
import { Icon, cx, type IconName } from '@augur/kit-common';

export type StateKind = 'empty' | 'loading' | 'error' | 'offline';

export interface StateProps {
  kind?: StateKind;
  heading: string;
  body?: string;
  /** The one thing to do, as a word or two; nothing shows without it (and never while loading). */
  action?: string;
  onAction?: () => void;
  /** `line` sits inside a control or a tile; the default is centred in its region. */
  size?: 'region' | 'line';
  className?: string;
}

/**
 * What a region says when it has nothing, is still coming, or failed: one
 * quiet sentence, a line more if it helps, and at most one thing to do.
 * Loading shows the running hairline after 300ms, so a quick load doesn't
 * flash. Error is red only in its diamond and title; offline is amber.
 */
export function State({ kind = 'empty', heading, body, action, onAction, size = 'region', className }: StateProps) {
  const [shown, setShown] = useState(kind !== 'loading');
  useEffect(() => {
    if (kind !== 'loading') {
      setShown(true);
      return;
    }
    setShown(false);
    const wait = setTimeout(() => setShown(true), 300);
    return () => clearTimeout(wait);
  }, [kind]);
  const mark: IconName | undefined = kind === 'error' ? 'error' : kind === 'offline' ? 'warning' : undefined;
  return (
    <div
      className={cx('quill-state', className)}
      data-kind={kind}
      data-size={size}
      data-hidden={shown ? undefined : ''}
      role={kind === 'error' ? 'alert' : 'status'}
      aria-busy={kind === 'loading' || undefined}
    >
      {kind === 'loading' ? <span className="quill-run" aria-hidden="true" /> : null}
      <p className="quill-state-title">
        {mark ? <Icon name={mark} size={14} /> : null}
        {heading}
      </p>
      {body ? <p className="quill-state-body">{body}</p> : null}
      {action && kind !== 'loading' ? (
        <button type="button" className="quill-state-action" onClick={onAction}>
          {action}
        </button>
      ) : null}
    </div>
  );
}

export interface Fact {
  value: string | number;
  label: string;
}

export interface FactsProps {
  items?: Fact[];
  loading?: boolean;
  /** How many skeleton facts to show while loading, 1 to 3. */
  count?: number;
  className?: string;
}

/** At most three values worth a glance: the value large and light, the label in tracked capitals beneath. Extras are dropped. */
export function Facts({ items = [], loading, count = 3, className }: FactsProps) {
  if (loading) {
    const n = Math.min(3, Math.max(1, count || 3));
    return (
      <dl className={cx('quill-facts', className)} aria-busy="true">
        {Array.from({ length: n }, (_, i) => (
          <div className="quill-fact" key={i}>
            <dt>
              <span className="quill-skel" />
            </dt>
            <dd>
              <span className="quill-skel" />
            </dd>
          </div>
        ))}
      </dl>
    );
  }
  return (
    <dl className={cx('quill-facts', className)}>
      {items.slice(0, 3).map((f) => (
        <div className="quill-fact" key={f.label}>
          <dt className="quill-label">{f.label}</dt>
          <dd>{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export interface Row {
  label: string;
  value: string;
}

export interface RowsProps {
  items?: Row[];
  loading?: boolean;
  /** How many skeleton rows while loading, 1 to 5. */
  count?: number;
  /** Said in place of the rows when there are none. */
  empty?: string;
  /** Said as a red line in place of the rows when they couldn't load. */
  error?: string;
  className?: string;
}

/** Up to five lines of simple information: a label, and its value quiet on the right, divided by hairlines. */
export function Rows({ items = [], loading, count = 3, empty, error, className }: RowsProps) {
  if (loading) {
    const n = Math.min(5, Math.max(1, count || 3));
    return (
      <ul className={cx('quill-rows', className)} aria-busy="true">
        {Array.from({ length: n }, (_, i) => (
          <li key={i}>
            <span className="quill-skel" />
            <span className="quill-skel" />
          </li>
        ))}
      </ul>
    );
  }
  if (error)
    return (
      <ul className={cx('quill-rows', className)}>
        <li className="quill-rows-state" data-error="" role="alert">
          {error}
        </li>
      </ul>
    );
  const shown = items.slice(0, 5);
  if (!shown.length && empty)
    return (
      <ul className={cx('quill-rows', className)}>
        <li className="quill-rows-state">{empty}</li>
      </ul>
    );
  return (
    <ul className={cx('quill-rows', className)}>
      {shown.map((r) => (
        <li key={r.label}>
          <span>{r.label}</span>
          <span>{r.value}</span>
        </li>
      ))}
    </ul>
  );
}

/** Notice moved to Common (6 Nov 2026), drawn as a Sheet; Quill keeps exporting it under the same name. */
export { Notice, type NoticeTone, type NoticeProps } from '@augur/kit-common';

export interface NoteProps {
  /** The longer reason, up to two sentences, shown when the line is pressed. */
  why?: string;
  /** Announce changes to the line (an action's result: "Saved."). */
  live?: boolean;
  children?: ReactNode;
  className?: string;
}

/** A quiet line that explains, in one sentence. With `why`, pressing it opens up to two more sentences in place. */
export function Note({ why, live, children, className }: NoteProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cx('quill-note', className)} data-live={live ? '' : undefined}>
      {why ? (
        <>
          <p role={live ? 'status' : undefined}>
            <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
              {children}
            </button>
          </p>
          {open ? <p className="quill-note-why">{why}</p> : null}
        </>
      ) : (
        <p role={live ? 'status' : undefined}>{children}</p>
      )}
    </div>
  );
}

export interface Detail {
  label: string;
  /** Left empty, it says the `missing` words instead of leaving a gap. */
  value?: ReactNode;
  /** One quiet word after the value. */
  note?: string;
  /** The one someone asked about, marked so it's found. */
  explained?: boolean;
}

export interface DetailsProps {
  items: Detail[];
  /** How many show before the rest fold; 0 shows them all. */
  limit?: number;
  missing?: string;
  className?: string;
}

/** The properties of one thing you've opened, as label and value. Eight show; the rest fold behind "4 more details". */
export function Details({ items, limit = 8, missing = 'Not known', className }: DetailsProps) {
  const [open, setOpen] = useState(false);
  const folds = limit > 0 && items.length > limit;
  const shown = folds && !open ? items.slice(0, limit) : items;
  const empty = (v: Detail['value']) => v === undefined || v === null || v === '';
  const rest = items.length - limit;
  return (
    <div className={cx('quill-details', className)}>
      <dl>
        {shown.map((d) => (
          <div key={d.label} className="quill-detail">
            <dt>{d.label}</dt>
            <dd data-missing={empty(d.value) ? '' : undefined} data-explained={d.explained ? '' : undefined}>
              {empty(d.value) ? missing : d.value}
              {d.note ? <small>{d.note}</small> : null}
            </dd>
          </div>
        ))}
      </dl>
      {folds ? (
        <button type="button" className="quill-fold" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? 'Fewer details' : `${rest} more ${rest === 1 ? 'detail' : 'details'}`}
        </button>
      ) : null}
    </div>
  );
}
