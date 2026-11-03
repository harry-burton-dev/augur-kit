import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { cx, Icon, type IconName } from '@augur/kit-common';
import { useRingTarget, type RingSubject } from './radial-menu.js';

/** One thing in the tree. */
export interface PathNode {
  id: string;
  label: string;
  icon?: IconName;
  /** How many things are inside, shown at the end of the row. */
  count?: number;
  /** What's inside. Only the nodes on the path are opened, so the rest can leave this out. */
  children?: PathNode[];
  /** Locked to the person: kept in the tree, marked, with why on hover and focus. */
  locked?: string;
  /**
   * Something here needs the person, in one short sentence ("Two plans wait for your sign-off").
   * The row glows and shows the sentence, which is also read as the row's description. A row whose
   * inside isn't shown (closed, or folded into the "…" row) glows with its descendants' sentences.
   */
  needsYou?: string;
}

/** How the rows beside the path look. */
export type PathLight =
  /** Harry's: the rows beside the path dim by how far they are from where you are, so only the path you took is lit. */
  | 'path'
  /** Everything at full strength: a plain tree. */
  | 'flat';

export interface PathTreeProps {
  /** What the tree is, read aloud ("Your collections"). */
  label: string;
  nodes: PathNode[];
  /** The ids from the top of the tree down to where the person is. The last is the current one. */
  path: string[];
  onOpen: (node: PathNode) => void;
  /** What the radial menu offers on a row. Leave out for no menu. */
  ringFor?: (node: PathNode) => RingSubject | undefined;
  light?: PathLight;
  /**
   * How many rows of the path stay pinned to the top of the scrolling rail, as its breadcrumb.
   * On a deeper path the top row and the last ones stay, and the levels between fold into one "…"
   * row that says how many it holds and opens them when pressed. 0 pins nothing and folds nothing.
   * Default 3.
   */
  pinned?: number;
  /** The words on the "…" row, given the folded path nodes. Default: "2 more levels". */
  foldedLabel?: (folded: PathNode[]) => string;
}

/** How far a row is from where the person is: 0 is on the path or inside the current one, 3 is the furthest step. */
export type PathDistance = 0 | 1 | 2 | 3;

interface NodeRow {
  kind: 'node';
  key: string;
  node: PathNode;
  level: number;
  lit: boolean;
  current: boolean;
  /** Inside the current one: what you opened, so it isn't dimmed. */
  inside: boolean;
  distance: PathDistance;
  /** Its place in the pinned breadcrumb, from the top. */
  pin?: number;
  /** What needs the person: its own sentence first, then those of descendants that aren't drawn. */
  needs: string[];
}

/** The "…" row that stands for the folded levels of a deep path. */
interface FoldRow {
  kind: 'fold';
  key: string;
  level: number;
  lit: true;
  current: false;
  folded: PathNode[];
  pin?: number;
  needs: string[];
}

type Row = NodeRow | FoldRow;

const FOLD_KEY = '…fold';

const defaultFoldedLabel = (folded: PathNode[]) => `${folded.length} more ${folded.length === 1 ? 'level' : 'levels'}`;

/** Every sentence of `needsYou` inside a node, the node's own included. */
const needsIn = (node: PathNode, out: string[] = []) => {
  if (node.needsYou) out.push(node.needsYou);
  for (const c of node.children ?? []) needsIn(c, out);
  return out;
};

/** The path nodes from the top down, as far as the ids match the tree. */
const walk = (nodes: PathNode[], path: string[]) => {
  const out: PathNode[] = [];
  let level = nodes;
  for (const id of path) {
    const n = level.find((x) => x.id === id);
    if (!n) break;
    out.push(n);
    level = n.children ?? [];
  }
  return out;
};

/** Which path levels fold into "…": the range [from, to], or none. */
const foldOf = (depth: number, pinned: number, open: boolean): [number, number] | null => {
  if (open || pinned <= 0 || depth <= pinned) return null;
  return pinned === 1 ? [0, depth - 2] : [1, depth - pinned];
};

