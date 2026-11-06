import type { Meta, StoryObj } from '@storybook/react-vite';
import { Reader } from './reader.js';

const BRIEF = `# Winter works

The quay wall closes to traffic from **1 December** while the berths are dredged.

## What changes

- Deliveries move to the east gate.
- The crane schedule is kept in [the crane plan](#what-changes).

## Who to ask

The site lead answers questions about access. Anything about pay goes to People.
`;

/**
 * A document to read, from its Markdown: set for reading, at a measure that keeps lines short,
 * with its headings as anchors. `size` sets the type and `width` the measure. When the page shows
 * the title above, pass it as `heading` and a first heading that only repeats it is left out.
 * `onOutline` hands the headings to Contents, and `onPosition` says which block is at the top as
 * you read. `flow` sets how it runs: down a column, as leaves that turn (give it a height), or with
 * all but your section dimmed; ReadingView puts these together with contents. Markdown loads the first time a reader draws (`loadReader` loads it sooner).
 */
const meta = {
  title: 'Quill/Reader/Reader',
  component: Reader,
  tags: ['autodocs'],
  args: { markdown: BRIEF, size: 'medium', width: 'narrow', heading: '', flow: 'scroll', spread: 1 },
  argTypes: {
    markdown: { control: 'text' },
    size: { control: 'inline-radio', options: ['small', 'medium', 'large'] },
    width: { control: 'inline-radio', options: ['narrow', 'wide'] },
    heading: { control: 'text' },
    flow: { control: 'inline-radio', options: ['scroll', 'leaves', 'horizon'] },
    spread: { control: 'inline-radio', options: [1, 2] },
    onLeaf: { action: 'leaf' },
    imageSource: { control: false },
    onOutline: { action: 'outline' },
    onPosition: { action: 'position' },
    ref: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof Reader>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};
/** Smaller type, for a side panel. */
export const Small: Story = { args: { size: 'small' } };
/** The page shows the title above, so the document's own first heading is left out. */
export const TitleAbove: Story = { args: { heading: 'Winter works' } };
/** As leaves in a fixed height: turn with the arrow keys once it has focus. */
export const Leaves: Story = { args: { flow: 'leaves' }, decorators: [(Story) => <div style={{ height: 'var(--measure-rail)' }}><Story /></div>] };
/** Horizon: the section at the top reads at full ink, the rest dimmed. */
export const Horizon: Story = { args: { flow: 'horizon' } };
