import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThingPage, TrustLine } from './thing-page.js';
import { NEW_KIND_THING, THINGS } from './things.fixture.js';

const thing = (id: string) => THINGS.find((t) => t.id === id)!;
const handlers = { onAction: () => undefined, onOpen: () => undefined, onSource: () => undefined, onEverything: () => undefined };

/**
 * A thing's page: one shape for every thing, whatever its kind (App patterns, "A thing's page"). It reads
 * top to bottom as what it is, the answer, what's wrong, up to four key facts, up to six sentences of what's
 * around it, and a way to everything we know. One primary action: something to settle, else keep an eye on
 * a thing that changes, else ask. The graph is one deliberate step away (`onMap`), never the front.
 *
 * The app fills a `ThingView` from its data; the page caps it and says what each empty slot means. The
 * stories run on every thing in the knowledge graph review's store, as Alex sees them on 20 November 2026,
 * filled by the shape's slot rules with no hand-tuned copy.
 */
const meta = {
  title: 'Quill/Thing page',
  component: ThingPage,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ padding: 'var(--space-6)' }}>
        <Story />
      </div>
    ),
  ],
  args: { view: thing('mv-saltmarsh-heron'), ...handlers, onMap: () => undefined },
  argTypes: { view: { control: 'object' }, words: { control: false }, actions: { control: false } },
} satisfies Meta<typeof ThingPage>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The busiest thing: a ship with a Now, two sets of reports that disagree, and much around it. */
export const Busiest: Story = {};

/** A thing that changes and has nothing wrong: the primary is "Keep an eye on it". */
export const Changing: Story = { args: { view: thing('port-services') } };

/** A possible duplicate: one person who may be two. The primary is "Something's wrong". */
export const PossibleDuplicate: Story = { args: { view: thing('marta-kowal') } };

/** An event (an incident): What, not Now. */
export const AnEvent: Story = { args: { view: thing('tern-bay-mooring-line-incident') } };

/** A forecast that passed with nothing newer: overdue. */
export const Overdue: Story = { args: { view: thing('crane-c2-replacement-gearbox') } };

/** Little to say: answered by what is around it. */
export const KnownFor: Story = { args: { view: thing('dana-holt') } };

/** Nothing at all: every slot says what its emptiness means. */
export const NearlyEmpty: Story = { args: { view: thing('alex') } };

/** A kind the shape has never seen (a hull survey), with no design work. */
export const NewKind: Story = { args: { view: NEW_KIND_THING } };

/** Narrow: the facts go to two columns and the answer's label sits above it. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 'var(--measure-glance)' }}>
        <Story />
      </div>
    ),
  ],
};

/** Any thing in the store, by its place (0 to 41). */
export const AnyThing: Story = {
  args: { at: 0 } as Story['args'],
  argTypes: { at: { control: { type: 'range', min: 0, max: THINGS.length - 1 } } } as Story['argTypes'],
  render: (args) => <ThingPage {...args} view={THINGS[(args as { at?: number }).at ?? 0] ?? THINGS[0]!} />,
};

/** Every thing in the store, one after another: the same shape 42 times, never drawn by hand. */
export const EveryThing: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
      {THINGS.map((t) => (
        <ThingPage key={t.id} {...args} view={t} level={2} />
      ))}
    </div>
  ),
};

/** The trust line on its own: how it is known, how many reports agree, whose report and when. Quiet ink, never colour. */
export const Trust: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <TrustLine source={{ how: 'as-written', reports: 3, who: 'Sam', on: '2026-11-18', title: 'Heron delay update' }} onSource={() => undefined} />
      <TrustLine source={{ how: 'forecast', reports: 1, who: 'Jo', on: '2026-11-19', title: 'Berth plan for next week' }} />
      <TrustLine source={{ how: 'as-written', reports: 1, who: 'Alex', byYou: true, on: '2026-11-13', title: 'A note of your own', yours: true }} />
    </div>
  ),
};
