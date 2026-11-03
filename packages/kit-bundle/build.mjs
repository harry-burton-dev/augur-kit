#!/usr/bin/env node
// Builds the kit bundle (ADR 0048 in the AUGUR repository): what a deployment serves under
// <KIT_URL><version>/ for the shell and every app to share through the import map.
//
//   dist/                 the production build: one ES module per shared specifier, their chunks, the CSS
//   dist/dev/             the same with React's development build, for a shell's dev server
//   dist/kit.json         the version, what is in it, the import map entries and every file's hash
//
// The specifiers are the React and kit entries of the SDK's sharedModules (@augur/mfe-sdk): AUGUR's
// tests fail when the two disagree. Aerie is not here: the shell builds it in, as apps never use it.
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'vite';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'dist');
const require = createRequire(import.meta.url);
const pkg = JSON.parse(readFileSync(join(here, 'package.json'), 'utf8'));

export const MODULES = [
  'react',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  'react-dom',
  'react-dom/client',
  '@augur/kit-common',
  '@augur/app-kit',
];

/** The CSS every page needs, in the order it is linked: the tokens, the typefaces, then Common's and Quill's parts. */
export const STYLES = [
  ['tokens.css', '@augur/kit-common/tokens.css'],
  ['fonts.css', '@augur/kit-common/fonts.css'],
  ['kit-common.css', '@augur/kit-common/kit.css'],
  ['app-kit.css', '@augur/app-kit/kit.css'],
];

/** react/jsx-runtime → react-jsx-runtime; @augur/app-kit → app-kit. */
const fileName = (specifier) => specifier.replace(/^@augur\//, '').replace(/\//g, '-');

/**
 * React ships as CommonJS, which Rollup turns into a module with only a default export. Each one is
 * served through a small module that names every export too, so `import { useState } from 'react'`
 * works from the import map.
 */
const commonJs = new Set(['react', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom', 'react-dom/client']);
const VIRTUAL = 'augur-kit:';
const namedExports = () => ({
  name: 'kit-named-exports',
  resolveId: (id) => (id.startsWith(VIRTUAL) ? `\0${id}` : undefined),
  load(id) {
    if (!id.startsWith(`\0${VIRTUAL}`)) return;
    const specifier = id.slice(VIRTUAL.length + 1);
    const names = Object.keys(require(specifier)).filter((n) => n !== 'default' && /^[A-Za-z_$][\w$]*$/.test(n));
    return `import * as all from '${specifier}';\nconst m = all.default ?? all;\nexport default m;\nexport const { ${names.join(', ')} } = m;\n`;
  },
});

async function bundle(mode, dir) {
  await build({
    configFile: false,
    logLevel: 'warn',
    root: here,
    mode,
    plugins: [namedExports()],
    publicDir: false,
    define: { 'process.env.NODE_ENV': JSON.stringify(mode) },
    build: {
      minify: mode === 'production',
      outDir: dir,
      emptyOutDir: true,
      target: 'es2022',
      rollupOptions: {
        input: Object.fromEntries(MODULES.map((s) => [fileName(s), commonJs.has(s) ? `${VIRTUAL}${s}` : s])),
        // Keep every export: the shell and apps import what they like from these.
        preserveEntrySignatures: 'strict',
        output: { entryFileNames: '[name].js', chunkFileNames: 'chunks/[name]-[hash].js' },
        // React Server Components' "use client" means nothing in a browser bundle.
        onwarn: (warning, warn) => (warning.code === 'MODULE_LEVEL_DIRECTIVE' ? undefined : warn(warning)),
      },
    },
  });
  return Object.fromEntries(MODULES.map((s) => [s, relative(out, join(dir, `${fileName(s)}.js`)).split(sep).join('/')]));
}

const files = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });

/** Subresource Integrity, as the import map's integrity entries and <link integrity> take it. */
export const sri = (bytes) => `sha384-${createHash('sha384').update(bytes).digest('base64')}`;

async function main() {
  rmSync(out, { recursive: true, force: true });
  const imports = await bundle('production', out);
  const devImports = await bundle('development', join(out, 'dev'));
  for (const [name, specifier] of STYLES) cpSync(require.resolve(specifier), join(out, name));
  // fonts.css names its files as fonts/<file>, next to it.
  cpSync(join(dirname(require.resolve('@augur/kit-common/fonts.css')), 'fonts'), join(out, 'fonts'), { recursive: true });
  const styles = STYLES.map(([name]) => name);

  const version = (name) => {
    // Not every package exports its package.json: walk up from its entry instead.
    for (let dir = dirname(require.resolve(name)); dir !== dirname(dir); dir = dirname(dir)) {
      try {
        const found = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
        if (found.name === name) return found.version;
      } catch {
        // no package.json here
      }
    }
    throw new Error(`Can't find ${name}'s version`);
  };
  const integrity = Object.fromEntries(
    files(out)
      .map((path) => [relative(out, path).split(sep).join('/'), path])
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, path]) => [name, sri(readFileSync(path))]),
  );
  const kit = {
    schema: 'augur.kit/v1',
    version: pkg.version,
    packages: Object.fromEntries(['react', 'react-dom', '@augur/kit-common', '@augur/app-kit'].map((n) => [n, version(n)])),
    imports,
    styles,
    dev: { imports: devImports, styles },
    integrity,
  };
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'kit.json'), `${JSON.stringify(kit, null, 2)}\n`);
  console.log(`Kit ${kit.version}: ${Object.keys(integrity).length} files, ${Object.entries(kit.packages).map(([n, v]) => `${n}@${v}`).join(', ')}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main();
