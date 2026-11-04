import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { kitDir, readKit } from './index.js';
import { MODULES, STYLES, sri } from './build.mjs';

// Run after `pnpm build`: checks the bundle it wrote.
const kit = readKit();

test('kit.json names this package version and every module', () => {
  assert.equal(kit.schema, 'augur.kit/v1');
  assert.equal(kit.version, JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version);
  assert.deepEqual(Object.keys(kit.imports), MODULES);
  assert.deepEqual(Object.keys(kit.dev.imports), MODULES);
});

test('every file it names is there, with the hash it gives', () => {
  const named = [...Object.values(kit.imports), ...Object.values(kit.dev.imports), ...kit.styles];
  for (const file of named) assert.ok(kit.integrity[file], `${file} has a hash`);
  for (const [file, hash] of Object.entries(kit.integrity)) assert.equal(sri(readFileSync(`${kitDir}${file}`)), hash, file);
});

test('React is bundled once: Quill imports the same React the import map serves', () => {
  const quill = readFileSync(`${kitDir}${kit.imports['@augur/app-kit']}`, 'utf8');
  assert.doesNotMatch(quill, /from\s*["']react["']/, 'no bare react import left');
});

test('it links the tokens, the typefaces and both kits\' parts, and serves every font file the typefaces name', () => {
  assert.deepEqual(kit.styles, STYLES.map(([name]) => name));
  const fonts = readFileSync(`${kitDir}fonts.css`, 'utf8');
  const urls = [...fonts.matchAll(/url\(\.\/([^)]+)\)/g)].map((m) => m[1]);
  assert.ok(urls.length > 0, 'fonts.css names its files');
  for (const url of urls) assert.ok(kit.integrity[url], `${url} is served, with a hash`);
});
