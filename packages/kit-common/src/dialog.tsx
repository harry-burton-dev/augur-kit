import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Dialog as AriaDialog, Modal, ModalOverlay } from 'react-aria-components';
import { Button } from './button.js';
import { FieldChecks, type FieldChecker } from './field.js';
import { Heading } from './heading.js';
import { KeyCap } from './key-cap.js';

/** Return false (or a Promise of false) to keep the dialog open; throw to keep it open and say why. */
export type DialogSubmit = (values: Record<string, string>) => void | false | Promise<void | false>;

export interface DialogProps {
  open: boolean;
  /** Closed: with the values when the primary went through, null when cancelled. */
  onClose: (result: Record<string, string> | null) => void;
  eyebrow?: string;
  heading: string;
  summary?: string;
  /** decision (the default), glance (narrower) or read (wider, for reading). */
  size?: 'decision' | 'glance' | 'read';
  /** The primary, named for what it does. Leave out for a dialog that only informs. */
  actionLabel?: string;
  /** What the primary says while `onSubmit` works. */
  busyLabel?: string;
  cancelLabel?: string;
  /** The primary destroys something: it shows as danger, and focus starts on Cancel. */
  danger?: boolean;
  ai?: boolean;
  /** A click on the veil closes it. Leave off for forms, so a stray click loses nothing. */
  light?: boolean;
  onSubmit?: DialogSubmit;
  /** Body text or content. */
  children?: ReactNode;
  /** Fields (TextField, Select, ...): the primary checks each one and goes to the first gap. */
  fields?: ReactNode;
  /**
   * Working, from outside: as while `onSubmit` works, nothing can be pressed and Esc waits. For a dialog
   * whose work is done elsewhere, such as an app's sandbox, which answers later.
   */
  busy?: boolean;
  /** Why the last try didn't work, from outside; the dialog's own reason wins while it has one. */
  error?: string;
}

const FALLBACK = 'Something went wrong. Nothing was changed; try again.';

/**
 * One decision or one small task, over everything, on the veil. Focus stays
 * inside, the page behind is inert, and focus goes back where it was on close
 * (React Aria). It starts on the first empty field, or on the primary (Cancel
 * when it's danger). Pressing the primary checks every field first; while
 * `onSubmit` works nothing can be pressed and Esc waits; if it fails, the
 * dialog stays open and says why.
 */
export function Dialog({
  open,
  onClose,
  eyebrow,
  heading,
  summary,
  size = 'decision',
  actionLabel,
  busyLabel,
  cancelLabel = 'Cancel',
  danger,
  ai,
  light,
  onSubmit,
  children,
  fields,
  busy: busyFromOutside = false,
  error: errorFromOutside,
}: DialogProps) {
  const [checks] = useState(() => new Set<{ current: FieldChecker }>());
  const [working, setBusy] = useState(false);
  const [ownError, setError] = useState('');
  const busy = working || busyFromOutside;
  const error = ownError || errorFromOutside || '';
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
    // Only when it opens: not again as fields mount or the props change.
  }, [open]);

  const close = (result: Record<string, string> | null) => {
    if (busy) return;
    onClose(result);
  };

  const confirm = async () => {
    if (busy) return;
    const all = [...checks].map((c) => c.current);
    const passed = all.map((c) => c.check());
    const gap = passed.indexOf(false);
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

  return (
    <ModalOverlay
      isOpen={open}
      onOpenChange={(next) => !next && close(null)}
      isDismissable={light && !busy}
      isKeyboardDismissDisabled={busy}
      className="augur-veil"
    >
      <Modal className="augur-dialog" data-size={size}>
        <AriaDialog aria-labelledby={titleId} className="outline-none">
          {/* Enter in a one-line field presses the primary. */}
          <div
            className="augur-dialog-body"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT' && actionLabel) {
                e.preventDefault();
                void confirm();
              }
            }}
          >
            <Heading id={titleId} eyebrow={eyebrow} heading={heading} summary={summary} size="s" />
            {error ? (
              <p className="augur-dialog-error" role="alert">
                {error}
              </p>
            ) : null}
            {children ? <div className="augur-dialog-text">{children}</div> : null}
            {fields ? (
              <FieldChecks.Provider value={checks}>
                <div className="augur-dialog-fields">{fields}</div>
              </FieldChecks.Provider>
            ) : null}
            <div className="augur-dialog-actions">
              {actionLabel ? (
                <div ref={primary} className="contents">
                  <Button kind={danger ? 'danger' : 'primary'} once={danger} ai={ai} busy={busy} busyLabel={busyLabel} onPress={() => void confirm()}>
                    {actionLabel}
                  </Button>
                </div>
              ) : null}
              <button ref={cancel} type="button" className="augur-dialog-cancel" disabled={busy} onClick={() => close(null)}>
                <KeyCap>Esc</KeyCap>
                {cancelLabel}
              </button>
            </div>
          </div>
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
}
