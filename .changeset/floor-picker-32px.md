---
'@augur/kit-common': patch
'@augur/shell-kit': patch
---

Floor picker: its boxes are 32px (token `gauge-notch`), Endstate's box size, up from 28px. The picker's lane (`gauge-lane`) grows with it, so the open app ends 4px further left.
