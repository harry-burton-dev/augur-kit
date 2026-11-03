import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { tokens } from '@augur/kit-common/tokens';

// A container query can't read a variable, so kit.css writes the frame's widths out. They must be the tokens'.
const css = readFileSync(new URL('./kit.css', import.meta.url), 'utf8');
const queried = [...css.matchAll(/@container quill-frame \(width < (\d+px)\)/g)].map((m) => m[1]);

describe('the frame changes shape at the token widths', () => {
  it('queries exactly the two token widths', () => {
    expect(queried.sort()).toEqual([tokens['frame-overlay-below'], tokens['frame-icons-below']].sort());
  });
});
