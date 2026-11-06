import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { DateField } from './date.js';
import { Editor, Prose, type MentionSource } from './editor.js';
import { PeoplePicker, type Principal } from './people-picker.js';

/**
 * A stand-in for identity's people and teams search. In an app, hand the SDK's
 * `searchPrincipals` to the picker instead: `search={(q) => searchPrincipals(ctx, q)}`.
 * It answers as the real one does: people by name or email, with their email;
 * teams by name, with where they sit; after a short wait.
 */
const DIRECTORY: (Principal & { farAway?: boolean })[] = [
  { kind: 'person', id: 'u1', name: 'Nora Briggs', detail: 'nora@example.org' },
  { kind: 'person', id: 'u2', name: 'Ben Norris', detail: 'ben@example.org' },
  { kind: 'person', id: 'u3', name: 'Ada Lee', detail: 'ada@example.org', meta: 'Can read' },
  { kind: 'person', id: 'u4', name: 'Sam Okafor', detail: 'sam@example.org', farAway: true },
  { kind: 'person', id: 'u5', name: 'Kim Novak', detail: 'kim@example.org' },
  { kind: 'team', id: 't1', name: 'Ops' },
  { kind: 'team', id: 't2', name: 'Finance' },
  { kind: 'team', id: 't3', name: 'Planning', detail: 'Ops' },
];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const searchDirectory = async (query: string): Promise<Principal[]> => {
  await wait(250);
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return DIRECTORY.filter((p) => [p.name, p.detail].some((w) => w?.toLowerCase().includes(q))).map(({ farAway: _f, ...p }) => p);
};

const directoryDown = async (): Promise<Principal[]> => {
  await wait(250);
  throw new Error('Can’t search people right now. Try again in a minute.');
};

/** The app's own reason one can't be chosen: here, someone who can't stand on the thing's floor. */
const offFloor = (p: Principal) =>
  DIRECTORY.find((d) => d.kind === p.kind && d.id === p.id)?.farAway ? 'Sam isn’t on this floor. A lead of Planning can add them.' : undefined;

function Column({ children }: { children: ReactNode }) {
  return <div style={{ display: 'grid', gap: 'var(--space-6)', padding: 'var(--space-6)', maxWidth: 'var(--measure-card)' }}>{children}</div>;
}

const meta: Meta = { title: 'Quill/Writing kit' };
export default meta;

/** Several people and teams, gathered as chips. Type "no" or "ops"; Sam can't be chosen and says why. */
export const PeopleOnTheDirectory: StoryObj = {
  render: () => {
    function Story() {
      const [chosen, setChosen] = useState<Principal[]>([]);
      return (
        <Column>
          <PeoplePicker label="Share with" hint="People or teams, by name or email." multiple search={searchDirectory} check={offFloor} value={chosen} onChange={setChosen} />
        </Column>
      );
    }
    return <Story />;
  },
};

/** Chosen people and teams gather under the field as a list in a well: who they are, what they can do, and a key to take each off. */
export const PeopleChosen: StoryObj = {
  render: () => (
    <Column>
      <PeoplePicker
        label="Share with"
        multiple
        search={searchDirectory}
        defaultValue={[
          { kind: 'person', id: 'u1', name: 'Nora Briggs', detail: 'nora@example.org', meta: 'Can edit' },
          { kind: 'person', id: 'u3', name: 'Ada Lee', detail: 'ada@example.org', meta: 'Can read' },
          { kind: 'team', id: 't3', name: 'Planning', detail: 'Ops', size: 6, meta: 'Can read' },
        ]}
      />
    </Column>
  ),
};

/** One person, handed over as soon as they're chosen. */
export const OnePerson: StoryObj = {
  render: () => {
    function Story() {
      const [who, setWho] = useState<string>();
      return (
        <Column>
          <PeoplePicker label="Hand it on to" kinds="people" search={searchDirectory} check={offFloor} onPick={(p) => setWho(p.name)} />
          <p style={{ margin: 0, color: 'var(--ink-muted)' }}>{who ? `Chosen: ${who}` : 'Nobody chosen yet.'}</p>
        </Column>
      );
    }
    return <Story />;
  },
};

/** When the search fails, the field says so and stays usable. */
export const DirectoryDown: StoryObj = {
  render: () => (
    <Column>
      <PeoplePicker label="Share with" multiple search={directoryDown} />
    </Column>
  ),
};

/** Unavailable, and saying why. */
export const PeopleUnavailable: StoryObj = {
  render: () => (
    <Column>
      <PeoplePicker label="Share with" disabled reason="Only this library's leads can share it." search={searchDirectory} />
    </Column>
  ),
};

/** Days in words or on the calendar: empty, set, and required. */
export const Dates: StoryObj = {
  render: () => (
    <Column>
      <DateField label="Due" hint="Say it in words: 13 nov, friday, +2w." />
      <DateField label="Review on" defaultValue="2026-12-01" />
      <DateField label="Starts" required empty="Pick a day" quick={[{ label: 'Today', value: 'today' }, { label: 'Monday', value: 'monday' }]} />
    </Column>
  ),
};

const THINGS = [
  { kind: 'entity' as const, id: 'ent_1', label: 'HMS Example', floorName: 'Organisation' },
  { kind: 'intent' as const, id: 'int_4', label: 'Keep the coast watched' },
  { kind: 'document' as const, id: 'd-7', label: 'Patrol report' },
];

/** People and teams after `@` from the stand-in directory; things after `#`, with two kept where you can't open them. */
const mentionSource: MentionSource = async (trigger, query) => {
  if (trigger === '@') {
    const found = await searchDirectory(query);
    return { found: found.map((p) => ({ kind: p.kind, id: p.id, label: p.name })) };
  }
  await wait(150);
  const q = query.toLowerCase();
  return { found: THINGS.filter((t) => t.label.toLowerCase().includes(q)), closedCount: 2, closedReason: 'Kept on Finance. Ask its leads.' };
};

const BRIEF = 'Ask [@Nora Briggs](person:u1) to watch [#HMS Example](entity:ent_1) until **Friday**.\n\n- Report twice a day\n- Say at once if it _moves_';

/** Writing with mentions: type `@no` or `#hms`. Select words for the format bar. What it writes is shown below as Prose. */
export const Writing: StoryObj = {
  render: () => {
    function Story() {
      const [value, setValue] = useState(BRIEF);
      return (
        <Column>
          <Editor label="Intent" hint="What should happen, and why." guide="3 sentences" mentionSource={mentionSource} value={value} onChange={setValue} />
          <Prose value={value} />
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--ink-muted)', fontSize: 'var(--type-small)' }}>{value}</pre>
        </Column>
      );
    }
    return <Story />;
  },
};

/** Empty, required, over its guide, and unavailable. */
export const EditorStates: StoryObj = {
  render: () => (
    <Column>
      <Editor label="Back-brief" placeholder="What you'll do, in your words." required />
      <Editor label="Summary" guide="1 sentence" defaultValue="One sentence. And another one." />
      <Editor label="Concern" disabled reason="Only the intent's owner can change this." defaultValue="Fuel runs short **on Thursday**." />
    </Column>
  ),
};
