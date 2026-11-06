import { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type Ref } from 'react';
import type MarkdownIt from 'markdown-it';
import { cx } from '@augur/kit-common';
import { State } from './states.js';

/** A heading in what the reader shows, for a contents list. */
export interface OutlineItem {
  id: string;
  text: string;
  /** 1 for a top-level heading, down to 3. */
  level: number;
}

export type ReaderSize = 'small' | 'medium' | 'large';
export type ReaderWidth = 'narrow' | 'wide';
/**
 * How a document runs: `scroll` down one column; `leaves` set out as pages that fit and turn, never
 * scrolling; `horizon` down one column with the section you're in at full ink and the rest dimmed.
 */
export type ReaderFlow = 'scroll' | 'leaves' | 'horizon';

/** Where a reader set out as leaves is: the spread showing, and how many there are, both from 1. */
export interface ReaderLeaf {
  at: number;
  of: number;
  /** The pages (leaves) the document fills, from 1; a spread of two shows two of them. */
  pages: number;
}

/** Words selected in a reader: what they say, the block they start in, and that block's words. */
export interface MarkedPassage {
  text: string;
  anchor: string;
  context: string;
}

/** What a page can ask of a reader it holds a ref to. */
export interface ReaderHandle {
  /** Its headings, from the top level down to the third. */
  outline(): OutlineItem[];
  /** The block at the top of the view, by its anchor. */
  position(): string;
  /** The heading a block sits under (itself, when it is one), for marking the contents. */
  headingFor(anchor: string): string;
  /** Brings a block to the top and focuses it; `focus: false` only scrolls. False when there's no such block. */
  goTo(anchor: string, options?: { smooth?: boolean; focus?: boolean }): boolean;
  /** The words selected in the document, if any. */
  marked(): MarkedPassage | undefined;
  /** Set out as leaves: turns by this many spreads (−1 back, 1 on). Does nothing in the other flows. */
  turn(by: number): void;
  /** Set out as leaves: the spread showing, how many there are, and the pages; all 1 otherwise. */
  leaf(): ReaderLeaf;
  /** Set out as leaves: the leaf (page, from 1) a block starts on, for a contents ledger; 0 otherwise. */
  leafOf(anchor: string): number;
}

/** A heading's words as an anchor: "2. Claims & receipts" → "claims-receipts". */
export const slugFor = (text: string) =>
  text
    .toLocaleLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/^[\d.\s]+(?=\D)/, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '') || 'section';

const BLOCK_OPEN = new Set(['paragraph_open', 'heading_open', 'bullet_list_open', 'ordered_list_open', 'blockquote_open', 'table_open', 'fence', 'code_block', 'hr']);

/**
 * Markdown as the kit reads it: no raw HTML (it's escaped), only safe links, and
 * every top-level block with a stable anchor: a heading by its words, anything
 * else by its place (`b12`). Pictures wait for the host to say where they are.
 */
const markdown = (Md: typeof import('markdown-it').default) => {
  const md = new Md({ html: false, linkify: true, typographer: true });
  md.core.ruler.push('quill_anchors', (state) => {
    const taken = new Set<string>();
    let n = 0;
    state.tokens.forEach((token, i) => {
      if (token.level !== 0 || !BLOCK_OPEN.has(token.type)) return;
      n++;
      let id = `b${n}`;
      if (taken.has(id)) id = `b${n}-block`;
      if (token.type === 'heading_open') {
        const base = slugFor(state.tokens[i + 1]?.content ?? '');
        id = base;
        for (let k = 2; taken.has(id); k++) id = `${base}-${k}`;
      }
      taken.add(id);
      token.attrSet('id', id);
      token.attrSet('data-block', String(n));
    });
  });
  md.renderer.rules.image = (tokens, i) => {
    const token = tokens[i]!;
    return `<img data-src="${md.utils.escapeHtml(token.attrGet('src') ?? '')}" alt="${md.utils.escapeHtml(token.content)}" loading="lazy">`;
  };
  const link = md.renderer.rules.link_open ?? ((tokens, i, options, _env, self) => self.renderToken(tokens, i, options));
  md.renderer.rules.link_open = (tokens, i, options, env, self) => {
    if (!(tokens[i]!.attrGet('href') ?? '').startsWith('#')) {
      tokens[i]!.attrSet('target', '_blank');
      tokens[i]!.attrSet('rel', 'noopener noreferrer');
    }
    return link(tokens, i, options, env, self);
  };
  md.renderer.rules.table_open = (tokens, i, options, _env, self) =>
    `<div class="quill-reader-table" role="region" tabindex="0" aria-label="Table, scrolls sideways">${self.renderToken(tokens, i, options)}`;
  md.renderer.rules.table_close = (tokens, i, options, _env, self) => `${self.renderToken(tokens, i, options)}</div>`;
  return md;
};

