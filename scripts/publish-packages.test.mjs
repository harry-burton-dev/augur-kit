// node --test scripts/*.test.mjs (pnpm test:scripts)
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { aliasDependencies, distTag, isForbidden, libraries, plan, publishOrder, publishedManifest, publishedName, unsigned } from './publish-packages.mjs';

test('an @augur package publishes under the owner scope, lower-cased', () => {
  assert.equal(publishedName('@augur/mfe-sdk', 'Harry-Burton-Dev'), '@harry-burton-dev/augur-mfe-sdk');
  assert.throws(() => publishedName('lit', 'x'));
});

test('@augur dependencies become aliases; others are left alone', () => {
  assert.deepEqual(aliasDependencies({ '@augur/records': '^0.1.0', lit: '^3.3.0' }, 'acme'), {
    '@augur/records': 'npm:@acme/augur-records@^0.1.0',
    lit: '^3.3.0',
  });
  assert.deepEqual(aliasDependencies({ '@augur/records': 'npm:@acme/augur-records@^0.1.0' }, 'acme'), {
    '@augur/records': 'npm:@acme/augur-records@^0.1.0',
  });
});

test('the published manifest drops private, scripts and dev dependencies, and names the repository', () => {
  const out = publishedManifest(
    { name: '@augur/ui-kit', version: '1.8.0', private: true, scripts: { build: 'x' }, devDependencies: { vite: '1' }, dependencies: { lit: '^3' }, files: ['dist'], __directory: 'platform/packages/ui-kit' },
    { scope: 'acme', repository: 'acme/augur' },
  );
  assert.equal(out.name, '@acme/augur-ui-kit');
  assert.equal(out.private, undefined);
  assert.equal(out.scripts, undefined);
  assert.equal(out.devDependencies, undefined);
  assert.equal(out.__directory, undefined);
  assert.deepEqual(out.dependencies, { lit: '^3' });
  assert.deepEqual(out.repository, { type: 'git', url: 'git+https://github.com/acme/augur.git', directory: 'platform/packages/ui-kit' });
  assert.deepEqual(out.publishConfig, { registry: 'https://npm.pkg.github.com' });
});

test('main publishes as latest; a hotfix line gets its own dist-tag', () => {
  assert.equal(distTag('main'), 'latest');
  assert.equal(distTag(undefined), 'latest');
  assert.equal(distTag('release/augur-0.13'), 'release-augur-0.13');
  assert.equal(distTag('release/mfe-sdk-1.9'), 'release-mfe-sdk-1.9');
});

test('every package in packages/ is found', () => {
  const names = libraries().map(({ pkg }) => pkg.name);
  for (const name of ['@augur/kit-common', '@augur/app-kit', '@augur/shell-kit', '@augur/kit-bundle']) assert.ok(names.includes(name), name);
});

test('a 403 from the registry is told apart from other failures', () => {
  assert.ok(isForbidden({ stderr: 'npm error 403 403 Forbidden - GET https://npm.pkg.github.com/x - Permission permission_denied: read_package' }));
  assert.ok(isForbidden({ stderr: 'npm error code E403' }));
  assert.ok(!isForbidden({ stderr: 'npm error code E404' }));
  assert.ok(!isForbidden(new Error('ETIMEDOUT')));
});

const names = (libs) => libs.map(({ pkg }) => pkg.name);

test('kit-common is published first, and each package after the @augur packages it depends on', () => {
  const order = names(publishOrder(libraries()));
  assert.equal(order[0], '@augur/kit-common');
  for (const { pkg } of libraries()) {
    for (const dep of Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies }).filter((n) => order.includes(n))) {
      assert.ok(order.indexOf(dep) < order.indexOf(pkg.name), `${dep} before ${pkg.name}`);
    }
  }
});

test('the publish order keeps directory order where nothing depends, and refuses a cycle', () => {
  const lib = (name, deps = {}) => ({ directory: name, pkg: { name, version: '1.0.0', dependencies: deps } });
  assert.deepEqual(names(publishOrder([lib('@augur/b', { '@augur/c': '^1' }), lib('@augur/a'), lib('@augur/c')])), ['@augur/c', '@augur/b', '@augur/a']);
  assert.throws(() => publishOrder([lib('@augur/a', { '@augur/b': '^1' }), lib('@augur/b', { '@augur/a': '^1' })]), /depends on itself/);
});

