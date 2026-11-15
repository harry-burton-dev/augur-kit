import type { CSSProperties } from 'react';
import { cx, Icon } from '@augur/kit-common';
import { mapAround, THING_MAP_CAP, THING_MAP_WORDS, type ThingMapWords } from './thing-map-layout.js';
import { Heading } from './thing-page.js';
import type { ThingNeighbour, ThingView } from './thing-view.js';

export interface ThingMapProps {
  /** The thing in the middle. */
  thing: Pick<ThingView, 'id' | 'name' | 'kind'>;
  /** What is around it, ranked, best first: the same sentences as its page's "Around it". */
  around: ThingNeighbour[];
  /** How many the map draws; the rest wait in everything we know. */
  cap?: number;
  words?: ThingMapWords;
  /** Open a thing around this one. */
  onOpen?: (id: string, neighbour: ThingNeighbour) => void;
  /** Back to the thing's page. Without it, the map offers no way back. */
  onBack?: () => void;
  /** Open everything we know, for the neighbours past the cap. */
  onEverything?: () => void;
  /** Heading level of the thing's name; the groups' headings sit one below. */
  level?: 1 | 2;
  className?: string;
}

/**
 * The map of what is around a thing, one step away: the thing in the middle and each neighbour round it,
 * grouped, with how it relates read from the thing's side. Every neighbour is a button in reading order,
 * group by group, so the map reads aloud as the page's "Around it" does. In a narrow place the ring folds
 * into those groups as lists.
 */
export function ThingMap({ thing, around, cap = THING_MAP_CAP, words = THING_MAP_WORDS, onOpen, onBack, onEverything, level = 1, className }: ThingMapProps) {
  const { groups, more, rows } = mapAround(around, cap, words.other);
  const nodes = groups.flatMap((g) => g.nodes);
  return (
    <section className={cx('quill-thing-map', className)} aria-label={words.label(thing.name)} data-thing-map={thing.id}>
      <div className="quill-thing-map-field" data-empty={nodes.length ? undefined : ''} style={{ '--map-rows': rows } as CSSProperties}>
        <svg className="quill-thing-map-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          {nodes.map((n, i) => (
            <line key={i} x1="50" y1="50" x2={n.x} y2={n.y} vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
        <div className="quill-thing-map-centre">
          <p className="quill-thing-kind">
            <Icon name={thing.kind.icon} size={16} />
            {thing.kind.name}
          </p>
          <Heading level={level} className="quill-thing-map-name">
            {thing.name}
          </Heading>
        </div>
        {groups.length ? (
          groups.map((g) => (
            <div key={g.name} className="quill-thing-map-group">
              <Heading level={level + 1} className="quill-thing-caps quill-thing-map-group-name quill-sr">
                {g.name}
              </Heading>
              <ul className="quill-thing-map-nodes">
                {g.nodes.map((n, i) => (
                  <li key={i} className="quill-thing-map-node" style={{ '--x': n.x, '--y': n.y } as CSSProperties}>
                    <span className="quill-thing-map-relation">{n.neighbour.relation}</span>{' '}
                    {onOpen ? (
                      <button type="button" className="quill-thing-link" data-strong="" onClick={() => onOpen(n.neighbour.id, n.neighbour)}>
                        {n.neighbour.name}
                      </button>
                    ) : (
                      <span className="quill-thing-neighbour">{n.neighbour.name}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : around.length ? null : (
          <p className="quill-thing-empty quill-thing-map-empty">{words.empty}</p>
        )}
      </div>
      {onBack || more ? (
        <footer className="quill-thing-foot">
          {more && onEverything ? (
            <button type="button" className="quill-thing-link" onClick={onEverything}>
              {words.more(more)}
              <Icon name="chevron-right" size={16} />
            </button>
          ) : more ? (
            <p className="quill-thing-empty">{words.more(more)}</p>
          ) : null}
          {onBack ? (
            <button type="button" className="quill-thing-link" onClick={onBack}>
              <Icon name="back" size={16} />
              {words.back}
            </button>
          ) : null}
        </footer>
      ) : null}
    </section>
  );
}
