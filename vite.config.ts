import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
