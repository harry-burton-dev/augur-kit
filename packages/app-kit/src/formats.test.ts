import { describe, expect, it } from 'vitest';
import { dayName } from './date.js';
import { dayKey, writeDate } from './formats.js';
import { relativeTime } from './list.js';
import { dayWords } from './things.js';

const at = '2026-03-24T23:30:00Z';

describe('dates written the person’s way', () => {
  it('writes a moment in their locale, time zone and clock, and falls back to the browser’s', () => {
    expect(writeDate(at, { day: 'numeric', month: 'short', year: 'numeric' }, { locale: 'en-US', timeZone: 'UTC' })).toBe('Mar 24, 2026');
    expect(writeDate(at, { day: 'numeric', month: 'short', year: 'numeric' }, { locale: 'en-GB', timeZone: 'Asia/Tokyo' })).toBe('25 Mar 2026');
    expect(writeDate(at, { hour: '2-digit', minute: '2-digit' }, { locale: 'en-US', timeZone: 'UTC', hourCycle: 'h23' })).toBe('23:30');
    expect(writeDate(at, { year: 'numeric' }, { locale: 'not a tag' })).toBe('2026');
  });

  it('groups by day in their time zone', () => {
    expect(dayKey(new Date(at), 'UTC')).toBe('2026-03-24');
    expect(dayKey(new Date(at), 'Asia/Tokyo')).toBe('2026-03-25');
    const now = new Date('2026-03-25T01:00:00Z');
    expect(dayWords(new Date(at), now, { timeZone: 'Asia/Tokyo' })).toBe('Today');
    expect(dayWords(new Date(at), now, { timeZone: 'UTC' })).toBe('Yesterday');
    expect(dayWords(new Date('2026-03-20T12:00:00Z'), now, { locale: 'de-DE', timeZone: 'UTC' })).toBe('Fr., 20. März');
  });

  it('writes a day field’s words their way, and keeps what is typed back English', () => {
    const now = new Date('2026-03-01T12:00:00');
    expect(dayName('2026-11-13', now, { locale: 'de-DE' })).toBe('Fr., 13. Nov.');
    expect(dayName('2026-11-13', now)).toBe('Fri 13 Nov');
  });

  it('writes an old date in a table their way', () => {
    expect(relativeTime('2026-01-02T12:00:00Z', Date.parse('2026-03-24T12:00:00Z'), { locale: 'en-US', timeZone: 'UTC' })).toBe('Jan 2, 2026');
  });
});
