# AIP Memory Normalization Policy

**生成日期**: 2026-05-20

---

## 原则

1. **Cross-check before trust**: Desktop task packs are intent/input evidence only. They must be cross-checked against report + receipt + commit.
2. **Readonly baseline**: Memory baselines are readonly snapshots. They document what is known, not what is guessed.
3. **Confidence labels**: Every memory entry carries a confidence label (verified / historical / unverified).
4. **No runtime mutation**: Memory normalization does not modify runtime memory or DB.

## 置信度等级

| 等级 | 含义 | 示例 |
|---|---|---|
| verified | 经过 commit + report + receipt 验证 | v7.25-v7.40 |
| historical | 历史上下文，带标签参考 | pre-v7.25 |
| unverified | 未来引用，未完成 | v7.43 |

## 记忆更新流程

1. 施工阶段完成后生成 receipt
2. receipt 与 commit 交叉验证
3. 验证通过后更新基线文档
4. 基线文档只追加，不修改已有 verified 条目

## D0/D0-b 标准化结论

Desktop task packs are intent/input evidence only.
They must be cross-checked against report + receipt + commit before being treated as completed work.

This conclusion is formalized as a memory normalization rule and applies to ALL future construction packs.
