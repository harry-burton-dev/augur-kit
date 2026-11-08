---
'@augur/app-kit': minor
'@augur/kit-common': minor
---

Quill's remote vocabulary for the app contract's third major (ADR 0076): `@augur/app-kit/remote` defines the `quill-*` elements an app's sandbox describes its screen with, and `QuillRemote` draws them on the host with the kit, dropping anything outside the vocabulary with a console reason. The allowlist ships as `@augur/app-kit/remote/allowlist.json`. `List` takes `virtual` for long lists, sized by Common's new `measure-list-virtual` token, and lists and tables from a sandbox draw only the rows in view from 200 rows.
