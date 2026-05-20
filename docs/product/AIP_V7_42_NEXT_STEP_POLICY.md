# AIP v7.42 — Next Step Policy (v7.43 Updated)

**生成日期**: 2026-05-20 (v7.43 P4 updated)
**Stage C**: DISABLED

---

## 允许的下一步

| 步骤 | 描述 | 优先级 |
|------|------|--------|
| Continue readonly productization | 继续只读产品化开发 | High |
| Improve CLI ergonomics | 改进 CLI 使用体验 | Medium |
| Improve repair plan-only | 改进修复计划系统 | Medium |
| Improve memory preview | 改进记忆预览 | Medium |
| Prepare Stage C authorization review | 准备 Stage C 授权评审文档 | Low |
| Polish bridge registries | 打磨 Command/Repair/Memory bridge registries | Medium |
| Harden decision workflow | 强化操作员决策流程 | Medium |

## v7.43 Additions

v7.43 adds these allowed steps:
- `Polish bridge registries` — Create readonly command/repair/memory bridge registries
- `Harden decision workflow` — Standardize decision judgment model
- `Create Stage C Authorization Review Pack` — Readonly preview of auth requirements

## 禁止的下一步（除非另行授权）

| 步骤 | 原因 |
|------|------|
| Enable Stage C | Blocked by 11 No-Go conditions |
| Toggle feature flag | mutableFromUi: false |
| Write DB | dbWriteAllowed: false |
| Add executor | executorAllowed: false |
| Control external tools | externalControlAllowed: false |
| Execute connector actions | connectorActionAllowed: false |
| Execute full repair | Requires human authorization |
| Production rollout | All safety boundaries blocked |
| Create tag / release | Requires explicit request |
| Restart services | Requires human authorization |

## 决策规则

1. 所有允许的下一步必须保持 Stage C DISABLED
2. 所有允许的下一步必须保持 feature flag OFF
3. 所有允许的下一步不得引入 POST/DbWrite/Executor/ExternalControl/ConnectorAction
4. 新的隐藏预览页不得加入 sidebar
5. 每个阶段完成后必须生成收据
6. Bridge registries must remain readonly (v7.43+)
7. Authorization review pack must not accept or store authorization (v7.43+)

## 安全约束

- Stage C remains disabled.
- Feature flag remains off.
- No POST runtime.
- No DB write.
- No executor.
- No external control.
- No connector action.
- No restart.
- No tag/release.
- No runtime memory mutation.
