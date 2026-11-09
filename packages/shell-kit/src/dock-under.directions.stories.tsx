import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, useSyncExternalStore } from 'react';
import { Shell } from './shell.js';
import { Connection } from './connection.js';
import { exampleShell } from './shell.fixture.js';
import type { ShellModel } from './shell-model.js';
import './dock-under.directions.css';

function Stage({ model }: { model: ShellModel }) {
  useSyncExternalStore(model.subscribe, model.getRevision, model.getRevision);
  const app = model.openNow;
  if (!app) return null;
  const page = app.pages?.find((p) => p.id === model.page) ?? app.pages?.[0];
  return (
    <div style={{ padding: 'var(--space-6) var(--edge)' }}>
      <h1>{page ? `${app.name}: ${page.name}` : app.name}</h1>
      <p>The open app sits in the Shell’s one main landmark.</p>
    </div>
  );
}

function Shown({ dock, app, width, offline }: { dock: 'full' | 'under'; app: string; width?: string; offline?: boolean }) {
  const [model] = useState(() => exampleShell(undefined, app));
  return (
    <div data-dock={dock === 'under' ? 'under' : undefined} style={{ position: 'relative', height: '640px', width: width ?? '100%', transform: 'translateZ(0)' }}>
      <Shell model={model}>
        <Stage model={model} />
      </Shell>
      {offline ? <Connection state="offline" /> : null}
    </div>
  );
}

/** Two ways to dock the app bar, side by side: the full-height dock the kit draws, and the rail under the band with the floors in it. */
function Dock(props: { dock: 'full' | 'under'; app?: string; width?: string; offline?: boolean }) {
  const { app = 'docs', ...rest } = props;
  return <Shown key={JSON.stringify(props)} app={app} {...rest} />;
}

const meta = {
  title: 'Aerie/Directions/Dock under the band',
  component: Dock,
  parameters: { layout: 'fullscreen' },
  argTypes: { dock: { control: 'inline-radio', options: ['full', 'under'] } },
} satisfies Meta<typeof Dock>;
export default meta;
type Story = StoryObj<typeof meta>;

/** What the kit draws: the rail stands the full height and the band starts beside it. */
export const FullHeight: Story = { args: { dock: 'full' } };
/** The rail sits under the band, one line runs right across at the band's foot, and the floors sit at the rail's foot. */
export const Under: Story = { args: { dock: 'under' } };
export const UnderNarrow: Story = { name: 'Under, narrow', args: { dock: 'under', width: 'min(100%, 640px)' } };
export const UnderOffline: Story = { name: 'Under, offline', args: { dock: 'under', offline: true } };
/** Press Documents to watch the bar dock under the band. */
export const UnderGlide: Story = { name: 'Under, glide', args: { dock: 'under', app: '' } };
