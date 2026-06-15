import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

/**
 * Dev-only plugin: loosen `script-src` to allow Vite's HMR inline
 * scripts (the `@react-refresh` setup block + the `?t=…` cache-bust
 * imports). Without this, the strict CSP in index.html blocks the
 * inline `window.$RefreshReg$` setup → main.tsx throws → white page.
 *
 * Production builds DON'T inject those inline scripts, so we leave the
 * production CSP strict (no `unsafe-inline` / `unsafe-eval`). The
 * plugin is a no-op for `vite build`.
 */
function devCspLoosener(): Plugin {
  return {
    name: 'dev-csp-loosener',
    apply: 'serve',
    transformIndexHtml(html) {
      return html.replace(
        /script-src 'self';/,
        "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), devCspLoosener()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    // Use Vite's default `dist/` so Vercel's Vite preset picks up the
    // output without needing a custom "Output Directory" override.
    outDir: 'dist',
  },
  server: {
    open: true,
    host: true,
    allowedHosts: ['.ngrok-free.app', '.ngrok-free.dev'],
  },
});
