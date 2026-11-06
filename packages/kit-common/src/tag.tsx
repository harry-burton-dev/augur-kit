import { useState } from 'react';
import { cx } from './cx.js';
import { Icon, type IconName } from './icon.js';

export interface TagProps {
  label: string;
  /** A kit icon before the word. */
  icon?: IconName;
  /** With it, the tag carries its own ×. */
  onRemove?: () => void;
  /** What the × says it removes, when the label alone isn't enough. */
  removeLabel?: string;
  /** No line round it: for a row's list of tags. */
  quiet?: boolean;
  className?: string;
}

/** A word something is filed under, as a small key. */
export function Tag({ label, icon, onRemove, removeLabel, quiet, className }: TagProps) {
  return (
    <span className={cx('augur-tag', className)} data-quiet={quiet ? '' : undefined} data-removable={onRemove ? '' : undefined}>
      {icon ? <Icon name={icon} size={12} /> : null}
      <span className="augur-tag-word">{label}</span>
      {onRemove ? (
        <button type="button" aria-label={`Remove ${removeLabel || label}`} onClick={onRemove}>
          <Icon name="close" size={12} />
        </button>
      ) : null}
    </span>
  );
}

/** One tag in a set: a Tag's props, with a key of its own. */
export type TagItem = Omit<TagProps, 'className' | 'quiet'> & { id: string };

export interface TagsProps {
  items: TagItem[];
  /** How many show before the rest fold behind "+N more"; 0 shows them all. */
  limit?: number;
  /** Every tag in the set without a line round it. */
  quiet?: boolean;
  /** What the set is, read aloud ("Topics"). */
  label?: string;
  /** The words on the fold, for a count of hidden tags. */
  moreLabel?: (hidden: number) => string;
  /** The words that fold them away again. */
  fewerLabel?: string;
  className?: string;
}

/**
 * Several tags in a row, wrapping onto the next line. Past `limit`, the rest fold behind one
 * "+N more" key that opens them in place, so a long set never pushes what's below out of sight.
 */
export function Tags({ items, limit = 0, quiet, label, moreLabel = (n) => `+${n} more`, fewerLabel = 'Fewer', className }: TagsProps) {
  const [open, setOpen] = useState(false);
  const folds = limit > 0 && items.length > limit;
  const shown = folds && !open ? items.slice(0, limit) : items;
  return (
    <ul className={cx('augur-tags', className)} aria-label={label}>
      {shown.map(({ id, ...tag }) => (
        <li key={id}>
          <Tag {...tag} quiet={quiet} />
        </li>
      ))}
      {folds ? (
        <li>
          <button type="button" className="augur-tag augur-tags-more" data-quiet={quiet ? '' : undefined} aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? fewerLabel : moreLabel(items.length - limit)}
          </button>
        </li>
      ) : null}
    </ul>
  );
}
