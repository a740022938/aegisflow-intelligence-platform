@echo off
setlocal

echo ╔══════════════════════════════════════════════════════════════╗
echo ║   WARNING: This script will revert staged/worktree changes  ║
echo ║   on 13 pre-seal repair files via 'git restore'.            ║
echo ║   Unsaved changes will be LOST.                             ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

set /p CONFIRM=Type CONFIRM to proceed: 
if not "%CONFIRM%"=="CONFIRM" (
  echo [rollback] Cancelled.
  exit /b 0
)

set "REPO_ROOT=%~dp0.."
cd /d "%REPO_ROOT%"

echo [rollback] Reverting P4 pre-seal repair files...

git restore --worktree --staged ^
  apps/local-api/src/db/builtin-sqlite.ts ^
  apps/local-api/src/index.ts ^
  apps/local-api/src/datasets/index.ts ^
  apps/local-api/src/training/index.ts ^
  apps/local-api/src/models/index.ts ^
  apps/local-api/src/templates/index.ts ^
  apps/web-ui/src/components/Layout.tsx ^
  apps/web-ui/src/pages/Outputs.tsx ^
  apps/web-ui/src/pages/Knowledge.tsx ^
  apps/web-ui/src/pages/Feedback.tsx ^
  apps/web-ui/src/pages/CostRouting.tsx ^
  audit/pre_seal_repair_api_checks.json ^
  audit/pre_seal_repair_schema_evidence.json ^
  audit/pre_seal_repair_report.md

if errorlevel 1 (
  echo [rollback] Failed. Please resolve conflicts or run git status for details.
  exit /b 1
)

echo [rollback] Done.
exit /b 0
