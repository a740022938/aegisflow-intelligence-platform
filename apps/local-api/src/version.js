// Source-run shim for Node tests that import .ts route files directly.
// Production builds emit dist/version.js from version.ts.
export { APP_VERSION } from './version.ts';
