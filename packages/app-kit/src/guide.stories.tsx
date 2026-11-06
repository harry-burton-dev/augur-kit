import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button, Heading, Icon, IconButton } from '@augur/kit-common';
import { Guide, type GuideProps } from './guide.js';

/**
 * A first-run guide, drawn as a **Lamp**: it shows one part at a time. The page dims (never blurs) and the
 * step's part stays lit in a square; what it does sits on the dim under a rule, with no box.
 *
 * - Give each part an `id` and name it as a step's `target`. A target that isn't on the page dims the
 *   whole page and puts the words in the middle.
 * - Next goes on, Back goes back, and Esc or Skip ends it. The last step says Done.
 * - Keep it to a few steps. Anything longer is a manual, not a guide.
 * - The app keeps whether someone has seen the guide, and opens it again from its own Help.
 *
 * Nothing in it is green, because a guide is an offer and doesn't need you. Every word is a prop
 * (`labels`), so the app speaks in its own language. For the first things to do in an app, see First steps.
 */
const meta = {
  title: 'Patterns/First-run guide/Guide',
  component: Guide,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, height: '440px' } } },
  args: {
    steps: [
      { target: 'guide-new', title: 'Make a plan', line: 'New plan starts one from a blank page or a template.' },
      { target: 'guide-filter', title: 'Find yours', line: 'Filter narrows the list to an owner, a team or a state.' },
      { target: 'guide-share', title: 'Share it', line: 'Share gives a team the plan to read or to edit.' },
    ],
    defaultStep: 1,
    open: true,
  },
  argTypes: {
    step: { control: { type: 'number', min: 0, max: 2 } },
    defaultStep: { control: false },
    onStep: { control: false },
    onSkip: { control: false },
    onDone: { control: false },
    className: { control: false },
  },
  render: (args) => (
    <Page>
      <Guide {...args} />
    </Page>
  ),
} satisfies Meta<typeof Guide>;
export default meta;
type Story = StoryObj<typeof meta>;

/** A small app for the guide to point at. */
function Page({ children }: { children?: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: 'var(--space-5) var(--edge)', background: 'var(--slate)', color: 'var(--ink)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-4)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--hairline)' }}>
        <Heading eyebrow="Plans" heading="All plans" size="s" level={1} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span id="guide-filter" style={{ display: 'inline-flex' }}>
            <IconButton icon="filter" label="Filter" size="sm" />
          </span>
          <span id="guide-share" style={{ display: 'inline-flex' }}>
            <IconButton icon="people" label="Share" size="sm" />
          </span>
          <span id="guide-new" style={{ display: 'inline-flex' }}>
            <Button kind="primary" size="sm" icon={<Icon name="plus" size={16} />}>
              New plan
            </Button>
          </span>
        </div>
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {['Q3 plan', 'Hiring plan', 'Office move', 'Budget review', 'Vendor list'].map((r) => (
          <li key={r} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--hairline)', fontSize: 'var(--type-meta)' }}>
            <span>{r}</span>
            <span style={{ color: 'var(--ink-muted)' }}>Edited today</span>
          </li>
        ))}
      </ul>
      {children}
    </div>
  );
}

/** Change every prop from the controls. */
export const Playground: Story = {};

/** The first step: Next and Skip, no Back. */
export const FirstStep: Story = { args: { defaultStep: 0 } };

/** The last step says Done, and has no Skip. */
export const LastStep: Story = { args: { defaultStep: 2 } };

/** A step whose part isn't on the page: the whole page dims and the words sit in the middle. */
export const NoPart: Story = {
  args: { steps: [{ target: 'guide-nowhere', title: 'Welcome to Plans', line: 'Three things to know, one at a time.' }], defaultStep: 0 },
};

/** Its own words, from `labels`. */
export const OwnWords: Story = {
  args: { labels: { next: 'Show me', back: 'Before', skip: 'Not now', count: (s, of) => `Step ${s} of ${of}` } },
};

/** Held by the app: Next and Back move it, Skip and Done close it, and Help opens it again. */
export const HeldByTheApp: Story = {
  render: (args) => <Held {...args} />,
};

function Held(args: GuideProps) {
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState(0);
  return (
    <Page>
      {open ? null : (
        <p style={{ marginTop: 'var(--space-4)' }}>
          <Button size="sm" onPress={() => (setStep(0), setOpen(true))}>
            Show the guide again
          </Button>
        </p>
      )}
      <Guide {...args} open={open} step={step} onStep={setStep} onSkip={() => setOpen(false)} onDone={() => setOpen(false)} />
    </Page>
  );
}
