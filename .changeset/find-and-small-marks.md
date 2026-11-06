---
'@augur/kit-common': minor
'@augur/app-kit': minor
---

Search, links, key caps and skeletons in the Key look, and busy in the Groove look (picked 6 Nov 2026). New in Common: `SearchField`, the one search field (a well with a find mark that matches as you type, a shortcut key shown while empty and Esc to clear once you write); `Link`, never underlined, ink words that lift as a soft key when pointed at, the same inside and outside AUGUR; `KeyCap`, a key to press drawn as a small real key, with `keys` for a combination; and `Skeleton`, empty wells in the shape of what is loading. A busy Button no longer spins: ink runs along its bottom edge, and a busy Toggle runs the same line under its switch. Menus, dialogs, side sheets and the first-run guide draw their keys as `KeyCap`. Quill's FilterBar and table filter, and Common's Activity, now use `SearchField`; the Palette keeps its own Rail field. No props removed; the `augur-spinner` class stays for apps that drew their own.
