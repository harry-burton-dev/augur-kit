import { useId, useState } from 'react';
import { Button } from './button.js';
import { cx } from './cx.js';
import { Mark, type PersonProps } from './person.js';
import { SearchField } from './search-field.js';

export interface ActivityEvent {
  id: string;
  /** When, as the app words it ("11:40", "Mon"). */
  at: string;
  who: Pick<PersonProps, 'name' | 'picture' | 'tone'>;
  /** What they did, after their name ("asked you to approve"). */
  did: string;
  /** What they did it to ("Q3 procurement plan"). */
  what?: string;
  /** It waits on you: it leaves the flow and sits above it, in the one colour, until it's done. */
  needsYou?: boolean;
}

export interface ActivityProps {
  /** Read aloud and shown above it ("Activity"). */
  label: string;
  /** Newest first. */
  events: ActivityEvent[];
  /** The newest event you have already seen: the line goes above it, and it and everything older are dimmed. */
  seenFrom?: string;
  /** Open what an event is about. Without it, the thing's name is plain text. */
  onOpen?: (event: ActivityEvent) => void;
  /** How many lines a page holds before Older and Newer. */
  pageSize?: number;
  /** Shown when nothing has happened, or nothing matches the find. */
  empty?: string;
  className?: string;
}

const matches = (e: ActivityEvent, q: string) => `${e.who.name} ${e.did} ${e.what ?? ''} ${e.at}`.toLowerCase().includes(q.toLowerCase());

function Line({ e, onOpen }: { e: ActivityEvent; onOpen?: ActivityProps['onOpen'] }) {
  return (
    <>
      <span className="augur-event-at">{e.at}</span>
      <Mark name={e.who.name} picture={e.who.picture} tone={e.who.tone} size="sm" />
      <span className="augur-event-text">
        <b>{e.who.name}</b> {e.did}{' '}
        {e.what ? (
          onOpen ? (
            <button type="button" className="augur-event-what" onClick={() => onOpen(e)}>
              {e.what}
            </button>
          ) : (
            <span className="augur-event-what">{e.what}</span>
          )
        ) : null}
      </span>
    </>
  );
}

/**
 * What happened, for catching up and as a trail to search. A find field looks through who, what and when.
 * What waits on you is pulled out above the flow (the in-tray). Below, one line per event, newest first;
 * a line marks where you last looked, and what you had already seen is dimmed under it. Long trails page
 * with Older and Newer, so it never scrolls.
 */
export function Activity({ label, events, seenFrom, onOpen, pageSize = 8, empty = 'Nothing has happened yet.', className }: ActivityProps) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const headId = useId();
  const asks = events.filter((e) => e.needsYou);
  const flow = events.filter((e) => !e.needsYou && (!query.trim() || matches(e, query.trim())));
  const seenAt = seenFrom ? events.findIndex((e) => e.id === seenFrom) : -1;
  const seen = (e: ActivityEvent) => seenAt >= 0 && events.indexOf(e) >= seenAt;
  const pages = Math.max(1, Math.ceil(flow.length / pageSize));
  const at = Math.min(page, pages - 1);
  const shown = flow.slice(at * pageSize, at * pageSize + pageSize);
  const firstSeen = shown.findIndex(seen);
  return (
    <section className={cx('augur-activity', className)} aria-labelledby={headId}>
      <p className="augur-activity-head" id={headId}>
        {label}
      </p>
      {asks.length ? (
        <div className="augur-activity-asks" role="group" aria-label={`Needs you, ${asks.length}`}>
          <p className="augur-activity-asks-head">Needs you · {asks.length}</p>
          <ul>
            {asks.map((e) => (
              <li key={e.id} className="augur-event">
                <Line e={e} onOpen={onOpen} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <SearchField
        label={`Find in ${label.toLowerCase()}`}
        placeholder="Who, what or when"
        value={query}
        onChange={(q) => {
          setQuery(q);
          setPage(0);
        }}
      />
      {shown.length ? (
        <ol className="augur-events">
          {shown.map((e, i) => (
            <li key={e.id} className="augur-event-row">
              {i === firstSeen ? (
                <p className="augur-since">
                  <span>Seen</span>
                </p>
              ) : null}
              <div className="augur-event" data-seen={seen(e) || undefined}>
                <Line e={e} onOpen={onOpen} />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="augur-activity-empty">{query.trim() ? `Nothing matches “${query.trim()}”.` : empty}</p>
      )}
      {pages > 1 ? (
        <span className="augur-activity-pages">
          <Button size="sm" kind="ghost" disabled={at === 0} reason={at === 0 ? 'This is the newest.' : undefined} onPress={() => setPage(at - 1)}>
            Newer
          </Button>
          <span>
            {at + 1} of {pages}
          </span>
          <Button size="sm" kind="ghost" disabled={at === pages - 1} reason={at === pages - 1 ? 'This is the oldest.' : undefined} onPress={() => setPage(at + 1)}>
            Older
          </Button>
        </span>
      ) : null}
    </section>
  );
}
