import { useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  columnFilteringFeature,
  createFilteredRowModel,
  createSortedRowModel,
  globalFilteringFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type FilterFn,
} from '@tanstack/react-table';
import {
  Cell,
  Column,
  GridList,
  GridListItem,
  Row as AriaRow,
  Table as AriaTable,
  TableBody,
  TableHeader,
  ListLayout,
  TableLayout,
  Virtualizer,
  Checkbox as AriaCheckbox,
  type Selection,
  type SortDescriptor,
} from 'react-aria-components';
import { Button, Icon, SearchField, Status, cx, statusUrgency, type IconName, type StatusName } from '@augur/kit-common';
import { State } from './states.js';
import { RingMore, useRingTarget, type RingSubject } from './radial-menu.js';
import { writeDate, type AppFormats } from './formats.js';
import { useFormats } from './react-app.js';

/** A thing to do about one row, shown as a word at its end ("Approve", "Open"). */
export interface ListAction {
  id: string;
  label: string;
  disabled?: boolean;
  /** Why it can't be used, in one sentence. */
  reason?: string;
}

export interface ListItem {
  id: string;
  title: string;
  /** One line under the title. */
  detail?: string;
  /** A time or a count at the end. */
  meta?: string;
  /** The lead mark: `needs` is green, and the first that needs you pings. */
  status?: StatusName;
  /** A kit icon for the lead mark instead of a status. */
  icon?: IconName;
  /** Rows with the same group sit under one header, in the order they first appear. */
  group?: string;
  /** At most two, at the row's end. */
  actions?: ListAction[];
  /** Shown dimmed, can't be opened. */
  disabled?: boolean;
  /** Why it can't be opened; it takes the detail line's place. */
  reason?: string;
  /** More about the row, folded under it: a chevron at its end opens it in place (an expanding row). */
  more?: ReactNode;
}

export interface ListProps {
  label: string;
  /** What a row is, one and many. */
  noun?: [string, string];
  items: ListItem[];
  density?: 'comfortable' | 'compact';
  loading?: boolean;
  /** Couldn't load: said in red with Try again, in place of the rows. */
  error?: string;
  /** Said when there are no rows. */
  empty?: string;
  /** Whether to show the bar that counts the rows. */
  bar?: boolean;
  /** `well`: rows in a well (Key). `plain`: no well, a hairline under each row, for a short list inside a page. */
  look?: 'well' | 'plain';
  /** The word on an expanding row's chevron, read aloud with the row's title: "More about". */
  moreLabel?: string;
  onOpen?: (item: ListItem) => void;
  onAction?: (item: ListItem, action: ListAction) => void;
  onRetry?: () => void;
  /**
   * What the radial menu offers on a row: right-click or a long press on it, or its "more" mark. Leave out
   * for no menu. Inside a RingProvider (AppFrame has one); outside one, nothing is drawn.
   */
  ringFor?: (item: ListItem) => RingSubject | undefined;
  /**
   * For long lists: draw only the rows in view (React Aria's virtualizer), so thousands of rows stay
   * quick. Rows keep the density's fixed height, and the list scrolls inside itself past
   * `measure-list-virtual`. It takes effect only when no row has a `group` or `more`, which need
   * rows of their own height; such a list draws every row.
   */
  virtual?: boolean;
  className?: string;
}

/** Row heights in px for the virtualizer; they match `.quill-list-row`'s min-height in kit.css. */
const LIST_ROW_HEIGHT = { comfortable: 60, compact: 44 } as const;

/** A row's words and controls, opening the radial menu where the row has one. */
function RowRing({ ring, children }: { ring: () => RingSubject | undefined; children: ReactNode }) {
  const target = useRingTarget(ring);
  // Keys stay with the grid row; the "more" mark is the keyboard's way in.
  const { onKeyDown: _keys, ...pointer } = target;
  return (
    <span className="quill-list-ring" {...pointer}>
      {children}
      <RingMore subject={ring} />
    </span>
  );
}

/**
 * Things you can act on, one per row: a lead mark, a title, a line of detail,
 * a time or count at the end, then the row's own actions as words. A row with
 * `more` folds it under itself and opens it in place from the chevron at its
 * end. `look="plain"` drops the well for a short list inside a page. The first
 * row that needs you pings; the rest are a still green. Arrows, Home, End and
 * Enter come from React Aria's grid list.
 */
