import { useId, useLayoutEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { Icon } from '@augur/kit-common';
import { FRAME_WORDS, iconOf, type FrameAboutSection, type FrameWords } from './frame.js';

export interface AppPaneProps {
  /** The open app, from its manifest: its name, and its icon, drawn as the dock image. */
  app: { name: string; icon?: string };
  /** The sections it declares (`contributes.about`), in order. Each is one title on the pane. */
  sections: readonly FrameAboutSection[];
  /** What the app put in each section (`ctx.frame.about(id).render`), by section id, as the shell draws it. */
  content?: Readonly<Partial<Record<string, ReactNode>>>;
  /** The section showing, or none while the pane is closed to its strip. */
  open?: string;
  /** Asked to show a section, or to close (undefined). */
  onOpenChange: (section: string | undefined) => void;
  /** What stands at the top of the pane: the shell puts the clock and the notification button here. */
  top?: ReactNode;
  /** Open over the page (a narrow frame), rather than beside it. */
  over?: boolean;
  /** The kit's words, where the shell or a deployment wants its own. */
  words?: Partial<FrameWords>;
}

/**
 * The app pane (DR): the region the shell draws at the window's right edge while an app is open. From
 * the top: what the shell puts there (the clock and the notification button), the app's dock image, then a
 * title for each section the app declares. Closed, it is a strip and the titles run down it. Each title is
 * an accordion header (WAI-ARIA): pressing one opens the pane on that section, pressing the open one closes
 * it, and one section shows at a time. Esc closes it and gives focus back to the title. A section the app
 * hasn't filled stays and says so. An app with no sections still has the strip, for the clock and the
 * notifications.
 */
export function AppPane({ app, sections, content, open, onOpenChange, top, over, words }: AppPaneProps) {
  const w = { ...FRAME_WORDS, ...words };
  const id = useId();
  const titles = useRef(new Map<string, HTMLButtonElement>());
  /** The title to give focus back to once the pane has closed, after Esc. */
  const back = useRef<string | undefined>(undefined);
  const showing = open && sections.some((s) => s.id === open) ? open : undefined;
  useLayoutEffect(() => {
    if (showing || !back.current) return;
    titles.current.get(back.current)?.focus();
    back.current = undefined;
  }, [showing]);
  const onKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key !== 'Escape' || !showing) return;
    e.preventDefault();
    e.stopPropagation();
    back.current = showing;
    onOpenChange(undefined);
  };
  const dock = iconOf(app.icon) ?? 'apps';
  return (
    <aside
      className="aerie-pane"
      data-open={showing ? '' : undefined}
      data-over={showing && over ? '' : undefined}
      aria-label={w.about(app.name)}
      onKeyDown={onKey}
    >
      {top ? <div className="aerie-pane-top">{top}</div> : null}
      <div className="aerie-pane-dock" title={app.name}>
        <Icon name={dock} size={28} />
      </div>
      {sections.length ? (
        <div className="aerie-pane-sections">
          {sections.map((s) => {
            const icon = iconOf(s.icon);
            const here = s.id === showing;
            const head = `${id}-${s.id}`;
            return (
              <section key={s.id} className="aerie-pane-section" data-open={here ? '' : undefined}>
                <h3 className="aerie-pane-heading">
                  <button
                    ref={(el) => {
                      if (el) titles.current.set(s.id, el);
                      else titles.current.delete(s.id);
                    }}
                    id={head}
                    type="button"
                    className="aerie-pane-title"
                    aria-expanded={here}
                    aria-controls={`${head}-body`}
                    onClick={() => onOpenChange(here ? undefined : s.id)}
                  >
                    {icon ? <Icon name={icon} size={16} /> : null}
                    <span>{s.label}</span>
                  </button>
                </h3>
                <div id={`${head}-body`} role="region" aria-labelledby={head} className="aerie-pane-body" hidden={!here}>
                  {here ? (content?.[s.id] ?? <p className="aerie-pane-empty">{w.aboutEmpty}</p>) : null}
                </div>
              </section>
            );
          })}
        </div>
      ) : null}
    </aside>
  );
}
