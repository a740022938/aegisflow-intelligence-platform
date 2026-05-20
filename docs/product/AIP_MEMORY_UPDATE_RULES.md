# AIP Memory Update Rules

**生成日期**: 2026-05-20

---

## 核心原则

1. **Cross-check before trust**: Desktop task packs are intent/input evidence only. They must be cross-checked against report + receipt + commit before being treated as completed work.
2. **Readonly baseline**: Memory baselines are readonly snapshots. They document what is known, not what is guessed.
3. **Confidence labels**: Every memory entry carries a confidence label (verified / historical / unverified).
4. **No runtime mutation**: Memory normalization does not modify runtime memory or DB.

## 更新流程

1. 施工阶段完成后生成 receipt
2. receipt 与 commit 交叉验证
3. 验证通过后更新基线文档
4. 基线文档只追加，不修改已有 verified 条目

## 禁止操作

1. 禁止降级置信度标签
2. 禁止删除已验证条目
3. 禁止将 unverified 条目作为施工依据
4. 禁止未经验证直接将 task pack 内容写入基线
