import { useEffect, useLayoutEffect, useRef, type HTMLAttributes } from 'react';
import { cx } from '@augur/kit-common';
import type { FloorTone } from './floors.js';
import { DEFAULT_WAVE, Water, type WavePreset } from './water.js';

export interface WaterGroundProps extends HTMLAttributes<HTMLDivElement> {
  /** Whose floor you're on: the water takes the floor's colours (your own keeps the preset's) and sits at its height. */
  floor?: FloorTone;
  /** An app is open: the ground steps out of the way. */
  away?: boolean;
  /** Which of the water's presets. */
  preset?: WavePreset;
}

/** Where the water sits on each floor: your own high and close, the org low. */
const LEVEL: Record<FloorTone, number> = { you: -0.06, department: 0, team: 0, org: 0.1 };

/**
 * The water: one of the desktop's backgrounds. Soft bands drifting over a slate ground, blurred
 * into a glow with a fine grain, from the Wave Background Tuner. It moves, so it stops when motion
 * is reduced.
 */
export function WaterGround({ floor = 'you', away, preset = DEFAULT_WAVE, className, ...rest }: WaterGroundProps) {
  const host = useRef<HTMLDivElement>(null);
  const water = useRef<Water | null>(null);

  useLayoutEffect(() => {
    const el = host.current;
    if (!el) return;
    water.current ??= new Water(el);
    let colors: { navy: string; green: string } | undefined;
    if (floor !== 'you') {
      const cs = getComputedStyle(el);
      const navy = cs.getPropertyValue(`--floor-${floor}-low`).trim();
      const green = cs.getPropertyValue(`--floor-${floor}-high`).trim();
      colors = navy && green ? { navy, green } : undefined;
    }
    water.current.set({ preset, colors, level: LEVEL[floor] });
  }, [floor, preset]);

  useEffect(
    () => () => {
      water.current?.destroy();
      water.current = null;
    },
    [],
  );

  return <div ref={host} className={cx('aerie-water', className)} data-away={away ? '' : undefined} aria-hidden="true" {...rest} />;
}
