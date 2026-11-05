import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Dialog as AriaDialog, Modal, ModalOverlay } from 'react-aria-components';
import { Button } from './button.js';
import { Heading } from './heading.js';
import { kitDev } from './reason.js';

/** Where this urgent item stands among the others waiting: the shell shows one at a time, never stacked. */
export interface LetterboxQueue {
  /** This item's place, from 1. */
  position: number;
  /** How many urgent items are waiting, this one included. */
  total: number;
  /** The headline of the one that comes next, if there is one. */
  next?: string;
}

/** Who said they have seen it, and when. Acknowledging is not resolving: the item stays urgent until the system resolves it. */
export interface LetterboxAcknowledgement {
  /** Who acknowledged it, as people read it ("Lee Park"). */
  by: string;
  /** When, already formatted for people to read ("07:14"). */
  at: string;
}

/** What the letterbox bars above and below the frame carry. They hold information, never dead space. */
export interface LetterboxBars {
  /** Above the frame: the kind of item, the floor and the source. */
  top?: ReactNode;
  /** Below the frame: who has seen it and what will resolve it. */
  bottom?: ReactNode;
}

/**
 * How the frame is drawn.
 * - `solid`: the frame is its own surface over a blurred, darkened screen (the default).
 * - `see-through`: the bars are solid, like a cinema's, and the frame is a window onto the work behind it,
 *   softly out of focus, so you never lose where you were (W3.5b, pending Harry's review).
 */
export type LetterboxLook = 'solid' | 'see-through';

export interface LetterboxProps {
  open: boolean;
  /**
   * Step back: put the item back on the edge (`UrgentEdge`), where it stays until
   * it is resolved. Esc and the Step back control call it. Urgent is never
   * dismissed. Leave it out for something that must be answered first: Esc then
   * does nothing.
   */
  onStepBack?: () => void;
  /** Who has acknowledged it and when. Leave out while nobody has. */
  acknowledged?: LetterboxAcknowledgement;
  /** Record that the person has seen it. The key A does the same while focus is inside. Leave out where acknowledging isn't possible. */
  onAcknowledge?: () => void;
  /** What the bars above and below the frame say. */
  bars?: LetterboxBars;
  /** Where it stands among the urgent items waiting, shown in the top bar ("1 of 2 · next: …"). */
  queue?: LetterboxQueue;
  eyebrow?: string;
  heading: string;
  summary?: string;
  /** What the person can do about it: one primary, and whatever else they can do now. */
  actions?: ReactNode;
  /** The explanation, such as `Explain`. */
  children?: ReactNode;
  /**
   * What doesn't fit the frame: the frame never scrolls, so the rest waits behind a "More" control that
   * shows it in place. Long lists belong in the app that owns them (an action that opens it), not here.
   */
  more?: ReactNode;
  /** What the "More" control says. Default "More". */
  moreLabel?: string;
  /** How the frame is drawn. `solid` unless the app chose otherwise. */
  look?: LetterboxLook;
}

/** "1 of 2 · next: Backups are failing", for the top bar and the edge. */
export const queueText = ({ position, total, next }: LetterboxQueue) => `${position} of ${total}${next ? ` · next: ${next}` : ''}`;

let openCount = 0;

/** The shell holds one letterbox at a time; a second one open at once is a bug in the caller, so say so in development. */
function useOneAtATime(open: boolean) {
  useEffect(() => {
    if (!open) return;
    openCount += 1;
    if (openCount > 1 && kitDev()) console.warn('AUGUR kit: more than one Letterbox is open. Show one at a time and pass the rest as its queue (PDR-009).');
    return () => {
      openCount -= 1;
    };
  }, [open]);
}

const typing = (target: EventTarget | null) => target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

/**
 * Urgent is letterboxed (PDR-009): something urgent and important is shown in
 * a wide 2.39:1 frame (the `letterbox-ratio` token, never shorter than
 * `letterbox-min-frame`) across the middle of the screen, and everything above
 * and below it steps back behind the scrim. The bars above and below the frame
 * carry what the item is and where it stands: its kind, floor and source; its
 * place in the queue; whether anyone has acknowledged it; who has seen it and
 * what will resolve it.
 *
 * It has three verbs and no dismiss: step back (Esc) puts it on the edge,
 * acknowledge (A) records who saw it and when, and the actions act on it. It
 * goes away only when it is resolved. Focus stays inside while it's open.
 * Show one at a time; the others wait in `queue`. Use it rarely: for what can't wait.
 */
