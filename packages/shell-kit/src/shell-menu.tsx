import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { Icon } from '@augur/kit-common';
import type { AgentStatus, NotificationLevel } from './shell-model.js';

/*
 * The shell menu: what you see when you summon the Shell and look up. The sky, the arc of functions with
 * the stream at its top, the one line that names what's focused, and the view that opens under it. Each
 * part draws only what its own props say; the Shell puts them together from its model, and the stories put
 * them together from sample data. They draw inside the Shell's root (`.aerie-shell`), which says whether
 * the menu is open and which view is showing.
 */

/** How the stream is: nothing heard, something heard, something that needs you, or offline. */
export type MenuMood = 'quiet' | 'some' | 'needs' | 'offline';

/** An icon-only control's name, shown under it on hover and focus (Common's hover name), so an icon is never the only clue. The control carries the name itself, so this is hidden from screen readers. */
export function HoverName({ children }: { children: ReactNode }) {
  return (
    <span className="augur-reason augur-name" aria-hidden="true">
      {children}
    </span>
  );
}

/** The names of a control that can't be used now: its label carries the reason, and its hover name shows it, so it stays and says why. */
export const unavailableNames = (label: string, unavailable: string) => ({ label: `${label}. ${unavailable}`, hover: `${label}: ${unavailable}` });

/* ---- the sky ---- */

export interface ShellMenuProps {
  /** Whether the menu is summoned. Closed, it stays drawn but hidden and inert, so it can fade in. */
  open: boolean;
  /** How the stream is, which tints the thread falling to the stream. */
  mood?: MenuMood;
  /** The dialog's name, for screen readers. */
  label?: string;
  /** Pressing the sky itself, outside every part: the Shell goes back a step, or closes. */
  onDismiss?: () => void;
  /** Keys pressed anywhere in the menu: the Shell moves along the arc, keeps Tab inside, and goes back on Esc. */
  onKeyDown?: (e: ReactKeyboardEvent<HTMLDivElement>) => void;
  /** The arc, the caption, the view, and the Esc hint. */
  children?: ReactNode;
}

/**
 * The sky: a modal layer that fades down from the top of the screen over the app, with a few stars, holding
 * the rest of the menu. It is a dialog while open. Pressing the sky outside every part calls `onDismiss`.
 */
export function ShellMenu({ open, mood = 'quiet', label = 'Shell', onDismiss, onKeyDown, children }: ShellMenuProps) {
  const onClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList?.contains('aerie-fade')) onDismiss?.();
  };
  return (
    <div className={`aerie-sky aerie-${mood}`} role="dialog" aria-modal="true" aria-label={label} aria-hidden={open ? 'false' : 'true'} inert={!open} onKeyDown={onKeyDown} onClick={onClick}>
      <div className="aerie-fade" />
      <div className="aerie-stars" />
      {children}
    </div>
  );
}

/* ---- the arc ---- */

/** One function on the arc: a round icon button with its name under it on hover and focus. */
export interface MenuArcItem {
  id: string;
  /** Its name, said and shown on hover. */
  label: string;
  /** One of Common's icon names, so the icon set can change in one place. */
  icon: string;
  /** Why it can't be used now. It stays on the arc, looks unavailable and says why; pressing it does nothing. */
  unavailable?: string;
}

/** The arc's order, left to right: the stream sits at the top, with half the functions either side. */
export function arcOrder(ids: string[]): string[] {
  const left = Math.floor(ids.length / 2);
  return [...ids.slice(0, left), 'stream', ...ids.slice(left)];
}

/** Where item i of an arc of `count` sits, with the stream at `stream`: both sides reach the same width, so an odd number of functions stays balanced. */
export function arcSlot(i: number, stream: number, count: number) {
  const right = count - 1 - stream;
  const reach = Math.max(stream, right);
  if (i < stream) return -(stream - i) * (reach / stream);
  if (i > stream) return (i - stream) * (reach / right);
  return 0;
}

