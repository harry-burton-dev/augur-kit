---
'@augur/shell-kit': minor
'@augur/kit-common': minor
---

The floor picker is the Ladder, in the app bar's language: a square box per floor on a rail, the brightest with a hard line at the edge where you are. It opens out only once the pointer has rested on it for a moment (the token `gauge-wait`), with a line that climbs its edge to show the wait; tabbing in opens it at once. Pointing at a floor where something waits shows what it is at once, and that floor's box pulses. Opened out, it says what waits on your other floors. Its gap from the shell's edge is one variable, `--gauge-right`. New tokens: `gauge-wait`, `gauge-words`. The token build finds the token files on Windows.
