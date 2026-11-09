import { useEffect, useState, type ReactNode } from 'react';
import { Button } from './button.js';

export interface PagedListProps<T> {
  /** Names the list ("Recent sign-ins"). */
  label: string;
  items: T[];
  /** How many fit; the part that holds the list decides. */
  pageSize: number;
  render: (item: T) => ReactNode;
  /** A stable key for each item, so a refreshed list keeps the person's page. */
  keyOf: (item: T) => string;
  /** Said when there is nothing yet. */
  empty?: ReactNode;
  words?: { newer?: string; older?: string; of?: (from: number, to: number, total: number) => string };
}

/** A list that shows a page at a time instead of scrolling: "1–6 of 12", with Newer and Older. */
export function PagedList<T>({ label, items, pageSize, render, keyOf, empty, words = {} }: PagedListProps<T>) {
  const size = Math.max(1, pageSize);
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(items.length / size));
  // A shorter list after a refresh keeps the person on the last page that still exists.
  useEffect(() => setPage((p) => Math.min(p, pages - 1)), [pages]);
  const at = Math.min(page, pages - 1);
  const shown = items.slice(at * size, at * size + size);
  const of = words.of ?? ((from, to, total) => `${from}–${to} of ${total}`);
  if (!items.length) return empty ? <div className="augur-paged-empty">{empty}</div> : null;
  return (
    <div className="augur-paged">
      <ul className="augur-paged-list" aria-label={label}>
        {shown.map((item) => (
          <li key={keyOf(item)} className="augur-paged-item">
            {render(item)}
          </li>
        ))}
      </ul>
      {pages > 1 ? (
        <div className="augur-paged-foot">
          <span aria-live="polite">{of(at * size + 1, at * size + shown.length, items.length)}</span>
          <span className="augur-paged-moves">
            <Button size="sm" kind="tertiary" disabled={at === 0} reason="You’re on the newest." onPress={() => setPage(at - 1)}>
              {words.newer ?? 'Newer'}
            </Button>
            <Button size="sm" kind="tertiary" disabled={at >= pages - 1} reason="You’re on the oldest." onPress={() => setPage(at + 1)}>
              {words.older ?? 'Older'}
            </Button>
          </span>
        </div>
      ) : null}
    </div>
  );
}