export interface MenuArcProps {
  /** The functions, left to right. The stream goes in the middle by itself. */
  items: MenuArcItem[];
  /** The id that's open (`stream` or a function's), drawn lit while the rest step back. */
  lit?: string;
  /** Which button takes Tab (its place on the arc, the stream counted). The arrow keys move it. */
  focusIndex?: number;
  /** How the stream is, drawn in its orb. */
  mood?: MenuMood;
  /** What the stream's button says, such as "Notifications: 2 need you". */
  streamLabel?: string;
  /** A button on the arc took focus, at this place. */
  onFocusItem?: (index: number) => void;
  /** A button was pressed: `stream`, or a function's id. Never called for an unavailable one. */
  onOpen?: (id: string) => void;
}

/**
 * The arc: the functions on a shallow curve under the top of the screen, the stream's orb at its top with
 * a thread falling to it. Moving along it is the arrow keys (the Shell's); one button takes Tab.
 */
export function MenuArc({ items, lit, focusIndex = 0, mood = 'quiet', streamLabel = 'Notifications', onFocusItem, onOpen }: MenuArcProps) {
  const order = arcOrder(items.map((f) => f.id));
  const stream = order.indexOf('stream');
  return (
    <div className="aerie-dome">
      {order.map((id, i) => {
        const slot = arcSlot(i, stream, order.length);
        const style = { '--x': `calc(${slot} * min(112px, 15vw))`, '--y': `${Math.round(slot * slot * 10)}px`, '--i': Math.abs(i - stream) } as CSSProperties;
        const on = lit === id;
        const tabIndex = i === focusIndex ? 0 : -1;
        const onFocus = () => onFocusItem?.(i);
        if (id === 'stream') {
          return (
            <button key={id} className={`aerie-stream augur-control${on ? ' aerie-lit' : ''}`} style={style} tabIndex={tabIndex} aria-label={streamLabel} onFocus={onFocus} onClick={() => onOpen?.('stream')}>
              <span className="aerie-thread" />
              <span className={`aerie-orb aerie-${mood}`}>
                <i />
              </span>
              <HoverName>Notifications</HoverName>
            </button>
          );
        }
        const fn = items.find((f) => f.id === id)!;
        const names = fn.unavailable ? unavailableNames(fn.label, fn.unavailable) : undefined;
        return (
          <button
            key={id}
            className={`aerie-fn augur-control${on ? ' aerie-lit' : ''}`}
            style={style}
            tabIndex={tabIndex}
            aria-label={names ? names.label : fn.label}
            aria-disabled={fn.unavailable ? 'true' : undefined}
            onFocus={onFocus}
            onClick={() => !fn.unavailable && onOpen?.(fn.id)}
          >
            <Icon name={fn.icon} />
            <HoverName>{names ? names.hover : fn.label}</HoverName>
          </button>
        );
      })}
    </div>
  );
}

/* ---- the caption, the view, and the way back ---- */

export interface MenuCaptionProps {
  /** What's focused or open, in a word or a few. */
  title: string;
  /** One more line under it: the latest thing that needs you. */
  line?: string;
  /** Tints the title: green when something needs you, amber offline. */
  mood?: MenuMood;
}

/** The one line under the arc that names what's focused, or the view that's open. */
export function MenuCaption({ title, line, mood }: MenuCaptionProps) {
  return (
    <p className={mood ? `aerie-caption aerie-${mood}` : 'aerie-caption'}>
      <b>{title}</b>
      {line ? <span>{line}</span> : null}
    </p>
  );
}

export interface MenuViewProps {
  /** The view's name, for screen readers: the same as its caption. */
  label: string;
  /** What's in it: rows, groups, notes, a search, pairs. */
  children?: ReactNode;
}

/** A view, opened under the arc at the reading measure. Only a long view scrolls, with the kit's thin bar. */
export function MenuView({ label, children }: MenuViewProps) {
  return (
    <section className="aerie-view" aria-label={label}>
      {children}
    </section>
  );
}

export interface MenuEscProps {
  /** A view is open, so Esc goes back to the arc rather than closing. */
  back?: boolean;
  onPress?: () => void;
}

/** The hint at the foot of the menu: Esc, and what it does now. Pressing it does the same. */
export function MenuEsc({ back, onPress }: MenuEscProps) {
  return (
    <button className="aerie-esc" tabIndex={-1} onClick={onPress}>
      <kbd>Esc</kbd>
      {back ? 'Back' : 'Close'}
    </button>
  );
}

export interface MenuUndoProps {
  /** What was just done, such as "Cleared 3". */
  label: string;
  onUndo?: () => void;
}

