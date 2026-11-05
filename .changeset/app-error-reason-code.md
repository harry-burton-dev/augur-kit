---
'@augur/app-kit': patch
---

`AppError` reads a problem the way AUGUR's services send it: `reason` is the stable code (`forbidden`), now also `code`, and the message is `detail`. Before, a service's code became the message, so a refusal read "forbidden" rather than its sentence. A `reason` written as a sentence is still shown as the message.
