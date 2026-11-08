import { iconNames, type IconName } from '@augur/kit-common';
import type { PaletteItem, RingAction } from '@augur/app-kit';

/**
 * The frame the shell draws round an app on the app contract's third major (ADR 0075, 0076; spec 6.3, 6.4,
 * 6.8): what an app declares in its manifest's `contributes`, and what it fills at run time. The shapes
 * mirror the manifest; the shell hands them over as the registry served them.
 */

/** A command (`contributes.commands`): something the app can do by name. */
export interface FrameCommand {
  id: string;
  label: string;
  icon?: string;
  /** More words it is found by in the palette. */
  keywords?: string;
  /** When it is offered: always, with something selected, or on the app's screen. Always, if left out. */
  when?: 'always' | 'selection' | 'screen';
}

/** A radial action (`contributes.radial`): a command on the radial menu of a kind of thing. */
export interface FrameRadialEntry {
  /** A declared command's id. */
  command: string;
  /** The kind of thing, as the app marks it (`data-thing`). */
  on: string;
  /** Its direction in the ring, 0 to 7 clockwise from the top. */
  order?: number;
}

/** A place (`contributes.places`): one of the app's entries on the rail. */
export interface FramePlace {
  id: string;
  label: string;
  icon?: string;
  detail?: string;
  /** Where it opens, below the app's own address. `/<id>` if left out. */
  path?: string;
  /** The app fills what sits under it at run time (`ctx.frame.under`). */
  fills?: boolean;
}

/** One thing under a place, as the app sent it (`ctx.frame.under(placeId, items)`). */
export interface FrameUnderItem {
  label: string;
  icon?: string;
  detail?: string;
  /** Where it opens, below the app's own address. */
  path: string;
}

/** A section of the About panel (`contributes.about`). */
export interface FrameAboutSection {
  id: string;
  label: string;
  icon?: string;
}

/** A thing in an app's pane that has a radial menu: what the app marked on it. */
export interface FrameThing {
  /** Its kind (`data-thing`), as `contributes.radial` names it. */
  kind: string;
  /** The app's own id for it (`data-thing-id`), handed back with the command. */
  id?: string;
  /** What it is, read aloud and shown in the ring's middle (`data-thing-label`). */
  label: string;
}

/** One app's commands as the shell offers them now. */
export interface CommandSource {
  app: { id: string; name: string };
  commands: readonly FrameCommand[];
  radial?: readonly FrameRadialEntry[];
  /** The commands the app has a handler for right now (`ctx.frame.onCommand`). */
  handled: Iterable<string>;
  /** Something is selected in the app. */
  selection?: boolean;
  /** The app's screen is the one showing. */
  onScreen?: boolean;
}

/** The kit's words for the frame. A deployment or the shell can give its own. */
export const FRAME_WORDS = {
  notLoaded: (app: string) => `${app} hasn’t loaded this yet`,
  needsSelection: (app: string) => `Select something in ${app} first`,
  needsScreen: (app: string) => `Open ${app} to use this`,
  andMore: (n: number) => `and ${n} more`,
  about: (app: string) => `About ${app}`,
  aboutOpen: 'About',
  aboutClose: 'Close About',
  aboutEmpty: 'Nothing here yet',
  palette: 'Run a command',
  paletteLead: 'Do',
  paletteNone: 'No command matches. Try fewer words.',
  found: (n: number) => `${n} found`,
};
export type FrameWords = typeof FRAME_WORDS;

/** What sits under a place, unless the deployment says otherwise (spec 6.3). */
export const UNDER_CAP = 50;

/** The icon a command or a thing gets when the app names none the kit has. */
export const COMMAND_ICON: IconName = 'play';
const known = new Set<string>(iconNames);
/** An app's icon name, if the kit has it. */
export const iconOf = (name: string | undefined): IconName | undefined => (name && known.has(name) ? (name as IconName) : undefined);

/** Why a command can't run now, or nothing when it can (spec 6.4: unavailable stays and says why). */
export function commandReason(command: FrameCommand, source: CommandSource, words: FrameWords = FRAME_WORDS): string | undefined {
  const name = source.app.name;
  if (!new Set(source.handled).has(command.id)) return words.notLoaded(name);
  if (command.when === 'screen' && !source.onScreen) return words.needsScreen(name);
  if (command.when === 'selection' && !source.selection) return words.needsSelection(name);
  return undefined;
}

