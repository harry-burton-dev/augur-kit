import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from './button.js';
import { CheckList, CheckRow } from './check-list.js';
import { FitParts } from './fit-parts.js';
import { PagedList } from './paged-list.js';
import { SectionDialog, type DialogSection } from './section-dialog.js';
import { StepList } from './step-list.js';
import { Toggle } from './toggle.js';

/** Sample content: a person's account. Names are examples. */
const SECTIONS: DialogSection[] = [
  { id: 'overview', label: 'Overview', icon: 'info', needs: true },
  { id: 'profile', label: 'Profile', icon: 'account' },
  { id: 'security', label: 'Sign-in and security', icon: 'lock', needs: true },
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'appearance', label: 'Appearance', icon: 'palette' },
  { id: 'models', label: 'Models', icon: 'settings', unavailable: 'Your organisation hasn’t turned models on. An admin can, in Admin.' },
];
const SIGN_INS = Array.from({ length: 12 }, (_, i) => ({ id: String(i), what: i === 1 ? 'Sign-in failed: wrong password' : 'Signed in', when: `${9 - Math.floor(i / 2)} Nov, 0${8 + (i % 2)}:52` }));

function Check() {
  return (
    <CheckList label="Account check">
      <CheckRow title="Two-step sign-in" detail="Your role needs it, and it isn’t set up." tone="needs" action={{ label: 'Set up', onPress: () => {} }} />
      <CheckRow title="Email" detail="sam.lee@example.org, checked" tone="ok" action={{ label: 'See', onPress: () => {} }} />
      <CheckRow title="Failed sign-ins" detail="1 in the last 7 days" tone="problem" action={{ label: 'See', onPress: () => {} }} />
    </CheckList>
  );
}
function Signins({ size = 5 }: { size?: number }) {
  return <PagedList label="Recent sign-ins" items={SIGN_INS} pageSize={size} keyOf={(s) => s.id} render={(s) => <span><b>{s.what}</b> · {s.when}</span>} />;
}

function Account() {
  const [at, setAt] = useState('overview');
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button onPress={() => setOpen(true)}>Open Account</Button>
      <SectionDialog open={open} onClose={() => setOpen(false)} heading="Account" where={SECTIONS.find((s) => s.id === at)?.label} closeLabel="Back to the menu" sections={SECTIONS} selected={at} onSelect={setAt} ruleAfter={['overview']}>
        <FitParts
          label="Parts of this section"
          parts={[
            { id: 'you', label: 'You', content: <Toggle label="Show me as away" checked onChange={() => {}} /> },
            { id: 'check', label: 'Account check', content: <Check /> },
            { id: 'signins', label: 'Recent sign-ins', content: <Signins size={4} /> },
          ]}
        />
      </SectionDialog>
    </>
  );
}

const meta = { title: 'Common/Work parts', parameters: { layout: 'padded' } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

/** SectionDialog with FitParts inside: sections down the side, parts side by side while they fit, the rest behind the switch. Up and down move between sections; Esc closes. */
export const AccountDialog: Story = { render: () => <Account /> };
/** CheckList: the one that needs you is lit from its edge, and says so in words. */
export const Checks: Story = { render: () => <div style={{ maxWidth: 'var(--measure-read)' }}><Check /></div> };
/** StepList: an ordered way through one job. A done step is ticked; one that can’t be done yet stays and says why. */
export const StepsThroughAJob: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--measure-read)' }}>
      <StepList
        label="Secure your account"
        steps={[
          { id: 'pw', title: 'Change your password', detail: 'Opens the sign-in page, and comes back here.', done: true, action: { label: 'Change password', onPress: () => {} } },
          { id: 'out', title: 'Sign out everywhere else', detail: 'You’re signed in in 1 other place.', action: { label: 'Sign out everywhere else', onPress: () => {} } },
          { id: 'tell', title: 'Tell an administrator', detail: 'Ask them directly for now.', unavailable: 'There’s no way to tell them from here yet.', action: { label: 'Tell an administrator', onPress: () => {} } },
        ]}
      />
    </div>
  ),
};
/** PagedList: a page at a time, never a scroll bar. */
export const Paged: Story = { render: () => <div style={{ maxWidth: 'var(--measure-read)' }}><Signins /></div> };
/** FitParts in a narrow pane: one part at a time, behind the switch. */
export const NarrowParts: Story = {
  render: () => (
    <div style={{ width: 'var(--measure-glance)' }}>
      <FitParts label="Parts" parts={[{ id: 'a', label: 'Account check', content: <Check /> }, { id: 'b', label: 'Recent sign-ins', content: <Signins size={3} /> }]} />
    </div>
  ),
};