/** The rows to draw: every node on the path is opened in place, nothing else is. */
const rowsOf = (nodes: PathNode[], trail: PathNode[], pinned: number, open: boolean) => {
  const depth = trail.length;
  const here = depth - 1;
  const fold = foldOf(depth, pinned, open);
  const folded = (level: number) => fold != null && level >= fold[0] && level <= fold[1];
  const out: Row[] = [];
  let foldRow: FoldRow | undefined;

  const emit = (list: PathNode[], level: number, inside: boolean) => {
    for (const node of list) {
      const lit = trail[level] === node;
      if (folded(level)) {
        // Folded: the path node becomes part of the "…" row; its neighbours go with it, and say if they need you.
        if (!foldRow) {
          foldRow = { kind: 'fold', key: FOLD_KEY, level, lit: true, current: false, folded: trail.slice(fold![0], fold![1] + 1), needs: [] };
          out.push(foldRow);
        }
        if (lit) {
          if (node.needsYou) foldRow.needs.push(node.needsYou);
          emit(node.children ?? [], level + 1, false);
        } else needsIn(node, foldRow.needs);
        continue;
      }
      const current = lit && level === here;
      const distance: PathDistance = lit || inside || here < 0 ? 0 : (Math.min(3, here - level + 1) as PathDistance);
      const opened = lit && Boolean(node.children?.length);
      const needs = opened ? (node.needsYou ? [node.needsYou] : []) : needsIn(node);
      out.push({ kind: 'node', key: node.id, node, level, lit, current, inside, distance, needs });
      if (opened) emit(node.children!, level + 1, current);
    }
  };
  emit(nodes, 0, false);

  if (pinned > 0) {
    // The breadcrumb: the top row and the last `pinned - 1`, with "…" between when the middle is folded.
    const keep = (level: number) => (pinned === 1 ? level === here : level === 0 || level > here - pinned + 1);
    let pin = 0;
    for (const row of out) if (row.lit && (row.kind === 'fold' || keep(row.level))) row.pin = pin++;
  }
  return out;
};

/** A piece of the lit line, at the indent of the row it comes down from. */
interface Guide {
  level: number;
  /** How many indents the line crosses at its foot, to reach the next lit row. */
  span: number;
  /** `start`: from the middle of the lit row down; `through`: the whole row; `end`: down to the middle, then across to the lit child. */
  part: 'start' | 'through' | 'end';
}

/** Where the lit line runs: from each lit row down to the next lit row inside it. */
const guidesOf = (rows: Row[]) => {
  const out: Guide[][] = rows.map(() => []);
  rows.forEach((row, i) => {
    if (!row.lit || row.current) return;
    const j = rows.findIndex((r, k) => k > i && r.lit && r.level > row.level);
    if (j < 0) return;
    const span = rows[j]!.level - row.level;
    out[i]!.push({ level: row.level, span, part: 'start' });
    for (let k = i + 1; k < j; k++) out[k]!.push({ level: row.level, span, part: 'through' });
    out[j]!.push({ level: row.level, span, part: 'end' });
  });
  return out;
};

/**
 * The navigation path (PDR-010): a tree that opens the thing you chose in
 * place, so only the path you took is lit, joined by a line from the top down
 * to where you are.
 *
 * The rows beside the path dim by how far they are from where you are: what's
 * inside the current one stays at full strength, its neighbours dim one step,
 * its parent's neighbours two, and anything further three (`data-distance` on
 * each row, 0 to 3). Nothing is hidden: dimmed rows stay where they were,
 * readable, and come back to full strength on hover and focus.
 *
 * The path's rows stay pinned to the top of the scrolling rail as the
 * breadcrumb (see `pinned`). The current row is `aria-current="location"`.
 *
 * Keys follow the tree pattern: ↑ ↓ move, → goes into the row (opens it), ←
 * goes to its parent, Home and End jump, Enter opens. On the current row ←
 * walks back: it opens the parent. Backspace walks back from anywhere.
 * Right-click (or the context-menu key) opens the row's radial menu.
 */
