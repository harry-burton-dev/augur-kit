import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Checkbox, CheckboxGroup } from './checkbox.js';
import { Choice } from './choice.js';
import { TextField } from './text-field.js';
import { Toggle } from './toggle.js';
import './fields-directions.stories.css';

/**
 * Four directions for the fields round (6 Nov 2026), to pick one from: text fields, several lines,
 * checkboxes, radios (Choice) and toggles, each with its focus ring. All four sit with the Keycap
 * button: flat greys, hairlines, no blur, no colour of their own. Green still means "needs you", red
 * means wrong, blue means focus. The parts and their props are the same in every direction; only the
 * drawing changes. Once one is picked, it moves into `kit.css` and this page goes.
 *
 * The "focused" examples are drawn focused so the ring shows in a snapshot. Tab through the rest.
 */
const meta = {
  title: 'Common/Field directions',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const Focused = ({ children }: { children: ReactNode }) => <div data-demo-focus="">{children}</div>;

const Column = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="fd-column" aria-label={title}>
    <h3 className="fd-heading">{title}</h3>
    {children}
  </section>
);

function Specimen({ direction, name, summary }: { direction: string; name: string; summary: string }) {
  return (
    <div className="fd-stage" data-direction={direction}>
      <header className="fd-head">
        <h2 className="fd-name">{name}</h2>
        <p className="fd-summary">{summary}</p>
      </header>
      <div className="fd-grid">
        <Column title="Text">
          <TextField label="Title" hint="What people will see in the library." placeholder="Q3 plan" />
          <Focused>
            <TextField label="Owner" defaultValue="Alex Morgan" />
          </Focused>
          <TextField label="Collection" required state="attention" message="Needs you." />
          <TextField label="Email" defaultValue="alex" state="error" message="That isn’t an email address." />
        </Column>
        <Column title="Several lines">
          <TextField label="Summary" multiline rows={3} maxLength={280} defaultValue="Plans for the third quarter, by floor." />
          <TextField label="Made by" defaultValue="Alex Morgan" readOnly />
          <TextField label="Floor" defaultValue="Research" disabled reason="Floors come from your department." />
        </Column>
        <Column title="Checks and radios">
          <CheckboxGroup label="Pillars" hint="Choose up to two." defaultValue={['artifacts']}>
            <Checkbox value="artifacts" detail="Records">Artifacts</Checkbox>
            <Checkbox value="mandate" detail="Intent">Mandate</Checkbox>
          </CheckboxGroup>
          <Focused>
            <Checkbox>Email me a copy</Checkbox>
          </Focused>
          <Choice
            label="Who can read it"
            defaultValue="team"
            options={[
              { value: 'team', label: 'Your team', detail: 'Everyone on your team.' },
              { value: 'department', label: 'Department', detail: 'Publish it up one floor.' },
            ]}
          />
        </Column>
        <Column title="Toggles">
          <Toggle label="Notify me" hint="When someone shares a record." />
          <Toggle label="Show drafts" defaultChecked />
          <Focused>
            <Toggle label="Compact rows" />
          </Focused>
          <Toggle label="Single sign-on" defaultChecked disabled reason="Your admin set this for everyone." />
        </Column>
      </div>
    </div>
  );
}

/**
 * A field is a slot a key sits in: the button's counterpart. A small corner, a darker inset, and its
 * depth drawn as a thicker top line, where a key has a thicker bottom one. Ticked boxes and an "on"
 * knob come up as small light keys. Focus is the button's ring: a blue line a short gap outside.
 */
export const A_Well: Story = {
  name: 'A · Well (recommended)',
  render: () => (
    <Specimen
      direction="well"
      name="A · Well"
      summary="A slot the key sits in. Inset grey, a small corner, depth as a thicker top line. Ticked and on come up as light keys. Focus: the button’s ring."
    />
  ),
};

/**
 * No boxes: the line is the structure. Labels in mono capitals, a hairline to write on, and focus is
 * the same line grown thick and blue, under fields, boxes and switches alike. The chosen radio gets a
 * line down its side. The quietest of the four.
 */
export const B_Line: Story = {
  name: 'B · Line',
  render: () => (
    <Specimen
      direction="line"
      name="B · Line"
      summary="No boxes. Mono labels, a hairline to write on. Focus is that line grown thick and blue, under every control. The picked radio gets a line down its side."
    />
  ),
};

/**
 * Carbon's structure in AUGUR's greys: a square filled field with a line under it, small labels, square
 * boxes. Focus is a blue line drawn inside the edge, so nothing moves or grows.
 */
export const C_Slab: Story = {
  name: 'C · Slab',
  render: () => (
    <Specimen
      direction="slab"
      name="C · Slab"
      summary="Carbon’s structure in our greys. Square filled fields with a line under, square boxes and tiles. Focus is drawn inside the edge, so nothing moves."
    />
  ),
};

/**
 * A hairline frame with its name set into the top edge in mono, the way a drawing labels its parts.
 * Radios share one frame with hairlines between. Focus turns the frame and its name blue.
 */
export const D_Frame: Story = {
  name: 'D · Frame',
  render: () => (
    <Specimen
      direction="frame"
      name="D · Frame"
      summary="A hairline frame with its name set in the top edge, in mono. Radios share one frame. Focus turns the frame and its name blue."
    />
  ),
};

/** What the kit draws today, for comparison. */
export const Today: Story = {
  render: () => (
    <Specimen direction="today" name="Today" summary="The fields as they are on main: a line to write on, green radios, a round ink switch." />
  ),
};
