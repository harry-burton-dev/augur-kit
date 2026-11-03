import type { StorybookConfig } from '@storybook/react-vite';

/** The kit's Storybook (AUGUR's ADR 0016). The stories live beside their parts. */
const config: StorybookConfig = {
  stories: ['../../packages/{kit-common,app-kit,shell-kit}/src/**/*.stories.tsx'],
  framework: { name: '@storybook/react-vite', options: {} },
};

export default config;
