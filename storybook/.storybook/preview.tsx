import type { Preview } from '@storybook/react-vite';
import '@augur/kit-common/tokens.css';
import '@augur/kit-common/fonts.css';
import './page.css';
import '@augur/kit-common/kit.css';
import '@augur/app-kit/kit.css';
import '@augur/shell-kit/kit.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    backgrounds: { disable: true },
    // axe on every story. A serious or critical finding fails `pnpm test` (a11y.test.tsx) and, with
    // Storybook's test tools, the story; WCAG 2.2 AA is the bar.
    a11y: { test: 'error', options: { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } } },
  },
  decorators: [
    (Story) => {
      document.body.classList.add('w-ground');
      return <Story />;
    },
  ],
};

export default preview;
