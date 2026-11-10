import { useEffect, useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FocusStage } from './focus.js';
import { RingProvider } from './radial-menu.js';
import { AskLine, Door, DoorGallery, DoorLight, StepLabel } from './door-gallery.js';
import { DOOR_STEPS, scoreDoors, type DoorDescriptor } from './doors.js';
import { CORPUS_DAYS } from './doors.fixture.js';
import { ATLAS_DOORS, ATLAS_DOORS_TODAY, MORE_DOORS, QUESTIONS_DOOR } from './doors.atlas.fixture.js';

const day = (person: 'alex' | 'jo', date: string) => CORPUS_DAYS.find((d) => d.person === person && d.day === date)!;
const scoresOn = (person: 'alex' | 'jo', date: string, doors: DoorDescriptor[] = ATLAS_DOORS) => scoreDoors(doors, day(person, date).signals);
const ask = <AskLine label="What do you need?" placeholder="A ship, a port, a person, or a question" autoFocus={false} onAsk={() => undefined} />;
const recents = [
  { id: 'heron', label: 'The Heron' },
  { id: 'gantry', label: 'Project Gantry' },
  { id: 'kowal', label: 'Marta Kowal' },
];

/**
 * An ask line on top and a row of doors, each lit by how much waits behind it: quiet, present, strong, or
 * needs you. Strength is ink light; only needs you is green. A door is configuration (`DoorDescriptor`):
 * add one by adding an entry, never by changing a part. The steps come from `scoreDoors`; the gallery only
 * draws them, keeps the doors in their order, and sends any past `cap` to the radial menu.
 *
 * The stories run on the draft 4 corpus: Alex (an operator) and Jo (the floor's steward), each weekday from
 * 2 to 20 November 2026, with Data Atlas's four doors.
 */
const meta = {
  title: 'Quill/Door gallery',
  component: DoorGallery,
  tags: ['autodocs'],
  decorators: [
    (Story, ctx) => (
      <FocusStage>
        {ctx.parameters.ring === false ? (
          <div style={{ padding: 'var(--space-6)' }}>
            <Story />
          </div>
        ) : (
          <RingProvider>
            <div style={{ padding: 'var(--space-6)' }}>
              <Story />
            </div>
          </RingProvider>
        )}
      </FocusStage>
    ),
  ],
  args: { label: 'Ways in', doors: ATLAS_DOORS, scores: scoresOn('alex', '2026-11-09'), ask, onOpen: () => undefined },
  argTypes: {
    light: { control: 'inline-radio', options: ['alive', 'still'] },
    cap: { control: { type: 'number', min: 1, max: 7 } },
    doors: { control: 'object' },
    scores: { control: false },
    ask: { control: false },
  },
} satisfies Meta<typeof DoorGallery>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};

/** The proposed home (round 6): the ask line with the cursor in it and recents below, then four doors. Alex, 10 November: a meeting today and a changed plan. */
export const ProposedHome: Story = {
  args: {
    scores: scoresOn('alex', '2026-11-10'),
    ask: <AskLine label="What do you need?" placeholder="A ship, a port, a person, or a question" recents={recents} onAsk={() => undefined} />,
  },
};

/** Alex, 3 November: the partner review is today, so "Get ready" is strong and the Heron's due date is present. */
export const AlexMeetingDay: Story = { args: { scores: scoresOn('alex', '2026-11-03') } };

/** Alex, 9 November: two sources disagree on a count Alex wrote, and a plan moved. Two doors strong, the cap. */
export const AlexTwoStrong: Story = { args: { scores: scoresOn('alex', '2026-11-09') } };

/** Jo, 13 November: as steward, Jo can settle the new contradiction, so "Put something right" needs you. */
export const JoNeedsYou: Story = { args: { scores: scoresOn('jo', '2026-11-13') } };

/** Jo, 20 November: nothing new. Every door is quiet and the ask line leads. */
export const JoQuietDay: Story = { args: { scores: scoresOn('jo', '2026-11-20') } };

/** Any corpus day, by its place in the replay (0 to 29: Alex's fifteen weekdays, then Jo's). */
export const CorpusDay: Story = {
  args: { replay: 5 } as Story['args'],
  argTypes: { replay: { control: { type: 'range', min: 0, max: CORPUS_DAYS.length - 1 } } } as Story['argTypes'],
  render: (args) => {
    const d = CORPUS_DAYS[(args as { replay?: number }).replay ?? 5] ?? CORPUS_DAYS[0]!;
    return (
      <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
        <p style={{ margin: 0, color: 'var(--ink-muted)', fontSize: 'var(--type-meta)' }}>
          {d.person === 'alex' ? 'Alex' : 'Jo'}, {d.day}
        </p>
        <DoorGallery {...args} scores={scoreDoors(ATLAS_DOORS, d.signals)} />
      </div>
    );
  },
};

