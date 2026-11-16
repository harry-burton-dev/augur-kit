---
'@augur/shell-kit': minor
'@augur/kit-common': minor
---

In a small window, the open app has the width. At 320 px (WCAG 2.2 Reflow) the rail, the floor picker's lane and the app pane's strip used to leave an app 88 px; it now has 236 px.

- Common: a new shell token, `window-small-below` (720 px), the width under which the window is small.
- The floor picker sits in the band at the right, showing the floor you're on. The other floors open under it, after the picker's usual wait.
- The app pane gives up its strip. Its dock image is a toggle at the band's right edge that opens the pane over the page, under the band, and stays there to close it. Closing it gives focus back to the toggle.
- The band keeps the floor's icon, the handle and the notification indicator (its dot). The clock, the floor's name and the app's name leave the band: the device shows the time, and the picker and the rail's lit tile say the names.
- The app bar's narrow rail uses the same token, and a test keeps the CSS's media queries on it.
- Storybook: `Aerie/Shell`, Small window.
