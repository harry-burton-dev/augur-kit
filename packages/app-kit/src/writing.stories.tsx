import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { DateField } from './date.js';
import { PeoplePicker, type Principal } from './people-picker.js';

/**
 * A stand-in for identity's people and teams search, until the directory route
 * and the SDK's `searchPrincipals` land (PER-147, after PER-260). It answers as
 * the real one will: people by name, email or team, teams by name, after a
 * short wait.
 */
const DIRECTORY: (Principal & { email?: string; signInOff?: boolean })[] = [
  { kind: 'person', id: 'u1', name: 'Nora Briggs', detail: 'Ops', email: 'nora@example.org' },
  { kind: 'person', id: 'u2', name: 'Ben Norris', detail: 'Finance', email: 'ben@example.org' },
  { kind: 'person', id: 'u3', name: 'Ada Lee', detail: 'Ops', email: 'ada@example.org', meta: 'Can read' },
  { kind: 'person', id: 'u4', name: 'Sam Okafor', detail: 'Planning', email: 'sam@example.org', signInOff: true },
  { kind: 'person', id: 'u5', name: 'Kim Novak', detail: 'Finance', email: 'kim@example.org' },
  { kind: 'team', id: 't1', name: 'Ops', detail: 'Organisation', size: 6 },
  { kind: 'team', id: 't2', name: 'Finance', detail: 'Organisation', size: 4 },
  { kind: 'team', id: 't3', name: 'Planning', detail: 'Ops', size: 1 },
];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const searchDirectory = async (query: string): Promise<Principal[]> => {
  await wait(250);
  const q = query.toLowerCase();
  return DIRECTORY.filter((p) => [p.name, p.email, p.detail].some((w) => w?.toLowerCase().includes(q))).map(({ email: _e, signInOff: _s, ...p }) => p);
};

const directoryDown = async (): Promise<Principal[]> => {
  await wait(250);
  throw new Error('Can’t search people right now. Try again in a minute.');
};

const signInOff = (p: Principal) => (DIRECTORY.find((d) => d.kind === p.kind && d.id === p.id)?.signInOff ? 'Their sign-in is turned off. An admin can turn it back on.' : undefined);

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
          <PeoplePicker label="Share with" hint="People or teams, by name or email." multiple search={searchDirectory} check={signInOff} value={chosen} onChange={setChosen} />
        </Column>
      );
    }
    return <Story />;
  },
};

/** One person, handed over as soon as they're chosen. */
export const OnePerson: StoryObj = {
  render: () => {
    function Story() {
      const [who, setWho] = useState<string>();
      return (
        <Column>
          <PeoplePicker label="Hand it on to" kinds="people" search={searchDirectory} check={signInOff} onPick={(p) => setWho(p.name)} />
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
