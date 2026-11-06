import type { Meta, StoryObj } from '@storybook/react-vite';
import { Ref } from './things.js';

/**
 * A thing from any app, as a small chip: its kind's icon, its name, and a floor dot when it's kept
 * on another floor than this page's. A ref opens what it names; text never links. With `onRemove`
 * it carries a ×, except when it comes `from` somewhere else, since it can't be taken off here.
 * Refs, plural, lays several out and says how many you can't open.
 */
const meta = {
  title: 'Quill/Ref',
  component: Ref,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { value: { kind: 'document', id: 'd1', title: 'Leave policy' } },
  argTypes: { value: { control: 'object' }, onOpen: { action: 'open' }, onRemove: { control: false }, className: { control: false } },
} satisfies Meta<typeof Ref>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};
/** A document. */
export const Document: Story = {};
/** An entity, with its own kind's icon, kept on another floor. */
export const OnAnotherFloor: Story = { args: { value: { kind: 'entity', id: 'e1', label: 'North quay', type: 'port', floorKind: 'org', floorName: 'Organisation' } } };
/** With a × to take it off this page. */
export const Removable: Story = { args: { onRemove: () => undefined } };
/** From somewhere else: it says where, and has no ×. */
export const FromElsewhere: Story = { args: { value: { kind: 'intent', id: 'i1', title: 'Cut travel spend', from: 'Planning' }, onRemove: () => undefined } };

/** Every kind of thing a ref can name. */
export const Kinds: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
      <Ref value={{ kind: 'document', id: 'd', title: 'Leave policy' }} />
      <Ref value={{ kind: 'entity', id: 'e', label: 'Harbour crane', type: 'facility' }} />
      <Ref value={{ kind: 'intent', id: 'i', title: 'Cut travel spend' }} />
      <Ref value={{ kind: 'person', id: 'p', label: 'Sam Ortiz' }} />
      <Ref value={{ kind: 'team', id: 't', label: 'Procurement' }} />
    </div>
  ),
};
