import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Button } from './button.js';
import { Icon } from './icon.js';

const Row = ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>{children}</div>
);

/**
 * A labelled action, drawn as a key (Keycap): flat, square, and its depth in a thicker
 * bottom line rather than a shadow or a glow. Pressed, the line closes and the key sinks. Buttons have
 * no colour of their own: green means "needs you" and red means danger, so the primary is the one light
 * key on a screen.
 *
 * - **Primary**: the one action a screen exists for. One per screen.
 * - **Secondary**: any other action that earns a place on the screen.
 * - **Ghost**: a quiet action beside a primary, such as Cancel. It shows its key on hover.
 * - **Tertiary**: a link in a line of text, underlined so it reads as one without colour.
 * - **Danger**: asks twice. The first press arms it and counts down; a second acts.
 *
 * Name a button for what it does ("Publish", never "OK"). An unavailable button stays focusable and
 * says why, and a working one says what it is doing.
 */
const meta = {
  title: 'Common/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { children: 'Publish', kind: 'primary', size: 'md' },
  argTypes: {
    kind: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost', 'tertiary', 'danger'] },
    size: { control: 'inline-radio', options: ['md', 'sm'] },
    children: { control: 'text' },
    icon: { control: false },
    reason: { control: 'text' },
    busyLabel: { control: 'text' },
    confirmLabel: { control: 'text' },
    armFor: { control: { type: 'number', step: 500 } },
    className: { control: false },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};

/** The one light key on the screen. */
export const Primary: Story = {};
/** A grey key, for any other action on the screen. */
export const Secondary: Story = { args: { kind: 'secondary', children: 'Save draft' } };
/** No key until you point at it. Sits beside a primary. */
export const Ghost: Story = { args: { kind: 'ghost', children: 'Cancel' } };
/** A link in a line of text. */
export const Tertiary: Story = { args: { kind: 'tertiary', children: 'Show all 24' } };
/** Asks twice: press once to arm it, again within the time to act. Esc or leaving puts it back. */
export const Danger: Story = { args: { kind: 'danger', children: 'Delete plan', confirmLabel: 'Press again to delete' } };

/** Every kind, side by side. */
export const Kinds: Story = {
  render: () => (
    <Row>
      <Button kind="primary">Publish</Button>
      <Button kind="secondary">Save draft</Button>
      <Button kind="ghost">Cancel</Button>
      <Button kind="tertiary">Show all 24</Button>
      <Button kind="danger" confirmLabel="Press again to delete">Delete plan</Button>
    </Row>
  ),
};

/** 48px for a screen's actions, 36px in a toolbar or a row. */
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      {(['md', 'sm'] as const).map((size) => (
        <Row key={size}>
          <Button {...args} size={size} kind="primary">Publish</Button>
          <Button {...args} size={size} kind="secondary">Save draft</Button>
          <Button {...args} size={size} kind="ghost">Cancel</Button>
          <Button {...args} size={size} kind="danger">Delete</Button>
        </Row>
      ))}
    </div>
  ),
};

/** An icon before the label. The icon is any node, so the set can change; the label still names the action. */
export const WithIcon: Story = { args: { kind: 'secondary', children: 'New plan', icon: <Icon name="plus" size={16} /> } };

/** A dialog's or a form's footer: the quiet way out, then the one primary. */
export const Footer: Story = {
  render: () => (
    <Row>
      <Button kind="ghost">Cancel</Button>
      <Button kind="primary">Publish</Button>
    </Row>
  ),
};

/** Working: the press is taken, it does nothing more, and it says so. */
export const Busy: Story = { args: { busy: true, busyLabel: 'Publishing' } };
/** Stays focusable and says why on hover and focus. */
export const Unavailable: Story = { args: { kind: 'secondary', disabled: true, reason: 'Only an admin of this floor can publish.' } };
/** Danger inside a confirmation already: acts on the first press. */
export const DangerOnce: Story = { args: { kind: 'danger', children: 'Delete plan', once: true } };
/** Asks the AI (Bubble). */
export const AI: Story = { args: { kind: 'primary', ai: true, children: 'Summarise' } };
