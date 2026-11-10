// @vitest-environment happy-dom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThingPage } from './thing-page.js';
import { primaryAction, thingActions, trustLine, validateThing, THING_CAPS, type ThingView } from './thing-view.js';
import { NEW_KIND_THING, THINGS } from './things.fixture.js';

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
});
const page = (view: ThingView, props: Partial<Parameters<typeof ThingPage>[0]> = {}) => draw(<ThingPage view={view} onAction={() => undefined} onEverything={() => undefined} onOpen={() => undefined} {...props} />);
const thing = (id: string) => THINGS.find((t) => t.id === id)!;
const text = () => document.body.textContent ?? '';
const EVERY = [...THINGS, NEW_KIND_THING];

// Words a planner would not use, from round 10's checks. The page must never say them, whatever the data.
const GRAPH_WORDS = /\b(entity|entities|belief|observation|predicate|node|edge|graph|ontology|triple|confidence|provenance|metadata|superseded|assertion|attribute|instance|schema)\b/i;

describe('the thing page fixture', () => {
  it('holds every thing in the store, each a valid view', () => {
    expect(THINGS).toHaveLength(42);
    for (const t of EVERY) expect(validateThing(t), t.id).toEqual([]);
  });

  it('holds nothing from anyone else’s own floor', () => {
    const all = JSON.stringify(EVERY).toLowerCase();
    for (const w of ['overrun', '600,000', 'fleet manager', 'note to self', 'trucks are late']) expect(all).not.toContain(w);
  });
});

