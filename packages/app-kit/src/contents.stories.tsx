import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Contents, type ContentsProps, type OutlineItem } from './reader.js';

const OUTLINE: OutlineItem[] = [
  { id: 'winter-works', text: 'Winter works', level: 1 },
  { id: 'what-changes', text: 'What changes', level: 2 },
  { id: 'deliveries', text: 'Deliveries', level: 3 },
  { id: 'the-crane', text: 'The crane', level: 3 },
  { id: 'who-to-ask', text: 'Who to ask', level: 2 },
];

/** The one being read follows what's pressed, as a Reader beside it would report. */
const Following = (props: ContentsProps) => {
  const [current, setCurrent] = useState(props.current);
  return <Contents {...props} current={current} onSelect={(id) => { setCurrent(id); props.onSelect?.(id); }} />;
};

/**
 * A document's contents: its headings as links, indented by level, with the one being read
 * marked. It sits beside a Reader and takes its items from the Reader's `onOutline`. Indents count
 * from the highest level there is, so a document without a title heading starts at the left.
 * With no headings, it draws nothing.
 */
const meta = {
  title: 'Quill/Reader/Contents',
  component: Contents,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 'var(--measure-rail)' }}><Story /></div>],
  render: (args) => <Following {...args} />,
  args: { items: OUTLINE, current: 'what-changes', heading: 'Contents' },
  argTypes: { items: { control: 'object' }, current: { control: 'select', options: OUTLINE.map((o) => o.id) }, heading: { control: 'text' }, leaves: { control: 'object' }, onSelect: { action: 'select' }, className: { control: false } },
} satisfies Meta<typeof Contents>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};
/** Without a title heading, the second level starts at the left. */
export const NoTitle: Story = { args: { items: OUTLINE.slice(1) } };
/** Beside leaves: each heading with the page it starts on. */
export const Ledger: Story = { args: { leaves: { 'winter-works': 1, 'what-changes': 1, deliveries: 2, 'the-crane': 2, 'who-to-ask': 3 } } };
