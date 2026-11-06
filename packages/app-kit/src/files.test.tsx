// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Attachment, FilePreview, UploadList, fileIcon, fileSize, splitName, type UploadItem } from './files.js';

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

let root: Root | undefined;
let host: HTMLElement | undefined;
const draw = (node: React.ReactNode) => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  act(() => root!.render(node));
  return host;
};
afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
});

describe('file helpers', () => {
  it('splits a name at its last dot and picks an icon', () => {
    expect(splitName('Halden brief.v2.pdf')).toEqual(['Halden brief.v2', 'pdf']);
    expect(splitName('.env')).toEqual(['.env', '']);
    expect(fileIcon('roster.XLSX')).toBe('series');
    expect(fileIcon('mystery.qqq')).toBe('document');
  });
  it('says sizes as people do', () => {
    expect(fileSize(512)).toBe('512 B');
    expect(fileSize(86_000)).toBe('86 KB');
    expect(fileSize(2_400_000)).toBe('2.4 MB');
    expect(fileSize('310 MB')).toBe('310 MB');
  });
});

describe('UploadList', () => {
  const many: UploadItem[] = Array.from({ length: 10 }, (_, i) => ({ id: `f${i}`, name: `f${i}.jpg`, state: i === 9 ? 'failed' : 'done', error: i === 9 ? 'The connection dropped.' : undefined }));

  it('puts what failed first, folds the rest and never shows green', () => {
    const el = draw(<UploadList items={many} show={4} onRetry={vi.fn()} />);
    const rows = el.querySelectorAll('.quill-upload');
    expect(rows).toHaveLength(4);
    expect(rows[0]!.getAttribute('data-state')).toBe('failed');
    expect(el.textContent).toContain('The connection dropped.');
    expect(el.textContent).toContain('6 more, all sent');
    expect(el.textContent).toContain('9 of 10 sent');
  });

  it('retries a failed file', () => {
    const onRetry = vi.fn();
    const el = draw(<UploadList items={many} show={4} onRetry={onRetry} />);
    const retry = [...el.querySelectorAll('button')].find((b) => b.textContent === 'Retry')!;
    act(() => retry.click());
    expect(onRetry).toHaveBeenCalledWith('f9');
  });
});

describe('Attachment and FilePreview', () => {
  it('removes an attachment and names it for assistive tech', () => {
    const onRemove = vi.fn();
    const el = draw(<Attachment name="Halden brief.pdf" size={2_400_000} onRemove={onRemove} />);
    const x = el.querySelector<HTMLButtonElement>('[aria-label="Remove Halden brief.pdf"]')!;
    act(() => x.click());
    expect(onRemove).toHaveBeenCalled();
    expect(el.textContent).toContain('2.4 MB');
  });

  it('says why a file cannot be shown, in place of the page', () => {
    const el = draw(<FilePreview name="log.log" unavailable="Too big to show.">page</FilePreview>);
    expect(el.textContent).toContain('Too big to show.');
    expect(el.querySelector('.quill-preview-page')).toBeNull();
  });
});
