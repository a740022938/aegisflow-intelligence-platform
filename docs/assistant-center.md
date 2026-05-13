# Assistant Center

Assistant Center 是 AIP v7.3.0-rc1 的只读助手作战中枢，用于在一个页面内查看 AIP、OpenAxiom、OpenClaw、Claude Proxy、运行工具、报告、备份和高风险边界。

## 模块定位

- 统一展示本机 AI 工程运行面状态。
- 生成外部助手任务包文本。
- 汇总最近报告和备份。
- 固定展示高风险目录，提醒用户和助手不要自动操作。

## 只读边界

rc1 默认只读。所有 API 返回 `readonly: true`，涉及状态项时返回 `autoFixAllowed: false`。

允许动作：

- 读取端口、HTTP health、工具版本。
- 扫描白名单报告目录和备份目录。
- 生成任务包文本。
- 复制诊断摘要、路径和任务包。

## API 列表

- `GET /api/assistant-center/status`
- `POST /api/assistant-center/full-check`
- `GET /api/assistant-center/reports`
- `GET /api/assistant-center/backups`
- `GET /api/assistant-center/safety-boundaries`
- `POST /api/assistant-center/task-package`
- `POST /api/assistant-center/audit/save`

`audit/save` 在 rc1 返回 disabled，不自动写入审计日志。

## UI 模块

- 顶部总状态条
- 助手状态卡片区
- 全链路体检区
- 任务包生成器区
- 报告中心区
- 备份中心简表
- 风险边界区

## 禁止动作

- 删除文件或目录。
- 移动文件或目录。
- 安装依赖。
- 修改 `packageManager`。
- 重启 OpenClaw。
- 停止 Claude Proxy 或 node.exe。
- 执行 `taskkill`。
- 执行 `openclaw doctor --fix`。
- 修改 `C:\Users\74002\.openclaw`。
- 修改 Claude Proxy 脚本。
- 修改 `E:\Axiom`、`E:\Axiom_UI_Lab`、`E:\Mahjong_V1_Project`。
- 执行训练。
- 保存、恢复或批量保存 label。
- 展示 API Key、token 或 Authorization header。

## 验收方式

后端：

- TypeScript 编译通过。
- 7 个 API 返回 JSON。
- `full-check` 不修改文件。
- `reports` 和 `backups` 只扫描白名单路径并限制数量。
- `task-package` 只生成文本。
- `safety-boundaries` 返回固定高风险边界。

前端：

- `/assistant-center` 可打开。
- 侧边栏出现“助手中心”。
- 状态卡片、体检、任务包、报告、备份、风险边界均能显示。
- 任务包文本可复制。
- loading、error、empty 状态不崩。
- 窄屏不横向溢出。

安全：

- 页面不出现删除、重启、停止、训练、保存 label、自动修复按钮。
- 不泄露 API Key、token、Authorization header。
- 不修改高风险目录。

## 后续 v7.3.0-rc2 可选方向

- 在用户主动确认后保存一次体检审计。
- 为报告中心增加更精确的摘要解析。
- 为备份中心增加容量统计缓存。
- 为任务包生成器增加模板预览和导出。
- 为 Assistant Center 增加权限分层，但仍默认只读。
