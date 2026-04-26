@echo off
REM ============================================================
REM AGI Model Factory - v6.3.0 Rollback Script (Windows)
REM Feedback loop v1 rollback (minimal and safe)
REM ============================================================

setlocal enabledelayedexpansion

set "REPO=E:\AIP\repo"
set "DB=%REPO%\packages\db\agi_factory.db"
set "SNAPSHOT=%REPO%\backups\v6.3.0\db\agi_factory_v6.3.0_snapshot.db"
set "GIT_REF=HEAD~1"

if not "%~1"=="" set "SNAPSHOT=%~1"
if not "%~2"=="" set "GIT_REF=%~2"

echo.
echo [v6.3.0 rollback] repo=%REPO%
echo [v6.3.0 rollback] db=%DB%
echo [v6.3.0 rollback] snapshot=%SNAPSHOT%
echo [v6.3.0 rollback] git_ref=%GIT_REF%
echo.

REM 1) Stop local-api process on 8787
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8787 ^| findstr LISTENING') do (
  echo [1/5] stop PID %%a on 8787
  taskkill /F /PID %%a >nul 2>&1
)

REM 2) Restore DB from snapshot if exists
if exist "%SNAPSHOT%" (
  echo [2/5] restore DB snapshot...
  if exist "%DB%-wal" del /f /q "%DB%-wal" >nul 2>&1
  if exist "%DB%-shm" del /f /q "%DB%-shm" >nul 2>&1
  copy /y "%SNAPSHOT%" "%DB%" >nul
  echo        DB restored from snapshot
) else (
  echo [2/5] snapshot not found, skip DB restore
)

REM 3) Optional DB cleanup for feedback tables (if sqlite3 available)
where sqlite3 >nul 2>&1
if %ERRORLEVEL%==0 (
  echo [3/5] optional cleanup feedback tables data...
  sqlite3 "%DB%" "DELETE FROM feedback_items; DELETE FROM feedback_batches;" >nul 2>&1
  echo        feedback data cleared (tables kept)
) else (
  echo [3/5] sqlite3 not found, skip feedback data cleanup
)

REM 4) Restore v6.3.0 touched source files from previous git ref
cd /d "%REPO%"
echo [4/5] restoring source files from %GIT_REF% ...
git restore --source=%GIT_REF% -- ^
  apps/local-api/src/feedback/index.ts ^
  apps/web-ui/src/pages/Feedback.tsx ^
  apps/web-ui/src/App.tsx ^
  apps/web-ui/src/components/Layout.tsx ^
  docs/feedback_loop_spec.md ^
  docs/feedback_item_spec.md ^
  audit/v6.3.0_closure_report.md >nul 2>&1

if exist "%REPO%\outputs\feedback_exports" (
  rmdir /s /q "%REPO%\outputs\feedback_exports"
)

echo [5/5] done.
echo.
echo Rollback completed.
echo Next: cd /d %REPO% ^&^& git status -sb

echo.
pause
endlocal
