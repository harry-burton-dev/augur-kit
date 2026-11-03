#!/usr/bin/env node
// How many changesets wait to bump a package. Changesets counts an empty changeset as pending, which
// would hold every release until the next Version packages pull request; the Release workflow uses
// this count instead, so only a real bump holds it.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

/** True when a changeset's front matter names at least one package. */
export const bumps = (text) => Boolean(/^---\r?\n([\s\S]*?)\r?\n?---/.exec(text)?.[1].trim());

export const pending = (dir = '.changeset') =>
  readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'README.md' && bumps(readFileSync(join(dir, f), 'utf8'))).length;

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) console.log(pending());
