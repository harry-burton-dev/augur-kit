// @vitest-environment happy-dom
// The frame the shell draws round an app on the app contract's third major (spec 6.3, 6.4, 6.8): the
// command palette, the radial menu on right-click, the rail's places with what sits under them, and the
// About panel. Every word an app gives comes from its manifest; the rest are the kit's, and can be changed.
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useState, type ReactNode } from 'react';
import { CommandPalette, isCommandKey } from './command-palette.js';
import { AppBar, RailPages } from './app-bar.js';
import { FrameRadial } from './frame-radial.js';
import { RailPlaces } from './rail-places.js';
import { AboutPanel } from './about-panel.js';
import { capUnder, commandReason, insideApp, paletteItems, radialActions, UNDER_CAP, type CommandSource } from './frame.js';

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
  vi.useRealTimers();
});

/** The example app from the spec's appendix A, as its manifest declares it. */
const notes = {
  app: { id: 'notes', name: 'Notes' },
  commands: [
    { id: 'note.new', label: 'New note', icon: 'plus', keywords: 'create write', when: 'always' as const },
    { id: 'note.archive', label: 'Archive note', icon: 'archive', when: 'selection' as const },
    { id: 'note.share', label: 'Share note', icon: 'share', when: 'selection' as const },
  ],
  radial: [
    { command: 'note.share', on: 'note', order: 0 },
    { command: 'note.archive', on: 'note', order: 1 },
  ],
};
const source = (over: Partial<CommandSource> = {}): CommandSource => ({ ...notes, handled: ['note.new', 'note.archive', 'note.share'], selection: false, onScreen: true, ...over });

