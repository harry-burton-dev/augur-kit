// @vitest-environment happy-dom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Explain } from './explain.js';
import { Letterbox } from './letterbox.js';
import { UrgentEdge } from './urgent-edge.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
const draw = (node: ReactNode) => {
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(node));
};
afterEach(() => act(() => root?.unmount()));
const press = (key: string, target: Element = document.activeElement ?? document.body) =>
  act(() => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    target.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true, cancelable: true }));
  });
const button = (name: string) => [...document.querySelectorAll('button')].find((b) => b.textContent === name);
const dialog = () => document.querySelector('[role="alertdialog"]')!;

describe('Letterbox', () => {
  it('steps back on Esc, and offers Step back as a control', () => {
    const onStepBack = vi.fn();
    draw(<Letterbox open heading="AUGUR went back to 0.13.0" onStepBack={onStepBack} />);
    press('Escape', dialog());
    expect(onStepBack).toHaveBeenCalledTimes(1);
    act(() => button('Step back')!.click());
    expect(onStepBack).toHaveBeenCalledTimes(2);
  });

  it('stays on Esc when it must be answered first', () => {
    draw(<Letterbox open heading="Approve the upgrade" />);
    press('Escape', dialog());
    expect(dialog()).not.toBeNull();
    expect(button('Step back')).toBeUndefined();
  });

  it('is an alert dialog named by its heading and described by its summary and acknowledgement', () => {
    draw(<Letterbox open heading="Backups are failing" summary="The last three runs failed." onAcknowledge={() => {}} />);
    const d = dialog();
    expect(document.getElementById(d.getAttribute('aria-labelledby')!)?.textContent).toBe('Backups are failing');
    const described = d.getAttribute('aria-describedby')!.split(' ').map((id) => document.getElementById(id)?.textContent);
    expect(described).toEqual(['The last three runs failed.', 'Not acknowledged']);
  });

  it('asks to be acknowledged, by the button or the key A', () => {
    const onAcknowledge = vi.fn();
    draw(<Letterbox open heading="Backups are failing" onAcknowledge={onAcknowledge} />);
    expect(document.querySelector('.augur-ack')!.textContent).toContain('Not acknowledged');
    act(() => button('Acknowledge')!.click());
    expect(onAcknowledge).toHaveBeenCalledTimes(1);
    press('a', dialog());
    expect(onAcknowledge).toHaveBeenCalledTimes(2);
  });

  it('says who acknowledged it and when, and that it is not resolved', () => {
    const onAcknowledge = vi.fn();
    draw(<Letterbox open heading="Backups are failing" acknowledged={{ by: 'Lee Park', at: '07:14' }} onAcknowledge={onAcknowledge} />);
    expect(document.querySelector('.augur-ack')!.textContent).toBe('Acknowledged 07:14 by Lee Park · not resolved');
    expect(button('Acknowledge')).toBeUndefined();
    press('a', dialog());
    expect(onAcknowledge).not.toHaveBeenCalled();
  });

  it('shows no acknowledgement chip where acknowledging is not part of it', () => {
    draw(<Letterbox open heading="Backups are failing" />);
    expect(document.querySelector('.augur-ack')).toBeNull();
  });

  it('carries the bars and the queue', () => {
    draw(
      <Letterbox
        open
        heading="Backups are failing"
        queue={{ position: 1, total: 2, next: 'Disk nearly full' }}
        bars={{ top: <span>Health · Org floor · Updater</span>, bottom: <span>Seen by Lee Park</span> }}
      />,
    );
    const top = document.querySelector('.augur-letterbox-bar[data-edge="top"]')!;
    const bottom = document.querySelector('.augur-letterbox-bar[data-edge="bottom"]')!;
    expect(top.textContent).toContain('Health · Org floor · Updater');
    expect(top.querySelector('.augur-letterbox-queue')!.textContent).toBe('1 of 2 · next: Disk nearly full');
    expect(bottom.textContent).toContain('Seen by Lee Park');
  });

  it('leaves out the next item when there is none', () => {
    draw(<Letterbox open heading="Backups are failing" queue={{ position: 2, total: 2 }} />);
    expect(document.querySelector('.augur-letterbox-queue')!.textContent).toBe('2 of 2');
  });
});

describe('Letterbox, W3.5b', () => {
  it('keeps what does not fit behind More, shown in place when asked', () => {
    draw(<Letterbox open heading="Server 3 bake halted" more={<p>Every server's error rate</p>} />);
    const more = button('More')!;
    const text = document.getElementById(more.getAttribute('aria-controls')!)!;
    expect(more.getAttribute('aria-expanded')).toBe('false');
    expect(text.hidden).toBe(true);
    act(() => more.click());
    expect(button('Less')!.getAttribute('aria-expanded')).toBe('true');
    expect(text.hidden).toBe(false);
    expect(document.querySelector('.augur-letterbox-frame')!.getAttribute('data-more')).toBe('open');
  });

  it('is solid unless the app asks for the see-through frame', () => {
    draw(<Letterbox open heading="Server 3 bake halted" />);
    expect(document.querySelector('.augur-letterbox')!.getAttribute('data-look')).toBe('solid');
    act(() => root!.render(<Letterbox open look="see-through" heading="Server 3 bake halted" />));
    expect(document.querySelector('.augur-letterbox')!.getAttribute('data-look')).toBe('see-through');
  });
});

describe('Explain', () => {
  it('labels each of the four parts in words', () => {
    draw(<Explain what="It failed." why="Nobody can upgrade." canDo="See what failed." whoElse="Lee Park can." />);
    const labels = [...document.querySelectorAll('dt')].map((d) => d.textContent);
    const text = [...document.querySelectorAll('dd')].map((d) => d.textContent);
    expect(labels).toEqual(['What happened', 'Why it matters', 'What you can do', 'Who else can act']);
    expect(text).toEqual(['It failed.', 'Nobody can upgrade.', 'See what failed.', 'Lee Park can.']);
  });
});

describe('UrgentEdge', () => {
  it('is a labelled button that reopens the letterbox', () => {
    const onReopen = vi.fn();
    draw(<UrgentEdge headline="Backups are failing" onReopen={onReopen} queue={{ position: 1, total: 2, next: 'Disk nearly full' }} />);
    const b = document.querySelector('button')!;
    expect(b.textContent).toContain('Backups are failing');
    expect(b.textContent).toContain('Not acknowledged');
    expect(b.textContent).toContain('1 of 2 · next: Disk nearly full');
    act(() => b.click());
    expect(onReopen).toHaveBeenCalledTimes(1);
    act(() => b.focus());
    press('Enter', b);
    expect(onReopen).toHaveBeenCalledTimes(2);
  });

  it('says when it is acknowledged but not resolved', () => {
    draw(<UrgentEdge headline="Backups are failing" acknowledged onReopen={() => {}} />);
    expect(document.querySelector('button')!.textContent).toContain('Acknowledged · not resolved');
  });
});
