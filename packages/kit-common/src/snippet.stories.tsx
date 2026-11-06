import type { Meta, StoryObj } from '@storybook/react-vite';
import { Snippet } from './snippet.js';

const steps = [
  '# Publish Data Atlas to staging, then check it took',
  'augur login --as harry',
  'augur app build data-atlas',
  'augur app publish data-atlas --to staging',
  'augur app status data-atlas --watch',
  'augur logs data-atlas --since 10m',
  'augur app promote data-atlas --to live',
  'augur logout',
].join('\n');

/**
 * Code to copy: ids, keys and commands people paste somewhere else. The whole snippet is one key, raised
 * like a tab (Press to take, picked 6 Nov 2026): press it anywhere, or Enter or Space on it, and it sinks
 * and says Copied. Dragging across it still selects without copying.
 *
 * Long code shows its first `lines` and folds the rest under "Show all N lines", so a page never has to
 * scroll for it. When the browser won't let the page copy, it says so and what to do instead. `inline`
 * draws it as a small key in a sentence. Every word it says is a prop.
 */
const meta = {
  title: 'Common/Snippet',
  component: Snippet,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--measure-prose)' }}><Story /></div>],
  args: { code: 'augur app publish data-atlas --to staging', label: 'the command', lines: 4, inline: false, disabled: false },
  argTypes: {
    code: { control: 'text' },
    label: { control: 'text' },
    lines: { control: { type: 'number', min: 1 } },
    inline: { control: 'boolean' },
    state: { control: 'inline-radio', options: ['rest', 'copied', 'blocked'] },
    disabled: { control: 'boolean' },
    reason: { control: 'text' },
    copyWord: { control: 'text' },
    copiedWord: { control: 'text' },
    blockedText: { control: 'text' },
    onCopy: { action: 'copied' },
    className: { control: false },
  },
} satisfies Meta<typeof Snippet>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};

/** One command. */
export const OneLine: Story = { name: 'One line' };

/** Eight lines, folded to the first four. */
export const Folded: Story = { args: { code: steps, label: 'the publish steps' } };

/** Just pressed: it stays down a moment and says so. */
export const Copied: Story = { args: { state: 'copied' } };

/** The browser refused, so it says what to do instead. */
export const Blocked: Story = { args: { state: 'blocked' } };

/** Can't be copied now: it stays readable and says why. */
export const Unavailable: Story = { args: { code: 'ak_live_4f9e…c21b', label: 'the key', disabled: true, reason: 'Only an admin can copy a live key.' } };

/** Inside a sentence, as a small key. */
export const Inline: Story = {
  render: (args) => (
    <p style={{ margin: 0, fontSize: 'var(--type-body)', lineHeight: 'var(--leading-body)' }}>
      Send the app id <Snippet {...args} inline code="app_7f3a9c" label="the app id" /> to whoever looks after staging.
    </p>
  ),
};
