import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent as ReactKeyboardEvent, type ReactNode, type RefObject } from 'react';
import { Icon, IconButton, Menu, ms } from '@augur/kit-common';
import { floorIconOf, floorKindOf, floorLevel, floorMeaning, floorStack, floorTone } from './floors.js';
import { Water } from './water.js';
import { agentUrgency, ago, streamWords, type ShellFindResult, type ShellModel, type ShellNotification } from './shell-model.js';
import { AgentMark, AppTile, AppTiles, HoverName, MenuArc, MenuCaption, MenuChoice, MenuEsc, MenuGroup, MenuKeys, MenuLink, MenuNote, MenuPair, MenuRetry, MenuRow, MenuSearch, MenuSkeleton, MenuSwitch, MenuTools, MenuUndo, MenuView, MenuWho, NotificationRow, ShellMenu, unavailableNames } from './shell-menu.js';

export interface ShellProps {
  /** What the Shell knows and does; the host keeps it and listens on it. */
  model: ShellModel;
  /** The stage: the app that's open, or Title or Orbit. */
  children?: ReactNode;
}

/** The root element, carrying its model, so a test or a tool can reach it as the Lit element's own fields. */
export type ShellElement = HTMLDivElement & { shell?: ShellModel };

const isTyping = (e: Event) => {
  const el = e.composedPath()[0] as HTMLElement | undefined;
  return !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
};

/**
 * The frame every app runs inside (Aerie, ADR 0015). It holds who you are,
 * the floor you're on, system status, the apps and the notification stream,
 * and nothing about any app's domain. Apps go in its children (the stage).
 *
 * Summoned with ` or Ctrl/⌘ K, the handle or the status, it is like looking
 * up: the app tips away below and the functions sit on a shallow arc with
 * the stream at its top. Esc goes back a step, then closes. It draws a
 * `ShellModel`; the host sets what it knows on the model and listens to it.
 */
