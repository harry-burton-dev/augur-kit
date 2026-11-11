import { useSyncExternalStore, type ReactNode } from 'react';
import { AppBar, BarDivider, BarLogo, BarTile, RailBlock, RailPages, StartMenuFolder, StartMenuItem, useAppBar } from './app-bar.js';
import type { ShellApp, ShellAppGroup, ShellModel } from './shell-model.js';
import { RailPlaces } from './rail-places.js';

/** Where the apps with no group of their own go. */
const UNGROUPED: ShellAppGroup = { id: '', name: 'Apps', icon: 'apps' };

/**
 * The shell's app bar, put together from the model (Navigation brief): on the desktop a tile per
 * group of apps (or one Apps tile holding them as folders), More for those that don't fit, and the
 * open apps after a divider; with an app open, the same bar docked as the side rail, with the open
 * apps and the app's pages. The logo button goes to the desktop: first on the desktop bar, last on
 * the rail. The desktop's own app (`model.desktop`) keeps the bar across the screen and isn't a tile.
 * What needs you lights the way down to it.
 */
export function ShellBar({ model, inert }: { model: ShellModel; inert?: boolean }) {
  useSyncExternalStore(model.subscribe, model.getRevision, model.getRevision);
  const desk = model.desktop;
  const apps = model.apps.filter((a) => a.id !== desk);
  const byId = new Map(apps.map((a) => [a.id, a]));
  const groups = [...model.groups, UNGROUPED]
    .map((g) => ({ group: g, apps: apps.filter((a) => (g.id ? a.group === g.id : !a.group || !model.groups.some((x) => x.id === a.group))) }))
    .filter((g) => g.apps.length);
  const solo = apps.length === 1;
  const current = model.onDesk ? undefined : model.openNow;
  const mode = current ? 'app' : 'desk';
  const running = model.running.filter((id) => byId.has(id));
  if (current && !running.includes(current.id)) running.push(current.id);
  const holding = !!desk && model.openNow?.id === desk;

  const needs = model.needs;
  const lit = (app: string, page?: string) => needs.some((n) => n.app === app && (page === undefined || n.page === page));
  const leads = (app: string, page?: string) => !!needs[0] && needs[0].app === app && (page === undefined || needs[0].page === page);
  const litGroup = (list: ShellApp[]) => list.some((a) => !a.off && lit(a.id));
  const leadGroup = (list: ShellApp[]) => list.some((a) => leads(a.id));

  const item = (a: ShellApp) => (
    <StartMenuItem
      key={a.id}
      icon={a.icon ?? 'apps'}
      name={a.name}
      line={current?.id === a.id ? 'You’re here' : running.includes(a.id) ? 'Open' : a.line}
      off={a.off}
      current={current?.id === a.id}
      lit={lit(a.id)}
      lead={leads(a.id)}
      onPress={() => model.openApp(a.id)}
    />
  );
  const folder = ({ group, apps: list }: (typeof groups)[number]) => (
    <StartMenuFolder key={group.id || 'apps'} name={group.name} line={group.line} lit={litGroup(list)} lead={leadGroup(list)}>
      {list.map(item)}
    </StartMenuFolder>
  );
  const appsMenu = <>{groups.length === 1 ? groups[0]!.apps.map(item) : groups.map(folder)}</>;
  const openTile = (id: string, kind?: 'app') => {
    const a = byId.get(id)!;
    return <BarTile key={id} kind={kind} icon={a.icon ?? 'apps'} name={a.name} running={kind !== 'app'} current={current?.id === id} lit={lit(id)} lead={leads(id)} onPress={() => model.openApp(id)} />;
  };
  // Home is the desktop, so the logo lights for what needs you there.
  const logo = (
    <BarLogo key="logo" src={model.logo || undefined} name="Home" current={!current} lit={!!desk && lit(desk)} lead={!!desk && leads(desk)} onPress={() => model.goHome()} />
  );
  const pages = current?.pages ?? [];
  const page = model.page || pages[0]?.id;

  return (
    <div className="aerie-shell-bar" inert={inert}>
      <AppBar
        mode={mode}
        label={current ? `App bar: ${current.name}` : 'App bar'}
        edges={holding}
        stop={model.settings.barStop ?? 1}
        onStop={(s) => model.setBarStop(s)}
        hint={model.barHint || undefined}
        onHintDone={() => model.doneBarHint()}
      >
        {current ? (
          <>
            <RailBlock>{running.map((id) => openTile(id, 'app'))}</RailBlock>
            {pages.some((p) => p.fills) ? (
              // An app on the app contract: its places, with what it put under those that fill (6.3).
              <RailPages>
                <RailPlaces
                  places={pages.map((p) => ({ id: p.id, label: p.name, icon: p.icon, ...(p.path !== undefined ? { path: p.path } : {}), ...(p.fills ? { fills: true } : {}) }))}
                  under={model.under[current.id] ?? {}}
                  cap={model.underCap}
                  current={model.path || undefined}
                  currentPlace={model.path ? undefined : page}
                  lit={(id) => lit(current.id, id)}
                  lead={(id) => leads(current.id, id)}
                  onPlace={(id) => model.openPage(id)}
                  onOpen={(path, id) => model.openPath(path, id)}
                />
              </RailPages>
            ) : pages.length ? (
              <RailPages>
                {pages.map((p) => (
                  <BarTile key={p.id} kind="page" icon={p.icon} name={p.name} current={page === p.id} lit={lit(current.id, p.id)} lead={leads(current.id, p.id)} onPress={() => model.openPage(p.id)} />
                ))}
              </RailPages>
            ) : (
              <RailPages />
            )}
            {logo}
          </>
        ) : solo ? (
          <>
            {logo}
            {openTile(apps[0]!.id)}
          </>
        ) : (
          <DeskTiles
            logo={logo}
            groups={groups}
            holds={model.barHolds}
            litGroup={litGroup}
            leadGroup={leadGroup}
            item={item}
            folder={folder}
            appsMenu={appsMenu}
            opens={running.map((id) => openTile(id))}
          />
        )}
      </AppBar>
    </div>
  );
}

