import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button.js';

/**
 * The kit's one focus ring: a blue line (`focus`, `focus-ring` thick) a short gap (`focus-gap`) outside the
 * part, the same on a key (Button) and on a well (fields, boxes, switches, choices). A field shows it while
 * you write in it; everything else shows it when the keyboard brought you there, never on a click. A part
 * of an app takes the same ring with the class `augur-focus-ring`. Tab through the parts to see it.
 */
const meta = {
  title: 'Common/Focus ring',
  parameters: { layout: 'centered' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

/** The ring, drawn on a key and on a well as the keyboard would show it. */
export const Ring: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'center' }}>
      <div className="augur-focus-ring" data-focus-visible="" style={{ borderRadius: 'var(--radius-control)' }}>
        <Button kind="secondary">A key</Button>
      </div>
      <div className="augur-field" style={{ width: 'var(--measure-decision)' }}>
        <div className="augur-field-box augur-focus-ring" data-focus-visible="">
          <span className="augur-input">A well</span>
        </div>
      </div>
    </div>
  ),
};
