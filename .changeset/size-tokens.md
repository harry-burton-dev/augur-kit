---
"@augur/kit-common": minor
"@augur/app-kit": patch
"@augur/shell-kit": patch
"@augur/kit-bundle": patch
---

Common has a `size` group: marks and glyphs (`mark-xs` to `glyph-lg`), small controls (`control-xs` to `control-lg`), list and table rows (`row`, `row-compact`, `cell`, `cell-compact`, `bar-row`) and the narrowest a column, card, tile, aside or menu goes. Sizes, not spaces: density never changes them. The kits' CSS uses them, so raw distances go from 193 to 65 (what is left is container and media query widths, effects and the shell's own drawings). Every value is the same as before. Aerie's PaneLayout frame now takes its parent's width by itself.
