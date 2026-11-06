import { createContext, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { Dialog as AriaDialog, Modal, ModalOverlay } from 'react-aria-components';
import { Button } from './button.js';
import { FieldChecks, type FieldChecker } from './field.js';
import type { DialogSubmit } from './dialog.js';
import { IconButton } from './icon-button.js';

export interface SideSheetProps {
  open: boolean;
  /** Closed: with the values when the primary went through, null when cancelled or closed. */
  onClose: (result: Record<string, string> | null) => void;
  /** Where it was opened from, in small capitals above the heading ("Plans"). */
  eyebrow?: string;
  /** What the work is ("Edit Q3 plan"). */
  heading: string;
  /** decision (the default) for a record's fields, or read (wider) for reading or a longer form. */
  size?: 'decision' | 'read';
  /** The primary, named for what it does. Leave out for a sheet that only shows. */
  actionLabel?: string;
  /** What the primary says while `onSubmit` works. */
  busyLabel?: string;
  cancelLabel?: string;
  /** The close button's name, read aloud and shown on hover. */
  closeLabel?: string;
  /** The primary destroys something: it shows as danger, and focus starts on Cancel. */
  danger?: boolean;
  ai?: boolean;
  /** A click on the dimmed page closes it. Leave off for forms, so a stray click loses nothing. */
  light?: boolean;
  onSubmit?: DialogSubmit;
  /** The steps of a bigger flow, by name, so it never needs one long form that scrolls. */
  steps?: string[];
  /** Which step it is on, from 0. */
  step?: number;
  /** Back a step: shows a Back button from the second step on. */
  onBack?: () => void;
  backLabel?: string;
  /** Says which step it is ("Step 2 of 3"). */
  stepLabel?: (step: number, of: number) => string;
  /** Body text or content. */
  children?: ReactNode;
  /** Fields (TextField, Select, ...): the primary checks each one and goes to the first gap. */
  fields?: ReactNode;
}

const FALLBACK = 'Something went wrong. Nothing was changed; try again.';
const stepWords = (step: number, of: number) => `Step ${step} of ${of}`;

/** Sheets opened from a sheet: each tells the one under it, which steps back to the left and dims. */
const Under = createContext<{ depth: number; cover: (covered: boolean) => void }>({ depth: 0, cover: () => {} });

/**
 * Create and edit work too big for a dialog, without leaving the page: a Leaf
 * (picked 6 Nov 2026). It comes in from the right edge, full height, over a
 * dimmed page (never blurred), drawn as a Sheet: the heading on its own strip
 * with the eyebrow in mono, the work, and the actions on a ruled footer,
 * primary last. A bigger flow goes in `steps`, one screen each, so nothing
 * scrolls. A sheet opened from inside a sheet stacks on it, and the first
 * steps back with its edge in view.
 *
 * Focus stays inside and goes back where it was on close (React Aria). It
 * starts on the first empty field, or on the primary (Cancel when it's
 * danger). Like a Dialog, the primary checks every field first; while
 * `onSubmit` works nothing can be pressed and Esc waits; if it fails, the
 * sheet stays open and says why.
 */
export function SideSheet({
  open,
  onClose,
  eyebrow,
  heading,
  size = 'decision',
  actionLabel,
  busyLabel,
  cancelLabel = 'Cancel',
  closeLabel = 'Close',
  danger,
  ai,
  light,
  onSubmit,
  steps,
  step = 0,
  onBack,
  backLabel = 'Back',
  stepLabel = stepWords,
  children,
  fields,
}: SideSheetProps) {
  const [checks] = useState(() => new Set<{ current: FieldChecker }>());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [covered, setCovered] = useState(false);
  const under = useContext(Under);
  const over = useMemo(() => ({ depth: under.depth + 1, cover: setCovered }), [under.depth]);
  const titleId = useId();
  const primary = useRef<HTMLDivElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    setError('');
    const t = setTimeout(() => {
      const empty = [...checks].find((c) => !c.current.value());
      if (empty) return empty.current.focus();
      if (danger || !actionLabel) cancel.current?.focus();
      else primary.current?.querySelector('button')?.focus();
    });
    return () => clearTimeout(t);
    // When it opens and at each step: not again as fields mount or the props change.
  }, [open, step]);

  useEffect(() => {
    if (!under.depth) return;
    under.cover(open);
    return () => under.cover(false);
  }, [open, under]);

  const close = (result: Record<string, string> | null) => {
    if (busy) return;
    onClose(result);
  };

  const confirm = async () => {
    if (busy) return;
    const all = [...checks].map((c) => c.current);
    const gap = all.map((c) => c.check()).indexOf(false);
    if (gap >= 0) return all[gap].focus();
    const values = Object.fromEntries(all.filter((c) => c.name).map((c) => [c.name!, c.value()]));
    try {
      const pending = onSubmit?.(values);
      let outcome: void | false = undefined;
      if (pending instanceof Promise) {
        setBusy(true);
        setError('');
        outcome = await pending;
      } else outcome = pending;
      setBusy(false);
      if (outcome !== false) onClose(values);
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error && err.message ? err.message : FALLBACK);
    }
  };

  const many = steps && steps.length > 1;
  return (
    <ModalOverlay
      isOpen={open}
      onOpenChange={(next) => !next && close(null)}
      isDismissable={light && !busy}
      isKeyboardDismissDisabled={busy}
      className="augur-sheet-veil"
      data-stacked={under.depth > 0 || undefined}
      data-covered={covered || undefined}
    >
      <Modal className="augur-side-sheet" data-size={size} data-covered={covered || undefined}>
        <AriaDialog aria-labelledby={titleId} className="augur-side-sheet-dialog outline-none">
          <Under.Provider value={over}>
            <header className="augur-side-sheet-head">
              <div className="augur-side-sheet-titles">
                {eyebrow ? <span className="augur-side-sheet-eyebrow">{eyebrow}</span> : null}
                <h2 id={titleId} className="augur-side-sheet-title">
                  {heading}
                </h2>
              </div>
              {many ? <span className="augur-side-sheet-count">{stepLabel(step + 1, steps.length)}</span> : null}
              <IconButton icon="close" label={closeLabel} size="sm" disabled={busy} onPress={() => close(null)} />
            </header>
            {many ? (
              <ol className="augur-side-sheet-steps" aria-label={stepLabel(step + 1, steps.length)}>
                {steps.map((s, i) => (
                  <li key={s} data-state={i < step ? 'done' : i === step ? 'here' : undefined} aria-current={i === step ? 'step' : undefined}>
                    <span className="sr-only">{s}</span>
                  </li>
                ))}
              </ol>
            ) : null}
            <div
              className="augur-side-sheet-body"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT' && actionLabel) {
                  e.preventDefault();
                  void confirm();
                }
              }}
            >
              {error ? (
                <p className="augur-dialog-error" role="alert">
                  {error}
                </p>
              ) : null}
              {children ? <div className="augur-side-sheet-text">{children}</div> : null}
              {fields ? (
                <FieldChecks.Provider value={checks}>
                  <div className="augur-side-sheet-fields">{fields}</div>
                </FieldChecks.Provider>
              ) : null}
            </div>
            <footer className="augur-side-sheet-foot">
              {actionLabel ? (
                <div ref={primary} className="contents">
                  <Button kind={danger ? 'danger' : 'primary'} once={danger} ai={ai} busy={busy} busyLabel={busyLabel} onPress={() => void confirm()}>
                    {actionLabel}
                  </Button>
                </div>
              ) : null}
              {many && step > 0 && onBack ? (
                <Button kind="secondary" disabled={busy} onPress={onBack}>
                  {backLabel}
                </Button>
              ) : null}
              <button ref={cancel} type="button" className="augur-dialog-cancel" disabled={busy} onClick={() => close(null)}>
                <kbd>Esc</kbd>
                {cancelLabel}
              </button>
            </footer>
          </Under.Provider>
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
}
