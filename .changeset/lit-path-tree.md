---
'@augur/app-kit': minor
'@augur/kit-common': minor
---

The path tree lights the path you took. Rows beside it dim by how far they are from where you are (new tokens `path-dim-1`, `path-dim-2`, `path-dim-3` and `path-soft`), and come back to full strength on hover and focus. The path's rows stay pinned to the top of the rail as its breadcrumb (`pinned`, default 3); on a deeper path the middle folds into one "…" row that says how many levels it holds and opens them. A node can say what inside needs the person (`needsYou`): the row glows, shows the sentence and reads it as its description, and a closed or folded row does the same for what's inside it. The current row is now `aria-current="location"`, a locked row's reason is read as its description, and ← on the current row or Backspace walks back up the path.
