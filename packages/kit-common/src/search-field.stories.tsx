import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { SearchField } from './search-field.js';

const NAMES = ['Harbour survey 2026', 'Harbour tide tables', 'Hull inspection notes', 'Crew rota, November', 'Fuel log', 'Berth bookings'];

/**
 * The one search field, the same in every app: a well with a find mark, matching as you type (never on
 * Enter). Give it a `label` that says what it finds.
 *
 * - **Shortcut**: a key that brings you here from anywhere on the page, shown as a key cap while empty.
 * - **Esc**: once you write, the key cap becomes Esc, which clears the words; a second Esc goes to whatever
 *   holds the field (a palette closes, a table stops filtering).
 * - Any input attribute passes through, such as the combobox ones a palette needs.
 *
 * The shell keeps its own search, defined in Aerie.
 */
const meta = {
  title: 'Common/Search field',
  component: SearchField,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 'var(--measure-card)', maxWidth: '100%' }}>{Story()}</div>],
  args: { label: 'Find a document', shortcut: '/' },
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    shortcut: { control: 'text' },
    clearLabel: { control: 'text' },
    defaultValue: { control: 'text' },
    value: { control: false },
    onChange: { control: false },
    inputRef: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof SearchField>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};
/** Empty: the key that brings you here sits at the end. */
export const Empty: Story = {};
/** With words: the key becomes Esc, to clear them. */
export const Written: Story = { args: { defaultValue: 'harb' } };
/** No shortcut: nothing at the end until you write. */
export const NoShortcut: Story = { args: { shortcut: undefined } };
function Narrowing(args: Story['args']) {
  const [word, setWord] = useState('harb');
  const found = NAMES.filter((n) => n.toLocaleLowerCase().includes(word.trim().toLocaleLowerCase()));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <SearchField {...args} label={args?.label ?? 'Find a document'} value={word} onChange={setWord} />
      <p className="augur-hint" aria-live="polite">
        {found.length} of {NAMES.length}: {found.join(', ') || 'nothing by that name'}
      </p>
    </div>
  );
}
/** As you type, the matches narrow. */
export const AsYouType: Story = { render: (args) => <Narrowing {...args} /> };
