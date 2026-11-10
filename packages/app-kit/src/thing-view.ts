/**
 * The thing page's model: one shape for every thing, whatever its kind. Nothing here draws.
 *
 * A thing's page has seven slots, always in this order (App patterns, "One shape for every thing"):
 *
 * 1. What it is: its kind and name.
 * 2. The answer: Now and Next for a thing that lasts, What and When for an event. When there is none, the
 *    app falls back to Last heard, then Known for, and the page says "Little is known" when nothing is left.
 * 3. What's wrong: one line, the first problem. With none, the page says so plainly.
 * 4. Key facts: at most `facts` of them at rest.
 * 5. Around it: at most `around` sentences at rest.
 * 6. Actions: one primary, chosen by `primaryAction`, and two quiet ones.
 * 7. Everything we know: one step away.
 *
 * The app fills a `ThingView` from its data (which facts, in which order); the kit only caps and draws it.
 * So a kind nobody has drawn yet gets a page with no design work.
 */
import type { IconName } from '@augur/kit-common';

/** Where a line came from, for its one quiet trust line. */
export interface ThingSource {
  /** `forecast`: someone expects it; `as-written`: a report says it. */
  how: 'as-written' | 'forecast';
  /** How many reports say it. */
  reports: number;
  /** Who wrote the newest report, in the person's words ("Sam", or "You"). */
  who: string;
  /** When that report was written (ISO date). */
  on: string;
  /** The report's title, read aloud with the line. */
  title: string;
  /** You wrote it: the line says "Your report". */
  byYou?: boolean;
  /** It came from your own floor: say so, since only you see it. */
  yours?: boolean;
}

/** Which question an answer line answers. */
export type ThingAnswerKey = 'now' | 'next' | 'what' | 'when' | 'last-heard' | 'known-for';

export const THING_ANSWER_KEYS: readonly ThingAnswerKey[] = ['now', 'next', 'what', 'when', 'last-heard', 'known-for'];

export interface ThingAnswer {
  key: ThingAnswerKey;
  /** The answer, in the reports' own words ("Delayed by weather"). */
  value: string;
  source?: ThingSource;
}

/** What kind of wrong a problem is. */
export type ThingProblemKind = 'conflict' | 'duplicate' | 'problem' | 'slipped';

export const THING_PROBLEM_KINDS: readonly ThingProblemKind[] = ['conflict', 'duplicate', 'problem', 'slipped'];

export interface ThingProblem {
  kind: ThingProblemKind;
  /** The line itself ("Berth: 3 or 4"). */
  text: string;
  source?: ThingSource;
}

export interface ThingFact {
  /** The fact's name, from the ontology ("Operated by"). */
  label: string;
  value: string;
  /** `false`: nobody has adopted this term yet, so the label is the stored name, split into words. */
  adopted?: boolean;
  source?: ThingSource;
}

/** One sentence of what is around it: "Operated by Norland Shipping". */
export interface ThingNeighbour {
  /** The other thing's id, to open it. */
  id: string;
  /** How it relates, read from this thing's side ("Operated by", or a turned-round label like "Runs"). */
  relation: string;
  name: string;
  /** A plain group ("People", "Places"), for the map one step away. */
  group?: string;
}

/** One thing, ready to draw. Plain data, so it can come from any app's rules or, later, a served view spec. */
export interface ThingView {
  id: string;
  name: string;
  /** The kind, in the person's words, with a Lucide icon from Common's set. */
  kind: { name: string; icon: IconName };
  aliases?: string[];
  /** The answer, best first. Empty: the page says little is known. */
  answer: ThingAnswer[];
  /** Every problem, worst first. The page shows the first and counts the rest. */
  problems: ThingProblem[];
  /** Ranked facts, most asked-about first. The page caps them. */
  facts: ThingFact[];
  /** Ranked neighbours. The page caps them. */
  around: ThingNeighbour[];
  /** How many things are known about it, for "Everything we know". */
  total: number;
  /** How many reports name it, for the empty answer. */
  reports: number;
}

/** What the page shows at rest; the rest is one step away. */
export interface ThingCaps {
  answer: number;
  facts: number;
  around: number;
}

export const THING_CAPS: ThingCaps = { answer: 2, facts: 4, around: 6 };

/** The actions a thing page can offer. Plain data: an app can rename them or swap their icons. */
export type ThingActionId = 'wrong' | 'follow' | 'ask' | 'send';

export interface ThingAction {
  id: ThingActionId;
  label: string;
  icon: IconName;
}

export const THING_ACTIONS: Record<ThingActionId, ThingAction> = {
  wrong: { id: 'wrong', label: 'Something’s wrong', icon: 'warning' },
  follow: { id: 'follow', label: 'Keep an eye on it', icon: 'star' },
  ask: { id: 'ask', label: 'Ask about it', icon: 'messages' },
  send: { id: 'send', label: 'Send this', icon: 'arrow' },
};

/** The order the quiet actions are offered in, after the primary. */
export const THING_QUIET_ORDER: readonly ThingActionId[] = ['follow', 'wrong', 'send'];

/**
 * The one primary action. Something to settle (reports that disagree, or a possible duplicate) comes first;
 * otherwise a thing that changes (its answer is Now or Next) is worth keeping an eye on; otherwise ask.
 */
