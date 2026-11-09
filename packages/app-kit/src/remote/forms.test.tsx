// @vitest-environment happy-dom
// The parts an admin screen needs, described in the sandbox and drawn by the host: a dialog whose work is
// done in the sandbox, ask-twice, the pickers, and where a change has got to.
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { RemoteRootElement } from '@remote-dom/core/elements';
import { QuillRemote, createQuillReceiver } from './receiver.js';
import { defineQuillElements } from './elements.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
beforeAll(() => {
  defineQuillElements();
  if (!customElements.get('remote-root')) customElements.define('remote-root', RemoteRootElement);
});
afterEach(() => {
  act(() => root?.unmount());
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const describeScreen = (build: (el: <K extends keyof HTMLElementTagNameMap>(name: K) => HTMLElementTagNameMap[K]) => Node[]) => {
  const receiver = createQuillReceiver();
  const sandbox = document.createElement('remote-root') as RemoteRootElement;
  sandbox.append(...build((name) => document.createElement(name)));
  const drops: string[] = [];
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(createElement(QuillRemote, { receiver, onDrop: (reason) => drops.push(reason) })));
  act(() => sandbox.connect(receiver.connection as never));
  return { drops };
};

const press = (button: Element) =>
  act(() => {
    button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse', button: 0 }));
    button.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'mouse', button: 0 }));
    button.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));
  });
const button = (text: string) => [...document.querySelectorAll('button')].find((b) => b.textContent?.includes(text));
const flush = async () => act(async () => new Promise((r) => setTimeout(r, 0)));

describe('a dialog whose work is done in the sandbox', () => {
  it('sends the fields’ values, waits busy, and closes when the app closes it', async () => {
    const submitted: Record<string, string>[] = [];
    let dialog!: HTMLElementTagNameMap['quill-dialog'];
    const { drops } = describeScreen((el) => {
      dialog = el('quill-dialog');
      dialog.open = true;
      dialog.heading = 'Rename the team';
      dialog.actionLabel = 'Rename';
      const name = el('quill-text-field');
      name.slot = 'fields';
      name.label = 'Name';
      name.name = 'name';
      name.value = 'Finance';
      dialog.append(name);
      dialog.addEventListener('submit', (e) => submitted.push((e as CustomEvent<Record<string, string>>).detail));
      return [dialog];
    });
    await flush();
    expect(drops).toEqual([]);
    expect(document.body.textContent).toContain('Rename the team');
    press(button('Rename')!);
    await flush();
    expect(submitted).toEqual([{ name: 'Finance' }]);
    // Still open, and nothing can be pressed while the app works.
    expect(document.body.textContent).toContain('Rename the team');
    expect(button('Cancel')?.disabled).toBe(true);
    act(() => {
      dialog.error = 'A team beside it already has that name.';
    });
    await flush();
    expect(document.body.textContent).toContain('A team beside it already has that name.');
    expect(button('Cancel')?.disabled).toBe(false);
    act(() => {
      dialog.open = false;
    });
    await flush();
    expect(document.body.textContent).not.toContain('Rename the team');
  });

  it('closes at once when the person cancels, and tells the sandbox', async () => {
    let dialog!: HTMLElementTagNameMap['quill-dialog'];
    const closed: unknown[] = [];
    describeScreen((el) => {
      dialog = el('quill-dialog');
      dialog.open = true;
      dialog.heading = 'Turn off sign-in?';
      dialog.addEventListener('close', (e) => closed.push((e as CustomEvent).detail));
      return [dialog];
    });
    await flush();
    press(button('Cancel')!);
    await flush();
    expect(closed).toEqual([false]);
    expect(dialog.open).toBe(false);
    expect(document.body.textContent).not.toContain('Turn off sign-in?');
    // The app can open it again.
    act(() => {
      dialog.open = true;
    });
    await flush();
    expect(document.body.textContent).toContain('Turn off sign-in?');
  });
});

