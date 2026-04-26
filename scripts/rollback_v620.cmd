@echo off
REM v6.2.0 回退脚本 - 标准输出体系
REM 执行前请确认 local-api 已停止
echo ============================================
echo  AGI Model Factory v6.2.0 Rollback Script
echo ============================================
echo.

REM 1. 恢复 index.ts (移除 outputs 路由)
echo [1/4] Restoring index.ts...
cd /d E:\AIP\repo\apps\local-api\src
powershell -Command "(Get-Content index.ts -Raw) -replace 'import \{ registerOutputsRoutes \} from ''./outputs/index.js'';', '' | Set-Content index.ts -Encoding UTF8"
powershell -Command "(Get-Content index.ts -Raw) -replace 'registerOutputsRoutes\(app\);', '' | Set-Content index.ts -Encoding UTF8"

REM 2. 删除 outputs 模块
echo [2/4] Removing outputs module...
if exist "outputs\" (
    rmdir /s /q "outputs"
    echo   Removed outputs/
) else (
    echo   outputs/ not found, skip
)

REM 3. 恢复 package.json 版本
echo [3/4] Restoring package.json version...
powershell -Command "(Get-Content 'E:\AIP\repo\apps\local-api\package.json' -Raw) -replace '\"version\": \"6.2.0\"', '\"version\": \"6.1.0\"' | Set-Content 'E:\AIP\repo\apps\local-api\package.json' -Encoding UTF8"
powershell -Command "(Get-Content 'E:\AIP\repo\apps\web-ui\package.json' -Raw) -replace '\"version\": \"6.2.0\"', '\"version\": \"6.1.0\"' | Set-Content 'E:\AIP\repo\apps\web-ui\package.json' -Encoding UTF8"

REM 4. 删除 outputs 产物目录和模板
echo [4/4] Removing output artifacts and templates...
if exist "E:\AIP\repo\outputs\" (
    rmdir /s /q "E:\AIP\repo\outputs"
    echo   Removed outputs/
)
if exist "E:\AIP\repo\templates\outputs\" (
    rmdir /s /q "E:\AIP\repo\templates\outputs"
    echo   Removed templates/outputs/
)

echo.
echo ============================================
echo  Rollback complete. Version reverted to 6.1.0
echo  Run: cd apps\local-api ^&^& npx tsx ./src/index.ts
echo ============================================
pause
