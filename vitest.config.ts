/**
 * Vitest config — tests run against the same Vite setup as the app
 * (including the Tailwind plugin), but with the `test` section telling
 * Vitest to use a JSDOM-free, Node-only environment by default.
 *
 * Tests live next to the code they cover as *.test.ts(x) files (e.g.
 * src/utils/csv.test.ts). Add new test files there and they're picked
 * up automatically.
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    globals: false,
  },
});
