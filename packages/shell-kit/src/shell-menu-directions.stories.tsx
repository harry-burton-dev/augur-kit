import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Button, Icon, Progress, Status, Toggle, type StatusName } from '@augur/kit-common';
import { arcOrder, arcSlot } from './shell-menu.js';
import { sampleAgents, sampleApps, sampleFunctions, sampleKeys, sampleNotifications } from './shell-menu.fixture.js';
import type { AgentStatus } from './shell-model.js';
import './shell-menu-directions.stories.css';

/**
 * Round Q directions (6 Nov 2026): the summoned shell menu and the band, in three original directions to
 * pick from. What Harry has settled holds in all three: the arc stays, with the stream at its top; depth is
 * dimming only; green means only "needs you"; corners are square except true circles; nothing scrolls.
 * AgentMark becomes Common's Status, MenuRetry a Common Button, and MenuNote a Common sentence in each look.
 * The loading placeholder waits for Round E's pick, so it is drawn plainly here.
 *
 * Each direction also answers the questions Harry left open, differently, so the pick decides them:
 *
 * | | A · Shade | B · Keybed | C · Rule |
 * |---|---|---|---|
 * | Opens on | What needs you (the stream) | Your apps | Find, already typing |
 * | Opening feel | A solid sheet drops under the arc | Keys rise along the arc, views are trays | Nothing boxed: drawn on the ground, on lines |
 * | A notification | Acts where it sits (its keys on the row) | Opens what it's about; x dismisses | Acts where it sits, in words |
 * | Green stays until | You act on it or dismiss it | You open it | You act on it; dismissing asks once |
 * | Apps | Rows in the sheet | Keys with 1 to 9 on them | A ruled index |
 * | Floor gauge | Square notches on a hairline | A stack of small keys | A ruler with ticks |
 * | Connection | A Sheet strip under the band | A key on the band | The band's line breaks |
 * | Can't open | A sheet with the reason | The app's key, held or dead | The name on the horizon |
 *
 * This page goes away once one is picked; the pick is built into the shell menu's parts and their story pages.
 */
