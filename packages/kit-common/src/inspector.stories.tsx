import type { Meta, StoryObj } from '@storybook/react-vite';
import { Inspector } from './inspector.js';

const call = {
  tool: 'register.write',
  input: { vessels: 22, mode: 'append', region: 'north', keys: ['imo', 'name', 'flag'] },
  output: { written: 0, error: { code: 'read-only', until: '22:00', retry: true, detail: { register: 'vessels', window: { from: '21:00', to: '22:00' } } } },
  took: 1.42,
  token: 'abc',
};

/**
 * A value a run used or made: a tool call's input and output, a record's fields (Columns, picked 6 Nov
 * 2026). Pick a key and what it holds opens in the next column; a single value opens as a Snippet you
 * press to copy. The path rides on top as a small key to copy too.
 *
 * Depth goes sideways, and past `columns` the older ones step off to the start, so it never grows down
 * or scrolls. Paths in `hidden` stay in the list and say so, and what they hold never shows. Arrow keys
 * move up and down a column, right into what a key holds, and left back out.
 */
const meta = {
  title: 'Common/Inspector',
  component: Inspector,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--measure-wide)' }}><Story /></div>],
  args: { value: call, label: 'the tool call', columns: 3, defaultPath: ['output', 'error'], hidden: ['token'], disabled: false },
  argTypes: {
    value: { control: 'object' },
    path: { control: false },
    onPathChange: { action: 'path changed' },
    className: { control: false },
  },
} satisfies Meta<typeof Inspector>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};

/** At the top, nothing picked. */
export const Top: Story = { name: 'At the top', args: { defaultPath: [] } };

/** A single value opens whole, as a Snippet to copy. */
export const Leaf: Story = { name: 'A value', args: { defaultPath: ['output', 'error', 'code'] } };

/** Deeper than `columns`: the older columns step off to the start. */
export const Deep: Story = { args: { defaultPath: ['output', 'error', 'detail', 'window'] } };

/** A hidden path stays in the list and says so. */
export const Hidden: Story = { args: { defaultPath: ['token'] } };

/** Nothing to show. */
export const Empty: Story = { args: { value: {}, emptyText: 'The tool returned nothing.' } };

/** Can't be shown, and says why. */
export const Unavailable: Story = { args: { disabled: true, reason: 'Output not kept: this tool’s results are private to its app.' } };
