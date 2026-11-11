import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { Shell } from './shell.js';
import { exampleShell } from './shell.fixture.js';
import type { ShellFloor } from './floors.js';

/** A person's floors: their own, a team, the department it's in, and the org. Names are examples. */
const org = { id: 'org', kind: 'org' as const, name: 'Example Org' };
const dept = { id: 'dept', kind: 'team' as const, name: 'Example Department', level: 'Department' };
const team = { id: 'team', kind: 'team' as const, name: 'Example Team', level: 'Team' };
const floors: ShellFloor[] = [
  { id: 'me', kind: 'personal', name: 'Sam Lee', path: [{ id: 'me', kind: 'personal', name: 'Sam Lee' }] },
  { ...team, path: [org, dept, team] },
  { ...dept, path: [org, dept] },
  { ...org, path: [org] },
];

interface DemoProps {
  /** The floor you start on. */
  floor?: string;
  /** The open app, or '' for the desktop. */
  app?: string;
  /** The open app shows the same on every floor, so the picker rests. */
  same?: boolean;
}

/** The picker in the Shell, where it lives. Choosing a floor goes there, as the host would. */
function Shown({ floor = 'team', app = 'docs', same = false }: DemoProps) {
  const [model] = useState(() => {
    const m = exampleShell(undefined, app);
    m.floors = floors;
    m.floor = floor;
    if (same) m.apps = m.apps.map((a) => (a.id === app ? { ...a, sameOnEveryFloor: true } : a));
    m.notifications = [
      ...m.notifications,
      { id: 'n3', app: 'mandate', level: 'needs', title: 'Agree the team’s aims', time: '2026-11-03T09:30:00Z', floor: 'org' },
      { id: 'n4', app: 'docs', level: 'needs', title: 'Sign the travel policy', time: '2026-11-03T09:10:00Z', floor: 'org' },
    ];
    return m;
  });
  useEffect(() => {
    const go = (e: Event) => {
      model.floor = (e as CustomEvent<{ id: string }>).detail.id;
      model.requestUpdate();
    };
    model.addEventListener('ui-floor', go);
    return () => model.removeEventListener('ui-floor', go);
  }, [model]);
  return (
    <div style={{ position: 'relative', height: '640px' }}>
      <Shell model={model} />
    </div>
  );
}

function Demo(props: DemoProps) {
  return <Shown key={JSON.stringify(props)} {...props} />;
}

const meta = { title: 'Aerie/Floor picker', component: Demo, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Demo>;
export default meta;
type Story = StoryObj<typeof meta>;

/** On a team's floor with an app open: four floors, yours lit, dots where something waits. Point at the right edge to open it out. */
export const InAnApp: Story = {};
/** On the desktop, on your own floor. */
export const OnTheDesktop: Story = { args: { app: '', floor: 'me' } };
/** The open app is the same on every floor, so the picker rests and says why. */
export const Resting: Story = { args: { same: true } };
