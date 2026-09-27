import { defineConfig } from 'vite';

// Relative base so the built game works from any path (npm run
// preview, GitHub Pages subfolder, or an installed PWA).
export default defineConfig({
  base: './',
});
