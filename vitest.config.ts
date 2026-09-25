import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['Tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    reporters: ['verbose'],
  },
});
