import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { tokens } from '@augur/kit-common/tokens';

// A container query can't read a variable, so frame.css writes the pane's tight width out. It must be the token's.
const css = readFileSync(new URL('./frame.css', import.meta.url), 'utf8');
const queried = [...css.matchAll(/@container aerie-pane \(width < (\d+px)\)/g)].map((m) => m[1]);

describe('the pane tightens its inset at the token width', () => {
  it('queries exactly pane-tight-below', () => {
    expect(queried).toEqual([tokens['pane-tight-below']]);
  });
});
