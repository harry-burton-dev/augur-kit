import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Menu as AriaMenu, MenuItem, Separator } from 'react-aria-components';
import { Button, Icon, IconButton, Tab, TabList, TabPanel, Tabs, type IconName } from '@augur/kit-common';
import { Status, Tag } from './states.js';
import { Card } from './things.js';
import './small-parts-directions.stories.css';

/**
 * Directions for the small parts round (6 Nov 2026): menus, tabs, tips, tags and badges, dividers and
 * cards. Each page puts today's part beside three ways to draw it, to pick one per part:
 *
 * - **A · Sheet** takes the shell's start menu: a solid grey sheet, square, one hairline edge, small
 *   capitals in mono for headings, and a hard ink line marking where you are.
 * - **B · Key** takes the Keycap button: a small corner and depth drawn as a thicker bottom line, so
 *   whatever you can press or pick looks like a key.
 * - **C · Line** has no boxes at all: the line is the structure, mono capitals label it, and where you
 *   are is the line growing thicker.
 *
 * All three are flat greys with hairlines, no blur and no colour of their own: green still means
 * "needs you" and red means danger. The parts and their props are the same in every column; only the
 * drawing changes. Once one is picked for a part, it moves into `kit.css` and its page goes. Tags,
 * badges and dividers don't exist in Common yet: the picked look becomes the Common part.
 *
 * Menus and tips are drawn open so they show in a snapshot; a row drawn as pointed at stands for hover.
 */
