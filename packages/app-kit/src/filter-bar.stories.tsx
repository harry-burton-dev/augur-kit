import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { FilterBar, type FilterBarProps, type FilterDef, type FilterValue } from './filter-bar.js';

const FILTERS: FilterDef[] = [
  {
    id: 'state',
    label: 'State',
    options: [
      { value: 'running', label: 'Running' },
      { value: 'waiting', label: 'Waiting on you' },
      { value: 'failed', label: 'Failed' },
      { value: 'done', label: 'Done' },
    ],
  },
  {
    id: 'owner',
    label: 'Owner',
    options: [
      { value: 'me', label: 'Me' },
      { value: 'ops', label: 'Ops team' },
      { value: 'agent', label: 'Any agent' },
    ],
  },
  {
    id: 'time',
    label: 'Time',
    single: true,
    options: [
      { value: '1h', label: 'Last hour' },
      { value: 'today', label: 'Today' },
      { value: '7d', label: 'Last 7 days' },
      { value: '30d', label: 'Last 30 days' },
    ],
  },
];
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'longest', label: 'Longest' },
];
const VIEWS = [
  { value: 'open', label: 'My open runs' },
  { value: 'failed', label: 'Failed this week' },
  { value: 'all', label: 'Everything' },
];
const VIEW_FILTERS: Record<string, FilterValue> = { open: { state: ['running', 'waiting'], owner: ['me'] }, failed: { state: ['failed'], time: ['7d'] }, all: {} };

/** The bar keeps its own value here, as a page would, and makes up a count from it. */
function Live(props: FilterBarProps) {
  const [value, setValue] = useState(props.value);
  const [sort, setSort] = useState(props.sort ?? '');
  const [view, setView] = useState(props.view);
  const count = props.count === undefined ? undefined : Math.max(0, props.count - Object.values(value).reduce((n, v) => n + v.length * 41, 0));
  return (
    <FilterBar
      {...props}
      value={value}
      sort={sort}
      view={view}
      count={count}
      onChange={(v, s) => {
        setValue(v);
        setSort(s);
        setView(undefined);
        props.onChange(v, s);
      }}
      onView={(v) => {
        setView(v);
        setValue(VIEW_FILTERS[v] ?? {});
        props.onView?.(v);
      }}
    />
  );
}

/**
 * The bar above a long list, drawn as one ruled line (Rail, picked 6 Nov 2026): a hairline above it and the
 * ink line under it. Saved views come first, then each way to narrow the list as its name in small mono
 * capitals and what it has on in words ("any" when nothing), how many match, and the sort. Press a part to
 * drop its Sheet of choices under it; a single choice (Time) replaces the last and closes. Clear all takes
 * everything off. The bar holds no list itself: it says what changed, and the page asks again.
 *
 * Keys come from React Aria's menu: arrows move, Enter or Space picks, Esc closes and goes back to the part.
 */
const meta = {
  title: 'Quill/Filter bar',
  component: FilterBar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--measure-wide)', minHeight: 'calc(var(--space-8) * 5)' }}>{Story()}</div>],
  render: (args) => <Live {...args} />,
  args: {
    label: 'Filter runs',
    filters: FILTERS,
    value: { state: ['running', 'waiting'], owner: ['me'] },
    sorts: SORTS,
    sort: 'newest',
    count: 310,
    noun: ['run', 'runs'],
    busy: false,
    views: VIEWS,
    view: 'open',
    onChange: () => {},
  },
  argTypes: {
    filters: { control: 'object' },
    value: { control: 'object' },
    sorts: { control: 'object' },
    views: { control: 'object' },
    noun: { control: 'object' },
    actions: { control: false },
    className: { control: false },
    onChange: { action: 'changed' },
    onView: { action: 'view' },
  },
} satisfies Meta<typeof FilterBar>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};

/** Nothing on yet: each part says "any", and there's nothing to clear. */
export const NothingOn: Story = { args: { value: {}, view: undefined } };

/** Without saved views or a sort: the filters and the count only. */
export const FiltersOnly: Story = { args: { views: [], sorts: [] } };

/** A new count is on its way: the old one dims until it comes. */
export const Counting: Story = { args: { busy: true } };