describe('commands (spec 6.4)', () => {
  it('says why a command can’t run, and names the app when it hasn’t loaded it', () => {
    const s = source({ handled: ['note.archive'] });
    expect(commandReason(notes.commands[0]!, s)).toBe('Notes hasn’t loaded this yet');
    expect(commandReason(notes.commands[1]!, s)).toBe('Select something in Notes first');
    expect(commandReason(notes.commands[1]!, { ...s, selection: true })).toBeUndefined();
    expect(commandReason({ id: 'x', label: 'X', when: 'screen' }, { ...s, handled: ['x'], onScreen: false })).toBe('Open Notes to use this');
  });

  it('finds commands by their label and keywords, and keeps the ones that can’t run, saying why', () => {
    const items = paletteItems([source({ handled: ['note.new'] })], '');
    expect(items.map((i) => i.label)).toEqual(['New note', 'Archive note', 'Share note']);
    expect(items[1]!.locked).toBe('Notes hasn’t loaded this yet');
    expect(paletteItems([source()], 'write').map((i) => i.label)).toEqual(['New note']);
    expect(paletteItems([source()], 'NOTE share').map((i) => i.label)).toEqual(['Share note']);
  });

  it('heads each app’s commands with its name when there is more than one app', () => {
    const other = source({ app: { id: 'maps', name: 'Maps' }, commands: [{ id: 'map.new', label: 'New map' }], handled: ['map.new'] });
    expect(paletteItems([source()], '').some((i) => i.group)).toBe(false);
    const items = paletteItems([source(), other], 'new');
    expect(items.map((i) => [i.group, i.label])).toEqual([
      ['Notes', 'New note'],
      ['Maps', 'New map'],
    ]);
  });

  it('palette: Enter runs a command; one that can’t run stays, locked, and isn’t run', () => {
    const onRun = vi.fn();
    const body = draw(<CommandPalette open onClose={() => undefined} sources={[source({ handled: ['note.new'] })]} onRun={onRun} keys={{ notes: { 'note.new': 'Ctrl+Alt+N' } }} />);
    const options = [...body.querySelectorAll('[role="option"]')];
    expect(options.map((o) => o.querySelector('.quill-palette-label')!.textContent)).toEqual(['New note', 'Archive note', 'Share note']);
    expect(options[1]!.getAttribute('aria-disabled')).toBe('true');
    expect(options[1]!.textContent).toContain('Notes hasn’t loaded this yet');
    expect(options[0]!.textContent).toContain('Ctrl+Alt+N');
    act(() => (options[1] as HTMLElement).click());
    expect(onRun).not.toHaveBeenCalled();
    const field = body.querySelector('input')!;
    act(() => void field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
    expect(onRun).toHaveBeenCalledWith('notes', 'note.new');
  });
});

describe('the palette’s key', () => {
  const press = (key: string, mods: Partial<KeyboardEvent> = {}) => ({ key, ctrlKey: false, metaKey: false, shiftKey: false, altKey: false, ...mods });
  it('is Ctrl or ⌘ with Shift and P unless the shell is given another binding', () => {
    expect(isCommandKey(press('P', { ctrlKey: true, shiftKey: true }))).toBe(true);
    expect(isCommandKey(press('p', { metaKey: true, shiftKey: true }))).toBe(true);
    expect(isCommandKey(press('p', { ctrlKey: true }))).toBe(false);
    expect(isCommandKey(press('k', { ctrlKey: true }))).toBe(false);
    expect(isCommandKey(press('p', { altKey: true, shiftKey: true }), 'Alt+Shift+P')).toBe(true);
    expect(isCommandKey(press('p', { ctrlKey: true, shiftKey: true }), 'Alt+Shift+P')).toBe(false);
  });
  it('says whose a command is on every row when there are several apps, since a heading isn’t read aloud', () => {
    const other = source({ app: { id: 'maps', name: 'Maps' }, commands: [{ id: 'map.new', label: 'New map' }], handled: ['map.new'] });
    expect(paletteItems([source(), other], 'new').map((i) => i.detail)).toEqual(['Notes', 'Maps']);
    expect(paletteItems([source()], 'new')[0]!.detail).toBeUndefined();
  });
});

describe('the radial menu on right-click (spec 6.4, Actions live on the object)', () => {
  it('builds a kind’s actions from the declared radial, in its order, each naming a declared command', () => {
    // Opened on a thing, a command that needs something selected has it: the thing.
    const actions = radialActions('note', source({ selection: false, handled: ['note.share'] }));
    expect(actions.map((a) => [a.id, a.slot, a.disabled ?? false])).toEqual([
      ['note.share', 'n', false],
      ['note.archive', 'ne', true],
    ]);
    expect(actions[1]!.reason).toBe('Notes hasn’t loaded this yet');
    expect(radialActions('folder', source())).toEqual([]);
    // A radial action that names no declared command is never drawn.
    expect(radialActions('note', source({ radial: [{ command: 'note.gone', on: 'note' }] }))).toEqual([]);
  });

  it('opens on the thing right-clicked, runs the command with that thing, and leaves other right-clicks alone', () => {
    vi.useFakeTimers();
    const onRun = vi.fn();
    const body = draw(
      <FrameRadial source={source()} onRun={onRun}>
        <ul>
          <li data-thing="note" data-thing-id="n-1" data-thing-label="Shopping">
            <span id="inner">Shopping</span>
          </li>
          <li id="plain">Not a thing</li>
        </ul>
      </FrameRadial>,
    );
    const plain = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 5, clientY: 5 });
    act(() => void body.querySelector('#plain')!.dispatchEvent(plain));
    expect(plain.defaultPrevented).toBe(false);
    expect(body.querySelector('[role="menu"]')).toBeNull();

    const click = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 20, clientY: 20 });
    act(() => void body.querySelector('#inner')!.dispatchEvent(click));
    expect(click.defaultPrevented).toBe(true);
    const menu = body.querySelector('[role="menu"]')!;
    expect(menu).not.toBeNull();
    const items = [...menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')];
    expect(items.map((b) => b.textContent)).toEqual(expect.arrayContaining([expect.stringContaining('Share note'), expect.stringContaining('Archive note')]));
    act(() => items.find((b) => b.textContent!.includes('Share note'))!.click());
    act(() => void vi.runAllTimers());
    expect(onRun).toHaveBeenCalledWith('note.share', { kind: 'note', id: 'n-1', label: 'Shopping' });
    expect(body.querySelector('[role="menu"]')).toBeNull();
    // Focus went back to the thing, which was made able to take it.
    const thing = body.querySelector<HTMLElement>('[data-thing]')!;
    expect(thing.getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(thing);
  });

  it('never runs an action that can’t run now', () => {
    vi.useFakeTimers();
    const onRun = vi.fn();
    const body = draw(
      <FrameRadial source={source({ handled: ['note.share'] })} onRun={onRun}>
        <p data-thing="note" data-thing-label="Shopping">Shopping</p>
      </FrameRadial>,
    );
    act(() => void body.querySelector('p')!.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 9, clientY: 9 })));
    const archive = [...body.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')].find((b) => b.textContent!.includes('Archive note'))!;
    act(() => archive.click());
    act(() => void vi.runAllTimers());
    expect(onRun).not.toHaveBeenCalled();
  });

  it('opens from the keyboard too (the context-menu key, Shift+F10)', () => {
    const body = draw(
      <FrameRadial source={source()} onRun={() => undefined}>
        <button type="button" data-thing="note" data-thing-label="Shopping">
          Shopping
        </button>
      </FrameRadial>,
    );
    act(() => void body.querySelector('button')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'F10', shiftKey: true, bubbles: true, cancelable: true })));
    expect(body.querySelector('[role="menu"]')).not.toBeNull();
  });
});

