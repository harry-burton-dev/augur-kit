import { Button as AriaButton } from 'react-aria-components';
import { cx } from './cx.js';
import { Icon } from './icon.js';
import { queueText, type LetterboxQueue } from './letterbox.js';

export interface UrgentEdgeProps {
  /** The urgent item's headline, the same as the letterbox's heading. */
  headline: string;
  /** Whether someone has acknowledged it. It is still not resolved either way. */
  acknowledged?: boolean;
  /** Open the letterbox again. Enter, Space and a click call it. */
  onReopen: () => void;
  /** Where it stands among the urgent items waiting ("1 of 2 · next: …"). */
  queue?: LetterboxQueue;
  className?: string;
}

/**
 * Where an urgent item waits once it is stepped back from its `Letterbox`: the
 * edge rule along the top of the screen (the `edge-rule` token). It is a
 * visible, labelled button that stays until the item is resolved, never hides
 * by itself, and opens the letterbox again. The shell places it; there is one
 * at a time, with the rest in `queue`.
 */
export function UrgentEdge({ headline, acknowledged, onReopen, queue, className }: UrgentEdgeProps) {
  const state = acknowledged ? 'Acknowledged · not resolved' : 'Not acknowledged';
  return (
    <div className={cx('augur-urgent-edge', className)}>
      <AriaButton className="augur-urgent-edge-button" onPress={onReopen} data-state={acknowledged ? 'acknowledged' : 'not-acknowledged'}>
        <Icon name="warning" size={16} />
        <span className="augur-urgent-edge-kind">Urgent</span>
        <span className="augur-urgent-edge-headline">{headline}</span>
        <span className="augur-urgent-edge-state">{state}</span>
        {queue ? <span className="augur-urgent-edge-queue">{queueText(queue)}</span> : null}
        <span className="augur-urgent-edge-open">Open</span>
      </AriaButton>
    </div>
  );
}
