import { useMemo, useState } from 'react';
import { Palette, type PaletteItem } from '@augur/app-kit';
import { FRAME_WORDS, paletteItems, type CommandSource, type FrameWords } from './frame.js';

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  /** The apps whose commands it offers, the open app first, each with what it has loaded and selected now. */
  sources: readonly CommandSource[];
  /** A command was chosen: the shell sends it to the app (`ctx.frame.onCommand`). */
  onRun: (app: string, command: string) => void;
  /** The keys the person gave a command, by app and command id ("Ctrl+Alt+N"), shown at the row's end. */
  keys?: Record<string, Record<string, string>>;
  /** The kit's words, where the shell or a deployment wants its own. */
  words?: Partial<FrameWords>;
}

/**
 * The command palette (spec 6.4): every command the apps declare, found by name or keyword, and run with
 * Enter. A command that can't run now stays in the list, locked, saying why ("Notes hasn’t loaded this
 * yet"), and choosing it does nothing. It is Quill's Palette, so it looks and moves the same as an app's
 * own; the shell wires the key that opens it (`isCommandKey`, with the binding it is given) and closes it once a command has run.
 */
export function CommandPalette({ open, onClose, sources, onRun, keys, words }: CommandPaletteProps) {
  const w = useMemo(() => ({ ...FRAME_WORDS, ...words }), [words]);
  const [query, setQuery] = useState('');
  const close = () => {
    setQuery('');
    onClose();
  };
  const items = useMemo(() => paletteItems(sources, query, keys, w), [sources, query, keys, w]);
  const pick = (item: PaletteItem) => {
    const at = item.id.indexOf(':');
    close();
    onRun(item.id.slice(0, at), item.id.slice(at + 1));
  };
  return <Palette open={open} onClose={close} placeholder={w.palette} lead={w.paletteLead} query={query} onQuery={setQuery} items={items} onPick={pick} none={w.paletteNone} found={w.found} />;
}

/**
 * The palette's key unless the shell is given another (a deployment or person setting): Ctrl+Shift+P, or
 * ⌘⇧P, as in most editors. Firefox keeps Ctrl+Shift+P for a private window, so a shell that serves Firefox
 * should offer people another binding. Ctrl or ⌘ K stays the shell's.
 */
export const COMMAND_KEY = 'Mod+Shift+P';

/**
 * Whether a key press is a binding such as "Mod+Shift+P" or "Alt+Shift+P" (Mod is Ctrl, or ⌘ on a Mac;
 * every modifier not named must be up).
 */
export function isCommandKey(e: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'shiftKey' | 'altKey'>, binding: string = COMMAND_KEY): boolean {
  const parts = binding.split('+').map((p) => p.trim().toLowerCase());
  const key = parts.pop();
  if (!key) return false;
  const mod = parts.includes('mod');
  const ctrl = parts.includes('ctrl');
  const meta = parts.includes('meta') || parts.includes('cmd');
  const wantsCtrlOrMeta = mod ? e.ctrlKey || e.metaKey : true;
  return (
    wantsCtrlOrMeta &&
    (mod || e.ctrlKey === ctrl) &&
    (mod || e.metaKey === meta) &&
    e.shiftKey === parts.includes('shift') &&
    e.altKey === parts.includes('alt') &&
    e.key.toLowerCase() === key
  );
}