describe('ThingPage', () => {
  it.each(EVERY.map((t) => [t.id, t] as const))('%s: answer first, capped at rest, in plain words', (_, view) => {
    page(view);
    const article = document.querySelector('.quill-thing')!;
    const order = [...article.children].map((c) => c.className.split(' ')[0]);
    expect(order.slice(0, 3)).toEqual(['quill-thing-head', 'quill-thing-answer', 'quill-thing-problem']);
    expect(document.querySelectorAll('.quill-thing-fact').length).toBeLessThanOrEqual(THING_CAPS.facts);
    expect(document.querySelectorAll('.quill-thing-around-list > li').length).toBeLessThanOrEqual(THING_CAPS.around);
    expect(document.querySelectorAll('.quill-thing-action[data-primary]')).toHaveLength(1);
    expect(document.querySelectorAll('.quill-thing-action')).toHaveLength(3);
    expect(text()).not.toMatch(GRAPH_WORDS);
  });

  it('says little is known when there is no answer, and offers the reports that name it', () => {
    const empty = EVERY.find((t) => !t.answer.length && t.reports > 0) ?? { ...thing('alex'), reports: 2 };
    page(empty);
    expect(text()).toContain(`It is named in ${empty.reports} report`);
    expect([...document.querySelectorAll('button')].some((b) => b.textContent === 'See the reports that name it')).toBe(true);
    page(thing('alex'));
    expect(text()).toContain('Nothing is known about it yet.');
    expect(text()).toContain('No other facts yet.');
    expect(text()).toContain('Nothing yet.');
  });

  it('says plainly when nothing is wrong', () => {
    page(EVERY.find((t) => !t.problems.length)!);
    expect(document.querySelector('.quill-thing-problem')!.getAttribute('data-kind')).toBe('none');
    expect(text()).toContain('No reports disagree, and nothing is overdue');
  });

  it('shows one problem and counts the rest', () => {
    const view: ThingView = { ...thing('alex'), problems: [{ kind: 'conflict', text: 'Berth: 3 or 4' }, { kind: 'slipped', text: 'Due Tue 17 Nov has passed, with nothing newer' }] };
    page(view);
    expect(document.querySelector('.quill-thing-problem-text')!.textContent).toBe('Berth: 3 or 4');
    expect(text()).toContain('Not settled');
    expect(text()).toContain('1 more');
    expect(text()).not.toContain('has passed');
  });

  it('counts what is around it past the cap, one step away', () => {
    const around = Array.from({ length: 9 }, (_, i) => ({ id: `n${i}`, relation: 'Works with', name: `Thing ${i}` }));
    page({ ...thing('alex'), around });
    expect(document.querySelectorAll('.quill-thing-around-list > li')).toHaveLength(6);
    expect(text()).toContain('3 more around it');
  });

  it('opens a neighbour, a source, everything and the map', () => {
    const onOpen = vi.fn();
    const onSource = vi.fn();
    const onEverything = vi.fn();
    const onMap = vi.fn();
    const view = EVERY.find((t) => t.around.length && t.answer[0]?.source)!;
    page(view, { onOpen, onSource, onEverything, onMap });
    act(() => document.querySelector<HTMLButtonElement>('.quill-thing-around-list button')!.click());
    expect(onOpen).toHaveBeenCalledWith(view.around[0]!.id, view.around[0]);
    act(() => document.querySelector<HTMLButtonElement>('.quill-thing-answer .quill-thing-trust')!.click());
    expect(onSource).toHaveBeenCalledWith(view.answer[0]!.source);
    const foot = [...document.querySelectorAll<HTMLButtonElement>('.quill-thing-foot button')];
    act(() => foot.find((b) => b.textContent === 'See how it connects')!.click());
    act(() => foot.find((b) => b.textContent?.startsWith('Everything we know'))!.click());
    expect(onMap).toHaveBeenCalledOnce();
    expect(onEverything).toHaveBeenCalledOnce();
  });

  it('offers no map unless the app has one', () => {
    page(thing('alex'));
    expect(text()).not.toContain('See how it connects');
  });

  it('reads each trust line aloud with where it came from', () => {
    const view = EVERY.find((t) => t.answer[0]?.source)!;
    page(view, { onSource: () => undefined });
    const s = view.answer[0]!.source!;
    expect(document.querySelector('.quill-thing-answer .quill-thing-trust')!.getAttribute('aria-label')).toBe(trustLine(s).name);
    expect(trustLine(s).name).toContain(s.title);
  });

  it('carries the radial menu’s mark when given one', () => {
    const view = thing('alex');
    page(view, { mark: { kind: 'thing' } });
    const article = document.querySelector('.quill-thing')!;
    expect(article.getAttribute('data-thing')).toBe('thing');
    expect(article.getAttribute('data-thing-id')).toBe(view.id);
    expect(article.getAttribute('data-thing-label')).toBe(view.name);
  });

  it('draws a kind it has never seen with no design work', () => {
    page(NEW_KIND_THING);
    expect(document.querySelector('.quill-thing-kind')!.textContent).toBe('Survey');
    expect(document.querySelector('.quill-thing-name')!.textContent).toBe(NEW_KIND_THING.name);
    expect(document.querySelectorAll('.quill-thing-answer-row').length + document.querySelectorAll('.quill-thing-fact').length).toBeGreaterThan(0);
  });
});

describe('primaryAction', () => {
  const base = { answer: [], problems: [] } as Pick<ThingView, 'answer' | 'problems'>;
  it('puts something to settle first', () => {
    expect(primaryAction({ ...base, problems: [{ kind: 'duplicate', text: 'x' }], answer: [{ key: 'now', value: 'x' }] })).toBe('wrong');
    expect(primaryAction({ ...base, problems: [{ kind: 'conflict', text: 'x' }] })).toBe('wrong');
  });
  it('keeps an eye on a thing that changes', () => {
    expect(primaryAction({ ...base, answer: [{ key: 'next', value: 'x' }] })).toBe('follow');
    expect(primaryAction({ ...base, answer: [{ key: 'now', value: 'x' }], problems: [{ kind: 'slipped', text: 'x' }] })).toBe('follow');
  });
  it('asks otherwise', () => {
    expect(primaryAction({ ...base, answer: [{ key: 'what', value: 'x' }] })).toBe('ask');
    expect(primaryAction(base)).toBe('ask');
  });
  it('never offers the same action twice', () => {
    for (const t of EVERY) {
      const ids = thingActions(t).map((a) => a.id);
      expect(new Set(ids).size).toBe(3);
    }
  });
});
