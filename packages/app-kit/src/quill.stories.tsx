import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button, Person, Steps } from '@augur/kit-common';
import { About } from './about.js';
import { AppFrame, RailLink } from './app-frame.js';
import { FrontPage } from './front-page.js';
import { More } from './more.js';
import { SelectionBar } from './selection-bar.js';

function Example({ width }: { width?: number }) {
  const [screen, setScreen] = useState('front');
  const [picked, setPicked] = useState(2);
  return (
    <div style={{ height: '100vh', ...(width ? { width, borderRight: '1px dashed var(--hairline-strong)' } : {}) }}>
      <AppFrame
        app={{ name: 'Plans', icon: 'library' }}
        onFront={() => setScreen('front')}
        screen={screen}
        railLabel="Sections"
        rail={
          <>
            <RailLink icon="home" label="Home" count={3} current={screen === 'front'} onPress={() => setScreen('front')} />
            <RailLink icon="folder" label="Collections" current={screen === 'list'} onPress={() => setScreen('list')} />
            <RailLink icon="people" label="Shared with you" onPress={() => setScreen('list')} />
            <RailLink icon="find" label="Find" onPress={() => setScreen('list')} />
          </>
        }
        drawerLabel="About"
        drawer={
          <About
            what="A collection of 12 plans for the northern region."
            owner={{ name: 'Sam Ortiz', detail: 'Lead, Procurement' }}
            floor="Procurement"
            lifecycle={<Steps label="Lifecycle" steps={[{ label: 'In progress', state: 'done' }, { label: 'In review', state: 'now' }, { label: 'Complete', state: 'next' }]} />}
            history={<Person name="Priya Shah" detail="Moved it to review, 2 days ago" tone="department" />}
          />
        }
      >
        {screen === 'front' ? (
          <FrontPage
            eyebrow="Procurement"
            heading="Plans"
            summary="Three need you."
            sections={[
              { id: 'needs', title: 'Needs you', count: 3, empty: 'Nothing needs you.', children: <p>Three plans wait for your review.</p> },
              { id: 'new', title: 'New since you looked', empty: 'Nothing new since Monday.' },
              { id: 'worth', title: 'Worth knowing', empty: 'Nothing else to know today.' },
            ]}
          />
        ) : (
          <>
            <p>Twelve collections.</p>
            <More shown={50} total={312} noun="records" onMore={() => {}} />
            <SelectionBar
              count={picked}
              noun={['record', 'records']}
              actions={[
                { id: 'move', label: 'Move' },
                { id: 'publish', label: 'Publish up', disabled: true, reason: 'Only a lead can publish from this floor.' },
                { id: 'delete', label: 'Delete', danger: true },
              ]}
              onAction={() => {}}
              onClear={() => setPicked(0)}
            />
            {picked === 0 ? <Button onPress={() => setPicked(2)}>Pick two</Button> : null}
          </>
        )}
      </AppFrame>
    </div>
  );
}

const meta = { title: 'Quill/App frame', component: Example, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Press the app's name for its front page, Collections for a list. Fold the rail and the drawer. */
export const Frame: Story = {};

/** A tablet's width: the drawer keeps its strip and opens over the page. */
export const Tablet: Story = { args: { width: 1000 } };

/** Narrower still: the rail shows its icons and opens over the page too. */
export const Narrow: Story = { args: { width: 720 } };
