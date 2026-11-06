import { useId, useState } from 'react';
import { cx } from './cx.js';
import { Icon } from './icon.js';
import { Status, type StatusName } from './status.js';

export type RunLevel = 'debug' | 'info' | 'warn' | 'error' | 'needs';

export interface RunLine {
  /** When it was written, already formatted ("21:04:05"). */
  at?: string;
  /** How loud it is. A level is always shown with a word or a mark too, never colour alone. */
  level?: RunLevel;
  text: string;
}

export interface RunStep {
  id: string;
  title: string;
  status: StatusName;
  /** Overrides the status word ("Waiting for 22:00"). */
  statusLabel?: string;
  /** When the step last moved, already formatted. */
  at?: string;
  lines: RunLine[];
  /** Shown in an open step that has no lines yet ("Starts after Match"). */
  note?: string;
  /** Can't be opened now (its lines are gone, or private); it stays in the run and says why. */
  disabled?: boolean;
  reason?: string;
}

export interface RunLogProps {
  steps: RunStep[];
  /** What the run is, read with the log ("the vessel import"). */
  label: string;
  /** How many of an open step's last lines show before the rest page in. */
  lastLines?: number;
  /** The open step, controlled. `null` shuts all. */
  open?: string | null;
  /** The open step at first. Left out, the step that most needs looking at opens: failed, then needs you, then running, then the last with lines. */
  defaultOpen?: string | null;
  onOpenChange?: (id: string | null) => void;
  /** What the page-in says; `{n}` is the number of earlier lines. */
  earlierWord?: string;
  /** Words before a line's text for its level, so it never rests on colour. */
  levelWords?: Partial<Record<RunLevel, string>>;
  /** Said when there are no steps yet. */
  emptyText?: string;
  className?: string;
}

const defaultLevelWords: Record<RunLevel, string> = { debug: '', info: '', warn: 'Warn', error: 'Fail', needs: 'Needs you' };

/** The step that most needs looking at: failed, then needs you, then running, then the last one with lines. */
export function stepToOpen(steps: RunStep[]): string | null {
  const open = steps.filter((s) => !s.disabled);
  const pick =
    open.find((s) => s.status === 'failed') ??
    open.find((s) => s.status === 'needs') ??
    open.find((s) => s.status === 'running') ??
    [...open].reverse().find((s) => s.lines.length > 0);
  return pick?.id ?? null;
}

/**
 * A run's log, step by step (Steps, picked 6 Nov 2026). Each step is a fold in a sunken tray, with its
 * status and when it last moved; the open one rises as a key and its lines sit under it in a Well. The
 * step that failed or needs you opens itself, and shows only its last lines, so the page never scrolls;
 * earlier lines page in on a press. A line's level is a word as well as a colour: red is a failure, amber
 * a warning, and green only a line that needs you.
 */
export function RunLog({
  steps,
  label,
  lastLines = 4,
  open: controlled,
  defaultOpen,
  onOpenChange,
  earlierWord = 'Show {n} earlier lines',
  levelWords,
  emptyText = 'No steps yet. The run writes here once it starts.',
  className,
}: RunLogProps) {
  const [own, setOwn] = useState<string | null>(() => (defaultOpen === undefined ? stepToOpen(steps) : defaultOpen));
  const [earlier, setEarlier] = useState<string[]>([]);
  const open = controlled === undefined ? own : controlled;
  const base = useId();
  const words = { ...defaultLevelWords, ...levelWords };
  const choose = (id: string | null) => {
    if (controlled === undefined) setOwn(id);
    onOpenChange?.(id);
  };

  if (steps.length === 0) return <p className={cx('augur-runlog-empty', className)}>{emptyText}</p>;

  return (
    <div className={cx('augur-runlog', className)} role="group" aria-label={`Log of ${label}`}>
      {steps.map((s) => {
        const isOpen = open === s.id && !s.disabled;
        const all = earlier.includes(s.id);
        const shown = all ? s.lines : s.lines.slice(-lastLines);
        const hidden = s.lines.length - shown.length;
        const bodyId = `${base}-${s.id}`;
        const whyId = `${bodyId}-why`;
        return (
          <div key={s.id} className="augur-runlog-step" data-open={isOpen || undefined} data-status={s.status} data-unavailable={s.disabled || undefined}>
            <button
              type="button"
              className="augur-runlog-head"
              aria-expanded={isOpen}
              aria-controls={isOpen ? bodyId : undefined}
              aria-disabled={s.disabled || undefined}
              aria-describedby={s.disabled && s.reason ? whyId : undefined}
              onClick={() => {
                if (!s.disabled) choose(isOpen ? null : s.id);
              }}
            >
              <span className="augur-runlog-mark" aria-hidden="true">
                <Icon name={isOpen ? 'chevron-down' : 'chevron-right'} size={14} />
              </span>
              <span className="augur-runlog-title">{s.title}</span>
              <Status status={s.status} label={s.statusLabel} />
              {s.at ? <span className="augur-runlog-at">{s.at}</span> : null}
            </button>
            {s.disabled && s.reason ? (
              <p className="augur-runlog-why" id={whyId}>
                {s.reason}
              </p>
            ) : null}
            {isOpen ? (
              <div className="augur-runlog-body" id={bodyId} role="log" aria-live="polite" aria-label={s.title}>
                {hidden > 0 ? (
                  <button type="button" className="augur-runlog-earlier" onClick={() => setEarlier([...earlier, s.id])}>
                    {earlierWord.replace('{n}', String(hidden))}
                  </button>
                ) : null}
                {shown.map((l, i) => {
                  const level = l.level ?? 'info';
                  return (
                    <div key={s.lines.length - shown.length + i} className="augur-runlog-line" data-level={level}>
                      {l.at ? <span className="augur-runlog-at">{l.at}</span> : null}
                      <span className="augur-runlog-text">
                        {level === 'needs' ? <span className="augur-runlog-needs" aria-hidden="true" /> : null}
                        {words[level] ? <span className="augur-runlog-level">{words[level]}</span> : null}
                        {l.text}
                      </span>
                    </div>
                  );
                })}
                {s.lines.length === 0 && s.note ? <p className="augur-runlog-note">{s.note}</p> : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
