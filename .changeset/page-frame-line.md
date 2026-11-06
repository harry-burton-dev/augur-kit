---
'@augur/kit-common': minor
'@augur/app-kit': minor
---

The page frame in the Line look (picked 6 Nov 2026). The rail is drawn as the app bar's tiles, docked: an icon over its name, and a hard line on the rail's inner edge for the page you're on. One horizon runs across rail, page and drawer at the foot of the page's head, at the new token `frame-head`, so the title and the main action sit in the same place on every page.

- PageHead: a mono kind label, the title and summary on one line each, and the actions in a fixed slot. New `arrival` (where a link brought you from, and why; it shrinks to a Back key once `read`) and `selection` (a SelectionBar that takes the actions' slot while several things are picked). `trail` is deprecated (PDR-014: no breadcrumbs) but still drawn.
- AppFrame: new `drawerFor`. A new value (something picked) opens the drawer, or opens it over the page when the frame is narrow.
- SelectionBar: flat, with no blur or pill. In a head it sits on an ink line in the actions' slot; anywhere else it holds at the foot of the main column under an ink line.
- FrontPage: its plain head is a PageHead, and the heading may be a sentence of what changed, over up to two lines.
- Section headings use mono capitals.
- Storybook: `Quill/Page head` and `Patterns/Record page`. The directions page is gone.
