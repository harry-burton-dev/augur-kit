import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '@augur/kit-common';
import { About } from './about.js';
import { AppFrame, RailLink } from './app-frame.js';
import { FrontPage } from './front-page.js';
import { List } from './list.js';
import { More } from './more.js';
import { PageHead, Section } from './page.js';
import { SelectionBar } from './selection-bar.js';

const CREW = [
  { id: 'priya', title: 'Priya Shah', detail: 'Master', meta: 'Day' },
  { id: 'lee', title: 'Lee Okafor', detail: 'Chief officer', meta: '04–08' },
  { id: 'sam', title: 'Sam Ito', detail: 'Engineer', meta: '08–12' },
  { id: 'ana', title: 'Ana Ruiz', detail: 'Deckhand', meta: '12–16' },
];

function Record({ arrived = true, several = false, front = false }: { arrived?: boolean; several?: boolean; front?: boolean }) {
  const [screen, setScreen] = useState(front ? 'front' : 'vessels');
  const [picked, setPicked] = useState<string | undefined>(several ? undefined : 'lee');
  const [many, setMany] = useState(several ? 2 : 0);
  const [read, setRead] = useState(!arrived);
  const person = CREW.find((c) => c.id === picked);
  return (
    <div style={{ height: '100vh' }}>
      <AppFrame
        app={{ name: 'Fleet', icon: 'vessel' }}
        onFront={() => setScreen('front')}
        screen={screen}
        railLabel="Fleet"
        rail={
          <>
            <RailLink icon="home" label="Overview" current={screen === 'front'} onPress={() => setScreen('front')} />
            <RailLink icon="vessel" label="Vessels" current={screen === 'vessels'} onPress={() => setScreen('vessels')} />
            <RailLink icon="compass" label="Voyages" count={1} onPress={() => setScreen('vessels')} />
            <RailLink icon="port" label="Ports" onPress={() => setScreen('vessels')} />
            <RailLink icon="people" label="Crew" onPress={() => setScreen('vessels')} />
          </>
        }
        drawerLabel="About"
        drawerFor={screen === 'vessels' ? picked : undefined}
        drawer={
          screen === 'vessels' && person ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <About what={`${person.title}, ${person.detail.toLowerCase()} on MV Halden. On watch ${person.meta}.`} owner={{ name: 'Priya Shah', detail: 'Master' }} floor="Ops team" />
              <Section label="Why you’re seeing this" count={-1}>
                <p style={{ margin: 0 }}>Lee is on watch when Halden enters Brekke, and the port asks for a named officer on the bridge.</p>
              </Section>
            </div>
          ) : (
            <About what={screen === 'front' ? 'Where North Sea operations plan voyages and crew.' : 'General cargo vessel, built 2011.'} owner={{ name: 'North Sea operations', detail: 'Ops team' }} floor="Ops team" />
          )
        }
      >
        {screen === 'front' ? (
          <FrontPage
            eyebrow="Fleet · since Tuesday"
            heading="Two vessels changed course, and one voyage waits for you."
            sections={[
              { id: 'needs', title: 'Needs you', empty: 'Nothing needs you.', children: <List label="Needs you" bar={false} items={[{ id: 'v', title: 'Approve voyage 2214', detail: 'Halden to Brekke', meta: '1 d', status: 'needs', actions: [{ id: 'ok', label: 'Approve' }] }]} /> },
              { id: 'new', title: 'What changed', empty: 'Nothing new since Tuesday.', children: <List label="What changed" bar={false} items={[{ id: 'h', title: 'MV Halden turned for Brekke', meta: 'Priya · 2 h' }, { id: 't', title: 'MV Tor holds at Baltic anchorage', meta: 'Lee · 5 h' }]} /> },
            ]}
          />
        ) : (
          <>
            <PageHead
              eyebrow="Vessel · IMO 9312345"
              heading="MV Halden"
              summary="Under way in the North Sea, 38 nm from Brekke."
              arrival={{ from: 'Night roster', why: 'where Halden’s crew is short a watch', onBack: () => setRead(true), read }}
              actions={[{ id: 'plan', label: 'Plan voyage', kind: 'primary' }]}
              selection={
                many ? (
                  <SelectionBar
                    count={many}
                    noun={['crew member', 'crew']}
                    actions={[
                      { id: 'swap', label: 'Swap watch' },
                      { id: 'move', label: 'Move to vessel' },
                    ]}
                    onAction={() => {}}
                    onClear={() => setMany(0)}
                  />
                ) : undefined
              }
            />
            <Section label="Crew" count={12} limit={0} action={many ? undefined : 'Pick two'} onAction={() => setMany(2)}>
              <List label="Crew" noun={['crew member', 'crew']} bar={false} items={CREW} onOpen={(item) => setPicked(item.id)} />
              <More shown={4} total={12} noun="crew" step={8} onMore={() => {}} />
            </Section>
            {read ? null : (
              <Button kind="tertiary" size="sm" onPress={() => setRead(true)}>
                Mark the arrival line read
              </Button>
            )}
          </>
        )}
      </AppFrame>
    </div>
  );
}

/**
 * A record you read and act on, in the page frame’s Line look: the frame Harry judged the look on. The
 * rail is the app bar’s tiles; one horizon runs across rail, page and drawer at the foot of the PageHead;
 * the title and the main action are in fixed slots. Open a crew member and the drawer opens on them, with
 * why it’s showing; pick two and the selection takes the head’s action slot. A link brought you here, so
 * the head says where from, then shrinks that to a Back key.
 */
const meta = {
  title: 'Patterns/Record page',
  component: Record,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { arrived: true, several: false, front: false },
  argTypes: {
    arrived: { control: 'boolean', description: 'A link brought you here: the head shows the arrival line.' },
    several: { control: 'boolean', description: 'Two crew picked: the selection takes the head’s action slot.' },
    front: { control: 'boolean', description: 'Open on the app’s front page instead.' },
  },
} satisfies Meta<typeof Record>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Just arrived by a link, one crew member open in the drawer. */
export const Default: Story = {};

/** Two crew picked: the selection bar in the head’s action slot. */
export const SelectingSeveral: Story = { name: 'Selecting several', args: { arrived: false, several: true } };

/** The app’s front page: a sentence of what changed, then what needs you. */
export const Front: Story = { name: 'Front page', args: { front: true } };
