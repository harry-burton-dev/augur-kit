/**
 * The door gallery's model: what a door is, and the pure scorer that turns signals into each door's step.
 * Nothing here draws. A door is configuration: add one by adding a descriptor, never by changing a part.
 *
 * - A door reads the kinds of signal it names (`reads`) and lights by how much waits behind it.
 * - The scorer turns those signals into a step (quiet, present, strong, needs you) and the reasons for it.
 *   Its weights and thresholds are a rule, passed in, so an app can tune them without touching the parts.
 * - "Needs you" comes only from something the person can act on (a queue item with `canAct`).
 * - At most `strongMax` doors are strong at once, so the light still says which door to try first.
 */
import { iconNames, type IconName } from '@augur/kit-common';

/** How much waits behind a door, from nothing to something only you can do. */
export type DoorStep = 'quiet' | 'present' | 'strong' | 'needs';

/** The steps in order, quietest first. */
export const DOOR_STEPS: readonly DoorStep[] = ['quiet', 'present', 'strong', 'needs'];

/** The kinds of signal a door can read. */
export type DoorSignalKind =
  | 'change'
  | 'moved'
  | 'incident'
  | 'contradiction'
  | 'meeting'
  | 'due'
  | 'coming'
  | 'new-thing'
  | 'question'
  | 'queue';

export const DOOR_SIGNAL_KINDS: readonly DoorSignalKind[] = ['change', 'moved', 'incident', 'contradiction', 'meeting', 'due', 'coming', 'new-thing', 'question', 'queue'];

/** One thing that may wait behind a door. Reasons are the words read aloud and shown under the door. */
export interface DoorSignal {
  kind: DoorSignalKind;
  /** What it is, in the person's words ("The Heron is delayed by weather"). */
  reason: string;
  /** Which thing it is about, when it is about one (an entity id). */
  about?: string;
  /** You made this change yourself: it is not news to you, so it scores nothing. */
  yours?: boolean;
  /** You have already seen it (a contradiction you opened). */
  seen?: boolean;
  /** You can act on it yourself (a queue item you may settle). Only these make a door need you. */
  canAct?: boolean;
  /** It matters on its own (a plan moved, an incident): it makes the door strong if the door ranks. */
  important?: boolean;
  /** For a meeting: today or tomorrow. */
  when?: 'today' | 'tomorrow';
  /** For something due: it is at risk. */
  atRisk?: boolean;
  /** For a contradiction: you wrote one of its sides. */
  wroteOneSide?: boolean;
  /** For a meeting: how many things on its list are in question. */
  inQuestion?: number;
}

/** Why a door can't be used, and who can change that. Unavailable doors stay in the gallery and say so. */
export interface DoorUnavailable {
  why: string;
  who: string;
}

/** One door in the gallery. Plain data, so it can come from config or, later, an app's manifest. */
export interface DoorDescriptor {
  /** Stable id, used for keys, tests and the step map. */
  id: string;
  /** The door's job, as a verb phrase ("See what has changed"). Up to 40 characters. */
  name: string;
  /** One plain line under the name. Up to 60 characters. */
  line: string;
  /** A Lucide icon from Common's set. */
  icon: IconName;
  /** The kinds of signal it reads. A door that reads none is always quiet (a plain way in). */
  reads: DoorSignalKind[];
  /** Where it sits, left to right: lower first, ties in the order given. Doors never reorder by score; it also breaks ties in the ranking. */
  order: number;
  /** `ring`: always in the radial menu's More rather than on screen. */
  place?: 'door' | 'ring';
  /** Set when the signals it reads aren't available here, with why. */
  unavailable?: DoorUnavailable;
  /** What it says on a first day, when nothing is followed yet. */
  firstDay?: string;
}

/** The scorer's weights and thresholds. Pass your own to tune it; `DEFAULT_RULE` is round 6's. */
export interface DoorRule {
  /** Points per signal kind. */
  points: Record<DoorSignalKind, number>;
  /** A contradiction you have already seen scores this instead. */
  seenContradiction: number;
  /** Added when you wrote one side of a contradiction. */
  yourSide: number;
  /** A meeting tomorrow scores this instead of the meeting's points. */
  meetingTomorrow: number;
  /** Added for each item on a meeting's list that is in question. */
  perItemInQuestion: number;
  /** Something due and at risk scores this instead. */
  dueAtRisk: number;
  /** A door is present from this score. */
  presentAt: number;
  /** A door is strong from this score, if it is also among the top `strongMax`. */
  strongAt: number;
  /** At most this many doors are strong at once. */
  strongMax: number;
  /** An important signal lifts its door to `strongAt` (it still has to rank). */
  importantIsStrong: boolean;
}

