# AIP Restore Point Policy

**生成日期**: 2026-05-20

---

## 目的

定义 AIP 恢复点（Restore Point）的识别、查看和管理策略。恢复点是 plan-only 概念，不涉及真实恢复执行。

## 恢复点来源

1. Git commit history (可回退的 commit hash)
2. Restore point 文件夹 `E:\_AIP_RESTORE_POINTS`
3. npm scripts 中定义的 restore/recovery 入口

## 查看恢复点

```powershell
aip repair restore-point
```

输出示例：

```
Available Restore Points:
  1. 27c8634 - v7.40 Final Seal Ready with Stage C Disabled (latest)
  2. <commit> - <description>
```

## 恢复点计划

```powershell
aip repair source --plan
```

仅输出计划，不执行任何恢复操作。

## 安全约束

| 操作 | 是否允许 |
|---|---|
| 查看恢复点 | 允许 |
| 生成恢复计划 | 允许 |
| 真实 git reset --hard | 禁止 |
| 真实文件覆盖 | 禁止 |
| 真实 DB 恢复 | 禁止 |
