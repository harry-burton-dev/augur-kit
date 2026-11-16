import { Children, useState, type ReactNode } from 'react';
import { Button, Icon, IconButton, Menu, cx, type ButtonKind } from '@augur/kit-common';

/** A step in the trail: what this page is inside. */
export interface TrailStep {
  id: string;
  label: string;
}

/** One of the page's actions. Two show as buttons; the rest go in ⋯. */
export interface PageAction {
  id: string;
  label: string;
  /** `primary` at most once on a page; a second primary shows as secondary. Defaults to secondary. */
  kind?: ButtonKind;
  danger?: boolean;
  disabled?: boolean;
  /** Why it's disabled, in one sentence. */
  reason?: string;
}

/** How you got to this page, when a link brought you from somewhere else. */
export interface PageArrival {
  /** Where you came from ("Night roster"). */
  from: string;
  /** Why the link brought you here, as the rest of one sentence ("where Halden's crew is short a watch"). */
  why?: string;
  /** Go back to where you came from. */
  onBack: () => void;
  /** You've read the line: it shrinks to a Back key beside the actions. */
  read?: boolean;
}

export interface PageHeadProps {
  /** @deprecated PDR-014: a page says where it is with its title in a fixed slot and an `arrival` line, not a trail. Still drawn, for apps that pass it. */
  trail?: TrailStep[];
  onTrail?: (step: TrailStep) => void;
  eyebrow?: string;
  heading: string;
  /** One line about now; cut with an ellipsis, in full on hover. */
  summary?: string;
  actions?: PageAction[];
  onAction?: (action: PageAction) => void;
  /** The title's heading level, 1 by default: it's the page's one heading. */
  level?: number;
  /** Where a link brought you from: one line under the title, then a Back key once `read`. */
  arrival?: PageArrival;
  /** While several things are picked: their SelectionBar, in the actions' slot, so actions stay in one place. */
  selection?: ReactNode;
  /** Anything that belongs to the title and comes under it: tags, a status. */
  children?: ReactNode;
  className?: string;
}

/**
 * The top of an app's page, in the Line look: a kind label in mono capitals,
 * the title and one line of summary on the left, the page's actions on the
 * right. Both sit in fixed slots, the same place on every page, and the head
 * is always as tall as the frame's horizon (`frame-head`), so its foot lines
 * up with the rail's and the drawer's. A link that brings you here leaves one
 * arrival line, which shrinks to a Back key once you've read it. Two actions
 * show, at most one primary, the rest in ⋯; while several things are picked,
 * the selection takes their slot.
 */
export function PageHead({ trail = [], onTrail, eyebrow, heading, summary, actions = [], onAction, level = 1, arrival, selection, children, className }: PageHeadProps) {
  const [unfolded, setUnfolded] = useState(false);
  let primary = false;
  const shown = actions.slice(0, 2).map((a) => {
    let kind: ButtonKind = a.danger ? 'danger' : (a.kind ?? 'secondary');
    if (kind === 'primary') {
      if (primary) kind = 'secondary';
      primary = true;
    }
    return { ...a, kind };
  });
  const rest = actions.slice(2);
  const step = (s: TrailStep) => (
    <li key={s.id}>
      <button type="button" onClick={() => onTrail?.(s)}>
        {s.label}
      </button>
    </li>
  );
  const steps =
    trail.length <= 3 || unfolded
      ? trail.map(step)
      : [
          step(trail[0]!),
          <li key="fold">
            <button type="button" aria-label={`Show ${trail.length - 2} more steps`} onClick={() => setUnfolded(true)}>
              …
            </button>
          </li>,
          step(trail[trail.length - 1]!),
        ];
  return (
    <div className={cx('quill-page-head', className)}>
      {trail.length ? <ol aria-label="What this is inside">{steps}</ol> : null}
      <div className="quill-page-head-row">
        <div className="quill-page-head-text">
          {eyebrow ? <div className="quill-label">{eyebrow}</div> : null}
          <div className="quill-page-head-title" role="heading" aria-level={Math.min(6, Math.max(1, level))}>
            {heading}
          </div>
          {summary ? (
            <p className="quill-page-head-summary" title={summary}>
              {summary}
            </p>
          ) : null}
          {children}
          {arrival && !arrival.read ? (
            <p className="quill-page-head-arrival">
              <Icon name="link" size={14} />
              <span>
                You came here from <b>{arrival.from}</b>
                {arrival.why ? `, ${arrival.why}` : ''}.
              </span>
              <button type="button" onClick={arrival.onBack}>
                Back
              </button>
            </p>
          ) : null}
        </div>
        {selection ? (
          <div className="quill-page-head-acts">{selection}</div>
        ) : shown.length || arrival?.read ? (
          <div className="quill-page-head-acts">
            {arrival?.read ? (
              <button type="button" className="quill-page-head-back" onClick={arrival.onBack}>
                <Icon name="back" size={14} />
                {arrival.from}
              </button>
            ) : null}
            {shown.map((a) => (
              <Button key={a.id} kind={a.kind} size="sm" disabled={a.disabled} reason={a.reason} onPress={() => onAction?.(a)}>
                {a.label}
              </Button>
            ))}
            {rest.length ? (
              <Menu
                label="More"
                items={rest.map((a) => ({ id: a.id, label: a.label, danger: a.danger, disabled: a.disabled, reason: a.reason }))}
                onAction={(id) => {
                  const a = rest.find((r) => r.id === id);
                  if (a) onAction?.(a);
                }}
              >
                <IconButton icon="more" label="More" size="sm" />
              </Menu>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export interface SectionProps {
  label: string;
  /** How many there are; left out, the children are counted. -1 shows no count. */
  count?: number;
  /** How many children show before the rest fold away; 0 shows them all. */
  limit?: number;
  /** One quiet action, as a word or two. */
  action?: string;
  onAction?: () => void;
  /** Why this section is as it is, up to two sentences, behind a "Why?". */
  why?: string;
  level?: number;
  children?: ReactNode;
  className?: string;
}

/**
 * A part of a page: a label in tracked capitals with its count, one quiet
 * action, and an optional "Why?". It shows the first few of its children and
 * folds the rest behind "8 more".
 */
export function Section({ label, count, limit = 5, action, onAction, why, level = 2, children, className }: SectionProps) {
  const [open, setOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const items = Children.toArray(children);
  const n = count ?? (items.length > 1 ? items.length : undefined);
  const hidden = limit > 0 && items.length > limit ? items.length - limit : 0;
  const shown = hidden && !open ? items.slice(0, limit) : items;
  return (
    <section className={cx('quill-section', className)}>
      <div className="quill-section-head">
        <div className="quill-label" role="heading" aria-level={Math.min(6, Math.max(1, level))}>
          {n !== undefined && n >= 0 ? <b>{n}</b> : null}
          {label}
        </div>
        {why ? (
          <Button kind="tertiary" size="sm" aria-expanded={whyOpen} onPress={() => setWhyOpen(!whyOpen)}>
            Why?
          </Button>
        ) : null}
        {action ? (
          <Button kind="tertiary" size="sm" onPress={onAction}>
            {action}
          </Button>
        ) : null}
      </div>
      {why && whyOpen ? <p className="quill-section-why">{why}</p> : null}
      <div className="quill-section-body">{shown}</div>
      {hidden ? (
        <button type="button" className="quill-fold" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? 'Show fewer' : `${hidden} more`}
        </button>
      ) : null}
    </section>
  );
}
