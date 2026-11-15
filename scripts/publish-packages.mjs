#!/usr/bin/env node
// Publishes the kit's packages (every package in packages/ with a files list) to GitHub Packages, so
// AUGUR and apps in their own repositories can build against them (ADR 0046 in the AUGUR repository).
//
// GitHub's npm registry only takes packages scoped to the repository's owner, so @augur/<name> is
// published as @<owner>/augur-<name>. App repositories alias it back, and their imports don't change:
//   "@augur/mfe-sdk": "npm:@<owner>/augur-mfe-sdk@^1.9.0"
// The scope comes from PACKAGE_SCOPE, or else the repository's owner; the registry from PACKAGE_REGISTRY.
//
// node scripts/publish-packages.mjs [--dry-run]
// Run by the Release workflow once the Version packages PR has merged, after the packages are built and
// tested. A version that's already in the registry is skipped, so running it again does nothing. Every
// package is looked up before any is published, and they go out in dependency order (kit-common first).
// The kit bundle is refused without its signature: AUGUR can never take an unsigned one.
//
// node scripts/publish-packages.mjs status <@augur/name>
//   Prints whether that package's version is "published", "unpublished" or "blocked" (403). The Release
//   workflow signs the kit when the bundle is not in the registry yet, whatever GitHub releases exist.
// node scripts/publish-packages.mjs fetch <@augur/name> <dir>
//   Unpacks that package's version, as published, into <dir>/package: a kit release made after the
//   bundle went out uses the published bytes and their signature, not a fresh build.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const OWN_SCOPE = '@augur/';
export const DEFAULT_REGISTRY = 'https://npm.pkg.github.com';
const LIBRARIES = 'packages';

/** @augur/mfe-sdk → @<scope>/augur-mfe-sdk. */
export function publishedName(name, scope) {
  if (!name.startsWith(OWN_SCOPE)) throw new Error(`${name} isn't an ${OWN_SCOPE} package`);
  return `@${scope.toLowerCase()}/augur-${name.slice(OWN_SCOPE.length)}`;
}

/** An @augur dependency becomes an alias, so it installs under its own name in the consumer. */
export function aliasDependencies(deps, scope) {
  if (!deps) return deps;
  return Object.fromEntries(
    Object.entries(deps).map(([name, range]) =>
      name.startsWith(OWN_SCOPE) && !String(range).startsWith('npm:')
        ? [name, `npm:${publishedName(name, scope)}@${range}`]
        : [name, range],
    ),
  );
}

/** The package.json that goes into the registry, from the packed one. */
export function publishedManifest(pkg, { scope, registry = DEFAULT_REGISTRY, repository }) {
  const { private: _private, devDependencies: _dev, scripts: _scripts, ...rest } = pkg;
  const out = { ...rest, name: publishedName(pkg.name, scope) };
  for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
    if (pkg[field]) out[field] = aliasDependencies(pkg[field], scope);
  }
  // GitHub links a package to its repository through this field; it also sets who may read it.
  if (repository) out.repository = { type: 'git', url: `git+https://github.com/${repository}.git`, directory: pkg.__directory };
  delete out.__directory;
  out.publishConfig = { registry };
  return out;
}

/**
 * The npm dist-tag for a publish: main is "latest"; a hotfix on release/<unit>-<major>.<minor> gets its
 * own tag, so a patch to an older line never becomes what a fresh install picks.
 */
export function distTag(branch) {
  const line = /^release\/([a-z][a-z0-9-]*-\d+\.\d+)$/.exec(branch ?? '');
  return line ? `release-${line[1]}` : 'latest';
}

/** The packages to publish: every package directory in packages/ with a files list. */
export function libraries(root = '.') {
  const dir = join(root, LIBRARIES);
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(dir, d.name, 'package.json')))
    .map((d) => ({ directory: `${LIBRARIES}/${d.name}`, pkg: JSON.parse(readFileSync(join(dir, d.name, 'package.json'), 'utf8')) }))
    .filter(({ pkg }) => pkg.name?.startsWith(OWN_SCOPE) && Array.isArray(pkg.files));
}

