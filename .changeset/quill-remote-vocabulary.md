---
'@augur/app-kit': minor
'@augur/kit-common': minor
---

Quill's remote vocabulary for the app contract's third major (ADR 0076): `@augur/app-kit/remote` defines the `quill-*` elements an app's sandbox describes its screen with, and `QuillRemote` draws them on the host with the kit, dropping anything outside the vocabulary with a console reason. The allowlist ships as `@augur/app-kit/remote/allowlist.json`. `List` takes `virtual` for long lists, sized by Common's new `measure-list-virtual` token, and lists and tables from a sandbox draw only the rows in view from 200 rows.

Every property the vocabulary names states its shape down to the fields of a list's items, with the values an enum takes, and the host keeps only what fits. A part that fails to draw stops only itself. Common's `Icon` draws nothing for a name that isn't one of its own icons, such as `constructor`.
