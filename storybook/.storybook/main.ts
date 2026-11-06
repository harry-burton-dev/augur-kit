import type { StorybookConfig } from '@storybook/react-vite';

/** The kit's Storybook (AUGUR's ADR 0016). The stories live beside their parts. */
const config: StorybookConfig = {
  stories: ['../../packages/{kit-common,app-kit,shell-kit}/src/**/*.stories.tsx'],
  // axe on every story (PER-281): the Accessibility panel, and `pnpm test` fails a story with a serious or critical finding.
  // Docs: a part's Overview page (autodocs), from its props and its own comment, the way Carbon's Storybook reads.
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: { name: '@storybook/react-vite', options: {} },
  // Read props through imported types too, so a part's Docs page lists every prop with its own comment.
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: { tsconfigPath: './tsconfig.docgen.json', include: ['../packages/*/src/**/*.tsx'], exclude: ['**/*.stories.tsx', '**/*.test.tsx'], shouldExtractLiteralValuesFromEnum: true, propFilter: (prop) => !prop.parent || !/node_modules/.test(prop.parent.fileName) },
  },
};

export default config;
