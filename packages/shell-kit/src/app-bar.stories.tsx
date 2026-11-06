import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type CSSProperties } from 'react';
import { Icon } from '@augur/kit-common';
import { AppBar, type BarGroup, type BarLight, type BarStop } from './app-bar.js';
import { Horizon } from './horizon.js';

/* Sample content, from Harry's app bar mockup. Names are examples. */
type Floor = 'org' | 'dept' | 'me';
const FLOORS: { id: Floor; name: string; tone: 'org' | 'department' | 'you' }[] = [
  { id: 'org', name: 'Example Org', tone: 'org' },
  { id: 'dept', name: 'Example Department', tone: 'department' },
  { id: 'me', name: 'Your own floor', tone: 'you' },
];
const groupsOn = (floor: Floor): BarGroup[] => [
  { id: 'work', name: 'Work', icon: 'work', line: 'What you’re doing, and why', apps: [
    { id: 'home', name: 'Home', icon: 'home', line: 'Your day on this floor' },
    { id: 'mandate', name: 'Mandate', icon: 'compass', line: 'What we’re trying to do' },
  ] },
  { id: 'context', name: 'Context', icon: 'context', line: 'What’s known, and what it’s about', apps: [
    { id: 'artifacts', name: 'Artifacts', icon: 'library', line: 'What your floors keep' },
    { id: 'atlas', name: 'Atlas', icon: 'atlas', line: 'What it’s all about', off: floor === 'dept' ? 'Off on this floor. An organisation admin can turn it on.' : undefined },
  ] },
  { id: 'platform', name: 'Platform', icon: 'server', line: 'Running this deployment', apps: [
    { id: 'explorer', name: 'Explorer', icon: 'folder-tree', line: 'Everything, by place' },
    { id: 'admin', name: 'Admin', icon: 'admin', line: 'People, floors and access' },
    { id: 'upgrade', name: 'Upgrade Centre', icon: 'download', off: 'Only deployment admins can open this.' },
  ] },
];
const extra = (id: string, name: string, icon: string, apps: [string, string, string][]): BarGroup => ({ id, name, icon, line: 'Sample group', apps: apps.map(([a, n, i]) => ({ id: a, name: n, icon: i, line: 'Sample app' })) });
const MANY: BarGroup[] = [
  extra('reports', 'Reports', 'chart', [['r1', 'Returns', 'document'], ['r2', 'Readiness', 'gauge']]),
  extra('safety', 'Safety', 'admin', [['s1', 'Incidents', 'warning'], ['s2', 'Audits', 'check']]),
  extra('people', 'People', 'people', [['p1', 'Rota', 'calendar'], ['p2', 'Training', 'person']]),
  extra('supply', 'Supply', 'facility', [['u1', 'Stores', 'facility'], ['u2', 'Orders', 'inbox']]),
  extra('sites', 'Sites', 'place', [['t1', 'Berths', 'port'], ['t2', 'Buildings', 'department']]),
  extra('finance', 'Finance', 'chart', [['f1', 'Budgets', 'tag'], ['f2', 'Claims', 'document']]),
];

