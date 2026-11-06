import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { Button, Checkbox, Choice, Icon, Tab, TabList, TabPanel, Tabs, TextField, Toggle } from '@augur/kit-common';
import { Card, Cards } from './things.js';

/**
 * A preview, not a decision: the Keycap buttons and the Well fields with less corner, beside a Sheet menu
 * (which is already square), to see which sits best with the sheet. Each column sets the two corner tokens
 * the keys and wells use, `radius-control` (buttons, wells, switches, tab trays, cards) and `radius-key`
 * (check boxes, switch knobs, tabs, tags, menu rows), on a wrapper; the parts themselves are unchanged.
 * If one is picked, the change is the token values in `common.tokens.json`.
 */
const meta = {
  title: 'Common/Corner preview',
  parameters: { layout: 'padded', chromatic: { viewports: [1280] } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const options = {
  today: {
    name: 'Today',
    note: 'radius-control 6px, radius-key 4px',
    control: '6px',
    key: '4px',
  },
  middle: { name: 'Middle', note: 'both 2px', control: '2px', key: '2px' },
  square: { name: 'Square', note: 'both 0', control: '0px', key: '0px' },
} as const;
type Option = keyof typeof options;

const noop = () => {};

/** A Sheet menu drawn in place (an open Menu would open outside the column, so it wouldn't take its corners). */
function SheetMenu() {
  const rows = [
    { id: 'open', label: 'Open', icon: 'arrow' as const, hovered: true },
    { id: 'rename', label: 'Rename', icon: 'rename' as const, key: 'R' },
    { id: 'move', label: 'Move', icon: 'folder' as const },
  ];
  return (
    <div className="augur-popover augur-menu" style={{ position: 'static', minWidth: 0 }}>
      <p className="augur-menu-heading">Q3 plan</p>
      {rows.map((r) => (
        <div key={r.id} className="augur-menu-item" data-hovered={r.hovered || undefined}>
          <Icon name={r.icon} size={16} className="augur-menu-icon" />
          <span className="augur-menu-name">
            <span className="augur-menu-label">{r.label}</span>
          </span>
          {r.key ? <kbd className="augur-menu-key">{r.key}</kbd> : null}
        </div>
      ))}
      <hr className="augur-menu-line" />
      <div className="augur-menu-item" data-danger="">
        <Icon name="error" size={16} className="augur-menu-icon" />
        <span className="augur-menu-name">
          <span className="augur-menu-label">Delete</span>
        </span>
        <kbd className="augur-menu-key">D</kbd>
      </div>
    </div>
  );
}

function Column({ option, wide }: { option: Option; wide?: boolean }) {
  const o = options[option];
  const stack = {
    display: 'grid',
    gap: 'var(--space-5)',
    alignContent: 'start',
    minWidth: 0,
  } as CSSProperties;
  const style = {
    '--radius-control': o.control,
    '--radius-key': o.key,
    display: 'grid',
    gap: 'var(--space-5)',
    alignContent: 'start',
    minWidth: 0,
  } as CSSProperties;
  return (
    <section style={style} data-option={option}>
      <header
        style={{
          display: 'grid',
          gap: 'var(--space-1)',
          paddingBottom: 'var(--space-2)',
          borderBottom: '1px solid var(--hairline)',
        }}
      >
        <span style={{ fontSize: 'var(--type-body)', fontWeight: 500 }}>{o.name}</span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--type-label)',
            color: 'var(--ink-muted)',
          }}
        >
          {o.note}
        </span>
      </header>
      <div
        style={
          wide
            ? {
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 'var(--space-6)',
              }
            : stack
        }
      >
        <div style={stack}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <Button kind="primary">Publish</Button>
            <Button kind="secondary">Save draft</Button>
          </div>
          <TextField label="Name" defaultValue="Q3 plan" />
          <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
            <Checkbox defaultChecked>Tell the team</Checkbox>
            <Checkbox>Pin to the floor</Checkbox>
          </div>
          <Toggle label="Show drafts" defaultChecked />
        </div>
        <div style={stack}>
          <Choice
            label="Who sees it"
            defaultValue="team"
            options={[
              { value: 'team', label: 'This team', detail: 'Ops only.' },
              {
                value: 'floor',
                label: 'The floor',
                detail: 'Everyone on Ops and below.',
              },
            ]}
          />
          <Tabs defaultSelected="all">
            <TabList label="Views">
              <Tab id="all">All</Tab>
              <Tab id="needs" count={3}>
                Needs you
              </Tab>
              <Tab id="done">Done</Tab>
            </TabList>
            <TabPanel id="all">
              <span />
            </TabPanel>
            <TabPanel id="needs">
              <span />
            </TabPanel>
            <TabPanel id="done">
              <span />
            </TabPanel>
          </Tabs>
          <Cards>
            <Card heading="Keep the coast watched" status="needs" floorKind="team" floorName="Ops" meta={['By 13 Nov']} onOpen={noop} />
          </Cards>
          <SheetMenu />
        </div>
      </div>
    </section>
  );
}

function Compare({ only, wide }: { only?: Option[]; wide?: boolean }) {
  const shown = only ?? (Object.keys(options) as Option[]);
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${shown.length}, minmax(0, 1fr))`,
        gap: 'var(--space-7)',
        maxWidth: wide ? undefined : 'var(--measure-wide)',
      }}
    >
      {shown.map((o) => (
        <Column key={o} option={o} wide={wide} />
      ))}
    </div>
  );
}

/** Today's 6px, a 2px middle and square, side by side. */
export const SideBySide: Story = { render: () => <Compare /> };

/** Today beside square only, each in two columns so it fits without scrolling. */
export const TodayAndSquare: Story = {
  render: () => <Compare only={['today', 'square']} wide />,
};
