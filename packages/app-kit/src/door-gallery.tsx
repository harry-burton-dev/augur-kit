import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { cx, Icon } from '@augur/kit-common';
import { deploymentDepth } from './focus.js';
import { RingMore, useInRing, useRingTarget, type RingSubject } from './radial-menu.js';
import { DOOR_CAP, DOOR_STEP_WORDS, placeDoors, type DoorDescriptor, type DoorScore, type DoorStep, type DoorStepWords } from './doors.js';

/** Whether the light moves: `alive` drifts, blooms and breathes on strong and needs-you doors; `still` never moves. */
export type DoorLightMode = 'alive' | 'still';

/**
 * Still when asked, when the system or AUGUR asks for reduced motion, or when the deployment draws no blur
 * (PDR-010, amendment 2: depth `scrim`, for desktops with no GPU). The CSS stops the same loops on its own
 * too, so the light is still even before this has run.
 */
export function useDoorLight(asked: DoorLightMode = 'alive'): DoorLightMode {
  const [reduced, setReduced] = useState(() => reducedMotion());
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(reducedMotion());
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);
  return asked === 'still' || reduced || deploymentDepth() === 'scrim' ? 'still' : 'alive';
}

const reducedMotion = () =>
  typeof document !== 'undefined' &&
  (document.documentElement.dataset.motion === 'reduce' || (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches));

export interface StepLabelProps {
  step: DoorStep;
  /** While the signals are on their way: "Checking…" in place of a step. */
  loading?: boolean;
  words?: DoorStepWords;
  /** What to say while loading. */
  checking?: string;
}

/** A door's step in words, so the light is never the only cue. */
export function StepLabel({ step, loading, words = DOOR_STEP_WORDS, checking = 'Checking…' }: StepLabelProps) {
  return (
    <span className="quill-doors-step" data-step={loading ? undefined : step}>
      {loading ? checking : words[step]}
    </span>
  );
}

export interface DoorLightProps {
  step: DoorStep;
  focused?: boolean;
  light?: DoorLightMode;
  /** The door's place in the row, so the lights rise one after another and drift out of step. */
  index?: number;
}

/**
 * The light that rises from a door's bottom edge. Its strength and reach come from the step's tokens; green
 * only for needs you. Alive, a strong or needs-you door's light drifts and blooms, and needs you breathes.
 * Decorative: the step is said in words beside it.
 */
export function DoorLight({ step, focused, light = 'alive', index = 0 }: DoorLightProps) {
  const moves = light === 'alive' && (step === 'strong' || step === 'needs');
  return (
    <span className="quill-doors-light" data-step={step} data-focused={focused ? '' : undefined} data-light={light} style={{ '--door-index': index } as CSSProperties} aria-hidden="true">
      <span className="quill-doors-rise">{moves ? <span className="quill-doors-drift" /> : null}</span>
      {moves ? <span className="quill-doors-bloom" /> : null}
    </span>
  );
}

export interface DoorProps {
  door: DoorDescriptor;
  score?: DoorScore;
  focused?: boolean;
  /** Ambient: another door has focus, so this one steps back. */
  behind?: boolean;
  light?: DoorLightMode;
  index?: number;
  loading?: boolean;
  /** Nothing is followed yet: a door with `firstDay` says it in place of its step. */
  firstDay?: boolean;
  words?: DoorStepWords;
  /** The words on a focused door's way in. */
  start?: string;
  /** How many reasons a focused door shows. */
  reasonsShown?: number;
  onFocus?: () => void;
  onOpen?: () => void;
  onKeyDown?: (e: KeyboardEvent<HTMLButtonElement>) => void;
}

/** What a door says aloud: its job, its step, then why. */
export function doorName(door: DoorDescriptor, score: DoorScore | undefined, { loading, firstDay, words = DOOR_STEP_WORDS, checking = 'Checking…' }: { loading?: boolean; firstDay?: boolean; words?: DoorStepWords; checking?: string } = {}): string {
  if (door.unavailable) return `${door.name}. Unavailable: ${door.unavailable.why}. ${door.unavailable.who} can change that.`;
  if (loading) return `${door.name}. ${checking}`;
  if (firstDay && door.firstDay) return `${door.name}. ${door.firstDay}`;
  const step = score?.step ?? 'quiet';
  const reasons = score?.reasons ?? [];
  return [door.name, words[step], reasons.join('; ')].filter(Boolean).join('. ').concat(reasons.length ? '.' : '');
}