type Group = { group: ShellAppGroup; apps: ShellApp[] };

/** The desktop's tiles: the groups, More for those that don't fit, then the open apps. */
function DeskTiles({ logo, groups, holds, litGroup, leadGroup, item, folder, appsMenu, opens }: {
  logo: ReactNode;
  groups: Group[];
  holds: 'groups' | 'folder';
  litGroup(list: ShellApp[]): boolean;
  leadGroup(list: ShellApp[]): boolean;
  item(a: ShellApp): ReactNode;
  folder(g: Group): ReactNode;
  appsMenu: ReactNode;
  opens: ReactNode[];
}) {
  const { room } = useAppBar();
  const space = room - opens.length - 1;
  const cut = groups.length <= space ? groups.length : Math.max(1, space - 1);
  const rest = groups.slice(cut);
  const all = groups.flatMap((g) => g.apps);
  return (
    <>
      {logo}
      {holds === 'folder' ? (
        <BarTile icon="apps" name="Apps" start menu={appsMenu} lit={litGroup(all)} lead={leadGroup(all)} />
      ) : (
        <>
          {groups.slice(0, cut).map((g) => (
            <BarTile key={g.group.id || 'apps'} icon={g.group.icon} name={g.group.name} menu={<>{g.apps.map(item)}</>} lit={litGroup(g.apps)} lead={leadGroup(g.apps)} />
          ))}
          {rest.length ? <BarTile icon="more" name="More" menu={<>{rest.map(folder)}</>} lit={rest.some((g) => litGroup(g.apps))} /> : null}
        </>
      )}
      {opens.length ? <BarDivider /> : null}
      {opens}
    </>
  );
}
