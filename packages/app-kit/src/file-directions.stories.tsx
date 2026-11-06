import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Icon, type IconName } from '@augur/kit-common';
import { useState, type ReactNode } from 'react';
import './file-directions.stories.css';

/**
 * Round H, files and media: three directions to pick from. Each one draws the same five parts the same
 * way of its own: the drop target, the upload list (with a failed file showing its error and Retry), an
 * attachment chip, an image with its fallback, and a file preview. A last page shows each in use, in a
 * composer and on a record page.
 *
 * - **A · Tray**: the drop target is a well that owns its section. Each file is a row in it with its own
 *   line of progress along the row's foot. Chips are small keys. Nearest prior art: an office in-tray.
 * - **B · Manifest**: a slim ruled strip to drop on, and the whole page takes a drop too. The batch has one
 *   line across its head; each file says its state in mono at the row's end. Chips are ruled tags.
 *   Nearest prior art: a shipping manifest or a departures board.
 * - **C · Post**: a compact slot to post files into. A file says only "Sending" until it is done, then is
 *   stamped. Chips are paper tabs; the preview opens on a Sheet over a dimmed page. Nearest prior art: a
 *   post room's franking stamp.
 *
 * In all three a failed file shows its error in red with Retry and waits for nothing: green stays for
 * "needs you" only, so it never marks a drop or a finished upload. A big batch shows a screenful and
 * "N more", never a scroll. Story page only: no part changes until one is picked.
 */
