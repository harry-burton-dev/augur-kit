// @vitest-environment happy-dom
// The frame round one app's pane, in the layout the app chose (augur's FrameState.layout).
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { PaneLayout, layoutHasAbout } from './pane-layout.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
const draw = (node: ReactNode) => {
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(node));
  return document.body;
};
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});

describe('PaneLayout', () => {
  it('names the layout and its options on the frame, for the CSS to draw', () => {
    const b = draw(<PaneLayout layout="split" width="wide" density="compact" inset="flush" head={<h1>Head</h1>}>screen</PaneLayout>);
    const frame = b.querySelector<HTMLElement>('.aerie-app-frame')!;
    expect(frame.dataset).toMatchObject({ layout: 'split', width: 'wide', density: 'compact', inset: 'flush' });
    expect(b.querySelector('.aerie-app-pane > .aerie-app-head h1')?.textContent).toBe('Head');
    expect(b.querySelector('.aerie-app-pane > .aerie-app-screen')?.textContent).toBe('screen');
  });

  it('defaults to the reading width, comfortable and the standard inset', () => {
    const frame = draw(<PaneLayout layout="focus" />).querySelector<HTMLElement>('.aerie-app-frame')!;
    expect(frame.dataset).toMatchObject({ layout: 'focus', width: 'read', density: 'comfortable', inset: 'standard' });
  });

  it('draws the About panel only in a layout that has it', () => {
    expect(layoutHasAbout('aside')).toBe(true);
    for (const layout of ['focus', 'split', 'canvas'] as const) {
      expect(layoutHasAbout(layout)).toBe(false);
      expect(draw(<PaneLayout layout={layout} about={<aside className="about" />} />).querySelector('.about')).toBeNull();
    }
    expect(draw(<PaneLayout layout="aside" about={<aside className="about" />} />).querySelector('.aerie-app-frame > .about')).not.toBeNull();
  });

  it('takes the frame’s own props and what it holds besides the pane', () => {
    const ref = { current: null as HTMLDivElement | null };
    const b = draw(<PaneLayout layout="focus" frame={{ ref, 'data-app': 'notes' }} overlay={<dialog className="palette" />} />);
    expect(ref.current?.dataset.app).toBe('notes');
    expect(b.querySelector('.aerie-app-frame > .palette')).not.toBeNull();
  });

  it('hides the screen when the pane shows a state in its place', () => {
    const b = draw(<PaneLayout layout="focus" status={<p className="state">Opening</p>} screenHidden />);
    expect(b.querySelector('.state')).not.toBeNull();
    expect(b.querySelector<HTMLElement>('.aerie-app-screen')!.hidden).toBe(true);
  });
});

