import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toggle } from './toggle.js';

/**
 * On or off, acting at once. The switch is a well and its knob a small key: on, it moves across and comes
 * up light, its mark turns from a dash to a tick, and the word changes, so the state never rests on colour.
 * Give it a Promise and it shows saving until that settles; if it fails, it turns back and says why. A
 * choice that waits for a form's primary is a Checkbox.
 */
const meta = {
  title: 'Common/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 'var(--measure-decision)' }}><Story /></div>],
  args: { label: 'Notify me', hint: 'When someone shares a record with you.' },
  argTypes: {
    reason: { control: 'text' },
    onWord: { control: 'text' },
    offWord: { control: 'text' },
    onChange: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof Toggle>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Change every prop from the controls. */
export const Playground: Story = {};
export const On: Story = { args: { label: 'Show drafts', hint: undefined, defaultChecked: true } };
/** Saves, after a moment: the knob shows it's working. */
export const Saving: Story = { args: { label: 'Saves, after a moment', hint: undefined, onChange: () => new Promise((done) => setTimeout(done, 1200)) } };
/** Fails: it turns back and says why. */
export const Fails: Story = {
  args: { label: 'Fails, and turns back', hint: undefined, onChange: () => new Promise((_, fail) => setTimeout(() => fail(new Error('The server said no. Try again in a minute.')), 900)) },
};
/** Can't be changed: it stays focusable and says why on hover and focus. */
export const Unavailable: Story = { args: { label: 'Sign in with your organisation', hint: undefined, defaultChecked: true, disabled: true, reason: 'Your deployment admin set this for everyone.' } };