/** The kit bundle carries kit.json's signature; without it AUGUR refuses the bundle and its version is lost. */
export const SIGNATURES = { '@augur/kit-bundle': 'dist/kit.json.sigstore.json' };

/** A package that must carry a signature and doesn't. */
export const unsigned = ({ directory, pkg }) =>
  Boolean(SIGNATURES[pkg.name]) && !existsSync(join(directory, SIGNATURES[pkg.name]));

const internal = (pkg) =>
  ['dependencies', 'peerDependencies', 'optionalDependencies'].flatMap((f) => Object.keys(pkg[f] ?? {})).filter((n) => n.startsWith(OWN_SCOPE));

/** The packages in publish order: each after the @augur packages it depends on, otherwise as found. */
export function publishOrder(libs) {
  const byName = new Map(libs.map((lib) => [lib.pkg.name, lib]));
  const out = [];
  const state = new Map();
  const visit = (lib) => {
    if (state.get(lib.pkg.name) === 'done') return;
    if (state.get(lib.pkg.name) === 'visiting') throw new Error(`${lib.pkg.name} depends on itself through other packages`);
    state.set(lib.pkg.name, 'visiting');
    for (const dep of internal(lib.pkg)) if (byName.has(dep)) visit(byName.get(dep));
    state.set(lib.pkg.name, 'done');
    out.push(lib);
  };
  libs.forEach(visit);
  return out;
}

/**
 * What a publish run will do, decided before anything goes out: each package is "skip" (already
 * published), "blocked" (403) or "publish". Throws, publishing nothing, when a package to publish
 * lacks its signature.
 */
export function plan(libs, published) {
  const steps = publishOrder(libs).map((lib) => {
    try {
      return { ...lib, action: published(lib) ? 'skip' : 'publish' };
    } catch (err) {
      if (!isForbidden(err)) throw err;
      return { ...lib, action: 'blocked' };
    }
  });
  const missing = steps.filter((s) => s.action === 'publish' && unsigned(s));
  if (missing.length) {
    throw new Error(`Not publishing anything: ${missing.map((s) => `${s.pkg.name}@${s.pkg.version} has no ${SIGNATURES[s.pkg.name]}`).join('; ')}. Sign it first (the Release workflow's Sign the kit step).`);
  }
  return steps;
}

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts });
}

/**
 * A 403 from the registry: this repository may not read or write that package. GitHub Packages ties
 * each package to the repositories given access to it, so a package first published from another
 * repository stays closed to this one until its owner adds it (package settings → Manage Actions access).
 */
export const isForbidden = (err) => /E403|403 Forbidden|permission_denied/.test(String(err?.stderr ?? err?.message ?? err));

function isPublished(name, version, npmrc, registry) {
  try {
    return run('npm', ['view', `${name}@${version}`, 'version', '--registry', registry, '--userconfig', npmrc]).trim() === version;
  } catch (err) {
    if (/E404|404 Not Found|is not in this registry/.test(String(err.stderr ?? err.message))) return false;
    throw err;
  }
}

function setup({ dryRun = false } = {}) {
  const repository = process.env.GITHUB_REPOSITORY;
  const scope = process.env.PACKAGE_SCOPE || process.env.GITHUB_REPOSITORY_OWNER || repository?.split('/')[0];
  const registry = process.env.PACKAGE_REGISTRY || DEFAULT_REGISTRY;
  if (!scope) throw new Error('Set PACKAGE_SCOPE (or run in GitHub Actions) to name the scope to publish under.');
  const token = process.env.NODE_AUTH_TOKEN;
  if (!token && !dryRun) throw new Error('NODE_AUTH_TOKEN must be a token that can write packages.');

  const work = mkdtempSync(join(tmpdir(), 'augur-packages-'));
  const npmrc = join(work, '.npmrc');
  writeFileSync(npmrc, `${new URL(registry).href.replace(/^https?:/, '')}:_authToken=${token ?? ''}\n`);
  return { repository, scope, registry, work, npmrc };
}

