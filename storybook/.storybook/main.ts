import type { StorybookConfig } from '@storybook/react-vite';

/** The kit's Storybook (AUGUR's ADR 0016). The stories live beside their parts. */
const config: StorybookConfig = {
  stories: ['../../packages/{kit-common,app-kit,shell-kit}/src/**/*.stories.tsx'],
  // axe on every story (PER-281): the Accessibility panel, and `pnpm test` fails a story with a serious or critical finding.
  addons: ['@storybook/addon-a11y'],
  framework: { name: '@storybook/react-vite', options: {} },
};

export default config;
