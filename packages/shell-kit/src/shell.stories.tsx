import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, useSyncExternalStore } from 'react';
import { Shell } from './shell.js';
import { AppPane } from './app-pane.js';
import { exampleShell, withHome } from './shell.fixture.js';
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

const SECTIONS = [
  { id: 'details', label: 'Details', icon: 'info' },
  { id: 'history', label: 'History', icon: 'clock' },
];

function Shown({ open, app = 'docs', unavailable, home, stop, pane, paneOpen }: Props) {
  const [section, setSection] = useState<string | undefined>(paneOpen);
  const [model] = useState(() => {
    const m = exampleShell(open, app);
    if (home) {
      withHome(m);
      m.background = 'water';
    }
    if (stop !== undefined) m.settings = { ...m.settings, barStop: stop };
    if (unavailable) m.functions = m.functions.map((f) => (f.id === unavailable.id ? { ...f, unavailable: unavailable.reason } : f));
    return m;
  });
  return (
    <div style={{ position: 'relative', height: '640px' }}>
      <Shell
        model={model}
        pane={
          pane
            ? ({ top, over }) => (
                <AppPane
                  app={{ name: model.openNow?.name ?? '', icon: model.openNow?.icon }}
                  sections={SECTIONS}
                  content={{ details: <p style={{ margin: 0 }}>Kept on this floor.</p> }}
                  open={section}
                  onOpenChange={setSection}
                  top={top}
                  over={over}
                />
              )
            : undefined
        }
      >
        <Stage model={model} />
      </Shell>
    </div>
  );
}

interface Props {
  open?: string;
  app?: string;
  unavailable?: { id: string; reason: string };
  home?: boolean;
  stop?: 0 | 1 | 2 | 3;
  /** Draw the app pane at the right edge. */
  pane?: boolean;
  /** The pane's section open at first. */
  paneOpen?: string;
}

function Demo(props: Props) {
  return <Shown key={JSON.stringify(props)} {...props} />;
}

const meta = { title: 'Aerie/Shell', component: Demo, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Demo>;
export default meta;
type Story = StoryObj<typeof meta>;

/** An app open on a department's floor: the band, the app bar docked as the rail with the app's pages, the floor gauge and the stage on flat ground. Every icon-only control shows its name on hover and focus. */
export const AppOpen: Story = {};
/** The app pane at the right edge, closed to its strip: the notification indicator and the clock have moved into it, and the floor gauge sits to its left. */
export const AppPaneClosed: Story = { args: { pane: true } };
/** The app pane open on a section; the stage, the band and the gauge end where it starts. */
export const AppPaneOpen: Story = { args: { pane: true, paneOpen: 'details' } };
/** The desktop: no app in front, the app bar across the still horizon, and the open app after its divider. */
export const Desktop: Story = { args: { app: '' } };
/** Home is the desktop: Home on the water, the bar across the bottom like a taskbar, the logo first. */
export const HomeDesktop: Story = { args: { app: 'home', home: true, stop: 3 } };
/** With the bar under the band, Home starts below it. */
export const HomeDesktopBarAtTop: Story = { args: { app: 'home', home: true, stop: 0 } };
/** An app open from Home: the rail, and the logo at its bottom to go back. */
export const AppOpenFromHome: Story = { args: { home: true } };
/** Summoned: the stream of what needs you. */
export const Stream: Story = { args: { open: 'stream' } };
export const Settings: Story = { args: { open: 'settings' } };
/** A function that can't be used now stays on the arc, looks unavailable and says why on hover and focus; pressing it does nothing. */
export const FunctionUnavailable: Story = {
  args: { open: 'stream', unavailable: { id: 'agents', reason: 'Agents are turned off in this workspace. An organisation admin can turn them on.' } },
};
