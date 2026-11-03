import assert from 'node:assert/strict';
import { test } from 'node:test';
import { notes, section } from './kit-notes.mjs';

const changelog = '# @augur/app-kit\n\n## 0.4.0\n\n### Minor Changes\n\n- New part\n\n## 0.3.0\n\n- Older\n';

test('section takes one version, without its heading', () => {
  assert.equal(section(changelog, '0.4.0'), '### Minor Changes\n\n- New part');
  assert.equal(section(changelog, '0.3.0'), '- Older');
  assert.equal(section(changelog, '9.9.9'), '');
});

test('notes list the parts, how to verify, and each part at its bundled version', () => {
  const kit = { version: '0.2.0', packages: { react: '19.3.1', '@augur/app-kit': '0.4.0' } };
  const text = notes(kit, { '@augur/app-kit': changelog }, 'acme/augur-kit');
  assert.match(text, /\| `react` \| 19\.3\.1 \|/);
  assert.match(text, /certificate-identity https:\/\/github\.com\/acme\/augur-kit\/\.github\/workflows\/release\.yml@refs\/heads\/main/);
  assert.match(text, /### @augur\/app-kit\n\n### Minor Changes\n\n- New part/);
  assert.doesNotMatch(text, /Older/);
});
