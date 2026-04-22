# 主线下一步施工建议 Top 3

> 文档编号：M1-NEXT-001  
> 生成时间：2026-04-15 05:49 GMT+8  
> 基于盘点：M1-INVENTORY-001

---

## 推荐 Top 3 施工建议

### 🔥 #1：DB 初始化 + 全链路种子数据注入

**目标**：将 schema.ts 定义的表结构推送到 SQLite，注入完整种子数据，使所有 27 个前端页面有真实可操作数据。

**边界**：
- 执行 `db:init` 脚本或手动 push schema
- 注入种子数据：至少 5 条 task、3 个 template、2 个 dataset（含 mahjong_v1）、2 个 model、3 个 experiment、配套 audit_log / approval
- 确保每个前端页面首次加载均有数据展示
- 不修改前端代码，仅填充后端数据

**风险**：
- schema.ts 使用 drizzle-orm，当前 3 个 .db 均为 0 字节，可能需要先执行 init-db.js
- 种子数据需与前端页面字段对齐，否则白屏或 404
- 102 个未提交文件中可能有 schema 变更，需先确认最新 schema 状态

**交付物**：
- 3 个 .db 文件非零，表结构完整
- `scripts/seed-data.js` 或 `.sql` 种子数据脚本
- 27 个前端页面均有数据的截图或验证报告
- Git commit：`feat: initialize DB schema and seed data for all modules`

**预估工期**：1-2 天

---

### #2：训练全流程集成（classify → workflow executor → model 注册）

**目标**：将麻将 classify 训练从临时脚本升级为 workflow executor step，训练完成后自动注册到 models 表、自动归档评估指标到 experiments 表。

**边界**：
- 新增 workflow step_key = `mahjong_classify_train`，接入 executor
- 训练完成后自动：① 提取 best.pt 路径 → INSERT models ② 提取 results.csv 指标 → INSERT experiment_metrics ③ 生成 config_snapshot + env_snapshot → 归档
- 复用现有 workflow 状态机（pending → running → succeeded/failed）
- 不涉及 tracker / rule_engine / fusion

**风险**：
- 当前 workflow executor 以 step_key 路由，需新增 mahjong_classify_train 分支
- trainer_runner.py 是 YOLO detect 专用，classify 需要独立 runner 或统一入口
- Python worker 进程管理（spawn / 退出码 / 超时）需与 workflow step 状态同步
- 训练可能长时间运行，需考虑 step 心跳/超时机制

**交付物**：
- `workers/python-worker/classify_train_runner.py`（统一入口）
- workflow executor 新增 `mahjong_classify_train` step handler
- 训练完成 → model 注册 → experiment 指标归档的自动化链路
- 端到端验证：提交 workflow job → classify 训练 → models 表出现记录 → experiments 表出现指标
- Git commit：`feat: integrate classify training into workflow executor with auto-registration`

**预估工期**：2-3 天

---

### #3：技术债务清理 + Git 归档

**目标**：清理 102 个未提交文件 + 551 个 backup 文件，恢复仓库清洁状态，为下一轮施工建立干净基线。

**边界**：
- 分类处理 102 个未提交文件：已稳定 → commit；临时/废弃 → .gitignore 或删除
- 清理 .pre-restore/.bak/.backup 文件：确认已合并后删除
- runs/ 目录：保留 mahjong 相关产物，清理历史测试输出
- 修复 local-api build TS5011 rootDir 问题
- 检查工作流路由重复注册问题
- 不修改任何功能代码，只做清理

**风险**：
- 102 文件中可能包含有价值的未提交工作（如视觉支线施工期间的 schema 变更），需逐文件审查
- backup 文件可能包含回滚依赖，删除前需确认主文件已稳定
- runs/ 目录中的训练权重不可恢复，删除需谨慎

**交付物**：
- Git 工作区干净（0 uncommitted）
- backup 文件清理报告（删除数量 + 保留原因）
- local-api build 通过
- Git commit：`chore: clean up technical debt and restore clean baseline`

**预估工期**：1 天

---

## 最终推荐

### 🏆 推荐下一轮主线施工包：#1 DB 初始化 + 全链路种子数据注入

**理由**：

1. **阻断性最高**：3 个 .db 文件均为 0 字节，意味着 27 个前端页面全部白屏/空数据。这是当前最大的功能缺口——代码都有，数据没有。
2. **风险最低**：不修改任何代码，只填数据。出错可清库重来，无破坏性。
3. **工期最短**：1-2 天即可完成，快速验证全系统可用性。
4. **前置依赖**：#2（训练集成）和视觉支线重启都需要 DB 有数据，#1 是所有后续工作的地基。
5. **验证价值**：完成 #1 后，可以一次性验证全部 17+ 模块 + 27 个页面的端到端可用性，发现隐藏 bug。

### 施工顺序建议

```
#1 DB 初始化 + 种子数据 → #3 技术债务清理 → #2 训练全流程集成
```

#1 完成后全系统可跑；#3 清理后基线干净；#2 在干净基线上做功能扩展。

---

## 六、风险项汇总

| 风险 | 级别 | 缓解 |
|------|------|------|
| DB schema 未 push，所有 API 返回空 | 🔴 高 | #1 施工立即解决 |
| 102 未提交文件含关键变更 | 🟡 中 | #3 逐文件审查 |
| YOLO frozen，detect 管线不可用 | 🟡 中 | 等主线口令解冻或走 classify 替代 |
| classify 训练未集成 workflow | 🟡 中 | #2 施工解决 |
| local-api build 失败 | 🟡 中 | #3 施工解决 |
| 视觉支线重启精度不足 | 🟢 低 | 当前 top1=14.8% 仅 2 epoch，恢复训练后预计可达 85%+ |

---

## 七、是否可直接进入下一轮主线施工？

**✅ 可以。**

- 主线基线未被破坏
- 视觉支线已挂档，产物完整保留
- 推荐施工包 #1 明确、风险可控、工期短
- 建议先完成 #1 → #3 → #2 的顺序，每步完成后 commit + 归档
