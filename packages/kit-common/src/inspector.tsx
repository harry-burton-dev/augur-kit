import { useRef, useState, type KeyboardEvent } from 'react';
import { cx } from './cx.js';
import { Icon } from './icon.js';
import { Snippet } from './snippet.js';

export type InspectValue = string | number | boolean | null | InspectValue[] | { [key: string]: InspectValue };

export interface InspectorProps {
  value: InspectValue;
  /** What the value is, read with it ("the tool call"). */
  label: string;
  /** The chosen path, controlled, as keys from the top (`['output', 'error']`). */
  path?: string[];
  defaultPath?: string[];
  onPathChange?: (path: string[]) => void;
  /** How many columns show at once; older ones step off to the start. */
  columns?: number;
  /** Paths, joined with dots, whose values stay hidden and say so (`['secret', 'input.token']`). */
  hidden?: string[];
  /** Said in place of a hidden value. */
  hiddenWord?: string;
  /** The path key's name for the top. */
  topWord?: string;
  /** Said for an empty list or object. */
  emptyWord?: string;
  /** Said when the whole value is empty. */
  emptyText?: string;
  /** Can't be shown now; `reason` says why. */
  disabled?: boolean;
  reason?: string;
  className?: string;
}

const isBranch = (v: InspectValue | undefined): v is InspectValue[] | { [key: string]: InspectValue } => v !== null && typeof v === 'object';
const entries = (v: InspectValue[] | { [key: string]: InspectValue }) => (Array.isArray(v) ? v.map((x, i) => [String(i), x] as const) : Object.entries(v));
const child = (v: InspectValue | undefined, key: string) => (isBranch(v) ? (Array.isArray(v) ? v[Number(key)] : v[key]) : undefined);
/** A leaf as text: strings quoted, the rest as written. */
export const showValue = (v: InspectValue) => (typeof v === 'string' ? `"${v}"` : isBranch(v) ? '' : String(v));

/**
 * A value a run used or made, such as a tool call's input and output (Columns, picked 6 Nov 2026). Pick a
 * key and what it holds opens in the next column; a leaf opens as a Snippet you press to copy. Depth goes
 * sideways and older columns step off, so it never grows down or scrolls. The path rides on top as a small
 * key to copy. Hidden paths stay in the list and say so. Arrow keys move up and down a column, right into
 * what a key holds, and left back out.
 */
export function Inspector({
  value,
  label,
  path: controlled,
  defaultPath = [],
  onPathChange,
  columns = 3,
  hidden = [],
  hiddenWord = 'Hidden',
  topWord = 'top',
  emptyWord = 'empty',
  emptyText = 'Nothing to show.',
  disabled,
  reason,
  className,
}: InspectorProps) {
  const [own, setOwn] = useState(defaultPath);
  const path = controlled ?? own;
  const box = useRef<HTMLDivElement>(null);
  const choose = (next: string[]) => {
    if (controlled === undefined) setOwn(next);
    onPathChange?.(next);
  };

  if (disabled) return <p className={cx('augur-inspector-why', className)}>{reason}</p>;
  if (!isBranch(value) || entries(value).length === 0) {
    return isBranch(value) || value === null ? <p className={cx('augur-inspector-empty', className)}>{emptyText}</p> : <Snippet code={showValue(value)} label={label} className={className} />;
  }

  // Each column is the branch at a depth; the last may be a leaf, shown whole.
  // A hidden path stops the walk: what it holds never shows.
  const cols: { depth: number; at: InspectValue; hide?: boolean }[] = [];
  let at: InspectValue | undefined = value;
  for (let depth = 0; depth <= path.length && at !== undefined; depth++) {
    const hide = depth > 0 && hidden.includes(path.slice(0, depth).join('.'));
    cols.push({ depth, at: hide ? null : at, hide });
    const key = path[depth];
    if (hide || key === undefined || !isBranch(at)) break;
    at = child(at, key);
  }
  const shown = cols.slice(-columns);
  const stepped = cols.length - shown.length;
  const joined = (p: string[]) => p.join('.');

  const focusAt = (depth: number, index: number) => {
    const col = box.current?.querySelector(`[data-depth="${depth}"]`);
    const items = col?.querySelectorAll<HTMLElement>('[data-item]');
    if (!items || items.length === 0) return;
    items[Math.max(0, Math.min(index, items.length - 1))]?.focus();
  };
  const onKey = (e: KeyboardEvent, depth: number, index: number, key: string, branch: boolean) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      focusAt(depth, index + (e.key === 'ArrowDown' ? 1 : -1));
    } else if (e.key === 'ArrowRight' && branch) {
      e.preventDefault();
      choose([...path.slice(0, depth), key]);
      requestAnimationFrame(() => focusAt(depth + 1, 0));
    } else if (e.key === 'ArrowLeft' && depth > 0) {
      e.preventDefault();
      const parent = path[depth - 1];
      choose(path.slice(0, depth - 1).concat(parent === undefined ? [] : [parent]));
      requestAnimationFrame(() => {
        const col = box.current?.querySelector(`[data-depth="${depth - 1}"]`);
        col?.querySelector<HTMLElement>('[data-chosen]')?.focus();
      });
    }
  };

  return (
    <div className={cx('augur-inspector', className)} ref={box}>
      <div className="augur-inspector-path">
        <Snippet inline code={path.length ? joined(path) : topWord} label="the path" />
      </div>
      <div className="augur-inspector-cols" role="group" aria-label={label} data-stepped={stepped || undefined} style={{ ['--inspector-columns' as string]: columns }}>
        {shown.map(({ depth, at: col, hide }) => {
          const here = path.slice(0, depth);
          if (hide || !isBranch(col)) {
            return (
              <div key={depth} className="augur-inspector-col augur-inspector-leaf" data-depth={depth}>
                {hide ? <p className="augur-inspector-hidden">{hiddenWord}</p> : <Snippet code={showValue(col)} label={`the value of ${joined(here)}`} lines={6} />}
              </div>
            );
          }
          const list = entries(col);
          return (
            <ul key={depth} className="augur-inspector-col" data-depth={depth} aria-label={depth === 0 ? topWord : joined(here)}>
              {list.length === 0 ? <li className="augur-inspector-hidden">{emptyWord}</li> : null}
              {list.map(([k, v], i) => {
                const full = joined([...here, k]);
                const hide = hidden.includes(full);
                const branch = isBranch(v);
                const chosen = path[depth] === k;
                return (
                  <li key={k}>
                    <button
                      type="button"
                      className="augur-inspector-item"
                      data-item=""
                      data-chosen={chosen || undefined}
                      aria-current={chosen || undefined}
                      tabIndex={chosen || (path[depth] === undefined && i === 0) ? 0 : -1}
                      onClick={() => choose([...here, k])}
                      onKeyDown={(e) => onKey(e, depth, i, k, branch && !hide)}
                    >
                      <span className="augur-inspector-key">{k}</span>
                      {hide ? (
                        <span className="augur-inspector-hidden">{hiddenWord}</span>
                      ) : branch ? (
                        <span className="augur-inspector-kind">
                          {entries(v).length}
                          <Icon name="chevron-right" size={14} />
                        </span>
                      ) : (
                        <span className="augur-inspector-value">{showValue(v)}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          );
        })}
      </div>
    </div>
  );
}