export function PathTree({ label, nodes, path, onOpen, ringFor, light = 'path', pinned = 3, foldedLabel = defaultFoldedLabel }: PathTreeProps) {
  const pathKey = path.join('\u0000');
  const [openFor, setOpenFor] = useState<string | null>(null);
  const trail = walk(nodes, path);
  const rows = rowsOf(nodes, trail, pinned, openFor === pathKey);
  const guides = guidesOf(rows);
  const currentKey = rows.find((r) => r.current)?.key ?? rows[0]?.key;
  const [focus, setFocus] = useState<string | null>(null);
  const refs = useRef(new Map<string, HTMLDivElement>());
  const pending = useRef<string | null>(null);
  const at = focus != null && rows.some((r) => r.key === focus) ? focus : currentKey;

  // Pinned rows stack: each sticks just under the ones above it, whatever their height.
  useLayoutEffect(() => {
    let top = 0;
    for (const row of rows) {
      if (row.pin == null) continue;
      const el = refs.current.get(row.key);
      if (!el) continue;
      el.style.top = `${top}px`;
      top += el.offsetHeight;
    }
    if (pending.current) {
      const el = refs.current.get(pending.current);
      if (el) {
        el.focus();
        pending.current = null;
      }
    }
  });

  const go = (key: string | undefined) => {
    if (key == null) return;
    setFocus(key);
    const el = refs.current.get(key);
    if (el) el.focus();
    else pending.current = key;
  };
  const parentOf = (i: number) => {
    for (let j = i - 1; j >= 0; j--) if (rows[j]!.level < rows[i]!.level) return j;
    return -1;
  };
  /** Walk back up the path: open the current one's parent. */
  const back = () => {
    const parent = trail.at(-2);
    if (!parent) return;
    onOpen(parent);
    go(parent.id);
  };
  const unfold = () => {
    setOpenFor(pathKey);
    go(trail[foldOf(trail.length, pinned, false)?.[0] ?? 0]?.id);
  };
  const onKey = (e: KeyboardEvent, i: number) => {
    const row = rows[i]!;
    if (e.key === 'ArrowDown') go(rows[Math.min(i + 1, rows.length - 1)]?.key);
    else if (e.key === 'ArrowUp') go(rows[Math.max(i - 1, 0)]?.key);
    else if (e.key === 'Home') go(rows[0]?.key);
    else if (e.key === 'End') go(rows.at(-1)?.key);
    else if (e.key === 'Backspace') back();
    else if (e.key === 'ArrowLeft') {
      if (row.current) back();
      else {
        const p = parentOf(i);
        if (p >= 0) go(rows[p]!.key);
      }
    } else if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
      if (row.kind === 'fold') unfold();
      else if (e.key === 'ArrowRight' && row.lit && row.node.children?.length) go(rows[i + 1]?.key);
      else if (!row.current) onOpen(row.node);
    } else return;
    e.preventDefault();
  };

  return (
    <div className="quill-tree quill-path-tree" role="tree" aria-label={label} data-light={light}>
      {rows.map((row, i) => {
        const common = {
          rowRef: (el: HTMLDivElement | null) => void (el ? refs.current.set(row.key, el) : refs.current.delete(row.key)),
          tabbable: row.key === at,
          onKey: (e: KeyboardEvent<HTMLDivElement>) => onKey(e, i),
          onFocus: () => setFocus(row.key),
          guides: guides[i]!,
        };
        return row.kind === 'fold' ? (
          <FoldItem key={row.key} row={row} label={foldedLabel(row.folded)} onUnfold={unfold} {...common} />
        ) : (
          <TreeRow key={row.key} row={row} ringFor={ringFor} onOpen={onOpen} {...common} />
        );
      })}
    </div>
  );
}

interface RowProps {
  rowRef: (el: HTMLDivElement | null) => void;
  tabbable: boolean;
  onKey: (e: KeyboardEvent<HTMLDivElement>) => void;
  onFocus: () => void;
  guides: Guide[];
}

function Lines({ guides }: { guides: Guide[] }) {
  return guides.map((g) => (
    <span
      key={`${g.level}-${g.part}`}
      className="quill-tree-line"
      aria-hidden="true"
      data-part={g.part}
      style={{ '--line-level': g.level, '--line-span': g.span } as CSSProperties}
    />
  ));
}

