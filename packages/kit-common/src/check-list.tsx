import type { ReactNode } from 'react';
import { Button } from './button.js';

export type CheckTone = 'ok' | 'needs' | 'problem' | 'info';

export interface CheckRowProps {
  title: string;
  /** What was found, in words: the tone is never the only cue. */
  detail?: ReactNode;
  /** needs: the person must act (lit from the row's edge, the needs-you light). problem: something went wrong. */
  tone?: CheckTone;
  action?: { label: string; onPress: () => void; disabled?: boolean; reason?: string };
}

const TONE_WORDS: Record<CheckTone, string> = { ok: '', needs: 'Needs you', problem: 'Problem', info: '' };

/** A short list of things checked, each with what was found and one way to act on it. */
export function CheckList({ label, children }: { label: string; children: ReactNode }) {
  return (
    <ul className="augur-check-list" aria-label={label}>
      {children}
    </ul>
  );
}

/** One thing checked. Put the one that needs the person first. */
export function CheckRow({ title, detail, tone = 'info', action }: CheckRowProps) {
  return (
    <li className="augur-check-row" data-tone={tone}>
      <span className="augur-check-text">
        <b>
          {title}
          {TONE_WORDS[tone] ? <span className="sr-only"> ({TONE_WORDS[tone]})</span> : null}
        </b>
        {detail ? <small>{detail}</small> : null}
      </span>
      {action ? (
        <Button size="sm" kind={tone === 'needs' ? 'primary' : 'tertiary'} disabled={action.disabled} reason={action.reason} onPress={action.onPress}>
          {action.label}
        </Button>
      ) : null}
    </li>
  );
}