/** What was just done, with Undo, for a while after it. */
export function MenuUndo({ label, onUndo }: MenuUndoProps) {
  return (
    <div className="aerie-undo" role="status">
      {label}
      <button className="aerie-link" onClick={onUndo}>
        Undo
      </button>
    </div>
  );
}

/* ---- what goes in a view ---- */

export interface MenuNoteProps {
  children: ReactNode;
  /** `busy` while it's catching up; `error` when it couldn't, said as an alert; `looking`, `late` or `failed` for a group still coming. */
  tone?: 'busy' | 'error' | 'looking' | 'late' | 'failed';
  /** Smaller, under a group. */
  small?: boolean;
  /** Tab can reach it, for a view with nothing else in it. */
  focusable?: boolean;
  /** It takes focus when the view opens. */
  first?: boolean;
}

/** A sentence in a view: all quiet, catching up, couldn't, nothing matches. */
export function MenuNote({ children, tone, small, focusable, first }: MenuNoteProps) {
  const cls = ['aerie-note', tone === 'error' ? 'aerie-error' : '', small ? 'aerie-small' : '', tone && tone !== 'error' && tone !== 'busy' ? `aerie-${tone}` : ''].filter(Boolean).join(' ');
  return (
    <p className={cls} role={tone === 'error' ? 'alert' : undefined} aria-busy={tone === 'busy' || tone === 'looking' ? 'true' : undefined} tabIndex={focusable ? 0 : undefined} data-first={first ? '' : undefined}>
      {children}
    </p>
  );
}

/** A grey bar where a row will be, while the view catches up. */
export function MenuSkeleton() {
  return <span className="aerie-skel" />;
}

export interface MenuRetryProps {
  onPress?: () => void;
  /** It takes focus when the view opens. */
  first?: boolean;
  children?: ReactNode;
}

/** Try again, after a view couldn't load. */
export function MenuRetry({ onPress, first, children = 'Try again' }: MenuRetryProps) {
  return (
    <button className="aerie-retry" data-first={first ? '' : undefined} onClick={onPress}>
      {children}
    </button>
  );
}

export interface MenuToolsProps {
  children?: ReactNode;
}

/** Links for the whole view, at its top right, such as "Clear the quiet ones". */
export function MenuTools({ children }: MenuToolsProps) {
  return <div className="aerie-tools">{children}</div>;
}

export interface MenuLinkProps {
  children: ReactNode;
  onPress?: () => void;
}

/** A quiet text button in a view. */
export function MenuLink({ children, onPress }: MenuLinkProps) {
  return (
    <button className="aerie-link" onClick={onPress}>
      {children}
    </button>
  );
}

export interface MenuGroupProps {
  /** The group's name, in the label face: an app, a kind of result. */
  name: string;
  /** How many are in it. */
  count?: number;
  /** Something in it needs you: the label turns green. */
  needs?: boolean;
  /** The person muted it: it says so beside the name. */
  muted?: boolean;
  /** A control at the group's end, such as its ⋯ menu. */
  end?: ReactNode;
}

/** A group's label over its rows: a name, a count, and maybe a control at the end. */
export function MenuGroup({ name, count, needs, muted, end }: MenuGroupProps) {
  const cls = `aerie-group aerie-label${needs ? ' aerie-needs' : ''}`;
  const counted = count ? (
    <>
      {' '}
      <b>{count}</b>
    </>
  ) : null;
  if (!end && !muted) {
    return (
      <div className={cls}>
        {name}
        {counted}
      </div>
    );
  }
  return (
    <div className={cls}>
      <span className="aerie-name">
        {name}
        {counted}
        {muted ? <span className="aerie-quiet">Muted</span> : null}
      </span>
      {end}
    </div>
  );
}

export interface MenuRowProps {
  /** The row's name, in bold. */
  title: ReactNode;
  /** One line under it. */
  detail?: ReactNode;
  /** Words at its end, such as "You're here" or "4 min". */
  meta?: ReactNode;
  /** An icon at its start. */
  icon?: string;
  /** Something drawn at its end in place of `meta`, such as an agent's status. */
  end?: ReactNode;
  /** It's where you are: marked, and said as the current location. */
  current?: boolean;
  /** It takes focus when the view opens. */
  first?: boolean;
  onPress?: () => void;
}

