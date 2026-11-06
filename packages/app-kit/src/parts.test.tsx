// @vitest-environment happy-dom
import { act, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Dialog } from '@augur/kit-common';
import { DateField, DropZone, dayDistance, parseDay } from './date.js';
import { List, Table, relativeTime } from './list.js';
import { Palette } from './palette.js';
import { TimeField } from './time.js';
import { PageHead, Section } from './page.js';
import { Details, Notice, State } from './states.js';
import { Refs, Tally, Timeline } from './things.js';
import { TagPicker, tagChoices } from './tag-picker.js';
import { Lifecycle } from './lifecycle.js';
import { FilterBar, filterValue } from './filter-bar.js';
import { Contents, Reader, loadReader, slugFor, type ReaderHandle } from './reader.js';
import { PeoplePicker, principalRows } from './people-picker.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
const draw = (node: ReactNode) => {
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  act(() => root!.render(node));
};
afterEach(() => act(() => root?.unmount()));
const text = () => document.body.textContent ?? '';
const button = (name: string) => [...document.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === name || b.textContent?.trim() === name)!;

describe('the parts apps took from the Lit kit', () => {
  it('waits before showing a load, and offers one thing to do after an error', () => {
    vi.useFakeTimers();
    draw(<State kind="loading" heading="Loading plans" />);
    expect(document.querySelector('.quill-state')!.hasAttribute('data-hidden')).toBe(true);
    act(() => vi.advanceTimersByTime(300));
    expect(document.querySelector('.quill-state')!.hasAttribute('data-hidden')).toBe(false);
    vi.useRealTimers();
    const retry = vi.fn();
    draw(<State kind="error" heading="Couldn’t load" action="Try again" onAction={retry} />);
    expect(document.querySelector('[role="alert"]')).not.toBeNull();
    act(() => button('Try again').click());
    expect(retry).toHaveBeenCalled();
  });

  it('counts a list, pings the first row that needs you, and says why a row is shut', () => {
    draw(
      <List
        label="Plans"
        noun={['plan', 'plans']}
        items={[
          { id: 'a', title: 'Budget', status: 'needs' },
          { id: 'b', title: 'Roster', status: 'needs' },
          { id: 'c', title: 'Kept', disabled: true, reason: 'Kept on Finance. Ask its leads.' },
        ]}
      />,
    );
    expect(text()).toContain('3 plans');
    expect(document.querySelectorAll('.quill-list-lead[data-first]')).toHaveLength(1);
    expect(text()).toContain('Kept on Finance. Ask its leads.');
  });

  it('sorts a table by a header, then the reverse, then not at all', () => {
    const rows = [
      { id: '1', name: 'Beta', size: 2 },
      { id: '2', name: 'Alpha', size: 10 },
    ];
    const sorts = vi.fn();
    draw(<Table noun="files" columns={[{ key: 'name', label: 'Name', sortable: true }, { key: 'size', label: 'Size', kind: 'number' }]} rows={rows} onSort={sorts} />);
    const names = () => [...document.querySelectorAll('.quill-table-cell[data-primary]')].map((c) => c.textContent);
    expect(names()).toEqual(['Beta', 'Alpha']);
    const head = () => document.querySelector<HTMLElement>('.quill-table-head[data-allows-sorting]')!;
    act(() => head().click());
    expect(names()).toEqual(['Alpha', 'Beta']);
    act(() => head().click());
    expect(names()).toEqual(['Beta', 'Alpha']);
    act(() => head().click());
    expect(sorts).toHaveBeenLastCalledWith(null);
    expect(text()).toContain('2 files');
  });

  it('filters a table on what each column shows, and says how many match', () => {
    const rows = [
      { id: '1', name: 'Leave policy', size: 4 },
      { id: '2', name: 'Travel', size: 12 },
      { id: '3', name: 'Leave form', size: 1 },
    ];
    draw(<Table noun="files" filterable sort={{ key: 'size', dir: 'desc' }} columns={[{ key: 'name', label: 'Name' }, { key: 'size', label: 'Size', kind: 'number' }]} rows={rows} />);
    const names = () => [...document.querySelectorAll('.quill-table-cell[data-primary]')].map((c) => c.textContent);
    expect(names()).toEqual(['Travel', 'Leave policy', 'Leave form']);
    act(() => button('Filter files').click());
    const input = document.querySelector<HTMLInputElement>('input[type="search"]')!;
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    act(() => {
      setValue.call(input, ' LEAVE ');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(names()).toEqual(['Leave policy', 'Leave form']);
    expect(text()).toContain('2 of 3 files');
  });

  describe('a long table', () => {
    // happy-dom has no layout: give every element a size, as React Aria's own tests do, so the
    // virtualizer works out which rows are in view.
    const width = 1000;
    const height = 600;
    const sized: [string, PropertyDescriptor | undefined][] = [];
    beforeAll(() => {
      for (const [prop, value] of [['clientWidth', width], ['clientHeight', height]] as const) {
        sized.push([prop, Object.getOwnPropertyDescriptor(HTMLElement.prototype, prop)]);
        Object.defineProperty(HTMLElement.prototype, prop, { configurable: true, get: () => value });
      }
    });
    afterAll(() => {
      for (const [prop, desc] of sized) {
        if (desc) Object.defineProperty(HTMLElement.prototype, prop, desc);
        else delete (HTMLElement.prototype as unknown as Record<string, unknown>)[prop];
      }
    });
    const many = Array.from({ length: 3000 }, (_, i) => ({ id: `r${i}`, name: `Row ${String(i).padStart(4, '0')}`, size: i }));
    const columns = [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'size', label: 'Size', kind: 'number' as const, sortable: true, sortFirst: 'desc' as const },
    ];
    const drawn = () => [...document.querySelectorAll('.quill-table-cell[data-primary]')].map((c) => c.textContent);

    it('draws only the rows in view, and still counts them all', () => {
      draw(<Table noun="rows" virtual columns={columns} rows={many} />);
      const rows = drawn();
      expect(rows.length).toBeGreaterThan(0);
      expect(rows.length).toBeLessThan(60);
      expect(rows[0]).toBe('Row 0000');
      expect(document.querySelector('.quill-table')!.hasAttribute('data-virtual')).toBe(true);
      expect(document.querySelector('[role="grid"]')!.getAttribute('aria-rowcount')).toBe('3001');
      expect(text()).toContain('3000 rows');
    });

    it('draws the next rows as it scrolls', () => {
      draw(<Table noun="rows" virtual columns={columns} rows={many} />);
      const grid = document.querySelector<HTMLElement>('[role="grid"]')!;
      act(() => {
        grid.scrollTop = 56 * 1000;
        grid.dispatchEvent(new Event('scroll'));
      });
      const rows = drawn();
      expect(rows).toContain('Row 1005');
      expect(rows).not.toContain('Row 0000');
      expect(rows.length).toBeLessThan(60);
    });

    it('sorts every row, not just those drawn', () => {
      const sorts = vi.fn();
      draw(<Table noun="rows" virtual columns={columns} rows={many} onSort={sorts} />);
      const size = () => [...document.querySelectorAll<HTMLElement>('.quill-table-head[data-allows-sorting]')][1]!;
      act(() => size().click());
      expect(sorts).toHaveBeenLastCalledWith({ key: 'size', dir: 'desc' });
      expect(drawn()[0]).toBe('Row 2999');
      expect(drawn().length).toBeLessThan(60);
      act(() => size().click());
      expect(drawn()[0]).toBe('Row 0000');
    });

    it('shows a page at a time with Back and On, and goes back to the first on a new sort', () => {
      draw(<Table noun="rows" pageSize={10} virtual columns={columns} rows={many} />);
      expect(document.querySelector('.quill-table')!.hasAttribute('data-virtual')).toBe(false);
      expect(drawn()).toEqual(many.slice(0, 10).map((r) => r.name));
      expect(document.querySelector('.quill-table-pages')!.textContent).toMatch(/^1–10 of 3,?000$/);
      expect(button('Back: the rows before these').getAttribute('aria-disabled')).toBe('true');
      act(() => button('On: the next rows').click());
      expect(drawn()[0]).toBe('Row 0010');
      expect(document.querySelector('.quill-table-pages')!.textContent).toMatch(/^11–20 of/);
      act(() => [...document.querySelectorAll<HTMLElement>('.quill-table-head[data-allows-sorting]')][1]!.click());
      expect(drawn()[0]).toBe('Row 2999');
      expect(document.querySelector('.quill-table-pages')!.textContent).toMatch(/^1–10 of/);
    });

    it('looks as it always did while loading or empty', () => {
      draw(<Table noun="rows" virtual columns={columns} rows={[]} empty="No rows yet." />);
      expect(document.querySelector('.quill-table')!.hasAttribute('data-virtual')).toBe(false);
      expect(text()).toContain('No rows yet.');
    });
  });

  it('folds a long trail and puts actions past two in More', () => {
    draw(
      <PageHead
        heading="Leave"
        trail={['Policies', 'HR', 'People', 'Leave'].map((l) => ({ id: l, label: l }))}
        actions={[
          { id: 'a', label: 'Publish', kind: 'primary' },
          { id: 'b', label: 'Share', kind: 'primary' },
          { id: 'c', label: 'Archive' },
        ]}
      />,
    );
    expect(button('Show 2 more steps')).toBeDefined();
    expect(button('Publish')).toBeDefined();
    expect(button('Archive')).toBeUndefined();
    expect(button('More')).toBeDefined();
  });

  it('folds a section past its limit and says how many more', () => {
    draw(
      <Section label="Parts" limit={2}>
        <p>one</p>
        <p>two</p>
        <p>three</p>
      </Section>,
    );
    expect(text()).toContain('1 more');
    expect(text()).not.toContain('three');
    act(() => button('1 more').click());
    expect(text()).toContain('three');
  });

  it('says what isn’t known instead of leaving a gap', () => {
    draw(<Details items={[{ label: 'Owner', value: '' }, { label: 'Floor', value: 'Finance' }]} />);
    expect(text()).toContain('Not known');
  });

  it('draws a tally and says only what needs attention', () => {
    draw(<Tally noun={['part', 'parts']} counts={[{ status: 'done', n: 5, word: 'done' }, { status: 'failed', n: 1, word: 'blocked', loud: true }]} />);
    expect(document.querySelectorAll('.quill-tally-bar i')).toHaveLength(6);
    expect(document.querySelector('.quill-tally-words')!.textContent).toBe('6 parts · 1 blocked');
  });

  it('groups what happened by day', () => {
    draw(<Timeline now={new Date('2026-11-02T12:00:00')} items={[{ at: '2026-11-02T09:00:00', who: 'Sam', what: 'judged it at risk' }, { at: '2026-11-01T09:00:00', who: 'You', what: 'set it' }]} />);
    expect(text()).toContain('Today');
    expect(text()).toContain('Yesterday');
  });

  it('counts the refs you can’t open', () => {
    draw(<Refs refs={[{ kind: 'document', id: 'd', title: 'Leave' }]} closedCount={2} closedReason="Kept on Finance." />);
    expect(text()).toContain('2 you can’t open');
  });

  it('reads days in words and says them back', () => {
    const now = new Date('2026-11-02T12:00:00');
    expect(parseDay('13 nov', now)).toBe('2026-11-13');
    expect(parseDay('+2w', now)).toBe('2026-11-16');
    expect(parseDay('nonsense', now)).toBeNull();
    const change = vi.fn();
    draw(<DateField label="Due" now={now} onChange={change} />);
    act(() => button('End of month').click());
    expect(change).toHaveBeenCalledWith('2026-11-30');
  });

  it('keeps to days that exist and to the end of a short month', () => {
    const now = new Date('2026-01-31T12:00:00');
    expect(parseDay('+1m', now)).toBe('2026-02-28');
    expect(parseDay('31/02', now)).toBeNull();
    expect(parseDay('2026-13-01', now)).toBeNull();
    expect(parseDay('friday', now)).toBe('2026-02-06');
    expect(parseDay('end of week', new Date('2026-11-06T09:00:00'))).toBe('2026-11-06');
    expect(dayDistance('2026-02-03', now)).toBe('in 3 days');
  });

  it('chooses a day on its calendar', async () => {
    const now = new Date('2026-11-02T12:00:00');
    const change = vi.fn();
    draw(<DateField label="Due" now={now} defaultValue="2026-11-13" onChange={change} />);
    await act(async () => (document.querySelector('.quill-date-cal') as HTMLElement).click());
    const dialog = document.querySelector('[role="dialog"]')!;
    expect(dialog.querySelector('.quill-calendar-month')!.textContent).toContain('November 2026');
    const day20 = [...dialog.querySelectorAll('.quill-calendar-day')].find((c) => c.textContent === '20' && !c.hasAttribute('data-outside-month')) as HTMLElement;
    await act(async () => day20.click());
    expect(change).toHaveBeenCalledWith('2026-11-20');
  });

  it('shows a notice’s tone and its one action', () => {
    const act$ = vi.fn();
    draw(<Notice tone="needs" heading="Waiting for your back-brief." action="Write it" onAction={act$} more={2} />);
    expect(text()).toContain('2 more need you.');
  });
});

describe('picking tags', () => {
  const people = [
    { value: 'u1', label: 'Nora Briggs' },
    { value: 'u2', label: 'Ben Norris' },
    { value: 'u3', label: 'Ada Lee' },
  ];

  it('offers what isn’t chosen, those that start with the word first, and a new one when it may', () => {
    expect(tagChoices(people, ['u3'], 'nor', false).map((c) => c.id)).toEqual(['u1', 'u2']);
    expect(tagChoices(people, [], 'Kim', true).map((c) => c.add)).toEqual(['Kim']);
    expect(tagChoices(people, [], 'ada lee', true).some((c) => c.add)).toBe(false);
  });

  it('shows the chosen as ruled words, takes one off with its ×, and says when it’s full', () => {
    const change = vi.fn();
    draw(<TagPicker label="Developers" options={people} defaultValue={['u1', 'u2']} max={2} onChange={change} />);
    expect([...document.querySelectorAll('.quill-tag-picker-word')].map((t) => t.textContent)).toEqual(['Nora Briggs', 'Ben Norris']);
    expect(document.querySelector('input')!.placeholder).toContain('most it takes: 2');
    act(() => button('Remove Nora Briggs').click());
    expect(change).toHaveBeenLastCalledWith(['u2']);
  });
});

describe('lifecycles and people', () => {
  const states = [
    { id: 'draft', name: 'Draft' },
    { id: 'review', name: 'In review' },
    { id: 'issued', name: 'Issued' },
    { id: 'retired', name: 'Retired' },
  ];

  it('rings where a record is, hides off-line states, and offers its moves or says why not', () => {
    const move = vi.fn();
    draw(<Lifecycle label="Version 3" states={states} state="review" offLine={['retired']} moves={['issued']} onMove={move} />);
    expect([...document.querySelectorAll('.quill-lifecycle li')].map((l) => l.textContent)).toEqual(['Draft', 'In review', 'Issued']);
    expect(document.querySelector('[aria-current="step"]')!.textContent).toBe('In review');
    expect(document.querySelector('ol')!.getAttribute('aria-label')).toBe('Version 3: In review');
    act(() => button('Make it Issued').click());
    expect(move).toHaveBeenCalledWith('issued');
    draw(<Lifecycle states={states} state="retired" offLine={['retired']} why="Only its library’s leads can move it." />);
    expect(text()).toContain('Retired');
    expect(text()).toContain('Only its library’s leads can move it.');
    expect(document.querySelector('.quill-lifecycle-moves')).toBeNull();
  });

  it('says a team’s size, and why one can’t be chosen', () => {
    const rows = principalRows(
      [
        { kind: 'team', id: 't1', name: 'Ops', size: 4 },
        { kind: 'person', id: 'u1', name: 'Nora Briggs', detail: 'Ops' },
      ],
      [{ kind: 'person', id: 'u1', name: 'Nora Briggs' }],
    );
    expect(rows[0]).toMatchObject({ id: 'team:t1', detail: '4 people', icon: 'people' });
    expect(rows[1]).toMatchObject({ disabled: true, reason: 'Already chosen.' });
  });

  it('looks after typing, and gathers what’s picked in a list under it', async () => {
    const search = vi.fn(async () => [
      { kind: 'person' as const, id: 'u1', name: 'Nora Briggs', detail: 'Ops' },
      { kind: 'team' as const, id: 't1', name: 'Ops', size: 4 },
    ]);
    const change = vi.fn();
    draw(<PeoplePicker label="Who" multiple kinds="people" search={search} pause={0} onChange={change} />);
    const input = document.querySelector('input')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'No');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 5));
    });
    expect(search).toHaveBeenCalledWith('No');
    const rows = [...document.querySelectorAll<HTMLElement>('.quill-list-row')];
    expect(rows).toHaveLength(1);
    await act(async () => rows[0]!.click());
    expect(change).toHaveBeenLastCalledWith([{ kind: 'person', id: 'u1', name: 'Nora Briggs', detail: 'Ops' }]);
    expect(document.querySelector('.quill-people-one .augur-person-text')!.textContent).toContain('Nora Briggs');
    await act(async () => document.querySelector<HTMLElement>('[aria-label="Take off Nora Briggs"]')!.click());
    expect(change).toHaveBeenLastCalledWith([]);
    expect(document.querySelector('input')!.value).toBe('');
  });
});

