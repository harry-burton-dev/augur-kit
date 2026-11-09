import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, useSyncExternalStore } from 'react';
import { Shell } from './shell.js';
import { Connection } from './connection.js';
import { exampleShell } from './shell.fixture.js';
import type { ShellModel } from './shell-model.js';
import './rail-joint.directions.css';

type Joint = 'today' | 'corner' | 'field' | 'keystone';

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

function Shown({ joint, app, width, offline }: { joint: Joint; app: string; width?: string; offline?: boolean }) {
  const [model] = useState(() => exampleShell(undefined, app));
  return (
    <div data-joint={joint === 'today' ? undefined : joint} style={{ position: 'relative', height: '640px', width: width ?? '100%', transform: 'translateZ(0)' }}>
      <Shell model={model}>
        <Stage model={model} />
      </Shell>
      {offline ? <Connection state="offline" /> : null}
    </div>
  );
}

/** Where the docked rail meets the band. The rail belongs to the shell's ground (Harry, 9 Nov 2026); each direction draws the joint differently. */
function Directions(props: { joint: Joint; app?: string; width?: string; offline?: boolean }) {
  const { app = 'docs', ...rest } = props;
  return <Shown key={JSON.stringify(props)} app={app} {...rest} />;
}

const meta = {
  title: 'Aerie/Directions/Rail joint',
  component: Directions,
  parameters: { layout: 'fullscreen' },
  argTypes: { joint: { control: 'inline-radio', options: ['today', 'corner', 'field', 'keystone'] } },
} satisfies Meta<typeof Directions>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Today: the rail is see-through, its top hairline stops at its own edge, and the band has no line, so the two never meet. */
export const Today: Story = { args: { joint: 'today' } };

/** A, Corner: band and rail are one grey L, and one hairline runs along the band's foot and turns down the rail's edge on the same pixel. */
export const ACorner: Story = { name: 'A Corner', args: { joint: 'corner' } };
export const ACornerNarrow: Story = { name: 'A Corner, narrow', args: { joint: 'corner', width: 'min(100%, 640px)' } };
export const ACornerOffline: Story = { name: 'A Corner, offline', args: { joint: 'corner', offline: true } };
/** Press Documents to watch the bar glide into the corner. */
export const ACornerGlide: Story = { name: 'A Corner, glide', args: { joint: 'corner', app: '' } };

/** B, Field: the same grey L with no line at all; the step from the shell's grey to the app's darker ground is the only edge. */
export const BField: Story = { name: 'B Field', args: { joint: 'field' } };
export const BFieldNarrow: Story = { name: 'B Field, narrow', args: { joint: 'field', width: 'min(100%, 640px)' } };
export const BFieldOffline: Story = { name: 'B Field, offline', args: { joint: 'field', offline: true } };
export const BFieldGlide: Story = { name: 'B Field, glide', args: { joint: 'field', app: '' } };

/** C, Keystone: the rail rises the full height and Home and Apps sit in the corner square, level with the band; one line turns the corner. */
export const CKeystone: Story = { name: 'C Keystone', args: { joint: 'keystone' } };
export const CKeystoneNarrow: Story = { name: 'C Keystone, narrow', args: { joint: 'keystone', width: 'min(100%, 640px)' } };
export const CKeystoneOffline: Story = { name: 'C Keystone, offline', args: { joint: 'keystone', offline: true } };
export const CKeystoneGlide: Story = { name: 'C Keystone, glide', args: { joint: 'keystone', app: '' } };
