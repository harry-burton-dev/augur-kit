import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Tokens only (Shell principles, in the AUGUR handbook): a colour or a duration in a part's markup or CSS is a token.
// Every kit's source: Common's own, Quill's and Aerie's.
const here = dirname(fileURLToPath(import.meta.url));
const packages = join(here, '../..');
const kits = [here, join(here, '../../app-kit/src'), join(here, '../../shell-kit/src')];
// The parts' markup and CSS, and their plain TypeScript too (the water draws in a .ts file). The generated token map sits in a folder of its own, so it isn't read.
const files = kits.flatMap((dir) => readdirSync(dir).filter((f) => /\.(tsx?|css)$/.test(f) && !/\.(test|stories)\./.test(f)).map((f) => relative(packages, join(dir, f))));
/** Raw distances in the kits' CSS today. Lower it as they become tokens; never raise it. */
const RAW_DISTANCES = 195;
const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

describe('tokens only', () => {
  it.each(files)('%s has no raw colour', (file) => {
    expect(strip(readFileSync(join(packages, file), 'utf8'))).not.toMatch(/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(/i);
  });

  it.each(files)('%s has no raw duration', (file) => {
    expect(strip(readFileSync(join(packages, file), 'utf8'))).not.toMatch(/(?<![\w-])\d+(\.\d+)?m?s\b(?!\w)/);
  });

  it.each(files.filter((f) => f.endsWith('.tsx')))('%s uses Tailwind values only from the theme', (file) => {
    const arbitrary = [...strip(readFileSync(join(packages, file), 'utf8')).matchAll(/className="[^"]*"/g)].flatMap((m) => m[0].match(/\[[^\]]*\]/g) ?? []);
    expect(arbitrary.filter((v) => !v.includes('var(--'))).toEqual([]);
  });

  // Distances (Shell principles): a size in a part's CSS is a token too. Many aren't yet, so for now this
  // only reports them and stops the count growing; it becomes a plain failure once the Horizon spacing
  // tokens exist. Hairlines (2px and under) are borders, not distances, and don't count.
  it('adds no raw distance', () => {
    const counts = files
      .filter((f) => f.endsWith('.css'))
      .map((f) => [f, [...strip(readFileSync(join(packages, f), 'utf8')).matchAll(/(?<![\w.-])(\d+(?:\.\d+)?)px\b/g)].filter((m) => Number(m[1]) > 2).length] as const)
      .filter(([, n]) => n > 0);
    const total = counts.reduce((sum, [, n]) => sum + n, 0);
    console.info(`Raw distances in the kits' CSS: ${total} (${counts.map(([f, n]) => `${f} ${n}`).join(', ')})`);
    expect(total).toBeLessThanOrEqual(RAW_DISTANCES);
  });
});
