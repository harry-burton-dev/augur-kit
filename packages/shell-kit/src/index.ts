/**
 * Aerie: the shell's own kit (ADR 0015): the app bar, the desktop's backgrounds
 * (a set to choose from), the band, the floor gauge, the title cards and the shell's notices. Only the shell imports it
 * (`pnpm check:boundaries`), so it can change with the shell and is not part of
 * the SDK promise. The shell loads `@augur/shell-kit/kit.css`.
 */
export * from '@augur/kit-common';
export { Toasts, type ToastItem, type ToastsProps } from './toast.js';
export { AppUnavailable, type AppState, type AppUnavailableProps } from './app-unavailable.js';
export { Connection, type ConnectionState, type ConnectionProps } from './connection.js';
export { Shell, type ShellProps, type ShellElement } from './shell.js';
export { ShellMenu, MenuArc, MenuCaption, MenuView, MenuEsc, MenuUndo, MenuNote, MenuSkeleton, MenuRetry, MenuTools, MenuLink, MenuGroup, MenuRow, NotificationRow, AgentMark, AppTiles, AppTile, MenuSearch, MenuPair, MenuSwitch, MenuChoice, MenuKeys, MenuWho, arcOrder, arcSlot, type MenuMood, type ShellMenuProps, type MenuArcItem, type MenuArcProps, type MenuCaptionProps, type MenuViewProps, type MenuEscProps, type MenuUndoProps, type MenuNoteProps, type MenuRetryProps, type MenuToolsProps, type MenuLinkProps, type MenuGroupProps, type MenuRowProps, type NotificationRowProps, type AgentMarkProps, type AppTilesProps, type AppTileProps, type MenuSearchProps, type MenuPairProps, type MenuSwitchProps, type MenuChoiceProps, type MenuKeysProps, type MenuWhoProps } from './shell-menu.js';
export { ShellBar } from './shell-bar.js';
export * from './shell-model.js';
export { Water, resolveWave, wavePresets, DEFAULT_WAVE, type WaveMove, type WavePreset } from './water.js';
export { AppBar, BarTile, BarDivider, RailBlock, RailPair, RailPages, StartMenu, StartMenuDivider, StartMenuItem, StartMenuFolder, useAppBar, type AppBarProps, type BarTileProps, type StartMenuProps, type StartMenuItemProps, type StartMenuFolderProps, type BarStop } from './app-bar.js';
export { Background, backgrounds, DEFAULT_BACKGROUND, type BackgroundProps, type BackgroundChoice, type GroundProps } from './background.js';
export { Horizon, type HorizonProps } from './background-horizon.js';
export { Flat, type FlatProps } from './background-flat.js';
export { WaterGround, type WaterGroundProps } from './background-water.js';
export * from './floors.js';
export { animate, finishMotion, liftGhost, moving, motionMode, reducedMotion, tokenValue, tokenEasing, type Ghost } from './motion.js';
export { CommandPalette, isCommandKey, COMMAND_KEY, type CommandPaletteProps } from './command-palette.js';
export { FrameRadial, thingAt, type FrameRadialProps } from './frame-radial.js';
export { RailPlaces, type RailPlacesProps } from './rail-places.js';
export { AboutPanel, type AboutPanelProps } from './about-panel.js';
export { FRAME_WORDS, UNDER_CAP, COMMAND_ICON, capUnder, commandReason, iconOf, insideApp, paletteId, paletteItems, placePath, radialActions, type CommandSource, type FrameAboutSection, type FrameCommand, type FramePlace, type FrameRadialEntry, type FrameThing, type FrameUnderItem, type FrameWords } from './frame.js';
