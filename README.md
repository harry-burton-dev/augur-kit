# AUGUR kit

Part of AUGUR, which is proprietary; see `LICENSE`.

AUGUR's React UI kit, built and released apart from the platform (ADR 0046 in the AUGUR repository).

| Package | What it is | Who uses it |
| --- | --- | --- |
| `@augur/kit-common` | Common: the tokens (`packages/kit-common/tokens/`), the Tailwind theme built from them, and the parts both kits share | Quill and Aerie |
| `@augur/app-kit` | Quill: the kit apps build with | every app |
| `@augur/shell-kit` | Aerie: the shell's own kit | the shell only |
| `@augur/kit-bundle` | React, Common and Quill built into ready-to-load files, with `kit.json` | a deployment, which serves it at `KIT_URL` |

## Work on it

```sh
pnpm install
pnpm storybook        # the parts, at http://localhost:6007
pnpm lint && pnpm build && pnpm typecheck && pnpm test
pnpm changeset        # say what your change releases
```

`pnpm test` also draws every story and runs axe on it (`storybook/a11y.test.tsx`): a serious or critical
finding fails. Colour contrast needs a real browser, so it is checked in the Storybook's Accessibility panel.

## How it is released

1. Every pull request carries a changeset. CI lints, builds, typechecks and tests it; the Storybook goes to
   Chromatic when a part or a story changes (`CHROMATIC_PROJECT_TOKEN`).
2. On `main`, the Release workflow keeps a **Version packages** pull request open. Merging it is the release.
   The workflow opens it with the `RELEASE_TOKEN` secret, a fine-grained token with Contents and Pull
   requests write on this repository, so its CI runs too. Without that secret it can open it only when
   Settings → Actions → "Allow GitHub Actions to create and approve pull requests" is on; otherwise the run
   stays green, pushes the `changeset-release/main` branch and leaves a warning with the link to open the
   pull request by hand. Packages are published only when no changeset is waiting, so open and merge it
   soon after the changes it gathers.
3. Each package whose version is new is published to GitHub Packages as `@harry-burton-dev/augur-<name>`.
   AUGUR and app repositories alias it back to `@augur/<name>`.
4. When the bundle's version is new, the workflow signs its `kit.json` with cosign keyless (the signature
   names this repository's Release workflow on `main`) and puts the signature in the package before it is
   published. It also makes the GitHub release `kit@<version>`, a pre-release, with `kit-<version>.tgz`,
   `kit.json` and a signature of each.
5. AUGUR pins one kit version in its `release/kit.json`. Its release checks the signature and serves the
   bundle at `<KIT_URL><version>/`, and its contract tests run against it (ADR 0048).

## The kit bundle

See [packages/kit-bundle](packages/kit-bundle/README.md).
