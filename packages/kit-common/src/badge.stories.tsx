import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Badge } from './badge.js';
import { Icon } from './icon.js';
import { IconButton } from './icon-button.js';

const Row = ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', flexWrap: 'wrap' }}>{children}</div>
);

/**
 * A count or a word on something else, drawn as a small key like the Keycap button. Numbers are mono.
 *
 * - **Plain**: how many, or what state ("12", "Draft").
 * - **Needs**: the one colour, for what needs you. A count fills green; a word is green.
 * - **Danger**: a red edge, for what's gone wrong.
 * - **Dot**: something new, with no words. Give it a `label`.
 * - **On**: put it on the corner of what it marks, such as an icon button.
 *
 * A badge says how many or what state. A thing filed under a word is a Tag.
 */
const meta = {
  title: 'Common/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { children: 12, tone: 'plain' },
  argTypes: {
    tone: { control: 'inline-radio', options: ['plain', 'needs', 'danger'] },
    children: { control: 'text' },
    label: { control: 'text' },
    dot: { control: 'boolean' },
    on: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};

/** A count. */
export const Count: Story = {};
/** What needs you: the one green. */
export const Needs: Story = { args: { children: 3, tone: 'needs', label: '3 need you' } };
/** What has gone wrong. */
export const Danger: Story = { args: { children: 1, tone: 'danger', label: '1 failed' } };
/** A state in a word. */
export const Word: Story = { args: { children: 'Draft' } };

/** Every kind, side by side. */
export const Kinds: Story = {
  render: () => (
    <Row>
      <Badge>12</Badge>
      <Badge tone="needs" label="3 need you">
        3
      </Badge>
      <Badge tone="danger" label="1 failed">
        1
      </Badge>
      <Badge>Draft</Badge>
      <Badge tone="needs">Needs you</Badge>
    </Row>
  ),
};

/** On the corner of what it marks. The icon button still says its own name; the badge adds how many. */
export const OnSomething: Story = {
  render: () => (
    <Row>
      <Badge on={<IconButton icon="bell" label="Notifications, 2 need you" />} tone="needs">
        2
      </Badge>
      <Badge on={<Icon name="inbox" size={20} />} dot label="New" />
    </Row>
  ),
};
