---
"@augur/app-kit": minor
"@augur/kit-common": minor
---

Quill's remote vocabulary gains what admin screens need: `quill-dialog` (its work done in the sandbox: a submit sends the fields' values and the dialog waits, busy, until the app closes it or says why not), `quill-ask-twice`, `quill-choice`, `quill-checkbox-group`, `quill-date-field`, `quill-tag-picker`, `quill-steps`, `quill-progress` and `quill-status`. Common's `Dialog` takes `busy` and `error` from outside, for a dialog whose work is done elsewhere.