/** The sentence of what needs the person, under the row's name. */
function Needs({ id, needs }: { id: string; needs: string[] }) {
  return needs.length ? (
    <span id={id} className="quill-tree-needs">
      {needs.join(' ')}
    </span>
  ) : null;
}

function FoldItem({ row, label, onUnfold, rowRef, tabbable, onKey, onFocus, guides }: RowProps & { row: FoldRow; label: string; onUnfold: () => void }) {
  const needsId = useId();
  const names = row.folded.map((n) => n.label).join(', ');
  return (
    <div
      ref={rowRef}
      role="treeitem"
      aria-level={row.level + 1}
      aria-expanded={false}
      aria-label={`${label}: ${names}`}
      aria-describedby={row.needs.length ? needsId : undefined}
      tabIndex={tabbable ? 0 : -1}
      className="quill-tree-row quill-tree-lit quill-tree-fold"
      data-distance={0}
      data-level={row.level}
      data-pinned={row.pin != null ? row.pin : undefined}
      data-needs={row.needs.length ? '' : undefined}
      style={{ '--tree-level': row.level } as CSSProperties}
      onKeyDown={onKey}
      onFocus={onFocus}
      onClick={onUnfold}
    >
      <Lines guides={guides} />
      <span className="quill-tree-dot" aria-hidden="true" />
      <span className="quill-tree-text">
        <span className="quill-tree-label">
          <span aria-hidden="true">{'… '}</span>
          {label}
        </span>
        <Needs id={needsId} needs={row.needs} />
      </span>
    </div>
  );
}

function TreeRow({ row, ringFor, onOpen, rowRef, tabbable, onKey, onFocus, guides }: RowProps & { row: NodeRow; ringFor?: (node: PathNode) => RingSubject | undefined; onOpen: (node: PathNode) => void }) {
  const { node, level, lit, current } = row;
  const ring = useRingTarget(() => ringFor?.(node));
  const keys = ring.onKeyDown;
  const id = useId();
  const described = [row.needs.length ? `${id}-needs` : '', node.locked ? `${id}-why` : ''].filter(Boolean).join(' ');
  return (
    <div
      ref={rowRef}
      role="treeitem"
      aria-level={level + 1}
      aria-labelledby={node.count != null ? `${id}-label ${id}-count` : `${id}-label`}
      aria-expanded={node.children?.length ? lit : undefined}
      aria-current={current ? 'location' : undefined}
      aria-selected={current}
      aria-disabled={node.locked ? true : undefined}
      aria-describedby={described || undefined}
      tabIndex={tabbable ? 0 : -1}
      className={cx('quill-tree-row', lit ? 'quill-tree-lit' : undefined, row.inside ? 'quill-tree-inside' : undefined)}
      data-current={current ? '' : undefined}
      data-level={level}
      data-distance={row.distance}
      data-pinned={row.pin != null ? row.pin : undefined}
      data-needs={row.needs.length ? '' : undefined}
      style={{ '--tree-level': level } as CSSProperties}
      {...ring}
      onKeyDown={(e) => {
        keys(e);
        if (!e.defaultPrevented) onKey(e);
      }}
      onFocus={onFocus}
      onClick={() => {
        if (!current) onOpen(node);
      }}
    >
      <Lines guides={guides} />
      <span className="quill-tree-dot" aria-hidden="true" />
      {node.icon ? <Icon name={node.locked ? 'lock' : node.icon} size={16} className="quill-tree-icon" /> : null}
      <span className="quill-tree-text">
        <span id={`${id}-label`} className="quill-tree-label">
          {node.label}
        </span>
        <Needs id={`${id}-needs`} needs={row.needs} />
      </span>
      {node.count != null ? <span id={`${id}-count`} className="quill-tree-count">
          {node.count}
        </span> : null}
      {node.locked ? (
        <span id={`${id}-why`} role="tooltip" className="augur-reason">
          {node.locked}
        </span>
      ) : null}
    </div>
  );
}
