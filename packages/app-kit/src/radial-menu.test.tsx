// @vitest-environment happy-dom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ms } from '@augur/kit-common';
import { KindTile } from './tiles.js';
import { pageActions, placeActions, RING_MORE_ID, RING_TARGETS_MOST, RingMore, RingProvider, useRingTarget, type RingAction, type RingSubject } from './radial-menu.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
const draw = (node: ReactNode) => {
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(node));
};
afterEach(() => {
  act(() => root?.unmount());
  vi.useRealTimers();
  vi.restoreAllMocks();
});
const key = (el: Element, k: string, type: 'keydown' | 'keyup' = 'keydown') => act(() => void el.dispatchEvent(new KeyboardEvent(type, { key: k, bubbles: true, cancelable: true })));
const items = () => [...document.querySelectorAll('.quill-ring-items [role="menuitem"], .quill-ring-list [role="menuitem"]')] as HTMLElement[];
const places = () => [...document.querySelectorAll('.quill-ring-targets [role="menuitem"]')] as HTMLElement[];
const names = () => items().map((i) => i.querySelector('.quill-ring-label')!.textContent);
const readout = () => document.querySelector('[role="status"]')!.textContent;
const settle = () => act(() => void vi.runAllTimers());

function Thing({ subject }: { subject: RingSubject }) {
  const ring = useRingTarget(() => subject);
  return (
    <button type="button" {...ring}>
      {subject.label}
    </button>
  );
}
const open = (subject: RingSubject) => {
  draw(
    <RingProvider>
      <Thing subject={subject} />
    </RingProvider>,
  );
  const thing = document.querySelector('button')!;
  act(() => void thing.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 5, clientY: 5 })));
  return thing;
};
const reduceMotion = () =>
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) => ({ matches: query.includes('reduce'), media: query, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList,
  );

describe('RadialMenu slots', () => {
  it('puts each verb in its own direction: its slot, danger at the bottom, the rest clockwise from the top', () => {
    const placed = placeActions([
      { id: 'delete', label: 'Delete', icon: 'delete', danger: true },
      { id: 'open', label: 'Open', icon: 'arrow' },
      { id: 'rename', label: 'Rename', icon: 'rename', slot: 'w' },
      { id: 'share', label: 'Share', icon: 'people', slot: 'ne' },
      { id: 'move', label: 'Move', icon: 'folder' },
      { id: 'pin', label: 'Pin', icon: 'star', slot: 'ne' },
    ]);
    expect(placed.map((p) => `${p.slot}:${p.action.id}`)).toEqual(['n:open', 'ne:share', 'e:move', 'se:pin', 's:delete', 'w:rename']);
  });

  it('draws the slots and goes round them in order', () => {
    open({
      label: 'Plan',
      onAction: () => {},
      actions: [
        { id: 'delete', label: 'Delete', icon: 'delete', danger: true },
        { id: 'open', label: 'Open', icon: 'arrow' },
        { id: 'rename', label: 'Rename', icon: 'rename', slot: 'w' },
      ],
    });
    expect(names()).toEqual(['Open', 'Delete', 'Rename']);
    expect(items().map((i) => i.getAttribute('data-slot'))).toEqual(['n', 's', 'w']);
  });

  it('keeps the order past eight, danger last, as a list', () => {
    const many: RingAction[] = [{ id: 'x', label: 'Remove', icon: 'delete', danger: true }, ...Array.from({ length: 8 }, (_, i) => ({ id: `a${i}`, label: `Action ${i}`, icon: 'arrow' as const, slot: 'n' as const }))];
    expect(placeActions(many).map((p) => p.action.id)).toEqual(['a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'x']);
    expect(placeActions(many).every((p) => p.slot === undefined)).toBe(true);
  });
});

describe('RadialMenu targets and previews', () => {
  const share: RingAction = {
    id: 'share',
    label: 'Share',
    icon: 'people',
    preview: (t) => (t === 'dept' ? '41 more people can read this' : t ? 'More people can read this' : 'Choose who can read it'),
    targets: [
      { id: 'team', label: 'Team', detail: '6 people', current: true },
      { id: 'dept', label: 'Department', detail: '41 people' },
      { id: 'org', label: 'Organisation', disabled: true, reason: 'Only its leads can share this widely' },
    ],
  };

  it('goes into the targets, says what each would change, steps back with Esc and gives the target chosen', () => {
    vi.useFakeTimers();
    const onAction = vi.fn();
    open({ label: 'Plan', onAction, actions: [{ id: 'open', label: 'Open', icon: 'arrow' }, share] });
    const menu = document.querySelector('[role="menu"]')!;
    key(menu, 'ArrowRight');
    expect(document.activeElement).toBe(items()[1]);
    expect(readout()).toBe('Choose who can read it');
    expect(items()[1]!.getAttribute('aria-expanded')).toBe('false');

    key(items()[1]!, 'ArrowRight');
    const group = document.querySelector('[role="group"]')!;
    expect(group.getAttribute('aria-label')).toBe('Share');
    expect(items()[1]!.getAttribute('aria-expanded')).toBe('true');
    // Where it already is shows, but can't be chosen; focus starts on the first that can.
    expect(places()[0]!.getAttribute('aria-current')).toBe('true');
    expect(places()[0]!.getAttribute('aria-disabled')).toBe('true');
    expect(document.activeElement).toBe(places()[1]);
    expect(readout()).toBe('41 more people can read this');
    expect(places()[2]!.getAttribute('aria-disabled')).toBe('true');
    expect(document.getElementById(places()[2]!.getAttribute('aria-describedby')!)!.textContent).toBe('Only its leads can share this widely');

    key(places()[1]!, 'Escape');
    expect(document.querySelector('[role="group"]')).toBeNull();
    expect(document.querySelector('[role="menu"]')).not.toBeNull();
    expect(document.activeElement).toBe(items()[1]);

    key(items()[1]!, 'Enter');
    key(places()[1]!, 'ArrowUp');
    key(places()[0]!, 'Enter');
    expect(onAction).not.toHaveBeenCalled();
    key(places()[0]!, 'ArrowDown');
    key(places()[1]!, 'Enter');
    settle();
    expect(onAction).toHaveBeenCalledWith('share', 'dept');
    expect(document.querySelector('[role="menu"]')).toBeNull();
  });

  it('opens the targets with a click and chooses one with a click', () => {
    vi.useFakeTimers();
    const onAction = vi.fn();
    open({ label: 'Plan', onAction, actions: [share] });
    act(() => items()[0]!.click());
    act(() => places()[2]!.click());
    expect(onAction).not.toHaveBeenCalled();
    act(() => places()[1]!.click());
    settle();
    expect(onAction).toHaveBeenCalledWith('share', 'dept');
  });
});

describe('RadialMenu unavailable actions', () => {
  const publish: RingAction = { id: 'publish', label: 'Publish up', icon: 'publish', disabled: true, reason: 'Only its leads can publish it', owner: 'The floor’s leads' };

  it('keeps it focusable, reads its reason and owner, and asks when the subject takes asks', () => {
    vi.useFakeTimers();
    const onAction = vi.fn();
    const onAsk = vi.fn();
    const thing = open({ label: 'Plan', onAction, onAsk, actions: [{ id: 'open', label: 'Open', icon: 'arrow' }, publish] });
    key(items()[0]!, 'ArrowDown');
    const item = items()[1]!;
    expect(document.activeElement).toBe(item);
    expect(item.getAttribute('aria-disabled')).toBe('true');
    expect(document.getElementById(item.getAttribute('aria-describedby')!)!.textContent).toBe('Only its leads can publish itThe floor’s leads can change this.');
    expect(readout()).toBe('Press Enter to ask The floor’s leads');
    key(item, 'Enter');
    settle();
    expect(onAsk).toHaveBeenCalledWith('publish');
    expect(onAction).not.toHaveBeenCalled();
    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(thing);
  });

  it('does nothing with it when there is no one to ask', () => {
    vi.useFakeTimers();
    const onAction = vi.fn();
    open({ label: 'Plan', onAction, actions: [publish] });
    act(() => items()[0]!.click());
    settle();
    expect(onAction).not.toHaveBeenCalled();
    expect(document.querySelector('[role="menu"]')).not.toBeNull();
  });
});

describe('RadialMenu hold to confirm', () => {
  const remove: RingAction = { id: 'delete', label: 'Delete', icon: 'delete', danger: true, preview: 'Three links will break' };

  it('needs Enter held for the whole hold, and letting go early cancels', () => {
    vi.useFakeTimers();
    const onAction = vi.fn();
    open({ label: 'Plan', onAction, actions: [remove] });
    const item = items()[0]!;
    expect(readout()).toBe('Three links will breakHold Enter to delete');
    key(item, 'Enter');
    expect(item.hasAttribute('data-holding')).toBe(true);
    act(() => void vi.advanceTimersByTime(ms('motion-run') / 2));
    key(item, 'Enter', 'keyup');
    expect(item.hasAttribute('data-holding')).toBe(false);
    settle();
    expect(onAction).not.toHaveBeenCalled();
    // A click alone doesn't do it either.
    act(() => item.click());
    settle();
    expect(onAction).not.toHaveBeenCalled();

    key(item, 'Enter');
    act(() => void vi.advanceTimersByTime(ms('motion-run')));
    settle();
    expect(onAction).toHaveBeenCalledWith('delete');
  });

  it('holds with a pointer too', () => {
    vi.useFakeTimers();
    const onAction = vi.fn();
    open({ label: 'Plan', onAction, actions: [{ id: 'open', label: 'Open', icon: 'arrow' }, { id: 'clear', label: 'Clear', icon: 'close', hold: true }] });
    const item = items()[1]!;
    act(() => void item.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'mouse' })));
    act(() => void item.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0, pointerType: 'mouse' })));
    settle();
    expect(onAction).not.toHaveBeenCalled();
    act(() => void item.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'mouse' })));
    act(() => void vi.advanceTimersByTime(ms('motion-run')));
    settle();
    expect(onAction).toHaveBeenCalledWith('clear');
  });

  it('is pressed twice instead under reduced motion', () => {
    reduceMotion();
    const onAction = vi.fn();
    open({ label: 'Plan', onAction, actions: [remove] });
    const item = items()[0]!;
    expect(readout()).toContain('Press Enter twice to delete');
    key(item, 'Enter');
    expect(onAction).not.toHaveBeenCalled();
    expect(item.hasAttribute('data-armed')).toBe(true);
    expect(readout()).toContain('Press Enter again to delete');
    key(item, 'Enter');
    expect(onAction).toHaveBeenCalledWith('delete');
  });

  it('can be turned off for danger, and on for a target', () => {
    vi.useFakeTimers();
    const onAction = vi.fn();
    open({
      label: 'Plan',
      onAction,
      actions: [
        { id: 'delete', label: 'Delete', icon: 'delete', danger: true, hold: false },
        { id: 'move', label: 'Move', icon: 'folder', hold: true, targets: [{ id: 'f', label: 'Folder' }] },
      ],
    });
    // Delete sits at the bottom, after Move.
    expect(names()).toEqual(['Move', 'Delete']);
    key(items()[0]!, 'Enter');
    expect(readout()).toBe('Hold Enter to move');
    key(places()[0]!, 'Enter');
    key(places()[0]!, 'Enter', 'keyup');
    settle();
    expect(onAction).not.toHaveBeenCalled();
    key(places()[0]!, 'Escape');
    key(items()[0]!, 'ArrowDown');
    key(items()[1]!, 'Enter');
    settle();
    expect(onAction).toHaveBeenCalledWith('delete');
  });
});