export const DEFAULT_RULE: DoorRule = {
  points: { change: 1, moved: 2, incident: 3, contradiction: 3, meeting: 4, due: 1, coming: 2, 'new-thing': 0.5, question: 2, queue: 0 },
  seenContradiction: 1,
  yourSide: 1,
  meetingTomorrow: 1,
  perItemInQuestion: 1,
  dueAtRisk: 2,
  presentAt: 1,
  strongAt: 4,
  strongMax: 2,
  importantIsStrong: true,
};

/** A door's result: its step, its score and the reasons, strongest first. */
export interface DoorScore {
  step: DoorStep;
  score: number;
  reasons: string[];
}

/** Kinds whose signals score nothing when they are your own doing. */
const NOT_NEWS_IF_YOURS: ReadonlySet<DoorSignalKind> = new Set(['change', 'moved', 'incident']);

/** What one signal is worth under a rule. */
export function signalPoints(signal: DoorSignal, rule: DoorRule = DEFAULT_RULE): number {
  if (signal.yours && NOT_NEWS_IF_YOURS.has(signal.kind)) return 0;
  switch (signal.kind) {
    case 'contradiction':
      return signal.seen ? rule.seenContradiction : rule.points.contradiction + (signal.wroteOneSide ? rule.yourSide : 0);
    case 'meeting':
      return (signal.when === 'tomorrow' ? rule.meetingTomorrow : rule.points.meeting) + (signal.inQuestion ?? 0) * rule.perItemInQuestion;
    case 'due':
      return signal.atRisk ? rule.dueAtRisk : rule.points.due;
    default:
      return rule.points[signal.kind];
  }
}

/** The doors in the order they sit: by `order`, ties in the order given. */
export function orderDoors<D extends Pick<DoorDescriptor, 'order'>>(doors: readonly D[]): D[] {
  return doors.map((d, i) => [d, i] as const).sort((a, b) => a[0].order - b[0].order || a[1] - b[1]).map(([d]) => d);
}

/**
 * Scores every door from the signals. Pure: the same doors, signals and rule always give the same result,
 * and nothing is changed. A signal counts on every door that reads its kind. An unavailable door is quiet.
 */
export function scoreDoors(doors: readonly DoorDescriptor[], signals: readonly DoorSignal[], rule: DoorRule = DEFAULT_RULE): Record<string, DoorScore> {
  const sat = orderDoors(doors);
  const rows = sat.map((door) => {
    const reads = new Set(door.reads);
    const mine = door.unavailable ? [] : signals.filter((s) => reads.has(s.kind));
    const scored = mine.map((s) => ({ s, p: signalPoints(s, rule) }));
    const raw = scored.reduce((sum, { p }) => sum + p, 0);
    const important = rule.importantIsStrong && scored.some(({ s, p }) => s.important && p > 0);
    const score = important ? Math.max(raw, rule.strongAt) : raw;
    const needs = mine.some((s) => s.kind === 'queue' && s.canAct);
    const reasons = scored
      .filter(({ s, p }) => p > 0 || (s.kind === 'queue' && s.canAct))
      .map((x, i) => ({ ...x, i }))
      .sort((a, b) => Number(b.s.kind === 'queue' && !!b.s.canAct) - Number(a.s.kind === 'queue' && !!a.s.canAct) || b.p - a.p || a.i - b.i)
      .map(({ s }) => s.reason)
      .filter((r, i, all) => all.indexOf(r) === i);
    return { door, score, needs, reasons };
  });
  const ranked = rows.map((r, i) => [r, i] as const).sort((a, b) => b[0].score - a[0].score || a[1] - b[1]);
  const rank = new Map(ranked.map(([r], i) => [r.door.id, i]));
  const out: Record<string, DoorScore> = {};
  for (const r of rows) {
    const step: DoorStep = r.needs
      ? 'needs'
      : r.score >= rule.strongAt && (rank.get(r.door.id) ?? Infinity) < rule.strongMax
        ? 'strong'
        : r.score >= rule.presentAt
          ? 'present'
          : 'quiet';
    out[r.door.id] = { step, score: Math.round(r.score * 10) / 10, reasons: r.reasons };
  }
  return out;
}

