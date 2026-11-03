import { defineConfig } from 'vitest/config';

// Renders every story in happy-dom and runs axe on it (a11y.test.tsx). Fast and browserless, so it runs
// in the one CI job; colour contrast needs a real browser, so axe reports it as incomplete here.
export default defineConfig({ test: { environment: 'happy-dom', include: ['*.test.tsx'], testTimeout: 20_000 } });
