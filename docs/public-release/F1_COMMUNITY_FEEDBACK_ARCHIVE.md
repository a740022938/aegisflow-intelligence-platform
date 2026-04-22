# Phase F.1 社区首轮反馈接入与问题归档

## 1. 社区反馈入口检查

### 已检查入口
1. GitHub Issues 入口：`/issues/new/choose`（可访问）
2. Issue 模板：
   - bug report
   - feature request
   - question / help
3. `CONTRIBUTING.md`：已存在，包含提交前检查与安全约束
4. README 文档入口：已补问题反馈入口链接

### 结论
- 入口完整，可被外部用户识别并使用。

## 2. 首轮问题归档（外部视角）

| 等级 | 来源 | 问题描述 | 影响范围 | 建议优先级 | 是否进下一社区版 |
|---|---|---|---|---|---|
| P0 上手阻塞 | README | 仓库目录名曾写成 `AGI-Model-Factory`，与实际公开仓库名不一致 | 新用户 clone 后第一步 | 最高 | 是（已本轮修补） |
| P0 上手阻塞 | Onboarding | 遇错后的反馈入口不够显眼 | 新用户遇错后无法快速反馈 | 最高 | 是（已本轮修补） |
| P1 体验问题 | 首发后巡检 | README 与 UI 的“首次运行路径”关联较弱 | 新用户从首页跳转文档效率 | 高 | 是 |
| P1 体验问题 | 官网同步执行 | 帮助入口证据截图自动化稳定性不足 | 对外验收证据完整性 | 中高 | 是 |
| P2 后续增强 | GitHub 页面观感 | 缺少 FAQ（端口冲突、Node/pnpm版本、常见报错） | 新用户自助排障效率 | 中 | 是 |
| P2 后续增强 | 首轮入口检查 | Issue 模板尚未附“最小日志片段示例” | 问题描述质量 | 中 | 可后置 |

## 3. README / Onboarding 微修记录

### 已做最小修补
1. README 中 clone 后目录名修正为：`aegisflow-intelligence-platform`
2. README 目录树根名同步修正为：`aegisflow-intelligence-platform/`
3. README 增加问题反馈入口链接（GitHub issue choose）
4. Onboarding 增补“遇到问题去哪里看/去哪里提 issue”

### 当前一致性状态
- 仓库名 / 目录名 / 命令路径：一致
- 推荐模板说明：清楚
- 失败后排查与反馈路径：可见

## 4. 下一社区版本候选池（建议）

建议版本：`v6.8.0-community.2`

### 必须优先（应进 .2）
1. 新手路径可发现性增强（README 首屏增加“首次运行 4 步”锚点）
2. 帮助入口证据链稳定化（补一键截图脚本）
3. FAQ 最小版（安装/端口/依赖/健康检查）

### 可后置
1. Issue 模板补“可粘贴日志示例块”
2. Onboarding 增加 60 秒 GIF/短视频
3. Release 页面补“常见失败排查”短节

### 排序原因
- 先处理“上手阻塞”和“反馈链路断点”，再优化展示体验。

## 5. 轻量外部化巡检（F.1）

已检查：
1. GitHub 仓库首页：HTTP 200
2. README 页面：HTTP 200
3. Release 页面：HTTP 200
4. Issues 入口：HTTP 200
5. Community Edition 边界：README + 官网同步文案可见
6. Onboarding 入口：README 文档入口可见

结论：外部用户从“看见项目”到“提反馈”链路已闭环。
