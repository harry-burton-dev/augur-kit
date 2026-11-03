# @augur/kit-bundle

The kit as a deployment serves it (ADR 0048 in the AUGUR repository). `pnpm build` writes `dist/`:

| Path | What it is |
| --- | --- |
| `<module>.js`, `chunks/` | One ES module for each shared specifier: `react`, `react/jsx-runtime`, `react/jsx-dev-runtime`, `react-dom`, `react-dom/client`, `@augur/kit-common`, `@augur/app-kit` |
| `dev/` | The same with React's development build, for a shell's dev server |
| `tokens.css`, `kit-common.css`, `app-kit.css` | The CSS every page links, in that order |
| `kit.json` | The version, what is in it, the import map entries, the stylesheets and every file's hash |

The specifiers are the React and kit entries of `sharedModules` in AUGUR's `@augur/mfe-sdk`; AUGUR's tests
fail when the two disagree. Aerie is not in the bundle: the shell builds it in, since apps never use it.

A page loads it with an import map whose entries are `<KIT_URL><version>/<file>`, and whose `integrity`
entries are the hashes from `kit.json`, so a CDN in front of `KIT_URL` can't serve anything else.

```json
{
  "schema": "augur.kit/v1",
  "version": "0.1.0",
  "packages": { "react": "19.3.1", "react-dom": "19.3.1", "@augur/kit-common": "0.2.0", "@augur/app-kit": "0.3.0" },
  "imports": { "react": "react.js", "@augur/app-kit": "app-kit.js", "...": "..." },
  "styles": ["tokens.css", "kit-common.css", "app-kit.css"],
  "dev": { "imports": { "react": "dev/react.js", "...": "..." }, "styles": ["..."] },
  "integrity": { "react.js": "sha384-...", "...": "..." }
}
```

The package's version is the kit's version. It moves whenever Common or Quill does (Changesets bumps it
as their dependent), or on its own when React moves. From Node, `import { kitDir, readKit } from
'@augur/kit-bundle'` gives the folder and its `kit.json`.
