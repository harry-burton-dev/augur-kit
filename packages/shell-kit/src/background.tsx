import type { ComponentType } from 'react';
import type { FloorTone } from './floors.js';
import { Flat } from './background-flat.js';
import { Horizon } from './background-horizon.js';
import { WaterGround } from './background-water.js';

/** What every background is given: the floor you're on, and whether an app is open. */
export interface GroundProps {
  floor?: FloorTone;
  away?: boolean;
}

/** One background in the set: what it's called, what it is in a few words, and the part that draws it. */
export interface BackgroundChoice {
  id: string;
  name: string;
  line: string;
  /** It moves, so it's still when motion is reduced. */
  moves?: boolean;
  // Each background takes its own options on top of the ground's props.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  draw: ComponentType<GroundProps & any>;
}

/** The backgrounds the kit ships. A deployment can add its own beside them with `set`. */
export const backgrounds: BackgroundChoice[] = [
  { id: 'horizon', name: 'Still horizon', line: 'A level line and its rules, with the floor’s light', draw: Horizon },
  { id: 'flat', name: 'Flat', line: 'One grey, nothing on it', draw: Flat },
  { id: 'water', name: 'Water', line: 'Soft bands drifting over slate', moves: true, draw: WaterGround },
];

/** The background the desktop gets when none is chosen. */
export const DEFAULT_BACKGROUND = 'horizon';

export interface BackgroundProps extends GroundProps {
  /** Which background, by id: `horizon`, `flat`, `water`, one of `set`, or `none` for nothing. */
  name?: string;
  /** That background's own options, such as the horizon's `line` or the water's `preset`. */
  options?: Record<string, unknown>;
  /** The backgrounds to choose from. The kit's own by default. */
  set?: BackgroundChoice[];
}

/**
 * The desktop's background, chosen from a set by id. Each background is a part of its own, with its
 * own options, and none of them knows what sits on it. One that isn't in the set draws flat ground
 * and says which id it didn't find, so a wrong setting shows rather than hides.
 */
export function Background({ name = DEFAULT_BACKGROUND, options, set = backgrounds, floor, away }: BackgroundProps) {
  if (name === 'none') return null;
  const choice = set.find((b) => b.id === name);
  if (!choice) return <Flat floor={floor} away={away} data-missing={name} title={`No background called “${name}”, so flat ground is showing.`} />;
  const Draw = choice.draw;
  return <Draw {...options} floor={floor} away={away} />;
}
