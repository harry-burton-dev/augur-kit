import type { Meta, StoryObj } from '@storybook/react-vite';
import { Path, type PathStep } from './things.js';

const STEPS: PathStep[] = [
  { id: 'you', floor: 'personal', title: 'Your desk', line: 'Drafted here' },
  { id: 'ops', floor: 'team', title: 'Ops', line: 'Reviews it', mark: 'You’re here', here: true },
  { id: 'org', floor: 'org', title: 'Organisation', line: 'Decides it', mark: 'Refused', markTone: 'no' },
];

/**
 * A chain of floors or steps, with the one you're on marked. Drawn as Key: the steps sit in a well,
 * joined top to bottom, and the one you're on comes up as a soft key. A floor is told by its icon in
 * a ring, not by its colour, because the personal floor's colour is green and green only means
 * "needs you". A step's mark is a word or two in mono; a step that refuses or blocks is red.
 */
const meta = {
  title: 'Quill/Path',
  component: Path,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 'var(--measure-decision)' }}>{Story()}</div>],
  args: { steps: STEPS },
  argTypes: { steps: { control: 'object' }, onOpen: { action: 'open' }, className: { control: false } },
} satisfies Meta<typeof Path>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};

/** Two steps, the second where you are. */
export const Short: Story = { args: { steps: [STEPS[2]!, { ...STEPS[1]!, mark: undefined }] } };