function find(name) {
  const lib = libraries().find(({ pkg }) => pkg.name === name);
  if (!lib) throw new Error(`${name} isn't a package in ${LIBRARIES}/`);
  return lib;
}

function status(name) {
  const { pkg } = find(name);
  const { scope, registry, npmrc } = setup();
  try {
    console.log(isPublished(publishedName(name, scope), pkg.version, npmrc, registry) ? 'published' : 'unpublished');
  } catch (err) {
    if (!isForbidden(err)) throw err;
    console.log('blocked');
  }
}

function fetch(name, dir) {
  if (!dir) throw new Error('usage: node scripts/publish-packages.mjs fetch <@augur/name> <dir>');
  const { pkg } = find(name);
  const { scope, registry, npmrc } = setup();
  mkdirSync(dir, { recursive: true });
  const spec = `${publishedName(name, scope)}@${pkg.version}`;
  const tarball = run('npm', ['pack', spec, '--pack-destination', dir, '--registry', registry, '--userconfig', npmrc]).trim().split('\n').pop();
  run('tar', ['-xzf', join(dir, tarball), '-C', dir]);
  console.log(join(dir, 'package'));
}

function publish() {
  const dryRun = process.argv.includes('--dry-run');
  const { repository, scope, registry, work, npmrc } = setup({ dryRun });
  const tag = distTag(process.env.GITHUB_REF_NAME);

  const steps = plan(libraries(), ({ pkg }) => !dryRun && isPublished(publishedName(pkg.name, scope), pkg.version, npmrc, registry));
  const done = [];
  // Packages this repository may not touch are skipped, so the rest (and the kit release) still go out;
  // the Release workflow fails at its end while any are left.
  const blocked = [];
  for (const { directory, pkg, action } of steps) {
    const name = publishedName(pkg.name, scope);
    if (action === 'skip') {
      console.log(`${name}@${pkg.version} is already published`);
      continue;
    }
    if (action === 'blocked') {
      blocked.push(`${name}@${pkg.version}`);
      continue;
    }
    // pnpm pack applies the files list and resolves workspace: ranges; the manifest is then rewritten.
    const out = join(work, pkg.name.slice(OWN_SCOPE.length));
    mkdirSync(out, { recursive: true });
    const tarball = run('pnpm', ['pack', '--pack-destination', out], { cwd: directory }).trim().split('\n').pop();
    run('tar', ['-xzf', tarball, '-C', out]);
    const manifestPath = join(out, 'package', 'package.json');
    const packed = JSON.parse(readFileSync(manifestPath, 'utf8'));
    writeFileSync(manifestPath, `${JSON.stringify(publishedManifest({ ...packed, __directory: directory }, { scope, registry, repository }), null, 2)}\n`);
    const args = ['publish', join(out, 'package'), '--tag', tag, '--registry', registry, '--userconfig', npmrc];
    if (dryRun) args.push('--dry-run');
    try {
      run('npm', args);
    } catch (err) {
      if (!isForbidden(err)) throw err;
      blocked.push(`${name}@${pkg.version}`);
      continue;
    }
    done.push(`${name}@${pkg.version}`);
  }
  console.log(done.length ? `Published (${tag}): ${done.join(', ')}` : 'Nothing new to publish');
  if (blocked.length) {
    const why = `This repository may not read or write ${blocked.join(', ')}: in each package's settings, add ${repository ?? 'this repository'} under Manage Actions access with the Write role.`;
    console.log(`::warning::${why}`);
    if (process.env.GITHUB_OUTPUT) writeFileSync(process.env.GITHUB_OUTPUT, `blocked=${blocked.join(' ')}\n`, { flag: 'a' });
    else process.exitCode = 1;
  }
}

function main() {
  const [mode, ...rest] = process.argv.slice(2);
  if (mode === 'status') status(rest[0]);
  else if (mode === 'fetch') fetch(rest[0], rest[1]);
  else publish();
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main();
