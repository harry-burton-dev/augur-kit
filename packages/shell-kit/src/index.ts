/**
 * Aerie: the shell's own kit (ADR 0015): the water, the band, Orbit and the
 * title cards, and the shell's notices. Only the shell imports it
 * (`pnpm check:boundaries`), so it can change with the shell and is not part of
 * the SDK promise. The shell loads `@augur/shell-kit/kit.css`.
 */
export * from '@augur/kit-common';
export { Toasts, type ToastItem, type ToastsProps } from './toast.js';
export { AppUnavailable, type AppState, type AppUnavailableProps } from './app-unavailable.js';
export { Connection, type ConnectionState, type ConnectionProps } from './connection.js';
export { Shell, type ShellProps, type ShellElement } from './shell.js';
export { ShellMenu, MenuArc, MenuCaption, MenuView, MenuEsc, MenuUndo, MenuNote, MenuSkeleton, MenuRetry, MenuTools, MenuLink, MenuGroup, MenuRow, NotificationRow, AgentMark, AppTiles, AppTile, MenuSearch, MenuPair, MenuSwitch, MenuChoice, MenuKeys, MenuWho, arcOrder, arcSlot, type MenuMood, type ShellMenuProps, type MenuArcItem, type MenuArcProps, type MenuCaptionProps, type MenuViewProps, type MenuEscProps, type MenuUndoProps, type MenuNoteProps, type MenuRetryProps, type MenuToolsProps, type MenuLinkProps, type MenuGroupProps, type MenuRowProps, type NotificationRowProps, type AgentMarkProps, type AppTilesProps, type AppTileProps, type MenuSearchProps, type MenuPairProps, type MenuSwitchProps, type MenuChoiceProps, type MenuKeysProps, type MenuWhoProps } from './shell-menu.js';
export * from './shell-model.js';
export { CentreMenu, CentreMenuModel, searchMenu, type CentreMenuProps, type CentreMenuElement, type MenuCategory, type MenuItem, type MenuOption, type MenuVariant, type MenuBackground } from './centre-menu.js';
export { Water, resolveWave, wavePresets, DEFAULT_WAVE, type WaveMove, type WavePreset } from './water.js';
export * from './floors.js';
export { animate, finishMotion, liftGhost, moving, motionMode, reducedMotion, tokenValue, tokenEasing, type Ghost } from './motion.js';
