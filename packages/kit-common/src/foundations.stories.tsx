import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactNode } from 'react';

/**
 * The foundations the parts are drawn from, as tokens (PDR-015): the one colour that means "needs you",
 * and the two typefaces. Each is a single token in Common's token file; change it there and every part
 * follows. The values here are the tokens' own, read live from the page.
 */
const meta = {
  title: 'Common/Foundations',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: 'The foundations the parts are drawn from, as tokens (PDR-015). Each is a single token in `packages/kit-common/tokens/common.tokens.json`; change it there and every part follows.' } },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const label: CSSProperties = { margin: 0, fontFamily: 'var(--font-mono)', fontSize: 'var(--type-label)', lineHeight: 'var(--leading-label)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: 'var(--ink-muted)' };
const row: CSSProperties = { display: 'grid', gridTemplateColumns: 'minmax(0, 12rem) minmax(0, 1fr)', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--hairline)' };

function Row({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div style={row}>
      <p style={label}>{name}</p>
      <div>{children}</div>
    </div>
  );
}

/** `needs-you`: the one colour that means something needs you, in both kits. Today it is the accent green. Aerie's `needs-light` and every needs-you mark read it. */
export const NeedsYou: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--measure-read)' }}>
      <Row name="needs-you">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--needs-you)' }}>
          <i aria-hidden="true" style={{ width: 'var(--space-2)', height: 'var(--space-2)', borderRadius: 'var(--radius-pill)', background: 'var(--needs-you)' }} />
          1 needs you
        </span>
      </Row>
      <Row name="needs-light">
        <span style={{ display: 'inline-block', padding: 'var(--space-3) var(--space-5)', color: 'var(--ink)', background: 'linear-gradient(to right, color-mix(in srgb, var(--needs-light) 34%, transparent), transparent 62%)' }}>
          Budget draft
        </span>
      </Row>
    </div>
  ),
};

/** `font-sans` for all text and titles, and `font-mono` for labels, small print, counts and code. */
export const Typefaces: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--measure-read)' }}>
      <Row name="font-sans">
        <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--type-lead)', lineHeight: 'var(--leading-lead)' }}>Review the budget draft before Friday</p>
      </Row>
      <Row name="font-sans 600">
        <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Library, Recent, Shared, Drafts</p>
      </Row>
      <Row name="font-mono">
        <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 'var(--type-small)', lineHeight: 'var(--leading-small)' }}>Edited 09:58 · 12 rows · v0.9.0</p>
      </Row>
      <Row name="font-mono label">
        <p style={label}>Work · Context · Platform</p>
      </Row>
    </div>
  ),
};
