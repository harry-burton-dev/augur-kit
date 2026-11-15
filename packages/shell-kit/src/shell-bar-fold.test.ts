// What the desktop bar keeps for its groups at each width (WCAG 2.2 reflow at 320 px): the logo and More
// always fit, so a group that doesn't goes under More rather than past the edge.
import { describe, expect, it } from 'vitest';
import { groupsShown } from './shell-bar.js';

describe('the desktop bar folds groups into More', () => {
  it('shows every group when they all fit beside the logo', () => {
    expect(groupsShown(3, 6, 0)).toBe(3);
    expect(groupsShown(3, 4, 0)).toBe(3);
  });

  it('keeps room for More when they don’t', () => {
    expect(groupsShown(5, 4, 0)).toBe(2);
    expect(groupsShown(5, 6, 2)).toBe(2);
  });

  it('shows no group of its own at 320 px, where only the logo and More fit', () => {
    // 320 px: (320 - bar-grip 36) / bar-tile-narrow 92 = 3 tiles, or 2 inside a padded frame.
    expect(groupsShown(4, 2, 0)).toBe(0);
    expect(groupsShown(4, 3, 0)).toBe(1);
  });
});
