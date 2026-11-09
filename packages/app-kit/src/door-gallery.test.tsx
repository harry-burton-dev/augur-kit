// @vitest-environment happy-dom
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AskLine, DoorGallery } from './door-gallery.js';
import { scoreDoors } from './doors.js';
import { CORPUS_DAYS } from './doors.fixture.js';
import { ATLAS_DOORS, ATLAS_DOORS_TODAY, MORE_DOORS, QUESTIONS_DOOR } from './doors.atlas.fixture.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
const draw = (node: ReactNode) => {
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(node));
};
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  delete document.documentElement.dataset.motion;
  document.querySelector('meta[name="augur-depth"]')?.remove();
});
const doorsOnScreen = () => [...document.querySelectorAll<HTMLButtonElement>('.quill-doors-row .quill-doors-door')];
const names = () => doorsOnScreen().map((d) => d.getAttribute('aria-label'));
const jo13 = CORPUS_DAYS.find((d) => d.person === 'jo' && d.day === '2026-11-13')!;

describe('DoorGallery', () => {
  it('draws a fifth door, scored, from its descriptor alone (DG-2)', () => {
    const doors = [...ATLAS_DOORS, QUESTIONS_DOOR];
    const scores = scoreDoors(doors, [{ kind: 'question', reason: 'Sam asked when the Heron is next due' }]);
    draw(<DoorGallery label="Ways in" doors={doors} scores={scores} cap={5} onOpen={() => undefined} />);
    expect(doorsOnScreen()).toHaveLength(5);
    expect(document.querySelector('[data-door="questions"]')!.getAttribute('data-step')).toBe('present');
    expect(names()[4]).toBe('Answer what you were asked. Something new. Sam asked when the Heron is next due.');
  });

  it('says each door\'s job, step and reasons in its name (DG-11)', () => {
    draw(<DoorGallery label="Ways in" doors={ATLAS_DOORS} scores={scoreDoors(ATLAS_DOORS, jo13.signals)} onOpen={() => undefined} />);
    expect(names()[2]).toBe('Put something right. Needs you. Settle it: Marta Kowal: two employers.');
    expect(names()[3]).toBe('Keep an eye on something. Nothing new');
  });

  it('keeps the doors in their order, whatever they score (DG-8)', () => {
    for (const d of CORPUS_DAYS) {
      draw(<DoorGallery label="Ways in" doors={ATLAS_DOORS} scores={scoreDoors(ATLAS_DOORS, d.signals)} onOpen={() => undefined} />);
      expect(doorsOnScreen().map((b) => b.dataset.door)).toEqual(['get-ready', 'changed', 'put-right', 'keep-an-eye']);
    }
  });

  it('shows four doors and puts the other three where they can still be reached (DG-15)', () => {
    const doors = [...ATLAS_DOORS, ...MORE_DOORS];
    draw(<DoorGallery label="Ways in" doors={doors} scores={scoreDoors(doors, [])} onOpen={() => undefined} />);
    expect(doorsOnScreen()).toHaveLength(4);
    const more = [...document.querySelectorAll('.quill-doors-more button')].map((b) => b.textContent?.trim());
    expect(more).toEqual(['Answer what you were asked', 'See what is new here', 'Check what is due']);
  });

  it('keeps an unavailable door, says why and who, and does not open it (DG-16)', () => {
    const onOpen = vi.fn();
    draw(<DoorGallery label="Ways in" doors={ATLAS_DOORS_TODAY} scores={{}} onOpen={onOpen} />);
    const door = document.querySelector<HTMLButtonElement>('[data-door="get-ready"]')!;
    expect(door.getAttribute('aria-disabled')).toBe('true');
    expect(door.getAttribute('aria-label')).toBe('Get ready for a meeting. Unavailable: AUGUR has no calendar yet. Your administrator can change that.');
    act(() => door.click());
    expect(onOpen).not.toHaveBeenCalled();
    act(() => document.querySelector<HTMLButtonElement>('[data-door="changed"]')!.click());
    expect(onOpen).toHaveBeenCalledWith('changed');
  });

  it('puts the cursor in the ask line on arrival, and focus on the strongest door (DG-17)', () => {
    draw(<DoorGallery label="Ways in" ask={<AskLine label="What do you need?" onAsk={() => undefined} />} doors={ATLAS_DOORS} scores={scoreDoors(ATLAS_DOORS, jo13.signals)} onOpen={() => undefined} />);
    expect(document.activeElement).toBe(document.querySelector('input[type="search"]'));
    expect(document.querySelector('.quill-doors-door[data-focused]')!.getAttribute('data-door')).toBe('put-right');
  });

  it('says what each door holds on the first day, with no light', () => {
    draw(<DoorGallery label="Ways in" doors={ATLAS_DOORS} scores={scoreDoors(ATLAS_DOORS, jo13.signals)} firstDay onOpen={() => undefined} />);
    expect(names()[1]).toBe('See what has changed. Follow a few things and their changes show here');
    expect(doorsOnScreen().filter((d) => d.dataset.door !== 'put-right').every((d) => d.dataset.step === 'quiet')).toBe(true);
  });

  it('says "Checking…" while the signals are on their way', () => {
    draw(<DoorGallery label="Ways in" doors={ATLAS_DOORS} loading onOpen={() => undefined} />);
    expect([...document.querySelectorAll('.quill-doors-step')].map((s) => s.textContent)).toEqual(['Checking…', 'Checking…', 'Checking…', 'Checking…']);
  });

  it('moves focus between doors with the arrow keys', () => {
    draw(<DoorGallery label="Ways in" doors={ATLAS_DOORS} scores={{}} onOpen={() => undefined} />);
    const [first, second] = doorsOnScreen();
    act(() => first!.focus());
    act(() => void first!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })));
    expect(document.activeElement).toBe(second);
    act(() => void second!.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true })));
    expect(document.activeElement?.getAttribute('data-door')).toBe('keep-an-eye');
  });

  it('moves light only on strong and needs-you doors (DG-13)', () => {
    draw(<DoorGallery label="Ways in" doors={ATLAS_DOORS} scores={scoreDoors(ATLAS_DOORS, jo13.signals)} onOpen={() => undefined} />);
    const moving = [...document.querySelectorAll('.quill-doors-drift')].map((el) => el.closest<HTMLElement>('.quill-doors-door')!.dataset.step);
    expect(moving.sort()).toEqual(['needs', 'strong']);
  });

  it.each([
    ['AUGUR\'s reduced motion', () => (document.documentElement.dataset.motion = 'reduce')],
    ['a deployment with no blur', () => document.head.append(Object.assign(document.createElement('meta'), { name: 'augur-depth', content: 'scrim' }))],
  ])('is still under %s (DG-12)', (_name, set) => {
    set();
    draw(<DoorGallery label="Ways in" doors={ATLAS_DOORS} scores={scoreDoors(ATLAS_DOORS, jo13.signals)} onOpen={() => undefined} />);
    expect(document.querySelector('.quill-doors')!.getAttribute('data-light')).toBe('still');
    expect(document.querySelector('.quill-doors-drift, .quill-doors-bloom')).toBeNull();
    expect(doorsOnScreen().find((d) => d.dataset.door === 'put-right')!.dataset.step).toBe('needs');
  });
});

describe('the door gallery\'s CSS', () => {
  const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'kit.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  // The innermost rules: a selector list and its declarations.
  const rules = [...css.matchAll(/([^{};]+)\{([^{}]*)\}/g)]
    .map((m) => ({ selectors: m[1]!.split(',').map((x) => x.trim()), body: m[2]! }))
    .filter((r) => r.selectors.some((x) => x.includes('quill-doors')));

  it('uses green only for needs you (DG-10)', () => {
    const green = rules.filter((r) => /needs-you|--green/.test(r.body));
    expect(green.length).toBeGreaterThan(0);
    for (const r of green) expect(r.selectors.every((s) => s.includes("'needs'"))).toBe(true);
  });

  it('takes every light strength from the door tokens', () => {
    const mixes = rules.flatMap((r) => [...r.body.matchAll(/color-mix\([^;]*/g)].map((m) => m[0]));
    const light = mixes.filter((m) => m.includes('--doors-colour') || m.includes('--light'));
    expect(light.length).toBeGreaterThan(0);
    for (const m of light) expect(m).toMatch(/--door(s-alpha|-light-spill)/);
  });
});
