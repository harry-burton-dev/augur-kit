// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { onlineManager } from '@tanstack/react-query';
import { AppError } from './client.js';
import { DataProvider, DataView, newDataClient, useChange, useData } from './query.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
const draw = async (node: React.ReactNode) => {
  document.body.replaceChildren(document.createElement('div'));
  root = createRoot(document.body.firstElementChild!);
  await act(async () => root!.render(node));
};
const settle = () => act(() => new Promise((r) => setTimeout(r, 20)));
const text = () => document.body.textContent ?? '';
const button = (name: string) => [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === name)!;
afterEach(() => {
  act(() => root?.unmount());
  vi.doUnmock('markdown-it');
  vi.doUnmock('./editor-engine.js');
  vi.resetModules();
});

// The chunk never comes back in these: Chromium keeps a failed import until the page reloads, so
// nothing here may pass by loading it a second time.
describe('a chunk that fails to load', () => {
  beforeEach(() => vi.resetModules());
  const reload = () => vi.spyOn(window.location, 'reload').mockImplementation(() => {});

  it('Reader shows the words, says so, and offers only a reload', async () => {
    vi.doMock('markdown-it', () => {
      throw new Error('Failed to fetch');
    });
    const { Reader } = await import('./reader.js');
    await draw(<Reader markdown={'# Title\n\nSome words.'} />);
    await settle();
    expect(document.querySelector('article')!.hasAttribute('aria-busy')).toBe(false);
    expect(text()).toContain('Some words.');
    expect(text()).toContain('formatting didn’t load');
    expect(text()).not.toContain('Try again');
    const reloaded = reload();
    await act(async () => button('Reload the page').click());
    expect(reloaded).toHaveBeenCalledOnce();
    reloaded.mockRestore();
  });

  it('loadReader asks again after a failure, for browsers that can fetch it', async () => {
    let asked = 0;
    vi.doMock('markdown-it', () => {
      asked++;
      throw new Error('Failed to fetch');
    });
    const { loadReader } = await import('./reader.js');
    await expect(loadReader()).rejects.toThrow();
    await expect(loadReader()).rejects.toThrow();
    expect(asked).toBe(2);
  });

  describe('the Editor', () => {
    const failing = () =>
      vi.doMock('./editor-engine.js', () => {
        throw new Error('Failed to fetch');
      });
    const silent = () => vi.spyOn(console, 'error').mockImplementation(() => {});

    it('says what happened in its own place and offers only a reload', async () => {
      failing();
      const { Editor } = await import('./editor.js');
      const error = silent();
      await draw(
        <main>
          <p>The rest of the page</p>
          <Editor label="Brief" />
        </main>,
      );
      await settle();
      expect(text()).toContain('The rest of the page');
      expect(text()).toContain('Brief didn’t load');
      expect(text()).not.toContain('Try again');
      const reloaded = reload();
      await act(async () => button('Reload the page').click());
      expect(reloaded).toHaveBeenCalledOnce();
      reloaded.mockRestore();
      error.mockRestore();
    });

    it('leaves another Editor alone when one fails', async () => {
      const mounted: string[] = [];
      vi.doMock('./editor-engine.js', async () => {
        const { useEffect } = await import('react');
        const Engine = ({ label }: { label: string }) => {
          useEffect(() => void mounted.push(label), [label]);
          if (label === 'Bad') throw new Error('Broke');
          return <p>Writing in {label}</p>;
        };
        return { default: Engine };
      });
      const { Editor } = await import('./editor.js');
      const error = silent();
      const reloaded = reload();
      await draw(
        <main>
          <Editor label="Good" />
          <Editor label="Bad" />
        </main>,
      );
      await settle();
      await act(async () => button('Reload the page').click());
      await settle();
      expect(text()).toContain('Writing in Good');
      expect(mounted).toEqual(['Good']);
      reloaded.mockRestore();
      error.mockRestore();
    });

    it('still holds a Dialog’s primary when it is required and empty', async () => {
      failing();
      const { Editor } = await import('./editor.js');
      const { Dialog } = await import('@augur/kit-common');
      const error = silent();
      const onSubmit = vi.fn();
      await draw(<Dialog open heading="Note" actionLabel="Save" onClose={() => {}} onSubmit={onSubmit} fields={<Editor label="Brief" name="brief" required />} />);
      await settle();
      await act(async () => button('Save').click());
      expect(onSubmit).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(button('Reload the page'));
      error.mockRestore();
    });

    it('keeps what it was given in a Dialog’s values', async () => {
      failing();
      const { Editor } = await import('./editor.js');
      const { Dialog } = await import('@augur/kit-common');
      const error = silent();
      const onSubmit = vi.fn();
      await draw(<Dialog open heading="Note" actionLabel="Save" onClose={() => {}} onSubmit={onSubmit} fields={<Editor label="Brief" name="brief" required defaultValue="Words" />} />);
      await settle();
      await act(async () => button('Save').click());
      expect(onSubmit).toHaveBeenCalledWith({ brief: 'Words' });
      error.mockRestore();
    });

    it('doesn’t hold the primary when it is disabled', async () => {
      failing();
      const { Editor } = await import('./editor.js');
      const { Dialog } = await import('@augur/kit-common');
      const error = silent();
      const onSubmit = vi.fn();
      await draw(<Dialog open heading="Note" actionLabel="Save" onClose={() => {}} onSubmit={onSubmit} fields={<Editor label="Brief" name="brief" required disabled />} />);
      await settle();
      await act(async () => button('Save').click());
      expect(onSubmit).toHaveBeenCalledOnce();
      error.mockRestore();
    });
  });
});