let shared: MarkdownIt | undefined;
let loading: Promise<MarkdownIt> | undefined;
/** Markdown-it, loaded the first time a reader shows something, since only a few screens read. */
export const loadReader = () =>
  (loading ??= import('markdown-it').then(
    ({ default: Md }) => (shared = markdown(Md)),
    (err: unknown) => {
      // Firefox and Safari can fetch it for the next reader. Chromium keeps the failure until the page reloads.
      loading = undefined;
      throw err;
    },
  ));

const still = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface ReaderProps {
  markdown: string;
  size?: ReaderSize;
  width?: ReaderWidth;
  /** Where a picture the document refers to really is, or undefined to leave it out. */
  imageSource?: (src: string) => Promise<string | undefined>;
  /** The document's title, when the page shows it above: a first heading that only repeats it is left out. */
  heading?: string;
  /** Rendered: its headings, for a contents list. */
  onOutline?: (headings: OutlineItem[]) => void;
  /** The block at the top of the view changed while reading. */
  onPosition?: (anchor: string) => void;
  /** How it runs: down a column (`scroll`), as leaves that turn (`leaves`), or with all but your section dimmed (`horizon`). */
  flow?: ReaderFlow;
  /** Set out as leaves: one leaf at a time, or two side by side. */
  spread?: 1 | 2;
  /** Set out as leaves: it turned, or was set out again (a new size, a new document). */
  onLeaf?: (leaf: ReaderLeaf) => void;
  ref?: Ref<ReaderHandle>;
  className?: string;
}

/**
 * A document to read, from Markdown, in the kit's reading type: one measure,
 * one rhythm. Headings, lists, tables, quotes and code come out as their HTML
 * elements. It renders nothing it wasn't given: raw HTML is shown as text,
 * links open elsewhere, and pictures load only through `imageSource`.
 */
