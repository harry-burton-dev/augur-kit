import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Run after the token and font builds (the test script does both).
const dist = join(dirname(fileURLToPath(import.meta.url)), '../dist');
const read = (file: string) => readFileSync(join(dist, file), 'utf8');

describe('reduced motion', () => {
  const css = read('tokens.css');
  const block = (selector: string) => css.slice(css.indexOf(selector)).split('}')[0];

  it.each([":root[data-motion='reduce'] {", '@media (prefers-reduced-motion: reduce) {'])('sets each motion token to its reduced value under %s', (selector) => {
    const set = block(selector);
    expect(set).toContain('--motion-base: 0.01ms;');
    expect(set).toContain('--motion-ping: 0s;');
    expect(set).toContain('--travel-near: 0px;');
    expect(set).toContain('--travel-floor: 0px;');
    // Reading times stay as they are: a toast or an Undo doesn't go sooner.
    expect(set).not.toMatch(/--motion-(hold|toast|title|still):/);
  });

  it('keeps the full values on :root', () => {
    expect(css.slice(0, css.indexOf(":root[data-motion='reduce']"))).toContain('--motion-base: 240ms;');
  });
});

describe('typefaces', () => {
  const css = read('fonts.css');

  it('has the faces the font tokens name', () => {
    expect(css).toMatch(/font-family: 'Instrument Sans'/);
    expect(css).toMatch(/font-family: 'IBM Plex Mono'/);
    expect(css).toMatch(/font-family: 'Nunito'/);
  });

  it('names only files it has, next to it', () => {
    const urls = [...css.matchAll(/url\(([^)]+)\)/g)].map((m) => m[1]);
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) {
      expect(url).toMatch(/^\.\/fonts\/[\w.-]+$/);
      expect(existsSync(join(dist, url)), url).toBe(true);
    }
  });
});
