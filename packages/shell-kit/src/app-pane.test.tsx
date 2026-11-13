// @vitest-environment happy-dom
// The app pane (DR): the region at the window's right edge while an app is open. Its sections are the ones
// the app declares, as accordion headers; the words are the kit's and can be changed.
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';
import { AppPane } from './app-pane.js';

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

const app = { name: 'Notes', icon: 'document' };
const sections = [
  { id: 'details', label: 'Details', icon: 'info' },
  { id: 'history', label: 'History', icon: 'clock' },
];
function Host({ start, top }: { start?: string; top?: ReactNode }) {
  const [open, setOpen] = useState(start);
  return <AppPane app={app} sections={sections} open={open} onOpenChange={setOpen} top={top} content={{ details: <p>Kept per floor</p> }} />;
}
const titles = (body: HTMLElement) => [...body.querySelectorAll<HTMLButtonElement>('.aerie-pane-title')];

describe('the app pane', () => {
  it('is a named region with the top, the dock image, then one title per section in order', () => {
    const body = draw(<Host top={<span className="clock">00:24</span>} />);
    const pane = body.querySelector('aside')!;
    expect(pane.getAttribute('aria-label')).toBe('About Notes');
    expect([...pane.children].map((c) => c.className)).toEqual(['aerie-pane-top', 'aerie-pane-dock', 'aerie-pane-sections']);
    expect(pane.querySelector('.aerie-pane-dock svg')).not.toBeNull();
    expect(titles(body).map((t) => t.textContent)).toEqual(['Details', 'History']);
    expect(pane.hasAttribute('data-open')).toBe(false);
  });

  it('titles are accordion headers: each names the region it opens, and only one is open', () => {
    const body = draw(<Host />);
    const [details, history] = titles(body);
    expect(details!.closest('h3')).not.toBeNull();
    expect(details!.getAttribute('aria-expanded')).toBe('false');
    const region = body.querySelector(`#${CSS.escape(details!.getAttribute('aria-controls')!)}`)!;
    expect(region.getAttribute('role')).toBe('region');
    expect(region.getAttribute('aria-labelledby')).toBe(details!.id);
    expect(region.hasAttribute('hidden')).toBe(true);

    act(() => details!.click());
    expect(body.querySelector('aside')!.hasAttribute('data-open')).toBe(true);
    expect(details!.getAttribute('aria-expanded')).toBe('true');
    expect(region.textContent).toContain('Kept per floor');

    act(() => history!.click());
    expect(details!.getAttribute('aria-expanded')).toBe('false');
    expect(history!.getAttribute('aria-expanded')).toBe('true');
    expect(body.querySelectorAll('.aerie-pane-body:not([hidden])')).toHaveLength(1);
    expect(body.querySelector('.aerie-pane-body:not([hidden])')!.textContent).toBe('Nothing here yet');

    act(() => history!.click());
    expect(body.querySelector('aside')!.hasAttribute('data-open')).toBe(false);
  });

  it('Esc closes it and gives focus back to the title that was open', () => {
    const body = draw(<Host start="history" />);
    const history = titles(body)[1]!;
    body.querySelector<HTMLElement>('.aerie-pane-body:not([hidden])')!.tabIndex = -1;
    body.querySelector<HTMLElement>('.aerie-pane-body:not([hidden])')!.focus();
    act(() => void document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })));
    expect(body.querySelector('aside')!.hasAttribute('data-open')).toBe(false);
    expect(document.activeElement).toBe(history);
  });

  it('an app with no sections keeps the strip, for the top and the dock image', () => {
    const body = draw(<AppPane app={app} sections={[]} onOpenChange={() => undefined} top={<span>00:24</span>} />);
    expect(body.querySelector('aside .aerie-pane-top')).not.toBeNull();
    expect(body.querySelector('aside .aerie-pane-dock')).not.toBeNull();
    expect(body.querySelector('.aerie-pane-sections')).toBeNull();
  });

  it('an open section the app no longer declares leaves the pane closed', () => {
    const body = draw(<AppPane app={app} sections={sections} open="gone" onOpenChange={() => undefined} />);
    expect(body.querySelector('aside')!.hasAttribute('data-open')).toBe(false);
  });

  it('over the page only while open', () => {
    const closed = draw(<AppPane app={app} sections={sections} over onOpenChange={() => undefined} />);
    expect(closed.querySelector('aside')!.hasAttribute('data-over')).toBe(false);
    const open = draw(<AppPane app={app} sections={sections} open="details" over onOpenChange={() => undefined} />);
    expect(open.querySelector('aside')!.hasAttribute('data-over')).toBe(true);
  });
});
