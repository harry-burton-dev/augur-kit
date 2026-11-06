import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Every part a kit exports has a story of its own: drawn as `<Part` in a story, or a story file's
// `component`. A part without one waits on the list below, which only shrinks: each part gets its
// stories when it is restyled in the Horizon language, and leaves the list then.
const packages = join(dirname(fileURLToPath(import.meta.url)), '../packages');
const kits = ['kit-common', 'app-kit', 'shell-kit'];

/** Parts with no story yet. Remove a name when its story lands; never add one. */
const waiting = new Set([
  'FilterBar',
  'DataView',
]);

/** Parts being replaced: no stories. Title and Orbit (CentreMenu) have gone to the archive. */
const replaced = new Set<string>([]);

/** Parts that draw nothing of their own, so a story would show nothing. */
const undrawn = new Set(['DataProvider']);

const sources = (kit: string) => {
  const dir = join(packages, kit, 'src');
  return readdirSync(dir).filter((f) => f.endsWith('.tsx')).map((f) => [f, readFileSync(join(dir, f), 'utf8')] as const);
};

/** The components a kit exports from its index: functions named with a capital, declared in its own source. */
const partsOf = (kit: string) => {
  const index = readFileSync(join(packages, kit, 'src/index.ts'), 'utf8');
  const exported = new Set(
    [...index.matchAll(/export \{([^}]*)\}/g)].flatMap((m) =>
      m[1]!
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s && !s.startsWith('type ')),
    ),
  );
  const declared = sources(kit)
    .filter(([f]) => !/\.(test|stories)\./.test(f))
    .flatMap(([, text]) => [...text.matchAll(/^export function ([A-Z]\w*)/gm)].map((m) => m[1]!));
  return [...new Set(declared)].filter((name) => exported.has(name)).sort();
};

const stories = kits.flatMap((kit) => sources(kit).filter(([f]) => f.endsWith('.stories.tsx')).map(([, text]) => text)).join('\n');
const hasStory = (name: string) => new RegExp(`<${name}[\\s/>]|component: ${name}\\b`).test(stories);
const parts = kits.flatMap((kit) => partsOf(kit).map((name) => [kit, name] as const));

describe('every exported part has a story', () => {
  it('finds the parts', () => {
    expect(parts.length).toBeGreaterThan(50);
  });

  it.each(parts.filter(([, name]) => !waiting.has(name) && !replaced.has(name) && !undrawn.has(name)))('%s %s has a story', (_kit, name) => {
    expect(hasStory(name)).toBe(true);
  });

  it.each([...waiting])('%s is still waiting for a story (take it off the list once it has one)', (name) => {
    expect(parts.some(([, n]) => n === name)).toBe(true);
    expect(hasStory(name)).toBe(false);
  });
});
