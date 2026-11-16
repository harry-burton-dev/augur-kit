---
'@augur/shell-kit': minor
---

In a small window (under 720 px), the open app has the width. At 320 px (WCAG 2.2 Reflow) the rail, the floor picker's lane and the app pane's strip used to leave an app 88 px; it now has 236 px.

- The floor picker sits in the band at the right, showing the floor you're on. The other floors drop down under it when it opens.
- The app pane gives up its strip. Closed, it is its dock image, a button in the band that opens it over the page.
- The band keeps the notification indicator (its dot) and the clock. The floor's name and the app's name leave the band: the picker and the rail's lit tile say them.
- The app bar's narrow rail and these places share one width, 720 px (small-window.ts).
- Storybook: `Aerie/Shell`, Small window.
