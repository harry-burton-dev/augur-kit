import type { CSSProperties, ReactNode } from 'react';
import { cx, Icon } from '@augur/kit-common';
import { atRest, THING_ACTIONS, THING_CAPS, THING_WORDS, thingActions, trustLine, type ThingAction, type ThingActionId, type ThingCaps, type ThingNeighbour, type ThingSource, type ThingView, type ThingWords } from './thing-view.js';
import { thingProps, type ThingMark } from './thing.js';

export interface TrustLineProps {
  source: ThingSource;
  words?: ThingWords;
  locale?: string;
  /** Open where it came from. Without it, the line is plain text. */
  onSource?: (source: ThingSource) => void;
}

/** One quiet line under a fact: how it is known, how many reports agree, whose report and when. */
export function TrustLine({ source, words = THING_WORDS, locale, onSource }: TrustLineProps) {
  const { text, name } = trustLine(source, words, locale);
  return onSource ? (
    <button type="button" className="quill-thing-trust" aria-label={name} onClick={() => onSource(source)}>
      {text}
    </button>
  ) : (
    <span className="quill-thing-trust" title={name}>
      {text}
    </span>
  );
}

export interface ThingPageProps {
  view: ThingView;
  /** The page's own words. Pass your own to say it in a deployment's words. */
  words?: ThingWords;
  /** What shows at rest. The rest is one step away. */
  caps?: ThingCaps;
  /** The actions' words and icons. The page picks the primary; you only name them. */
  actions?: Record<ThingActionId, ThingAction>;
  locale?: string;
  onAction: (id: ThingActionId) => void;
  /** Open a thing around this one. */
  onOpen?: (id: string, neighbour: ThingNeighbour) => void;
  onSource?: (source: ThingSource) => void;
  /** Open everything we know: every fact, problem and neighbour, with its reports. */
  onEverything?: () => void;
  /** The graph, one deliberate step away. Without it, the page offers no map. */
  onMap?: () => void;
  /** The radial menu's mark, so the shell offers the app's own actions on this thing (`contributes.radial`). */
  mark?: ThingMark;
  /** Heading level of the thing's name; the slots' headings sit one below. */
  level?: 1 | 2;
  className?: string;
}

const Heading = ({ level, id, className, children }: { level: number; id?: string; className: string; children: ReactNode }) => {
  const Tag = `h${Math.min(6, level)}` as 'h2';
  return (
    <Tag id={id} className={className}>
      {children}
    </Tag>
  );
};

/**
 * A thing's page: one shape for every thing, whatever its kind. It reads top to bottom as what it is, the
 * answer, what's wrong, a few key facts, what's around it, and a way to everything else. The app fills the
 * `ThingView`; the page caps it, picks the primary action, and says what each empty slot means.
 */
