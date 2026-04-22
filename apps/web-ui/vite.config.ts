import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootPkgPath = path.resolve(__dirname, '../../package.json');
const localPkgPath = path.resolve(__dirname, 'package.json');
const versionPkgPath = fs.existsSync(rootPkgPath) ? rootPkgPath : localPkgPath;
const pkg = JSON.parse(fs.readFileSync(versionPkgPath, 'utf8')) as { version?: string };
const appVersion = String(pkg.version || '0.0.0');

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: 'all',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    },
  },
});
