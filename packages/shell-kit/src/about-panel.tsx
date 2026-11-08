import { useId, useLayoutEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { Icon, IconButton } from '@augur/kit-common';
import { FRAME_WORDS, iconOf, type FrameAboutSection, type FrameWords } from './frame.js';

export interface AboutPanelProps {
  /** The app's name, from its manifest. */
  app: string;
  /** The sections it declares (`contributes.about`), in order. */
  sections: readonly FrameAboutSection[];
  /** What the app put in each section (`ctx.frame.about(id).render`), by section id, as the shell draws it. */
  content?: Readonly<Partial<Record<string, ReactNode>>>;
  /** Open beside the main column, or folded to its button. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The kit's words, where the shell or a deployment wants its own. */
  words?: Partial<FrameWords>;
}

/**
 * The About panel (PDR-021 point 6; spec 6.8): the right-hand of the three regions the shell draws round
 * an app, beside the rail and the main column. It holds the sections the app declares, in their order,
 * each filled by the app at run time; a section the app hasn't filled stays and says so, so people learn
 * where to look. Folded, it is a button at the edge that says what it opens; opening it takes focus to
 * the panel's heading, and Esc or Close folds it and gives focus back to that button. An app that declares no sections has no panel.
 */
export function AboutPanel({ app, sections, content, open, onOpenChange, words }: AboutPanelProps) {
  const w = { ...FRAME_WORDS, ...words };
  const id = useId();
  const opener = useRef<HTMLButtonElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  /** Opened or folded by the person here, so focus follows them; not on the first draw. */
  const moved = useRef(false);
  useLayoutEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    (open ? title.current : opener.current)?.focus();
  }, [open]);
  if (!sections.length) return null;
  const fold = () => {
    moved.current = true;
    onOpenChange(false);
  };
  const onKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape' && open) {
      e.preventDefault();
      e.stopPropagation();
      fold();
    }
  };
  return (
    <aside className="aerie-about" data-open={open ? '' : undefined} aria-label={w.about(app)} onKeyDown={onKey}>
      {open ? (
        <>
          <header className="aerie-about-head">
            <h2 id={`${id}-title`} ref={title} tabIndex={-1}>
              {w.about(app)}
            </h2>
            <IconButton icon="close" label={w.aboutClose} onPress={fold} />
          </header>
          <div className="aerie-about-body">
            {sections.map((s) => {
              const icon = iconOf(s.icon);
              const body = content?.[s.id];
              return (
                <section key={s.id} className="aerie-about-section" aria-labelledby={`${id}-${s.id}`}>
                  <h3 id={`${id}-${s.id}`}>
                    {icon ? <Icon name={icon} size={16} /> : null}
                    <span>{s.label}</span>
                  </h3>
                  {body ?? <p className="aerie-about-empty">{w.aboutEmpty}</p>}
                </section>
              );
            })}
          </div>
        </>
      ) : (
        <button ref={opener} type="button" className="aerie-about-open" aria-expanded={false} onClick={() => {
          moved.current = true;
          onOpenChange(true);
        }}>
          <Icon name="info" size={16} />
          <span>{w.aboutOpen}</span>
        </button>
      )}
    </aside>
  );
}
