@echo off
setlocal enabledelayedexpansion

echo [v6.4.0 rollback] start

set "SCRIPT_DIR=%~dp0"
set "REPO_ROOT=%SCRIPT_DIR%.."
set "DB_PATH=%REPO_ROOT%\packages\db\agi_factory.db"
set "BACKUP_DIR=%REPO_ROOT%\backups\v6.4.0_rollback"

if not exist "%DB_PATH%" (
  echo [ERROR] DB not found: %DB_PATH%
  exit /b 1
)

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

for /f %%I in ('powershell -NoProfile -Command "(Get-Date).ToString('yyyyMMdd_HHmmss')"') do set "TS=%%I"
set "DB_SNAPSHOT=%BACKUP_DIR%\agi_factory_pre_rollback_v640_%TS%.db"

copy /y "%DB_PATH%" "%DB_SNAPSHOT%" >nul
if errorlevel 1 (
  echo [ERROR] DB snapshot failed
  exit /b 1
)
echo [OK] DB snapshot: %DB_SNAPSHOT%

node -e "const { DatabaseSync } = require('node:sqlite'); const db = new DatabaseSync(process.argv[1]); db.exec(\"DROP TABLE IF EXISTS route_decisions; DROP TABLE IF EXISTS route_policies; DELETE FROM audit_logs WHERE category='cost_routing';\"); db.close(); console.log('[OK] rollback SQL executed');" "%DB_PATH%"
if errorlevel 1 (
  echo [ERROR] rollback SQL failed
  exit /b 1
)

echo [DONE] v6.4.0 rollback completed
exit /b 0