export function List({ label, noun = ['item', 'items'], items, density = 'comfortable', loading, error, empty = 'Nothing here.', bar = true, look = 'well', moreLabel = 'More about', onOpen, onAction, onRetry, ringFor, virtual, className }: ListProps) {
  const [unfolded, setUnfolded] = useState<ReadonlySet<string>>(new Set());
  const fold = (id: string) =>
    setUnfolded((was) => {
      const next = new Set(was);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const [one, many] = noun;
  const count = items.length;
  const head = bar ? <div className="quill-list-bar quill-label">{loading ? `${many}…` : `${count} ${count === 1 ? one : many}`}</div> : null;
  const virtualRows = Boolean(virtual && !loading && !error && count && items.every((i) => i.group === undefined && i.more === undefined));
  const wrap = (body: ReactNode) => (
    <div className={cx('quill-list', className)} data-density={density} data-look={look} data-virtual={virtualRows ? '' : undefined}>
      {head}
      {body}
    </div>
  );
  if (loading)
    return wrap(
      <div role="status" aria-busy="true" aria-label={label}>
        <span className="quill-list-skel" />
        <span className="quill-list-skel" />
        <span className="quill-list-skel" />
      </div>,
    );
  if (error) return wrap(<State kind="error" heading={error} body="Nothing was changed." action="Try again" onAction={onRetry} />);
  if (!count) return wrap(<State heading={empty} />);
  const groups: [string | undefined, ListItem[]][] = [];
  for (const item of items) {
    const g = groups.find(([name]) => name === item.group);
    if (g) g[1].push(item);
    else groups.push([item.group, [item]]);
  }
  const pinging = items.find((i) => i.status === 'needs' && !i.disabled)?.id;
  const row = (item: ListItem) => (
    <GridListItem key={item.id} id={item.id} textValue={item.title} className="quill-list-row" data-disabled-row={item.disabled ? '' : undefined}>
      {(() => {
        const content = (
          <>
          {item.icon && !item.status ? (
            <Icon name={item.icon} size={16} className="quill-list-icon" />
          ) : (
            <span className="quill-list-lead" data-status={item.status} data-first={item.id === pinging ? '' : undefined} aria-hidden="true" />
          )}
          <span className="quill-list-text">
            <b>{item.title}</b>
            {item.disabled && item.reason ? <span className="quill-list-why">{item.reason}</span> : item.detail ? <span>{item.detail}</span> : null}
          </span>
          {item.meta ? <span className="quill-list-meta">{item.meta}</span> : null}
          {item.more !== undefined ? (
            <button
              type="button"
              className="quill-list-fold"
              aria-expanded={unfolded.has(item.id)}
              aria-label={`${moreLabel} ${item.title}`}
              onClick={(e) => {
                e.stopPropagation();
                fold(item.id);
              }}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <Icon name="chevron-down" size={16} />
            </button>
          ) : null}
          {(item.actions ?? []).slice(0, 2).map((action, i) => {
            const off = Boolean(item.disabled || action.disabled);
            return (
              <Button
                key={action.id}
                kind={i === 0 && item.status === 'needs' && !off ? 'secondary' : 'ghost'}
                size="sm"
                disabled={off}
                reason={action.disabled ? action.reason : item.reason}
                aria-label={`${action.label}: ${item.title}`}
                onPress={() => onAction?.(item, action)}
              >
                {action.label}
              </Button>
            );
          })}
          </>
        );
        const row = ringFor ? <RowRing ring={() => ringFor(item)}>{content}</RowRing> : content;
        return item.more !== undefined && unfolded.has(item.id) ? (
          <>
            <span className="quill-list-line">{row}</span>
            <div className="quill-list-more">{item.more}</div>
          </>
        ) : (
          row
        );
      })()}
    </GridListItem>
  );
  if (virtualRows)
    return wrap(
      <Virtualizer layout={ListLayout} layoutOptions={{ rowHeight: LIST_ROW_HEIGHT[density] }}>
        <GridList
          aria-label={label}
          className="quill-list-rows"
          items={items}
          dependencies={[onAction, ringFor, pinging, moreLabel]}
          disabledKeys={items.filter((r) => r.disabled).map((r) => r.id)}
          onAction={(key) => {
            const item = items.find((r) => r.id === key);
            if (item && !item.disabled) onOpen?.(item);
          }}
        >
          {row}
        </GridList>
      </Virtualizer>,
    );
  return wrap(
    groups.map(([name, rows]) => (
      <div key={name ?? ''}>
        {name !== undefined ? (
          <div className="quill-list-group quill-label" data-needs={rows.every((r) => r.status === 'needs') ? '' : undefined}>
            {name}
          </div>
        ) : null}
        <GridList
          aria-label={name ?? label}
          className="quill-list-rows"
          disabledKeys={rows.filter((r) => r.disabled).map((r) => r.id)}
          onAction={(key) => {
            const item = rows.find((r) => r.id === key);
            if (item && !item.disabled) onOpen?.(item);
          }}
        >
          {rows.map(row)}
        </GridList>
      </div>
    )),
  );
}

export interface TableColumn<R extends TableRow = TableRow> {
  key: string;
  label: string;
  kind?: 'text' | 'number' | 'date' | 'status';
  align?: 'start' | 'end';
  wrap?: boolean;
  sortable?: boolean;
  /** First sort direction for this column. */
  sortFirst?: 'asc' | 'desc';
  /** Custom cell content. */
  format?: (value: unknown, row: R) => ReactNode;
  /** Plain text used for filtering and sorting when `format` returns markup. */
  text?: (value: unknown, row: R) => string;
}

export interface TableRow {
  id: string;
  [key: string]: unknown;
}

export interface TableSort {
  key: string;
  dir: 'asc' | 'desc';
}

/** "4 min ago", "3 h ago", "2 d ago", or ahead "in 4 min", "in 3 h", "in 2 d", then the date. */
export const relativeTime = (value: unknown, now = Date.now(), formats: AppFormats = {}): string => {
  const t = value instanceof Date ? value.getTime() : Date.parse(String(value));
  if (Number.isNaN(t)) return String(value ?? '');
  const mins = Math.abs(Math.round((now - t) / 60000));
  const away = (n: number, unit: string) => (t > now ? `in ${n} ${unit}` : `${n} ${unit} ago`);
  if (mins < 1) return 'just now';
  if (mins < 60) return away(mins, 'min');
  const hours = Math.round(mins / 60);
  if (hours < 24) return away(hours, 'h');
  const days = Math.round(hours / 24);
  if (days < 30) return away(days, 'd');
  return writeDate(t, { dateStyle: 'medium' }, formats);
};

/** Sort comparison for one column: status by urgency, numbers and dates by value, text by locale. */
export const compareBy = <R extends TableRow>(column: TableColumn<R>, a: R, b: R): number => {
  const av = a[column.key];
  const bv = b[column.key];
  if (column.kind === 'status') return statusUrgency.indexOf(av as StatusName) - statusUrgency.indexOf(bv as StatusName);
  if (column.kind === 'number') return Number(av) - Number(bv);
  if (column.kind === 'date') return Date.parse(String(av)) - Date.parse(String(bv));
  const at = column.text ? column.text(av, a) : String(av ?? '');
  const bt = column.text ? column.text(bv, b) : String(bv ?? '');
  return at.localeCompare(bt, undefined, { numeric: true, sensitivity: 'base' });
};

export interface TableProps<R extends TableRow = TableRow> {
  label?: string;
  /** Plural noun for the count bar ("documents"). */
  noun?: string;
  columns: TableColumn<R>[];
  rows: R[];
  /** The starting sort; the table keeps its own after that. */
  sort?: TableSort | null;
  onSort?: (sort: TableSort | null) => void;
  selectable?: boolean;
  selected?: string[];
  onSelect?: (ids: string[]) => void;
  density?: 'default' | 'compact';
  filterable?: boolean;
  loading?: boolean;
  error?: string;
  empty?: string;
  onOpen?: (row: R) => void;
  onRetry?: () => void;
  /** Buttons in the bar, before the filter. */
  actions?: ReactNode;
  /**
   * For long lists: draw only the rows in view (React Aria's virtualizer), so
   * thousands of rows stay quick. Rows keep one line at the density's fixed
   * height (`wrap` columns truncate instead of wrapping) and the columns share
   * the width, the first taking the most. The table scrolls with the page, or
   * inside a container whose height you bound. Off by default; loading, error
   * and empty states look the same either way.
   */
  virtual?: boolean;
  /**
   * For long tables that shouldn't scroll: show this many rows at a time, with the count and Back and On
   * keys under them. Filtering and sorting cover every row; a new filter or sort goes back to the first
   * page. Takes the place of `virtual` when both are set.
   */
  pageSize?: number;
  className?: string;
}

/** Row and header heights in px for the virtualizer; they match `.quill-table-cell` and `.quill-table-head` in kit.css. */
const ROW_HEIGHT = { default: 56, compact: 40 } as const;
const HEAD_HEIGHT = 44;
/** In a virtual table: the first column's share of the width, and the selection column's own width (its box and padding). */
const PRIMARY_WIDTH = '40%';
const SELECT_WIDTH = 52;

/** Filtering then sorting, from TanStack Table's row model. None of its types leave this file. */
const rowFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
});
type RowFeatures = typeof rowFeatures;

