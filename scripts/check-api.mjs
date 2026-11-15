#!/usr/bin/env node
// The public surface of Common and Quill, as API Extractor reports it, checked in CI, as AUGUR checks its
// libraries (its ADR 0052, scripts/check-api.mjs there). Within a major they only add (AGENTS.md).
//
// A package opts in with an api-extractor*.json beside its package.json (one per entry point); each writes a
// report to the package's etc/ folder, which is committed. Then:
//   - the report must match what the built types say (run `pnpm api:update` after changing an export);
//   - a pull request whose report takes a line away (an export removed, renamed or changed), or removes a
//     report, needs a breaking changeset of its own for that package: a minor while it is 0.x, as the kit has
//     released breaking changes so far, a major from 1.0, with a line "Breaking:" (or "Breaking (Quill):")
//     that says what apps must change; or, when nothing an app uses breaks (a widened type, say), any
//     changeset with a line "Not breaking:" and why.
//
// node scripts/check-api.mjs [update]   Needs the packages built (pnpm build). BASE_REF names the branch
// a pull request goes into; without it the changeset rule is skipped.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const PACKAGES = 'packages';
const RANK = { none: 0, patch: 1, minor: 2, major: 3 };

/**
 * The lines of a report that carry API, without comments (API Extractor's and the doc comments it copies) and
 * blank lines, each keyed by the declarations it sits in, so a member is told apart from the same text in
 * another interface, or in another arm (`} | {`) of the same type.
 */
export function apiLines(report) {
  const open = [];
  const keyed = [];
  for (const raw of report.split('\n')) {
    const l = raw.trim();
    if (!l || /^(\/\/|\/\*|\*|>|##)/.test(l) || l === '```' || l === '```ts') continue;
    const closes = /^[}\])]/.test(l);
    const opens = /[{[(]$/.test(l);
    if (closes && opens && open.length) open[open.length - 1] += ` ${l}`;
    else if (closes) open.pop();
    keyed.push([...open, l].join(' › '));
    if (opens && !closes) open.push(l);
  }
  return keyed;
}

/** What a report change is: none, an addition only, or a break (a line taken away or changed). */
export function change(before, after) {
  if (before === after) return 'none';
  if (before == null) return 'addition';
  const now = new Map();
  for (const l of apiLines(after)) now.set(l, (now.get(l) ?? 0) + 1);
  for (const l of apiLines(before)) {
    if (!now.get(l)) return 'break';
    now.set(l, now.get(l) - 1);
  }
  return 'addition';
}

/** The bump that may break a package at `version`: a minor while it is 0.x, a major from 1.0. */
export const breakingBump = (version) => (version.startsWith('0.') ? 'minor' : 'major');

/** The kit each package is, as a changeset's "Breaking (Quill):" names it. */
const KITS = { '@augur/kit-common': 'Common', '@augur/app-kit': 'Quill' };

/**
 * Whether a changeset's body has a `label` line ("Breaking:", "Breaking change:", "Breaking (Quill):") that
 * covers `name`: one that names kits in brackets covers only those.
 */
const says = (body, label, name) =>
  [...body.matchAll(new RegExp(`^\\s*(?:- )?${label}\\b([^:\\n]*):`, 'gm'))].some((m) => {
    const kits = /\(([^)]*)\)/.exec(m[1])?.[1];
    return !kits || kits.split(/,\s*|\s+and\s+/).some((k) => k === name || k === KITS[name]);
  });

/** The bump these changesets give a package, and whether one says it breaks or why it doesn't. */
export function pendingBump(changesets, name) {
  let bump = 'none';
  let breaking = false;
  let notBreaking = false;
  for (const text of changesets) {
    const front = /^---\r?\n([\s\S]*?)\r?\n?---/.exec(text);
    if (!front) continue;
    for (const line of front[1].split('\n')) {
      const m = /^\s*["']?([^"':]+)["']?\s*:\s*(patch|minor|major)\s*$/.exec(line);
      if (m && m[1] === name) {
        if (RANK[m[2]] > RANK[bump]) bump = m[2];
        const body = text.slice(front[0].length);
        if (says(body, 'Breaking', name)) breaking = true;
        if (says(body, 'Not breaking', name)) notBreaking = true;
      }
    }
  }
  return { bump, breaking, notBreaking };
}

/** What is missing for a break in a package at `version`, or null when its changesets cover it. */
export function breakProblem({ bump, breaking, notBreaking }, version) {
  if (bump !== 'none' && notBreaking) return null;
  const needed = breakingBump(version);
  if (RANK[bump] >= RANK[needed] && breaking) return null;
  return `a ${needed} changeset with a line "Breaking: <what apps must change>" (it has ${bump}${bump !== 'none' && !breaking ? ', with no Breaking: line' : ''})`;
}

/** Each package's API Extractor configs and the report each writes. */
export function reports(base = root) {
  const dir = join(base, PACKAGES);
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) => {
      const pkgDir = join(dir, d.name);
      if (!existsSync(join(pkgDir, 'package.json'))) return [];
      const { name, version } = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));
      return readdirSync(pkgDir)
        .filter((f) => /^api-extractor(\.[\w-]+)?\.json$/.test(f))
        .map((config) => {
          const text = readFileSync(join(pkgDir, config), 'utf8');
          const file = /"reportFileName"\s*:\s*"([^"]+)"/.exec(text)?.[1] ?? name.replace(/^@[^/]+\//, '');
          return { name, version, pkgDir, config, report: join(PACKAGES, d.name, 'etc', `${file}.api.md`) };
        });
    });
}