interface Doc { t: string; sub: string; st: string }
interface Node { id: string; name: string; icon?: string; n?: number; lede?: string; kids?: Node[]; docs?: Doc[] }
const D = (t: string, sub: string, st: string): Doc => ({ t, sub, st });
const TREES: Record<string, Node[]> = {
  artifacts: [
    { id: 'library', name: 'Library', icon: 'library', lede: 'Everything this floor keeps, by place.', kids: [
      { id: 'operations', name: 'Operations', n: 38, lede: 'How the work gets done.', kids: [
        { id: 'logistics', name: 'Logistics', n: 12, lede: 'Moving and keeping things.', docs: [D('Fleet maintenance plan', 'Updated 2 November', 'Issued'), D('Stores return', 'Updated yesterday', 'Draft')] },
        { id: 'policy', name: 'Policy', n: 9, lede: 'The rules we work by.', kids: [
          { id: 'people', name: 'People', n: 5, lede: 'Looking after each other.', docs: [D('Leave guidance', 'Updated 3 November', 'Issued'), D('Code of conduct', 'Updated 28 October', 'Issued')] },
          { id: 'security', name: 'Security', n: 4, lede: 'Standards and guidance for keeping people, places and information safe.', docs: [D('Access control standard', 'Updated yesterday by Priya Shah', 'In review'), D('Clear desk guidance', 'Updated 3 November', 'Issued'), D('Visitor procedure', 'Updated 21 October by Sam Lee', 'Draft')] },
        ] },
        { id: 'training', name: 'Training', n: 17, lede: 'Getting people ready.', docs: [D('Induction checklist', 'Updated 1 October', 'Issued')] },
      ] },
      { id: 'finance', name: 'Finance', n: 21, lede: 'Money in and out.', docs: [D('Budget draft 2027', 'Updated yesterday by Priya Shah', 'In review'), D('Spend report, October', 'Updated 1 November', 'Issued')] },
    ] },
    { id: 'recent', name: 'Recent', icon: 'clock', lede: 'What you’ve opened lately.', docs: [D('Access control standard', 'Today, 09:40', 'In review'), D('Budget draft 2027', 'Yesterday', 'In review')] },
    { id: 'shared', name: 'Shared', icon: 'people', lede: 'What others have shared with this floor.', docs: [D('Leave guidance', 'Shared with this floor', 'Issued')] },
    { id: 'drafts', name: 'Drafts', icon: 'draft', lede: 'What you haven’t issued yet.', docs: [D('Visitor procedure', 'Yours', 'Draft'), D('Stores return', 'Yours', 'Draft')] },
  ],
  mandate: [
    { id: 'overview', name: 'Overview', icon: 'compass', lede: 'What this floor is trying to do, and why.', docs: [D('Finish the harbour brief', 'So that the team can start the survey', 'On track')] },
    { id: 'tasks', name: 'Tasks', icon: 'tasks', lede: 'What’s been passed to you.', docs: [D('Back-brief the harbour task', 'Due 12 November', 'Open'), D('Survey berths 3 and 4', 'Due 20 November', 'Open')] },
    { id: 'briefs', name: 'Back-briefs', icon: 'messages', lede: 'What people have said back.', docs: [D('Harbour survey', 'From Priya Shah', 'Read')] },
  ],
};
const treeOf = (id: string, name: string): Node[] => TREES[id] ?? [
  { id: 'overview', name: 'Overview', icon: 'dashboard', lede: `${name} on this floor.`, docs: [D('Sample item', 'Sample detail', 'Ready')] },
  { id: 'activity', name: 'Activity', icon: 'pulse', lede: 'What’s changed lately.', docs: [D('Sample change', 'Today', 'Done')] },
];
const nodeAt = (tree: Node[], path: string[]) => {
  let list = tree;
  let n: Node | undefined;
  for (const id of path) {
    n = list.find((x) => x.id === id);
    if (!n) return undefined;
    list = n.kids ?? [];
  }
  return n;
};

interface Need extends BarLight { floor: Floor; doc: string }
const ONE: Need[] = [{ floor: 'dept', app: 'artifacts', path: ['library', 'finance'], doc: 'Budget draft 2027' }];
const TWO: Need[] = [...ONE, { floor: 'dept', app: 'mandate', path: ['tasks'], doc: 'Back-brief the harbour task' }];

interface DemoProps {
  /** Normal, first run (the hint), one app only (no groups at all), several open, or many groups (More). */
  situation: 'normal' | 'first' | 'one' | 'several' | 'many';
  attention: 'none' | 'one' | 'two';
  holds: 'groups' | 'folder';
  floor: Floor;
  stop: BarStop;
  /** Start with an app open, docked as the side rail. */
  openAt?: string;
  narrow?: boolean;
}

const row: CSSProperties = { width: '100%', display: 'grid', gridTemplateColumns: 'var(--space-5) minmax(0,1fr) auto var(--space-4)', gap: 'var(--space-3)', alignItems: 'center', minHeight: 'var(--space-7)', padding: 'var(--space-2) var(--space-1)', textAlign: 'left', color: 'var(--grey-8)', background: 'none', border: 0, borderBottom: '1px solid var(--grey-hairline)', font: 'inherit', cursor: 'pointer', position: 'relative', isolation: 'isolate' };