const meta = {
  title: 'Quill/File and media directions',
  parameters: { layout: 'padded' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

type Dir = 'tray' | 'manifest' | 'post';
const DIRS: { id: Dir; name: string; from: string }[] = [
  { id: 'tray', name: 'A · Tray', from: 'An office in-tray: a well that holds the files, each its own row.' },
  { id: 'manifest', name: 'B · Manifest', from: 'A shipping manifest: one ruled line per file, the state at its end.' },
  { id: 'post', name: 'C · Post', from: 'A post room: post files through a slot; each is stamped when it lands.' },
];

type State = 'waiting' | 'going' | 'done' | 'failed';
interface Upload {
  name: string;
  kind: string;
  size: string;
  state: State;
  pct?: number;
  error?: string;
}

const iconFor = (kind: string): IconName =>
  ({ pdf: 'document', docx: 'document', txt: 'document', md: 'document', xlsx: 'series', csv: 'series', jpg: 'image', png: 'image', mp4: 'video', wav: 'music', log: 'history', zip: 'folder' })[kind] ?? 'document';

const FEW: Upload[] = [
  { name: 'Halden brief', kind: 'pdf', size: '2.4 MB', state: 'done' },
  { name: 'Night roster', kind: 'xlsx', size: '86 KB', state: 'going', pct: 64 },
  { name: 'Engine log 0611', kind: 'log', size: '48 MB', state: 'failed', error: 'Bigger than the 25 MB this floor takes.' },
];

const KINDS = ['pdf', 'csv', 'jpg', 'docx', 'txt', 'png'];
const MANY: Upload[] = Array.from({ length: 40 }, (_, i) => {
  const state: State = i < 31 ? 'done' : i < 35 ? 'going' : i < 38 ? 'waiting' : 'failed';
  return {
    name: `Port camera ${String(i + 1).padStart(2, '0')}`,
    kind: KINDS[i % KINDS.length]!,
    size: `${(1 + ((i * 7) % 30) / 10).toFixed(1)} MB`,
    state,
    pct: state === 'going' ? 20 + ((i * 17) % 70) : undefined,
    error: state === 'failed' ? 'The connection dropped.' : undefined,
  };
});

const SAY: Record<State, string> = { waiting: 'Waiting', going: 'Sending', done: 'Sent', failed: 'Couldn’t send' };

function Frame({ dir, children }: { dir: Dir; children: ReactNode }) {
  const d = DIRS.find((x) => x.id === dir)!;
  return (
    <section className="fd-frame" data-dir={dir}>
      <header className="fd-name">
        <span>{d.name}</span>
        <small>{d.from}</small>
      </header>
      {children}
    </section>
  );
}

function Row3({ render }: { render: (dir: Dir) => ReactNode }) {
  return (
    <div className="fd-row3">
      {DIRS.map((d) => (
        <Frame key={d.id} dir={d.id}>
          {render(d.id)}
        </Frame>
      ))}
    </div>
  );
}

/* ---- Drop target ---- */

function Drop({ dir, over, compact }: { dir: Dir; over?: boolean; compact?: boolean }) {
  const words = dir === 'post' ? 'Post files here' : dir === 'manifest' ? 'Drop files anywhere on the page' : 'Drop files here';
  return (
    <div className="fd-drop" data-over={over ? '' : undefined} data-compact={compact ? '' : undefined}>
      <Icon name="upload" size={dir === 'tray' && !compact ? 24 : 16} />
      <span className="fd-drop-words">{over ? 'Let go to add them' : words}</span>
      {!compact && dir !== 'post' ? <span className="fd-drop-hint">PDF, Word, sheets, images or logs, up to 25 MB each</span> : null}
      <Button size="sm">Choose files</Button>
    </div>
  );
}

/* ---- Upload list ---- */

function Mark({ dir, u }: { dir: Dir; u: Upload }) {
  if (u.state === 'failed')
    return (
      <span className="fd-state" data-state="failed">
        <Icon name="error" size={14} />
        {dir === 'post' ? <b className="fd-stamp">Returned</b> : 'Couldn’t send'}
      </span>
    );
  if (dir === 'post') return <span className="fd-state" data-state={u.state}>{u.state === 'done' ? <b className="fd-stamp">Sent</b> : SAY[u.state]}</span>;
  return (
    <span className="fd-state" data-state={u.state}>
      {u.state === 'going' ? `${u.pct}%` : SAY[u.state]}
    </span>
  );
}

function UploadRow({ dir, u }: { dir: Dir; u: Upload }) {
  return (
    <li className="fd-up" data-state={u.state}>
      <span className="fd-up-icon">
        <Icon name={iconFor(u.kind)} size={16} />
      </span>
      <span className="fd-up-name">
        {u.name}
        <span className="fd-ext">.{u.kind}</span>
      </span>
      <span className="fd-up-size">{u.size}</span>
      <Mark dir={dir} u={u} />
      {u.state === 'failed' ? (
        <Button size="sm" kind="ghost">
          Retry
        </Button>
      ) : u.state !== 'done' ? (
        <Button size="sm" kind="ghost" icon={<Icon name="close" size={14} />}>
          Stop
        </Button>
      ) : (
        <span className="fd-up-gap" />
      )}
      {u.state === 'failed' ? <span className="fd-up-error">{u.error}</span> : null}
      {dir === 'tray' && u.state === 'going' ? <span className="fd-up-line" style={{ width: `${u.pct}%` }} /> : null}
    </li>
  );
}

const SHOW = 6;

function Uploads({ dir, files }: { dir: Dir; files: Upload[] }) {
  const done = files.filter((f) => f.state === 'done').length;
  const failed = files.filter((f) => f.state === 'failed');
  const rest = files.filter((f) => f.state !== 'done');
  const overall = Math.round((files.reduce((n, f) => n + (f.state === 'done' ? 100 : (f.pct ?? 0)), 0) / (files.length * 100)) * 100);
  const big = files.length > SHOW;
  // A big batch: what still needs a look first (failed, then going), then the count of the rest.
  const shown = big ? [...failed, ...rest.filter((f) => f.state !== 'failed')].slice(0, SHOW) : files;
  return (
    <div className="fd-list">
      <div className="fd-list-head">
        <span>
          {done} of {files.length} sent
          {failed.length ? <span className="fd-bad"> · {failed.length} couldn’t</span> : null}
        </span>
        {dir === 'manifest' ? <span>{overall}%</span> : null}
        {failed.length > 1 ? (
          <Button size="sm" kind="ghost">
            Retry all
          </Button>
        ) : null}
      </div>
      {dir === 'manifest' ? (
        <span className="fd-batch-line">
          <i style={{ width: `${overall}%` }} />
        </span>
      ) : null}
      <ul>
        {shown.map((u) => (
          <UploadRow key={u.name} dir={dir} u={u} />
        ))}
      </ul>
      {big ? (
        <div className="fd-more">
          <span>{files.length - shown.length} more, all sent</span>
          <Button size="sm" kind="tertiary">
            Show them
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/* ---- Attachment chips ---- */

function Chip({ dir, name, kind, size, state, remove = true }: { dir: Dir; name: string; kind: string; size?: string; state?: State; remove?: boolean }) {
  return (
    <span className="fd-chip" data-state={state}>
      <Icon name={iconFor(kind)} size={14} />
      <span className="fd-chip-name">{name}</span>
      <span className="fd-ext">{dir === 'manifest' ? kind.toUpperCase() : `.${kind}`}</span>
      {size ? <span className="fd-chip-size">{size}</span> : null}
      {state === 'going' ? <span className="fd-chip-line" /> : null}
      {state === 'failed' ? <Icon name="error" size={14} label="Couldn’t send" /> : null}
      {remove ? (
        <button type="button" className="fd-chip-x" aria-label={`Remove ${name}`}>
          <Icon name="close" size={12} />
        </button>
      ) : null}
    </span>
  );
}

function Chips({ dir }: { dir: Dir }) {
  return (
    <div className="fd-chips">
      <Chip dir={dir} name="Halden brief" kind="pdf" size="2.4 MB" />
      <Chip dir={dir} name="Night roster" kind="xlsx" state="going" />
      <Chip dir={dir} name="Deck plan" kind="png" size="640 KB" />
      <Chip dir={dir} name="Engine log 0611" kind="log" state="failed" />
      <Chip dir={dir} name="Vessel list" kind="csv" remove={false} />
    </div>
  );
}

/* ---- Image with fallback ---- */

function Img({ dir, state, label }: { dir: Dir; state: 'loaded' | 'loading' | 'failed'; label: string }) {
  return (
    <figure className="fd-img" data-state={state}>
      <div className="fd-img-box" role="img" aria-label={state === 'failed' ? `${label}: couldn’t load` : label}>
        {state === 'loaded' ? <span className="fd-photo" /> : null}
        {state === 'loading' ? <span className="fd-img-wait" /> : null}
        {state === 'failed' ? (
          <span className="fd-img-fall">
            <Icon name="image" size={dir === 'tray' ? 24 : 16} />
            <span>{dir === 'post' ? 'Didn’t arrive' : 'Couldn’t load'}</span>
          </span>
        ) : null}
      </div>
      <figcaption>
        {label}
        <span className="fd-ext">{state === 'failed' ? 'jpg · 1.2 MB' : 'jpg'}</span>
      </figcaption>
    </figure>
  );
}

/* ---- File preview ---- */

function Preview({ dir }: { dir: Dir }) {
  const body = (
    <div className="fd-pv">
      <div className="fd-pv-head">
        <Icon name="document" size={16} />
        <span className="fd-pv-name">
          <span>
            Halden brief<span className="fd-ext">.pdf</span>
          </span>
          <span className="fd-pv-meta">2.4 MB · 12 pages</span>
        </span>
        <Button size="sm" kind="ghost" icon={<Icon name="download" size={14} />}>
          Download
        </Button>
        <Button size="sm" kind="ghost" icon={<Icon name="close" size={14} />}>
          Close
        </Button>
      </div>
      <div className="fd-pv-page">
        <span className="fd-pv-title" />
        {[92, 88, 95, 60, 0, 90, 84, 93, 70].map((w, i) => (w ? <span key={i} className="fd-pv-text" style={{ width: `${w}%` }} /> : <span key={i} className="fd-pv-gap" />))}
      </div>
      <div className="fd-pv-foot">
        <Button size="sm" kind="tertiary">
          Back
        </Button>
        <span>1 / 12</span>
        <Button size="sm" kind="tertiary">
          On
        </Button>
      </div>
    </div>
  );
  if (dir === 'post')
    return (
      <div className="fd-pv-dim">
        <div className="fd-pv-under" />
        {body}
      </div>
    );
  return body;
}

function NoPreview({ dir }: { dir: Dir }) {
  return (
    <div className="fd-pv fd-pv-none">
      <Icon name="history" size={dir === 'tray' ? 24 : 16} />
      <span>Engine log 0611.log can’t be shown here: it’s 48 MB, more than a preview reads.</span>
      <Button size="sm" icon={<Icon name="download" size={14} />}>
        Download
      </Button>
    </div>
  );
}

/* ---- Stories ---- */

/** Where files go in: at rest, while files are dragged over, and the one-line size for a dialog or panel. */
export const DropTarget: Story = {
  render: () => (
    <Row3
      render={(dir) => (
        <div className="fd-stack">
          <Drop dir={dir} />
          <Drop dir={dir} over />
          <Drop dir={dir} compact />
        </div>
      )}
    />
  ),
};

/** Three files of different kinds: one sent, one going, one that failed with its error and Retry. */
export const UploadListFew: Story = { name: 'Upload list: a few', render: () => <Row3 render={(dir) => <Uploads dir={dir} files={FEW} />} /> };

/** Forty images at once: what still needs a look comes first, a screenful, then "N more". No scroll. */
export const UploadListMany: Story = { name: 'Upload list: a batch of 40', render: () => <Row3 render={(dir) => <Uploads dir={dir} files={MANY} />} /> };

/** Attached to a message or a record: at rest, still sending, failed, and one you can't remove. */
export const AttachmentChips: Story = { render: () => <Row3 render={(dir) => <Chips dir={dir} />} /> };

/** An image loaded, still coming, and failed: the fallback keeps the space and says why. */
export const ImageFallback: Story = {
  name: 'Image with fallback',
  render: () => (
    <Row3
      render={(dir) => (
        <div className="fd-imgs">
          <Img dir={dir} state="loaded" label="Port camera 04" />
          <Img dir={dir} state="loading" label="Port camera 05" />
          <Img dir={dir} state="failed" label="Port camera 06" />
        </div>
      )}
    />
  ),
};

/** A document opened to read in place, paged rather than scrolled, and a file too big to show. */
export const FilePreview: Story = {
  render: () => (
    <Row3
      render={(dir) => (
        <div className="fd-stack">
          <Preview dir={dir} />
          <NoPreview dir={dir} />
        </div>
      )}
    />
  ),
};

function Demo({ dir }: { dir: Dir }) {
  const [sent, setSent] = useState(false);
  return (
    <div className="fd-stack">
      <div className="fd-composer">
        <span className="fd-composer-words">Here’s tonight’s roster and the brief. Can you check the swaps?</span>
        <Chips dir={dir} />
        <div className="fd-composer-foot">
          <Button size="sm" kind="ghost" icon={<Icon name="link" size={14} />}>
            Attach
          </Button>
          <Button size="sm" kind="primary" onPress={() => setSent(true)}>
            {sent ? 'Sent' : 'Send'}
          </Button>
        </div>
      </div>
      <div className="fd-record">
        <div className="fd-record-head">Vessel Halden · files</div>
        <Drop dir={dir} compact />
        <Uploads dir={dir} files={FEW} />
        <div className="fd-imgs">
          <Img dir={dir} state="loaded" label="Bridge" />
          <Img dir={dir} state="failed" label="Deck plan" />
        </div>
      </div>
    </div>
  );
}

/** Each direction in use: attaching to a message in a composer, and the files on a record page. */
export const InUse: Story = { name: 'In use', render: () => <Row3 render={(dir) => <Demo dir={dir} />} /> };