/** The palette's id for a command: the app's id and the command's (an app id has no colon). */
export const paletteId = (app: string, command: string) => `${app}:${command}`;

/**
 * The palette's rows: every app's commands that match every word typed, in the manifest's order, each one
 * that can't run kept and saying why. With more than one app, each app's first row carries its name.
 */
export function paletteItems(sources: readonly CommandSource[], query: string, keys: Record<string, Record<string, string>> = {}, words: FrameWords = FRAME_WORDS): PaletteItem[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const several = sources.length > 1;
  return sources.flatMap((source) => {
    const rows = source.commands.filter((c) => {
      const text = `${c.label} ${c.keywords ?? ''}`.toLowerCase();
      return terms.every((t) => text.includes(t));
    });
    return rows.map((c, i): PaletteItem => {
      const locked = commandReason(c, source, words);
      const meta = keys[source.app.id]?.[c.id];
      return {
        id: paletteId(source.app.id, c.id),
        label: c.label,
        icon: iconOf(c.icon) ?? COMMAND_ICON,
        // With several apps, each row also says whose it is: the group heading isn't read aloud.
        ...(several && i === 0 ? { group: source.app.name } : {}),
        ...(several ? { detail: source.app.name } : {}),
        ...(meta ? { meta } : {}),
        ...(locked ? { locked } : {}),
      };
    });
  });
}

const SLOTS = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'] as const;

/**
 * A kind of thing's radial actions, from `contributes.radial` in its declared order. Each names a declared
 * command; one that names none is never drawn (the registry refuses such a manifest). The thing it opens
 * on is what is selected. An action that can't run stays in the ring, dimmed, with its reason.
 */
export function radialActions(kind: string, source: CommandSource, words: FrameWords = FRAME_WORDS): RingAction[] {
  const byId = new Map(source.commands.map((c) => [c.id, c]));
  const used = new Set<string>();
  return (source.radial ?? [])
    .filter((r) => r.on === kind && byId.has(r.command))
    .map((r, i) => ({ r, i }))
    .sort((a, b) => (a.r.order ?? SLOTS.length + a.i) - (b.r.order ?? SLOTS.length + b.i))
    .flatMap(({ r }) => {
      const c = byId.get(r.command)!;
      if (used.has(c.id)) return [];
      used.add(c.id);
      // The menu is opened on a thing, so a command that needs something selected has it.
      const reason = commandReason(c, { ...source, selection: true }, words);
      const slot = r.order !== undefined ? SLOTS[r.order] : undefined;
      return [{ id: c.id, label: c.label, icon: iconOf(c.icon) ?? COMMAND_ICON, ...(slot ? { slot } : {}), ...(reason ? { disabled: true, reason } : {}) }];
    });
}

/** A path an app may send for something under a place: below its own address, never out of it. */
export function insideApp(path: string): boolean {
  if (path === '/') return true;
  if (!/^\/[A-Za-z0-9_.~%/-]*$/.test(path)) return false;
  // Every segment is a name: none empty (so never `//host`), none `.` or `..`, even percent-encoded.
  return path
    .slice(1)
    .split('/')
    .every((part, i, all) => {
      if (part === '') return i === all.length - 1 && all.length > 1;
      let name: string;
      try {
        name = decodeURIComponent(part);
      } catch {
        return false;
      }
      return name !== '.' && name !== '..' && !/[/\\?#]/.test(name);
    });
}

/** Where a place opens, below the app's own address. */
export const placePath = (place: FramePlace) => place.path ?? `/${place.id}`;

/** What sits under a place, cut at the cap, and how many more there are. */
export function capUnder<T>(items: readonly T[], cap: number = UNDER_CAP): { shown: T[]; more: number } {
  const n = Number.isFinite(cap) ? Math.max(0, Math.floor(cap)) : UNDER_CAP;
  return { shown: items.slice(0, n), more: Math.max(0, items.length - n) };
}
