import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { IconButton, Segmented, cx, useValue } from '@augur/kit-common';
import { Contents, Reader, type OutlineItem, type ReaderHandle, type ReaderLeaf, type ReaderSize } from './reader.js';

/** How a document runs: as leaves that turn and never scroll, or down a column with all but your section dimmed. */
export type ReadingFlow = 'leaves' | 'horizon';
/** Page: the document alone, its contents behind a key. Desk: contents beside it, and in leaves two at a time. */
export type ReadingMode = 'page' | 'desk';

export interface ReadingViewProps {
  markdown: string;
  /** The document's title, said above it; a first heading that only repeats it is left out. */
  title?: string;
  /** How it runs. The app chooses what suits the document; the reader can switch. */
  flow?: ReadingFlow;
  defaultFlow?: ReadingFlow;
  onFlowChange?: (flow: ReadingFlow) => void;
  /** The document alone, or contents beside it. */
  mode?: ReadingMode;
  defaultMode?: ReadingMode;
  onModeChange?: (mode: ReadingMode) => void;
  /** A name to remember the reader's own flow and mode under, on this device, the next time this view opens. */
  remember?: string;
  size?: ReaderSize;
  /** Where a picture the document refers to really is, or undefined to leave it out. */
  imageSource?: (src: string) => Promise<string | undefined>;
  /** The contents' heading. */
  contentsHeading?: string;
  /** The block at the top of the view changed while reading. */
  onPosition?: (anchor: string) => void;
  /** A block to open at, by its anchor; changing it goes there. */
  at?: string;
  className?: string;
}

/** The pages a spread shows: "3" alone, "3–4" at a desk. */
const shownPages = ({ at, pages }: ReaderLeaf, spread: number) => {
  const first = (at - 1) * spread + 1;
  const last = Math.min(at * spread, pages);
  return last > first ? `${first}–${last}` : String(first);
};

const kept = (name: string | undefined): { flow?: ReadingFlow; mode?: ReadingMode } => {
  if (!name) return {};
  try {
    const raw = JSON.parse(localStorage.getItem(`augur.reading.${name}`) ?? '{}') as Record<string, unknown>;
    return {
      flow: raw.flow === 'leaves' || raw.flow === 'horizon' ? raw.flow : undefined,
      mode: raw.mode === 'page' || raw.mode === 'desk' ? raw.mode : undefined,
    };
  } catch {
    return {};
  }
};

const keep = (name: string | undefined, value: { flow: ReadingFlow; mode: ReadingMode }) => {
  if (!name) return;
  try {
    localStorage.setItem(`augur.reading.${name}`, JSON.stringify(value));
  } catch {
    // Storage refused (a private window): the choice lasts while the view is open.
  }
};

/**
 * A document to read, with its contents, in one of two flows the reader can switch between
 * (picked 6 Nov 2026). Leaves sets it out as pages that fit and turn with the arrow keys or the keys
 * at the foot, so nothing scrolls; Horizon runs it down one column with the kit's thin bar, the
 * section you're in at full ink and the rest dimmed, and a line across the top that shows the
 * sections as lengths with yours marked. Page shows the document alone with its contents behind a
 * key; Desk docks the contents beside it, and in leaves shows two at a time with each heading's leaf.
 * It fills the height it's given.
 */
