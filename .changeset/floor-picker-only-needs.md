---
'@augur/shell-kit': patch
---

The floor picker counts, glances at and pulses for only what needs you, as the app bar's lights do: a quiet notification, a muted app's, or one at the info, running, done or failed level no longer lights a floor. New `ShellModel.waitingOnFloors()` gives what waits on each floor; the glance keys its rows by notification id, so two with the same title both show.
