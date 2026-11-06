import type { Meta, StoryObj } from '@storybook/react-vite';
import { People, Person, Presence } from './person.js';

/**
 * Someone: an owner, who did something, or who to ask. The mark is a **Disc**, the one true circle left in
 * the kit: a flat grey disc with their initials (or their picture), ringed in their floor's colour.
 *
 * - **Floors**: team amber, department violet, organisation blue, as a thin ring. **You** are ringed in plain
 *   ink: green only ever means "needs you", never a person.
 * - **Presence**: give `here`, and someone away is dimmed back, mark and name. It's read aloud too.
 * - **Mark only**: the disc alone, with the name read aloud and shown on hover.
 *
 * Several people are **People**; who is here now is **Presence**.
 */
const meta = {
  title: 'Common/Person',
  component: Person,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { name: 'Sam Ortiz', detail: 'Lead, Procurement', tone: 'team' },
  argTypes: {
    tone: { control: 'inline-radio', options: [undefined, 'you', 'team', 'department', 'org'] },
    here: { control: 'inline-radio', options: [undefined, true, false] },
    markOnly: { control: 'boolean' },
    picture: { control: 'text' },
    className: { control: false },
  },
} satisfies Meta<typeof Person>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Default: Story = {};

/** One person on each floor. You are ink, never green. */
export const Floors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <Person name="Alex Morgan" detail="You" tone="you" />
      <Person name="Sam Ortiz" detail="Your team" tone="team" />
      <Person name="Priya Shah" detail="Department lead" tone="department" />
      <Person name="Lee Park" detail="Organisation admin" tone="org" />
      <Person name="Jo Bell" detail="No floor given" />
    </div>
  ),
};

/** Here now at full ink; away dimmed back. */
export const Here: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <Person name="Sam Ortiz" detail="Your team" tone="team" here />
      <Person name="Lee Park" detail="Organisation admin" tone="org" here={false} />
    </div>
  ),
};

/** Several people as overlapping discs, then "+N" for the rest. Every name is read aloud and shown on hover. */
export const Group: Story = {
  render: () => (
    <People
      label="Shared with"
      people={[{ name: 'Alex Morgan', tone: 'you' }, { name: 'Sam Ortiz', tone: 'team' }, { name: 'Priya Shah', tone: 'department', here: false }, { name: 'Lee Park', tone: 'org' }, { name: 'Jo Bell' }, { name: 'Kim Ito' }]}
    />
  ),
};

/** Who is here now: the ones here first at full ink, the ones away dimmed after them. No dot and no colour. */
export const WhoIsHere: Story = {
  render: () => (
    <Presence
      label="On this plan"
      people={[
        { name: 'Lee Park', tone: 'org', detail: 'Away 2h', here: false },
        { name: 'Sam Ortiz', tone: 'team', here: true },
        { name: 'Priya Shah', tone: 'department', here: true },
      ]}
    />
  ),
};
