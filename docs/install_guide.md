# AGI Model Factory 安装手册

**Version**: 5.5.0  
**Date**: 2026-04-13

---

## 1. 环境基线

### 必需软件
| 软件 | 版本要求 | 检查命令 |
|------|----------|----------|
| Node.js | 22.x LTS | `node --version` |
| npm | 10.x+ | `npm --version` |
| Python | 3.11+ | `python --version` |
| SQLite | 3.x | `sqlite3 --version` |
| Git | 2.x | `git --version` |

### 操作系统
- Windows 11（推荐）
- Windows 10
- macOS（理论兼容）
- Linux（理论兼容）

---

## 2. 安装步骤

### 2.1 获取代码
```powershell
git clone <repository_url>
cd AGI_Factory/repo
```

### 2.2 安装依赖

**API Server:**
```powershell
cd apps/local-api
npm install
```

**Web UI:**
```powershell
cd apps/web-ui
npm install
```

### 2.3 数据库初始化
数据库在首次启动时自动创建，无需手动初始化。

如需手动检查：
```powershell
# 数据库文件位置
dir packages\db\agi_factory.db
```

### 2.4 启动服务

**启动 API Server:**
```powershell
cd E:\AGI_Factory\repo\apps\local-api
npx tsx src/index.ts
# → Running on http://0.0.0.0:8787
```

**启动 Web UI:**
```powershell
cd E:\AGI_Factory\repo\apps\web-ui
npx vite --port 3000
# → Running on http://localhost:3000
```

---

## 3. 停止服务

### 3.1 查找进程
```powershell
# API server
Get-NetTCPConnection -LocalPort 8787 -ErrorAction SilentlyContinue

# Web UI
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
```

### 3.2 停止进程
```powershell
# 停止 API server
Get-NetTCPConnection -LocalPort 8787 -ErrorAction SilentlyContinue | 
  Select-Object -ExpandProperty OwningProcess | 
  ForEach-Object { Stop-Process -Id $_ -Force }

# 停止 Web UI
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | 
  Select-Object -ExpandProperty OwningProcess | 
  ForEach-Object { Stop-Process -Id $_ -Force }
```

---

## 4. 升级步骤

```powershell
# 1. 停止服务（见第 3 节）

# 2. 拉取最新代码
git pull origin master

# 3. 更新依赖
cd apps/local-api && npm install
cd apps/web-ui && npm install

# 4. 重启服务（见第 2.4 节）

# 5. 运行回归验证
python scripts/regression_v500.py
```

---

## 5. 故障排查

### 5.1 端口被占用
**问题:** 启动失败，提示端口被占用。

**解决:**
```powershell
# 查找并终止占用端口的进程
Get-NetTCPConnection -LocalPort 8787 | 
  Select-Object -ExpandProperty OwningProcess | 
  ForEach-Object { Stop-Process -Id $_ -Force }
```

### 5.2 数据库锁定
**问题:** 操作失败，提示 database is locked。

**解决:**
1. 确保 API server 正在运行
2. 关闭其他数据库连接
3. 重启 API server

### 5.3 依赖安装失败
**问题:** npm install 失败。

**解决:**
```powershell
# 清除缓存
npm cache clean --force

# 删除 node_modules
Remove-Item -Recurse -Force node_modules

# 重新安装
npm install
```

---

## 6. 常见问题（FAQ）

**Q: 如何查看当前版本？**
```
查看 apps/local-api/package.json 中的 version 字段
```

**Q: 如何备份数据？**
```
执行 node scripts/backup.mjs
备份产物在 E:\AGI_Factory\backups\
```

**Q: 如何从备份恢复？**
```
执行 node scripts/restore.mjs --backup <backup_file.db>
然后运行 python scripts/recovery_verify.py --drill
```

**Q: 如何运行回归测试？**
```
python scripts/regression_v500.py
```

---

## 7. 快速参考

| 操作 | 命令 |
|------|------|
| 启动 API | `cd apps/local-api && npx tsx src/index.ts` |
| 启动 UI | `cd apps/web-ui && npx vite --port 3000` |
| 健康检查 | `curl http://localhost:8787/api/health` |
| 回归测试 | `python scripts/regression_v500.py` |
| 备份 | `node scripts/backup.mjs` |
| 恢复验证 | `python scripts/recovery_verify.py --drill` |