describe('RingMore', () => {
  const subject: RingSubject = { label: 'Site plan', onAction: () => {}, actions: [{ id: 'open', label: 'Open', icon: 'arrow' }] };
  function Row() {
    const ring = useRingTarget(() => subject);
    return (
      <div className="row">
        <button type="button" className="the-row" {...ring}>
          Site plan
        </button>
        <RingMore subject={() => subject} />
      </div>
    );
  }

  it('names what it is for and opens the same menu on the thing beside it', () => {
    vi.useFakeTimers();
    draw(
      <RingProvider>
        <Row />
      </RingProvider>,
    );
    const more = document.querySelector('.quill-ring-more') as HTMLButtonElement;
    expect(more.getAttribute('aria-label')).toBe('More actions for Site plan');
    act(() => more.click());
    expect(document.querySelector('[role="menu"]')!.getAttribute('aria-label')).toBe('Actions for Site plan');
    key(items()[0]!, 'Escape');
    settle();
    expect(document.activeElement).toBe(document.querySelector('.the-row'));
  });

  it('sits beside a tile and opens the tile’s own menu (PDR-010, amendment 6)', () => {
    vi.useFakeTimers();
    const opened = vi.fn();
    draw(
      <RingProvider>
        <KindTile kind="document" eyebrow="Document" name="Site plan" onOpen={opened} ring={() => subject} />
      </RingProvider>,
    );
    const more = document.querySelector('.quill-tile-place > .quill-ring-more') as HTMLButtonElement;
    expect(more.getAttribute('aria-label')).toBe('More actions for Site plan');
    act(() => more.click());
    expect(opened).not.toHaveBeenCalled();
    expect(document.querySelector('[role="menu"]')!.getAttribute('aria-label')).toBe('Actions for Site plan');
    key(items()[0]!, 'Escape');
    settle();
    expect(document.activeElement).toBe(document.querySelector('.quill-tile'));
  });

  it('is not drawn outside a RingProvider or with nothing to offer', () => {
    draw(<RingMore subject={() => subject} />);
    expect(document.querySelector('.quill-ring-more')).toBeNull();
    draw(
      <RingProvider>
        <RingMore subject={() => undefined} />
      </RingProvider>,
    );
    expect(document.querySelector('.quill-ring-more')).toBeNull();
  });
});

