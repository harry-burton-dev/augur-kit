import type { ReactNode } from 'react';
import { Button } from './button.js';
import { Icon } from './icon.js';

export interface StepItem {
  id: string;
  title: string;
  /** Why, or what you'll see. */
  detail?: ReactNode;
  action?: { label: string; onPress: () => void };
  /** Done already: ticked, and its action stays for doing it again. */
  done?: boolean;
  /** Why this step can't be done here yet. It stays in its place and says so. */
  unavailable?: string;
}

/**
 * An ordered way through one job ("Secure your account"): numbered steps, each with what to do, why, and
 * one action. For a job with a fixed order, never for places. For where a process has got to, use Steps.
 */
export function StepList({ label, steps }: { label: string; steps: StepItem[] }) {
  return (
    <ol className="augur-step-list" aria-label={label}>
      {steps.map((s, i) => (
        <li key={s.id} className="augur-step-item" data-done={s.done ? true : undefined}>
          <span className="augur-step-number" aria-hidden="true">
            {s.done ? <Icon name="check" size={14} /> : i + 1}
          </span>
          <span className="augur-step-text">
            <b>
              {s.title}
              {s.done ? <span className="sr-only"> (done)</span> : null}
            </b>
            {s.detail ? <small>{s.detail}</small> : null}
          </span>
          {s.unavailable ? (
            <Button size="sm" disabled reason={s.unavailable}>
              {s.action?.label ?? 'Not yet'}
            </Button>
          ) : s.action ? (
            <Button size="sm" kind={s.done ? 'tertiary' : 'secondary'} onPress={s.action.onPress}>
              {s.action.label}
            </Button>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