describe('the other parts an admin screen needs', () => {
  it('acts on ask-twice only on the second press', async () => {
    let pressed = 0;
    describeScreen((el) => {
      const remove = el('quill-ask-twice');
      remove.label = 'Remove app';
      remove.confirm = 'Press again to remove it';
      remove.addEventListener('press', () => pressed++);
      return [remove];
    });
    press(button('Remove app')!);
    expect(pressed).toBe(0);
    press(button('Press again to remove it')!);
    expect(pressed).toBe(1);
  });

  it('draws a choice, ticks in a group, steps and a status, and keeps what the person picked', async () => {
    const ticked: string[][] = [];
    let group!: HTMLElementTagNameMap['quill-checkbox-group'];
    const { drops } = describeScreen((el) => {
      const choice = el('quill-choice');
      choice.label = 'Takes new releases';
      choice.options = [
        { value: 'manual', label: 'By hand' },
        { value: 'patch', label: 'Patches by itself', disabled: true, reason: 'Needs an upgrade window first.' },
      ];
      choice.value = 'manual';
      group = el('quill-checkbox-group');
      group.label = 'Roles';
      group.options = [
        { value: 'admin', label: 'Admin' },
        { value: 'editor', label: 'Editor' },
      ];
      group.value = ['editor'];
      group.addEventListener('change', (e) => ticked.push((e as CustomEvent<string[]>).detail));
      const steps = el('quill-steps');
      steps.label = 'Upgrade';
      steps.steps = [
        { label: 'Backup', state: 'done' },
        { label: 'Pull', state: 'now' },
      ];
      const status = el('quill-status');
      status.status = 'failed';
      status.label = 'Down';
      return [choice, group, steps, status];
    });
    expect(drops).toEqual([]);
    expect(document.body.textContent).toContain('Needs an upgrade window first.');
    expect(document.querySelector('[aria-current="step"]')?.textContent).toContain('Pull');
    expect(document.body.textContent).toContain('Down');
    const admin = [...document.querySelectorAll('input[type="checkbox"]')].find((i) => (i as HTMLInputElement).value === 'admin') as HTMLInputElement;
    act(() => admin.click());
    expect(ticked).toEqual([['editor', 'admin']]);
    expect(group.value).toEqual(['editor', 'admin']);
  });

  it('drops a step with a state it doesn’t know', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { drops } = describeScreen((el) => {
      const steps = el('quill-steps');
      steps.label = 'Upgrade';
      steps.steps = [{ label: 'Backup', state: 'skipped' as never }];
      return [steps];
    });
    expect(drops.some((d) => d.includes('state'))).toBe(true);
  });
});

describe('checks, a way through one job, and a list a page at a time', () => {
  it('draws the kit’s CheckList, StepList and PagedList, and sends each act, open and more back', async () => {
    const acted: string[] = [];
    let paged!: HTMLElementTagNameMap['quill-paged-list'];
    const { drops } = describeScreen((el) => {
      const checks = el('quill-check-list');
      checks.label = 'Health';
      checks.rows = [
        { id: 'disk', title: 'Disk space', detail: '82% used', tone: 'ok' },
        { id: 'backup', title: 'Backup', detail: 'None in 3 days', tone: 'needs', action: { label: 'Back up now' } },
        { id: 'odd', title: 'Odd', tone: 'loud' as never },
      ];
      checks.addEventListener('act', (e) => acted.push(`check:${(e as CustomEvent<string>).detail}`));
      const steps = el('quill-step-list');
      steps.label = 'Recover';
      steps.steps = [
        { id: 'stop', title: 'Stop the service', done: true },
        { id: 'restore', title: 'Restore', detail: 'From last night', action: 'Restore' },
        { id: 'tell', title: 'Tell people', unavailable: 'Not from here yet.' },
      ];
      steps.addEventListener('act', (e) => acted.push(`step:${(e as CustomEvent<string>).detail}`));
      paged = el('quill-paged-list');
      paged.label = 'History';
      paged.pageSize = 2;
      paged.total = 9;
      paged.noun = 'upgrades';
      paged.items = [1, 2, 3].map((n) => ({ id: `u${n}`, title: `Upgrade ${n}`, detail: 'done', status: 'done' as const }));
      paged.addEventListener('open', (e) => acted.push(`open:${(e as CustomEvent<string>).detail}`));
      paged.addEventListener('more', () => acted.push('more'));
      return [checks, steps, paged];
    });
    expect(drops.some((d) => d.includes('tone'))).toBe(true);
    // A tone it doesn't know is dropped; the row stays, said as information.
    expect(document.querySelectorAll('.augur-check-row')).toHaveLength(3);
    expect(document.querySelectorAll('.augur-check-row')[2]!.getAttribute('data-tone')).toBe('info');
    expect(document.querySelector('.augur-check-row[data-tone="needs"]')?.textContent).toContain('Needs you');
    press(button('Back up now')!);
    expect(document.querySelectorAll('.augur-step-item')).toHaveLength(3);
    expect(document.body.textContent).toContain('Not from here yet.');
    press(button('Restore')!);
    expect(document.body.textContent).toContain('1–2 of 3');
    press(button('Upgrade 1')!);
    press(button('Older')!);
    expect(document.body.textContent).toContain('Upgrade 3');
    press(button('Show')!);
    await flush();
    expect(acted).toEqual(['check:backup', 'step:restore', 'open:u1', 'more']);
  });
});
