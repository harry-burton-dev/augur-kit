// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { onlineManager } from '@tanstack/react-query';
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

describe('a chunk that fails to load', () => {
  beforeEach(() => vi.resetModules());

  it('Reader shows the words, says so, and can try again', async () => {
    let down = true;
    vi.doMock('markdown-it', async () => {
      if (down) throw new Error('Failed to fetch');
      return vi.importActual('markdown-it');
    });
    const { Reader } = await import('./reader.js');
    await draw(<Reader markdown={'# Title\n\nSome words.'} />);
    await settle();
    expect(document.querySelector('article')!.hasAttribute('aria-busy')).toBe(false);
    expect(text()).toContain('Some words.');
    expect(text()).toContain('formatting didn’t load');
    down = false;
    vi.resetModules();
    await act(async () => button('Try again').click());
    await settle();
    expect(document.querySelector('article h1')?.textContent).toBe('Title');
    expect(text()).not.toContain('formatting didn’t load');
  });

  it('loadReader doesn’t keep a failure', async () => {
    let down = true;
    vi.doMock('markdown-it', async () => {
      if (down) throw new Error('Failed to fetch');
      return vi.importActual('markdown-it');
    });
    const { loadReader } = await import('./reader.js');
    await expect(loadReader()).rejects.toThrow();
    down = false;
    vi.resetModules();
    await expect(loadReader()).resolves.toBeDefined();
  });

  it('Editor says what happened in its own place, and can try again', async () => {
    let down = true;
    vi.doMock('./editor-engine.js', () => {
      if (down) throw new Error('Failed to fetch');
      return { default: () => <p>Engine here</p> };
    });
    const { Editor } = await import('./editor.js');
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    await draw(
      <main>
        <p>The rest of the page</p>
        <Editor label="Brief" />
      </main>,
    );
    await settle();
    expect(text()).toContain('The rest of the page');
    expect(text()).toContain('Brief didn’t load');
    down = false;
    vi.resetModules();
    await act(async () => button('Try again').click());
    await settle();
    expect(text()).toContain('Engine here');
    error.mockRestore();
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
        if (down) throw Object.assign(new Error('refused'), { status: 403 });
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
    down = false;
    await act(async () => onlineManager.setOnline(true));
    await vi.waitFor(() => expect(text()).toContain('Here'), { timeout: 6000 });
  }, 8000);

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
