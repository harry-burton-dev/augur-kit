import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Button, Icon, cx, ms } from '@augur/kit-common';

export interface EditInPlaceProps {
  /** What the value is ("Name"): its label, and what the field is called. */
  label: string;
  /** The value as it is now. */
  value: string;
  /**
   * Keeps a new value. Return or resolve to save; throw or reject to refuse, and the error's message
   * shows under the field while the words typed are kept.
   */
  onSave: (value: string) => void | Promise<void>;
  /** Checks a new value before it is saved; return a sentence to refuse it, or nothing to let it through. */
  check?: (value: string) => string | undefined;
  /** The key beside the value ("Rename"). */
  actionWord?: string;
  /** An icon on that key. Any node, so the icon set can change. */
  actionIcon?: ReactNode;
  saveWord?: string;
  cancelWord?: string;
  /** The line under the field while editing. */
  hint?: string;
  /** What it says once a new value is kept. */
  savedText?: string;
  /** Can't be changed now; the value stays, the key goes, and `reason` says why. */
  disabled?: boolean;
  reason?: string;
  /** Show the label above the value. Off when the value is a page's own title and the page says what it is. */
  showLabel?: boolean;
  /** Start editing, for stories and snapshots. */
  defaultEditing?: boolean;
  className?: string;
}

type Phase = 'rest' | 'editing' | 'saving' | 'refused';

const messageOf = (e: unknown) => (e instanceof Error && e.message ? e.message : typeof e === 'string' && e ? e : undefined);

/**
 * One value changed where it sits, without a form (Key beside, picked 6 Nov 2026). A key always sits
 * beside the value, so the action never hides; pressed, the value becomes a Well with Save and Cancel
 * keys after it. Enter saves, Esc puts it back. A refused save says why and keeps what was typed; an
 * unavailable value stays and says why.
 */
export function EditInPlace({
  label,
  value,
  onSave,
  check,
  actionWord = 'Rename',
  actionIcon = <Icon name="rename" size={16} />,
  saveWord = 'Save',
  cancelWord = 'Cancel',
  hint = 'Enter keeps it, Esc puts it back.',
  savedText = 'Saved.',
  disabled,
  reason,
  showLabel = true,
  defaultEditing,
  className,
}: EditInPlaceProps) {
  const [phase, setPhase] = useState<Phase>(defaultEditing && !disabled ? 'editing' : 'rest');
  const [draft, setDraft] = useState(value);
  const [refusal, setRefusal] = useState<string>();
  const [saved, setSaved] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const start = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lineId = useId();
  useEffect(() => () => clearTimeout(timer.current), []);

  const editing = phase !== 'rest';
  useEffect(() => {
    if (phase === 'editing' && !defaultEditing) input.current?.select();
  }, [phase, defaultEditing]);

  const begin = () => {
    if (disabled) return;
    setDraft(value);
    setRefusal(undefined);
    setSaved(false);
    setPhase('editing');
  };
  const back = () => {
    setPhase('rest');
    setRefusal(undefined);
    // Focus goes back to the key that opened it.
    requestAnimationFrame(() => start.current?.querySelector<HTMLElement>('.augur-button')?.focus());
  };
  const save = async () => {
    if (phase === 'saving') return;
    const next = draft.trim();
    if (next === value) return back();
    const problem = check?.(next);
    if (problem) {
      setRefusal(problem);
      setPhase('refused');
      return;
    }
    setPhase('saving');
    try {
      await onSave(next);
      setSaved(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setSaved(false), ms('motion-still'));
      back();
    } catch (e) {
      setRefusal(messageOf(e) ?? 'Couldn’t save. Your words are kept; try again.');
      setPhase('refused');
    }
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void save();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      back();
    }
  };

  const line = disabled ? reason : phase === 'refused' ? refusal : phase === 'saving' ? 'Saving…' : editing ? hint : saved ? savedText : '';

  return (
    <div className={cx('quill-edit', className)} data-phase={phase} data-unavailable={disabled || undefined}>
      {showLabel ? (
        <span className="quill-edit-label">
          {label}
        </span>
      ) : null}
      <div className="quill-edit-row" ref={start}>
        {editing ? (
          <>
            <span className="augur-field-box quill-edit-box" data-refused={phase === 'refused' || undefined}>
              <input
                ref={input}
                className="augur-input"
                aria-label={label}
                aria-describedby={lineId}
                aria-invalid={phase === 'refused' || undefined}
                autoFocus={!defaultEditing}
                value={draft}
                readOnly={phase === 'saving'}
                onChange={(e) => {
                  setDraft(e.target.value);
                  if (phase === 'refused') setPhase('editing');
                }}
                onKeyDown={onKey}
              />
            </span>
            <span className="quill-edit-keys">
              <Button size="sm" kind="primary" busy={phase === 'saving'} busyLabel="Saving" onPress={() => void save()}>
                {saveWord}
              </Button>
              <Button size="sm" kind="ghost" onPress={back}>
                {cancelWord}
              </Button>
            </span>
          </>
        ) : (
          <>
            <span className="quill-edit-value">
              {value}
              {disabled ? (
                <span className="quill-edit-lock" aria-hidden="true">
                  <Icon name="lock" size={14} />
                </span>
              ) : null}
            </span>
            {disabled ? null : (
              <Button size="sm" kind="tertiary" icon={actionIcon} aria-label={`${actionWord}: ${label}, ${value}`} onPress={begin}>
                {actionWord}
              </Button>
            )}
          </>
        )}
      </div>
      <p className="quill-edit-line" id={lineId} data-tone={phase === 'refused' ? 'danger' : undefined} role={phase === 'refused' ? 'alert' : 'status'}>
        {line}
      </p>
    </div>
  );
}
