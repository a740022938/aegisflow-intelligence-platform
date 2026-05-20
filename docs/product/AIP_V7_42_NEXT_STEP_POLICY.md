# AIP v7.42 — Next Step Policy

**生成日期**: 2026-05-20
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