export function Reader({ markdown: source, size = 'medium', width = 'narrow', imageSource, heading = '', onOutline, onPosition, flow = 'scroll', spread = 1, onLeaf, ref, className }: ReaderProps) {
  const article = useRef<HTMLElement>(null);
  const atTop = useRef('');
  const [html, setHtml] = useState(() => (shared ? shared.render(source) : undefined));
  const [failed, setFailed] = useState(false);
  const plain = failed && html === undefined;
  const latest = useRef({ onOutline, onPosition, onLeaf });
  latest.current = { onOutline, onPosition, onLeaf };
  const leaves = flow === 'leaves';
  // Set out as leaves: the spread showing (from 0) and the layout it was measured in.
  const leafAt = useRef(0);
  const layout = useRef({ step: 1, page: 1, spreads: 1, pages: 1 });

  useEffect(() => {
    if (shared) setHtml(shared.render(source));
    else {
      let gone = false;
      void loadReader().then(
        (md) => !gone && setHtml(md.render(source)),
        () => !gone && setFailed(true),
      );
      return () => {
        gone = true;
      };
    }
  }, [source]);

  const blocks = () => [...(article.current?.querySelectorAll<HTMLElement>('[data-block]') ?? [])];
  const outline = (): OutlineItem[] =>
    [...(article.current?.querySelectorAll<HTMLElement>('h1[id]:not([hidden]), h2[id], h3[id]') ?? [])].map((h) => ({ id: h.id, text: h.textContent?.trim() ?? '', level: Number(h.tagName[1]) }));
  const headingFor = (anchor: string) => {
    let found = '';
    for (const block of blocks()) {
      if (/^H[1-3]$/.test(block.tagName) && !block.hidden) found = block.id;
      if (block.id === anchor) break;
    }
    return found;
  };
  /** Horizon: the section holding this block is at full ink, every other block dims. */
  const markHere = (anchor: string) => {
    if (flow !== 'horizon') return;
    const all = blocks();
    const head = headingFor(anchor) || all[0]?.id || '';
    let inside = !headingFor(anchor);
    for (const block of all) {
      if (/^H[1-3]$/.test(block.tagName) && !block.hidden) inside = block.id === head;
      block.toggleAttribute('data-here', inside);
    }
  };
  const moved = (anchor: string) => {
    if (!anchor || anchor === atTop.current) return;
    atTop.current = anchor;
    markHere(anchor);
    latest.current.onPosition?.(anchor);
  };
  /** Leaves: shows a spread, and says where the reader is. */
  const show = (n: number) => {
    const root = article.current;
    if (!root) return;
    const { step, spreads } = layout.current;
    leafAt.current = Math.max(0, Math.min(spreads - 1, n));
    root.scrollLeft = leafAt.current * step;
    const start = leafAt.current * step;
    const first = blocks().find((b) => b.offsetLeft + b.offsetWidth > start + 1);
    if (first) moved(first.id);
    latest.current.onLeaf?.({ at: leafAt.current + 1, of: spreads, pages: layout.current.pages });
  };
  const goTo: ReaderHandle['goTo'] = (anchor, { smooth = true, focus = true } = {}) => {
    const target = article.current?.querySelector<HTMLElement>(`#${CSS.escape(anchor)}`);
    if (!target) return false;
    if (leaves) show(Math.floor(target.offsetLeft / layout.current.step));
    else target.scrollIntoView?.({ block: 'start', behavior: smooth && !still() ? 'smooth' : 'auto' });
    if (focus) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
    if (!leaves) {
      atTop.current = anchor;
      markHere(anchor);
    }
    return true;
  };

  useImperativeHandle(ref, () => ({
    outline,
    position: () => atTop.current,
    headingFor,
    goTo,
    turn: (by) => leaves && show(leafAt.current + by),
    leaf: () => (leaves ? { at: leafAt.current + 1, of: layout.current.spreads, pages: layout.current.pages } : { at: 1, of: 1, pages: 1 }),
    leafOf(anchor) {
      const target = leaves ? article.current?.querySelector<HTMLElement>(`#${CSS.escape(anchor)}`) : null;
      return target ? Math.floor(target.offsetLeft / layout.current.page) + 1 : 0;
    },
    marked() {
      const selection = document.getSelection();
      if (!selection || selection.isCollapsed || !selection.rangeCount) return undefined;
      const range = selection.getRangeAt(0);
      const start = range.startContainer instanceof Element ? range.startContainer : range.startContainer.parentElement;
      const block = start?.closest<HTMLElement>('[data-block]');
      if (!block || !article.current?.contains(block)) return undefined;
      const text = selection.toString().replace(/\s+/g, ' ').trim();
      return text ? { text, anchor: block.id, context: (block.textContent ?? '').replace(/\s+/g, ' ').trim() } : undefined;
    },
  }));

  // Once shown: hide a first heading that repeats the title, fetch pictures, and say the outline.
  useLayoutEffect(() => {
    const root = article.current;
    if (!root || html === undefined) return;
    const first = root.firstElementChild as HTMLElement | null;
    for (const h of root.querySelectorAll('h1[hidden]')) h.removeAttribute('hidden');
    if (heading && first?.tagName === 'H1' && first.textContent?.trim().toLocaleLowerCase() === heading.trim().toLocaleLowerCase()) first.hidden = true;
    atTop.current = '';
    for (const b of root.querySelectorAll('[data-here]')) b.removeAttribute('data-here');
    const opening = blocks()[0];
    if (opening && flow === 'horizon') markHere(opening.id);
    latest.current.onOutline?.(outline());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- markHere reads the flow given here
  }, [html, heading, flow]);

  // Leaves: columns as wide as a leaf, measured again whenever the reader's size changes.
  useLayoutEffect(() => {
    const root = article.current;
    if (!root || html === undefined || !leaves) return;
    const lay = () => {
      root.style.columnWidth = '';
      root.querySelector(':scope > .quill-reader-end')?.remove();
      const gap = parseFloat(getComputedStyle(root).columnGap) || 0;
      const width = root.clientWidth;
      if (!width) return;
      const column = (width - gap * (spread - 1)) / spread;
      root.style.columnWidth = `${column}px`;
      const page = column + gap;
      const pages = Math.max(1, Math.round((root.scrollWidth + gap) / page));
      // A last spread with an empty leaf still turns to a whole spread: an empty column fills it.
      if (pages % spread) root.append(Object.assign(document.createElement('div'), { className: 'quill-reader-end', ariaHidden: 'true' }));
      const at = blocks().find((b) => b.id === atTop.current);
      layout.current = { step: width + gap, page, spreads: Math.max(1, Math.ceil(pages / spread)), pages };
      show(at ? Math.floor(at.offsetLeft / (width + gap)) : leafAt.current);
    };
    lay();
    const watch = typeof ResizeObserver === 'function' ? new ResizeObserver(lay) : undefined;
    watch?.observe(root);
    return () => {
      watch?.disconnect();
      root.style.columnWidth = '';
      root.scrollLeft = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- show and blocks read the refs they need
  }, [html, leaves, spread, size, width]);

  useEffect(() => {
    const root = article.current;
    if (!root || html === undefined) return;
    let gone = false;
    void (async () => {
      for (const img of root.querySelectorAll<HTMLImageElement>('img[data-src]')) {
        const src = img.dataset.src ?? '';
        const found = src && imageSource ? await imageSource(src).catch(() => undefined) : undefined;
        if (gone) return;
        if (found) {
          img.src = found;
          img.removeAttribute('data-src');
        } else if (imageSource) img.replaceWith(Object.assign(document.createElement('span'), { className: 'quill-reader-missing', textContent: img.alt ? `[Picture: ${img.alt}]` : '[Picture]' }));
      }
    })();
    return () => {
      gone = true;
    };
  }, [html, imageSource]);

  // Whatever scrolls it: the page, or a pane round it, even inside another component's shadow root.
  useEffect(() => {
    const root = article.current;
    if (!root || leaves) return;
    let frame = 0;
    const up = (at: Node): Node | null => (at instanceof Element && at.assignedSlot) || (at instanceof ShadowRoot ? at.host : at.parentNode);
    const scrollers: EventTarget[] = [window];
    for (let at: Node | null = up(root); at; at = up(at)) if (at instanceof Element) scrollers.push(at);
    // The pane that scrolls it, if one does: positions count from its top, not the window's.
    const pane = scrollers.find((t): t is Element => t instanceof Element && /auto|scroll/.test(getComputedStyle(t).overflowY));
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = pane?.getBoundingClientRect();
        const top = box?.top ?? 0;
        const tall = box?.height ?? window.innerHeight;
        if (root.getBoundingClientRect().top > top && flow !== 'horizon') return;
        const all = blocks();
        const end = pane ? pane.scrollTop + pane.clientHeight >= pane.scrollHeight - 2 : window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
        // Horizon reads at a line a third of the way down; a section at the very end counts once you reach it.
        const line = top + (flow === 'horizon' ? tall / 3 : 72);
        const at = (flow === 'horizon' && end ? all[all.length - 1] : all.find((b) => b.getBoundingClientRect().bottom > line))?.id ?? '';
        moved(at);
      });
    };
    for (const t of scrollers) t.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      for (const t of scrollers) t.removeEventListener('scroll', onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- moved reads the refs it needs
  }, [leaves, flow]);

  return (
    <article
      ref={article}
      className={cx('quill-reader', className)}
      data-size={size}
      data-width={width}
      data-flow={flow}
      data-spread={leaves ? spread : undefined}
      aria-busy={(html === undefined && !plain) || undefined}
      tabIndex={leaves ? 0 : undefined}
      aria-roledescription={leaves ? 'leaves' : undefined}
      onKeyDown={(e) => {
        if (!leaves) return;
        const by = { ArrowRight: 1, PageDown: 1, ' ': 1, ArrowLeft: -1, PageUp: -1 }[e.key] ?? (e.key === 'Home' ? -Infinity : e.key === 'End' ? Infinity : 0);
        if (!by || e.altKey || e.ctrlKey || e.metaKey) return;
        e.preventDefault();
        show(Number.isFinite(by) ? leafAt.current + by : by < 0 ? 0 : layout.current.spreads - 1);
      }}
      onClick={(e) => {
        const href = (e.target as HTMLElement).closest?.('a')?.getAttribute('href');
        if (href?.startsWith('#') && goTo(decodeURIComponent(href.slice(1)))) e.preventDefault();
      }}
      // markdown-it runs with html: false, so the document's own HTML arrives escaped.
      {...(plain
        ? {
            children: (
              <>
                <State kind="error" size="line" heading="Showing plain text: the formatting didn’t load." body="Anything not saved on this page is lost when it reloads." action="Reload the page" onAction={() => location.reload()} />
                {source
                  .split(/\n{2,}/)
                  .filter((p) => p.trim())
                  .map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
              </>
            ),
          }
        : { dangerouslySetInnerHTML: { __html: html ?? '' } })}
    />
  );
}

