// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { DateRangeField, parseTime } from './time.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('parseTime', () => {
  it.each([
    ['9', '09:00'], ['9am', '09:00'], ['2.30pm', '14:30'], ['14:30', '14:30'], ['1430', '14:30'], ['12am', '00:00'], ['12pm', '12:00'],
    ['half 2', '14:30'], ['quarter past 3', '15:15'], ['quarter to 5', '16:45'], ['3', '15:00'], ['noon', '12:00'], ['midnight', '00:00'], ['7', '07:00'],
  ])('reads “%s” as %s', (said, time) => expect(parseTime(said)).toBe(time));

  it.each(['teatime', '25:00', '9:75', '13pm', 'half to 3', ''])('can’t read “%s”', (said) => expect(parseTime(said)).toBeNull());
});

describe('DateRangeField', () => {
  let root: Root | undefined;
  afterEach(() => act(() => root?.unmount()));
  const draw = (from: string, to: string) => {
    document.body.replaceChildren(document.createElement('div'));
    root = createRoot(document.body.firstElementChild!);
    act(() => root!.render(<DateRangeField label="Away" defaultValue={{ from, to }} now={new Date('2026-11-06T12:00:00')} />));
    return document.body.firstElementChild as HTMLElement;
  };

  it('says how many days it spans, counted inclusive', () => {
    expect(draw('2026-11-13', '2026-11-20').querySelector('.quill-range-total')!.textContent).toBe('8 days');
  });

  it('turns the end red when it is before the start', () => {
    const el = draw('2026-11-20', '2026-11-13');
    expect(el.querySelectorAll<HTMLElement>('.augur-field')[1]!.dataset.state).toBe('error');
    expect(el.textContent).toContain('Ends before it starts.');
    expect(el.querySelector('.quill-range-total')).toBeNull();
  });
});
