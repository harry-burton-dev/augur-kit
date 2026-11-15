// What the desktop bar gives a tile of its own at each width (WCAG 2.2 reflow at 320 px): the logo always,
// then groups and open apps while they fit, and More for the rest, so nothing runs past the edge.
import { describe, expect, it } from 'vitest';
import { desktopFit } from './shell-bar.js';

describe('the desktop bar folds what doesn’t fit into More', () => {
  it('shows everything when it all fits beside the logo', () => {
    expect(desktopFit(3, 2, 6)).toEqual({ groups: 3, opens: 2, more: false });
    expect(desktopFit(1, 1, 3, true)).toEqual({ groups: 1, opens: 1, more: false });
  });

  it('folds groups before open apps, keeping a tile for More', () => {
    expect(desktopFit(5, 0, 4)).toEqual({ groups: 2, opens: 0, more: true });
    expect(desktopFit(5, 2, 6)).toEqual({ groups: 2, opens: 2, more: true });
  });

  it('folds open apps too where only the logo and More fit, as on a 320 px screen', () => {
    expect(desktopFit(2, 3, 2)).toEqual({ groups: 0, opens: 0, more: true });
    expect(desktopFit(2, 3, 3)).toEqual({ groups: 0, opens: 1, more: true });
    expect(desktopFit(1, 2, 3, true)).toEqual({ groups: 1, opens: 1, more: false });
    expect(desktopFit(1, 1, 2, true)).toEqual({ groups: 1, opens: 0, more: false });
  });

  it('never lays out more tiles than there is room for, and More always holds two things or more', () => {
    for (let room = 2; room < 12; room++)
      for (let g = 0; g < 8; g++)
        for (let o = 0; o < 8; o++) {
          const fit = desktopFit(g, o, room);
          const tiles = 1 + fit.groups + fit.opens + (fit.more ? 1 : 0);
          expect(tiles).toBeLessThanOrEqual(room);
          if (fit.more) expect(g - fit.groups + o - fit.opens).toBeGreaterThanOrEqual(2);
          const folder = desktopFit(1, o, room, true);
          expect(2 + folder.opens).toBeLessThanOrEqual(Math.max(room, 2));
        }
  });
});
