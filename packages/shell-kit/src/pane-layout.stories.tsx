import type { Meta, StoryObj } from '@storybook/react-vite';
import { Screen } from './app-bar.fixture.js';
import { PaneLayout } from './pane-layout.js';

/*
 * The frame round one app's pane, in the layout the app chose by name in its manifest
 * (`contributes.frame.layout`) or for one page (`ctx.frame.set`). Every layout keeps the inset contract:
 * the head and the screen line up, the top clears the stage's fade, and sections are section-gap apart.
 * The words are examples.
 */
const part = (title: string) => (
  <div style={{ border: '1px solid var(--hairline)', borderRadius: 'var(--radius-card)', padding: 'var(--region-inset-block) var(--region-inset-inline)' }}>
    <strong>{title}</strong>
    <p style={{ margin: 0 }}>A part of the app's screen.</p>
  </div>
);
const about = <aside style={{ flex: 'none', width: 'var(--about-panel)', borderInlineStart: '1px solid var(--hairline)', padding: 'var(--region-inset-block) var(--region-inset-inline)' }}>About</aside>;

const meta = {
  title: 'Aerie/Frame/Pane layout',
  component: PaneLayout,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { layout: 'focus', head: <h1 style={{ margin: 0 }}>Page title</h1>, about, children: [part('First'), part('Second'), part('Third')] },
  argTypes: {
    layout: { control: 'inline-radio', options: ['focus', 'aside', 'split', 'canvas'] },
    width: { control: 'inline-radio', options: ['read', 'wide', 'full'] },
    density: { control: 'inline-radio', options: ['comfortable', 'compact'] },
    inset: { control: 'inline-radio', options: ['standard', 'flush'] },
  },
  decorators: [(Story) => <Screen height={560}>{Story()}</Screen>],
} satisfies Meta<typeof PaneLayout>;
export default meta;
type Story = StoryObj<typeof meta>;

/** One column at the reading width: the default for an app with no About sections. */
export const Focus: Story = {};
/** The main column with the About panel beside it. */
export const Aside: Story = { args: { layout: 'aside' } };
/** A list and its detail, each padding itself, a hairline between; the detail wraps under the list when narrow. */
export const Split: Story = { args: { layout: 'split', children: [<div key="l">{part('List')}</div>, <div key="d">{part('Detail')}{part('More detail')}</div>] } };
/** The whole pane, edge to edge, for a map or a board; the head keeps its inset. */
export const Canvas: Story = { args: { layout: 'canvas', children: <div style={{ height: '100%', background: 'var(--grey-1)' }} /> } };
/** Compact density: the same layout with the role tokens a step tighter. */
export const Compact: Story = { args: { density: 'compact' } };
