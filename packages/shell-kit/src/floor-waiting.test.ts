// What the floor picker counts, glances at and pulses for: only what needs you, as the app bar's lights.
import { describe, expect, it } from 'vitest';
import { ShellModel, type ShellNotification } from './shell-model.js';

const note = (id: string, extra: Partial<ShellNotification>): ShellNotification => ({
  id,
  app: 'docs',
  level: 'needs',
  title: 'Same title',
  time: '2026-11-03T09:00:00Z',
  floor: 'org',
  ...extra,
});

describe('waiting on a floor', () => {
  it('counts only what needs you, not quiet, muted or lower levels', () => {
    const model = new ShellModel();
    model.notifications = [
      note('a', {}),
      note('b', {}),
      note('quiet', { quiet: true }),
      note('muted', { app: 'mandate' }),
      note('info', { level: 'info' }),
      note('done', { level: 'done' }),
      note('nofloor', { floor: undefined }),
    ];
    model.muted = ['mandate'];
    expect(model.waitingByFloor()).toEqual(new Map([['org', 2]]));
    expect(model.waitingOnFloors().get('org')?.map((n) => n.id)).toEqual(['a', 'b']);
  });
});
