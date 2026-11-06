---
'@augur/shell-kit': minor
---

The shell menu (what you see when you summon the Shell and look up) is built from parts, each with its own Storybook page in the Carbon structure: `ShellMenu` (the sky), `MenuArc`, `MenuCaption`, `MenuView`, `MenuEsc`, `MenuUndo`, and what goes in a view (`NotificationRow`, `MenuRow`, `MenuGroup`, `AgentMark`, `AppTiles`, `AppTile`, `MenuSearch`, `MenuPair`, `MenuSwitch`, `MenuChoice`, `MenuKeys`, `MenuWho`, `MenuNote`, `MenuSkeleton`, `MenuRetry`, `MenuTools`, `MenuLink`). Each draws only what its own props say; icons are Common icon names. The Shell now puts its menu together from these parts, and draws exactly the same markup as before, so nothing looks or behaves differently. `arcOrder` and `arcSlot` place functions on the arc. The sample content lives in `shell-menu.fixture.tsx`, which isn't built.
