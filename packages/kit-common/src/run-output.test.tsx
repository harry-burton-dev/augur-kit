// @vitest-environment happy-dom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RunLog, stepToOpen, type RunStep } from './run-log.js';
import { Diff, DiffText } from './diff.js';
import { Inspector } from './inspector.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
const draw = (node: ReactNode) => {
  act(() => root?.unmount());
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(node));
};
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});
const $ = (s: string) => document.querySelector<HTMLElement>(s);
const $$ = (s: string) => [...document.querySelectorAll<HTMLElement>(s)];
const press = (el: HTMLElement | null | undefined) => act(() => el!.click());
const text = (s: string) => $$(s).map((e) => e.textContent);

const lines = (n: number) => Array.from({ length: n }, (_, i) => ({ text: `line ${i + 1}` }));
const steps: RunStep[] = [
  { id: 'a', title: 'Fetch', status: 'done', lines: lines(2) },
  { id: 'b', title: 'Match', status: 'running', lines: lines(6) },
  { id: 'c', title: 'Write', status: 'failed', lines: [{ level: 'error', text: 'Refused' }] },
];

describe('RunLog', () => {
  it('opens the step that most needs looking at', () => {
    expect(stepToOpen(steps)).toBe('c');
    expect(stepToOpen([steps[0]!, { ...steps[1]!, status: 'needs' }])).toBe('b');
    expect(stepToOpen([steps[0]!])).toBe('a');
    draw(<RunLog steps={steps} label="the run" />);
    expect($('[aria-expanded="true"]')!.textContent).toContain('Write');
    expect(text('.augur-runlog-text')).toEqual(['FailRefused']);
  });

  it('shows the last lines and pages in the earlier ones', () => {
    draw(<RunLog steps={steps} label="the run" defaultOpen="b" lastLines={2} />);
    expect(text('.augur-runlog-text')).toEqual(['line 5', 'line 6']);
    press($('.augur-runlog-earlier'));
    expect($$('.augur-runlog-line')).toHaveLength(6);
  });

  it('opens one step at a time, and tells', () => {
    const onOpenChange = vi.fn();
    draw(<RunLog steps={steps} label="the run" onOpenChange={onOpenChange} />);
    press($$('.augur-runlog-head')[0]);
    expect(onOpenChange).toHaveBeenCalledWith('a');
    expect($$('[aria-expanded="true"]')).toHaveLength(1);
    press($$('.augur-runlog-head')[0]);
    expect(onOpenChange).toHaveBeenLastCalledWith(null);
  });

  it('keeps an unavailable step in the run and says why', () => {
    draw(<RunLog steps={[{ ...steps[0]!, disabled: true, reason: 'Gone.' }]} label="the run" defaultOpen={null} />);
    const head = $('.augur-runlog-head')!;
    press(head);
    expect(head.getAttribute('aria-expanded')).toBe('false');
    expect(document.getElementById(head.getAttribute('aria-describedby')!)!.textContent).toBe('Gone.');
  });

  it('says so when there is nothing yet', () => {
    draw(<RunLog steps={[]} label="the run" emptyText="Nothing yet." />);
    expect(document.body.textContent).toBe('Nothing yet.');
  });
});

describe('Diff', () => {
  const changes = [
    { key: 'timeout', was: '30s', now: '45s' },
    { key: 'notify', now: 'ops' },
    { key: 'paused', was: 'true' },
  ];

  it('sinks what went and raises what came, and says new and removed', () => {
    draw(<Diff changes={changes} label="the settings" />);
    expect(text('.augur-diff-sink')).toEqual(['was 30s', 'was true']);
    expect(text('.augur-diff-rise')).toEqual(['now 45s', 'now ops']);
    expect(text('.augur-diff-word')).toEqual(['new', 'removed']);
  });

  it('folds past the limit', () => {
    draw(<Diff changes={changes} label="the settings" limit={1} />);
    expect($$('.augur-diff-change')).toHaveLength(1);
    press($('.augur-diff-more'));
    expect($$('.augur-diff-change')).toHaveLength(3);
  });

  it('says when nothing changed, or why it cannot show', () => {
    draw(<Diff changes={[]} label="x" sameText="Same." />);
    expect(document.body.textContent).toBe('Same.');
    draw(<Diff changes={changes} label="x" disabled reason="Gone." />);
    expect(document.body.textContent).toBe('Gone.');
  });

  it('marks words in a sentence as removed and added', () => {
    draw(<DiffText parts={[{ op: 'same', text: 'a ' }, { op: 'del', text: 'b' }, { op: 'add', text: 'c' }]} />);
    expect($('del')!.textContent).toBe('removed b');
    expect($('ins')!.textContent).toBe('added c');
  });
});

describe('Inspector', () => {
  const value = { tool: 'write', output: { error: { code: 'read-only' } }, token: { key: 'x' } };

  it('opens what a key holds in the next column', () => {
    const onPathChange = vi.fn();
    draw(<Inspector value={value} label="the call" onPathChange={onPathChange} />);
    expect($$('.augur-inspector-col')).toHaveLength(1);
    press($$('.augur-inspector-item')[1]);
    expect(onPathChange).toHaveBeenCalledWith(['output']);
    expect($$('.augur-inspector-col')).toHaveLength(2);
    expect($('.augur-inspector-path')!.textContent).toContain('output');
  });

  it('opens a value whole, as a snippet to copy', () => {
    draw(<Inspector value={value} label="the call" defaultPath={['output', 'error', 'code']} />);
    expect($('.augur-inspector-leaf')!.textContent).toContain('"read-only"');
  });

  it('steps older columns off past the limit', () => {
    draw(<Inspector value={value} label="the call" defaultPath={['output', 'error', 'code']} columns={2} />);
    expect($$('.augur-inspector-col').map((c) => c.dataset.depth)).toEqual(['2', '3']);
  });

  it('never shows what a hidden path holds', () => {
    draw(<Inspector value={value} label="the call" hidden={['token']} defaultPath={['token']} hiddenWord="Hidden" />);
    expect(document.body.textContent).not.toContain('key');
    expect($('.augur-inspector-leaf')!.textContent).toBe('Hidden');
  });

  it('moves with the arrow keys', () => {
    draw(<Inspector value={value} label="the call" />);
    const first = $$('.augur-inspector-item')[0]!;
    act(() => first.focus());
    act(() => {
      first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    });
    expect(document.activeElement?.textContent).toContain('output');
    act(() => {
      document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    });
    expect($$('.augur-inspector-col')).toHaveLength(2);
  });

  it('says why it cannot show, or that it is empty', () => {
    draw(<Inspector value={{}} label="x" emptyText="Nothing." />);
    expect(document.body.textContent).toBe('Nothing.');
    draw(<Inspector value={value} label="x" disabled reason="Private." />);
    expect(document.body.textContent).toBe('Private.');
  });
});
