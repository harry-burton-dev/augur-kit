import { useState, type ReactNode } from 'react';
import { Button as AriaButton, Input, Menu, MenuItem, MenuTrigger, Popover, SearchField, type Key, type Selection } from 'react-aria-components';
import { Icon, cx, type IconName, type SelectOption } from '@augur/kit-common';

/** One way to narrow a list: its button in the bar, and the choices it opens. */
export interface FilterDef {
  id: string;
  /** The button's word, also said on each chip it puts up: "Tags". */
  label: string;
  options: (SelectOption & { icon?: IconName })[];
  /** One choice at a time, such as a time range: picking one replaces the last, and the list closes. */
  single?: boolean;
  /** A box at the top to narrow a long list of choices, such as tags. */
  search?: boolean;
}

/** What's chosen, by filter id. */
export type FilterValue = Record<string, string[]>;

/** Chosen values with any empty or unknown filter left out, so a value compares and saves cleanly. */
export const filterValue = (filters: readonly FilterDef[], value: FilterValue): FilterValue =>
  Object.fromEntries(filters.map((f) => [f.id, (value[f.id] ?? []).filter((v) => f.options.some((o) => o.value === v))]).filter(([, v]) => v.length));

export interface FilterBarProps {
  /** What the bar narrows, for screen readers: "Filter documents". */
  label: string;
  filters: FilterDef[];
  value: FilterValue;
  sorts?: SelectOption[];
  sort?: string;
  /** How many match; left out, no count shows. */
  count?: number;
  /** For the count: ['document', 'documents']. */
  noun?: [string, string];
  /** A new count is on its way: the old one dims. */
  busy?: boolean;
  onChange: (value: FilterValue, sort: string) => void;
  /** After the count: the page's own buttons, such as Save view. */
  actions?: ReactNode;
  /** Saved views, at the start of the line: "My open runs", "Failed this week". */
  views?: SelectOption[];
  /** The view on now, by value. */
  view?: string;
  /** A view was picked: the page sets its filters and sort from it. */
  onView?: (view: string) => void;
  className?: string;
}