/** One row in a view that opens something: a result, an agent, a floor. The whole row is the button. */
export function MenuRow({ title, detail, meta, icon, end, current, first, onPress }: MenuRowProps) {
  return (
    <button className="aerie-row" aria-current={current ? 'location' : undefined} data-first={first ? '' : undefined} onClick={onPress}>
      {icon ? <Icon name={icon} /> : null}
      <span className="aerie-text">
        <b>{title}</b>
        {detail ? <span>{detail}</span> : null}
      </span>
      {end ?? (meta ? <span className="aerie-meta">{meta}</span> : null)}
    </button>
  );
}

export interface NotificationRowProps {
  title: string;
  /** Where it's from and what it's about, in one line. */
  detail?: string;
  /** How long ago, in the fewest words. */
  when?: string;
  /** How much it asks of you: `needs` draws the lead dot green. */
  level?: NotificationLevel;
  /** From a muted app, or quiet: it steps back. */
  muted?: boolean;
  /** The first thing that needs you: its dot pings. Only one row does. */
  pinging?: boolean;
  /** It takes focus when the view opens. */
  first?: boolean;
  /** Up to two buttons beside it. The first is drawn as the main one when it needs you. */
  actions?: { label: string }[];
  /** The row was pressed: open what it's about. */
  onOpen?: () => void;
  /** One of its buttons was pressed, by place. */
  onAct?: (index: number) => void;
  /** Dismissed, by its ✕ or the x key. */
  onDismiss?: () => void;
}

/** One notification in the stream: a lead dot, its title and line, how long ago, up to two actions, and ✕. The x key dismisses it. */
export function NotificationRow({ title, detail, when, level = 'info', muted, pinging, first, actions = [], onOpen, onAct, onDismiss }: NotificationRowProps) {
  return (
    <li className={`aerie-item${muted ? ' aerie-muted' : ''}`}>
      <button
        className={`aerie-row aerie-${level}${pinging ? ' aerie-first' : ''}`}
        data-first={first ? '' : undefined}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key.toLowerCase() !== 'x') return;
          e.preventDefault();
          onDismiss?.();
        }}
      >
        <span className="aerie-lead" />
        <span className="aerie-text">
          <b>{title}</b>
          <span>{detail}</span>
        </span>
        <span className="aerie-meta">{when}</span>
      </button>
      {actions.slice(0, 2).map((a, i) => (
        <button key={a.label} className={`aerie-act${i === 0 && level === 'needs' ? ' aerie-main' : ''}`} onClick={() => onAct?.(i)}>
          {a.label}
        </button>
      ))}
      <button className="aerie-x augur-control" aria-label={`Dismiss ${title}`} onClick={onDismiss}>
        <Icon name="close" size={16} />
        <HoverName>Dismiss</HoverName>
      </button>
    </li>
  );
}

const agentWords: Record<AgentStatus, string> = { needs: 'Needs you', failed: 'Failed', running: 'Running', waiting: 'Waiting', done: 'Done', idle: 'Idle' };

export interface AgentMarkProps {
  status: AgentStatus;
  /** The first agent that needs you, drawn a step forward. */
  next?: boolean;
}

/** How an agent is doing, in words with a shape for done and failed, so colour is never the only clue. */
export function AgentMark({ status, next }: AgentMarkProps) {
  return (
    <span className="aerie-agent" data-status={status} data-next={next ? '' : undefined}>
      <i aria-hidden="true">{status === 'done' ? <Icon name="check" size={14} /> : status === 'failed' ? <Icon name="error" size={14} /> : null}</i>
      {agentWords[status] ?? status}
    </span>
  );
}

export interface AppTilesProps {
  /** AppTiles. The arrow keys move between them. */
  children?: ReactNode;
}

/** The apps, as a grid of tiles. Left and right move between them, wrapping round. */
export function AppTiles({ children }: AppTilesProps) {
  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    const at = (e.target as HTMLElement).closest<HTMLElement>('.aerie-app');
    if (!step || !at) return;
    e.preventDefault();
    e.stopPropagation();
    const items = [...e.currentTarget.querySelectorAll<HTMLElement>('.aerie-app')];
    items[(items.indexOf(at) + step + items.length) % items.length]?.focus();
  };
  return (
    <div className="aerie-apps" role="list" onKeyDown={onKeyDown}>
      {children}
    </div>
  );
}

