import { useState, type ReactNode } from 'react';
import { IconButton, Menu } from '@augur/kit-common';
import {
  AgentMark,
  AppTile,
  AppTiles,
  MenuArc,
  MenuCaption,
  MenuChoice,
  MenuEsc,
  MenuGroup,
  MenuKeys,
  MenuLink,
  MenuNote,
  MenuPair,
  MenuRow,
  MenuSearch,
  MenuSwitch,
  MenuTools,
  MenuView,
  MenuWho,
  NotificationRow,
  ShellMenu,
  type MenuArcItem,
  type MenuMood,
} from './shell-menu.js';
import type { AgentStatus, NotificationLevel } from './shell-model.js';

/*
 * Sample content for the shell menu's stories: the functions, notifications, apps and agents a
 * workspace might have, and the stages the parts are shown on. Names are examples. Not built.
 */

export const sampleFunctions: MenuArcItem[] = [
  { id: 'apps', label: 'Apps', icon: 'apps' },
  { id: 'find', label: 'Find', icon: 'find' },
  { id: 'agents', label: 'Agents', icon: 'agents' },
  { id: 'account', label: 'Account', icon: 'account' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

export const sampleNotifications: { app: string; list: { id: string; title: string; detail: string; when: string; level: NotificationLevel; actions?: { label: string }[] }[] }[] = [
  {
    app: 'Documents',
    list: [
      { id: 'n1', title: 'Review the budget draft', detail: 'Example Department · Due Friday', when: '10 min', level: 'needs', actions: [{ label: 'Open' }, { label: 'Later' }] },
      { id: 'n2', title: 'Sam shared the joining guidance', detail: 'Example Department', when: '1 h', level: 'info' },
    ],
  },
  { app: 'Home', list: [{ id: 'n3', title: 'Two new people on your floor', detail: 'Example Org', when: '2 h', level: 'info' }] },
];

export const sampleApps = [
  { id: 'docs', name: 'Documents', icon: 'document', line: 'What your floors keep' },
  { id: 'home', name: 'Home', icon: 'home', line: 'Where the day starts' },
  { id: 'atlas', name: 'Data Atlas', icon: 'atlas', line: 'What’s known, and where' },
  { id: 'helper', name: 'Helper', icon: 'agents', line: 'Ask about anything here', ai: true },
];

export const sampleAgents: { id: string; name: string; detail?: string; status: AgentStatus }[] = [
  { id: 'a1', name: 'Budget checker', detail: 'Wants you to confirm two lines', status: 'needs' },
  { id: 'a2', name: 'Inbox sorter', detail: 'Sorting 40 messages', status: 'running' },
  { id: 'a3', name: 'Weekly summary', detail: 'Wrote this week’s summary', status: 'done' },
];

export const sampleKeys = [
  { keys: '`', does: 'Open or close the shell (also Ctrl or ⌘ K)' },
  { keys: '← →', does: 'Move along the arc' },
  { keys: 'Enter', does: 'Open' },
  { keys: 'x', does: 'Dismiss a notification' },
  { keys: 'Esc', does: 'Back, then close' },
];

export const densities = [
  { id: 'comfortable', label: 'Comfortable' },
  { id: 'compact', label: 'Compact' },
];

/**
 * The Shell's root, as the menu draws inside it: open, on the still ground, with a minimal app behind.
 * It fills the window. `view` is the view that's showing, which steps the arc back.
 */
export function MenuStage({ open = true, view, height = '100vh', children }: { open?: boolean; view?: string; height?: number | string; children?: ReactNode }) {
  return (
    <div style={{ position: 'relative', height }}>
      <div className="aerie-shell" data-background="none" data-open={open ? '' : undefined} data-view={view}>
        <div className="aerie-ground" />
        <main className="aerie-stage" aria-label="Documents">
          <div style={{ padding: 'var(--space-6) var(--edge)' }}>
            <h1>Documents</h1>
            <p>The open app, behind the menu.</p>
          </div>
        </main>
        {children}
      </div>
    </div>
  );
}

/** One part on its own: inside the Shell's root, so it draws as it does in a view, at the view's measure. */
export function PartStage({ children }: { children?: ReactNode }) {
  return (
    <div className="aerie-shell" data-background="none" style={{ height: 'auto', minHeight: '100vh' }}>
      <div className="aerie-ground" />
      <div style={{ position: 'relative', padding: 'var(--space-6)', width: 'min(var(--measure-read), 100%)' }}>{children}</div>
    </div>
  );
}

/** The stream view, from the sample notifications. */
export function SampleStream() {
  const [muted, setMuted] = useState<string[]>([]);
  return (
    <>
      <MenuTools>
        <MenuLink>Clear the quiet ones</MenuLink>
      </MenuTools>
      {sampleNotifications.map(({ app, list }, g) => {
        const off = muted.includes(app);
        return (
          <div key={app}>
            <MenuGroup
              name={app}
              count={list.length}
              needs={!off && list.some((n) => n.level === 'needs')}
              muted={off}
              end={
                <Menu
                  label="App notifications"
                  placement="bottom end"
                  items={[off ? { id: 'unmute', label: `Unmute ${app}`, icon: 'bell' } : { id: 'mute', label: `Mute ${app}`, icon: 'mute' }]}
                  onAction={(id) => setMuted((m) => (id === 'mute' ? [...m, app] : m.filter((a) => a !== app)))}
                >
                  <IconButton icon="more" label={`${app}: more`} size="sm" />
                </Menu>
              }
            />
            <ul aria-label={app}>
              {list.map((n, i) => (
                <NotificationRow key={n.id} title={n.title} detail={n.detail} when={n.when} level={n.level} actions={n.actions} muted={off} first={g === 0 && i === 0} pinging={!off && g === 0 && i === 0} />
              ))}
            </ul>
          </div>
        );
      })}
    </>
  );
}

export function SampleApps() {
  return (
    <AppTiles>
      {sampleApps.map((a, i) => (
        <AppTile key={a.id} name={a.name} icon={a.icon} line={a.line} ai={a.ai} now={i === 0} first={i === 0} />
      ))}
    </AppTiles>
  );
}

export function SampleFind() {
  const [q, setQ] = useState('bud');
  const found = q ? [{ id: 'r1', title: 'Budget draft', detail: 'Documents' }, { id: 'r2', title: 'Budget checker', detail: 'Agent' }].filter((r) => r.title.toLowerCase().includes(q.toLowerCase())) : [];
  return (
    <>
      <MenuSearch label="Find across apps, notifications and agents" placeholder="Find apps, notifications, agents…" value={q} onChange={setQ} />
      {q && !found.length ? <MenuNote>Nothing matches "{q}".</MenuNote> : null}
      <ul>
        {found.map((r) => (
          <li key={r.id}>
            <MenuRow title={r.title} detail={r.detail} />
          </li>
        ))}
      </ul>
      {q ? (
        <div>
          <MenuGroup name="Data Atlas" />
          <MenuNote small tone="looking">
            Still looking…
          </MenuNote>
        </div>
      ) : null}
    </>
  );
}

export function SampleAgents() {
  return (
    <ul>
      {sampleAgents.map((a, i) => (
        <li key={a.id}>
          <MenuRow title={a.name} detail={a.detail} end={<AgentMark status={a.status} next={i === 0} />} />
        </li>
      ))}
    </ul>
  );
}

export function SampleAccount() {
  const [away, setAway] = useState(false);
  return (
    <>
      <MenuWho name="Sam Lee" detail="sam@example.org" />
      <MenuGroup name="Floors" />
      <ul className="aerie-floors">
        <li>
          <MenuRow icon="account" title="Your own floor" detail="Only you see what’s here." />
        </li>
        <li>
          <MenuRow icon="department" current title={<>Example Department<i> in Example Org</i></>} detail="Department. Everyone in it sees what’s here." meta="You’re here" />
        </li>
        <li>
          <MenuRow icon="org" title="Example Org" detail="Everyone in the organisation sees what’s here." meta="2 waiting" />
        </li>
      </ul>
      <MenuPair label="Show me as away" labelId="sample-away">
        <MenuSwitch labelledBy="sample-away" on={away} onToggle={() => setAway(!away)} />
      </MenuPair>
      <MenuPair>
        <span />
        <MenuLink>Sign out</MenuLink>
      </MenuPair>
    </>
  );
}

export function SampleSettings() {
  const [motion, setMotion] = useState(false);
  const [density, setDensity] = useState('comfortable');
  return (
    <>
      <MenuPair label="Reduce motion" labelId="sample-rm">
        <MenuSwitch labelledBy="sample-rm" on={motion} onToggle={() => setMotion(!motion)} />
      </MenuPair>
      <MenuPair label="Density">
        <MenuChoice label="Density" options={densities} value={density} onChange={setDensity} />
      </MenuPair>
      <MenuPair label="Version" value="0.14.0" version />
      <MenuGroup name="Keys" />
      <MenuKeys keys={sampleKeys} />
    </>
  );
}

export const sampleViews: Record<string, () => ReactNode> = {
  stream: () => <SampleStream />,
  apps: () => <SampleApps />,
  find: () => <SampleFind />,
  agents: () => <SampleAgents />,
  account: () => <SampleAccount />,
  settings: () => <SampleSettings />,
};

const titles: Record<string, string> = { stream: '1 needs you', apps: 'Apps', find: 'Find', agents: 'Agents', account: 'Account', settings: 'Settings' };

/**
 * The whole menu put together the way the Shell does, from the sample content: press a function on the
 * arc to open its view, and Esc or the sky to go back. `start` is the view it opens on.
 */
export function SampleMenu({ start, mood = 'needs', items = sampleFunctions, open = true }: { start?: string; mood?: MenuMood; items?: MenuArcItem[]; open?: boolean }) {
  const [view, setView] = useState<string | undefined>(start);
  const back = () => setView(undefined);
  const title = view ? titles[view] ?? view : '1 needs you';
  return (
    <MenuStage open={open} view={view}>
      <ShellMenu open={open} mood={mood} onDismiss={back} onKeyDown={(e) => e.key === 'Escape' && back()}>
        <MenuArc items={items} lit={view} mood={mood} streamLabel="Notifications: 1 needs you" onOpen={setView} />
        {view && view !== 'stream' ? <MenuCaption title={title} /> : <MenuCaption title={title} line="Review the budget draft" mood={mood} />}
        {view ? <MenuView label={title}>{sampleViews[view]?.()}</MenuView> : null}
        <MenuEsc back={!!view} onPress={back} />
      </ShellMenu>
    </MenuStage>
  );
}
