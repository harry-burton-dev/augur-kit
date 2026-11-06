import { useEffect, useRef, useState, type InputHTMLAttributes, type Ref } from 'react';
import { cx } from './cx.js';
import { Icon } from './icon.js';
import { KeyCap } from './key-cap.js';

export interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'type' | 'size' | 'className' | 'style'> {
  /** What it finds, for screen readers ("Find a document"). */
  label: string;
  /** The words, when the caller keeps them. */
  value?: string;
  /** The words to start with, when the field keeps them itself. */
  defaultValue?: string;
  /** Every change, as you type: search matches as you type, never on Enter. */
  onChange?: (value: string) => void;
  /** A key that brings you here from anywhere on the page ("/"). Shown at the end of the field while it's empty. */
  shortcut?: string;
  /** The name of the key that clears the words, read by screen readers. */
  clearLabel?: string;
  /** The input itself, for a caller that moves focus or reads it. */
  inputRef?: Ref<HTMLInputElement>;
  className?: string;
}

const writing = (el: Element | null) => !!el && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || (el as HTMLElement).isContentEditable);

/**
 * The one search field (Key, picked 6 Nov 2026), the same in every app: a well like every field, a find
 * mark, and it matches as you type. While it's empty a small key says which key brings you here; once you
 * write, it becomes Esc, which clears the words (a second Esc goes to the caller, to close what holds it).
 * Pass any input attribute through, such as the combobox ones a palette needs. The shell keeps its own,
 * defined in Aerie.
 */
export function SearchField({ label, value, defaultValue, onChange, shortcut, clearLabel = 'Clear', inputRef, className, onKeyDown, placeholder, ...rest }: SearchFieldProps) {
  const [own, setOwn] = useState(defaultValue ?? '');
  const words = value ?? own;
  const input = useRef<HTMLInputElement | null>(null);
  const set = (next: string) => {
    if (value === undefined) setOwn(next);
    onChange?.(next);
  };

  useEffect(() => {
    if (!shortcut) return;
    const go = (e: KeyboardEvent) => {
      if (e.key !== shortcut || e.ctrlKey || e.metaKey || e.altKey || writing(document.activeElement)) return;
      e.preventDefault();
      input.current?.focus();
    };
    document.addEventListener('keydown', go);
    return () => document.removeEventListener('keydown', go);
  }, [shortcut]);

  return (
    <div className={cx('augur-field-box augur-search', className)}>
      <Icon name="find" size={16} />
      <input
        {...rest}
        ref={(el) => {
          input.current = el;
          if (typeof inputRef === 'function') inputRef(el);
          else if (inputRef) (inputRef as { current: HTMLInputElement | null }).current = el;
        }}
        type="search"
        aria-label={label}
        placeholder={placeholder ?? label}
        className="augur-input"
        value={words}
        onChange={(e) => set(e.target.value)}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.defaultPrevented || e.key !== 'Escape' || !words) return;
          e.preventDefault();
          e.stopPropagation();
          set('');
        }}
      />
      {words ? (
        <button
          type="button"
          tabIndex={-1}
          className="augur-search-clear"
          aria-label={clearLabel}
          onClick={() => {
            set('');
            input.current?.focus();
          }}
        >
          <KeyCap>Esc</KeyCap>
        </button>
      ) : shortcut ? (
        <span className="augur-search-key" aria-hidden="true">
          <KeyCap>{shortcut}</KeyCap>
        </span>
      ) : null}
    </div>
  );
}
