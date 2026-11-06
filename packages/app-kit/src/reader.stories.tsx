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
 * you read. Markdown loads the first time a reader draws (`loadReader` loads it sooner).
 */
const meta = {
  title: 'Quill/Reader/Reader',
  component: Reader,
  tags: ['autodocs'],
  args: { markdown: BRIEF, size: 'medium', width: 'narrow', heading: '' },
  argTypes: {
    markdown: { control: 'text' },
    size: { control: 'inline-radio', options: ['small', 'medium', 'large'] },
    width: { control: 'inline-radio', options: ['narrow', 'wide'] },
    heading: { control: 'text' },
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
