import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Reduce motion stops every loop (PER-170): each infinite animation in every kit's CSS is set to
// `animation: none` both under the system setting and under AUGUR's own switch (`data-motion="reduce"`
// on <html>), for the very same selector.
const here = dirname(fileURLToPath(import.meta.url));
const packages = join(here, '../..');
const kits = [here, join(here, '../../app-kit/src'), join(here, '../../shell-kit/src')];
const files = kits.flatMap((dir) => readdirSync(dir).filter((f) => f.endsWith('.css')).map((f) => join(dir, f)));

const SWITCH = ":root[data-motion='reduce']";
interface Rule {
  selectors: string[];
  media: string[];
  body: string;
}

const splitList = (text: string) => text.split(',').map((s) => s.trim().replace(/\s+/g, ' ')).filter(Boolean);

/** A small CSS reader: rules with their selectors (nesting resolved) and the at-rules around them. */
export function readRules(css: string): Rule[] {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const rules: Rule[] = [];
  const walk = (from: number, parents: string[], media: string[]): number => {
    let i = from;
    let start = i;
    while (i < text.length) {
      const c = text[i];
      if (c === '}') {
        return i + 1;
      }
      if (c === ';') {
        start = i + 1;
      } else if (c === '{') {
        const head = text.slice(start, i).trim();
        // The declarations directly in this block, up to its first nested block.
        let depth = 0;
        let j = i + 1;
        let own = '';
        for (; j < text.length; j++) {
          const d = text[j];
          if (d === '{') depth++;
          else if (d === '}') {
            if (depth === 0) break;
            depth--;
          } else if (depth === 0) own += d;
        }
        if (head.startsWith('@keyframes')) {
          i = j + 1;
          start = i;
          continue;
        }
        if (head.startsWith('@')) {
          const inner = head.startsWith('@media') ? [...media, head] : media;
          i = walk(i + 1, parents, inner);
        } else {
          const list = splitList(head);
          const selectors = parents.length ? parents.flatMap((p) => list.map((s) => (s.includes('&') ? s.replace(/&/g, p) : `${p} ${s}`))) : list;
          // Only the block's own declarations, without nested blocks' text.
          rules.push({ selectors, media, body: own.replace(/[^;{}]*\{[^}]*\}/g, '') });
          i = walk(i + 1, selectors, media);
        }
        start = i;
        continue;
      }
      i++;
    }
    return i;
  };
  walk(0, [], []);
  return rules;
}

const reducing = (r: Rule) => r.media.some((m) => /prefers-reduced-motion:\s*reduce/.test(m));
const stops = (r: Rule) => /(^|;)\s*animation\s*:\s*none\b/.test(r.body);

describe('reduce motion stops every loop', () => {
  const sheets = files.map((file) => [relative(packages, file), readRules(readFileSync(file, 'utf8'))] as const);
  it('finds the loops', () => {
    expect(sheets.flatMap(([, rules]) => rules.filter((r) => /\binfinite\b/.test(r.body))).length).toBeGreaterThan(10);
  });
  it.each(sheets)('%s', (_file, rules) => {
    const loops = rules.filter((r) => !reducing(r) && !r.selectors.some((s) => s.startsWith(SWITCH)) && /\binfinite\b/.test(r.body)).flatMap((r) => r.selectors);
    const bySystem = new Set(rules.filter((r) => reducing(r) && stops(r)).flatMap((r) => r.selectors));
    const bySwitch = new Set(rules.filter((r) => !reducing(r) && stops(r)).flatMap((r) => r.selectors));
    const missing = loops.flatMap((s) => [...(bySystem.has(s) ? [] : [`${s} (system setting)`]), ...(bySwitch.has(`${SWITCH} ${s}`) ? [] : [`${s} (AUGUR's switch)`])]);
    expect(missing).toEqual([]);
  });
});
