#!/usr/bin/env node
// Quill's remote allowlist only grows within the app contract's major (ADR 0076): every app draws its screens
// with what it allows, so an element, property, field, value, event (or what it carries), mirror, slot or child kind it took away
// would break them. The check compares `packages/app-kit/remote-allowlist.json` with the baseline committed
// beside it, which records everything the allowlist has allowed:
//   - anything the baseline allows and the allowlist no longer does fails the check;
//   - an addition passes, but the baseline must record it (run `pnpm allowlist:update`), so it is held too;
//   - taking something away, for the contract's next major only, is `pnpm allowlist:update --breaking`, a
//     change to the baseline a reviewer sees.
//
// node scripts/check-allowlist.mjs [update [--breaking]]
import { readFileSync, writeFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const ALLOWLIST = 'packages/app-kit/remote-allowlist.json';
const BASELINE = 'packages/app-kit/remote-allowlist.baseline.json';

const show = (type) => JSON.stringify(type);
const PRIMITIVES = { scalar: ['string', 'icon', 'number', 'boolean', 'scalar'], string: ['string', 'icon'] };

/**
 * Why `after` no longer takes every value `before` took, as a list (empty when it still does). Types are
 * vocabulary.ts's RemoteType: a primitive name, or { enum }, { array }, { tuple }, { object, required },
 * { record, required } or { oneOf }.
 */
export function narrowed(at, before, after) {
  if (isDeepStrictEqual(before, after)) return [];
  if (typeof before === 'object' && before.oneOf) return before.oneOf.flatMap((b) => narrowed(at, b, after));
  if (typeof after === 'object' && after.oneOf) {
    return after.oneOf.some((a) => narrowed(at, before, a).length === 0) ? [] : [`${at} took ${show(before)}, now ${show(after)}`];
  }
  if (typeof after === 'string') {
    const takes = PRIMITIVES[after] ?? [after];
    if (typeof before === 'string' ? takes.includes(before) : Boolean(before.enum) && (after === 'string' || after === 'scalar')) return [];
    return [`${at} took ${show(before)}, now ${show(after)}`];
  }
  if (typeof before === 'string') return [`${at} took ${show(before)}, now ${show(after)}`];
  if (before.enum && after.enum) {
    const gone = before.enum.filter((v) => !after.enum.includes(v));
    return gone.length ? [`${at} no longer takes ${gone.map((v) => `“${v}”`).join(', ')}`] : [];
  }
  if (before.array && after.array) return narrowed(`${at}[]`, before.array, after.array);
  if (before.tuple && after.tuple) {
    if (before.tuple.length !== after.tuple.length) return [`${at} took ${before.tuple.length} values, now ${after.tuple.length}`];
    return before.tuple.flatMap((b, i) => narrowed(`${at}[${i}]`, b, after.tuple[i]));
  }
  if (before.object && after.object) {
    const was = new Set(before.required ?? []);
    return [
      ...Object.entries(before.object).flatMap(([f, b]) => (f in after.object ? narrowed(`${at}.${f}`, b, after.object[f]) : [`${at}.${f} was removed`])),
      ...(after.required ?? []).filter((f) => !was.has(f)).map((f) => `${at}.${f} is now required`),
    ];
  }
  if (before.record && after.record) {
    const wasRequired = before.required ?? {};
    const nowRequired = after.required ?? {};
    return [
      ...narrowed(`${at}.*`, before.record, after.record),
      // A field that was required may now be any field, so it holds what any field holds.
      ...Object.entries(wasRequired).flatMap(([f, b]) => narrowed(`${at}.${f}`, b, nowRequired[f] ?? after.record)),
      ...Object.keys(nowRequired).filter((f) => !(f in wasRequired)).map((f) => `${at}.${f} is now required`),
    ];
  }
  return [`${at} took ${show(before)}, now ${show(after)}`];
}

/** What `before` allowed that `after` doesn't, as a list (empty when `after` only adds). */
export function takenAway(before, after) {
  const gone = [];
  if (before.schema !== after.schema) gone.push(`the schema was ${before.schema}, now ${after.schema}`);
  for (const [name, was] of Object.entries(before.elements)) {
    const now = after.elements[name];
    if (!now) {
      gone.push(`<${name}> was removed`);
      continue;
    }
    // `part` is the host's own choice of what draws it; an app never names it.
    for (const [p, type] of Object.entries(was.properties)) {
      if (!(p in now.properties)) gone.push(`<${name}>’s property “${p}” was removed`);
      else gone.push(...narrowed(`<${name}>.${p}`, type, now.properties[p]));
    }
    // An event's detail is described in words, the only record of what it carries: a new description is a new detail.
    for (const [e, detail] of Object.entries(was.events)) {
      if (!(e in now.events)) gone.push(`<${name}>’s event “${e}” was removed`);
      else if (now.events[e] !== detail) gone.push(`<${name}>’s event “${e}” carried “${detail}”, now “${now.events[e]}”`);
    }
    for (const [e, p] of Object.entries(was.mirror ?? {})) {
      if (now.mirror?.[e] !== p) gone.push(`<${name}> no longer mirrors “${e}” into “${p}”`);
    }
    for (const s of was.slots ?? []) if (!(now.slots ?? []).includes(s)) gone.push(`<${name}>’s slot “${s}” was removed`);
    if (was.children && now.children !== was.children) gone.push(`<${name}> took ${was.children} as children, now ${now.children ?? 'none'}`);
  }
  return gone;
}

const read = (file) => JSON.parse(readFileSync(new URL(file, pathToFileURL(root)), 'utf8'));

function main() {
  const [command, flag] = process.argv.slice(2);
  const allowlist = read(ALLOWLIST);
  const baseline = read(BASELINE);
  const gone = takenAway(baseline, allowlist);
  if (command === 'update') {
    if (gone.length && flag !== '--breaking') {
      console.error(`Not updated: the allowlist takes away what apps use:\n${gone.map((g) => `  ${g}`).join('\n')}\nOnly for the app contract's next major: pnpm allowlist:update --breaking`);
      process.exit(1);
    }
    writeFileSync(new URL(BASELINE, pathToFileURL(root)), `${JSON.stringify(allowlist, null, 2)}\n`);
    console.log(`${BASELINE} now records the allowlist.`);
    return;
  }
  if (gone.length) {
    console.error(
      `Remote allowlist check failed: ${ALLOWLIST} takes away what ${BASELINE} allowed, and apps use:\n` +
        `${gone.map((g) => `  ${g}`).join('\n')}\n` +
        'Within the app contract’s major the allowlist only adds. Put it back, or, for the next major only, run pnpm allowlist:update --breaking.',
    );
    process.exit(1);
  }
  if (!isDeepStrictEqual(baseline, allowlist)) {
    console.error(`Remote allowlist check failed: ${BASELINE} doesn't record the allowlist's additions. Run pnpm allowlist:update and commit it.`);
    process.exit(1);
  }
  console.log(`Remote allowlist check passed: ${Object.keys(allowlist.elements).length} elements, nothing taken away.`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main();
