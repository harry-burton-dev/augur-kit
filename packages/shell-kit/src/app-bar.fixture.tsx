import { useEffect, useState } from 'react';
import { AppBar, BarDivider, BarTile, StartMenuDivider, StartMenuFolder, StartMenuItem, RailBlock, RailPages, RailPair, useAppBar, type AppBarProps } from './app-bar.js';

/*
 * Sample content for the app bar's stories, from Harry's app bar mockup. Names are examples. It also
 * shows how the shell puts the parts together: groups as tiles (or one Apps tile holding them as
 * folders), More for what doesn't fit, open apps after a divider, and the rail when an app is open.
 */

export interface SampleApp {
  id: string;
  name: string;
  icon: string;
  line?: string;
  off?: string;
}
export interface SampleGroup {
  id: string;
  name: string;
  icon: string;
  line?: string;
  apps: SampleApp[];
}

export const GROUPS: SampleGroup[] = [
  { id: 'work', name: 'Work', icon: 'work', line: 'What you’re doing, and why', apps: [
    { id: 'home', name: 'Home', icon: 'home', line: 'Your day on this floor' },
    { id: 'mandate', name: 'Mandate', icon: 'compass', line: 'What we’re trying to do' },
  ] },
  { id: 'context', name: 'Context', icon: 'context', line: 'What’s known, and what it’s about', apps: [
    { id: 'artifacts', name: 'Artifacts', icon: 'library', line: 'What your floors keep' },
    { id: 'atlas', name: 'Atlas', icon: 'atlas', line: 'What it’s all about', off: 'Off on this floor. An organisation admin can turn it on.' },
  ] },
  { id: 'platform', name: 'Platform', icon: 'server', line: 'Running this deployment', apps: [
    { id: 'explorer', name: 'Explorer', icon: 'folder-tree', line: 'Everything, by place' },
    { id: 'admin', name: 'Admin', icon: 'admin', line: 'People, floors and access' },
    { id: 'upgrade', name: 'Upgrade Centre', icon: 'download', off: 'Only deployment admins can open this.' },
  ] },
];
const extra = (id: string, name: string, icon: string, apps: [string, string, string][]): SampleGroup => ({ id, name, icon, line: 'Sample group', apps: apps.map(([a, n, i]) => ({ id: a, name: n, icon: i, line: 'Sample app' })) });
export const MANY: SampleGroup[] = [
  extra('reports', 'Reports', 'chart', [['r1', 'Returns', 'document'], ['r2', 'Readiness', 'gauge']]),
  extra('safety', 'Safety', 'admin', [['s1', 'Incidents', 'warning'], ['s2', 'Audits', 'check']]),
  extra('people', 'People', 'people', [['p1', 'Rota', 'calendar'], ['p2', 'Training', 'person']]),
  extra('supply', 'Supply', 'facility', [['u1', 'Stores', 'facility'], ['u2', 'Orders', 'inbox']]),
  extra('sites', 'Sites', 'place', [['t1', 'Berths', 'port'], ['t2', 'Buildings', 'department']]),
  extra('finance', 'Finance', 'chart', [['f1', 'Budgets', 'tag'], ['f2', 'Claims', 'document']]),
];

const PAGES: Record<string, { id: string; name: string; icon: string }[]> = {
  artifacts: [
    { id: 'library', name: 'Library', icon: 'library' },
    { id: 'recent', name: 'Recent', icon: 'clock' },
    { id: 'shared', name: 'Shared', icon: 'people' },
    { id: 'drafts', name: 'Drafts', icon: 'draft' },
  ],
  mandate: [
    { id: 'overview', name: 'Overview', icon: 'compass' },
    { id: 'tasks', name: 'Tasks', icon: 'tasks' },
    { id: 'briefs', name: 'Back-briefs', icon: 'messages' },
  ],
};
export const pagesOf = (id: string) => PAGES[id] ?? [
  { id: 'overview', name: 'Overview', icon: 'dashboard' },
  { id: 'activity', name: 'Activity', icon: 'pulse' },
];

/** What needs you, in order: the app and the pages down to it. The first leads. */
export interface Need {
  app: string;
  path: string[];
}
export const ONE: Need[] = [{ app: 'artifacts', path: ['library', 'finance'] }];
export const TWO: Need[] = [...ONE, { app: 'mandate', path: ['tasks'] }];

export interface SampleProps {
  groups?: SampleGroup[];
  /** Groups as tiles, or one Apps tile holding them as folders. */
  holds?: 'groups' | 'folder';
  needs?: Need[];
  running?: string[];
  /** Start with this app open. */
  app?: string;
}

