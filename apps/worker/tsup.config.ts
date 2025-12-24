import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node22',

  sourcemap: true,
  clean: true,

  // Important for server-only code
  platform: 'node',
  splitting: false,
  treeshake: true,
  external: ['typesense'],
});
