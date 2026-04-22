@echo off
REM ============================================================
REM AGI Model Factory — v6.1.0 Rollback Script
REM 知识沉淀中心回退脚本（PowerShell/bat 风格）
REM ============================================================
echo.
echo [v6.1.0] 回退脚本
echo ============================================================
echo.

setlocal enabledelayedexpansion

set "REPO=E:\AGI_Factory\repo"
set "DB=%REPO%\packages\db\agi_factory.db"
set "BRANCH=main"

REM 1. 停止 local-api 服务
echo [Step 1/6] 停止 local-api 服务 (port 8787)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8787 ^| findstr LISTENING') do (
    echo   Kill PID %%a
    taskkill /F /PID %%a > nul 2>&1
)
echo   done.

REM 2. 删除 knowledge_entries 和 knowledge_links 表
echo [Step 2/6] 删除知识表 (knowledge_entries, knowledge_links)...
python -c "
import sqlite3, sys
db = r'%DB%'
try:
    conn = sqlite3.connect(db)
    cur = conn.cursor()
    cur.execute('DROP TABLE IF EXISTS knowledge_links')
    cur.execute('DROP TABLE IF EXISTS knowledge_entries')
    conn.commit()
    print('   knowledge_links 已删除')
    print('   knowledge_entries 已删除')
    conn.close()
except Exception as e:
    print('   警告:', e, file=sys.stderr)
"

REM 3. 删除 knowledge 路由文件
echo [Step 3/6] 删除 knowledge 路由文件...
if exist "%REPO%\apps\local-api\src\knowledge\index.ts" (
    del /f /q "%REPO%\apps\local-api\src\knowledge\index.ts"
    echo   deleted: src\knowledge\index.ts
) else (
    echo   (文件不存在，跳过)
)

REM 4. 恢复 index.ts 中的 knowledge 路由导入和注册
echo [Step 4/6] 恢复 index.ts...
python -c "
import re
f = r'%REPO%\apps\local-api\src\index.ts'
try:
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    # 移除 knowledge import
    content = re.sub(r\"\\nimport \\{ registerKnowledgeRoutes \\} from '\\./knowledge/index\\.js';\", '', content)
    # 移除 knowledge 注册调用
    content = re.sub(r\"\\nregisterKnowledgeRoutes\\(app\\);\", '', content)
    with open(f, 'w', encoding='utf-8') as fp:
        fp.write(content)
    print('   已移除 knowledge 路由导入和注册')
except Exception as e:
    print('   警告:', e, file=sys.stderr)
"

REM 5. 恢复 package.json 版本
echo [Step 5/6] 恢复 package.json 版本...
python -c "
import re
f = r'%REPO%\apps\local-api\package.json'
try:
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    content = re.sub(r'\"version\": \"6\.1\.0\"', '\"version\": \"6.0.0\"', content)
    with open(f, 'w', encoding='utf-8') as fp:
        fp.write(content)
    print('   package.json 恢复为 6.0.0')
except Exception as e:
    print('   警告:', e, file=sys.stderr)
"

REM 6. 恢复 git 提交
echo [Step 6/6] 恢复 git 提交...
cd /d "%REPO%"
git checkout %BRANCH% > nul 2>&1
git reset --hard HEAD~1 > nul 2>&1
echo   git reset --hard HEAD~1 完成
echo   注意: 如需恢复数据库数据，请从 v6.0.0 备份包还原

echo.
echo ============================================================
echo 回退完成。请重启 local-api 服务: cd apps\local-api ^&^& npx tsx src\index.ts
echo ============================================================
endlocal