/** The shell around the bar, drawn plainly: a band, the horizon, the bar, and an open app's page with its locator. */
function Desk({ situation, attention, holds, floor: startFloor, stop: startStop, openAt, narrow }: DemoProps) {
  const one = situation === 'one';
  const [floor, setFloor] = useState<Floor>(startFloor);
  const groups = one ? [{ id: 'only', name: 'Artifacts', icon: 'library', apps: [{ id: 'artifacts', name: 'Artifacts', icon: 'library', line: 'What your floors keep' }] }] : [...groupsOn(floor), ...(situation === 'many' ? MANY : [])];
  const apps = groups.flatMap((g) => g.apps);
  const appOf = (id?: string) => apps.find((a) => a.id === id);
  const several = situation === 'several' ? ['artifacts', 'mandate', 'explorer'] : [];
  const [running, setRunning] = useState<string[]>(openAt ? [...new Set([...several, openAt])] : several);
  const [app, setApp] = useState<string | undefined>(openAt);
  const [at, setAt] = useState<Record<string, string[]>>(() => Object.fromEntries([...several, ...(openAt ? [openAt] : [])].map((id) => [id, [treeOf(id, '')[0]!.id]])));
  const [needs, setNeeds] = useState<Need[]>(attention === 'none' ? [] : attention === 'one' ? ONE : TWO);
  const [stop, setStop] = useState<BarStop>(startStop);
  const [hint, setHint] = useState(situation === 'first');
  const here = needs.filter((x) => x.floor === floor);

  const goApp = (id: string) => {
    if (id === 'home' && !one) return goDesk();
    const a = appOf(id);
    if (!a || a.off) return;
    setRunning((r) => (r.includes(id) ? r : [...r, id]));
    setAt((s) => ({ ...s, [id]: s[id] && app === id ? [s[id]![0]!] : (s[id] ?? [treeOf(id, a.name)[0]!.id]) }));
    setApp(id);
  };
  const goDesk = () => setApp(undefined);
  const closeApp = (id: string) => {
    const left = running.filter((x) => x !== id);
    setRunning(left);
    setAt(({ [id]: _, ...rest }) => rest);
    setApp(app === id ? left[left.length - 1] : app);
  };

  const current = appOf(app);
  const tree = current ? treeOf(current.id, current.name) : [];
  const path = (current && at[current.id]) || [];
  const node = nodeAt(tree, path);
  const litRow = (p: string[]) => here.some((x) => x.app === app && p.every((s, i) => x.path?.[i] === s));
  const leadRow = (p: string[]) => !!here[0] && here[0].app === app && p.every((s, i) => here[0]!.path?.[i] === s);

  return (
    <div style={{ position: 'relative', width: narrow ? 'min(100%, 640px)' : '100%', aspectRatio: narrow ? undefined : '16 / 10', height: narrow ? 680 : undefined, minHeight: 560, overflow: 'hidden', border: '1px solid var(--grey-4)', background: app ? 'var(--grey-1)' : 'var(--grey-0)', color: 'var(--grey-9)', fontFamily: 'var(--font-sans)' }}>
      <Horizon floor={FLOORS.find((f) => f.id === floor)!.tone} away={!!app} />
      <header style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 'var(--band-top)', padding: '0 var(--edge)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', fontSize: 'var(--type-meta)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--grey-7)' }}>
          Floor
          <select value={floor} onChange={(e) => setFloor(e.target.value as Floor)} style={{ background: 'var(--grey-2)', color: 'var(--grey-9)', border: '1px solid var(--grey-4)', font: 'inherit' }}>
            {FLOORS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
        <span style={{ color: here.length ? 'var(--needs-light)' : 'var(--grey-6)' }}>{needs.length ? `${needs.length} needs you` : 'All clear'}</span>
      </header>
      <AppBar
        groups={groups}
        holds={holds}
        running={running}
        mode={app ? 'app' : 'desk'}
        app={app}
        pages={tree.map((t) => ({ id: t.id, name: t.name, icon: t.icon ?? 'folder' }))}
        page={path[0]}
        light={here}
        stop={stop}
        onStop={setStop}
        hint={hint ? 'Everything lives in these tiles. Press one to see what’s inside.' : undefined}
        onHintDone={() => setHint(false)}
        onOpen={goApp}
        onHome={goDesk}
        onPage={(id) => app && setAt((s) => ({ ...s, [app]: [id] }))}
        onClose={closeApp}
      />
      <main aria-label={current ? current.name : 'Desktop'} style={{ position: 'absolute', top: 'var(--band-top)', right: 0, bottom: 0, left: app ? (narrow ? 'var(--bar-rail-narrow)' : 'var(--bar-tile)') : 0, overflow: 'auto', transition: 'left var(--motion-bar) var(--ease-out)' }}>
        {current && node ? (
          <div style={{ minHeight: '100%', background: 'var(--grey-1)' }}>
            <nav aria-label="You are here" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1) var(--space-2)', padding: 'var(--space-4) var(--space-6) var(--space-3)', borderBottom: '1px solid var(--grey-hairline)', fontSize: 'var(--type-small)', color: 'var(--grey-7)' }}>
              <span style={{ color: 'var(--grey-9)' }}>{FLOORS.find((f) => f.id === floor)!.name}</span>
              {[current.name, ...path.map((_, i) => nodeAt(tree, path.slice(0, i + 1))!.name)].map((name, i, all) => (
                <span key={name + i} style={{ display: 'contents' }}>
                  <span aria-hidden="true" style={{ color: 'var(--grey-5)' }}>›</span>
                  {i === all.length - 1 ? (
                    <span aria-current="page" style={{ color: 'var(--grey-9)' }}>{name}</span>
                  ) : (
                    <button type="button" onClick={() => setAt((s) => ({ ...s, [current.id]: path.slice(0, Math.max(1, i)) }))} style={{ background: 'none', border: 0, padding: 0, color: 'var(--grey-8)', font: 'inherit', cursor: 'pointer' }}>
                      {name}
                    </button>
                  )}
                </span>
              ))}
            </nav>
            <div style={{ padding: 'var(--space-3) var(--space-6) var(--space-6)', display: 'grid', gap: 'var(--space-3)' }}>
              <h2 style={{ margin: 0, fontWeight: 400, fontSize: 'var(--type-title-s)' }}>{node.name}</h2>
              <p style={{ margin: 0, color: 'var(--grey-7)' }}>{node.lede}</p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, borderTop: '1px solid var(--grey-hairline)' }}>
                {(node.kids ?? []).map((k) => {
                  const p = [...path, k.id];
                  return (
                    <li key={k.id}>
                      <button type="button" className={litRow(p) ? `aerie-bar-lit${leadRow(p) ? ' aerie-bar-lead' : ''}` : undefined} style={row} onClick={() => setAt((s) => ({ ...s, [current.id]: p }))}>
                        <Icon name="folder" size={18} />
                        <b style={{ fontWeight: 500 }}>{k.name}</b>
                        <span style={{ color: 'var(--grey-7)', fontSize: 'var(--type-small)' }}>{k.n}</span>
                        <Icon name="chevron-right" size={16} />
                      </button>
                    </li>
                  );
                })}
                {(node.docs ?? []).map((d) => {
                  const need = here.find((x) => x.app === current.id && x.doc === d.t && x.path?.join() === path.join());
                  return (
                    <li key={d.t}>
                      <button type="button" className={need ? `aerie-bar-lit${here[0] === need ? ' aerie-bar-lead' : ''}` : undefined} style={row} onClick={() => setNeeds((all) => all.filter((x) => x !== need))}>
                        <Icon name="document" size={18} />
                        <span>
                          <b style={{ fontWeight: 500, display: 'block' }}>{d.t}</b>
                          <small style={{ color: 'var(--grey-6)' }}>{d.sub}</small>
                        </span>
                        <span style={{ color: 'var(--grey-7)', fontSize: 'var(--type-small)' }}>{d.st}</span>
                        <span />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

const meta = {
  title: 'Aerie/App bar',
  component: AppBar,
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div style={{ padding: 'var(--space-4)' }}>
      <Desk {...(args as unknown as DemoProps)} />
    </div>
  ),
  argTypes: {
    situation: { control: 'inline-radio', options: ['normal', 'first', 'one', 'several', 'many'] },
    attention: { control: 'inline-radio', options: ['none', 'one', 'two'] },
    holds: { control: 'inline-radio', options: ['groups', 'folder'] },
    floor: { control: 'inline-radio', options: ['org', 'dept', 'me'] },
    stop: { control: 'inline-radio', options: [0, 1, 2, 3] },
    narrow: { control: 'boolean' },
  },
  args: { situation: 'normal', attention: 'one', holds: 'groups', floor: 'dept', stop: 1, narrow: false } as never,
} satisfies Meta<typeof AppBar>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The desktop: a bar of tiles on the still horizon. Press a tile for its start menu; drag the grip, or use its arrow keys, to move the bar. */
export const Desktop: Story = {};
/** With an app open the same bar docks as the side rail: Home and Apps, what's open, then the app's pages. */
export const AppOpen: Story = { args: { openAt: 'artifacts' } as never };
/** First run: one line by the bar, once. */
export const FirstRun: Story = { args: { situation: 'first', attention: 'none' } as never };
/** Several apps open: they sit on the desktop bar after a hairline, each with its hard line. */
export const SeveralOpen: Story = { args: { situation: 'several' } as never };
/** More groups than fit: the rest go in More. */
export const ManyGroups: Story = { args: { situation: 'many', attention: 'two' } as never };
/** One app only: no groups at all, just the app. */
export const OneApp: Story = { args: { situation: 'one', attention: 'none' } as never };
/** One Apps tile holding every group as a folder. */
export const OneFolder: Story = { args: { holds: 'folder' } as never };
/** A narrow window. */
export const Narrow: Story = { args: { narrow: true, openAt: 'artifacts' } as never };

/** The still horizon on its own, on each floor. */
export const HorizonGround: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-4)', padding: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
      {(['you', 'department', 'team', 'org'] as const).map((f) => (
        <div key={f} style={{ position: 'relative', aspectRatio: '16 / 10', border: '1px solid var(--grey-4)' }}>
          <Horizon floor={f} />
          <span style={{ position: 'absolute', left: 'var(--space-3)', top: 'var(--space-3)', color: 'var(--grey-7)', fontSize: 'var(--type-small)' }}>{f}</span>
        </div>
      ))}
    </div>
  ),
};
