import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apiLines, breakProblem, breakingBump, change, pendingBump, reports } from './check-api.mjs';

const report = (body) => `## API Report File for "@augur/x"\n\n\`\`\`ts\n${body}\n\n// (No @packageDocumentation comment for this package)\n\`\`\`\n`;

test('an addition only adds; a removed or changed line breaks', () => {
  const before = report('// @public\nexport interface A {\n    id: string;\n}');
  assert.equal(change(before, before), 'none');
  assert.equal(change(null, before), 'addition');
  assert.equal(change(before, report('// @public\nexport interface A {\n    // (undocumented)\n    id: string;\n    name?: string;\n}')), 'addition');
  assert.equal(change(before, report('// @public\nexport interface A {\n    id?: string;\n}')), 'break');
  assert.equal(change(before, report('// @public\nexport const b: number;')), 'break');
});

test('a member taken from one interface breaks even when another has the same line', () => {
  const two = (a, b) => report(`// @public\nexport interface A {\n${a}}\n\n// @public\nexport interface B {\n${b}}`);
  assert.equal(change(two('    label: string;\n', '    label: string;\n'), two('', '    label: string;\n')), 'break');
  assert.equal(change(two('    label: string;\n', ''), two('', '    label: string;\n')), 'break');
  assert.equal(change(two('    label: string;\n', ''), two('    label: string;\n', '    label: string;\n')), 'addition');
  const arms = (x, y) => report(`export type X = {\n    a: string;\n} | {\n${x}};\nexport type Y = {\n    c: string;\n} | {\n${y}};`);
  assert.equal(change(arms('    b: number;\n', ''), arms('', '    b: number;\n')), 'break');
  assert.equal(change(report('export interface A {\n    /** Old words. */\n    id: string;\n}'), report('export interface A {\n    /** New words. */\n    id: string;\n}')), 'addition');
  assert.deepEqual(apiLines(report('export function f(input: {\n    a: string;\n}): void;\nexport const b: number;')), [
    'export function f(input: {',
    'export function f(input: { › a: string;',
    '}): void;',
    'export const b: number;',
  ]);
});

test('a break needs a minor while 0.x and a major from 1.0', () => {
  assert.equal(breakingBump('0.22.3'), 'minor');
  assert.equal(breakingBump('1.0.0'), 'major');
});

test('reads the bump pending changesets give a package, and their Breaking: and Not breaking: lines', () => {
  const sets = ['---\n"@augur/app-kit": minor\n"@augur/shell-kit": patch\n---\n\nAdds a thing.\n\n- Breaking (Quill): `useRack` takes an object.\n', "---\n'@augur/shell-kit': major\n---\n\nOther.\n"];
  assert.deepEqual(pendingBump(sets, '@augur/app-kit'), { bump: 'minor', breaking: true, notBreaking: false });
  assert.deepEqual(pendingBump(sets, '@augur/shell-kit'), { bump: 'major', breaking: false, notBreaking: false });
  assert.deepEqual(pendingBump(sets, '@augur/kit-common'), { bump: 'none', breaking: false, notBreaking: false });
  assert.equal(pendingBump(['---\n"@augur/app-kit": patch\n---\n\nWidens a type.\n\nNot breaking: id accepts more.\n'], '@augur/app-kit').notBreaking, true);
});

test('a Breaking: line that names a kit covers only that kit', () => {
  const both = (body) => [`---\n"@augur/kit-common": minor\n"@augur/app-kit": minor\n---\n\n${body}\n`];
  assert.equal(pendingBump(both('- Breaking (Common): a token is renamed.'), '@augur/kit-common').breaking, true);
  assert.equal(pendingBump(both('- Breaking (Common): a token is renamed.'), '@augur/app-kit').breaking, false);
  assert.equal(pendingBump(both('Breaking (Common, Quill): both change.'), '@augur/app-kit').breaking, true);
  assert.equal(pendingBump(both('Breaking: both change.'), '@augur/app-kit').breaking, true);
  assert.equal(pendingBump(both('Breaking change: both change.'), '@augur/app-kit').breaking, true);
  assert.equal(pendingBump(both('Not breaking (Quill): a widened type.'), '@augur/kit-common').notBreaking, false);
});

test('a break passes only with a breaking bump that says so, or a reason it is not one', () => {
  assert.equal(breakProblem({ bump: 'minor', breaking: true, notBreaking: false }, '0.22.3'), null);
  assert.equal(breakProblem({ bump: 'patch', breaking: false, notBreaking: true }, '0.22.3'), null);
  assert.match(breakProblem({ bump: 'patch', breaking: true, notBreaking: false }, '0.22.3'), /a minor changeset/);
  assert.match(breakProblem({ bump: 'minor', breaking: false, notBreaking: false }, '0.22.3'), /no Breaking: line/);
  assert.match(breakProblem({ bump: 'minor', breaking: true, notBreaking: false }, '1.2.0'), /a major changeset/);
  assert.match(breakProblem({ bump: 'none', breaking: false, notBreaking: false }, '0.22.3'), /it has none/);
});

test('Common and Quill report each of their TypeScript entry points', () => {
  assert.deepEqual(
    reports().map((r) => r.report).sort(),
    ['packages/app-kit/etc/app-kit-remote.api.md', 'packages/app-kit/etc/app-kit.api.md', 'packages/kit-common/etc/kit-common-tokens.api.md', 'packages/kit-common/etc/kit-common.api.md'],
  );
});