describe('with the browser offline', () => {
  afterEach(() => onlineManager.setOnline(true));

  it('DataView says it can’t reach the service instead of loading for ever', async () => {
    onlineManager.setOnline(false);
    const Load = () => {
      const state = useData(['offline'], async () => {
        throw new TypeError('Failed to fetch');
      });
      return (
        <DataView state={state} loading="Loading runs" failed="Runs didn’t load">
          {() => null}
        </DataView>
      );
    };
    const client = newDataClient();
    await draw(
      <DataProvider client={client}>
        <Load />
      </DataProvider>,
    );
    await vi.waitFor(() => expect(text()).toContain('Runs didn’t load'), { timeout: 6000 });
    expect(text()).toContain('Try again');
  }, 8000);

  it('loads again when the connection comes back', async () => {
    onlineManager.setOnline(false);
    let down = true;
    const Load = () => {
      const state = useData(['back'], async () => {
        // A refusal isn't retried, so only the reconnect can load this again.
        if (down) throw new AppError('Refused.', 403);
        return 'Here';
      });
      return (
        <DataView state={state} loading="Loading">
          {(d) => <p>{d}</p>}
        </DataView>
      );
    };
    await draw(
      <DataProvider client={newDataClient()}>
        <Load />
      </DataProvider>,
    );
    await settle();
    expect(text()).toContain('Refused.');
    down = false;
    await act(async () => onlineManager.setOnline(true));
    await settle();
    expect(text()).toContain('Here');
  });

  it('useChange fails instead of waiting without end', async () => {
    onlineManager.setOnline(false);
    let said = '';
    const Change = () => {
      const change = useChange(async () => {
        throw new TypeError('Failed to fetch');
      });
      return <button onClick={() => void change.run().catch((e: Error) => (said = e.message))}>Save</button>;
    };
    await draw(
      <DataProvider client={newDataClient()}>
        <Change />
      </DataProvider>,
    );
    await act(async () => button('Save').click());
    await settle();
    expect(said).not.toBe('');
  });
});

describe('DataView with data that is waiting', () => {
  const waiting = { data: undefined, error: undefined, loading: false, refreshing: false, refresh: () => {} };

  it('doesn’t say loading when nothing is', async () => {
    await draw(
      <DataView state={waiting} loading="Loading runs">
        {() => null}
      </DataView>,
    );
    expect(text()).not.toContain('Loading runs');
  });

  it('says what is empty when it was told', async () => {
    await draw(
      <DataView state={waiting} loading="Loading runs" empty={{ heading: 'Pick a library first' }}>
        {() => null}
      </DataView>,
    );
    expect(text()).toContain('Pick a library first');
  });
});
