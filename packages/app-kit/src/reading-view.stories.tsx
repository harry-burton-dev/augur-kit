import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReadingView } from './reading-view.js';

const DOC = `# Winter works

The quay wall closes to traffic from **1 December** while the berths are dredged. The work runs for six weeks, and the wall reopens in the second week of January if the weather holds.

Dredging can't share the quay with lorries: the barges need the whole length, and the crane sits over the water for most of each day.

## What changes

- Deliveries move to the east gate, which opens at six from the first.
- The crane keeps its Monday slot; anything heavy comes in by Thursday.
- Parking by the wall goes for the six weeks.

The new times are in the crane plan. The site office keeps a printed copy by the gate, and the plan is read out at the Monday stand-up.

### Deliveries

Drivers book a slot the day before. A lorry without one waits in the lay-by on the ring road until the gate has room, which on a busy morning can be an hour.

### The crane

The crane lifts from the barge side until noon and from the yard side after. Lifts over the road need the road closed, which the site lead arranges a week ahead.

## Who to ask

The site lead answers questions about access. Anything about pay or hours goes to People, and anything about the berths to Planning.

## After the works

Once the wall reopens, deliveries go back to the north gate and the parking returns. The east gate stays open for the crane, and the lay-by goes back to the council.

A short note on what went well and what didn't goes to Planning in February, so the next closure starts from it.
`;

/**
 * A document to read with its contents, in one of two flows the reader can switch between. The app
 * picks the flow that suits the document with `flow` or `defaultFlow`; the reader can change it, and
 * with `remember` their choice comes back next time on that device.
 *
 * - **Turn pages** (`leaves`) sets the document out as pages that fit the space and turn with the
 *   arrow keys, Page Up and Page Down, or the keys at the foot. Nothing scrolls.
 * - **Scroll** (`horizon`) runs it down one column with the kit's thin bar. The section you're in is at
 *   full ink and the rest dims back; a line across the top shows the sections as lengths, yours marked.
 *
 * **Page** shows the document alone, its contents behind a key. **Desk** docks the contents beside it;
 * in leaves it shows two pages at a time and each heading's page. It fills the height it's given.
 */
const meta = {
  title: 'Quill/Reader/Reading view',
  component: ReadingView,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <div style={{ height: '100vh', boxSizing: 'border-box', padding: 'var(--space-5) var(--edge)' }}><Story /></div>],
  args: { markdown: DOC, title: 'Winter works', defaultFlow: 'horizon', defaultMode: 'page', size: 'medium', contentsHeading: 'Contents' },
  argTypes: {
    markdown: { control: 'text' },
    title: { control: 'text' },
    flow: { control: 'inline-radio', options: ['leaves', 'horizon'] },
    defaultFlow: { control: 'inline-radio', options: ['leaves', 'horizon'] },
    mode: { control: 'inline-radio', options: ['page', 'desk'] },
    defaultMode: { control: 'inline-radio', options: ['page', 'desk'] },
    size: { control: 'inline-radio', options: ['small', 'medium', 'large'] },
    remember: { control: 'text' },
    contentsHeading: { control: 'text' },
    onFlowChange: { action: 'flow' },
    onModeChange: { action: 'mode' },
    onPosition: { action: 'position' },
    imageSource: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof ReadingView>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};
/** Scroll, on a page: your section at full ink, the contents behind the key. */
export const Scroll: Story = { args: { flow: 'horizon', mode: 'page' } };
/** Scroll, at a desk: the contents docked beside it. */
export const ScrollAtADesk: Story = { args: { flow: 'horizon', mode: 'desk' } };
/** Turn pages, one at a time. */
export const TurnPages: Story = { args: { flow: 'leaves', mode: 'page' } };
/** Turn pages at a desk: two pages side by side, and the contents as a ledger of pages. */
export const TurnPagesAtADesk: Story = { args: { flow: 'leaves', mode: 'desk' } };
