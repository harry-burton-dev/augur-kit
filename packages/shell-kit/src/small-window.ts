import { useEffect, useState } from 'react';
import { tokens } from '@augur/kit-common/tokens';

/** Whether the window is narrower than `px` now, following it as it changes. */
export function useWindowBelow(px: number) {
  const query = () => (typeof matchMedia === 'function' ? matchMedia(`(max-width: ${px - 1}px)`) : undefined);
  const [below, setBelow] = useState(() => !!query()?.matches);
  useEffect(() => {
    const q = query();
    if (!q) return;
    const on = () => setBelow(q.matches);
    on();
    q.addEventListener('change', on);
    return () => q.removeEventListener('change', on);
    // The width is a token, so it doesn't change.
  }, []);
  return below;
}

/** Under this width (the token window-small-below) the window is small: the rail narrows, and the floor picker and
 *  the app pane take places in the band. The CSS writes it out (a media query can't read a variable): small-window.test.ts. */
export const SMALL_WINDOW_BELOW = Number.parseFloat(tokens['window-small-below']);

/** Whether the window is small now (window-small-below). */
export const useSmallWindow = () => useWindowBelow(SMALL_WINDOW_BELOW);
