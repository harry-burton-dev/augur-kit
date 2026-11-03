import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { kitDir, readKit } from './index.js';
import { MODULES, sri } from './build.mjs';

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