/** The doors that sit on screen, and the ones that go to the ring: past `cap`, or placed there. */
export function placeDoors<D extends Pick<DoorDescriptor, 'order' | 'place'>>(doors: readonly D[], cap: number): { shown: D[]; ring: D[] } {
  const sat = orderDoors(doors);
  const wanted = sat.filter((d) => d.place !== 'ring');
  return { shown: wanted.slice(0, Math.max(0, cap)), ring: [...wanted.slice(Math.max(0, cap)), ...sat.filter((d) => d.place === 'ring')] };
}

/** How many doors sit on screen before the rest go to the ring (round 6: four). */
export const DOOR_CAP = 4;

const ID = /^[a-z][a-z0-9-]{1,39}$/;
const LIMITS = { name: 40, line: 60, firstDay: 80 } as const;
const words = (v: unknown) => typeof v === 'string' && v.trim() !== '';

/**
 * Checks a door descriptor against the door schema (`@augur/app-kit/door.schema.json`) and returns what is
 * wrong, in words, or nothing. Written out rather than run through a schema library, so the kit adds no
 * dependency; `doors.test.ts` keeps the two in step. It also checks the icon is one of Common's.
 */
export function validateDoor(value: unknown): string[] {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return ['A door is an object.'];
  const problems: string[] = [];
  const d = value as Record<string, unknown>;
  const allowed = new Set(['id', 'name', 'line', 'icon', 'reads', 'order', 'place', 'unavailable', 'firstDay']);
  for (const key of Object.keys(d)) if (!allowed.has(key)) problems.push(`"${key}" isn't part of a door.`);
  for (const key of ['id', 'name', 'line', 'icon', 'reads', 'order']) if (!(key in d)) problems.push(`A door needs "${key}".`);
  if ('id' in d && (typeof d.id !== 'string' || !ID.test(d.id))) problems.push('"id" is 2 to 40 lower-case letters, digits and hyphens, starting with a letter.');
  for (const key of ['name', 'line', 'firstDay'] as const) {
    if (!(key in d)) continue;
    if (!words(d[key])) problems.push(`"${key}" is words, not empty.`);
    else if ((d[key] as string).length > LIMITS[key]) problems.push(`"${key}" is ${LIMITS[key]} characters at most.`);
  }
  if ('icon' in d && !iconNames.includes(d.icon as IconName)) problems.push(`"${String(d.icon)}" isn't one of Common's icons.`);
  if ('reads' in d) {
    if (!Array.isArray(d.reads)) problems.push('"reads" is a list of signal kinds.');
    else {
      for (const k of d.reads) if (!DOOR_SIGNAL_KINDS.includes(k as DoorSignalKind)) problems.push(`"${String(k)}" isn't a signal kind.`);
      if (new Set(d.reads).size !== d.reads.length) problems.push('"reads" names a kind twice.');
    }
  }
  if ('order' in d && (typeof d.order !== 'number' || !Number.isFinite(d.order))) problems.push('"order" is a number.');
  if ('place' in d && d.place !== 'door' && d.place !== 'ring') problems.push('"place" is "door" or "ring".');
  if ('unavailable' in d) {
    const u = d.unavailable as Record<string, unknown> | null;
    if (typeof u !== 'object' || u === null || Array.isArray(u)) problems.push('"unavailable" says why, and who can change it.');
    else {
      for (const key of ['why', 'who']) if (!words(u[key])) problems.push(`"unavailable" needs "${key}".`);
      for (const key of Object.keys(u)) if (key !== 'why' && key !== 'who') problems.push(`"unavailable.${key}" isn't part of a door.`);
    }
  }
  return problems;
}

/** The step's words, for the label under a door and its accessible name. Pass your own to translate. */
export interface DoorStepWords {
  quiet: string;
  present: string;
  strong: string;
  needs: string;
}

export const DOOR_STEP_WORDS: DoorStepWords = { quiet: 'Nothing new', present: 'Something new', strong: 'Worth a look first', needs: 'Needs you' };
