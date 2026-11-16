import { useEffect, useState } from 'react';
import { tokenValue } from './motion.js';

/** Whether the window is narrower than `px` now, following it as it changes. */
export function useWindowBelow(px: () => number) {
  const query = () => (typeof matchMedia === 'function' ? matchMedia(`(max-width: ${px() - 1}px)`) : undefined);
  const [below, setBelow] = useState(() => !!query()?.matches);
  useEffect(() => {
    const q = query();
    if (!q) return;
    const on = () => setBelow(q.matches);
    on();
    q.addEventListener('change', on);
    return () => q.removeEventListener('change', on);
    // The width is a token, read once.
  }, []);
  return below;
}

/** Under this width (the token window-small-below) the window is small: the rail narrows, and the floor picker and the app pane take places in the band. */
export const smallWindowBelow = () => tokenValue('window-small-below', 720);

/** Whether the window is small now (window-small-below). */
export const useSmallWindow = () => useWindowBelow(smallWindowBelow);