const meta = {
  title: 'Common/Small part directions',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const directions = [
  { id: 'today', name: 'Today', summary: 'What ships now, for reference.' },
  { id: 'sheet', name: 'A · Sheet', summary: 'The shell’s start menu: solid, square, a hard line where you are.' },
  { id: 'key', name: 'B · Key', summary: 'The Keycap button: a small corner, depth as a thicker bottom line.' },
  { id: 'line', name: 'C · Line', summary: 'No boxes: rules and mono capitals, the line thickens where you are.' },
] as const;
type DirectionId = (typeof directions)[number]['id'];

function Board({ part, summary, wide, children }: { part: string; summary: string; wide?: boolean; children: (d: DirectionId) => ReactNode }) {
  return (
    <div className="sd-stage">
      <header className="sd-head">
        <h2 className="sd-part">{part}</h2>
        <p className="sd-summary">{summary}</p>
      </header>
      <div className="sd-grid" data-wide={wide || undefined}>
        {directions.map((d) => (
          <section key={d.id} className="sd-column" data-direction={d.id} aria-label={`${part}: ${d.name}`}>
            <h3 className="sd-name">{d.name}</h3>
            <p className="sd-note">{d.summary}</p>
            <div className="sd-specimens">{children(d.id)}</div>
          </section>
        ))}
      </div>
    </div>
  );
}

/* ---- Menus ---- */

interface Row {
  id: string;
  label: string;
  icon?: IconName;
  hint?: string;
  key?: string;
  danger?: boolean;
  disabled?: boolean;
  reason?: string;
  on?: boolean;
}
const rows: (Row | '-')[] = [
  { id: 'open', label: 'Open', icon: 'arrow' },
  { id: 'rename', label: 'Rename', icon: 'rename', key: 'R', on: true },
  { id: 'share', label: 'Share', icon: 'people', hint: 'With your team' },
  { id: 'move', label: 'Move to another library', icon: 'folder', disabled: true, reason: 'This floor has only one library.' },
  '-',
  { id: 'delete', label: 'Delete', danger: true, key: 'D' },
];

/** The menu Common's Menu opens, drawn in place (open) with the same classes, so each direction styles the real rows. */
function OpenMenu({ title, label }: { title?: string; label: string }) {
  return (
    <div className="augur-popover augur-menu sd-menu">
      {title ? <p className="sd-menu-title">{title}</p> : null}
      <AriaMenu aria-label={label} disabledKeys={rows.filter((r): r is Row => r !== '-' && !!r.disabled).map((r) => r.id)} className="outline-none">
        {rows.map((r, i) =>
          r === '-' ? (
            <Separator key={`sep-${i}`} className="augur-menu-line" />
          ) : (
            <MenuItem key={r.id} id={r.id} textValue={r.label} className={r.on ? 'augur-menu-item sd-on' : 'augur-menu-item'} data-danger={r.danger || undefined}>
              {r.icon || r.danger ? <Icon name={r.danger ? 'error' : r.icon!} size={16} className="augur-menu-icon" /> : null}
              <span className="augur-menu-name">
                <span className="augur-menu-label">{r.label}</span>
                {r.hint ? <span className="augur-menu-why">{r.hint}</span> : null}
                {r.disabled && r.reason ? <span className="augur-menu-why">{r.reason}</span> : null}
              </span>
              {r.key ? <kbd className="augur-menu-key">{r.key}</kbd> : null}
            </MenuItem>
          ),
        )}
      </AriaMenu>
    </div>
  );
}

/** A dropdown from a row's ⋯ and a context menu with a heading. "Rename" is drawn as pointed at. */
export const Menus: Story = {
  render: () => (
    <Board part="Menus" summary="A dropdown from a button, and a context menu with a heading. The menu sits over a page, dimmed under it, never blurred.">
      {(d) => (
        <>
          <div className="sd-trigger">
            <IconButton icon="more" label={`More (${d})`} />
          </div>
          <OpenMenu label={`Collection actions (${d})`} />
          <OpenMenu title="Q3 plan" label={`Record actions (${d})`} />
        </>
      )}
    </Board>
  ),
};

/* ---- Tabs ---- */

function SampleTabs({ d }: { d: DirectionId }) {
  return (
    <Tabs defaultSelected="records" unavailable={{ history: 'Only the library’s owner sees its history.' }}>
      <TabList label={`Collection views (${d})`}>
        <Tab id="records" count={12}>
          Records
        </Tab>
        <Tab id="needs" count={3}>
          Needs you
        </Tab>
        <Tab id="people">People</Tab>
        <Tab id="history">History</Tab>
      </TabList>
      <TabPanel id="records">Twelve records.</TabPanel>
      <TabPanel id="needs">Three need you.</TabPanel>
      <TabPanel id="people">Four people.</TabPanel>
      <TabPanel id="history">The history.</TabPanel>
    </Tabs>
  );
}

/** Views of one thing. Records is open, History can't be shown to this person and stays, dimmed. */
export const TabsDirections: Story = {
  name: 'Tabs',
  render: () => <Board part="Tabs" wide summary="Views of one thing, with counts and one view that can’t be shown to this person.">{(d) => <SampleTabs d={d} />}</Board>,
};

/* ---- Tips ---- */

/** A tip drawn open beside what it names: a short name with its key, and a mark's meaning. */
export const Tips: Story = {
  render: () => (
    <Board part="Tips" summary="A short line on hover and focus, after a moment: a name in full with its key, and what a mark means.">
      {() => (
        <>
          <div className="sd-tip-pair">
            <IconButton icon="rename" label="Rename" />
            <div className="augur-tip sd-tip" role="tooltip">
              Rename <kbd className="sd-tip-key">R</kbd>
            </div>
          </div>
          <div className="sd-tip-pair">
            <Status status="needs" markOnly />
            <div className="augur-tip sd-tip" role="tooltip">
              Needs you: two records wait for your review.
            </div>
          </div>
        </>
      )}
    </Board>
  ),
};

/* ---- Tags and badges ---- */

/** Tags (a word something is filed under) and badges (a count or a state on something else). */
export const TagsAndBadges: Story = {
  name: 'Tags and badges',
  render: () => (
    <Board part="Tags and badges" summary="Tags file a thing under a word; badges put a count or a state on something else. Only “needs you” is green.">
      {(d) => (
        <>
          <div className="sd-row">
            <Tag label="Planning" />
            <Tag label="Research" icon="tag" />
            <Tag label="Q3" onRemove={() => {}} removeLabel={`Q3 (${d})`} />
            <Tag label="Archived" quiet />
          </div>
          <div className="sd-row">
            {d === 'today' ? (
              <span className="sd-plain">No badge today: counts are a plain number after a name.</span>
            ) : (
              <>
                <span className="sd-badge">12</span>
                <span className="sd-badge" data-tone="needs">
                  3
                </span>
                <span className="sd-badge" data-tone="danger">
                  1
                </span>
                <span className="sd-badge" data-tone="word">
                  Draft
                </span>
                <span className="sd-badge" data-tone="word-needs">
                  Needs you
                </span>
              </>
            )}
          </div>
          <div className="sd-row">
            <span className="sd-on-icon">
              <Icon name="bell" size={20} />
              {d === 'today' ? null : (
                <span className="sd-badge sd-badge-corner" data-tone="needs">
                  2
                </span>
              )}
            </span>
            <span className="sd-on-icon">
              <Icon name="inbox" size={20} />
              {d === 'today' ? null : <span className="sd-dot" aria-label="New" role="img" />}
            </span>
            <Status status="needs" />
            <Status status="done" />
          </div>
        </>
      )}
    </Board>
  ),
};

/* ---- Dividers ---- */

/** A plain rule, a rule with a label, a strong rule between kinds of thing, and an upright one in a bar. */
export const Dividers: Story = {
  render: () => (
    <Board part="Dividers" summary="A plain rule, one with a label, a strong one between kinds of thing, and an upright one in a bar.">
      {(d) => (
        <>
          <p className="sd-text">Records filed today.</p>
          <hr className="sd-rule" />
          <div className="sd-rule" role="separator" aria-label="Earlier" data-label="">
            <span>Earlier</span>
          </div>
          <p className="sd-text">Records filed this week.</p>
          <hr className="sd-rule" data-strong="" />
          <div className="sd-bar">
            <Button kind="ghost" size="sm">
              Filter
            </Button>
            <span className="sd-rule-up" role="separator" aria-orientation="vertical" />
            <Button kind="ghost" size="sm">
              Sort
            </Button>
            <span className="sd-rule-up" role="separator" aria-orientation="vertical" />
            <IconButton icon="view" label={`View (${d})`} />
          </div>
          {d === 'today' ? <p className="sd-plain">No divider part today: a bare hairline.</p> : null}
        </>
      )}
    </Board>
  ),
};

/* ---- Cards ---- */

/** Quill's Card, the surface every other thing sits on: one as pointed at, one that needs you, one that can't be opened. */
export const Cards: Story = {
  render: () => (
    <Board part="Cards and surfaces" summary="One thing in a grid: a title, its mark, a line of meta. One is pointed at, one needs you, one can’t be opened.">
      {() => (
        <>
          <Card heading="Q3 plan" icon="document" floorKind="team" floorName="Research" meta={['12 records', 'Tuesday']} className="sd-on" />
          <Card heading="Supplier review" status="needs" floorKind="personal" floorName="You" meta={['3 to read']} note="Due tomorrow." />
          <Card heading="Board minutes" unavailable reason="Only the board can open these." />
        </>
      )}
    </Board>
  ),
};