/** Configure: a fifth door added from configuration alone, a descriptor and nothing else. Sam and Jo asked Alex something today. */
export const Configure: Story = {
  args: {
    doors: [...ATLAS_DOORS, QUESTIONS_DOOR],
    cap: 5,
    scores: scoreDoors([...ATLAS_DOORS, QUESTIONS_DOOR], [
      ...day('alex', '2026-11-10').signals,
      { kind: 'question', reason: 'Sam asked when the Heron is next due' },
      { kind: 'question', reason: 'Jo asked who Marta Kowal works for' },
    ]),
  },
};

/** Five doors at the round 6 cap of four: the fifth goes to the ring, under "More ways in". */
export const FiveDoors: Story = { args: { doors: [...ATLAS_DOORS, QUESTIONS_DOOR], scores: scoresOn('alex', '2026-11-10', [...ATLAS_DOORS, QUESTIONS_DOOR]) } };

/** Seven doors: four on screen, three in the ring, each with its step in words. */
export const SevenDoors: Story = { args: { doors: [...ATLAS_DOORS, ...MORE_DOORS], scores: scoresOn('alex', '2026-11-10', [...ATLAS_DOORS, ...MORE_DOORS]) } };

/** Outside a radial menu, the doors past the cap stay on the page as a row of links. */
export const SevenDoorsNoRing: Story = {
  args: SevenDoors.args,
  parameters: { ring: false },
};

/** One door is still a door, not a hero. */
export const OneDoor: Story = { args: { doors: ATLAS_DOORS.slice(1, 2), scores: scoresOn('alex', '2026-11-09', ATLAS_DOORS.slice(1, 2)) } };

/** The first day, with nothing followed: doors with a first-day line say it, nothing is lit, and the ask line leads. */
export const FirstDay: Story = { args: { firstDay: true, scores: {} } };

/** As AUGUR is today: it has no calendar, so "Get ready" stays, looks unavailable and says why and who. */
export const Unavailable: Story = { args: { doors: ATLAS_DOORS_TODAY, scores: scoresOn('alex', '2026-11-10', ATLAS_DOORS_TODAY) } };

/** The signals aren't back yet: no light, each step says "Checking…", and the ask line works. */
export const Loading: Story = { args: { loading: true, scores: {} } };

/** Still: reduced motion. The same steps, with no rise, drift, bloom, breathing, lift or dimming. */
export const Still: Story = { args: { light: 'still', scores: scoresOn('jo', '2026-11-13') } };

/** Sets the deployment's depth to `scrim` (no blur) while the story is shown, as a VDI deployment's page does. */
function Scrim({ children }: { children: ReactNode }) {
  useState(() => {
    const meta = document.querySelector('meta[name="augur-depth"]') ?? document.head.appendChild(Object.assign(document.createElement('meta'), { name: 'augur-depth' }));
    meta.setAttribute('content', 'scrim');
  });
  useEffect(() => () => document.querySelector('meta[name="augur-depth"]')?.remove(), []);
  return <FocusStage depth="scrim">{children}</FocusStage>;
}

/** VDI: a deployment whose desktops have no GPU draws no blur (depth `scrim`), so the light is still too. */
export const Vdi: Story = {
  args: { scores: scoresOn('jo', '2026-11-13') },
  decorators: [(Story) => <Scrim><Story /></Scrim>],
};

/** At 1024 wide, four doors fit with their names on three lines or fewer. */
export const Width1024: Story = { args: { scores: scoresOn('alex', '2026-11-09') }, render: (args) => <div style={{ width: '1024px' }}><DoorGallery {...args} /></div> };

/** Every step, side by side, alive: what each one looks like and says. */
export const Steps: Story = {
  render: () => (
    <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', margin: 0, padding: 0, listStyle: 'none' }}>
      {DOOR_STEPS.map((step, i) => (
        <li key={step} style={{ display: 'flex' }}>
          <Door door={{ ...ATLAS_DOORS[i]!, id: `step-${step}` }} score={{ step, score: 0, reasons: [`A reason for ${step}`] }} focused={step === 'strong'} index={i} />
        </li>
      ))}
    </ul>
  ),
};

/** The parts on their own: the step's words, and the light with nothing over it. */
export const Parts: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 'var(--space-4)' }}>
      {DOOR_STEPS.map((step, i) => (
        <div key={step} style={{ position: 'relative', height: 'calc(var(--space-8) * 2)', display: 'flex', alignItems: 'flex-start' }}>
          <StepLabel step={step} />
          <DoorLight step={step} index={i} />
        </div>
      ))}
    </div>
  ),
};
