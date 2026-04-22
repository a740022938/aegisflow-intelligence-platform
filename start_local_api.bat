@echo off
if not defined OPENCLAW_BASE_URL set OPENCLAW_BASE_URL=http://127.0.0.1:18789
if not defined OPENCLAW_HEARTBEAT_TOKEN set OPENCLAW_HEARTBEAT_TOKEN=replace-with-strong-token
if not defined OPENCLAW_ADMIN_TOKEN set OPENCLAW_ADMIN_TOKEN=replace-with-admin-token
if not defined NODE_ENV set NODE_ENV=development
cd /d "%~dp0apps\local-api"
npx tsx src/index.ts
