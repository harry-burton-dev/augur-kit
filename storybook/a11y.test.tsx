/// <reference types="vite/client" />
import { act, type FC } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import axe from 'axe-core';
import { composeStories, setProjectAnnotations } from '@storybook/react-vite';
import { afterEach, describe, expect, it } from 'vitest';
import preview from './.storybook/preview.js';

// axe on every story (PER-281): a serious or critical finding fails. Each story is drawn from its
// portable form, with the Storybook's own decorators and a11y parameters.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
setProjectAnnotations(preview);

type StoryModule = Parameters<typeof composeStories>[0];
const modules = import.meta.glob<StoryModule>('../packages/{kit-common,app-kit,shell-kit}/src/**/*.stories.tsx', { eager: true });
const failing = new Set(['serious', 'critical']);

let root: Root | undefined;
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  document.body.replaceChildren();
});

describe.each(Object.entries(modules).map(([file, mod]) => [file.replace('../packages/', ''), mod] as const))('%s', (_file, mod) => {
  const stories = Object.entries(composeStories(mod)) as [string, FC & { parameters?: Record<string, unknown> }][];
  it.each(stories)('%s has no serious or critical axe finding', async (_name, Story) => {
    const host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
    await act(async () => {
      root!.render(<Story />);
      await new Promise((r) => setTimeout(r, 0));
    });
    // Parts that load their code on first use (the editor) say aria-busy until it arrives: check them as they will be used.
    for (let i = 0; i < 50 && document.querySelector('.quill-editor[aria-busy]'); i++) await act(() => new Promise((r) => setTimeout(r, 20)));
    expect(document.querySelector('.quill-editor[aria-busy]'), 'the editor loaded').toBeNull();
    const a11y = (Story.parameters?.a11y ?? {}) as { options?: axe.RunOptions; disable?: boolean };
    if (a11y.disable) return;
    // In happy-dom, contrast can't be measured: it is checked in the Storybook's panel and Chromatic.
    const results = await axe.run(document.body, { ...a11y.options, rules: { 'color-contrast': { enabled: false }, region: { enabled: false }, ...a11y.options?.rules } });
    const found = results.violations
      .filter((v) => failing.has(v.impact ?? ''))
      .map((v) => `${v.impact} ${v.id}: ${v.help}\n  ${v.nodes.map((n) => n.html.slice(0, 160)).join('\n  ')}`);
    expect(found).toEqual([]);
  });
});
