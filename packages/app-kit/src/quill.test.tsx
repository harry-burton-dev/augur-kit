// @vitest-environment happy-dom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { About } from './about.js';
import { AppFrame, RailLink } from './app-frame.js';
import { FrontPage } from './front-page.js';
import { More } from './more.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
const draw = (node: ReactNode) => {
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(node));
};
afterEach(() => act(() => root?.unmount()));
const button = (name: string) => [...document.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === name || b.textContent === name)!;

describe('AppFrame', () => {
  it('folds the rail to icons, keeps their names, and remembers it', () => {
    localStorage.clear();
    const frame = () => (
      <AppFrame app={{ name: 'Plans', icon: 'library' }} railLabel="Sections" rail={<RailLink icon="home" label="Home" current onPress={() => {}} />}>
        Main
      </AppFrame>
    );
    draw(frame());
    expect(document.querySelector('.quill-rail-label')?.textContent).toBe('Home');
    act(() => button('Hide Sections').click());
    expect(document.querySelector('.quill-rail-label')).toBeNull();
    expect(button('Home').getAttribute('aria-current')).toBe('page');
    draw(frame());
    expect(document.querySelector('.quill-frame')!.getAttribute('data-rail')).toBe('closed');
  });

  it('tells the shell how much of the edge its drawer takes, and gives it back when it goes', () => {
    const seen = vi.fn();
    window.addEventListener('ui-drawer', (e) => seen((e as CustomEvent).detail.inset));
    draw(<AppFrame app={{ name: 'Plans', icon: 'library' }} drawer={<p>About</p>}>Main</AppFrame>);
    act(() => root!.unmount());
    root = undefined;
    expect(seen).toHaveBeenLastCalledWith(0);
  });
});

describe('AppFrame at every width', () => {
  let width = 1200;
  let resize: (() => void) | undefined;
  beforeEach(() => {
    localStorage.clear();
    width = 1200;
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(private cb: ResizeObserverCallback) {
          resize = () => this.cb([{ contentRect: { width } } as ResizeObserverEntry], this as unknown as ResizeObserver);
        }
        observe() {}
        disconnect() {}
      },
    );
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => ({ width }) as DOMRect);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
  const at = (w: number) => {
    width = w;
    act(() => resize!());
  };
  const frame = () => document.querySelector('.quill-frame')!;
  const app = (onPress = () => {}) => (
    <AppFrame app={{ name: 'Plans', icon: 'library' }} railLabel="Sections" rail={<RailLink icon="home" label="Home" onPress={onPress} />} drawerLabel="Details" drawer={<p>About</p>}>
      <p id="main">Main</p>
    </AppFrame>
  );

  it('opens the drawer over the page below the overlay width, and closes it on Escape or a press outside', () => {
    draw(app());
    expect(frame().getAttribute('data-drawer')).toBe('open');
    at(1000);
    expect(frame().getAttribute('data-shape')).toBe('overlay');
    expect(frame().getAttribute('data-drawer')).toBe('closed');
    expect(frame().getAttribute('data-rail')).toBe('open');
    act(() => button('Show Details').click());
    expect(frame().getAttribute('data-drawer')).toBe('over');
    act(() => document.querySelector('.quill-room')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    expect(frame().getAttribute('data-drawer')).toBe('closed');
    act(() => button('Show Details').click());
    act(() => document.getElementById('main')!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })));
    expect(frame().getAttribute('data-drawer')).toBe('closed');
  });

  it('folds the rail to icons below the icons width without forgetting the choice, and opens it over the page', () => {
    const picked = vi.fn();
    draw(app(picked));
    at(700);
    expect(frame().getAttribute('data-rail')).toBe('closed');
    expect(document.querySelector('.quill-rail-label')).toBeNull();
    act(() => button('Show Sections').click());
    expect(frame().getAttribute('data-rail')).toBe('over');
    expect(document.querySelector('.quill-rail-label')?.textContent).toBe('Home');
    act(() => button('Home').click());
    expect(picked).toHaveBeenCalled();
    expect(frame().getAttribute('data-rail')).toBe('closed');
    expect(localStorage.getItem('augur-app-frame:rail-closed')).toBeNull();
    at(1200);
    expect(frame().getAttribute('data-rail')).toBe('open');
  });
});

describe('FrontPage and About', () => {
  it('say so when a section or a row is empty', () => {
    draw(<FrontPage heading="Plans" sections={[{ id: 'needs', title: 'Needs you', empty: 'Nothing needs you.' }]} />);
    expect(document.body.textContent).toContain('Nothing needs you.');
    draw(<About what="A collection of 12 plans" />);
    expect(document.body.textContent).toContain('Nobody owns this yet.');
    expect(document.body.textContent).toContain('Nothing is linked to this yet.');
  });
});

describe('More', () => {
  it('says how many of how many, and goes when they all show', () => {
    const onMore = vi.fn();
    draw(<More shown={50} total={312} noun="records" onMore={onMore} />);
    expect(document.body.textContent).toContain('Showing 50 of 312 records');
    act(() => button('Show 50 more').click());
    expect(onMore).toHaveBeenCalled();
    draw(<More shown={312} total={312} noun="records" onMore={onMore} />);
    expect(document.body.textContent).toBe('');
  });
});