export function Shell({ model, children }: ShellProps) {
  useSyncExternalStore(model.subscribe, model.getRevision, model.getRevision);
  const root = useRef<ShellElement>(null);
  const ground = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLElement>(null);
  const place = useRef<HTMLElement>(null);
  const water = useRef<Water | null>(null);

  const here = model.currentFloor;
  const background = model.background;

  // The water: on unless the screen asks for the still ground, in its floor's colours and height.
  useLayoutEffect(() => {
    const host = ground.current;
    if (!host || !background || background === 'none') {
      water.current?.destroy();
      water.current = null;
      host?.replaceChildren();
      return;
    }
    water.current ??= new Water(host);
    let colors: { navy: string; green: string } | undefined;
    if (here && here.kind !== 'personal' && root.current) {
      const cs = getComputedStyle(root.current);
      const tone = floorTone(here);
      const navy = cs.getPropertyValue(`--floor-${tone}-low`).trim();
      const green = cs.getPropertyValue(`--floor-${tone}-high`).trim();
      colors = navy && green ? { navy, green } : undefined;
    }
    water.current.set({ preset: background, colors, level: here ? floorLevel[here.kind] : 0 });
  }, [background, here]);

  useEffect(() => () => water.current?.destroy(), []);

  // Every draw hands the model what it moves and focuses.
  useLayoutEffect(() => {
    if (root.current) root.current.shell = model;
    model.drawn({ root: root.current, stage: stage.current, place: place.current, water: water.current });
  });

  useEffect(() => {
    const onWindowKey = (e: KeyboardEvent) => {
      const summon = (e.key === '`' && !e.ctrlKey && !e.metaKey && !e.altKey && !isTyping(e)) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k');
      if (summon) {
        e.preventDefault();
        model.toggle();
        return;
      }
      // Alt with Page Up or Page Down goes up or down a floor. Page Up and Page Down alone stay the app's, to scroll.
      if (e.altKey && (e.key === 'PageUp' || e.key === 'PageDown') && model.floors.length && !model.isOpen && !e.defaultPrevented && !isTyping(e)) {
        if (model.moveFloor(e.key === 'PageUp' ? 'up' : 'down')) e.preventDefault();
      }
    };
    const ends = ['keydown', 'pointerdown', 'wheel'] as const;
    window.addEventListener('keydown', onWindowKey);
    for (const type of ends) window.addEventListener(type, model.endCard, { capture: true, passive: true });
    const clock = setInterval(() => {
      model.now = Date.now();
      model.requestUpdate();
    }, 30_000);
    return () => {
      window.removeEventListener('keydown', onWindowKey);
      for (const type of ends) window.removeEventListener(type, model.endCard, { capture: true });
      clearInterval(clock);
      model.stop();
    };
  }, [model]);

  const news = useNews(model);
  const mood = model.mood;
  const cap = model.caption();
  const capMood = !model.view || model.view === 'stream' ? mood : 'quiet';
  const tab = model.isOpen ? -1 : 0;
  const back = () => (model.view ? model.closeView() : model.close());

  const onSkyKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (model.view === 'find' && model.query) {
        model.query = '';
        model.requestUpdate();
      } else if (model.view) model.closeView();
      else model.close();
      return;
    }
    if (e.key === 'Tab') {
      const items = [...e.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), input, [tabindex="0"]')].filter((el) => !el.closest('[inert]'));
      if (!items.length) return;
      const at = items.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (at <= 0 ? items.length - 1 : at - 1) : at === items.length - 1 ? 0 : at + 1;
      if (at === -1 || (e.shiftKey && at === 0) || (!e.shiftKey && at === items.length - 1)) {
        e.preventDefault();
        items[next]!.focus();
      }
      return;
    }
    if (model.view) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      model.focusDome(model.focusIndex + (e.key === 'ArrowRight' ? 1 : -1));
    }
  };

  return (
    <div
      ref={root}
      className="aerie-shell"
      data-shell=""
      data-open={model.isOpen ? '' : undefined}
      data-arriving={model.arriving ? '' : undefined}
      data-floor-kind={here?.kind}
      data-floor-tone={here ? floorTone(here) : undefined}
      data-background={background}
      data-view={model.view}
      data-gauge={model.currentFloor ? '' : undefined}
    >
      <div className="aerie-ground">
        <div ref={ground} className="aerie-water" />
      </div>
      <Band model={model} tab={tab} mood={mood} place={place} />
      <Gauge model={model} tab={tab} />
      {model.card ? (
        <div className={`aerie-card aerie-${model.card.kind}`} aria-hidden="true">
          {model.card.kick ? <span className="aerie-kick">{model.card.kick}</span> : null}
          <p className="aerie-name">{model.card.name}</p>
          {model.card.line ? <span className="aerie-line">{model.card.line}</span> : null}
        </div>
      ) : null}
      {/* The one main landmark: the app or screen that's open. */}
      <main ref={stage} className="aerie-stage" aria-label={model.openNow?.name || undefined}>
        {children}
      </main>
      <ShellMenu open={model.isOpen} mood={mood} onKeyDown={onSkyKey} onDismiss={back}>
        <MenuArc
          items={model.functions}
          lit={model.view}
          focusIndex={model.focusIndex}
          mood={mood}
          streamLabel={`Notifications: ${model.online ? streamWords(model.heard) : 'offline'}`}
          onFocusItem={(i) => (model.focusIndex = i)}
          onOpen={(id) => model.openView(id)}
        />
        {model.view && model.view !== 'stream' ? <MenuCaption title={cap.title} /> : <MenuCaption title={cap.title} line={cap.line} mood={capMood} />}
        {model.view ? (
          <MenuView label={cap.title}>
            <View model={model} />
          </MenuView>
        ) : null}
        {model.undo ? <MenuUndo label={model.undo.label} onUndo={() => model.restore()} /> : null}
        <MenuEsc back={!!model.view} onPress={back} />
      </ShellMenu>
      <div className="aerie-live" aria-live="polite">
        {model.isOpen ? `${cap.title}. ${cap.line}` : model.said}
      </div>
      <div className="aerie-live" aria-live="polite" data-news="">
        {news}
      </div>
    </div>
  );
}

/**
 * What newly needs you, in words, for a polite live region: said once when it arrives, never for
 * what was already there when the Shell first drew (or when the stream first loaded), and never
 * again for the same notification. Muted apps stay quiet.
 */
