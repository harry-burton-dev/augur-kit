import type MarkdownIt from 'markdown-it';
import type { RefKind } from './things.js';

/**
 * The small Markdown the Editor writes and Prose shows (ADR 0058): paragraphs,
 * line breaks, bold, italic, bullet and numbered lists, quotes, and mentions
 * written as links, `[@Nora Briggs](person:u1)`. Everything else Markdown
 * knows (headings, code, tables, pictures, HTML, web links) is read as the
 * words it is written with. Both the editor and Prose read with this one
 * reader, so what is written is what is shown.
 */

export const MENTION_KINDS: readonly RefKind[] = ['entity', 'document', 'intent', 'person', 'team'];
const HREF = new RegExp(`^(${MENTION_KINDS.join('|')}):(\\S+)$`);

/** What a mention link points at, or nothing when the link isn't one. */
export const mentionTarget = (href: string, text: string): { kind: RefKind; id: string; trigger: '@' | '#'; label: string } | undefined => {
  const m = HREF.exec(href);
  if (!m || !/^[@#]./.test(text)) return undefined;
  let id = m[2]!;
  try {
    id = decodeURI(id);
  } catch {
    // keep it as written
  }
  return { kind: m[1] as RefKind, id, trigger: text[0] as '@' | '#', label: text.slice(1) };
};

/** Turns each `[@Name](kind:id)` into one `mention` token; any other link becomes its words. */
function mentions(md: MarkdownIt) {
  md.core.ruler.after('inline', 'augur_mentions', (state) => {
    for (const block of state.tokens) {
      if (block.type !== 'inline' || !block.children) continue;
      const out: typeof block.children = [];
      const kids = block.children;
      for (let i = 0; i < kids.length; i++) {
        const t = kids[i]!;
        if (t.type !== 'link_open') {
          out.push(t);
          continue;
        }
        let close = i + 1;
        while (close < kids.length && kids[close]!.type !== 'link_close') close++;
        const inner = kids.slice(i + 1, close);
        const words = inner.map((k) => k.content).join('');
        const target = inner.every((k) => k.type === 'text') ? mentionTarget(t.attrGet('href') ?? '', words) : undefined;
        if (target) {
          const token = new state.Token('mention', '', 0);
          token.meta = target;
          token.content = words;
          out.push(token);
        } else out.push(...inner);
        i = close;
      }
      block.children = out;
    }
  });
}

let reader: MarkdownIt | undefined;

/**
 * The one reader: CommonMark, a newline is a line break, no HTML, and only the
 * subset's rules on. It takes markdown-it's class so that pages which never
 * show writing never load it (see `loadMarkdown`).
 */
export const subsetReader = (Md: typeof MarkdownIt) => {
  if (reader) return reader;
  reader = new Md('commonmark', { html: false, breaks: true, linkify: false, typographer: false });
  reader.disable(['heading', 'lheading', 'code', 'fence', 'hr', 'html_block', 'html_inline', 'backticks', 'image', 'reference', 'autolink', 'entity']);
  // Links are never drawn as links: a mention becomes a chip, any other link its words.
  reader.validateLink = () => true;
  reader.normalizeLink = (url) => url;
  reader.use(mentions);
  return reader;
};

let loading: Promise<MarkdownIt> | undefined;

/** Loads markdown-it the first time something shows writing, and gives the subset's reader. */
export const loadMarkdown = () => (loading ??= import('markdown-it').then(({ default: Md }) => subsetReader(Md)));

/** The reader, when it has loaded already. */
export const loadedMarkdown = () => reader;