export function ReadingView({
  markdown,
  title,
  flow: flowGiven,
  defaultFlow = 'horizon',
  onFlowChange,
  mode: modeGiven,
  defaultMode = 'page',
  onModeChange,
  remember,
  size = 'medium',
  imageSource,
  contentsHeading = 'Contents',
  onPosition,
  at: openAt,
  className,
}: ReadingViewProps) {
  const [first] = useState(() => kept(remember));
  const [flow, setFlowValue] = useValue<ReadingFlow>(flowGiven, first.flow ?? defaultFlow, onFlowChange);
  const [mode, setModeValue] = useValue<ReadingMode>(modeGiven, first.mode ?? defaultMode, onModeChange);
  const setFlow = (next: ReadingFlow) => {
    setFlowValue(next);
    keep(remember, { flow: next, mode });
  };
  const setMode = (next: ReadingMode) => {
    setModeValue(next);
    keep(remember, { flow, mode: next });
  };

  const reader = useRef<ReaderHandle>(null);
  const body = useRef<HTMLDivElement>(null);
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [current, setCurrent] = useState('');
  const [leaf, setLeaf] = useState<ReaderLeaf>({ at: 1, of: 1, pages: 1 });
  const [ledger, setLedger] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const [lengths, setLengths] = useState<{ id: string; length: number }[]>([]);
  const leaves = flow === 'leaves';
  const desk = mode === 'desk';

  // Once laid out: the leaf each heading starts on (leaves), or each section's length (horizon).
  useLayoutEffect(() => {
    if (leaves) {
      setLedger(Object.fromEntries(outline.map((o) => [o.id, reader.current?.leafOf(o.id) ?? 0])));
      return;
    }
    const blocks = [...(body.current?.querySelectorAll<HTMLElement>('.quill-reader [data-block]') ?? [])];
    const ids = new Set(outline.map((o) => o.id));
    const found: { id: string; length: number }[] = [];
    for (const b of blocks) {
      if (b.hidden) continue;
      if (ids.has(b.id) || !found.length) found.push({ id: ids.has(b.id) ? b.id : '', length: 0 });
      found[found.length - 1]!.length += (b.textContent ?? '').length + 40;
    }
    setLengths(found);
  }, [outline, leaves, leaf, desk]);

  useEffect(() => setOpen(false), [mode]);
  // Once it has headings (it has been set out), and whenever it's asked to: go to that block.
  useEffect(() => {
    if (openAt && reader.current?.goTo(openAt, { smooth: false, focus: false })) setCurrent(reader.current.headingFor(openAt));
  }, [openAt, outline]);

  const heading = (anchor: string) => reader.current?.headingFor(anchor) ?? '';
  const at = current;
  const here = lengths.findIndex((l) => l.id === at);
  const select = (id: string) => {
    reader.current?.goTo(id);
    setCurrent(id);
  };

  const contents = (
    <Contents
      items={outline}
      current={at}
      heading={contentsHeading}
      leaves={leaves && desk ? ledger : undefined}
      onSelect={(id) => {
        select(id);
        if (!desk) setOpen(false);
      }}
    />
  );

  return (
    <section className={cx('quill-reading', className)} data-flow={flow} data-mode={mode} aria-label={title}>
      <div className="quill-reading-bar">
        {!desk && outline.length ? (
          <IconButton
            label={open ? `Close ${contentsHeading.toLocaleLowerCase()}` : `Open ${contentsHeading.toLocaleLowerCase()}`}
            icon={open ? 'drawer-close' : 'drawer-open'}
            size="sm"
            aria-expanded={open}
            onPress={() => setOpen(!open)}
          />
        ) : null}
        {title ? <h1 className="quill-reading-title">{title}</h1> : null}
        <span className="quill-reading-switches">
          <Segmented
            label="Flow"
            value={flow}
            onChange={(v) => setFlow(v as ReadingFlow)}
            options={[
              { value: 'leaves', label: 'Turn pages' },
              { value: 'horizon', label: 'Scroll' },
            ]}
          />
          <Segmented
            label="Layout"
            value={mode}
            onChange={(v) => setMode(v as ReadingMode)}
            options={[
              { value: 'page', label: 'Page' },
              { value: 'desk', label: 'Desk' },
            ]}
          />
        </span>
      </div>
      {!leaves && lengths.length > 1 ? (
        <div className="quill-reading-horizon" aria-hidden="true">
          {lengths.map((l, i) => (
            <span key={l.id || i} style={{ flexGrow: l.length }} data-at={i === here || undefined} data-done={i < here || undefined} />
          ))}
        </div>
      ) : null}
      <div className="quill-reading-body" ref={body}>
        {(desk || open) && outline.length ? <div className="quill-reading-contents">{contents}</div> : null}
        <div className="quill-reading-pane">
          <Reader
            ref={reader}
            markdown={markdown}
            heading={title}
            size={size}
            imageSource={imageSource}
            flow={flow}
            spread={desk ? 2 : 1}
            width={desk && leaves ? 'wide' : 'narrow'}
            onOutline={setOutline}
            onLeaf={setLeaf}
            onPosition={(anchor) => {
              setCurrent(heading(anchor));
              onPosition?.(anchor);
            }}
          />
        </div>
      </div>
      {leaves ? (
        <div className="quill-reading-foot">
          <IconButton label="Previous page" icon="back" size="sm" disabled={leaf.at <= 1} onPress={() => reader.current?.turn(-1)} />
          <span className="quill-reading-count" aria-live="polite">
            {shownPages(leaf, desk ? 2 : 1)} of {leaf.pages}
          </span>
          <IconButton label="Next page" icon="arrow" size="sm" disabled={leaf.at >= leaf.of} onPress={() => reader.current?.turn(1)} />
        </div>
      ) : null}
    </section>
  );
}
