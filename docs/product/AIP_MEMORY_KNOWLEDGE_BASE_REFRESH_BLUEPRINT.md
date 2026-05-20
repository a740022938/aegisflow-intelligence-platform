# AIP Memory Knowledge Base Refresh Blueprint

**生成日期**: 2026-05-20

---

## 目标

将 D0/D0-b 结果固化为 AIP 自身只读知识库基线，用于未来的决策参考和记忆一致性验证。

## 交付物

1. `docs/product/AIP_PROJECT_MEMORY_BASELINE_V7_41.md` — v7.41 记忆基线
2. `docs/product/AIP_MEMORY_GAP_CONFIDENCE_MATRIX.md` — 记忆差距与置信度矩阵
3. `docs/product/AIP_MEMORY_UPDATE_RULES.md` — 记忆更新规则
4. `apps/web-ui/src/registry/aip-memory-knowledge-registry.ts` — 注册表
5. `apps/web-ui/src/registry/aip-memory-knowledge-validator.ts` — 验证器
6. `apps/web-ui/src/pages/AipMemoryKnowledgePreview.tsx` — 预览页

## Web UI 预览

- 路由: `/aip-memory-knowledge-preview`
- 隐藏: `hidden_direct`, not in sidebar
- 只读: 无 DB 写入，无 runtime memory mutation

## 注册事实

```typescript
currentRoot = "E:\\AIP"
currentBranch = "main"
currentHeadAtD0 = "27c8634"
latestVerifiedBaseline = "v7.40"
verifiedSequence = "v7.25-v7.40"
preV725Status = "historical_with_confidence_labels"
v743Status = "unverified_future_reference"
stageC = "disabled"
featureFlag = "off"
```

## D0/D0-b 结论

Desktop task packs are intent/input evidence only.
They must be cross-checked against report + receipt + commit before being treated as completed work.
