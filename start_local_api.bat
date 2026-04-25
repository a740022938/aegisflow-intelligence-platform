@echo off
REM ====================================================================
REM  WARNING: Do NOT hardcode tokens in this file.
REM  Set OPENCLAW_HEARTBEAT_TOKEN and OPENCLAW_ADMIN_TOKEN via:
REM    - System environment variables (recommended for production)
REM    - .env.local file in the project root
REM  See .env.example for all available configuration options.
REM ====================================================================
if not defined OPENCLAW_BASE_URL set OPENCLAW_BASE_URL=http://127.0.0.1:18789
if not defined NODE_ENV set NODE_ENV=development
cd /d "%~dp0apps\local-api"
npx tsx src/index.ts
