import { useId, type ReactNode } from 'react';
import { cx } from './cx.js';
import { Mark, type PersonProps } from './person.js';

export interface NotificationEntry {
  id: string;
  /** Who it's from. Left out for the system's own ("Your export is ready"). */
  who?: Pick<PersonProps, 'name' | 'picture' | 'tone'>;
  /** The sentence, after their name ("asked you to approve Q3 procurement plan"). */
  text: ReactNode;
  /** When, as the app words it. */
  at: string;
  /** Not read yet: raised as a soft key. Read ones sit flat in the well. */
  unread?: boolean;
  /** It waits on you: an edge in the one colour. */
  needsYou?: boolean;
}

export interface NotificationItemProps extends NotificationEntry {
  /** Open what it's about. Without it, the row is only read. */
  onOpen?: () => void;
  className?: string;
}

/** One notification: the person's mark, the sentence, then when. Unread is raised; read is flat and dimmed. */
export function NotificationItem({ who, text, at, unread, needsYou, onOpen, className }: NotificationItemProps) {
  const body = (
    <>
      {who ? <Mark name={who.name} picture={who.picture} tone={who.tone} size="sm" /> : <span className="augur-note-system" aria-hidden="true" />}
      <span className="augur-note-text">
        {who ? <b>{who.name}</b> : null} {text}
        {unread ? <span className="sr-only"> (new)</span> : null}
        {needsYou ? <span className="sr-only"> (needs you)</span> : null}
      </span>
      <span className="augur-note-at">{at}</span>
    </>
  );
  return (
    <li className={cx('augur-note', className)} data-unread={unread || undefined} data-needs={needsYou || undefined}>
      {onOpen ? (
        <button type="button" className="augur-note-row" onClick={onOpen}>
          {body}
        </button>
      ) : (
        <span className="augur-note-row">{body}</span>
      )}
    </li>
  );
}

export interface NotificationsProps {
  /** Read aloud and shown above them ("Notifications"). */
  label: string;
  /** Newest first. */
  items: NotificationEntry[];
  onOpen?: (item: NotificationEntry) => void;
  /** Shown when there are none. */
  empty?: string;
  className?: string;
}

/** Notifications as key rows in a well (the card-index drawer), newest first, with how many are new. */
export function Notifications({ label, items, onOpen, empty = 'Nothing new.', className }: NotificationsProps) {
  const headId = useId();
  const unread = items.filter((n) => n.unread).length;
  return (
    <section className={cx('augur-notes', className)} aria-labelledby={headId}>
      <p className="augur-notes-head" id={headId}>
        {label}
        {unread ? ` · ${unread} new` : ''}
      </p>
      {items.length ? (
        <ul className="augur-notes-well">
          {items.map((n) => (
            <NotificationItem key={n.id} {...n} onOpen={onOpen ? () => onOpen(n) : undefined} />
          ))}
        </ul>
      ) : (
        <p className="augur-notes-empty">{empty}</p>
      )}
    </section>
  );
}