/** The rows to show: those matching the (lower-cased) filter, in the sort's order; ties keep the given order. */
function useShownRows<R extends TableRow>(rows: R[], columns: TableColumn<R>[], sort: TableSort | null, q: string): R[] {
  const defs = useMemo(
    () =>
      columns.map(
        (c): ColumnDef<RowFeatures, R> => ({
          id: c.key,
          accessorFn: (row: R) => row[c.key] as never,
          sortFn: (a, b) => compareBy(c, a.original, b.original),
          sortUndefined: false,
        }),
      ),
    [columns],
  );
  const matches = useCallback<FilterFn<RowFeatures, R>>(
    (row, id, value: string) => {
      const c = columns.find((x) => x.key === id);
      const v = row.original[id];
      return (c?.text ? c.text(v, row.original) : String(v ?? '')).toLowerCase().includes(value);
    },
    [columns],
  );
  const sortKey = sort && columns.some((c) => c.key === sort.key) ? sort.key : undefined;
  const desc = sort?.dir === 'desc';
  const sorting = useMemo(() => (sortKey ? [{ id: sortKey, desc }] : []), [sortKey, desc]);
  const table = useTable({
    features: rowFeatures,
    columns: defs,
    data: rows,
    getRowId: (row) => row.id,
    globalFilterFn: matches,
    state: { sorting, globalFilter: q || undefined },
  });
  return table.getRowModel().rows.map((r) => r.original);
}

