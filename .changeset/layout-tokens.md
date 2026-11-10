---
"@augur/kit-common": minor
"@augur/shell-kit": patch
"@augur/app-kit": patch
"@augur/kit-bundle": patch
---

Layout tokens: what each space is for. `pane-inset-inline`, `pane-inset-top` and `pane-inset-bottom` for an app's main column, `region-inset-inline` and `region-inset-block` inside a side region, and `stack-tight`, `stack`, `stack-loose` and `section-gap` between siblings. Each points at a step of the spacing scale, and each is a Tailwind spacing utility too (`gap-stack`, `px-pane-inset-inline`).

Compact density is now in the tokens: a token's `$extensions.augur.compact` is its value under `data-density="compact"`, set on `<html>` for a person's preference or on any element, such as an app's pane, for an app's own choice. The larger steps come down one notch as before, and the layout tokens follow them.

The floor gauge's lane is a token (`gauge-lane`, from `gauge-notch` and `gauge-pinned`) in place of a sum written in shell.css. The About panel and Quill's drawer pad with the region tokens, so their heads line up. The kits' raw distances allowance comes down to what is left, 195.