describe('RadialMenu overflow into More (W3.5b)', () => {
  const many: RingAction[] = Array.from({ length: 12 }, (_, i) => ({ id: `a${i}`, label: `Action ${String.fromCharCode(65 + i)}`, icon: 'arrow' }));

  it('keeps the first seven in their slots and puts More in the slot left free', () => {
    const { first, rest } = pageActions(many);
    expect(first).toHaveLength(8);
    expect(first.find((p) => p.action.id === RING_MORE_ID)?.slot).toBe('nw');
    expect(rest.map((a) => a.id)).toEqual(['a7', 'a8', 'a9', 'a10', 'a11']);
  });

  it('opens More as a ring of its own, and Esc goes back to More', () => {
    draw(
      <RingProvider overflow="more">
        <Thing subject={{ label: 'Access control standard', actions: many, onAction: () => {} }} />
      </RingProvider>,
    );
    const thing = document.querySelector('button')!;
    act(() => void thing.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 5, clientY: 5 })));
    expect(document.querySelector('[role="menu"]')!.getAttribute('data-shape')).toBe('ring');
    expect(names()).toHaveLength(8);
    const more = items().find((i) => i.hasAttribute('data-more'))!;
    expect(more.getAttribute('aria-haspopup')).toBe('menu');
    act(() => more.click());
    expect(names()).toEqual(['Action H', 'Action I', 'Action J', 'Action K', 'Action L']);
    expect(readout()).toContain('Esc goes back');
    key(document.activeElement!, 'Escape');
    expect(names()).toHaveLength(8);
    expect(document.activeElement).toBe(items().find((i) => i.hasAttribute('data-more')));
  });

  it('stays a list past eight unless the app asks for More', () => {
    open({ label: 'Access control standard', actions: many, onAction: () => {} });
    expect(document.querySelector('[role="menu"]')!.getAttribute('data-shape')).toBe('list');
  });
});

