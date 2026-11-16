import { useEffect, useState } from 'react';

/**
 * Under this width the window is small: the rail narrows (app-bar), and the floor picker and the app pane give up
 * their lanes at the right edge for places in the band, so an open app has the width (WCAG 2.2 Reflow at 320 px).
 * The CSS says the same as `@media (max-width: 719px)`.
 */
export const SMALL_WINDOW_BELOW = 720;

/** Whether the window is small now, following it as it changes. */
export function useSmallWindow() {
  const query = () => (typeof matchMedia === 'function' ? matchMedia(`(max-width: ${SMALL_WINDOW_BELOW - 1}px)`) : undefined);
  const [small, setSmall] = useState(() => !!query()?.matches);
  useEffect(() => {
    const q = query();
    if (!q) return;
    const on = () => setSmall(q.matches);
    on();
    q.addEventListener('change', on);
    return () => q.removeEventListener('change', on);
  }, []);
  return small;
}