/**
 * Many things compared by the same fields. The first column takes the spare
 * width and truncates. Sortable headers cycle ascending, descending, cleared;
 * status sorts by urgency. Keyboard, selection and sorting come from React
 * Aria's table; filtering and sorting the rows from TanStack Table. Set
 * `virtual` for long lists.
 */
export function Table<R extends TableRow = TableRow>({
  label,
  noun = 'rows',
  columns,
  rows,
  sort: initialSort = null,
  onSort,
  selectable,
  selected: selectedIds,
  onSelect,
  density = 'default',
  filterable,
  loading,
  error,
  empty = 'Nothing here yet.',
  onOpen,
  onRetry,
  actions,
  virtual,
  pageSize,
  className,
}: TableProps<R>) {
  const [sort, setSort] = useState<TableSort | null>(initialSort);
  const [own, setOwn] = useState<Set<string>>(new Set());
  const [filtering, setFiltering] = useState(false);
  const [filter, setFilter] = useState('');
  const selected = selectedIds ? new Set(selectedIds) : own;
  const q = filter.trim().toLowerCase();
  const visible = useShownRows(rows, columns, sort, q);
  const [page, setPage] = useState(0);
  const paged = Boolean(pageSize && pageSize > 0);
  const size = paged ? Math.floor(pageSize!) || 1 : visible.length;
  const pages = paged ? Math.max(1, Math.ceil(visible.length / size)) : 1;
  const at = Math.min(page, pages - 1);
  const shown = paged ? visible.slice(at * size, (at + 1) * size) : visible;
  const sortBy = (key: string) => {
    const c = columns.find((x) => x.key === key);
    if (!c) return;
    const first = c.sortFirst ?? 'asc';
    const second = first === 'asc' ? 'desc' : 'asc';
    const next: TableSort | null = !sort || sort.key !== key ? { key, dir: first } : sort.dir === first ? { key, dir: second } : null;
    setSort(next);
    setPage(0);
    onSort?.(next);
  };
  const select = (keys: Selection) => {
    const ids = keys === 'all' ? visible.map((r) => r.id) : [...keys].map(String);
    if (!selectedIds) setOwn(new Set(ids));
    onSelect?.(ids);
  };
  const countText = selected.size ? `${selected.size} selected` : q ? `${visible.length} of ${rows.length} ${noun}` : `${rows.length} ${noun}`;
  const span = columns.length + (selectable ? 1 : 0);
  const end = (c: TableColumn<R>) => c.align === 'end' || c.kind === 'number';
  const formats = useFormats();
  const count = (n: number) => {
    try {
      return n.toLocaleString(formats.locale);
    } catch {
      return n.toLocaleString();
    }
  };
  const cell = (c: TableColumn<R>, row: R): ReactNode => {
    const value = row[c.key];
    if (c.format) return c.format(value, row);
    if (c.kind === 'status') return <Status status={String(value) as StatusName} />;
    if (c.kind === 'date') {
      const exact = new Date(String(value));
      return (
        <time dateTime={String(value)} title={Number.isNaN(exact.getTime()) ? undefined : writeDate(exact, { dateStyle: 'medium', timeStyle: 'short' }, formats)}>
          {relativeTime(value, Date.now(), formats)}
        </time>
      );
    }
    return String(value ?? '');
  };
  const descriptor: SortDescriptor | undefined = sort ? { column: sort.key, direction: sort.dir === 'asc' ? 'ascending' : 'descending' } : undefined;
  const stateRow = (body: ReactNode, tone?: 'error') => (
    <AriaRow id="__state" className="quill-table-state-row">
      <Cell colSpan={span} className="quill-table-state" data-error={tone ? '' : undefined}>
        {body}
      </Cell>
    </AriaRow>
  );
  let body: ReactNode;
  if (loading)
    body = [0, 1, 2].map((i) => (
      <AriaRow key={`skel-${i}`} id={`__skel-${i}`} className="quill-table-skel">
        {Array.from({ length: span }, (_, j) => (
          <Cell key={j}>
            <span className="quill-skel" />
          </Cell>
        ))}
      </AriaRow>
    ));
  else if (error)
    body = stateRow(
      <>
        <p>{error}</p>
        <Button kind="secondary" size="sm" onPress={onRetry}>
          Try again
        </Button>
      </>,
      'error',
    );
  else if (!rows.length) body = stateRow(<p>{empty}</p>);
  else if (!visible.length)
    body = stateRow(
      <>
        <p>Nothing matches “{filter}”.</p>
        <Button kind="tertiary" onPress={() => setFilter('')}>
          Clear the filter
        </Button>
      </>,
    );
  const virtualRows = Boolean(virtual && !paged && !loading && !error && visible.length);
  const renderRow = (row: R) => (
    <AriaRow key={row.id} id={row.id} className="quill-table-row">
      {selectable ? (
        <Cell className="quill-table-sel">
          <AriaCheckbox slot="selection" aria-label="Select" className="quill-check">
            <span className="quill-check-box" aria-hidden="true">
              <Icon name="check" size={12} />
            </span>
          </AriaCheckbox>
        </Cell>
      ) : null}
      {columns.map((c, i) => (
        <Cell key={c.key} className="quill-table-cell" data-primary={i === 0 ? '' : undefined} data-end={end(c) ? '' : undefined} data-num={c.kind === 'number' ? '' : undefined} data-wrap={c.wrap ? '' : undefined}>
          {cell(c, row)}
        </Cell>
      ))}
    </AriaRow>
  );
  if (!body && !virtualRows) body = shown.map(renderRow);
  return (
    <div className={cx('quill-table', className)} data-density={density} data-virtual={virtualRows ? '' : undefined}>
      <div className="quill-table-bar">
        <span className="quill-label" aria-live="polite">
          {countText}
        </span>
        {actions}
        {filterable ? (
          filtering ? (
            <SearchField
              className="quill-table-filter"
              label={`Filter ${noun}`}
              value={filter}
              autoFocus
              onChange={(next) => {
                setFilter(next);
                setPage(0);
              }}
              onKeyDown={(e) => {
                if (e.key !== 'Escape') return;
                e.preventDefault();
                if (filter) {
                  setFilter('');
                  setPage(0);
                }
                else setFiltering(false);
              }}
            />
          ) : (
            <button type="button" className="quill-table-find" aria-label={`Filter ${noun}`} onClick={() => setFiltering(true)}>
              <Icon name="find" size={16} />
            </button>
          )
        ) : null}
      </div>
      <div className="quill-table-wrap">
        <Virtualized on={virtualRows} rowHeight={ROW_HEIGHT[density]}>
          <AriaTable
            className="quill-table-grid"
            aria-label={label || noun}
            aria-busy={loading || undefined}
            selectionMode={selectable ? 'multiple' : 'none'}
            selectionBehavior="toggle"
            selectedKeys={selected}
            onSelectionChange={select}
            sortDescriptor={descriptor}
            onSortChange={(d) => sortBy(String(d.column))}
            onRowAction={(key) => {
              const row = visible.find((r) => r.id === key);
              if (row) onOpen?.(row);
            }}
          >
            <TableHeader>
              {selectable ? (
                <Column className="quill-table-sel" defaultWidth={virtualRows ? SELECT_WIDTH : undefined} minWidth={virtualRows ? SELECT_WIDTH : undefined}>
                  <AriaCheckbox slot="selection" aria-label="Select all" className="quill-check">
                    <span className="quill-check-box" aria-hidden="true">
                      <Icon name="check" size={12} />
                    </span>
                  </AriaCheckbox>
                </Column>
              ) : null}
              {columns.map((c, i) => (
                <Column key={c.key} id={c.key} isRowHeader={i === 0} allowsSorting={c.sortable} defaultWidth={virtualRows && i === 0 ? PRIMARY_WIDTH : undefined} className="quill-table-head quill-label" data-primary={i === 0 ? '' : undefined} data-end={end(c) ? '' : undefined}>
                  {({ allowsSorting, sortDirection }) => (
                    <span className="quill-table-sort" data-on={sortDirection ? '' : undefined} data-dir={sortDirection}>
                      {c.label}
                      {allowsSorting ? <Icon name="chevron-down" size={14} /> : null}
                    </span>
                  )}
                </Column>
              ))}
            </TableHeader>
            {virtualRows ? (
              <TableBody items={visible} dependencies={[columns, selectable, density]}>
                {renderRow}
              </TableBody>
            ) : (
              <TableBody>{body}</TableBody>
            )}
          </AriaTable>
        </Virtualized>
      </div>
      {paged && !loading && !error && visible.length > size ? (
        <div className="quill-table-pager">
          <span className="quill-table-pages" aria-live="polite">
            {count(at * size + 1)}–{count(at * size + shown.length)} of {count(visible.length)}
          </span>
          <Button kind="secondary" size="sm" icon={<Icon name="back" size={16} />} disabled={at === 0} reason="This is the first page." aria-label={`Back: the ${noun} before these`} onPress={() => setPage(at - 1)}>
            Back
          </Button>
          <Button kind="secondary" size="sm" icon={<Icon name="arrow" size={16} />} disabled={at === pages - 1} reason="This is the last page." aria-label={`On: the next ${noun}`} onPress={() => setPage(at + 1)}>
            On
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/** Wraps the table in React Aria's virtualizer when on, so only the rows in view are drawn. */
function Virtualized({ on, rowHeight, children }: { on: boolean; rowHeight: number; children: ReactNode }) {
  if (!on) return <>{children}</>;
  return (
    <Virtualizer layout={TableLayout} layoutOptions={{ rowHeight, headingHeight: HEAD_HEIGHT }}>
      {children}
    </Virtualizer>
  );
}
