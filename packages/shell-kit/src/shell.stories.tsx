import type { Meta, StoryObj } from '@storybook/react-vite';
import { Shell } from './shell.js';
import { exampleShell } from './shell.fixture.js';

function Demo({ open, unavailable }: { open?: string; unavailable?: { id: string; reason: string } }) {
  const model = exampleShell(open);
  if (unavailable) model.functions = model.functions.map((f) => (f.id === unavailable.id ? { ...f, unavailable: unavailable.reason } : f));
  return (
    <div style={{ position: 'relative', height: '640px' }}>
      <Shell model={model}>
        <div style={{ padding: 'var(--space-6) var(--edge)' }}>
          <h1>Documents</h1>
          <p>The open app sits in the Shell’s one main landmark.</p>
        </div>
      </Shell>
    </div>
  );
}

const meta = { title: 'Aerie/Shell', component: Demo, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Demo>;
export default meta;
type Story = StoryObj<typeof meta>;

/** An app open on a department's floor: the band, the floor gauge and the stage. Every icon-only control shows its name on hover and focus. */
export const AppOpen: Story = {};
/** Summoned: the stream of what needs you. */
export const Stream: Story = { args: { open: 'stream' } };
export const Settings: Story = { args: { open: 'settings' } };
/** A function that can't be used now stays on the arc, looks unavailable and says why on hover and focus; pressing it does nothing. */
export const FunctionUnavailable: Story = {
  args: { open: 'stream', unavailable: { id: 'agents', reason: 'Agents are turned off in this workspace. An organisation admin can turn them on.' } },
};