describe('filtering', () => {
  const filters = [
    { id: 'tag', label: 'Tags', options: [{ value: 't1', label: 'Travel' }, { value: 't2', label: 'Leave' }] },
    { id: 'since', label: 'Changed', single: true, options: [{ value: 'week', label: 'Past week' }] },
  ];

  it('drops unknown or empty filters from a value', () => {
    expect(filterValue(filters, { tag: ['t1', 'gone'], since: [], other: ['x'] })).toEqual({ tag: ['t1'] });
  });

  it('counts, says what’s on in words on its ruled line, and clears it all', () => {
    const change = vi.fn();
    draw(<FilterBar label="Filter documents" filters={filters} value={{ tag: ['t1', 't2'] }} sorts={[{ value: 'title', label: 'Title' }]} sort="title" count={3} noun={['document', 'documents']} onChange={change} />);
    expect(text()).toContain('3 documents');
    expect(button('Tags, 2 chosen')).toBeDefined();
    expect([...document.querySelectorAll('.quill-filter-words')].map((t) => t.textContent)).toEqual(['Travel, Leave', 'any', 'Title']);
    act(() => button('Clear all').click());
    expect(change).toHaveBeenLastCalledWith({}, 'title');
  });

  it('starts with the saved views and says which is on', async () => {
    const view = vi.fn();
    draw(<FilterBar label="Filter documents" filters={filters} value={{}} views={[{ value: 'mine', label: 'Mine' }, { value: 'all', label: 'Everything' }]} view="mine" onView={view} onChange={() => {}} />);
    expect(document.querySelector('.quill-filter-view')!.textContent).toBe('Mine');
    expect(document.querySelector('.quill-filter-clear')).toBeNull();
    await act(async () => (document.querySelector('.quill-filter-open') as HTMLElement).click());
    const all = [...document.querySelectorAll<HTMLElement>('[role="menuitemradio"]')].find((i) => i.textContent?.includes('Everything'))!;
    await act(async () => all.click());
    expect(view).toHaveBeenLastCalledWith('all');
  });

  it('adds a choice from a filter’s menu, and replaces it for a single one', async () => {
    const change = vi.fn();
    draw(<FilterBar label="Filter documents" filters={filters} value={{ tag: ['t1'] }} onChange={change} />);
    await act(async () => button('Tags, 1 chosen').click());
    const leave = [...document.querySelectorAll<HTMLElement>('[role="menuitemcheckbox"]')].find((i) => i.textContent?.includes('Leave'))!;
    await act(async () => leave.click());
    expect(change).toHaveBeenLastCalledWith({ tag: ['t1', 't2'] }, '');
  });
});