/** The parts put together the way the shell would, with the bar's own props passed through. */
export function SampleBar({ groups = GROUPS, holds = 'groups', needs = ONE, running: startRunning = [], app: startApp, ...bar }: SampleProps & AppBarProps) {
  const [running, setRunning] = useState(startApp && !startRunning.includes(startApp) ? [...startRunning, startApp] : startRunning);
  const [app, setApp] = useState(startApp);
  const [page, setPage] = useState<Record<string, string>>({});
  const [hint, setHint] = useState(bar.hint);
  useEffect(() => setApp(startApp), [startApp]);
  useEffect(() => setHint(bar.hint), [bar.hint]);
  const apps = groups.flatMap((g) => g.apps);
  const solo = apps.length === 1;
  const lit = (id: string, path: string[] = []) => needs.some((n) => n.app === id && path.every((p, i) => n.path[i] === p));
  const leads = (id: string, path: string[] = []) => !!needs[0] && needs[0].app === id && path.every((p, i) => needs[0]!.path[i] === p);
  const litGroup = (g: SampleGroup) => g.apps.some((a) => !a.off && lit(a.id));
  const leadGroup = (g: SampleGroup) => g.apps.some((a) => leads(a.id));
  const mode = bar.mode ?? (app ? 'app' : 'desk');

  const open = (id: string) => {
    if (id === 'home' && !solo) return setApp(undefined);
    if (!running.includes(id)) setRunning([...running, id]);
    setPage((p) => ({ ...p, [id]: app === id || !p[id] ? pagesOf(id)[0]!.id : p[id]! }));
    setApp(id);
  };
  const close = (id: string) => {
    const left = running.filter((x) => x !== id);
    setRunning(left);
    if (app === id) setApp(left[left.length - 1]);
  };

  const item = (a: SampleApp) => (
    <StartMenuItem key={a.id} icon={a.icon} name={a.name} line={app === a.id ? 'You’re here' : running.includes(a.id) ? 'Open' : a.line} off={a.off} current={app === a.id} lit={lit(a.id)} lead={leads(a.id)} onPress={() => open(a.id)} />
  );
  const folder = (g: SampleGroup) => (
    <StartMenuFolder key={g.id} name={g.name} line={g.line} lit={litGroup(g)} lead={leadGroup(g)}>
      {g.apps.map(item)}
    </StartMenuFolder>
  );
  const current = apps.find((a) => a.id === app);
  const appsMenu = (
    <>
      {groups.map(folder)}
      {mode === 'app' && current ? (
        <>
          <StartMenuDivider />
          <StartMenuItem icon="close" name={`Close ${current.name}`} onPress={() => close(current.id)} />
        </>
      ) : null}
    </>
  );
  const openTile = (id: string, kind?: 'app') => {
    const a = apps.find((x) => x.id === id);
    return a ? <BarTile key={id} kind={kind} icon={a.icon} name={a.name} running={kind !== 'app'} current={mode === 'app' && app === id} lit={lit(id)} lead={leads(id)} onPress={() => open(id)} /> : null;
  };

  return (
    <AppBar {...bar} mode={mode} label={mode === 'app' && current ? `App bar: ${current.name}` : 'App bar'} hint={hint} onHintDone={() => setHint(undefined)}>
      {mode === 'app' && app ? (
        <>
          <RailBlock>
            <RailPair>
              <BarTile kind="half" icon="home" name="Home" onPress={() => setApp(undefined)} />
              {solo ? null : <BarTile kind="half" icon="apps" name="Apps" menu={appsMenu} />}
            </RailPair>
            {running.map((id) => openTile(id, 'app'))}
          </RailBlock>
          <RailPages>
            {pagesOf(app).map((p) => (
              <BarTile key={p.id} kind="page" icon={p.icon} name={p.name} current={(page[app] ?? pagesOf(app)[0]!.id) === p.id} lit={lit(app, [p.id])} lead={leads(app, [p.id])} onPress={() => setPage({ ...page, [app]: p.id })} />
            ))}
          </RailPages>
        </>
      ) : solo ? (
        openTile(apps[0]!.id)
      ) : (
        <DeskTiles groups={groups} holds={holds} litGroup={litGroup} leadGroup={leadGroup} item={item} folder={folder} appsMenu={appsMenu} opens={running.map((id) => openTile(id))} />
      )}
    </AppBar>
  );
}

/** The desktop's tiles: the groups, More for those that don't fit, then the open apps. */
function DeskTiles({ groups, holds, litGroup, leadGroup, item, folder, appsMenu, opens }: {
  groups: SampleGroup[];
  holds: 'groups' | 'folder';
  litGroup(g: SampleGroup): boolean;
  leadGroup(g: SampleGroup): boolean;
  item(a: SampleApp): React.ReactNode;
  folder(g: SampleGroup): React.ReactNode;
  appsMenu: React.ReactNode;
  opens: React.ReactNode[];
}) {
  const { room } = useAppBar();
  const space = room - opens.length;
  const cut = groups.length <= space ? groups.length : Math.max(1, space - 1);
  const rest = groups.slice(cut);
  return (
    <>
      {holds === 'folder' ? (
        <BarTile icon="apps" name="Apps" start menu={appsMenu} lit={groups.some(litGroup)} lead={groups.some(leadGroup)} />
      ) : (
        <>
          {groups.slice(0, cut).map((g) => (
            <BarTile key={g.id} icon={g.icon} name={g.name} menu={<>{g.apps.map(item)}</>} lit={litGroup(g)} lead={leadGroup(g)} />
          ))}
          {rest.length ? <BarTile icon="more" name="More" menu={<>{rest.map(folder)}</>} lit={rest.some(litGroup)} /> : null}
        </>
      )}
      {opens.length ? <BarDivider /> : null}
      {opens}
    </>
  );
}

/** A frame that stands in for the screen: the bar rests in and docks against a positioned host. */
export function Screen({ children, width, height }: { children: React.ReactNode; width?: string; height?: number }) {
  return <div style={{ position: 'relative', width: width ?? '100%', aspectRatio: height ? undefined : '16 / 10', height, minHeight: height ?? 560, overflow: 'hidden', background: 'var(--grey-0)' }}>{children}</div>;
}
