import type { Meta, StoryObj } from '@storybook/react-vite';
import { iconNames, IconButton } from '@augur/kit-common';
import { AgentMark, MenuGroup, MenuLink, MenuRow, MenuTools, NotificationRow } from './shell-menu.js';
import { PartStage } from './shell-menu.fixture.js';

/**
 * The rows a view is made of. A `NotificationRow` is one thing in the stream: a lead dot that's green when
 * it needs you, its title and line, how long ago, up to two actions and ✕ (or the x key). A `MenuRow` opens
 * something: a result, an agent, a floor. A `MenuGroup` labels the rows under it. The controls on each story
 * are that part's own props.
 */
const meta = {
  title: 'Aerie/Shell menu/Rows',
  component: NotificationRow,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <PartStage>
      <ul>
        <NotificationRow {...args} />
      </ul>
    </PartStage>
  ),
  argTypes: {
    level: { control: 'inline-radio', options: ['needs', 'info', 'running', 'done', 'failed'] },
    actions: { control: 'object' },
    onOpen: { action: 'onOpen' },
    onAct: { action: 'onAct' },
    onDismiss: { action: 'onDismiss' },
  },
  args: { title: 'Review the budget draft', detail: 'Example Department · Due Friday', when: '10 min', level: 'needs', pinging: true, muted: false, actions: [{ label: 'Open' }, { label: 'Later' }] },
} satisfies Meta<typeof NotificationRow>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Needs you: the lead dot is green and pings (only the first one does), and the first action is the main one. */
export const Notification: Story = {};
/** Just so you know: an empty dot, no actions. */
export const Info: Story = { args: { level: 'info', title: 'Sam shared the joining guidance', detail: 'Example Department', when: '1 h', actions: [], pinging: false } };
/** Failed: a red ring. */
export const Failed: Story = { args: { level: 'failed', title: 'The import stopped', detail: 'Data Atlas · 3 files left', when: '4 min', actions: [{ label: 'Retry' }], pinging: false } };
/** From a muted app: it steps back. */
export const Muted: Story = { args: { muted: true, pinging: false } };

/** A row that opens something. The controls are the row's own props. */
export const Row: StoryObj<typeof MenuRow> = {
  render: (args) => (
    <PartStage>
      <ul>
        <li>
          <MenuRow {...args} />
        </li>
      </ul>
    </PartStage>
  ),
  argTypes: { icon: { control: 'select', options: [undefined, ...iconNames] }, title: { control: 'text' }, detail: { control: 'text' }, meta: { control: 'text' }, end: { control: false }, onPress: { action: 'onPress' } },
  args: { title: 'Example Department', detail: 'Department. Everyone in it sees what’s here.', meta: 'You’re here', icon: 'department', current: true },
};

/** How an agent is doing, in words, with a shape for done and failed so colour is never the only clue. */
export const Agent: StoryObj<typeof AgentMark> = {
  render: (args) => (
    <PartStage>
      <ul>
        <li>
          <MenuRow title="Budget checker" detail="Wants you to confirm two lines" end={<AgentMark {...args} />} />
        </li>
      </ul>
    </PartStage>
  ),
  argTypes: { status: { control: 'inline-radio', options: ['needs', 'failed', 'running', 'waiting', 'done', 'idle'] } },
  args: { status: 'needs', next: true },
};

/** A group's label over its rows: a name and a count, green when something in it needs you, with a control at its end. */
export const Group: StoryObj<typeof MenuGroup> = {
  render: (args) => (
    <PartStage>
      <MenuTools>
        <MenuLink>Clear the quiet ones</MenuLink>
      </MenuTools>
      <MenuGroup {...args} end={<IconButton icon="more" label={`${args.name}: more`} size="sm" />} />
    </PartStage>
  ),
  argTypes: { end: { control: false } },
  args: { name: 'Documents', count: 2, needs: true, muted: false },
};