const meta = {
  title: 'Aerie/Directions/Shell menu and band',
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;

type Look = 'a' | 'b' | 'c';
type ViewId = 'stream' | 'apps' | 'find' | 'agents' | 'account' | 'settings';
const LOOKS: { id: Look; name: string; from: string; lead: ViewId }[] = [
  { id: 'a', name: 'A · Shade', lead: 'stream', from: 'From Sheet and Stamp. Opens on what needs you. Nearest prior art: a window shade pulled down over a desk.' },
  { id: 'b', name: 'B · Keybed', lead: 'apps', from: 'From Keycap and Key. Opens on your apps. Nearest prior art: an instrument’s keybed and a launch pad.' },
  { id: 'c', name: 'C · Rule', lead: 'find', from: 'From Horizon’s line. Opens on Find, already typing. Nearest prior art: a ruled ledger and a surveyor’s staff.' },
];
const lookOf = (id: Look) => LOOKS.find((l) => l.id === id)!;

const TITLES: Record<ViewId, string> = { stream: 'Notifications', apps: 'Apps', find: 'Find', agents: 'Agents', account: 'Account', settings: 'Settings' };
const agentStatus: Record<AgentStatus, StatusName> = { needs: 'needs', failed: 'failed', running: 'running', waiting: 'queued', done: 'done', idle: 'paused' };
const allNotes = sampleNotifications.flatMap((g) => g.list.map((n) => ({ ...n, app: g.app })));
const needsCount = allNotes.filter((n) => n.level === 'needs').length;

const FLOORS = [
  { id: 'org', name: 'Example Org', icon: 'org', meaning: 'Everyone in the organisation', waiting: 2 },
  { id: 'dept', name: 'Example Department', icon: 'department', meaning: 'Everyone in the department', here: true },
  { id: 'team', name: 'Harbour team', icon: 'people', meaning: 'The six of you' },
  { id: 'you', name: 'Your own floor', icon: 'account', meaning: 'Only you' },
];

/* ---------- the arc, three ways ---------- */

function Arc({ look, lit, onOpen }: { look: Look; lit: ViewId; onOpen: (id: ViewId) => void }) {
  const order = arcOrder(sampleFunctions.map((f) => f.id));
  const stream = order.indexOf('stream');
  return (
    <div className="smd-arc" data-look={look}>
      {look === 'c' ? (
        <svg className="smd-arc-line" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 10 Q50 -10 100 10" />
        </svg>
      ) : null}
      {order.map((id, i) => {
        const slot = arcSlot(i, stream, order.length);
        const style = { '--x': `calc(${slot} * min(96px, 13vw))`, '--y': `calc(${slot * slot} * var(--space-2))`, '--i': Math.abs(i - stream) } as CSSProperties;
        const on = lit === id;
        if (id === 'stream') {
          return (
            <button key={id} className="smd-fn smd-stream" data-lit={on ? '' : undefined} data-needs="" style={style} aria-label={`Notifications: ${needsCount} needs you`} onClick={() => onOpen('stream')}>
              {look === 'a' ? <span className="smd-orb" aria-hidden="true"><i /></span> : null}
              {look === 'b' ? <span className="smd-count">{needsCount}</span> : null}
              {look === 'c' ? <span className="smd-count">{needsCount} needs you</span> : null}
            </button>
          );
        }
        const fn = sampleFunctions.find((f) => f.id === id)!;
        return (
          <button key={id} className="smd-fn" data-lit={on ? '' : undefined} style={style} aria-label={fn.label} onClick={() => onOpen(fn.id as ViewId)}>
            <Icon name={fn.icon} size={20} />
            {look !== 'a' ? <span className="smd-fn-name">{fn.label}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- notifications, three behaviours ---------- */

function Stream({ look }: { look: Look }) {
  const [done, setDone] = useState<Record<string, string>>({});
  const [gone, setGone] = useState<string[]>([]);
  const [asking, setAsking] = useState<string | null>(null);
  const act = (id: string, word: string) => setDone((d) => ({ ...d, [id]: word }));
  const undo = (id: string) => setDone(({ [id]: _, ...rest }) => rest);
  return (
    <div className="smd-stream-view" data-look={look}>
      {sampleNotifications.map((g) => (
        <section key={g.app} className="smd-group">
          <h3 className="smd-label">
            {g.app} <span className="smd-num">{g.list.length}</span>
          </h3>
          <ul className="smd-list">
            {g.list
              .filter((n) => !gone.includes(n.id))
              .map((n) => {
                const result = done[n.id];
                const needs = n.level === 'needs' && !result;
                return (
                  <li key={n.id} className="smd-note" data-needs={needs ? '' : undefined} data-done={result ? '' : undefined}>
                    {look === 'b' ? (
                      <button className="smd-note-key" onClick={() => act(n.id, 'Opened')} onKeyDown={(e) => e.key.toLowerCase() === 'x' && setGone((x) => [...x, n.id])}>
                        <span className="smd-text">
                          <b>{n.title}</b>
                          <span>{result ? `${result} in ${g.app}` : n.detail}</span>
                        </span>
                        <span className="smd-meta">{n.when}</span>
                        {needs ? <span className="smd-needs-word">Needs you</span> : null}
                      </button>
                    ) : (
                      <>
                        <span className="smd-text">
                          <b>{n.title}</b>
                          <span>{result ? `${result}.` : n.detail}</span>
                        </span>
                        <span className="smd-meta">{n.when}</span>
                        {result ? (
                          <button className="smd-word" onClick={() => undo(n.id)}>Undo</button>
                        ) : look === 'a' ? (
                          <span className="smd-acts">
                            {(n.actions ?? [{ label: 'Done' }]).map((a, i) => (
                              <Button key={a.label} size="sm" kind={i === 0 && needs ? 'primary' : 'secondary'} onPress={() => act(n.id, a.label === 'Later' ? 'Back tomorrow at 9' : a.label === 'Open' ? 'Opened' : 'Done')}>
                                {a.label}
                              </Button>
                            ))}
                            <button className="smd-x" aria-label={`Dismiss ${n.title}`} onClick={() => setGone((x) => [...x, n.id])}>
                              <Icon name="close" size={16} />
                            </button>
                          </span>
                        ) : asking === n.id ? (
                          <span className="smd-acts smd-ask">
                            Still needs you. Dismiss anyway?
                            <button className="smd-word" onClick={() => setGone((x) => [...x, n.id])}>Dismiss</button>
                            <button className="smd-word" onClick={() => setAsking(null)}>Keep</button>
                          </span>
                        ) : (
                          <span className="smd-acts">
                            {(n.actions ?? []).map((a) => (
                              <button key={a.label} className="smd-word" onClick={() => act(n.id, a.label === 'Later' ? 'Back tomorrow at 9' : 'Opened')}>{a.label}</button>
                            ))}
                            <button className="smd-word" onClick={() => (needs ? setAsking(n.id) : setGone((x) => [...x, n.id]))}>Dismiss</button>
                          </span>
                        )}
                      </>
                    )}
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
      <p className="smd-hint">
        {look === 'a' ? 'Act on the row. Green stays until you act on it or dismiss it.' : look === 'b' ? 'Press a row to open what it’s about; x dismisses. Green stays until you open it.' : 'Act on the row in words. Green stays until you act; dismissing something that needs you asks once.'}
      </p>
    </div>
  );
}

/* ---------- the other views ---------- */

function Apps({ look }: { look: Look }) {
  return (
    <ul className="smd-apps" data-look={look} aria-label="Apps">
      {sampleApps.map((a, i) => (
        <li key={a.id}>
          <button className="smd-app" data-now={i === 0 ? '' : undefined}>
            {look === 'b' ? <kbd className="smd-app-num">{i + 1}</kbd> : null}
            <Icon name={a.icon} size={look === 'b' ? 24 : 20} />
            <b>{a.name}</b>
            <span>{i === 0 ? 'Open now' : a.line}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

const FOUND = [
  { title: 'Budget draft', where: 'Documents' },
  { title: 'Budget checker', where: 'Agent' },
  { title: 'Review the budget draft', where: 'Notification' },
  { title: 'Harbour budget 2027', where: 'Data Atlas' },
];

function Find({ look, autoFocus }: { look: Look; autoFocus?: boolean }) {
  const [q, setQ] = useState(look === 'c' ? '' : 'bud');
  const found = q.trim() ? FOUND.filter((f) => f.title.toLowerCase().includes(q.trim().toLowerCase())) : [];
  return (
    <div className="smd-find" data-look={look}>
      <div className="smd-search">
        {look === 'c' ? <span className="smd-label">Find</span> : <Icon name="find" size={20} />}
        <input type="search" aria-label="Find across apps, notifications and agents" placeholder={look === 'c' ? 'Type a name, a person, anything' : 'Find apps, notifications, agents'} value={q} autoFocus={autoFocus} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && setQ('')} />
        {look === 'b' ? <kbd className="smd-cap">Enter</kbd> : null}
        {look === 'c' && q.trim() ? <span className="smd-num">{found.length} found</span> : null}
      </div>
      {q.trim() && !found.length ? <p className="smd-sentence">Nothing called “{q.trim()}”.</p> : null}
      {!q.trim() && look === 'c' ? <p className="smd-sentence">Searches as you type: apps, notifications, agents, and what your floors keep.</p> : null}
      <ul className="smd-list">
        {found.map((f) => (
          <li key={f.title}>
            <button className="smd-row">
              <b>{f.title}</b>
              <span className="smd-meta">{f.where}</span>
            </button>
          </li>
        ))}
      </ul>
      {q.trim() ? (
        <p className="smd-sentence smd-busy" aria-busy="true">
          <span className="smd-placeholder" aria-hidden="true" />
          Still looking in Data Atlas.
        </p>
      ) : null}
    </div>
  );
}

function Agents({ look }: { look: Look }) {
  return (
    <ul className="smd-list" data-look={look} aria-label="Agents">
      {sampleAgents.map((a, i) => (
        <li key={a.id}>
          <button className="smd-row">
            <span className="smd-text">
              <b>{a.name}</b>
              <span>{a.detail}</span>
            </span>
            <Status status={agentStatus[a.status]} next={i === 0} />
          </button>
        </li>
      ))}
      <li>
        <p className="smd-sentence" role="alert">
          Weekly summary couldn’t send its last report.{' '}
          <Button size="sm" kind="secondary">Try again</Button>
        </p>
      </li>
    </ul>
  );
}

function Switch({ look, label, on, onToggle }: { look: Look; label: string; on: boolean; onToggle: () => void }) {
  if (look === 'a') return <Toggle label={label} checked={on} onChange={onToggle} />;
  if (look === 'b') {
    return (
      <div className="smd-pair">
        <span>{label}</span>
        <button className="smd-latch" aria-pressed={on} onClick={onToggle}>
          <i aria-hidden="true" />
          {on ? 'On' : 'Off'}
        </button>
      </div>
    );
  }
  return (
    <div className="smd-pair">
      <span>{label}</span>
      <button className="smd-flip" role="switch" aria-checked={on} aria-label={label} onClick={onToggle}>
        <span data-on={!on ? '' : undefined}>Off</span>
        <span data-on={on ? '' : undefined}>On</span>
      </button>
    </div>
  );
}

function Keys({ look }: { look: Look }) {
  return (
    <dl className="smd-keys" data-look={look}>
      {sampleKeys.map((k) => (
        <div key={k.keys}>
          <dt>{look === 'c' ? k.keys : k.keys.split(' ').map((p) => <kbd key={p} className="smd-cap">{p}</kbd>)}</dt>
          <dd>{k.does}</dd>
        </div>
      ))}
    </dl>
  );
}

function Settings({ look }: { look: Look }) {
  const [calm, setCalm] = useState(true);
  const [sounds, setSounds] = useState(false);
  return (
    <div className="smd-settings" data-look={look}>
      <Switch look={look} label="Calmer motion" on={calm} onToggle={() => setCalm(!calm)} />
      <Switch look={look} label="Sounds for what needs you" on={sounds} onToggle={() => setSounds(!sounds)} />
      <h3 className="smd-label">Keys</h3>
      <Keys look={look} />
    </div>
  );
}

function Account({ look }: { look: Look }) {
  const [away, setAway] = useState(false);
  return (
    <div className="smd-settings" data-look={look}>
      <p className="smd-who">
        <b>Sam Lee</b>
        <span>sam@example.org</span>
      </p>
      <Switch look={look} label="Show me as away" on={away} onToggle={() => setAway(!away)} />
      <Button kind="ghost" size="sm">Sign out</Button>
    </div>
  );
}

function View({ look, view }: { look: Look; view: ViewId }) {
  switch (view) {
    case 'stream':
      return <Stream look={look} />;
    case 'apps':
      return <Apps look={look} />;
    case 'find':
      return <Find look={look} autoFocus={look === 'c'} />;
    case 'agents':
      return <Agents look={look} />;
    case 'account':
      return <Account look={look} />;
    default:
      return <Settings look={look} />;
  }
}

/* ---------- the whole menu ---------- */

function Menu({ look, view: start }: { look: Look; view?: ViewId }) {
  const l = lookOf(look);
  const [view, setView] = useState<ViewId>(start ?? l.lead);
  useEffect(() => setView(start ?? l.lead), [start, l.lead]);
  return (
    <div className="smd-stage" data-look={look}>
      <div className="smd-app-behind" aria-hidden="true">
        <h1>Documents</h1>
        <p>The open app, behind the menu, dimmed.</p>
      </div>
      <div className="smd-dim" />
      <div className="smd-sky" role="dialog" aria-modal="true" aria-label="Shell">
        <Arc look={look} lit={view} onOpen={setView} />
        <p className="smd-caption">
          <b>{TITLES[view]}</b>
          {view === 'stream' ? <span data-needs="">{needsCount} needs you</span> : null}
        </p>
        <section className="smd-view" data-look={look} aria-label={TITLES[view]}>
          <View look={look} view={view} />
        </section>
        <p className="smd-esc">
          <kbd className="smd-cap">Esc</kbd> {view === l.lead ? 'Close' : 'Back'}
        </p>
      </div>
      <p className="smd-tag">
        <b>{l.name}</b> {l.from}
      </p>
    </div>
  );
}

type MenuStory = StoryObj<{ view?: ViewId }>;
const viewControl = { view: { control: 'inline-radio', options: ['stream', 'apps', 'find', 'agents', 'settings', 'account'], description: 'The view that’s open. Each direction opens on its own first.' } } as const;

/** A · Shade. The menu opens on what needs you, in a solid square sheet that drops under the arc over the dimmed app. A notification acts where it sits: its keys are on the row, and its green stays until you act on it or dismiss it. Press the arc to change view. */
export const AShade: MenuStory = { name: 'A · Shade', argTypes: viewControl, render: (args) => <Menu look="a" view={args.view} /> };
/** B · Keybed. The menu opens on your apps, as keys with 1 to 9 on them; the arc is a row of square keys and every view is a tray of keys. A notification is one key: pressing opens what it’s about, x dismisses, and its green stays until you open it. */
export const BKeybed: MenuStory = { name: 'B · Keybed', argTypes: viewControl, render: (args) => <Menu look="b" view={args.view} /> };
/** C · Rule. The menu opens on Find, already typing. Nothing is boxed: the arc stands on a curved line, and views are drawn on the ground with hairlines. A notification acts where it sits, in words; its green stays until you act, and dismissing one that needs you asks once. */
export const CRule: MenuStory = { name: 'C · Rule', argTypes: viewControl, render: (args) => <Menu look="c" view={args.view} /> };

/* ---------- parts side by side ---------- */

function Columns({ children }: { children: (look: Look) => ReactNode }) {
  return (
    <div className="smd-page">
      {LOOKS.map((l) => (
        <section key={l.id} className="smd-col" data-look={l.id} aria-labelledby={`smd-${l.id}`}>
          <header className="smd-head">
            <h2 id={`smd-${l.id}`} className="smd-label">{l.name}</h2>
            <p className="smd-from">{l.from}</p>
          </header>
          {children(l.id)}
        </section>
      ))}
    </div>
  );
}

const Part = ({ name, children }: { name: string; children: ReactNode }) => (
  <div className="smd-part">
    <h3 className="smd-part-name">{name}</h3>
    {children}
  </div>
);

/** The view parts side by side: notifications, apps, a row with an agent’s status, and settings with keys. */
export const PartsSideBySide: StoryObj = {
  name: 'Parts side by side',
  render: () => (
    <Columns>
      {(look) => (
        <>
          <Part name="Notifications">
            <div className="smd-view" data-look={look}>
              <Stream look={look} />
            </div>
          </Part>
          <Part name="Apps">
            <div className="smd-view" data-look={look}>
              <Apps look={look} />
            </div>
          </Part>
          <Part name="Settings, switches and keys">
            <div className="smd-view" data-look={look}>
              <Settings look={look} />
            </div>
          </Part>
        </>
      )}
    </Columns>
  ),
};

/** Find and agents side by side: the search field with results arriving, nothing found, still looking, and the agents’ Status from Common. */
export const FindAndAgents: StoryObj = {
  name: 'Find and agents side by side',
  render: () => (
    <Columns>
      {(look) => (
        <>
          <Part name="Find">
            <div className="smd-view" data-look={look}>
              <Find look={look} />
            </div>
          </Part>
          <Part name="Agents">
            <div className="smd-view" data-look={look}>
              <Agents look={look} />
            </div>
          </Part>
        </>
      )}
    </Columns>
  ),
};

/* ---------- the band: gauge, connection, can't open ---------- */

function Gauge({ look }: { look: Look }) {
  return (
    <nav className="smd-gauge" data-look={look} aria-label="Floors">
      <ol>
        {FLOORS.map((f) => (
          <li key={f.id}>
            <button className="smd-floor" aria-current={f.here ? 'location' : undefined} data-waiting={f.waiting ? '' : undefined}>
              <span className="smd-floor-words">
                <b>{f.name}</b>
                <span>{f.here ? 'You’re here' : f.waiting ? <em>{f.waiting} waiting</em> : f.meaning}</span>
              </span>
              <span className="smd-notch">
                {look === 'c' ? null : <Icon name={f.icon} size={14} />}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

const CONNECTION = {
  offline: 'You’re offline. What you do stays here and goes when you’re back.',
  expired: 'Your session ended. Sign in again to carry on; nothing you were doing is lost.',
};

function Connection({ look, state }: { look: Look; state: 'offline' | 'expired' }) {
  return (
    <div className="smd-band" data-look={look}>
      <span className="smd-band-name">AUGUR</span>
      <div className="smd-connection" data-state={state} role={state === 'expired' ? 'alert' : 'status'}>
        {look === 'b' ? <span className="smd-latch" data-static="">{state === 'offline' ? 'Offline' : 'Signed out'}</span> : null}
        <span>{CONNECTION[state]}</span>
        {state === 'expired' ? (
          look === 'c' ? <button className="smd-word">Sign in</button> : <Button size="sm" kind="primary">Sign in</Button>
        ) : null}
      </div>
    </div>
  );
}

const UNAVAILABLE = {
  failed: { title: 'Couldn’t open', reason: 'Data Atlas didn’t answer in time. Your work in other apps is fine.' },
  'needs-newer': { title: 'Needs a newer AUGUR', reason: 'Data Atlas 3 needs AUGUR 4.2. This deployment runs 4.1.' },
  loading: { title: 'Opening', reason: 'Data Atlas is starting.' },
};

function Unavailable({ look, state }: { look: Look; state: keyof typeof UNAVAILABLE }) {
  const u = UNAVAILABLE[state];
  return (
    <div className="smd-unavailable" data-look={look} data-state={state} aria-busy={state === 'loading' || undefined}>
      <span className="smd-unavailable-mark" aria-hidden="true">
        <Icon name="atlas" size={look === 'b' ? 32 : 24} />
      </span>
      <p className="smd-label">{u.title}</p>
      <h3 className="smd-unavailable-name">Data Atlas</h3>
      <p className="smd-sentence">{u.reason}</p>
      {state === 'needs-newer' ? <p className="smd-sentence smd-who-can">Your deployment admin can update it.</p> : null}
      {state === 'loading' ? <Progress label="Opening Data Atlas" /> : null}
      {state === 'failed' ? look === 'c' ? <button className="smd-word">Try again</button> : <Button size="sm" kind="secondary">Try again</Button> : null}
    </div>
  );
}

/** The band’s parts side by side: the floor gauge (opened out, as when you point at it), Connection offline and signed out, and an app that can’t open, failed, needing a newer AUGUR, and opening. */
export const BandSideBySide: StoryObj = {
  name: 'Band side by side',
  render: () => (
    <Columns>
      {(look) => (
        <>
          <Part name="Floor gauge">
            <Gauge look={look} />
          </Part>
          <Part name="Connection">
            <div className="smd-stack">
              <Connection look={look} state="offline" />
              <Connection look={look} state="expired" />
            </div>
          </Part>
          <Part name="Can’t open">
            <div className="smd-stack">
              <Unavailable look={look} state="failed" />
              <Unavailable look={look} state="needs-newer" />
              <Unavailable look={look} state="loading" />
            </div>
          </Part>
        </>
      )}
    </Columns>
  ),
};
