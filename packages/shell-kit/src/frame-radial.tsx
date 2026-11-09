import { useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { RadialMenu } from '@augur/app-kit';
import { FRAME_WORDS, radialActions, type CommandSource, type FrameThing, type FrameWords } from './frame.js';

/** How long a finger stays down before the menu opens, as a right-click does with a mouse. */
const LONG_PRESS = 550;

/** The thing marked nearest the event's target, inside the pane: `data-thing`, with its id and label. */
export function thingAt(from: EventTarget | null, pane: Element | null): { el: HTMLElement; thing: FrameThing } | undefined {
  const el = from instanceof Element ? from.closest<HTMLElement>('[data-thing]') : null;
  if (!el || !pane?.contains(el)) return undefined;
  const kind = el.dataset.thing ?? '';
  if (!kind) return undefined;
  const id = el.dataset.thingId;
  return { el, thing: { kind, label: el.dataset.thingLabel || el.textContent?.trim() || kind, ...(id ? { id } : {}) } };
}

export interface FrameRadialProps {
  /** The app whose pane this is: its commands, its radial actions, and what it has loaded and selected now. */
  source: CommandSource;
  /** An action was chosen: the shell sends the command to the app with the thing it was opened on. */
  onRun: (command: string, thing: FrameThing) => void;
  /** The kit's words, where the shell or a deployment wants its own. */
  words?: Partial<FrameWords>;
  /** The app's pane, as the shell draws it. */
  children?: ReactNode;
}

interface Opened {
  target: HTMLElement;
  point?: { x: number; y: number };
  thing: FrameThing;
}

/**
 * The radial menu on the things in an app's pane (spec 6.4; Shell principles, "Actions live on the
 * object"). The app draws a thing and marks it with its kind (`data-thing="note"`, with `data-thing-id` and
 * `data-thing-label`); right-click, the context-menu key, Shift+F10 or a long press on it opens Quill's
 * radial menu with the actions `contributes.radial` names for that kind, in their declared directions. An
 * action that can't run stays in the ring and says why, and its reasons follow what the app has loaded
 * while the menu is open. A thing that can't take focus is given `tabindex="-1"`, so focus goes back to it
 * when the menu closes. Anything not marked, or a kind with no actions, keeps the browser's own menu. The
 * app never draws the menu itself.
 */
export function FrameRadial({ source, onRun, words, children }: FrameRadialProps) {
  const pane = useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState<Opened | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pressed = useRef(false);
  const w = { ...FRAME_WORDS, ...words };
  // A long press opens the menu later: it reads what the app has loaded then, not when the press began.
  const latest = useRef({ source, w });
  latest.current = { source, w };

  const open = (from: EventTarget | null, point?: { x: number; y: number }) => {
    const at = thingAt(from, pane.current);
    if (!at) return false;
    if (!radialActions(at.thing.kind, latest.current.source, latest.current.w).length) return false;
    // The menu gives focus back to the thing when it closes, so the thing must be able to take it.
    if (at.el.tabIndex < 0 && !at.el.hasAttribute('tabindex')) at.el.tabIndex = -1;
    setOpened({ target: at.el, thing: at.thing, ...(point ? { point } : {}) });
    return true;
  };
  const stop = () => clearTimeout(timer.current);

  return (
    <div
      ref={pane}
      className="aerie-frame-pane"
      onContextMenu={(e: MouseEvent) => {
        // A part with its own menu (Quill's `ring`) already took this one: never open two.
        if (e.defaultPrevented) return;
        if (pressed.current || open(e.target, e.clientX || e.clientY ? { x: e.clientX, y: e.clientY } : undefined)) e.preventDefault();
      }}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.defaultPrevented) return;
        if ((e.key === 'ContextMenu' || (e.key === 'F10' && e.shiftKey)) && open(e.target)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onPointerDown={(e: PointerEvent) => {
        pressed.current = false;
        if (e.pointerType === 'mouse') return;
        const { target } = e;
        const point = { x: e.clientX, y: e.clientY };
        stop();
        timer.current = setTimeout(() => (pressed.current = open(target, point)), LONG_PRESS);
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onPointerLeave={stop}
      onClickCapture={(e: MouseEvent) => {
        // A long press opened the menu: the click that follows it shouldn't also open the thing.
        if (pressed.current) {
          pressed.current = false;
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      {children}
      {opened ? (
        <RadialMenu
          label={opened.thing.label}
          actions={radialActions(opened.thing.kind, source, w)}
          target={opened.target}
          {...(opened.point ? { point: opened.point } : {})}
          onAction={(id) => onRun(id, opened.thing)}
          onClose={() => setOpened(null)}
        />
      ) : null}
    </div>
  );
}
