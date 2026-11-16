import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SMALL_WINDOW_BELOW } from './small-window.js';

// A media query can't read a variable, so the CSS writes the small window's width out. It must be the token's.
const files = ['shell.css', 'app-pane.css', 'floor-picker.css', 'kit.css'];

describe('the small window starts at the token width', () => {
  it.each(files)('%s queries just under window-small-below', (file) => {
    const css = readFileSync(new URL(`./${file}`, import.meta.url), 'utf8');
    expect(css).toContain(`@media (max-width: ${SMALL_WINDOW_BELOW - 1}px)`);
  });
});
