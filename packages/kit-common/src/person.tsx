import { cx } from './cx.js';

/**
 * The floor a person is shown on, as a thin ring in that floor's colour. You are drawn in plain ink:
 * green only ever means "needs you", never a person (PDR-018).
 */
export type PersonTone = 'you' | 'team' | 'department' | 'org';

export interface PersonProps {
  name: string;
  /** One quiet line under the name: their role, or what they did ("Edited 3 days ago"). */
  detail?: string;
  /** A picture; initials show when it's missing or fails. */
  picture?: string;
  tone?: PersonTone;
  /** Presence: true while they're here now, false when they're away (dimmed back). Left out, nothing is said. */
  here?: boolean;
  /** Only the round mark, with the name read aloud. */
  markOnly?: boolean;
  className?: string;
}

/** Up to two initials: first and last word. */
export const initials = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  const pick = words.length === 1 ? [words[0]] : [words[0], words[words.length - 1]];
  return pick.map((w) => [...w][0]!.toUpperCase()).join('');
};

export function Mark({ name, picture, tone, size }: Pick<PersonProps, 'name' | 'picture' | 'tone'> & { size?: 'sm' }) {
  return (
    <span className="augur-avatar" data-tone={tone} data-size={size} aria-hidden="true">
      {picture ? <img src={picture} alt="" onError={(e) => (e.currentTarget.hidden = true)} /> : null}
      <span>{initials(name)}</span>
    </span>
  );
}

const presence = (here?: boolean) => (here === undefined ? '' : here ? ', here now' : ', away');

/**
 * Someone: an owner, who did something, or who to ask. A round mark (Disc) with their initials, ringed in
 * their floor's colour, then their name. With `here`, someone away is dimmed back, mark and name.
 */
export function Person({ name, detail, picture, tone, here, markOnly, className }: PersonProps) {
  if (markOnly)
    return (
      <span className={cx('augur-person', className)} data-away={here === false || undefined} role="img" aria-label={name + presence(here)} title={name}>
        <Mark name={name} picture={picture} tone={tone} />
      </span>
    );
  return (
    <span className={cx('augur-person', className)} data-away={here === false || undefined}>
      <Mark name={name} picture={picture} tone={tone} />
      <span className="augur-person-text">
        <span>
          {name}
          {here === undefined ? null : <span className="sr-only">{presence(here)}</span>}
        </span>
        {detail ? <small>{detail}</small> : null}
      </span>
    </span>
  );
}

export interface PeopleProps {
  people: Pick<PersonProps, 'name' | 'picture' | 'tone' | 'here'>[];
  /** How many marks before "+N". */
  max?: number;
  /** Read aloud for the group ("Shared with"). The names follow. */
  label: string;
  className?: string;
}

/** Several people as overlapping marks, then "+N" for the rest. Every name is read aloud and shown on hover. */
export function People({ people, max = 4, label, className }: PeopleProps) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  const names = people.map((p) => p.name + presence(p.here)).join(', ');
  return (
    <span className={cx('augur-people', className)} role="img" aria-label={`${label}: ${names}`} title={names}>
      {shown.map((p, i) => (
        <span key={`${p.name}-${i}`} className="augur-people-one" data-away={p.here === false || undefined}>
          <Mark name={p.name} picture={p.picture} tone={p.tone} />
        </span>
      ))}
      {rest > 0 ? (
        <span className="augur-avatar augur-avatar-more" aria-hidden="true">
          +{rest}
        </span>
      ) : null}
    </span>
  );
}

export interface PresenceProps {
  /** Who could be here, each with whether they are now. */
  people: (Pick<PersonProps, 'name' | 'picture' | 'tone' | 'detail'> & { here: boolean })[];
  /** Read aloud and shown above them ("On this page"). */
  label: string;
  className?: string;
}

/** Who is here now: the ones here at full ink first, the ones away dimmed back after them. No dot and no colour: presence is the kit's one depth move. */
export function Presence({ people, label, className }: PresenceProps) {
  const sorted = [...people.filter((p) => p.here), ...people.filter((p) => !p.here)];
  const count = people.filter((p) => p.here).length;
  return (
    <section className={cx('augur-presence', className)} aria-label={label}>
      <p className="augur-people-label">
        {label} · {count} here
      </p>
      <ul>
        {sorted.map((p, i) => (
          <li key={`${p.name}-${i}`}>
            <Person {...p} />
          </li>
        ))}
      </ul>
    </section>
  );
}
