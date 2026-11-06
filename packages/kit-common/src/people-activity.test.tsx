// @vitest-environment happy-dom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Activity } from './activity.js';
import { Comments } from './comments.js';
import { Notifications } from './notifications.js';
import { People, Person, Presence } from './person.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
const draw = (node: ReactNode) => {
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(node));
};
afterEach(() => act(() => root?.unmount()));
const text = () => document.body.textContent ?? '';
const type = async (input: HTMLInputElement, value: string) =>
  act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

describe('Person presence', () => {
  it('dims someone away and says so aloud', () => {
    draw(<Person name="Lee Park" here={false} />);
    expect(document.querySelector('.augur-person')!.hasAttribute('data-away')).toBe(true);
    expect(text()).toContain('away');
  });

  it('reads presence in a group', () => {
    draw(<People label="Here" people={[{ name: 'Sam Ortiz', here: true }, { name: 'Lee Park', here: false }]} />);
    expect(document.querySelector('[role="img"]')!.getAttribute('aria-label')).toBe('Here: Sam Ortiz, here now, Lee Park, away');
  });

  it('puts who is here first', () => {
    draw(<Presence label="On this plan" people={[{ name: 'Lee Park', here: false }, { name: 'Sam Ortiz', here: true }]} />);
    expect(text()).toContain('1 here');
    expect(document.querySelector('li')!.textContent).toContain('Sam Ortiz');
  });
});

describe('Comments', () => {
  const points = [
    { id: 's', by: { name: 'Lee Park' }, at: 'Mon', text: 'Budget?', settled: { by: 'Lee Park', summary: 'Approved' } },
    { id: 'o', by: { name: 'Sam Ortiz' }, at: '10:00', text: 'Drafts are with legal.' },
    { id: 'a', by: { name: 'Priya Shah' }, at: '10:02', text: 'Is October firm?', asksYou: true },
  ];

  it('puts what asks you first, and folds what is settled', () => {
    draw(<Comments label="Comments" points={points} />);
    expect(text()).toContain('2 open');
    expect(document.querySelector('.augur-point')!.textContent).toContain('Is October firm?');
    const line = document.querySelector<HTMLButtonElement>('.augur-settled-line')!;
    expect(text()).not.toContain('Budget?');
    act(() => line.click());
    expect(line.getAttribute('aria-expanded')).toBe('true');
    expect(text()).toContain('Budget?');
  });

  it('settles a point', () => {
    const settle = vi.fn();
    draw(<Comments label="Comments" points={points} onSettle={settle} />);
    const button = [...document.querySelectorAll('button')].find((b) => b.textContent === 'Settle')!;
    act(() => button.click());
    expect(settle).toHaveBeenCalledWith('a');
  });
});

describe('Activity', () => {
  const events = [
    { id: '1', at: '11:40', who: { name: 'Priya Shah' }, did: 'asked you to approve', what: 'Q3 plan', needsYou: true },
    { id: '2', at: '11:05', who: { name: 'Lee Park' }, did: 'approved', what: 'Q3 plan' },
    { id: '3', at: '10:20', who: { name: 'Sam Ortiz' }, did: 'edited', what: 'Supplier list' },
    { id: '4', at: 'Mon', who: { name: 'Lee Park' }, did: 'archived', what: 'Q2 plan' },
  ];

  it('pulls what needs you above, and marks where you last looked', () => {
    draw(<Activity label="Activity" events={events} seenFrom="3" />);
    expect(document.querySelector('.augur-activity-asks')!.textContent).toContain('asked you to approve');
    expect(document.querySelectorAll('.augur-events .augur-event')).toHaveLength(3);
    expect(document.querySelectorAll('.augur-event[data-seen]')).toHaveLength(2);
    expect(document.querySelector('.augur-since')!.closest('li')!.textContent).toContain('Sam Ortiz');
  });

  it('finds by who, what or when', async () => {
    draw(<Activity label="Activity" events={events} />);
    await type(document.querySelector('input')!, 'supplier');
    expect(document.querySelectorAll('.augur-events .augur-event')).toHaveLength(1);
    await type(document.querySelector('input')!, 'nobody');
    expect(text()).toContain('Nothing matches');
  });

  it('pages instead of scrolling', () => {
    draw(<Activity label="Activity" events={events} pageSize={2} />);
    expect(text()).toContain('1 of 2');
    expect(document.querySelectorAll('.augur-events .augur-event')).toHaveLength(2);
  });
});

describe('Notifications', () => {
  it('counts what is new and opens a row', () => {
    const open = vi.fn();
    draw(
      <Notifications
        label="Notifications"
        onOpen={open}
        items={[
          { id: 'a', who: { name: 'Sam Ortiz' }, text: 'replied', at: '10:20', unread: true },
          { id: 'b', text: 'Export ready', at: 'Mon' },
        ]}
      />,
    );
    expect(text()).toContain('1 new');
    act(() => document.querySelector<HTMLButtonElement>('.augur-note-row')!.click());
    expect(open).toHaveBeenCalledWith(expect.objectContaining({ id: 'a' }));
  });
});
