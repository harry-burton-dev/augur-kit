// @vitest-environment happy-dom
import { act, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CheckList, CheckRow } from './check-list.js';
import { FitParts, partsThatFit } from './fit-parts.js';
import { PagedList } from './paged-list.js';
import { SectionDialog } from './section-dialog.js';
import { StepList } from './step-list.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
const draw = (node: ReactNode) => {
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(node));
};
afterEach(() => act(() => root?.unmount()));
const button = (text: string) => [...document.querySelectorAll('button')].find((b) => b.textContent?.includes(text))!;
const press = (el: Element) => act(() => (el as HTMLElement).click());

const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: 'info' as const, needs: true },
  { id: 'profile', label: 'Profile', icon: 'account' as const },
  { id: 'models', label: 'Models', icon: 'settings' as const, unavailable: 'Your organisation hasn’t turned models on.' },
];

function Account({ onClose = () => {} }: { onClose?: () => void }) {
  const [at, setAt] = useState('overview');
  return (
    <SectionDialog open heading="Account" where={at} closeLabel="Back to the menu" sections={SECTIONS} selected={at} onSelect={setAt} onClose={onClose}>
      <p>Showing {at}</p>
    </SectionDialog>
  );
}

describe('SectionDialog', () => {
  it('shows the selected section, and another when its tab is chosen', () => {
    draw(<Account />);
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    expect(document.body.textContent).toContain('Showing overview');
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    expect(tabs.map((t) => t.textContent)).toEqual(['Overview (needs you)', 'Profile', 'Models']);
    expect(document.querySelector('[role="tablist"]')?.getAttribute('aria-orientation')).toBe('vertical');
    press(tabs[1]!);
    expect(document.body.textContent).toContain('Showing profile');
  });

  it('keeps an unavailable section in the list and says why in its panel', () => {
    draw(<Account />);
    press([...document.querySelectorAll('[role="tab"]')][2]!);
    expect(document.querySelector('[role="tabpanel"]')?.textContent).toBe('Your organisation hasn’t turned models on.');
  });

  it('closes from its close button', () => {
    const onClose = vi.fn();
    draw(<Account onClose={onClose} />);
    press(button('Back to the menu'));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe('FitParts', () => {
  it('fits as many parts as each have the narrowest width, and never fewer than one', () => {
    expect(partsThatFit(1000, 4, 300, 28)).toBe(3);
    expect(partsThatFit(600, 4, 300, 28)).toBe(1);
    expect(partsThatFit(200, 4, 300, 28)).toBe(1);
    expect(partsThatFit(2000, 2, 300, 28)).toBe(2);
  });

  it('shows every part side by side without a switch until it has a width', () => {
    draw(<FitParts label="Parts" parts={[{ id: 'a', label: 'One', content: 'a' }, { id: 'b', label: 'Two', content: 'b' }]} />);
    expect(document.querySelectorAll('.augur-fit-part')).toHaveLength(2);
    expect(document.querySelector('[role="group"]')).toBeNull();
  });
});

describe('CheckRow', () => {
  it('says what needs the person in words, not only in light', () => {
    const fix = vi.fn();
    draw(
      <CheckList label="Account check">
        <CheckRow title="Two-step sign-in" detail="Your role needs it." tone="needs" action={{ label: 'Set up', onPress: fix }} />
        <CheckRow title="Email" detail="Checked" tone="ok" />
      </CheckList>,
    );
    expect(document.querySelector('[data-tone="needs"]')?.textContent).toContain('(Needs you)');
    press(button('Set up'));
    expect(fix).toHaveBeenCalledOnce();
  });
});

describe('StepList', () => {
  it('numbers the steps, ticks one that is done, and keeps one that can’t be done with why', () => {
    draw(
      <StepList
        label="Secure your account"
        steps={[
          { id: 'pw', title: 'Change your password', done: true, action: { label: 'Change password', onPress: () => {} } },
          { id: 'out', title: 'Sign out everywhere else', action: { label: 'Sign out', onPress: () => {} } },
          { id: 'tell', title: 'Tell an administrator', unavailable: 'Not built yet.', action: { label: 'Tell them', onPress: () => {} } },
        ]}
      />,
    );
    const items = [...document.querySelectorAll('.augur-step-item')];
    expect(items[0]!.textContent).toContain('(done)');
    expect(items[1]!.querySelector('.augur-step-number')?.textContent).toBe('2');
    expect(button('Tell them').getAttribute('aria-disabled') ?? button('Tell them').disabled).toBeTruthy();
  });
});

describe('PagedList', () => {
  const items = Array.from({ length: 12 }, (_, i) => `Sign-in ${i + 1}`);
  it('shows a page at a time and moves through them', () => {
    draw(<PagedList label="Sign-ins" items={items} pageSize={5} keyOf={(s) => s} render={(s) => s} />);
    expect(document.querySelectorAll('.augur-paged-item')).toHaveLength(5);
    expect(document.body.textContent).toContain('1–5 of 12');
    press(button('Older'));
    press(button('Older'));
    expect(document.body.textContent).toContain('11–12 of 12');
    expect(document.querySelectorAll('.augur-paged-item')).toHaveLength(2);
  });

  it('says so when there is nothing yet', () => {
    draw(<PagedList label="Sign-ins" items={[]} pageSize={5} keyOf={(s: string) => s} render={(s) => s} empty="Nothing yet." />);
    expect(document.body.textContent).toBe('Nothing yet.');
  });
});