/** How the built types differ from the committed report: API Extractor leaves what it found in dist/api/. */
function reportDiff(report, pkgDir) {
  const found = join(pkgDir, 'dist', 'api', report.split('/').pop());
  if (!existsSync(found)) return '';
  try {
    execFileSync('diff', ['-u', join(root, report), found], { stdio: 'pipe', encoding: 'utf8' });
    return '';
  } catch (err) {
    return String(err.stdout ?? '').split('\n').slice(0, 60).join('\n');
  }
}

const git = (...args) => execFileSync('git', args, { cwd: root, stdio: 'pipe', encoding: 'utf8' });

/**
 * Each report that takes away from `baseRef` without the changeset that says so. A report the base has and this
 * branch doesn't (its config or entry point gone) takes everything away. Only the changesets this branch adds
 * or changes (committed or not) count: one already waiting on the base was written for another change.
 */
function breaks(baseRef, list) {
  // Compared with where this branch left the base, so what the base gained since isn't counted as taken away.
  let base;
  try {
    base = git('merge-base', baseRef, 'HEAD').trim();
  } catch {
    return [`${baseRef} isn't here to compare with: fetch it with its history (CI checks out with fetch-depth 0).`];
  }
  const atBase = new Set(git('ls-tree', '-r', '--name-only', base, '--', PACKAGES).split('\n').filter((f) => /^packages\/[^/]+\/etc\/[^/]+\.api\.md$/.test(f)));
  const here = new Set(list.map((r) => r.report));
  const gone = [...atBase].filter((r) => !here.has(r)).map((report) => {
    const file = join(dirname(dirname(report)), 'package.json');
    const pkg = JSON.parse(existsSync(join(root, file)) ? readFileSync(join(root, file), 'utf8') : git('show', `${base}:${file}`));
    return { name: pkg.name, version: pkg.version, report };
  });
  const changesets = [...git('diff', '--name-only', '--no-renames', '--diff-filter=AM', base, '--', '.changeset').split('\n'), ...git('ls-files', '--others', '--exclude-standard', '--', '.changeset').split('\n')]
    .filter((f) => f.endsWith('.md') && !f.endsWith('README.md') && existsSync(join(root, f)))
    .map((f) => readFileSync(join(root, f), 'utf8'));
  const problems = [];
  for (const { name, version, report } of [...list, ...gone]) {
    // A report never written is already a problem: its config's run failed above.
    if (here.has(report) && !existsSync(join(root, report))) continue;
    const before = atBase.has(report) ? git('show', `${base}:${report}`) : null;
    const after = here.has(report) ? readFileSync(join(root, report), 'utf8') : '';
    if (change(before, after) !== 'break') continue;
    const missing = breakProblem(pendingBump(changesets, name), version);
    if (missing) {
      problems.push(
        `${report} ${here.has(report) ? 'takes away or changes' : 'is gone, and with it'} what apps use, so ${name} needs ${missing} in this pull request. ` +
          `If nothing an app uses breaks, a changeset with a line "Not breaking: <why>" will do.`,
      );
    }
  }
  return problems;
}

function main() {
  const update = process.argv[2] === 'update';
  const problems = [];
  const bin = join(root, 'node_modules', '.bin', 'api-extractor');
  const list = reports();
  for (const { pkgDir, config, report } of list) {
    // A package's first report needs its etc/ folder.
    if (update) mkdirSync(join(root, report, '..'), { recursive: true });
    try {
      execFileSync(bin, ['run', '--config', config, ...(update ? ['--local'] : [])], { cwd: pkgDir, stdio: 'pipe', encoding: 'utf8' });
    } catch (err) {
      problems.push(`${report}: doesn't match the built types. Run pnpm build && pnpm api:update, and commit it.\n${err.stdout ?? ''}\n${reportDiff(report, pkgDir)}`.trim());
    }
  }

  const baseRef = process.env.BASE_REF;
  if (baseRef && !update) problems.push(...breaks(`origin/${baseRef}`, list));

  if (problems.length) {
    console.error(`API check failed:\n${problems.map((p) => `  ${p}`).join('\n')}`);
    process.exit(1);
  }
  console.log(`API ${update ? 'reports written' : 'check passed'}: ${list.map((r) => r.report).join(', ')}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main();
