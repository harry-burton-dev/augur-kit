// @vitest-environment happy-dom
// A thing's page and the door gallery, described by an app's sandbox and drawn by the host with the kit.
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { RemoteRootElement } from '@remote-dom/core/elements';
import { QuillRemote, createQuillReceiver } from './receiver.js';
import { defineQuillElements } from './elements.js';
import { THINGS } from '../things.fixture.js';
import { ATLAS_DOORS } from '../doors.atlas.fixture.js';
import { scoreDoors } from '../doors.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

beforeAll(() => {
  defineQuillElements();
  if (!customElements.get('remote-root')) customElements.define('remote-root', RemoteRootElement);
});
let root: Root | undefined;
afterEach(() => act(() => root?.unmount()));

function drawRemote(make: () => HTMLElement) {
  const receiver = createQuillReceiver();
  const sandbox = document.createElement('remote-root') as RemoteRootElement;
  sandbox.append(make());
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(<QuillRemote receiver={receiver} />));
  act(() => sandbox.connect(receiver.connection as never));
}
const heron = THINGS.find((t) => t.id === 'mv-saltmarsh-heron')!;
const button = (text: string) => [...document.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent?.startsWith(text))!;

describe('quill-thing-page', () => {
  it('draws the shape from the view and sends the person’s choices back', () => {
    const heard: [string, unknown][] = [];
    drawRemote(() => {
      const page = document.createElement('quill-thing-page');
      page.view = { ...heron, answer: heron.answer.map((a) => ({ ...a, source: a.source && { ...a.source, id: 'R7' } })) };
      page.thing = { kind: 'thing' };
      for (const e of ['action', 'open', 'source', 'everything']) page.addEventListener(e, (ev) => heard.push([e, (ev as CustomEvent).detail]));
      return page;
    });
    expect(document.querySelector('.quill-thing-name')!.textContent).toBe(heron.name);
    expect(document.querySelector('.quill-thing')!.getAttribute('data-thing-id')).toBe(heron.id);
    act(() => document.querySelector<HTMLButtonElement>('.quill-thing-action[data-primary]')!.click());
    act(() => document.querySelector<HTMLButtonElement>('.quill-thing-around-list button')!.click());
    act(() => document.querySelector<HTMLButtonElement>('.quill-thing-answer .quill-thing-trust')!.click());
    act(() => button('Everything we know').click());
    expect(heard).toEqual([
      ['action', 'wrong'],
      ['open', heron.around[0]!.id],
      ['source', 'R7'],
      ['everything', null],
    ]);
  });

  it('offers the map only when the app asks for it and listens', () => {
    drawRemote(() => {
      const page = document.createElement('quill-thing-page');
      page.view = heron;
      page.addEventListener('map', () => undefined);
      return page;
    });
    expect(document.body.textContent).not.toContain('See how it connects');
    drawRemote(() => {
      const page = document.createElement('quill-thing-page');
      page.view = heron;
      page.map = true;
      page.addEventListener('map', () => undefined);
      return page;
    });
    expect(document.body.textContent).toContain('See how it connects');
  });
});

describe('quill-door-gallery', () => {
  it('draws the doors with their steps and sends opens and asks back', () => {
    const heard: [string, unknown][] = [];
    drawRemote(() => {
      const gallery = document.createElement('quill-door-gallery');
      gallery.label = 'Ways in';
      gallery.doors = ATLAS_DOORS;
      gallery.scores = scoreDoors(ATLAS_DOORS, [{ kind: 'queue', reason: 'Settle it: two employers', canAct: true }]);
      gallery.light = 'still';
      gallery.ask = { label: 'What do you need?', recents: [{ id: 'heron', label: 'The Heron' }] };
      for (const e of ['open', 'ask', 'recent']) gallery.addEventListener(e, (ev) => heard.push([e, (ev as CustomEvent).detail]));
      return gallery;
    });
    expect(document.querySelectorAll('.quill-doors-row .quill-doors-door')).toHaveLength(4);
    expect(document.querySelector('[data-door="put-right"]')!.getAttribute('data-step')).toBe('needs');
    act(() => document.querySelector<HTMLButtonElement>('[data-door="changed"]')!.click());
    act(() => button('The Heron').click());
    const field = document.querySelector<HTMLInputElement>('.quill-doors-ask-field')!;
    act(() => {
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      set.call(field, 'when is the Heron due');
      field.dispatchEvent(new Event('input', { bubbles: true }));
    });
    act(() => field.form!.requestSubmit());
    expect(heard).toEqual([
      ['open', 'changed'],
      ['recent', 'heron'],
      ['ask', 'when is the Heron due'],
    ]);
  });
});
