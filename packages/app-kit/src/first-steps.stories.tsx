import type { Meta, StoryObj } from '@storybook/react-vite';
import { FirstSteps } from './guide.js';

/**
 * The first few things to do in a new app, drawn in the **Lamp** look. It's a section of the app's own
 * start page, not something over it: a label with how many are done, a hairline, and the steps.
 *
 * - A done step is checked and quiet. Only the next step carries its action, so there's one thing to do.
 * - Hide for now puts it away. The app keeps that, and brings it back from Help.
 * - Keep it to three to five steps. When every one is done, the app stops showing it.
 *
 * It's never green, because it's an offer and doesn't need you. Every word is a prop. To point at
 * the parts one at a time, see Guide.
 */
const meta = {
  title: 'Patterns/First-run guide/First steps',
  component: FirstSteps,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 'var(--measure-read)' }}><Story /></div>],
  args: {
    steps: [
      { id: 'make', label: 'Make your first plan', done: true },
      { id: 'filter', label: 'Filter the list by owner', done: true },
      { id: 'share', label: 'Share a plan with your team', action: 'Share' },
      { id: 'remind', label: 'Turn on weekly reminders', action: 'Turn on' },
    ],
    heading: 'First steps',
    hideLabel: 'Hide for now',
    onHide: () => {},
  },
  argTypes: {
    heading: { control: 'text' },
    hideLabel: { control: 'text' },
    doneLabel: { control: 'text' },
    count: { control: false },
    onHide: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof FirstSteps>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};

/** Two of four done: the next one carries its action. */
export const Partway: Story = {};

/** Nothing done yet. */
export const Start: Story = {
  args: {
    steps: [
      { id: 'make', label: 'Make your first plan', action: 'New plan' },
      { id: 'filter', label: 'Filter the list by owner', action: 'Filter' },
      { id: 'share', label: 'Share a plan with your team', action: 'Share' },
    ],
  },
};

/** Without `onHide` it can't be put away, so there's no Hide. */
export const CantHide: Story = { args: { onHide: undefined } };
