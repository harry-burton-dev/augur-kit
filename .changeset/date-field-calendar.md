---
'@augur/app-kit': minor
---

DateField counts days with @internationalized/date and opens a real calendar (React Aria's, in the person's language) instead of the browser's hidden date input. Same props. A month on from 31 January is now 28 February, not 3 March, and days that don't exist, such as 31/02, are refused.

PeoplePicker no longer puts `aria-expanded` on its text box, which axe rates critical; the box now points at what it found with `aria-controls`. New Storybook stories (Quill / Writing kit) show the picker on a stand-in for identity's directory search, and the date field's states.
