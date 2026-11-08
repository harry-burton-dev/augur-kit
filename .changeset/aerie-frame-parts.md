---
'@augur/shell-kit': minor
'@augur/kit-common': minor
---

Aerie draws the frame round an app on the app contract's third major: a command palette over the commands apps declare (`isCommandKey`, Ctrl or ⌘ with Shift and P unless the shell passes another binding), the radial menu on the things an app marks with `data-thing`, the rail's places with what an app puts under them (capped, 50 unless the deployment says, with "and n more"; any path that leaves the app is dropped), and the About panel on the right. Commands an app can't run yet stay, locked, with the reason. The palette and the ring are Quill's: `@augur/app-kit` is now a peer of the shell kit, so the shell must load Quill's `kit.css` as well as Aerie's. Common gains the `about-panel` and `rail-under` shell tokens.
