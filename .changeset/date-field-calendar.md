---
'@augur/app-kit': minor
---

DateField counts days with @internationalized/date and opens a real calendar (React Aria's, in the person's language) instead of the browser's hidden date input. Same props. A month on from 31 January is now 28 February, not 3 March, and days that don't exist, such as 31/02, are refused.
