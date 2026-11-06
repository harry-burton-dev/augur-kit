import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Icon, type IconName } from './icon.js';
import { initials } from './person.js';
import './people-directions.css';

/**
 * People and activity: the principal decisions, each with three original options to pick from.
 * Nothing here is a part yet. After the picks, the chosen options become Common parts
 * (Person, People, Comments, Activity, Presence, NotificationItem) and Quill's PeoplePicker is restyled,
 * and this page goes. Agents are out of scope for this round: people are people.
 *
 * Every option keeps the kit's rules: square corners except true circles, green only for "needs you",
 * depth by dimming (no blur), screens that fit without scrolling, icons through Common's Icon.
 */
const meta = { title: 'Common/People and activity directions', parameters: { layout: 'fullscreen' } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

interface Option {
  name: string;
  /** Where the idea comes from, outside software design systems. */
  from: string;
  note: string;
  recommended?: boolean;
  demo: ReactNode;
}

function Decision({ n, question, why, options }: { n: number; question: string; why: string; options: [Option, Option, Option] }) {
  return (
    <section className="pd" aria-labelledby={`pd-${n}`}>
      <header className="pd-head">
        <p className="pd-n">Decision {n}</p>
        <h2 id={`pd-${n}`}>{question}</h2>
        <p className="pd-why">{why}</p>
      </header>
      <div className="pd-options">
        {options.map((o, i) => (
          <article key={o.name} className="pd-option" aria-label={`${'ABC'[i]} ${o.name}`}>
            <p className="pd-letter">
              {'ABC'[i]} · {o.name}
              {o.recommended ? <span className="pd-rec">Recommended</span> : null}
            </p>
            <div className="pd-demo">{o.demo}</div>
            <p className="pd-from">Nearest prior art: {o.from}</p>
            <p className="pd-note">{o.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

type MarkLook = 'disc' | 'tile' | 'monogram';
type Floor = 'you' | 'team' | 'department' | 'org';

function Mark({ name, look, floor, grey, dim, dot, size }: { name: string; look: MarkLook; floor?: Floor; grey?: boolean; dim?: boolean; dot?: boolean; size?: 'sm' }) {
  return (
    <span className="pd-mark" data-look={look} data-floor={grey ? undefined : floor} data-dim={dim || undefined} data-size={size} aria-hidden="true">
      {initials(name)}
      {dot ? <span className="pd-mark-dot" /> : null}
    </span>
  );
}

function Who({ name, detail, look, floor, grey }: { name: string; detail?: string; look: MarkLook; floor?: Floor; grey?: boolean }) {
  return (
    <span className="pd-who">
      <Mark name={name} look={look} floor={floor} grey={grey} />
      <span className="pd-who-text">
        <span>{name}</span>
        {detail ? <small>{detail}</small> : null}
      </span>
    </span>
  );
}

const TEAM: { name: string; floor: Floor; detail: string }[] = [
  { name: 'Alex Morgan', floor: 'you', detail: 'You' },
  { name: 'Sam Ortiz', floor: 'team', detail: 'Your team' },
  { name: 'Priya Shah', floor: 'department', detail: 'Department lead' },
  { name: 'Lee Park', floor: 'org', detail: 'Organisation admin' },
];

const Marks = ({ look }: { look: MarkLook }) => (
  <div className="pd-stack" data-you="ink">
    {TEAM.map((p) => (
      <Who key={p.name} look={look} {...p} />
    ))}
    <span className="pd-group" role="img" aria-label="Shared with Alex Morgan, Sam Ortiz, Priya Shah, Lee Park and 2 more">
      {TEAM.map((p) => (
        <Mark key={p.name} name={p.name} look={look} floor={p.floor} />
      ))}
      <span className="pd-mark pd-mark-more" data-look={look} aria-hidden="true">
        +2
      </span>
    </span>
  </div>
);

/** 1. The person mark. */
export const PersonMark: Story = {
  name: '1 Person mark',
  render: () => (
    <Decision
      n={1}
      question="What does a person look like?"
      why="Today a person is a round, filled disc with rounded-font initials: the old look. The kit is now square, so this is the one place a circle could stay, or go."
      options={[
        {
          name: 'Disc',
          from: 'an enamel name badge on a lanyard',
          note: 'Stays round, the only true circle left. Flat grey fill, Instrument Sans initials, the floor shown as a thin ring. Groups overlap with a cut of the page between them.',
          recommended: true,
          demo: <Marks look="disc" />,
        },
        {
          name: 'Tile',
          from: 'a letterpress type block',
          note: 'Square like everything else, drawn as a small key: initials on a raised face, the floor as its thicker bottom edge. Groups sit side by side, never overlapping.',
          demo: <Marks look="tile" />,
        },
        {
          name: 'Monogram',
          from: 'initials in a sign-in register',
          note: 'No shape at all: initials in mono capitals with a short floor tick under them. The quietest; a picture, when there is one, fills a square the same size.',
          demo: <Marks look="monogram" />,
        },
      ]}
    />
  ),
};

/** 2. Floor colour on people. */
export const FloorColour: Story = {
  name: '2 Floor colour',
  render: () => (
    <Decision
      n={2}
      question="How do people show which floor they are on?"
      why={'Today "you" is drawn green, which breaks the rule that green only means "needs you". Shown here with the Disc mark.'}
      options={[
        {
          name: 'Grey people',
          from: 'a staff photo board',
          note: 'Every mark is the same grey. The floor is said in words under the name, never by colour. Green stays free for what needs you.',
          demo: (
            <div className="pd-stack">
              {TEAM.map((p) => (
                <Who key={p.name} look="disc" grey {...p} />
              ))}
            </div>
          ),
        },
        {
          name: 'Floors, you in ink',
          from: 'coloured lanyards at a conference',
          note: 'Team amber, department violet and organisation blue stay as thin rings. You become plain ink, so green is never a person.',
          recommended: true,
          demo: (
            <div className="pd-stack" data-you="ink">
              {TEAM.map((p) => (
                <Who key={p.name} look="disc" {...p} />
              ))}
            </div>
          ),
        },
        {
          name: 'Floor on the line',
          from: 'a coloured tab on a file card',
          note: 'Marks are grey; the floor shows as a short coloured stub before the name, only where the floor matters (sharing, who can see).',
          demo: (
            <div className="pd-stack" data-you="ink">
              {TEAM.map((p) => (
                <span key={p.name} className="pd-stub" data-floor={p.floor}>
                  <Who look="disc" grey {...p} />
                </span>
              ))}
            </div>
          ),
        },
      ]}
    />
  ),
};

const Comment = ({ name, look = 'disc', when, children, sm }: { name: string; look?: MarkLook; when: string; children: ReactNode; sm?: boolean }) => (
  <div className="pd-comment">
    <Mark name={name} look={look} size={sm ? 'sm' : undefined} />
    <div>
      <p className="pd-comment-by">
        <b>{name}</b> <span>{when}</span>
      </p>
      <p>{children}</p>
    </div>
  </div>
);

const Doc = ({ children, marked }: { children?: ReactNode; marked?: boolean }) => (
  <div className="pd-doc">
    <p className="pd-doc-title">Q3 procurement plan</p>
    <p>
      The northern region moves to two suppliers{marked ? <> <mark className="pd-mark-text">from October</mark></> : ' from October'}, with the
      contracts signed before the end of the quarter.
    </p>
    {children}
  </div>
);

/** 3. Where comments live. */
export const CommentPlace: Story = {
  name: '3 Where comments live',
  render: () => (
    <Decision
      n={3}
      question="Where do comments on a thing live?"
      why="A comment is about a record, a run or a document. The screen has to fit without scrolling, so the thread can't simply grow down the page."
      options={[
        {
          name: 'Margin',
          from: "a proof-reader's notes in the margin",
          note: 'Beside the thing, level with the words it is about. Needs a wide screen; on a narrow one it folds to a count.',
          demo: (
            <div className="pd-margin">
              <Doc marked />
              <div className="pd-margin-notes">
                <Comment name="Priya Shah" when="2h" sm>
                  Is October firm?
                </Comment>
              </div>
            </div>
          ),
        },
        {
          name: 'Foot',
          from: 'the minutes under an agenda item',
          note: 'Under the thing, in time order, with the newest few shown and "4 earlier" to page back. Simple, but competes with the thing for height.',
          demo: (
            <Doc>
              <div className="pd-foot">
                <p className="pd-label">Comments · 3</p>
                <Comment name="Sam Ortiz" when="Yesterday" sm>
                  Legal have the drafts.
                </Comment>
                <Comment name="Priya Shah" when="2h" sm>
                  Is October firm?
                </Comment>
              </div>
            </Doc>
          ),
        },
        {
          name: 'Drawer',
          from: 'a routing slip clipped to a file',
          note: "The thing shows a count; the thread opens in the app's drawer beside it and the thing dims back. The page always fits.",
          recommended: true,
          demo: (
            <div className="pd-drawer-wrap">
              <div className="pd-dimmed">
                <Doc />
              </div>
              <div className="pd-drawer">
                <p className="pd-label">Comments · 3</p>
                <Comment name="Sam Ortiz" when="Yesterday" sm>
                  Legal have the drafts.
                </Comment>
                <Comment name="Priya Shah" when="2h" sm>
                  Is October firm?
                </Comment>
              </div>
            </div>
          ),
        },
      ]}
    />
  ),
};

/** 4. The shape of a thread. */
export const ThreadShape: Story = {
  name: '4 Thread shape',
  render: () => (
    <Decision
      n={4}
      question="How are replies arranged?"
      why="Comments can be one running conversation, or answers to particular questions that get settled."
      options={[
        {
          name: 'Flat',
          from: 'a ship’s radio log',
          note: 'One line in time order; a reply quotes a few words of what it answers. Easiest to read top to bottom, hardest to see what is still open.',
          demo: (
            <div className="pd-stack pd-tight">
              <Comment name="Priya Shah" when="10:02">Is October firm?</Comment>
              <Comment name="Sam Ortiz" when="10:20">
                <q className="pd-quote">October firm?</q> Yes, unless legal object.
              </Comment>
              <Comment name="Lee Park" when="11:05">Budget is approved.</Comment>
            </div>
          ),
        },
        {
          name: 'One reply level',
          from: 'a letters page with replies under each letter',
          note: 'Each comment can have answers, one step in on a hairline, never deeper. Keeps a question with its answers.',
          demo: (
            <div className="pd-stack pd-tight">
              <Comment name="Priya Shah" when="10:02">Is October firm?</Comment>
              <div className="pd-replies">
                <Comment name="Sam Ortiz" when="10:20" sm>
                  Yes, unless legal object.
                </Comment>
              </div>
              <Comment name="Lee Park" when="11:05">Budget is approved.</Comment>
            </div>
          ),
        },
        {
          name: 'Points',
          from: 'a snag list on a building site',
          note: 'Each comment opens a point. A point is open until someone settles it; settled points fold to one dim line, so only what is open takes room.',
          recommended: true,
          demo: (
            <div className="pd-stack pd-tight">
              <div className="pd-point">
                <p className="pd-label">Open · asked of you</p>
                <Comment name="Priya Shah" when="10:02">Is October firm?</Comment>
                <div className="pd-replies">
                  <Comment name="Sam Ortiz" when="10:20" sm>
                    Yes, unless legal object.
                  </Comment>
                </div>
              </div>
              <p className="pd-settled">
                <Icon name="check" size={14} aria-hidden /> Settled · Budget approved · Lee Park
              </p>
            </div>
          ),
        },
      ]}
    />
  ),
};

interface Event {
  when: string;
  who: string;
  did: string;
  what: string;
  icon: IconName;
  needs?: boolean;
  seen?: boolean;
}
const EVENTS: Event[] = [
  { when: '11:40', who: 'Priya Shah', did: 'asked you to approve', what: 'Q3 procurement plan', icon: 'check', needs: true },
  { when: '11:05', who: 'Lee Park', did: 'approved the budget for', what: 'Q3 procurement plan', icon: 'check' },
  { when: '10:20', who: 'Sam Ortiz', did: 'edited', what: 'Supplier list', icon: 'rename' },
  { when: '09:12', who: 'Sam Ortiz', did: 'shared', what: 'Supplier list', icon: 'people', seen: true },
  { when: 'Mon', who: 'Lee Park', did: 'archived', what: 'Q2 plan', icon: 'archive', seen: true },
];

const Line = ({ e, time = true }: { e: Event; time?: boolean }) => (
  <li className="pd-event" data-needs={e.needs || undefined} data-seen={e.seen || undefined}>
    {time ? <span className="pd-time">{e.when}</span> : null}
    <Mark name={e.who} look="disc" size="sm" />
    <span>
      <b>{e.who}</b> {e.did} <u>{e.what}</u>
    </span>
  </li>
);

const Find = () => (
  <p className="pd-find">
    <Icon name="find" size={14} aria-hidden /> Find in activity: who, what, when
  </p>
);

/** 5. The activity feed. */
export const Feed: Story = {
  name: '5 Activity feed',
  render: () => (
    <Decision
      n={5}
      question="How does the activity feed read?"
      why="You said it is both: catching up on what happened while you were away, and a trail you can search. Each option has the same find field above it."
      options={[
        {
          name: 'Ledger',
          from: 'a ship’s log',
          note: 'One line per event, a mono time column on the left, nothing grouped. Best as a trail; catching up means reading it all.',
          demo: (
            <div className="pd-feed">
              <Find />
              <ol>
                {EVENTS.map((e) => (
                  <Line key={e.when + e.what} e={e} />
                ))}
              </ol>
            </div>
          ),
        },
        {
          name: 'Since you left',
          from: 'a bookmark ribbon in a diary',
          note: 'The same lines, with one horizon line where you last looked: new above it at full ink, what you have seen below it, dimmed.',
          recommended: true,
          demo: (
            <div className="pd-feed">
              <Find />
              <ol>
                {EVENTS.filter((e) => !e.seen).map((e) => (
                  <Line key={e.when + e.what} e={e} />
                ))}
                <li className="pd-since" aria-label="Seen before 09:12">
                  <span>Seen</span>
                </li>
                {EVENTS.filter((e) => e.seen).map((e) => (
                  <Line key={e.when + e.what} e={e} />
                ))}
              </ol>
            </div>
          ),
        },
        {
          name: 'Digest',
          from: 'a shift handover note',
          note: 'Grouped by thing: "Supplier list: Sam edited and shared it". Each group opens to its raw lines for the trail. Quickest catch-up, one step from the detail.',
          demo: (
            <div className="pd-feed">
              <Find />
              <ol>
                <li className="pd-digest" data-needs>
                  <b>Q3 procurement plan</b>
                  <span>Priya asked you to approve · Lee approved the budget</span>
                </li>
                <li className="pd-digest">
                  <b>Supplier list</b>
                  <span>Sam Ortiz edited and shared it · 2 events</span>
                </li>
                <li className="pd-digest" data-seen>
                  <b>Q2 plan</b>
                  <span>Lee Park archived it · Mon</span>
                </li>
              </ol>
            </div>
          ),
        },
      ]}
    />
  ),
};

/** 6. What needs you, in the feed. */
export const NeedsYou: Story = {
  name: '6 Needs you in the feed',
  render: () => (
    <Decision
      n={6}
      question="Where does what needs you sit in the feed?"
      why="A request to approve is both an event and something waiting on you. Green marks it either way."
      options={[
        {
          name: 'Pulled above',
          from: 'an in-tray beside the post',
          note: 'Asks leave the flow and wait in a short strip above it until done; the feed below is only what happened.',
          recommended: true,
          demo: (
            <div className="pd-feed">
              <div className="pd-ask">
                <p className="pd-label">Needs you · 1</p>
                <p>
                  <b>Priya Shah</b> asked you to approve <u>Q3 procurement plan</u>
                </p>
              </div>
              <ol>
                {EVENTS.slice(1, 4).map((e) => (
                  <Line key={e.when + e.what} e={e} />
                ))}
              </ol>
            </div>
          ),
        },
        {
          name: 'In place',
          from: 'a highlighted line in a diary',
          note: 'Asks stay where they happened, in time order, with a green edge. Nothing moves, but an old ask can sink out of view.',
          demo: (
            <div className="pd-feed">
              <ol>
                {EVENTS.slice(0, 4).map((e) => (
                  <Line key={e.when + e.what} e={e} />
                ))}
              </ol>
            </div>
          ),
        },
        {
          name: 'Count and jump',
          from: 'tabbed pages in a ring binder',
          note: 'Asks stay in place, and a green count at the top jumps from one to the next.',
          demo: (
            <div className="pd-feed">
              <p className="pd-jump">
                <span>1 needs you</span> Next <Icon name="arrow" size={14} aria-hidden />
              </p>
              <ol>
                {EVENTS.slice(0, 4).map((e) => (
                  <Line key={e.when + e.what} e={e} />
                ))}
              </ol>
            </div>
          ),
        },
      ]}
    />
  ),
};

/** 7. Presence. */
export const Presence: Story = {
  name: '7 Presence',
  render: () => {
    const people = [
      { name: 'Sam Ortiz', here: true, words: 'Here' },
      { name: 'Priya Shah', here: true, words: 'Here' },
      { name: 'Lee Park', here: false, words: '2h ago' },
    ];
    return (
      <Decision
        n={7}
        question="How do you see who is here now?"
        why="Presence can't be green (that is 'needs you'), and depth in the kit is dimming only."
        options={[
          {
            name: 'Dot',
            from: 'an on-air light',
            note: 'A small ink dot on the corner of the mark while they are here; nothing when they are not.',
            demo: (
              <div className="pd-stack">
                {people.map((p) => (
                  <span key={p.name} className="pd-who">
                    <Mark name={p.name} look="disc" dot={p.here} />
                    <span>{p.name}</span>
                  </span>
                ))}
              </div>
            ),
          },
          {
            name: 'Dim',
            from: 'a theatre’s house lights',
            note: 'Who is here is at full ink; who is away is dimmed back, mark and name. No extra sign, just the kit’s one depth move.',
            recommended: true,
            demo: (
              <div className="pd-stack">
                {people.map((p) => (
                  <span key={p.name} className="pd-who" data-dim={!p.here || undefined}>
                    <Mark name={p.name} look="disc" />
                    <span>{p.name}</span>
                  </span>
                ))}
              </div>
            ),
          },
          {
            name: 'Words',
            from: 'an in/out board in a lobby',
            note: 'A mono word beside the name: HERE, or how long since. Says the most, takes the most room.',
            demo: (
              <div className="pd-stack">
                {people.map((p) => (
                  <span key={p.name} className="pd-who">
                    <Mark name={p.name} look="disc" />
                    <span>{p.name}</span>
                    <span className="pd-presence-word">{p.words}</span>
                  </span>
                ))}
              </div>
            ),
          },
        ]}
      />
    );
  },
};

const NOTES = [
  { who: 'Priya Shah', what: 'asked you to approve Q3 procurement plan', when: '11:40', needs: true, unread: true },
  { who: 'Sam Ortiz', what: 'replied to your point on Supplier list', when: '10:20', unread: true },
  { who: 'Lee Park', what: 'shared Q2 plan with your team', when: 'Mon' },
];

/** 8. A notification item. */
export const Notification: Story = {
  name: '8 Notification item',
  render: () => (
    <Decision
      n={8}
      question="What does one notification look like?"
      why="The same item shows in the app bar's notifications and in an app's own list. Unread has to read without colour, because green is only for what needs you."
      options={[
        {
          name: 'Stamp line',
          from: 'a date stamp on incoming post',
          note: 'Like the Stamp notice: a mono stamp word, then the sentence. Unread has an ink edge on the left; read is dimmed.',
          demo: (
            <ul className="pd-notes" data-look="stamp">
              {NOTES.map((n) => (
                <li key={n.what} data-needs={n.needs || undefined} data-unread={n.unread || undefined}>
                  <span className="pd-stamp">{n.needs ? 'Needs you' : n.unread ? 'New' : n.when}</span>
                  <span>
                    <b>{n.who}</b> {n.what}
                  </span>
                </li>
              ))}
            </ul>
          ),
        },
        {
          name: 'Key row',
          from: 'a card-index drawer',
          note: 'Rows in a well like the Key list, each with the person’s mark. Unread rows are raised as soft keys; read ones sit flat in the well.',
          recommended: true,
          demo: (
            <ul className="pd-notes" data-look="key">
              {NOTES.map((n) => (
                <li key={n.what} data-needs={n.needs || undefined} data-unread={n.unread || undefined}>
                  <Mark name={n.who} look="disc" size="sm" />
                  <span>
                    <b>{n.who}</b> {n.what}
                  </span>
                  <span className="pd-time">{n.when}</span>
                </li>
              ))}
            </ul>
          ),
        },
        {
          name: 'Slip',
          from: 'a message slip on a spike',
          note: 'Each one a small square sheet with one edge, stacked with a gap. Read slips dim back. The most separate; takes the most height.',
          demo: (
            <ul className="pd-notes" data-look="slip">
              {NOTES.map((n) => (
                <li key={n.what} data-needs={n.needs || undefined} data-unread={n.unread || undefined}>
                  <span className="pd-time">{n.when}</span>
                  <span>
                    <b>{n.who}</b> {n.what}
                  </span>
                </li>
              ))}
            </ul>
          ),
        },
      ]}
    />
  ),
};

/** 9. The people picker's choices. */
export const Picker: Story = {
  name: '9 People picker choices',
  render: () => {
    const chosen = TEAM.slice(1, 4);
    const field = (
      <p className="pd-field">
        <Icon name="find" size={14} aria-hidden /> Add a person or team
      </p>
    );
    return (
      <Decision
        n={9}
        question="How do the people you have picked show?"
        why="When sharing, you pick several people and teams. Today they gather above the field as rounded chips."
        options={[
          {
            name: 'Tags',
            from: 'name tags on a seating plan',
            note: 'Each choice a small square tag with its mark, name and a remove key, above the field. Compact; long names cut short.',
            demo: (
              <div className="pd-stack">
                <p className="pd-tags">
                  {chosen.map((p) => (
                    <span key={p.name} className="pd-tag">
                      <Mark name={p.name} look="disc" size="sm" /> {p.name} <Icon name="close" size={12} aria-hidden />
                    </span>
                  ))}
                </p>
                {field}
              </div>
            ),
          },
          {
            name: 'List in a well',
            from: 'a guest list on a clipboard',
            note: 'Choices as rows under the field, in a well, with their floor and what they can do ("Can read"). Says the most; best when access matters.',
            recommended: true,
            demo: (
              <div className="pd-stack">
                {field}
                <ul className="pd-picked">
                  {chosen.map((p) => (
                    <li key={p.name}>
                      <Who look="disc" {...p} />
                      <span className="pd-time">Can read</span>
                      <Icon name="close" size={14} aria-hidden />
                    </li>
                  ))}
                </ul>
              </div>
            ),
          },
          {
            name: 'Marks row',
            from: 'faces in a group photo',
            note: 'Choices as a row of marks with the names in one line under them; remove from each mark’s menu. Smallest, but names are second.',
            demo: (
              <div className="pd-stack">
                {field}
                <p className="pd-group">
                  {chosen.map((p) => (
                    <Mark key={p.name} name={p.name} look="disc" floor={p.floor} />
                  ))}
                </p>
                <p className="pd-small">{chosen.map((p) => p.name).join(', ')}</p>
              </div>
            ),
          },
        ]}
      />
    );
  },
};
