/**
 * The map of what is around a thing: the thing in the middle and what it touches around it, one step away,
 * each group ("People", "Places") side by side round the ring. Nothing here draws.
 *
 * The layout is a fixed rule, not a simulation, so the same thing always looks the same: neighbours keep
 * their ranked order, a group's neighbours sit next to each other, and one empty place parts two groups.
 * Neighbours go down the right of the ring and up the left, evenly spaced from top to bottom on each side.
 */
import { THING_WORDS, type ThingNeighbour } from './thing-view.js';

/** One neighbour on the map, where it sits as a share of the map's width and height (0 to 100). */
export interface ThingMapNode {
  neighbour: ThingNeighbour;
  x: number;
  y: number;
}

export interface ThingMapGroup {
  name: string;
  nodes: ThingMapNode[];
}

export interface ThingMapLayout {
  groups: ThingMapGroup[];
  /** How many neighbours are past the cap, for "N more around it". */
  more: number;
  /** How many places the busier side of the ring has, top to bottom: the map is that many rows tall. */
  rows: number;
}

/** How many neighbours the map draws, at most, before the rest wait in everything we know. */
export const THING_MAP_CAP = 12;

/** How far out the ring sits, as a share of the map's width and height from the middle. */
const RING = { x: 50, y: 50 };

/**
 * Lays out the first `cap` neighbours (they come ranked) round the thing, by group. A neighbour with no
 * group goes in `otherGroup`. `cap` can lower the map's own cap, never raise it.
 */
export function mapAround(around: readonly ThingNeighbour[], cap = THING_MAP_CAP, otherGroup = 'Things'): ThingMapLayout {
  const drawn = around.slice(0, Math.max(0, Math.min(cap, THING_MAP_CAP)));
  const byName = new Map<string, ThingNeighbour[]>();
  for (const n of drawn) {
    const name = n.group || otherGroup;
    const members = byName.get(name);
    if (members) members.push(n);
    else byName.set(name, [n]);
  }
  const named = [...byName];
  const parted = named.length > 1;
  const places = drawn.length + (parted ? named.length - 1 : 0);
  // Down the right of the ring from the top, then up the left. Each side spaces its places evenly from top
  // to bottom, so neighbours (wider than they are tall) never sit on top of one another.
  const right = Math.ceil(places / 2);
  const at = (place: number) => {
    const onRight = place < right;
    const count = onRight ? right : places - right;
    const step = onRight ? place : count - 1 - (place - right);
    const dy = -1 + (2 * step + 1) / count;
    const dx = Math.sqrt(Math.max(0, 1 - dy * dy)) * (onRight ? 1 : -1);
    return { x: round(50 + RING.x * dx), y: round(50 + RING.y * dy) };
  };
  let place = 0;
  const groups = named.map(([name, members], i) => {
    if (i > 0) place += 1;
    const nodes = members.map((neighbour) => ({ neighbour, ...at(place++) }));
    return { name, nodes };
  });
  return { groups, more: around.length - drawn.length, rows: right };
}

const round = (n: number) => Math.round(n * 100) / 100;

/** The map's own words. Pass your own to say it in a deployment's words. */
export interface ThingMapWords {
  /** What the map is called aloud: "What is around MV Saltmarsh Heron". */
  label: (name: string) => string;
  back: string;
  empty: string;
  more: (n: number) => string;
  /** The group for a neighbour that has none. */
  other: string;
}

export const THING_MAP_WORDS: ThingMapWords = {
  label: (name) => `What is around ${name}`,
  back: 'Back to its page',
  empty: 'Nothing is known around it yet.',
  more: THING_WORDS.moreAround,
  other: 'Things',
};
