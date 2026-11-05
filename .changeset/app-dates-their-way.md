---
"@augur/app-kit": minor
---

Quill writes dates the person's way (PER-323): `writeDate(when, options, formats)` and `useFormats()` read the shell's `ctx.formats` (AUGUR SDK 2.0), falling back to the browser's. The date field's words, the timeline's days and times, and a table's date column use them in place of `en-GB`; the timeline groups by day in their time zone. What a date field puts back to edit stays English, as it reads it.