export interface ContentsProps {
  items: OutlineItem[];
  /** The heading being read now. */
  current?: string;
  heading?: string;
  onSelect?: (id: string) => void;
  /** For a reader set out as leaves: the leaf each heading starts on, by its id, shown as a ledger. */
  leaves?: Record<string, number>;
  className?: string;
}

/**
 * A document's contents: its headings as links, indented by level, with the one being read marked.
 * Beside a Reader, from its `onOutline`. Given `leaves`, each line also says the leaf it starts on.
 */
export function Contents({ items, current = '', heading = 'Contents', onSelect, leaves, className }: ContentsProps) {
  if (!items.length) return null;
  // Indented from the highest level there is, so a document without a title heading starts at the left.
  const top = Math.min(...items.map((i) => i.level));
  return (
    <nav className={cx('quill-contents', className)} aria-label={heading} data-ledger={leaves ? '' : undefined}>
      <span className="quill-label">{heading}</span>
      <ol>
        {items.map((item) => (
          <li key={item.id} data-level={item.level - top + 1}>
            <a
              href={`#${item.id}`}
              aria-current={item.id === current ? 'location' : undefined}
              onClick={(e) => {
                e.preventDefault();
                onSelect?.(item.id);
              }}
            >
              <span className="quill-contents-text">{item.text}</span>
              {leaves?.[item.id] ? (
                <>
                  <span className="quill-contents-rule" aria-hidden="true" />
                  <span className="quill-contents-leaf">
                    <span className="sr-only">, page </span>
                    {leaves[item.id]}
                  </span>
                </>
              ) : null}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