/** One door: its step, icon, name and line, and, when focused, its reasons and the way in. Draws only; never scores. */
export function Door({ door, score, focused, behind, light = 'alive', index = 0, loading, firstDay, words = DOOR_STEP_WORDS, start = 'Start', reasonsShown = 3, onFocus, onOpen, onKeyDown }: DoorProps) {
  const step: DoorStep = door.unavailable || loading || (firstDay && door.firstDay) ? 'quiet' : (score?.step ?? 'quiet');
  const reasons = door.unavailable || loading ? [] : (score?.reasons ?? []).slice(0, reasonsShown);
  return (
    <button
      type="button"
      className="quill-doors-door"
      data-step={step}
      data-focused={focused ? '' : undefined}
      data-behind={behind ? '' : undefined}
      data-light={light}
      data-door={door.id}
      aria-disabled={door.unavailable ? true : undefined}
      aria-label={doorName(door, score, { loading, firstDay, words })}
      onPointerEnter={onFocus}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      onClick={() => {
        if (!door.unavailable) onOpen?.();
      }}
    >
      <DoorLight step={step} focused={focused} light={light} index={index} />
      <span className="quill-doors-body" aria-hidden="true">
        {door.unavailable ? <span className="quill-doors-step" data-unavailable="">Unavailable</span> : <StepLabel step={step} loading={loading} words={words} />}
        <span className="quill-doors-icon">
          <Icon name={door.icon} size={20} />
        </span>
        <span className="quill-doors-name">{door.name}</span>
        <span className="quill-doors-line">{door.line}</span>
        {door.unavailable ? (
          <span className="quill-doors-why">
            {door.unavailable.why}. {door.unavailable.who} can change that.
          </span>
        ) : firstDay && door.firstDay ? (
          <span className="quill-doors-why">{door.firstDay}</span>
        ) : focused && reasons.length ? (
          <span className="quill-doors-reasons">
            {reasons.map((r) => (
              <span key={r}>{r}</span>
            ))}
          </span>
        ) : null}
        {focused && !door.unavailable ? (
          <span className="quill-doors-start">
            {start} <Icon name="arrow" size={16} />
          </span>
        ) : null}
      </span>
    </button>
  );
}

export interface AskLineProps {
  /** The field's name, read aloud ("What do you need?"). */
  label: string;
  placeholder?: string;
  /** What you looked for or opened lately, under the line. */
  recents?: { id: string; label: string }[];
  recentsLabel?: string;
  onAsk: (text: string) => void;
  onRecent?: (id: string) => void;
  /** The cursor is in the line on arrival (DG-17). */
  autoFocus?: boolean;
  /** The submit button's words. */
  ask?: string;
}

/** The "What do you need?" line on top of the doors: a labelled search field, with recents below it. */
export function AskLine({ label, placeholder, recents = [], recentsLabel = 'Recent', onAsk, onRecent, autoFocus = true, ask = 'Ask' }: AskLineProps) {
  const field = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  useEffect(() => {
    if (autoFocus) field.current?.focus({ preventScroll: true });
  }, [autoFocus]);
  return (
    <form
      role="search"
      className="quill-doors-ask"
      aria-label={label}
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim()) onAsk(text.trim());
      }}
    >
      <span className="quill-doors-ask-line">
        <Icon name="find" size={20} />
        <input ref={field} type="search" className="quill-doors-ask-field" aria-label={label} placeholder={placeholder ?? label} value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit" className="quill-doors-ask-go">
          {ask}
        </button>
      </span>
      {recents.length ? (
        <span className="quill-doors-recents">
          <span className="quill-doors-recents-label">{recentsLabel}</span>
          {recents.map((r) => (
            <button key={r.id} type="button" className="quill-doors-recent" onClick={() => onRecent?.(r.id)}>
              {r.label}
            </button>
          ))}
        </span>
      ) : null}
    </form>
  );
}

export interface DoorGalleryProps {
  /** The gallery's name, read aloud ("Ways in"). */
  label: string;
  /** The doors, as configuration. Add a door by adding one here. */
  doors: DoorDescriptor[];
  /** Each door's step and reasons, from `scoreDoors`. The gallery never scores. */
  scores?: Record<string, DoorScore>;
  onOpen: (id: string) => void;
  /** The ask line on top, usually an `AskLine`. */
  ask?: ReactNode;
  /** Doors on screen before the rest go to the ring. */
  cap?: number;
  light?: DoorLightMode;
  /** Nothing is followed yet. */
  firstDay?: boolean;
  /** The signals aren't back yet: no light, and each step says "Checking…". */
  loading?: boolean;
  words?: DoorStepWords;
  /** The name of the ring that holds the doors past the cap. */
  moreLabel?: string;
  start?: string;
  className?: string;
}