describe('List rows with a radial menu (W3.5b)', () => {
  it('opens the row’s menu on right-click and from its "more" mark, and draws nothing without ringFor', async () => {
    const { List } = await import('./list.js');
    const items = [{ id: 'n1', title: 'Approve the roster', actions: [{ id: '0', label: 'Approve' }] }];
    const ringFor = () => ({ label: 'Approve the roster', actions: [{ id: 'open', label: 'Open', icon: 'arrow' as const }], onAction: () => {} });
    draw(
      <RingProvider>
        <List label="What needs you" items={items} ringFor={ringFor} />
      </RingProvider>,
    );
    const words = document.querySelector('.quill-list-text')!;
    act(() => void words.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 5, clientY: 5 })));
    expect(document.querySelector('[role="menu"]')!.getAttribute('aria-label')).toBe('Actions for Approve the roster');
    act(() => root?.unmount());
    draw(
      <RingProvider>
        <List label="What needs you" items={items} ringFor={ringFor} />
      </RingProvider>,
    );
    const more = document.querySelector<HTMLButtonElement>('.quill-ring-more')!;
    expect(more.getAttribute('aria-label')).toBe('More actions for Approve the roster');
    act(() => more.click());
    expect(document.querySelector('[role="menu"]')).not.toBeNull();
    act(() => root?.unmount());
    draw(
      <RingProvider>
        <List label="What needs you" items={items} />
      </RingProvider>,
    );
    expect(document.querySelector('.quill-ring-more')).toBeNull();
  });
});