export function Letterbox({ open, onStepBack, acknowledged, onAcknowledge, bars, queue, eyebrow, heading, summary, actions, children, more, moreLabel = 'More', look = 'solid' }: LetterboxProps) {
  const id = useId();
  const moreId = `${id}-more`;
  const [showMore, setShowMore] = useState(false);
  useEffect(() => {
    if (!open) setShowMore(false);
  }, [open]);
  const headingId = `${id}-heading`;
  const summaryId = `${id}-summary`;
  const ackId = `${id}-ack`;
  const showsAck = Boolean(acknowledged || onAcknowledge);
  const describedBy = [summary ? summaryId : '', showsAck ? ackId : ''].filter(Boolean).join(' ') || undefined;
  useOneAtATime(open);

  // A acknowledges while focus is anywhere inside, unless the person is typing.
  const acknowledge = useRef<(() => void) | undefined>(undefined);
  useEffect(() => {
    acknowledge.current = acknowledged ? undefined : onAcknowledge;
  }, [acknowledged, onAcknowledge]);
  const listen = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    const keydown = (e: globalThis.KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'a' || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || typing(e.target) || !acknowledge.current) return;
      e.preventDefault();
      acknowledge.current();
    };
    el.addEventListener('keydown', keydown);
    return () => el.removeEventListener('keydown', keydown);
  }, []);

  return (
    <ModalOverlay isOpen={open} onOpenChange={(next) => !next && onStepBack?.()} isDismissable={false} isKeyboardDismissDisabled={!onStepBack} className="augur-letterbox" data-look={look}>
      <Modal className="augur-letterbox-modal">
        <AriaDialog role="alertdialog" aria-labelledby={headingId} aria-describedby={describedBy} className="augur-letterbox-dialog outline-none" ref={listen}>
          <div className="augur-letterbox-bar" data-edge="top">
            <div className="augur-letterbox-bar-info">{bars?.top}</div>
            {queue ? <div className="augur-letterbox-queue">{queueText(queue)}</div> : null}
            {onStepBack ? (
              <Button kind="ghost" size="sm" aria-keyshortcuts="Escape" onPress={onStepBack}>
                Step back
              </Button>
            ) : null}
          </div>
          <div className="augur-letterbox-frame" data-more={showMore ? 'open' : undefined}>
            <div className="augur-letterbox-body">
              <Heading eyebrow={eyebrow} heading={heading} summary={summary} size="l" id={headingId} summaryId={summaryId} />
              {children ? <div className="augur-letterbox-text">{children}</div> : null}
              {more ? (
                <div className="augur-letterbox-more">
                  <Button kind="ghost" size="sm" aria-expanded={showMore} aria-controls={moreId} onPress={() => setShowMore((v) => !v)}>
                    {showMore ? 'Less' : moreLabel}
                  </Button>
                  <div id={moreId} className="augur-letterbox-more-text" hidden={!showMore}>
                    {more}
                  </div>
                </div>
              ) : null}
              {actions ? <div className="augur-letterbox-actions">{actions}</div> : null}
            </div>
          </div>
          <div className="augur-letterbox-bar" data-edge="bottom">
            {showsAck ? (
              <div className="augur-ack" data-state={acknowledged ? 'acknowledged' : 'not-acknowledged'}>
                {acknowledged ? (
                  <span id={ackId}>{`Acknowledged ${acknowledged.at} by ${acknowledged.by} · not resolved`}</span>
                ) : (
                  <>
                    <span id={ackId}>Not acknowledged</span>
                    {onAcknowledge ? (
                      <Button kind="secondary" size="sm" aria-keyshortcuts="A" onPress={onAcknowledge}>
                        Acknowledge
                      </Button>
                    ) : null}
                  </>
                )}
              </div>
            ) : null}
            <div className="augur-letterbox-bar-info">{bars?.bottom}</div>
          </div>
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
}
