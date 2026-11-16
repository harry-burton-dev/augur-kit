---
'@augur/shell-kit': minor
'@augur/kit-common': minor
---

In a small window, the open app has the width. At 320 px (WCAG 2.2 Reflow) the rail, the floor picker's lane and the app pane's strip used to leave an app 88 px; it now has 236 px.

- Common: a new shell token, `window-small-below` (720 px), the width under which the window is small.
- The floor picker sits in the band at the right, showing the floor you're on. The other floors open under it, after the picker's usual wait.
- The app pane gives up its strip. Closed, it is its dock image, a toggle in the band that opens the pane under the band, over the page. Closing it gives focus back to the toggle.
- The band keeps the floor's icon, the handle and the notification indicator (its dot). The clock shows when it fits. The floor's name and the app's name leave the band: the picker and the rail's lit tile say them.
- The app bar's narrow rail uses the same token.
- Storybook: `Aerie/Shell`, Small window.
