import { Button } from '@augur/kit-common';

export type ConnectionState = 'online' | 'offline' | 'reconnecting' | 'expired';

export interface ConnectionProps {
  state: ConnectionState;
  /** Sign in again, for an expired session. What you were doing is kept. */
  onSignIn?: () => void;
  /** The sentence for each state, when a deployment wants its own. */
  words?: Partial<Record<Exclude<ConnectionState, 'online'>, string>>;
  /** The state's name, set in mono before the sentence, when a deployment wants its own. */
  names?: Partial<Record<Exclude<ConnectionState, 'online'>, string>>;
}

const WORDS = {
  offline: 'You’re offline. Changes can’t be saved until you’re back.',
  reconnecting: 'Reconnecting. Changes can’t be saved until it’s back.',
  expired: 'Your session ended. Sign in again to carry on; nothing you were doing is lost.',
};

const NAMES = { offline: 'Offline', reconnecting: 'Reconnecting', expired: 'Signed out' };

/**
 * Says, on a line under the band, when AUGUR is offline, reconnecting, or your session has ended (Line,
 * picked 6 Nov 2026). The line itself carries the state: dashed while offline, running while it
 * reconnects, and broken off when you're signed out. Nothing shows while all is well.
 */
export function Connection({ state, onSignIn, words, names }: ConnectionProps) {
  if (state === 'online') return null;
  const said = { ...WORDS, ...words }[state];
  const name = { ...NAMES, ...names }[state];
  return (
    <div className="aerie-connection" data-state={state} role={state === 'expired' ? 'alert' : 'status'}>
      <span className="aerie-connection-name">{name}</span>
      <span className="aerie-connection-words">{said}</span>
      {state === 'expired' && onSignIn ? (
        <Button kind="ghost" size="sm" onPress={onSignIn}>
          Sign in
        </Button>
      ) : null}
      <span className="aerie-connection-line" aria-hidden="true" />
    </div>
  );
}