const STEP_RANK: Record<DoorStep, number> = { quiet: 0, present: 1, strong: 2, needs: 3 };

/**
 * The door gallery: an ask line on top and a row of doors, each lit by how much waits behind it. Doors are
 * configuration (`DoorDescriptor`), steps come from the scorer, and the gallery only draws: it keeps the
 * order it was given, puts doors past `cap` (or placed there) in the radial menu, and moves one hard line
 * to the door in focus. On arrival focus sits on the strongest door while the cursor stays in the ask line.
 */
export function DoorGallery({ label, doors, scores = {}, onOpen, ask, cap = DOOR_CAP, light: asked = 'alive', firstDay, loading, words = DOOR_STEP_WORDS, moreLabel = 'More ways in', start, className }: DoorGalleryProps) {
  const light = useDoorLight(asked);
  const { shown, ring } = useMemo(() => placeDoors(doors, cap), [doors, cap]);
  const strongest = useMemo(() => {
    if (loading || firstDay) return undefined;
    let best: DoorDescriptor | undefined;
    for (const d of shown) {
      const s = scores[d.id];
      if (d.unavailable || !s || s.step === 'quiet') continue;
      const b = best ? scores[best.id]! : undefined;
      if (!b || STEP_RANK[s.step] > STEP_RANK[b.step] || (s.step === b.step && s.score > b.score)) best = d;
    }
    return best?.id;
  }, [shown, scores, loading, firstDay]);
  const [focus, setFocus] = useState<string | undefined>(strongest);
  const focused = shown.some((d) => d.id === focus) ? focus : strongest;
  const at = shown.findIndex((d) => d.id === focused);
  const row = useRef<HTMLUListElement>(null);
  const inRing = useInRing();

  const subject = (): RingSubject | undefined =>
    ring.length
      ? {
          label: moreLabel,
          actions: ring.map((d) => ({
            id: d.id,
            label: d.unavailable ? d.name : `${d.name}: ${loading ? 'Checking…' : words[scores[d.id]?.step ?? 'quiet']}`,
            icon: d.icon,
            ...(d.unavailable ? { disabled: true, reason: d.unavailable.why, owner: d.unavailable.who } : {}),
          })),
          onAction: (id) => onOpen(id),
        }
      : undefined;
  const target = useRingTarget(subject);

  const move = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const to = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? shown.length - 1 : undefined;
    if (to === undefined) return;
    e.preventDefault();
    const next = (to + shown.length) % shown.length;
    row.current?.querySelectorAll<HTMLButtonElement>('.quill-doors-door')[next]?.focus();
  };

  return (
    <section className={cx('quill-doors', className)} aria-label={label} data-light={light} {...(ring.length ? target : {})}>
      {ask}
      <div className="quill-doors-stage" style={{ '--doors': Math.max(1, shown.length), '--door-at': Math.max(0, at) } as CSSProperties}>
        {at >= 0 ? <span className="quill-doors-focus-line" data-light={light} aria-hidden="true" /> : null}
        <ul ref={row} className="quill-doors-row">
          {shown.map((d, i) => (
            <li key={d.id} className="quill-doors-slot">
              <Door
                door={d}
                score={scores[d.id]}
                focused={d.id === focused}
                behind={focused !== undefined && d.id !== focused}
                light={light}
                index={i}
                loading={loading}
                firstDay={firstDay}
                words={words}
                start={start}
                onFocus={() => setFocus(d.id)}
                onOpen={() => onOpen(d.id)}
                onKeyDown={(e) => move(e, i)}
              />
            </li>
          ))}
        </ul>
      </div>
      {ring.length ? (
        inRing ? (
          <p className="quill-doors-more">
            <span>{moreLabel}</span>
            <RingMore subject={subject} className="quill-doors-more-ring" />
          </p>
        ) : (
          <nav className="quill-doors-more" aria-label={moreLabel}>
            <span>{moreLabel}</span>
            {ring.map((d) => (
              <button key={d.id} type="button" className="quill-doors-recent" aria-disabled={d.unavailable ? true : undefined} aria-label={doorName(d, scores[d.id], { loading, firstDay, words })} onClick={() => !d.unavailable && onOpen(d.id)}>
                <Icon name={d.icon} size={16} /> {d.name}
              </button>
            ))}
          </nav>
        )
      ) : null}
    </section>
  );
}
