import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Button, Icon, cx } from '@augur/kit-common';

export interface GuideStep {
  /** The `id` of the part this step lights. If it isn't on the page, the step still shows, over the dimmed page. */
  target: string;
  /** What the part does, in a few words. */
  title: string;
  /** One line on how to use it. */
  line: string;
}

export interface GuideLabels {
  next?: string;
  back?: string;
  /** On the last step, in place of Next. */
  done?: string;
  skip?: string;
  /** Where you are, such as "2 of 3". */
  count?: (step: number, of: number) => string;
}

export interface GuideProps {
  /** A few steps, one part each. More than five is a manual, not a guide. */
  steps: GuideStep[];
  /** The step shown, from 0, when the app holds it. */
  step?: number;
  /** The first step shown, when the guide holds it. */
  defaultStep?: number;
  onStep?: (step: number) => void;
  /** Skip the guide: Esc, or the skip key. */
  onSkip?: () => void;
  /** Done on the last step. */
  onDone?: () => void;
  /** Show the guide. Default true; the app keeps whether someone has seen it. */
  open?: boolean;
  /** Every word the guide says, for the app's own language. */
  labels?: GuideLabels;
  className?: string;
}

const defaults: Required<GuideLabels> = {
  next: 'Next',
  back: 'Back',
  done: 'Done',
  skip: 'Skip the guide',
  count: (step, of) => `${step} of ${of}`,
};

type Box = { top: number; left: number; width: number; height: number };

/**
 * A first-run guide (Lamp): one part at a time. The page dims, never blurs, and the step's part stays lit
 * in a square; what it does sits on the dim under a rule, with no box. Next goes on, Back goes back, and
 * Esc or Skip ends it. Nothing is green: a guide is an offer, not something that needs you.
 *
 * Give each part an `id` and name it as a step's `target`. The app keeps whether someone has seen the
 * guide, and opens it again from its own Help.
 */
export function Guide({ steps, step: stepProp, defaultStep = 0, onStep, onSkip, onDone, open = true, labels, className }: GuideProps) {
  const words = { ...defaults, ...labels };
  const [own, setOwn] = useState(defaultStep);
  const step = Math.min(Math.max(stepProp ?? own, 0), Math.max(steps.length - 1, 0));
  const current = steps[step];
  const last = step === steps.length - 1;
  const [box, setBox] = useState<Box | null>(null);
  const [room, setRoom] = useState({ w: 0, h: 0 });
  const next = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const go = useCallback(
    (to: number) => {
      if (stepProp === undefined) setOwn(to);
      onStep?.(to);
    },
    [stepProp, onStep],
  );

  // Where the part is: measured now, and again when the page moves under it.
  useLayoutEffect(() => {
    if (!open || !current) return;
    const measure = () => {
      const el = document.getElementById(current.target);
      setRoom({ w: window.innerWidth, h: window.innerHeight });
      if (!el) return setBox(null);
      const r = el.getBoundingClientRect();
      setBox({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    document.getElementById(current.target)?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [open, current]);

  useEffect(() => {
    if (!open) return;
    next.current?.querySelector('button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSkip?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, step, onSkip]);

  if (!open || !current) return null;

  // The words go below the part if there's room, else above; they line up with whichever side of the screen the part is on.
  const below = !box || box.top + box.height < room.h * 0.6;
  const rightSide = box ? box.left + box.width / 2 > room.w / 2 : false;
  const place = box
    ? {
        ...(below ? { top: box.top + box.height } : { bottom: room.h - box.top }),
        ...(rightSide ? { right: room.w - box.left - box.width } : { left: box.left }),
      }
    : undefined;

  return (
    <div className={cx('quill-guide', className)} data-lit={box ? true : undefined}>
      {box ? <div className="quill-guide-lamp" style={{ top: box.top, left: box.left, width: box.width, height: box.height }} aria-hidden="true" /> : null}
      <div className="quill-guide-words" role="dialog" aria-labelledby={titleId} data-place={box ? (below ? 'below' : 'above') : 'middle'} data-side={rightSide ? 'end' : 'start'} style={place}>
        <p className="quill-guide-count">{words.count(step + 1, steps.length)}</p>
        <p className="quill-guide-title" id={titleId}>{current.title}</p>
        <p className="quill-guide-line">{current.line}</p>
        <div className="quill-guide-keys" ref={next}>
          <Button kind="primary" size="sm" onPress={() => (last ? onDone?.() : go(step + 1))}>
            {last ? words.done : words.next}
          </Button>
          {step > 0 ? (
            <Button size="sm" onPress={() => go(step - 1)}>
              {words.back}
            </Button>
          ) : null}
          {last ? null : (
            <button type="button" className="quill-guide-skip" onClick={() => onSkip?.()}>
              <kbd>Esc</kbd>
              {words.skip}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export interface FirstStep {
  id: string;
  /** What to do, as an instruction: "Share a plan with your team". */
  label: string;
  done?: boolean;
  /** The key on the next step to do, such as "Share". Only the first step not done shows it. */
  action?: string;
  onAction?: () => void;
}

export interface FirstStepsProps {
  /** Three to five first things to do in the app. */
  steps: FirstStep[];
  heading?: string;
  /** How many are done, such as "2 of 4 done". */
  count?: (done: number, of: number) => string;
  /** Put it away for now: the app keeps that, and brings it back from Help. */
  hideLabel?: string;
  onHide?: () => void;
  /** Read out after a done step's label. */
  doneLabel?: string;
  className?: string;
}

/**
 * A few first things to do in a new app (Lamp): a section of the app's own start page, not over it. A
 * label with how many are done, a hairline, and the steps; a done one is checked and quiet, and only
 * the next one carries its action. Hide for now puts it away. Once every step is done, the app stops
 * showing it.
 */
export function FirstSteps({ steps, heading = 'First steps', count = (d, of) => `${d} of ${of} done`, hideLabel = 'Hide for now', onHide, doneLabel = 'done', className }: FirstStepsProps) {
  const headId = useId();
  const done = steps.filter((s) => s.done).length;
  const next = steps.find((s) => !s.done);
  return (
    <section className={cx('quill-first', className)} aria-labelledby={headId}>
      <div className="quill-first-head">
        <h2 id={headId}>{heading}</h2>
        <span>{count(done, steps.length)}</span>
      </div>
      <ul className="quill-first-list">
        {steps.map((s) => (
          <li key={s.id} className="quill-first-step" data-done={s.done || undefined} data-next={s === next || undefined}>
            <span className="quill-first-check" aria-hidden="true">{s.done ? <Icon name="check" size={12} /> : null}</span>
            <span className="quill-first-label">
              {s.label}
              {s.done ? <span className="quill-sr">, {doneLabel}</span> : null}
            </span>
            {s === next && s.action ? (
              <Button size="sm" onPress={s.onAction}>
                {s.action}
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
      {onHide ? (
        <button type="button" className="quill-first-hide" onClick={onHide}>
          {hideLabel}
        </button>
      ) : null}
    </section>
  );
}
