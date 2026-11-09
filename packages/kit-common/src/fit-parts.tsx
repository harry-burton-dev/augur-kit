import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { tokens } from './generated/tokens.js';

export interface FitPart {
  id: string;
  /** The part's name: its heading, and its entry on the switch. */
  label: string;
  content: ReactNode;
}

export interface FitPartsProps {
  /** Names the switch for screen readers ("Parts of Sign-in and security"). */
  label: string;
  parts: FitPart[];
  /** The part to show first when they don't all fit; the first by default. */
  first?: string;
}

const MIN = Number.parseFloat(tokens['part-min-width']);
const GAP = Number.parseFloat(tokens['space-5']);

/** How many parts of at least `min` fit side by side in `width`, with `gap` between them. Never fewer than one. */
export const partsThatFit = (width: number, count: number, min = MIN, gap = GAP) => Math.max(1, Math.min(count, Math.floor((width + gap) / (min + gap))));

/**
 * A page made of parts that must fit without scrolling. Parts sit side by side while each has at least
 * the `part-min-width` token; the rest wait behind a switch above them, which shows which parts are on
 * screen and brings the others in. It measures its own width, so it works in a dialog, a pane or a page.
 * Each part keeps itself short: a long list inside one pages (PagedList) instead of scrolling.
 */
export function FitParts({ label, parts, first }: FitPartsProps) {
  const box = useRef<HTMLDivElement>(null);
  // Without ResizeObserver (old browsers, tests) every part shows side by side.
  const [cols, setCols] = useState(parts.length);
  const [at, setAt] = useState(() => Math.max(0, parts.findIndex((p) => p.id === first)));
  useLayoutEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver !== 'function') return;
    // Not laid out yet (hidden, or a test without layout): keep what it has.
    const lay = () => el.clientWidth && setCols(partsThatFit(el.clientWidth, parts.length));
    lay();
    const watch = new ResizeObserver(lay);
    watch.observe(el);
    return () => watch.disconnect();
  }, [parts.length]);
  const n = Math.min(cols, parts.length);
  const start = Math.max(0, Math.min(at, parts.length - n));
  const shown = parts.slice(start, start + n);
  return (
    <div ref={box} className="augur-fit-parts">
      {n < parts.length ? (
        <div className="augur-fit-switch" role="group" aria-label={label}>
          {parts.map((p, i) => (
            <button key={p.id} type="button" className="augur-fit-switch-item" aria-pressed={i >= start && i < start + n} onClick={() => setAt(i)}>
              {p.label}
            </button>
          ))}
        </div>
      ) : null}
      <div className="augur-fit-row" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {shown.map((p) => (
          <section key={p.id} className="augur-fit-part" aria-label={p.label}>
            <h3 className="augur-fit-part-head">{p.label}</h3>
            {p.content}
          </section>
        ))}
      </div>
    </div>
  );
}