describe('reading', () => {
  it('anchors every block, drops a first heading that repeats the title, and escapes HTML', async () => {
    await loadReader();
    const outline = vi.fn();
    const handle: { current: ReaderHandle | null } = { current: null };
    draw(<Reader ref={handle} heading="Plan" markdown={'# Plan\n\nIntro <b>bold</b>\n\n## 2. Claims & receipts\n\nMore [up](#plan) and [out](https://example.org)'} onOutline={outline} />);
    await act(async () => {});
    const article = document.querySelector('.quill-reader')!;
    expect(article.querySelector('h1')!.hidden).toBe(true);
    expect(article.querySelector('b')).toBeNull();
    expect(article.textContent).toContain('<b>bold</b>');
    expect(article.querySelector('#claims-receipts')).not.toBeNull();
    expect(article.querySelector('a[href^="https"]')!.getAttribute('rel')).toBe('noopener noreferrer');
    expect(outline).toHaveBeenLastCalledWith([{ id: 'claims-receipts', text: '2. Claims & receipts', level: 2 }]);
    expect(handle.current!.headingFor('b4')).toBe('claims-receipts');
    expect(handle.current!.goTo('b2', { focus: true })).toBe(true);
    expect(document.activeElement?.id).toBe('b2');
    expect(slugFor('Café ünd Ölé')).toBe('cafe-und-ole');
  });

  it('lists headings from the top level there is and marks the one being read', () => {
    const pick = vi.fn();
    draw(<Contents items={[{ id: 'a', text: 'A', level: 2 }, { id: 'b', text: 'B', level: 3 }]} current="b" onSelect={pick} />);
    expect([...document.querySelectorAll('.quill-contents li')].map((l) => l.getAttribute('data-level'))).toEqual(['1', '2']);
    expect(document.querySelector('[aria-current="location"]')!.textContent).toBe('B');
    act(() => (document.querySelector('a') as HTMLElement).click());
    expect(pick).toHaveBeenCalledWith('a');
  });

  it('loads pictures only through the host, and names the ones it can’t find', async () => {
    await loadReader();
    const source = vi.fn(async (src: string) => (src === 'a.png' ? 'blob:a' : undefined));
    draw(<Reader markdown={'![Map](a.png)\n\n![Chart](b.png)'} imageSource={source} />);
    await act(async () => {});
    expect(document.querySelector('img')!.getAttribute('src')).toBe('blob:a');
    expect(document.querySelector('.quill-reader-missing')!.textContent).toBe('[Picture: Chart]');
  });
});