export interface AppTileProps {
  name: string;
  /** One of Common's icon names. */
  icon?: string;
  /** What it's for, in a few words. */
  line?: string;
  /** It's an AI app: its icon sits in a bubble. */
  ai?: boolean;
  /** It's the app that's open: it says so in place of its line. */
  now?: boolean;
  /** It takes focus when the view opens. */
  first?: boolean;
  onPress?: () => void;
}

/** One app in the grid: its icon, its name, and its line or "Open now". */
export function AppTile({ name, icon = 'apps', line, ai, now, first, onPress }: AppTileProps) {
  return (
    <button className="aerie-app" role="listitem" data-first={first ? '' : undefined} onClick={onPress}>
      {ai ? (
        <span className="aerie-bubble">
          <Icon name={icon} size={28} />
        </span>
      ) : (
        <Icon name={icon} size={32} />
      )}
      <b>{name}</b>
      {now ? <em>Open now</em> : line ? <span>{line}</span> : null}
    </button>
  );
}

export interface MenuSearchProps {
  /** What it searches, for screen readers. */
  label: string;
  placeholder?: string;
  value: string;
  onChange?: (value: string) => void;
  /** Enter was pressed: open the first result. */
  onEnter?: () => void;
}

/** The search field at the top of Find. */
export function MenuSearch({ label, placeholder, value, onChange, onEnter }: MenuSearchProps) {
  return (
    <div className="aerie-search">
      <Icon name="find" size={20} />
      <input type="search" aria-label={label} placeholder={placeholder} value={value} onChange={(e) => onChange?.(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onEnter?.()} />
    </div>
  );
}

export interface MenuPairProps {
  /** What it's about, on the left. */
  label?: ReactNode;
  /** The label's id, so a switch beside it can be named by it. */
  labelId?: string;
  /** A value in bold, on the right. */
  value?: ReactNode;
  /** Set on the version line, which draws its value quieter. */
  version?: boolean;
  /** In place of label and value: two things side by side, such as two links. */
  children?: ReactNode;
}

/** A line with something on each side: a setting and its switch, a name and its value. */
export function MenuPair({ label, labelId, value, version, children }: MenuPairProps) {
  return (
    <div className={`aerie-pair${version ? ' aerie-version' : ''}`}>
      {label !== undefined ? <span id={labelId}>{label}</span> : null}
      {value !== undefined ? <b>{value}</b> : null}
      {children}
    </div>
  );
}

export interface MenuSwitchProps {
  /** The id of the words that name it, usually its MenuPair's `labelId`. */
  labelledBy: string;
  on: boolean;
  onToggle?: () => void;
}

/** An on-off switch, named by the words beside it. */
export function MenuSwitch({ labelledBy, on, onToggle }: MenuSwitchProps) {
  return <button className="aerie-switch" role="switch" aria-labelledby={labelledBy} aria-checked={on ? 'true' : 'false'} onClick={onToggle} />;
}

export interface MenuChoiceProps {
  /** What's being chosen, for screen readers. */
  label: string;
  options: { id: string; label: string }[];
  /** The id that's chosen. */
  value: string;
  onChange?: (id: string) => void;
}

/** One of a few, side by side, the chosen one pressed. */
export function MenuChoice({ label, options, value, onChange }: MenuChoiceProps) {
  return (
    <div className="aerie-seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} aria-pressed={value === o.id ? 'true' : 'false'} onClick={() => onChange?.(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export interface MenuKeysProps {
  /** Each key, or keys, and what it does. */
  keys: { keys: string; does: string }[];
}

/** The keys that work in the menu, each beside what it does. */
export function MenuKeys({ keys }: MenuKeysProps) {
  return (
    <div className="aerie-keys">
      {keys.map((k) => (
        <KeyLine key={k.keys} {...k} />
      ))}
    </div>
  );
}

const KeyLine = ({ keys, does }: { keys: string; does: string }) => (
  <>
    <kbd>{keys}</kbd>
    <span>{does}</span>
  </>
);

export interface MenuWhoProps {
  name: string;
  /** One line under it, such as an email. */
  detail?: string;
}

/** Who's signed in, at the top of Account. */
export function MenuWho({ name, detail }: MenuWhoProps) {
  return (
    <div className="aerie-who">
      <b>{name}</b>
      {detail ? <span>{detail}</span> : null}
    </div>
  );
}
