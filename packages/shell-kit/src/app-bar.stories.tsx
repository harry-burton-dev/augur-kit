import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { AppBar, type AppBarProps, type BarGroup, type BarLight, type BarPage } from './app-bar.js';

/* Sample content, from Harry's app bar mockup. Names are examples. */
type Floor = 'org' | 'dept' | 'me';
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

/** The open app's pages: a tile each in the side rail. */
const PAGES: Record<string, BarPage[]> = {
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
const pagesOf = (id: string): BarPage[] => PAGES[id] ?? [
  { id: 'overview', name: 'Overview', icon: 'dashboard' },
  { id: 'activity', name: 'Activity', icon: 'pulse' },
];

/** What needs you: the budget draft in Artifacts › Library › Finance, and a task in Mandate. The first one leads. */
const ONE: BarLight[] = [{ app: 'artifacts', path: ['library', 'finance'] }];
const TWO: BarLight[] = [...ONE, { app: 'mandate', path: ['tasks'] }];
const GROUPS = groupsOn('dept');

/**
 * The bar with the props from the Controls panel. It sits in a frame that stands in for the screen,
 * because it rests in and docks against a positioned host. Backgrounds have their own section. Pressing it changes
 * the props the way the shell would: opening an app docks it, Home brings it back.
 */
function Live(props: AppBarProps & { width?: string }) {
  const { width, ...args } = props;
  const [p, setP] = useState<AppBarProps>(args);
  useEffect(() => setP(args), [JSON.stringify(args)]); // eslint-disable-line react-hooks/exhaustive-deps
  const apps = p.groups.flatMap((g) => g.apps);
  const open = (id: string) => {
    args.onOpen?.(id);
    if (id === 'home' && apps.length > 1) return setP((s) => ({ ...s, mode: 'desk' }));
    const a = apps.find((x) => x.id === id);
    if (!a || a.off) return;
    setP((s) => {
      const pages = pagesOf(id);
      return { ...s, mode: 'app', app: id, pages, page: s.app === id || !pages.some((x) => x.id === s.page) ? pages[0]!.id : s.page, running: s.running?.includes(id) ? s.running : [...(s.running ?? []), id] };
    });
  };
  return (
    <div style={{ position: 'relative', width: width ?? '100%', aspectRatio: '16 / 10', minHeight: 560, overflow: 'hidden', background: p.mode === 'app' ? 'var(--grey-1)' : 'var(--grey-0)' }}>
      <AppBar
        {...p}
        onOpen={open}
        onHome={() => (args.onHome?.(), setP((s) => ({ ...s, mode: 'desk' })))}
        onPage={(id) => (args.onPage?.(id), setP((s) => ({ ...s, page: id })))}
        onStop={(stop) => (args.onStop?.(stop), setP((s) => ({ ...s, stop })))}
        onHintDone={() => (args.onHintDone?.(), setP((s) => ({ ...s, hint: undefined })))}
        onClose={(id) => {
          args.onClose?.(id);
          setP((s) => {
            const running = (s.running ?? []).filter((x) => x !== id);
            const next = s.app === id ? running[running.length - 1] : s.app;
            return { ...s, running, app: next, mode: next ? 'app' : 'desk', pages: next ? pagesOf(next) : [], page: next ? pagesOf(next)[0]!.id : undefined };
          });
        }}
      />
    </div>
  );
}

const meta = {
  title: 'Aerie/App bar',
  component: AppBar,
  parameters: { layout: 'padded' },
  render: (args) => <Live {...args} />,
  argTypes: {
    mode: { control: 'inline-radio', options: ['desk', 'app'] },
    holds: { control: 'inline-radio', options: ['groups', 'folder'] },
    stop: { control: 'inline-radio', options: [0, 1, 2, 3] },
    app: { control: 'select', options: [undefined, ...GROUPS.flatMap((g) => g.apps.map((a) => a.id))] },
    page: { control: 'text' },
    hint: { control: 'text' },
    running: { control: 'object' },
    light: { control: 'object' },
    groups: { control: 'object' },
    pages: { control: 'object' },
    defaultStop: { table: { disable: true } },
  },
  args: { groups: GROUPS, holds: 'groups', mode: 'desk', running: [], light: ONE, stop: 1 },
} satisfies Meta<typeof AppBar>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The desktop: a bar of tiles. Press a tile for its start menu; drag the grip, or use its arrow keys, to move the bar. */
export const Desktop: Story = {};
/** With an app open the same bar docks as the side rail: Home and Apps, what's open, then the app's pages. */
export const AppOpen: Story = { args: { mode: 'app', app: 'artifacts', running: ['artifacts'], pages: pagesOf('artifacts'), page: 'library' } };
/** First run: one line by the bar, once. */
export const FirstRun: Story = { args: { hint: 'Everything lives in these tiles. Press one to see what’s inside.', light: [] } };
/** Apps that are open sit on the desktop bar after a hairline, each with its hard line. */
export const SeveralOpen: Story = { args: { running: ['artifacts', 'mandate', 'explorer'] } };
/** Two things need you: both paths are lit, and only the first breathes. */
export const TwoNeedYou: Story = { args: { light: TWO } };
/** More groups than fit: the rest go in More. */
export const ManyGroups: Story = { args: { groups: [...GROUPS, ...MANY], light: TWO } };
/** A single app and nothing else: no groups, just the app. */
export const OneApp: Story = { args: { groups: [{ id: 'only', name: 'Artifacts', icon: 'library', apps: [{ id: 'artifacts', name: 'Artifacts', icon: 'library', line: 'What your floors keep' }] }], light: [] } };
/** One Apps tile holding every group as a folder. */
export const OneFolder: Story = { args: { holds: 'folder' } };
/** A narrow window: smaller tiles, and a narrower rail. */
export const Narrow: Story = { render: (args) => <Live {...args} width="min(100%, 640px)" />, args: { mode: 'app', app: 'artifacts', running: ['artifacts'], pages: pagesOf('artifacts'), page: 'library' } };