describe('writing and trees', () => {
  it('opens the rows above the selected one and says which was chosen', async () => {
    const { Tree } = await import('./tree.js');
    const chosen = vi.fn();
    draw(<Tree label="Folders" selected="hr" onSelect={chosen} items={[{ id: 'p', label: 'Policies', children: [{ id: 'hr', label: 'HR' }, { id: 'it', label: 'IT' }] }, { id: 'x', label: 'Other' }]} />);
    const rows = () => [...document.querySelectorAll('[role="row"]')].map((r) => r.textContent);
    expect(rows()).toEqual(['Policies', 'HR', 'IT', 'Other']);
    act(() => (document.querySelectorAll('[role="row"]')[2] as HTMLElement).click());
    expect(chosen).toHaveBeenCalledWith(expect.objectContaining({ id: 'it' }));
  });
});

describe('fields in a Dialog', () => {
  const primary = () => [...document.querySelectorAll('button')].find((b) => b.textContent === 'Go')!;
  const enter = (el: HTMLElement) => act(async () => void el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })));
  const type = (input: HTMLInputElement, value: string) =>
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

  it('Enter in a PeoplePicker looks, and leaves the Dialog alone', async () => {
    const onClose = vi.fn();
    const search = vi.fn(async () => []);
    draw(<Dialog open heading="Share" actionLabel="Go" onClose={onClose} fields={<PeoplePicker label="With" search={search} />} />);
    const input = document.querySelector('input')!;
    type(input, 'Nora');
    await enter(input);
    expect(search).toHaveBeenCalledWith('Nora');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('Enter in a DateField presses the primary with the day just typed', async () => {
    const onClose = vi.fn();
    const onChange = vi.fn();
    draw(<Dialog open heading="Move" actionLabel="Go" onClose={onClose} fields={<DateField label="Due" name="due" quick={[]} onChange={onChange} now={new Date(2026, 10, 6)} />} />);
    const input = document.querySelector('input')!;
    act(() => input.focus());
    type(input, '13 nov');
    await enter(input);
    expect(onClose).toHaveBeenCalledWith({ due: '2026-11-13' });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('Enter in a DateField holds on a day it can’t read', async () => {
    const onClose = vi.fn();
    draw(<Dialog open heading="Move" actionLabel="Go" onClose={onClose} fields={<DateField label="Due" name="due" quick={[]} />} />);
    const input = document.querySelector('input')!;
    act(() => input.focus());
    type(input, 'soonish');
    await enter(input);
    expect(onClose).not.toHaveBeenCalled();
    expect(text()).toContain('Try “13 Nov”');
  });

  it('Enter in a TimeField presses the primary with the time just typed', async () => {
    const onClose = vi.fn();
    draw(<Dialog open heading="Move" actionLabel="Go" onClose={onClose} fields={<TimeField label="At" name="at" />} />);
    const input = document.querySelector('input')!;
    act(() => input.focus());
    type(input, '9am');
    await enter(input);
    expect(onClose).toHaveBeenCalledWith({ at: '09:00' });
  });

  it('a second Enter in a DateField keeps the day', async () => {
    const onChange = vi.fn();
    draw(<DateField label="Due" quick={[]} onChange={onChange} now={new Date(2026, 10, 6)} />);
    const input = document.querySelector('input')!;
    act(() => input.focus());
    type(input, '13 nov');
    await enter(input);
    await enter(input);
    expect(onChange.mock.calls).toEqual([['2026-11-13']]);
  });

  it('holds the primary until a required TagPicker has a tag, and says so', async () => {
    const onSubmit = vi.fn();
    const Form = () => {
      const [tags, setTags] = useState<string[]>([]);
      return (
        <Dialog
          open
          heading="Tag"
          actionLabel="Go"
          onClose={() => {}}
          onSubmit={onSubmit}
          fields={
            <>
              <TagPicker label="Tags" name="tags" required options={[{ value: 'a', label: 'A' }]} value={tags} onChange={setTags} />
              <button type="button" onClick={() => setTags(['a'])}>
                Add
              </button>
            </>
          }
        />
      );
    };
    draw(<Form />);
    await act(async () => primary().click());
    expect(onSubmit).not.toHaveBeenCalled();
    expect(document.querySelector<HTMLElement>('.quill-tag-picker')!.dataset.state).toBe('attention');
    expect(text()).toContain('Needs you.');
    await act(async () => button('Add').click());
    expect(text()).not.toContain('Needs you.');
    await act(async () => primary().click());
    expect(onSubmit).toHaveBeenCalledWith({ tags: 'a' });
  });
});

describe('saying why', () => {
  it('a DateField with a reason stays focusable, says why and can’t be changed', () => {
    const onChange = vi.fn();
    draw(<DateField label="Due" disabled reason="Only its owner can move the date." defaultValue="2026-11-13" onChange={onChange} />);
    const input = document.querySelector('input')!;
    expect(input.disabled).toBe(false);
    expect(input.readOnly).toBe(true);
    expect(input.getAttribute('aria-disabled')).toBe('true');
    expect(text()).toContain('Only its owner can move the date.');
    act(() => input.focus());
    act(() => void input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })));
    act(() => input.blur());
    expect(onChange).not.toHaveBeenCalled();
    expect(input.value).toContain('13 Nov');
  });

  it('a DropZone with a reason keeps its key focusable, says why and takes nothing', () => {
    draw(<DropZone disabled reason="This library is read-only." />);
    const key = button('Choose files');
    expect(key.disabled).toBe(false);
    expect(key.getAttribute('aria-disabled')).toBe('true');
    expect(text()).toContain('This library is read-only.');
    const open = vi.spyOn(document.querySelector<HTMLInputElement>('input[type="file"]')!, 'click');
    act(() => key.click());
    expect(open).not.toHaveBeenCalled();
  });
});