function useNews(model: ShellModel) {
  const seen = useRef<Set<string> | null>(null);
  const [said, setSaid] = useState('');
  const heard = model.heard;
  const loading = model.streamLoading;
  useEffect(() => {
    if (loading) return;
    const needs = heard.filter((n) => n.level === 'needs');
    if (!seen.current) {
      seen.current = new Set(needs.map((n) => n.id));
      return;
    }
    const known = seen.current;
    const fresh = needs.filter((n) => !known.has(n.id));
    for (const n of fresh) known.add(n.id);
    if (!fresh.length) return;
    setSaid(fresh.length === 1 ? `Needs you: ${fresh[0]!.title}, from ${model.appName(fresh[0]!.app)}` : `${fresh.length} new things need you`);
  }, [heard, loading, model]);
  // Cleared after a while, so the same words can be said again for the next one.
  useEffect(() => {
    if (!said) return;
    const t = setTimeout(() => setSaid(''), ms('motion-hold'));
    return () => clearTimeout(t);
  }, [said]);
  return said;
}

function Band({ model, tab, mood, place }: { model: ShellModel; tab: number; mood: string; place: RefObject<HTMLElement | null> }) {
  const words = model.statusLabel || (model.online ? streamWords(model.heard) : 'Offline');
  const time = new Date(model.now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const here = model.currentFloor;
  const app = model.openNow;
  return (
    <header className="aerie-band" inert={model.isOpen}>
      <div className="aerie-left">
        {here ? (
          <p className="aerie-where">
            <Icon name={floorIconOf(here)} size={16} />
            <span className="sr-only">You’re on {here.kind === 'personal' ? 'your own floor' : here.kind === 'team' ? `${here.name}, a ${floorKindOf(here).toLowerCase()}` : here.name}</span>
            <b aria-hidden="true">{here.name}</b>
          </p>
        ) : (
          <div className="aerie-mark">
            <b>{model.product}</b>
            {model.workspace ? <span>{model.workspace}</span> : null}
          </div>
        )}
        {model.navs.length ? (
          <nav className="aerie-navs" aria-label="Go to">
            {model.navs.map((n) => (
              <button
                key={n.id}
                className="aerie-nav augur-control"
                tabIndex={tab}
                aria-label={n.unavailable ? unavailableNames(n.label, n.unavailable).label : n.current ? `${n.label}, you’re here` : n.label}
                aria-current={n.current ? 'page' : undefined}
                aria-disabled={n.unavailable ? 'true' : undefined}
                onClick={() => !n.unavailable && !n.current && model.emit('ui-nav', { id: n.id })}
              >
                <Icon name={n.icon} size={16} />
                <HoverName>{n.unavailable ? unavailableNames(n.label, n.unavailable).hover : n.label}</HoverName>
              </button>
            ))}
          </nav>
        ) : null}
        {model.backTo ? (
          <button className="aerie-back" tabIndex={tab} aria-label={`Back to ${model.backTo}`} onClick={() => model.emit('ui-back', {})}>
            <Icon name="back" size={16} />
            <span>Back</span>
          </button>
        ) : null}
      </div>
      <button className="aerie-handle augur-control" aria-label="Open the shell" tabIndex={tab} onClick={() => model.open()}>
        <i />
        <HoverName>Open the shell</HoverName>
      </button>
      {app ? (
        <p className="aerie-place">
          <b ref={place}>{app.name}</b>
          {model.area ? <span>{model.area}</span> : null}
        </p>
      ) : null}
      <div className="aerie-right">
        <button className={`aerie-status aerie-${mood}`} tabIndex={tab} aria-label={`${words}. Open notifications.`} onClick={() => model.openView('stream')}>
          <i className="aerie-point" />
          {words}
        </button>
        <span className="aerie-clock">{time}</span>
      </div>
    </header>
  );
}

/**
 * The edge gauge: one notch per floor from yours to the org, the one you're
 * on lit in its colour, with a dot where something waits and the open app
 * pinned beside it. Pointing at it or tabbing into it opens it out: each
 * floor's name and who sees what's on it, and which floor the app is showing.
 */
function Gauge({ model, tab }: { model: ShellModel; tab: number }) {
  if (!model.currentFloor) return null;
  const stack = floorStack(model.floors, model.floor, model.lastTeam).reverse();
  const waiting = model.waitingByFloor();
  const app = model.openNow;
  const rest = model.floorsRest;
  return (
    <nav className={`aerie-gauge${rest ? ' aerie-rest' : ''}`} aria-label="Floors" inert={model.isOpen}>
      {rest ? (
        <p className="aerie-why" id="floors-rest">
          <span>{rest}, so moving floors wouldn’t change it.</span>
        </p>
      ) : null}
      <ol>
        {stack.map((f) => {
          const count = waiting.get(f.id) ?? 0;
          const name = f.kind === 'personal' ? 'Your own floor' : f.name;
          const here = f.id === model.floor;
          return (
            <li key={f.id}>
              <button
                tabIndex={tab}
                aria-label={[name, here ? 'you’re here' : '', count ? `${count} waiting` : ''].filter(Boolean).join(', ')}
                aria-describedby={rest ? `floors-rest floor-${f.id}` : `floor-${f.id}`}
                aria-current={here ? 'location' : undefined}
                aria-disabled={rest && !here ? 'true' : undefined}
                data-waiting={count > 0 ? '' : undefined}
                onClick={() => !rest && model.goToFloor(f.id)}
              >
                <span className="aerie-label" id={`floor-${f.id}`}>
                  <span>
                    <b>
                      {name} {here ? <em>You’re here</em> : count ? <em className="aerie-waiting">{count} waiting</em> : null}
                    </b>
                    <span>
                      {f.kind === 'team' ? `${floorKindOf(f)}. ` : ''}
                      {floorMeaning(f)}
                    </span>
                    {here && app && !rest ? (
                      <span className="aerie-bound">
                        <Icon name={app.icon ?? 'apps'} size={14} />
                        {app.name} is showing this floor
                      </span>
                    ) : null}
                  </span>
                </span>
                {here && app ? (
                  <span className="aerie-pinned" aria-hidden="true">
                    <Icon name={app.icon ?? 'apps'} size={12} />
                  </span>
                ) : null}
                <span className="aerie-notch">
                  <Icon name={floorIconOf(f)} size={14} />
                  {count ? <span className="aerie-dot" /> : null}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function View({ model }: { model: ShellModel }) {
  switch (model.view) {
    case 'stream':
      return <Stream model={model} />;
    case 'apps':
      return <Apps model={model} />;
    case 'find':
      return <Find model={model} />;
    case 'agents':
      return <Agents model={model} />;
    case 'account':
      return <Account model={model} />;
    case 'settings':
      return <Settings model={model} />;
    default:
      return null;
  }
}

function Stream({ model }: { model: ShellModel }) {
  if (model.streamLoading) {
    return (
      <>
        <MenuNote tone="busy">Catching up…</MenuNote>
        <MenuSkeleton />
        <MenuSkeleton />
      </>
    );
  }
  if (model.streamError) {
    return (
      <>
        <MenuNote tone="error">{model.streamError}</MenuNote>
        <MenuRetry first onPress={() => model.emit('ui-retry', { what: 'stream' })} />
      </>
    );
  }
  const list = model.notifications;
  if (!list.length) {
    return (
      <MenuNote focusable first>
        All quiet. Nothing needs you.
      </MenuNote>
    );
  }
  const groups = model.streamGroups();
  // The first thing that needs you pings; the rest are a still green. Muted apps never ping.
  const pinging = groups.find((g) => !g.muted && g.needs)?.list.find((n) => n.level === 'needs' && !n.quiet)?.id;
  const firstId = groups[0]?.list[0]?.id;
  return (
    <>
      {list.some((n) => n.level !== 'needs') ? (
        <MenuTools>
          <MenuLink onPress={() => model.clear()}>Clear the quiet ones</MenuLink>
        </MenuTools>
      ) : null}
      {groups.map(({ app, list: g, muted, needs }) => {
        const name = model.appName(app);
        return (
          <div key={app}>
            <MenuGroup
              name={name}
              count={g.length}
              needs={needs && !muted}
              muted={muted}
              end={
                <Menu
                  label="App notifications"
                  placement="bottom end"
                  items={[muted ? { id: 'unmute', label: `Unmute ${name}`, icon: 'bell' } : { id: 'mute', label: `Mute ${name}`, icon: 'mute' }]}
                  onAction={(id) => model.setMuted(app, id === 'mute')}
                >
                  <IconButton icon="more" label={`${name}: more`} size="sm" />
                </Menu>
              }
            />
            <ul aria-label={name}>
              {g.map((n) => (
                <Row key={n.id} model={model} n={n} muted={muted || !!n.quiet} first={n.id === firstId} pinging={n.id === pinging} />
              ))}
            </ul>
          </div>
        );
      })}
    </>
  );
}

function Row({ model, n, muted, first, pinging }: { model: ShellModel; n: ShellNotification; muted: boolean; first: boolean; pinging: boolean }) {
  return (
    <NotificationRow
      title={n.title}
      detail={[model.floorTag(n), n.detail].filter(Boolean).join(' · ')}
      when={ago(n.time, model.now)}
      level={n.level}
      muted={muted}
      first={first}
      pinging={pinging}
      actions={n.actions}
      onOpen={() => model.openNotification(n)}
      onAct={(i) => model.actOn(n, i)}
      onDismiss={() => model.dismiss(n.id)}
    />
  );
}

function Apps({ model }: { model: ShellModel }) {
  const byId = new Map(model.apps.map((a) => [a.id, a]));
  const current = model.current;
  const ordered = [
    ...(current && byId.has(current) ? [current] : []),
    ...model.recent.filter((id) => id !== current && byId.has(id)),
    ...model.apps.map((a) => a.id).filter((id) => id !== current && !model.recent.includes(id)),
  ].map((id) => byId.get(id)!);
  if (!ordered.length) return <MenuNote>No apps yet.</MenuNote>;
  return (
    <AppTiles>
      {ordered.map((a, i) => (
        <AppTile key={a.id} name={a.name} icon={a.icon} line={a.line} ai={a.ai} now={a.id === current} first={i === 0} onPress={() => model.openApp(a.id)} />
      ))}
    </AppTiles>
  );
}

const findSaid = { looking: 'Still looking…', late: 'Didn’t answer in time.', failed: 'Couldn’t search right now.' } as const;

function Find({ model }: { model: ShellModel }) {
  const q = model.query;
  const loose = q ? [...model.findLocal(q), ...model.findResults.filter((r) => !r.group)] : [];
  const grouped = q ? model.findGroups : [];
  const inGroup = (name: string) => model.findResults.filter((r) => r.group === name);
  const results = [...loose, ...grouped.flatMap((g) => inGroup(g.name))];
  const waiting = grouped.some((g) => g.state === 'looking');
  const row = (r: ShellFindResult) => (
    <li key={`${r.kind}:${r.id}`}>
      <MenuRow title={r.title} detail={r.detail ?? r.kind} onPress={() => model.pick(r)} />
    </li>
  );
  return (
    <>
      <MenuSearch
        label="Find across apps, notifications and agents"
        placeholder="Find apps, notifications, agents…"
        value={q}
        onChange={(v) => model.setQuery(v)}
        onEnter={() => results[0] && model.pick(results[0])}
      />
      {q && !results.length && !waiting ? <MenuNote>Nothing matches "{q}".</MenuNote> : null}
      <ul>{loose.map(row)}</ul>
      {grouped.map((g) => {
        const found = inGroup(g.name);
        if (!found.length && g.state === 'done') return null;
        return (
          <div key={g.name}>
            <MenuGroup name={g.name} count={found.length} />
            {found.length ? (
              <ul aria-label={g.name}>{found.map(row)}</ul>
            ) : (
              <MenuNote small tone={g.state as keyof typeof findSaid}>
                {findSaid[g.state as keyof typeof findSaid]}
              </MenuNote>
            )}
          </div>
        );
      })}
      <div className="aerie-live" aria-live="polite">
        {q && !waiting ? `${results.length} found` : ''}
      </div>
    </>
  );
}

function Agents({ model }: { model: ShellModel }) {
  if (model.agentsLoading) {
    return (
      <>
        <MenuNote tone="busy">Catching up…</MenuNote>
        <MenuSkeleton />
      </>
    );
  }
  if (model.agentsError) {
    return (
      <>
        <MenuNote tone="error">{model.agentsError}</MenuNote>
        <MenuRetry onPress={() => model.emit('ui-retry', { what: 'agents' })} />
      </>
    );
  }
  if (!model.agents.length) return <MenuNote focusable>No agents are running.</MenuNote>;
  const sorted = [...model.agents].sort((a, b) => agentUrgency.indexOf(a.status) - agentUrgency.indexOf(b.status));
  const firstNeeds = sorted.findIndex((a) => a.status === 'needs');
  return (
    <ul>
      {sorted.map((a, i) => (
        <li key={a.id}>
          <MenuRow
            title={a.name}
            detail={a.detail}
            end={<AgentMark status={a.status} next={i === firstNeeds} />}
            onPress={() => (a.app ? model.openApp(a.app) : model.emit('ui-function', { id: `agent:${a.id}` }))}
          />
        </li>
      ))}
    </ul>
  );
}

function Account({ model }: { model: ShellModel }) {
  const here = model.currentFloor;
  const waiting = model.waitingByFloor();
  return (
    <>
      <MenuWho name={model.user?.name ?? 'Signed in'} detail={model.user?.email} />
      {here ? (
        <>
          <MenuGroup name="Floors" />
          <ul className="aerie-floors">
            {model.floors.map((f) => (
              <li key={f.id}>
                <MenuRow
                  icon={floorIconOf(f)}
                  current={f.id === model.floor}
                  title={
                    <>
                      {f.kind === 'personal' ? 'Your own floor' : f.name}
                      {f.path.length > 1 ? (
                        <i>
                          {' '}
                          in{' '}
                          {f.path
                            .slice(0, -1)
                            .map((p) => p.name)
                            .join(' / ')}
                        </i>
                      ) : null}
                    </>
                  }
                  detail={`${f.kind === 'team' ? `${floorKindOf(f)}. ` : ''}${floorMeaning(f)}`}
                  meta={f.id === model.floor ? 'You’re here' : waiting.get(f.id) ? `${waiting.get(f.id)} waiting` : undefined}
                  onPress={() => {
                    model.goToFloor(f.id);
                    model.close();
                  }}
                />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <MenuPair label="Workspace" value={model.workspace || '—'} />
      )}
      <MenuPair label="Show me as away" labelId="aerie-away">
        <MenuSwitch labelledBy="aerie-away" on={model.away} onToggle={() => model.setAway(!model.away)} />
      </MenuPair>
      <MenuPair>
        {model.canSwitchWorkspace && !here ? <MenuLink onPress={() => model.emit('ui-function', { id: 'switch-workspace' })}>Switch workspace</MenuLink> : <span />}
        <MenuLink onPress={() => model.emit('ui-function', { id: 'sign-out' })}>Sign out</MenuLink>
      </MenuPair>
    </>
  );
}

/** The keys the menu answers to, said in Settings. */
const shellKeys = (floors: boolean) => [
  { keys: '`', does: 'Open or close the shell (also Ctrl or ⌘ K)' },
  { keys: '← →', does: 'Move along the arc' },
  { keys: 'Enter', does: 'Open' },
  { keys: 'x', does: 'Dismiss a notification' },
  { keys: 'Esc', does: 'Back, then close' },
  ...(floors ? [{ keys: 'Alt PgUp PgDn', does: 'Up or down a floor' }] : []),
];

const densities = [
  { id: 'comfortable', label: 'Comfortable' },
  { id: 'compact', label: 'Compact' },
];

function Settings({ model }: { model: ShellModel }) {
  const s = model.settings;
  const toggle = (id: string, label: string, on: boolean, flip: () => void) => (
    <MenuPair label={label} labelId={id}>
      <MenuSwitch labelledBy={id} on={on} onToggle={flip} />
    </MenuPair>
  );
  return (
    <>
      {toggle('aerie-rm', 'Reduce motion', !!s.reduceMotion, () => model.setSetting('reduceMotion', !s.reduceMotion))}
      {toggle('aerie-at', 'Area titles', s.areaTitles !== false, () => model.setSetting('areaTitles', s.areaTitles === false))}
      {toggle('aerie-ts', 'Toasts for new notifications', !!s.toasts, () => model.setSetting('toasts', !s.toasts))}
      <MenuPair label="Density">
        <MenuChoice label="Density" options={densities} value={s.density ?? 'comfortable'} onChange={(d) => model.setSetting('density', d as 'comfortable' | 'compact')} />
      </MenuPair>
      {model.version ? <MenuPair label="Version" value={model.version} version /> : null}
      <MenuGroup name="Keys" />
      <MenuKeys keys={shellKeys(model.floors.length > 0)} />
    </>
  );
}
