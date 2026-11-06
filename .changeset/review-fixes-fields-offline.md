---
'@augur/app-kit': minor
'@augur/kit-common': minor
---

Fixes from the 6 November review.

A `Select` that is unavailable, read-only or busy no longer changes from the keyboard: arrow keys and typing on the closed field used to change its value and call `onChange`. A required `Select` no longer says "Needs you." straight after its first pick.

In a `Dialog` or `SideSheet`, Enter in a one-line `TextField`, `DateField` or `TimeField` now presses the primary, with what was just typed. Enter in a `PeoplePicker` only looks, and Esc on the Editor's mention list closes the list and not the Dialog. A second Enter in a `DateField` or `TimeField` no longer clears it.

A Dialog now collects `Checkbox` and `Toggle` as `'true'` or `'false'`, and `CheckboxGroup` as its ticked values joined with commas, so `onSubmit` and `onClose` can carry keys they didn't before. A required `TagPicker` or `CheckboxGroup` now holds the primary and asks with "Needs you."

`DateField` now honours `reason`, and `DropZone` takes one: each stays focusable and says why. Common exports `warnNoReason`.

With the browser offline, `useData` and `useChange` now try and fail in words, with `AppError` status 0, instead of pausing. `DataView` shows the offline state rather than loading for ever, and a Dialog waiting on a change is let go. A change made offline is not held for later. Loads run again when the connection returns. `DataView` no longer says it is loading while `enabled` is false: it shows `empty` if it has one, otherwise nothing.

A failed load of Markdown no longer blanks `Reader`: it shows the plain text, says so and offers a reload, the only thing that helps in Chromium. A failed load of the Editor stays in the Editor's place, with the same offer, instead of taking the app with it, and a required Editor still holds a Dialog's primary.

A disabled field no longer holds a Dialog's primary, with or without a reason, even when it is required and empty.

`Palette` keeps the chosen row in sight as the keys move it, and marks the row Enter will open when the list shrinks. A `Table` date in the future reads "in 3 d", not "just now" (`relativeTime`).
