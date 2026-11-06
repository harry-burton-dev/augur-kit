import type { Meta, StoryObj } from '@storybook/react-vite';
import { RunLog, type RunStep } from './run-log.js';

const steps: RunStep[] = [
  {
    id: 'fetch',
    title: 'Fetch',
    status: 'done',
    at: '21:04:02',
    lines: [
      { at: '21:04:01', text: 'Reading 3 sources from the vessel register' },
      { at: '21:04:01', level: 'debug', text: 'GET /register/vessels?since=2026-11-05 200 in 140 ms' },
      { at: '21:04:02', level: 'debug', text: 'GET /register/ports 200 in 88 ms' },
      { at: '21:04:02', text: '4,812 records read' },
    ],
  },
  {
    id: 'match',
    title: 'Match',
    status: 'done',
    at: '21:04:05',
    lines: [
      { at: '21:04:03', text: 'Matching records to known vessels' },
      { at: '21:04:03', level: 'warn', text: 'IMO 9301122 has two names; kept the newer' },
      { at: '21:04:03', level: 'debug', text: 'Retrying port lookup' },
      { at: '21:04:04', level: 'debug', text: 'Retrying port lookup' },
      { at: '21:04:04', level: 'debug', text: 'Retrying port lookup' },
      { at: '21:04:05', text: '4,790 matched, 22 new' },
    ],
  },
  {
    id: 'write',
    title: 'Write',
    status: 'failed',
    at: '21:04:32',
    lines: [
      { at: '21:04:05', level: 'needs', text: '22 new vessels need your OK before they are written' },
      { at: '21:04:31', text: 'Approved by Harry; writing 22 vessels' },
      { at: '21:04:32', level: 'error', text: 'Write refused: the register is read-only until 22:00' },
    ],
  },
  { id: 'report', title: 'Report', status: 'queued', lines: [], note: 'Starts after Write.' },
];

/**
 * A run's log, step by step (Steps, picked 6 Nov 2026): an agent's steps, a data job, a deploy. Each step
 * is a fold in a sunken tray with its status and when it last moved; the open one rises as a key and its
 * lines sit under it in a Well.
 *
 * The step that most needs looking at opens itself: failed, then needs you, then running. An open step
 * shows only its last `lastLines`, and earlier ones page in on a press, so the page never scrolls. A line's
 * level is a word as well as a colour: red is a failure, amber a warning, green only a line that needs you.
 * A step whose lines are gone stays in the run and says why.
 */
const meta = {
  title: 'Common/Run log',
  component: RunLog,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--measure-prose)' }}><Story /></div>],
  args: { steps, label: 'the vessel import', lastLines: 4 },
  argTypes: {
    lastLines: { control: { type: 'number', min: 1, max: 12 } },
    open: { control: false },
    defaultOpen: { control: 'text' },
    onOpenChange: { action: 'open changed' },
    steps: { control: 'object' },
    levelWords: { control: 'object' },
    className: { control: false },
  },
} satisfies Meta<typeof RunLog>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. The failed step opens itself. */
export const Playground: Story = {};

/** Waiting on you: the step that needs you opens, with its green line. */
export const NeedsYou: Story = {
  name: 'Needs you',
  args: {
    steps: [
      steps[0]!,
      steps[1]!,
      { id: 'write', title: 'Write', status: 'needs', at: '21:04:05', lines: [steps[2]!.lines[0]!] },
      { id: 'report', title: 'Report', status: 'queued', lines: [], note: 'Starts after Write.' },
    ],
  },
};

/** Still going: the running step is open and new lines are read out as they come. */
export const Running: Story = {
  args: {
    steps: [steps[0]!, { ...steps[1]!, status: 'running', at: undefined, lines: steps[1]!.lines.slice(0, 4) }, { id: 'write', title: 'Write', status: 'queued', lines: [] }],
  },
};

/** A long step shows its last lines; the rest page in. */
export const Earlier: Story = { name: 'Earlier lines', args: { defaultOpen: 'match', lastLines: 2 } };

/** A step whose lines are gone stays in the run and says why. */
export const Unavailable: Story = {
  args: {
    steps: [{ ...steps[0]!, disabled: true, reason: 'This step’s lines are gone: logs are kept for 7 days.' }, steps[1]!, steps[2]!],
  },
};

/** Nothing yet. */
export const Empty: Story = { args: { steps: [] } };
