---
'@augur/shell-kit': minor
---

The Shell's one-key shortcut (`) can be turned off in Settings ("Open with `"), and a text field keeps a ` typed in it (WCAG 2.2, 2.1.4 Character Key Shortcuts). Ctrl or ⌘ K still works everywhere, except where the focused part takes it for itself with preventDefault. `ShellSettings.summonKey` is on unless false (`ShellModel.summonKeyOn`); a host that saves settings must save it too. The keys list says what opens the Shell.
