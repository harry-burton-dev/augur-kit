import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { DEFAULT_RULE, DOOR_SIGNAL_KINDS, DOOR_STEPS, placeDoors, scoreDoors, signalPoints, validateDoor, type DoorDescriptor, type DoorSignal, type DoorStep } from './doors.js';
import { CORPUS_DAYS } from './doors.fixture.js';
import { ATLAS_DOORS, ATLAS_DOORS_TODAY, MORE_DOORS, QUESTIONS_DOOR } from './doors.atlas.fixture.js';

const rank = (s: DoorStep) => DOOR_STEPS.indexOf(s);
const stepsOf = (doors: DoorDescriptor[], signals: DoorSignal[]) => Object.fromEntries(Object.entries(scoreDoors(doors, signals)).map(([id, s]) => [id, s.step]));

describe('the corpus replay (round 6, proposed rule)', () => {
  it('has fifteen weekdays each for Alex and Jo', () => {
    expect(CORPUS_DAYS.filter((d) => d.person === 'alex')).toHaveLength(15);
    expect(CORPUS_DAYS.filter((d) => d.person === 'jo')).toHaveLength(15);
  });

  it.each(CORPUS_DAYS.map((d) => [d.person, d.day, d] as const))('%s on %s gets round 6\'s steps', (_p, _d, day) => {
    expect(stepsOf(ATLAS_DOORS, day.signals)).toEqual(day.expected);
  });

  it('misses nothing important: each important door is strong or needs you', () => {
    const misses = CORPUS_DAYS.flatMap((d) => {
      const steps = stepsOf(ATLAS_DOORS, d.signals);
      return d.important.filter((id) => rank(steps[id]!) < rank('strong')).map((id) => `${d.person} ${d.day} ${id}`);
    });
    expect(misses).toEqual([]);
  });

  it('never says "needs you" without something the person can act on', () => {
    for (const d of CORPUS_DAYS) {
      const scores = scoreDoors(ATLAS_DOORS, d.signals);
      for (const door of ATLAS_DOORS) {
        if (scores[door.id]!.step !== 'needs') continue;
        expect(d.signals.some((s) => s.kind === 'queue' && s.canAct && door.reads.includes('queue'))).toBe(true);
      }
    }
  });

  it('keeps "What changed" strong on fewer than half of Jo\'s days, and says how many of Alex\'s', () => {
    const strong = (p: string) => CORPUS_DAYS.filter((d) => d.person === p && stepsOf(ATLAS_DOORS, d.signals).changed === 'strong').length;
    expect(strong('alex')).toBe(8);
    expect(strong('jo')).toBeLessThan(8);
  });
});

// A small seeded generator, so the property tests are repeatable without a new dependency.
const random = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const pick = <T,>(next: () => number, list: readonly T[]) => list[Math.floor(next() * list.length)]!;
const signal = (next: () => number, i: number): DoorSignal => ({
  kind: pick(next, DOOR_SIGNAL_KINDS),
  reason: `Signal ${i}`,
  yours: next() < 0.2,
  seen: next() < 0.3,
  canAct: next() < 0.3,
  important: next() < 0.15,
  when: next() < 0.5 ? 'today' : 'tomorrow',
  atRisk: next() < 0.3,
  wroteOneSide: next() < 0.3,
  inQuestion: Math.floor(next() * 3),
});
const doors = [...ATLAS_DOORS, ...MORE_DOORS];
const cases = Array.from({ length: 300 }, (_, c) => {
  const next = random(c + 1);
  return Array.from({ length: Math.floor(next() * 14) }, (_, i) => signal(next, i));
});

