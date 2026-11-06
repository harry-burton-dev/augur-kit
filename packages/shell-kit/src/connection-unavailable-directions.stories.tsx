import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Button, Icon, Person, Progress } from '@augur/kit-common';
import './connection-unavailable-directions.stories.css';

/**
 * Connection and AppUnavailable directions (6 Nov 2026): three original looks to pick from. The shell menu
 * and the floor gauge stay as they are (the gauge gets its own redesign later, PER-347). What holds in all
 * three: the words stay the same and say what happened, what's kept, and who can change it; green is never
 * used, because nothing here needs you to decide; depth is dimming only; corners are square.
 *
 * - **A · Notice** grows from Sheet and Stamp: Connection is a solid strip under the band with its state
 *   stamped in mono, and an app that can't open is a sheet at the decision measure.
 * - **B · Key** grows from Keycap and Key: Connection is a key on the band that names the state, with the
 *   sentence in a well beside it; an app that can't open is its own key, held down while it opens and
 *   hollow when it can't.
 * - **C · Line** grows from Horizon's line: Connection breaks the band's own line (dashed offline, running
 *   while it reconnects), and an app that can't open writes its name on the horizon.
 *
 * This page goes away once one is picked; the pick is built into Connection and AppUnavailable.
 */
const meta = {
  title: 'Aerie/Directions/Connection and can’t open',
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;

type Look = 'a' | 'b' | 'c';
const LOOKS: { id: Look; name: string; from: string }[] = [
  { id: 'a', name: 'A · Notice', from: 'From Sheet and Stamp. Nearest prior art: a printed notice pinned under a shop counter.' },
  { id: 'b', name: 'B · Key', from: 'From Keycap and Key. Nearest prior art: a lit or locked key on a control panel.' },
  { id: 'c', name: 'C · Line', from: 'From Horizon’s line. Nearest prior art: a signal trace on a monitor, and a station name on a platform.' },
];

/* ---------- Connection ---------- */

type ConnState = 'offline' | 'reconnecting' | 'expired';
const CONN: Record<ConnState, { stamp: string; words: string }> = {
  offline: { stamp: 'Offline', words: 'You’re offline. What you do stays here and goes when you’re back.' },
  reconnecting: { stamp: 'Reconnecting', words: 'Reconnecting. What you do stays here meanwhile.' },
  expired: { stamp: 'Signed out', words: 'Your session ended. Sign in again to carry on; nothing you were doing is lost.' },
};

function Connection({ look, state }: { look: Look; state: ConnState }) {
  const c = CONN[state];
  const signIn = state === 'expired' ? (look === 'c' ? <button className="cud-word">Sign in</button> : <Button size="sm" kind="primary">Sign in</Button>) : null;
  return (
    <div className="cud-band" data-look={look} data-state={state}>
      <span className="cud-band-name">AUGUR</span>
      <span className="cud-band-fill" />
      {look === 'c' ? <span className="cud-line" aria-hidden="true" /> : null}
      <div className="cud-connection" role={state === 'expired' ? 'alert' : 'status'}>
        {look === 'b' ? (
          <span className="cud-key" data-held={state === 'reconnecting' ? '' : undefined}>
            <Icon name={state === 'expired' ? 'lock' : 'network'} size={16} />
            {c.stamp}
          </span>
        ) : (
          <span className="cud-stamp">{c.stamp}</span>
        )}
        <span className="cud-words">{c.words}</span>
        {signIn}
      </div>
    </div>
  );
}

/* ---------- AppUnavailable ---------- */

type AppState = 'loading' | 'failed' | 'needs-newer' | 'limited';
const APP: Record<AppState, { title: string; reason: string; who?: ReactNode; retry?: boolean }> = {
  loading: { title: 'Opening', reason: 'Data Atlas is starting.' },
  failed: { title: 'Couldn’t open', reason: 'Its files didn’t load from the server. Your work in other apps is fine.', retry: true },
  'needs-newer': { title: 'Needs a newer AUGUR', reason: 'Data Atlas 3 needs AUGUR 4.2. This deployment runs 4.1.', who: <Person name="Ana Ruiz" detail="Deployment admin, can update AUGUR" tone="org" /> },
  limited: { title: 'Not on this floor', reason: 'It’s only on department floors. Move to a department’s floor to open it.', who: <Person name="Lee Park" detail="Organisation admin, can change this" tone="org" /> },
};

function Unavailable({ look, state }: { look: Look; state: AppState }) {
  const u = APP[state];
  const retry = u.retry ? look === 'c' ? <button className="cud-word">Try again</button> : <Button size="sm" kind="secondary">Try again</Button> : null;
  return (
    <div className="cud-app" data-look={look} data-state={state} aria-busy={state === 'loading' || undefined}>
      {look !== 'c' ? (
        <span className="cud-mark" aria-hidden="true">
          <Icon name="atlas" size={look === 'b' ? 32 : 24} />
        </span>
      ) : null}
      <p className="cud-stamp">{u.title}</p>
      <h3 className="cud-name">Data Atlas</h3>
      {look === 'c' ? <span className="cud-horizon" aria-hidden="true" /> : null}
      <p className="cud-reason">{u.reason}</p>
      {state === 'loading' ? <Progress label="Opening Data Atlas" /> : null}
      {u.who ? <div className="cud-who">{u.who}</div> : null}
      {retry}
    </div>
  );
}

/* ---------- pages ---------- */

function Columns({ children }: { children: (look: Look) => ReactNode }) {
  return (
    <div className="cud-page">
      {LOOKS.map((l) => (
        <section key={l.id} className="cud-col" aria-labelledby={`cud-${l.id}`}>
          <header className="cud-head">
            <h2 id={`cud-${l.id}`} className="cud-label">{l.name}</h2>
            <p className="cud-from">{l.from}</p>
          </header>
          {children(l.id)}
        </section>
      ))}
    </div>
  );
}

const Part = ({ name, children }: { name: string; children: ReactNode }) => (
  <div className="cud-part">
    <h3 className="cud-part-name">{name}</h3>
    {children}
  </div>
);

/** Connection in each look: offline, reconnecting, and signed out. Nothing shows while all is well. */
export const ConnectionSideBySide: StoryObj = {
  name: 'Connection side by side',
  render: () => (
    <Columns>
      {(look) => (
        <>
          <Part name="Offline">
            <Connection look={look} state="offline" />
          </Part>
          <Part name="Reconnecting">
            <Connection look={look} state="reconnecting" />
          </Part>
          <Part name="Signed out">
            <Connection look={look} state="expired" />
          </Part>
        </>
      )}
    </Columns>
  ),
};

/** An app that can’t show yet, in each look: couldn’t open, needs a newer AUGUR, and not on this floor. */
export const CantOpenSideBySide: StoryObj = {
  name: 'Can’t open side by side',
  render: () => (
    <Columns>
      {(look) => (
        <>
          <Part name="Couldn’t open">
            <Unavailable look={look} state="failed" />
          </Part>
          <Part name="Needs a newer AUGUR">
            <Unavailable look={look} state="needs-newer" />
          </Part>
          <Part name="Not on this floor">
            <Unavailable look={look} state="limited" />
          </Part>
        </>
      )}
    </Columns>
  ),
};

/** Opening, in each look. */
export const OpeningSideBySide: StoryObj = {
  name: 'Opening side by side',
  render: () => <Columns>{(look) => <Unavailable look={look} state="loading" />}</Columns>,
};

function InPlace({ look }: { look: Look }) {
  const l = LOOKS.find((x) => x.id === look)!;
  return (
    <div className="cud-stage">
      <Connection look={look} state="offline" />
      <main className="cud-stage-main">
        <Unavailable look={look} state="failed" />
      </main>
      <p className="cud-tag">
        <b>{l.name}</b> {l.from}
      </p>
    </div>
  );
}

/** A · Notice in place: offline under the band, and an app that couldn’t open on the stage. */
export const ANotice: StoryObj = { name: 'A · Notice in place', render: () => <InPlace look="a" /> };
/** B · Key in place. */
export const BKey: StoryObj = { name: 'B · Key in place', render: () => <InPlace look="b" /> };
/** C · Line in place. */
export const CLine: StoryObj = { name: 'C · Line in place', render: () => <InPlace look="c" /> };