/** A kit bundle package on disk, signed or not. */
function bundle(signed) {
  const directory = mkdtempSync(join(tmpdir(), 'kit-bundle-'));
  mkdirSync(join(directory, 'dist'));
  writeFileSync(join(directory, 'dist', 'kit.json'), '{}');
  if (signed) writeFileSync(join(directory, 'dist', 'kit.json.sigstore.json'), '{}');
  return { directory, pkg: { name: '@augur/kit-bundle', version: '0.7.0', dependencies: { '@augur/kit-common': '^0.21.0' } } };
}
const common = { directory: 'packages/kit-common', pkg: { name: '@augur/kit-common', version: '0.21.0' } };

test('only the kit bundle needs a signature', () => {
  assert.equal(unsigned(bundle(false)), true);
  assert.equal(unsigned(bundle(true)), false);
  assert.equal(unsigned(common), false);
});

test('every package is looked up before any is published', () => {
  const asked = [];
  const steps = plan([bundle(true), common], ({ pkg }) => {
    asked.push(pkg.name);
    return pkg.name === '@augur/kit-common';
  });
  assert.deepEqual(asked, ['@augur/kit-common', '@augur/kit-bundle']);
  assert.deepEqual(steps.map((s) => [s.pkg.name, s.action]), [['@augur/kit-common', 'skip'], ['@augur/kit-bundle', 'publish']]);
});

test('an unsigned bundle is refused, and then nothing is published', () => {
  assert.throws(() => plan([common, bundle(false)], () => false), /Not publishing anything: @augur\/kit-bundle@0.7.0 has no dist\/kit.json.sigstore.json/);
});

test('a dry run warns about an unsigned bundle instead of refusing it', () => {
  assert.deepEqual(plan([common, bundle(false)], () => false, { dryRun: true }).map((s) => s.action), ['publish', 'publish']);
});

test('an unsigned bundle already in the registry is not refused: it is skipped', () => {
  assert.deepEqual(plan([common, bundle(false)], () => true).map((s) => s.action), ['skip', 'skip']);
});

test('a 403 marks that package blocked; any other failure stops the run', () => {
  const forbidden = Object.assign(new Error('x'), { stderr: 'npm error code E403' });
  const steps = plan([common, bundle(true)], ({ pkg }) => {
    if (pkg.name === '@augur/kit-common') throw forbidden;
    return false;
  });
  assert.deepEqual(steps.map((s) => s.action), ['blocked', 'blocked'], 'the bundle depends on kit-common, so it waits too');
  assert.deepEqual(plan([common, { directory: 'x', pkg: { name: '@augur/other', version: '1.0.0' } }], ({ pkg }) => {
    if (pkg.name === '@augur/kit-common') throw forbidden;
    return false;
  }).map((s) => s.action), ['blocked', 'publish'], 'a package that does not depend on it still goes out');
  assert.throws(() => plan([common], () => { throw new Error('ETIMEDOUT'); }), /ETIMEDOUT/);
});

// The Release workflow, read as text: each step's `if`, by step name.
const workflow = readFileSync(new URL('../.github/workflows/release.yml', import.meta.url), 'utf8');
const stepIf = (name) => new RegExp(`- name: ${name}\\n\\s+(?:id: \\S+\\n\\s+)?if: (.+)`).exec(workflow)?.[1];

test('the release signs the kit when the bundle is not in the registry, whatever GitHub releases exist', () => {
  assert.equal(stepIf('Sign the kit'), 'steps.kit.outputs.sign');
  assert.match(workflow, /\n\s+if \[ "\$published" = "unpublished" \]; then echo "sign=\$v" >> "\$GITHUB_OUTPUT"; fi\n/);
});

test('a bundle this repository may not publish is not released', () => {
  assert.match(workflow, /if \[ "\$published" != "blocked" \] && ! gh release view "kit@\$v"/);
  assert.match(workflow, /if \[ "\$\(node scripts\/publish-packages.mjs status @augur\/kit-bundle\)" != "published" \]; then\n.+\n\s+exit 0\n/);
});

test('the release builds, type-checks and tests before it signs or publishes', () => {
  const at = (step) => workflow.indexOf(`- name: ${step}\n`);
  for (const step of ['Build', 'Typecheck', 'Test']) assert.ok(at(step) > 0 && at(step) < at('Sign the kit') && at(step) < at('Publish packages'), step);
  assert.match(workflow, /- name: Test\n\s+if: .+\n\s+run: pnpm test\n/);
});

test('the kit is released from the published package, not a fresh build', () => {
  assert.match(workflow, /\n\s+dist="\$\(node scripts\/publish-packages.mjs fetch @augur\/kit-bundle "\$RUNNER_TEMP\/published"\)\/dist"\n/);
  assert.doesNotMatch(workflow, /dist=packages\/kit-bundle\/dist/);
});
