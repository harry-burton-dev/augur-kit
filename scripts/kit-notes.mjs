#!/usr/bin/env node
// The notes of the GitHub release kit@<version>: what is in the bundle, how to check it, and the
// changelog of each part at the version the bundle carries.
//   node scripts/kit-notes.mjs <version>
import { existsSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** One version's section of a Changesets CHANGELOG.md, without its heading. */
export function section(changelog, version) {
  const lines = changelog.split('\n');
  const start = lines.findIndex((l) => l.trim() === `## ${version}`);
  if (start < 0) return '';
  const end = lines.findIndex((l, i) => i > start && /^## /.test(l));
  return lines.slice(start + 1, end < 0 ? undefined : end).join('\n').trim();
}

export function notes(kit, changelogs, repository) {
  const parts = Object.entries(kit.packages).map(([name, v]) => `| \`${name}\` | ${v} |`);
  const changes = Object.entries(changelogs)
    .map(([name, text]) => [name, section(text, name === '@augur/kit-bundle' ? kit.version : kit.packages[name])])
    .filter(([, text]) => text)
    .map(([name, text]) => `### ${name}\n\n${text}`);
  return [
    `The kit bundle ${kit.version}: ready-to-load ES modules and CSS that a deployment serves at \`<KIT_URL>${kit.version}/\` (ADR 0048 in the AUGUR repository).`,
    '',
    '| Part | Version |',
    '| --- | --- |',
    ...parts,
    '',
    `\`kit-${kit.version}.tgz\` is the bundle and \`kit.json\` names its import map entries and each file's hash. Both are signed with cosign keyless:`,
    '',
    '```sh',
    `cosign verify-blob kit.json --bundle kit.json.sigstore.json --certificate-oidc-issuer https://token.actions.githubusercontent.com --certificate-identity https://github.com/${repository}/.github/workflows/release.yml@refs/heads/main`,
    '```',
    '',
    ...(changes.length ? ['## Changes', '', ...changes] : []),
  ].join('\n');
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const version = process.argv[2];
  const kit = JSON.parse(readFileSync('packages/kit-bundle/dist/kit.json', 'utf8'));
  if (kit.version !== version) throw new Error(`The built kit is ${kit.version}, not ${version}: build first.`);
  const changelogs = Object.fromEntries(
    [['@augur/kit-bundle', 'kit-bundle'], ['@augur/kit-common', 'kit-common'], ['@augur/app-kit', 'app-kit']]
      .filter(([, dir]) => existsSync(`packages/${dir}/CHANGELOG.md`))
      .map(([name, dir]) => [name, readFileSync(`packages/${dir}/CHANGELOG.md`, 'utf8')]),
  );
  console.log(notes(kit, changelogs, process.env.GITHUB_REPOSITORY ?? 'harry-burton-dev/augur-kit'));
}
