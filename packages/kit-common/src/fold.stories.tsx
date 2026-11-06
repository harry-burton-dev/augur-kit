import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Fold, Folds } from './fold.js';
import { Icon } from './icon.js';

const Setting = ({ name, children }: { name: string; children: ReactNode }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', fontSize: 'var(--type-meta)', lineHeight: 'var(--leading-meta)' }}>
    <span>{name}</span>
    <span style={{ color: 'var(--ink-muted)' }}>{children}</span>
  </div>
);

const set = (
  <>
    <Fold id="notify" title="Notifications" summary="3 on">
      <Setting name="When someone shares with you">On</Setting>
      <Setting name="When a run fails">On</Setting>
      <Setting name="A daily summary">On, at 08:00</Setting>
    </Fold>
    <Fold id="access" title="Access" summary="1 needs you" needs>
      <Setting name="Who can open it">Ops and People</Setting>
      <Setting name="Priya asked to edit">Waiting for you</Setting>
    </Fold>
    <Fold id="storage" title="Storage" summary="2.4 GB of 10 GB">
      <Setting name="Keep old versions for">90 days</Setting>
    </Fold>
    <Fold id="billing" title="Billing" summary="Owners only" disabled reason="Only the floor’s owner can open billing." />
  </>
);

/**
 * Folds keep a long settings or details page to one screen: each heading opens what it holds (Drawer,
 * picked 6 Nov 2026). They sit in a sunken tray like the Key tabs; the open one rises as a key and what
 * it holds opens under it as a Well.
 *
 * Each `Fold` can carry a short `summary` of what's inside, so you can tell without opening, and `needs`
 * puts the green mark on one that holds something waiting on you. An unavailable fold stays in the set,
 * focusable, and says why. One open at a time, unless `multiple`.
 */
const meta = {
  title: 'Common/Folds',
  component: Folds,
  subcomponents: { Fold },
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--measure-prose)' }}><Story /></div>],
  args: { multiple: false, defaultOpen: ['notify'], children: set },
  argTypes: {
    multiple: { control: 'boolean' },
    defaultOpen: { control: 'object' },
    open: { control: false },
    onOpenChange: { action: 'open changed' },
    children: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof Folds>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};

/** All shut: the summaries say what each holds. */
export const AllShut: Story = { name: 'All shut', args: { defaultOpen: [] } };

/** More than one open at once. */
export const Multiple: Story = { args: { multiple: true, defaultOpen: ['notify', 'access'] } };

/** Icons before the titles, any node, so the set can change. */
export const WithIcons: Story = {
  name: 'With icons',
  args: {
    defaultOpen: [],
    children: (
      <>
        <Fold id="notify" title="Notifications" summary="3 on" icon={<Icon name="bell" size={16} />}>
          <Setting name="When a run fails">On</Setting>
        </Fold>
        <Fold id="people" title="People" summary="12" icon={<Icon name="people" size={16} />}>
          <Setting name="Members">12</Setting>
        </Fold>
      </>
    ),
  },
};
