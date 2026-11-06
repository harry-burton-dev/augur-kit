import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, useSyncExternalStore } from 'react';
import { Shell } from './shell.js';
import { exampleShell } from './shell.fixture.js';
import type { ShellModel } from './shell-model.js';

/** Stands in for the app: whatever is open, by name. On the desktop the stage is empty. */
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

function Shown({ open, app = 'docs', unavailable }: { open?: string; app?: string; unavailable?: { id: string; reason: string } }) {
  const [model] = useState(() => {
    const m = exampleShell(open, app);
    if (unavailable) m.functions = m.functions.map((f) => (f.id === unavailable.id ? { ...f, unavailable: unavailable.reason } : f));
    return m;
  });
  return (
    <div style={{ position: 'relative', height: '640px' }}>
      <Shell model={model}>
        <Stage model={model} />
      </Shell>
    </div>
  );
}

function Demo(props: { open?: string; app?: string; unavailable?: { id: string; reason: string } }) {
  return <Shown key={JSON.stringify(props)} {...props} />;
}

const meta = { title: 'Aerie/Shell', component: Demo, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Demo>;
export default meta;
type Story = StoryObj<typeof meta>;

/** An app open on a department's floor: the band, the app bar docked as the rail with the app's pages, the floor gauge and the stage on flat ground. Every icon-only control shows its name on hover and focus. */
export const AppOpen: Story = {};
/** The desktop: no app in front, the app bar across the still horizon, and the open app after its divider. */
export const Desktop: Story = { args: { app: '' } };
/** Summoned: the stream of what needs you. */
export const Stream: Story = { args: { open: 'stream' } };
export const Settings: Story = { args: { open: 'settings' } };
/** A function that can't be used now stays on the arc, looks unavailable and says why on hover and focus; pressing it does nothing. */
export const FunctionUnavailable: Story = {
  args: { open: 'stream', unavailable: { id: 'agents', reason: 'Agents are turned off in this workspace. An organisation admin can turn them on.' } },
};