describe('the palette', () => {
  const items = ['One', 'Two', 'Three'].map((label) => ({ id: label, label }));
  const press = (key: string) => act(() => void document.querySelector('input')!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })));
  const palette = (list: typeof items, onPick = vi.fn()) => <Palette open onClose={() => {}} placeholder="Find" query="" onQuery={() => {}} items={list} onPick={onPick} />;

  it('keeps the chosen row in sight as the keys move it', () => {
    const scrolled: string[] = [];
    const spy = vi.spyOn(HTMLElement.prototype, 'scrollIntoView').mockImplementation(function (this: HTMLElement) {
      scrolled.push(this.textContent ?? '');
    });
    draw(palette(items));
    press('ArrowDown');
    press('ArrowDown');
    expect(scrolled.at(-1)).toContain('Three');
    spy.mockRestore();
  });

  it('marks the row Enter will open when the list shrinks under it', () => {
    const onPick = vi.fn();
    draw(palette(items, onPick));
    press('ArrowDown');
    press('ArrowDown');
    act(() => root!.render(palette(items.slice(0, 2), onPick)));
    expect(document.querySelector('[role="option"][aria-selected="true"]')?.textContent).toContain('Two');
    press('Enter');
    expect(onPick).toHaveBeenCalledWith(items[1]);
  });
});

describe('dates in a table', () => {
  const now = Date.parse('2026-11-06T12:00:00Z');
  it.each([
    ['2026-11-06T12:00:10Z', 'just now'],
    ['2026-11-06T12:20:00Z', 'in 20 min'],
    ['2026-11-06T15:00:00Z', 'in 3 h'],
    ['2026-11-09T12:00:00Z', 'in 3 d'],
    ['2026-11-06T11:40:00Z', '20 min ago'],
  ])('reads %s as %s', (value, said) => {
    expect(relativeTime(value, now)).toBe(said);
  });

  it('gives the date for anything a month or more away', () => {
    expect(relativeTime('2027-01-06T12:00:00Z', now)).toContain('2027');
  });
});
