import { Component, useEffect, useState, type ReactNode } from 'react';
import { Button } from './button.js';
import { cx } from './cx.js';
import { Icon, type IconName } from './icon.js';

export type StateKind = 'empty' | 'loading' | 'error' | 'offline';

export interface StateProps {
  kind?: StateKind;
  heading: string;
  body?: string;
  /** The one thing to do, as a word or two; nothing shows without it (and never while loading). */
  action?: string;
  onAction?: () => void;
  /**
   * `region` (the default) is centred in its region, on its own horizon line. `line` sits inside a
   * control or a tile, under a line of its own. `page` stands in for a whole page that couldn't be shown.
   */
  size?: 'region' | 'line' | 'page';
  className?: string;
}

/**
 * What a region says when it has nothing, is still coming, or failed: one
 * quiet sentence, a line more if it helps, and at most one thing to do.
 * Drawn on the horizon (PDR, 6 Nov): no box, the sentence sits on a groove.
 * Loading draws the line across, after 300ms, so a quick load doesn't flash.
 * An error turns the line red and marks it with a diamond; offline is amber.
 * Green never shows here: it means only "needs you".
 */
export function State({ kind = 'empty', heading, body, action, onAction, size = 'region', className }: StateProps) {
  const [shown, setShown] = useState(kind !== 'loading');
  useEffect(() => {
    if (kind !== 'loading') {
      setShown(true);
      return;
    }
    setShown(false);
    const wait = setTimeout(() => setShown(true), 300);
    return () => clearTimeout(wait);
  }, [kind]);
  const mark: IconName | undefined = kind === 'error' ? 'error' : kind === 'offline' ? 'warning' : undefined;
  const failed = kind === 'error' || kind === 'offline';
  const Title = size === 'page' ? 'h1' : 'p';
  return (
    <div
      className={cx('augur-state', className)}
      data-kind={kind}
      data-size={size}
      data-hidden={shown ? undefined : ''}
      role={kind === 'error' ? 'alert' : 'status'}
      aria-busy={kind === 'loading' || undefined}
    >
      <Title className="augur-state-title">
        {mark ? <Icon name={mark} size={14} className="augur-state-sign" /> : null}
        <span>{heading}</span>
      </Title>
      {kind === 'loading' ? <span className="augur-state-run" aria-hidden="true" /> : null}
      {body ? <p className="augur-state-body">{body}</p> : null}
      {action && kind !== 'loading' ? (
        <span className="augur-state-action">
          <Button kind={failed ? 'secondary' : 'tertiary'} size={size === 'page' ? 'md' : 'sm'} onPress={onAction}>
            {action}
          </Button>
        </span>
      ) : null}
    </div>
  );
}

export interface StateBoundaryProps {
  /** What failed, said as the heading: "This page couldn't be shown". */
  heading: string;
  /** A line more, such as what wasn't lost. */
  body?: string;
  /** The word for trying again; leave out to offer nothing. */
  action?: string;
  /** Called before the boundary tries its children again. */
  onReset?: () => void;
  /** Called once with what was thrown, to report it. */
  onError?: (error: unknown) => void;
  size?: StateProps['size'];
  children?: ReactNode;
}

/**
 * Catches what its children throw while drawing and shows a State in their place, so one part
 * failing doesn't blank the page. With `action`, pressing it draws the children again.
 */
export class StateBoundary extends Component<StateBoundaryProps, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    this.props.onError?.(error);
  }
  private retry = () => {
    this.props.onReset?.();
    this.setState({ failed: false });
  };
  render() {
    const { heading, body, action, size = 'region', children } = this.props;
    if (!this.state.failed) return children;
    return <State kind="error" heading={heading} body={body} action={action} onAction={action ? this.retry : undefined} size={size} />;
  }
}