describe('the scorer, as properties', () => {
  it('never lowers a step when one more signal arrives, unless another door takes a strong place (DG-6)', () => {
    for (const [c, signals] of cases.entries()) {
      const next = random(1000 + c);
      const extra = signal(next, 99);
      const before = scoreDoors(doors, signals);
      const after = scoreDoors(doors, [...signals, extra]);
      for (const d of doors) {
        const was = before[d.id]!;
        const now = after[d.id]!;
        // The strong cap is a ranking: a door may give up "strong" only to a door that now outscores it.
        if (was.step === 'strong' && now.step === 'present') {
          const overtaken = doors.filter((o) => o.id !== d.id && after[o.id]!.step === 'strong' && before[o.id]!.step !== 'strong');
          expect(overtaken.length).toBeGreaterThan(0);
          continue;
        }
        expect(rank(now.step)).toBeGreaterThanOrEqual(rank(was.step));
        expect(now.score).toBeGreaterThanOrEqual(was.score);
      }
    }
  });

  it('makes at most two doors strong (DG-5)', () => {
    for (const signals of cases) {
      expect(Object.values(scoreDoors(doors, signals)).filter((s) => s.step === 'strong').length).toBeLessThanOrEqual(DEFAULT_RULE.strongMax);
    }
  });

  it('makes a door need you only from a queue signal it reads that the person can act on (DG-4)', () => {
    for (const signals of cases) {
      const scores = scoreDoors(doors, signals);
      for (const d of doors) {
        const can = d.reads.includes('queue') && signals.some((s) => s.kind === 'queue' && s.canAct);
        expect(scores[d.id]!.step === 'needs').toBe(can);
      }
    }
  });

  it('gives no points to a queue signal, however many', () => {
    const queue: DoorSignal[] = Array.from({ length: 20 }, (_, i) => ({ kind: 'queue', reason: `Q${i}`, canAct: false }));
    expect(scoreDoors(ATLAS_DOORS, queue)['put-right']).toEqual({ step: 'quiet', score: 0, reasons: [] });
  });

  it('is pure: same input, same output, and the input is left as it was (DG-3)', () => {
    for (const signals of cases.slice(0, 50)) {
      const copy = structuredClone(signals);
      expect(scoreDoors(doors, signals)).toEqual(scoreDoors(doors, signals));
      expect(signals).toEqual(copy);
    }
  });

  it('does not depend on the order the doors are given in', () => {
    for (const signals of cases.slice(0, 50)) {
      expect(scoreDoors([...doors].reverse(), signals)).toEqual(scoreDoors(doors, signals));
    }
  });

  it('breaks a tie by order: the earlier door is the one that stays strong', () => {
    const three: DoorDescriptor[] = ['a', 'b', 'c'].map((id, i) => ({ id: `door-${id}`, name: id, line: id, icon: 'star', reads: ['meeting'], order: i }));
    const steps = stepsOf(three, [{ kind: 'meeting', when: 'today', reason: 'Today' }]);
    expect(steps).toEqual({ 'door-a': 'strong', 'door-b': 'strong', 'door-c': 'present' });
  });

  it('scores your own changes as nothing, and does not let them count as important', () => {
    expect(signalPoints({ kind: 'moved', reason: 'x', yours: true, important: true })).toBe(0);
    expect(stepsOf(ATLAS_DOORS, [{ kind: 'moved', reason: 'x', yours: true, important: true }]).changed).toBe('quiet');
  });

  it('keeps an unavailable door quiet', () => {
    expect(stepsOf(ATLAS_DOORS_TODAY, [{ kind: 'meeting', when: 'today', reason: 'Today' }])['get-ready']).toBe('quiet');
  });

  it('lists the reasons, what you can act on first, then the strongest', () => {
    const r = scoreDoors(ATLAS_DOORS, [
      { kind: 'contradiction', seen: true, reason: 'Seen before' },
      { kind: 'contradiction', reason: 'Two sources disagree' },
      { kind: 'queue', canAct: true, reason: 'Settle it' },
    ])['put-right']!;
    expect(r.reasons).toEqual(['Settle it', 'Two sources disagree', 'Seen before']);
  });
});

describe('adding a door is configuration (DG-2)', () => {
  it('scores a fifth door from its descriptor alone', () => {
    const five = [...ATLAS_DOORS, QUESTIONS_DOOR];
    const scores = scoreDoors(five, [
      { kind: 'question', reason: 'Sam asked about the Heron' },
      { kind: 'question', reason: 'Jo asked about Gantry' },
    ]);
    expect(scores.questions).toEqual({ step: 'strong', score: 4, reasons: ['Sam asked about the Heron', 'Jo asked about Gantry'] });
  });

  it('puts doors past the cap, and doors placed there, in the ring', () => {
    const seven = [...ATLAS_DOORS, ...MORE_DOORS];
    const { shown, ring } = placeDoors(seven, 4);
    expect(shown.map((d) => d.id)).toEqual(['get-ready', 'changed', 'put-right', 'keep-an-eye']);
    expect(ring.map((d) => d.id)).toEqual(['questions', 'new-here', 'due-soon']);
    const placed = placeDoors([{ ...ATLAS_DOORS[0]!, place: 'ring' as const }, ...ATLAS_DOORS.slice(1)], 4);
    expect(placed.shown.map((d) => d.id)).toEqual(['changed', 'put-right', 'keep-an-eye']);
    expect(placed.ring.map((d) => d.id)).toEqual(['get-ready']);
  });
});

describe('the door schema (DG-1)', () => {
  const schema = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../door.schema.json'), 'utf8')) as {
    required: string[];
    properties: Record<string, { enum?: string[]; items?: { enum: string[] }; maxLength?: number; required?: string[] }>;
  };

  it('accepts every door in the fixtures', () => {
    for (const d of [...ATLAS_DOORS, ...ATLAS_DOORS_TODAY, ...MORE_DOORS]) expect(validateDoor(d)).toEqual([]);
  });

  it('agrees with the validator on what a door needs and may hold', () => {
    expect(schema.required).toEqual(['id', 'name', 'line', 'icon', 'reads', 'order']);
    expect(schema.properties.reads!.items!.enum).toEqual([...DOOR_SIGNAL_KINDS]);
    expect(schema.properties.place!.enum).toEqual(['door', 'ring']);
    expect(schema.properties.unavailable!.required).toEqual(['why', 'who']);
    expect([schema.properties.name!.maxLength, schema.properties.line!.maxLength, schema.properties.firstDay!.maxLength]).toEqual([40, 60, 80]);
    for (const key of schema.required) {
      const d: Record<string, unknown> = { ...ATLAS_DOORS[1] };
      delete d[key];
      expect(validateDoor(d)).toEqual([`A door needs "${key}".`]);
    }
  });

  it('says what is wrong, in words', () => {
    expect(validateDoor({ ...QUESTIONS_DOOR, id: 'Questions', icon: 'pencil', reads: ['gossip'], place: 'side', extra: 1, unavailable: { why: '' } })).toEqual([
      '"extra" isn\'t part of a door.',
      '"id" is 2 to 40 lower-case letters, digits and hyphens, starting with a letter.',
      '"pencil" isn\'t one of Common\'s icons.',
      '"gossip" isn\'t a signal kind.',
      '"place" is "door" or "ring".',
      '"unavailable" needs "why".',
      '"unavailable" needs "who".',
    ]);
    expect(validateDoor({ ...QUESTIONS_DOOR, name: 'x'.repeat(41) })).toEqual(['"name" is 40 characters at most.']);
    expect(validateDoor('a door')).toEqual(['A door is an object.']);
  });
});