describe('the rail’s places and what sits under them (spec 6.3)', () => {
  const places = [
    { id: 'recent', label: 'Recent', icon: 'clock', path: '/' },
    { id: 'notebooks', label: 'Notebooks', icon: 'book', fills: true },
  ];
  const many = Array.from({ length: 120 }, (_, i) => ({ label: `Notebook ${i + 1}`, path: `/notebooks/${i + 1}` }));

  it('caps what sits under a place at the deployment’s number, 50 unless it says', () => {
    expect(UNDER_CAP).toBe(50);
    expect(capUnder(many).shown.length).toBe(50);
    expect(capUnder(many).more).toBe(70);
    expect(capUnder(many, 10)).toMatchObject({ more: 110 });
    expect(capUnder(many.slice(0, 3))).toMatchObject({ more: 0 });
    expect(capUnder(many, 0)).toMatchObject({ shown: [], more: 120 });
    expect(capUnder(many, -5)).toMatchObject({ shown: [], more: 120 });
    expect(capUnder(many, Number.NaN).shown.length).toBe(50);
  });

  it('draws each place, then what sits under it, then “and n more” going to the place', () => {
    const onOpen = vi.fn();
    const body = draw(<RailPlaces places={places} under={{ notebooks: many }} onOpen={onOpen} current="/notebooks/2" />);
    const tiles = [...body.querySelectorAll<HTMLButtonElement>('.aerie-bar-tile')];
    // Arrow keys move through every row on the rail, so each under-item is a rail tile too.
    expect(tiles.length).toBe(2 + 50 + 1);
    expect(tiles[0]!.textContent).toBe('Recent');
    expect(tiles[1]!.textContent).toBe('Notebooks');
    const group = body.querySelector('[role="group"]')!;
    expect(group.getAttribute('aria-label')).toBe('Notebooks');
    expect(group.querySelectorAll('.aerie-rail-under').length).toBe(50);
    expect(group.querySelector('[aria-current="page"]')!.textContent).toBe('Notebook 2');
    const more = group.querySelector<HTMLButtonElement>('.aerie-rail-more')!;
    expect(more.textContent).toBe('and 70 more');
    act(() => more.click());
    expect(onOpen).toHaveBeenLastCalledWith('/notebooks');
    act(() => tiles[0]!.click());
    expect(onOpen).toHaveBeenLastCalledWith('/');
    act(() => tiles[3]!.click());
    expect(onOpen).toHaveBeenLastCalledWith('/notebooks/2');
  });

  it('takes the cap from the deployment, and drops an item whose path leaves the app', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const body = draw(
      <RailPlaces
        places={places}
        cap={2}
        under={{ notebooks: [{ label: 'Out', path: 'https://example.org' }, { label: 'Up', path: '/../admin' }, ...many.slice(0, 3)] }}
        onOpen={() => undefined}
      />,
    );
    expect([...body.querySelectorAll('.aerie-rail-under')].map((b) => b.textContent)).toEqual(['Notebook 1', 'Notebook 2']);
    expect(body.querySelector('.aerie-rail-more')!.textContent).toBe('and 1 more');
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });

  it('keeps an app’s paths inside its own address', () => {
    for (const ok of ['/', '/notebooks', '/notebooks/2', '/notebooks/', '/a/My%20Note', '/a/b.c']) expect(insideApp(ok), ok).toBe(true);
    for (const bad of ['//evil.example/x', '/a//b', '/../admin', '/a/./b', '/a/%2e%2e/b', '/a/%2F', 'notebooks', 'https://example.org', '/a?b', '/a#b', '/a/%zz', '']) expect(insideApp(bad), bad).toBe(false);
  });

  it('with a cap of 0 shows only “and n more”, and leaves out a place whose own path leaves the app', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const body = draw(<RailPlaces places={[...places, { id: 'out', label: 'Out', path: '//evil.example' }]} cap={0} under={{ notebooks: many }} onOpen={() => undefined} />);
    expect(body.querySelectorAll('.aerie-rail-under').length).toBe(0);
    expect(body.querySelector('.aerie-rail-more')!.textContent).toBe('and 120 more');
    expect([...body.querySelectorAll('.aerie-bar-tile')].map((t) => t.textContent)).not.toContain('Out');
    warn.mockRestore();
  });

  it('on the docked rail, the arrow keys move through the places and the things under them', () => {
    const body = draw(
      <AppBar mode="app" label="Apps">
        <RailPages>
          <RailPlaces places={places} under={{ notebooks: many.slice(0, 2) }} onOpen={() => undefined} />
        </RailPages>
      </AppBar>,
    );
    const tiles = [...body.querySelectorAll<HTMLElement>('.aerie-bar-tile')];
    tiles[1]!.focus();
    act(() => void tiles[1]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })));
    expect(document.activeElement!.textContent).toBe('Notebook 1');
    act(() => void document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true })));
    expect(document.activeElement).toBe(tiles[1]);
  });

  it('only a place that fills gets things under it, and one place with nothing under it is no choice', () => {
    expect(draw(<RailPlaces places={places} under={{ recent: many }} onOpen={() => undefined} />).querySelectorAll('.aerie-rail-under').length).toBe(0);
    expect(draw(<RailPlaces places={[places[0]!]} onOpen={() => undefined} />).querySelectorAll('.aerie-bar-tile').length).toBe(0);
  });
});

