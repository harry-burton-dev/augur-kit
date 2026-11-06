import { useState, type ReactNode } from 'react';
import { Button, Icon, cx, type IconName } from '@augur/kit-common';

/** A file's name split at its last dot: "Halden brief.pdf" is ["Halden brief", "pdf"]. */
export const splitName = (name: string): [string, string] => {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? [name.slice(0, dot), name.slice(dot + 1).toLowerCase()] : [name, ''];
};

const KIND_ICON: Record<string, IconName> = {
  pdf: 'document', doc: 'document', docx: 'document', txt: 'document', md: 'document', rtf: 'document',
  xls: 'series', xlsx: 'series', csv: 'series', tsv: 'series', json: 'structure', xml: 'structure',
  jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image', svg: 'image', heic: 'image',
  mp4: 'video', mov: 'video', webm: 'video', mp3: 'music', wav: 'music', m4a: 'music',
  log: 'history', zip: 'folder', tar: 'folder', gz: 'folder',
};

/** The icon for a file, from its name's extension. Anything unknown is a document. */
export const fileIcon = (name: string): IconName => KIND_ICON[splitName(name)[1]] ?? 'document';

/** A size in bytes as people say it: "86 KB", "2.4 MB". A string is shown as it is. */
export const fileSize = (size: number | string | undefined): string | undefined => {
  if (size == null || typeof size === 'string') return size;
  if (size < 1000) return `${size} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let n = size / 1000;
  let u = 0;
  while (n >= 1000 && u < units.length - 1) {
    n /= 1000;
    u++;
  }
  return `${n < 10 ? n.toFixed(1) : Math.round(n)} ${units[u]}`;
};

function FileName({ name }: { name: string }) {
  const [base, ext] = splitName(name);
  return (
    <span className="quill-file-name" title={name}>
      <span>{base}</span>
      {ext ? <span className="quill-file-ext">.{ext}</span> : null}
    </span>
  );
}

export type UploadState = 'waiting' | 'going' | 'done' | 'failed';

export interface UploadItem {
  id: string;
  /** The file's name with its extension: the extension picks the icon and shows in mono. */
  name: string;
  /** In bytes, or already said ("2.4 MB"). */
  size?: number | string;
  state: UploadState;
  /** 0 to 100 while going. Left out, the row says "Sending" and its line runs. */
  progress?: number;
  /** Why it failed, in one sentence ("Bigger than the 25 MB this floor takes."). */
  error?: string;
}

export interface UploadListProps {
  /** Names the list for assistive tech ("Uploads to Halden"). */
  label?: string;
  items: UploadItem[];
  /** How many rows show before the rest fold into "N more". Failed rows come first, then those going. */
  show?: number;
  /** Retry one failed file. Without it a failed row has no Retry. */
  onRetry?: (id: string) => void;
  /** Retry every failed file: offered when more than one failed. */
  onRetryAll?: () => void;
  /** Stop a file that is waiting or going. Without it there is no Stop. */
  onStop?: (id: string) => void;
  /** Show every row. Without it the fold only counts them. */
  onShowAll?: () => void;
  className?: string;
}

const WORD: Record<UploadState, string> = { waiting: 'Waiting', going: 'Sending', done: 'Sent', failed: 'Couldn’t send' };
const ORDER: Record<UploadState, number> = { failed: 0, going: 1, waiting: 2, done: 3 };

/**
 * Files on their way up, drawn as Tray (picked 6 Nov 2026): rows in a well, each file's progress a line
 * along its row's foot. A failed file says why in red with Retry, and waits for nothing. Past `show`
 * rows, what still needs a look comes first and the rest fold into "N more", so the list never scrolls.
 */
export function UploadList({ label = 'Uploads', items, show = 6, onRetry, onRetryAll, onStop, onShowAll, className }: UploadListProps) {
  const done = items.filter((i) => i.state === 'done').length;
  const failed = items.filter((i) => i.state === 'failed').length;
  const folds = items.length > show;
  const shown = folds ? [...items].sort((a, b) => ORDER[a.state] - ORDER[b.state]).slice(0, show) : items;
  const hidden = items.length - shown.length;
  const hiddenDone = items.filter((i) => i.state === 'done').length - shown.filter((i) => i.state === 'done').length;
  return (
    <section className={cx('quill-uploads', className)} aria-label={label}>
      <div className="quill-uploads-head">
        <span role="status">
          {done} of {items.length} sent
          {failed ? <span className="quill-uploads-bad"> · {failed} couldn’t</span> : null}
        </span>
        {failed > 1 && onRetryAll ? (
          <Button size="sm" kind="ghost" onPress={onRetryAll}>
            Retry all
          </Button>
        ) : null}
      </div>
      <ul className="quill-uploads-rows">
        {shown.map((item) => (
          <li key={item.id} className="quill-upload" data-state={item.state}>
            <Icon name={fileIcon(item.name)} size={16} />
            <FileName name={item.name} />
            <span className="quill-upload-size">{fileSize(item.size)}</span>
            <span className="quill-upload-state">
              {item.state === 'failed' ? <Icon name="error" size={14} /> : null}
              {item.state === 'going' && item.progress != null ? `${Math.round(item.progress)}%` : WORD[item.state]}
            </span>
            {item.state === 'failed' && onRetry ? (
              <Button size="sm" kind="ghost" onPress={() => onRetry(item.id)} aria-label={`Retry ${item.name}`}>
                Retry
              </Button>
            ) : (item.state === 'going' || item.state === 'waiting') && onStop ? (
              <Button size="sm" kind="ghost" icon={<Icon name="close" size={14} />} onPress={() => onStop(item.id)} aria-label={`Stop ${item.name}`}>
                Stop
              </Button>
            ) : (
              <span />
            )}
            {item.state === 'failed' && item.error ? <span className="quill-upload-error">{item.error}</span> : null}
            {item.state === 'going' ? (
              <span
                className="quill-upload-line"
                data-running={item.progress == null ? '' : undefined}
                style={item.progress != null ? { width: `${Math.max(0, Math.min(100, item.progress))}%` } : undefined}
              />
            ) : null}
          </li>
        ))}
      </ul>
      {hidden > 0 ? (
        <div className="quill-uploads-more">
          <span>
            {hidden} more{hiddenDone === hidden ? ', all sent' : ''}
          </span>
          {onShowAll ? (
            <Button size="sm" kind="tertiary" onPress={onShowAll}>
              Show them
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export interface AttachmentProps {
  /** The file's name with its extension. */
  name: string;
  /** In bytes, or already said. */
  size?: number | string;
  /** Left out, it is attached. Going shows a line along its foot; failed turns its edge red and says why on hover. */
  state?: 'going' | 'failed';
  /** 0 to 100 while going. */
  progress?: number;
  /** Why it failed, read out and shown as its tip. */
  error?: string;
  /** Open it (a preview). Without it the name isn't pressable. */
  onOpen?: () => void;
  /** Take it off. Without it there is no remove button. */
  onRemove?: () => void;
  className?: string;
}

/**
 * A file attached to a message or a record, drawn as a small key: its icon, its name, the extension in
 * mono, its size, and a round remove button. While it sends, a line runs along its foot; if it fails, its
 * edge turns red and it says why.
 */
export function Attachment({ name, size, state, progress, error, onOpen, onRemove, className }: AttachmentProps) {
  const said = fileSize(size);
  const body = (
    <>
      <Icon name={state === 'failed' ? 'error' : fileIcon(name)} size={14} />
      <FileName name={name} />
      {said ? <span className="quill-attach-size">{said}</span> : null}
    </>
  );
  return (
    <span className={cx('quill-attach', className)} data-state={state} title={state === 'failed' ? error : undefined}>
      {onOpen ? (
        <button type="button" className="quill-attach-open" onClick={onOpen}>
          {body}
        </button>
      ) : (
        <span className="quill-attach-open">{body}</span>
      )}
      {state === 'failed' && error ? <span className="quill-attach-why">{error}</span> : null}
      {onRemove ? (
        <button type="button" className="quill-attach-x" aria-label={`Remove ${name}`} onClick={onRemove}>
          <Icon name="close" size={12} />
        </button>
      ) : null}
      {state === 'going' ? (
        <span className="quill-attach-line" data-running={progress == null ? '' : undefined} style={progress != null ? { width: `${Math.max(0, Math.min(100, progress))}%` } : undefined} />
      ) : null}
    </span>
  );
}

export interface PictureProps {
  src: string;
  /** What the image shows. Empty only when it is decoration. */
  alt: string;
  /** Its box's shape, kept while it loads and if it fails, so nothing jumps. */
  ratio?: string;
  /** Under the image: usually its name. */
  caption?: ReactNode;
  /** What the box says if the image can't load. */
  fallback?: string;
  className?: string;
}

/**
 * An image in a well that keeps its shape. While it loads a hairline sits across the middle; if it can't
 * load, the box stays and says so, with an image icon, rather than showing a broken image.
 */
export function Picture({ src, alt, ratio = '4 / 3', caption, fallback = 'Couldn’t load', className }: PictureProps) {
  const [state, setState] = useState<'loading' | 'loaded' | 'failed'>('loading');
  const [shown, setShown] = useState(src);
  // A new src starts loading again; reset while rendering, so a cached image's load isn't undone after it.
  if (shown !== src) {
    setShown(src);
    setState('loading');
  }
  return (
    <figure className={cx('quill-picture', className)} data-state={state}>
      <div className="quill-picture-box" style={{ aspectRatio: ratio }}>
        {state !== 'failed' ? <img src={src} alt={alt} ref={(img) => { if (img?.complete && img.naturalWidth && state === 'loading') setState('loaded'); }} onLoad={() => setState('loaded')} onError={() => setState('failed')} /> : null}
        {state === 'failed' ? (
          <span className="quill-picture-fall" role="img" aria-label={alt ? `${alt}: ${fallback}` : fallback}>
            <Icon name="image" size={24} />
            <span aria-hidden="true">{fallback}</span>
          </span>
        ) : null}
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

export interface FilePreviewProps {
  /** The file's name with its extension. */
  name: string;
  /** In bytes, or already said. */
  size?: number | string;
  /** How many pages it has. With more than one and `onPage`, it pages with Back and On rather than scrolling. */
  pages?: number;
  /** The page showing, from 1. */
  page?: number;
  onPage?: (page: number) => void;
  /** The page itself: an image, a rendered page, the text. */
  children?: ReactNode;
  /** Why it can't be shown here, in one sentence. Shown in place of the page, with Download. */
  unavailable?: string;
  onDownload?: () => void;
  onClose?: () => void;
  className?: string;
}

/**
 * A file opened to read in place, in a well: its name and size at the head with Download and Close, the
 * page, and Back and On to page through rather than scroll. A file that can't be shown says why and
 * offers Download instead.
 */
export function FilePreview({ name, size, pages, page = 1, onPage, children, unavailable, onDownload, onClose, className }: FilePreviewProps) {
  const said = [fileSize(size), pages ? `${pages} ${pages === 1 ? 'page' : 'pages'}` : undefined].filter(Boolean).join(' · ');
  return (
    <section className={cx('quill-preview', className)} aria-label={name} data-unavailable={unavailable ? '' : undefined}>
      <header className="quill-preview-head">
        <Icon name={fileIcon(name)} size={16} />
        <span className="quill-preview-title">
          <FileName name={name} />
          {said ? <span className="quill-preview-meta">{said}</span> : null}
        </span>
        {onDownload ? (
          <Button size="sm" kind="ghost" icon={<Icon name="download" size={14} />} onPress={onDownload}>
            Download
          </Button>
        ) : null}
        {onClose ? (
          <Button size="sm" kind="ghost" icon={<Icon name="close" size={14} />} onPress={onClose}>
            Close
          </Button>
        ) : null}
      </header>
      {unavailable ? (
        <p className="quill-preview-none">{unavailable}</p>
      ) : (
        <div className="quill-preview-page">{children}</div>
      )}
      {!unavailable && pages && pages > 1 && onPage ? (
        <footer className="quill-preview-foot">
          <Button size="sm" kind="tertiary" disabled={page <= 1} reason="This is the first page." onPress={() => onPage(page - 1)}>
            Back
          </Button>
          <span aria-live="polite">
            {page} / {pages}
          </span>
          <Button size="sm" kind="tertiary" disabled={page >= pages} reason="This is the last page." onPress={() => onPage(page + 1)}>
            On
          </Button>
        </footer>
      ) : null}
    </section>
  );
}
