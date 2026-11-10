---
"@augur/app-kit": minor
"@augur/kit-bundle": patch
---

Three layout parts for inside an app's main column, on the app contract too: `Stack` (`quill-stack`, children one above another, `gap` tight, normal, loose or section), `Split` (`quill-split`, a main part and an `aside` that keeps at least part-min-width and goes under the main part by itself when there isn't room) and `Grid` (`quill-grid`, as many columns as fit, each at least part-min-width). They space their children only with the layout tokens and pad nothing outside themselves. Add only. The remote allowlist is regenerated.