describe('the About panel (PDR-021 point 6, spec 6.8)', () => {
  const sections = [
    { id: 'details', label: 'Details', icon: 'info' },
    { id: 'history', label: 'History', icon: 'clock' },
  ];

  it('is a named region on the right, with the declared sections in order; an empty one says so', () => {
    const body = draw(<AboutPanel app="Notes" sections={sections} open onOpenChange={() => undefined} content={{ details: <p>Kept per floor</p> }} />);
    const panel = body.querySelector('aside')!;
    expect(panel.getAttribute('aria-label')).toBe('About Notes');
    expect([...panel.querySelectorAll('h3')].map((h) => h.textContent)).toEqual(['Details', 'History']);
    expect(panel.textContent).toContain('Kept per floor');
    expect(panel.querySelectorAll('section')[1]!.textContent).toContain('Nothing here yet');
  });

  it('opening takes focus to the panel; Esc folds it back to its button, which takes focus again', () => {
    function Host() {
      const [open, setOpen] = useState(false);
      return <AboutPanel app="Notes" sections={sections} open={open} onOpenChange={setOpen} />;
    }
    const body = draw(<Host />);
    const opener = body.querySelector<HTMLButtonElement>('aside button')!;
    expect(opener.getAttribute('aria-expanded')).toBe('false');
    opener.focus();
    act(() => opener.click());
    expect(body.querySelector('aside')!.hasAttribute('data-open')).toBe(true);
    expect(document.activeElement!.tagName).toBe('H2');
    act(() => void document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })));
    expect(body.querySelector('aside')!.hasAttribute('data-open')).toBe(false);
    expect(document.activeElement).toBe(body.querySelector('.aerie-about-open'));
  });

  it('draws nothing for an app that declares no sections', () => {
    expect(draw(<AboutPanel app="Notes" sections={[]} open onOpenChange={() => undefined} />).querySelector('aside')).toBeNull();
  });
});
