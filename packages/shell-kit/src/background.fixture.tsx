import type { ReactNode } from 'react';

/** The frame the background stories draw in: a desktop-shaped box, so a background shows by itself. */
export function Ground({ children }: { children: ReactNode }) {
  return <div style={{ position: 'relative', width: '100%', height: 'min(420px, 70vh)', overflow: 'hidden', borderRadius: 'var(--radius-card)' }}>{children}</div>;
}

export const FLOORS = ['you', 'department', 'team', 'org'] as const;
