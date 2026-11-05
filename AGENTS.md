# The AUGUR kit: notes for coding agents

This repository holds AUGUR's React UI kit (AUGUR's ADR 0046): Common (`@augur/kit-common`, with the three
token files), Quill (`@augur/app-kit`, for apps) and Aerie (`@augur/shell-kit`, the shell's own), their
Storybook, and the kit bundle (`@augur/kit-bundle`) that deployments serve at their kit URL (ADR 0048).
AUGUR itself, its ADRs and its guides are in the `augur` repository; read its AGENTS.md and the ADRs
there before changing what the kit promises.

## Where to look
- AUGUR's ADRs (`augur` docs/decisions), especially 0015 (React, Quill, Tailwind), 0016 (Storybook and
  Chromatic), 0046 (this repository) and 0048 (the kit bundle and `KIT_URL`).
- docs/app-patterns.md and docs/shell-principles.md in `augur`, for how parts look and behave.
- The task: its Linear issue (team PER, initiative AUGUR).

## Rules
- The same rules as AUGUR: names, limits and URLs come from config or props, never literals from chat;
  unavailable things stay visible and say why; a new dependency needs a record.
- Colours, durations and distances come only from the token files in `packages/kit-common/tokens/`
  (`common`, `shell`, `app`). `tokens-only.test.ts` fails on a raw one. New `floor-*` tokens must also be
  copied into the design tool (tell Harry). Icons come from Lucide.
- Quill and Common keep the SDK's promise: within a major, add, never remove or rename. A kit major is
  an SDK major. Aerie is the shell's own and only the shell uses it.
- Every pull request carries a changeset (`pnpm changeset`). Merging the Version packages pull request
  publishes the packages and, when the bundle moves, releases `kit@<version>` as a beta. A kit change
  reaches deployments only when an AUGUR pull request bumps `release/kit.json` there.
- `pnpm install`, then `pnpm lint`, `pnpm build`, `pnpm typecheck`, `pnpm test`. Nothing here needs a
  package token: the kit depends only on public packages.
- Merge your own pull request once CI is green, after merging fresh `origin/main` into it.
- Nothing in the repository names the tool that wrote it: no assistant trailers on commits or attribution
  in pull requests, and no links to private chats.