export function ThingPage({ view, words = THING_WORDS, caps = THING_CAPS, actions = THING_ACTIONS, locale, onAction, onOpen, onSource, onEverything, onMap, mark, level = 1, className }: ThingPageProps) {
  const rest = atRest(view, caps);
  const [primary, ...quiet] = thingActions(view, actions);
  const id = `thing-${view.id}`;
  const trust = (s?: ThingSource) => (s ? <TrustLine source={s} words={words} locale={locale} onSource={onSource} /> : null);
  return (
    <article className={cx('quill-thing', className)} aria-labelledby={`${id}-name`} data-thing-view={view.id} {...thingProps(mark, { id: view.id, label: view.name })}>
      <header className="quill-thing-head">
        <div className="quill-thing-who">
          <p className="quill-thing-kind">
            <Icon name={view.kind.icon} size={16} />
            {view.kind.name}
          </p>
          <Heading level={level} id={`${id}-name`} className="quill-thing-name">
            {view.name}
          </Heading>
          {view.aliases?.length ? (
            <p className="quill-thing-also">
              {words.alsoCalled} {view.aliases.join(', ')}
            </p>
          ) : null}
        </div>
        <div className="quill-thing-actions" role="group" aria-label={words.actions}>
          {primary ? (
            <button type="button" className="quill-thing-action" data-primary="" data-action={primary.id} onClick={() => onAction(primary.id)}>
              <Icon name={primary.icon} size={16} />
              {primary.label}
            </button>
          ) : null}
          {quiet.map((a) => (
            <button key={a.id} type="button" className="quill-thing-action" data-action={a.id} onClick={() => onAction(a.id)}>
              <Icon name={a.icon} size={16} />
              {a.label}
            </button>
          ))}
        </div>
      </header>

      <div className="quill-thing-answer" data-empty={rest.answer.length ? undefined : ''}>
        {rest.answer.length ? (
          <dl className="quill-thing-answer-rows">
            {rest.answer.map((a) => (
              <div key={a.key} className="quill-thing-answer-row" data-key={a.key}>
                <dt>{words.answer[a.key]}</dt>
                <dd>
                  <span className="quill-thing-answer-value">{a.value}</span>
                  {trust(a.source)}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <>
            <p className="quill-thing-answer-value">{words.littleKnown(view.reports)}</p>
            {view.reports && onEverything ? (
              <button type="button" className="quill-thing-link" onClick={onEverything}>
                {words.seeReports}
              </button>
            ) : null}
          </>
        )}
      </div>

      <section className="quill-thing-problem" aria-labelledby={`${id}-problem`} data-kind={rest.problem?.kind ?? 'none'}>
        <Icon name={rest.problem ? 'warning' : 'check'} size={16} />
        {rest.problem ? (
          <div className="quill-thing-problem-body">
            <p className="quill-thing-problem-kind">{words.problem[rest.problem.kind]}</p>
            <Heading level={level + 1} id={`${id}-problem`} className="quill-thing-problem-text">
              {rest.problem.text}
            </Heading>
            {trust(rest.problem.source)}
          </div>
        ) : (
          <Heading level={level + 1} id={`${id}-problem`} className="quill-thing-problem-text">
            {words.allClear}
          </Heading>
        )}
        {rest.moreProblems && onEverything ? (
          <button type="button" className="quill-thing-link" onClick={onEverything}>
            {words.more(rest.moreProblems)}
          </button>
        ) : null}
      </section>

      {rest.facts.length ? (
        <dl className="quill-thing-facts" style={{ '--thing-facts': caps.facts } as CSSProperties}>
          {rest.facts.map((f, i) => (
            <div key={`${f.label}-${i}`} className="quill-thing-fact" data-adopted={f.adopted === false ? 'no' : undefined}>
              <dt>{f.label}</dt>
              <dd>
                <span className="quill-thing-fact-value">{f.value}</span>
                {trust(f.source)}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="quill-thing-empty">{words.factsEmpty}</p>
      )}

      <section className="quill-thing-around" aria-labelledby={`${id}-around`}>
        <Heading level={level + 1} id={`${id}-around`} className="quill-thing-caps">
          {words.around}
        </Heading>
        {rest.around.length ? (
          <ul className="quill-thing-around-list">
            {rest.around.map((n) => (
              <li key={n.id}>
                {n.relation}{' '}
                {onOpen ? (
                  <button type="button" className="quill-thing-link" data-strong="" onClick={() => onOpen(n.id, n)}>
                    {n.name}
                  </button>
                ) : (
                  <span className="quill-thing-neighbour">{n.name}</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="quill-thing-empty">{words.aroundEmpty}</p>
        )}
        {rest.moreAround && onEverything ? (
          <button type="button" className="quill-thing-link" onClick={onEverything}>
            {words.moreAround(rest.moreAround)}
          </button>
        ) : null}
      </section>

      {onEverything || onMap ? (
        <footer className="quill-thing-foot">
          {onMap ? (
            <button type="button" className="quill-thing-link" onClick={onMap}>
              <Icon name="structure" size={16} />
              {words.map}
            </button>
          ) : null}
          {onEverything ? (
            <button type="button" className="quill-thing-link" onClick={onEverything}>
              <Icon name="list" size={16} />
              {words.everything(view.total)}
              <Icon name="chevron-right" size={16} />
            </button>
          ) : null}
        </footer>
      ) : null}
    </article>
  );
}
