@echo off
REM ============================================================
REM AGI Model Factory v6.0.0 Rollback Script (Windows Native)
REM ============================================================
REM 用途：回退 v6.0.0 插件化底座变更
REM 适用范围：回退到 P3 Official Seal (v5.5.0)
REM 前置条件：在 repo 根目录执行（E:\AGI_Factory\repo）
REM 注意：会删除插件系统所有文件，请确认后再执行
REM ============================================================

setlocal enabledelayedexpansion

set "REPO_ROOT=E:\AGI_Factory\repo"
set "BACKUP_TAG=p3-official-seal-20260413"

echo ============================================================
echo  AGI Model Factory v6.0.0 Rollback Script
echo ============================================================
echo.
echo 将回退以下内容：
echo   - packages/plugin-sdk/         (全部删除)
echo   - packages/plugin-runtime/      (全部删除)
echo   - plugins/builtin/demo-plugin/   (全部删除)
echo   - apps/local-api/src/index.ts   (插件路由)
echo   - apps/local-api/package.json   (版本号)
echo   - docs/P4_*.md
echo   - docs/plugin_*.md
echo   - audit/v6.0.0_closure_report.md
echo.
echo 本操作不可逆。确认继续请输入: YES
echo ============================================================

set /p CONFIRM="Input: "

if not "%CONFIRM%"=="YES" (
    echo Rollback cancelled.
    exit /b 1
)

echo.
echo [1/5] Stopping local-api service...
taskkill /F /IM node.exe 2>nul
echo Done.

echo.
echo [2/5] Removing plugin-sdk directory...
if exist "%REPO_ROOT%\packages\plugin-sdk" (
    rmdir /S /Q "%REPO_ROOT%\packages\plugin-sdk"
    echo Removed: packages\plugin-sdk
) else (
    echo Not found: packages\plugin-sdk (skipping)
)

echo.
echo [3/5] Removing plugin-runtime directory...
if exist "%REPO_ROOT%\packages\plugin-runtime" (
    rmdir /S /Q "%REPO_ROOT%\packages\plugin-runtime"
    echo Removed: packages\plugin-runtime
) else (
    echo Not found: packages\plugin-runtime (skipping)
)

echo.
echo [4/5] Removing demo-plugin directory...
if exist "%REPO_ROOT%\plugins\builtin\demo-plugin" (
    rmdir /S /Q "%REPO_ROOT%\plugins\builtin\demo-plugin"
    echo Removed: plugins\builtin\demo-plugin
) else (
    echo Not found: plugins\builtin\demo-plugin (skipping)
)
REM Remove empty plugins/builtin if exists
if exist "%REPO_ROOT%\plugins\builtin" (
    rmdir /S /Q "%REPO_ROOT%\plugins\builtin" 2>nul
)
if exist "%REPO_ROOT%\plugins" (
    rmdir /S /Q "%REPO_ROOT%\plugins" 2>nul
)

echo.
echo [5/5] Reverting git changes (local-api, docs, audit)...
cd /D "%REPO_ROOT%"
git checkout HEAD -- apps/local-api/src/index.ts apps/local-api/package.json 2>nul
git checkout HEAD -- docs/P4_scope_freeze.md docs/plugin_architecture.md docs/plugin_manifest_spec.md docs/plugin_audit_spec.md 2>nul
git checkout HEAD -- audit/v6.0.0_closure_report.md 2>nul
echo Git revert done.

echo.
echo ============================================================
echo  Rollback Complete
echo ============================================================
echo.
echo 数据库不受影响（插件系统无 schema 变更）。
echo 审计日志保留（audit_logs 中的插件操作记录）。
echo.
echo 如需完全回退到 P3，请运行：
echo   git checkout %BACKUP_TAG% -- .
echo ============================================================

endlocal
exit /b 0