/** One filter's (or the sort's) button and the choices it opens under it. */
function Choices({ id, label, options, chosen, single, search, button, onPick }: { id: string; label: string; options: FilterDef['options']; chosen: string[]; single?: boolean; search?: boolean; button: ReactNode; onPick: (values: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState('');
  const shown = word.trim() ? options.filter((o) => o.label.toLocaleLowerCase().includes(word.trim().toLocaleLowerCase())) : options;
  return (
    <MenuTrigger
      isOpen={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setWord('');
      }}
    >
      <AriaButton className="quill-filter-open" data-on={chosen.length && id !== 'sort' && id !== 'view' ? '' : undefined} aria-label={id === 'sort' || id === 'view' ? undefined : chosen.length ? `${label}, ${chosen.length} chosen` : label}>
        {button}
      </AriaButton>
      <Popover className="augur-popover augur-menu augur-sheet-list quill-filter-panel" placement="bottom start" offset={1}>
        <p className="augur-sheet-heading" aria-hidden="true">
          {label}
        </p>
        {search ? (
          <SearchField aria-label={`Find a ${label.toLocaleLowerCase()}`} value={word} onChange={setWord} className="quill-filter-find" autoFocus>
            <Input className="augur-input" placeholder="Find…" />
          </SearchField>
        ) : null}
        <Menu
          aria-label={label}
          className="outline-none"
          items={shown}
          selectionMode={single ? 'single' : 'multiple'}
          selectedKeys={chosen}
          disabledKeys={options.filter((o) => o.disabled).map((o) => o.value)}
          renderEmptyState={() => <p className="quill-filter-none">Nothing by that name.</p>}
          onSelectionChange={(keys: Selection) => {
            const next = keys === 'all' ? options.map((o) => o.value) : [...keys].map((k: Key) => String(k));
            onPick(single ? next.slice(-1) : next);
            if (single) setOpen(false);
          }}
        >
          {(o: FilterDef['options'][number]) => (
            <MenuItem id={o.value} textValue={o.label} className="augur-menu-item quill-filter-item">
              {({ isSelected }) => (
                <>
                  <span className="augur-option-mark" aria-hidden="true">
                    {isSelected ? <Icon name="check" size={14} /> : o.icon ? <Icon name={o.icon} size={14} /> : null}
                  </span>
                  <span className="augur-menu-name">
                    <span className="augur-menu-label">{o.label}</span>
                  </span>
                  {o.detail ? <em className="augur-option-detail">{o.detail}</em> : null}
                </>
              )}
            </MenuItem>
          )}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}

/** What a filter has on, in its own words: two at most, then how many more. */
const wordsFor = (f: FilterDef, chosen: string[]) => {
  const words = chosen.map((v) => f.options.find((o) => o.value === v)?.label).filter(Boolean) as string[];
  return words.length > 2 ? `${words.slice(0, 2).join(', ')} +${words.length - 2}` : words.join(', ');
};

/**
 * The bar above a long list, as one ruled line (picked 6 Nov 2026): saved views
 * at the start, then each way to narrow it as its name in small mono capitals
 * and what it has on in words ("any" when nothing), how many match, the sort,
 * and room for the page's own actions (Save view). Press a part to drop its
 * Sheet of choices under it; nothing else needs a row of chips. One press
 * clears everything. The bar holds no list itself; it says what changed and
 * the page asks again. Keys come from React Aria's menu: arrows move, Enter or
 * Space picks, Esc closes and goes back to the part.
 */
export function FilterBar({ label, filters, value, sorts = [], sort = '', count, noun = ['item', 'items'], busy, onChange, actions, views = [], view, onView, className }: FilterBarProps) {
  const anyOn = filters.some((f) => (value[f.id] ?? []).length);
  const sortLabel = sorts.find((s) => s.value === sort)?.label ?? sorts[0]?.label;
  const viewLabel = views.find((v) => v.value === view)?.label;
  const set = (id: string, values: string[]) => onChange(filterValue(filters, { ...value, [id]: values }), sort);
  return (
    <div className={cx('quill-filter-bar', className)} data-busy={busy || undefined}>
      <div className="quill-filter-row" role="group" aria-label={label}>
        {views.length ? (
          <Choices
            id="view"
            label="Saved views"
            options={views}
            chosen={view ? [view] : []}
            single
            onPick={(v) => v[0] && onView?.(v[0])}
            button={
              <>
                <span className="quill-filter-key">View</span>
                <span className="quill-filter-words quill-filter-view">{viewLabel ?? <span className="quill-filter-any">none</span>}</span>
              </>
            }
          />
        ) : null}
        {filters.map((f) => {
          const chosen = value[f.id] ?? [];
          return (
            <Choices
              key={f.id}
              id={f.id}
              label={f.label}
              options={f.options}
              chosen={chosen}
              single={f.single}
              search={f.search}
              onPick={(v) => set(f.id, v)}
              button={
                <>
                  <span className="quill-filter-key">{f.label}</span>
                  <span className="quill-filter-words">{chosen.length ? wordsFor(f, chosen) : <span className="quill-filter-any">any</span>}</span>
                </>
              }
            />
          );
        })}
        <div className="quill-filter-end">
          {anyOn ? (
            <button type="button" className="quill-filter-clear" onClick={() => onChange({}, sort)}>
              Clear all
            </button>
          ) : null}
          {count === undefined ? null : (
            <span className="quill-filter-count" aria-live="polite">
              {count} {count === 1 ? noun[0] : noun[1]}
            </span>
          )}
          {sorts.length ? (
            <Choices
              id="sort"
              label="Sort"
              options={sorts}
              chosen={[sort || sorts[0]!.value]}
              single
              onPick={(v) => v[0] && onChange(value, v[0])}
              button={
                <>
                  <span className="quill-filter-key">Sort</span>
                  <span className="quill-filter-words">{sortLabel}</span>
                </>
              }
            />
          ) : null}
          {actions}
        </div>
      </div>
    </div>
  );
}