export function primaryAction(view: Pick<ThingView, 'answer' | 'problems'>): ThingActionId {
  if (view.problems.some((p) => p.kind === 'conflict' || p.kind === 'duplicate')) return 'wrong';
  const first = view.answer[0]?.key;
  if (first === 'now' || first === 'next') return 'follow';
  return 'ask';
}

/** The primary and the two quiet actions, in order. */
export function thingActions(view: Pick<ThingView, 'answer' | 'problems'>, actions: Record<ThingActionId, ThingAction> = THING_ACTIONS): ThingAction[] {
  const primary = primaryAction(view);
  return [primary, ...THING_QUIET_ORDER.filter((id) => id !== primary).slice(0, 2)].map((id) => actions[id]);
}

/** Every word the page says on its own. Pass your own to translate it or say it in a deployment's words. */
export interface ThingWords {
  answer: Record<ThingAnswerKey, string>;
  problem: Record<ThingProblemKind, string>;
  /** With no problem at all. */
  allClear: string;
  problems: string;
  around: string;
  aroundEmpty: string;
  factsEmpty: string;
  littleKnown: (reports: number) => string;
  seeReports: string;
  alsoCalled: string;
  more: (n: number) => string;
  moreAround: (n: number) => string;
  everything: (total: number) => string;
  map: string;
  actions: string;
  trust: { asWritten: string; forecast: string; agree: (n: number) => string; report: (who: string, on: string) => string; yourReport: (on: string) => string; yours: string; from: (title: string, who: string, on: string) => string };
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export const THING_WORDS: ThingWords = {
  answer: { now: 'Now', next: 'Next', what: 'What', when: 'When', 'last-heard': 'Last heard', 'known-for': 'Known for' },
  problem: { conflict: 'Not settled', duplicate: 'May be two', problem: 'Wrong or late', slipped: 'Overdue' },
  allClear: 'No reports disagree, and nothing is overdue',
  problems: 'What’s wrong',
  around: 'Around it',
  aroundEmpty: 'Nothing yet.',
  factsEmpty: 'No other facts yet.',
  littleKnown: (n) => (n ? `Little is known about it yet. It is named in ${plural(n, 'report')}.` : 'Nothing is known about it yet.'),
  seeReports: 'See the reports that name it',
  alsoCalled: 'Also called',
  more: (n) => `${n} more`,
  moreAround: (n) => `${n} more around it`,
  everything: (n) => `Everything we know about it: ${plural(n, 'thing')}`,
  map: 'See how it connects',
  actions: 'What you can do',
  trust: {
    asWritten: 'As written',
    forecast: 'Forecast',
    agree: (n) => `${n} reports agree`,
    report: (who, on) => `${who}’s report, ${on}`,
    yourReport: (on) => `Your report, ${on}`,
    yours: 'your own note',
    from: (title, who, on) => `Where this came from: ${title}, ${who}, ${on}`,
  },
};

/** A report's date as a person says it: "18 Nov". */
export function shortDate(iso: string, locale = 'en-GB'): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

/** The trust line's words, and what it says aloud. */
export function trustLine(source: ThingSource, words: ThingWords = THING_WORDS, locale?: string): { text: string; name: string } {
  const on = shortDate(source.on, locale);
  const parts = [source.how === 'forecast' ? words.trust.forecast : words.trust.asWritten];
  if (source.reports > 1) parts.push(words.trust.agree(source.reports));
  parts.push(source.byYou ? words.trust.yourReport(on) : words.trust.report(source.who, on));
  if (source.yours) parts.push(words.trust.yours);
  return { text: parts.join(' · '), name: words.trust.from(source.title, source.who, on) };
}

/** What the page shows at rest, and how many of each wait one step away. */
export function atRest(view: ThingView, caps: ThingCaps = THING_CAPS) {
  return {
    answer: view.answer.slice(0, caps.answer),
    problem: view.problems[0],
    moreProblems: Math.max(0, view.problems.length - 1),
    facts: view.facts.slice(0, caps.facts),
    around: view.around.slice(0, caps.around),
    moreAround: Math.max(0, view.around.length - caps.around),
  };
}

/** Checks a view from outside the kit (a served view, a fixture). Returns what is wrong, or nothing. */
export function validateThing(value: unknown): string[] {
  const out: string[] = [];
  const v = value as Partial<ThingView> | null;
  if (!v || typeof v !== 'object') return ['A thing must be an object'];
  if (typeof v.id !== 'string' || !v.id) out.push('id must be a non-empty string');
  if (typeof v.name !== 'string' || !v.name) out.push('name must be a non-empty string');
  if (!v.kind || typeof v.kind.name !== 'string') out.push('kind needs a name');
  for (const k of ['answer', 'problems', 'facts', 'around'] as const) if (!Array.isArray(v[k])) out.push(`${k} must be a list`);
  (v.answer ?? []).forEach((a, i) => {
    if (!THING_ANSWER_KEYS.includes(a.key)) out.push(`answer ${i}: unknown key ${String(a.key)}`);
  });
  (v.problems ?? []).forEach((p, i) => {
    if (!THING_PROBLEM_KINDS.includes(p.kind)) out.push(`problem ${i}: unknown kind ${String(p.kind)}`);
  });
  if (typeof v.total !== 'number' || v.total < 0) out.push('total must be a count');
  if (typeof v.reports !== 'number' || v.reports < 0) out.push('reports must be a count');
  return out;
}
