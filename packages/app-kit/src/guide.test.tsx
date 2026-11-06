// @vitest-environment happy-dom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FirstSteps, Guide } from './guide.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
const draw = (node: ReactNode) => {
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(node));
};
afterEach(() => act(() => root?.unmount()));
const text = () => document.body.textContent ?? '';
const button = (name: string) => [...document.querySelectorAll('button')].find((b) => b.textContent?.trim().endsWith(name))!;

const steps = [
  { target: 'a', title: 'Make a plan', line: 'New plan starts one.' },
  { target: 'b', title: 'Find yours', line: 'Filter narrows the list.' },
];

describe('the first-run guide', () => {
  it('goes step by step, says where it is, and says Done on the last', () => {
    const done = vi.fn();
    draw(
      <>
        <button id="a">New</button>
        <Guide steps={steps} onDone={done} />
      </>,
    );
    expect(text()).toContain('1 of 2');
    expect(text()).toContain('Make a plan');
    expect(document.querySelector('.quill-guide-lamp')).not.toBeNull();
    act(() => button('Next').click());
    expect(text()).toContain('Find yours');
    // The second step's part isn't on the page: the whole page dims and nothing is lit.
    expect(document.querySelector('.quill-guide-lamp')).toBeNull();
    act(() => button('Done').click());
    expect(done).toHaveBeenCalled();
  });

  it('skips on Esc, and shows nothing when closed', () => {
    const skip = vi.fn();
    draw(<Guide steps={steps} onSkip={skip} />);
    act(() => void window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })));
    expect(skip).toHaveBeenCalled();
    draw(<Guide steps={steps} open={false} />);
    expect(document.querySelector('.quill-guide')).toBeNull();
  });

  it('speaks in the words it is given', () => {
    draw(<Guide steps={steps} labels={{ next: 'Show me', count: (s, of) => `Step ${s} of ${of}` }} />);
    expect(text()).toContain('Step 1 of 2');
    expect(button('Show me')).toBeDefined();
  });
});

describe('first steps', () => {
  it('counts what is done, and gives only the next step its action', () => {
    const share = vi.fn();
    const hide = vi.fn();
    draw(
      <FirstSteps
        onHide={hide}
        steps={[
          { id: 'make', label: 'Make a plan', done: true },
          { id: 'share', label: 'Share it', action: 'Share', onAction: share },
          { id: 'remind', label: 'Turn on reminders', action: 'Turn on' },
        ]}
      />,
    );
    expect(text()).toContain('1 of 3 done');
    expect([...document.querySelectorAll('button')].map((b) => b.textContent)).toEqual(['Share', 'Hide for now']);
    act(() => button('Share').click());
    expect(share).toHaveBeenCalled();
    act(() => button('Hide for now').click());
    expect(hide).toHaveBeenCalled();
  });
});