describe('RadialMenu two rings', () => {
  const verbs: RingAction[] = [
    { id: 'open', label: 'Open', icon: 'arrow' },
    { id: 'publish', label: 'Publish', icon: 'publish', slot: 'e', disabled: true, reason: 'It needs a review first', owner: 'Sam' },
    { id: 'delete', label: 'Delete', icon: 'delete', danger: true },
    { id: 'rename', label: 'Rename', icon: 'rename', slot: 'w' },
  ];
  const wedges = () => [...document.querySelectorAll('.quill-ring-wedge')];

  it('draws a wedge for every direction, empty where nothing sits, with Cancel in the hub', () => {
    open({ label: 'Plan', onAction: () => {}, actions: verbs });
    expect(wedges()).toHaveLength(8);
    expect(document.querySelectorAll('.quill-ring-wedge[data-empty]')).toHaveLength(4);
    expect(document.querySelector('.quill-ring-wedge[data-off]')).not.toBeNull();
    expect(document.querySelector('.quill-ring-cancel')!.textContent).toBe('Cancel');
  });

  it('picks a direction with 1 to 8, clockwise from the top, and skips a number with nothing there', () => {
    open({ label: 'Plan', onAction: () => {}, actions: verbs });
    const menu = document.querySelector('[role="menu"]')!;
    key(menu, '7');
    expect(document.activeElement!.textContent).toContain('Rename');
    key(menu, '5');
    expect(document.activeElement!.textContent).toContain('Delete');
    key(menu, '2');
    expect(document.activeElement!.textContent).toContain('Delete');
  });

  it('says where you are in words, and why an unavailable action is, with who can change it', () => {
    open({ label: 'Plan', onAction: () => {}, actions: verbs });
    key(document.querySelector('[role="menu"]')!, '3');
    expect(document.querySelector('.quill-ring-trail')!.textContent).toBe('PlanPublish');
    expect(document.querySelector('.quill-ring-said')!.textContent).toBe('It needs a review first. Sam can change this.');
  });

  it('fans targets out on the outer ring, and past five opens them as a list beside it', () => {
    const few = Array.from({ length: RING_TARGETS_MOST }, (_, i) => ({ id: `t${i}`, label: `Place ${i}` }));
    const many = [...few, { id: 'last', label: 'One more' }];
    const subject = (targets: typeof few): RingSubject => ({ label: 'Plan', onAction: () => {}, actions: [{ id: 'move', label: 'Move', icon: 'folder', targets }] });

    open(subject(few));
    key(document.querySelector('[role="menu"]')!, 'ArrowRight');
    expect(document.querySelector('.quill-ring-targets')!.getAttribute('data-shape')).toBe('ring');
    expect(document.querySelectorAll('.quill-ring-wedge[data-target]')).toHaveLength(RING_TARGETS_MOST);
    expect(document.querySelector('.quill-ring-trail')!.textContent).toBe('PlanMovePlace 0');

    act(() => root?.unmount());
    open(subject(many));
    key(document.querySelector('[role="menu"]')!, 'ArrowRight');
    expect(document.querySelector('.quill-ring-targets')!.getAttribute('data-shape')).toBe('list');
    expect(document.querySelectorAll('.quill-ring-wedge[data-target]')).toHaveLength(0);
  });

  it('chooses with a click on the wedge itself, and Cancel in the hub closes without choosing', () => {
    vi.useFakeTimers();
    const onAction = vi.fn();
    open({ label: 'Plan', onAction, actions: verbs });
    act(() => void document.querySelector('.quill-ring-hub')!.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    settle();
    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(onAction).not.toHaveBeenCalled();

    act(() => root?.unmount());
    open({ label: 'Plan', onAction, actions: verbs });
    const openWedge = wedges().find((w) => !w.hasAttribute('data-empty'))!;
    act(() => void openWedge.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    settle();
    expect(onAction).toHaveBeenCalledWith('open');
  });
});
