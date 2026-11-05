---
'@augur/app-kit': minor
---

Editor is built on Tiptap (AUGUR's ADR 0058), with the same props and the same Markdown. A mention sits in the text as one chip where it was written: the caret steps over it and one Backspace takes it out. Bold and italic show as themselves while writing; `- `, `1. ` and `> ` start a list, a numbered list or a quote, and the selection bar gains Numbered list. Pasted rich text keeps only bold, italic, lists and quotes. The engine loads with a dynamic import the first time a page shows an editor, so pages without one load nothing more. Prose reads with markdown-it (loaded the same way) and shows numbered lists too; web links show as their words.
