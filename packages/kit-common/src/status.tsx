import { cx } from './cx.js';
import { Icon } from './icon.js';

export type StatusName = 'needs' | 'running' | 'queued' | 'paused' | 'done' | 'failed' | 'warning';

export const statusWords: Record<StatusName, string> = {
  needs: 'Needs you',
  running: 'Running',
  queued: 'Queued',
  paused: 'Paused',
  done: 'Done',
  failed: 'Failed',
  warning: 'Check',
};

/** Urgency order used when sorting by status: what needs you first, finished last. */
export const statusUrgency: StatusName[] = ['needs', 'failed', 'running', 'queued', 'paused', 'warning', 'done'];

export interface StatusProps {
  status: StatusName;
  /** Overrides the default word. */
  label?: string;
  /** Only the mark, which then carries the word as its name. */
  markOnly?: boolean;
  /** The first one on screen that needs you pings. */
  next?: boolean;
  className?: string;
}

/** One mark and a word for where a thing is. Only `needs` is green; every mark keeps its shape without colour. */
export function Status({ status, label, markOnly, next, className }: StatusProps) {
  const word = label || statusWords[status] || status;
  const glyph = status === 'done' ? 'check' : status === 'failed' ? 'error' : status === 'warning' ? 'warning' : undefined;
  return (
    <span className={cx('augur-status', className)} data-status={status} data-next={next ? '' : undefined}>
      <span className="augur-status-mark" aria-hidden={markOnly ? undefined : true} role={markOnly ? 'img' : undefined} aria-label={markOnly ? word : undefined}>
        {glyph ? <Icon name={glyph} size={14} /> : null}
      </span>
      {markOnly ? null : <span className="augur-status-word">{word}</span>}
    </span>
  );
}
